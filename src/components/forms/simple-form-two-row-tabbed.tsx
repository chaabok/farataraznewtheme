"use client";

import * as React from "react";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Copy,
  Inbox,
  Minus,
  Plus,
  Save,
  Square,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/stores/settings-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormActionBar,
  type ActionBarListItem,
  type FormAction,
} from "@/components/forms/action-bar";
import { useAlignedLabels, type AlignedLabelsScope } from "@/components/forms/use-aligned-labels";
/* Task 30 — HeaderButton/NavButton/FieldCell moved verbatim to the shared
   form-primitives module so SimpleTreeForm reuses the identical visual
   contract (Task 25.1 label markup, Task 27 metrics, Task 26 RTL classes). */
import { FieldCell, FlowFieldGrid, GridCellInput, HeaderButton, NavButton } from "@/components/forms/form-primitives";
import { FormThemeToggle } from "@/components/forms/form-theme-toggle";

/* ------------------------------------------------------------------ */
/* Public API — SimpleFormTwoRowTabbed (Task 24)                        */
/* ------------------------------------------------------------------ */

export type SimpleFormFieldType =
  | "text"
  | "number"
  | "select"
  | "lookup"
  | "checkbox"
  | "date" // Task 47 — rendered as an LTR YYYY/MM/DD input with a calendar chip
  | "textarea" // Task 47 — rendered as a small multi-line box
  | "radio" // Task 58 (owner request) — radio group fed by defined/script items
  | "line" // Task 53 — static design shape (divider)
  | "box" // Task 53 — static design shape (rectangle)
  | "circle" // Task 53 — static design shape
  | "oval" // Task 53 — static design shape
  | "script"; // Task 53 — script data-source element (no input; fetched fields bind nearby)

export interface SimpleFormFieldOption {
  value: string;
  label: string;
}

export interface SimpleFormField {
  id: string;
  label: string;
  type?: SimpleFormFieldType;
  required?: boolean;
  /** controlled value for text/number/select/lookup */
  value?: string;
  /** controlled value for checkbox */
  checked?: boolean;
  placeholder?: string;
  options?: SimpleFormFieldOption[];
  /** small end-side badge inside the input (e.g. «بدهکار») */
  suffixChip?: string;
  /** renders the legacy [+] lookup button when provided */
  onLookup?: () => void;
  /** Task 32 — renders the input LTR (latin titles/codes inside the RTL shell) */
  ltr?: boolean;
  /** Task 70 — called when the user focuses the field: the runtime uses it
      to reveal the BASE value under a translation overlay before editing */
  onRevealFocus?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** Task 48 — width percent of the flow row (25..100, step 5); dfb-designed
      forms map DfbFormField.WidthSpan here. Omitted = legacy fixed grid. */
  widthPct?: number;
}

export interface SimpleFormGridColumn {
  id: string;
  label: string;
  required?: boolean;
  /** tailwind min-width hint for the column, e.g. "min-w-40" */
  minWidth?: string;
  /** Task 58 (owner request «هر فیلدی در گرید باید با همان فرمت اطلاعات
      دریافت کند») — the field type of the column: the grid cell renders
      the SAME editor the field renders in the body (checkbox → a real
      checkbox, select → an opening list, date → the YYYY/MM/DD mask,
      radio → a radio group); omitted = plain text input (legacy). */
  type?: SimpleFormFieldType;
  /** items of a select/radio column (defined items, query or script) */
  options?: SimpleFormFieldOption[];
}

/** OPTIONAL detail tab below the two-row fields (owner: tabs must be optional). */
export interface SimpleFormTab {
  id: string;
  label: string;
  columns: SimpleFormGridColumn[];
  /** initial rows; afterwards the grid rows are owned internally —
      mirror every change through onTabRowsChange if the caller needs them. */
  rows?: Record<string, string>[];
  /** Task 49 — tab model (owner request): "grid" (default) keeps the records
      table whose rows are created with the footer add button; "fields" is
      NOT a grid — the tab renders plain input fields (FlowFieldGrid) and the
      footer record buttons hide while it is active. */
  kind?: "grid" | "fields";
  /** Task 49 — input fields of a "fields" tab (entered like the main rows,
      saved with the form's own record) */
  fields?: SimpleFormField[];
  /* Task 52 (owner rule «عنوان عناصر طراحی در پیش‌نمایش نباید نمایش داده
     شود») — the Task 50 inner-strip model (band tab + children) is GONE:
     the dfb mapper now flattens the tabs created with «افزودن تب» into the
     ONE top-level strip, exactly like the sample form. Bands are design
     elements and never render here. */
}

export interface SimpleFormTwoRowTabbedProps {
  /** form header title (e.g. «مشتری جدید») */
  title: string;
  /** small pill after the title (e.g. «نمونه») */
  badge?: string;
  /** glyph inside the gradient header tile */
  icon?: React.ReactNode;

  /* ----- Task 47 — design-studio theme hooks (all optional) -----
     headerClassName: merged into the gradient header strip (theme palette);
     titleClassName: merged into the header <h2> (title font size);
     bodyStyle: inline style for the body wrapper (body font family). */
  headerClassName?: string;
  titleClassName?: string;
  bodyStyle?: React.CSSProperties;

  /** Task 80 — optional muted note rendered as a small line under the field
      grid (e.g. «تاریخ‌ها به‌صورت خودکار محاسبه می‌شوند…»). Absent = nothing. */
  hint?: React.ReactNode;

  /** the field rows — flows into a responsive 3-column grid (canonical two rows) */
  fields: SimpleFormField[];
  onFieldChange?: (id: string, value: string | boolean) => void;
  /** label alignment scope (Task 25.1): "container" (default) = ONE shared
      label width for the whole grid, so inputs align vertically through every
      column (legacy ERP look); "row" = each visual row aligns to its own
      widest label */
  labelScope?: AlignedLabelsScope;

  /* ----- OPTIONAL tabbed detail grids ----- */
  tabs?: SimpleFormTab[];
  defaultTabId?: string;
  onTabRowsChange?: (tabId: string, rows: Record<string, string>[]) => void;
  /** renders the footer save icon when provided */
  onSaveRows?: (tabId: string, rows: Record<string, string>[]) => void;

  /* ----- legacy record navigation «|< < > >|» ----- */
  onFirst?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onLast?: () => void;

  /* ----- Task-20 legacy action bar pass-through (composed) ----- */
  onReset?: FormAction;
  onSave?: FormAction;
  onSaveNew?: FormAction;
  onSaveClose?: FormAction;
  onCopy?: FormAction;
  onDelete?: FormAction;
  onDeleteNew?: FormAction;
  onDeleteClose?: FormAction;
  onPrint?: FormAction;
  /** composed into «ذخیره و بستن» / «حذف و بستن» by FormActionBar */
  onClose?: FormAction;
  /** Task 28 — help moved out of the header: rendered as the redesigned
      gradient tile at the end of the action-bar cluster */
  onHelp?: FormAction;
  listItems?: ActionBarListItem[];
  listLoading?: boolean;
  onOpenListItem?: (item: ActionBarListItem) => void;
  /* Task 86 — mini-grid dropdown: highlight of the open record + reload */
  listActiveId?: string | null;
  onListRefresh?: () => void | Promise<void>;
  /* Task 90 — «ترجمه» behavior of the current record (owner: the button
     exists in ALL forms; enablement lives inside TranslateButton) */
  onTranslateOnline?: FormAction;
  onTranslateOffline?: FormAction;
  /* Task 95 (درخواست مالک: «اطلاعات واردشدهٔ داخل تب‌ها هم ترجمه شود») —
     per-cell translation overlay of the grid tabs. The FORM resolves the
     overlay (Task 70/93 contract: locale ≠ fa + saved record + cell not
     focused/edited + translation exists); the shell only applies the value
     and forwards focus-reveals. Only TEXT cells participate — select/
     date/number/checkbox cells carry code values, never translated. */
  cellOverlay?: (tabId: string, rowIndex: number, colId: string) => string | undefined;
  onCellReveal?: (tabId: string, rowIndex: number, colId: string) => void;
  canSave?: boolean;
  canCopy?: boolean;
  canDelete?: boolean;
  canPrint?: boolean;
  /** Task 48 — allowlist of visible action-bar icons (stored form config);
      omitted = all ten icons (legacy default) */
  actions?: readonly string[];
  /** Task 48 — bank-level horizontal alignment of the field flow
      (persisted in the form's headerJson.style.bankAlign) */
  fieldsAlign?: "start" | "center" | "end";

  /** Task 53 (owner request «باند فوتر») — fields of the form's FOOTER band;
      they ALWAYS render in a dedicated zone at the very END of the form
      (after the tabs, before the row-actions strip), never inside it. */
  footerFields?: SimpleFormField[];

  /* ----- OPTIONAL chromeless-window header controls (Task 28) -----
     When hosted by a chromeless window (no light title bar) the green
     header strip becomes the drag handle and hosts the caption buttons. */
  /** taskbar-style minimize of the hosting window */
  onHeaderMinimize?: () => void;
  /** reflects the host window's maximized state (icon switches to restore) */
  headerMaximized?: boolean;
  /** window-drag pass-throughs attached to the header strip */
  onHeaderDragStart?: (e: React.PointerEvent) => void;
  onHeaderDragMove?: (e: React.PointerEvent) => void;
  onHeaderDragEnd?: (e: React.PointerEvent) => void;
  /** double-click on the strip toggles maximize (Windows caption rule) */
  onHeaderDoubleClick?: () => void;

  /* ----- OPTIONAL form-header controls (rendered only when provided) ----- */
  onHeaderClose?: () => void;
  onHeaderMaximize?: () => void;

  className?: string;
}

/* ------------------------------------------------------------------ */
/* Internals                                                            */
/* ------------------------------------------------------------------ */

function MiniRowButton({
  icon,
  label,
  tintClass,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  tintClass: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        tintClass,
        disabled && "pointer-events-none opacity-35",
      )}
    >
      {icon}
    </button>
  );
}

/**
 * SimpleFormTwoRowTabbed (Task 24) — the legacy «فرم سادهٔ دو ردیفه» shell:
 * gradient form header (title + Task-28 window caption: minimize / maximize /
 * close — the strip doubles as the drag handle of a chromeless host window),
 * the Task-20 legacy action bar (plus the Task-28 redesigned help tile) and
 * record navigation, a two-row field grid (with Task-25 automatic label
 * alignment via useAlignedLabels — default scope "container": straight
 * vertical input columns; opt-in labelScope="row" for per-row alignment),
 * and OPTIONAL tabbed detail grids with an empty state and a footer
 * row-actions strip (+ / × / copy / save). All action-bar handlers are
 * pass-throughs — the caller owns persistence and toasts.
 */
export function SimpleFormTwoRowTabbed({
  title,
  badge,
  icon,
  headerClassName,
  titleClassName,
  bodyStyle,
  hint,
  fields,
  onFieldChange,
  labelScope = "container",
  tabs,
  defaultTabId,
  onTabRowsChange,
  onSaveRows,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onReset,
  onSave,
  onSaveNew,
  onSaveClose,
  onCopy,
  onDelete,
  onDeleteNew,
  onDeleteClose,
  onPrint,
  onClose,
  onHelp,
  listItems,
  listLoading,
  onOpenListItem,
  listActiveId,
  onListRefresh,
  onTranslateOnline,
  onTranslateOffline,
  cellOverlay,
  onCellReveal,
  canSave = true,
  canCopy = true,
  canDelete = true,
  canPrint = true,
  actions,
  fieldsAlign,
  footerFields,
  onHeaderClose,
  onHeaderMaximize,
  onHeaderMinimize,
  headerMaximized,
  onHeaderDragStart,
  onHeaderDragMove,
  onHeaderDragEnd,
  onHeaderDoubleClick,
  className,
}: SimpleFormTwoRowTabbedProps) {
  const t = useT();
  const tabsProp = React.useMemo(() => tabs ?? [], [tabs]);

  /* Task 25.1 — automatic label alignment for the field grid. Default scope
     "container": one shared label width ⇒ every input starts on the same
     edge within its cell AND the edges stack into straight vertical columns
     across rows (the owner's expectation). Pass labelScope="row" for
     per-row alignment. */
  const fieldsGridRef = React.useRef<HTMLDivElement | null>(null);
  useAlignedLabels(fieldsGridRef, { scope: labelScope });

  /* Task 53 — the FOOTER band keeps its OWN label-alignment scope so the
     footer zone aligns internally regardless of the body grid. */
  const footerFieldsList = React.useMemo(() => footerFields ?? [], [footerFields]);
  const hasFooterFields = footerFieldsList.length > 0;
  const footerGridRef = React.useRef<HTMLDivElement | null>(null);
  useAlignedLabels(footerGridRef, { scope: labelScope });

  /* detail-grid rows: initialized once per mount from the tabs prop */
  const [rowsByTab, setRowsByTab] = React.useState<Record<string, Record<string, string>[]>>(
    () =>
      Object.fromEntries(
        tabsProp.map((tb) => [tb.id, (tb.rows ?? []).map((r) => ({ ...r }))]),
      ),
  );
  const [activeTab, setActiveTab] = React.useState(
    () => defaultTabId ?? tabsProp[0]?.id ?? "",
  );
  const [selected, setSelected] = React.useState<{ tabId: string; index: number } | null>(null);

  const hasTabs = tabsProp.length > 0;
  const hasNav = Boolean(onFirst || onPrev || onNext || onLast);

  /* Task 48 — flow mode when the dfb design supplies widths/alignment;
     legacy consumers (no widthPct, no fieldsAlign) keep the fixed grid */
  const flowMode =
    Boolean(fieldsAlign && fieldsAlign !== "start") || fields.some((f) => f.widthPct != null);

  /* the ACTIVE GRID tab the footer record buttons operate on */
  const activeTabDef = tabsProp.find((x) => x.id === activeTab);
  const activeTabIsGrid = activeTabDef ? activeTabDef.kind !== "fields" : true;

  const commitRows = (tabId: string, rows: Record<string, string>[]) => {
    setRowsByTab((prev) => ({ ...prev, [tabId]: rows }));
    onTabRowsChange?.(tabId, rows);
  };

  const addRow = () => {
    const tb = activeTabDef;
    if (!tb || tb.kind === "fields") return;
    const rows = rowsByTab[activeTab] ?? [];
    const blank = Object.fromEntries(tb.columns.map((c) => [c.id, ""])) as Record<string, string>;
    const next = [...rows, blank];
    commitRows(activeTab, next);
    setSelected({ tabId: activeTab, index: next.length - 1 });
  };

  const removeSelectedRow = () => {
    if (!selected || selected.tabId !== activeTab) return;
    const rows = [...(rowsByTab[activeTab] ?? [])];
    rows.splice(selected.index, 1);
    commitRows(activeTab, rows);
    setSelected(null);
  };

  const copySelectedRow = () => {
    if (!selected || selected.tabId !== activeTab) return;
    const rows = [...(rowsByTab[activeTab] ?? [])];
    const clone = { ...rows[selected.index] };
    rows.splice(selected.index + 1, 0, clone);
    commitRows(activeTab, rows);
    setSelected({ tabId: activeTab, index: selected.index + 1 });
  };

  const setCell = (tabId: string, rowIndex: number, colId: string, value: string) => {
    const rows = [...(rowsByTab[tabId] ?? [])];
    if (!rows[rowIndex]) return;
    rows[rowIndex] = { ...rows[rowIndex], [colId]: value };
    commitRows(tabId, rows);
  };

  const selectedInActive = Boolean(selected && selected.tabId === activeTab);

  /* records table of one grid tab (Task 52 — one flat strip, sample-form
     style; the Task 50 inner-strip branch is retired) */
  const renderGridTable = (tb: SimpleFormTab, rows: Record<string, string>[]) => (
    <div
      data-simple-form-grid={tb.id}
      className="min-h-0 flex-1 overflow-auto rounded-xl border bg-background/70 scrollbar-slim"
    >
      <table className="w-full min-w-max border-separate border-spacing-0 text-xs">
        <thead>
          <tr>
            {tb.columns.map((c) => (
              <th
                key={c.id}
                scope="col"
                className={cn(
                  "sticky top-0 z-10 border-b bg-muted/95 px-3 py-1.5 text-start font-semibold backdrop-blur",
                  c.minWidth,
                )}
              >
                {c.label}
                {c.required && (
                  <span className="ms-0.5 text-rose-500" aria-hidden>
                    *
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={tb.columns.length} className="px-3 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Inbox className="h-7 w-7 opacity-50" aria-hidden />
                  <span className="text-xs">{t("sft.noData")}</span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => {
              const sel = selected?.tabId === tb.id && selected.index === ri;
              return (
                <tr
                  key={ri}
                  onClick={() => setSelected({ tabId: tb.id, index: ri })}
                  className={cn(
                    "cursor-pointer transition-colors",
                    sel ? "bg-primary/10" : "hover:bg-foreground/5",
                  )}
                >
                  {tb.columns.map((c) => {
                    /* Task 95 — overlay display of text cells: the value the
                       caller returns (current-locale translation) covers the
                       base value; focusing the cell reveals the base (same
                       reveal contract as the main fields, Task 70/93). */
                    const base = row[c.id] ?? "";
                    const ov = cellOverlay?.(tb.id, ri, c.id);
                    const canReveal = (c.type ?? "text") === "text";
                    return (
                      <td key={c.id} className="border-b border-border/50 px-1.5 py-0.5">
                        {/* Task 58 — the cell editor follows the COLUMN TYPE:
                            checkbox → a real checkbox, select → an opening
                            list, date → the masked YYYY/MM/DD input, number →
                            LTR decimal, radio → a radio group — the owner rule
                            «هر فیلدی در گرید باید با همان فرمت از کاربر اطلاعات
                            دریافت کند» */}
                        <GridCellInput
                          column={c}
                          value={ov ?? base}
                          onChange={(v) => setCell(tb.id, ri, c.id, v)}
                          onFocus={canReveal ? () => onCellReveal?.(tb.id, ri, c.id) : undefined}
                          ariaLabel={`${tb.label} — ${c.label} ${ri + 1}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <section
      data-simple-form
      aria-label={title}
      className={cn("flex h-full min-h-0 flex-col overflow-hidden bg-background/25", className)}
    >
      {/* 1) form header — gradient identity strip; Task 26: emerald end sits
          on the inline END side in both directions (mirrored, §1.4).
          Task 28: the strip is also the drag handle of a chromeless host
          window and hosts the caption buttons [– □ ✕] (inline end). */}
      <header
        className={cn(
          "relative flex h-11 shrink-0 select-none items-center gap-2.5 rtl:bg-gradient-to-l ltr:bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600 px-3 text-white",
          headerClassName,
        )}
        onPointerDown={onHeaderDragStart}
        onPointerMove={onHeaderDragMove}
        onPointerUp={onHeaderDragEnd}
        onPointerCancel={onHeaderDragEnd}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest("[data-window-btn]")) return;
          onHeaderDoubleClick?.();
        }}
      >
        {icon && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20 shadow-inner">
            {icon}
          </span>
        )}
        <h2 className={cn("truncate text-sm font-bold tracking-tight drop-shadow-sm", titleClassName)}>{title}</h2>
        {badge && (
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-inset ring-white/25">
            {badge}
          </span>
        )}
        <div className="ms-auto flex items-center gap-0.5">
          {/* Task 73 — دکمهٔ تم شب/روز (درخواست مالک): ابتدای خوشهٔ caption */}
          <FormThemeToggle />
          {onHeaderMinimize && (
            <HeaderButton onClick={onHeaderMinimize} label={t("common.minimize")}>
              <Minus className="h-4 w-4" aria-hidden />
            </HeaderButton>
          )}
          {onHeaderMaximize && (
            <HeaderButton onClick={onHeaderMaximize} label={t("common.maximize")}>
              {headerMaximized ? (
                <Copy className="h-3 w-3 -scale-x-100" aria-hidden />
              ) : (
                <Square className="h-3 w-3" aria-hidden />
              )}
            </HeaderButton>
          )}
          {onHeaderClose && (
            <HeaderButton onClick={onHeaderClose} label={t("common.close")}>
              <X className="h-4 w-4" aria-hidden />
            </HeaderButton>
          )}
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/25"
        />
      </header>

      {/* 2) action strip — legacy FormActionBar (start) + record nav (end);
          Task 28: help rides INSIDE the action bar as its 11th gradient tile */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/60 bg-muted/40 px-3 py-2">
        <FormActionBar
          className="min-w-0 flex-1"
          onReset={onReset}
          onSave={onSave}
          onSaveNew={onSaveNew}
          onSaveClose={onSaveClose}
          onCopy={onCopy}
          onDelete={onDelete}
          onDeleteNew={onDeleteNew}
          onDeleteClose={onDeleteClose}
          onPrint={onPrint}
          onClose={onClose}
          onHelp={onHelp}
          listItems={listItems}
          listLoading={listLoading}
          onOpenListItem={onOpenListItem}
          listActiveId={listActiveId}
          onListRefresh={onListRefresh}
          onTranslateOnline={onTranslateOnline}
          onTranslateOffline={onTranslateOffline}
          canSave={canSave}
          canCopy={canCopy}
          canDelete={canDelete}
          canPrint={canPrint}
          actions={actions}
        />
        {/* Task 26 — per-button RTL flip (NOT on the group): the RTL flex
            flow already puts «اولین» at the reading start (right edge), and
            mirroring each button shows correctly-flipped glyphs. A group
            flip would push First to the group's LEFT edge — wrong reading
            order for RTL. */}
        {hasNav && (
          <div
            role="group"
            aria-label={t("sft.first")}
            className="flex shrink-0 items-center gap-0.5 rounded-lg border bg-background/60 p-1"
          >
            <NavButton icon={<ChevronFirst className="h-4 w-4" />} label={t("sft.first")} onClick={onFirst} />
            <NavButton icon={<ChevronLeft className="h-4 w-4" />} label={t("sft.prev")} onClick={onPrev} />
            <NavButton icon={<ChevronRight className="h-4 w-4" />} label={t("sft.next")} onClick={onNext} />
            <NavButton icon={<ChevronLast className="h-4 w-4" />} label={t("sft.last")} onClick={onLast} />
          </div>
        )}
      </div>

      {/* 3) body — two-row field grid + OPTIONAL tabbed detail grids.
          Task 27: vertical padding around the grid tightened (pt 16→10,
          pb 12→8) and the row gap 14→8 so fields sit closer together.
          Task 28-b: the body is a column flex box — the tabs section now
          FILLS the remaining height down to the form footer (its grid box
          grows instead of leaving dead space above the footer, per owner
          request «بدنه تب‌ها را به فوتر بچسبانید»). The outer scroll only
          kicks in when the field block alone exceeds the body (tiny
          viewports); min-h-44 keeps the tabs section alive there. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-slim" style={bodyStyle}>
        <div className="shrink-0 px-4 pb-2 pt-2.5">
          {flowMode ? (
            <FlowFieldGrid
              fields={fields}
              onFieldChange={onFieldChange}
              gridRef={fieldsGridRef}
              align={fieldsAlign}
            />
          ) : (
            <div
              ref={fieldsGridRef}
              className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3"
            >
              {fields.map((f) => (
                <FieldCell key={f.id} field={f} onChange={onFieldChange} />
              ))}
            </div>
          )}
          {hint != null && (
            <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{hint}</p>
          )}
        </div>

        {hasTabs && (
          <div className="flex min-h-44 flex-1 flex-col border-t border-border/60 bg-muted/30 px-4 pt-2">
            <Tabs
              className="flex min-h-0 flex-1 flex-col"
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v);
                setSelected(null);
              }}
            >
              <TabsList className="h-8 w-auto shrink-0 justify-start rounded-lg bg-background/70 p-1">
                {tabsProp.map((tb) => (
                  <TabsTrigger
                    key={tb.id}
                    value={tb.id}
                    data-simple-form-tab={tb.id}
                    className="h-6 rounded-md px-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {tb.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabsProp.map((tb) => {
                const rows = rowsByTab[tb.id] ?? [];
                /* Task 49 — "fields" tabs render input fields, not a grid */
                if (tb.kind === "fields") {
                  const tabFields = tb.fields ?? [];
                  return (
                    <TabsContent key={tb.id} value={tb.id} className="mt-2 flex min-h-0 flex-1 flex-col">
                      <div
                        data-simple-form-fields-tab={tb.id}
                        className="min-h-0 flex-1 overflow-auto rounded-xl border bg-background/70 scrollbar-slim"
                      >
                        {tabFields.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 px-3 py-10 text-center text-muted-foreground">
                            <Inbox className="h-7 w-7 opacity-50" aria-hidden />
                            <span className="text-xs">{t("dfb.studio.emptyFieldsTab")}</span>
                          </div>
                        ) : (
                          <div className="px-3 pb-1 pt-3">
                            <FlowFieldGrid fields={tabFields} onFieldChange={onFieldChange} align={fieldsAlign} />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  );
                }
                return (
                  <TabsContent key={tb.id} value={tb.id} className="mt-2 flex min-h-0 flex-1 flex-col">
                    {renderGridTable(tb, rows)}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        )}
      </div>

      {/* 3.5) Task 53 — FOOTER band zone (owner: «این باند همیشه در انتهای
          فرم باید نمایش داده شود») — shrink-0 OUTSIDE the scrolling body so
          it is pinned to the very end of the form at every viewport size. */}
      {hasFooterFields && (
        <div
          data-form-footer-band
          className="shrink-0 border-t border-border/60 bg-muted/20 px-4 pb-2.5 pt-2.5"
        >
          <FlowFieldGrid
            fields={footerFieldsList}
            onFieldChange={onFieldChange}
            idPrefix="sft-footer"
            align={fieldsAlign}
            gridRef={footerGridRef}
          />
        </div>
      )}

      {/* 4) footer strip — row actions of the ACTIVE tab (only when tabs exist
          AND the active tab is a GRID tab — Task 49: "fields" tabs have no
          record rows, the footer add button creates grid records only).
          Task 29 — direction-aware anchoring: the row buttons anchor at the
          inline START and flow with the reading direction (RTL locales lay
          them out right→left with «افزودن» rightmost; LTR locales left→right
          with Add leftmost). me-auto reserves the far END side for the
          caller-owned record counter. */}
      {hasTabs && activeTabIsGrid && (
        <footer className="flex h-10 shrink-0 items-center gap-1 border-t border-border/60 bg-muted/40 px-3">
          <div className="me-auto flex items-center gap-1">
            <MiniRowButton
              icon={<Plus className="h-4 w-4" />}
              label={t("sft.addRow")}
              tintClass="text-amber-500 hover:bg-amber-500/15"
              onClick={addRow}
            />
            <MiniRowButton
              icon={<X className="h-4 w-4" />}
              label={t("sft.removeRow")}
              tintClass="text-rose-500 hover:bg-rose-500/15"
              onClick={removeSelectedRow}
              disabled={!selectedInActive}
            />
            <MiniRowButton
              icon={<Copy className="h-4 w-4" />}
              label={t("sft.copyRows")}
              tintClass="text-teal-500 hover:bg-teal-500/15"
              onClick={copySelectedRow}
              disabled={!selectedInActive}
            />
            {onSaveRows && (
              <>
                <span aria-hidden className="mx-1 h-5 w-px bg-border" />
                <MiniRowButton
                  icon={<Save className="h-4 w-4" />}
                  label={t("common.save")}
                  tintClass="text-emerald-500 hover:bg-emerald-500/15"
                  onClick={() => onSaveRows(activeTab, rowsByTab[activeTab] ?? [])}
                />
              </>
            )}
          </div>
          {hasNav && (
            <span className="text-[11px] text-muted-foreground" aria-live="polite">
              {/* record counter is caller-owned */}
            </span>
          )}
        </footer>
      )}
    </section>
  );
}
