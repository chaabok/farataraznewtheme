"use client";

import * as React from "react";
import {
  Check, ChevronDown, ChevronUp, Columns3, FileDown, Filter, Inbox, Loader2, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/stores/settings-store";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * MainDataGrid (Task 64 — owner request «لیست اطلاعات ثبت شده در فرم‌ها») —
 * the classic ERP master-list grid («فهرست کلّی»): every column owns a
 * operator filter (شامل / شامل نبودن / شروع با / پایان با / برابر با /
 * نابرابر با / خالی باشد / خالی نباشد) opened from a funnel menu, header-click
 * sorting, a column chooser, row selection + double-click and a polished
 * bottom action bar (actions slot + count chip + filter toggle / columns /
 * CSV export of the FILTERED rows). Purely presentational — data flows in via
 * props, so the grid stays reusable for any record source.
 */

export type GridFilterOp =
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "isEmpty"
  | "notEmpty";

/** ops that carry a needle value (the other two act on emptiness alone) */
const VALUE_OPS: readonly GridFilterOp[] = [
  "contains", "notContains", "startsWith", "endsWith", "equals", "notEquals",
];

export interface MainGridColumn {
  key: string;
  label: string;
  /** px width — also the min-width (horizontal scroll when columns overflow) */
  width?: number;
  align?: "start" | "center" | "end";
  /** custom cell renderer (fallback: the raw string value) */
  render?: (row: MainGridRow) => React.ReactNode;
  /** raw comparable value (fallback: row[key]); null/undefined = empty cell */
  value?: (row: MainGridRow) => string | null | undefined;
  /** hideable columns only (the row-number rail is never hidden) */
  hideable?: boolean;
}

export type MainGridRow = Record<string, unknown> & { __id: string };

export interface MainDataGridProps {
  columns: MainGridColumn[];
  rows: MainGridRow[];
  loading?: boolean;
  emptyText?: string;
  /** footer count chip, e.g. «۳ رکورد» */
  countLabel?: string;
  selectedId?: string | null;
  onSelectedIdChange?: (id: string | null) => void;
  onRowDoubleClick?: (row: MainGridRow) => void;
  /** action buttons rendered at the start of the bottom bar */
  actions?: React.ReactNode;
  csvFileName?: string;
  className?: string;
}

const OP_KEYS: Record<GridFilterOp, string> = {
  contains: "dfb.list.op.contains",
  notContains: "dfb.list.op.notContains",
  startsWith: "dfb.list.op.startsWith",
  endsWith: "dfb.list.op.endsWith",
  equals: "dfb.list.op.equals",
  notEquals: "dfb.list.op.notEquals",
  isEmpty: "dfb.list.op.empty",
  notEmpty: "dfb.list.op.notEmpty",
};
const ALL_OPS = Object.keys(OP_KEYS) as GridFilterOp[];

const cellOf = (col: MainGridColumn, row: MainGridRow): string | null | undefined =>
  col.value ? col.value(row) : ((row[col.key] as string | null | undefined) ?? null);

function matches(raw: string | null | undefined, op: GridFilterOp, needle: string): boolean {
  const cell = (raw ?? "").toLowerCase();
  const n = needle.trim().toLowerCase();
  switch (op) {
    case "contains": return cell.includes(n);
    case "notContains": return !cell.includes(n);
    case "startsWith": return cell.startsWith(n);
    case "endsWith": return cell.endsWith(n);
    case "equals": return cell === n;
    case "notEquals": return cell !== n;
    case "isEmpty": return cell.trim() === "";
    case "notEmpty": return cell.trim() !== "";
  }
}

/* ------------------------- colored bottom-bar buttons ------------------------- */

export type GridActionTint = "emerald" | "rose" | "teal" | "violet" | "amber";

const TINT_CLASS: Record<GridActionTint, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  rose: "text-rose-600 dark:text-rose-400",
  teal: "text-teal-600 dark:text-teal-400",
  violet: "text-violet-600 dark:text-violet-400",
  amber: "text-amber-600 dark:text-amber-400",
};

/** A small tinted icon tile in the grid's bottom action bar (the « chic »
    colored buttons of the classic فهرست windows). */
export function GridActionButton({
  icon: Icon, label, tint, onClick, disabled, active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tint: GridActionTint;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background shadow-sm",
        "transition-all duration-150 hover:-translate-y-px hover:bg-foreground/5 hover:shadow",
        "active:translate-y-0 disabled:pointer-events-none disabled:opacity-40",
        active ? cn("ring-1 ring-primary/40 bg-primary/10", TINT_CLASS[tint]) : TINT_CLASS[tint],
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/* ------------------------------- the grid ------------------------------- */

export function MainDataGrid({
  columns, rows, loading, emptyText, countLabel, selectedId, onSelectedIdChange,
  onRowDoubleClick, actions, csvFileName, className,
}: MainDataGridProps) {
  const t = useT();

  /* filters: columnKey → { op, needle } */
  const [filters, setFilters] = React.useState<Record<string, { op: GridFilterOp; value: string }>>({});
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [filterRow, setFilterRow] = React.useState(true);
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());

  const visibleColumns = React.useMemo(() => columns.filter((c) => !hidden.has(c.key)), [columns, hidden]);

  const isFilterActive = React.useCallback(
    (f: { op: GridFilterOp; value: string }) =>
      VALUE_OPS.includes(f.op) ? f.value.trim() !== "" : true,
    [],
  );
  const activeFilterCount = React.useMemo(
    () => Object.values(filters).filter(isFilterActive).length,
    [filters, isFilterActive],
  );

  const filtered = React.useMemo(() => {
    const active = Object.entries(filters).filter(([, f]) => isFilterActive(f));
    let out = rows;
    if (active.length > 0) {
      out = rows.filter((row) =>
        active.every(([key, f]) => {
          const col = columns.find((c) => c.key === key);
          return matches(col ? cellOf(col, row) : null, f.op, f.value);
        }),
      );
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      const dir = sort.dir === "asc" ? 1 : -1;
      out = [...out].sort((a, b) => {
        const va = (col ? cellOf(col, a) : "") ?? "";
        const vb = (col ? cellOf(col, b) : "") ?? "";
        return va.localeCompare(vb, undefined, { numeric: true }) * dir;
      });
    }
    return out;
  }, [rows, filters, isFilterActive, sort, columns]);

  const setFilter = (key: string, next: { op: GridFilterOp; value: string } | null) =>
    setFilters((prev) => {
      const draft = { ...prev };
      if (next) draft[key] = next;
      else delete draft[key];
      return draft;
    });

  const cycleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  /* CSV export — the FILTERED rows, Excel-friendly (BOM + quoted cells) */
  const exportCsv = () => {
    const head = visibleColumns.map((c) => c.label);
    const lines = [head, ...filtered.map((row) => visibleColumns.map((c) => String(cellOf(c, row) ?? "")))]
      .map((cells) => cells.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + lines], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${csvFileName ?? "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* count chip: live FILTERED count (the classic فهرست shows what you see);
     a caller-provided countLabel overrides it */
  const chip = countLabel ?? t("dfb.list.recordsCount").replace("{n}", String(filtered.length));

  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm", className)}>
      {/* ── table (sticky header + sticky filter row, horizontal scroll) ── */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-max border-separate border-spacing-0 text-xs">
          <thead>
            <tr>
              {visibleColumns.map((c) => {
                const sorted = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    style={{ width: c.width, minWidth: c.width ?? 140 }}
                    className="sticky top-0 z-20 border-b border-border/70 bg-muted/80 px-2 text-start font-semibold text-foreground/85 backdrop-blur"
                  >
                    <button
                      type="button"
                      onClick={() => cycleSort(c.key)}
                      className={cn(
                        "flex h-9 w-full items-center gap-1 transition-colors hover:text-primary",
                        c.align === "center" && "justify-center",
                        c.align === "end" && "justify-end",
                      )}
                      title={t("dfb.list.sortHint")}
                    >
                      <span className="truncate">{c.label}</span>
                      {sorted ? (
                        sort!.dir === "asc" ? (
                          <ChevronUp className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                        ) : (
                          <ChevronDown className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                        )
                      ) : null}
                    </button>
                  </th>
                );
              })}
              {/* row-number rail — never hidden (classic # column) */}
              <th className="sticky top-0 z-20 w-12 min-w-12 border-b border-border/70 border-s bg-muted/80 px-1 text-center text-[10px] font-medium text-muted-foreground backdrop-blur">
                #
              </th>
            </tr>
            {filterRow && (
              <tr>
                {visibleColumns.map((c) => {
                  const f = filters[c.key];
                  const active = f ? isFilterActive(f) : false;
                  const valueless = f?.op === "isEmpty" || f?.op === "notEmpty";
                  return (
                    <th
                      key={c.key}
                      style={{ width: c.width, minWidth: c.width ?? 140 }}
                      className="sticky top-9 z-10 border-b border-border/60 bg-background/95 px-1.5 py-1 backdrop-blur"
                    >
                      <div className="flex items-center gap-1">
                        <FilterOpMenu
                          opLabel={(op: GridFilterOp) => t(OP_KEYS[op] as never)}
                          active={f?.op}
                          onSelect={(op) => {
                            if (f?.op === op) setFilter(c.key, null);
                            else setFilter(c.key, { op, value: f?.value ?? "" });
                          }}
                        />
                        {!valueless && (
                          <input
                            dir="auto"
                            value={f?.value ?? ""}
                            onChange={(e) => setFilter(c.key, { op: f?.op ?? "contains", value: e.target.value })}
                            placeholder={`${t(OP_KEYS[f?.op ?? "contains"] as never)}…`}
                            aria-label={`${c.label}: ${t("dfb.list.filterRow")}`}
                            className={cn(
                              "h-7 w-full min-w-0 rounded-md border bg-background/80 px-2 text-[11px] outline-none",
                              "placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/30",
                              "transition-colors",
                              active && "border-primary/50",
                            )}
                          />
                        )}
                        {active && (
                          <button
                            type="button"
                            onClick={() => setFilter(c.key, null)}
                            title={t("common.cancel")}
                            aria-label={t("common.cancel")}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" aria-hidden />
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="sticky top-9 z-10 border-b border-border/60 border-s bg-background/95 px-1 py-1 backdrop-blur" />
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="py-16 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" aria-hidden />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="py-16">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/70" aria-hidden>
                      <Inbox className="h-5 w-5" />
                    </span>
                    <span className="text-xs">{emptyText ?? t("dfb.list.empty")}</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => {
                const selected = row.__id === selectedId;
                return (
                  <tr
                    key={row.__id}
                    tabIndex={0}
                    aria-selected={selected}
                    onClick={() => onSelectedIdChange?.(selected ? null : row.__id)}
                    onDoubleClick={() => onRowDoubleClick?.(row)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onRowDoubleClick?.(row);
                    }}
                    data-selected={selected}
                    className={cn(
                      "cursor-pointer transition-colors outline-none",
                      "hover:bg-muted/50 focus-visible:bg-muted/50",
                      selected && "bg-primary/10 font-medium",
                    )}
                  >
                    {visibleColumns.map((c) => (
                      <td
                        key={c.key}
                        className={cn(
                          "max-w-64 truncate border-b border-border/40 px-2 py-1.5",
                          c.align === "center" && "text-center",
                          c.align === "end" && "text-end",
                        )}
                      >
                        {c.render ? c.render(row) : ((cellOf(c, row) ?? "") || "")}
                      </td>
                    ))}
                    <td className="border-b border-border/40 border-s px-1 py-1.5 text-center font-mono text-[10px] text-muted-foreground">
                      {i + 1}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── bottom action bar ── */}
      <div className="flex shrink-0 items-center gap-1.5 border-t border-border/60 bg-muted/40 px-2 py-1.5">
        {actions}
        {chip && (
          <span className="mx-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {chip}
          </span>
        )}
        <span className="ms-auto flex items-center gap-1">
          <button
            type="button"
            title={t("dfb.list.filterRow")}
            aria-label={t("dfb.list.filterRow")}
            aria-pressed={filterRow}
            onClick={() => setFilterRow((v) => !v)}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-foreground/5",
              filterRow || activeFilterCount > 0 ? "bg-primary/10 text-primary" : "text-muted-foreground",
            )}
          >
            <Filter className="h-4 w-4" aria-hidden />
            {activeFilterCount > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title={t("dfb.list.showColumns")}
                aria-label={t("dfb.list.showColumns")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <Columns3 className="h-4 w-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto scrollbar-slim">
              <DropdownMenuLabel>{t("dfb.list.showColumns")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns
                .filter((c) => c.hideable !== false)
                .map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.key}
                    checked={!hidden.has(c.key)}
                    onCheckedChange={(v) =>
                      setHidden((prev) => {
                        const next = new Set(prev);
                        if (v) next.delete(c.key);
                        else next.add(c.key);
                        return next;
                      })
                    }
                    onSelect={(e) => e.preventDefault()}
                  >
                    {c.label}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
          <button
            type="button"
            title={t("dfb.list.exportCsv")}
            aria-label={t("dfb.list.exportCsv")}
            onClick={exportCsv}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-violet-600 transition-all hover:-translate-y-px hover:bg-foreground/5 hover:shadow dark:text-violet-400"
          >
            <FileDown className="h-4 w-4" aria-hidden />
          </button>
        </span>
      </div>
    </div>
  );
}

/* --------------------- per-column operator funnel menu --------------------- */

function FilterOpMenu({
  active, onSelect, opLabel,
}: {
  active: GridFilterOp | undefined;
  onSelect: (op: GridFilterOp) => void;
  opLabel: (op: GridFilterOp) => string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={opLabel(active ?? "contains")}
          aria-label={opLabel(active ?? "contains")}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
            active
              ? "bg-primary/15 text-primary ring-1 ring-primary/40"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
          )}
        >
          <Filter className="h-3.5 w-3.5" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-36">
        <DropdownMenuLabel className="text-[10px] text-muted-foreground">
          {opLabel(active ?? "contains")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ALL_OPS.map((op) => (
          <DropdownMenuItem
            key={op}
            onSelect={() => onSelect(op)}
            className={cn("text-xs", active === op && "bg-primary/10 font-semibold text-primary")}
          >
            <Check className={cn("h-3.5 w-3.5", active === op ? "opacity-100" : "opacity-0")} aria-hidden />
            {opLabel(op)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
