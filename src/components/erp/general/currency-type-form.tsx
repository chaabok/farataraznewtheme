"use client";

import * as React from "react";
import { Coins, FolderOpen, Plus, RefreshCw } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useRecordTranslation } from "@/components/forms/common/use-record-translation";
import type { DataTranslationField } from "@/components/forms/common/data-translations-dialog";
import {
  MainDataGrid,
  GridActionButton,
  type MainGridColumn,
  type MainGridRow,
} from "@/components/erp/form-builder/main-data-grid";

/**
 * CurrencyTypeForm — Task 114 (درخواست مالک): فرم «نوع ارز جدید» در نرم‌افزار
 * «عمومی» ← زیرمنوی «اطلاعات پایه».
 *
 * فیلدها (عین تصویر مالک):
 *   ۱. کد — اجباری (مثل IRR/USD — کد یکتا در ساختار سازمانی).
 *   ۲. عنوان — اجباری (فارسی).
 *   ۳. عنوان لاتین — اجباری (LTR).
 *   ۴. واحد مبنا — اجباری، عدد صحیح ≥ ۱ (پیش‌فرض ۱).
 *   ۵. تعداد اعشار — اجباری، عدد صحیح ۰..۳ (الگوی ISO 4217؛ دینارها ۳).
 *   ۶. عنوان اعشار — اختیاری (مثل «سنت»).
 *   ۷. عنوان اعشار لاتین — اختیاری، LTR (مثل «Cent»).
 *   ۸. ثبت فعال — چک‌باکس (پیش‌فرض فعال).
 *
 * Seed (Task 114): ۲۵ ارز معتبر بین‌المللی ISO 4217 از بوت سرویس تنظیمات
 * (ریال ایران + majorهای جهان و همسایگان) در فهرست رکوردهای همین فرم دیده
 * می‌شوند — کد تکراری/عنوان تکراری رد می‌شود (سرور 409 با پیام روشن).
 *
 * Task 115 (گزارش مالک: «دکمه ترجمه در فرم نوع ارز جدید غیرفعال می باشد»)
 * — کاشی «ترجمه» این فرم هرگز سیم‌کشی نشده بود (onTranslateOnline/
 * onTranslateOffline از Task 90 بی‌واسطه = آیتم‌های منوی غیرفعال). اتصال
 * با قلاب عمومی Task 107 (useRecordTranslation، انبار DataTranslation با
 * entityType «CurrencyType») + قرارداد نمایش Task 93/99 فرم طرف‌حساب:
 * در زبان غیر-fa، عنوان/عنوان اعشار رکوردِ ذخیره‌شده تا وقتی فوکوس/ویرایش
 * نشده با ترجمهٔ همان زبان دیده می‌شود؛ فهرست رکوردها هم هنگام تعویض زبان
 * نرم می‌شود. کد/عنوان لاتین/اعداد دادهٔ متنی نیازمند ترجمه نیستند.
 */

interface CurrencyTypeDto {
  id: number;
  code: string;
  title: string;
  titleLatin: string;
  baseUnit: number;
  decimalPlaces: number;
  decimalTitle: string;
  decimalTitleLatin: string;
  isActive: boolean;
}

interface FormValues {
  code: string;
  title: string;
  titleLatin: string;
  baseUnit: string;
  decimalPlaces: string;
  decimalTitle: string;
  decimalTitleLatin: string;
  active: boolean;
}

const BLANK: FormValues = {
  code: "",
  title: "",
  titleLatin: "",
  baseUnit: "1",
  decimalPlaces: "0",
  decimalTitle: "",
  decimalTitleLatin: "",
  active: true,
};

export function CurrencyTypeForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "app" && w.appKey === "general")?.maximized ?? false,
  );

  const [records, setRecords] = React.useState<CurrencyTypeDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK);
  /* Task 82 — unsaved-data flag of the tab (owner alarm contract) */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  /* ---- Task 115 — ترجمهٔ دادهٔ رکورد (فعال‌سازی کاشی «ترجمه») ----
     نقشهٔ ترجمهٔ رکورد باز از انبار DataTranslation (Task 93 فرم طرف‌حساب):
     در زبان غیر-fa، فیلد متنیِ رکورد ذخیره‌شده تا وقتی فوکوس/ویرایش نشده
     ترجمهٔ همان زبان را نشان می‌دهد؛ فوکوس = نمایان‌شدن مقدار پایه. */
  const [trMap, setTrMap] = React.useState<Record<string, Record<string, string>>>({});
  const [revealed, setRevealed] = React.useState<ReadonlySet<string>>(new Set());
  /** پایهٔ مقایسهٔ overlay — عکس رکورد باز (ویرایش زیر overlay را تشخیص می‌دهد) */
  const [baseValues, setBaseValues] = React.useState<FormValues>(BLANK);
  /* آینهٔ currentId برای گارد پاسخ‌های async (رکورد عوض‌شده ⇒ نقشه کهنه اعمال نمی‌شود) */
  const currentIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  const loadTr = React.useCallback(async (id: number): Promise<void> => {
    try {
      const res = await api.get<{
        items?: Array<{ fieldKey: string; locale: string; value: string }>;
      }>(`data-translations?entityType=CurrencyType&entityId=${id}`);
      if (currentIdRef.current !== id) return; // پاسخ کهنه — رکورد عوض شده
      const next: Record<string, Record<string, string>> = {};
      for (const it of res.items ?? []) {
        if (!it?.fieldKey || !it?.locale || !it?.value) continue;
        (next[it.fieldKey] ??= {})[it.locale] = it.value;
      }
      setTrMap(next);
    } catch {
      /* واکشی ناموفق — نقشهٔ پیشین می‌ماند و مقادیر پایه دیده می‌شوند */
    }
  }, []);

  /* Task 99 — ترجمهٔ دادهٔ فهرست رکوردها: همهٔ رکوردها یک‌جا با endpoint
     دسته‌ای (فقط title/decimalTitle) تا سطرهای لیست هم با تعویض زبان نرم
     شوند؛ listTrVersion پس از هر ترجمه تازه می‌شود. */
  const [listTr, setListTr] = React.useState<
    Record<string, Record<string, Record<string, string>>>
  >({});
  const [listTrVersion, setListTrVersion] = React.useState(0);
  React.useEffect(() => {
    const ids = records.map((r) => r.id);
    if (ids.length === 0) return;
    let alive = true;
    api
      .get<{
        items?: Array<{ entityId: number; fieldKey: string; locale: string; value: string }>;
      }>(
        `data-translations?entityType=CurrencyType&entityIds=${ids.join(",")}&fieldKeys=title,decimalTitle`,
      )
      .then((res) => {
        if (!alive) return;
        const next: Record<string, Record<string, Record<string, string>>> = {};
        for (const it of res.items ?? []) {
          if (!it?.entityId || !it?.fieldKey || !it?.locale || !it?.value) continue;
          const rec = (next[String(it.entityId)] ??= {});
          (rec[it.fieldKey] ??= {})[it.locale] = it.value;
        }
        setListTr(next);
      })
      .catch(() => {
        /* واکشی ناموفق — لیست با مقادیر پایه می‌ماند */
      });
    return () => {
      alive = false;
    };
  }, [records, listTrVersion]);

  /* فوکوس روی فیلد = نمایان‌شدن مقدار پایه زیر overlay (عین Task 93) */
  const revealField = React.useCallback((key: string) => {
    setRevealed((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, []);

  const fetchRecords = React.useCallback(async (): Promise<CurrencyTypeDto[]> => {
    const res = await api.get<{ items?: CurrencyTypeDto[] }>("currency-type");
    return res.items ?? [];
  }, []);

  const applyRecords = React.useCallback((rows: CurrencyTypeDto[]) => {
    setRecords(rows);
    setListLoading(false);
  }, []);

  React.useEffect(() => {
    let alive = true;
    fetchRecords().then(
      (rows) => alive && applyRecords(rows),
      () => alive && applyRecords([]),
    );
    return () => {
      alive = false;
    };
  }, [fetchRecords, applyRecords]);

  const applyRecord = React.useCallback(
    (r: CurrencyTypeDto) => {
      setCurrentId(r.id);
      setDirty(false); // Task 82 — رکورد ذخیره‌شده باز شد
      const nextValues: FormValues = {
        code: r.code,
        title: r.title,
        titleLatin: r.titleLatin,
        baseUnit: String(r.baseUnit),
        decimalPlaces: String(r.decimalPlaces),
        decimalTitle: r.decimalTitle ?? "",
        decimalTitleLatin: r.decimalTitleLatin ?? "",
        active: r.isActive,
      };
      setBaseValues(nextValues); // Task 115 — پایهٔ مقایسهٔ overlay
      setValues(nextValues);
      setRevealed(new Set()); // overlay از نو
      setTrMap({}); // نقشهٔ رکورد قبلی اعتبار ندارد
      void loadTr(r.id); // نقشهٔ ترجمهٔ رکورد تازه
    },
    [loadTr],
  );

  const newRecord = React.useCallback(() => {
    setCurrentId(null);
    setDirty(false); // Task 82 — فرم خالی، هیچ ویرایش ذخیره‌نشده‌ای نیست
    setValues(BLANK);
    setBaseValues(BLANK); // Task 115 — overlay رکورد قبلی بی‌اعتبار
    setRevealed(new Set());
    setTrMap({});
  }, []);

  /* عنوان لاتین/عنوان اعشار لاتین: فقط نویسه‌های لاتین (LTR) — فیلتر هم‌زمان تایپ */
  const onFieldChange = React.useCallback((id: string, value: string | boolean) => {
    setDirty(true); // Task 82 — هر ویرایش = اطلاعات ذخیره‌نشده
    if (typeof value === "string" && (id === "titleLatin" || id === "decimalTitleLatin")) {
      const latin = value.replace(/[^A-Za-z0-9 ()/.,'-]/g, "");
      setValues((v) => ({ ...v, [id]: latin }));
      return;
    }
    if (typeof value === "string" && (id === "baseUnit" || id === "decimalPlaces")) {
      const num = normalizeDigits(value).replace(/[^0-9]/g, "").slice(0, 2);
      setValues((v) => ({ ...v, [id]: num }));
      return;
    }
    setValues((v) => ({ ...v, [id]: value }));
  }, []);

  /* زنجیرهٔ اعتبارسنجی فرانت — همان قوانین سرور، برای بازخورد فوری */
  const validate = (vals: FormValues): string | null => {
    if (vals.code.trim() === "") return t("currency.errCodeRequired");
    if (vals.title.trim() === "") return t("currency.errTitleRequired");
    if (vals.titleLatin.trim() === "") return t("currency.errTitleLatinRequired");
    const baseUnit = Number(normalizeDigits(vals.baseUnit));
    if (!Number.isInteger(baseUnit) || baseUnit < 1) return t("currency.errBaseUnit");
    const dec = Number(normalizeDigits(vals.decimalPlaces));
    if (!Number.isInteger(dec) || dec < 0 || dec > 3) return t("currency.errDecimal");
    return null;
  };

  /* ذخیره: ثبت جدید (POST) یا ویرایش رکورد جاری (PUT) */
  const doSave = async (): Promise<boolean> => {
    const err = validate(values);
    if (err) {
      toast.error(err);
      return false;
    }
    const body = {
      code: values.code.trim(),
      title: values.title.trim(),
      titleLatin: values.titleLatin.trim(),
      baseUnit: Number(normalizeDigits(values.baseUnit)) || 1,
      decimalPlaces: Number(normalizeDigits(values.decimalPlaces)) || 0,
      decimalTitle: values.decimalTitle.trim(),
      decimalTitleLatin: values.decimalTitleLatin.trim(),
      isActive: values.active,
    };
    try {
      const res = currentId == null
        ? await api.post<CurrencyTypeDto>("currency-type", body)
        : await api.put<CurrencyTypeDto>(`currency-type/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rows = await fetchRecords().catch(() => [] as CurrencyTypeDto[]);
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
      await api.del(`currency-type/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rows = await fetchRecords().catch(() => [] as CurrencyTypeDto[]);
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
     آنلاین: POST /api/data-translations/auto-translate (یک LLM به‌ازای هر
     فیلد) + upsert به انبار DataTranslation؛ آفلاین: دیالوگ ورود دستی.
     فیلدهای قابل ترجمه = متن‌های fa رکورد (عنوان + عنوان اعشار) — کد و
     عنوان لاتین خودشان لاتین‌اند و ترجمه نمی‌گیرند. با رسیدن این دو
     handler، کاشی «ترجمه» نوار ابزار و هر دو آیتم منوی آن فعال می‌شوند. */
  const recordTr = useRecordTranslation({
    entityType: "CurrencyType",
    entityId: currentId,
    getFields: (): DataTranslationField[] => {
      const out: DataTranslationField[] = [];
      const push = (key: string, label: string, value: string) => {
        const v = value.trim();
        if (v) out.push({ key, label, value: v });
      };
      push("title", t("currency.title"), values.title);
      push("decimalTitle", t("currency.decimalTitle"), values.decimalTitle);
      return out;
    },
    onTranslated: () => {
      if (currentId != null) void loadTr(currentId); // overlay رکورد باز تازه شود
      setListTrVersion((v) => v + 1); // فهرست هم
    },
    onOfflineClose: () => {
      if (currentId != null) void loadTr(currentId);
      setListTrVersion((v) => v + 1);
    },
  });

  /* Task 93 — مقدار overlay فیلدهای متنی: ترجمهٔ زبان فعلی فقط وقتی که
     رکورد باز است، زبان ≠ fa، فیلد فوکوس/ویرایش نشده و ترجمه موجود است
     (نبودِ ترجمه = مقدار پایه — عین زنجیرهٔ فرم طرف‌حساب) */
  const mainOverlay = (key: "title" | "decimalTitle"): string | undefined => {
    if (locale === "fa" || currentId == null) return undefined;
    if (revealed.has(key)) return undefined; // فوکوس ⇒ مقدار پایه
    if (values[key] !== baseValues[key]) return undefined; // ویرایش‌شده ⇒ مقدار واقعی
    const tr = trMap[key]?.[locale];
    return tr && tr.trim() ? tr : undefined;
  };

  /* Task 99 — مقدار نمایشیِ سطرهای فهرست: در fa مقدار پایه؛ در زبان‌های
     دیگر ترجمهٔ همان زبان از انبار (نبودِ ترجمه = مقدار پایه) */
  const listTitleOf = (r: CurrencyTypeDto): string => {
    const tr = locale === "fa" ? "" : (listTr[String(r.id)]?.title?.[locale] ?? "").trim();
    return tr || r.title;
  };
  const listDecimalOf = (r: CurrencyTypeDto): string => {
    const tr = locale === "fa" ? "" : (listTr[String(r.id)]?.decimalTitle?.[locale] ?? "").trim();
    return tr || r.decimalTitle || "";
  };

  /* Task 118 — فهرست کامل با MainDataGrid (طرح تصویر مالک): انتخابِ مستقل
     گرید (کلیک) جدا از رکورد باز فرم؛ دبل‌کلیک/«بازکردن» رکورد را در فرم
     باز می‌کند. ستون‌ها عین تصویر مالک: کد/عنوان/لاتین/واحد/اعشار/... */
  const [gridSelectedId, setGridSelectedId] = React.useState<string | null>(null);
  const openGridRow = React.useCallback(
    (r: CurrencyTypeDto) => {
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
        code: r.code,
        title: listTitleOf(r),
        titleLatin: r.titleLatin || "",
        baseUnit: String(r.baseUnit),
        decimalPlaces: String(r.decimalPlaces),
        decimalTitle: listDecimalOf(r),
        decimalTitleLatin: r.decimalTitleLatin || "",
        active: r.isActive ? t("abar.listYes") : t("abar.listNo"),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records, listTr, locale, t],
  );
  const gridColumns = React.useMemo<MainGridColumn[]>(
    () => [
      { key: "code", label: t("currency.code"), width: 90, align: "center" },
      { key: "title", label: t("currency.title"), width: 170 },
      { key: "titleLatin", label: t("currency.titleLatin"), width: 150 },
      { key: "baseUnit", label: t("currency.baseUnit"), width: 90, align: "center" },
      { key: "decimalPlaces", label: t("currency.decimalPlaces"), width: 90, align: "center" },
      { key: "decimalTitle", label: t("currency.decimalTitle"), width: 130 },
      { key: "decimalTitleLatin", label: t("currency.decimalTitleLatin"), width: 140 },
      {
        key: "active",
        label: t("currency.active"),
        width: 110,
        align: "center",
        render: (row) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
              String(row.active) === t("abar.listYes")
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            {String(row.active)}
          </span>
        ),
      },
    ],
    [t],
  );

  const fields = React.useMemo<SimpleFormField[]>(
    () => [
      { id: "code", label: t("currency.code"), required: true, value: values.code },
      {
        id: "title",
        label: t("currency.title"),
        required: true,
        value: mainOverlay("title") ?? values.title,
        onRevealFocus: () => revealField("title"), // Task 115
      },
      { id: "titleLatin", label: t("currency.titleLatin"), required: true, ltr: true, value: values.titleLatin },
      { id: "baseUnit", label: t("currency.baseUnit"), required: true, type: "number", value: values.baseUnit },
      { id: "decimalPlaces", label: t("currency.decimalPlaces"), required: true, type: "number", value: values.decimalPlaces },
      {
        id: "decimalTitle",
        label: t("currency.decimalTitle"),
        value: mainOverlay("decimalTitle") ?? values.decimalTitle,
        onRevealFocus: () => revealField("decimalTitle"), // Task 115
      },
      { id: "decimalTitleLatin", label: t("currency.decimalTitleLatin"), ltr: true, value: values.decimalTitleLatin },
      { id: "active", label: t("currency.active"), type: "checkbox", checked: values.active },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, values, currentId, locale, trMap, revealed, baseValues, revealField],
  );

  return (
    <>
    <SimpleFormTwoRowTabbed
      title={t("currency.formTitle")}
      badge={t("app.general")}
      icon={<Coins className="h-3.5 w-3.5" aria-hidden />}
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
      /* Task 115 — کاشی «ترجمه» فعال: آنلاین (LLM) + دستی (دیالوگ عمومی) */
      onTranslateOnline={recordTr.translateOnline}
      onTranslateOffline={recordTr.openTranslateOffline}
      listItems={records.map((r) => ({
        id: String(r.id),
        title: `${r.code} - ${listTitleOf(r)}`,
        subtitle: r.titleLatin || undefined,
        cells: [
          { label: t("currency.code"), value: r.code },
          { label: t("currency.title"), value: listTitleOf(r) },
          { label: t("currency.titleLatin"), value: r.titleLatin },
          { label: t("currency.baseUnit"), value: String(r.baseUnit) },
          { label: t("currency.decimalPlaces"), value: String(r.decimalPlaces) },
          { label: t("currency.decimalTitle"), value: listDecimalOf(r) },
          { label: t("currency.decimalTitleLatin"), value: r.decimalTitleLatin },
          { label: t("currency.active"), value: r.isActive ? t("abar.listYes") : t("abar.listNo") },
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
    {/* Task 115 — دیالوگ ورود دستی (آفلاین) ترجمهٔ دادهٔ رکورد باز؛ خروجی
        قلاب عمومی — پس از بستن، overlay و فهرست خودکار تازه می‌شوند */}
    {recordTr.dialog}

    {/* Task 118 (مشاورهٔ مالک) — فهرست ارزها با کامپوننت عمومی MainDataGrid
        (Task 64) — عین طرح تصویر مالک: ردیف فیلتر قیفیِ هر ستون، سورت هدری،
        انتخابگر ستون، CSV و نوار پایین. دبل‌کلیک/دکمهٔ «بازکردن» = بازکردن
        رکورد در فرم؛ ترجمهٔ زبان‌های غیر-fa هم از همین‌جا می‌آید. */}
    <section className="mt-4" aria-label={t("currency.listTitle")}>
      <div className="mb-2 flex items-center gap-2">
        <Coins className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h3 className="text-xs font-semibold text-muted-foreground">{t("currency.listTitle")}</h3>
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
        csvFileName="currency-types"
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
