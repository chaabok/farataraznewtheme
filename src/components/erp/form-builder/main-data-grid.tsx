"use client";

import * as React from "react";
import {
  Check, ChevronDown, ChevronUp, Columns3, FileDown, Filter, Inbox, Loader2, Minus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { erpZoom } from "@/lib/erp-zoom";
import { downloadExcel } from "@/lib/excel-export";
import { useSettings, useT } from "@/stores/settings-store";
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
 * Excel export of the FILTERED rows — Task 134: real xlsx, one grid column
 * per Excel column, sheet direction synced with the dashboard language).
 * Purely presentational — data flows in via props, so the grid stays
 * reusable for any record source.
 *
 * Task 133 (درخواست مالک) — جابجایی و تغییر عرض ستون‌ها:
 *   • تغییر عرض: دستگیرهٔ کشیدنی روی «لبهٔ انتهایی» هر سرستون (در RTL لبهٔ
 *     چپ، در LTR لبهٔ راست — با موس؛ + کلیدهای پیکانی برای دسترس‌پذیری).
 *     عرضِ فقط همان ستون عوض می‌شود و عرض بقیه دست‌نخورده می‌ماند؛ اگر جمع
 *     عرض‌ها از پهنای قاب بیشتر شود اسکرول افقی داخل گرید ساخته می‌شود.
 *     مکانیزم: table-fixed + colgroup با عرض دقیق + ستون جمع‌شوندهٔ مجازی
 *     در انتها که فضای مازادِ قاب را می‌بلعد (در نبودِ مازاد صفر است) —
 *     پس تغییر عرض یک ستون هرگز عرض ستون‌های دیگر را جابجا نمی‌کند.
 *   • جابجایی: درگ‌اند‌دراپ سرستون روی سرستون دیگر (نشانگرِ درج در لبهٔ
 *     مقصد؛ منطق نیمه‌چپ/نیمه‌راست هدف جهت‌آگاه است). ریل «#» ثابت است.
 *   • هر دو فقط در نشستِ گرید می‌مانند (بدون ذخیرهٔ ماندگار) و فیلتر/سورت/
 *     CSV/انتخاب‌گر ستون با ترتیب و عرض جدید هم‌گام‌اند (کلیدمحور).
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

/* Task 133 — عرض ریل «#» و کفِ عرض ستون هنگام تغییر اندازه */
const RAIL_W = 48;
const MIN_COL_W = 48;

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
    colored buttons of the classic فهرست windows). Task 70 — extra <button>
    props (aria-expanded, aria-haspopup, data-state …) are forwarded so the
    button can also serve as a DropdownMenuTrigger (asChild). */
export function GridActionButton({
  icon: Icon, label, tint, onClick, disabled, active,
  ...rest
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tint: GridActionTint;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
} & Omit<React.ComponentProps<"button">, "onClick" | "disabled">) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      {...rest}
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
  /* Task 133 — جهت داشبورد برای ریاضیاتِ جهت‌آگاهِ تغییر عرض/جابجایی */
  const dir = useSettings((s) => s.dir());

  /* filters: columnKey → { op, needle } */
  const [filters, setFilters] = React.useState<Record<string, { op: GridFilterOp; value: string }>>({});
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [filterRow, setFilterRow] = React.useState(true);
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());

  /* Task 133 — ترتیب ستون‌ها (درگ سرستون) و عرض‌های تغییرکرده (دستگیرهٔ لبه) */
  const [order, setOrder] = React.useState<string[]>([]);
  const [widths, setWidths] = React.useState<Record<string, number>>({});
  const [dragKey, setDragKey] = React.useState<string | null>(null);
  const [dropAt, setDropAt] = React.useState<{ key: string; after: boolean } | null>(null);
  const [resizing, setResizing] = React.useState(false);
  const resizeRef = React.useRef<{ key: string; startX: number; startW: number; w: number } | null>(null);
  const colRefs = React.useRef<Map<string, HTMLTableColElement>>(new Map());
  const registerCol = React.useCallback(
    (key: string) => (el: HTMLTableColElement | null) => {
      if (el) colRefs.current.set(key, el);
      else colRefs.current.delete(key);
    },
    [],
  );

  const effWidth = React.useCallback(
    (c: MainGridColumn) => widths[c.key] ?? c.width ?? 140,
    [widths],
  );

  /* ترتیبِ اعلامیِ ستون‌ها: کلیدهای order + کلیدهای تازه در انتها (پایدار) */
  const orderedColumns = React.useMemo(() => {
    if (order.length === 0) return columns;
    const idx = new Map(order.map((k, i) => [k, i] as const));
    return [...columns].sort(
      (a, b) => (idx.get(a.key) ?? Number.MAX_SAFE_INTEGER) - (idx.get(b.key) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [columns, order]);

  const visibleColumns = React.useMemo(
    () => orderedColumns.filter((c) => !hidden.has(c.key)),
    [orderedColumns, hidden],
  );

  /* جمع عرضِ ستون‌های نمایان + ریل — جدول هرگز باریک‌تر از این نمی‌شود؛
     ستون مجازیِ انتهایی فضای مازادِ قاب را می‌بلعد (تغییر عرض یک ستون
     هرگز عرض بقیه را عوض نمی‌کند) */
  const totalW = React.useMemo(
    () => visibleColumns.reduce((s, c) => s + effWidth(c), 0) + RAIL_W,
    [visibleColumns, effWidth],
  );

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

  /* ---------- Task 133 — جابجایی ستون‌ها (درگ‌اند‌دراپ سرستون) ---------- */
  /* نیمهٔ visual هدف → منطقِ before/after جهت‌آگاه: در RTL نیمهٔ راستِ
     هدف = «پیش از هدف» (جریان از راست به چپ)، در LTR = «پس از هدف» */
  const sideAfter = (e: React.DragEvent, el: Element): boolean => {
    const rect = el.getBoundingClientRect();
    const visualAfter = e.clientX - rect.left > rect.width / 2;
    return dir === "rtl" ? !visualAfter : visualAfter;
  };
  const onHeaderDragStart = (e: React.DragEvent, key: string) => {
    setDragKey(key);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", key); // فایرفاکس برای شروع درگ لازم است
  };
  const onHeaderDragOver = (e: React.DragEvent, key: string) => {
    if (!dragKey || dragKey === key) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const after = sideAfter(e, e.currentTarget);
    setDropAt((p) => (p?.key === key && p.after === after ? p : { key, after }));
  };
  const onHeaderDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    const src = dragKey;
    setDragKey(null);
    setDropAt(null);
    if (!src || src === key) return;
    const after = sideAfter(e, e.currentTarget);
    setOrder((prev) => {
      const keys = orderedColumns.map((c) => c.key);
      const from = keys.indexOf(src);
      if (from < 0) return prev;
      const moved = [...keys.slice(0, from), ...keys.slice(from + 1)];
      const ti = moved.indexOf(key);
      if (ti < 0) return prev;
      const at = after ? ti + 1 : ti;
      return [...moved.slice(0, at), src, ...moved.slice(at)];
    });
  };
  const onHeaderDragEnd = () => {
    setDragKey(null);
    setDropAt(null);
  };

  /* ---------- Task 133 — تغییر عرض ستون (دستگیرهٔ لبهٔ انتهایی) ---------- */
  /* RTL: دستگیره لبهٔ چپ است؛ کشیدن به چپ = پهن‌تر (factor = -1).
     LTR: دستگیره لبهٔ راست است؛ کشیدن به راست = پهن‌تر (factor = +1). */
  const startResize = (e: React.PointerEvent<HTMLSpanElement>, key: string, w0: number) => {
    if (e.button !== 0) return;
    e.preventDefault(); // مانع انتخاب متن و شروع درگ بومی سرستون
    resizeRef.current = { key, startX: e.clientX, startW: w0, w: w0 };
    setResizing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveResize = (e: React.PointerEvent<HTMLSpanElement>) => {
    const r = resizeRef.current;
    if (!r) return;
    const factor = dir === "rtl" ? -1 : 1;
    /* Task 160 — دلتای clientX برحسب visual است؛ عرض ستون در فضای محلی است ⇒ ×زوم */
    r.w = Math.max(MIN_COL_W, Math.round(r.startW + (e.clientX - r.startX) * factor * erpZoom()));
    /* حینِ درگ مستقیم روی <col> اعمال می‌شود (بدون رندر مجددِ هر فریم) */
    const col = colRefs.current.get(r.key);
    if (col) col.style.width = `${r.w}px`;
  };
  const endResize = () => {
    const r = resizeRef.current;
    if (!r) return;
    resizeRef.current = null;
    setResizing(false);
    setWidths((prev) => (prev[r.key] === r.w ? prev : { ...prev, [r.key]: r.w }));
  };
  const keyResize = (e: React.KeyboardEvent, c: MainGridColumn) => {
    const step = e.shiftKey ? 48 : 16;
    let d = 0;
    if (e.key === "ArrowLeft") d = dir === "rtl" ? step : -step;
    else if (e.key === "ArrowRight") d = dir === "rtl" ? -step : step;
    else return;
    e.preventDefault();
    setWidths((prev) => ({ ...prev, [c.key]: Math.max(MIN_COL_W, effWidth(c) + d) }));
  };

  /* Task 134 — خروجی اکسل واقعی (xlsx): هر ستونِ گرید در یک ستونِ مجزای اکسل
     می‌نشیند و جهتِ شیت هم‌گام با زبان داشبورد است (RTL ⇒ rightToLeft).
     همان نمای فیلترشده با ترتیب/انتخابِ ستون‌های فعلی صادر می‌شود. */
  const exportExcel = () => {
    downloadExcel({
      headers: visibleColumns.map((c) => c.label),
      rows: filtered.map((row) => visibleColumns.map((c) => cellOf(c, row) ?? "")),
      fileName: csvFileName ?? "export",
      rtl: dir === "rtl",
    })
      .then(() => toast.success(t("abar.listExportedToast")))
      .catch(() => toast.error(t("abar.exportFailedToast")));
  };

  /* count chip: live FILTERED count (the classic فهرست shows what you see);
     a caller-provided countLabel overrides it */
  const chip = countLabel ?? t("dfb.list.recordsCount").replace("{n}", String(filtered.length));

  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm", className)}>
      {/* ── table (sticky header + sticky filter row, horizontal scroll) ──
          Task 133: table-fixed + colgroup عرض دقیق؛ عرض جدول = max(۱۰۰٪, جمع)
          و ستون مجازی انتهایی مازاد را می‌بلعد ⇒ تغییر عرض یک ستون هیچ
          تغییری در عرض ستون‌های دیگر نمی‌سازد؛ سرریز = اسکرول افقی */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table
          className={cn("table-fixed border-separate border-spacing-0 text-xs", resizing && "select-none")}
          style={{ width: `max(100%, ${totalW}px)` }}
        >
          <colgroup>
            {visibleColumns.map((c) => (
              <col key={c.key} ref={registerCol(c.key)} style={{ width: effWidth(c) }} />
            ))}
            <col style={{ width: RAIL_W }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              {visibleColumns.map((c) => {
                const sorted = sort?.key === c.key;
                const dropHere = dropAt?.key === c.key && dragKey !== null && dragKey !== c.key;
                return (
                  <th
                    key={c.key}
                    draggable
                    onDragStart={(e) => onHeaderDragStart(e, c.key)}
                    onDragOver={(e) => onHeaderDragOver(e, c.key)}
                    onDrop={(e) => onHeaderDrop(e, c.key)}
                    onDragEnd={onHeaderDragEnd}
                    title={t("dfb.list.reorderHint")}
                    className={cn(
                      "relative sticky top-0 z-20 border-b border-border/70 bg-muted/80 px-2 text-start font-semibold text-foreground/85 backdrop-blur",
                      dragKey === c.key && "opacity-40",
                    )}
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
                    {/* Task 133 — نشانگر درجِ جابجایی در لبهٔ مقصد (منطقی) */}
                    {dropHere && (
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute inset-y-0 z-30 w-0.5 bg-primary",
                          dropAt!.after ? "end-0" : "start-0",
                        )}
                      />
                    )}
                    {/* Task 133 — دستگیرهٔ تغییر عرض: لبهٔ انتهایی ستون
                        (RTL = لبهٔ چپ، LTR = لبهٔ راست) — فقط همین ستون */}
                    <span
                      role="separator"
                      tabIndex={0}
                      aria-orientation="vertical"
                      aria-label={`${t("dfb.list.resizeHint")} — ${c.label}`}
                      title={t("dfb.list.resizeHint")}
                      aria-valuenow={effWidth(c)}
                      aria-valuemin={MIN_COL_W}
                      onKeyDown={(e) => keyResize(e, c)}
                      onPointerDown={(e) => startResize(e, c.key, effWidth(c))}
                      onPointerMove={moveResize}
                      onPointerUp={endResize}
                      onPointerCancel={endResize}
                      onDragStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={cn(
                        "absolute inset-y-0 end-0 z-30 flex w-1.5 cursor-col-resize touch-none items-center justify-center",
                        "after:absolute after:inset-y-1.5 after:w-px after:bg-border/80",
                        "hover:after:bg-primary/70 focus-visible:after:bg-primary focus-visible:outline-none",
                        resizing && "after:bg-primary/70",
                      )}
                    />
                  </th>
                );
              })}
              {/* row-number rail — never hidden (classic # column) */}
              <th className="sticky top-0 z-20 w-12 min-w-12 border-b border-border/70 border-s bg-muted/80 px-1 text-center text-[10px] font-medium text-muted-foreground backdrop-blur">
                #
              </th>
              {/* Task 133 — ستون مجازی جمع‌شونده: فضای مازاد قاب را می‌بلعد
                  تا عرض ستون‌های واقعی دقیق و دست‌نخورده بماند */}
              <th aria-hidden className="sticky top-0 z-20 border-b border-border/70 bg-muted/80 backdrop-blur" />
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
                <th aria-hidden className="sticky top-9 z-10 border-b border-border/60 bg-background/95 backdrop-blur" />
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="py-16 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" aria-hidden />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="py-16">
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
                    <td aria-hidden className="border-b border-border/40" />
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
              {orderedColumns
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
            title={t("abar.listExport")}
            aria-label={t("abar.listExport")}
            onClick={exportExcel}
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
