"use client";

import * as React from "react";
import { Braces, CalendarDays, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SimpleFormField, SimpleFormGridColumn } from "@/components/forms/simple-form-two-row-tabbed";

/* ------------------------------------------------------------------ */
/* Task 49 — owner date mask (YYYY/MM/DD auto separators): typing the  */
/* 4-digit year inserts «/» automatically, then the 2-digit month does */
/* the same, then the 2-digit day. Persian/Arabic-Indic digits are     */
/* normalized; only 8 digits ever fit (max 10 chars with slashes).     */
/* ------------------------------------------------------------------ */

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Task 49 — digit-normalizer (Persian/Arabic-Indic → ASCII) */
export function normalizeDigits(input: string): string {
  let out = "";
  for (const ch of input) {
    const fi = FA_DIGITS.indexOf(ch);
    if (fi >= 0) {
      out += String(fi);
    } else {
      const ai = AR_DIGITS.indexOf(ch);
      out += ai >= 0 ? String(ai) : ch;
    }
  }
  return out;
}

/**
 * Task 49 — applies the owner's date mask: digits only, «/» inserted
 * automatically after the 4-digit year and after the 2-digit month
 * (YYYY/MM/DD). While TYPING, the trailing separator appears the moment
 * the group completes; while DELETING, trailing separators are not
 * re-added so backspace always makes progress.
 */
export function applyDateMask(raw: string, isDeleting: boolean): string {
  const digits = normalizeDigits(raw).replace(/[^0-9]/g, "").slice(0, 8);
  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);
  let out = y;
  if (m) out += "/" + m;
  if (d) out += "/" + d;
  if (!isDeleting) {
    if (digits.length === 4) out += "/";
    else if (digits.length === 6) out += "/";
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Task 48 — percentage flow grid for dfb-designed forms (design==run) */
/* ------------------------------------------------------------------ */

/**
 * Field flow of a dfb-designed bank: flex-wrap with per-field width in
 * percent (DfbFormField.WidthSpan stores 25..100, step 5) and an optional
 * bank-level horizontal alignment (start/center/end, persisted in the
 * form's headerJson.style.bankAlign) — what the design studio lays out is
 * exactly what the runtime renders. FieldCell markup/label alignment is
 * untouched. Legacy consumers keep the old fixed grid (they never pass
 * widthPct/fieldsAlign).
 */
export function FlowFieldGrid({
  fields,
  onFieldChange,
  idPrefix = "sft",
  align,
  gridRef,
}: {
  fields: SimpleFormField[];
  onFieldChange?: (id: string, value: string | boolean) => void;
  /** checkbox input id prefix forwarded to FieldCell (keeps DOM ids unique) */
  idPrefix?: string;
  /** bank alignment — start (default) keeps the natural reading edge */
  align?: "start" | "center" | "end";
  /** ref target for the caller's useAlignedLabels scope */
  gridRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={gridRef}
      className={cn(
        "flex flex-wrap",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
      )}
    >
      {fields.map((f) => (
        <div
          key={f.id}
          className="box-border min-w-0 px-2.5 pb-2"
          style={{ width: `${f.widthPct ?? 50}%` }}
        >
          <FieldCell field={f} onChange={onFieldChange} idPrefix={idPrefix} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared form primitives (Task 30 — extracted verbatim from           */
/* SimpleFormTwoRowTabbed so SimpleTreeForm reuses the exact same      */
/* visual contract: Task 25.1 label alignment markup, Task 27 compact  */
/* metrics, Task 26 logical direction classes).                        */
/* ------------------------------------------------------------------ */

/**
 * Window-caption button rendered on the gradient form header (white on
 * teal/emerald). The data-window-btn attribute keeps the host window drag
 * handler from starting a drag on these buttons.
 */
export function HeaderButton({
  onClick,
  label,
  children,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      /* window-caption contract: the host drag handler never starts a drag
         from these buttons (closest("[data-window-btn]") guard) */
      data-window-btn
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 cursor-pointer"
    >
      {children}
    </button>
  );
}

/**
 * Record-transport button of the «|< < > >|» nav cluster. Each button
 * carries its own rtl:-scale-x-100 mirror (Task 26) — the GROUP relies on
 * the RTL flex order instead of a group flip.
 */
export function NavButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!onClick}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-foreground/70 transition-colors rtl:-scale-x-100",
        onClick ? "hover:bg-foreground/10 hover:text-foreground cursor-pointer" : "opacity-40",
      )}
    >
      {icon}
    </button>
  );
}

/**
 * One label + input cell of a generated form. The label unit follows the
 * useAlignedLabels markup contract ([text-box with --label-w][:][* slot])
 * so all inputs start on one shared edge (Task 25.1). Vertical metrics are
 * the Task 27 compact scale (h-5.5 = 22px inputs).
 */
export function FieldCell({
  field,
  onChange,
  idPrefix = "sft",
}: {
  field: SimpleFormField;
  onChange?: (id: string, value: string | boolean) => void;
  /** checkbox input id prefix — keeps DOM ids unique when two forms are
      mounted at the same time (SimpleFormTwoRowTabbed uses "sft") */
  idPrefix?: string;
}) {
  const type = field.type ?? "text";
  /* Task 27 — compact vertical metrics: field height 32px → 22px (−31%) so
     the tabs section and the form footer gain room. Horizontal metrics
     (label alignment, --label-w, gaps) are untouched. */
  const inputBase = "h-5.5 min-w-0 text-xs";

  /* Task 49 — date-mask state (declared unconditionally — rules-of-hooks);
     only used by the date branch below */
  const dateRef = React.useRef<HTMLInputElement | null>(null);
  const lastMasked = React.useRef("");

  /* Task 53 — static DESIGN shapes (line/box/circle/oval): decorative only —
     no label unit, no input, no EAV value. Rendered identically in the
     design preview and the running form. */
  if (type === "line") {
    return (
      <div aria-hidden className="my-1.5 w-full">
        <div className="h-0.5 w-full rounded-full bg-gradient-to-l from-border via-foreground/30 to-border" />
      </div>
    );
  }
  if (type === "box") {
    return (
      <div aria-hidden className="my-1 h-12 w-full rounded-xl border-2 border-border/70 bg-muted/30 shadow-inner" />
    );
  }
  if (type === "circle") {
    return (
      <div aria-hidden className="flex w-full justify-center py-1">
        <div className="h-14 w-14 rounded-full border-2 border-border/70 bg-muted/30 shadow-inner" />
      </div>
    );
  }
  if (type === "oval") {
    return (
      <div aria-hidden className="flex w-full justify-center py-1">
        <div className="h-10 w-32 rounded-[50%] border-2 border-border/70 bg-muted/30 shadow-inner" />
      </div>
    );
  }

  /* Task 53 — script data-source element: not an input — a slim strip
     marking where the script feeds the form (bound fields render as
     ordinary fields next to it). */
  if (type === "script") {
    return (
      <div
        className="flex items-center gap-2 rounded-lg border border-dashed border-teal-600/40 bg-teal-500/5 px-2.5 py-1.5 text-[11px] text-teal-700 dark:text-teal-400"
        aria-label={field.label}
      >
        <Braces className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 truncate font-medium">{field.label}</span>
        <span className="shrink-0 rounded-md bg-teal-600/10 px-1.5 py-0.5 font-mono text-[9px]" dir="ltr">db</span>
      </div>
    );
  }

  /* Task 58 (owner request) — radio button group: inline items after the
     label unit; value = the selected option's value (EAV string) */
  if (type === "radio") {
    const items = field.options ?? [];
    return (
      <div data-form-cell className="flex min-w-0 items-center gap-2">
        <span
          data-form-label
          className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs text-muted-foreground"
        >
          <span className="w-[var(--label-w,auto)] shrink-0 text-end">
            <span data-form-label-text className="inline-block whitespace-nowrap">
              {field.label}
            </span>
          </span>
          <span className="opacity-70" aria-hidden>
            :
          </span>
          <span aria-hidden className={cn("text-rose-500", !field.required && "invisible")}>
            *
          </span>
        </span>
        <div
          role="radiogroup"
          aria-label={field.label}
          className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1"
        >
          {items.length === 0 && (
            <span className="text-[11px] text-muted-foreground">—</span>
          )}
          {items.map((o, i) => {
            const rid = `${idPrefix}-radio-${field.id}-${i}`;
            return (
              <label
                key={`${o.value}-${i}`}
                htmlFor={rid}
                className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground/90"
              >
                <input
                  id={rid}
                  type="radio"
                  name={`${idPrefix}-radio-${field.id}`}
                  value={o.value}
                  checked={field.value === o.value}
                  onChange={() => onChange?.(field.id, o.value)}
                  disabled={field.disabled}
                  className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-teal-600"
                />
                <span className="whitespace-nowrap">{o.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  /* checkbox — inline toggle pushed to the row end (legacy «فعال» placement) */
  if (type === "checkbox") {
    const cid = `${idPrefix}-chk-${field.id}`;
    return (
      <label
        htmlFor={cid}
        className="flex cursor-pointer items-center justify-end gap-2 text-xs text-foreground/90"
      >
        <Checkbox
          id={cid}
          checked={field.checked === true}
          onCheckedChange={(v) => onChange?.(field.id, v === true)}
          disabled={field.disabled}
          aria-label={field.label}
        />
        <span className="whitespace-nowrap">{field.label}</span>
      </label>
    );
  }

  /* Task 47 — textarea: same label unit, small multi-line box (row grows) */
  if (type === "textarea") {
    return (
      <div data-form-cell className="flex min-w-0 items-start gap-2">
        <span
          data-form-label
          className="flex shrink-0 items-center gap-0.5 whitespace-nowrap pt-0.5 text-xs text-muted-foreground"
        >
          <span className="w-[var(--label-w,auto)] shrink-0 text-end">
            <span data-form-label-text className="inline-block whitespace-nowrap">
              {field.label}
            </span>
          </span>
          <span className="opacity-70" aria-hidden>
            :
          </span>
          <span aria-hidden className={cn("text-rose-500", !field.required && "invisible")}>
            *
          </span>
        </span>
        <textarea
          value={field.value ?? ""}
          rows={2}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          disabled={field.disabled}
          aria-label={field.label}
          onFocus={field.onRevealFocus} // Task 70 — reveal base value under overlay
          onChange={(e) => onChange?.(field.id, e.target.value)}
          className="min-h-10 min-w-0 flex-1 resize-y rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background disabled:opacity-50"
        />
      </div>
    );
  }

  /* Task 47 — date: LTR YYYY/MM/DD input with an inline calendar chip
     (mirrors the design studio's date preview and the EAV string storage).
     Task 49 — owner mask: «/» auto-inserts after the 4-digit year and the
     2-digit month while typing; rejected keystrokes snap the DOM value back. */
  if (type === "date") {
    const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const deleting = e.target.value.length < lastMasked.current.length;
      const masked = applyDateMask(e.target.value, deleting);
      if (masked === lastMasked.current && dateRef.current) {
        /* keystroke rejected by the mask — force the controlled value back */
        dateRef.current.value = masked;
      }
      lastMasked.current = masked;
      onChange?.(field.id, masked);
    };
    return (
      <div data-form-cell className="flex min-w-0 items-center gap-2">
        <span
          data-form-label
          className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs text-muted-foreground"
        >
          <span className="w-[var(--label-w,auto)] shrink-0 text-end">
            <span data-form-label-text className="inline-block whitespace-nowrap">
              {field.label}
            </span>
          </span>
          <span className="opacity-70" aria-hidden>
            :
          </span>
          <span aria-hidden className={cn("text-rose-500", !field.required && "invisible")}>
            *
          </span>
        </span>
        {/* dir=ltr — the date value flows LTR; the chip must anchor to the
            visual END (right edge) in every locale. Without it an RTL page
            resolves `end` to the left edge and the chip covers the leading
            digits of the date (owner report). */}
        <div dir="ltr" className="relative min-w-0 flex-1">
          <Input
            ref={dateRef}
            value={field.value ?? ""}
            placeholder="YYYY/MM/DD"
            inputMode="numeric"
            readOnly={field.readOnly}
            disabled={field.disabled}
            aria-label={field.label}
            dir="ltr"
            onChange={onDateChange}
            className={cn(inputBase, "pe-7 text-start")}
          />
          <CalendarDays
            aria-hidden
            className="pointer-events-none absolute end-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>
    );
  }

  return (
    <div data-form-cell className="flex min-w-0 items-center gap-2">
      {/* label unit: [text-box (var width)][colon][asterisk slot] — the tail is
          uniform (asterisk always occupies space) so every input of the form
          starts on one shared edge — column-continuous vertical alignment
          (Task 25.1, useAlignedLabels) */}
      <span
        data-form-label
        className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs text-muted-foreground"
      >
        <span className="w-[var(--label-w,auto)] shrink-0 text-end">
          <span data-form-label-text className="inline-block whitespace-nowrap">
            {field.label}
          </span>
        </span>
        <span className="opacity-70" aria-hidden>
          :
        </span>
        <span
          aria-hidden
          className={cn("text-rose-500", !field.required && "invisible")}
        >
          *
        </span>
      </span>

      {type === "select" ? (
        <Select
          value={field.value}
          onValueChange={(v) => onChange?.(field.id, v)}
          disabled={field.disabled}
        >
          <SelectTrigger aria-label={field.label} className={cn(inputBase, "flex-1")}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "lookup" ? (
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Input
            value={field.value ?? ""}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
            disabled={field.disabled}
            aria-label={field.label}
            dir={field.ltr ? "ltr" : undefined}
            onChange={(e) => onChange?.(field.id, e.target.value)}
            className={cn(inputBase, field.ltr && "text-start")}
          />
          {field.onLookup && (
            <button
              type="button"
              aria-label={`${field.label} — +`}
              onClick={field.onLookup}
              className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
      ) : (
        <div className="relative min-w-0 flex-1">
          <Input
            value={field.value ?? ""}
            inputMode={type === "number" ? "decimal" : undefined}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
            disabled={field.disabled}
            aria-label={field.label}
            dir={field.ltr ? "ltr" : undefined}
            onFocus={field.onRevealFocus} // Task 70 — reveal base value under overlay
            onChange={(e) => onChange?.(field.id, e.target.value)}
            className={cn(inputBase, field.ltr && "text-start", field.suffixChip && "pe-16")}
          />
          {field.suffixChip && (
            <span className="pointer-events-none absolute end-1 top-1/2 flex h-4 -translate-y-1/2 items-center rounded-md bg-rose-500/15 px-1.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
              {field.suffixChip}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Task 58 (owner request «هر فیلدی در گرید باید با همان فرمت اطلاعات  */
/* دریافت کند») — the per-TYPE editor of one records-table cell:       */
/* checkbox renders a real checkbox, select/radio open a list, date    */
/* carries the YYYY/MM/DD mask, number is LTR decimal — what the       */
/* designer chose is exactly what the grid cell collects.              */
/* ------------------------------------------------------------------ */

export function GridCellInput({
  column,
  value,
  onChange,
  ariaLabel,
  disabled,
  onFocus,
}: {
  column: SimpleFormGridColumn;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  /* Task 95 — reveal hook for the translation overlay of TEXT cells
     (same contract as FieldCell's onRevealFocus — Task 70); the shell
     passes it only for text columns, so select/date/number/checkbox
     cells (code values, never translated) stay untouched. */
  onFocus?: () => void;
}) {
  const type = column.type ?? "text";
  /* date mask state (declared unconditionally — rules-of-hooks) */
  const dateRef = React.useRef<HTMLInputElement | null>(null);
  const lastMasked = React.useRef("");

  const textBase =
    "h-5 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-xs outline-none transition-colors hover:border-border focus:border-ring focus:bg-background disabled:opacity-50";

  if (type === "checkbox") {
    return (
      <div className="flex items-center justify-center py-0.5">
        <Checkbox
          checked={value === "1"}
          onCheckedChange={(v) => onChange(v === true ? "1" : "")}
          disabled={disabled}
          aria-label={ariaLabel}
        />
      </div>
    );
  }

  if (type === "select" || type === "radio") {
    const items = column.options ?? [];
    if (type === "radio") {
      /* compact inline radio group (wraps when items are many) */
      return (
        <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 px-1 py-1">
          {items.length === 0 && <span className="text-[11px] text-muted-foreground">—</span>}
          {items.map((o, i) => (
            <label key={`${o.value}-${i}`} className="flex cursor-pointer items-center gap-1 text-[11px] text-foreground/90">
              <input
                type="radio"
                name={`${ariaLabel}-${i}`}
                value={o.value}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
                disabled={disabled}
                className="h-3 w-3 shrink-0 cursor-pointer accent-teal-600"
              />
              <span className="whitespace-nowrap">{o.label}</span>
            </label>
          ))}
        </div>
      );
    }
    return (
      <Select value={value || undefined} onValueChange={(v) => onChange(v)} disabled={disabled}>
        <SelectTrigger aria-label={ariaLabel} className="h-5 w-full min-w-0 border-transparent bg-transparent px-2 text-xs shadow-none hover:border-border focus:border-ring data-[placeholder]:text-muted-foreground">
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {items.length === 0 && (
            <div className="px-2 py-1.5 text-[11px] text-muted-foreground">—</div>
          )}
          {items.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (type === "date") {
    const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const deleting = e.target.value.length < lastMasked.current.length;
      const masked = applyDateMask(e.target.value, deleting);
      if (masked === lastMasked.current && dateRef.current) {
        dateRef.current.value = masked;
      }
      lastMasked.current = masked;
      onChange(masked);
    };
    return (
      /* dir=ltr — same anti-overlap contract as FieldCell's date chip:
         the icon anchors to the visual end of the LTR date, RTL pages
         must not flip it onto the first digits. */
      <div dir="ltr" className="relative">
        <Input
          ref={dateRef}
          value={value}
          placeholder="YYYY/MM/DD"
          inputMode="numeric"
          disabled={disabled}
          aria-label={ariaLabel}
          dir="ltr"
          onChange={onDateChange}
          className={cn(textBase, "pe-6 text-start")}
        />
        <CalendarDays
          aria-hidden
          className="pointer-events-none absolute end-1 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    );
  }

  return (
    <Input
      value={value}
      inputMode={type === "number" ? "decimal" : undefined}
      disabled={disabled}
      aria-label={ariaLabel}
      dir={type === "number" ? "ltr" : undefined}
      onFocus={onFocus} // Task 95 — reveal base value under the cell overlay
      onChange={(e) => onChange(e.target.value)}
      className={cn(textBase, type === "number" && "text-start")}
    />
  );
}
