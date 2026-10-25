"use client";

/**
 * Action 10 — «لیست» (Task 86 — بازطراحی به درخواست مالک):
 * «آیکون لیست در اکشن بار باید دقیقا شبیه تصویر پیوست باشد. بصورت کاملا زیبا
 * و جذاب و کاربرپسند این دراپ دان را ایجاد کنید. دکمه پلاس را در این دراپ دان
 * قرار ندهید»
 *
 * Contract:
 *  · تریگر = آیکون ☰ ساده (هم‌شکل تصویر: بدون کاشی رنگی، بدون شورون) —
 *    گلیف همیشه با رنگ متنِ زمینه (روی نوار تیره سفید، روی روشن تیره)؛
 *  · پنل = مینی‌گرید عین تصویر: سرستونِ برچسب فیلدها + ردیف «فیلتر...»
 *    (قیف داخل هر خانه) + ردیف رکوردها + اسکرول افقی/عمودی؛
 *  · فوتر = دکمه‌های گرد کوچک (جست‌وجو / پاک‌سازی فیلترها / بازخوانی) در
 *    ابتدای خط و شمارندهٔ «{n} رکورد» با ارقام زبان در انتهای آن —
 *    «دکمهٔ پلاس» عمداً وجود ندارد (قاعدهٔ مالک)؛
 *  · کلیک روی ردیف = بازکردن آن رکورد در فرم (onOpenListItem)؛ ردیفِ رکوردِ
 *    بازِ فعلی با activeId هایلایت می‌شود؛
 *  · فیلترها contains-match و AND بین ستون‌ها هستند و با هر بازشدن پاک
 *    می‌شوند (نمای تازه)؛
 *  · ارائه‌دهندگان بدون cells به دو ستون عنوان/توضیح برمی‌گردند (سازگاری).
 */

import * as React from "react";
import {
  AlignJustify,
  FileSpreadsheet,
  FileText,
  Filter,
  FilterX,
  Inbox,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT, useSettings } from "@/stores/settings-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ActionBarListItem } from "./types";

/** small footer tool — the image's outline rounded-square look: thin border,
    colored glyph, transparent background (the + tile is banned by the owner) */
function ListTool({
  title,
  onClick,
  disabled,
  tone,
  children,
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  /** glyph color, e.g. "text-sky-400" */
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg border border-border/70 bg-background/30 transition-all hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer",
        tone,
      )}
    >
      {children}
    </button>
  );
}

export function RecordListDropdown({
  items,
  loading,
  disabled,
  label,
  onOpenListItem,
  onRefresh,
  activeId,
}: {
  items?: ActionBarListItem[];
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  onOpenListItem?: (item: ActionBarListItem) => void;
  /** footer «بازخوانی» button — rendered only when the provider can reload */
  onRefresh?: () => void | Promise<void>;
  /** id of the currently open record — its row is highlighted */
  activeId?: string | null;
}) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const text = label ?? t("abar.list");

  const [open, setOpen] = React.useState(false);
  const firstFilterRef = React.useRef<HTMLInputElement | null>(null);

  /* providers without per-field cells keep working: title/subtitle columns */
  const normalized = React.useMemo(
    () =>
      (items ?? []).map((it) => ({
        ...it,
        cells: it.cells ?? [
          { label: t("abar.listColTitle"), value: it.title },
          ...(it.subtitle ? [{ label: t("abar.listColSub"), value: it.subtitle }] : []),
        ],
      })),
    [items, t],
  );

  /* column order = first-seen across rows (providers build cells from the
     same field list, so every row agrees on the order) */
  const columns = React.useMemo(() => {
    const out: string[] = [];
    for (const it of normalized)
      for (const c of it.cells) if (!out.includes(c.label)) out.push(c.label);
    return out;
  }, [normalized]);

  /* per-column «فیلتر...» — contains-match, AND across columns */
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const activeFilterCount = Object.values(filters).filter((v) => v.trim().length > 0).length;
  const rows = React.useMemo(() => {
    const needles = Object.entries(filters)
      .filter(([, v]) => v.trim().length > 0)
      .map(([col, v]) => [col, v.trim().toLowerCase()] as const);
    if (needles.length === 0) return normalized;
    return normalized.filter((it) =>
      needles.every(([col, needle]) =>
        (it.cells.find((c) => c.label === col)?.value ?? "").toLowerCase().includes(needle),
      ),
    );
  }, [normalized, filters]);

  /* fresh view on every open: filters reset (they can hide freshly saved rows) */
  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    if (next) setFilters({});
  }, []);

  /* Task 86-b — the image's document tools, made real: the green
     spreadsheet doc exports the FILTERED view as CSV (Excel-friendly BOM),
     the blue document copies it as TSV (paste straight into Excel). */
  const exportCsv = React.useCallback(() => {
    const esc = (s: string) => `"${s.replaceAll('"', '""')}"`;
    const lines = [
      columns.map(esc).join(","),
      ...rows.map((it) =>
        columns.map((c) => esc(it.cells.find((x) => x.label === c)?.value ?? "")).join(","),
      ),
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "list.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("abar.listExportedToast"));
  }, [columns, rows, t]);

  const copyList = React.useCallback(async () => {
    const tsv = [
      columns.join("\t"),
      ...rows.map((it) =>
        columns.map((c) => it.cells.find((x) => x.label === c)?.value ?? "").join("\t"),
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(tsv);
      toast.success(t("abar.listCopiedToast"));
    } catch {
      toast.error(t("common.error"));
    }
  }, [columns, rows, t]);

  const openRecord = React.useCallback(
    (it: ActionBarListItem) => {
      onOpenListItem?.(it);
      setOpen(false);
    },
    [onOpenListItem],
  );

  const empty = !loading && normalized.length === 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={text}
          aria-label={text}
          aria-haspopup="dialog"
          disabled={disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-foreground/85 transition-all hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 data-[state=open]:bg-foreground/10 data-[state=open]:text-foreground cursor-pointer"
        >
          <AlignJustify className="h-[18px] w-[18px]" aria-hidden />
        </button>
      </PopoverTrigger>

      <PopoverContent
        dir="auto"
        align="start"
        sideOffset={8}
        role="dialog"
        aria-label={text}
        className="w-[min(92vw,720px)] overflow-hidden rounded-2xl border-border/70 bg-card/95 p-0"
      >
        {/* ---- the mini grid (exactly like the owner's image) ---- */}
        <div className="max-h-[320px] overflow-auto scrollbar-slim">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-9 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t("common.loading")}
            </div>
          ) : empty ? (
            <div className="flex flex-col items-center gap-2 p-9 text-muted-foreground">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/70">
                <Inbox className="h-5 w-5 opacity-60" aria-hidden />
              </span>
              <span className="text-xs">{t("abar.listEmpty")}</span>
            </div>
          ) : (
            <table className="w-full min-w-max border-collapse">
              <thead>
                {/* column headers — the field labels */}
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c}
                      scope="col"
                      className="sticky top-0 z-10 border-b border-border/60 bg-muted/95 px-2.5 pb-2 pt-2.5 text-center align-bottom text-[11px] font-semibold leading-4 text-muted-foreground backdrop-blur"
                    >
                      <span className="line-clamp-2 max-w-[170px] whitespace-normal">{c}</span>
                    </th>
                  ))}
                </tr>
                {/* the «فیلتر...» row — funnel inside each box, like the image */}
                <tr>
                  {columns.map((c, i) => (
                    <th key={c} scope="col" className="border-b border-border/60 px-2 pb-2 pt-1.5">
                      <div className="relative">
                        <span
                          aria-hidden
                          className="pointer-events-none absolute start-2 top-1/2 flex -translate-y-1/2"
                        >
                          {/* the image's funnel glyph inside the filter box */}
                          <Filter className="h-3 w-3 text-muted-foreground/70" />
                        </span>
                        <input
                          ref={i === 0 ? firstFilterRef : undefined}
                          size={1} /* kill the input's intrinsic ~20ch width — it
                                      was inflating every grid column to ~200px */
                          value={filters[c] ?? ""}
                          onChange={(e) => setFilters((s) => ({ ...s, [c]: e.target.value }))}
                          placeholder={t("abar.listFilterPh")}
                          aria-label={`${t("abar.listFilterPh")} — ${c}`}
                          className="h-7 w-full min-w-[88px] rounded-lg border border-border/70 bg-background/50 ps-7 pe-2 text-center text-[11px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length}>
                      <div className="flex flex-col items-center gap-2 p-8 text-muted-foreground">
                        <Inbox className="h-5 w-5 opacity-50" aria-hidden />
                        <span className="text-xs">{t("abar.listEmpty")}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((it) => {
                    const isActive = activeId != null && it.id === activeId;
                    return (
                      <tr
                        key={it.id}
                        tabIndex={0}
                        role="button"
                        aria-label={it.title}
                        onClick={() => openRecord(it)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openRecord(it);
                          }
                        }}
                        className={cn(
                          "group cursor-pointer outline-none transition-colors focus-visible:bg-accent",
                          isActive
                            ? "bg-primary/10 hover:bg-primary/15"
                            : "hover:bg-accent/60",
                        )}
                      >
                        {columns.map((c, colIdx) => {
                          const v = it.cells.find((x) => x.label === c)?.value ?? "";
                          return (
                            <td
                              key={c}
                              className={cn(
                                "max-w-[220px] truncate border-b border-border/40 px-2.5 py-2 text-xs",
                                /* the image's hierarchy: the first column (the
                                   record's title) reads white/medium, the rest muted */
                                isActive || colIdx === 0
                                  ? "font-medium text-foreground"
                                  : "text-foreground/70",
                              )}
                            >
                              <span className="flex items-center gap-1.5">
                                {isActive && colIdx === 0 && (
                                  <span
                                    aria-hidden
                                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_5px] shadow-primary/50"
                                  />
                                )}
                                <span className="truncate">{v || "—"}</span>
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ---- footer: the image's outline tools (NO plus — owner rule)
              + record count ---- */}
        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <ListTool
              title={t("abar.listSearch")}
              tone="text-foreground/80"
              disabled={empty}
              onClick={() => firstFilterRef.current?.focus()}
            >
              <Search className="h-3.5 w-3.5" aria-hidden />
            </ListTool>
            <ListTool
              title={t("abar.listCopy")}
              tone="text-sky-400"
              disabled={empty || rows.length === 0}
              onClick={() => void copyList()}
            >
              <FileText className="h-3.5 w-3.5" aria-hidden />
            </ListTool>
            <ListTool
              title={t("abar.listExport")}
              tone="text-emerald-500"
              disabled={empty || rows.length === 0}
              onClick={exportCsv}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden />
            </ListTool>
            <ListTool
              title={t("abar.listClearFilters")}
              tone="text-amber-500"
              disabled={empty || activeFilterCount === 0}
              onClick={() => setFilters({})}
            >
              <FilterX className="h-3.5 w-3.5" aria-hidden />
            </ListTool>
            {onRefresh && (
              <ListTool
                title={t("abar.listRefresh")}
                tone="text-sky-300"
                disabled={Boolean(loading)}
                onClick={() => void onRefresh()}
              >
                <RotateCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} aria-hidden />
              </ListTool>
            )}
          </div>
          <span
            className="whitespace-nowrap text-[11px] font-medium text-muted-foreground tabular-nums"
            aria-live="polite"
          >
            {t("abar.listCount").replace("{n}", rows.length.toLocaleString(locale))}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
