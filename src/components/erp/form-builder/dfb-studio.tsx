"use client";

import * as React from "react";
import {
  AlignCenterHorizontal, AlignEndHorizontal, AlignLeft, AlignStartHorizontal, ArrowDown, ArrowUp,
  CalendarDays, Check, ChevronDown, Copy, Eye, EyeOff, FileText, FormInput, Grid3x3, Hash, History, Layers, List,
  ListTree, Loader2, MoveHorizontal, Palette, PencilLine, Plus, RotateCcw, Save, Search,
  SlidersHorizontal, Square, Trash2, Type, X,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  fetchFormDetail, dfbApi, saveFormData, loadFormData,
  fetchQueryOptionsForFields, normalizeFieldWidth,
  type DfbFormDetail,
} from "@/stores/dfb-store";
import {
  DFB_THEME_SWATCHES, dfbShellTheme, dfbBankAlign,
  type DfbFormStyle, type DfbBankAlign,
} from "@/lib/dfb-theme";
import { ACTION_BAR_KEYS, FormActionBar } from "@/components/forms/action-bar";
import { FlowFieldGrid } from "@/components/forms/form-primitives";
import type { SimpleFormField } from "@/components/forms/simple-form-two-row-tabbed";
import { cn } from "@/lib/utils";

/**
 * FormDesignStudio (Task 47) — «استودیوی طراحی فرم»: the owner-facing WYSIWYG
 * designer that opens right after the create-form wizard records the new
 * form's basic info (and from the builder tree for user forms). Center =
 * live canvas of the form shell (theme header, footer action tiles, dashed
 * «باند» containers, field cards); side rail = shell style (theme/title
 * size/font), active-band settings, active-field settings (incl. query
 * binding) and the field toolbox. Undo/redo history, preview mode and a
 * two-phase save (tabs → fresh tab ids → fields) keep it professional and
 * safe. Everything persists to the Dfb schema via dfb-service.
 *
 * Task 48 — پنج نیازمندی مالک:
 *  1) new forms carry the FULL legacy action bar (footerButtons = all keys);
 *  2) preview hides the design bands — only the fields flow under the shell;
 *  3) band field alignment (start/center/end, persisted in style.bankAlign)
 *     + «هم‌عرض کردن» equalize command;
 *  4) field width resize with the mouse (WidthSpan = percent 25..100);
 *  5) preview is a LIVE runtime: real inputs + working action bar (EAV save).
 *
 * Task 49 — سه نیازمندی مالک:
 *  1) «بانک» renamed to «باند» (band) across the studio UI;
 *  2) date fields mask to YYYY/MM/DD with automatic «/» separators;
 *  3) «add tab» in the design studio with TWO tab models — grid tab
 *     (records via the footer add button, DfbFormTab.TabKind=1) and
 *     input-fields tab (plain inputs, TabKind=2) — selectable at creation
 *     and switchable in the band settings.
 */

/* ------------------------------- model ------------------------------- */

interface StudioField {
  key: string; // stable client key
  id?: number; // DB id (loaded / last save)
  fieldKey: string; // server fieldKey (kept stable for EAV within a save generation)
  label: string;
  fieldType: string;
  required: boolean;
  readOnly: boolean;
  /** Task 48 — width percent of the flow row (25..100, step 5); legacy
      1=half/2=full rows normalize to 50/100 (normalizeFieldWidth) */
  widthSpan: number;
  queryRef: number | null;
  queryFieldKey: string | null;
}

interface StudioBank {
  key: string; // "main" | client key
  id?: number; // DfbFormTab id (loaded / last save)
  /** Task 49 — 0=main band (root fields) | 1=grid tab | 2=input-fields tab */
  tabKind: number;
  title: string;
  fields: StudioField[];
}

interface StudioShell {
  title: string;
  titleEn: string;
  badge: string;
  footerButtons: string[];
  style: DfbFormStyle;
}

interface StudioState {
  shell: StudioShell;
  /** banks[0] = «باند اصلی» (fields without a tab); banks[1..] = DfbFormTab rows */
  banks: StudioBank[];
}

const clone = (s: StudioState): StudioState => JSON.parse(JSON.stringify(s)) as StudioState;

/** Task 48 — stored footer buttons → visible action-bar keys; missing/empty
    config = the FULL legacy action bar (owner default rule) */
function storedFooterButtons(footer: Record<string, unknown>): string[] {
  const raw = footer.buttons;
  const list = Array.isArray(raw)
    ? (raw as string[]).filter((b) => (ACTION_BAR_KEYS as readonly string[]).includes(b))
    : [];
  return list.length > 0 ? list : [...ACTION_BAR_KEYS];
}

/** Task 48 — stable bank-alignment key: "main" | "tab{i}" (tab ORDER index,
    immune to tab-id regeneration on save) */
const alignKeyForBank = (bankIndex: number) => (bankIndex === 0 ? "main" : `tab${bankIndex - 1}`);

let keySeq = 0;
const nextKey = (p: string) => `${p}-${Date.now().toString(36)}-${keySeq++}`;

const FIELD_TYPE_META: Record<string, { icon: typeof Type; tile: string }> = {
  text: { icon: Type, tile: "from-teal-500 to-emerald-600" },
  number: { icon: Hash, tile: "from-emerald-500 to-green-600" },
  date: { icon: CalendarDays, tile: "from-amber-500 to-orange-600" },
  select: { icon: ChevronDown, tile: "from-violet-500 to-purple-600" },
  lookup: { icon: Search, tile: "from-rose-500 to-red-600" },
  checkbox: { icon: Check, tile: "from-lime-500 to-green-600" },
  textarea: { icon: AlignLeft, tile: "from-orange-500 to-amber-600" },
};
const FIELD_TYPES = Object.keys(FIELD_TYPE_META);

const FOOTER_TILE: Record<string, { icon: typeof Save; tile: string }> = {
  save: { icon: Save, tile: "from-teal-500 to-emerald-600" },
  saveNew: { icon: Copy, tile: "from-emerald-500 to-teal-600" },
  saveClose: { icon: X, tile: "from-teal-600 to-cyan-700" },
  reset: { icon: RotateCcw, tile: "from-amber-500 to-orange-600" },
  delete: { icon: Trash2, tile: "from-rose-500 to-red-600" },
  deleteNew: { icon: Trash2, tile: "from-red-500 to-rose-600" },
  deleteClose: { icon: X, tile: "from-rose-600 to-red-700" },
  copy: { icon: Copy, tile: "from-violet-500 to-violet-600" },
  print: { icon: FileText, tile: "from-violet-500 to-purple-600" },
  list: { icon: List, tile: "from-teal-500 to-cyan-600" },
};

const ALIGN_OPTIONS: Array<{ key: DfbBankAlign; icon: typeof AlignStartHorizontal; labelKey: string }> = [
  { key: "start", icon: AlignStartHorizontal, labelKey: "dfb.studio.alignStart" },
  { key: "center", icon: AlignCenterHorizontal, labelKey: "dfb.studio.alignCenter" },
  { key: "end", icon: AlignEndHorizontal, labelKey: "dfb.studio.alignEnd" },
];

type DragPayload =
  | { kind: "add"; fieldType: string }
  | { kind: "move"; fromBank: string; fieldKey: string };

/* ------------------------------- entry ------------------------------- */

export function FormDesignStudio({ formId }: { formId: number }) {
  /* keyed per form: every open definition mounts fresh (no setState-in-effect) */
  return <StudioInner key={formId} formId={formId} />;
}

function StudioInner({ formId }: { formId: number }) {
  const t = useT();
  const closeThisWindow = React.useCallback(() => {
    const win = useDesktop.getState().windows.find(
      (w) => w.kind === "dfb-studio" && w.appKey === String(formId),
    );
    if (win) useDesktop.getState().closeWindow(win.id);
  }, [formId]);

  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  const [isSystem, setIsSystem] = React.useState(false);
  const [template, setTemplate] = React.useState<"simpleTwoRowTabbed" | "treeForm">("simpleTwoRowTabbed");
  const [code, setCode] = React.useState("");

  /* undo/redo history — every mutation commits a snapshot;
     idx 0 = saved/loaded baseline ⇒ dirty = idx !== 0 */
  const [hist, setHist] = React.useState<{ stack: StudioState[]; idx: number } | null>(null);
  const state = hist?.stack[hist.idx] ?? null;
  const dirty = hist != null && hist.idx !== 0;

  const commit = React.useCallback((mutate: (draft: StudioState) => void) => {
    setHist((h) => {
      if (!h) return h;
      const draft = clone(h.stack[h.idx]);
      mutate(draft);
      const stack = [...h.stack.slice(0, h.idx + 1), draft].slice(-60);
      return { stack, idx: stack.length - 1 };
    });
  }, []);

  const undo = React.useCallback(() => setHist((h) => (h && h.idx > 0 ? { ...h, idx: h.idx - 1 } : h)), []);
  const redo = React.useCallback(
    () => setHist((h) => (h && h.idx < h.stack.length - 1 ? { ...h, idx: h.idx + 1 } : h)),
    [],
  );

  /* ------------------------------ load ------------------------------ */
  React.useEffect(() => {
    let alive = true;
    fetchFormDetail(formId)
      .then((d: DfbFormDetail) => {
        if (!alive) return;
        const header = (d.header ?? {}) as Record<string, unknown>;
        const footer = (d.footer ?? {}) as Record<string, unknown>;
        const style = (header.style ?? {}) as DfbFormStyle;
        const main: StudioBank = { key: "main", tabKind: 0, title: "", fields: [] };
        const tabBanks: StudioBank[] = d.tabs.map((tb) => ({
          key: `tab-${tb.id}`,
          id: tb.id,
          tabKind: tb.tabKind === 2 ? 2 : 1, // Task 49 — 1=grid | 2=input fields
          title: tb.title,
          fields: [],
        }));
        for (const f of d.fields) {
          if (f.section !== "body") continue;
          const bank =
            f.tabRef == null ? main : tabBanks.find((b) => b.id === f.tabRef) ?? main;
          bank.fields.push({
            key: `k${f.id}`,
            id: f.id,
            fieldKey: f.fieldKey,
            label: f.label,
            fieldType: f.fieldType,
            required: f.required,
            readOnly: f.readOnly,
            widthSpan: normalizeFieldWidth(f.widthSpan),
            queryRef: f.queryRef,
            queryFieldKey: f.queryFieldKey,
          });
        }
        const initial: StudioState = {
          shell: {
            title: d.title,
            titleEn: d.titleEn ?? "",
            badge: typeof header.badge === "string" ? header.badge : "",
            footerButtons: storedFooterButtons(footer),
            style,
          },
          banks: [main, ...tabBanks],
        };
        setIsSystem(d.isSystem);
        setTemplate(d.componentKey === "treeForm" ? "treeForm" : "simpleTwoRowTabbed");
        setCode(d.code);
        setHist({ stack: [initial], idx: 0 });
        setLoading(false);
      })
      .catch(() => {
        if (alive) {
          setFailed(true);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [formId]);

  /* --------------------------- selection --------------------------- */
  const [activeBankKey, setActiveBankKey] = React.useState("main");
  const [selectedFieldKey, setSelectedFieldKey] = React.useState<string | null>(null);
  const [paletteType, setPaletteType] = React.useState("text");
  const [preview, setPreview] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [metaOpen, setMetaOpen] = React.useState(false);
  const [exitConfirm, setExitConfirm] = React.useState(false);

  /* Task 48 — LIVE preview state: real inputs (data entry) + records list +
     query options; loaded lazily the first time preview opens */
  const [previewValues, setPreviewValues] = React.useState<Record<string, string | boolean>>({});
  const [previewDataId, setPreviewDataId] = React.useState<number | null>(null);
  const [previewRecords, setPreviewRecords] = React.useState<
    Array<{ dataId: number; values: Record<string, string | boolean> }>
  >([]);
  const [previewOptions, setPreviewOptions] = React.useState<
    Record<number, Array<{ value: string; label: string }>>
  >({});
  const [previewExtrasLoaded, setPreviewExtrasLoaded] = React.useState(false);

  /* Task 48 — bank resize gesture: live width of the dragged field card */
  const [resizing, setResizing] = React.useState<{ key: string; pct: number } | null>(null);

  const [queries, setQueries] = React.useState<Array<{ id: number; title: string; fields: Array<{ fieldName: string }> }>>([]);
  React.useEffect(() => {
    let alive = true;
    dfbApi.get<{ items: Array<{ id: number; title: string; fields: Array<{ fieldName: string }> }> }>("queries")
      .then((res) => {
        if (alive) setQueries(res.items ?? []);
      })
      .catch(() => { /* optional */ });
    return () => {
      alive = false;
    };
  }, []);

  const activeBank = state?.banks.find((b) => b.key === activeBankKey) ?? state?.banks[0] ?? null;
  const selectedField: StudioField | null = React.useMemo(() => {
    if (!state || !selectedFieldKey) return null;
    for (const b of state.banks) {
      const hit = b.fields.find((f) => f.key === selectedFieldKey);
      if (hit) return hit;
    }
    return null;
  }, [state, selectedFieldKey]);

  /* ---------------- Task 48 — alignment / equalize commands ---------------- */
  const setBankAlign = React.useCallback(
    (bankIndex: number, a: DfbBankAlign) => {
      commit((d) => {
        d.shell.style.bankAlign = { ...(d.shell.style.bankAlign ?? {}), [alignKeyForBank(bankIndex)]: a };
      });
    },
    [commit],
  );

  const equalizeBank = React.useCallback(
    (bankKey: string) => {
      commit((d) => {
        const bank = d.banks.find((b) => b.key === bankKey);
        if (!bank || bank.fields.length === 0) return;
        const counts = new Map<number, number>();
        for (const f of bank.fields) counts.set(f.widthSpan, (counts.get(f.widthSpan) ?? 0) + 1);
        let best = bank.fields[0].widthSpan;
        let bestN = 0;
        for (const [w, n] of counts) {
          if (n > bestN || (n === bestN && w === 50)) {
            best = w;
            bestN = n;
          }
        }
        for (const f of bank.fields) f.widthSpan = best;
      });
    },
    [commit],
  );

  /* ---------------- Task 48 — LIVE preview data entry ---------------- */

  const mapLoadedRecords = React.useCallback(
    (
      items: Awaited<ReturnType<typeof loadFormData>>,
      fields: StudioField[],
    ): Array<{ dataId: number; values: Record<string, string | boolean> }> =>
      items.map((it) => ({
        dataId: it.dataId,
        values: Object.fromEntries(
          it.values.map((v) => {
            const fld = fields.find((f) => f.id === v.fieldRef);
            const isBool = fld?.fieldType === "checkbox";
            return [fld ? fld.key : String(v.fieldRef), isBool ? v.value === "1" : (v.value ?? "")];
          }),
        ),
      })),
    [],
  );

  const togglePreview = React.useCallback(() => {
    const next = !preview;
    setPreview(next);
    if (next && !previewExtrasLoaded && state) {
      setPreviewExtrasLoaded(true);
      const fields = state.banks.flatMap((b) => b.fields);
      fetchQueryOptionsForFields(
        fields.map((f) => ({ queryRef: f.queryRef, queryFieldKey: f.queryFieldKey, fieldType: f.fieldType })),
      )
        .then(setPreviewOptions)
        .catch(() => { /* options are best-effort */ });
      loadFormData(formId)
        .then((items) => setPreviewRecords(mapLoadedRecords(items, fields)))
        .catch(() => { /* record list is best-effort */ });
    }
  }, [preview, previewExtrasLoaded, state, formId, mapLoadedRecords]);

  const previewSave = React.useCallback(async () => {
    if (!state || busy) return;
    const fields = state.banks.flatMap((b) => b.fields);
    const missing = fields.filter(
      (f) => f.id != null && f.required &&
        (previewValues[f.key] === undefined || previewValues[f.key] === ""),
    );
    if (missing.length > 0) {
      toast.error(`${t("dfb.requiredFieldsMissing")}: ${missing.map((m) => m.label).join("، ")}`);
      return;
    }
    const unsaved = fields.filter(
      (f) => f.id == null && previewValues[f.key] !== undefined && previewValues[f.key] !== "",
    );
    if (unsaved.length > 0) toast.info(t("dfb.studio.unsavedFieldsHint"));
    const payload: Record<string, string | boolean | null> = {};
    for (const f of fields) {
      if (f.id == null) continue;
      const v = previewValues[f.key];
      if (v === undefined) continue;
      payload[String(f.id)] = f.fieldType === "checkbox" ? Boolean(v) : String(v);
    }
    setBusy(true);
    try {
      const res = await saveFormData(formId, payload);
      setPreviewDataId(res.dataId);
      toast.success(t("abar.savedToast"));
      const items = await loadFormData(formId);
      setPreviewRecords(mapLoadedRecords(items, fields));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  }, [state, busy, previewValues, formId, t, mapLoadedRecords]);

  const previewReset = React.useCallback(() => {
    setPreviewValues({});
    setPreviewDataId(null);
  }, []);

  const previewCopy = React.useCallback(() => {
    setPreviewDataId(null);
    toast.info(t("abar.copy"));
  }, [t]);

  const previewOpenRecord = React.useCallback(
    (dataId: string) => {
      const rec = previewRecords.find((r) => String(r.dataId) === dataId);
      if (!rec) return;
      setPreviewValues(rec.values);
      setPreviewDataId(rec.dataId);
    },
    [previewRecords],
  );

  const previewDelete = React.useCallback(() => {
    if (previewDataId == null) {
      toast.info(t("dfb.noRecordSelected"));
      return;
    }
    previewReset();
    toast.success(t("abar.resetToast"));
  }, [previewDataId, previewReset, t]);

  const previewSaveClose = React.useCallback(async () => {
    await previewSave();
    setPreview(false);
  }, [previewSave]);

  /* --------------------------- mutations --------------------------- */
  const addField = React.useCallback(
    (bankKey: string, fieldType: string, beforeFieldKey?: string | null) => {
      if (isSystem) return;
      commit((d) => {
        const bank = d.banks.find((b) => b.key === bankKey) ?? d.banks[0];
        const field: StudioField = {
          key: nextKey("f"),
          fieldKey: "",
          label: t(`dfb.type.${fieldType}` as never),
          fieldType,
          required: false,
          readOnly: false,
          widthSpan: 50,
          queryRef: null,
          queryFieldKey: null,
        };
        const at = beforeFieldKey ? bank.fields.findIndex((f) => f.key === beforeFieldKey) : -1;
        if (at >= 0) bank.fields.splice(at, 0, field);
        else bank.fields.push(field);
      });
      setActiveBankKey(bankKey);
    },
    [commit, isSystem, t],
  );

  const moveFieldDir = React.useCallback(
    (bankKey: string, fieldKey: string, dir: -1 | 1) => {
      commit((d) => {
        const bank = d.banks.find((b) => b.key === bankKey);
        if (!bank) return;
        const i = bank.fields.findIndex((f) => f.key === fieldKey);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= bank.fields.length) return;
        [bank.fields[i], bank.fields[j]] = [bank.fields[j], bank.fields[i]];
      });
    },
    [commit],
  );

  const removeField = React.useCallback(
    (bankKey: string, fieldKey: string) => {
      commit((d) => {
        const bank = d.banks.find((b) => b.key === bankKey);
        if (!bank) return;
        bank.fields = bank.fields.filter((f) => f.key !== fieldKey);
      });
      setSelectedFieldKey((k) => (k === fieldKey ? null : k));
    },
    [commit],
  );

  const moveFieldToBank = React.useCallback(
    (fromBank: string, fieldKey: string, toBank: string, beforeFieldKey?: string | null) => {
      if (fromBank === toBank && !beforeFieldKey) return;
      commit((d) => {
        const src = d.banks.find((b) => b.key === fromBank);
        if (!src) return;
        const i = src.fields.findIndex((f) => f.key === fieldKey);
        if (i < 0) return;
        const [field] = src.fields.splice(i, 1);
        const dst = d.banks.find((b) => b.key === toBank);
        if (!dst) {
          src.fields.splice(i, 0, field); // rollback
          return;
        }
        const at = beforeFieldKey ? dst.fields.findIndex((f) => f.key === beforeFieldKey) : -1;
        if (at >= 0) dst.fields.splice(at, 0, field);
        else dst.fields.push(field);
      });
      setActiveBankKey(toBank);
    },
    [commit],
  );

  const reorderField = React.useCallback(
    (fromBank: string, fieldKey: string, toBank: string, beforeFieldKey: string | null) => {
      if (fromBank === toBank) {
        // same bank — move relative to the drop target
        commit((d) => {
          const bank = d.banks.find((b) => b.key === toBank);
          if (!bank) return;
          const i = bank.fields.findIndex((f) => f.key === fieldKey);
          if (i < 0) return;
          const [field] = bank.fields.splice(i, 1);
          const at = beforeFieldKey ? bank.fields.findIndex((f) => f.key === beforeFieldKey) : -1;
          if (at >= 0) bank.fields.splice(at, 0, field);
          else bank.fields.push(field);
        });
      } else {
        moveFieldToBank(fromBank, fieldKey, toBank, beforeFieldKey);
      }
    },
    [commit, moveFieldToBank],
  );

  const updateField = React.useCallback(
    (fieldKey: string, patch: Partial<StudioField>) => {
      commit((d) => {
        for (const b of d.banks) {
          const f = b.fields.find((x) => x.key === fieldKey);
          if (f) {
            Object.assign(f, patch);
            return;
          }
        }
      });
    },
    [commit],
  );

  const addBank = React.useCallback(
    (tabKind: 1 | 2) => {
      if (isSystem) return;
      commit((d) => {
        d.banks.push({
          key: nextKey("bank"),
          tabKind, // Task 49 — 1=grid (records via footer add) | 2=input fields
          title: `${t("dfb.studio.bankTitle")} ${d.banks.length}`,
          fields: [],
        });
      });
    },
    [commit, isSystem, t],
  );

  /** Task 49 — switch a tab band's model (grid ↔ input fields) */
  const updateBankKind = React.useCallback(
    (bankKey: string, tabKind: 1 | 2) => {
      commit((d) => {
        const bank = d.banks.find((b) => b.key === bankKey);
        if (bank && bank.key !== "main") bank.tabKind = tabKind;
      });
    },
    [commit],
  );

  const removeBank = React.useCallback(
    (bankKey: string) => {
      commit((d) => {
        if (d.banks.length <= 1) return;
        const i = d.banks.findIndex((b) => b.key === bankKey);
        if (i <= 0) return; // main bank is not removable
        d.banks.splice(i, 1);
      });
      setActiveBankKey("main");
      setSelectedFieldKey(null);
    },
    [commit],
  );

  const moveBankDir = React.useCallback(
    (bankKey: string, dir: -1 | 1) => {
      commit((d) => {
        const i = d.banks.findIndex((b) => b.key === bankKey);
        if (i <= 0) return;
        const j = i + dir;
        if (j < 1 || j >= d.banks.length) return;
        [d.banks[i], d.banks[j]] = [d.banks[j], d.banks[i]];
      });
    },
    [commit],
  );

  const updateBankTitle = React.useCallback(
    (bankKey: string, title: string) => {
      commit((d) => {
        const bank = d.banks.find((b) => b.key === bankKey);
        if (bank && bank.key !== "main") bank.title = title;
      });
    },
    [commit],
  );

  /* ------------------------------ save ------------------------------ */
  const save = React.useCallback(async () => {
    if (!state || busy) return;
    const invalid = state.banks.flatMap((b) => b.fields).find((f) => !f.label.trim());
    if (invalid) {
      toast.error(t("dfb.studio.labelRequired"));
      return;
    }
    setBusy(true);
    try {
      const style = state.shell.style;
      const hasStyle = Boolean(
        style.theme || style.titleSize || style.font ||
        (style.bankAlign && Object.keys(style.bankAlign).length > 0),
      );
      const metaPayload: Record<string, unknown> = {
        title: state.shell.title.trim(),
        titleEn: state.shell.titleEn.trim() || undefined,
        header: {
          ...(state.shell.badge.trim() ? { badge: state.shell.badge.trim() } : {}),
          ...(hasStyle ? { style } : {}),
        },
        footer: { buttons: state.shell.footerButtons },
      };
      if (!isSystem) {
        metaPayload.tabs = state.banks
          .slice(1)
          .map((b, i) => ({ title: b.title.trim(), orderIndex: i, tabKind: b.tabKind === 2 ? 2 : 1 }));
      }
      /* phase 1 — meta/style/tabs (tabs regenerate → fresh ids);
         the update endpoint answers with the saved item itself */
      const saved = await dfbApi.put<DfbFormDetail>(`forms/${formId}`, metaPayload);
      if (!isSystem) {
        /* phase 2 — fields against the FRESH tab ids */
        const tabIds = (saved.tabs ?? []).map((tb) => tb.id);
        let seq = 0;
        const fields = state.banks.flatMap((b, bi) =>
          b.fields.map((f) => {
            const orderIndex = seq++;
            return {
              fieldKey: f.fieldKey || `f${orderIndex + 1}_${f.fieldType}`,
              label: f.label.trim(),
              fieldType: f.fieldType,
              required: f.required,
              readOnly: f.readOnly,
              widthSpan: f.widthSpan,
              orderIndex,
              tabRef: bi === 0 ? undefined : tabIds[bi - 1],
              queryRef: f.queryRef ?? undefined,
              queryFieldKey: f.queryFieldKey ?? undefined,
            };
          }),
        );
        await dfbApi.put(`forms/${formId}`, { fields });
      }
      /* refresh baseline from the server (fresh ids for the next save) */
      const d = await fetchFormDetail(formId);
      const header = (d.header ?? {}) as Record<string, unknown>;
      const main: StudioBank = { key: "main", tabKind: 0, title: "", fields: [] };
      const tabBanks: StudioBank[] = d.tabs.map((tb) => ({
        key: `tab-${tb.id}`,
        id: tb.id,
        tabKind: tb.tabKind === 2 ? 2 : 1, // Task 49
        title: tb.title,
        fields: [],
      }));
      for (const f of d.fields) {
        if (f.section !== "body") continue;
        const bank = f.tabRef == null ? main : tabBanks.find((b) => b.id === f.tabRef) ?? main;
        bank.fields.push({
          key: `k${f.id}`,
          id: f.id,
          fieldKey: f.fieldKey,
          label: f.label,
          fieldType: f.fieldType,
          required: f.required,
          readOnly: f.readOnly,
          widthSpan: normalizeFieldWidth(f.widthSpan),
          queryRef: f.queryRef,
          queryFieldKey: f.queryFieldKey,
        });
      }
      const baseline: StudioState = {
        shell: {
          title: d.title,
          titleEn: d.titleEn ?? "",
          badge: typeof header.badge === "string" ? header.badge : "",
          footerButtons: state.shell.footerButtons,
          style: state.shell.style,
        },
        banks: [main, ...tabBanks],
      };
      setHist({ stack: [baseline], idx: 0 });
      toast.success(t("dfb.savedToast"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  }, [state, busy, formId, isSystem, t]);

  /* ------------------------- exit with guard ------------------------- */
  const requestExit = React.useCallback(() => {
    if (hist && hist.idx !== 0) setExitConfirm(true);
    else closeThisWindow();
  }, [hist, closeThisWindow]);

  /* ------------------------------ render ------------------------------ */
  if (loading) {
    return (
      <div className="grid h-full place-items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        {t("common.loading")}
      </div>
    );
  }
  if (failed || !state) {
    return <div className="grid h-full place-items-center p-6 text-sm text-muted-foreground">{t("dfb.formNotFound")}</div>;
  }

  const theme = dfbShellTheme(state.shell.style);
  const canUndo = hist != null && hist.idx > 0;
  const canRedo = hist != null && hist.idx < hist.stack.length - 1;
  const activeBankIndex = state.banks.findIndex((b) => b.key === activeBankKey);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* ══════════ toolbar ══════════ */}
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border/60 bg-background/70 px-3 py-2 backdrop-blur-sm">
        <span className="me-1 flex items-center gap-1.5 text-sm font-semibold">
          <Palette className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden />
          {t("dfb.studio.title")}
        </span>
        <Badge variant="secondary" className="max-w-40 truncate text-[10px]">{state.shell.title}</Badge>
        <Badge variant="outline" className="gap-1 text-[10px]">
          {template === "treeForm" ? (
            <><ListTree className="h-3 w-3" aria-hidden />{t("dfb.template.tree")}</>
          ) : (
            <><FileText className="h-3 w-3" aria-hidden />{t("dfb.template.simple")}</>
          )}
        </Badge>

        <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />

        <Button type="button" size="sm" variant="outline" onClick={() => setMetaOpen(true)}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("dfb.studio.meta")}</span>
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={!canUndo} onClick={undo} aria-label={t("dfb.studio.undo")} title={t("dfb.studio.undo")}>
          <History className="h-4 w-4 rotate-90" aria-hidden />
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={!canRedo} onClick={redo} aria-label={t("dfb.studio.redo")} title={t("dfb.studio.redo")}>
          <History className="h-4 w-4 -rotate-90" aria-hidden />
        </Button>
        <Button
          type="button" size="sm" variant={preview ? "secondary" : "ghost"}
          onClick={togglePreview}
          aria-label={preview ? t("dfb.studio.editMode") : t("dfb.studio.preview")}
          title={preview ? t("dfb.studio.editMode") : t("dfb.studio.preview")}
        >
          {preview ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </Button>

        <span className="ms-auto flex items-center gap-1.5">
          <span className="hidden font-mono text-[10px] text-muted-foreground md:inline" dir="ltr">{code}</span>
          <Button type="button" size="sm" onClick={save} disabled={busy || !dirty} aria-label={t("dfb.studio.save")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            <span className="hidden sm:inline">{t("dfb.studio.save")}</span>
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={requestExit} aria-label={t("dfb.studio.exit")} title={t("dfb.studio.exit")}>
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </span>
      </div>

      {/* ══════════ workspace ══════════ */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* ---------- canvas ---------- */}
        <ScrollArea className="max-lg:min-h-56 min-h-0 flex-1 bg-muted/30">
          <div className="mx-auto w-full max-w-3xl p-3 sm:p-5">
            {/* mock form shell */}
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-lg">
              {/* shell header (theme) */}
              <header
                className={cn(
                  "relative flex h-11 select-none items-center gap-2.5 px-3 text-white rtl:bg-gradient-to-l ltr:bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600",
                  theme.headerClassName,
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20 shadow-inner" aria-hidden>
                  <FileText className="h-3.5 w-3.5" />
                </span>
                <h2 className={cn("truncate font-bold tracking-tight drop-shadow-sm", theme.titleClassName)}>
                  {state.shell.title}
                </h2>
                {state.shell.badge && (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-inset ring-white/25">
                    {state.shell.badge}
                  </span>
                )}
                <span className="ms-auto flex items-center gap-0.5 opacity-80" aria-hidden>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg"><Square className="h-3 w-3" /></span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg"><X className="h-4 w-4" /></span>
                </span>
                <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/25" />
              </header>
              {/* Task 48 — preview = the RUNNING form minus design bands:
                  real action bar + interactive field flow (data entry) */}
              {preview ? (
                <PreviewCanvas
                  state={state}
                  values={previewValues}
                  options={previewOptions}
                  records={previewRecords}
                  dataId={previewDataId}
                  align={dfbBankAlign(state.shell.style, "main")}
                  busy={busy}
                  onFieldChange={(key, v) => setPreviewValues((pv) => ({ ...pv, [key]: v }))}
                  onSave={previewSave}
                  onSaveClose={previewSaveClose}
                  onReset={previewReset}
                  onCopy={previewCopy}
                  onDelete={previewDelete}
                  onPrint={() => window.print()}
                  onExitPreview={() => setPreview(false)}
                  onOpenRecord={previewOpenRecord}
                />
              ) : (
                <>
                  {/* shell action strip (footer buttons as decorative tiles) */}
                  <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 bg-muted/40 px-3 py-2" aria-hidden>
                    {state.shell.footerButtons.map((b) => {
                      const tile = FOOTER_TILE[b] ?? FOOTER_TILE.save;
                      const Icon = tile.icon;
                      return (
                        <span
                          key={b}
                          className={cn("flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm", tile.tile)}
                        >
                          <Icon className="h-3 w-3" />
                        </span>
                      );
                    })}
                    <span className="rounded-md border border-border/60 bg-background/60 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                      {t("dfb.studio.editMode")}
                    </span>
                  </div>
                  {/* shell body (font) */}
                  <div className="p-3 sm:p-4" style={theme.bodyStyle}>
                    {state.banks.map((bank, bi) => (
                      <BankCanvas
                        key={bank.key}
                        bank={bank}
                        index={bi}
                        isMain={bi === 0}
                        active={activeBankKey === bank.key}
                        align={dfbBankAlign(state.shell.style, alignKeyForBank(bi))}
                        resizing={resizing}
                        onResizeLive={setResizing}
                        onResizeCommit={(fieldKey, pct) => {
                          setResizing(null);
                          updateField(fieldKey, { widthSpan: pct });
                        }}
                        selectedFieldKey={selectedFieldKey}
                        isSystem={isSystem}
                        onSelectBank={() => setActiveBankKey(bank.key)}
                        onSelectField={(k) => {
                          setActiveBankKey(bank.key);
                          setSelectedFieldKey(k);
                        }}
                        onAddField={() => addField(bank.key, paletteType)}
                        onMoveFieldDir={(k, dir) => moveFieldDir(bank.key, k, dir)}
                        onRemoveField={(k) => removeField(bank.key, k)}
                        onMoveBank={(dir) => moveBankDir(bank.key, dir)}
                        onRemoveBank={() => removeBank(bank.key)}
                        onDragStartField={(fieldKey) => {
                          dragRef.current = { kind: "move", fromBank: bank.key, fieldKey };
                        }}
                        onDropInBank={(beforeKey) => {
                          const p = dragRef.current;
                          if (!p) return;
                          if (p.kind === "add") addField(bank.key, p.fieldType, beforeKey);
                          else reorderField(p.fromBank, p.fieldKey, bank.key, beforeKey);
                          dragRef.current = null;
                        }}
                      />
                    ))}
                    {!isSystem && (
                      <div className="mt-3 rounded-2xl border border-dashed border-teal-600/50 bg-teal-500/5 px-3 py-2.5">
                        {/* Task 49 — «add tab» in the studio: two tab models
                            (grid = records via the footer add button,
                             input fields = plain inputs, no grid) */}
                        <p className="mb-2 text-center text-[11px] font-medium text-teal-700 dark:text-teal-400">
                          {t("dfb.studio.addBank")}
                        </p>
                        <div className="flex flex-col gap-1.5 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => addBank(1)}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-teal-600/50 bg-background/70 px-4 py-2.5 text-sm font-medium text-teal-700 transition-all hover:border-teal-600 hover:bg-teal-500/10 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-teal-400"
                          >
                            <Grid3x3 className="h-4 w-4" aria-hidden />
                            {t("dfb.studio.addGridTab")}
                          </button>
                          <button
                            type="button"
                            onClick={() => addBank(2)}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-500/50 bg-background/70 px-4 py-2.5 text-sm font-medium text-violet-700 transition-all hover:border-violet-500 hover:bg-violet-500/10 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-violet-400"
                          >
                            <FormInput className="h-4 w-4" aria-hidden />
                            {t("dfb.studio.addFieldsTab")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* ---------- settings rail ---------- */}
        <aside
          aria-label={t("dfb.studio.title")}
          className="flex max-lg:max-h-[55vh] w-full shrink-0 flex-col border-border/60 bg-background/60 lg:w-80 lg:border-s"
        >
          <ScrollArea className="min-h-0 flex-1">
            <div className="grid gap-4 p-4">
              {/* Task 48 — preview hint (data entry mode) */}
              {preview && (
                <p className="rounded-xl border border-teal-600/40 bg-teal-500/5 p-2.5 text-[11px] leading-relaxed text-teal-700 dark:text-teal-400">
                  {t("dfb.studio.previewHint")}
                </p>
              )}

              {/* palette */}
              {!isSystem && !preview && (
                <section aria-label={t("dfb.studio.palette")} className="grid gap-2">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    {t("dfb.studio.palette")}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground/90">{t("dfb.studio.paletteHint")}</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {FIELD_TYPES.map((ft) => {
                      const meta = FIELD_TYPE_META[ft];
                      const Icon = meta.icon;
                      const active = paletteType === ft;
                      return (
                        <button
                          key={ft}
                          type="button"
                          aria-pressed={active}
                          draggable
                          onDragStart={(e) => {
                            dragRef.current = { kind: "add", fieldType: ft };
                            e.dataTransfer.effectAllowed = "copy";
                            try { e.dataTransfer.setData("text/plain", ft); } catch { /* jsdom */ }
                          }}
                          onDragEnd={() => { dragRef.current = null; }}
                          onClick={() => {
                            setPaletteType(ft);
                            addField(activeBankKey, ft);
                          }}
                          title={t(`dfb.type.${ft}` as never)}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-xl border p-2 transition-all",
                            active
                              ? "border-teal-500/60 bg-teal-500/10 shadow-sm"
                              : "border-border/60 hover:border-foreground/25 hover:shadow-sm",
                          )}
                        >
                          <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm", meta.tile)}>
                            <Icon className="h-3.5 w-3.5" aria-hidden />
                          </span>
                          <span className="w-full truncate text-center text-[10px] leading-tight">
                            {t(`dfb.type.${ft}` as never)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* shell style */}
              <section aria-label={t("dfb.studio.shellStyle")} className="grid gap-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Palette className="h-3.5 w-3.5" aria-hidden />
                  {t("dfb.studio.shellStyle")}
                </h3>
                <div className="grid gap-1.5">
                  <Label className="text-[11px] text-muted-foreground">{t("dfb.studio.theme")}</Label>
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 p-2.5">
                    {DFB_THEME_SWATCHES.map((sw) => (
                      <button
                        key={sw.key}
                        type="button"
                        aria-pressed={state.shell.style.theme === sw.key}
                        aria-label={sw.key}
                        title={sw.key}
                        onClick={() => commit((d) => { d.shell.style.theme = sw.key; })}
                        className={cn(
                          "flex h-8 w-11 items-center justify-center rounded-lg bg-gradient-to-br shadow-md transition-all hover:scale-105",
                          sw.tile,
                          state.shell.style.theme === sw.key && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                        )}
                      >
                        {state.shell.style.theme === sw.key && <Check className="h-4 w-4 text-white" aria-hidden />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label className="text-[11px] text-muted-foreground">{t("dfb.studio.titleSize")}</Label>
                    <Select
                      value={state.shell.style.titleSize ?? "md"}
                      onValueChange={(v) => commit((d) => { d.shell.style.titleSize = v; })}
                    >
                      <SelectTrigger aria-label={t("dfb.studio.titleSize")} className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sm">{t("dfb.studio.size.sm")}</SelectItem>
                        <SelectItem value="md">{t("dfb.studio.size.md")}</SelectItem>
                        <SelectItem value="lg">{t("dfb.studio.size.lg")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-[11px] text-muted-foreground">{t("dfb.studio.font")}</Label>
                    <Select
                      value={state.shell.style.font ?? "sans"}
                      onValueChange={(v) => commit((d) => { d.shell.style.font = v; })}
                    >
                      <SelectTrigger aria-label={t("dfb.studio.font")} className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sans">{t("dfb.studio.font.sans")}</SelectItem>
                        <SelectItem value="serif">{t("dfb.studio.font.serif")}</SelectItem>
                        <SelectItem value="mono">{t("dfb.studio.font.mono")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="rounded-xl border border-dashed border-border/70 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  {t("dfb.studio.styleHint")}
                </p>
              </section>

              {/* active bank settings */}
              {activeBank && !preview && (
                <section aria-label={t("dfb.studio.bankSettings")} className="grid gap-2">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" aria-hidden />
                    {t("dfb.studio.bankSettings").replace("{n}", String(activeBankIndex + 1))}
                  </h3>
                  <div className="grid gap-1.5">
                    <Label className="text-[11px] text-muted-foreground">{t("dfb.studio.bankTitle")}</Label>
                    <Input
                      value={activeBank.key === "main" ? t("dfb.studio.bankMain") : activeBank.title}
                      readOnly={activeBank.key === "main"}
                      onChange={(e) => updateBankTitle(activeBank.key, e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-[11px] text-muted-foreground">{t("dfb.studio.bankParent")}</Label>
                    <Select value={activeBank.key === "main" ? "root" : "tab"} disabled>
                      <SelectTrigger aria-label={t("dfb.studio.bankParent")} className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="root">{t("dfb.studio.parentRoot")}</SelectItem>
                        <SelectItem value="tab">{t("dfb.studio.parentTab")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Task 49 — band model: grid (records via footer add button)
                      vs input fields (plain inputs, no grid) — switchable */}
                  {activeBank.key !== "main" && (
                    <div className="grid gap-1.5">
                      <Label className="text-[11px] text-muted-foreground">{t("dfb.studio.bankKind")}</Label>
                      <Select
                        value={activeBank.tabKind === 2 ? "fields" : "grid"}
                        onValueChange={(v) => updateBankKind(activeBank.key, v === "fields" ? 2 : 1)}
                        disabled={isSystem}
                      >
                        <SelectTrigger aria-label={t("dfb.studio.bankKind")} className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">{t("dfb.studio.bankKindGrid")}</SelectItem>
                          <SelectItem value="fields">{t("dfb.studio.bankKindFields")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {/* Task 48 — bank field alignment (start/center/end, persisted
                      in headerJson.style.bankAlign) + equalize-widths command */}
                  {!isSystem && (
                    <div className="grid gap-1.5">
                      <Label className="text-[11px] text-muted-foreground">{t("dfb.studio.align")}</Label>
                      <div className="flex items-center gap-1 rounded-xl border border-border/60 p-1">
                        {ALIGN_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          const on = dfbBankAlign(state.shell.style, alignKeyForBank(activeBankIndex)) === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              aria-pressed={on}
                              title={t(opt.labelKey as never)}
                              aria-label={t(opt.labelKey as never)}
                              onClick={() => setBankAlign(activeBankIndex, opt.key)}
                              className={cn(
                                "flex h-7 flex-1 items-center justify-center rounded-lg transition-colors",
                                on
                                  ? "bg-teal-500/15 text-teal-700 ring-1 ring-teal-500/40 dark:text-teal-400"
                                  : "text-muted-foreground hover:bg-foreground/5",
                              )}
                            >
                              <Icon className="h-4 w-4" aria-hidden />
                            </button>
                          );
                        })}
                        <span aria-hidden className="mx-0.5 h-5 w-px bg-border" />
                        <button
                          type="button"
                          title={t("dfb.studio.equalize")}
                          aria-label={t("dfb.studio.equalize")}
                          onClick={() => equalizeBank(activeBank.key)}
                          className="flex h-7 flex-1 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5"
                        >
                          <MoveHorizontal className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground/90">{t("dfb.studio.alignHint")}</p>
                    </div>
                  )}
                  {activeBank.key !== "main" && (
                    <div className="flex items-center gap-1.5">
                      <Button type="button" size="sm" variant="outline" className="h-8 flex-1" onClick={() => moveBankDir(activeBank.key, -1)} disabled={activeBankIndex <= 1}>
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden /> {t("dfb.studio.moveUp")}
                      </Button>
                      <Button type="button" size="sm" variant="outline" className="h-8 flex-1" onClick={() => moveBankDir(activeBank.key, 1)} disabled={activeBankIndex >= state.banks.length - 1}>
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden /> {t("dfb.studio.moveDown")}
                      </Button>
                      <Button
                        type="button" size="sm" variant="outline"
                        className="h-8 text-rose-600 hover:text-rose-700"
                        disabled={activeBank.fields.length > 0}
                        title={activeBank.fields.length > 0 ? t("dfb.studio.bankDeleteHint") : t("common.delete")}
                        onClick={() => removeBank(activeBank.key)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </div>
                  )}
                </section>
              )}

              {/* active field settings */}
              {!preview && (
                <section aria-label={t("dfb.studio.fieldSettings")} className="grid gap-2">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <PencilLine className="h-3.5 w-3.5" aria-hidden />
                    {t("dfb.studio.fieldSettings")}
                  </h3>
                  {!selectedField ? (
                    <p className="rounded-xl border border-dashed border-border/70 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                      {t("dfb.studio.fieldSettingsHint")}
                    </p>
                  ) : (
                    <div className="grid gap-2 rounded-xl border border-border/60 p-2.5">
                      <div className="grid gap-1.5">
                        <Label className="text-[11px] text-muted-foreground">{t("dfb.fieldLabel")}</Label>
                        <Input
                          value={selectedField.label}
                          onChange={(e) => updateField(selectedField.key, { label: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1.5">
                          <Label className="text-[11px] text-muted-foreground">{t("dfb.fieldType")}</Label>
                          <Select
                            value={selectedField.fieldType}
                            onValueChange={(v) => updateField(selectedField.key, { fieldType: v, queryRef: null, queryFieldKey: null })}
                          >
                            <SelectTrigger aria-label={t("dfb.fieldType")} className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {FIELD_TYPES.map((ft) => (
                                <SelectItem key={ft} value={ft}>{t(`dfb.type.${ft}` as never)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-[11px] text-muted-foreground">{t("dfb.width")}</Label>
                          <Select
                            value={String(selectedField.widthSpan)}
                            onValueChange={(v) => updateField(selectedField.key, { widthSpan: Number(v) })}
                          >
                            <SelectTrigger aria-label={t("dfb.width")} className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {[25, 50, 75, 100].map((w) => (
                                <SelectItem key={w} value={String(w)}>
                                  <span dir="ltr" className="font-mono">{w}%</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                          <Checkbox
                            checked={selectedField.required}
                            onCheckedChange={(v) => updateField(selectedField.key, { required: Boolean(v) })}
                            aria-label={t("dfb.required")}
                          />
                          {t("dfb.required")}
                        </label>
                        <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                          <Checkbox
                            checked={selectedField.readOnly}
                            onCheckedChange={(v) => updateField(selectedField.key, { readOnly: Boolean(v) })}
                            aria-label={t("dfb.studio.readOnly")}
                          />
                          {t("dfb.studio.readOnly")}
                        </label>
                      </div>
                      {(selectedField.fieldType === "select" || selectedField.fieldType === "lookup") && (
                        <>
                          <div className="grid gap-1.5">
                            <Label className="text-[11px] text-muted-foreground">{t("dfb.queryBind")}</Label>
                            <Select
                              value={selectedField.queryRef != null ? String(selectedField.queryRef) : "-"}
                              onValueChange={(v) =>
                                updateField(selectedField.key, {
                                  queryRef: v === "-" ? null : Number(v),
                                  queryFieldKey: null,
                                })
                              }
                            >
                              <SelectTrigger aria-label={t("dfb.queryBind")} className="h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="-">{t("dfb.noQuery")}</SelectItem>
                                {queries.map((q) => (
                                  <SelectItem key={q.id} value={String(q.id)}>{q.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {selectedField.queryRef != null && (
                            <div className="grid gap-1.5">
                              <Label className="text-[11px] text-muted-foreground">{t("dfb.queryValueColumn")}</Label>
                              <Select
                                value={selectedField.queryFieldKey ?? "-"}
                                onValueChange={(v) => updateField(selectedField.key, { queryFieldKey: v === "-" ? null : v })}
                              >
                                <SelectTrigger aria-label={t("dfb.queryValueColumn")} className="h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="-">{t("dfb.none")}</SelectItem>
                                  {(queries.find((q) => q.id === selectedField.queryRef)?.fields ?? []).map((qf) => (
                                    <SelectItem key={qf.fieldName} value={qf.fieldName}>{qf.fieldName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </>
                      )}
                      {!isSystem && (
                        <Button
                          type="button" size="sm" variant="outline"
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => {
                            const bank = state.banks.find((b) => b.fields.some((f) => f.key === selectedField.key));
                            if (bank) removeField(bank.key, selectedField.key);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden /> {t("common.delete")}
                        </Button>
                      )}
                    </div>
                  )}
                </section>
              )}
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* meta dialog */}
      {metaOpen && (
        <StudioMetaDialog
          state={state}
          onClose={() => setMetaOpen(false)}
          onCommit={(mutate) => commit(mutate)}
        />
      )}

      {/* exit guard */}
      {exitConfirm && (
        <Dialog open onOpenChange={(v) => { if (!v) setExitConfirm(false); }}>
          <DialogContent className="max-w-sm" dir="auto">
            <DialogHeader>
              <DialogTitle>{t("dfb.studio.exit")}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{t("dfb.studio.exitConfirm")}</p>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setExitConfirm(false)}>
                {t("dfb.studio.exitStay")}
              </Button>
              <Button type="button" variant="destructive" onClick={() => { setExitConfirm(false); closeThisWindow(); }}>
                {t("dfb.studio.exitDiscard")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* --------------------------- canvas pieces --------------------------- */

/* module-level drag payload (live only during an HTML5 drag gesture);
   keeps the card/bank components free of drag-prop churn */
const dragRef: { current: DragPayload | null } = { current: null };

function BankCanvas({
  bank, index, isMain, active, align, resizing, onResizeLive, onResizeCommit,
  selectedFieldKey, isSystem,
  onSelectBank, onSelectField, onAddField, onMoveFieldDir, onRemoveField,
  onMoveBank, onRemoveBank, onDragStartField, onDropInBank,
}: {
  bank: StudioBank;
  index: number;
  isMain: boolean;
  active: boolean;
  /** Task 48 — bank-level horizontal alignment (persists in style.bankAlign) */
  align: DfbBankAlign;
  /** Task 48 — live width of the field being resized with the mouse */
  resizing: { key: string; pct: number } | null;
  onResizeLive: (r: { key: string; pct: number } | null) => void;
  onResizeCommit: (fieldKey: string, pct: number) => void;
  selectedFieldKey: string | null;
  isSystem: boolean;
  onSelectBank: () => void;
  onSelectField: (key: string) => void;
  onAddField: () => void;
  onMoveFieldDir: (key: string, dir: -1 | 1) => void;
  onRemoveField: (key: string) => void;
  onMoveBank: (dir: -1 | 1) => void;
  onRemoveBank: () => void;
  onDragStartField: (fieldKey: string) => void;
  onDropInBank: (beforeKey: string | null) => void;
}) {
  const t = useT();
  const [over, setOver] = React.useState(false);

  return (
    <div
      onDragOver={(e) => {
        if (!dragRef.current) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDropInBank(null); // drop on the container body = append
      }}
      className={cn(
        "rounded-2xl border-2 border-dashed p-2.5 transition-colors sm:p-3",
        over || active ? "border-teal-500/70 bg-teal-500/5" : "border-border/80",
      )}
    >
      {/* bank header */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onSelectBank}
          className={cn(
            "rounded-lg px-1.5 py-0.5 text-xs font-semibold transition-colors hover:bg-foreground/5",
            active && "text-teal-700 dark:text-teal-400",
          )}
        >
          {isMain ? t("dfb.studio.bankMain") : bank.title}
          <span className="ms-1 font-normal text-muted-foreground">
            ({t("dfb.studio.fieldsCount").replace("{n}", String(bank.fields.length))})
          </span>
        </button>
        {/* Task 49 — band-model chip (grid vs input fields) on tab bands */}
        {!isMain && (
          <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[9px]">
            {bank.tabKind === 2 ? (
              <FormInput className="h-2.5 w-2.5" aria-hidden />
            ) : (
              <Grid3x3 className="h-2.5 w-2.5" aria-hidden />
            )}
            {bank.tabKind === 2 ? t("dfb.studio.bankKindFields") : t("dfb.studio.bankKindGrid")}
          </Badge>
        )}
        <Badge variant="outline" className="font-mono text-[9px]" dir="ltr">100%</Badge>
        {!isSystem && (
          <span className="ms-auto flex items-center gap-1">
            <Button type="button" size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={onAddField} title={t("dfb.addField")}>
              <Plus className="h-3 w-3" aria-hidden /> {t("dfb.addField")}
            </Button>
            {!isMain && (
              <>
                <MiniIconBtn label={t("dfb.studio.moveUp")} onClick={() => onMoveBank(-1)} disabled={index <= 1}>
                  <ArrowUp className="h-3 w-3" aria-hidden />
                </MiniIconBtn>
                <MiniIconBtn label={t("dfb.studio.moveDown")} onClick={() => onMoveBank(1)}>
                  <ArrowDown className="h-3 w-3" aria-hidden />
                </MiniIconBtn>
                <MiniIconBtn label={t("common.delete")} danger onClick={onRemoveBank} disabled={bank.fields.length > 0} title={bank.fields.length > 0 ? t("dfb.studio.bankDeleteHint") : undefined}>
                  <Trash2 className="h-3 w-3" aria-hidden />
                </MiniIconBtn>
              </>
            )}
          </span>
        )}
      </div>

      {/* fields — Task 48 flow layout: per-field width % + bank alignment */}
      {bank.fields.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 px-3 py-5 text-center text-[11px] text-muted-foreground">
          {t("dfb.studio.emptyBankHint")}
        </p>
      ) : (
        <div
          data-flow-container
          className={cn(
            "flex flex-wrap",
            align === "center" && "justify-center",
            align === "end" && "justify-end",
          )}
        >
          {bank.fields.map((f, fi) => {
            const pct = resizing && resizing.key === f.key ? resizing.pct : f.widthSpan;
            return (
              <div
                key={f.key}
                className="relative box-border min-w-0 px-2.5 pb-2.5"
                style={{ width: `${pct}%` }}
              >
                {resizing && resizing.key === f.key && (
                  <span
                    dir="ltr"
                    className="absolute end-3 top-1 z-20 rounded-md bg-teal-600 px-1.5 py-0.5 font-mono text-[9px] text-white shadow"
                  >
                    {resizing.pct}%
                  </span>
                )}
                <FieldCard
                  field={f}
                  order={fi + 1}
                  selected={selectedFieldKey === f.key}
                  preview={false}
                  isSystem={isSystem}
                  onSelect={() => onSelectField(f.key)}
                  onMoveDir={(dir) => onMoveFieldDir(f.key, dir)}
                  onRemove={() => onRemoveField(f.key)}
                  onDragStart={() => onDragStartField(f.key)}
                  onDropBefore={() => onDropInBank(f.key)}
                />
                {!isSystem && (
                  <FieldResizeHandle
                    basePct={f.widthSpan}
                    onLive={(p) => onResizeLive({ key: f.key, pct: p })}
                    onCommit={(p) => onResizeCommit(f.key, p)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniIconBtn({
  label, onClick, children, danger, disabled, title,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        danger && "hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400",
        disabled && "pointer-events-none opacity-35",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Task 48 — mouse width-resize handle on a field card's inline-END edge.
 * Dragging outward widens, inward narrows; snapped to 5% steps within
 * 25..100 (the WidthSpan percent model). RTL-aware (the inline end sits on
 * the LEFT edge in RTL, so the drag sign flips). The live width renders on
 * the card (chip) while the gesture runs; ONE undo snapshot commits on
 * pointerup.
 */
function FieldResizeHandle({
  basePct, onLive, onCommit,
}: {
  basePct: number;
  onLive: (pct: number) => void;
  onCommit: (pct: number) => void;
}) {
  const t = useT();
  const start = React.useRef<{ x: number; base: number; sign: number; rowW: number } | null>(null);
  const lastPct = React.useRef(basePct);
  const snap = (p: number) => Math.min(100, Math.max(25, Math.round(p / 5) * 5));

  return (
    <button
      type="button"
      aria-label={t("dfb.width")}
      title={t("dfb.width")}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const dir = getComputedStyle(e.currentTarget).direction;
        const row = e.currentTarget.closest("[data-flow-container]");
        start.current = {
          x: e.clientX,
          base: basePct,
          sign: dir === "rtl" ? -1 : 1,
          rowW: row ? row.clientWidth : 0,
        };
        lastPct.current = basePct;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const s = start.current;
        if (!s || s.rowW <= 0) return;
        const dx = e.clientX - s.x;
        const pct = snap(s.base + (dx * s.sign * 100) / s.rowW);
        if (pct !== lastPct.current) {
          lastPct.current = pct;
          onLive(pct);
        }
      }}
      onPointerUp={() => {
        if (!start.current) return;
        start.current = null;
        onCommit(lastPct.current);
      }}
      onPointerCancel={() => {
        if (!start.current) return;
        start.current = null;
        onCommit(lastPct.current);
      }}
      onClick={(e) => e.stopPropagation()}
      className="group absolute end-0 top-1/2 z-10 flex h-12 w-2.5 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="h-9 w-1 rounded-full bg-border transition-colors group-hover:bg-teal-500/80" aria-hidden />
    </button>
  );
}

function FieldCard({
  field, order, selected, preview, isSystem, onSelect, onMoveDir, onRemove, onDragStart, onDropBefore,
}: {
  field: StudioField;
  order: number;
  selected: boolean;
  preview: boolean;
  isSystem: boolean;
  onSelect: () => void;
  onMoveDir: (dir: -1 | 1) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDropBefore: () => void;
}) {
  const t = useT();
  const [dropBefore, setDropBefore] = React.useState(false);
  const meta = FIELD_TYPE_META[field.fieldType] ?? FIELD_TYPE_META.text;

  return (
    <div
      role={preview ? undefined : "button"}
      tabIndex={preview ? undefined : 0}
      draggable={!preview && !isSystem}
      onDragStart={(e) => {
        if (preview || isSystem) return;
        onDragStart();
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", field.key); } catch { /* jsdom */ }
      }}
      onDragEnd={() => setDropBefore(false)}
      onDragOver={(e) => {
        if (!dragRef.current || preview) return;
        e.preventDefault();
        e.stopPropagation();
        setDropBefore(true);
      }}
      onDragLeave={() => setDropBefore(false)}
      onDrop={(e) => {
        if (preview) return;
        e.preventDefault();
        e.stopPropagation();
        setDropBefore(false);
        onDropBefore();
      }}
      onClick={preview ? undefined : onSelect}
      onKeyDown={(e) => {
        if (preview) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "rounded-xl border bg-background p-2.5 transition-all",
        !preview && "cursor-pointer hover:border-foreground/25 hover:shadow-md",
        selected && "border-teal-500/60 ring-2 ring-teal-500/40",
        dropBefore && "border-t-2 border-t-teal-500",
      )}
    >
      {!preview && (
        <div className="mb-1.5 flex items-center gap-1.5">
          <Badge variant="secondary" className="font-mono text-[9px]" dir="ltr">#{order}</Badge>
          <span className={cn("flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br text-white", meta.tile)} aria-hidden>
            <meta.icon className="h-2.5 w-2.5" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground" dir="ltr">{field.fieldKey || "—"}</span>
          {!isSystem && (
            <span className="flex items-center gap-0.5">
              <MiniIconBtn label={t("dfb.studio.moveUp")} onClick={() => onMoveDir(-1)}>
                <ArrowUp className="h-3 w-3" aria-hidden />
              </MiniIconBtn>
              <MiniIconBtn label={t("dfb.studio.moveDown")} onClick={() => onMoveDir(1)}>
                <ArrowDown className="h-3 w-3" aria-hidden />
              </MiniIconBtn>
              <MiniIconBtn label={t("common.delete")} danger onClick={onRemove}>
                <Trash2 className="h-3 w-3" aria-hidden />
              </MiniIconBtn>
            </span>
          )}
        </div>
      )}
      <div className="mb-1 flex items-center gap-1 px-0.5">
        <span className="truncate text-[11px] font-medium text-foreground/90">{field.label}</span>
        {field.required && <span className="text-rose-500" aria-hidden>*</span>}
        {field.readOnly && !preview && (
          <Badge variant="outline" className="px-1 py-0 text-[8px]">{t("dfb.studio.readOnly")}</Badge>
        )}
      </div>
      <FieldPreview field={field} />
    </div>
  );
}

/** non-interactive preview of the field's editor (edits happen in the rail) */
function FieldPreview({ field }: { field: StudioField }) {
  const type = field.fieldType;
  if (type === "checkbox") {
    return (
      <div className="flex items-center justify-end gap-2 py-0.5" aria-hidden>
        <span className="flex h-4 w-4 items-center justify-center rounded border border-input" />
      </div>
    );
  }
  if (type === "select") {
    return (
      <div className="flex h-7 items-center justify-between rounded-md border border-input bg-background px-2 text-[11px] text-muted-foreground" aria-hidden>
        <span>—</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </div>
    );
  }
  if (type === "lookup") {
    return (
      <div className="flex items-center gap-1.5" aria-hidden>
        <div className="h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1 text-[11px] text-muted-foreground">…</div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
          <Plus className="h-3.5 w-3.5" />
        </span>
      </div>
    );
  }
  if (type === "textarea") {
    return (
      <div className="min-h-12 rounded-md border border-input bg-background px-2 py-1 text-[11px] text-muted-foreground" aria-hidden>
        …
      </div>
    );
  }
  return (
    <div className="relative" aria-hidden>
      <div className="flex h-7 items-center rounded-md border border-input bg-background px-2 text-[11px] text-muted-foreground">
        {type === "date" ? <span dir="ltr">YYYY/MM/DD</span> : type === "number" ? <span dir="ltr">0.00</span> : <span>…</span>}
      </div>
      {type === "date" && (
        <CalendarDays className="pointer-events-none absolute end-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      )}
    </div>
  );
}

/**
 * Task 48 — LIVE preview body (owner requirements 2 + 5): the design bands
 * (dashed bank containers, bank titles, count chips, add-buttons) are NOT
 * rendered — only the fields flow under the shell, using the SAME FieldCell
 * the runtime uses, with the designed widths (WidthSpan percent) and bank
 * alignment. The REAL action bar rides on top: data entry saves to the EAV
 * store exactly like the running form (fields must have DB ids).
 */
function PreviewCanvas({
  state, values, options, records, dataId, align, busy,
  onFieldChange, onSave, onSaveClose, onReset, onCopy, onDelete, onPrint,
  onExitPreview, onOpenRecord,
}: {
  state: StudioState;
  values: Record<string, string | boolean>;
  options: Record<number, Array<{ value: string; label: string }>>;
  records: Array<{ dataId: number; values: Record<string, string | boolean> }>;
  dataId: number | null;
  align: DfbBankAlign;
  busy: boolean;
  onFieldChange: (key: string, value: string | boolean) => void;
  onSave: () => void | Promise<void>;
  onSaveClose: () => void | Promise<void>;
  onReset: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onPrint: () => void;
  onExitPreview: () => void;
  onOpenRecord: (dataId: string) => void;
}) {
  const t = useT();
  const toSimple = (f: StudioField): SimpleFormField => ({
    id: f.key,
    label: f.label,
    type: (FIELD_TYPE_META[f.fieldType] ? f.fieldType : "text") as SimpleFormField["type"],
    required: f.required,
    value: f.fieldType === "checkbox" ? undefined : String(values[f.key] ?? ""),
    checked: f.fieldType === "checkbox" ? Boolean(values[f.key]) : undefined,
    readOnly: f.readOnly,
    widthPct: f.widthSpan,
    options: f.queryRef != null ? options[f.queryRef] : undefined,
    ltr: f.fieldType === "number" || f.fieldType === "date",
    disabled: busy,
  });

  return (
    <>
      {/* real action bar (configured keys only — owner rule Task 48) */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 bg-muted/40 px-3 py-2">
        <FormActionBar
          className="min-w-0 flex-1"
          actions={state.shell.footerButtons}
          onReset={onReset}
          onSave={onSave}
          onSaveClose={onSaveClose}
          onCopy={onCopy}
          onDelete={onDelete}
          onPrint={onPrint}
          onClose={onExitPreview}
          listItems={records.map((r) => ({ id: String(r.dataId), title: String(r.dataId) }))}
          onOpenListItem={(item) => onOpenRecord(item.id)}
          canSave={!busy}
        />
        <Badge variant="outline" className="text-[9px]">{t("dfb.studio.preview")}</Badge>
        {dataId != null && (
          <span className="font-mono text-[9px] text-muted-foreground" dir="ltr">#{dataId}</span>
        )}
      </div>
      {/* fields only — no bands */}
      <div className="px-4 pb-3 pt-2.5" style={dfbShellTheme(state.shell.style).bodyStyle}>
        <FlowFieldGrid
          fields={state.banks.flatMap((b) => b.fields).map(toSimple)}
          onFieldChange={onFieldChange}
          idPrefix="dfbprev"
          align={align}
        />
      </div>
    </>
  );
}

/* --------------------------- meta dialog --------------------------- */

function StudioMetaDialog({
  state, onClose, onCommit,
}: {
  state: StudioState;
  onClose: () => void;
  onCommit: (mutate: (draft: StudioState) => void) => void;
}) {
  const t = useT();
  const [title, setTitle] = React.useState(state.shell.title);
  const [titleEn, setTitleEn] = React.useState(state.shell.titleEn);
  const [badge, setBadge] = React.useState(state.shell.badge);
  const [buttons, setButtons] = React.useState<string[]>(state.shell.footerButtons);

  const apply = () => {
    onCommit((d) => {
      d.shell.title = title.trim() || d.shell.title;
      d.shell.titleEn = titleEn.trim();
      d.shell.badge = badge.trim();
      d.shell.footerButtons = ACTION_BAR_KEYS.filter((k) => buttons.includes(k));
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md" dir="auto">
        <DialogHeader>
          <DialogTitle>{t("dfb.studio.meta")}</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[55vh] gap-3 overflow-y-auto pe-1 scrollbar-slim">
          <div className="grid gap-1.5">
            <Label htmlFor="dfb-studio-title">{t("dfb.formTitle")}</Label>
            <Input id="dfb-studio-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dfb-studio-title-en">{t("dfb.formTitleEn")}</Label>
            <Input id="dfb-studio-title-en" dir="ltr" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dfb-studio-badge">{t("dfb.badgeLabel")}</Label>
            <Input id="dfb-studio-badge" value={badge} onChange={(e) => setBadge(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>{t("dfb.footerButtons")}</Label>
            <div className="flex flex-wrap gap-2 rounded-xl border border-border/60 p-2.5">
              {ACTION_BAR_KEYS.map((b) => (
                <label key={b} className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs hover:bg-foreground/5">
                  <Checkbox
                    checked={buttons.includes(b)}
                    onCheckedChange={(v) =>
                      setButtons((btns) => (v ? [...btns, b] : btns.filter((x) => x !== b)))
                    }
                    aria-label={t(`dfb.btn.${b}` as never)}
                  />
                  {t(`dfb.btn.${b}` as never)}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="button" onClick={apply} disabled={!title.trim()}>
            <Check className="h-4 w-4" aria-hidden /> {t("common.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
