"use client";

import * as React from "react";
import { CalendarDays, Plus } from "lucide-react";
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
import type { SimpleFormField } from "@/components/forms/simple-form-two-row-tabbed";

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
          onChange={(e) => onChange?.(field.id, e.target.value)}
          className="min-h-10 min-w-0 flex-1 resize-y rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background disabled:opacity-50"
        />
      </div>
    );
  }

  /* Task 47 — date: LTR YYYY/MM/DD input with an inline calendar chip
     (mirrors the design studio's date preview and the EAV string storage) */
  if (type === "date") {
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
        <div className="relative min-w-0 flex-1">
          <Input
            value={field.value ?? ""}
            placeholder="YYYY/MM/DD"
            readOnly={field.readOnly}
            disabled={field.disabled}
            aria-label={field.label}
            dir="ltr"
            onChange={(e) => onChange?.(field.id, e.target.value)}
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
