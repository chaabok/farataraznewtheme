"use client";

import * as React from "react";
import {
  CircleStop,
  Link2,
  ListFilter,
  Loader2,
  PencilRuler,
  Plus,
  Save,
  Scissors,
  Split,
  Undo2,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { appApi } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { normalizeDigits } from "@/components/forms/form-primitives";
import { displayToStoredDate, storedToDisplayDate } from "@/lib/calendar-date";
import { useTabDirty, useWindowChrome } from "@/components/desktop/app-window";
import { ActionIconButton } from "@/components/forms/action-bar";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
  type SimpleFormTab,
} from "@/components/forms/simple-form-two-row-tabbed";
import {
  useRecordTranslation,
  type DataTranslationField,
} from "@/components/forms/common/use-record-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * WorkflowDesignerForm — طراح فرآیند گردش کار.
 *
 * t190 (فرمان مالک) — بازطراحی کامل با پوستهٔ «SimpleFormTwoRowTabbed» تا
 * «همه فرم‌های نرم‌افزار یکسان باشند»:
 *  ① «لیست فرم‌ها» — چون تعداد فرم‌های گردش کار می‌تواند بسیار زیاد باشد،
 *     کاتالوگ فرم‌های مشارکت‌کننده از کارت‌های بخش ① قدیمی به «کامپوننت
 *     دراپ‌داون آیکون لیست» (RecordListDropdown) در اکشن بار منتقل شد؛ کاربر
 *     یک فرم را برمی‌گزیند و فرآیندهای همان فرم در تب «فرآیندها» و فیلدها
 *     بار می‌شود (تب، ایستا/onOpenRow است — ردیف‌ها آینهٔ سرورند).
 *  ② «خاتمهٔ فرآیند» — آیکون تازه در اکشن بار: مودال با تاریخ خاتمه (پیش‌فرض
 *     امروز در تقویم زبان انتخابی) + توضیحات؛ با تأیید، فرآیند خاتمه می‌یابد
 *     (IsTerminated + تاریخ + توضیح؛ از موتور خارج می‌شود) و «فرآیندهای فرم
 *     از یک بازه تاریخی تغییر می‌کند» — ادامهٔ کار با «نسخهٔ جدید».
 *  ③ «برگشت خاتمه» — آیکون تازه: قید خاتمه پاک می‌شود و نسخه آزاد می‌شود
 *     (فعال‌سازی دوباره دستی و با دیاگرام معتبر است).
 *  ④ فرآیند خاتمه‌یافته فقط-خواندنی است: فیلدها و دیاگرام قفل‌اند (سرور هم
 *     updateMeta/saveGraph/activate/remove را برای نسخهٔ خاتمه‌یافته ۴۰۹
 *     می‌زند) — لایهٔ دومِ محافظت در برابر دستکاری.
 *  ⑤ بوم طراح بصری (گره/گذار/شرط/SLA) عیناً حفظ شد و به اسلات `children`
 *     پوسته می‌نشیند — زیر تب فرآیندها.
 * منطق نسخه‌بندی FR-01 (نسخهٔ در استفاده قطعی است — ویرایش فقط با «نسخهٔ
 * جدید») و اعتبارسنجی موتور-سازگارِ ذخیرهٔ دیاگرام از t180 برقرار است.
 *
 * t191 (فرمان مالک) — شرط‌های ورود (فیلترها) در طراحی گردش کار:
 *  ① عنوان فرم «طراحی فرآیند گردش کار» (کلید wf.des.title).
 *  ② کارت «شرط‌های ورود» زیر گرید فیلدها: تا امروز تنها فیلتر، «آستانهٔ مبلغ»
 *     بود (D-2)؛ اکنون اگر کاربر از لیست فرم‌ها «سند حسابداری» را برگزیند،
 *     هفت فیلتر حسابداری هم در شرط‌ها لحاظ می‌شود: نوع سند، ماهیت سند،
 *     گروه حساب، حساب کل، حساب معین، نوع تفصیلی و جزئیات انواع تفصیلی —
 *     با دراپ‌داون دادهٔ واقعی (voucher-type/account-tree/detail-type/detail-items).
 *  ③ عملگرهای یکسان برای همهٔ فرم‌ها: شامل، بزرگتر از، کوچکتر از، برابر با،
 *     شامل نباشد، خالی باشد، خالی نباشد (برای فرم‌های غیرحسابداری: مبلغ +
 *     شرح/توضیحات با همین عملگرها).
 *  ④ فیلترهای ترکیبی: اتصال هر ردیف با ردیف قبلی با «و/یا».
 *  ⑤ مقدار شرطِ مبلغ می‌تواند «آستانهٔ فرم» باشد (همان آستانهٔ مبلغ D-2) یا
 *     عدد مستقیم؛ ذخیره در ConditionsJson با PUT :id/conditions و همراه
 *     «ذخیره اطلاعات» متا؛ نسخهٔ جدید شرط‌ها را به ارث می‌برد؛ نسخهٔ
 *     خاتمه‌یافته شرط‌هایش فقط-خواندنی است.
 */

const wf = appApi("workflow");
const stApi = appApi("settings"); // t191 — گزینه‌های فیلترهای حسابداری (نوع سند/درخت حساب/تفصیلی‌ها)

/* ------------------------------ انواع ------------------------------ */

/** t191 — عملگرهای یکسان شرط‌ها برای همهٔ فرم‌ها (فرمان مالک) */
type CondOp = "contains" | "gt" | "lt" | "eq" | "notContains" | "empty" | "notEmpty";

/** t191 — یک شرط ورود: فیلد + عملگر + مقدار + اتصال و/یا با شرط قبلی */
interface WfCond {
  field: string;
  op: CondOp;
  value: string;
  join: "and" | "or";
}

/** t191 — گزینهٔ دراپ‌داون فیلترهای مرجع (کد + عنوان از سرویس تنظیمات) */
interface RefOption {
  code: string;
  title: string;
}

interface CatalogItem {
  id: number;
  entityType: string;
  formTitle: string;
  softwareName: string;
  description: string;
  hasStatusField: boolean;
  adapterReady: boolean;
  participates: boolean;
  runningInstances: number;
  activeDefinition: { id: number; code: string; name: string; processVersion: number } | null;
}

interface DefItem {
  id: number;
  code: string;
  name: string;
  description: string;
  entityType: string;
  processVersion: number;
  thresholdAmount: number | null;
  isActive: boolean;
  conditions?: WfCond[]; // t191 — شرط‌های ورود (فهرست — شمارش)
  /* t190 — خاتمهٔ فرآیند */
  isTerminated: boolean;
  terminatedAt: string | null;
  terminationNote: string;
  usedByInstances: boolean;
  instanceCount: number;
  nodeCount: number;
}

interface GNode {
  id?: number;
  nodeCode: string;
  nodeType: "start" | "action" | "condition" | "end";
  title: string;
  roleCode: string;
  slaHours: number | null;
  orderIndex: number;
  finalStatus: number | null;
  instanceState: string;
  posX: number;
  posY: number;
}

interface GTrans {
  id?: number;
  fromCode: string;
  toCode: string;
  action: string;
  conditionExpr: string;
  isDefault: boolean;
}

interface RoleItem {
  id: number;
  code: string;
  title: string;
  isActive: boolean;
}

interface DefDetail {
  id: number;
  code: string;
  name: string;
  description: string;
  entityType: string;
  processVersion: number;
  thresholdAmount: number | null;
  isActive: boolean;
  conditions: WfCond[]; // t191 — شرط‌های ورود
  /* t190 — خاتمهٔ فرآیند */
  isTerminated: boolean;
  terminatedAt: string | null;
  terminationNote: string;
  usedByInstances: boolean;
  instanceCount: number;
  nodes: Array<Omit<GNode, "nodeType"> & { nodeType: string }>;
  /* سرور گذارها را با ID گره می‌فرستد — کلاینت به nodeCode نگاشت می‌کند */
  transitions: Array<{
    id: number;
    fromNodeId: number;
    toNodeId: number;
    action: string;
    conditionExpr: string;
    isDefault: boolean;
  }>;
}

/* ------------------------------ ثابت‌ها ------------------------------ */

const NODE_W = 224;
const NODE_H = 96;
const SNAP = 10;
const CONDITION_RE = /^amount\s*(>=|<=|==|!=|>|<)\s*(threshold|\d+(?:\.\d+)?)$/;
const ACTION_OPTIONS = ["ارسال به رسیدگی", "تایید", "رد", "بله", "خیر"];

/* t191 — فیلدهای شرط ورود: دو فیلد عمومی برای همهٔ فرم‌ها + هفت فیلتر
 * حسابداری فقط برای فرم «سند حسابداری» (فرمان مالک). */
const COND_FIELDS_BASE: Array<{ id: string; key: string }> = [
  { id: "amount", key: "wf.des.condFieldAmount" },
  { id: "description", key: "wf.des.condFieldDescription" },
];
const COND_FIELDS_VOUCHER: Array<{ id: string; key: string }> = [
  { id: "voucherType", key: "wf.des.condFieldType" },
  { id: "voucherNature", key: "wf.des.condFieldNature" },
  { id: "accountGroup", key: "wf.des.condFieldGroup" },
  { id: "ledgerAccount", key: "wf.des.condFieldLedger" },
  { id: "subsidiaryAccount", key: "wf.des.condFieldSubsidiary" },
  { id: "detailType", key: "wf.des.condFieldDetailType" },
  { id: "detailItem", key: "wf.des.condFieldDetailItem" },
];
/** t191 — عملگرهای یکسان برای همهٔ فرم‌ها (فرمان مالک): شامل، بزرگتر از،
 * کوچکتر از، برابر با، شامل نباشد، خالی باشد، خالی نباشد. */
const COND_OPS: Array<{ id: CondOp; key: string }> = [
  { id: "contains", key: "wf.des.opContains" },
  { id: "gt", key: "wf.des.opGt" },
  { id: "lt", key: "wf.des.opLt" },
  { id: "eq", key: "wf.des.opEq" },
  { id: "notContains", key: "wf.des.opNotContains" },
  { id: "empty", key: "wf.des.opEmpty" },
  { id: "notEmpty", key: "wf.des.opNotEmpty" },
];
/** فیلدهایی که مقدارشان از دراپ‌داون دادهٔ واقعی می‌آید (t191) */
const COND_SELECT_FIELDS = new Set([
  "voucherType",
  "accountGroup",
  "ledgerAccount",
  "subsidiaryAccount",
  "detailType",
  "detailItem",
]);

const EMPTY_CONDS: WfCond[] = [];
const EMPTY_REFS = {
  voucherTypes: [] as RefOption[],
  accountGroups: [] as RefOption[],
  ledgerAccounts: [] as RefOption[],
  subsidiaryAccounts: [] as RefOption[],
  detailTypes: [] as RefOption[],
  detailItems: [] as RefOption[],
};

/** شرط خالی نو برای «افزودن شرط» — پیش‌فرض: مبلغ بزرگتر از آستانهٔ فرم (D-2) */
const newCond = (): WfCond => ({ field: "amount", op: "gt", value: "threshold", join: "and" });

const NODE_STYLE: Record<GNode["nodeType"], { chip: string; border: string; icon: React.ReactNode }> = {
  start: {
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    border: "border-s-emerald-600",
    icon: <PlayGlyph />,
  },
  action: {
    chip: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300",
    border: "border-s-cyan-600",
    icon: <Workflow className="h-3 w-3" aria-hidden />,
  },
  condition: {
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    border: "border-s-amber-500",
    icon: <Split className="h-3 w-3" aria-hidden />,
  },
  end: {
    chip: "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200",
    border: "border-s-stone-500",
    icon: <CircleStop className="h-3 w-3" aria-hidden />,
  },
};

function PlayGlyph() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden>
      <path d="M2 1.5v9l8-4.5-8-4.5z" />
    </svg>
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");
/** امروز به میلادی ISO — مبدأ «تاریخ روز» مودال خاتمه (نمایش در تقویم زبان). */
const todayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
};

/* ------------------------------ کامپوننت ------------------------------ */

export function WorkflowDesignerForm() {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "workflow-designer")?.maximized ?? false,
  );

  /* داده‌های پایه */
  const [catalog, setCatalog] = React.useState<CatalogItem[]>([]);
  const [defs, setDefs] = React.useState<DefItem[]>([]);
  const [roles, setRoles] = React.useState<RoleItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  /* t190 — نسخهٔ فهرست فرآیندها برای remount تب ایستا (الگوی loadedKey) */
  const [defsStamp, setDefsStamp] = React.useState(0);

  /* ① فرمِ برگزیده از دراپ‌داون «لیست فرم‌ها» */
  const [selEntityType, setSelEntityType] = React.useState<string | null>(null);
  const [toggling, setToggling] = React.useState(false);

  /* فرآیند جاری (متا) */
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<DefDetail | null>(null);
  const [graphLoading, setGraphLoading] = React.useState(false);
  const [values, setValues] = React.useState({
    code: "",
    name: "",
    threshold: "",
    description: "",
  });
  const [metaDirty, setMetaDirty] = React.useState(false);
  const [busyId, setBusyId] = React.useState<number | null>(null);

  /* طراح بوم */
  const [nodes, setNodes] = React.useState<GNode[]>([]);
  const [transitions, setTransitions] = React.useState<GTrans[]>([]);
  const [selNode, setSelNode] = React.useState<string | null>(null);
  const [selTrans, setSelTrans] = React.useState<number | null>(null);
  const [connectMode, setConnectMode] = React.useState(false);
  const [connectFrom, setConnectFrom] = React.useState<string | null>(null);
  const [canvasDirty, setCanvasDirty] = React.useState(false);
  const [savingGraph, setSavingGraph] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  /* مودال خاتمهٔ فرآیند (t190) */
  const [termOpen, setTermOpen] = React.useState(false);
  const [termDate, setTermDate] = React.useState("");
  const [termNote, setTermNote] = React.useState("");
  const [terminating, setTerminating] = React.useState(false);
  const [reinstating, setReinstating] = React.useState(false);

  /* t191 — شرط‌های ورود (فیلترها) + گزینه‌های مرجع دراپ‌داون‌ها */
  const [conds, setConds] = React.useState<WfCond[]>(EMPTY_CONDS);
  const [condsDirty, setCondsDirty] = React.useState(false);
  const [savingConds, setSavingConds] = React.useState(false);
  const [refOpts, setRefOpts] = React.useState(EMPTY_REFS);
  const [refsLoaded, setRefsLoaded] = React.useState(false);

  useTabDirty(metaDirty || canvasDirty || condsDirty);

  const nodesRef = React.useRef<GNode[]>(nodes);
  React.useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  const posRef = React.useRef<Record<string, { x: number; y: number }>>({});
  const innerRef = React.useRef<HTMLDivElement | null>(null);

  const selForm = catalog.find((c) => c.entityType === selEntityType) ?? null;
  const isVoucherForm = selEntityType === "voucher"; // t191 — سند حسابداری: فیلترهای حسابداری
  /** فیلدهای شرط بر اساس فرم برگزیده: عمومی + حسابداری فقط برای سند */
  const condFields = React.useMemo(
    () => (isVoucherForm ? [...COND_FIELDS_BASE, ...COND_FIELDS_VOUCHER] : COND_FIELDS_BASE),
    [isVoucherForm],
  );
  const defsOfForm = React.useMemo(
    () => (selEntityType ? defs.filter((d) => d.entityType === selEntityType) : []),
    [defs, selEntityType],
  );
  /* t190 — خاتمه‌یافته = فقط-خواندنی (فرمان مالک)؛ نسخهٔ در استفاده هم قطعی است (FR-01) */
  const isTerminated = !!detail?.isTerminated;
  const metaEditable = selEntityType != null && !isTerminated;
  const canvasEditable = !!detail && !detail.usedByInstances && !detail.isTerminated;

  /* ------------------------------ واکشی ------------------------------ */

  const fetchCatalog = React.useCallback(async () => {
    const res = await wf.get<{ items: CatalogItem[] }>("workflow-catalog");
    return res.items ?? [];
  }, []);

  const fetchDefs = React.useCallback(async () => {
    const res = await wf.get<{ items: DefItem[] }>("workflow-definitions");
    return res.items ?? [];
  }, []);

  const fetchRoles = React.useCallback(async () => {
    try {
      const res = await wf.get<{ items: RoleItem[] }>("workflow-roles");
      return res.items ?? [];
    } catch {
      return [];
    }
  }, []);

  const refreshAll = React.useCallback(async () => {
    setLoading(true);
    const [cat, dd, rr] = await Promise.all([fetchCatalog(), fetchDefs(), fetchRoles()]);
    setCatalog(cat);
    setDefs(dd);
    setRoles(rr);
    setDefsStamp((s) => s + 1);
    setLoading(false);
  }, [fetchCatalog, fetchDefs, fetchRoles]);

  const refreshDefs = React.useCallback(async () => {
    const dd = await fetchDefs().catch(() => [] as DefItem[]);
    setDefs(dd);
    setDefsStamp((s) => s + 1);
    return dd;
  }, [fetchDefs]);

  /* t191 — گزینه‌های مرجع فیلترهای حسابداری: یکبار برای کل عمر پنجره، فقط
   * وقتی فرم «سند حسابداری» برگزیده شده واکشی می‌شود (سبک‌ماندن سایر فرم‌ها). */
  React.useEffect(() => {
    if (!isVoucherForm || refsLoaded) return;
    let alive = true;
    const load = async () => {
      const [vt, at, dt, di] = await Promise.all([
        stApi
          .get<{ items: Array<{ code: string; title: string; isActive: boolean; isSystem?: boolean }> }>(
            "voucher-type",
          )
          .catch(() => ({ items: [] })),
        stApi
          .get<{ items: Array<{ code: string; title: string; level: number; isActive: boolean }> }>(
            "account-tree",
          )
          .catch(() => ({ items: [] })),
        stApi
          .get<{ items: Array<{ code: string; title: string; isActive: boolean }> }>("detail-type")
          .catch(() => ({ items: [] })),
        stApi
          .get<{ items: Array<{ code: string; title: string; isActive: boolean }> }>("detail-items")
          .catch(() => ({ items: [] })),
      ]);
      if (!alive) return;
      const opt = (r: { code: string; title: string }): RefOption => ({
        code: r.code,
        title: r.title,
      });
      const nodes = at.items ?? [];
      setRefOpts({
        voucherTypes: (vt.items ?? []).filter((r) => r.isActive !== false).map(opt),
        accountGroups: nodes.filter((r) => r.level === 1 && r.isActive !== false).map(opt),
        ledgerAccounts: nodes.filter((r) => r.level === 2 && r.isActive !== false).map(opt),
        subsidiaryAccounts: nodes.filter((r) => r.level === 3 && r.isActive !== false).map(opt),
        detailTypes: (dt.items ?? []).filter((r) => r.isActive !== false).map(opt),
        detailItems: (di.items ?? []).filter((r) => r.isActive !== false).map(opt),
      });
      setRefsLoaded(true);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [isVoucherForm, refsLoaded]);

  /* بارگذاری اولیه — setState فقط در callbackهای async (نه sync در بدنهٔ effect) */
  React.useEffect(() => {
    let alive = true;
    Promise.all([fetchCatalog(), fetchDefs(), fetchRoles()]).then(
      ([cat, dd, rr]) => {
        if (!alive) return;
        setCatalog(cat);
        setDefs(dd);
        setRoles(rr);
        setDefsStamp((s) => s + 1);
        setLoading(false);
      },
      () => {
        if (alive) setLoading(false);
      },
    );
    return () => {
      alive = false;
    };
  }, [fetchCatalog, fetchDefs, fetchRoles]);

  /* ------------------------------ انتخاب فرم / بازکردن فرآیند ------------------------------ */

  /** ① کاربر از دراپ‌داون «لیست» فرمی را برمی‌گزیند — فرآیندهای همان فرم
   *  در تب «فرآیندها» می‌آید و فیلدها برای ثبت فرآیند تازهٔ همان فرم خالی می‌شود. */
  const selectForm = React.useCallback(
    (entityType: string) => {
      if (entityType === selEntityType) return;
      setSelEntityType(entityType);
      setCurrentId(null);
      setDetail(null);
      setNodes([]);
      setTransitions([]);
      setSelNode(null);
      setSelTrans(null);
      setConnectMode(false);
      setConnectFrom(null);
      setErrors([]);
      setMetaDirty(false);
      setCanvasDirty(false);
      setValues({ code: "", name: "", threshold: "", description: "" });
      setConds(EMPTY_CONDS); // t191 — شرط‌های فرم قبلی نمی‌ماند
      setCondsDirty(false);
      posRef.current = {};
    },
    [selEntityType],
  );

  const applyDetail = React.useCallback((d: DefDetail) => {
    const mapped: DefDetail = {
      ...d,
      nodes: d.nodes.map((n) => ({ ...n, nodeType: n.nodeType as GNode["nodeType"] })),
    };
    /* نگاشت ID گره → nodeCode برای گذارها (مرجع پایدار سمت کلاینت) */
    const idToCode = new Map(mapped.nodes.map((n) => [n.id, n.nodeCode]));
    setDetail({
      id: mapped.id,
      code: mapped.code,
      name: mapped.name,
      description: mapped.description,
      entityType: mapped.entityType,
      processVersion: mapped.processVersion,
      thresholdAmount: mapped.thresholdAmount,
      isActive: mapped.isActive,
      isTerminated: mapped.isTerminated,
      terminatedAt: mapped.terminatedAt,
      terminationNote: mapped.terminationNote,
      usedByInstances: mapped.usedByInstances,
      instanceCount: mapped.instanceCount,
      nodes: [],
      transitions: [],
    });
    /* t191 — شرط‌های ورود از سرور (نمایش/ویرایش مجدد) */
    setConds(Array.isArray(mapped.conditions) ? mapped.conditions : []);
    setCondsDirty(false);
    setNodes(
      mapped.nodes.map((n) => ({
        id: n.id,
        nodeCode: n.nodeCode,
        nodeType: n.nodeType as GNode["nodeType"],
        title: n.title,
        roleCode: n.roleCode,
        slaHours: n.slaHours,
        orderIndex: n.orderIndex,
        finalStatus: n.finalStatus,
        instanceState: n.instanceState,
        posX: n.posX,
        posY: n.posY,
      })),
    );
    setTransitions(
      mapped.transitions.map((tr) => ({
        id: tr.id,
        fromCode: idToCode.get(tr.fromNodeId) ?? "",
        toCode: idToCode.get(tr.toNodeId) ?? "",
        action: tr.action,
        conditionExpr: tr.conditionExpr,
        isDefault: tr.isDefault,
      })),
    );
    setValues({
      code: mapped.code,
      name: mapped.name,
      threshold: mapped.thresholdAmount == null ? "" : String(mapped.thresholdAmount),
      description: mapped.description,
    });
  }, []);

  const openDef = React.useCallback(
    async (id: number) => {
      setCurrentId(id);
      setGraphLoading(true);
      setSelNode(null);
      setSelTrans(null);
      setConnectMode(false);
      setConnectFrom(null);
      setErrors([]);
      setMetaDirty(false);
      setCanvasDirty(false);
      posRef.current = {};
      try {
        const d = await wf.get<DefDetail>(`workflow-definitions/${id}`);
        if (d.entityType !== selEntityType) setSelEntityType(d.entityType);
        applyDetail(d);
      } catch (e) {
        toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
        setCurrentId(null);
        setDetail(null);
      } finally {
        setGraphLoading(false);
      }
    },
    [applyDetail, selEntityType, t],
  );

  /** آیکون + اکشن بار = فرآیند جدید برای فرمِ برگزیده */
  const newProcess = React.useCallback(() => {
    if (!selEntityType) {
      toast.error(t("wf.des.errFormPick"));
      return;
    }
    setCurrentId(null);
    setDetail(null);
    setNodes([]);
    setTransitions([]);
    setSelNode(null);
    setSelTrans(null);
    setConnectMode(false);
    setConnectFrom(null);
    setErrors([]);
    setMetaDirty(false);
    setCanvasDirty(false);
    setValues({ code: "", name: "", threshold: "", description: "" });
    setConds(EMPTY_CONDS); // t191
    setCondsDirty(false);
    posRef.current = {};
  }, [selEntityType, t]);

  /* ------------------------------ ذخیرهٔ متا / حذف ------------------------------ */

  /** ذخیرهٔ «فیلدهای فرآیند» (اکشن بار): ثبت جدید (POST با دیاگرام آغازین)
   *  یا ویرایش متای رکورد جاری (PUT meta). نسخهٔ خاتمه‌یافته قفل است. */
  const doSave = async (): Promise<boolean> => {
    if (!selEntityType) {
      toast.error(t("wf.des.errFormPick"));
      return false;
    }
    if (!values.code.trim()) {
      toast.error(t("wf.des.errCodeRequired"));
      return false;
    }
    if (!values.name.trim()) {
      toast.error(t("wf.des.errNameRequired"));
      return false;
    }
    /* t191 — شرط‌های ناقص مانع کل ذخیره می‌شوند (آستانهٔ خالی/مقدار نامعتبر) */
    const condErr = validateConds();
    if (condErr) {
      toast.error(condErr);
      return false;
    }
    try {
      if (currentId == null) {
        const res = await wf.post<DefDetail>("workflow-definitions", {
          code: values.code.trim().toUpperCase(),
          name: values.name.trim(),
          entityType: selEntityType,
          description: values.description.trim(),
          thresholdAmount: values.threshold.trim()
            ? Number(normalizeDigits(values.threshold))
            : undefined,
          conditions: conds, // t191 — شرط‌ها همراه ثبت اولیه
        });
        toast.success(t("wf.des.createdToast"));
        await refreshDefs();
        await openDef(res.id);
        return true;
      }
      if (isTerminated) {
        toast.error(t("wf.des.terminatedReadOnlyToast"));
        return false;
      }
      const res = await wf.put<DefDetail>(`workflow-definitions/${currentId}`, {
        name: values.name.trim(),
        description: values.description.trim(),
        thresholdAmount: values.threshold.trim()
          ? Number(normalizeDigits(values.threshold))
          : null,
        conditions: conds, // t191 — شرط‌ها همراه «ذخیره اطلاعات» (یک کلیک، همه‌چیز)
      });
      toast.success(t("abar.savedToast"));
      applyDetail(res);
      setMetaDirty(false);
      void refreshDefs();
      return true;
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
      return false;
    }
  };

  const doDelete = async (): Promise<void> => {
    if (currentId == null) {
      toast.info(t("dfb.noRecordSelected"));
      return;
    }
    if (isTerminated) {
      toast.error(t("wf.des.terminatedReadOnlyToast"));
      return;
    }
    setBusyId(currentId);
    try {
      await wf.del(`workflow-definitions/${currentId}`);
      toast.success(t("wf.des.deletedToast"));
      setCurrentId(null);
      setDetail(null);
      setNodes([]);
      setTransitions([]);
      setValues({ code: "", name: "", threshold: "", description: "" });
      setConds(EMPTY_CONDS); // t191
      setCondsDirty(false);
      setMetaDirty(false);
      setCanvasDirty(false);
      await refreshDefs();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setBusyId(null);
    }
  };

  /* ------------------------------ مشارکت فرم (کاتالوگ) ------------------------------ */

  const toggleParticipation = async (value: boolean) => {
    if (!selEntityType || !selForm) return;
    setToggling(true);
    try {
      await wf.put(`workflow-catalog/${encodeURIComponent(selEntityType)}`, {
        participates: value,
      });
      toast.success(value ? t("wf.des.enrolledToast") : t("wf.des.unenrolledToast"));
      await refreshAll();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setToggling(false);
    }
  };

  /* ------------------------------ فعال‌سازی / نسخهٔ جدید (نوار بوم) ------------------------------ */

  const doActivate = async (d: DefDetail) => {
    setBusyId(d.id);
    try {
      await wf.post<DefDetail>(`workflow-definitions/${d.id}/activate`, {});
      toast.success(t("wf.des.activatedToast"));
      await refreshAll();
      await openDef(d.id);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setBusyId(null);
    }
  };

  const doNewVersion = async (d: DefDetail) => {
    setBusyId(d.id);
    try {
      const res = await wf.post<DefDetail>(`workflow-definitions/${d.id}/versions`, {});
      toast.success(`${t("wf.des.versionCreatedToast")} — v${res.processVersion}`);
      await refreshDefs();
      await openDef(res.id);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setBusyId(null);
    }
  };

  /* ------------------------------ خاتمه / برگشت خاتمه (t190) ------------------------------ */

  const openTerminate = () => {
    if (currentId == null || !detail) {
      toast.info(t("dfb.noRecordSelected"));
      return;
    }
    /* پیش‌فرض مودال: تاریخ روز (در تقویم زبان انتخابی) */
    setTermDate(storedToDisplayDate(todayISO(), locale));
    setTermNote("");
    setTermOpen(true);
  };

  const doTerminate = async () => {
    if (currentId == null || !detail) return;
    const iso = displayToStoredDate(termDate, locale, normalizeDigits);
    if (!iso) {
      toast.error(t("wf.des.termDateInvalid"));
      return;
    }
    setTerminating(true);
    try {
      const res = await wf.put<DefDetail>(`workflow-definitions/${currentId}/terminate`, {
        terminatedAt: iso,
        note: termNote.trim(),
      });
      toast.success(t("wf.des.terminatedToast"));
      setTermOpen(false);
      applyDetail(res);
      setMetaDirty(false);
      setCanvasDirty(false);
      await refreshDefs();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setTerminating(false);
    }
  };

  const doReinstate = async () => {
    if (currentId == null || !detail) return;
    setReinstating(true);
    try {
      const res = await wf.put<DefDetail>(`workflow-definitions/${currentId}/reinstate`, {});
      toast.success(t("wf.des.reinstatedToast"));
      applyDetail(res);
      setMetaDirty(false);
      setCanvasDirty(false);
      await refreshDefs();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setReinstating(false);
    }
  };

  /* ------------------------------ شرط‌های ورود (t191) ------------------------------ */

  const addCond = () => {
    if (!metaEditable) return;
    setConds((prev) => [...prev, newCond()]);
    setCondsDirty(true);
  };

  const updateCond = (idx: number, patch: Partial<WfCond>) => {
    if (!metaEditable) return;
    setConds((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
    setCondsDirty(true);
  };

  const delCond = (idx: number) => {
    if (!metaEditable) return;
    setConds((prev) => prev.filter((_, i) => i !== idx));
    setCondsDirty(true);
  };

  /** اعتبارسنجی سمت کلاینت شرط‌ها — پیام اولین خطا (سرور هم دوباره می‌سنجد) */
  const validateConds = (): string | null => {
    for (const c of conds) {
      if (!c.field) return t("wf.des.errCondInvalid");
      const noValue = c.op === "empty" || c.op === "notEmpty";
      if (!noValue && !c.value.trim()) return t("wf.des.errCondInvalid");
      if (c.field === "amount" && c.value === "threshold" && !values.threshold.trim()) {
        return t("wf.des.condThresholdMissing");
      }
      if (
        c.field === "amount" &&
        c.value !== "threshold" &&
        c.value.trim() &&
        Number.isNaN(Number(normalizeDigits(c.value)))
      ) {
        return t("wf.des.errCondAmountNumber");
      }
    }
    return null;
  };

  /**
   * ذخیرهٔ مستقل شرط‌ها (دکمهٔ کارت شرط‌ها). برای رکورد ذخیره‌نشده (ثبت جدید)،
   * شرط‌ها با «ذخیره اطلاعات» همان اکشن بار در POST ثبت اولیه می‌روند.
   */
  const doSaveConds = async (): Promise<void> => {
    if (!selEntityType) {
      toast.error(t("wf.des.errFormPick"));
      return;
    }
    if (isTerminated) {
      toast.error(t("wf.des.terminatedReadOnlyToast"));
      return;
    }
    if (currentId == null) {
      /* رکورد هنوز ذخیره نشده — کاربر به ذخیرهٔ اصلی هدایت می‌شود */
      const err = validateConds();
      if (err) {
        toast.error(err);
        return;
      }
      toast.info(t("wf.des.condSaveViaMainSave"));
      return;
    }
    const err = validateConds();
    if (err) {
      toast.error(err);
      return;
    }
    setSavingConds(true);
    try {
      const res = await wf.put<DefDetail>(`workflow-definitions/${currentId}/conditions`, {
        conditions: conds,
      });
      applyDetail(res);
      setCondsDirty(false);
      toast.success(t("wf.des.condSavedToast"));
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setSavingConds(false);
    }
  };

  /* ------------------------------ درگ گره‌ها ------------------------------ */

  const beginDrag = (e: React.PointerEvent, node: GNode) => {
    if (e.button !== 0) return;
    const inner = innerRef.current;
    if (!inner) return;
    const rect = inner.getBoundingClientRect();
    const offX = e.clientX - rect.left - node.posX;
    const offY = e.clientY - rect.top - node.posY;
    let moved = false;
    const onMove = (ev: PointerEvent) => {
      moved = true;
      const r2 = inner.getBoundingClientRect();
      const nx = Math.max(0, Math.min(2600, Math.round((ev.clientX - r2.left - offX) / SNAP) * SNAP));
      const ny = Math.max(0, Math.min(1800, Math.round((ev.clientY - r2.top - offY) / SNAP) * SNAP));
      posRef.current[node.nodeCode] = { x: nx, y: ny };
      setNodes((prev) =>
        prev.map((n) => (n.nodeCode === node.nodeCode ? { ...n, posX: nx, posY: ny } : n)),
      );
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (moved) void persistLayout();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    e.preventDefault();
  };

  /** ذخیرهٔ ساکتِ مختصات — حتی برای نسخهٔ در استفاده/خاتمه‌یافته (صرفاً نمایشی). */
  const persistLayout = async () => {
    if (!currentId) return;
    const positions = nodesRef.current
      .filter((n) => typeof n.id === "number")
      .map((n) => ({
        nodeId: n.id as number,
        posX: posRef.current[n.nodeCode]?.x ?? n.posX,
        posY: posRef.current[n.nodeCode]?.y ?? n.posY,
      }));
    if (!positions.length) return;
    try {
      await wf.put(`workflow-definitions/${currentId}/layout`, { positions });
    } catch {
      /* جابجایی نمایشی است — خطا ساکت نادیده گرفته می‌شود */
    }
  };

  /* ------------------------------ گره‌ها و گذارها ------------------------------ */

  const addNode = (type: "action" | "condition" | "end") => {
    if (!canvasEditable) return;
    const maxN = nodes.reduce((m, x) => {
      const mt = /^N(\d+)$/.exec(x.nodeCode);
      return mt ? Math.max(m, Number(mt[1])) : m;
    }, 0);
    const code = `N${maxN + 1}`;
    const maxY = nodes.reduce((m, x) => Math.max(m, x.posY), 0);
    const maxX = nodes.reduce((m, x) => Math.max(m, x.posX), 0);
    const node: GNode = {
      nodeCode: code,
      nodeType: type,
      title:
        type === "action"
          ? t("wf.des.newActionTitle")
          : type === "condition"
            ? t("wf.des.newConditionTitle")
            : t("wf.des.newEndTitle"),
      roleCode: type === "action" ? (roles.find((r) => r.isActive)?.code ?? "") : "",
      slaHours: type === "action" ? 24 : null,
      orderIndex: nodes.length + 1,
      finalStatus: type === "end" ? 3 : null,
      instanceState: type === "end" ? "approved" : "",
      posX: Math.min(1400, maxX + SNAP * 3),
      posY: Math.min(1600, maxY + 120),
    };
    setNodes((prev) => [...prev, node]);
    setSelNode(code);
    setSelTrans(null);
    setCanvasDirty(true);
  };

  const updateNode = (code: string, patch: Partial<GNode>) => {
    if (!canvasEditable) return;
    setNodes((prev) => prev.map((n) => (n.nodeCode === code ? { ...n, ...patch } : n)));
    setCanvasDirty(true);
  };

  const delNode = (code: string) => {
    if (!canvasEditable) return;
    const n = nodes.find((x) => x.nodeCode === code);
    if (!n || n.nodeType === "start") {
      toast.error(t("wf.des.errStartDelete"));
      return;
    }
    setNodes((prev) => prev.filter((x) => x.nodeCode !== code));
    setTransitions((prev) => prev.filter((tr) => tr.fromCode !== code && tr.toCode !== code));
    if (selNode === code) setSelNode(null);
    setCanvasDirty(true);
  };

  const onNodeClick = (code: string) => {
    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(code);
        return;
      }
      if (connectFrom === code) {
        toast.info(t("wf.des.connectSelf"));
        return;
      }
      const from = nodes.find((n) => n.nodeCode === connectFrom);
      if (!from) {
        setConnectFrom(null);
        return;
      }
      const action =
        from.nodeType === "start" ? "ارسال به رسیدگی" : from.nodeType === "condition" ? "بله" : "تایید";
      if (transitions.some((tr) => tr.fromCode === connectFrom && tr.toCode === code && tr.action === action)) {
        toast.error(t("wf.des.dupTransition"));
        return;
      }
      const nt: GTrans = {
        fromCode: connectFrom,
        toCode: code,
        action,
        conditionExpr: from.nodeType === "condition" ? "amount > threshold" : "",
        isDefault: false,
      };
      setTransitions((prev) => {
        const next = [...prev, nt];
        setSelTrans(next.length - 1);
        return next;
      });
      setSelNode(null);
      setConnectFrom(null);
      setConnectMode(false);
      setCanvasDirty(true);
      return;
    }
    setSelNode(code);
    setSelTrans(null);
  };

  const updateTrans = (idx: number, patch: Partial<GTrans>) => {
    if (!canvasEditable) return;
    setTransitions((prev) => {
      const next = prev.map((tr, i) => (i === idx ? { ...tr, ...patch } : tr));
      /* شاخهٔ پیش‌فرضِ یکتا per گرهٔ شرط */
      if (patch.isDefault === true && next[idx]) {
        const from = next[idx].fromCode;
        return next.map((tr, i) =>
          i !== idx && tr.fromCode === from ? { ...tr, isDefault: false } : tr,
        );
      }
      return next;
    });
    setCanvasDirty(true);
  };

  const delTrans = (idx: number) => {
    if (!canvasEditable) return;
    setTransitions((prev) => prev.filter((_, i) => i !== idx));
    setSelTrans(null);
    setCanvasDirty(true);
  };

  /* ------------------------------ اعتبارسنجی سمت کلاینت ------------------------------ */

  const clientValidate = (): string[] => {
    const errs: string[] = [];
    const starts = nodes.filter((n) => n.nodeType === "start");
    const ends = nodes.filter((n) => n.nodeType === "end");
    if (nodes.some((n) => !n.title.trim())) errs.push(t("wf.des.errTitles"));
    if (starts.length !== 1) errs.push(t("wf.des.errOneStart"));
    if (ends.length < 1) errs.push(t("wf.des.errNeedEnd"));
    const byCode = new Map(nodes.map((n) => [n.nodeCode, n]));
    for (const tr of transitions) {
      if (!byCode.has(tr.fromCode) || !byCode.has(tr.toCode)) errs.push(t("wf.des.errDangling"));
      if (tr.fromCode === tr.toCode) errs.push(t("wf.des.errSelfLoop"));
      if (!ACTION_OPTIONS.includes(tr.action)) errs.push(t("wf.des.errAction"));
    }
    if (starts.length === 1) {
      const outs = transitions.filter((tr) => tr.fromCode === starts[0].nodeCode);
      if (outs.length !== 1 || outs[0].action !== "ارسال به رسیدگی")
        errs.push(t("wf.des.errStartOut"));
    }
    for (const n of nodes.filter((x) => x.nodeType === "action")) {
      const outs = transitions.filter((tr) => tr.fromCode === n.nodeCode);
      if (!n.roleCode) errs.push(t("wf.des.errRoleRequired"));
      if (!outs.some((tr) => tr.action === "تایید")) errs.push(`${t("wf.des.errNoApprove")} — ${n.title}`);
      for (const tr of outs.filter((x) => x.action === "رد")) {
        const target = byCode.get(tr.toCode);
        if (!target || target.nodeType !== "end" || target.instanceState !== "rejected")
          errs.push(`${t("wf.des.errRejectTarget")} — ${n.title}`);
      }
    }
    for (const n of nodes.filter((x) => x.nodeType === "condition")) {
      const outs = transitions.filter((tr) => tr.fromCode === n.nodeCode);
      if (outs.length < 2) errs.push(`${t("wf.des.errCondBranches")} — ${n.title}`);
      if (outs.filter((tr) => tr.isDefault).length !== 1)
        errs.push(`${t("wf.des.errCondDefault")} — ${n.title}`);
      for (const tr of outs.filter((x) => !x.isDefault)) {
        if (!CONDITION_RE.test(tr.conditionExpr.trim()))
          errs.push(`${t("wf.des.errCondExpr")} — ${n.title}`);
      }
    }
    for (const n of ends) {
      if (n.finalStatus === null) errs.push(`${t("wf.des.errEndStatus")} — ${n.title}`);
      if (n.instanceState !== "approved" && n.instanceState !== "rejected")
        errs.push(`${t("wf.des.errEndState")} — ${n.title}`);
      if (
        n.instanceState === "rejected" &&
        n.finalStatus !== null &&
        Number(n.finalStatus) !== 1
      )
        errs.push(`${t("wf.des.errRejectStatus")} — ${n.title}`);
      if (transitions.some((tr) => tr.fromCode === n.nodeCode))
        errs.push(`${t("wf.des.errEndOut")} — ${n.title}`);
    }
    /* دسترس‌پذیری از شروع */
    if (starts.length === 1) {
      const adj = new Map<string, string[]>();
      for (const tr of transitions) {
        if (!adj.has(tr.fromCode)) adj.set(tr.fromCode, []);
        adj.get(tr.fromCode)!.push(tr.toCode);
      }
      const seen = new Set([starts[0].nodeCode]);
      const q = [starts[0].nodeCode];
      while (q.length) {
        const cur = q.shift()!;
        for (const nxt of adj.get(cur) ?? [])
          if (!seen.has(nxt)) {
            seen.add(nxt);
            q.push(nxt);
          }
      }
      for (const n of nodes)
        if (!seen.has(n.nodeCode)) errs.push(`${t("wf.des.errUnreachable")} — ${n.title}`);
    }
    const seenKeys = new Set<string>();
    for (const tr of transitions) {
      const key = `${tr.fromCode}|${tr.toCode}|${tr.action}`;
      if (seenKeys.has(key)) errs.push(t("wf.des.errDupTrans"));
      seenKeys.add(key);
    }
    return errs;
  };

  /* ------------------------------ ذخیرهٔ دیاگرام ------------------------------ */

  const doSaveGraph = async (): Promise<void> => {
    if (!currentId || !detail) return;
    if (isTerminated) {
      toast.error(t("wf.des.terminatedReadOnlyToast"));
      return;
    }
    if (!canvasEditable) {
      toast.error(t("wf.des.readonlyToast"));
      return;
    }
    const errs = clientValidate();
    setErrors(errs);
    if (errs.length > 0) {
      toast.error(t("wf.des.invalidToast"));
      return;
    }
    setSavingGraph(true);
    try {
      const res = await wf.put<DefDetail>(`workflow-definitions/${currentId}/graph`, {
        nodes: nodes.map((n, i) => ({
          nodeCode: n.nodeCode,
          nodeType: n.nodeType,
          title: n.title.trim(),
          roleCode: n.roleCode,
          slaHours: n.slaHours,
          orderIndex: n.orderIndex ?? i + 1,
          finalStatus: n.finalStatus,
          instanceState: n.instanceState,
          posX: n.posX,
          posY: n.posY,
        })),
        transitions: transitions.map((tr) => ({
          fromCode: tr.fromCode,
          toCode: tr.toCode,
          action: tr.action,
          conditionExpr: tr.conditionExpr.trim(),
          isDefault: tr.isDefault,
        })),
      });
      applyDetail(res);
      setCanvasDirty(false);
      posRef.current = {};
      toast.success(t("wf.des.savedToast"));
      void refreshDefs();
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      setErrors([msg]);
      toast.error(msg);
    } finally {
      setSavingGraph(false);
    }
  };

  /* ------------------------------ هندسهٔ بوم ------------------------------ */

  const edgeGeom = (a: GNode, b: GNode) => {
    if (b.posY > a.posY + 24) {
      const x1 = a.posX + NODE_W / 2;
      const y1 = a.posY + NODE_H;
      const x2 = b.posX + NODE_W / 2;
      const y2 = b.posY;
      return {
        d: `M ${x1} ${y1} C ${x1} ${y1 + 48}, ${x2} ${y2 - 48}, ${x2} ${y2}`,
        mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
      };
    }
    if (b.posX >= a.posX) {
      const x1 = a.posX + NODE_W;
      const y1 = a.posY + NODE_H / 2;
      const x2 = b.posX;
      const y2 = b.posY + NODE_H / 2;
      return {
        d: `M ${x1} ${y1} C ${x1 + 48} ${y1}, ${x2 - 48} ${y2}, ${x2} ${y2}`,
        mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
      };
    }
    const x1 = a.posX;
    const y1 = a.posY + NODE_H / 2;
    const x2 = b.posX + NODE_W;
    const y2 = b.posY + NODE_H / 2;
    return {
      d: `M ${x1} ${y1} C ${x1 - 48} ${y1}, ${x2 + 48} ${y2}, ${x2} ${y2}`,
      mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
    };
  };

  const canvasW = Math.max(1000, nodes.reduce((m, n) => Math.max(m, n.posX + NODE_W), 0) + 120);
  const canvasH = Math.max(560, nodes.reduce((m, n) => Math.max(m, n.posY + NODE_H), 0) + 100);

  const nodeByCode = React.useMemo(() => new Map(nodes.map((n) => [n.nodeCode, n])), [nodes]);
  const selNodeObj = selNode ? nodeByCode.get(selNode) ?? null : null;

  /* ------------------------------ ترجمهٔ رکورد (t187 — در همهٔ فرم‌ها) ------------------------------ */

  const recordTr = useRecordTranslation({
    entityType: "WorkflowDefinition",
    entityId: currentId,
    getFields: (): DataTranslationField[] => {
      const out: DataTranslationField[] = [];
      const push = (key: string, label: string, value: string) => {
        const v = value.trim();
        if (v) out.push({ key, label, value: v });
      };
      push("name", t("wf.des.defName"), values.name);
      push("description", t("common.description"), values.description);
      return out;
    },
    onTranslated: () => {
      void refreshDefs();
    },
  });

  /* ------------------------------ فیلدها / تب / لیست ------------------------------ */

  const onFieldChange = React.useCallback(
    (id: string, value: string | boolean) => {
      /* مشارکت فرم = سطح کاتالوگ، مستقل از فرآیند (حتی برای فرآیند
         خاتمه‌یافته آزاد است) — بیدرنگ اعمال می‌شود و dirty نمی‌کند */
      if (id === "participates") {
        void toggleParticipation(Boolean(value));
        return;
      }
      if (!metaEditable) return;
      setMetaDirty(true);
      if (id === "threshold") {
        if (typeof value === "string") {
          const num = normalizeDigits(value).replace(/[^0-9.]/g, "");
          setValues((v) => ({ ...v, threshold: num }));
        }
        return;
      }
      if (typeof value === "string") {
        setValues((v) => ({ ...v, [id]: value }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metaEditable, selEntityType, selForm],
  );

  const fields = React.useMemo<SimpleFormField[]>(
    () => [
      {
        id: "formTitle",
        label: t("wf.des.chooseForm"),
        value: selForm?.formTitle ?? "",
        disabled: true,
      },
      {
        id: "participates",
        label: t("wf.des.formParticipates"),
        type: "checkbox",
        checked: selForm?.participates ?? false,
        disabled: !selForm || !selForm.adapterReady || toggling,
      },
      {
        id: "code",
        label: t("wf.des.defCode"),
        required: true,
        value: values.code,
        ltr: true,
        disabled: !metaEditable || currentId != null,
      },
      {
        id: "name",
        label: t("wf.des.defName"),
        required: true,
        value: values.name,
        disabled: !metaEditable,
      },
      {
        id: "threshold",
        label: t("wf.des.threshold"),
        type: "number",
        value: values.threshold,
        ltr: true,
        disabled: !metaEditable,
      },
      {
        id: "description",
        label: t("common.description"),
        type: "textarea",
        value: values.description,
        disabled: !metaEditable,
      },
      {
        id: "processVersion",
        label: t("wf.des.versionLabel"),
        value: detail ? `v${detail.processVersion}` : "",
        disabled: true,
      },
      {
        id: "status",
        label: t("wf.des.statusLabel"),
        value: detail
          ? detail.isTerminated
            ? t("wf.des.terminatedBadge")
            : detail.isActive
              ? t("wf.des.activeBadge")
              : t("wf.des.inactiveBadge")
          : "",
        disabled: true,
      },
      {
        id: "terminatedAt",
        label: t("wf.des.termDate"),
        value: detail?.terminatedAt ? storedToDisplayDate(detail.terminatedAt, locale) : "",
        disabled: true,
      },
      {
        id: "terminationNote",
        label: t("wf.des.termNoteLabel"),
        value: detail?.terminationNote ?? "",
        disabled: true,
      },
    ],
    [t, selForm, values, metaEditable, currentId, detail, locale, toggling],
  );

  /* تب ایستای «فرآیندها» — ردیف‌ها آینهٔ سرورند (static: بدون نوار +/×/کپی)؛
     کلیک روی ردیف، فرآیند را در فیلدها و بوم باز می‌کند (onOpenRow). */
  const tabs = React.useMemo<SimpleFormTab[]>(
    () => [
      {
        id: "processes",
        label: t("wf.des.tabDefs"),
        kind: "grid",
        static: true,
        onOpenRow: (row) => {
          const id = Number(row.defId);
          if (Number.isFinite(id) && id > 0) void openDef(id);
        },
        columns: [
          { id: "code", label: t("wf.des.defCode"), minWidth: "min-w-32", readOnly: true },
          { id: "name", label: t("wf.des.defName"), minWidth: "min-w-48", readOnly: true },
          { id: "version", label: t("wf.des.versionLabel"), minWidth: "min-w-14", readOnly: true },
          { id: "active", label: t("fy.active"), minWidth: "min-w-16", readOnly: true },
          { id: "used", label: t("wf.des.colUsed"), minWidth: "min-w-16", readOnly: true },
          { id: "terminated", label: t("wf.des.colTerminated"), minWidth: "min-w-16", readOnly: true },
          {
            id: "terminatedAt",
            label: t("wf.des.colTerminatedAt"),
            minWidth: "min-w-28",
            readOnly: true,
          },
          { id: "nodeCount", label: t("wf.des.colNodes"), minWidth: "min-w-16", readOnly: true },
        ],
        rows: defsOfForm.map((d) => ({
          defId: String(d.id),
          code: d.code,
          name: d.name,
          version: `v${d.processVersion}`,
          active: d.isActive ? t("abar.listYes") : t("abar.listNo"),
          used: d.usedByInstances ? t("abar.listYes") : t("abar.listNo"),
          terminated: d.isTerminated ? t("abar.listYes") : t("abar.listNo"),
          terminatedAt: d.terminatedAt ? storedToDisplayDate(d.terminatedAt, locale) : "",
          nodeCount: String(d.nodeCount),
        })),
      },
    ],
    [t, defsOfForm, openDef, locale],
  );

  /* ① دراپ‌داون «لیست» — فهرست فرم‌های کاتالوگ گردش کار (فرمان مالک t190) */
  const listItems = React.useMemo(
    () =>
      catalog.map((c) => ({
        id: c.entityType,
        title: c.formTitle,
        subtitle: c.softwareName,
        cells: [
          { label: t("wf.des.chooseForm"), value: c.formTitle },
          { label: t("wf.des.colSoftware"), value: c.softwareName },
          {
            label: t("wf.des.formParticipates"),
            value: c.participates ? t("abar.listYes") : t("abar.listNo"),
          },
          {
            label: t("wf.des.activeDef"),
            value: c.activeDefinition
              ? `${c.activeDefinition.code} v${c.activeDefinition.processVersion}`
              : t("wf.des.noActiveDef"),
          },
          { label: t("wf.des.runningCount"), value: String(c.runningInstances) },
        ],
      })),
    [catalog, t],
  );

  /* ناوبری رکوردهای «|< < > >|» روی فرآیندهای فرمِ برگزیده */
  const currentIdx = defsOfForm.findIndex((d) => d.id === currentId);
  const nav = (i: number) => {
    const d = defsOfForm[i];
    if (d) void openDef(d.id);
  };

  /* یادداشت انتهای فرم (Task 149 — فقط در ناحیهٔ انتهایی) */
  const hint =
    selEntityType == null
      ? t("wf.des.formPickHint")
      : detail == null && !graphLoading
        ? t("wf.des.newDefHint")
        : null;

  /* remount شل وقتی فهرست فرآیندها/فرمِ برگزیده عوض می‌شود — ردیف‌های تب
     ایستا همیشه تازه (الگوی loadedKey فرم سمت‌ها) */
  const gridKey = `${selEntityType ?? "none"}|${defsStamp}`;

  /* ------------------------------ شرط‌ها: گزینه‌ها و ادیتور مقدار (t191) ------------------------------ */

  const optionsFor = (field: string): RefOption[] => {
    switch (field) {
      case "voucherType":
        return refOpts.voucherTypes;
      case "accountGroup":
        return refOpts.accountGroups;
      case "ledgerAccount":
        return refOpts.ledgerAccounts;
      case "subsidiaryAccount":
        return refOpts.subsidiaryAccounts;
      case "detailType":
        return refOpts.detailTypes;
      case "detailItem":
        return refOpts.detailItems;
      default:
        return [];
    }
  };

  /** ادیتور مقدار هر شرط — بر اساس فیلد: دراپ‌داون دادهٔ واقعی، ماهیت،
   *  مبلغ (عدد یا «آستانهٔ فرم»)، متن آزاد، یا بی‌مقدار (خالی باشد/نباشد). */
  const renderCondValue = (c: WfCond, i: number) => {
    const noValue = c.op === "empty" || c.op === "notEmpty";
    if (noValue) {
      return (
        <span className="text-[11px] text-muted-foreground" aria-label={t("wf.des.condValue")}>
          {t("wf.des.condNoValue")}
        </span>
      );
    }
    if (c.field === "voucherNature") {
      return (
        <Select
          value={c.value}
          disabled={!metaEditable}
          onValueChange={(v) => updateCond(i, { value: v })}
        >
          <SelectTrigger className="h-8" aria-label={t("wf.des.condValue")}>
            <SelectValue placeholder={t("wf.des.condValue")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{t("wf.des.natureNormal")}</SelectItem>
            <SelectItem value="2">{t("wf.des.natureLegal")}</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    if (COND_SELECT_FIELDS.has(c.field)) {
      const opts = optionsFor(c.field);
      const known = opts.some((o) => o.code === c.value);
      return (
        <Select
          value={c.value}
          disabled={!metaEditable}
          onValueChange={(v) => updateCond(i, { value: v })}
        >
          <SelectTrigger className="h-8" aria-label={t("wf.des.condValue")}>
            <SelectValue placeholder={t("wf.des.condValue")} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {opts.map((o) => (
              <SelectItem key={o.code} value={o.code}>
                {o.code} — {o.title}
              </SelectItem>
            ))}
            {c.value && !known && (
              <SelectItem value={c.value}>
                {c.value} — {t("wf.des.condSavedValue")}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    }
    if (c.field === "amount") {
      const useThreshold = c.value === "threshold";
      return (
        <div className="flex items-center gap-1.5">
          <Input
            value={useThreshold ? values.threshold : c.value}
            disabled={!metaEditable || useThreshold}
            onChange={(e) => {
              const num = normalizeDigits(e.target.value).replace(/[^0-9.]/g, "");
              updateCond(i, { value: num });
            }}
            className="h-8"
            dir="ltr"
            inputMode="decimal"
            aria-label={t("wf.des.condValue")}
            placeholder={useThreshold ? t("wf.des.condUseThreshold") : "0"}
          />
          <Button
            type="button"
            size="sm"
            variant={useThreshold ? "secondary" : "outline"}
            className={cn(
              "h-8 shrink-0 px-2 text-[10px]",
              useThreshold && "ring-2 ring-teal-500/60",
            )}
            disabled={!metaEditable}
            title={t("wf.des.condUseThreshold")}
            onClick={() => updateCond(i, { value: useThreshold ? "" : "threshold" })}
          >
            {t("wf.des.condUseThreshold")}
          </Button>
        </div>
      );
    }
    /* description و هر فیلد متنی دیگر */
    return (
      <Input
        value={c.value}
        disabled={!metaEditable}
        onChange={(e) => updateCond(i, { value: e.target.value })}
        className="h-8"
        aria-label={t("wf.des.condValue")}
      />
    );
  };

  /* ------------------------------ رندر ------------------------------ */

  return (
    <>
      {recordTr.dialog}
      <SimpleFormTwoRowTabbed
        key={gridKey}
        title={t("wf.des.title")}
        badge={t("wf.badge")}
        icon={<PencilRuler className="h-3.5 w-3.5" aria-hidden />}
        fields={fields}
        onFieldChange={onFieldChange}
        tabs={tabs}
        hint={hint}
        onFirst={() => nav(0)}
        onPrev={() => nav(Math.max(0, currentIdx - 1))}
        onNext={() => nav(Math.min(defsOfForm.length - 1, currentIdx + 1))}
        onLast={() => nav(defsOfForm.length - 1)}
        onReset={newProcess}
        onSave={() => void doSave()}
        onSaveNew={async () => {
          if (await doSave()) newProcess();
        }}
        onCopy={() => {
          /* فرآیند جدید با همان متا و شرط‌ها — کد پاک می‌شود (فرمِ برگزیده حفظ می‌شود) */
          setCurrentId(null);
          setDetail(null);
          setNodes([]);
          setTransitions([]);
          setSelNode(null);
          setSelTrans(null);
          setCanvasDirty(false);
          setMetaDirty(false);
          setCondsDirty(false); // t191 — شرط‌ها می‌مانند (کپی)
          setErrors([]);
          setValues((v) => ({ ...v, code: "" }));
          toast.success(t("abar.copyToast"));
        }}
        onDelete={doDelete}
        onDeleteNew={async () => {
          await doDelete();
          newProcess();
        }}
        onPrint={() => {
          toast.success(t("abar.printToast"));
        }}
        onClose={chrome?.onClose}
        onTranslateOnline={recordTr.translateOnline}
        onTranslateOffline={recordTr.openTranslateOffline}
        listItems={listItems}
        listLoading={loading}
        listActiveId={selEntityType}
        onListRefresh={async () => {
          await refreshAll();
        }}
        onOpenListItem={(item) => {
          selectForm(item.id);
          toast.success(t("abar.itemOpened"));
        }}
        canSave={metaEditable}
        canDelete={currentId != null && !isTerminated}
        barExtras={
          <>
            {/* t190 — آیکون «خاتمهٔ فرآیند» در اکشن بار: مودال تاریخ (پیش‌فرض
                امروز) + توضیحات؛ با تأیید، فرآیند خاتمه می‌یابد */}
            <ActionIconButton
              label={t("wf.des.terminate")}
              tint="from-rose-500 to-rose-600"
              icon={<CircleStop className="h-[18px] w-[18px]" aria-hidden />}
              disabled={currentId == null || isTerminated || terminating || graphLoading}
              onClick={openTerminate}
            />
            {/* t190 — آیکون «برگشت خاتمه»: قید خاتمه پاک و فیلدها آزاد می‌شود */}
            <ActionIconButton
              label={t("wf.des.reinstate")}
              tint="from-amber-500 to-amber-600"
              icon={<Undo2 className="h-[18px] w-[18px]" aria-hidden />}
              disabled={currentId == null || !isTerminated || reinstating || graphLoading}
              busy={reinstating}
              onClick={() => void doReinstate()}
            />
          </>
        }
        onHeaderClose={chrome?.onClose}
        onHeaderMinimize={chrome?.onMinimize}
        onHeaderMaximize={chrome?.onToggleMaximize}
        headerMaximized={headerMaximized}
        onHeaderDragStart={chrome?.onDragStart}
        onHeaderDragMove={chrome?.onDragMove}
        onHeaderDragEnd={chrome?.onDragEnd}
        onHeaderDoubleClick={chrome?.onDoubleClick}
      >
        {/* t191 — کارت «شرط‌های ورود» (فیلترها): برای فرآیند ذخیره‌شده و ثبتِ
            جدید هر دو؛ اتصال و/یا + عملگرهای یکسان + فیلترهای حسابداری برای
            فرم «سند حسابداری» */}
        {selEntityType != null && (
          <section className="px-4 pb-1 pt-3">
            <div className="rounded-xl border border-border/70 bg-card/60 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <ListFilter className="h-4 w-4 text-teal-700 dark:text-teal-300" aria-hidden />
                <span className="text-sm font-semibold">{t("wf.des.condTitle")}</span>
                <span
                  className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground"
                  aria-label={t("wf.des.condCount")}
                >
                  {conds.length}
                </span>
                {condsDirty && !isTerminated && (
                  <span className="rounded-full bg-amber-600/10 px-1.5 py-0.5 text-[10px] text-amber-700 dark:text-amber-300">
                    {t("wf.des.unsavedBadge")}
                  </span>
                )}
                <div className="ms-auto flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    disabled={!metaEditable}
                    onClick={addCond}
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    {t("wf.des.condAdd")}
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 bg-teal-600 text-white hover:bg-teal-700"
                    disabled={!metaEditable || savingConds || !condsDirty}
                    onClick={() => void doSaveConds()}
                  >
                    {savingConds ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Save className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {t("wf.des.condSave")}
                  </Button>
                </div>
              </div>
              <p className="pt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                {t("wf.des.condHint")}
              </p>
              {!isVoucherForm && (
                <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground/80">
                  {t("wf.des.condNonVoucherNote")}
                </p>
              )}
              {isTerminated && (
                <p className="mt-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-[11px] text-rose-800 dark:text-rose-300">
                  {t("wf.des.condTerminatedNote")}
                </p>
              )}

              {conds.length === 0 ? (
                <p className="pt-2 text-xs text-muted-foreground">{t("wf.des.condEmpty")}</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {conds.map((c, i) => (
                    <div
                      key={i}
                      data-testid="wf-cond-row"
                      className="grid grid-cols-1 items-center gap-2 rounded-lg border border-border/50 bg-background/40 p-2 sm:grid-cols-[7.5rem_minmax(0,1fr)_minmax(0,11rem)_minmax(0,1fr)_2rem]"
                    >
                      {/* اتصال و/یا با شرط قبلی — ردیف اول فقط برچسب */}
                      {i > 0 ? (
                        <Select
                          value={c.join}
                          disabled={!metaEditable}
                          onValueChange={(v) => updateCond(i, { join: v as WfCond["join"] })}
                        >
                          <SelectTrigger className="h-8" aria-label={t("wf.des.condJoin")}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="and">{t("wf.des.joinAnd")}</SelectItem>
                            <SelectItem value="or">{t("wf.des.joinOr")}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="hidden text-[10px] font-medium text-muted-foreground sm:block">
                          {t("wf.des.condWhere")}
                        </span>
                      )}
                      {/* فیلد — هفت فیلتر حسابداری فقط برای سند حسابداری */}
                      <Select
                        value={c.field}
                        disabled={!metaEditable}
                        onValueChange={(v) =>
                          updateCond(i, { field: v, value: v === "amount" ? "threshold" : "" })
                        }
                      >
                        <SelectTrigger className="h-8" aria-label={t("wf.des.condField")}>
                          <SelectValue placeholder={t("wf.des.condField")} />
                        </SelectTrigger>
                        <SelectContent>
                          {condFields.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {t(f.key)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* عملگر — یکسان برای همهٔ فرم‌ها (فرمان مالک) */}
                      <Select
                        value={c.op}
                        disabled={!metaEditable}
                        onValueChange={(v) =>
                          updateCond(i, {
                            op: v as CondOp,
                            value: v === "empty" || v === "notEmpty" ? "" : c.value,
                          })
                        }
                      >
                        <SelectTrigger className="h-8" aria-label={t("wf.des.condOp")}>
                          <SelectValue placeholder={t("wf.des.condOp")} />
                        </SelectTrigger>
                        <SelectContent>
                          {COND_OPS.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {t(o.key)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* مقدار — ادیتور بر اساس فیلد */}
                      {renderCondValue(c, i)}
                      {/* حذف شرط */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={!metaEditable}
                        onClick={() => delCond(i)}
                        aria-label={t("common.delete")}
                      >
                        <Scissors className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ⑤ بوم طراح — اسلات children پوسته (زیر تب فرآیندها) */}
        {currentId != null && (
          <section className="px-4 pb-4 pt-3">
            {graphLoading ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                <Loader2 className="me-2 h-5 w-5 animate-spin" aria-hidden />
                {t("common.loading")}
              </div>
            ) : detail ? (
              <div className="flex flex-col gap-3">
                {/* نوار بالای بوم */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card/60 p-2.5">
                  <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                    {detail.code} v{detail.processVersion}
                  </span>
                  <span className="truncate text-sm font-semibold">{detail.name}</span>
                  {detail.isTerminated ? (
                    <span className="rounded-full bg-rose-600/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-300">
                      {t("wf.des.terminatedBadge")}
                    </span>
                  ) : detail.isActive ? (
                    <span className="rounded-full bg-teal-600/10 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">
                      {t("wf.des.activeBadge")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-600/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                      {t("wf.des.inactiveBadge")}
                    </span>
                  )}
                  {detail.usedByInstances && (
                    <span className="rounded-full bg-stone-600/10 px-1.5 py-0.5 text-[10px] font-medium text-stone-700 dark:text-stone-300">
                      {t("wf.des.usedBadge")}
                    </span>
                  )}
                  <div className="ms-auto flex flex-wrap items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={detail.isActive || detail.isTerminated || busyId === detail.id}
                      onClick={() => void doActivate(detail)}
                    >
                      {busyId === detail.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <BadgeOk />
                      )}
                      {t("wf.des.activate")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={busyId === detail.id}
                      onClick={() => void doNewVersion(detail)}
                    >
                      {t("wf.des.newVersion")}
                    </Button>
                    <Button
                      size="sm"
                      variant={connectMode ? "secondary" : "outline"}
                      className={cn("h-8", connectMode && "ring-2 ring-teal-500/60")}
                      disabled={!canvasEditable}
                      onClick={() => {
                        setConnectMode((v) => !v);
                        setConnectFrom(null);
                      }}
                    >
                      <Link2 className="h-3.5 w-3.5" aria-hidden />
                      {connectMode ? t("wf.des.connecting") : t("wf.des.connect")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={!canvasEditable}
                      onClick={() => addNode("action")}
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                      {t("wf.des.addNodeAction")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={!canvasEditable}
                      onClick={() => addNode("condition")}
                    >
                      <Split className="h-3.5 w-3.5" aria-hidden />
                      {t("wf.des.addNodeCondition")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={!canvasEditable}
                      onClick={() => addNode("end")}
                    >
                      <CircleStop className="h-3.5 w-3.5" aria-hidden />
                      {t("wf.des.addNodeEnd")}
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 bg-teal-600 text-white hover:bg-teal-700"
                      disabled={!canvasEditable || savingGraph || !canvasDirty}
                      onClick={() => void doSaveGraph()}
                    >
                      {savingGraph ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <Save className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {t("wf.des.save")}
                    </Button>
                  </div>
                </div>

                {detail.isTerminated && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-800 dark:text-rose-300">
                    {t("wf.des.terminatedBanner")}
                  </div>
                )}
                {detail.usedByInstances && !detail.isTerminated && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    {t("wf.des.usedBanner")}
                  </div>
                )}
                {connectMode && (
                  <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 p-2.5 text-xs text-teal-800 dark:text-teal-300">
                    {connectFrom
                      ? `${t("wf.des.connectTargetPick")}: ${nodeByCode.get(connectFrom)?.title ?? connectFrom}`
                      : t("wf.des.connectSourcePick")}
                  </div>
                )}
                {errors.length > 0 && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs">
                    <p className="mb-1 font-semibold">{t("wf.des.invalidTitle")}</p>
                    <ul className="list-inside list-disc space-y-0.5 text-destructive">
                      {errors.map((er, i) => (
                        <li key={i}>{er}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* بوم — LTR برای مختصات فیزیکی پایدار؛ محتوای گره‌ها RTL */}
                <div className="overflow-x-auto rounded-xl border border-border/70 scrollbar-slim">
                  <div
                    ref={innerRef}
                    dir="ltr"
                    className="relative select-none"
                    style={{
                      width: canvasW,
                      height: canvasH,
                      backgroundImage:
                        "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  >
                    {/* گذارها */}
                    <svg
                      className="pointer-events-none absolute inset-0"
                      width={canvasW}
                      height={canvasH}
                      aria-hidden
                    >
                      <defs>
                        <marker
                          id="wf-arrow"
                          viewBox="0 0 10 10"
                          refX="9"
                          refY="5"
                          markerWidth="7"
                          markerHeight="7"
                          orient="auto-start-reverse"
                        >
                          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-stone-400 dark:fill-stone-500" />
                        </marker>
                      </defs>
                      {transitions.map((tr, i) => {
                        const a = nodeByCode.get(tr.fromCode);
                        const b = nodeByCode.get(tr.toCode);
                        if (!a || !b) return null;
                        const g = edgeGeom(a, b);
                        const selected = selTrans === i;
                        return (
                          <g key={`${tr.fromCode}-${tr.toCode}-${i}`} className="pointer-events-auto cursor-pointer">
                            <path
                              d={g.d}
                              fill="none"
                              stroke="transparent"
                              strokeWidth={14}
                              onClick={() => {
                                setSelTrans(i);
                                setSelNode(null);
                              }}
                            />
                            <path
                              d={g.d}
                              fill="none"
                              strokeWidth={selected ? 2.5 : 1.5}
                              strokeDasharray={tr.isDefault ? "6 4" : undefined}
                              className={
                                selected
                                  ? "stroke-teal-600 dark:stroke-teal-400"
                                  : "stroke-stone-400 dark:stroke-stone-500"
                              }
                              markerEnd="url(#wf-arrow)"
                              onClick={() => {
                                setSelTrans(i);
                                setSelNode(null);
                              }}
                            />
                          </g>
                        );
                      })}
                    </svg>
                    {/* برچسب گذارها */}
                    {transitions.map((tr, i) => {
                      const a = nodeByCode.get(tr.fromCode);
                      const b = nodeByCode.get(tr.toCode);
                      if (!a || !b) return null;
                      const g = edgeGeom(a, b);
                      const isCond = a.nodeType === "condition";
                      const label = isCond && tr.conditionExpr ? tr.conditionExpr : tr.action;
                      return (
                        <button
                          key={`lbl-${tr.fromCode}-${tr.toCode}-${i}`}
                          type="button"
                          onClick={() => {
                            setSelTrans(i);
                            setSelNode(null);
                          }}
                          dir="rtl"
                          className={cn(
                            "absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] shadow-sm transition-colors",
                            selTrans === i
                              ? "border-teal-500 bg-teal-600 text-white"
                              : "border-border bg-card text-foreground/80 hover:bg-accent",
                          )}
                          style={{ left: g.mid.x, top: g.mid.y }}
                        >
                          {label}
                        </button>
                      );
                    })}
                    {/* گره‌ها */}
                    {nodes.map((n) => {
                      const st = NODE_STYLE[n.nodeType];
                      const selected = selNode === n.nodeCode;
                      const isConnectSource = connectMode && connectFrom === n.nodeCode;
                      return (
                        <div
                          key={n.nodeCode}
                          role="button"
                          tabIndex={0}
                          aria-label={n.title}
                          onPointerDown={(e) => beginDrag(e, n)}
                          onClick={() => onNodeClick(n.nodeCode)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onNodeClick(n.nodeCode);
                            }
                          }}
                          className={cn(
                            "absolute flex cursor-grab flex-col rounded-xl border-2 bg-card shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
                            st.border,
                            selected && "ring-2 ring-teal-500 ring-offset-2 ring-offset-background",
                            isConnectSource && "ring-2 ring-amber-500",
                            connectMode && !isConnectSource && "cursor-pointer",
                          )}
                          style={{ left: n.posX, top: n.posY, width: NODE_W, height: NODE_H }}
                        >
                          <div className="flex items-center gap-1.5 border-b border-border/50 px-2 py-1.5">
                            <span
                              className={cn(
                                "flex h-4 items-center gap-1 rounded-full px-1.5 text-[9px] font-semibold",
                                st.chip,
                              )}
                            >
                              {st.icon}
                              {t(`wf.des.nodeType.${n.nodeType}`)}
                            </span>
                            <span className="font-mono text-[9px] text-muted-foreground" dir="ltr">
                              {n.nodeCode}
                            </span>
                          </div>
                          <div className="min-h-0 flex-1 overflow-hidden px-2 py-1.5" dir="rtl">
                            <p className="line-clamp-2 text-[11px] font-medium leading-snug">{n.title}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 px-2 pb-1.5" dir="rtl">
                            {n.nodeType === "action" && n.roleCode && (
                              <span className="rounded-full bg-muted px-1.5 text-[9px] text-muted-foreground">
                                {n.roleCode}
                              </span>
                            )}
                            {n.nodeType === "action" && n.slaHours != null && (
                              <span className="rounded-full bg-muted px-1.5 text-[9px] text-muted-foreground">
                                SLA {n.slaHours}h
                              </span>
                            )}
                            {n.nodeType === "end" && (
                              <span
                                className={cn(
                                  "rounded-full px-1.5 text-[9px]",
                                  n.instanceState === "rejected"
                                    ? "bg-rose-600/10 text-rose-700 dark:text-rose-300"
                                    : "bg-teal-600/10 text-teal-700 dark:text-teal-300",
                                )}
                              >
                                {n.finalStatus != null ? t("wf.des.finalStatusShort") : ""}
                                {n.finalStatus != null ? ` ${n.finalStatus}` : ""}
                                {n.instanceState === "rejected" ? ` — ${t("wf.des.stateRejected")}` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{t("wf.des.canvasHint")}</p>

                {/* ویرایشگر انتخاب جاری */}
                <div className="rounded-xl border border-border/70 bg-card/60 p-3">
                  {selNodeObj ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">
                          {t("wf.des.editingNode")} — {selNodeObj.nodeCode}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-destructive hover:text-destructive"
                          disabled={!canvasEditable || selNodeObj.nodeType === "start"}
                          onClick={() => delNode(selNodeObj.nodeCode)}
                        >
                          <Scissors className="h-3.5 w-3.5" aria-hidden />
                          {t("wf.des.delNode")}
                        </Button>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="wf-node-title" className="text-xs">
                          {t("wf.des.nodeTitle")}
                        </Label>
                        <Input
                          id="wf-node-title"
                          value={selNodeObj.title}
                          disabled={!canvasEditable}
                          onChange={(e) => updateNode(selNodeObj.nodeCode, { title: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      {selNodeObj.nodeType === "action" && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs">{t("wf.des.role")}</Label>
                            <Select
                              value={selNodeObj.roleCode}
                              disabled={!canvasEditable}
                              onValueChange={(v) => updateNode(selNodeObj.nodeCode, { roleCode: v })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder={t("wf.des.role")} />
                              </SelectTrigger>
                              <SelectContent>
                                {roles
                                  .filter((r) => r.isActive)
                                  .map((r) => (
                                    <SelectItem key={r.code} value={r.code}>
                                      {r.code} — {r.title}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="wf-node-sla" className="text-xs">
                              {t("wf.des.sla")}
                            </Label>
                            <Input
                              id="wf-node-sla"
                              type="number"
                              min={1}
                              value={selNodeObj.slaHours ?? ""}
                              disabled={!canvasEditable}
                              onChange={(e) =>
                                updateNode(selNodeObj.nodeCode, {
                                  slaHours: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              className="h-8"
                              dir="ltr"
                            />
                          </div>
                        </>
                      )}
                      {selNodeObj.nodeType === "end" && (
                        <div className="space-y-1">
                          <Label className="text-xs">{t("wf.des.finalStatus")}</Label>
                          <Select
                            value={selNodeObj.finalStatus != null ? String(selNodeObj.finalStatus) : undefined}
                            disabled={!canvasEditable}
                            onValueChange={(v) => {
                              const fs = Number(v);
                              updateNode(selNodeObj.nodeCode, {
                                finalStatus: fs,
                                instanceState: fs === 1 ? "rejected" : "approved",
                              });
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder={t("wf.des.finalStatus")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">{t("wf.des.finalStatus1")}</SelectItem>
                              <SelectItem value="3">{t("wf.des.finalStatus3")}</SelectItem>
                              <SelectItem value="4">{t("wf.des.finalStatus4")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {selNodeObj.nodeType === "condition" && (
                        <p className="text-[11px] leading-relaxed text-muted-foreground sm:col-span-2 lg:col-span-4">
                          {t("wf.des.conditionHint")}
                        </p>
                      )}
                      {selNodeObj.nodeType === "start" && (
                        <p className="text-[11px] leading-relaxed text-muted-foreground sm:col-span-2 lg:col-span-4">
                          {t("wf.des.startHint")}
                        </p>
                      )}
                    </div>
                  ) : selTrans !== null && transitions[selTrans] ? (
                    (() => {
                      const tr = transitions[selTrans];
                      const from = nodeByCode.get(tr.fromCode);
                      return (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold">
                              {t("wf.des.editingTrans")} — {from?.title ?? tr.fromCode} →{" "}
                              {nodeByCode.get(tr.toCode)?.title ?? tr.toCode}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-destructive hover:text-destructive"
                              disabled={!canvasEditable}
                              onClick={() => delTrans(selTrans)}
                            >
                              <Scissors className="h-3.5 w-3.5" aria-hidden />
                              {t("wf.des.delTrans")}
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t("wf.des.transAction")}</Label>
                            <Select
                              value={tr.action}
                              disabled={!canvasEditable}
                              onValueChange={(v) => updateTrans(selTrans, { action: v })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder={t("wf.des.transAction")} />
                              </SelectTrigger>
                              <SelectContent>
                                {(from?.nodeType === "start"
                                  ? ["ارسال به رسیدگی"]
                                  : from?.nodeType === "condition"
                                    ? ["بله", "خیر"]
                                    : ["تایید", "رد"]
                                ).map((a) => (
                                  <SelectItem key={a} value={a}>
                                    {a}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {from?.nodeType === "condition" && (
                            <>
                              <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="wf-trans-expr" className="text-xs">
                                  {t("wf.des.condExpr")}
                                </Label>
                                <Input
                                  id="wf-trans-expr"
                                  value={tr.conditionExpr}
                                  disabled={!canvasEditable || tr.isDefault}
                                  onChange={(e) => updateTrans(selTrans, { conditionExpr: e.target.value })}
                                  className="h-8 font-mono"
                                  dir="ltr"
                                />
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {["amount > threshold", "amount <= threshold"].map((preset) => (
                                    <button
                                      key={preset}
                                      type="button"
                                      disabled={!canvasEditable || tr.isDefault}
                                      onClick={() => updateTrans(selTrans, { conditionExpr: preset })}
                                      className="rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
                                    >
                                      {preset}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  id="wf-trans-default"
                                  checked={tr.isDefault}
                                  disabled={!canvasEditable}
                                  onCheckedChange={(v) => updateTrans(selTrans, { isDefault: v })}
                                />
                                <Label htmlFor="wf-trans-default" className="text-xs">
                                  {t("wf.des.isDefault")}
                                </Label>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-xs text-muted-foreground">{t("wf.des.editPanelHint")}</p>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        )}
      </SimpleFormTwoRowTabbed>

      {/* مودال خاتمهٔ فرآیند (t190) — تاریخ خاتمه با پیش‌فرض «تاریخ روز» +
          توضیحات؛ با تأیید کاربر فرآیند خاتمه می‌یابد */}
      <Dialog open={termOpen} onOpenChange={setTermOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{t("wf.des.termTitle")}</DialogTitle>
            <DialogDescription>{t("wf.des.termDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="wf-term-date" className="text-xs">
                {t("wf.des.termDate")}
              </Label>
              <Input
                id="wf-term-date"
                value={termDate}
                onChange={(e) => setTermDate(e.target.value)}
                className="h-9"
                dir="ltr"
                placeholder="____/__/__"
                aria-label={t("wf.des.termDate")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="wf-term-note" className="text-xs">
                {t("common.description")}
              </Label>
              <Textarea
                id="wf-term-note"
                value={termNote}
                onChange={(e) => setTermNote(e.target.value)}
                className="min-h-20"
                aria-label={t("common.description")}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setTermOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 text-white hover:bg-rose-700"
                disabled={terminating}
                onClick={() => void doTerminate()}
              >
                {terminating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <CircleStop className="h-3.5 w-3.5" aria-hidden />
                )}
                {t("wf.des.termConfirm")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BadgeOk() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2} aria-hidden>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
