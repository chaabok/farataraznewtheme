"use client";

import * as React from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  displayToStoredDate,
  monthsBetweenISO,
  storedToDisplayDate,
} from "@/lib/calendar-date";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
} from "@/components/forms/simple-form-two-row-tabbed";
import { normalizeDigits } from "@/components/forms/form-primitives";
import { useWindowChrome } from "@/components/desktop/app-window";

/**
 * FiscalYearForm — Task 75 (درخواست مالک): فرم «سال مالی جدید» در نرم‌افزار
 * «عمومی» ← زیرمنوی «اطلاعات پایه».
 *
 * فیلدها (عین عبارت مالک):
 *   ۱. کد — اجباری، نمی‌تواند خالی باشد.
 *   ۲. عنوان — اجباری، نمی‌تواند خالی باشد، فقط عدد، دقیقاً ۴ کاراکتر.
 *   ۳. تاریخ شروع / ۴. تاریخ پایان — ماسک YYYY/MM/DD.
 *   ۵. فعال — چک‌باکس.
 *
 * Task 77 (درخواست مالک): «تمامی ستون‌های از نوع تاریخ فقط بصورت میلادی در
 * بانک اطلاعاتی ذخیره شوند و نباید به تاریخ‌های دیگر در بانک اطلاعاتی ذخیره
 * شوند ولی موقع نمایش در فرم‌ها باید به تاریخ زبان انتخاب شده نمایش داده شوند»
 *   · ذخیره — فرم تاریخِ زبان انتخابی را می‌گیرد (fa/ps/ckb = شمسی، بقیه =
 *     میلادی) و پیش از ارسال به میلادی 'YYYY-MM-DD' تبدیل می‌کند (API/DB فقط میلادی).
 *   · نمایش — تاریخ ذخیره‌شدهٔ میلادی هنگام بازکردن رکورد/لیست به تقویمِ زبان
 *     انتخابی برمی‌گردد (تبدیل‌گر: src/lib/calendar-date.ts).
 *
 * قوانین ثبت (اعتبارسنجی دولایه — فرانت + سرور):
 *   · سال مالی تکراری (کد/عنوان) رد می‌شود — سرور 409 با پیام روشن.
 *   · بازهٔ شروع/پایان تکراری (هم‌پوشانی) رد می‌شود — سرور 409.
 *   · طول بازه از «تعداد ماه‌های مالی» تنظیمات نرم‌افزار ← تب حسابداری
 *     (SoftwareConfig fiscalMonthsCount، پیش‌فرض ۱۲) بیشتر نباشد — کنترل روی
 *     تاریخ میلادیِ ذخیره‌سازی، دولایه.
 */

interface FiscalYearDto {
  id: number;
  code: string;
  title: string;
  startDate: string; // میلادی 'YYYY-MM-DD' یا '' (Task 77)
  endDate: string;
  isActive: boolean;
}

interface FormValues {
  code: string;
  title: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

const BLANK: FormValues = { code: "", title: "", startDate: "", endDate: "", active: true };

const DEFAULT_FISCAL_MONTHS = 12;

export function FiscalYearForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const chrome = useWindowChrome();
  /* تقویمِ نمایش = زبان انتخابی (fa/ps/ckb → شمسی، بقیه → میلادی) — Task 77 */
  const locale = useSettings((s) => s.locale);
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "app" && w.appKey === "general")?.maximized ?? false,
  );

  const [records, setRecords] = React.useState<FiscalYearDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK);
  const [monthsLimit, setMonthsLimit] = React.useState<number>(DEFAULT_FISCAL_MONTHS);

  /* واکشی خالص — setState فقط داخل then (قرارداد react-hooks/set-state-in-effect) */
  const fetchRecords = React.useCallback(async (): Promise<FiscalYearDto[]> => {
    const res = await api.get<{ items?: FiscalYearDto[] }>("fiscal-year");
    return res.items ?? [];
  }, []);

  const applyRecords = React.useCallback((rows: FiscalYearDto[]) => {
    setRecords(rows);
    setListLoading(false);
  }, []);

  /* فهرست سال‌های مالی + سقف «تعداد ماه‌های مالی» از پیکربندی نرم‌افزار */
  React.useEffect(() => {
    let alive = true;
    fetchRecords().then(
      (rows) => alive && applyRecords(rows),
      () => alive && applyRecords([]),
    );
    api
      .get<{ items?: { configKey: string; configValue: string }[] }>(
        "software-config/accounting",
      )
      .then((res) => {
        if (!alive) return;
        const raw =
          res.items?.find((i) => i.configKey === "fiscalMonthsCount")?.configValue ?? "";
        const n = Number(raw);
        setMonthsLimit(Number.isFinite(n) && n >= 1 ? Math.floor(n) : DEFAULT_FISCAL_MONTHS);
      })
      .catch(() => {
        /* پیش‌فرض ۱۲ می‌ماند */
      });
    return () => {
      alive = false;
    };
  }, [fetchRecords, applyRecords]);

  /* بازکردن رکورد: تاریخِ میلادیِ ذخیره‌شده → نمایش در تقویمِ زبان انتخابی */
  const applyRecord = React.useCallback(
    (r: FiscalYearDto) => {
      setCurrentId(r.id);
      setValues({
        code: r.code,
        title: r.title,
        startDate: storedToDisplayDate(r.startDate, locale),
        endDate: storedToDisplayDate(r.endDate, locale),
        active: r.isActive,
      });
    },
    [locale],
  );

  const newRecord = React.useCallback(() => {
    setCurrentId(null);
    setValues(BLANK);
  }, []);

  /* عنوان: فقط رقم لاتین، حداکثر ۴ کاراکتر (فیلتر ورودی هم‌زمان با تایپ) */
  const onFieldChange = React.useCallback((id: string, value: string | boolean) => {
    setValues((v) => {
      if (id === "title" && typeof value === "string") {
        return { ...v, title: normalizeDigits(value).replace(/[^0-9]/g, "").slice(0, 4) };
      }
      return { ...v, [id]: value };
    });
  }, []);

  /* زنجیرهٔ اعتبارسنجی فرانت — همان قوانین سرور، برای بازخورد فوری؛
     تاریخ‌ها از نمایشِ زبان انتخابی به میلادیِ ذخیره‌سازی تبدیل می‌شوند */
  const validate = (vals: FormValues): string | null => {
    if (vals.code.trim() === "") return t("fy.errCodeRequired");
    if (vals.title.trim() === "") return t("fy.errTitleRequired");
    if (!/^[0-9]{4}$/.test(vals.title.trim())) return t("fy.errTitleDigits");

    const s = vals.startDate.trim() === "" ? null : displayToStoredDate(vals.startDate, locale, normalizeDigits);
    const e = vals.endDate.trim() === "" ? null : displayToStoredDate(vals.endDate, locale, normalizeDigits);
    if ((vals.startDate.trim() !== "" && !s) || (vals.endDate.trim() !== "" && !e)) {
      return t("fy.errDateInvalid");
    }
    if (s && e && e < s) return t("fy.errDateOrder");
    if (s && e) {
      const months = monthsBetweenISO(s, e);
      if (months > monthsLimit) {
        return t("fy.errMonths").replace("{max}", String(monthsLimit));
      }
    }
    return null;
  };

  /* ذخیره: ثبت جدید (POST) یا ویرایش رکورد جاری (PUT) — true = موفق */
  const doSave = async (): Promise<boolean> => {
    const err = validate(values);
    if (err) {
      toast.error(err);
      return false;
    }
    const body = {
      code: values.code.trim(),
      title: values.title.trim(),
      /* Task 77: API/DB فقط میلادی — تبدیل نمایشِ زبان انتخابی به 'YYYY-MM-DD' */
      startDate: displayToStoredDate(values.startDate, locale, normalizeDigits) ?? "",
      endDate: displayToStoredDate(values.endDate, locale, normalizeDigits) ?? "",
      isActive: values.active,
    };
    try {
      const res = currentId == null
        ? await api.post<FiscalYearDto>("fiscal-year", body)
        : await api.put<FiscalYearDto>(`fiscal-year/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rows = await fetchRecords().catch(() => [] as FiscalYearDto[]);
      applyRecords(rows);
      applyRecord(res);
      return true;
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      toast.error(msg);
      return false;
    }
  };

  const doDelete = async (): Promise<void> => {
    if (currentId == null) {
      toast.info(t("dfb.noRecordSelected"));
      return;
    }
    try {
      await api.del(`fiscal-year/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rows = await fetchRecords().catch(() => [] as FiscalYearDto[]);
      applyRecords(rows);
      newRecord();
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      toast.error(msg);
    }
  };

  /* ناوبری رکوردها «|< < > >|» */
  const currentIndex = records.findIndex((r) => r.id === currentId);
  const nav = (i: number) => {
    const r = records[i];
    if (r) applyRecord(r);
  };

  const fields = React.useMemo<SimpleFormField[]>(
    () => [
      { id: "code", label: t("fy.code"), required: true, value: values.code },
      {
        id: "title",
        label: t("fy.title"),
        required: true,
        value: values.title,
        placeholder: "1404",
      },
      { id: "startDate", label: t("fy.startDate"), type: "date", value: values.startDate },
      { id: "endDate", label: t("fy.endDate"), type: "date", value: values.endDate },
      { id: "active", label: t("fy.active"), type: "checkbox", checked: values.active },
    ],
    [t, values],
  );

  return (
    <SimpleFormTwoRowTabbed
      title={t("fy.formTitle")}
      badge={t("app.general")}
      icon={<CalendarPlus className="h-3.5 w-3.5" aria-hidden />}
      fields={fields}
      onFieldChange={onFieldChange}
      onFirst={() => nav(0)}
      onPrev={() => nav(Math.max(0, currentIndex - 1))}
      onNext={() => nav(Math.min(records.length - 1, currentIndex + 1))}
      onLast={() => nav(records.length - 1)}
      onReset={() => {
        /* آیکون + = شروع ثبتِ جدید: فرم خالی می‌شود (بازگشایی رکورد از «لیست»
           یا ناوبری رکوردها انجام می‌شود) */
        newRecord();
        toast.success(t("abar.resetToast"));
      }}
      onSave={async () => {
        await doSave();
      }}
      onSaveNew={async () => {
        if (await doSave()) newRecord();
      }}
      onCopy={() => {
        /* ثبت جدید با همان مقادیر — شناسه پاک می‌شود تا رکورد نو ساخته شود */
        setCurrentId(null);
        toast.success(t("abar.copyToast"));
      }}
      onDelete={doDelete}
      onDeleteNew={async () => {
        await doDelete();
        newRecord();
      }}
      onPrint={() => {
        toast.success(t("abar.printToast"));
      }}
      onClose={onBack}
      listItems={records.map((r) => ({
        id: String(r.id),
        title: `${r.code} - ${r.title}`,
        /* زیرنویس بازه: تاریخ میلادیِ ذخیره‌شده → تقویم زبان انتخابی (Task 77) */
        subtitle:
          [storedToDisplayDate(r.startDate, locale), storedToDisplayDate(r.endDate, locale)]
            .filter(Boolean)
            .join(" ← ") || undefined,
      }))}
      listLoading={listLoading}
      onOpenListItem={(item) => {
        const r = records.find((x) => String(x.id) === item.id);
        if (r) {
          applyRecord(r);
          toast.success(t("abar.itemOpened"));
        }
      }}
      canDelete={currentId != null}
      onHeaderClose={onBack}
      onHeaderMinimize={chrome?.onMinimize}
      onHeaderMaximize={chrome?.onToggleMaximize}
      headerMaximized={headerMaximized}
      onHeaderDragStart={chrome?.onDragStart}
      onHeaderDragMove={chrome?.onDragMove}
      onHeaderDragEnd={chrome?.onDragEnd}
      onHeaderDoubleClick={chrome?.onDoubleClick}
    />
  );
}
