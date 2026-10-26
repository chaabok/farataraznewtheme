"use client";

import * as React from "react";
import { ArrowLeftRight, FolderOpen, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useTabDirty, useWindowChrome } from "@/components/desktop/app-window";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
} from "@/components/forms/simple-form-two-row-tabbed";
import { normalizeDigits } from "@/components/forms/form-primitives";
import { displayToStoredDate, storedToDisplayDate } from "@/lib/calendar-date";
import { useRecordTranslation } from "@/components/forms/common/use-record-translation";
import {
  MainDataGrid,
  GridActionButton,
  type MainGridColumn,
  type MainGridRow,
} from "@/components/erp/form-builder/main-data-grid";

/**
 * ExchangeRateForm — Task 116 (درخواست مالک): فرم «نرخ برابری جدید» در نرم‌افزار
 * «عمومی» ← زیرمنوی نوپای «عملیات».
 *
 * فیلدها (عین تصویر مالک — بدون فیلد شناسه به فرمان مالک):
 *   ۱. تاریخ موثر*          — تاریخ اثرگذاری نرخ؛ میلادی در بانک (Task 77) و
 *                             نمایش در تقویم زبان انتخابی.
 *   ۲. ارز مبنا*            — دراپ‌داون از انواع ارز (Task 114 — CurrencyType).
 *   ۳. ارز مورد مبادله*     — دراپ‌داون از انواع ارز؛ ≠ ارز مبنا.
 *   ۴. واحد مبادله          — اختیاری؛ خالی = از واحد مبنای ارز مبنا استخراج
 *                             می‌شود (placeholder تصویر مالک).
 *   ۵. نرخ برابری 1 واحد*   — عدد مثبت.
 *
 * قوانین ثبت (اعتبارسنجی دولایه — فرانت + سرور):
 *   · تاریخ/ارزها/نرخ اجباری؛ ارزها باید موجود و متمایز باشند.
 *   · نرخ تکراری همان جفت‌ارز در همان تاریخ رد می‌شود (سرور 409 پیام روشن).
 *   · واحد مبادله در صورت ورود عدد صحیح ≥ ۱.
 *
 * Task 115 (الگوی تثبیت‌شده) — کاشی «ترجمه» از همان ابتدا با قلاب عمومی
 * Task 107 وصل است؛ دادهٔ این رکورد عددی/کدی است (تاریخ/ارز/نرخ) و فیلد
 * متنیِ قابل ترجمه ندارد — کلیک روی «ترجمهٔ آنلاین» توست راهنمای شفاف
 * «بدون فیلد متنی» می‌دهد (بدون کلیک مرده — قرارداد Task 90).
 */

interface ExchangeRateDto {
  id: number;
  effectiveDate: string; // میلادی 'YYYY-MM-DD' (Task 77)
  baseCurrencyRef: number;
  quoteCurrencyRef: number;
  exchangeUnit: number | null;
  rate: string;
}

interface CurrencyDto {
  id: number;
  code: string;
  title: string;
  baseUnit: number;
  isActive: boolean;
}

interface FormValues {
  effectiveDate: string; // نمایش در تقویم زبان انتخابی
  base: string; // شناسهٔ ارز مبنا (رشته — دراپ‌داون)
  quote: string; // شناسهٔ ارز مورد مبادله
  unit: string; // واحد مبادله — خالی = از ارز مبنا
  rate: string; // نرخ برابری 1 واحد
}

const BLANK: FormValues = { effectiveDate: "", base: "", quote: "", unit: "", rate: "" };

export function ExchangeRateForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "app" && w.appKey === "general")?.maximized ?? false,
  );

  const [records, setRecords] = React.useState<ExchangeRateDto[]>([]);
  const [currencies, setCurrencies] = React.useState<CurrencyDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK);
  /* تاریخِ میلادیِ ذخیره‌شدهٔ رکورد باز (Task 77) — null = کاربر تاریخ تازه‌ای
     تایپ کرده/فرم خالی است؛ نمایش = مشتق در تقویم زبان جاری (بدون effect) */
  const [dateISO, setDateISO] = React.useState<string | null>(null);
  /* Task 82 — unsaved-data flag of the tab (owner alarm contract) */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  const fetchRecords = React.useCallback(async (): Promise<ExchangeRateDto[]> => {
    const res = await api.get<{ items?: ExchangeRateDto[] }>("exchange-rate");
    return res.items ?? [];
  }, []);

  const applyRecords = React.useCallback((rows: ExchangeRateDto[]) => {
    setRecords(rows);
    setListLoading(false);
  }, []);

  /* انواع ارز (Task 114) — منبع دراپ‌داون‌ها + نمایش نام ارزها در لیست */
  React.useEffect(() => {
    let alive = true;
    fetchRecords().then(
      (rows) => alive && applyRecords(rows),
      () => alive && applyRecords([]),
    );
    api
      .get<{ items?: CurrencyDto[] }>("currency-type")
      .then((res) => {
        if (alive) setCurrencies(res.items ?? []);
      })
      .catch(() => {
        /* واکشی ناموفق — دراپ‌داون خالی می‌ماند و اعتبارسنجی مانع ثبت می‌شود */
      });
    return () => {
      alive = false;
    };
  }, [fetchRecords, applyRecords]);

  const currencyById = React.useCallback(
    (id: number): CurrencyDto | undefined => currencies.find((c) => c.id === id),
    [currencies],
  );

  const applyRecord = React.useCallback(
    (r: ExchangeRateDto) => {
      setCurrentId(r.id);
      setDirty(false); // Task 82 — رکورد ذخیره‌شده باز شد
      setDateISO(r.effectiveDate); // Task 77 — نمایش مشتق در تقویم زبان جاری
      setValues({
        effectiveDate: storedToDisplayDate(r.effectiveDate, locale),
        base: String(r.baseCurrencyRef),
        quote: String(r.quoteCurrencyRef),
        unit: r.exchangeUnit == null ? "" : String(r.exchangeUnit),
        rate: r.rate,
      });
    },
    [locale],
  );

  const newRecord = React.useCallback(() => {
    setCurrentId(null);
    setDirty(false); // Task 82 — فرم خالی، هیچ ویرایش ذخیره‌نشده‌ای نیست
    setDateISO(null);
    setValues(BLANK);
  }, []);

  /* فیلتر هم‌زمان تایپ: واحد = فقط عدد صحیح؛ نرخ = عدد اعشاری لاتین */
  const onFieldChange = React.useCallback((id: string, value: string | boolean) => {
    setDirty(true); // Task 82 — هر ویرایش = اطلاعات ذخیره‌نشده
    if (id === "effectiveDate") {
      setDateISO(null); // تایپ کاربر = مرجع جدید (نمایش مشتق از رکورد کنار می‌رود)
    }
    if (typeof value === "string" && id === "unit") {
      const num = normalizeDigits(value).replace(/[^0-9]/g, "").slice(0, 9);
      setValues((v) => ({ ...v, [id]: num }));
      return;
    }
    if (typeof value === "string" && id === "rate") {
      const num = normalizeDigits(value)
        .replace(/[^0-9.]/g, "")
        .replace(/^(\d*\.\d*)\./g, "$1")
        .slice(0, 16);
      setValues((v) => ({ ...v, [id]: num }));
      return;
    }
    setValues((v) => ({ ...v, [id]: value }));
  }, []);

  /* زنجیرهٔ اعتبارسنجی فرانت — همان قوانین سرور، برای بازخورد فوری؛
     تاریخ وقتی از رکورد ذخیره‌شده آمده (dateISO) همیشه معتبر است */
  const validate = (vals: FormValues): string | null => {
    if (dateISO == null) {
      if (vals.effectiveDate.trim() === "") return t("rate.errDateRequired");
      if (!displayToStoredDate(vals.effectiveDate, locale, normalizeDigits)) {
        return t("rate.errDateInvalid");
      }
    }
    if (vals.base === "") return t("rate.errBaseRequired");
    if (vals.quote === "") return t("rate.errQuoteRequired");
    if (vals.base === vals.quote) return t("rate.errSameCurrency");
    if (vals.unit.trim() !== "") {
      const u = Number(normalizeDigits(vals.unit));
      if (!Number.isInteger(u) || u < 1) return t("rate.errUnit");
    }
    if (vals.rate.trim() === "") return t("rate.errRateRequired");
    const rate = Number(normalizeDigits(vals.rate));
    if (!Number.isFinite(rate) || rate <= 0) return t("rate.errRateInvalid");
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
      /* Task 77: API/DB فقط میلادی — تاریخِ رکورد باز مستقیم؛ تایپ کاربر از
         نمایشِ زبان انتخابی به 'YYYY-MM-DD' تبدیل می‌شود */
      effectiveDate:
        dateISO ?? displayToStoredDate(values.effectiveDate, locale, normalizeDigits) ?? "",
      baseCurrencyRef: Number(values.base),
      quoteCurrencyRef: Number(values.quote),
      exchangeUnit: values.unit.trim() === "" ? undefined : Number(normalizeDigits(values.unit)),
      rate: String(Number(normalizeDigits(values.rate))),
    };
    try {
      const res = currentId == null
        ? await api.post<ExchangeRateDto>("exchange-rate", body)
        : await api.put<ExchangeRateDto>(`exchange-rate/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rows = await fetchRecords().catch(() => [] as ExchangeRateDto[]);
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
      await api.del(`exchange-rate/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rows = await fetchRecords().catch(() => [] as ExchangeRateDto[]);
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

  /* ---- Task 115 — قلاب عمومی ترجمهٔ رکورد (Task 107) ----
     کاشی «ترجمه» فعال می‌ماند؛ دادهٔ این فرم عددی/کدی است و فیلد متنی قابل
     ترجمه ندارد ⇒ هر دو گزینه با توست/پیام راهنمای شفاف پاسخ می‌دهند
     (بدون کلیک مرده — قرارداد Task 90). */
  const recordTr = useRecordTranslation({
    entityType: "ExchangeRate",
    entityId: currentId,
    getFields: () => [], // تاریخ/ارجاع ارز/عدد — دادهٔ متنی نیازمند ترجمه ندارد
  });

  const currencyOptions = React.useMemo(
    () =>
      currencies.map((c) => ({
        value: String(c.id),
        label: `${c.code} - ${c.title}`,
      })),
    [currencies],
  );

  /** نام نمایشی ارز در لیست («کد - عنوان»)؛ ارز حذف‌شده = شناسه */
  const currencyLabel = (id: number): string => {
    const c = currencyById(id);
    return c ? `${c.code} - ${c.title}` : `#${id}`;
  };

  /** واحد مؤثر رکورد: ورودی کاربر، وگرنه واحد مبنای ارز مبنا (placeholder مالک) */
  const effectiveUnitOf = (r: ExchangeRateDto): string => {
    if (r.exchangeUnit != null) return String(r.exchangeUnit);
    const base = currencyById(r.baseCurrencyRef);
    return base ? String(base.baseUnit) : "—";
  };

  /* Task 118 — فهرست کامل با MainDataGrid (الگوی تصویر مالک در فرم ارز):
     فیلتر عملگردار هر ستون + سورت + CSV + نوار پایین؛ دبل‌کلیک = بازکردن
     رکورد در فرم؛ تاریخ در تقویم زبان جاری نمایش داده می‌شود (Task 77). */
  const [gridSelectedId, setGridSelectedId] = React.useState<string | null>(null);
  const openGridRow = React.useCallback(
    (r: ExchangeRateDto) => {
      applyRecord(r);
      setGridSelectedId(String(r.id));
      toast.success(t("abar.itemOpened"));
    },
    [applyRecord, t],
  );
  const gridRows = React.useMemo<MainGridRow[]>(
    () =>
      records.map((r) => ({
        __id: String(r.id),
        effectiveDate: storedToDisplayDate(r.effectiveDate, locale) || r.effectiveDate,
        base: currencyLabel(r.baseCurrencyRef),
        quote: currencyLabel(r.quoteCurrencyRef),
        unit: effectiveUnitOf(r),
        rate: r.rate,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records, currencies, locale, t],
  );
  const gridColumns = React.useMemo<MainGridColumn[]>(
    () => [
      { key: "effectiveDate", label: t("rate.effectiveDate"), width: 130, align: "center" },
      { key: "base", label: t("rate.baseCurrency"), width: 170 },
      { key: "quote", label: t("rate.quoteCurrency"), width: 170 },
      { key: "unit", label: t("rate.exchangeUnit"), width: 110, align: "center" },
      { key: "rate", label: t("rate.ratePerUnit"), width: 150, align: "end" },
    ],
    [t],
  );

  const fields = React.useMemo<SimpleFormField[]>(
    () => [
      {
        id: "effectiveDate",
        label: t("rate.effectiveDate"),
        required: true,
        type: "date",
        /* Task 77 — نمایش مشتق: رکورد ذخیره‌شده در تقویم زبان جاری (با تعویض
           زبان بلافاصله عوض می‌شود)؛ تایپ کاربر عیناً همان است که می‌نویسد */
        value: dateISO != null ? storedToDisplayDate(dateISO, locale) : values.effectiveDate,
      },
      {
        id: "base",
        label: t("rate.baseCurrency"),
        required: true,
        type: "select",
        value: values.base,
        options: currencyOptions,
        placeholder: t("rate.selectPlaceholder"),
      },
      {
        id: "quote",
        label: t("rate.quoteCurrency"),
        required: true,
        type: "select",
        value: values.quote,
        options: currencyOptions,
        placeholder: t("rate.selectPlaceholder"),
      },
      {
        id: "unit",
        label: t("rate.exchangeUnit"),
        type: "number",
        value: values.unit,
        placeholder: t("rate.exchangeUnitHint"),
      },
      {
        id: "rate",
        label: t("rate.ratePerUnit"),
        required: true,
        type: "number",
        value: values.rate,
      },
    ],
    [t, values, currencyOptions, dateISO, locale],
  );

  return (
    <>
    <SimpleFormTwoRowTabbed
      title={t("rate.formTitle")}
      badge={t("app.general")}
      icon={<ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />}
      fields={fields}
      onFieldChange={onFieldChange}
      onFirst={() => nav(0)}
      onPrev={() => nav(Math.max(0, currentIndex - 1))}
      onNext={() => nav(Math.min(records.length - 1, currentIndex + 1))}
      onLast={() => nav(records.length - 1)}
      onReset={() => {
        /* آیکون + = شروع ثبتِ جدید: فرم خالی می‌شود */
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
      /* Task 115 — کاشی «ترجمه» وصل است؛ رکورد فیلد متنی ندارد ⇒ راهنمای شفاف */
      onTranslateOnline={recordTr.translateOnline}
      onTranslateOffline={recordTr.openTranslateOffline}
      listItems={records.map((r) => ({
        id: String(r.id),
        title: `${currencyLabel(r.baseCurrencyRef)} → ${currencyLabel(r.quoteCurrencyRef)}`,
        subtitle: storedToDisplayDate(r.effectiveDate, locale) || undefined,
        cells: [
          { label: t("rate.effectiveDate"), value: storedToDisplayDate(r.effectiveDate, locale) },
          { label: t("rate.baseCurrency"), value: currencyLabel(r.baseCurrencyRef) },
          { label: t("rate.quoteCurrency"), value: currencyLabel(r.quoteCurrencyRef) },
          { label: t("rate.exchangeUnit"), value: effectiveUnitOf(r) },
          { label: t("rate.ratePerUnit"), value: r.rate },
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
    {/* Task 115 — دیالوگ ورود دستی (خروجی قلاب عمومی)؛ رکورد بدون فیلد متنی
        = پیام راهنمای شفاف داخل دیالوگ */}
    {recordTr.dialog}

    {/* Task 118 — فهرست نرخ‌های برابری با MainDataGrid (الگوی Task 64) */}
    <section className="mt-4" aria-label={t("rate.listTitle")}>
      <div className="mb-2 flex items-center gap-2">
        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h3 className="text-xs font-semibold text-muted-foreground">{t("rate.listTitle")}</h3>
      </div>
      <MainDataGrid
        columns={gridColumns}
        rows={gridRows}
        loading={listLoading}
        selectedId={gridSelectedId}
        onSelectedIdChange={setGridSelectedId}
        onRowDoubleClick={(row) => {
          const r = records.find((x) => String(x.id) === row.__id);
          if (r) openGridRow(r);
        }}
        csvFileName="exchange-rates"
        className="max-h-96"
        actions={
          <>
            <GridActionButton
              icon={Plus}
              label={t("bs.action.new")}
              tint="emerald"
              onClick={() => {
                newRecord();
                setGridSelectedId(null);
              }}
            />
            <GridActionButton
              icon={FolderOpen}
              label={t("dfb.list.open")}
              tint="teal"
              disabled={!gridSelectedId}
              onClick={() => {
                const r = records.find((x) => String(x.id) === gridSelectedId);
                if (r) openGridRow(r);
              }}
            />
            <GridActionButton
              icon={RefreshCw}
              label={t("abar.listRefresh")}
              tint="violet"
              onClick={() => {
                void (async () => {
                  try {
                    applyRecords(await fetchRecords());
                  } catch {
                    applyRecords([]);
                  }
                })();
              }}
            />
          </>
        }
      />
    </section>
    </>
  );
}
