"use client";

/* Task 140 (درخواست مالک) — فرم «درختواره حسابها» در نرم‌افزار «حسابداری» ←
   زیرمنوی «اطلاعات پایه» با کامپوننت SimpleTreeForm.

   Task 141 (درخواست مالک):
   ① «توی اکشن بار فرم درختواره حسابها، همه آیکون‌های اکشن بار را اضافه کنید»
      — فهرست کامل ACTION_BAR_KEYS (Task 48) بدون allowlist: لیست (دراپ‌داون
      مینی‌گرید با پرش به رکورد)، ریست، ذخیره، ذخیره و جدید، ذخیره و بستن،
      کپی (ثبت تازهٔ پیش‌پرشدهٔ خواهرِ همان والد)، حذف، حذف و جدید،
      حذف و بستن، پرینت (مودال انتخاب سطوح عین خوشهٔ خروجی) + ترجمه
      (useRecordTranslation با زنجیرهٔ زیرشاخه‌ها — الگوی geo) + راهنما.
   ② «هر زیرشاخه که ایجاد می‌شود در فیلد کد باید کد سرشاخه را داشته باشد»
      — کدینگ سلسله‌مراتبی: در ثبت تازه، کد با کد والد پیش‌پر می‌شود و
      پیشوندش قفل است (کاربر فقط ادامهٔ کد را می‌نویسد)؛ همین قانون در
      validate() و به‌عنوان خط دوم دفاعی در سرور (POST) کنترل می‌شود.

   Task 142 (درخواست مالک) — مودال «انتخاب نوع تفصیلی»:
   ① «هر نوع تفصیلی چند بار تکرار شده است» — منبع فهرست حالا دامنه‌دار
      است (structureId/headOfficeShares از OrgScope — قرارداد Task 122
      فرم نوع تفصیل) و ردیف‌های هم‌هویت (کد+عنوان) دوباره حذف می‌شوند؛
      «اگر نوع تفصیلی به یک سطح تفصیلی ارتباط پیدا کرد دیگر نباید برای
      سطوح بعدی در لیست نمایش داده شود» — فیلتر استفاده‌شده‌ها حالا
      هویتی است (کد+عنوان) نه صرفاً شناسه‌ای، تا دوقلوهای هم‌عنوان از
      ساختارهای دیگر هم برای سطوح بعدی پنهان شوند.
   ② «امکان انتخاب چندگانه» — چک‌باکس هر سطر + «انتخاب همه» سطرهای
      قابل‌مشاهده + دکمهٔ «انتخاب» با شمارنده (انتساب ترتیبی).
   ③ «با تک کلیک، نوع تفصیلی انتخاب شود» — دابل‌کلیک حذف شد؛ تک‌کلیک
      انتخاب/لغو انتخاب می‌کند.

   【چیدمان】 دو پنل: راست = درخت با ریشهٔ مجازی «ساختار کدینگ حساب‌ها» و
   حداکثر ۴ سطح (گروه حساب ← حساب کل ← حساب معین ← شاخه تفصیلی) + جستجو؛
   چپ = پنل «جزئیات» با نوار ابزار (اکشن‌بار فرم‌ها + خوشهٔ خروجی
   اکسل/ورد/PDF/چاپ با مودال انتخاب سطوح).

   【طول کد】 از تنظیمات حسابداری (SoftwareConfig — Task 135/137/139) خوانده
   می‌شود: گروه = accGroupCodeLen (پیش‌فرض ۲)، کل = گروه + accLedgerCodeLen
   (۴)، معین/شاخه = گروه + کل + accSubsidiaryCodeLen (۶).

   【تب‌های سطح ≥ ۳】 سطوح تفصیلی (همیشه) / کاربران مجاز (تنها با تنظیم
   enableLedgerAccessControl=true) / معین تعدیل ماهیت / شرح های پرتکرار /
   ضمایم و پیوست‌ها (placeholder «در انتظار پیکربندی»). */

import * as React from "react";
import {
  FileSpreadsheet,
  FileText,
  FileType2,
  Folder,
  ListTree,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { useOrgScope } from "@/stores/org-context-store";
import { useTabDirty } from "@/components/desktop/app-window";
import {
  SimpleTreeForm,
  type SimpleTreeFormNode,
} from "@/components/forms/simple-tree-form";
import type { SimpleFormField } from "@/components/forms/simple-form-two-row-tabbed";
import {
  ConfirmDeleteDialog,
  type ActionBarListItem,
} from "@/components/forms/action-bar";
import {
  useRecordTranslation,
  type SubtreeTranslationRecord,
} from "@/components/forms/common/use-record-translation";
import type { DataTranslationField } from "@/components/forms/common/data-translations-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadExcel } from "@/lib/excel-export";
import { cn } from "@/lib/utils";

/* ------------------------------- DTO types ------------------------------- */

interface AccountNodeDto {
  id: number;
  parentRef: number | null;
  level: number;
  code: string;
  title: string;
  latinTitle: string;
  isActive: boolean;
  accountType: number | null;
  nature: number;
  natureControl: number | null;
  featureQuantitative: number;
  featureTrackingNumber: number;
  featureTrackingDate: number;
  featureCurrency: number;
  featureRevaluable: number;
  version: number;
}

interface DetailLevelDto {
  id: number;
  levelIndex: number;
  title: string;
  isActive: boolean;
  types: { id: number; detailTypeRef: number; code: string; title: string }[];
}

interface AdjustDto {
  id: number;
  adjustAccountRef: number;
  adjustAccountCode: string;
  adjustAccountTitle: string;
  adjustAccountNature: number;
  description: string;
  description2: string;
}

interface RecurringDto {
  id: number;
  description: string;
  description2: string;
}

interface AllowedUserDto {
  id: number;
  userRef: number;
  username: string;
  fullName: string;
  permCreate: boolean;
  permView: boolean;
  permEdit: boolean;
  permDelete: boolean;
  permReport: boolean;
  permSend: boolean;
}

interface NodeDetail {
  detailLevels: DetailLevelDto[];
  natureAdjust: AdjustDto[];
  recurringDesc: RecurringDto[];
  allowedUsers: AllowedUserDto[];
}

interface Cfg {
  groupLen: number;
  ledgerLen: number;
  subsidiaryLen: number;
  detailLevelsCount: number;
  ledgerAccessControl: boolean;
}

interface UserRow {
  id: number;
  username: string;
  fullName: string;
}

interface DetailTypeLite {
  id: number;
  code: string;
  title: string;
}

const ROOT = "root";

const DEFAULT_CFG: Cfg = {
  groupLen: 2,
  ledgerLen: 2,
  subsidiaryLen: 2,
  detailLevelsCount: 10,
  ledgerAccessControl: false,
};

/** ماهیت‌های قابل تعدیلِ مخالف معین — ۳↔۴ (طی دوره)، ۵↔۶ (پایان دوره) */
const NATURE_ADJUST_OPPOSITE: Record<number, number[]> = { 3: [4], 4: [3], 5: [6], 6: [5] };

const FORM_EMPTY = {
  code: "",
  title: "",
  latinTitle: "",
  isActive: true,
  accountType: "",
  nature: "",
  natureControl: "1",
  features: [0, 0, 0, 0, 0] as number[],
};

/** رنگ اختصاصی هر ویژگی (۵ toggle چندحالته) — کلاس‌های کامل برای Tailwind */
const FEATURE_STYLES: { on: string; strong: string; dot: string }[] = [
  { on: "border-emerald-300 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300", strong: "border-emerald-500 bg-emerald-600 text-white", dot: "bg-emerald-500" },
  { on: "border-amber-300 bg-amber-500/15 text-amber-800 dark:text-amber-300", strong: "border-amber-500 bg-amber-600 text-white", dot: "bg-amber-500" },
  { on: "border-rose-300 bg-rose-500/15 text-rose-800 dark:text-rose-300", strong: "border-rose-500 bg-rose-600 text-white", dot: "bg-rose-500" },
  { on: "border-violet-300 bg-violet-500/15 text-violet-800 dark:text-violet-300", strong: "border-violet-500 bg-violet-600 text-white", dot: "bg-violet-500" },
  { on: "border-teal-300 bg-teal-500/15 text-teal-800 dark:text-teal-300", strong: "border-teal-500 bg-teal-600 text-white", dot: "bg-teal-500" },
];

function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** عنوان نمایشی به زبان جاری — نبودِ ترجمه = عنوان پایه (قرارداد Task 99) */
function nodeTitleIn(n: AccountNodeDto, locale: string, tr?: Record<string, string>): string {
  if (locale === "fa") return n.title ?? "";
  return tr?.[locale] || n.title || "";
}

export function AccountTreeForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const dir = useSettings((s) => s.dir());
  /* Task 142 — دامنهٔ گرهٔ فعال برای فهرست انواع تفصیل (قرارداد Task 122) */
  const { scope: orgScope } = useOrgScope();

  const [items, setItems] = React.useState<AccountNodeDto[]>([]);
  const [cfg, setCfg] = React.useState<Cfg>(DEFAULT_CFG);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>(ROOT);
  const [mode, setMode] = React.useState<"view" | "create">("view");
  const [createParentId, setCreateParentId] = React.useState<string>(ROOT);
  const [form, setForm] = React.useState({ ...FORM_EMPTY });
  const [detail, setDetail] = React.useState<NodeDetail | null>(null);
  const [activeTab, setActiveTab] = React.useState("levels");
  const [selectedLevelIndex, setSelectedLevelIndex] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  /* delete confirmation (action bar tile + right-click flyout funnel here) */
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  /* export modal: which output + the level checkboxes */
  const [exportKind, setExportKind] = React.useState<null | "excel" | "word" | "pdf" | "print">(null);
  const [exportChecks, setExportChecks] = React.useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true });
  /* «انتخاب نوع تفصیلی» modal — level the picker assigns into */
  const [pickerLevel, setPickerLevel] = React.useState<number | null>(null);
  const [typeRows, setTypeRows] = React.useState<DetailTypeLite[]>([]);
  const [typeSearch, setTypeSearch] = React.useState("");
  /* Task 142 — انتخاب چندگانه + وضعیت انتساب ترتیبی */
  const [typeSelected, setTypeSelected] = React.useState<ReadonlySet<number>>(new Set());
  const [typeAssigning, setTypeAssigning] = React.useState(false);
  /* users of «کاربران مجاز» */
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = React.useState("");
  const [userComboOpen, setUserComboOpen] = React.useState(false);
  /* Task 141 — کپی رکورد: منبع پیش‌پرکردن ثبت تازه + شمارندهٔ بازنشانی فرم ثبت
     (در formKey است تا کپی/جدیدِ متوالی روی همان گره هم فرم را تازه کند) */
  const [pendingCopy, setPendingCopy] = React.useState<AccountNodeDto | null>(null);
  const [createSeq, setCreateSeq] = React.useState(0);
  /* Task 141 — ترجمهٔ داده (الگوی geo): نقشهٔ id→زبان→عنوان برای نمایش درخت/فهرست */
  const [trMap, setTrMap] = React.useState<Record<string, Record<string, string>>>({});
  const [trVersion, setTrVersion] = React.useState(0);

  const byId = React.useMemo(() => {
    const m = new Map<string, AccountNodeDto>();
    for (const n of items) m.set(String(n.id), n);
    return m;
  }, [items]);

  const selectedNode: AccountNodeDto | null = selectedId === ROOT ? null : byId.get(selectedId) ?? null;
  const createParent: AccountNodeDto | null = createParentId === ROOT ? null : byId.get(createParentId) ?? null;
  /** سطح فرم فعال — در حالت create از والد، در view از خود گره */
  const activeLevel = mode === "create" ? (createParent ? createParent.level + 1 : 1) : (selectedNode?.level ?? 0);
  const isRootView = mode === "view" && selectedId === ROOT;
  /* Task 143 — تب‌ها با «افزودن شاخه معین» (و شاخهٔ تفصیلی) هم نمایش داده می‌شوند ولی
     تا ثبت کد و عنوان قفل‌اند؛ پس از ثبت (بازگشت به حالت view) فعال می‌شوند. */
  const tabsLocked = mode === "create";
  const showTabs = tabsLocked
    ? activeLevel >= 3
    : selectedNode != null && selectedNode.level >= 3;

  const codeLen = (level: number) =>
    level === 1 ? cfg.groupLen : level === 2 ? cfg.groupLen + cfg.ledgerLen : cfg.groupLen + cfg.ledgerLen + cfg.subsidiaryLen;

  /* ------------------------------ data loading ------------------------------ */

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [treeRes, cfgRes] = await Promise.all([
        api.get<{ items: AccountNodeDto[] }>("account-tree"),
        api
          .get<{ items?: { configKey: string; configValue: string }[] }>("software-config/accounting")
          .catch(() => ({ items: [] as { configKey: string; configValue: string }[] })),
      ]);
      setItems(treeRes.items);
      const map = new Map((cfgRes.items ?? []).map((r) => [r.configKey, r.configValue]));
      const readInt = (k: string, d: number, max: number) => {
        const raw = map.get(k);
        const n = raw ? Number(toLatinDigits(raw)) : NaN;
        return Number.isFinite(n) ? Math.max(1, Math.min(max, Math.trunc(n))) : d;
      };
      setCfg({
        groupLen: readInt("accGroupCodeLen", DEFAULT_CFG.groupLen, 15),
        ledgerLen: readInt("accLedgerCodeLen", DEFAULT_CFG.ledgerLen, 15),
        subsidiaryLen: readInt("accSubsidiaryCodeLen", DEFAULT_CFG.subsidiaryLen, 15),
        detailLevelsCount: readInt("accDetailLevels", DEFAULT_CFG.detailLevelsCount, 20),
        ledgerAccessControl: map.get("enableLedgerAccessControl") === "1",
      });
    } catch (e) {
      toast.error(t("atr.msg.loadError"), {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  /** جزئیات گره‌های سطح ≥ ۳ (سطوح تفصیلی/تعدیل/شرح‌ها/کاربران) */
  const loadDetail = React.useCallback(async (id: number): Promise<NodeDetail> => {
    const res = await api.get<{ item: AccountNodeDto & NodeDetail }>(`account-tree/${id}`);
    return {
      detailLevels: res.item.detailLevels,
      natureAdjust: res.item.natureAdjust,
      recurringDesc: res.item.recurringDesc,
      allowedUsers: res.item.allowedUsers,
    };
  }, []);

  /* users list — lazily when the access-control tab becomes reachable */
  React.useEffect(() => {
    if (!cfg.ledgerAccessControl || users.length > 0) return;
    let alive = true;
    api
      .get<{ items: UserRow[] }>("users")
      .then((res) => {
        if (alive) setUsers(res.items);
      })
      .catch(() => {
        /* فرم بدون فهرست کاربران هم کار می‌کند؛ فقط دراپ‌داون خالی است */
      });
    return () => {
      alive = false;
    };
  }, [cfg.ledgerAccessControl, users.length]);

  /* Task 141 — ترجمهٔ دادهٔ رکوردها (الگوی geo Task 107/99): نقشهٔ دسته‌ای
     عنوان‌ها برای نمایش درخت/فهرست به زبان جاری؛ واکشی ناموفق = عناوین پایه */
  React.useEffect(() => {
    const ids = items.map((n) => n.id);
    if (ids.length === 0) return;
    let alive = true;
    const chunks: number[][] = [];
    for (let i = 0; i < ids.length; i += 500) chunks.push(ids.slice(i, i + 500));
    void Promise.all(
      chunks.map((chunk) =>
        api.get<{
          items?: Array<{ entityId: number; fieldKey: string; locale: string; value: string }>;
        }>(
          `data-translations?entityType=AccountNode&entityIds=${chunk.join(",")}&fieldKeys=title`,
        ),
      ),
    )
      .then((results) => {
        if (!alive) return;
        const next: Record<string, Record<string, string>> = {};
        for (const res of results) {
          for (const it of res.items ?? []) {
            if (!it?.entityId || it.fieldKey !== "title" || !it?.locale || !it?.value) continue;
            (next[String(it.entityId)] ??= {})[it.locale] = it.value;
          }
        }
        setTrMap(next);
      })
      .catch(() => {
        /* واکشی ناموفق — درخت/فهرست با عناوین پایه می‌مانند */
      });
    return () => {
      alive = false;
    };
  }, [items, trVersion]);

  /* Task 141 — کاشی «ترجمه» فعال: آنلاین (زنجیرهٔ زیرشاخه‌ها) + دستی (دیالوگ عمومی) */
  const recordTr = useRecordTranslation({
    entityType: "AccountNode",
    entityId: mode === "view" && selectedNode ? selectedNode.id : null,
    getFields: (): DataTranslationField[] => {
      const v = selectedNode?.title?.trim() ?? "";
      return v ? [{ key: "title", label: t("atr.field.title.1"), value: v }] : [];
    },
    /* عین geo — با ترجمهٔ آنلاین، تمامی زیرشاخه‌های سرشاخهٔ انتخابی هم ترجمه می‌شوند */
    getSubtreeRecords: (rootId): SubtreeTranslationRecord[] => {
      const kidsOf = new Map<number, number[]>();
      for (const n of items) {
        const p = n.parentRef ?? 0;
        const list = kidsOf.get(p);
        if (list) list.push(n.id);
        else kidsOf.set(p, [n.id]);
      }
      const out: SubtreeTranslationRecord[] = [];
      const stack = [...(kidsOf.get(rootId) ?? [])];
      while (stack.length > 0) {
        const id = stack.pop() as number;
        const node = byId.get(String(id));
        const v = node?.title?.trim();
        if (node && v) {
          out.push({
            entityId: node.id,
            fields: [{ key: "title", label: t("atr.field.title.1"), value: v }],
          });
        }
        const kids = kidsOf.get(id);
        if (kids) stack.push(...kids);
      }
      return out;
    },
    onTranslated: () => setTrVersion((v) => v + 1),
    onOfflineClose: () => setTrVersion((v) => v + 1),
  });

  /** Task 141 — عنوان نمایشی رکورد در زبان جاری (درخت/فهرست) */
  const displayTitle = React.useCallback(
    (n: AccountNodeDto): string => nodeTitleIn(n, locale, trMap[String(n.id)]),
    [locale, trMap],
  );

  /* --------------------------- form state management --------------------------- */

  const freshDetail = React.useCallback(
    (): NodeDetail => ({
      detailLevels: Array.from({ length: cfg.detailLevelsCount }, (_, i) => ({
        id: 0,
        levelIndex: i + 1,
        title: "",
        isActive: true,
        types: [],
      })),
      natureAdjust: [],
      recurringDesc: [],
      allowedUsers: [],
    }),
    [cfg.detailLevelsCount],
  );

  /* derive-and-reset during render (الگوی bs-window) — انتخاب/حالت تازه = فرم تازه */
  const formKey = `${mode}:${selectedId}:${createParentId}:${selectedNode?.version ?? "-"}:${locale}:${createSeq}:${pendingCopy?.id ?? ""}`;
  const [renderedKey, setRenderedKey] = React.useState(formKey);
  if (renderedKey !== formKey) {
    setRenderedKey(formKey);
    setDirty(false);
    setActiveTab("levels");
    setSelectedLevelIndex(1);
    if (mode === "create") {
      /* Task 141 — کد هر زیرشاخه با کد سرشاخه آغاز می‌شود (پیشوند قفل)؛
         کپی = همان مقادیر رکورد باز به‌عنوان خواهر تازهٔ همان والد */
      setForm(
        pendingCopy
          ? {
              code: createParent ? createParent.code : "",
              title: pendingCopy.title,
              latinTitle: pendingCopy.latinTitle ?? "",
              isActive: pendingCopy.isActive,
              accountType:
                pendingCopy.accountType != null ? String(pendingCopy.accountType) : "",
              nature: pendingCopy.nature ? String(pendingCopy.nature) : "",
              natureControl:
                pendingCopy.natureControl != null ? String(pendingCopy.natureControl) : "1",
              features: [
                pendingCopy.featureQuantitative,
                pendingCopy.featureTrackingNumber,
                pendingCopy.featureTrackingDate,
                pendingCopy.featureCurrency,
                pendingCopy.featureRevaluable,
              ],
            }
          : { ...FORM_EMPTY, code: createParent ? createParent.code : "" },
      );
      setDetail(activeLevel >= 3 ? freshDetail() : null);
    } else if (selectedNode) {
      setForm({
        code: selectedNode.code,
        title: selectedNode.title,
        latinTitle: selectedNode.latinTitle ?? "",
        isActive: selectedNode.isActive,
        accountType: selectedNode.accountType != null ? String(selectedNode.accountType) : "",
        nature: selectedNode.nature ? String(selectedNode.nature) : "",
        natureControl:
          selectedNode.natureControl != null ? String(selectedNode.natureControl) : "1",
        features: [
          selectedNode.featureQuantitative,
          selectedNode.featureTrackingNumber,
          selectedNode.featureTrackingDate,
          selectedNode.featureCurrency,
          selectedNode.featureRevaluable,
        ],
      });
      setDetail(null);
      if (selectedNode.level >= 3) {
        void loadDetail(selectedNode.id).then((d) => setDetail(d));
      }
    } else {
      setForm({ ...FORM_EMPTY });
      setDetail(null);
    }
  }

  const setField = (id: string, value: string | boolean) => {
    setDirty(true);
    if (id === "nature") {
      /* تغییر ماهیت معین به غیر-طی دوره ⇒ کنترل ماهیت بی‌معنا */
      setForm((f) => ({ ...f, nature: String(value), natureControl: "1" }));
      return;
    }
    setForm((f) => ({ ...f, [id]: value }));
  };

  /** Task 141 — ست‌کنندهٔ کد با قفل پیشوند سرشاخه (فقط در ثبت تازه):
      کاربر هرچه بنویسد/پاک کند، خروجی همیشه = کد والد + ادامهٔ عددی */
  const setCodeField = (raw: string) => {
    setDirty(true);
    const maxLen = codeLen(activeLevel);
    const prefix = mode === "create" ? (createParent?.code ?? "") : "";
    const digits = raw.replace(/[^0-9]/g, "");
    const rest = prefix && digits.startsWith(prefix) ? digits.slice(prefix.length) : digits;
    setForm((f) => ({ ...f, code: (prefix + rest).slice(0, maxLen) }));
  };

  /** مسیر یکپارچهٔ onChange فیلدها — کد از مسیر قفل‌پیشوند می‌رود */
  const handleFieldChange = (id: string, value: string | boolean) => {
    if (id === "code") {
      setCodeField(String(value));
      return;
    }
    setField(id, value);
  };

  const setFeature = (idx: number) => {
    setDirty(true);
    setForm((f) => {
      const features = [...f.features];
      features[idx] = (features[idx] + 1) % 3; /* ۰=خاموش → ۱=فعال → ۲=اجباری → ۰ */
      return { ...f, features };
    });
  };

  /* --------------------------- tree pane (search + nodes) --------------------------- */

  const matches = React.useCallback(
    (n: AccountNodeDto) => {
      const q = toLatinDigits(search.trim()).toLowerCase();
      if (!q) return true;
      return (
        n.code.includes(q) ||
        n.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        (n.latinTitle ?? "").toLowerCase().includes(search.trim().toLowerCase())
      );
    },
    [search],
  );

  const treeNodes = React.useMemo<SimpleTreeFormNode[]>(() => {
    const levelIcon = (level: number) => {
      const cls = "h-3.5 w-3.5 shrink-0";
      if (level === 1) return <Folder className={cn(cls, "text-violet-500")} aria-hidden />;
      if (level === 2) return <Folder className={cn(cls, "text-emerald-500")} aria-hidden />;
      if (level === 3) return <Folder className={cn(cls, "text-teal-500")} aria-hidden />;
      return <FileText className={cn(cls, "text-muted-foreground")} aria-hidden />;
    };
    const build = (parentId: number | null): SimpleTreeFormNode[] =>
      items
        .filter((n) => (n.parentRef ?? null) === parentId)
        .map((n) => ({
          id: String(n.id),
          /* Task 141 — عنوان نمایشی به زبان جاری (نبودِ ترجمه = پایه) */
          label: `${n.code} - ${displayTitle(n)}`,
          icon: levelIcon(n.level),
          children: build(n.id),
        }));
    const kids = build(null).filter(function keep(node): boolean {
      if (!search.trim()) return true;
      const src = byId.get(node.id);
      const hit = src ? matches(src) : false;
      return hit || (node.children ?? []).some(keep);
    });
    return [
      { id: ROOT, label: t("atr.treeRoot"), icon: <ListTree className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />, children: kids },
    ];
  }, [items, byId, matches, search, t, displayTitle]);

  /* ------------------------------ navigation ------------------------------ */

  const startCreate = React.useCallback((parentKey: string) => {
    setPendingCopy(null);
    setCreateParentId(parentKey);
    setSelectedId(parentKey);
    setMode("create");
    setCreateSeq((s) => s + 1);
  }, []);

  /** Task 141 — «کپی اطلاعات فرم»: رکورد باز = پیش‌پرکردن ثبت تازهٔ خواهرِ همان والد */
  const handleCopy = React.useCallback(() => {
    if (!selectedNode) return;
    const parentKey = selectedNode.parentRef ? String(selectedNode.parentRef) : ROOT;
    setPendingCopy(selectedNode);
    setCreateParentId(parentKey);
    setSelectedId(parentKey);
    setMode("create");
    setCreateSeq((s) => s + 1);
    toast.success(t("abar.copyToast"));
  }, [selectedNode, t]);

  const handleSelect = React.useCallback((id: string) => {
    setMode("view");
    setSelectedId(id);
  }, []);

  /** برچسب پویای «افزودن …» بر اساس سطح والد (عین پرامپت مالک) */
  const addLabelFor = (parentLevel: number) => {
    if (parentLevel === 0) return t("atr.add.1");
    if (parentLevel === 1) return t("atr.add.2");
    if (parentLevel === 2) return t("atr.add.3");
    return t("atr.add.4");
  };

  /* ------------------------------ save/delete ------------------------------ */

  const validate = (): string[] => {
    const errs: string[] = [];
    const lvl = activeLevel;
    if (!form.code.trim()) errs.push(t("atr.val.codeRequired"));
    else if (!/^[0-9]+$/.test(form.code.trim())) errs.push(t("atr.val.codeNumeric"));
    else if (form.code.trim().length !== codeLen(lvl))
      errs.push(t("atr.val.codeLen").replace("{len}", String(codeLen(lvl))));
    /* Task 141 — خط دوم دفاعی فرانت: کد زیرشاخه باید با کد سرشاخه آغاز شود */
    const prefix = mode === "create" ? (createParent?.code ?? "") : "";
    if (prefix && !form.code.trim().startsWith(prefix)) errs.push(t("atr.val.codePrefix"));
    if (!form.title.trim()) errs.push(t("atr.val.titleRequired"));
    if (lvl === 1 && !form.accountType) errs.push(t("atr.val.typeRequired"));
    if (lvl >= 1 && lvl <= 3 && !form.nature) errs.push(t("atr.val.natureRequired"));
    return errs;
  };

  const buildPayload = () => {
    const lvl = activeLevel;
    const nature = Number(form.nature || 0);
    const payload: Record<string, unknown> = {
      code: form.code.trim(),
      title: form.title.trim(),
      latinTitle: form.latinTitle.trim() || undefined,
      isActive: form.isActive,
      nature: lvl <= 3 ? nature : 0,
    };
    if (mode === "create") {
      payload.parentRef = createParentId === ROOT ? undefined : Number(createParentId);
    }
    if (lvl === 1) payload.accountType = Number(form.accountType);
    if (lvl === 3) {
      payload.natureControl = [3, 4].includes(nature) ? Number(form.natureControl || 1) : undefined;
      payload.featureQuantitative = form.features[0];
      payload.featureTrackingNumber = form.features[1];
      payload.featureTrackingDate = form.features[2];
      payload.featureCurrency = form.features[3];
      payload.featureRevaluable = form.features[4];
    }
    if (lvl >= 3 && detail) {
      payload.detailLevels = detail.detailLevels.map((l) => ({
        levelIndex: l.levelIndex,
        title: l.title,
        isActive: l.isActive,
      }));
      payload.natureAdjust = detail.natureAdjust
        .filter((a) => a.adjustAccountRef > 0)
        .map((a) => ({
          adjustAccountRef: a.adjustAccountRef,
          description: a.description || undefined,
          description2: a.description2 || undefined,
        }));
      payload.recurringDesc = detail.recurringDesc
        .filter((d) => d.description.trim() !== "")
        .map((d) => ({ description: d.description, description2: d.description2 || undefined }));
      payload.allowedUsers = detail.allowedUsers.map((u) => ({
        userRef: u.userRef,
        permCreate: u.permCreate,
        permView: u.permView,
        permEdit: u.permEdit,
        permDelete: u.permDelete,
        permReport: u.permReport,
        permSend: u.permSend,
      }));
    }
    return payload;
  };

  const handleSave = async (after: "reload" | "new" | "close"): Promise<boolean> => {
    if (saving) return false;
    if (isRootView) return false;
    const errs = validate();
    if (errs.length > 0) {
      toast.error(t("atr.msg.saveError"), { description: errs.join(" — ") });
      return false;
    }
    setSaving(true);
    try {
      if (mode === "create") {
        const res = await api.post<{ id: number }>("account-tree", buildPayload());
        toast.success(t("atr.msg.saved"));
        setPendingCopy(null);
        await load();
        if (after === "new") {
          startCreate(createParentId);
        } else {
          setMode("view");
          setSelectedId(String(res.id));
        }
      } else if (selectedNode) {
        await api.put(`account-tree/${selectedNode.id}`, buildPayload());
        toast.success(t("atr.msg.saved"));
        setDirty(false);
        await load();
        if (after === "close") closeForm();
      }
      return true;
    } catch (e) {
      toast.error(t("atr.msg.saveError"), {
        description: e instanceof ApiError ? e.message : undefined,
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  /** after — «حذف و جدید» = startCreate زیر همان والد، «حذف و بستن» = بازگشت به منو */
  const handleDelete = async (id: string, after: "view" | "new" | "close" = "view"): Promise<boolean> => {
    /* والدِ گرهٔ حذف‌شده را پیش از بازخوانی نگه می‌داریم (حذف فقط برای برگ) */
    const gone = byId.get(id);
    try {
      await api.del(`account-tree/${id}`);
      toast.success(t("atr.msg.deleted"));
      if (selectedId === id) {
        setSelectedId(ROOT);
      }
      setDirty(false);
      await load();
      if (after === "new") {
        startCreate(gone?.parentRef ? String(gone.parentRef) : ROOT);
      } else if (after === "close") {
        closeForm();
      }
      return true;
    } catch (e) {
      toast.error(t("atr.msg.deleteError"), {
        description: e instanceof ApiError ? e.message : undefined,
      });
      return false;
    }
  };

  /** «بستن» / «ذخیره و بستن» = بازگشت به منوی حسابداری (زیرصفحهٔ پنجرهٔ حسابداری) */
  const closeForm = React.useCallback(() => {
    onBack?.();
  }, [onBack]);

  /* Task 141 — خانوادهٔ حذف اکشن‌بار (تأیید داخل خودِ کاشی‌هاست؛ عین geo) */
  const actionDeleteNew = async () => {
    if (!selectedNode) return;
    await handleDelete(String(selectedNode.id), "new");
  };
  const actionDeleteClose = async () => {
    if (!selectedNode) return;
    await handleDelete(String(selectedNode.id), "close");
  };

  /* ------------------------------ export outputs ------------------------------ */

  /** Task 141 — برچسب سطح (مشترک بین خروجی‌ها و دراپ‌داون لیست) */
  const levelLabel = React.useCallback(
    (l: number) =>
      l === 1
        ? t("atr.export.levelGroup")
        : l === 2
          ? t("atr.export.levelLedger")
          : l === 3
            ? t("atr.export.levelSubsidiary")
            : t("atr.export.levelDetail"),
    [t],
  );

  const exportRows = React.useCallback(() => {
    const rows: (string | number)[][] = [];
    const walk = (parentId: number | null) => {
      for (const n of items.filter((x) => (x.parentRef ?? null) === parentId)) {
        if (exportChecks[n.level]) {
          rows.push([n.code, n.title, n.latinTitle ?? "", levelLabel(n.level)]);
        }
        walk(n.id);
      }
    };
    walk(null);
    return rows;
  }, [items, exportChecks, levelLabel]);

  /* Task 141 — «لیست اطلاعات ثبت‌شده» (اقدام ۱۰ اکشن‌بار) — مینی‌گرید عین geo */
  const listItems = React.useMemo<ActionBarListItem[]>(
    () =>
      items.map((n) => ({
        id: String(n.id),
        title: displayTitle(n),
        subtitle: n.code,
        cells: [
          { label: t("abar.listColCode"), value: n.code },
          { label: t("abar.listColTitle"), value: displayTitle(n) },
          { label: t("atr.export.colLevel"), value: levelLabel(n.level) },
          { label: t("fy.active"), value: n.isActive ? t("abar.listYes") : t("abar.listNo") },
        ],
      })),
    [items, t, displayTitle, levelLabel],
  );

  const buildHtmlTable = React.useCallback(() => {
    const rows = exportRows();
    const th = [t("atr.export.colCode"), t("atr.export.colTitle"), t("atr.export.colLatin"), t("atr.export.colLevel")]
      .map((h) => `<th style="border:1px solid #999;padding:4px 8px;background:#f0f0f0">${h}</th>`)
      .join("");
    const tr = rows
      .map(
        (r) =>
          `<tr>${r
            .map((c) => `<td style="border:1px solid #999;padding:4px 8px">${String(c)}</td>`)
            .join("")}</tr>`,
      )
      .join("");
    return `<html dir="${dir}"><head><meta charset="utf-8"><title>${t("atr.formTitle")}</title></head><body><h3>${t("atr.formTitle")}</h3><table style="border-collapse:collapse;font-size:12px"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></body></html>`;
  }, [exportRows, dir, t]);

  const runExport = async () => {
    const rows = exportRows();
    if (rows.length === 0) {
      toast.error(t("atr.export.empty"));
      return;
    }
    const kind = exportKind;
    setExportKind(null);
    if (kind === "excel") {
      await downloadExcel({
        headers: [t("atr.export.colCode"), t("atr.export.colTitle"), t("atr.export.colLatin"), t("atr.export.colLevel")],
        rows,
        fileName: "FaraTaraz-Accounts-Tree",
        rtl: dir === "rtl",
      });
      return;
    }
    if (kind === "word") {
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" dir="${dir}"><head><meta charset="utf-8"></head><body>${buildHtmlTable()}</body></html>`;
      const blob = new Blob(["\ufeff", html], { type: "application/msword" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "FaraTaraz-Accounts-Tree.doc";
      a.click();
      URL.revokeObjectURL(a.href);
      return;
    }
    /* PDF / چاپ — پنجرهٔ چاپ استاندارد (PDF از همان مسیر «ذخیره به‌صورت PDF») */
    const w = window.open("", "_blank", "width=900,height=650");
    if (!w) return;
    w.document.write(buildHtmlTable());
    w.document.close();
    w.focus();
    w.print();
  };

  /* ------------------------------ detail-type picker ------------------------------ */

  /** کلید هویتی نوع تفصیل — کد+عنوان (Task 142: یکتایی واقعی، نه شناسهٔ ردیف). */
  const typeIdentityKey = (code: string, title: string) => `${code}\u241F${title}`;

  const openPicker = async (levelIndex: number) => {
    setPickerLevel(levelIndex);
    setTypeSearch("");
    setTypeSelected(new Set());
    try {
      /* Task 142 — فهرست دامنه‌دار (گرهٔ فعال + دفتر مرکزی با تیک اشتراک)؛
         عین قرارداد فرم «نوع تفصیلی» (Task 122) — بدون آن همهٔ ساختارها
         می‌آمدند و هر نوع چند بار تکرار دیده می‌شد. */
      const qs = new URLSearchParams();
      if (orgScope.businessStructureRef != null) {
        qs.set("structureId", String(orgScope.businessStructureRef));
        qs.set("headOfficeShares", orgScope.shared ? "true" : "false");
      }
      const res = await api.get<{ items: DetailTypeLite[] }>(
        `detail-type${qs.size ? `?${qs.toString()}` : ""}`,
      );
      /* دفاع فرانت: حذف ردیف‌های هم‌هویت (کد+عنوان) — حتی اگر در دامنه
         نسخهٔ گره و نسخهٔ مشترک دفتر مرکزی هم‌زمان وجود داشته باشند. */
      const seen = new Set<string>();
      setTypeRows(
        res.items.filter((r) => {
          const k = typeIdentityKey(r.code, r.title);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        }),
      );
    } catch {
      setTypeRows([]);
    }
  };

  /* شناسهٔ انواع انتسابیافته (هر سطحی از همین گره) */
  const usedTypeRefs = React.useMemo(() => {
    if (!detail) return new Set<number>();
    return new Set(detail.detailLevels.flatMap((l) => l.types.map((tp) => tp.detailTypeRef)));
  }, [detail]);

  /* Task 142 — هویت انواع انتسابیافته: «اگر نوع تفصیلی به یک سطح تفصیلی
     ارتباط پیدا کرد دیگر نباید برای سطوح بعدی در لیست نمایش داده شود» —
     با کلید هویتی، دوقلوهای هم‌کد/هم‌عنوان هم پنهان می‌شوند. */
  const usedTypeKeys = React.useMemo(() => {
    if (!detail) return new Set<string>();
    return new Set(
      detail.detailLevels.flatMap((l) => l.types.map((tp) => typeIdentityKey(tp.code, tp.title))),
    );
  }, [detail]);

  const pickerRows = React.useMemo(() => {
    const q = typeSearch.trim().toLowerCase();
    return typeRows.filter(
      (r) =>
        !usedTypeRefs.has(r.id) &&
        !usedTypeKeys.has(typeIdentityKey(r.code, r.title)) &&
        (!q || r.code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q)),
    );
  }, [typeRows, typeSearch, usedTypeRefs, usedTypeKeys]);

  /** تک‌کلیک سطر = انتخاب/لغو انتخاب (Task 142). */
  const toggleTypeSelected = (id: number) => {
    setTypeSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** «انتخاب همه» فقط روی سطرهای قابل‌مشاهدهٔ فعلی. */
  const allVisibleSelected = pickerRows.length > 0 && pickerRows.every((r) => typeSelected.has(r.id));
  const toggleSelectAllVisible = () => {
    setTypeSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const r of pickerRows) next.delete(r.id);
      } else {
        for (const r of pickerRows) next.add(r.id);
      }
      return next;
    });
  };

  /** Task 142 — انتساب ترتیبی همهٔ انتخاب‌شده‌ها؛ خطای میانه فهرست را می‌شکند
     اما detail تازه می‌شود تا آنچه ثبت شده دیده شود؛ مودال فقط با موفقیت کامل بسته می‌شود. */
  const assignSelectedTypes = async () => {
    if (!selectedNode || pickerLevel == null || typeSelected.size === 0) return;
    setTypeAssigning(true);
    let firstError: unknown = null;
    try {
      for (const ref of typeSelected) {
        try {
          await api.post(`account-tree/${selectedNode.id}/detail-types`, {
            levelIndex: pickerLevel,
            detailTypeRef: ref,
          });
        } catch (e) {
          firstError = e;
          break;
        }
      }
      const fresh = await loadDetail(selectedNode.id);
      setDetail(fresh);
      if (firstError == null) {
        setDirty(true);
        toast.success(t("atr.msg.saved"));
        setPickerLevel(null);
        setTypeSelected(new Set());
      } else {
        setTypeSelected((prev) => {
          const still = new Set<number>();
          for (const ref of prev) {
            if (!fresh.detailLevels.some((l) => l.types.some((tp) => tp.detailTypeRef === ref))) {
              still.add(ref);
            }
          }
          return still;
        });
        toast.error(t("atr.msg.saveError"), {
          description: firstError instanceof ApiError ? firstError.message : undefined,
        });
      }
    } finally {
      setTypeAssigning(false);
    }
  };

  /* Task 142 — حذف انتسابِ تکی از تب «انواع تفصیلی سطح» (رفتار قبلی assignType) */
  const removeType = async (levelIndex: number, assignmentId: number) => {
    if (!selectedNode) return;
    try {
      await api.del(`account-tree/${selectedNode.id}/detail-types/${assignmentId}`);
      setDetail((d) =>
        d
          ? {
              ...d,
              detailLevels: d.detailLevels.map((l) =>
                l.levelIndex === levelIndex
                  ? { ...l, types: l.types.filter((tp) => tp.id !== assignmentId) }
                  : l,
              ),
            }
          : d,
      );
      toast.success(t("atr.msg.deleted"));
    } catch (e) {
      toast.error(t("atr.msg.deleteError"), {
        description: e instanceof ApiError ? e.message : undefined,
      });
    }
  };

  /* ------------------------------ detail fields ------------------------------ */

  const natureOptions = (() => {
    if (activeLevel === 3) {
      return [3, 4, 5, 6, 7].map((v) => ({ value: String(v), label: t(`atr.nature.${v}` as never) }));
    }
    return [1, 2, 7].map((v) => ({ value: String(v), label: t(`atr.nature.${v}` as never) }));
  })();

  const levelFieldLabel = (base: "code" | "title") => t(`atr.field.${base}.${Math.max(1, activeLevel)}` as never);

  const fields: SimpleFormField[] = (() => {
    if (isRootView) {
      /* ریشهٔ مجازی — فیلدها فقط‌خواندنی (عین پرامپت: «غیرقابل ویرایش روی ریشه») */
      return [
        { id: "code", label: t("atr.field.code.1"), value: "—", readOnly: true, ltr: true },
        { id: "title", label: t("atr.field.title.1"), value: t("atr.treeRoot"), readOnly: true },
        { id: "latinTitle", label: t("atr.field.latinTitle"), value: "", readOnly: true, ltr: true },
        { id: "isActive", label: t("atr.field.isActive"), type: "checkbox", checked: true, disabled: true },
      ];
    }
    const lvl = activeLevel;
    /* Task 141 — placeholder کد نشان می‌دهد کد سطح = پیشوند والد + ادامه؛
       در ثبت تازه خودِ فیلد هم از قبل با کد سرشاخه پر شده است */
    const codePh =
      mode === "create" && createParent
        ? createParent.code + "0".repeat(Math.max(0, codeLen(lvl) - createParent.code.length))
        : "0".repeat(codeLen(lvl));
    const base: SimpleFormField[] = [
      { id: "code", label: levelFieldLabel("code"), required: true, value: form.code, ltr: true, placeholder: codePh },
      { id: "title", label: levelFieldLabel("title"), required: true, value: form.title },
      { id: "latinTitle", label: t("atr.field.latinTitle"), value: form.latinTitle, ltr: true },
      { id: "isActive", label: t("atr.field.isActive"), type: "checkbox", checked: form.isActive },
    ];
    if (lvl === 1) {
      base.push({
        id: "accountType",
        label: t("atr.field.accountType"),
        required: true,
        type: "select",
        value: form.accountType,
        options: [1, 2, 3].map((v) => ({ value: String(v), label: t(`atr.accType.${v}` as never) })),
      });
    }
    if (lvl <= 3) {
      base.push({
        id: "nature",
        label: t("atr.field.nature"),
        required: true,
        type: "select",
        value: form.nature,
        options: natureOptions,
      });
    }
    if (lvl === 3 && [3, 4].includes(Number(form.nature || 0))) {
      base.push({
        id: "natureControl",
        label: t("atr.field.natureControl"),
        type: "select",
        value: form.natureControl,
        options: [1, 2, 3].map((v) => ({ value: String(v), label: t(`atr.natureControl.${v}` as never) })),
      });
    }
    return base;
  })();

  /* ------------------------------ tabs (L≥3) ------------------------------ */

  const setDetailState = (mut: (d: NodeDetail) => NodeDetail) => {
    setDirty(true);
    setDetail((d) => (d ? mut(d) : d));
  };

  const adjustCandidates = React.useMemo(() => {
    if (!selectedNode) return [];
    const opposites = NATURE_ADJUST_OPPOSITE[selectedNode.nature] ?? [];
    if (opposites.length === 0) return [];
    return items.filter(
      (n) => n.level === 3 && n.id !== selectedNode.id && opposites.includes(n.nature),
    );
  }, [items, selectedNode]);

  const splitName = (fullName: string): [string, string] => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return [parts[0] ?? "", ""];
    return [parts[0], parts.slice(1).join(" ")];
  };

  const userMatches = React.useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return [];
    const taken = new Set((detail?.allowedUsers ?? []).map((u) => u.userRef));
    return users
      .filter((u) => !taken.has(u.id))
      .filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [users, userSearch, detail]);

  const levelName = (i: number) => t(`atr.levels.ord.${i}` as never);

  const tabsBar = (() => {
    if (!showTabs) return null;
    const tabs: { key: string; label: string }[] = [
      { key: "levels", label: t("atr.tab.levels") },
      ...(cfg.ledgerAccessControl ? [{ key: "users", label: t("atr.tab.users") }] : []),
      { key: "adjust", label: t("atr.tab.adjust") },
      { key: "recurring", label: t("atr.tab.recurring") },
      { key: "attachments", label: t("atr.tab.attachments") },
    ];
    return (
      <div className="mt-4 border-b border-border/60">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label={t("atr.formTitle")}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={!tabsLocked && activeTab === tab.key}
              disabled={tabsLocked}
              onClick={() => {
                if (!tabsLocked) setActiveTab(tab.key);
              }}
              className={cn(
                "rounded-t-lg px-3 py-1.5 text-xs transition-colors",
                tabsLocked ? "cursor-not-allowed" : "cursor-pointer",
                tabsLocked
                  ? "text-muted-foreground/50"
                  : activeTab === tab.key
                    ? "border border-b-0 border-border/60 bg-background font-semibold text-primary"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {tabsLocked && (
          <p className="pt-1.5 text-[11px] text-muted-foreground">{t("atr.tabsLockedHint")}</p>
        )}
      </div>
    );
  })();

  const tabBody = (() => {
    /* Task 143 — در ثبت تازه بدنهٔ تب‌ها رندر نمی‌شود (تب‌ها تا ثبت قفل‌اند) */
    if (!showTabs || tabsLocked || !detail || !selectedNode) return null;
    if (activeTab === "levels") {
      const selectedLevel = detail.detailLevels.find((l) => l.levelIndex === selectedLevelIndex);
      return (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* راست: جدول سطوح — RTL: اولین فرزند سمت راست */}
          <div className="rounded-xl border border-border/70 bg-background/40 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold">{t("atr.tab.levels")}</p>
            </div>
            <div className="max-h-56 overflow-y-auto scrollbar-slim">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/70 text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 text-start font-medium"> </th>
                    <th className="px-2 py-1.5 text-start font-medium">{t("atr.levels.titleCol")}</th>
                    <th className="px-2 py-1.5 text-center font-medium">{t("atr.levels.activeCol")}</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.detailLevels.map((l) => (
                    <tr
                      key={l.levelIndex}
                      onClick={() => setSelectedLevelIndex(l.levelIndex)}
                      className={cn(
                        "cursor-pointer border-t border-border/50 transition-colors",
                        selectedLevelIndex === l.levelIndex
                          ? "bg-primary/10 font-semibold"
                          : "hover:bg-foreground/5",
                      )}
                    >
                      <td className="px-2 py-1.5 whitespace-nowrap">{levelName(l.levelIndex)}</td>
                      <td className="px-2 py-1">
                        <input
                          value={l.title}
                          onChange={(e) =>
                            setDetailState((d) => ({
                              ...d,
                              detailLevels: d.detailLevels.map((x) =>
                                x.levelIndex === l.levelIndex ? { ...x, title: e.target.value } : x,
                              ),
                            }))
                          }
                          placeholder={levelName(l.levelIndex)}
                          className="h-6 w-full rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                          aria-label={`${levelName(l.levelIndex)} — ${t("atr.levels.titleCol")}`}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input type="checkbox" checked={l.isActive} readOnly aria-label={t("atr.levels.activeCol")} className="h-3.5 w-3.5 accent-[hsl(var(--primary))]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* چپ: انواع تفصیلیِ سطح انتخاب‌شده */}
          <div className="rounded-xl border border-border/70 bg-background/40 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate text-xs font-semibold">
                {t("atr.levels.typesOf")} — {levelName(selectedLevelIndex)}
              </p>
              <button
                type="button"
                onClick={() => void openPicker(selectedLevelIndex)}
                className="rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 cursor-pointer"
              >
                {t("atr.levels.add")}
              </button>
            </div>
            {!selectedLevel || selectedLevel.types.length === 0 ? (
              <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">
                {t("atr.levels.noTypes")}
              </p>
            ) : (
              <ul className="max-h-56 space-y-1 overflow-y-auto scrollbar-slim">
                {selectedLevel.types.map((tp) => (
                  <li
                    key={tp.id}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2 py-1.5 text-xs"
                  >
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{tp.code}</span>
                    <span className="min-w-0 flex-1 truncate">{tp.title}</span>
                    <button
                      type="button"
                      aria-label={t("atr.levels.remove")}
                      title={t("atr.levels.remove")}
                      onClick={() => void removeType(selectedLevelIndex, tp.id)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    }
    if (activeTab === "users" && cfg.ledgerAccessControl) {
      return (
        <div className="mt-3 space-y-2">
          <div className="relative">
            <input
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setUserComboOpen(true);
              }}
              onFocus={() => setUserComboOpen(true)}
              placeholder={t("atr.users.searchUser")}
              className="h-7 w-full rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
              aria-label={t("atr.users.searchUser")}
            />
            {userComboOpen && userMatches.length > 0 && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                <div className="grid grid-cols-3 border-b border-border/60 bg-muted/60 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                  <span>{t("atr.users.usernameCol")}</span>
                  <span>{t("atr.users.firstNameCol")}</span>
                  <span>{t("atr.users.lastNameCol")}</span>
                </div>
                <ul className="max-h-40 overflow-y-auto scrollbar-slim">
                  {userMatches.map((u) => {
                    const [fn, ln] = splitName(u.fullName);
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          className="grid w-full grid-cols-3 items-center px-2 py-1.5 text-xs transition-colors hover:bg-foreground/5 cursor-pointer"
                          onClick={() => {
                            setDetailState((d) => ({
                              ...d,
                              allowedUsers: [
                                ...d.allowedUsers,
                                {
                                  id: 0,
                                  userRef: u.id,
                                  username: u.username,
                                  fullName: u.fullName,
                                  permCreate: false,
                                  permView: false,
                                  permEdit: false,
                                  permDelete: false,
                                  permReport: false,
                                  permSend: false,
                                },
                              ],
                            }));
                            setUserSearch("");
                            setUserComboOpen(false);
                          }}
                        >
                          <span className="truncate font-medium">{u.username}</span>
                          <span className="truncate">{fn}</span>
                          <span className="truncate">{ln}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          {detail.allowedUsers.length === 0 ? (
            <p className="py-4 text-center text-[11px] text-muted-foreground">{t("atr.users.noRows")}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/70 scrollbar-slim">
              <table className="w-full min-w-[720px] text-xs">
                <thead className="bg-muted/70 text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 text-start font-medium">{t("atr.users.usernameCol")}</th>
                    <th className="px-2 py-1.5 text-start font-medium">{t("atr.users.firstNameCol")}</th>
                    <th className="px-2 py-1.5 text-start font-medium">{t("atr.users.lastNameCol")}</th>
                    {(["permCreate", "permView", "permEdit", "permDelete", "permReport", "permSend"] as const).map((k) => (
                      <th key={k} className="px-2 py-1.5 text-center font-medium">
                        {t(`atr.users.${k}` as never)}
                      </th>
                    ))}
                    <th className="w-8 px-1" aria-label={t("atr.users.removeRow")} />
                  </tr>
                </thead>
                <tbody>
                  {detail.allowedUsers.map((u, idx) => {
                    const [fn, ln] = splitName(u.fullName);
                    return (
                      <tr key={`${u.userRef}-${idx}`} className="border-t border-border/50">
                        <td className="px-2 py-1.5 font-medium">{u.username}</td>
                        <td className="px-2 py-1.5">{fn}</td>
                        <td className="px-2 py-1.5">{ln}</td>
                        {(["permCreate", "permView", "permEdit", "permDelete", "permReport", "permSend"] as const).map((k) => (
                          <td key={k} className="px-2 py-1.5 text-center">
                            <input
                              type="checkbox"
                              checked={u[k]}
                              onChange={(e) =>
                                setDetailState((d) => ({
                                  ...d,
                                  allowedUsers: d.allowedUsers.map((x, i) =>
                                    i === idx ? { ...x, [k]: e.target.checked } : x,
                                  ),
                                }))
                              }
                              aria-label={t(`atr.users.${k}` as never)}
                              className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
                            />
                          </td>
                        ))}
                        <td className="px-1 py-1.5 text-center">
                          <button
                            type="button"
                            aria-label={t("atr.users.removeRow")}
                            onClick={() =>
                              setDetailState((d) => ({
                                ...d,
                                allowedUsers: d.allowedUsers.filter((_, i) => i !== idx),
                              }))
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }
    if (activeTab === "adjust") {
      return (
        <div className="mt-3 space-y-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                setDetailState((d) => ({
                  ...d,
                  natureAdjust: [
                    ...d.natureAdjust,
                    { id: 0, adjustAccountRef: 0, adjustAccountCode: "", adjustAccountTitle: "", adjustAccountNature: 0, description: "", description2: "" },
                  ],
                }))
              }
              className="rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 cursor-pointer"
            >
              {t("atr.adjust.add")}
            </button>
          </div>
          {detail.natureAdjust.length === 0 ? (
            <p className="py-4 text-center text-[11px] text-muted-foreground">{t("atr.adjust.noRows")}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/70 scrollbar-slim">
              <table className="w-full min-w-[640px] text-xs">
                <thead className="bg-muted/70 text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 text-start font-medium">{t("atr.adjust.codeCol")} *</th>
                    <th className="px-2 py-1.5 text-start font-medium">{t("atr.adjust.titleCol")}</th>
                    <th className="px-2 py-1.5 text-start font-medium">{t("atr.adjust.natureCol")}</th>
                    <th className="px-2 py-1.5 text-start font-medium">{t("atr.adjust.descCol")}</th>
                    <th className="px-2 py-1.5 text-start font-medium">{t("atr.adjust.desc2Col")}</th>
                    <th className="w-8 px-1" aria-label={t("atr.adjust.removeRow")} />
                  </tr>
                </thead>
                <tbody>
                  {detail.natureAdjust.map((a, idx) => (
                    <tr key={idx} className="border-t border-border/50">
                      <td className="px-2 py-1.5">
                        <select
                          value={a.adjustAccountRef ? String(a.adjustAccountRef) : ""}
                          onChange={(e) => {
                            const target = adjustCandidates.find((c) => String(c.id) === e.target.value);
                            setDetailState((d) => ({
                              ...d,
                              natureAdjust: d.natureAdjust.map((x, i) =>
                                i === idx
                                  ? {
                                      ...x,
                                      adjustAccountRef: target?.id ?? 0,
                                      adjustAccountCode: target?.code ?? "",
                                      adjustAccountTitle: target?.title ?? "",
                                      adjustAccountNature: target?.nature ?? 0,
                                    }
                                  : x,
                              ),
                            }))
                          }}
                          aria-label={t("atr.adjust.codeCol")}
                          className="h-6 w-36 rounded-md border border-border bg-background px-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">{t("atr.adjust.pickAccount")}</option>
                          {adjustCandidates.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                              {c.code} - {c.title}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{a.adjustAccountTitle || "—"}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        {a.adjustAccountNature ? t(`atr.nature.${a.adjustAccountNature}` as never) : "—"}
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          value={a.description}
                          onChange={(e) =>
                            setDetailState((d) => ({
                              ...d,
                              natureAdjust: d.natureAdjust.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)),
                            }))
                          }
                          className="h-6 w-full min-w-28 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                          aria-label={t("atr.adjust.descCol")}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          value={a.description2}
                          onChange={(e) =>
                            setDetailState((d) => ({
                              ...d,
                              natureAdjust: d.natureAdjust.map((x, i) => (i === idx ? { ...x, description2: e.target.value } : x)),
                            }))
                          }
                          className="h-6 w-full min-w-28 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                          aria-label={t("atr.adjust.desc2Col")}
                        />
                      </td>
                      <td className="px-1 py-1.5 text-center">
                        <button
                          type="button"
                          aria-label={t("atr.adjust.removeRow")}
                          onClick={() =>
                            setDetailState((d) => ({
                              ...d,
                              natureAdjust: d.natureAdjust.filter((_, i) => i !== idx),
                            }))
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }
    if (activeTab === "recurring") {
      return (
        <div className="mt-3 space-y-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                setDetailState((d) => ({
                  ...d,
                  recurringDesc: [...d.recurringDesc, { id: 0, description: "", description2: "" }],
                }))
              }
              className="rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 cursor-pointer"
            >
              {t("atr.recurring.add")}
            </button>
          </div>
          {detail.recurringDesc.length === 0 ? (
            <p className="py-4 text-center text-[11px] text-muted-foreground">{t("atr.recurring.noRows")}</p>
          ) : (
            <ul className="space-y-1.5">
              {detail.recurringDesc.map((dRow, idx) => (
                <li key={idx} className="flex items-start gap-2 rounded-xl border border-border/60 bg-background/50 p-2">
                  <textarea
                    rows={2}
                    value={dRow.description}
                    onChange={(e) =>
                      setDetailState((d) => ({
                        ...d,
                        recurringDesc: d.recurringDesc.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)),
                      }))
                    }
                    placeholder={t("atr.recurring.descCol")}
                    aria-label={t("atr.recurring.descCol")}
                    className="min-h-6 flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                  <textarea
                    rows={2}
                    value={dRow.description2}
                    onChange={(e) =>
                      setDetailState((d) => ({
                        ...d,
                        recurringDesc: d.recurringDesc.map((x, i) => (i === idx ? { ...x, description2: e.target.value } : x)),
                      }))
                    }
                    placeholder={t("atr.recurring.desc2Col")}
                    aria-label={t("atr.recurring.desc2Col")}
                    className="min-h-6 flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    aria-label={t("atr.recurring.removeRow")}
                    onClick={() =>
                      setDetailState((d) => ({
                        ...d,
                        recurringDesc: d.recurringDesc.filter((_, i) => i !== idx),
                      }))
                    }
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    /* attachments */
    return (
      <div className="mt-3 rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
        <p className="text-xs text-muted-foreground">{t("atr.attachments.pending")}</p>
      </div>
    );
  })();

  /* «ویژگی‌های حساب» — گروپ ۵ دکمهٔ toggle چندحالتهٔ معین */
  const featuresBox = (() => {
    if (activeLevel !== 3) return null;
    const labels = [
      t("atr.feature.quantitative"),
      t("atr.feature.trackingNo"),
      t("atr.feature.trackingDate"),
      t("atr.feature.currency"),
      t("atr.feature.revaluable"),
    ];
    const stateLabels = [t("atr.feature.state.0"), t("atr.feature.state.1"), t("atr.feature.state.2")];
    return (
      <div
        role="group"
        aria-label={t("atr.group.features")}
        className="mt-4 rounded-xl border border-border/70 bg-background/40 p-3"
      >
        <p className="mb-2 text-xs font-semibold">{t("atr.group.features")}</p>
        <div className="flex flex-wrap gap-2">
          {labels.map((label, idx) => {
            const st = form.features[idx] ?? 0;
            const style = FEATURE_STYLES[idx] ?? FEATURE_STYLES[0];
            return (
              <button
                key={label}
                type="button"
                aria-pressed={st > 0}
                title={`${label}: ${stateLabels[st]}`}
                onClick={() => setFeature(idx)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer",
                  st === 0 && "border-border bg-background text-muted-foreground hover:bg-foreground/5",
                  st === 1 && style.on,
                  st === 2 && style.strong,
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", st === 0 ? "bg-muted-foreground/40" : style.dot)} aria-hidden />
                {label}
                {st > 0 && <span className="text-[9px] opacity-80">({stateLabels[st]})</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  })();

  /* ------------------------------ shell props ------------------------------ */

  const detailTitleOverride =
    mode === "create"
      ? `${t("bs.action.new")} — ${t("bs.field.parent")}: ${
          createParent ? `${createParent.code} - ${displayTitle(createParent)}` : t("atr.treeRoot")
        }`
      : null;

  const exportCluster = (
    <>
      <span aria-hidden className="mx-0.5 h-6 w-px shrink-0 bg-border" />
      {(
        [
          { kind: "excel" as const, icon: FileSpreadsheet, label: t("atr.export.excel") },
          { kind: "word" as const, icon: FileText, label: t("atr.export.word") },
          { kind: "pdf" as const, icon: FileType2, label: t("atr.export.pdf") },
          { kind: "print" as const, icon: Printer, label: t("atr.export.print") },
        ]
      ).map(({ kind, icon: Icon, label }) => (
        <button
          key={kind}
          type="button"
          title={label}
          aria-label={label}
          onClick={() => setExportKind(kind)}
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 cursor-pointer"
        >
          <Icon className="h-4 w-4" aria-hidden />
        </button>
      ))}
    </>
  );

  return (
    <>
      <SimpleTreeForm
        treeTitle={t("atr.treeTitle")}
        nodes={treeNodes}
        defaultSelectedId={selectedId}
        selectedId={selectedId}
        onSelect={(node) => {
          if (node) handleSelect(node.id);
        }}
        icon={<ListTree className="h-3.5 w-3.5" aria-hidden />}
        detailTitleOverride={detailTitleOverride}
        emptyText={t("atr.selectNode")}
        treeEmptyText={loading ? t("common.loading") : t("atr.treeEmpty")}
        treeHeaderExtra={
          <div className="relative">
            <Search className="pointer-events-none absolute inset-y-0 my-auto h-3.5 w-3.5 text-muted-foreground ltr:left-2 rtl:right-2" aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("atr.searchTree")}
              aria-label={t("atr.searchTree")}
              className="h-7 w-36 rounded-lg border border-border bg-background ps-7 pe-2 text-xs outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        }
        fields={fields}
        onFieldChange={handleFieldChange}
        detailExtra={
          <>
            {/* Task 141 — راهنمای کدینگ سلسله‌مراتبی در ثبت تازه */}
            {mode === "create" && createParent && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                {t("atr.hint.codePrefix").replace("{code}", createParent.code)}
              </p>
            )}
            {featuresBox}
            {tabsBar}
            {tabBody}
            {isRootView && (
              <p className="mt-3 rounded-lg bg-teal-500/10 p-2.5 text-[11px] leading-relaxed text-teal-800 dark:text-teal-300">
                {t("atr.rootHint")}
              </p>
            )}
          </>
        }
        /* Task 33 — right-click flyout with per-level add labels */
        onAddBranch={(parent) => startCreate(parent.id)}
        canAddBranch={(node) => node.id === ROOT || (byId.get(node.id)?.level ?? 1) < 4}
        addBranchLabel={(node) =>
          addLabelFor(node.id === ROOT ? 0 : (byId.get(node.id)?.level ?? 1))
        }
        onDeleteBranch={(node) => setDeleteTarget(node.id)}
        canDeleteBranch={(node) => node.id !== ROOT}
        deleteBranchLabel={t("atr.deleteBranch")}
        onReset={() => {
          if (mode === "create") {
            setMode("view");
            setSelectedId(createParentId);
          } else {
            const sel = selectedId !== ROOT ? byId.get(selectedId) : null;
            startCreate(sel && sel.level < 4 ? selectedId : ROOT);
          }
        }}
        onSave={() => void handleSave("reload")}
        onSaveNew={() => void handleSave("new")}
        onSaveClose={() => void handleSave("close")}
        onDelete={() => {
          if (selectedNode) setDeleteTarget(String(selectedNode.id));
        }}
        onClose={closeForm}
        /* Task 141 — «همه آیکون‌های اکشن بار»: بدون allowlist = ده آیکون کامل
           ACTION_BAR_KEYS + کاشی ترجمه؛ هر ده با رفتار واقعی سیم‌کشی شده‌اند */
        canSave={!isRootView}
        canCopy={Boolean(selectedNode)}
        canDelete={Boolean(selectedNode)}
        canPrint={!loading}
        onCopy={handleCopy}
        onDeleteNew={actionDeleteNew}
        onDeleteClose={actionDeleteClose}
        /* پرینت اکشن‌بار = همان مودال انتخاب سطوح خوشهٔ خروجی (یک رفتار واحد) */
        onPrint={() => setExportKind("print")}
        onHelp={() => {
          toast.info(t("atr.help"));
        }}
        listItems={listItems}
        listLoading={loading}
        onOpenListItem={(item) => handleSelect(item.id)}
        listActiveId={mode === "view" ? selectedId : null}
        onListRefresh={() => load()}
        /* Task 141 — کاشی ترجمه فعال (آنلاین زنجیره‌ای + دستی) */
        onTranslateOnline={recordTr.translateOnline}
        onTranslateOffline={recordTr.openTranslateOffline}
        actionBarExtra={exportCluster}
      />

      {/* حذف — همان دیالوگ تأیید خانوادهٔ اکشن‌بار */}
      <ConfirmDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (deleteTarget) await handleDelete(deleteTarget);
          setDeleteTarget(null);
        }}
      />

      {/* مودال خروجی — انتخاب سطوح */}
      <Dialog open={exportKind != null} onOpenChange={(o) => !o && setExportKind(null)}>
        <DialogContent className="max-w-sm" dir={dir}>
          <DialogHeader>
            <DialogTitle>{t("atr.export.title")}</DialogTitle>
            <DialogDescription>{t("atr.export.levelsHint")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-1">
            {(
              [
                [1, t("atr.export.levelGroup")],
                [2, t("atr.export.levelLedger")],
                [3, t("atr.export.levelSubsidiary")],
                [4, t("atr.export.levelDetail")],
              ] as const
            ).map(([lvl, label]) => (
              <label key={lvl} className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={exportChecks[lvl]}
                  onChange={(e) => setExportChecks((c) => ({ ...c, [lvl]: e.target.checked }))}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
                <span className="font-medium">{label}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setExportKind(null)}
              className="h-8 rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-foreground/5 cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={() => void runExport()}
              className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 cursor-pointer"
            >
              {t("atr.export.confirm")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مودال «انتخاب نوع تفصیلی» — Task 142: تک‌کلیک = انتخاب/لغو؛
          انتخاب چندگانه با چک‌باکس + «انتخاب همه» + دکمهٔ «انتخاب» */}
      <Dialog open={pickerLevel != null} onOpenChange={(o) => !o && setPickerLevel(null)}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle>{t("atr.levels.pickTitle")}</DialogTitle>
            <DialogDescription>{t("atr.levels.usedHint")}</DialogDescription>
          </DialogHeader>
          <input
            value={typeSearch}
            onChange={(e) => setTypeSearch(e.target.value)}
            placeholder={t("atr.searchTree")}
            className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
            aria-label={t("atr.levels.pickTitle")}
          />
          <div className="max-h-64 overflow-y-auto rounded-xl border border-border/70 scrollbar-slim">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/70 text-muted-foreground">
                <tr>
                  <th className="w-8 px-2 py-1.5 text-center font-medium">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      disabled={pickerRows.length === 0}
                      aria-label={t("atr.levels.pickSelectAll")}
                      title={t("atr.levels.pickSelectAll")}
                      className="h-3.5 w-3.5 cursor-pointer accent-[hsl(var(--primary))]"
                    />
                  </th>
                  <th className="px-2 py-1.5 text-start font-medium">{t("atr.types.code")}</th>
                  <th className="px-2 py-1.5 text-start font-medium">{t("atr.types.title")}</th>
                </tr>
              </thead>
              <tbody>
                {pickerRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-center text-[11px] text-muted-foreground">
                      {t("atr.levels.emptyTypes")}
                    </td>
                  </tr>
                ) : (
                  pickerRows.map((r) => {
                    const checked = typeSelected.has(r.id);
                    return (
                      <tr
                        key={r.id}
                        onClick={() => toggleTypeSelected(r.id)}
                        className={cn(
                          "cursor-pointer select-none border-t border-border/50 transition-colors",
                          checked ? "bg-primary/10 font-semibold" : "hover:bg-foreground/5",
                        )}
                        title={t("atr.levels.pickHint")}
                      >
                        <td className="px-2 py-1.5 text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTypeSelected(r.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`${r.code} — ${r.title}`}
                            className="h-3.5 w-3.5 cursor-pointer accent-[hsl(var(--primary))]"
                          />
                        </td>
                        <td className="px-2 py-1.5 font-mono">{r.code}</td>
                        <td className="px-2 py-1.5">{r.title}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <span className="me-auto text-[11px] text-muted-foreground">
              {t("atr.levels.pickSelectedCount").replace("{n}", String(typeSelected.size))}
            </span>
            <button
              type="button"
              onClick={() => setPickerLevel(null)}
              disabled={typeAssigning}
              className="h-8 rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-foreground/5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={() => void assignSelectedTypes()}
              disabled={typeSelected.size === 0 || typeAssigning}
              className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {typeAssigning ? t("atr.levels.pickSaving") : t("atr.levels.pickConfirm")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task 141 — دیالوگ «ورود دستی ترجمه» کاشی ترجمه */}
      {recordTr.dialog}
    </>
  );
}
