"use client";

/* Task 32 — BusinessStructureWindow refactored onto the SimpleTreeForm shell
   (owner request): the chromeless gradient header (Task 28 caption contract),
   the Task-20 FormActionBar and the Task-25 aligned field grid replace the
   former custom two-pane card layout (TreeForm + BsDetail). Every Task-17
   behavior is preserved: load/CRUD against the settings-service via the BFF,
   parent-driven type rules (allowedChildTypes), guarded delete, the
   save / save-new / save-close semantics and the erp:records-changed event
   (§5.6).
   Task 110 (درخواست مالک) — فیلد «عنوان لاتین» حذف شد؛ فیلد «عنوان» زبان‌آگاه
   است (نمایش ترجمهٔ زبان جاری از انبار DataTranslation؛ ویرایش در fa = عنوان
   پایه، در سایر زبان‌ها = ترجمهٔ همان زبان). کاشی‌های «ترجمهٔ آنلاین/دستی»
   هم مثل فرم محل های جغرافیایی فعال شدند (با ترجمهٔ زنجیره‌ای زیرشاخه‌ها). */

import * as React from "react";
import { AlertTriangle, Network } from "lucide-react";
import { toast } from "sonner";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { api, ApiError } from "@/lib/api";
import {
  SimpleTreeForm,
  type SimpleTreeFormNode,
} from "@/components/forms/simple-tree-form";
import type { SimpleFormField } from "@/components/forms/simple-form-two-row-tabbed";
import {
  ConfirmDeleteDialog,
  type ActionBarListItem,
} from "@/components/forms/action-bar";
import { useWindowChrome, useTabDirty } from "@/components/desktop/app-window";
import { Badge } from "@/components/ui/badge";
import { BsLogoUploader, BsTypeIcon, parseTypes } from "./bs-detail";
import {
  useRecordTranslation,
  type SubtreeTranslationRecord,
} from "@/components/forms/common/use-record-translation";
import type { DataTranslationField } from "@/components/forms/common/data-translations-dialog";
import {
  allowedChildTypes,
  ROOT_ALLOWED_TYPES,
  type BsListResponse,
  type BsNode,
  type BsSavePayload,
} from "@/types/business-structure";

type Mode = "idle" | "view" | "create";

interface BsFormState {
  title: string;
  /** عنوانی که فرم با آن بار شده — مبنای تشخیص ویرایش ترجمه (Task 110) */
  origTitle: string;
  type: string; // "" unset
  manager: string;
  logoUrl: string | null;
  isActive: boolean;
  isBasicInfoShared: boolean;
  activeStructureTypes: number[];
}

const EMPTY: BsFormState = {
  title: "",
  origTitle: "",
  type: "",
  manager: "",
  logoUrl: null,
  isActive: true,
  isBasicInfoShared: false,
  activeStructureTypes: [],
};

/** عنوان نمایشی/ویرایشی رکورد در زبان جاری — نبودِ ترجمه = عنوان پایهٔ fa */
function nodeTitleIn(n: BsNode, locale: string, tr?: Record<string, string>): string {
  if (locale === "fa") return n.title ?? "";
  return tr?.[locale] || n.title || "";
}

function formFromNode(node: BsNode, locale: string, tr?: Record<string, string>): BsFormState {
  const title = nodeTitleIn(node, locale, tr);
  return {
    title,
    origTitle: title, // Task 110 — مبنای تشخیص ویرایش ترجمه
    type: node.businessStructureType != null ? String(node.businessStructureType) : "",
    manager: node.manager ?? "",
    logoUrl: node.logoUrl,
    isActive: node.isActive,
    isBasicInfoShared: node.isBasicInfoShared,
    activeStructureTypes: parseTypes(node.activeStructureTypes),
  };
}

/* Task 35 — BusinessStructureWindow can now run EMBEDDED inside the Settings
   window as a sub-page (owner request: the form moved from the desktop into
   Settings). Embedded mode: no window chrome on the form header (the Settings
   window owns the caption buttons) and «بستن»/save-close navigates back via
   onEmbeddedClose instead of closing a standalone window. */
interface BusinessStructureWindowProps {
  embedded?: boolean;
  onEmbeddedClose?: () => void;
}

export function BusinessStructureWindow({
  embedded = false,
  onEmbeddedClose,
}: BusinessStructureWindowProps) {
  const t = useT();
  const locale = useSettings((s) => s.locale);

  /* Task 28 contract — chromeless host: the green form header hosts the
     caption buttons and drags the window; maximized state subscribes reactively.
     Embedded (Task 35): the Settings window owns the chrome, so the header
     handlers are intentionally undefined (caption buttons hide, opt-in shell). */
  const chrome = useWindowChrome();
  const chromeApi = embedded ? null : chrome;
  const headerMaximized = useDesktop(
    (s) =>
      embedded
        ? false
        : s.windows.find((w) => w.kind === "business-structure")?.maximized ?? false,
  );
  const closeThisWindow = React.useCallback(() => {
    if (embedded) {
      onEmbeddedClose?.();
      return;
    }
    const win = useDesktop.getState().windows.find((w) => w.kind === "business-structure");
    if (win) useDesktop.getState().closeWindow(win.id);
  }, [embedded, onEmbeddedClose]);

  const [items, setItems] = React.useState<BsNode[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<Mode>("idle");
  const [createParentId, setCreateParentId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<BsFormState>(EMPTY);
  /* marks the erp:records-changed events this window dispatches itself, so the
     §5.6 listener ignores them (no double refetch after save/delete) */
  const selfEventRef = React.useRef(false);
  /* Task 33 — node picked via the tree right-click flyout for deletion;
     the confirm step is the SAME ConfirmDeleteDialog the ActionBar
     delete-family tiles use (single confirmation, Task-32 decision). */
  const [contextDeleteId, setContextDeleteId] = React.useState<string | null>(null);
  /* Task 82 — unsaved-data flag of the hosting tab (owner alarm contract):
     با اولین ویرایش فرم روشن و با تعویض گره/ذخیره/خالی‌کردن خاموش می‌شود */
  const [bsDirty, setBsDirty] = React.useState(false);
  useTabDirty(bsDirty);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<BsListResponse>("business-structure");
      setItems(res.items);
    } catch (e) {
      toast.error(t("bs.msg.loadError"), {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  /* §5.6 — refetch when another surface changes business-structure records */
  React.useEffect(() => {
    const onChanged = (e: Event) => {
      if (selfEventRef.current) {
        selfEventRef.current = false;
        return;
      }
      const detail = (e as CustomEvent).detail as { entity?: string } | undefined;
      if (detail?.entity === "business-structure") void load();
    };
    window.addEventListener("erp:records-changed", onChanged);
    return () => window.removeEventListener("erp:records-changed", onChanged);
  }, [load]);

  /* ---- tree helpers ---- */
  const byId = React.useMemo(() => {
    const m = new Map<string, BsNode>();
    for (const n of items) m.set(String(n.id), n);
    return m;
  }, [items]);

  /* ---- Task 110 — نقشهٔ ترجمهٔ عناوین از انبار DataTranslation (entityType
     BusinessStructure) — درخت/فهرست/فرم در زبان جاری نمایش داده می‌شوند. */
  const [trMap, setTrMap] = React.useState<Record<string, Record<string, string>>>({});
  const [trVersion, setTrVersion] = React.useState(0);
  const [trEpoch, setTrEpoch] = React.useState(0);

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
          `data-translations?entityType=BusinessStructure&entityIds=${chunk.join(",")}&fieldKeys=title`,
        ),
      ),
    )
      .then((results) => {
        if (!alive) return;
        const next: Record<string, Record<string, string>> = {};
        for (const res of results) {
          for (const it of res.items ?? []) {
            if (!it?.entityId || it.fieldKey !== "title" || !it?.locale || !it?.value) continue;
            const rec = (next[String(it.entityId)] ??= {});
            rec[it.locale] = it.value;
          }
        }
        setTrMap(next);
        setTrEpoch((e) => e + 1); // فرمِ باز هم عنوانِ زبان جاری را تازه می‌کند
      })
      .catch(() => {
        /* واکشی ناموفق — عناوین پایهٔ fa می‌مانند */
      });
    return () => {
      alive = false;
    };
  }, [items, trVersion]);

  /** عنوان نمایشی رکورد در زبان جاری — نبودِ ترجمه = عنوان پایهٔ fa */
  const displayTitle = React.useCallback(
    (n: BsNode): string => nodeTitleIn(n, locale, trMap[String(n.id)]),
    [locale, trMap],
  );

  /* nested tree for the shell pane — items order preserved, every branch
     expanded by default (shell behavior); icons keep the Task-17 type colors */
  const treeNodes = React.useMemo<SimpleTreeFormNode[]>(() => {
    const map = new Map<string, SimpleTreeFormNode>();
    for (const n of items) {
      map.set(String(n.id), {
        id: String(n.id),
        label: displayTitle(n),
        icon: <BsTypeIcon type={n.businessStructureType} className="h-4 w-4" />,
        children: [],
      });
    }
    const roots: SimpleTreeFormNode[] = [];
    for (const n of items) {
      const me = map.get(String(n.id));
      if (!me) continue;
      const parent =
        n.parentRef && n.parentRef !== 0 ? map.get(String(n.parentRef)) : undefined;
      if (parent?.children) parent.children.push(me);
      else roots.push(me);
    }
    return roots;
  }, [items, displayTitle]);

  /* Task 79 — effective enabled structure types = union of the system-mandated
     Holding (1 — ticked by default on install, cannot be removed) and the
     ticks saved on the root node; gates the type choice on create exactly like
     the server (bs.val.typeDisabled). Unticking blocks only NEW nodes. */
  const effectiveTypes = React.useMemo<number[]>(() => {
    const rootTicks = parseTypes(byId.get("1")?.activeStructureTypes ?? null);
    return [...new Set([1, ...rootTicks])].sort((a, b) => a - b);
  }, [byId]);

  const selectedNode: BsNode | null = selectedId ? byId.get(selectedId) ?? null : null;
  const createParent: BsNode | null =
    createParentId ? byId.get(createParentId) ?? null : null;
  const parentNodeOfSelected: BsNode | null =
    selectedNode && selectedNode.parentRef
      ? byId.get(String(selectedNode.parentRef)) ?? null
      : null;
  const isRoot = mode === "view" && selectedNode?.id === 1;

  /* ---- form state — derive-and-reset during render (React-recommended
     "adjusting state on prop change" pattern, carried over from BsDetail) ----
     Task 110 — کلید بازمشق شامل زبان + نسخهٔ نقشهٔ ترجمه (عنوان زبان‌آگاه). */
  const formKey = `${mode}:${mode === "create" ? createParentId ?? "root" : selectedId ?? "-"}:${selectedNode?.version ?? "-"}:${locale}:${trEpoch}`;
  const [renderedKey, setRenderedKey] = React.useState(formKey);
  if (renderedKey !== formKey) {
    setRenderedKey(formKey);
    const nextForm =
      mode === "create"
        ? { ...EMPTY }
        : selectedNode
          ? formFromNode(selectedNode, locale, trMap[String(selectedNode.id)])
          : EMPTY;
    setForm(nextForm);
    setBsDirty(false); // Task 82 — فرم تازه/رکورد ذخیره‌شده = بدون ویرایش باز
  }

  /* ---- navigation ---- */
  const startCreate = React.useCallback((parentId: string | null) => {
    setCreateParentId(parentId);
    setSelectedId(parentId);
    setMode("create");
  }, []);

  const handleSelect = React.useCallback((id: string) => {
    /* selecting a tree row abandons an in-progress create (Task-17 behavior) */
    setMode("view");
    setSelectedId(id);
  }, []);

  const bsCanDelete = (node: BsNode) =>
    node.id !== 1 && !node.isSystem && node.childCount === 0;

  /* Task 34 — Store (type 5) is a leaf on the server (CHILD_TYPE_RULES[5]=[]);
     the tree flyout only offers «افزودن زیرشاخه» on nodes whose type may host
     children — the same rule the server enforces (§5.1 additive gating).
     Task 79 — the child type must ALSO be ticked on the root (effective
     types); e.g. with only Holding ticked, a Holding offers no flyout. */
  const bsCanHostChild = (node: BsNode) =>
    allowedChildTypes(node.businessStructureType ?? null).some((v) =>
      effectiveTypes.includes(v),
    );

  /* ---- actions (Task-17 semantics preserved) ----
     Task 32 — no window.confirm here: the FormActionBar delete-family tiles
     already own confirmation (ConfirmDeleteDialog); the old Task-17 inline
     delete button (single window.confirm) no longer exists on the shell. */
  const handleDelete = async (node: BsNode): Promise<boolean> => {
    try {
      await api.del(`business-structure/${node.id}`);
      toast.success(t("bs.msg.deleted"));
      if (selectedId === String(node.id)) {
        setSelectedId(null);
        setMode("idle");
      }
      await load();
      selfEventRef.current = true;
      window.dispatchEvent(
        new CustomEvent("erp:records-changed", { detail: { entity: "business-structure" } }),
      );
      return true;
    } catch (e) {
      if (e instanceof ApiError) {
        const key = (e.messageKey ?? "bs.msg.saveError") as Parameters<typeof t>[0];
        const known = ["bs.msg.deleteBlockedChildren", "bs.msg.deleteBlockedRoot", "bs.msg.deleteBlockedSystem"];
        toast.error(known.includes(key) ? t(key) : t("common.error"), {
          description: e.message,
        });
      } else {
        toast.error(t("common.error"));
      }
      return false;
    }
  };

  const handleSave = async (payload: BsSavePayload, after: "reload" | "new" | "close") => {
    setSaving(true);
    try {
      if (mode === "create") {
        const res = await api.post<{ item: BsNode }>("business-structure", payload);
        toast.success(t("bs.msg.saved"));
        await load();
        if (after === "new") {
          startCreate(createParentId);
        } else {
          setSelectedId(String(res.item.id));
          setMode("view");
        }
      } else if (mode === "view" && selectedNode) {
        await api.put<{ item: BsNode }>(`business-structure/${selectedNode.id}`, payload);
        /* Task 110 — ویرایش عنوان در زبان غیر-fa = ذخیرهٔ ترجمهٔ همان زبان
           در انبار DataTranslation (عنوان پایهٔ fa دست‌نخورده می‌ماند) */
        if (locale !== "fa" && form.title.trim() !== form.origTitle.trim()) {
          await api.post("data-translations/save", {
            entityType: "BusinessStructure",
            entityId: selectedNode.id,
            items: [{ fieldKey: "title", locale, value: form.title.trim() }],
          });
          setTrVersion((v) => v + 1);
        }
        toast.success(t("bs.msg.saved"));
        setBsDirty(false); // Task 82 — ذخیره شد (formKey هم ریست می‌کند)
        await load();
        /* Task 35 — save-close: standalone closes the window, embedded
           returns to the settings home (same closeThisWindow funnel) */
        if (after === "close") closeThisWindow();
      }
      selfEventRef.current = true;
      window.dispatchEvent(
        new CustomEvent("erp:records-changed", { detail: { entity: "business-structure" } }),
      );
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t("bs.msg.saveError");
      toast.error(t("bs.msg.saveError"), { description: msg });
    } finally {
      setSaving(false);
    }
  };

  /* ---- validation + payload (carried over from BsDetail) ----
     Task 110 — «عنوان لاتین» حذف شد؛ عنوان در fa به پایه می‌رود، در سایر
     زبان‌ها فقط ترجمهٔ همان زبان ذخیره می‌شود (عنوان پایه تغییر نمی‌کند). */
  const validate = (): string[] => {
    const errs: string[] = [];
    if (!isRoot) {
      if (!form.title.trim()) errs.push(t("bs.val.titleRequired"));
      if (!form.type) errs.push(t("bs.val.typeRequired"));
    }
    return errs;
  };

  const buildPayload = (): BsSavePayload => {
    if (isRoot) {
      return {
        isBasicInfoShared: form.isBasicInfoShared,
        /* Task 79 — Holding (1) always travels with the payload (locked tick) */
        activeStructureTypes: [...new Set([1, ...form.activeStructureTypes])].sort(
          (a, b) => a - b,
        ),
        isActive: form.isActive,
      };
    }
    if (mode === "create") {
      return {
        parentRef: createParent ? createParent.id : 1,
        title: form.title.trim(),
        businessStructureType: Number(form.type),
        manager: form.manager.trim() || null,
        logoUrl: form.logoUrl,
        isActive: form.isActive,
        /* Task 122 — تیک داده‌های مشترک؛ خواب ⇒ سرور ۲۱ آیتم مرجع تفصیل می‌سازد */
        isBasicInfoShared: form.isBasicInfoShared,
      };
    }
    return {
      /* عنوان فقط در fa به پایه می‌رود؛ در سایر زبان‌ها ترجمهٔ جدا ذخیره می‌شود */
      ...(locale === "fa" ? { title: form.title.trim() } : {}),
      businessStructureType: Number(form.type),
      manager: form.manager.trim() || null,
      logoUrl: form.logoUrl,
      isActive: form.isActive,
      /* Task 122 — فقط ذخیرهٔ فلگ؛ آیتم‌های مرجع فقط در «ایجاد» بذر می‌شوند */
      isBasicInfoShared: form.isBasicInfoShared,
    };
  };

  const doValidateAndSave = async (after: "reload" | "new" | "close"): Promise<boolean> => {
    if (saving) return false;
    const errs = validate();
    if (errs.length > 0) {
      toast.error(t("bs.msg.saveError"), { description: errs.join(" — ") });
      return false;
    }
    await handleSave(buildPayload(), after);
    return true;
  };

  /* ---- FormActionBar handlers (Task-20 contract) ----
     «+» (reset tile, legacy "new entry"): view/idle → create a child under
     the selected node (or the first root); create → abandon the entry. */
  const actionReset = () => {
    if (mode === "create") setMode("idle");
    else {
      /* Task 34 — a leaf node (e.g. Store) cannot host a new child: fall back
         to the first root branch, like the nothing-selected case (Task-17
         «...or the root» semantics). */
      const sel = selectedId ? byId.get(selectedId) : null;
      startCreate(sel && bsCanHostChild(sel) ? selectedId : (treeNodes[0]?.id ?? null));
    }
  };
  const actionSave = () => {
    void doValidateAndSave("reload");
  };
  const actionSaveNew = async () => {
    if (mode === "create") {
      await doValidateAndSave("new");
      return;
    }
    /* view mode: save, then open a blank entry under the same parent */
    const parentKey =
      selectedNode?.parentRef && selectedNode.parentRef !== 0
        ? String(selectedNode.parentRef)
        : null;
    const ok = await doValidateAndSave("reload");
    if (ok) startCreate(parentKey ?? treeNodes[0]?.id ?? null);
  };
  const actionSaveClose = () => {
    void doValidateAndSave("close");
  };
  const actionDelete = () => {
    if (selectedNode) void handleDelete(selectedNode);
  };
  /* explicit async compositions (auto-composed sequence() would fire the
     second step while the delete confirm dialog is still open) */
  const actionDeleteNew = async () => {
    if (!selectedNode) return;
    const ok = await handleDelete(selectedNode);
    if (ok) startCreate(treeNodes[0]?.id ?? null);
  };
  const actionDeleteClose = async () => {
    if (!selectedNode) return;
    const ok = await handleDelete(selectedNode);
    if (ok) closeThisWindow();
  };

  /* ---- records list (Task-20 action 10) — every tree node opens on click ----
     Task 110 — عنوان در زبان جاری (ترجمهٔ انبار DataTranslation). */
  const listItems = React.useMemo<ActionBarListItem[]>(
    () =>
      items.map((n) => ({
        id: String(n.id),
        title: displayTitle(n),
        subtitle: n.code,
        /* Task 86 — مینی‌گرید دراپ‌داون لیست */
        cells: [
          { label: t("abar.listColCode"), value: n.code },
          { label: t("abar.listColTitle"), value: displayTitle(n) },
        ],
      })),
    [items, t, displayTitle],
  );

  /* ---- detail fields (shell contract) ---- */
  const typeOptions = (() => {
    if (isRoot) return [] as number[];
    const parentType =
      mode === "create"
        ? createParent?.businessStructureType ?? null
        : parentNodeOfSelected?.businessStructureType ?? null;
    /* Task 79 — only root-ticked types are definable; the node's own current
       type always stays selectable (existing nodes are never invalidated). */
    const base = allowedChildTypes(parentType).filter((v) => effectiveTypes.includes(v));
    const cur =
      mode === "view" && selectedNode?.businessStructureType != null
        ? [selectedNode.businessStructureType]
        : [];
    return [...new Set([...base, ...cur])].sort((a, b) => a - b);
  })();

  const typeSelectOptions = typeOptions.map((v) => ({
    value: String(v),
    label: t(`bs.type.${v}` as never),
  }));

  /* Task 79 — the union chips = system-mandated Holding ∪ the user's ticks
     (the previous definedTypes union is superseded by the tick gate). */
  const unionTypes = React.useMemo(() => {
    if (!isRoot) return [] as number[];
    return [...new Set([1, ...form.activeStructureTypes])].sort((a, b) => a - b);
  }, [isRoot, form.activeStructureTypes]);

  const fields: SimpleFormField[] = (() => {
    if (mode === "create") {
      /* Task 122 (درخواست مالک) — تیک «استفاده از داده‌های مشترک دفتر مرکزی»
         فقط برای شاخه از نوع هلدینگ(1)/شرکت(2)؛ اگر فعال نباشد (پیش‌فرض)،
         ۲۱ آیتم مرجع «نوع تفصیل» پس از ایجاد برای همین شاخه ساخته می‌شود. */
      const sharedTick =
        Number(form.type) === 1 || Number(form.type) === 2
          ? [
              {
                id: "isBasicInfoShared",
                label: t("bs.field.shareHeadquarterData"),
                type: "checkbox" as const,
                checked: form.isBasicInfoShared,
              },
            ]
          : [];
      return [
        { id: "title", label: t("bs.field.title"), required: true, value: form.title },
        {
          id: "type",
          label: t("bs.field.type"),
          required: true,
          type: "select" as const,
          value: form.type,
          options: typeSelectOptions,
        },
        ...sharedTick,
        { id: "manager", label: t("bs.field.manager"), value: form.manager },
        {
          id: "isActive",
          label: t("bs.field.isActive"),
          type: "checkbox" as const,
          checked: form.isActive,
        },
      ];
    }
    if (isRoot && selectedNode) {
      return [
        { id: "code", label: t("bs.field.code"), value: selectedNode.code, readOnly: true },
        { id: "hqTitle", label: t("bs.field.title"), value: displayTitle(selectedNode), readOnly: true },
        {
          id: "isBasicInfoShared",
          label: t("bs.field.shareHeadquarterData"),
          type: "checkbox" as const,
          checked: form.isBasicInfoShared,
        },
        ...ROOT_ALLOWED_TYPES.map(
          (v): SimpleFormField => ({
            id: `activeType${v}`,
            label: t(`bs.type.${v}` as never),
            type: "checkbox" as const,
            /* Task 125 — تیک‌های «نوع کسب و کار» با place:"start" به لبهٔ
               شروعِ خواندن لنگر می‌شوند (راست در RTL، چپ در LTR) و ترتیب
               DOM [چک‌باکس، برچسب] در هر دو جهت خوانش درست است — چیدمان
               آیتم‌ها همیشه هم‌جهت زبان داشبورد است (§1.4، Task 102). */
            place: "start",
            /* Task 79 — Holding is the system default: ticked and locked */
            checked: v === 1 ? true : form.activeStructureTypes.includes(v),
            disabled: v === 1,
          }),
        ),
        {
          id: "isActive",
          label: t("bs.field.isActive"),
          type: "checkbox" as const,
          checked: form.isActive,
        },
      ];
    }
    if (selectedNode) {
      /* Task 122 — تیک مشترک دفتر مرکزی در ویرایش شاخهٔ هلدینگ/شرکت هم
         نمایش داده می‌شود (فقط ذخیرهٔ فلگ؛ آیتم‌های مرجع فقط در «ایجاد»). */
      const sharedTickEdit =
        Number(selectedNode.businessStructureType) === 1 ||
        Number(selectedNode.businessStructureType) === 2
          ? [
              {
                id: "isBasicInfoShared",
                label: t("bs.field.shareHeadquarterData"),
                type: "checkbox" as const,
                checked: form.isBasicInfoShared,
              },
            ]
          : [];
      return [
        { id: "title", label: t("bs.field.title"), required: true, value: form.title },
        {
          id: "type",
          label: t("bs.field.type"),
          required: true,
          type: "select" as const,
          value: form.type,
          options: typeSelectOptions,
          disabled: Boolean(selectedNode.isSystem),
        },
        ...sharedTickEdit,
        { id: "manager", label: t("bs.field.manager"), value: form.manager },
        {
          id: "isActive",
          label: t("bs.field.isActive"),
          type: "checkbox" as const,
          checked: form.isActive,
        },
      ];
    }
    return [];
  })();

  const onFieldChange = (id: string, value: string | boolean) => {
    /* root «activeStructureTypes» chips became four checkboxes on the shell;
       Task 79 — the Holding tick (1) is locked: toggling it is a no-op. */
    if (id.startsWith("activeType")) {
      const v = Number(id.slice("activeType".length));
      if (v === 1) return;
      setBsDirty(true); // Task 82 — ویرایش ذخیره‌نشده
      setForm((f) => ({
        ...f,
        activeStructureTypes:
          value === true
            ? [...f.activeStructureTypes, v].sort((a, b) => a - b)
            : f.activeStructureTypes.filter((x) => x !== v),
      }));
      return;
    }
    setBsDirty(true); // Task 82 — ویرایش ذخیره‌نشده
    setForm((f) => ({ ...f, [id]: value }));
  };

  const detailExtra = (() => {
    if (mode === "create") {
      return (
        <BsLogoUploader
          logoUrl={form.logoUrl}
          onChange={(v) => {
            setBsDirty(true); // Task 82 — لوگوی جدید = ویرایش ذخیره‌نشده
            setForm((f) => ({ ...f, logoUrl: v }));
          }}
        />
      );
    }
    if (isRoot) {
      return (
        <>
          {unionTypes.length > 0 && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 p-2.5 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <div className="text-xs">
                <p className="font-semibold">{t("bs.root.unionWarning")}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {unionTypes.map((v) => (
                    <Badge key={v} variant="secondary" className="text-[10px]">
                      {t(`bs.type.${v}` as never)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Task 79 — the locked Holding tick is a system default */}
          <p className="mt-2 text-[11px] text-muted-foreground">{t("bs.hint.holdingLocked")}</p>
        </>
      );
    }
    return (
      <>
        <BsLogoUploader
          logoUrl={form.logoUrl}
          onChange={(v) => {
            setBsDirty(true); // Task 82 — لوگوی جدید = ویرایش ذخیره‌نشده
            setForm((f) => ({ ...f, logoUrl: v }));
          }}
        />
        <p className="mt-2 text-[11px] text-muted-foreground">{t("bs.hint.codeAuto")}</p>
      </>
    );
  })();

  const detailTitleOverride =
    mode === "create"
      ? `${t("bs.action.new")} — ${t("bs.field.parent")}: ${
          createParent ? `${displayTitle(createParent)} (${createParent.code})` : t("bs.type.hq")
        }`
      : null;

  const badge = mode === "create" ? t("bs.action.new") : selectedNode?.code || undefined;

  /* ---- Task 110 (درخواست مالک) — ترجمهٔ آنلاین/دستی رکورد باز ----
     مثل فرم محل های جغرافیایی (Task 107/108/109): آنلاین = ترجمهٔ
     زنجیره‌ای سرشاخه + تمامی زیرشاخه‌ها (انبارشناسی پوشش + دستهٔ هوشمند)،
     دستی = دیالوگ عمومی؛ مبدأ ترجمه = عنوان پایهٔ fa رکورد. */
  const recordTr = useRecordTranslation({
    entityType: "BusinessStructure",
    entityId: mode === "view" && selectedNode ? selectedNode.id : null,
    getFields: (): DataTranslationField[] => {
      const v = selectedNode?.title?.trim() ?? "";
      return v ? [{ key: "title", label: t("bs.field.title"), value: v }] : [];
    },
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
            fields: [{ key: "title", label: t("bs.field.title"), value: v }],
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

  return (
    <>
      <SimpleTreeForm
        treeTitle={t("bs.treeTitle")}
        nodes={treeNodes}
        selectedId={selectedId}
        onSelect={(node) => {
          if (node) handleSelect(node.id);
        }}
        badge={badge}
        icon={<Network className="h-3.5 w-3.5" aria-hidden />}
        detailTitleOverride={detailTitleOverride}
        emptyText={t("bs.selectNode")}
        treeEmptyText={loading ? t("bs.loadingTree") : t("bs.emptyTree")}
        fields={fields}
        onFieldChange={onFieldChange}
        detailExtra={detailExtra}
        /* Task 33 — right-click flyout: «افزودن زیرشاخه» opens the create
           form under the right-clicked node (parent-driven type rules then
           apply inside the form); «حذف شاخه» is gated by the SAME rules as
           the ActionBar delete tile (root/system/has-children excluded). */
        onAddBranch={(parent) => startCreate(parent.id)}
        canAddBranch={(node) => {
          const bs = byId.get(node.id);
          return bs ? bsCanHostChild(bs) : false;
        }}
        onDeleteBranch={(node) => setContextDeleteId(node.id)}
        canDeleteBranch={(node) => {
          const bs = byId.get(node.id);
          return bs ? bsCanDelete(bs) : false;
        }}
        onReset={actionReset}
        onSave={actionSave}
        onSaveNew={actionSaveNew}
        onSaveClose={actionSaveClose}
        onDelete={actionDelete}
        onDeleteNew={actionDeleteNew}
        onDeleteClose={actionDeleteClose}
        onClose={closeThisWindow}
        canSave={mode !== "idle"}
        canCopy={false}
        canDelete={Boolean(selectedNode && bsCanDelete(selectedNode))}
        canPrint={false}
        listItems={listItems}
        listLoading={loading}
        onOpenListItem={(item) => handleSelect(item.id)}
        /* Task 110 — کاشی «ترجمه» فعال مثل فرم محل های جغرافیایی */
        onTranslateOnline={recordTr.translateOnline}
        onTranslateOffline={recordTr.openTranslateOffline}
        /* Task 35 — embedded mode: no caption buttons / drag on the form
           header (the Settings window owns the chrome); standalone keeps the
           Task-28 chromeless contract verbatim. */
        onHeaderClose={embedded ? undefined : closeThisWindow}
        onHeaderMinimize={chromeApi?.onMinimize}
        onHeaderMaximize={chromeApi?.onToggleMaximize}
        headerMaximized={headerMaximized}
        onHeaderDragStart={chromeApi?.onDragStart}
        onHeaderDragMove={chromeApi?.onDragMove}
        onHeaderDragEnd={chromeApi?.onDragEnd}
        onHeaderDoubleClick={chromeApi?.onDoubleClick}
      />
      <ConfirmDeleteDialog
        open={contextDeleteId !== null}
        onOpenChange={(o) => {
          if (!o) setContextDeleteId(null);
        }}
        onConfirm={async () => {
          const bs = contextDeleteId ? byId.get(contextDeleteId) : null;
          if (bs) await handleDelete(bs);
        }}
      />
      {recordTr.dialog}
    </>
  );
}
