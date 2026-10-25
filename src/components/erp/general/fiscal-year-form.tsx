"use client";

import * as React from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useT } from "@/stores/settings-store";
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
 *   ۳. تاریخ شروع / ۴. تاریخ پایان — ماسک YYYY/MM/DD (تقویم شمسی).
 *   ۵. فعال — چک‌باکس.
 *
 * قوانین ثبت (اعتبارسنجی دولایه — فرانت + سرور):
 *   · سال مالی تکراری (کد/عنوان) رد می‌شود — سرور 409 با پیام روشن.
 *   · بازهٔ شروع/پایان تکراری (هم‌پوشانی) رد می‌شود — سرور 409.
 *   · طول بازه از «تعداد ماه‌های مالی» تنظیمات نرم‌افزار ← تب حسابداری
 *     (SoftwareConfig fiscalMonthsCount، پیش‌فرض ۱۲) بیشتر نباشد — فرانت
 *     پیش از ارسال چک می‌کند و سرور همان قانون را دوباره اعمال می‌کند.
 */

interface FiscalYearDto {
  id: number;
  code: string;
  title: string;
  startDate: string; // 'YYYY/MM/DD' یا ''
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

/** 'YYYY/MM/DD' → 'YYYYMMDD' نرمال؛ null وقتی ناقص/نامعتبر است (مثل سرور). */
function normalizeShamsi(raw: string): string | null {
  const digits = normalizeDigits(raw).replace(/[^0-9]/g, "");
  if (digits.length !== 8) return null;
  const y = Number(digits.slice(0, 4));
  const m = Number(digits.slice(4, 6));
  const d = Number(digits.slice(6, 8));
  if (y < 1300 || y > 1500 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return digits;
}

/** تعداد ماهِ سپری‌شدهٔ بازه — دقیق تا سطح روز (مثل سرور). */
function elapsedMonths(start: string, end: string): number {
  const months =
    (Number(end.slice(0, 4)) * 12 + Number(end.slice(4, 6))) -
    (Number(start.slice(0, 4)) * 12 + Number(start.slice(4, 6)));
  return Number(end.slice(6, 8)) < Number(start.slice(6, 8)) ? months - 1 : months;
}

/** پیام خطای سرور (فارسی، مثل 409 تکراری) یا پیام عمومی. */
async function serverMessage(res: Response, fallback: string): Promise<string> {
  const j = (await res.json().catch(() => null)) as { message?: string } | null;
  return (typeof j?.message === "string" && j.message) || fallback;
}

export function FiscalYearForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const chrome = useWindowChrome();
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

  const applyRecord = React.useCallback((r: FiscalYearDto) => {
    setCurrentId(r.id);
    setValues({
      code: r.code,
      title: r.title,
      startDate: r.startDate,
      endDate: r.endDate,
      active: r.isActive,
    });
  }, []);

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

  /* زنجیرهٔ اعتبارسنجی فرانت — همان قوانین سرور، برای بازخورد فوری */
  const validate = (vals: FormValues): string | null => {
    if (vals.code.trim() === "") return t("fy.errCodeRequired");
    if (vals.title.trim() === "") return t("fy.errTitleRequired");
    if (!/^[0-9]{4}$/.test(vals.title.trim())) return t("fy.errTitleDigits");

    const s = vals.startDate.trim() === "" ? null : normalizeShamsi(vals.startDate);
    const e = vals.endDate.trim() === "" ? null : normalizeShamsi(vals.endDate);
    if ((vals.startDate.trim() !== "" && !s) || (vals.endDate.trim() !== "" && !e)) {
      return t("fy.errDateInvalid");
    }
    if (s && e && e < s) return t("fy.errDateOrder");
    if (s && e) {
      const months = elapsedMonths(s, e);
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
      startDate: values.startDate.trim(),
      endDate: values.endDate.trim(),
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
        const current = records.find((r) => r.id === currentId);
        if (current) applyRecord(current);
        else newRecord();
        toast.success(t("abar.resetToast"));
      }}
      onSave={doSave}
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
        subtitle: [r.startDate, r.endDate].filter(Boolean).join(" ← ") || undefined,
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
