"use client";

import * as React from "react";
import {
  AlignCenterHorizontal, AlignEndHorizontal, AlignLeft, AlignStartHorizontal, ArrowDown, ArrowUp,
  Braces, CalendarDays, Check, ChevronDown, Circle, CircleDot, Code, Copy, Eye, EyeOff, FileText, FormInput,
  Grid3x3, Hash, History, Layers, List, ListTree, Loader2, Lock, Minus, MoveHorizontal, Palette,
  Pill, PencilLine, Plus, RotateCcw, Save, Search, SlidersHorizontal, Square, Trash2, Type, X,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  fetchFormDetail, dfbApi, saveFormData, loadFormData,
  fetchQueryOptionsForFields, normalizeFieldWidth, widthMinWidthClass, dfbFormTitle,
  executeFormScript, parseFieldConfig, isDfbInputField,
  fieldConfigItems, fieldItemsScript, rowsToItems, DFB_ITEM_FIELD_TYPES,
  type DfbFormDetail, type DfbFieldDef, type DfbTabDef, type DfbFieldItem,
} from "@/stores/dfb-store";
import { LatinInput } from "@/components/forms/latin-input";
import {
  DFB_THEME_SWATCHES, dfbShellTheme, dfbBankAlign,
  type DfbFormStyle, type DfbBankAlign,
} from "@/lib/dfb-theme";
import { ACTION_BAR_KEYS } from "@/components/forms/action-bar";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
  type SimpleFormTab,
  type SimpleFormGridColumn,
} from "@/components/forms/simple-form-two-row-tabbed";
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
 *
 * Task 50 — درخواست مالک: the «جدول رکوردها» (records-table) band is
 * TABBED ITSELF: an «افزودن تب» button lives ON the band (header + empty
 * state + tab strip) and every created tab is placed INSIDE the band,
 * each with a Persian AND a Latin title (Latin-only hard filter —
 * LatinInput). Fields added to a tab become that tab's grid columns.
 * The hierarchy persists via DfbFormTab.ParentRef (band row = 0, child
 * tabs reference their band) with clientKey/parentKey correlation
 * because tab ids regenerate on every save.
 *
 * Task 51 — گزارش مالک: ۱) the live preview rendered ALL fields flat —
 * it now mounts the REAL SimpleFormTwoRowTabbed engine (the runtime's
 * exact template), so a form with tabs previews with the same tab
 * navigation as the sample form; ۲) the field delete icon did nothing —
 * removeField reassigned `fields` on the findContainer WRAPPER instead of
 * mutating the bank/tab array in place (fixed with splice).
 *
 * Task 53 — سه نیازمندی مالک:
 *  1) «باند فوتر» — a dedicated FOOTER band that ALWAYS renders at the very
 *     end of the form (design canvas + preview + runtime); its fields
 *     persist with DfbFormField.Section="footer" and run in the pinned
 *     footer zone of the template (footerFields);
 *  2) the toolbox gains design SHAPES — خط (line), باکس (box), دایره
 *     (circle), بیضی (oval) — static decorative elements with no EAV value;
 *  3) new «اسکریپت» field type: the designer writes a script, runs it
 *     («اجرا و واکشی» — sandboxed read-only db API on dfb-service), the
 *     FETCHED fields are listed and selectable, and the selected ones are
 *     added to the form as real fields bound via ConfigJson
 *     { bindScript, bindField } — the runtime pre-fills them from the
 *     script's first row.
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
  /** Task 53 — per-field config (script text / fetched fields / selected /
      bindScript+bindField / shape tone) — persisted as ConfigJson */
  config: Record<string, unknown> | null;
}

/** Task 50 — a tab created with «افزودن تب» INSIDE a records-table band;
    every tab is one record table (its fields = the grid columns). */
interface StudioTab {
  key: string; // stable client key (band→tab correlation across saves)
  id?: number; // DfbFormTab id (loaded / last save)
  title: string;
  titleEn: string; // Latin-only enforced at input (LatinInput)
  fields: StudioField[];
}

interface StudioBank {
  key: string; // "main" | client key
  id?: number; // DfbFormTab id (loaded / last save)
  /** 0=main band (root fields) | 1=records table (grid band WITH its own tabs)
      | 2=input-fields band (plain inputs, no inner tabs) */
  tabKind: number;
  title: string;
  fields: StudioField[]; // direct fields (main / input-fields bands)
  /** Task 50 — tabs INSIDE a records-table band (grid bands only; created
      with the «افزودن تب» dialog that takes Persian + Latin titles) */
  tabs: StudioTab[];
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
  /** Task 53 — «باند فوتر»: a DEDICATED band that always renders at the
      very end of the form (design canvas, preview, runtime). Not part of
      the orderable banks; holds fields directly (no inner tabs). */
  footer: StudioBank;
}

const clone = (s: StudioState): StudioState => JSON.parse(JSON.stringify(s)) as StudioState;

/* ------------------- Task 50 — field containers -------------------
   Fields live in a CONTAINER: the bank itself (main band, input-fields
   band) or a tab inside a records-table band. Container keys are
   "main" | "{bankKey}" | "{bankKey}::{tabKey}" — every field operation
   (add/move/remove/resize/equalize) is addressed through them. */

const splitContainer = (cKey: string): { bankKey: string; tabKey: string | null } => {
  const i = cKey.indexOf("::");
  return i < 0 ? { bankKey: cKey, tabKey: null } : { bankKey: cKey.slice(0, i), tabKey: cKey.slice(i + 2) };
};

/** the container a bank's field flow targets (a grid band routes to its
    active/first tab; main & input-fields bands hold fields directly) */
const containerOfBank = (bank: StudioBank): string =>
  bank.tabKind === 1 && bank.tabs.length > 0 ? `${bank.key}::${bank.tabs[0].key}` : bank.key;

/** resolves a container key against a (draft) state — null when the bank or
    tab no longer exists (e.g. after an undo). "footer" = the Task 53 FOOTER
    band (state.footer — always last, holds fields directly). */
function findContainer(
  d: StudioState,
  cKey: string,
): { bank: StudioBank; fields: StudioField[] } | null {
  const { bankKey, tabKey } = splitContainer(cKey);
  if (bankKey === "footer") {
    return d.footer && !tabKey ? { bank: d.footer, fields: d.footer.fields } : null;
  }
  const bank = d.banks.find((b) => b.key === bankKey);
  if (!bank) return null;
  if (tabKey) {
    const tab = bank.tabs.find((t) => t.key === tabKey);
    return tab ? { bank, fields: tab.fields } : null;
  }
  return { bank, fields: bank.fields };
}

/** every field of the form across all containers (preview/validation) */
const allFieldsOf = (s: StudioState): StudioField[] => [
  ...s.banks.flatMap((b) => [...b.fields, ...b.tabs.flatMap((t) => t.fields)]),
  ...(s.footer?.fields ?? []), // Task 53 — footer band fields
];

/** a band holds any designed field (direct or inside its tabs) — gates the
    kind switch, band delete and tab delete guards */
const bankHasFields = (b: StudioBank): boolean =>
  b.fields.length > 0 || b.tabs.some((t) => t.fields.length > 0);

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
  /* Task 58 (owner request) — radio button with items */
  radio: { icon: CircleDot, tile: "from-pink-500 to-rose-600" },
  textarea: { icon: AlignLeft, tile: "from-orange-500 to-amber-600" },
  /* Task 53 — design shapes (static, no EAV value) */
  line: { icon: Minus, tile: "from-zinc-500 to-zinc-600" },
  box: { icon: Square, tile: "from-cyan-500 to-teal-600" },
  circle: { icon: Circle, tile: "from-fuchsia-500 to-pink-600" },
  oval: { icon: Pill, tile: "from-purple-500 to-fuchsia-600" },
  /* Task 53 — script data-source field */
  script: { icon: Code, tile: "from-teal-700 to-emerald-800" },
};
const FIELD_TYPES = Object.keys(FIELD_TYPE_META);
/** Task 53 — the SHAPE tiles (grouped last in the palette, after inputs) */
const SHAPE_PALETTE_TYPES = ["line", "box", "circle", "oval"];

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
  | { kind: "move"; fromContainer: string; fieldKey: string };

/**
 * Task 50 — normalize a server form definition into studio banks.
 * parentRef=0 rows become BANDS; parentRef>0 rows become the tabs INSIDE
 * their records-table band. A legacy grid band whose fields sit directly on
 * the band row (pre-Task 50 layout) is wrapped into one tab titled after
 * the band — nothing is lost and the next save persists the new shape.
 */
function buildBanks(d: DfbFormDetail): { banks: StudioBank[]; footer: StudioBank } {
  const sorted = [...d.tabs].sort((a, b) => a.orderIndex - b.orderIndex);
  const bandRows = sorted.filter((t) => !t.parentRef);
  const childrenOf = new Map<number, DfbTabDef[]>();
  for (const c of sorted.filter((t) => t.parentRef > 0)) {
    const list = childrenOf.get(c.parentRef) ?? [];
    list.push(c);
    childrenOf.set(c.parentRef, list);
  }
  const toField = (f: DfbFieldDef): StudioField => ({
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
    config: parseFieldConfig(f.configJson),
  });
  const banks: StudioBank[] = bandRows.map((tb) => ({
    key: `bank-${tb.id}`,
    id: tb.id,
    tabKind: tb.tabKind === 2 ? 2 : 1,
    title: tb.title,
    fields: [],
    tabs:
      tb.tabKind === 2
        ? []
        : (childrenOf.get(tb.id) ?? []).map((ct) => ({
            key: `tb-${ct.id}`,
            id: ct.id,
            title: ct.title,
            titleEn: ct.titleEn ?? "",
            fields: [],
          })),
  }));
  /* Task 53 — the dedicated FOOTER band: fields with Section="footer" */
  const footer: StudioBank = {
    key: "footer",
    tabKind: 3, // footer band (design-only kind; not a DfbFormTab row)
    title: "footer",
    fields: d.fields.filter((f) => f.section === "footer").map(toField),
    tabs: [],
  };
  const directFieldsOf = (tabRef: number) =>
    d.fields.filter((f) => f.section === "body" && f.tabRef === tabRef);
  for (const b of banks) {
    if (b.tabKind === 1 && b.id != null && directFieldsOf(b.id).length > 0 && !b.tabs.some((t) => t.id != null)) {
      b.tabs.push({ key: `tb-legacy-${b.id}`, title: b.title, titleEn: "", fields: [] });
    }
  }
  const main: StudioBank = { key: "main", tabKind: 0, title: "", fields: [], tabs: [] };
  for (const f of d.fields) {
    if (f.section !== "body") continue; // footer fields are collected above
    if (f.tabRef == null) {
      main.fields.push(toField(f));
      continue;
    }
    const bank = banks.find((b) => b.id === f.tabRef);
    if (bank) {
      if (bank.tabKind === 2) bank.fields.push(toField(f));
      else {
        /* legacy wrap tab (no id) adopts the band-level fields; defensive
           fallback = the band's first tab */
        const legacy = bank.tabs.find((t) => t.id == null) ?? bank.tabs[0];
        legacy?.fields.push(toField(f));
      }
      continue;
    }
    const tab = banks.flatMap((b) => b.tabs).find((t) => t.id === f.tabRef);
    if (tab) tab.fields.push(toField(f));
    else main.fields.push(toField(f)); // defensive — unknown tabRef
  }
  return { banks: [main, ...banks], footer };
}

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
        const initial: StudioState = {
          shell: {
            title: d.title,
            titleEn: d.titleEn ?? "",
            badge: typeof header.badge === "string" ? header.badge : "",
            footerButtons: storedFooterButtons(footer),
            style,
          },
          ...buildBanks(d),
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
  /* Task 50 — the ACTIVE CONTAINER ("main" | bank key | "bank::tab") drives
     the whole studio: bank settings rail = its bank, palette adds and field
     ops = its fields, grid-band tab strip highlights its tab */
  const [activeContainerKey, setActiveContainerKey] = React.useState("main");
  const [selectedFieldKey, setSelectedFieldKey] = React.useState<string | null>(null);
  /* Task 50 — «افزودن تب» dialog target bank (null = closed) */
  const [tabDialogFor, setTabDialogFor] = React.useState<string | null>(null);
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
  /* Task 58 — script-fetched items of select/radio fields (keyed by field.key) */
  const [previewItemOptions, setPreviewItemOptions] = React.useState<Record<string, DfbFieldItem[]>>({});
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

  const activeBankKey = splitContainer(activeContainerKey).bankKey;
  const activeBank = state?.banks.find((b) => b.key === activeBankKey) ?? state?.banks[0] ?? null;
  /** selected field WITH its container (rail ops address the right fields) */
  let selectedFieldRef: { containerKey: string; field: StudioField } | null = null;
  if (state && selectedFieldKey) {
    for (const b of state.banks) {
      const i = b.fields.findIndex((f) => f.key === selectedFieldKey);
      if (i >= 0) {
        selectedFieldRef = { containerKey: b.key, field: b.fields[i] };
        break;
      }
      for (const tb of b.tabs) {
        const j = tb.fields.findIndex((f) => f.key === selectedFieldKey);
        if (j >= 0) {
          selectedFieldRef = { containerKey: `${b.key}::${tb.key}`, field: tb.fields[j] };
          break;
        }
      }
      if (selectedFieldRef) break;
    }
  }

  /* ---------------- Task 48 — alignment / equalize commands ---------------- */
  const setBankAlign = React.useCallback(
    (bankIndex: number, a: DfbBankAlign) => {
      commit((d) => {
        d.shell.style.bankAlign = { ...(d.shell.style.bankAlign ?? {}), [alignKeyForBank(bankIndex)]: a };
      });
    },
    [commit],
  );

  const equalizeContainer = React.useCallback(
    (containerKey: string) => {
      commit((d) => {
        const dst = findContainer(d, containerKey);
        if (!dst || dst.fields.length === 0) return;
        const counts = new Map<number, number>();
        for (const f of dst.fields) counts.set(f.widthSpan, (counts.get(f.widthSpan) ?? 0) + 1);
        let best = dst.fields[0].widthSpan;
        let bestN = 0;
        for (const [w, n] of counts) {
          if (n > bestN || (n === bestN && w === 50)) {
            best = w;
            bestN = n;
          }
        }
        for (const f of dst.fields) f.widthSpan = best;
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

  /* Task 53 — run every script field of the form and prefill the fields
     bound to it (config { bindScript, bindField }) from the FIRST row of
     its result. Bound fields stay editable — the prefill is just a value.
     Task 58 — ALSO runs the itemsScript of every select/radio field: the
     fetched rows become the opening list of the field (and of its grid
     column) in the live preview, exactly like the runtime. */
  const runPreviewScripts = React.useCallback(async (s: StudioState) => {
    const all = allFieldsOf(s);
    /* Task 58 — itemsScript → opening lists */
    const itemScriptFields = all.filter(
      (f) => DFB_ITEM_FIELD_TYPES.includes(f.fieldType) && fieldItemsScript(f.config).trim(),
    );
    if (itemScriptFields.length > 0) {
      const map: Record<string, DfbFieldItem[]> = {};
      await Promise.all(
        itemScriptFields.map(async (f) => {
          try {
            const res = await executeFormScript(fieldItemsScript(f.config));
            const vf = typeof f.config?.itemsValueField === "string" ? (f.config.itemsValueField as string) : undefined;
            map[f.key] = rowsToItems(res.rows, vf);
          } catch {
            /* a failing items script leaves the static items */
          }
        }),
      );
      setPreviewItemOptions((prev) => ({ ...prev, ...map }));
    }
    const scriptFields = all.filter(
      (f) => f.fieldType === "script" && typeof f.config?.script === "string" && (f.config.script as string).trim(),
    );
    if (scriptFields.length === 0) return;
    const prefill: Record<string, string> = {};
    await Promise.all(
      scriptFields.map(async (sf) => {
        try {
          const res = await executeFormScript(String(sf.config?.script ?? ""));
          const row0 = res.rows[0] ?? {};
          for (const f of allFieldsOf(s)) {
            if (f.config?.bindScript === sf.fieldKey && typeof f.config?.bindField === "string") {
              const v = row0[f.config.bindField as string];
              if (v != null) prefill[f.key] = String(v);
            }
          }
        } catch {
          /* script failures are non-fatal in preview — bound fields stay empty */
        }
      }),
    );
    if (Object.keys(prefill).length > 0) {
      setPreviewValues((pv) => ({ ...prefill, ...pv }));
    }
  }, []);

  const togglePreview = React.useCallback(() => {
    const next = !preview;
    setPreview(next);
    if (next && !previewExtrasLoaded && state) {
      setPreviewExtrasLoaded(true);
      const fields = allFieldsOf(state);
      fetchQueryOptionsForFields(
        fields.map((f) => ({ queryRef: f.queryRef, queryFieldKey: f.queryFieldKey, fieldType: f.fieldType })),
      )
        .then(setPreviewOptions)
        .catch(() => { /* options are best-effort */ });
      loadFormData(formId)
        .then((items) => setPreviewRecords(mapLoadedRecords(items, fields)))
        .catch(() => { /* record list is best-effort */ });
      void runPreviewScripts(state);
    }
  }, [preview, previewExtrasLoaded, state, formId, mapLoadedRecords, runPreviewScripts]);

  const previewSave = React.useCallback(async () => {
    if (!state || busy) return;
    const fields = allFieldsOf(state);
    /* Task 53 — shapes + the script element have NO input/value: they are
       excluded from required-checks and the EAV payload entirely */
    const inputFields = fields.filter((f) => isDfbInputField(f.fieldType));
    const missing = inputFields.filter(
      (f) => f.id != null && f.required &&
        (previewValues[f.key] === undefined || previewValues[f.key] === ""),
    );
    if (missing.length > 0) {
      toast.error(`${t("dfb.requiredFieldsMissing")}: ${missing.map((m) => m.label).join("، ")}`);
      return;
    }
    const unsaved = inputFields.filter(
      (f) => f.id == null && previewValues[f.key] !== undefined && previewValues[f.key] !== "",
    );
    if (unsaved.length > 0) toast.info(t("dfb.studio.unsavedFieldsHint"));
    const payload: Record<string, string | boolean | null> = {};
    for (const f of inputFields) {
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
    if (state) void runPreviewScripts(state); // Task 53 — re-prefill bound fields
  }, [state, runPreviewScripts]);

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
    (containerKey: string, fieldType: string, beforeFieldKey?: string | null) => {
      if (isSystem) return;
      commit((d) => {
        const dst = findContainer(d, containerKey);
        if (!dst) return;
        /* Task 53 — script fields get their STABLE fieldKey at creation: the
           derived fields added from the fetched list bind to it via config
           { bindScript } and that binding must survive the save regeneration */
        const isScript = fieldType === "script";
        const field: StudioField = {
          key: nextKey("f"),
          fieldKey: isScript ? `script_${Date.now().toString(36)}` : "",
          label: t(`dfb.type.${fieldType}` as never),
          fieldType,
          required: false,
          readOnly: false,
          widthSpan: 50,
          queryRef: null,
          queryFieldKey: null,
          config: isScript ? { script: "", fields: [], selected: [] } : null,
        };
        const at = beforeFieldKey ? dst.fields.findIndex((f) => f.key === beforeFieldKey) : -1;
        if (at >= 0) dst.fields.splice(at, 0, field);
        else dst.fields.push(field);
      });
      setActiveContainerKey(containerKey);
    },
    [commit, isSystem, t],
  );

  const moveFieldDir = React.useCallback(
    (containerKey: string, fieldKey: string, dir: -1 | 1) => {
      commit((d) => {
        const dst = findContainer(d, containerKey);
        if (!dst) return;
        const i = dst.fields.findIndex((f) => f.key === fieldKey);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= dst.fields.length) return;
        [dst.fields[i], dst.fields[j]] = [dst.fields[j], dst.fields[i]];
      });
    },
    [commit],
  );

  const removeField = React.useCallback(
    (containerKey: string, fieldKey: string) => {
      commit((d) => {
        const dst = findContainer(d, containerKey);
        if (!dst) return;
        /* Task 51 — MUST mutate the array IN PLACE: findContainer returns a
           wrapper object, and reassigning `dst.fields = ...` would detach
           the filtered copy from the bank/tab (the owner-reported bug: the
           delete icon "did nothing"). splice keeps the reference live. */
        const i = dst.fields.findIndex((f) => f.key === fieldKey);
        if (i >= 0) dst.fields.splice(i, 1);
      });
      setSelectedFieldKey((k) => (k === fieldKey ? null : k));
    },
    [commit],
  );

  const moveFieldToBank = React.useCallback(
    (fromContainer: string, fieldKey: string, toContainer: string, beforeFieldKey?: string | null) => {
      if (fromContainer === toContainer && !beforeFieldKey) return;
      commit((d) => {
        const src = findContainer(d, fromContainer);
        if (!src) return;
        const i = src.fields.findIndex((f) => f.key === fieldKey);
        if (i < 0) return;
        const dst = findContainer(d, toContainer);
        if (!dst) return;
        const [field] = src.fields.splice(i, 1);
        const at = beforeFieldKey ? dst.fields.findIndex((f) => f.key === beforeFieldKey) : -1;
        if (at >= 0) dst.fields.splice(at, 0, field);
        else dst.fields.push(field);
      });
      setActiveContainerKey(toContainer);
    },
    [commit],
  );

  const reorderField = React.useCallback(
    (fromContainer: string, fieldKey: string, toContainer: string, beforeFieldKey: string | null) => {
      if (fromContainer === toContainer) {
        // same container — move relative to the drop target
        commit((d) => {
          const dst = findContainer(d, toContainer);
          if (!dst) return;
          const i = dst.fields.findIndex((f) => f.key === fieldKey);
          if (i < 0) return;
          const [field] = dst.fields.splice(i, 1);
          const at = beforeFieldKey ? dst.fields.findIndex((f) => f.key === beforeFieldKey) : -1;
          if (at >= 0) dst.fields.splice(at, 0, field);
          else dst.fields.push(field);
        });
      } else {
        moveFieldToBank(fromContainer, fieldKey, toContainer, beforeFieldKey);
      }
    },
    [commit, moveFieldToBank],
  );

  const updateField = React.useCallback(
    (fieldKey: string, patch: Partial<StudioField>) => {
      commit((d) => {
        for (const f of allFieldsOf(d)) {
          if (f.key === fieldKey) {
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
          tabKind, // 1=records table (with «افزودن تب» tabs) | 2=input fields
          title: `${t("dfb.studio.bankTitle")} ${d.banks.length}`,
          fields: [],
          tabs: [],
        });
      });
    },
    [commit, isSystem, t],
  );

  /** Task 49/50 — switch a band's model (grid ↔ input fields). Switching is
      only possible while the band holds NO fields (direct or in tabs) so a
      designed field never loses its container. */
  const updateBankKind = React.useCallback(
    (bankKey: string, tabKind: 1 | 2) => {
      commit((d) => {
        const bank = d.banks.find((b) => b.key === bankKey);
        if (!bank || bank.key === "main") return;
        if (bankHasFields(bank)) return; // UI disables the select; defensive
        bank.tabKind = tabKind;
      });
    },
    [commit],
  );

  /* ---------- Task 50 — tabs INSIDE a records-table band ---------- */
  const addTab = React.useCallback(
    (bankKey: string, title: string, titleEn: string) => {
      const tabKey = nextKey("tb");
      commit((d) => {
        const bank = d.banks.find((b) => b.key === bankKey);
        if (!bank || bank.tabKind !== 1) return;
        bank.tabs.push({ key: tabKey, title: title.trim(), titleEn: titleEn.trim(), fields: [] });
      });
      setTabDialogFor(null);
      setActiveContainerKey(`${bankKey}::${tabKey}`);
    },
    [commit],
  );

  /** only EMPTY tabs are removable (owner delete rule — same as bands) */
  const removeTab = React.useCallback(
    (bankKey: string, tabKey: string) => {
      commit((d) => {
        const bank = d.banks.find((b) => b.key === bankKey);
        const tab = bank?.tabs.find((t) => t.key === tabKey);
        if (!bank || !tab || tab.fields.length > 0) return;
        bank.tabs = bank.tabs.filter((t) => t.key !== tabKey);
      });
      setActiveContainerKey((k) => (k === `${bankKey}::${tabKey}` ? bankKey : k));
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
      setTabDialogFor((f) => (f === bankKey ? null : f));
      setActiveContainerKey((k) => (splitContainer(k).bankKey === bankKey ? "main" : k));
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

  /* -------- Task 53 — script field: run / select fetched fields / add -------- */
  const [scriptBusy, setScriptBusy] = React.useState(false);

  const runSelectedScript = React.useCallback(async () => {
    if (!selectedFieldRef || selectedFieldRef.field.fieldType !== "script") return;
    const f = selectedFieldRef.field;
    const script = String(f.config?.script ?? "");
    if (!script.trim()) {
      toast.error(t("dfb.studio.scriptEmpty"));
      return;
    }
    setScriptBusy(true);
    try {
      const res = await executeFormScript(script);
      updateField(f.key, {
        config: { ...(f.config ?? {}), fields: res.fields, rowCount: res.rowCount },
      });
      toast.success(t("dfb.studio.scriptRows").replace("{n}", String(res.rowCount)));
    } catch {
      toast.error(t("dfb.studio.scriptExecError"));
    } finally {
      setScriptBusy(false);
    }
  }, [selectedFieldRef, updateField, t]);

  const toggleScriptFieldSelection = React.useCallback(
    (fieldName: string, on: boolean) => {
      if (!selectedFieldRef) return;
      const f = selectedFieldRef.field;
      const cfg: Record<string, unknown> = { ...(f.config ?? {}) };
      const sel = new Set(Array.isArray(cfg.selected) ? (cfg.selected as string[]) : []);
      if (on) sel.add(fieldName);
      else sel.delete(fieldName);
      cfg.selected = [...sel];
      updateField(f.key, { config: cfg });
    },
    [selectedFieldRef, updateField],
  );

  /** Task 53 — the SELECTED fetched fields become REAL fields of the form,
      inserted right after the script element, bound via ConfigJson
      { bindScript: <script fieldKey>, bindField: <fetched name> } so the
      runtime prefills them from the script's first row. */
  const addSelectedScriptFields = React.useCallback(() => {
    if (!selectedFieldRef) return;
    const sf = selectedFieldRef.field;
    const containerKey = selectedFieldRef.containerKey;
    const selected = Array.isArray(sf.config?.selected) ? (sf.config?.selected as string[]) : [];
    if (selected.length === 0) {
      toast.info(t("dfb.studio.scriptNone"));
      return;
    }
    const scriptKey = sf.fieldKey || sf.key;
    let added = 0;
    commit((d) => {
      const dst = findContainer(d, containerKey);
      if (!dst) return;
      const existing = new Set(
        dst.fields
          .filter((x) => x.config?.bindScript === scriptKey)
          .map((x) => String(x.config?.bindField ?? "")),
      );
      const at = dst.fields.findIndex((x) => x.key === sf.key);
      for (const name of selected) {
        if (existing.has(name)) continue;
        const derived: StudioField = {
          key: nextKey("f"),
          fieldKey: "",
          label: name,
          fieldType: "text",
          required: false,
          readOnly: false,
          widthSpan: 50,
          queryRef: null,
          queryFieldKey: null,
          config: { bindScript: scriptKey, bindField: name },
        };
        if (at >= 0) dst.fields.splice(at + 1 + added, 0, derived);
        else dst.fields.push(derived);
        added++;
      }
    });
    if (added > 0) toast.success(t("dfb.studio.scriptAdded").replace("{n}", String(added)));
    else toast.info(t("dfb.studio.scriptAlready"));
  }, [selectedFieldRef, commit, t]);

  /* ------- Task 58 (owner request) — list/radio items: define items or
     fetch them from a script (same sandboxed db API as the script field) ------- */
  const [newItemLabel, setNewItemLabel] = React.useState("");
  const [itemsBusy, setItemsBusy] = React.useState(false);
  /* fetched candidate items per field key (transient — not persisted) */
  const [itemsCandidates, setItemsCandidates] = React.useState<Record<string, DfbFieldItem[]>>({});
  const [itemsPicked, setItemsPicked] = React.useState<Record<string, string[]>>({});

  const addItem = React.useCallback(() => {
    if (!selectedFieldRef) return;
    const f = selectedFieldRef.field;
    const label = newItemLabel.trim();
    if (!label) return;
    const items = fieldConfigItems(f.config);
    if (items.some((x) => x.value === label)) {
      toast.info(t("dfb.studio.itemsAlready"));
      return;
    }
    updateField(f.key, { config: { ...(f.config ?? {}), items: [...items, { label, value: label }] } });
    setNewItemLabel("");
  }, [selectedFieldRef, newItemLabel, updateField, t]);

  const removeItem = React.useCallback(
    (fieldKey: string, index: number) => {
      if (!selectedFieldRef) return;
      const items = fieldConfigItems(selectedFieldRef.field.config);
      if (!items[index]) return;
      items.splice(index, 1);
      updateField(fieldKey, { config: { ...(selectedFieldRef.field.config ?? {}), items } });
    },
    [selectedFieldRef, updateField],
  );

  /** label edits keep the stored VALUE stable (records already saved with it) */
  const updateItemLabel = React.useCallback(
    (fieldKey: string, index: number, label: string) => {
      if (!selectedFieldRef) return;
      const items = fieldConfigItems(selectedFieldRef.field.config);
      if (!items[index]) return;
      items[index] = { value: items[index].value, label };
      updateField(fieldKey, { config: { ...(selectedFieldRef.field.config ?? {}), items } });
    },
    [selectedFieldRef, updateField],
  );

  const runItemsScript = React.useCallback(async () => {
    if (!selectedFieldRef) return;
    const f = selectedFieldRef.field;
    const script = fieldItemsScript(f.config);
    if (!script.trim()) {
      toast.error(t("dfb.studio.scriptEmpty"));
      return;
    }
    setItemsBusy(true);
    try {
      const res = await executeFormScript(script);
      const vf = typeof f.config?.itemsValueField === "string" ? (f.config.itemsValueField as string) : undefined;
      setItemsCandidates((m) => ({ ...m, [f.key]: rowsToItems(res.rows, vf) }));
      toast.success(t("dfb.studio.scriptRows").replace("{n}", String(res.rowCount)));
    } catch {
      toast.error(t("dfb.studio.scriptExecError"));
    } finally {
      setItemsBusy(false);
    }
  }, [selectedFieldRef, t]);

  const toggleItemCandidate = React.useCallback((fieldKey: string, value: string, on: boolean) => {
    setItemsPicked((m) => {
      const cur = new Set(m[fieldKey] ?? []);
      if (on) cur.add(value);
      else cur.delete(value);
      return { ...m, [fieldKey]: [...cur] };
    });
  }, []);

  /** merges the picked fetched items into the field's items (value-deduped) */
  const addSelectedItems = React.useCallback(() => {
    if (!selectedFieldRef) return;
    const f = selectedFieldRef.field;
    const candidates = itemsCandidates[f.key] ?? [];
    const pickedSet = itemsPicked[f.key];
    const picked = new Set(pickedSet ?? candidates.map((c) => c.value)); // default = ALL
    const chosen = candidates.filter((c) => picked.has(c.value));
    if (chosen.length === 0) {
      toast.info(t("dfb.studio.itemsNone"));
      return;
    }
    const existing = new Set(fieldConfigItems(f.config).map((x) => x.value));
    const fresh = chosen.filter((c) => !existing.has(c.value));
    if (fresh.length === 0) {
      toast.info(t("dfb.studio.itemsAlready"));
      return;
    }
    updateField(f.key, { config: { ...(f.config ?? {}), items: [...fieldConfigItems(f.config), ...fresh] } });
    toast.success(t("dfb.studio.itemsAdded").replace("{n}", String(fresh.length)));
  }, [selectedFieldRef, itemsCandidates, itemsPicked, updateField, t]);

  /* ------------------------------ save ------------------------------ */
  const save = React.useCallback(async () => {
    if (!state || busy) return;
    const invalid = allFieldsOf(state).find((f) => !f.label.trim());
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
        /* Task 50 — hierarchical tabs payload: band rows (parentKey omitted)
           and the tabs INSIDE each records-table band (parentKey = the
           band's clientKey). The server resolves parentRef and echoes
           clientKey so the fields phase can target the FRESH ids. */
        const tabsPayload: Array<{
          clientKey: string; parentKey?: string; title: string;
          titleEn?: string; tabKind: number; orderIndex: number;
        }> = [];
        state.banks.slice(1).forEach((b, i) => {
          tabsPayload.push({
            clientKey: b.key,
            title: b.title.trim() || `${t("dfb.studio.bankTitle")} ${i + 1}`,
            tabKind: b.tabKind === 2 ? 2 : 1,
            orderIndex: i,
          });
          if (b.tabKind === 1) {
            b.tabs.forEach((tb, j) =>
              tabsPayload.push({
                clientKey: tb.key,
                parentKey: b.key,
                title: tb.title.trim(),
                titleEn: tb.titleEn.trim() || undefined,
                tabKind: 1, // tabs inside a records-table band are grids
                orderIndex: j,
              }),
            );
          }
        });
        metaPayload.tabs = tabsPayload;
      }
      /* phase 1 — meta/style/tabs (tabs regenerate → fresh ids);
         the update endpoint answers with the saved item itself */
      const saved = await dfbApi.put<DfbFormDetail>(`forms/${formId}`, metaPayload);
      if (!isSystem) {
        /* phase 2 — fields against the FRESH ids via clientKey correlation */
        const idByClientKey = new Map<string, number>();
        for (const tb of saved.tabs ?? []) {
          if (tb.clientKey) idByClientKey.set(tb.clientKey, tb.id);
        }
        let seq = 0;
        const fields = state.banks
          .flatMap((b) => {
            const rows: Array<{ f: StudioField; tabRef: number | undefined }> = [];
            if (b.tabKind !== 1) {
              const bankTabId = b.key === "main" ? undefined : idByClientKey.get(b.key);
              for (const f of b.fields) rows.push({ f, tabRef: bankTabId });
            }
            for (const tb of b.tabs) {
              const tabId = idByClientKey.get(tb.key);
              for (const f of tb.fields) rows.push({ f, tabRef: tabId });
            }
            return rows;
          })
          /* Task 53 — the FOOTER band fields ride LAST with Section="footer"
              (the runtime pins them to the end-of-form zone) */
          .concat(state.footer.fields.map((f) => ({ f, tabRef: undefined as number | undefined })))
          .map(({ f, tabRef }) => {
            const orderIndex = seq++;
            /* footer band fields (identity — a field lives in ONE container) */
            const isFooter = state.footer.fields.includes(f);
            return {
              fieldKey: f.fieldKey || `f${orderIndex + 1}_${f.fieldType}`,
              label: f.label.trim(),
              fieldType: f.fieldType,
              required: f.required,
              readOnly: f.readOnly,
              widthSpan: f.widthSpan,
              orderIndex,
              tabRef,
              section: isFooter ? "footer" : undefined,
              queryRef: f.queryRef ?? undefined,
              queryFieldKey: f.queryFieldKey ?? undefined,
              configJson: f.config ? JSON.stringify(f.config) : undefined,
            };
          });
        await dfbApi.put(`forms/${formId}`, { fields });
      }
      /* refresh baseline from the server (fresh ids for the next save) */
      const d = await fetchFormDetail(formId);
      const header = (d.header ?? {}) as Record<string, unknown>;
      const baseline: StudioState = {
        shell: {
          title: d.title,
          titleEn: d.titleEn ?? "",
          badge: typeof header.badge === "string" ? header.badge : "",
          footerButtons: state.shell.footerButtons,
          style: state.shell.style,
        },
        ...buildBanks(d),
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
            {/* Task 51 — preview chip (the template below owns the shell header,
                so the preview badge rides ABOVE the shell instead) */}
            {preview && (
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">{t("dfb.studio.preview")}</Badge>
                {previewDataId != null && (
                  <span className="font-mono text-[9px] text-muted-foreground" dir="ltr">#{previewDataId}</span>
                )}
              </div>
            )}
            {/* mock form shell */}
            <div
              className={cn(
                "overflow-hidden rounded-2xl border border-border/60 bg-background shadow-lg",
                /* Task 52 (owner rule «ارتفاع بدنه فرم باید ثابت باشد») — the
                   preview IS the running window: the shell gets a FIXED height,
                   the tabbed grid scrolls INTERNALLY and the form never grows
                   with the number of records (design canvas still flows). */
                preview && "h-[min(70vh,640px)] min-h-[420px]",
              )}
            >
              {/* shell header (theme) — design mode only; the live preview
                  renders the REAL template which brings its own header */}
              {!preview && (
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
              )}
              {/* Task 51 — preview = the RUNNING form itself:
                  SimpleFormTwoRowTabbed engine with the designed tabs */}
              {preview ? (
                <PreviewCanvas
                  state={state}
                  values={previewValues}
                  options={previewOptions}
                  itemOptions={previewItemOptions}
                  records={previewRecords}
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
                    {state.banks.map((bank, bi) => {
                      const bankActive =
                        activeContainerKey === bank.key || activeContainerKey.startsWith(`${bank.key}::`);
                      const activeTabKey = bankActive ? splitContainer(activeContainerKey).tabKey : null;
                      return (
                      <BankCanvas
                        key={bank.key}
                        bank={bank}
                        index={bi}
                        isMain={bi === 0}
                        active={bankActive}
                        activeTabKey={activeTabKey}
                        align={dfbBankAlign(state.shell.style, alignKeyForBank(bi))}
                        resizing={resizing}
                        onResizeLive={setResizing}
                        onResizeCommit={(fieldKey, pct) => {
                          setResizing(null);
                          updateField(fieldKey, { widthSpan: pct });
                        }}
                        selectedFieldKey={selectedFieldKey}
                        isSystem={isSystem}
                        onSelectBank={() => setActiveContainerKey(containerOfBank(bank))}
                        onSelectTab={(tabKey) => setActiveContainerKey(`${bank.key}::${tabKey}`)}
                        onSelectField={(cKey, k) => {
                          setActiveContainerKey(cKey);
                          setSelectedFieldKey(k);
                        }}
                        onAddField={() => {
                          /* Task 50 — a records-table band WITHOUT tabs asks for
                             its first tab instead of a container-less field */
                          if (bank.tabKind === 1 && bank.tabs.length === 0) {
                            setTabDialogFor(bank.key);
                            return;
                          }
                          addField(bankActive ? activeContainerKey : containerOfBank(bank), paletteType);
                        }}
                        onAddTab={() => setTabDialogFor(bank.key)}
                        onRemoveTab={(tabKey) => removeTab(bank.key, tabKey)}
                        onMoveFieldDir={(cKey, k, dir) => moveFieldDir(cKey, k, dir)}
                        onRemoveField={(cKey, k) => removeField(cKey, k)}
                        onMoveBank={(dir) => moveBankDir(bank.key, dir)}
                        onRemoveBank={() => removeBank(bank.key)}
                        onDragStartField={(cKey, fieldKey) => {
                          dragRef.current = { kind: "move", fromContainer: cKey, fieldKey };
                        }}
                        onDropInBank={(cKey, beforeKey) => {
                          const p = dragRef.current;
                          if (!p) return;
                          if (p.kind === "add") addField(cKey, p.fieldType, beforeKey);
                          else reorderField(p.fromContainer, p.fieldKey, cKey, beforeKey);
                          dragRef.current = null;
                        }}
                      />
                      );
                    })}
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
                    {/* Task 53 — «باند فوتر»: ALWAYS the last band of the
                        form (owner: pinned to the form end). Hidden only for
                        system forms with no footer fields. */}
                    {(!isSystem || state.footer.fields.length > 0) && (
                      <FooterBandCanvas
                        fields={state.footer.fields}
                        active={activeContainerKey === "footer"}
                        selectedFieldKey={selectedFieldKey}
                        isSystem={isSystem}
                        resizing={resizing}
                        onResizeLive={setResizing}
                        onResizeCommit={(fieldKey, pct) => {
                          setResizing(null);
                          updateField(fieldKey, { widthSpan: pct });
                        }}
                        onSelect={() => setActiveContainerKey("footer")}
                        onSelectField={(k) => {
                          setActiveContainerKey("footer");
                          setSelectedFieldKey(k);
                        }}
                        onAddField={() => addField("footer", paletteType)}
                        onMoveFieldDir={(k, dir) => moveFieldDir("footer", k, dir)}
                        onRemoveField={(k) => removeField("footer", k)}
                        onDragStartField={(fieldKey) => {
                          dragRef.current = { kind: "move", fromContainer: "footer", fieldKey };
                        }}
                        onDropInBank={(beforeKey) => {
                          const p = dragRef.current;
                          if (!p) return;
                          if (p.kind === "add") addField("footer", p.fieldType, beforeKey);
                          else reorderField(p.fromContainer, p.fieldKey, "footer", beforeKey);
                          dragRef.current = null;
                        }}
                      />
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
                  <PaletteTileGrid
                    types={FIELD_TYPES.filter((ft) => !SHAPE_PALETTE_TYPES.includes(ft))}
                    paletteType={paletteType}
                    onPick={(ft) => {
                      setPaletteType(ft);
                      addField(activeContainerKey, ft);
                    }}
                  />
                  {/* Task 53 — design shapes group (لاین/باکس/دایره/بیضی) */}
                  <div className="mt-1 rounded-xl border border-dashed border-border/70 p-1.5">
                    <p className="mb-1 flex items-center gap-1 px-1 text-[10px] font-medium text-muted-foreground">
                      <Square className="h-3 w-3" aria-hidden />
                      {t("dfb.studio.shapesGroup")}
                    </p>
                    <PaletteTileGrid
                      types={SHAPE_PALETTE_TYPES}
                      paletteType={paletteType}
                      onPick={(ft) => {
                        setPaletteType(ft);
                        addField(activeContainerKey, ft);
                      }}
                    />
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

              {/* active bank settings (Task 53 — hidden while the FOOTER band
                  is active: it is pinned/non-orderable, no band settings) */}
              {activeBank && !preview && activeBankKey !== "footer" && (
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
                  {/* Task 49 — band model: grid (records table with its own
                      «افزودن تب» tabs) vs input fields (plain inputs, no grid)
                      — switchable while the band holds no fields (Task 50) */}
                  {activeBank.key !== "main" && (
                    <div className="grid gap-1.5">
                      <Label className="text-[11px] text-muted-foreground">{t("dfb.studio.bankKind")}</Label>
                      <Select
                        value={activeBank.tabKind === 2 ? "fields" : "grid"}
                        onValueChange={(v) => updateBankKind(activeBank.key, v === "fields" ? 2 : 1)}
                        disabled={isSystem || bankHasFields(activeBank)}
                      >
                        <SelectTrigger
                          aria-label={t("dfb.studio.bankKind")}
                          title={bankHasFields(activeBank) ? t("dfb.studio.bankDeleteHint") : undefined}
                          className="h-8"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">{t("dfb.studio.bankKindGrid")}</SelectItem>
                          <SelectItem value="fields">{t("dfb.studio.bankKindFields")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {/* Task 50 — tabs INSIDE the active records-table band:
                      list + add/delete (only empty tabs are removable) */}
                  {activeBank.key !== "main" && activeBank.tabKind === 1 && (
                    <div className="grid gap-1.5">
                      <Label className="text-[11px] text-muted-foreground">{t("dfb.studio.bandTabs")}</Label>
                      <div className="grid gap-1 rounded-xl border border-border/60 p-2">
                        {activeBank.tabs.length === 0 ? (
                          <p className="px-1 py-0.5 text-[11px] leading-relaxed text-muted-foreground">
                            {t("dfb.studio.emptyGridBand")} — {t("dfb.studio.emptyGridBandHint")}
                          </p>
                        ) : (
                          activeBank.tabs.map((tb, ti) => {
                            const tabActive = activeContainerKey === `${activeBank.key}::${tb.key}`;
                            return (
                              <div
                                key={tb.key}
                                role="button"
                                tabIndex={0}
                                onClick={() => setActiveContainerKey(`${activeBank.key}::${tb.key}`)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setActiveContainerKey(`${activeBank.key}::${tb.key}`);
                                  }
                                }}
                                className={cn(
                                  "flex cursor-pointer items-center gap-1.5 rounded-lg px-1.5 py-1 text-xs transition-colors hover:bg-foreground/5",
                                  tabActive && "bg-amber-500/10 ring-1 ring-amber-500/30",
                                )}
                              >
                                <span className="font-mono text-[9px] text-muted-foreground" dir="ltr">{ti + 1}</span>
                                <span className="min-w-0 flex-1 truncate font-medium">{tb.title}</span>
                                {tb.titleEn && (
                                  <span className="min-w-0 truncate text-[10px] text-muted-foreground" dir="ltr">{tb.titleEn}</span>
                                )}
                                <Badge variant="outline" className="px-1 py-0 font-mono text-[9px]" dir="ltr">{tb.fields.length}</Badge>
                                {!isSystem && (
                                  <MiniIconBtn
                                    label={t("common.delete")}
                                    danger
                                    disabled={tb.fields.length > 0}
                                    title={tb.fields.length > 0 ? t("dfb.studio.tabDeleteHint") : undefined}
                                    onClick={() => removeTab(activeBank.key, tb.key)}
                                  >
                                    <Trash2 className="h-3 w-3" aria-hidden />
                                  </MiniIconBtn>
                                )}
                              </div>
                            );
                          })
                        )}
                        {!isSystem && (
                          <Button
                            type="button" size="sm" variant="outline"
                            className="h-7 border-amber-500/50 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
                            onClick={() => setTabDialogFor(activeBank.key)}
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden /> {t("dfb.studio.addTab")}
                          </Button>
                        )}
                      </div>
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
                          onClick={() => equalizeContainer(activeContainerKey)}
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
                        disabled={bankHasFields(activeBank)}
                        title={bankHasFields(activeBank) ? t("dfb.studio.bankDeleteHint") : t("common.delete")}
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
                  {!selectedFieldRef ? (
                    <p className="rounded-xl border border-dashed border-border/70 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                      {t("dfb.studio.fieldSettingsHint")}
                    </p>
                  ) : (
                    <div className="grid gap-2 rounded-xl border border-border/60 p-2.5">
                      <div className="grid gap-1.5">
                        <Label className="text-[11px] text-muted-foreground">{t("dfb.fieldLabel")}</Label>
                        <Input
                          value={selectedFieldRef.field.label}
                          onChange={(e) => updateField(selectedFieldRef.field.key, { label: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1.5">
                          <Label className="text-[11px] text-muted-foreground">{t("dfb.fieldType")}</Label>
                          <Select
                            value={selectedFieldRef.field.fieldType}
                            onValueChange={(v) => updateField(selectedFieldRef.field.key, { fieldType: v, queryRef: null, queryFieldKey: null })}
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
                            value={String(selectedFieldRef.field.widthSpan)}
                            onValueChange={(v) => updateField(selectedFieldRef.field.key, { widthSpan: Number(v) })}
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
                            checked={selectedFieldRef.field.required}
                            onCheckedChange={(v) => updateField(selectedFieldRef.field.key, { required: Boolean(v) })}
                            aria-label={t("dfb.required")}
                          />
                          {t("dfb.required")}
                        </label>
                        <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                          <Checkbox
                            checked={selectedFieldRef.field.readOnly}
                            onCheckedChange={(v) => updateField(selectedFieldRef.field.key, { readOnly: Boolean(v) })}
                            aria-label={t("dfb.studio.readOnly")}
                          />
                          {t("dfb.studio.readOnly")}
                        </label>
                      </div>
                      {(selectedFieldRef.field.fieldType === "select" || selectedFieldRef.field.fieldType === "lookup") && (
                        <>
                          <div className="grid gap-1.5">
                            <Label className="text-[11px] text-muted-foreground">{t("dfb.queryBind")}</Label>
                            <Select
                              value={selectedFieldRef.field.queryRef != null ? String(selectedFieldRef.field.queryRef) : "-"}
                              onValueChange={(v) =>
                                updateField(selectedFieldRef.field.key, {
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
                          {selectedFieldRef.field.queryRef != null && (
                            <div className="grid gap-1.5">
                              <Label className="text-[11px] text-muted-foreground">{t("dfb.queryValueColumn")}</Label>
                              <Select
                                value={selectedFieldRef.field.queryFieldKey ?? "-"}
                                onValueChange={(v) => updateField(selectedFieldRef.field.key, { queryFieldKey: v === "-" ? null : v })}
                              >
                                <SelectTrigger aria-label={t("dfb.queryValueColumn")} className="h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="-">{t("dfb.none")}</SelectItem>
                                  {(queries.find((q) => q.id === selectedFieldRef.field.queryRef)?.fields ?? []).map((qf) => (
                                    <SelectItem key={qf.fieldName} value={qf.fieldName}>{qf.fieldName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </>
                      )}
                      {/* Task 58 (owner request) — list/radio ITEMS: the user
                          defines the items OR fetches them from a script;
                          they feed the field AND its records-table column */}
                      {selectedFieldRef.field.fieldType === "select" ||
                       selectedFieldRef.field.fieldType === "radio" ? (
                        <div className="grid gap-1.5 rounded-xl border border-violet-600/30 bg-violet-500/5 p-2">
                          <Label className="text-[11px] text-violet-700 dark:text-violet-400">
                            {t("dfb.studio.listItems")}
                          </Label>
                          <p className="text-[10px] leading-relaxed text-muted-foreground">
                            {t("dfb.studio.listItemsHint")}
                          </p>
                          {fieldConfigItems(selectedFieldRef.field.config).length === 0 ? (
                            <p className="rounded-lg border border-dashed border-border/70 px-2 py-1.5 text-[10px] text-muted-foreground">
                              {t("dfb.studio.listItemsEmpty")}
                            </p>
                          ) : (
                            <div className="grid max-h-28 gap-1 overflow-y-auto pe-0.5 scrollbar-slim">
                              {fieldConfigItems(selectedFieldRef.field.config).map((it, i) => (
                                <div key={`${it.value}-${i}`} className="flex items-center gap-1.5">
                                  <Input
                                    value={it.label}
                                    onChange={(e) => updateItemLabel(selectedFieldRef.field.key, i, e.target.value)}
                                    className="h-7 text-xs"
                                    aria-label={`${t("dfb.studio.listItems")} ${i + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeItem(selectedFieldRef.field.key, i)}
                                    aria-label={t("common.delete")}
                                    title={t("common.delete")}
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-rose-600 transition-colors hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={newItemLabel}
                              onChange={(e) => setNewItemLabel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addItem();
                                }
                              }}
                              placeholder={t("dfb.studio.listItemPlaceholder")}
                              className="h-7 flex-1 text-xs"
                              aria-label={t("dfb.studio.listItemAdd")}
                            />
                            <Button
                              type="button" size="sm" variant="outline"
                              className="h-7 shrink-0 border-violet-600/50 text-violet-700 hover:bg-violet-500/10 dark:text-violet-400"
                              disabled={!newItemLabel.trim()}
                              onClick={addItem}
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden />
                              {t("dfb.studio.listItemAdd")}
                            </Button>
                          </div>
                          {/* items from script */}
                          <Label className="mt-1 text-[11px] text-muted-foreground">
                            {t("dfb.studio.itemsScriptEditor")}
                          </Label>
                          <textarea
                            value={fieldItemsScript(selectedFieldRef.field.config)}
                            onChange={(e) =>
                              updateField(selectedFieldRef.field.key, {
                                config: { ...(selectedFieldRef.field.config ?? {}), itemsScript: e.target.value },
                              })
                            }
                            rows={4}
                            spellCheck={false}
                            dir="ltr"
                            aria-label={t("dfb.studio.itemsScriptEditor")}
                            placeholder={'const rows = await db.table("DfbMenu").findMany({ take: 20 });\nreturn rows;'}
                            className="w-full resize-y rounded-lg border border-input bg-background px-2 py-1.5 font-mono text-[11px] leading-relaxed text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:bg-background"
                          />
                          <Button
                            type="button" size="sm"
                            className="h-7 bg-violet-600 hover:bg-violet-700"
                            disabled={itemsBusy}
                            onClick={runItemsScript}
                          >
                            {itemsBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            ) : (
                              <Braces className="h-3.5 w-3.5" aria-hidden />
                            )}
                            {t("dfb.studio.itemsRun")}
                          </Button>
                          {(itemsCandidates[selectedFieldRef.field.key] ?? []).length > 0 && (
                            <>
                              <Label className="text-[11px] text-muted-foreground">
                                {t("dfb.studio.itemsFetched")}
                              </Label>
                              <div className="max-h-28 overflow-y-auto rounded-lg border border-border/60 bg-background/70 p-1.5 scrollbar-slim">
                                {(itemsCandidates[selectedFieldRef.field.key] ?? []).map((c) => {
                                  const pickedSet = itemsPicked[selectedFieldRef.field.key];
                                  const picked = pickedSet ? pickedSet.includes(c.value) : true; // default = ALL
                                  return (
                                    <label
                                      key={c.value}
                                      className="flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 text-[11px] hover:bg-foreground/5"
                                    >
                                      <Checkbox
                                        checked={picked}
                                        onCheckedChange={(v) =>
                                          toggleItemCandidate(selectedFieldRef.field.key, c.value, v === true)
                                        }
                                        aria-label={c.label}
                                      />
                                      <span className="min-w-0 flex-1 truncate">{c.label}</span>
                                      {c.value !== c.label && (
                                        <span className="shrink-0 font-mono text-[9px] text-muted-foreground" dir="ltr">
                                          {c.value}
                                        </span>
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                              <Button
                                type="button" size="sm" variant="outline"
                                className="h-7 border-violet-600/50 text-violet-700 hover:bg-violet-500/10 dark:text-violet-400"
                                onClick={addSelectedItems}
                              >
                                <Plus className="h-3.5 w-3.5" aria-hidden />
                                {t("dfb.studio.itemsAddSelected")}
                              </Button>
                            </>
                          )}
                        </div>
                      ) : null}
                      {/* Task 53 — script field config: editor + «اجرا و واکشی»
                          + the FETCHED fields (selectable) + add-to-form */}
                      {selectedFieldRef.field.fieldType === "script" && (
                        <div className="grid gap-1.5 rounded-xl border border-teal-600/30 bg-teal-500/5 p-2">
                          <Label className="text-[11px] text-teal-700 dark:text-teal-400">
                            {t("dfb.studio.scriptEditor")}
                          </Label>
                          <textarea
                            value={String(selectedFieldRef.field.config?.script ?? "")}
                            onChange={(e) =>
                              updateField(selectedFieldRef.field.key, {
                                config: { ...(selectedFieldRef.field.config ?? {}), script: e.target.value },
                              })
                            }
                            rows={6}
                            spellCheck={false}
                            dir="ltr"
                            aria-label={t("dfb.studio.scriptEditor")}
                            placeholder={'const rows = await db.table("DfbMenu").findMany({ take: 10 });\nreturn rows;'}
                            className="w-full resize-y rounded-lg border border-input bg-background px-2 py-1.5 font-mono text-[11px] leading-relaxed text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:bg-background"
                          />
                          <p className="text-[10px] leading-relaxed text-muted-foreground">
                            {t("dfb.studio.scriptHint")}
                          </p>
                          <Button
                            type="button" size="sm"
                            className="h-7 bg-teal-600 hover:bg-teal-700"
                            disabled={scriptBusy}
                            onClick={runSelectedScript}
                          >
                            {scriptBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            ) : (
                              <Braces className="h-3.5 w-3.5" aria-hidden />
                            )}
                            {t("dfb.studio.scriptRun")}
                          </Button>
                          <Label className="text-[11px] text-muted-foreground">
                            {t("dfb.studio.scriptFetched")}
                          </Label>
                          {!Array.isArray(selectedFieldRef.field.config?.fields) ||
                           (selectedFieldRef.field.config?.fields as string[]).length === 0 ? (
                            <p className="rounded-lg border border-dashed border-border/70 px-2 py-1.5 text-[10px] leading-relaxed text-muted-foreground">
                              {t("dfb.studio.scriptFetchedEmpty")}
                            </p>
                          ) : (
                            <>
                              <div className="max-h-28 overflow-y-auto rounded-lg border border-border/60 bg-background/70 p-1.5 scrollbar-slim">
                                {(selectedFieldRef.field.config?.fields as string[]).map((name) => {
                                  const sel =
                                    Array.isArray(selectedFieldRef.field.config?.selected) &&
                                    (selectedFieldRef.field.config?.selected as string[]).includes(name);
                                  return (
                                    <label
                                      key={name}
                                      className="flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 text-[11px] hover:bg-foreground/5"
                                    >
                                      <Checkbox
                                        checked={sel}
                                        onCheckedChange={(v) => toggleScriptFieldSelection(name, v === true)}
                                        aria-label={name}
                                      />
                                      <span className="min-w-0 flex-1 truncate font-mono" dir="ltr">{name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              <Button
                                type="button" size="sm" variant="outline"
                                className="h-7 border-teal-600/50 text-teal-700 hover:bg-teal-500/10 dark:text-teal-400"
                                onClick={addSelectedScriptFields}
                              >
                                <Plus className="h-3.5 w-3.5" aria-hidden />
                                {t("dfb.studio.scriptAddSelected")}
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      {/* Task 53 — derived field: show its script binding */}
                      {typeof selectedFieldRef.field.config?.bindField === "string" && (
                        <p className="flex items-center gap-1.5 rounded-lg border border-teal-600/30 bg-teal-500/5 px-2 py-1.5 text-[10px] text-teal-700 dark:text-teal-400">
                          <Braces className="h-3 w-3 shrink-0" aria-hidden />
                          {t("dfb.studio.scriptBindNote")
                            .replace("{field}", String(selectedFieldRef.field.config.bindField))}
                        </p>
                      )}
                      {!isSystem && (
                        <Button
                          type="button" size="sm" variant="outline"
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => {
                            removeField(selectedFieldRef.containerKey, selectedFieldRef.field.key);
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

      {/* Task 50 — «افزودن تب» dialog: Persian + Latin (Latin-only enforced)
          titles; the created tab is placed INSIDE the target band */}
      {tabDialogFor && (
        <AddTabDialog
          bankTitle={state.banks.find((b) => b.key === tabDialogFor)?.title ?? ""}
          onClose={() => setTabDialogFor(null)}
          onConfirm={(titleFa, titleEn) => addTab(tabDialogFor, titleFa, titleEn)}
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

/** Task 53 — reusable toolbox tile grid (input fields AND the shapes group);
    click = add to the active container, drag = drop onto any band/footer. */
function PaletteTileGrid({
  types, paletteType, onPick,
}: {
  types: string[];
  paletteType: string;
  onPick: (fieldType: string) => void;
}) {
  const t = useT();
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {types.map((ft) => {
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
            onClick={() => onPick(ft)}
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
  );
}

function BankCanvas({
  bank, index, isMain, active, activeTabKey, align, resizing, onResizeLive, onResizeCommit,
  selectedFieldKey, isSystem,
  onSelectBank, onSelectTab, onSelectField, onAddField, onAddTab, onRemoveTab,
  onMoveFieldDir, onRemoveField, onMoveBank, onRemoveBank, onDragStartField, onDropInBank,
}: {
  bank: StudioBank;
  index: number;
  isMain: boolean;
  active: boolean;
  /** Task 50 — key of the ACTIVE tab inside a grid band (null = none) */
  activeTabKey: string | null;
  /** Task 48 — bank-level horizontal alignment (persists in style.bankAlign) */
  align: DfbBankAlign;
  /** Task 48 — live width of the field being resized with the mouse */
  resizing: { key: string; pct: number } | null;
  onResizeLive: (r: { key: string; pct: number } | null) => void;
  onResizeCommit: (fieldKey: string, pct: number) => void;
  selectedFieldKey: string | null;
  isSystem: boolean;
  onSelectBank: () => void;
  onSelectTab: (tabKey: string) => void;
  onSelectField: (containerKey: string, key: string) => void;
  onAddField: () => void;
  onAddTab: () => void;
  onRemoveTab: (tabKey: string) => void;
  onMoveFieldDir: (containerKey: string, key: string, dir: -1 | 1) => void;
  onRemoveField: (containerKey: string, key: string) => void;
  onMoveBank: (dir: -1 | 1) => void;
  onRemoveBank: () => void;
  onDragStartField: (containerKey: string, fieldKey: string) => void;
  onDropInBank: (containerKey: string, beforeKey: string | null) => void;
}) {
  const t = useT();
  const [over, setOver] = React.useState(false);

  /* Task 50 — a records-table band routes its field flow into the ACTIVE
     (or first) tab created with «افزودن تب»; main & input-fields bands
     hold their fields directly */
  const activeTab = (activeTabKey ? bank.tabs.find((x) => x.key === activeTabKey) : null) ?? bank.tabs[0] ?? null;
  const flowContainer =
    bank.tabKind === 1 && activeTab ? `${bank.key}::${activeTab.key}` : bank.key;
  const flowFields = bank.tabKind === 1 ? (activeTab?.fields ?? []) : bank.fields;
  const totalFields =
    bank.tabKind === 1 ? bank.tabs.reduce((n, tb) => n + tb.fields.length, 0) : bank.fields.length;

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
        onDropInBank(flowContainer, null); // drop on the container body = append
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
            ({t("dfb.studio.fieldsCount").replace("{n}", String(totalFields))})
          </span>
        </button>
        {/* Task 49 — band-model chip (records table vs input fields) on tab bands */}
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
            {/* Task 50 — «افزودن تب» ON the records-table band (owner request:
                the created tab must be placed INSIDE the band) */}
            {!isMain && bank.tabKind === 1 && (
              <Button
                type="button" size="sm" variant="outline"
                className="h-6 border-amber-500/50 px-2 text-[11px] text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
                onClick={onAddTab}
              >
                <Plus className="h-3 w-3" aria-hidden /> {t("dfb.studio.addTab")}
              </Button>
            )}
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
                <MiniIconBtn label={t("common.delete")} danger onClick={onRemoveBank} disabled={bankHasFields(bank)} title={bankHasFields(bank) ? t("dfb.studio.bankDeleteHint") : undefined}>
                  <Trash2 className="h-3 w-3" aria-hidden />
                </MiniIconBtn>
              </>
            )}
          </span>
        )}
      </div>

      {/* Task 50 — records-table band body: its OWN tab strip + the active
          tab's fields; empty band asks for its first tab */}
      {bank.tabKind === 1 ? (
        bank.tabs.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-6 text-center">
            <Grid3x3 className="h-6 w-6 text-amber-600/70 dark:text-amber-400/70" aria-hidden />
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">{t("dfb.studio.emptyGridBand")}</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{t("dfb.studio.emptyGridBandHint")}</p>
            {!isSystem && (
              <Button type="button" size="sm" className="mt-1 h-7" onClick={onAddTab}>
                <Plus className="h-3.5 w-3.5" aria-hidden /> {t("dfb.studio.addTab")}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* inner tab strip — tabs created with «افزودن تب» live HERE */}
            <div
              role="tablist"
              aria-label={t("dfb.studio.bandTabs")}
              className="mb-2 flex flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-background/50 p-1"
            >
              {bank.tabs.map((tb) => {
                const tabActive = tb.key === activeTab?.key;
                return (
                  <span
                    key={tb.key}
                    role="tab"
                    aria-selected={tabActive}
                    tabIndex={0}
                    onClick={() => onSelectTab(tb.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectTab(tb.key);
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      tabActive
                        ? "bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/40 dark:text-amber-400"
                        : "text-muted-foreground hover:bg-foreground/5",
                    )}
                  >
                    {tb.title}
                    {tb.titleEn && <span dir="ltr" className="text-[9px] opacity-70">{tb.titleEn}</span>}
                    <Badge variant="outline" className="px-1 py-0 font-mono text-[8px]" dir="ltr">{tb.fields.length}</Badge>
                    {!isSystem && (
                      <MiniIconBtn
                        label={t("common.delete")}
                        danger
                        disabled={tb.fields.length > 0}
                        title={tb.fields.length > 0 ? t("dfb.studio.tabDeleteHint") : undefined}
                        onClick={() => onRemoveTab(tb.key)}
                      >
                        <X className="h-3 w-3" aria-hidden />
                      </MiniIconBtn>
                    )}
                  </span>
                );
              })}
              {!isSystem && (
                <button
                  type="button"
                  onClick={onAddTab}
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-amber-500/50 px-2 py-1 text-[11px] text-amber-700 transition-colors hover:bg-amber-500/10 dark:text-amber-400"
                >
                  <Plus className="h-3 w-3" aria-hidden /> {t("dfb.studio.addTab")}
                </button>
              )}
            </div>
            {flowFields.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/60 px-3 py-5 text-center text-[11px] text-muted-foreground">
                {t("dfb.studio.emptyBankHint")}
              </p>
            ) : (
              <FieldFlow
                fields={flowFields}
                containerKey={flowContainer}
                align={align}
                resizing={resizing}
                onResizeLive={onResizeLive}
                onResizeCommit={onResizeCommit}
                selectedFieldKey={selectedFieldKey}
                isSystem={isSystem}
                onSelectField={onSelectField}
                onMoveFieldDir={onMoveFieldDir}
                onRemoveField={onRemoveField}
                onDragStartField={onDragStartField}
                onDropBefore={(beforeKey) => onDropInBank(flowContainer, beforeKey)}
              />
            )}
          </>
        )
      ) : flowFields.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 px-3 py-5 text-center text-[11px] text-muted-foreground">
          {t("dfb.studio.emptyBankHint")}
        </p>
      ) : (
        <FieldFlow
          fields={flowFields}
          containerKey={flowContainer}
          align={align}
          resizing={resizing}
          onResizeLive={onResizeLive}
          onResizeCommit={onResizeCommit}
          selectedFieldKey={selectedFieldKey}
          isSystem={isSystem}
          onSelectField={onSelectField}
          onMoveFieldDir={onMoveFieldDir}
          onRemoveField={onRemoveField}
          onDragStartField={onDragStartField}
          onDropBefore={(beforeKey) => onDropInBank(flowContainer, beforeKey)}
        />
      )}
    </div>
  );
}

/**
 * Task 53 — «باند فوتر» (owner: «یک باند ... مختص و ویژهٔ فوتر فرم ... این
 * باند همیشه در انتهای فرم باید نمایش داده شود») — the dedicated FOOTER
 * band canvas: violet-dashed chrome, a lock chip («همیشه در انتهای فرم»),
 * NOT orderable/removable, and ALWAYS rendered after every body band in the
 * design canvas. Its fields persist with Section="footer" and run in the
 * template's pinned end-of-form zone.
 */
function FooterBandCanvas({
  fields, active, selectedFieldKey, isSystem, resizing,
  onResizeLive, onResizeCommit, onSelect, onSelectField, onAddField,
  onMoveFieldDir, onRemoveField, onDragStartField, onDropInBank,
}: {
  fields: StudioField[];
  active: boolean;
  selectedFieldKey: string | null;
  isSystem: boolean;
  resizing: { key: string; pct: number } | null;
  onResizeLive: (r: { key: string; pct: number } | null) => void;
  onResizeCommit: (fieldKey: string, pct: number) => void;
  onSelect: () => void;
  onSelectField: (key: string) => void;
  onAddField: () => void;
  onMoveFieldDir: (key: string, dir: -1 | 1) => void;
  onRemoveField: (key: string) => void;
  onDragStartField: (fieldKey: string) => void;
  onDropInBank: (beforeKey: string | null) => void;
}) {
  const t = useT();
  const [over, setOver] = React.useState(false);
  return (
    <div
      data-footer-band
      onDragOver={(e) => {
        if (!dragRef.current) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDropInBank(null); // drop on the band body = append
      }}
      className={cn(
        "mt-3 rounded-2xl border-2 border-dashed p-2.5 transition-colors sm:p-3",
        over || active
          ? "border-violet-500/70 bg-violet-500/5"
          : "border-violet-500/30 bg-violet-500/[0.03]",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 text-xs font-semibold transition-colors hover:bg-foreground/5",
            active ? "text-violet-700 dark:text-violet-400" : "text-foreground/80",
          )}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-violet-500 to-purple-600 text-white" aria-hidden>
            <FormInput className="h-2.5 w-2.5" />
          </span>
          {t("dfb.studio.footerBand")}
          <span className="font-normal text-muted-foreground">
            ({t("dfb.studio.fieldsCount").replace("{n}", String(fields.length))})
          </span>
        </button>
        {/* the owner rule chip: this band is PINNED to the end of the form */}
        <Badge variant="outline" className="gap-1 border-violet-500/40 px-1.5 py-0 text-[9px] text-violet-700 dark:text-violet-400">
          <Lock className="h-2.5 w-2.5" aria-hidden />
          {t("dfb.studio.footerBandChip")}
        </Badge>
        {!isSystem && (
          <span className="ms-auto flex items-center gap-1">
            <Button
              type="button" size="sm" variant="outline"
              className="h-6 px-2 text-[11px]"
              onClick={onAddField}
              title={t("dfb.addField")}
            >
              <Plus className="h-3 w-3" aria-hidden /> {t("dfb.addField")}
            </Button>
          </span>
        )}
      </div>
      {fields.length === 0 ? (
        <p className="rounded-xl border border-dashed border-violet-500/30 px-3 py-5 text-center text-[11px] text-muted-foreground">
          {t("dfb.studio.footerBandHint")}
        </p>
      ) : (
        <FieldFlow
          fields={fields}
          containerKey="footer"
          align="start"
          resizing={resizing}
          onResizeLive={onResizeLive}
          onResizeCommit={onResizeCommit}
          selectedFieldKey={selectedFieldKey}
          isSystem={isSystem}
          onSelectField={(_, key) => onSelectField(key)}
          onMoveFieldDir={(_, key, dir) => onMoveFieldDir(key, dir)}
          onRemoveField={(_, key) => onRemoveField(key)}
          onDragStartField={(_, fieldKey) => onDragStartField(fieldKey)}
          onDropBefore={onDropInBank}
        />
      )}
    </div>
  );
}

/**
 * Task 50 — the flow layout of ONE field container (a band's own fields or
 * the fields of a tab inside a records-table band): per-field width % +
 * band alignment + mouse resize handles + drop-before insertion markers.
 */
function FieldFlow({
  fields, containerKey, align, resizing, onResizeLive, onResizeCommit,
  selectedFieldKey, isSystem, onSelectField, onMoveFieldDir, onRemoveField,
  onDragStartField, onDropBefore,
}: {
  fields: StudioField[];
  containerKey: string;
  align: DfbBankAlign;
  resizing: { key: string; pct: number } | null;
  onResizeLive: (r: { key: string; pct: number } | null) => void;
  onResizeCommit: (fieldKey: string, pct: number) => void;
  selectedFieldKey: string | null;
  isSystem: boolean;
  onSelectField: (containerKey: string, key: string) => void;
  onMoveFieldDir: (containerKey: string, key: string, dir: -1 | 1) => void;
  onRemoveField: (containerKey: string, key: string) => void;
  onDragStartField: (containerKey: string, fieldKey: string) => void;
  onDropBefore: (beforeKey: string | null) => void;
}) {
  return (
    <div
      data-flow-container
      className={cn(
        "flex flex-wrap",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
      )}
    >
      {fields.map((f, fi) => {
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
              onSelect={() => onSelectField(containerKey, f.key)}
              onMoveDir={(dir) => onMoveFieldDir(containerKey, f.key, dir)}
              onRemove={() => onRemoveField(containerKey, f.key)}
              onDragStart={() => onDragStartField(containerKey, f.key)}
              onDropBefore={() => onDropBefore(f.key)}
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
  /* Task 53 — design shapes on the canvas card (mini renders) */
  if (type === "line") {
    return (
      <div aria-hidden className="py-1.5">
        <div className="h-0.5 w-full rounded-full bg-gradient-to-l from-border via-foreground/30 to-border" />
      </div>
    );
  }
  if (type === "box") {
    return <div aria-hidden className="h-8 w-full rounded-lg border-2 border-border/70 bg-muted/30" />;
  }
  if (type === "circle") {
    return (
      <div aria-hidden className="flex w-full justify-center py-0.5">
        <div className="h-9 w-9 rounded-full border-2 border-border/70 bg-muted/30" />
      </div>
    );
  }
  if (type === "oval") {
    return (
      <div aria-hidden className="flex w-full justify-center py-0.5">
        <div className="h-7 w-20 rounded-[50%] border-2 border-border/70 bg-muted/30" />
      </div>
    );
  }
  /* Task 53 — script data-source element on the canvas card */
  if (type === "script") {
    return (
      <div
        aria-hidden
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-teal-600/40 bg-teal-500/5 px-2 py-1.5 text-[10px] text-teal-700 dark:text-teal-400"
      >
        <Braces className="h-3 w-3 shrink-0" />
        <span className="min-w-0 flex-1 truncate font-mono" dir="ltr">
          {typeof field.config?.script === "string" && field.config.script.trim() ? "function(db) { … }" : "—"}
        </span>
      </div>
    );
  }
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
  /* Task 58 (owner request) — radio: two mini radio dots with labels */
  if (type === "radio") {
    return (
      <div className="flex items-center gap-3 py-1" aria-hidden>
        {[0, 1].map((i) => (
          <span key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-input">
              {i === 0 && <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />}
            </span>
            <span className="h-1.5 w-8 rounded-full bg-border" />
          </span>
        ))}
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
 * Task 51 — LIVE preview = the RUNNING form itself (owner request: «اگر فرمی
 * دارای تب بندی بود باید تب ها همانند نمونه فرم نمایش داده شود»). The flat
 * field flow of Task 48 is replaced by the REAL SimpleFormTwoRowTabbed
 * template engine — the exact component the runtime mounts — mapped from the
 * studio model: main-band fields flow on top, records-table bands become
 * tabs (their «افزودن تب» children = inner tab strips, each one a grid),
 * input-fields bands become "fields" tabs. No designer chrome (dashed bands,
 * add buttons) ever renders; data entry still saves to the EAV store.
 */
function PreviewCanvas({
  state, values, options, itemOptions, records, align, busy,
  onFieldChange, onSave, onSaveClose, onReset, onCopy, onDelete, onPrint,
  onExitPreview, onOpenRecord,
}: {
  state: StudioState;
  values: Record<string, string | boolean>;
  options: Record<number, Array<{ value: string; label: string }>>;
  /* Task 58 — script-fetched items of select/radio fields (field.key → items) */
  itemOptions: Record<string, DfbFieldItem[]>;
  records: Array<{ dataId: number; values: Record<string, string | boolean> }>;
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
  const locale = useSettings((s) => s.locale);
  const theme = dfbShellTheme(state.shell.style);
  /* Task 58 — items of a select/radio field: bound-query options win, then
     the script-fetched items, then the items defined in the studio rail —
     merged VALUE-UNIQUE (mirrors the runtime's resolveFieldOptions) */
  const fieldOpts = (f: StudioField): Array<{ value: string; label: string }> | undefined => {
    if (f.queryRef != null) {
      const q = options[f.queryRef];
      if (q) return q;
    }
    const merged: Array<{ value: string; label: string }> = [];
    const seen = new Set<string>();
    for (const it of [...(itemOptions[f.key] ?? []), ...fieldConfigItems(f.config)]) {
      if (seen.has(it.value)) continue;
      seen.add(it.value);
      merged.push(it);
    }
    return merged.length > 0 ? merged : undefined;
  };
  const toSimple = (f: StudioField): SimpleFormField => ({
    id: f.key,
    label: f.label,
    type: (FIELD_TYPE_META[f.fieldType] ? f.fieldType : "text") as SimpleFormField["type"],
    required: f.required,
    value: f.fieldType === "checkbox" ? undefined : String(values[f.key] ?? ""),
    checked: f.fieldType === "checkbox" ? Boolean(values[f.key]) : undefined,
    readOnly: f.readOnly,
    widthPct: f.widthSpan,
    options: fieldOpts(f),
    ltr: f.fieldType === "number" || f.fieldType === "date",
    disabled: busy,
  });
  /** grid columns of one record table (tab fields → columns, widths ride;
      Task 58 — the cell editor follows the column TYPE + items) */
  const colOf = (f: StudioField): SimpleFormGridColumn => ({
    id: f.key,
    label: f.label,
    required: f.required,
    minWidth: widthMinWidthClass(f.widthSpan),
    type: (FIELD_TYPE_META[f.fieldType] ? f.fieldType : "text") as SimpleFormGridColumn["type"],
    options: fieldOpts(f),
  });

  /* Task 52 (owner rule «عنوان عناصر طراحی در پیش‌نمایش نباید نمایش داده
     شود») — mirrors the runtime mapper exactly: bands are DESIGN elements
     and never render as tabs; the tabs created with «افزودن تب» inside a
     records-table band are flattened into the ONE top-level strip, exactly
     like the sample form. Labels are locale-aware (dfbFormTitle). */
  const previewTabs: SimpleFormTab[] = [];
  for (const bank of state.banks.slice(1)) {
    if (bank.tabKind === 2) {
      previewTabs.push({
        id: bank.key,
        label: bank.title,
        kind: "fields" as const,
        columns: [],
        fields: bank.fields.map(toSimple),
      });
      continue;
    }
    if (bank.tabs.length > 0) {
      /* legacy band-level fields (pre-Task 50 save) wrap into ONE pseudo tab
         titled after the band — render it like the runtime does: a plain
         grid tab, no inner strip (the wrap is materialized on next save) */
      if (bank.tabs.length === 1 && bank.tabs[0].key.startsWith("tb-legacy-")) {
        previewTabs.push({ id: bank.key, label: bank.title, columns: bank.tabs[0].fields.map(colOf) });
        continue;
      }
      /* each «افزودن تب» tab = its own grid tab in the flat strip */
      for (const tb of bank.tabs) {
        previewTabs.push({
          id: `${bank.key}::${tb.key}`,
          label: dfbFormTitle({ title: tb.title, titleEn: tb.titleEn }, locale),
          columns: tb.fields.map(colOf),
        });
      }
      /* defensive: direct band-level fields beside real tabs keep a grid of
         their own, titled after the band (same as the runtime mapper) */
      if (bank.fields.length > 0) {
        previewTabs.push({ id: `band-${bank.key}`, label: bank.title, columns: bank.fields.map(colOf) });
      }
      continue;
    }
    /* legacy single-grid band (no «افزودن تب» tabs yet) */
    previewTabs.push({ id: bank.key, label: bank.title, columns: bank.fields.map(colOf) });
  }

  return (
    <SimpleFormTwoRowTabbed
      title={state.shell.title}
      badge={state.shell.badge || undefined}
      icon={<FileText className="h-3.5 w-3.5" aria-hidden />}
      headerClassName={theme.headerClassName}
      titleClassName={theme.titleClassName}
      bodyStyle={theme.bodyStyle}
      fields={state.banks[0]?.fields.map(toSimple) ?? []}
      onFieldChange={onFieldChange}
      tabs={previewTabs}
      /* Task 53 — the footer band ALWAYS renders in the template's pinned
         end-of-form zone, exactly like the running form */
      footerFields={(state.footer?.fields ?? []).map(toSimple)}
      actions={state.shell.footerButtons}
      fieldsAlign={align}
      onReset={onReset}
      onSave={onSave}
      onSaveClose={onSaveClose}
      onCopy={onCopy}
      onDelete={onDelete}
      onPrint={onPrint}
      onClose={onExitPreview}
      onHeaderClose={onExitPreview}
      listItems={records.map((r) => ({ id: String(r.dataId), title: String(r.dataId) }))}
      onOpenListItem={(item) => onOpenRecord(item.id)}
      canSave={!busy}
    />
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
            <LatinInput id="dfb-studio-title-en" value={titleEn} onValueChange={setTitleEn} />
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

/* ---------------------- Task 50 — add-tab dialog ---------------------- */

/**
 * «افزودن تب» — creates a tab INSIDE a records-table band. Takes the
 * Persian AND the Latin title from the user (owner request); the Latin
 * field hard-filters non-Latin characters (LatinInput) so other languages
 * can never be entered, and both titles are required.
 */
function AddTabDialog({
  bankTitle, onClose, onConfirm,
}: {
  bankTitle: string;
  onClose: () => void;
  onConfirm: (titleFa: string, titleEn: string) => void;
}) {
  const t = useT();
  const [titleFa, setTitleFa] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const canSave = Boolean(titleFa.trim()) && Boolean(titleEn.trim());

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md" dir="auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
            </span>
            {t("dfb.studio.addTab")}
          </DialogTitle>
          <DialogDescription>
            {t("dfb.studio.addTabDesc")}
            {bankTitle ? ` — ${bankTitle}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="dfb-tab-title-fa">{t("dfb.studio.tabTitleFa")}</Label>
            <Input
              id="dfb-tab-title-fa"
              value={titleFa}
              onChange={(e) => setTitleFa(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dfb-tab-title-en">{t("dfb.studio.tabTitleEn")}</Label>
            <LatinInput id="dfb-tab-title-en" value={titleEn} onValueChange={setTitleEn} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={() => onConfirm(titleFa.trim(), titleEn.trim())}
          >
            <Check className="h-4 w-4" aria-hidden /> {t("common.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
