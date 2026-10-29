"use client";

import * as React from "react";
import { FileSignature, Plus, RefreshCw, SquareStack } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { displayToStoredDate, storedToDisplayDate } from "@/lib/calendar-date";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useOrgScope, useOrgContext } from "@/stores/org-context-store";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectForm } from "./project-form";
import { PartyForm } from "@/components/erp/general/party-form";

/**
 * ContractForm — Task 148 (درخواست مالک): فرم «قرارداد جدید» در نرم‌افزار
 * «حسابداری» ← زیرمنوی «اطلاعات تفصیلی ها» (Task 145).
 *
 * فیلدها (عین فرم مالک — دو ستون RTL):
 *   شماره* | تاریخ* — پروژه (دراپ‌داون ستون‌دار + «+») | محل انجام کار —
 *   طرف قرارداد* (دراپ‌داون ستون‌دار + «+») | کد تفصیلی* — موضوع قرارداد* |
 *   موضوع قرارداد (2) — عنوان تفصیلی* | عنوان تفصیلی (2) — تاریخ شروع |
 *   تاریخ خاتمه — مدت قرارداد (روز) | مبلغ قرارداد* — شرح | شرح (2) —
 *   وضعیت: فعال (پیش‌فرض تیک‌خورده).
 *
 * پیام‌های اجباری دقیق مالک (toast هنگام ذخیره با فیلد خالی):
 *   «شماره الزامی است» | «تاریخ الزامی است» | «طرف قرارداد الزامی است» |
 *   «موضوع قرارداد الزامی است» | «عنوان تفصیلی الزامی است» |
 *   «مبلغ قرارداد الزامی است» | «کد تفصیلی الزامی است» (شماره‌گذاری دستی).
 *
 * کد تفصیلی — «دقیقاً همانند پروژه» (فرمان مالک): لایو ایجکس از «متد
 * اختصاصی تخصیص کد تفصیل» (GET /detail-code/allocate?form=contract —
 * Task 146) با نوع تفصیل «قرارداد» (کد مرجع ۹ از فرم نوع تفصیلی) بر پایهٔ
 * تنظیمات ساختار کسب و کار (گرهٔ فعال OrgScope) و ردیف شماره‌گذاری همان
 * نوع (ستون‌های شماره شروع/شماره پایان — فرم Task 131):
 *   · IsAutomatic ⇒ لایو ایجکس نخستین عدد بلااستفادهٔ بازه را پیش‌پر می‌کند
 *     و فیلد فقط‌خواندنی می‌شود (تخصیص نهایی در سرور — تک‌مرجع)؛
 *   · IsAutomatic=false ⇒ فیلد باز است؛ کاربر عددی درون بازه وارد می‌کند.
 *
 * دراپ‌داون‌های ستون‌دار («کامپوننت لیست» — پاپ‌آور با سرستون/فیلتر/انتخاب):
 *   · پروژه — منبع: فرم «پروژه جدید»/فهرست پروژه ها (Task 147)؛ ستون‌های
 *     نمایش: کد تفصیلی، عنوان. کاشی «+» فرم «پروژه جدید» را در دیالوگ باز
 *     می‌کند و پس از بستن، منبع تازه‌خوانی می‌شود.
 *   · طرف قرارداد — منبع: فرم «طرف حساب جدید»/فهرست طرف حساب‌ها (Task 84)؛
 *     ستون‌های نمایش: کد تفصیلی، نام طرف حساب، ماهیت (شخص حقیقی/حقوقی).
 *     کاشی «+» فرم «طرف حساب جدید» را در دیالوگ باز می‌کند.
 *
 * مدت قرارداد (روز) — با ورود تاریخ شروع و تاریخ خاتمه به‌صورت لایو محاسبه
 * می‌شود (فاصلهٔ inclusive)؛ بدون تاریخ‌ها دستی قابل ورود است.
 *
 * تاریخ‌ها — قاعدهٔ مالک Task 77: ذخیرهٔ میلادی ISO؛ نمایش تقویم زبان
 * انتخابی (fa/ps/ckb شمسی — Task 77). هر رکورد = ردیف تفصیلی (DetailItem از
 * نوع «قرارداد») + پروفایل قرارداد — ثبت اتمی سمت سرور. کاشی «ترجمه» روی
 * entityType «DetailItem» همان ردیف تفصیلی سوار است (عنوان تفصیلی + شرح).
 */

interface ContractDto {
  id: number;
  detailItemId: number;
  number: string;
  date: string;
  projectRef: number | null;
  projectTitle: string;
  projectDetailCode: string;
  partyRef: number;
  partyName: string;
  partyTafsiliCode: number;
  partyNature: string;
  workLocation: string;
  subject: string;
  subject2: string;
  detailCode: string;
  typeCode: string;
  typeTitle: string;
  title: string;
  title2: string;
  startDate: string;
  endDate: string;
  durationDays: number | null;
  amount: string;
  description: string;
  description2: string;
  isActive: boolean;
}

/** گزینهٔ دراپ‌داون پروژه — از فهرست پروژه ها (فرم Task 147) */
interface ProjectOption {
  id: number;
  detailCode: string;
  title: string;
}

/** گزینهٔ دراپ‌داون طرف قرارداد — از فهرست طرف حساب‌ها (فرم Task 84) */
interface PartyOption {
  id: number;
  tafsiliCode: number;
  name: string;
  nature: string; // "natural" | "legal"
}

/** پاسخ /detail-code/allocate — پیشنهاد لایو کد تفصیلی + نحوهٔ نمایش فیلد */
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
  number: string;
  date: string; // نمایش (تقویم زبان) — ذخیره: میلادی ISO
  projectRef: string; // "" = بدون پروژه
  workLocation: string;
  partyRef: string; // "" = انتخاب نشده
  detailCode: string;
  subject: string;
  subject2: string;
  title: string;
  title2: string;
  startDate: string; // نمایش
  endDate: string; // نمایش
  durationDays: string;
  amount: string;
  description: string;
  description2: string;
  active: boolean;
}

const BLANK: FormValues = {
  number: "",
  date: "",
  projectRef: "",
  workLocation: "",
  partyRef: "",
  detailCode: "",
  subject: "",
  subject2: "",
  title: "",
  title2: "",
  startDate: "",
  endDate: "",
  durationDays: "",
  amount: "",
  description: "",
  description2: "",
  active: true,
};

/** فاصلهٔ inclusive دو تاریخ میلادی ISO به روز (شروع=خاتمه ⇒ ۱ روز). */
function daysBetweenISO(a: string, b: string): number | null {
  const pa = /^(\d{4})-(\d{2})-(\d{2})$/.exec(a);
  const pb = /^(\d{4})-(\d{2})-(\d{2})$/.exec(b);
  if (!pa || !pb) return null;
  const ta = Date.UTC(Number(pa[1]), Number(pa[2]) - 1, Number(pa[3]));
  const tb = Date.UTC(Number(pb[1]), Number(pb[2]) - 1, Number(pb[3]));
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return null;
  return Math.round((tb - ta) / 86400000) + 1;
}

export function ContractForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "app" && w.appKey === "accounting")?.maximized ?? false,
  );
  /* Task 122 (قرارداد مشترک) — قراردادها در دامنهٔ گرهٔ فعالِ انتخاب‌گر سازمانی */
  const { scope, loaded: orgLoaded } = useOrgScope();
  const orgTree = useOrgContext((s) => s.tree);
  const activeNode = React.useMemo(
    () =>
      orgTree.find((n) => Number(n.id) === (scope.businessStructureRef ?? -1)) ?? null,
    [orgTree, scope.businessStructureRef],
  );

  const [records, setRecords] = React.useState<ContractDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK);
  /* نحوهٔ تخصیص کد تفصیلی (خودکار/دستی) + پیشنهاد لایو از متد اختصاصی */
  const [allocation, setAllocation] = React.useState<AllocationInfo | null>(null);
  /* Task 82 — فلگ اطلاعات ذخیره‌نشدهٔ برگه */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  /* ---- منابع دراپ‌داون‌ها (پروژه/طرف قرارداد) + دیالوگ‌های «+» ---- */
  const [projects, setProjects] = React.useState<ProjectOption[]>([]);
  const [parties, setParties] = React.useState<PartyOption[]>([]);
  const [projectDlgOpen, setProjectDlgOpen] = React.useState(false);
  const [partyDlgOpen, setPartyDlgOpen] = React.useState(false);

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

  const fetchRecords = React.useCallback(async (): Promise<ContractDto[]> => {
    if (!orgLoaded) return [];
    const res = await api.get<{ items?: ContractDto[] }>(`contracts${scopeQs()}`);
    return res.items ?? [];
  }, [orgLoaded, scopeQs]);

  /** منبع دراپ‌داون پروژه — فهرست پروژه ها (فرم Task 147) در دامنهٔ گرهٔ فعال. */
  const fetchProjectOptions = React.useCallback(async (): Promise<ProjectOption[]> => {
    if (!orgLoaded) return [];
    const res = await api.get<{ items?: Array<{ id: number; detailCode: string; title: string }> }>(
      `projects${scopeQs()}`,
    );
    return (res.items ?? []).map((p) => ({
      id: p.id,
      detailCode: p.detailCode ?? "",
      title: p.title ?? "",
    }));
  }, [orgLoaded, scopeQs]);

  /** منبع دراپ‌داون طرف قرارداد — فهرست طرف حساب‌ها (فرم Task 84). */
  const fetchPartyOptions = React.useCallback(async (): Promise<PartyOption[]> => {
    const res = await api.get<{
      items?: Array<{ id: number; tafsiliCode: number; name: string; lastName: string; nature: string }>;
    }>("party");
    return (res.items ?? []).map((p) => ({
      id: p.id,
      tafsiliCode: p.tafsiliCode,
      name: `${p.name ?? ""}${p.lastName ? ` ${p.lastName}` : ""}`.trim(),
      nature: p.nature,
    }));
  }, []);

  const applyRecords = React.useCallback((rows: ContractDto[]) => {
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

  /* منابع دراپ‌داون‌ها هنگام آماده شدن دامنهٔ سازمانی (الگوی effect فرم پروژه) */
  React.useEffect(() => {
    if (!orgLoaded) return;
    let alive = true;
    (async () => {
      const [pj, pt] = await Promise.all([
        fetchProjectOptions().catch(() => [] as ProjectOption[]),
        fetchPartyOptions().catch(() => [] as PartyOption[]),
      ]);
      if (!alive) return; // پاسخ کهنه — unmount یا دامنهٔ تازه
      setProjects(pj);
      setParties(pt);
    })();
    return () => {
      alive = false;
    };
  }, [orgLoaded, fetchProjectOptions, fetchPartyOptions]);

  /** تازه‌خوانی منابع دراپ‌داون‌ها پس از بستن دیالوگ‌های «+» فرم پایه (event handler). */
  const refreshOptions = React.useCallback(async (): Promise<void> => {
    const [pj, pt] = await Promise.all([
      fetchProjectOptions().catch(() => [] as ProjectOption[]),
      fetchPartyOptions().catch(() => [] as PartyOption[]),
    ]);
    setProjects(pj);
    setParties(pt);
  }, [fetchProjectOptions, fetchPartyOptions]);

  /**
   * واکشی خالص پاسخ متد اختصاصی (بدون setState — قابل استفاده در effect).
   * GET /detail-code/allocate?form=contract — متد کد تفصیلی (Task 146) با
   * نوع تفصیل «قرارداد» — دقیقاً همانند قرارداد فرم پروژه.
   */
  const fetchAllocationInfo = React.useCallback(async (): Promise<AllocationInfo | null> => {
    try {
      const qs = new URLSearchParams({ form: "contract" });
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
   * اعمال پاسخ متد اختصاصی + پیش‌پر کردن کد تفصیلی در ثبت تازه
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

  /* لایو ایجکس نخستین بار (فرم ثبت جدید) — پیشنهاد کد تفصیلی از متد اختصاصی */
  React.useEffect(() => {
    if (!orgLoaded) return;
    let alive = true;
    (async () => {
      const alloc = await fetchAllocationInfo();
      if (!alive) return; // پاسخ کهنه — کامپوننت/unmount یا دامنهٔ تازه
      setAllocation(alloc);
      setValues((v) => ({
        ...v,
        detailCode: alloc && alloc.mode === "automatic" ? (alloc.code ?? "") : "",
      }));
    })();
    return () => {
      alive = false;
    };
  }, [orgLoaded, fetchAllocationInfo]);

  /* برچسب نمایشی دراپ‌داون‌ها: گزینه‌های منبع + رکوردهای باز (رف‌های بیرون
     دامنهٔ فعلی هم قابل نمایش بمانند) */
  const projectLabels = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of projects) map[String(p.id)] = `${p.detailCode} - ${p.title}`;
    for (const r of records) {
      if (r.projectRef != null && r.projectTitle) {
        map[String(r.projectRef)] = `${r.projectDetailCode} - ${r.projectTitle}`;
      }
    }
    return map;
  }, [projects, records]);
  const partyLabels = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of parties) map[String(p.id)] = `${p.tafsiliCode} - ${p.name}`;
    for (const r of records) {
      if (r.partyRef != null && r.partyName) {
        map[String(r.partyRef)] = `${r.partyTafsiliCode} - ${r.partyName}`;
      }
    }
    return map;
  }, [parties, records]);

  const projectLabelOf = (ref: string): string =>
    ref === "" ? "" : projectLabels[ref] ?? ref;
  const partyLabelOf = (ref: string): string =>
    ref === "" ? "" : partyLabels[ref] ?? ref;

  const applyRecord = React.useCallback(
    (r: ContractDto) => {
      setCurrentId(r.id);
      setDirty(false); // Task 82 — رکورد ذخیره‌شده باز شد
      detailItemIdRef.current = r.detailItemId;
      setCurrentDetailItemId(r.detailItemId);
      const nextValues: FormValues = {
        number: r.number,
        date: storedToDisplayDate(r.date, locale),
        projectRef: r.projectRef != null ? String(r.projectRef) : "",
        workLocation: r.workLocation ?? "",
        partyRef: String(r.partyRef ?? ""),
        detailCode: r.detailCode,
        subject: r.subject,
        subject2: r.subject2 ?? "",
        title: r.title,
        title2: r.title2 ?? "",
        startDate: storedToDisplayDate(r.startDate, locale),
        endDate: storedToDisplayDate(r.endDate, locale),
        durationDays: r.durationDays != null ? String(r.durationDays) : "",
        amount: r.amount,
        description: r.description ?? "",
        description2: r.description2 ?? "",
        active: r.isActive,
      };
      setBaseValues(nextValues); // پایهٔ مقایسهٔ overlay
      setValues(nextValues);
      setRevealed(new Set());
      setTrMap({});
      void loadTr(r.detailItemId);
      /* فقط برای تعیین خودکار/دستی‌بودن فیلد کد تفصیلی — پیش‌پر نمی‌شود */
      void fetchAllocation(false);
    },
    [loadTr, fetchAllocation, locale],
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
    /* لایو ایجکس دوباره: پیشنهاد کد تفصیلی تازه */
    void fetchAllocation(true);
  }, [fetchAllocation]);

  /* نرمال‌سازی ورودی: ارقام فارسی/عربی → لاتین؛ فیلدهای عددی فقط رقم */
  const onFieldChange = React.useCallback(
    (id: string, value: string | boolean) => {
      setDirty(true); // Task 82
      if (typeof value === "string") {
        const latin = value
          .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
          .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
        if (id === "detailCode") {
          setValues((v) => ({ ...v, [id]: latin.replace(/\s+/g, "") }));
          return;
        }
        if (id === "number") {
          setValues((v) => ({ ...v, [id]: latin.replace(/\s+/g, "") }));
          return;
        }
        if (id === "amount" || id === "durationDays") {
          setValues((v) => ({ ...v, [id]: latin.replace(/[^0-9]/g, "") }));
          return;
        }
        /* تاریخ شروع/خاتمه — محاسبهٔ لایو مدت قرارداد */
        if (id === "startDate" || id === "endDate") {
          setValues((v) => {
            const next = { ...v, [id]: latin };
            const s = displayToStoredDate(next.startDate, locale, normalizeDigits);
            const e = displayToStoredDate(next.endDate, locale, normalizeDigits);
            if (s && e) {
              const days = daysBetweenISO(s, e);
              if (days != null) next.durationDays = String(days);
            }
            return next;
          });
          return;
        }
        setValues((v) => ({ ...v, [id]: latin }));
        return;
      }
      setValues((v) => ({ ...v, [id]: value }));
    },
    [locale],
  );

  /* انتخاب از دراپ‌داون‌های ستون‌دار */
  const onOpenProjectItem = React.useCallback((item: { id: string }) => {
    setValues((v) => ({ ...v, projectRef: item.id }));
    setDirty(true);
  }, []);
  const onOpenPartyItem = React.useCallback((item: { id: string }) => {
    setValues((v) => ({ ...v, partyRef: item.id }));
    setDirty(true);
  }, []);

  /* زنجیرهٔ اعتبارسنجی فرانت — پیام‌های دقیق مالک؛ همان قوانین سرور */
  const validate = (vals: FormValues): string | null => {
    if (vals.number.trim() === "") return t("ct.errNumberRequired");
    const dateISO = displayToStoredDate(vals.date, locale, normalizeDigits);
    if (vals.date.trim() === "" || dateISO == null) return t("ct.errDateRequired");
    if (vals.partyRef === "") return t("ct.errPartyRequired");
    if (vals.subject.trim() === "") return t("ct.errSubjectRequired");
    if (vals.title.trim() === "") return t("ct.errTitleRequired");
    if (vals.amount.trim() === "") return t("ct.errAmountRequired");
    if (!automatic && vals.detailCode.trim() === "") return t("ct.errDetailCodeRequired");
    /* تاریخ‌های اختیاری — در صورت ورود باید معتبر باشند */
    for (const [key, msg] of [
      [vals.startDate, t("ct.startDate")],
      [vals.endDate, t("ct.endDate")],
    ] as const) {
      if (key.trim() !== "" && displayToStoredDate(key, locale, normalizeDigits) == null) {
        return `${msg} — ${t("ct.errDateInvalid")}`;
      }
    }
    return null;
  };

  /* ذخیره: ثبت جدید (POST) یا ویرایش رکورد جاری (PUT)؛
     کد تفصیلی خودکار سمت سرور تخصیص می‌یابد (تک‌مرجع) */
  const doSave = async (): Promise<boolean> => {
    const err = validate(values);
    if (err) {
      toast.error(err);
      return false;
    }
    const dateISO = displayToStoredDate(values.date, locale, normalizeDigits);
    const body = {
      number: values.number.trim(),
      /* قاعدهٔ Task 77 — ذخیرهٔ میلادی ISO */
      date: dateISO ?? "",
      projectRef: values.projectRef !== "" ? Number(values.projectRef) : undefined,
      partyRef: values.partyRef !== "" ? Number(values.partyRef) : undefined,
      workLocation: values.workLocation.trim(),
      subject: values.subject.trim(),
      subject2: values.subject2.trim(),
      /* شماره‌گذاری خودکار ⇒ کد تفصیلی خالی (تخصیص نهایی با متد اختصاصی سرور) */
      detailCode: automatic ? "" : values.detailCode.trim(),
      title: values.title.trim(),
      title2: values.title2.trim(),
      startDate: displayToStoredDate(values.startDate, locale, normalizeDigits) ?? undefined,
      endDate: displayToStoredDate(values.endDate, locale, normalizeDigits) ?? undefined,
      durationDays: values.durationDays.trim() !== "" ? Number(values.durationDays) : undefined,
      amount: values.amount.trim(),
      description: values.description.trim(),
      description2: values.description2.trim(),
      isActive: values.active,
      structureId: scope.businessStructureRef ?? undefined,
    };
    try {
      const res = currentId == null
        ? await api.post<ContractDto>("contracts", body)
        : await api.put<ContractDto>(`contracts/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rows = await fetchRecords().catch(() => [] as ContractDto[]);
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
      await api.del(`contracts/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rows = await fetchRecords().catch(() => [] as ContractDto[]);
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

  /* ---- کاشی «ترجمه» — entityType «DetailItem» (عنوان تفصیلی + شرح) ---- */
  const recordTr = useRecordTranslation({
    entityType: "DetailItem",
    entityId: currentDetailItemId,
    getFields: (): DataTranslationField[] => {
      const out: DataTranslationField[] = [];
      const push = (key: string, label: string, value: string) => {
        const v = value.trim();
        if (v) out.push({ key, label, value: v });
      };
      push("title", t("ct.title"), values.title);
      push("description", t("ct.description"), values.description);
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
  const listTitleOf = (r: ContractDto): string => {
    const tr = locale === "fa" ? "" : (listTr[String(r.detailItemId)]?.title?.[locale] ?? "").trim();
    return tr || r.title;
  };

  /* فهرست کامل با MainDataGrid: انتخاب مستقل + دبل‌کلیک = بازکردن */
  const [gridSelectedId, setGridSelectedId] = React.useState<string | null>(null);
  const openGridRow = React.useCallback(
    (r: ContractDto) => {
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
        number: r.number,
        date: storedToDisplayDate(r.date, locale),
        subject: r.subject,
        title: listTitleOf(r),
        detailCode: r.detailCode,
        party: `${r.partyTafsiliCode} - ${r.partyName}`,
        project: r.projectRef != null ? `${r.projectDetailCode} - ${r.projectTitle}` : "",
        amount: r.amount,
        active: r.isActive ? t("abar.listYes") : t("abar.listNo"),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records, listTr, locale, t],
  );
  const gridColumns = React.useMemo<MainGridColumn[]>(
    () => [
      { key: "number", label: t("ct.number"), width: 90, align: "center" },
      { key: "date", label: t("ct.date"), width: 100, align: "center" },
      { key: "subject", label: t("ct.subject"), width: 190 },
      { key: "title", label: t("ct.title"), width: 160 },
      { key: "detailCode", label: t("ct.detailCode"), width: 100, align: "center" },
      { key: "party", label: t("ct.party"), width: 180 },
      { key: "project", label: t("ct.project"), width: 150 },
      { key: "amount", label: t("ct.amount"), width: 120, align: "center" },
      {
        key: "active",
        label: t("ct.active"),
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
        id: "number",
        label: t("ct.number"),
        required: true,
        value: values.number,
        ltr: true,
      },
      {
        id: "date",
        label: t("ct.date"),
        type: "date",
        required: true,
        value: values.date,
      },
      {
        /* دراپ‌داون ستون‌دار پروژه (کد تفصیلی، عنوان) + کاشی «+» فرم پروژه جدید */
        id: "projectRef",
        label: t("ct.project"),
        type: "list",
        value: projectLabelOf(values.projectRef),
        placeholder: t("rate.selectPlaceholder"),
        listItems: projects.map((p) => ({
          id: String(p.id),
          title: p.title,
          subtitle: p.detailCode,
          cells: [
            { label: t("pj.detailCode"), value: p.detailCode },
            { label: t("pj.title"), value: p.title },
          ],
        })),
        onOpenListItem: onOpenProjectItem,
        onLookup: () => setProjectDlgOpen(true),
      },
      {
        id: "workLocation",
        label: t("ct.workLocation"),
        value: values.workLocation,
      },
      {
        /* دراپ‌داون ستون‌دار طرف قرارداد (کد تفصیلی، نام، ماهیت) + کاشی «+» */
        id: "partyRef",
        label: t("ct.party"),
        type: "list",
        required: true,
        value: partyLabelOf(values.partyRef),
        placeholder: t("rate.selectPlaceholder"),
        listItems: parties.map((p) => ({
          id: String(p.id),
          title: p.name,
          subtitle: String(p.tafsiliCode),
          cells: [
            { label: t("pj.detailCode"), value: String(p.tafsiliCode) },
            { label: t("ct.colPartyName"), value: p.name },
            {
              label: t("party.nature"),
              value: p.nature === "legal" ? t("party.natureLegal") : t("party.natureNatural"),
            },
          ],
        })),
        onOpenListItem: onOpenPartyItem,
        onLookup: () => setPartyDlgOpen(true),
      },
      {
        id: "detailCode",
        label: t("ct.detailCode"),
        required: !automatic,
        value: values.detailCode,
        ltr: true,
        /* شماره‌گذاری خودکار ⇒ کد سیستمیِ متد اختصاصی است و دست‌کاری نمی‌شود */
        readOnly: automatic,
      },
      {
        id: "subject",
        label: t("ct.subject"),
        required: true,
        value: values.subject,
      },
      {
        id: "subject2",
        label: t("ct.subject2"),
        value: values.subject2,
      },
      {
        id: "title",
        label: t("ct.title"),
        required: true,
        value: mainOverlay("title") ?? values.title,
        onRevealFocus: () => revealField("title"), // Task 115
      },
      {
        id: "title2",
        label: t("ct.title2"),
        value: values.title2,
      },
      {
        id: "startDate",
        label: t("ct.startDate"),
        type: "date",
        value: values.startDate,
      },
      {
        id: "endDate",
        label: t("ct.endDate"),
        type: "date",
        value: values.endDate,
      },
      {
        /* با هر دو تاریخ لایو محاسبه می‌شود؛ دستی هم قابل ورود است */
        id: "durationDays",
        label: t("ct.durationDays"),
        type: "number",
        value: values.durationDays,
        ltr: true,
      },
      {
        id: "amount",
        label: t("ct.amount"),
        required: true,
        value: values.amount,
        ltr: true,
      },
      {
        id: "description",
        label: t("ct.description"),
        value: mainOverlay("description") ?? values.description,
        onRevealFocus: () => revealField("description"), // Task 115
      },
      {
        id: "description2",
        label: t("ct.description2"),
        value: values.description2,
      },
      { id: "active", label: t("ct.status"), type: "checkbox", checked: values.active },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      t,
      values,
      currentId,
      locale,
      trMap,
      revealed,
      baseValues,
      revealField,
      automatic,
      projects,
      parties,
      projectLabels,
      partyLabels,
      onOpenProjectItem,
      onOpenPartyItem,
    ],
  );

  /* Task 80 — یادداشت زیر شبکهٔ فیلدها: نحوهٔ تخصیص لایو کد تفصیلی */
  const hint = React.useMemo(() => {
    if (!allocation) return t("ct.noAllocationHint");
    if (allocation.exhausted) return t("ct.exhaustedHint");
    return automatic ? t("ct.autoCodeHint") : t("ct.manualCodeHint");
  }, [allocation, automatic, t]);

  return (
    <>
    <SimpleFormTwoRowTabbed
      title={t("ct.formTitle")}
      badge={t("app.accounting")}
      icon={<FileSignature className="h-3.5 w-3.5" aria-hidden />}
      hint={hint}
      fields={fields}
      onFieldChange={onFieldChange}
      onFirst={() => nav(0)}
      onPrev={() => nav(Math.max(0, currentIndex - 1))}
      onNext={() => nav(Math.min(records.length - 1, currentIndex + 1))}
      onLast={() => nav(records.length - 1)}
      onReset={() => {
        /* آیکون + = شروع ثبتِ جدید: فرم خالی + کد تفصیلی لایو تازه */
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
        /* ثبت جدید با همان مقادیر — شماره/کد تفصیلی از نو لایو تخصیص می‌شود */
        setCurrentId(null);
        detailItemIdRef.current = null;
        setCurrentDetailItemId(null);
        setDirty(true);
        setValues((v) => ({ ...v, number: "", detailCode: "" }));
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
        title: `${r.number} - ${listTitleOf(r)}`,
        subtitle: r.typeTitle,
        cells: [
          { label: t("ct.number"), value: r.number },
          { label: t("ct.date"), value: storedToDisplayDate(r.date, locale) },
          { label: t("ct.party"), value: `${r.partyTafsiliCode} - ${r.partyName}` },
          { label: t("ct.detailCode"), value: r.detailCode },
          { label: t("ct.active"), value: r.isActive ? t("abar.listYes") : t("abar.listNo") },
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

    {/* دیالوگ «پروژه جدید» — کاشی «+» دراپ‌داون پروژه؛ پس از بستن منبع تازه‌خوانی می‌شود */}
    <Dialog open={projectDlgOpen} onOpenChange={(open) => {
      setProjectDlgOpen(open);
      if (!open) void refreshOptions();
    }}>
      <DialogContent className="max-h-[85vh] w-[min(56rem,95vw)] max-w-none overflow-y-auto scrollbar-slim">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("pj.formTitle")}</DialogTitle>
          <DialogDescription>{t("pj.formDesc")}</DialogDescription>
        </DialogHeader>
        <ProjectForm />
      </DialogContent>
    </Dialog>

    {/* دیالوگ «طرف حساب جدید» — کاشی «+» دراپ‌داون طرف قرارداد */}
    <Dialog open={partyDlgOpen} onOpenChange={(open) => {
      setPartyDlgOpen(open);
      if (!open) void refreshOptions();
    }}>
      <DialogContent className="max-h-[85vh] w-[min(56rem,95vw)] max-w-none overflow-y-auto scrollbar-slim">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("party.formTitle")}</DialogTitle>
          <DialogDescription>{t("party.formDesc")}</DialogDescription>
        </DialogHeader>
        <PartyForm />
      </DialogContent>
    </Dialog>

    {/* فهرست قراردادها با MainDataGrid (عین الگوی Task 118/144/146/147) */}
    <section className="mt-4" aria-label={t("ct.listTitle")}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <SquareStack className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h3 className="text-xs font-semibold text-muted-foreground">{t("ct.listTitle")}</h3>
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
        csvFileName="contracts"
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
              icon={FileSignature}
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
