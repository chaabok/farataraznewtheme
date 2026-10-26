"use client";

import * as React from "react";
import { FolderOpen, Plus, RefreshCw, Tags } from "lucide-react";
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
 * DetailTypeForm — Task 120 (درخواست مالک): فرم «نوع تفصیل جدید» در
 * نرم‌افزار «حسابداری» ← زیرمنوی «اطلاعات پایه» (Task 119).
 *
 * فیلدها عین تصویر مالک — و بدون عنوان لاتین به فرمان صریح مالک:
 * «عنوان لاتین را نیاز نداریم که در فرم باشد»:
 *   ۱. کد*        — اجباری، یکتا در ساختار سازمانی (مثل CUST/SUPP).
 *   ۲. عنوان*     — اجباری، یکتا در ساختار سازمانی.
 *   ۳. فعال است   — چک‌باکس (پیش‌فرض فعال — در تصویر تیک خورده).
 *   ۴. توضیحات    — اختیاری، متن چندخطی عرض کامل.
 *
 * Task 115 (الگوی تثبیت‌شده) — کاشی «ترجمه» از ابتدا سیم‌کشی شده
 * (useRecordTranslation — انبار DataTranslation با entityType «DetailType»؛
 * فیلدهای قابل ترجمه = عنوان + توضیحات). Task 118 — فهرست کامل با
 * MainDataGrid (فیلتر قیفی/سورت/CSV) + نوار «جدید/بازکردن/بازخوانی».
 */

interface DetailTypeDto {
  id: number;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
}

interface FormValues {
  code: string;
  title: string;
  description: string;
  active: boolean;
}

const BLANK: FormValues = {
  code: "",
  title: "",
  description: "",
  active: true,
};

export function DetailTypeForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "app" && w.appKey === "accounting")?.maximized ?? false,
  );
  /* Task 122 (درخواست مالک) — تفصیل‌ها در دامنهٔ گرهٔ فعالِ انتخاب‌گر سازمانی
     هدر دیده/ثبت می‌شوند (قرارداد واحد اشتراک: baseDataScopeWhere؛ ردیف‌های
     دفتر مرکزی هم وقتی تیک اشتراک فعال است دیده می‌شوند). */
  const { scope, loaded: orgLoaded } = useOrgScope();
  const orgTree = useOrgContext((s) => s.tree);
  const activeNode = React.useMemo(
    () =>
      orgTree.find((n) => Number(n.id) === (scope.businessStructureRef ?? -1)) ?? null,
    [orgTree, scope.businessStructureRef],
  );

  const [records, setRecords] = React.useState<DetailTypeDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK);
  /* Task 82 — فلگ اطلاعات ذخیره‌نشدهٔ برگه (قرارداد آلارم مالک) */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  /* ---- Task 115 — ترجمهٔ دادهٔ رکورد باز (overlay زبان غیر-fa) ---- */
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
      }>(`data-translations?entityType=DetailType&entityId=${id}`);
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

  /* Task 99 — ترجمهٔ سطرهای فهرست با endpoint دسته‌ای (title + description) */
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
        `data-translations?entityType=DetailType&entityIds=${ids.join(",")}&fieldKeys=title,description`,
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

  const fetchRecords = React.useCallback(async (): Promise<DetailTypeDto[]> => {
    /* Task 122 — دامنهٔ گرهٔ فعال؛ تا آماده‌شدن درخت سازمان چیزی نمی‌گیریم */
    if (!orgLoaded) return [];
    const qs = new URLSearchParams();
    if (scope.businessStructureRef != null) {
      qs.set("structureId", String(scope.businessStructureRef));
      qs.set("headOfficeShares", scope.shared ? "true" : "false");
    }
    const res = await api.get<{ items?: DetailTypeDto[] }>(
      `detail-type${qs.size ? `?${qs.toString()}` : ""}`,
    );
    return res.items ?? [];
  }, [orgLoaded, scope.businessStructureRef, scope.shared]);

  const applyRecords = React.useCallback((rows: DetailTypeDto[]) => {
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
    (r: DetailTypeDto) => {
      setCurrentId(r.id);
      setDirty(false); // Task 82 — رکورد ذخیره‌شده باز شد
      const nextValues: FormValues = {
        code: r.code,
        title: r.title,
        description: r.description ?? "",
        active: r.isActive,
      };
      setBaseValues(nextValues); // پایهٔ مقایسهٔ overlay
      setValues(nextValues);
      setRevealed(new Set());
      setTrMap({});
      void loadTr(r.id);
    },
    [loadTr],
  );

  const newRecord = React.useCallback(() => {
    setCurrentId(null);
    setDirty(false); // فرم خالی — هیچ ویرایش ذخیره‌نشده‌ای نیست
    setValues(BLANK);
    setBaseValues(BLANK);
    setRevealed(new Set());
    setTrMap({});
  }, []);

  /* کد نوع تفصیل: ارقام فارسی/عربی → لاتین، بدون فاصلهٔ داخلی */
  const onFieldChange = React.useCallback((id: string, value: string | boolean) => {
    setDirty(true); // Task 82
    if (typeof value === "string" && id === "code") {
      const latin = value
        .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
        .replace(/\s+/g, "")
        .toUpperCase();
      setValues((v) => ({ ...v, [id]: latin }));
      return;
    }
    setValues((v) => ({ ...v, [id]: value }));
  }, []);

  /* زنجیرهٔ اعتبارسنجی فرانت — همان قوانین سرور (کد/عنوان اجباری) */
  const validate = (vals: FormValues): string | null => {
    if (vals.code.trim() === "") return t("dt.errCodeRequired");
    if (vals.title.trim() === "") return t("dt.errTitleRequired");
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
      description: values.description.trim(),
      isActive: values.active,
      /* Task 122 — گرهٔ سازمانی فعال مالکِ رکورد است (نبودِ آن = دفتر مرکزی) */
      structureId: scope.businessStructureRef ?? undefined,
    };
    try {
      const res = currentId == null
        ? await api.post<DetailTypeDto>("detail-type", body)
        : await api.put<DetailTypeDto>(`detail-type/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rows = await fetchRecords().catch(() => [] as DetailTypeDto[]);
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
      await api.del(`detail-type/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rows = await fetchRecords().catch(() => [] as DetailTypeDto[]);
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

  /* ---- Task 115 — کاشی «ترجمه» فعال (آنلاین LLM + ورود دستی) ----
     فیلدهای قابل ترجمه = متن‌های fa رکورد: عنوان + توضیحات (کد ترجمه
     نمی‌گیرد). Task 120 — توضیحات هم فیلد متنیِ معنادار است. */
  const recordTr = useRecordTranslation({
    entityType: "DetailType",
    entityId: currentId,
    getFields: (): DataTranslationField[] => {
      const out: DataTranslationField[] = [];
      const push = (key: string, label: string, value: string) => {
        const v = value.trim();
        if (v) out.push({ key, label, value: v });
      };
      push("title", t("dt.title"), values.title);
      push("description", t("dt.description"), values.description);
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

  /* مقدار overlay فیلدهای متنی رکورد باز (الگوی Task 93/115) */
  const mainOverlay = (key: "title" | "description"): string | undefined => {
    if (locale === "fa" || currentId == null) return undefined;
    if (revealed.has(key)) return undefined; // فوکوس ⇒ مقدار پایه
    if (values[key] !== baseValues[key]) return undefined; // ویرایش‌شده ⇒ مقدار واقعی
    const tr = trMap[key]?.[locale];
    return tr && tr.trim() ? tr : undefined;
  };

  /* مقدار نمایشی سطرهای فهرست (Task 99) */
  const listTitleOf = (r: DetailTypeDto): string => {
    const tr = locale === "fa" ? "" : (listTr[String(r.id)]?.title?.[locale] ?? "").trim();
    return tr || r.title;
  };
  const listDescOf = (r: DetailTypeDto): string => {
    const tr = locale === "fa" ? "" : (listTr[String(r.id)]?.description?.[locale] ?? "").trim();
    return tr || r.description || "";
  };

  /* Task 118 — فهرست کامل با MainDataGrid: انتخاب مستقل + دبل‌کلیک = بازکردن */
  const [gridSelectedId, setGridSelectedId] = React.useState<string | null>(null);
  const openGridRow = React.useCallback(
    (r: DetailTypeDto) => {
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
        description: listDescOf(r),
        active: r.isActive ? t("abar.listYes") : t("abar.listNo"),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records, listTr, locale, t],
  );
  const gridColumns = React.useMemo<MainGridColumn[]>(
    () => [
      { key: "code", label: t("dt.code"), width: 100, align: "center" },
      { key: "title", label: t("dt.title"), width: 200 },
      { key: "description", label: t("dt.description"), width: 260 },
      {
        key: "active",
        label: t("dt.active"),
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
      { id: "code", label: t("dt.code"), required: true, value: values.code },
      {
        id: "title",
        label: t("dt.title"),
        required: true,
        value: mainOverlay("title") ?? values.title,
        onRevealFocus: () => revealField("title"), // Task 115
      },
      { id: "active", label: t("dt.active"), type: "checkbox", checked: values.active },
      {
        id: "description",
        label: t("dt.description"),
        type: "textarea",
        value: mainOverlay("description") ?? values.description,
        placeholder: t("dt.descriptionPlaceholder"),
        onRevealFocus: () => revealField("description"), // Task 115
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, values, currentId, locale, trMap, revealed, baseValues, revealField],
  );

  return (
    <>
    <SimpleFormTwoRowTabbed
      title={t("dt.formTitle")}
      badge={t("app.accounting")}
      icon={<Tags className="h-3.5 w-3.5" aria-hidden />}
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
        subtitle: listDescOf(r) || undefined,
        cells: [
          { label: t("dt.code"), value: r.code },
          { label: t("dt.title"), value: listTitleOf(r) },
          { label: t("dt.description"), value: listDescOf(r) },
          { label: t("dt.active"), value: r.isActive ? t("abar.listYes") : t("abar.listNo") },
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
    {/* Task 115 — دیالوگ ورود دستی (آفلاین) ترجمهٔ رکورد باز */}
    {recordTr.dialog}

    {/* Task 118 — فهرست انواع تفصیل با MainDataGrid (عین طرح مالک) */}
    <section className="mt-4" aria-label={t("dt.listTitle")}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Tags className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h3 className="text-xs font-semibold text-muted-foreground">{t("dt.listTitle")}</h3>
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
        csvFileName="detail-types"
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
