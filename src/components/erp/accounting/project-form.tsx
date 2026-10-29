"use client";

import * as React from "react";
import { Briefcase, Plus, RefreshCw, SquareStack } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useOrgScope, useOrgContext } from "@/stores/org-context-store";
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
 * ProjectForm — Task 147 (درخواست مالک): فرم «تعریف پروژه» در نرم‌افزار
 * «حسابداری» ← زیرمنوی «اطلاعات تفصیلی ها» (Task 145).
 *
 * فیلدها (عین فرم مالک): کد* | عنوان* | کد تفصیل* | توضیحات (اختیاری) |
 * فعال (پیش‌فرض تیک‌خورده).
 *
 * پیام‌های اجباری دقیق مالک (toast هنگام ذخیره با فیلد خالی):
 *   «کد الزامی است» | «عنوان الزامی است» | «کد تفصیل الزامی است».
 *
 * کد پروژه — بنا به فرمان مالک «فیلد کد اجباری و بصورت سریالی و پشت سرهم
 * شماره اختصاص یابد»: لایو ایجکس (GET /projects/next-code) نخستین عدد
 * بلااستفاده (سری پیوسته ۱، ۲، ۳، …) را پیش‌پر می‌کند و فیلد فقط‌خواندنی
 * است (تخصیص نهایی در سرور — تک‌مرجع) و پس از ثبت تغییرناپذیر می‌ماند.
 *
 * کد تفصیل — «متد کد تفصیلی» (detail-code-allocate — Task 146) با نوع تفصیل
 * «پروژه» (کد مرجع ۸ از فرم نوع تفصیلی) بر پایهٔ تنظیمات ساختار کسب و کار
 * (گرهٔ فعال OrgScope) و ردیف شماره‌گذاری همان نوع (ستون‌های شماره شروع/
 * شماره پایان — فرم Task 131):
 *   · IsAutomatic ⇒ لایو ایجکس نخستین عدد بلااستفادهٔ بازه را پیش‌پر می‌کند
 *     و فیلد فقط‌خواندنی می‌شود (تخصیص نهایی در سرور — تک‌مرجع)؛
 *   · IsAutomatic=false ⇒ فیلد باز است؛ کاربر عددی درون بازه وارد می‌کند
 *     («کد تفصیل الزامی است» اگر خالی بماند).
 *
 * هر رکورد = ردیف تفصیلی (DetailItem از نوع «پروژه») + پروفایل پروژه (کد
 * سریالی) — ثبت اتمی سمت سرور. کاشی «ترجمه» روی entityType «DetailItem»
 * همان ردیف تفصیلی سوار است (عنوان + توضیحات).
 */

interface ProjectDto {
  id: number;
  detailItemId: number;
  code: string;
  title: string;
  detailCode: string;
  typeCode: string;
  typeTitle: string;
  description: string;
  isActive: boolean;
}

/** پاسخ /projects/next-code — پیشنهاد لایو کد سریالی پروژه */
interface SerialCodeInfo {
  code: string;
  serial: true;
}

/** پاسخ /detail-code/allocate — پیشنهاد لایو کد تفصیل + نحوهٔ نمایش فیلد */
interface AllocationInfo {
  mode: "automatic" | "manual";
  code: string | null;
  rangeStart: number | null;
  rangeEnd: number | null;
  exhausted?: boolean;
  typeCode: string;
  typeTitle: string;
}

interface FormValues {
  code: string;
  title: string;
  detailCode: string;
  description: string;
  active: boolean;
}

const BLANK: FormValues = {
  code: "",
  title: "",
  detailCode: "",
  description: "",
  active: true,
};

export function ProjectForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "app" && w.appKey === "accounting")?.maximized ?? false,
  );
  /* Task 122 (قرارداد مشترک) — پروژه ها در دامنهٔ گرهٔ فعالِ انتخاب‌گر سازمانی */
  const { scope, loaded: orgLoaded } = useOrgScope();
  const orgTree = useOrgContext((s) => s.tree);
  const activeNode = React.useMemo(
    () =>
      orgTree.find((n) => Number(n.id) === (scope.businessStructureRef ?? -1)) ?? null,
    [orgTree, scope.businessStructureRef],
  );

  const [records, setRecords] = React.useState<ProjectDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK);
  /* نحوهٔ تخصیص کد تفصیل (خودکار/دستی) + پیشنهاد لایو از متد اختصاصی */
  const [allocation, setAllocation] = React.useState<AllocationInfo | null>(null);
  /* Task 82 — فلگ اطلاعات ذخیره‌نشدهٔ برگه */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  const automatic = allocation?.mode === "automatic";

  /* ---- ترجمهٔ دادهٔ رکورد باز (overlay زبان غیر-fa — الگوی Task 115) ---- */
  const [trMap, setTrMap] = React.useState<Record<string, Record<string, string>>>({});
  const [revealed, setRevealed] = React.useState<ReadonlySet<string>>(new Set());
  const [baseValues, setBaseValues] = React.useState<FormValues>(BLANK);
  /* شناسهٔ تفصیلی رکورد باز (برای کاشی ترجمه — state رندری + ref گارد پاسخ کهنه) */
  const [currentDetailItemId, setCurrentDetailItemId] = React.useState<number | null>(null);
  const detailItemIdRef = React.useRef<number | null>(null);

  const loadTr = React.useCallback(async (detailItemId: number): Promise<void> => {
    try {
      const res = await api.get<{
        items?: Array<{ fieldKey: string; locale: string; value: string }>;
      }>(`data-translations?entityType=DetailItem&entityId=${detailItemId}`);
      if (detailItemIdRef.current !== detailItemId) return; // پاسخ کهنه — رکورد عوض شده
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

  /* ترجمهٔ سطرهای فهرست با endpoint دسته‌ای (title + description) */
  const [listTr, setListTr] = React.useState<
    Record<string, Record<string, Record<string, string>>>
  >({});
  const [listTrVersion, setListTrVersion] = React.useState(0);
  React.useEffect(() => {
    const ids = records.map((r) => r.detailItemId);
    if (ids.length === 0) return;
    let alive = true;
    api
      .get<{
        items?: Array<{ entityId: number; fieldKey: string; locale: string; value: string }>;
      }>(
        `data-translations?entityType=DetailItem&entityIds=${ids.join(",")}&fieldKeys=title,description`,
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

  const scopeQs = React.useCallback((): string => {
    const qs = new URLSearchParams();
    if (scope.businessStructureRef != null) {
      qs.set("structureId", String(scope.businessStructureRef));
      qs.set("headOfficeShares", scope.shared ? "true" : "false");
    }
    return qs.size ? `?${qs.toString()}` : "";
  }, [scope.businessStructureRef, scope.shared]);

  /**
   * واکشی خالص پاسخ متد اختصاصی (بدون setState — قابل استفاده در effect).
   * GET /detail-code/allocate?form=project — متد کد تفصیلی (Task 146) با
   * نوع تفصیل «پروژه».
   */
  const fetchAllocationInfo = React.useCallback(async (): Promise<AllocationInfo | null> => {
    try {
      const qs = new URLSearchParams({ form: "project" });
      if (scope.businessStructureRef != null) {
        qs.set("structureId", String(scope.businessStructureRef));
        qs.set("headOfficeShares", scope.shared ? "true" : "false");
      }
      return await api.get<AllocationInfo>(`detail-code/allocate?${qs.toString()}`);
    } catch {
      return null;
    }
  }, [scope.businessStructureRef, scope.shared]);

  /**
   * اعمال پاسخ متد اختصاصی + پیش‌پر کردن کد تفصیل در ثبت تازه
   * (فقط در event handler ها فراخوانی شود).
   */
  const fetchAllocation = React.useCallback(
    async (prefill: boolean): Promise<AllocationInfo | null> => {
      const res = await fetchAllocationInfo();
      setAllocation(res);
      if (prefill) {
        setValues((v) => ({
          ...v,
          detailCode: res && res.mode === "automatic" ? (res.code ?? "") : "",
        }));
      }
      return res;
    },
    [fetchAllocationInfo],
  );

  /**
   * لایو ایجکس کد سریالی پروژه (GET /projects/next-code) — نخستین عدد
   * بلااستفادهٔ سری پیوستهٔ گرهٔ فعال؛ پیش‌پرِ فیلد فقط‌خواندنی کد.
   */
  const fetchSerialCode = React.useCallback(async (): Promise<string> => {
    try {
      const qs = new URLSearchParams();
      if (scope.businessStructureRef != null) {
        qs.set("structureId", String(scope.businessStructureRef));
      }
      const res = await api.get<SerialCodeInfo>(
        `projects/next-code${qs.size ? `?${qs.toString()}` : ""}`,
      );
      return res?.code ?? "";
    } catch {
      return "";
    }
  }, [scope.businessStructureRef]);

  /** اعمال کد سریالی لایو در ثبت تازه (فقط در event handler ها). */
  const fetchSerialPrefill = React.useCallback(async (): Promise<void> => {
    const code = await fetchSerialCode();
    setValues((v) => (v.code === "" ? { ...v, code } : v));
  }, [fetchSerialCode]);

  const fetchRecords = React.useCallback(async (): Promise<ProjectDto[]> => {
    if (!orgLoaded) return [];
    const res = await api.get<{ items?: ProjectDto[] }>(`projects${scopeQs()}`);
    return res.items ?? [];
  }, [orgLoaded, scopeQs]);

  const applyRecords = React.useCallback((rows: ProjectDto[]) => {
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

  /* لایو ایجکس نخستین بار (فرم ثبت جدید) — پس از آماده شدن دامنهٔ سازمانی:
     کد سریالی + پیشنهاد کد تفصیل از متد اختصاصی */
  React.useEffect(() => {
    if (!orgLoaded) return;
    let alive = true;
    (async () => {
      const [serialCode, alloc] = await Promise.all([fetchSerialCode(), fetchAllocationInfo()]);
      if (!alive) return; // پاسخ کهنه — کامپوننت/unmount یا دامنهٔ تازه
      setAllocation(alloc);
      setValues((v) => ({
        ...v,
        code: v.code === "" ? serialCode : v.code,
        detailCode: alloc && alloc.mode === "automatic" ? (alloc.code ?? "") : "",
      }));
    })();
    return () => {
      alive = false;
    };
  }, [orgLoaded, fetchSerialCode, fetchAllocationInfo]);

  const applyRecord = React.useCallback(
    (r: ProjectDto) => {
      setCurrentId(r.id);
      setDirty(false); // Task 82 — رکورد ذخیره‌شده باز شد
      detailItemIdRef.current = r.detailItemId;
      setCurrentDetailItemId(r.detailItemId);
      const nextValues: FormValues = {
        code: r.code,
        title: r.title,
        detailCode: r.detailCode,
        description: r.description ?? "",
        active: r.isActive,
      };
      setBaseValues(nextValues); // پایهٔ مقایسهٔ overlay
      setValues(nextValues);
      setRevealed(new Set());
      setTrMap({});
      void loadTr(r.detailItemId);
      /* فقط برای تعیین خودکار/دستی‌بودن فیلد کد تفصیل — پیش‌پر نمی‌شود */
      void fetchAllocation(false);
    },
    [loadTr, fetchAllocation],
  );

  const newRecord = React.useCallback(() => {
    setCurrentId(null);
    detailItemIdRef.current = null;
    setCurrentDetailItemId(null);
    setDirty(false); // فرم خالی — هیچ ویرایش ذخیره‌نشده‌ای نیست
    setValues(BLANK);
    setBaseValues(BLANK);
    setRevealed(new Set());
    setTrMap({});
    /* لایو ایجکس دوباره: کد سریالی تازه + پیشنهاد کد تفصیل تازه */
    void fetchSerialPrefill();
    void fetchAllocation(true);
  }, [fetchSerialPrefill, fetchAllocation]);

  /* نرمال‌سازی کدها: ارقام فارسی/عربی → لاتین، بدون فاصلهٔ داخلی */
  const onFieldChange = React.useCallback(
    (id: string, value: string | boolean) => {
      setDirty(true); // Task 82
      if (typeof value === "string" && id === "detailCode") {
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

  /* زنجیرهٔ اعتبارسنجی فرانت — پیام‌های دقیق مالک؛ همان قوانین سرور */
  const validate = (vals: FormValues): string | null => {
    if (vals.code.trim() === "") return t("pj.errCodeRequired");
    if (vals.title.trim() === "") return t("pj.errTitleRequired");
    if (!automatic && vals.detailCode.trim() === "") return t("pj.errDetailCodeRequired");
    return null;
  };

  /* ذخیره: ثبت جدید (POST) یا ویرایش رکورد جاری (PUT)؛
     کد سریالی و کد تفصیل خودکار سمت سرور تخصیص می‌یابند (تک‌مرجع) */
  const doSave = async (): Promise<boolean> => {
    const err = validate(values);
    if (err) {
      toast.error(err);
      return false;
    }
    const body = {
      code: values.code.trim(),
      title: values.title.trim(),
      /* شماره‌گذاری خودکار ⇒ کد تفصیل خالی (تخصیص نهایی با متد اختصاصی سرور) */
      detailCode: automatic ? "" : values.detailCode.trim(),
      description: values.description.trim(),
      isActive: values.active,
      structureId: scope.businessStructureRef ?? undefined,
    };
    try {
      const res = currentId == null
        ? await api.post<ProjectDto>("projects", body)
        : await api.put<ProjectDto>(`projects/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rows = await fetchRecords().catch(() => [] as ProjectDto[]);
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
      await api.del(`projects/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rows = await fetchRecords().catch(() => [] as ProjectDto[]);
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

  /* ---- کاشی «ترجمه» — entityType «DetailItem» (عنوان + توضیحات) ---- */
  const recordTr = useRecordTranslation({
    entityType: "DetailItem",
    entityId: currentDetailItemId,
    getFields: (): DataTranslationField[] => {
      const out: DataTranslationField[] = [];
      const push = (key: string, label: string, value: string) => {
        const v = value.trim();
        if (v) out.push({ key, label, value: v });
      };
      push("title", t("pj.title"), values.title);
      push("description", t("pj.description"), values.description);
      return out;
    },
    onTranslated: () => {
      if (currentDetailItemId != null) void loadTr(currentDetailItemId);
      setListTrVersion((v) => v + 1);
    },
    onOfflineClose: () => {
      if (currentDetailItemId != null) void loadTr(currentDetailItemId);
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
  const listTitleOf = (r: ProjectDto): string => {
    const tr = locale === "fa" ? "" : (listTr[String(r.detailItemId)]?.title?.[locale] ?? "").trim();
    return tr || r.title;
  };
  const listDescOf = (r: ProjectDto): string => {
    const tr = locale === "fa" ? "" : (listTr[String(r.detailItemId)]?.description?.[locale] ?? "").trim();
    return tr || r.description || "";
  };

  /* فهرست کامل با MainDataGrid: انتخاب مستقل + دبل‌کلیک = بازکردن */
  const [gridSelectedId, setGridSelectedId] = React.useState<string | null>(null);
  const openGridRow = React.useCallback(
    (r: ProjectDto) => {
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
        detailCode: r.detailCode,
        description: listDescOf(r),
        active: r.isActive ? t("abar.listYes") : t("abar.listNo"),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records, listTr, locale, t],
  );
  const gridColumns = React.useMemo<MainGridColumn[]>(
    () => [
      { key: "code", label: t("pj.code"), width: 100, align: "center" },
      { key: "title", label: t("pj.title"), width: 200 },
      { key: "detailCode", label: t("pj.detailCode"), width: 110, align: "center" },
      { key: "description", label: t("pj.description"), width: 220 },
      {
        key: "active",
        label: t("pj.active"),
        width: 90,
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
      {
        id: "code",
        label: t("pj.code"),
        required: true,
        value: values.code,
        ltr: true,
        /* کد پروژه سریالیِ سرور است (پشت سرهم) — دست‌کاری نمی‌شود */
        readOnly: true,
      },
      {
        id: "title",
        label: t("pj.title"),
        required: true,
        value: mainOverlay("title") ?? values.title,
        onRevealFocus: () => revealField("title"), // Task 115
      },
      {
        id: "detailCode",
        label: t("pj.detailCode"),
        required: !automatic,
        value: values.detailCode,
        ltr: true,
        /* شماره‌گذاری خودکار ⇒ کد سیستمیِ متد اختصاصی است و دست‌کاری نمی‌شود */
        readOnly: automatic,
      },
      { id: "active", label: t("pj.active"), type: "checkbox", checked: values.active },
      {
        id: "description",
        label: t("pj.description"),
        type: "textarea",
        value: mainOverlay("description") ?? values.description,
        placeholder: t("pj.descriptionPlaceholder"),
        onRevealFocus: () => revealField("description"), // Task 115
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, values, currentId, locale, trMap, revealed, baseValues, revealField, automatic],
  );

  /* Task 80 — یادداشت زیر شبکهٔ فیلدها: کد سریالی + نحوهٔ تخصیص لایو کد تفصیل */
  const hint = React.useMemo(() => {
    if (!allocation) return t("pj.noAllocationHint");
    if (allocation.exhausted) return t("pj.exhaustedHint");
    return automatic ? t("pj.autoCodeHint") : t("pj.manualCodeHint");
  }, [allocation, automatic, t]);

  return (
    <>
    <SimpleFormTwoRowTabbed
      title={t("pj.formTitle")}
      badge={t("app.accounting")}
      icon={<Briefcase className="h-3.5 w-3.5" aria-hidden />}
      hint={hint}
      fields={fields}
      onFieldChange={onFieldChange}
      onFirst={() => nav(0)}
      onPrev={() => nav(Math.max(0, currentIndex - 1))}
      onNext={() => nav(Math.min(records.length - 1, currentIndex + 1))}
      onLast={() => nav(records.length - 1)}
      onReset={() => {
        /* آیکون + = شروع ثبتِ جدید: فرم خالی + کد سریالی و کد تفصیل لایو تازه */
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
        /* ثبت جدید با همان مقادیر — کد سریالی و کد تفصیل از نو لایو تخصیص می‌شود */
        setCurrentId(null);
        detailItemIdRef.current = null;
        setCurrentDetailItemId(null);
        setDirty(true);
        setValues((v) => ({ ...v, code: "", detailCode: "" }));
        void fetchSerialPrefill();
        void fetchAllocation(true);
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
        subtitle: r.typeTitle,
        cells: [
          { label: t("pj.code"), value: r.code },
          { label: t("pj.detailCode"), value: r.detailCode },
          { label: t("pj.active"), value: r.isActive ? t("abar.listYes") : t("abar.listNo") },
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

    {/* فهرست پروژه ها با MainDataGrid (عین الگوی Task 118/144/146) */}
    <section className="mt-4" aria-label={t("pj.listTitle")}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <SquareStack className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h3 className="text-xs font-semibold text-muted-foreground">{t("pj.listTitle")}</h3>
        {activeNode && (
          <span
            className="inline-flex items-center rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-400"
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
        csvFileName="projects"
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
              icon={Briefcase}
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
