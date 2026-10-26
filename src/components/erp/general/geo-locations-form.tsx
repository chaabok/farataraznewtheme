"use client";

/* Task 103 (درخواست مالک) — فرم «محل های جغرافیایی» در نرم‌افزار «عمومی» ←
   زیرمنوی «اطلاعات پایه»، روی پوستهٔ SimpleTreeForm (هم‌خانوادهٔ ساختار
   کسب‌وکار — Task 32). درخت مرجع مکان‌ها با قواعد والد-محور مالک:
   «اولین شاخه کشور؛ زیر کشور فقط استان؛ زیر استان فقط شهر» (تک‌منبع حقیقت
   روی سرور است — آینهٔ فرانت برای گیتِ UI در types/geo-location).
   فیلدها: نوع (دراپ‌داون، آیتم‌های مجاز والد) / کد (عددی، پیشنهاد خودکار =
   بیشینهٔ خواهرها + ۱) / عنوان / فعال (پیش‌فرض تیک).
   Task 110 (درخواست مالک) — فیلد «عنوان لاتین» حذف شد؛ فیلد «عنوان» خودش
   زبان‌آware است: با تغییر زبان، ترجمهٔ همان زبان از انبار DataTranslation
   نمایش داده می‌شود؛ ویرایش عنوان در fa = عنوان پایه، در سایر زبان‌ها =
   ذخیرهٔ ترجمهٔ همان زبان در انبار (fallback نبودِ ترجمه = عنوان پایه). */

import * as React from "react";
import { Building2, CornerDownRight, EarthIcon, MapPinned, Route, TreePine } from "lucide-react";
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
import {
  useRecordTranslation,
  type SubtreeTranslationRecord,
} from "@/components/forms/common/use-record-translation";
import type { DataTranslationField } from "@/components/forms/common/data-translations-dialog";
import { cn } from "@/lib/utils";
import {
  geoAllowedChildTypes,
  geoTypeColor,
  type GeoListResponse,
  type GeoNode,
  type GeoSavePayload,
} from "@/types/geo-location";

type Mode = "idle" | "view" | "create";

interface GeoFormState {
  levelType: string; // "" unset
  code: string;
  /** عنوان در زبان جاری — fa = عنوان پایه؛ سایر زبان‌ها = ترجمهٔ همان زبان */
  title: string;
  isActive: boolean;
}

const EMPTY: GeoFormState = {
  levelType: "",
  code: "",
  title: "",
  isActive: true,
};

/** آیکون رنگی هر نوع مکان — هم‌قرارداد BsTypeIcon (Task 32) */
function GeoTypeIcon({ type, className }: { type: number; className?: string }) {
  const c = geoTypeColor(type);
  const Icon =
    type === 1
      ? EarthIcon
      : type === 2
        ? MapPinned
        : type === 3
          ? Building2
          : type === 4
            ? TreePine
            : type === 5
              ? Route
              : CornerDownRight;
  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded ring-1",
        c.bg,
        c.text,
        c.ring,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
    </span>
  );
}

/** عنوان نمایشی/ویرایشی رکورد در زبان جاری — نبودِ ترجمه = عنوان پایهٔ fa */
function nodeTitleIn(n: GeoNode, locale: string, tr?: Record<string, string>): string {
  if (locale === "fa") return n.title ?? "";
  return tr?.[locale] || n.title || "";
}

function formFromNode(node: GeoNode, locale: string, tr?: Record<string, string>): GeoFormState {
  return {
    levelType: String(node.levelType),
    code: String(node.code),
    title: nodeTitleIn(node, locale, tr),
    isActive: node.isActive,
  };
}

export function GeoLocationsForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const chrome = useWindowChrome();
  const locale = useSettings((s) => s.locale);
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "app" && w.appKey === "general")?.maximized ?? false,
  );

  const [items, setItems] = React.useState<GeoNode[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<Mode>("idle");
  const [createParentId, setCreateParentId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<GeoFormState>(EMPTY);
  /* نشان‌گذاری رویدادهای erp:records-changed که خودم می‌فرستم (بدون refetch دوبله) */
  const selfEventRef = React.useRef(false);
  /* Task 33 — گرهٔ انتخاب‌شده با راست‌کلیک برای حذف (تأیید = ConfirmDeleteDialog) */
  const [contextDeleteId, setContextDeleteId] = React.useState<string | null>(null);
  /* Task 82 — پرچم ویرایش ذخیره‌نشدهٔ برگه میزبان */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);
  /* Task 110 — عنوانی که فرم با آن بار شده (مبنا برای تشخیص ویرایش ترجمه) */
  const loadedTitleRef = React.useRef("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<GeoListResponse>("geo-location");
      setItems(res.items ?? []);
    } catch (e) {
      toast.error(t("geo.msg.loadError"), {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  /* ---- Task 107 (درخواست مالک) — ترجمهٔ دادهٔ رکوردها ----
     انبار DataTranslation سرویس تنظیمات (entityType = "GeoLocation").
     نقشهٔ دسته‌ای برای نمایش: کلید = شناسهٔ رکورد → زبان → عنوان ترجمه‌شده.
     خواندن دسته‌ای در چند تکهٔ ≤۵۰۰ (سقف قرارداد Task 99 — رکوردها ۸۸۱+).
     واکشی ناموفق = عناوین پایهٔ fa می‌مانند (رفتار Task 99). */
  const [trMap, setTrMap] = React.useState<
    Record<string, Record<string, string>>
  >({});
  const [trVersion, setTrVersion] = React.useState(0);
  /* Task 110 — نسخهٔ نقشهٔ ترجمه برای بازمشقِ عنوانِ زبان‌آگاهِ فرمِ باز */
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
          items?: Array<{
            entityId: number;
            fieldKey: string;
            locale: string;
            value: string;
          }>;
        }>(
          `data-translations?entityType=GeoLocation&entityIds=${chunk.join(",")}&fieldKeys=title`,
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
        /* Task 110 — فرمِ باز (عنوانِ زبان جاری) با نقشهٔ تازه بازمشق می‌شود */
        setTrEpoch((e) => e + 1);
      })
      .catch(() => {
        /* واکشی ناموفق — درخت/فهرست با عناوین پایه می‌مانند */
      });
    return () => {
      alive = false;
    };
  }, [items, trVersion]);

  /** عنوان نمایشی رکورد در زبان جاری — نبودِ ترجمه = عنوان پایهٔ fa (Task 99) */
  const displayTitle = React.useCallback(
    (n: GeoNode): string => nodeTitleIn(n, locale, trMap[String(n.id)]),
    [locale, trMap],
  );

  /* §5.6 — بازخوانی وقتی سطح دیگری رکوردهای geo-location را تغییر داد */
  React.useEffect(() => {
    const onChanged = (e: Event) => {
      if (selfEventRef.current) {
        selfEventRef.current = false;
        return;
      }
      const detail = (e as CustomEvent).detail as { entity?: string } | undefined;
      if (detail?.entity === "geo-location") void load();
    };
    window.addEventListener("erp:records-changed", onChanged);
    return () => window.removeEventListener("erp:records-changed", onChanged);
  }, [load]);

  /* ---- tree helpers ---- */
  const byId = React.useMemo(() => {
    const m = new Map<string, GeoNode>();
    for (const n of items) m.set(String(n.id), n);
    return m;
  }, [items]);

  const treeNodes = React.useMemo<SimpleTreeFormNode[]>(() => {
    const map = new Map<string, SimpleTreeFormNode>();
    for (const n of items) {
      map.set(String(n.id), {
        id: String(n.id),
        label: displayTitle(n),
        icon: <GeoTypeIcon type={n.levelType} />,
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

  const selectedNode: GeoNode | null = selectedId ? byId.get(selectedId) ?? null : null;
  const createParent: GeoNode | null =
    createParentId ? byId.get(createParentId) ?? null : null;
  const parentNodeOfSelected: GeoNode | null =
    selectedNode && selectedNode.parentRef
      ? byId.get(String(selectedNode.parentRef)) ?? null
      : null;

  /* ---- form state — الگوی derive-and-reset هنگام رندر (از BsDetail/Task 32) ----
     Task 110 — کلید بازمشق شامل زبان + نسخهٔ نقشهٔ ترجمه است تا با تغییر
     زبان، عنوانِ فرم به ترجمهٔ همان زبان تغییر کند (حکم مالک). */
  const formKey = `${mode}:${mode === "create" ? createParentId ?? "root" : selectedId ?? "-"}:${selectedNode?.version ?? "-"}:${locale}:${trEpoch}`;
  const [renderedKey, setRenderedKey] = React.useState(formKey);
  if (renderedKey !== formKey) {
    setRenderedKey(formKey);
    const nextForm =
      mode === "create"
        ? { ...EMPTY, code: String(nextSiblingCode(createParentId)) }
        : selectedNode
          ? formFromNode(selectedNode, locale, trMap[String(selectedNode.id)])
          : EMPTY;
    loadedTitleRef.current = nextForm.title.trim(); // مبنای تشخیص ویرایش ترجمه
    setForm(nextForm);
    setDirty(false); // فرم تازه/رکورد ذخیره‌شده = بدون ویرایش باز
  }

  /** پیشنهاد خودکار کد = بیشینهٔ کد خواهرها + ۱ (عین «کد: ۱» اسکرین‌شات مالک) */
  function nextSiblingCode(parentId: string | null): number {
    const pr = parentId ? Number(parentId) : 0;
    let max = 0;
    for (const n of items) {
      if (n.parentRef === pr && n.code > max) max = n.code;
    }
    return max + 1;
  }

  /* ---- navigation ---- */
  const startCreate = React.useCallback((parentId: string | null) => {
    setCreateParentId(parentId);
    setSelectedId(parentId);
    setMode("create");
  }, []);

  const handleSelect = React.useCallback((id: string) => {
    /* انتخاب ردیف درخت، ثبتِ ناتمام را رها می‌کند (رفتار Task-17) */
    setMode("view");
    setSelectedId(id);
  }, []);

  const geoCanDelete = (node: GeoNode) => node.childCount === 0;

  const geoCanHostChild = (node: GeoNode) => geoAllowedChildTypes(node.levelType).length > 0;

  /* ---- actions (معناشناسی Task-17/32) ---- */
  const handleDelete = async (node: GeoNode): Promise<boolean> => {
    try {
      await api.del(`geo-location/${node.id}`);
      toast.success(t("bs.msg.deleted"));
      if (selectedId === String(node.id)) {
        setSelectedId(null);
        setMode("idle");
      }
      await load();
      selfEventRef.current = true;
      window.dispatchEvent(
        new CustomEvent("erp:records-changed", { detail: { entity: "geo-location" } }),
      );
      return true;
    } catch (e) {
      if (e instanceof ApiError) {
        const key = (e.messageKey ?? "bs.msg.saveError") as Parameters<typeof t>[0];
        const known = ["geo.msg.deleteBlockedChildren"];
        toast.error(known.includes(key) ? t(key) : t("common.error"), {
          description: e.message,
        });
      } else {
        toast.error(t("common.error"));
      }
      return false;
    }
  };

  const handleSave = async (payload: GeoSavePayload, after: "reload" | "new" | "close") => {
    setSaving(true);
    try {
      if (mode === "create") {
        const res = await api.post<{ item: GeoNode }>("geo-location", payload);
        toast.success(t("bs.msg.saved"));
        await load();
        if (after === "new") {
          startCreate(createParentId);
        } else {
          setSelectedId(String(res.item.id));
          setMode("view");
        }
      } else if (mode === "view" && selectedNode) {
        await api.put<{ item: GeoNode }>(`geo-location/${selectedNode.id}`, payload);
        /* Task 110 — ویرایش عنوان در زبان غیر-fa = ذخیرهٔ ترجمهٔ همان زبان
           در انبار DataTranslation (عنوان پایهٔ fa دست‌نخورده می‌ماند)؛
           فقط وقتی کاربر واقعاً عنوان را عوض کرده باشد (نبودِ ترجمه =
           نمایش عنوان پایه — نباید آن را به‌عنوان ترجمه قفل کنیم) */
        if (
          locale !== "fa" &&
          form.title.trim() !== loadedTitleRef.current.trim()
        ) {
          await api.post("data-translations/save", {
            entityType: "GeoLocation",
            entityId: selectedNode.id,
            items: [{ fieldKey: "title", locale, value: form.title.trim() }],
          });
          setTrVersion((v) => v + 1); // بازخوانی نقشهٔ نمایش درخت/فهرست/فرم
        }
        toast.success(t("bs.msg.saved"));
        setDirty(false);
        await load();
        if (after === "close") onBack?.();
      }
      selfEventRef.current = true;
      window.dispatchEvent(
        new CustomEvent("erp:records-changed", { detail: { entity: "geo-location" } }),
      );
    } catch (e) {
      if (e instanceof ApiError) {
        const key = (e.messageKey ?? "bs.msg.saveError") as Parameters<typeof t>[0];
        const known = ["geo.val.codeDuplicate", "geo.val.rootCountryOnly", "geo.val.childTypeNotAllowed"];
        toast.error(known.includes(key) ? t(key) : t("bs.msg.saveError"), {
          description: e.message,
        });
      } else {
        toast.error(t("bs.msg.saveError"));
      }
    } finally {
      setSaving(false);
    }
  };

  /* ---- اعتبارسنجی + payload ----
     Task 110 — «عنوان لاتین» حذف شد؛ عنوان در fa به ستون پایه می‌رود و در
     سایر زبان‌ها فقط ترجمهٔ همان زبان ذخیره می‌شود (عنوان پایه تغییر نمی‌کند). */
  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.levelType) errs.push(t("bs.val.typeRequired"));
    if (!form.code.trim() || !Number.isInteger(Number(form.code)) || Number(form.code) < 1) {
      errs.push(t("geo.val.codeRequired"));
    }
    if (!form.title.trim()) errs.push(t("bs.val.titleRequired"));
    return errs;
  };

  const buildPayload = (): GeoSavePayload => {
    if (mode === "create") {
      return {
        parentRef: createParent ? createParent.id : 0,
        levelType: Number(form.levelType),
        code: Number(form.code),
        title: form.title.trim(),
        isActive: form.isActive,
      };
    }
    return {
      levelType: Number(form.levelType),
      /* عنوان فقط در fa به پایه می‌رود؛ در سایر زبان‌ها ترجمهٔ جدا ذخیره می‌شود */
      ...(locale === "fa" ? { title: form.title.trim() } : {}),
      isActive: form.isActive,
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

  /* ---- FormActionBar (قرارداد Task-20) ---- */
  const actionReset = () => {
    if (mode === "create") setMode("idle");
    else {
      /* گرهٔ برگ (مثل کوچه) زیرشاخه نمی‌گیرد — مثل Task-34 به ریشهٔ فرم برمی‌گردیم */
      const sel = selectedId ? byId.get(selectedId) : null;
      startCreate(sel && geoCanHostChild(sel) ? selectedId : null);
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
    /* حالت نمایش: ذخیره، بعد ورودی خالی زیر همان والد */
    const parentKey =
      selectedNode?.parentRef && selectedNode.parentRef !== 0
        ? String(selectedNode.parentRef)
        : null;
    const ok = await doValidateAndSave("reload");
    if (ok) startCreate(parentKey);
  };
  const actionSaveClose = () => {
    void doValidateAndSave("close");
  };
  const actionDelete = () => {
    if (selectedNode) void handleDelete(selectedNode);
  };
  const actionDeleteNew = async () => {
    if (!selectedNode) return;
    const ok = await handleDelete(selectedNode);
    if (ok) startCreate(null);
  };
  const actionDeleteClose = async () => {
    if (!selectedNode) return;
    const ok = await handleDelete(selectedNode);
    if (ok) onBack?.();
  };

  /* ---- لیست رکوردها (اقدام ۱۰ نوار ابزار) — عنوان ترجمه‌شده در زبان جاری ---- */
  const listItems = React.useMemo<ActionBarListItem[]>(
    () =>
      items.map((n) => ({
        id: String(n.id),
        title: displayTitle(n),
        subtitle: String(n.code),
        cells: [
          { label: t("abar.listColCode"), value: String(n.code) },
          { label: t("bs.field.title"), value: displayTitle(n) },
          { label: t("bs.field.type"), value: t(`geo.type.${n.levelType}` as never) },
          { label: t("fy.active"), value: n.isActive ? t("abar.listYes") : t("abar.listNo") },
        ],
      })),
    [items, t, displayTitle],
  );

  /* ---- فیلدهای جزئیات (قرارداد پوسته) ---- */
  const typeOptions = (() => {
    /* آیتم‌های مجاز بر اساس نوع والد؛ نوعِ خودِ گره همیشه انتخاب‌شدنی می‌ماند */
    const parentType =
      mode === "create"
        ? createParent?.levelType ?? null
        : parentNodeOfSelected?.levelType ?? null;
    const base = geoAllowedChildTypes(parentType);
    const cur =
      mode === "view" && selectedNode ? [selectedNode.levelType] : [];
    return [...new Set([...base, ...cur])].sort((a, b) => a - b);
  })();

  const typeSelectOptions = typeOptions.map((v) => ({
    value: String(v),
    label: t(`geo.type.${v}` as never),
  }));

  const fields: SimpleFormField[] = (() => {
    if (mode === "idle") return [];
    const common: SimpleFormField[] = [
      {
        id: "levelType",
        label: t("bs.field.type"),
        required: true,
        type: "select" as const,
        value: form.levelType,
        options: typeSelectOptions,
      },
      /* کد در ویرایش فقط نمایشی است (الگوی کد ساختار کسب‌وکار) */
      mode === "create"
        ? {
            id: "code",
            label: t("bs.field.code"),
            required: true,
            type: "number" as const,
            value: form.code,
          }
        : { id: "codeView", label: t("bs.field.code"), value: form.code, readOnly: true },
      { id: "title", label: t("bs.field.title"), required: true, value: form.title },
      {
        id: "isActive",
        label: t("fy.active"),
        type: "checkbox" as const,
        checked: form.isActive,
      },
    ];
    return common;
  })();

  const onFieldChange = (id: string, value: string | boolean) => {
    setDirty(true); // هر ویرایش = اطلاعات ذخیره‌نشده
    setForm((f) => ({ ...f, [id]: value }));
  };

  const detailTitleOverride =
    mode === "create"
      ? `${t("bs.action.new")} — ${t("bs.field.parent")}: ${
          createParent ? `${displayTitle(createParent)} (${createParent.code})` : t("geo.formTitle")
        }`
      : null;

  const badge = mode === "create" ? t("bs.action.new") : selectedNode ? String(selectedNode.code) : undefined;

  /* ---- Task 107 (درخواست مالک) — ترجمهٔ آنلاین/دستی رکورد باز ----
     قلاب عمومی useRecordTranslation: همین دو handler کاشی «ترجمه» را در ALL
     فرم‌های آینده فعال می‌کند؛ انبار = DataTranslation (entityType GeoLocation).
     در حالت ثبت هنوز شناسه‌ای نیست — توست راهنما (قرارداد Party)؛ فیلدِ
     قابل ترجمه = عنوان (کد عددی است). Task 110 — مبدأ ترجمه همیشه «عنوان
     پایهٔ fa» رکورد است (نه مقدار نمایشی زبان جاری). */
  const recordTr = useRecordTranslation({
    entityType: "GeoLocation",
    entityId: mode === "view" && selectedNode ? selectedNode.id : null,
    getFields: (): DataTranslationField[] => {
      const v = selectedNode?.title?.trim() ?? "";
      return v ? [{ key: "title", label: t("bs.field.title"), value: v }] : [];
    },
    /* Task 108 (درخواست مالک) — ترجمهٔ زنجیرهٔ درخت: با «ترجمهٔ آنلاین»،
       همهٔ زیرشاخه‌های سرشاخهٔ انتخابی هم ترجمه می‌شوند — کاربر نباید روی
       تک‌تک زیرشاخه‌ها کلیک کند. پیمایش والد→فرزند روی دادهٔ درختِ حاضر
       (۸۸۰ گره)؛ برگ = فهرست خالی = عین مسیر تک‌رکوردی قبلی. */
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
        treeTitle={t("geo.formTitle")}
        nodes={treeNodes}
        selectedId={selectedId}
        onSelect={(node) => {
          if (node) handleSelect(node.id);
        }}
        badge={badge}
        icon={<EarthIcon className="h-3.5 w-3.5" aria-hidden />}
        detailTitleOverride={detailTitleOverride}
        emptyText={t("bs.selectNode")}
        treeEmptyText={loading ? t("geo.loadingTree") : t("geo.emptyTree")}
        /* ریشهٔ فرم مجازی است (کشورها زیر ریشهٔ مجازی‌اند) — در ثبتِ شاخهٔ اول
           هیچ گرهی انتخاب نیست؛ پوسته با این opt-in فیلدها را نشان می‌دهد */
        forceDetail={mode === "create"}
        /* Task 106 (درخواست مالک): با باز شدن فرم، تمام شاخه‌ها جمع باشند —
           فقط کشورهای سطح ریشه دیده می‌شوند؛ انتخاب (کلیک/راست‌کلیک/پرش از
           فهرست/ذخیرهٔ رکورد جدید) مسیر والدها را خودکار باز می‌کند (پوسته) */
        defaultCollapsed
        fields={fields}
        onFieldChange={onFieldChange}
        detailExtra={
          mode === "create" ? (
            <p className="mt-2 text-[11px] text-muted-foreground">{t("bs.hint.codeAuto")}</p>
          ) : null
        }
        /* Task 33 — منوی راست‌کلیک: «افزودن زیرشاخه» فقط روی گره‌هایی که
           نوعِ والدشان زیرشاخه می‌پذیرد؛ «حذف شاخه» فقط برای گره‌های برگ */
        onAddBranch={(parent) => startCreate(parent.id)}
        canAddBranch={(node) => {
          const g = byId.get(node.id);
          return g ? geoCanHostChild(g) : false;
        }}
        onDeleteBranch={(node) => setContextDeleteId(node.id)}
        canDeleteBranch={(node) => {
          const g = byId.get(node.id);
          return g ? geoCanDelete(g) : false;
        }}
        onReset={actionReset}
        onSave={actionSave}
        onSaveNew={actionSaveNew}
        onSaveClose={actionSaveClose}
        onDelete={actionDelete}
        onDeleteNew={actionDeleteNew}
        onDeleteClose={actionDeleteClose}
        onClose={onBack}
        canSave={mode !== "idle"}
        canCopy={false}
        canDelete={Boolean(selectedNode && geoCanDelete(selectedNode))}
        canPrint={false}
        listItems={listItems}
        listLoading={loading}
        onOpenListItem={(item) => handleSelect(item.id)}
        /* Task 107 — کاشی «ترجمه» فعال: آنلاین (LLM زنجیره‌ای زیرشاخه‌ها — Task 108) + دستی (دیالوگ عمومی) */
        onTranslateOnline={recordTr.translateOnline}
        onTranslateOffline={recordTr.openTranslateOffline}
        /* زیرصفحهٔ پنجرهٔ «عمومی» — میزبان، کپشن پنجره را دارد؛ دکمهٔ ✕ هدر
           به فهرست منو برمی‌گرداند (الگوی embedded سازگار Task 35) */
        onHeaderClose={onBack}
        onHeaderMinimize={chrome?.onMinimize}
        onHeaderMaximize={chrome?.onToggleMaximize}
        headerMaximized={headerMaximized}
        onHeaderDragStart={chrome?.onDragStart}
        onHeaderDragMove={chrome?.onDragMove}
        onHeaderDragEnd={chrome?.onDragEnd}
        onHeaderDoubleClick={chrome?.onDoubleClick}
      />
      <ConfirmDeleteDialog
        open={contextDeleteId !== null}
        onOpenChange={(o) => {
          if (!o) setContextDeleteId(null);
        }}
        onConfirm={async () => {
          const g = contextDeleteId ? byId.get(contextDeleteId) : null;
          if (g) await handleDelete(g);
        }}
      />
      {recordTr.dialog}
    </>
  );
}
