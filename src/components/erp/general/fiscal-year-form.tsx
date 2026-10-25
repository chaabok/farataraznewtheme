"use client";

import * as React from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  displayToStoredDate,
  jalaliToGregorianISO,
  monthsBetweenISO,
  storedToDisplayDate,
} from "@/lib/calendar-date";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useTabDirty } from "@/components/desktop/app-window";
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
 *   ۳. تاریخ شروع / ۴. تاریخ پایان — خودکار محاسبه می‌شوند (Task 80) و
 *      فقط-نمایش هستند.
 *   ۵. فعال — چک‌باکس.
 *
 * Task 80 (درخواست مالک): «کاربر هر سال مالی را وارد کرده بود تاریخ شروع
 * اولین روز شروع آن سال مالی بصورت خودکار وارد شود و تاریخ پایان باید بر
 * اساس تعداد ماه‌های سال مالی که در پیکربندی نرم‌افزار و تب حسابداری تعیین
 * شده محاسبه گردد. اگر تعداد ماه‌های سال مالی ۱۲ بود باید پایان آن سال مالی
 * باشد و اگر ۱۶ وارد شده بود باید تا ۴ بعد از سال مالی بعد تعیین شود»
 *   · با ورود عنوانِ ۴رقمی، سال = سال شمسیِ مالی فرض می‌شود:
 *       شروع = ۱۴۰۴/۰۱/۰۱؛ پایان = شروع + N ماه − ۱ روز (N = «تعداد ماه‌های
 *       مالی» پیکربندی نرم‌افزار ← تب حسابداری):
 *       N=۱۲ → پایان همان سال (۱۲/۲۹ یا ۱۲/۳۰ در کبیسه)؛
 *       N=۱۶ → ۴ ماه بعد از مرز سال، یعنی ۱۴۰۵/۰۴/۳۱.
 *   · محاسبه همیشه در تقویم شمسی است؛ میلادیِ 'YYYY-MM-DD' ذخیره و در تقویم
 *     زبان انتخابی نمایش داده می‌شود (قرارداد Task 77 — storedToDisplayDate).
 *   · فیلدهای تاریخ فقط-نمایش‌اند (غیرقابل ویرایش) و با تغییر سال/تعداد ماه‌ها
 *     یا زبان، زنده بازمحاسبه می‌شوند.
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

/** آخرین روزِ ماه شمسی — ۱..۶ = ۳۱ روز، ۷..۱۱ = ۳۰ روز، اسفند = کبیسه؟ ۳۰ : ۲۹
 *  (کبیسه با همان round-trip کتابخانهٔ Task ۷۷ آزموده می‌شود:
 *  جواب‌دادن ۱۲/۳۰ ⇔ سال کبیسه). */
function lastDayOfJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return jalaliToGregorianISO(jy, 12, 30) != null ? 30 : 29;
}

/**
 * Task 80 — تاریخ‌های خودکارِ سال مالیِ «year» (سال شمسی):
 *   شروع = ۱ فروردین همان سال؛ پایان = ماهِ N-اُم از همان نقطه، آخرین روزش
 *   (N = «تعداد ماه‌های مالی»):
 *     N=۱۲ → پایان همان سال (۱۲/۲۹ یا ۱۲/۳۰ کبیسه)؛
 *     N=۱۶ → ۴ ماه بعد از مرز سال مالی بعد (۱۴۰۵/۰۴/۳۱).
 * خروجی در قالبِ نمایشِ زبان انتخابی است (میلادیِ ذخیره‌سازی → تقویمِ زبان).
 */
function computeAutoFiscalDates(
  year: number,
  monthsCount: number,
  locale: string,
): { start: string; end: string } {
  const endIdx = year * 12 + (Math.max(1, monthsCount) - 1); // اندیس ماهِ پایانی (۰-مبنا)
  const ey = Math.floor(endIdx / 12);
  const em = (endIdx % 12) + 1;
  const startISO = jalaliToGregorianISO(year, 1, 1);
  const endISO = jalaliToGregorianISO(ey, em, lastDayOfJalaliMonth(ey, em));
  return {
    start: startISO ? storedToDisplayDate(startISO, locale) : "",
    end: endISO ? storedToDisplayDate(endISO, locale) : "",
  };
}

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
  /* Task 82 — unsaved-data flag of the tab (owner alarm contract):
     true از اولین ویرایش تا ذخیره/بازکردن رکورد/خالی‌کردن فرم */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);
  const [monthsLimit, setMonthsLimit] = React.useState<number>(DEFAULT_FISCAL_MONTHS);
  /* Task 80 — سالِ شمسی‌ای که تاریخ‌های نمایشی از روی آن محاسبه می‌شوند؛
     null = تاریخ‌های values بی‌واسطه (فرم خالی، رکورد باز یا کپی) نمایش داده شوند. */
  const [autoYear, setAutoYear] = React.useState<number | null>(null);

  /* واکشی خالص — setState فقط داخل then (قرارداد react-hooks/set-state-in-effect) */
  const fetchRecords = React.useCallback(async (): Promise<FiscalYearDto[]> => {
    const res = await api.get<{ items?: FiscalYearDto[] }>("fiscal-year");
    return res.items ?? [];
  }, []);

  const applyRecords = React.useCallback((rows: FiscalYearDto[]) => {
    setRecords(rows);
    setListLoading(false);
  }, []);

  /* «تعداد ماه‌های مالی» از پیکربندی نرم‌افزار (تب حسابداری) — Task 80:
     علاوه بر واکشی اولیه، هر بار که فرم خالی می‌شود (ریست/ثبت جدید) یا
     رکوردی باز می‌شود هم دوباره خوانده می‌شود تا تغییرِ پیکربندی در حینِ
     باز بودنِ فرم هم لحاظ شود؛ شمارندهٔ توالی فقط اجازهٔ اعمالِ آخرین پاسخ. */
  const monthsFetchSeq = React.useRef(0);
  const refreshMonthsLimit = React.useCallback(async () => {
    const callId = ++monthsFetchSeq.current;
    try {
      const res = await api.get<{ items?: { configKey: string; configValue: string }[] }>(
        "software-config/accounting",
      );
      if (callId !== monthsFetchSeq.current) return; // پاسخ کهنه — نادیده
      const raw =
        res.items?.find((i) => i.configKey === "fiscalMonthsCount")?.configValue ?? "";
      const n = Number(raw);
      setMonthsLimit(Number.isFinite(n) && n >= 1 ? Math.floor(n) : DEFAULT_FISCAL_MONTHS);
    } catch {
      /* مقدار قبلی/پیش‌فرض ۱۲ می‌ماند */
    }
  }, []);

  /* فهرست سال‌های مالی + سقف «تعداد ماه‌های مالی» از پیکربندی نرم‌افزار */
  React.useEffect(() => {
    let alive = true;
    fetchRecords().then(
      (rows) => alive && applyRecords(rows),
      () => alive && applyRecords([]),
    );
    const callId = ++monthsFetchSeq.current;
    api
      .get<{ items?: { configKey: string; configValue: string }[] }>(
        "software-config/accounting",
      )
      .then((res) => {
        if (!alive || callId !== monthsFetchSeq.current) return;
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
      setAutoYear(null); // Task 80 — مقادیر ذخیره‌شده‌اند، نه محاسبه‌شده
      setCurrentId(r.id);
      setDirty(false); // Task 82 — رکورد ذخیره‌شده باز شد
      setValues({
        code: r.code,
        title: r.title,
        startDate: storedToDisplayDate(r.startDate, locale),
        endDate: storedToDisplayDate(r.endDate, locale),
        active: r.isActive,
      });
      void refreshMonthsLimit(); // Task 80 — همگام با آخرین پیکربندی
    },
    [locale, refreshMonthsLimit],
  );

  const newRecord = React.useCallback(() => {
    setAutoYear(null); // Task 80 — فرم خالی، تا ورود سال بعدی
    setCurrentId(null);
    setDirty(false); // Task 82 — فرم خالی، هیچ ویرایش ذخیره‌نشده‌ای نیست
    setValues(BLANK);
    void refreshMonthsLimit(); // Task 80 — همگام با آخرین پیکربندی
  }, [refreshMonthsLimit]);

  /* Task 80 — مشتق‌سازی حینِ رندر (بدون اثر): تاریخ‌های خودکارِ سالِ واردشده
     با تغییر سال/«تعداد ماه‌های مالی»/زبان بلافاصله بازمحاسبه می‌شوند؛
     رکوردهای ذخیره‌شده (autoYear = null) هرگز بازنویسی نمی‌شوند. */
  const autoDates = React.useMemo(
    () => (autoYear == null ? null : computeAutoFiscalDates(autoYear, monthsLimit, locale)),
    [autoYear, monthsLimit, locale],
  );

  /* مقادیر مؤثرِ فرم = خودکارِ محاسبه‌شده (وقتی سالِ فعالی هست) وگرنه values */
  const effectiveValues = React.useMemo<FormValues>(
    () => ({
      ...values,
      startDate: autoDates?.start ?? values.startDate,
      endDate: autoDates?.end ?? values.endDate,
    }),
    [values, autoDates],
  );

  /* عنوان: فقط رقم لاتین، حداکثر ۴ کاراکتر (فیلتر ورودی هم‌زمان با تایپ)
     Task 80 — سالِ معتبر ۴رقمی ⇔ تاریخ‌ها از همان سال محاسبه می‌شوند؛
     خراب/خالی‌شدن عنوان ⇔ بازگشت به مقادیر values (خالی یا رکورد باز). */
  const onFieldChange = React.useCallback((id: string, value: string | boolean) => {
    setDirty(true); // Task 82 — هر ویرایش = اطلاعات ذخیره‌نشده
    if (id === "title" && typeof value === "string") {
      const title = normalizeDigits(value).replace(/[^0-9]/g, "").slice(0, 4);
      setAutoYear(/^[0-9]{4}$/.test(title) ? Number(title) : null);
      setValues((v) => ({ ...v, title }));
      return;
    }
    setValues((v) => ({ ...v, [id]: value }));
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
    /* Task 80 — تاریخ‌های مؤثر (خودکارِ محاسبه‌شده یا مقادیر values) */
    const err = validate(effectiveValues);
    if (err) {
      toast.error(err);
      return false;
    }
    const body = {
      code: effectiveValues.code.trim(),
      title: effectiveValues.title.trim(),
      /* Task 77: API/DB فقط میلادی — تبدیل نمایشِ زبان انتخابی به 'YYYY-MM-DD' */
      startDate: displayToStoredDate(effectiveValues.startDate, locale, normalizeDigits) ?? "",
      endDate: displayToStoredDate(effectiveValues.endDate, locale, normalizeDigits) ?? "",
      isActive: effectiveValues.active,
    };
    try {
      const res = currentId == null
        ? await api.post<FiscalYearDto>("fiscal-year", body)
        : await api.put<FiscalYearDto>(`fiscal-year/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rows = await fetchRecords().catch(() => [] as FiscalYearDto[]);
      applyRecords(rows);
      applyRecord(res);
      /* Task 82 — فوتر دسکتاپ (فهرست سال‌های مالی) زنده تازه می‌شود */
      window.dispatchEvent(
        new CustomEvent("erp:records-changed", { detail: { entity: "fiscal-year" } }),
      );
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
      /* Task 82 — فوتر دسکتاپ (فهرست سال‌های مالی) زنده تازه می‌شود */
      window.dispatchEvent(
        new CustomEvent("erp:records-changed", { detail: { entity: "fiscal-year" } }),
      );
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
      { id: "code", label: t("fy.code"), required: true, value: effectiveValues.code },
      {
        id: "title",
        label: t("fy.title"),
        required: true,
        value: effectiveValues.title,
        placeholder: "1404",
      },
      /* Task 80 — تاریخ‌ها خودکار محاسبه می‌شوند و فقط-نمایش‌اند */
      { id: "startDate", label: t("fy.startDate"), type: "date", value: effectiveValues.startDate, disabled: true },
      { id: "endDate", label: t("fy.endDate"), type: "date", value: effectiveValues.endDate, disabled: true },
      { id: "active", label: t("fy.active"), type: "checkbox", checked: effectiveValues.active },
    ],
    [t, effectiveValues],
  );

  return (
    <SimpleFormTwoRowTabbed
      title={t("fy.formTitle")}
      badge={t("app.general")}
      icon={<CalendarPlus className="h-3.5 w-3.5" aria-hidden />}
      fields={fields}
      onFieldChange={onFieldChange}
      hint={t("fy.datesAutoHint")}
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
        /* Task 86 — مینی‌گرید دراپ‌داون لیست: یک ستون به‌ازای هر فیلد */
        cells: [
          { label: t("fy.code"), value: r.code },
          { label: t("fy.title"), value: r.title },
          { label: t("fy.startDate"), value: storedToDisplayDate(r.startDate, locale) },
          { label: t("fy.endDate"), value: storedToDisplayDate(r.endDate, locale) },
          { label: t("fy.active"), value: r.isActive ? t("abar.listYes") : t("abar.listNo") },
        ],
      }))}
      listLoading={listLoading}
      listActiveId={currentId != null ? String(currentId) : null}
      onListRefresh={async () => {
        try {
          applyRecords(await fetchRecords());
        } catch {
          applyRecords([]);
        }
      }}
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
