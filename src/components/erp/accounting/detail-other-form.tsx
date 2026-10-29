"use client";

import * as React from "react";
import { Boxes, FolderOpen, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import {
  useOrgScope,
  useOrgContext,
} from "@/stores/org-context-store";
import { useTabDirty, useWindowChrome } from "@/components/desktop/app-window";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
} from "@/components/forms/simple-form-two-row-tabbed";
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
 * DetailOtherForm — Task 154 (درخواست مالک): فرم «تفصیلی سایر» در نرم‌افزار
 * «حسابداری» ← زیرمنوی «اطلاعات تفصیلی ها» (Task 145).
 *
 * فیلدها عین فرمان مالک — به ترتیب:
 *   ۱. کد تفصیل*   — اجباری؛ شماره‌گذاری خودکار نوع «سایر» ⇒ فقط‌خواندنی
 *      با پیشنهاد لایو نخستین عدد آزاد بازه (سرور مرجع نهایی تخصیص است)؛
 *      شماره‌گذاری دستی ⇒ ورود دستی با قوانین عددی/درون‌بازه/یکتا (۴۲۲/۴۰۹).
 *   ۲. عنوان*      — اجباری (یکتا در نوع «سایر» + گرهٔ ساختار).
 *   ۳. فعال        — چک‌باکس (پیش‌فرض تیک‌خورده — فرمان مالک: «فعال که بصورت
 *      پیش فرض تیک داشته باشد»).
 *
 * رکوردهای این فرم تفصیلی‌های نوع ثابت «سایر»اند (پنجمین دستهٔ کلاسیک
 * تفصیلی معین) — نوع «سایر» سمت سرور با GET /detail-items/other-category
 * تضمین می‌شود (اگر نبود با کد آزاد از ۲۲ + ردیف شماره‌گذاری خودکار ساخته
 * می‌شود — idempotent)؛ بنابراین فرم بدون انتخاب‌گر نوع است و دقیقاً ۳ فیلد
 * مالک را دارد.
 *
 * الگوها: Task 144 (ایجاد تفصیلی ها — همان نهاد DetailItem با نوع ثابت)،
 * Task 118 (فهرست MainDataGrid + نوار «جدید/بازکردن/بازخوانی»)، Task 115
 * (کاشی «ترجمه» — entityType «DetailItem»؛ فیلد قابل ترجمه = عنوان)،
 * Task 82 (فلگ ذخیره‌نشدهٔ برگه) و Task 149 (توضیحات فرم فقط در نوار
 * انتهایی — خودِ کامپوننت SimpleFormTwoRowTabbed).
 */

interface DetailItemDto {
  id: number;
  detailTypeRef: number;
  typeCode: string;
  typeTitle: string;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
}

/** پاسخ GET /detail-items/other-category — نوع ثابت «سایر» فرم */
interface OtherCategoryInfo {
  id: number;
  code: string;
  title: string;
  created: boolean;
}

/** پاسخ /detail-items/next-code — پیشنهاد کد + نحوهٔ نمایش فیلد کد */
interface NextCodeInfo {
  mode: "automatic" | "manual";
  code: string | null;
  rangeStart: number | null;
  rangeEnd: number | null;
  exhausted?: boolean;
}

interface FormValues {
  code: string;
  title: string;
  active: boolean;
}

const BLANK: FormValues = {
  code: "",
  title: "",
  active: true, // فرمان مالک: فعال که بصورت پیش‌فرض تیک داشته باشد
};

export function DetailOtherForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "app" && w.appKey === "accounting")?.maximized ?? false,
  );
  /* Task 122 (قرارداد مشترک) — تفصیلی‌ها در دامنهٔ گرهٔ فعالِ انتخاب‌گر سازمانی */
  const { scope, loaded: orgLoaded } = useOrgScope();
  const orgTree = useOrgContext((s) => s.tree);
  const activeNode = React.useMemo(
    () =>
      orgTree.find((n) => Number(n.id) === (scope.businessStructureRef ?? -1)) ?? null,
    [orgTree, scope.businessStructureRef],
  );

  /* نوع ثابت «سایر» — سمت سرور تضمین می‌شود (Task 154) */
  const [typeRef, setTypeRef] = React.useState<number | null>(null);
  const [typeReady, setTypeReady] = React.useState(false);
  const [records, setRecords] = React.useState<DetailItemDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK);
  /* نحوهٔ تخصیص کد نوع «سایر» (خودکار/دستی) + پیشنهاد کد خودکار */
  const [nextCodeInfo, setNextCodeInfo] = React.useState<NextCodeInfo | null>(null);
  /* Task 82 — فلگ اطلاعات ذخیره‌نشدهٔ برگه */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  const automatic = nextCodeInfo?.mode === "automatic";

  const scopeQs = React.useCallback((): string => {
    const qs = new URLSearchParams();
    if (scope.businessStructureRef != null) {
      qs.set("structureId", String(scope.businessStructureRef));
      qs.set("headOfficeShares", scope.shared ? "true" : "false");
    }
    return qs.size ? `?${qs.toString()}` : "";
  }, [scope.businessStructureRef, scope.shared]);

  /* ---- ترجمهٔ دادهٔ رکورد باز (overlay زبان غیر-fa — الگوی Task 115) ---- */
  const [trMap, setTrMap] = React.useState<Record<string, Record<string, string>>>({});
  const [revealed, setRevealed] = React.useState<ReadonlySet<string>>(new Set());
  const [baseValues, setBaseValues] = React.useState<FormValues>(BLANK);
  const currentIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  const loadTr = React.useCallback(async (id: number): Promise<void> => {
    try {
      const res = await api.get<{
        items?: Array<{ fieldKey: string; locale: string; value: string }>;
      }>(`data-translations?entityType=DetailItem&entityId=${id}`);
      if (currentIdRef.current !== id) return; // پاسخ کهنه — رکورد عوض شده
      const next: Record<string, Record<string, string>> = {};
      for (const it of res.items ?? []) {
        if (!it?.fieldKey || !it?.locale || !it?.value) continue;
        (next[it.fieldKey] ??= {})[it.locale] = it.value;
      }
      setTrMap(next);
    } catch {
      /* واکشی ناموفق — مقادیر پایه دیده می‌شوند */
    }
  }, []);

  /* ترجمهٔ سطرهای فهرست با endpoint دسته‌ای (title) */
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
        `data-translations?entityType=DetailItem&entityIds=${ids.join(",")}&fieldKeys=title`,
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
        /* لیست با مقادیر پایه می‌ماند */
      });
    return () => {
      alive = false;
    };
  }, [records, listTrVersion]);

  /* فوکوس روی فیلد = نمایان‌شدن مقدار پایه زیر overlay */
  const revealField = React.useCallback((key: string) => {
    setRevealed((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, []);

  /** پیشنهاد کد نوع «سایر» (فقط در ثبتِ تازه کد را پیش‌پر می‌کند). */
  const fetchNextCode = React.useCallback(
    async (ref: number, prefill: boolean): Promise<NextCodeInfo | null> => {
      const qs = new URLSearchParams({ detailTypeRef: String(ref) });
      if (scope.businessStructureRef != null) {
        qs.set("structureId", String(scope.businessStructureRef));
        qs.set("headOfficeShares", scope.shared ? "true" : "false");
      }
      try {
        const res = await api.get<NextCodeInfo>(`detail-items/next-code?${qs.toString()}`);
        setNextCodeInfo(res);
        if (prefill) {
          setValues((v) => ({ ...v, code: res.mode === "automatic" ? (res.code ?? "") : "" }));
        }
        return res;
      } catch {
        setNextCodeInfo(null);
        return null;
      }
    },
    [scope.businessStructureRef, scope.shared],
  );

  /* نوع «سایر» را تضمین و شناسه‌اش را برمی‌گرداند (Task 154)؛ در ثبتِ تازه
     نخستین کد آزاد بازهٔ خودکار لایو پیشنهاد می‌شود */
  React.useEffect(() => {
    if (!orgLoaded) return;
    let alive = true;
    api
      .get<OtherCategoryInfo>(`detail-items/other-category${scopeQs()}`)
      .then((res) => {
        if (!alive) return;
        setTypeRef(res.id);
        setTypeReady(true);
        void fetchNextCode(res.id, true);
      })
      .catch(() => {
        if (alive) setTypeReady(true); // آماده ولی ناموفق — پیام hint می‌دهد
      });
    return () => {
      alive = false;
    };
  }, [orgLoaded, scopeQs, fetchNextCode]);

  const fetchRecords = React.useCallback(async (): Promise<DetailItemDto[]> => {
    if (!orgLoaded || typeRef == null) return [];
    const qs = new URLSearchParams({ detailTypeRef: String(typeRef) });
    if (scope.businessStructureRef != null) {
      qs.set("structureId", String(scope.businessStructureRef));
      qs.set("headOfficeShares", scope.shared ? "true" : "false");
    }
    const res = await api.get<{ items?: DetailItemDto[] }>(`detail-items?${qs.toString()}`);
    return res.items ?? [];
  }, [orgLoaded, typeRef, scope.businessStructureRef, scope.shared]);

  const applyRecords = React.useCallback((rows: DetailItemDto[]) => {
    setRecords(rows);
    setListLoading(false);
  }, []);

  React.useEffect(() => {
    if (typeRef == null) return;
    let alive = true;
    fetchRecords().then(
      (rows) => alive && applyRecords(rows),
      () => alive && applyRecords([]),
    );
    return () => {
      alive = false;
    };
  }, [typeRef, fetchRecords, applyRecords]);

  const applyRecord = React.useCallback(
    (r: DetailItemDto) => {
      setCurrentId(r.id);
      setDirty(false); // Task 82 — رکورد ذخیره‌شده باز شد
      const nextValues: FormValues = {
        code: r.code,
        title: r.title,
        active: r.isActive,
      };
      setBaseValues(nextValues); // پایهٔ مقایسهٔ overlay
      setValues(nextValues);
      setRevealed(new Set());
      setTrMap({});
      void loadTr(r.id);
      /* فقط برای تعیین خودکار/دستی‌بودن فیلد کد — کد پیش‌پر نمی‌شود */
      void fetchNextCode(r.detailTypeRef, false);
    },
    [loadTr, fetchNextCode],
  );

  /* ثبت تازهٔ بعدی: کد بعدیِ آزاد را از سرور پیشنهاد بگیر */
  const newRecord = React.useCallback(() => {
    setCurrentId(null);
    setDirty(false); // فرم خالی — هیچ ویرایش ذخیره‌نشده‌ای نیست
    setValues(BLANK);
    setBaseValues(BLANK);
    setRevealed(new Set());
    setTrMap({});
    if (typeRef != null) void fetchNextCode(typeRef, true);
    else setNextCodeInfo(null);
  }, [typeRef, fetchNextCode]);

  /* نرمال‌سازی کد: ارقام فارسی/عربی → لاتین، بدون فاصلهٔ داخلی */
  const onFieldChange = React.useCallback(
    (id: string, value: string | boolean) => {
      setDirty(true); // Task 82
      if (typeof value === "string" && id === "code") {
        const latin = value
          .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
          .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
          .replace(/\s+/g, "");
        setValues((v) => ({ ...v, [id]: latin }));
        return;
      }
      setValues((v) => ({ ...v, [id]: value }));
    },
    [],
  );

  /* زنجیرهٔ اعتبارسنجی فرانت — همان قوانین سرور */
  const validate = (vals: FormValues): string | null => {
    if (typeRef == null) return t("do.typeMissing");
    if (nextCodeInfo?.mode !== "automatic" && vals.code.trim() === "") return t("do.errCodeRequired");
    if (vals.title.trim() === "") return t("do.errTitleRequired");
    return null;
  };

  /* ذخیره: ثبت جدید (POST) یا ویرایش رکورد جاری (PUT)؛ کد خودکار سمت سرور */
  const doSave = async (): Promise<boolean> => {
    const err = validate(values);
    if (err) {
      toast.error(err);
      return false;
    }
    const body = {
      detailTypeRef: typeRef as number,
      /* شماره‌گذاری خودکار ⇒ کد خالی (تخصیص نهایی در سرور — تک‌مرجع) */
      code: automatic ? "" : values.code.trim(),
      title: values.title.trim(),
      description: "",
      isActive: values.active,
      structureId: scope.businessStructureRef ?? undefined,
    };
    try {
      const res = currentId == null
        ? await api.post<DetailItemDto>("detail-items", body)
        : await api.put<DetailItemDto>(`detail-items/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rows = await fetchRecords().catch(() => [] as DetailItemDto[]);
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
      await api.del(`detail-items/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rows = await fetchRecords().catch(() => [] as DetailItemDto[]);
      applyRecords(rows);
      newRecord();
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      toast.error(msg);
    }
  };

  /* ناوبری رکوردهای «|< < > >|» */
  const currentIndex = records.findIndex((r) => r.id === currentId);
  const nav = (i: number) => {
    const r = records[i];
    if (r) applyRecord(r);
  };

  /* ---- کاشی «ترجمه» — entityType «DetailItem» (فقط عنوان) ---- */
  const recordTr = useRecordTranslation({
    entityType: "DetailItem",
    entityId: currentId,
    getFields: (): DataTranslationField[] => {
      const out: DataTranslationField[] = [];
      const v = values.title.trim();
      if (v) out.push({ key: "title", label: t("do.title"), value: v });
      return out;
    },
    onTranslated: () => {
      if (currentId != null) void loadTr(currentId);
      setListTrVersion((v) => v + 1);
    },
    onOfflineClose: () => {
      if (currentId != null) void loadTr(currentId);
      setListTrVersion((v) => v + 1);
    },
  });

  /* مقدار overlay فیلد عنوان رکورد باز (الگوی Task 93/115) */
  const mainOverlay = (key: "title"): string | undefined => {
    if (locale === "fa" || currentId == null) return undefined;
    if (revealed.has(key)) return undefined; // فوکوس ⇒ مقدار پایه
    if (values[key] !== baseValues[key]) return undefined; // ویرایش‌شده ⇒ مقدار واقعی
    const tr = trMap[key]?.[locale];
    return tr && tr.trim() ? tr : undefined;
  };

  /* مقدار نمایشی سطرهای فهرست (Task 99) */
  const listTitleOf = (r: DetailItemDto): string => {
    const tr = locale === "fa" ? "" : (listTr[String(r.id)]?.title?.[locale] ?? "").trim();
    return tr || r.title;
  };

  /* فهرست کامل با MainDataGrid: انتخاب مستقل + دبل‌کلیک = بازکردن */
  const [gridSelectedId, setGridSelectedId] = React.useState<string | null>(null);
  const openGridRow = React.useCallback(
    (r: DetailItemDto) => {
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
        active: r.isActive ? t("abar.listYes") : t("abar.listNo"),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records, listTr, locale, t],
  );
  const gridColumns = React.useMemo<MainGridColumn[]>(
    () => [
      { key: "code", label: t("do.code"), width: 110, align: "center" },
      { key: "title", label: t("do.title"), width: 260 },
      {
        key: "active",
        label: t("do.active"),
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

  /* فیلدها عین فرمان مالک — به ترتیب: کد تفصیل / عنوان / فعال */
  const fields = React.useMemo<SimpleFormField[]>(
    () => [
      {
        id: "code",
        label: t("do.code"),
        required: !automatic,
        value: values.code,
        ltr: true,
        /* شماره‌گذاری خودکار ⇒ کد سیستمی است و دست‌کاری نمی‌شود */
        readOnly: typeRef != null && automatic,
      },
      {
        id: "title",
        label: t("do.title"),
        required: true,
        value: mainOverlay("title") ?? values.title,
        onRevealFocus: () => revealField("title"), // Task 115
      },
      { id: "active", label: t("do.active"), type: "checkbox", checked: values.active },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, values, locale, trMap, revealed, baseValues, revealField, typeRef, automatic],
  );

  /* Task 80/149 — یادداشت انتهایی فرم: نحوهٔ تخصیص کد تفصیل */
  const hint = React.useMemo(() => {
    if (typeReady && typeRef == null) return t("do.typeMissing");
    if (!typeReady || nextCodeInfo == null) return undefined;
    return automatic ? t("do.autoCodeHint") : t("do.manualCodeHint");
  }, [typeReady, typeRef, nextCodeInfo, automatic, t]);

  return (
    <>
    <SimpleFormTwoRowTabbed
      title={t("do.formTitle")}
      badge={t("app.accounting")}
      icon={<Boxes className="h-3.5 w-3.5" aria-hidden />}
      hint={hint}
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
        /* ثبت جدید با همان مقادیر — کد از نو تخصیص/پاک می‌شود (یکتایی کد) */
        setCurrentId(null);
        if (typeRef != null) {
          void fetchNextCode(typeRef, true);
        }
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
      /* کاشی «ترجمه»: آنلاین (LLM) + دستی (دیالوگ عمومی) */
      onTranslateOnline={recordTr.translateOnline}
      onTranslateOffline={recordTr.openTranslateOffline}
      listItems={records.map((r) => ({
        id: String(r.id),
        title: `${r.code} - ${listTitleOf(r)}`,
        cells: [
          { label: t("do.code"), value: r.code },
          { label: t("do.title"), value: listTitleOf(r) },
          { label: t("do.active"), value: r.isActive ? t("abar.listYes") : t("abar.listNo") },
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
    {/* دیالوگ ورود دستی (آفلاین) ترجمهٔ رکورد باز */}
    {recordTr.dialog}

    {/* فهرست تفصیلی‌های سایر با MainDataGrid (عین الگوی Task 118) */}
    <section className="mt-4" aria-label={t("do.listTitle")}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Boxes className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h3 className="text-xs font-semibold text-muted-foreground">{t("do.listTitle")}</h3>
        {activeNode && (
          <span
            className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-400"
            title={activeNode.title}
          >
            {activeNode.title}
          </span>
        )}
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
        csvFileName="detail-other"
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
