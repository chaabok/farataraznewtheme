"use client";

import * as React from "react";
import {
  Calculator,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  Copy,
  FilePlus2,
  Filter,
  Inbox,
  Loader2,
  Lock,
  Minus,
  Plus,
  Square,
  SquarePen,
  Table2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useOrgScope } from "@/stores/org-context-store";
import { useAuthStore } from "@/store/auth-store";
import { useTabDirty, useWindowChrome } from "@/components/desktop/app-window";
import {
  FormActionBar,
  type ActionBarListItem,
} from "@/components/forms/action-bar";
import {
  applyDateMask,
  normalizeDigits,
} from "@/components/forms/form-primitives";
import { displayToStoredDate, storedToDisplayDate } from "@/lib/calendar-date";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * VoucherNewForm — Task 158 (درخواست مالک): فرم «سند حسابداری جدید» در
 * نرم‌افزار «حسابداری» ← زیرمنوی «سند حسابداری». سه بخش:
 *
 *  ۱) هدر — ۹ فیلد فرمان مالک (+ شرح به زبان دوم عین فرم قدیمی تصویر):
 *     شماره سند (خودکار طبق شماره‌گذاری) / شماره عطف (خودکار) / شماره فرعی /
 *     ایجاد کننده (فقط نمایش نام کاربر) / تاریخ سند / نوع سند (کامپوننت
 *     لیست از فرم «نوع سند» بدون انواع سیستمی) / ماهیت سند (عادی/قانونی) /
 *     وضعیت (ثبت اولیه، یادداشت — تاییدشده/دائمی پس از تایید) / شرح.
 *
 *  ۲) اقلام — دو «مدل ورود اطلاعات» (فرمان مالک: «چند مدل ورود اطلاعات
 *     تب اقلام سند حسابداری را تعبیه کنید»): «جدولی» (گرید شیت‌مانند) و
 *     «فرمی» (کارت تک‌ردیف با ناوبری — Task 161: عرض فیلدهای معین،
 *     تفصیلی‌ها، بدهکار، بستانکار، تاریخ و شماره پیگیری ۶۰٪ کم شده =
 *     max-w-[40%] روی خودِ کنترل نسبت به پهنای فعلی). ستون‌ها: ردیف
 *     (خودکار) / کد معین
 *     (الزامی — از کدینگ سطح معین؛ دراپ‌داون چندانتخابی، هر انتخاب اضافی
 *     ردیف جدید می‌سازد) / تفصیلی ۱..۲۰ (تا سقف accDetailLevels؛ فقط
 *     انواعِ متصل‌شده به همان معین — ستون بی‌ارتباط با قفل 🔒) / شرح
 *     (اجباری) / بدهکار / بستانکار (یکی از دو) + ستون‌های شرطی از
 *     پیکربندی نرم‌افزار/حسابداری: سقف showDocDateTrackCap ⇒ تاریخ و
 *     شماره پیگیری؛ سقف showCurrencyCaps ⇒ ارز پایه (از فرم ارزها)،
 *     ارزش ارزی، نرخ ارز.
 *
 *  ۳) فوتر — راست: گروه حساب/حساب کل/حساب معین/عنوان تفصیلی ۱..N ردیفِ
 *     انتخاب‌شده (فقط نمایش)؛ چپ: مجموع بدهکار/مجموع بستانکار/مانده
 *     بدهکار/مانده بستانکار (محاسبهٔ خودکار زنده).
 *
 * منابع دراپ‌داون‌ها با یک GET /vouchers/meta یک‌واکشی می‌شوند؛ شماره‌گذاری
 * خودکار با GET /vouchers/next-number (تک‌مرجع نهایی = سرور در POST).
 */

/* ---------------------------------- meta DTOs ---------------------------------- */

interface DocTypeMeta {
  id: number;
  code: string;
  title: string;
  latinTitle: string;
}
interface CurrencyMeta {
  id: number;
  code: string;
  title: string;
  titleLatin: string;
  decimalPlaces: number;
}
interface DetailItemMeta {
  id: number;
  detailTypeRef: number;
  code: string;
  title: string;
  typeTitle: string;
  typeCode: string;
}
interface MoeinMeta {
  id: number;
  code: string;
  title: string;
  ledgerCode: string;
  ledgerTitle: string;
  groupCode: string;
  groupTitle: string;
  detailLevels: { levelIndex: number; title: string; isActive: boolean; typeRefs: number[] }[];
}
interface VoucherMeta {
  docTypes: DocTypeMeta[];
  currencies: CurrencyMeta[];
  moeinAccounts: MoeinMeta[];
  detailItems: DetailItemMeta[];
  config: {
    showDocDateTrackCap: boolean;
    docDateTrackEntryMandatory: boolean;
    showCurrencyCaps: boolean;
    detailLevelsCount: number;
    baseCurrencyCode: string;
  };
}
interface VoucherListItem {
  id: number;
  voucherNo: number;
  serialNo: number;
  voucherTypeTitle: string;
  voucherTypeCode: string;
  nature: number;
  status: number;
  date: string;
  description: string;
  itemCount: number;
  totalDebit: number;
  totalCredit: number;
}
interface VoucherDetailItem {
  id: number;
  rowIndex: number;
  moeinRef: number;
  moeinCode: string;
  moeinTitle: string;
  ledgerCode: string;
  ledgerTitle: string;
  groupCode: string;
  groupTitle: string;
  description: string;
  debit: string;
  credit: string;
  trackDate: string;
  trackNumber: string;
  currencyRef: number | null;
  currencyCode: string;
  currencyTitle: string;
  currencyValue: string;
  currencyRate: string;
  details: { levelIndex: number; detailItemRef: number; detailCode: string; detailTitle: string }[];
}
interface VoucherDetail {
  item: {
    id: number;
    voucherNo: number;
    serialNo: number;
    subNo: number | null;
    voucherTypeRef: number;
    voucherTypeCode: string;
    voucherTypeTitle: string;
    voucherTypeLatin: string;
    nature: number;
    status: number;
    date: string;
    description: string;
    description2: string;
    creatorName: string;
    items: VoucherDetailItem[];
  };
}

/* ---------------------------------- row model ---------------------------------- */

interface ItemRow {
  key: string;
  moeinRef: number | null;
  /** levelIndex → DetailItem id */
  details: Record<number, number | null>;
  description: string;
  debit: string;
  credit: string;
  trackDate: string;
  trackNumber: string;
  currencyRef: number | null;
  currencyValue: string;
  currencyRate: string;
}

let rowKeySeq = 0;
function blankRow(): ItemRow {
  rowKeySeq += 1;
  return {
    key: `row-${Date.now()}-${rowKeySeq}`,
    moeinRef: null,
    details: {},
    description: "",
    debit: "",
    credit: "",
    trackDate: "",
    trackNumber: "",
    currencyRef: null,
    currencyValue: "",
    currencyRate: "",
  };
}

/** امروز به وقت تهران (+۳:۳۰ ثابت) به‌صورت میلادی ISO — پیش‌فرض تاریخ سند. */
function tehranTodayISO(): string {
  return new Date(Date.now() + 210 * 60 * 1000).toISOString().slice(0, 10);
}

function sanitizeAmount(raw: string): string {
  const digits = normalizeDigits(raw).replace(/[^0-9.]/g, "");
  const parts = digits.split(".");
  return parts.length <= 1 ? digits : `${parts[0]}.${parts.slice(1).join("").slice(0, 6)}`;
}

function amountOf(raw: string): number {
  const s = sanitizeAmount(raw);
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function formatAmount(n: number, locale: string): string {
  return n.toLocaleString(locale === "fa" ? "fa-IR" : locale, { maximumFractionDigits: 6 });
}

/* ------------------------------- header field shell ------------------------------- */

function HeaderField({
  label,
  required,
  readOnly,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  readOnly?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <span className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs text-muted-foreground">
        {required && (
          <span aria-hidden className="text-rose-500">
            *
          </span>
        )}
        <span>{label}</span>
        <span aria-hidden>:</span>
      </span>
      <div className={cn("min-w-0 flex-1", readOnly && "opacity-90")}>{children}</div>
    </div>
  );
}

/* ------------------------------- columnar picker cell ------------------------------- */

interface PickerColumn {
  label: string;
  width?: string;
}
interface PickerRow {
  id: number;
  cells: string[];
}

/**
 * CellPicker — «کامپوننت لیست» ستون‌دار درون خانه‌های گرید اقلام:
 * پاپ‌آور با فیلتر + سرستون + ردیف‌ها (الگوی ListPickerCell فرم‌ها).
 */
function CellPicker({
  ariaLabel,
  display,
  placeholder,
  filterPlaceholder,
  emptyLabel,
  columns,
  rows,
  onPick,
  disabled,
  className,
}: {
  ariaLabel: string;
  display: string;
  placeholder: string;
  filterPlaceholder: string;
  emptyLabel: string;
  columns: PickerColumn[];
  rows: PickerRow[];
  onPick: (id: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  const dir = useSettings((s) => s.dir());
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => r.cells.some((c) => c.toLowerCase().includes(needle)));
  }, [rows, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          className={cn(
            "flex h-7 w-full min-w-0 items-center gap-1 rounded-md border border-input bg-background/70 px-2 text-xs transition-colors hover:border-ring/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className={cn("min-w-0 flex-1 truncate text-start", display ? "text-foreground" : "text-muted-foreground/70")}>
            {display || placeholder}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/70" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        dir={dir}
        align="start"
        side="bottom"
        className="w-72 overflow-hidden rounded-xl border bg-popover p-0 shadow-lg win-shadow"
      >
        <div className="border-b border-border/60 p-1.5">
          <div className="relative">
            <Filter aria-hidden className="pointer-events-none absolute start-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={filterPlaceholder}
              aria-label={`${ariaLabel} — ${filterPlaceholder}`}
              className="h-6 w-full rounded-md border border-input bg-background/60 ps-6 pe-2 text-[11px] outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring"
            />
          </div>
        </div>
        <div className="max-h-56 overflow-y-auto scrollbar-slim">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 p-5 text-muted-foreground">
              <Inbox className="h-4 w-4 opacity-50" aria-hidden />
              <span className="text-[11px]">{emptyLabel}</span>
            </div>
          ) : (
            <table className="w-full border-collapse text-xs" aria-label={ariaLabel}>
              <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.label}
                      scope="col"
                      className={cn("border-b border-border/70 px-2 py-1 text-start font-semibold text-foreground/80", c.width)}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-3 py-4 text-center text-[11px] text-muted-foreground">
                      {emptyLabel}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      tabIndex={0}
                      onClick={() => {
                        onPick(r.id);
                        setOpen(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onPick(r.id);
                          setOpen(false);
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {r.cells.map((c, ci) => (
                        <td
                          key={ci}
                          className={cn("max-w-36 truncate px-2 py-1", ci === 0 ? "font-medium text-foreground" : "text-foreground/75")}
                        >
                          {c || "—"}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * MoeinPickerCell — دراپ‌داون چندانتخابی «کد معین»: کلیک روی ردیف = انتخابِ
 * همان حساب برای ردیف جاری؛ تیک چک‌باکس‌ها + دکمهٔ «افزودن» = هر حساب
 * انتخابیِ اضافی یک ردیف جدید می‌سازد (فرمان مالک Task 158).
 */
function MoeinPickerCell({
  meta,
  value,
  onPick,
  onPickMany,
  disabled,
  className,
  emptyLabel,
  phLabel,
  addLabel,
  selLabel,
  codeLabel,
  titleLabel,
  searchLabel,
}: {
  meta: MoeinMeta[];
  value: number | null;
  onPick: (id: number) => void;
  onPickMany: (ids: number[]) => void;
  disabled?: boolean;
  className?: string;
  emptyLabel: string;
  phLabel: string;
  addLabel: string;
  selLabel: string;
  codeLabel: string;
  titleLabel: string;
  searchLabel: string;
}) {
  const dir = useSettings((s) => s.dir());
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [checked, setChecked] = React.useState<ReadonlySet<number>>(new Set());

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setQuery("");
      setChecked(new Set());
    }
  };

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return meta;
    return meta.filter((m) => m.code.toLowerCase().includes(needle) || m.title.toLowerCase().includes(needle));
  }, [meta, query]);

  const selected = meta.find((m) => m.id === value) ?? null;
  const display = selected ? selected.code : "";

  const applyMany = () => {
    const ids = [...checked];
    if (ids.length === 0) return;
    onPickMany(ids);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={searchLabel}
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          className={cn(
            "flex h-7 w-full min-w-0 items-center gap-1 rounded-md border border-input bg-background/70 px-2 text-xs transition-colors hover:border-ring/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className={cn("min-w-0 flex-1 truncate text-start", display ? "text-foreground" : "text-muted-foreground/70")}>
            {display || phLabel}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/70" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        dir={dir}
        align="start"
        side="bottom"
        className="w-80 overflow-hidden rounded-xl border bg-popover p-0 shadow-lg win-shadow"
      >
        <div className="border-b border-border/60 p-1.5">
          <div className="relative">
            <Filter aria-hidden className="pointer-events-none absolute start-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchLabel}
              aria-label={`${searchLabel} — فیلتر`}
              className="h-6 w-full rounded-md border border-input bg-background/60 ps-6 pe-2 text-[11px] outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring"
            />
          </div>
        </div>
        <div className="max-h-56 overflow-y-auto scrollbar-slim">
          {meta.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 p-5 text-muted-foreground">
              <Inbox className="h-4 w-4 opacity-50" aria-hidden />
              <span className="text-[11px]">{emptyLabel}</span>
            </div>
          ) : (
            <table className="w-full border-collapse text-xs" aria-label={searchLabel}>
              <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                <tr>
                  <th scope="col" className="w-8 border-b border-border/70 px-1 py-1" aria-label="" />
                  <th scope="col" className="border-b border-border/70 px-2 py-1 text-start font-semibold text-foreground/80">
                    {codeLabel}
                  </th>
                  <th scope="col" className="border-b border-border/70 px-2 py-1 text-start font-semibold text-foreground/80">
                    {titleLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const isChecked = checked.has(m.id);
                  return (
                    <tr
                      key={m.id}
                      tabIndex={0}
                      onClick={() => {
                        onPick(m.id);
                        setOpen(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onPick(m.id);
                          setOpen(false);
                        }
                      }}
                      className={cn("cursor-pointer transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", value === m.id && "bg-primary/10")}
                    >
                      <td className="px-1 py-1 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`${codeLabel} ${m.code} — ${titleLabel} ${m.title}`}
                          checked={isChecked}
                          onChange={() =>
                            setChecked((prev) => {
                              const next = new Set(prev);
                              if (next.has(m.id)) next.delete(m.id);
                              else next.add(m.id);
                              return next;
                            })
                          }
                          className="h-3.5 w-3.5 cursor-pointer accent-emerald-600"
                        />
                      </td>
                      <td className="px-2 py-1 font-medium text-foreground">{m.code}</td>
                      <td className="max-w-40 truncate px-2 py-1 text-foreground/75">{m.title}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/40 px-2.5 py-1.5">
          <span className="text-[10px] text-muted-foreground">{selLabel}</span>
          <button
            type="button"
            onClick={applyMany}
            disabled={checked.size === 0}
            className="flex h-6 items-center gap-1 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 px-2.5 text-[11px] font-medium text-white shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <Plus className="h-3 w-3" aria-hidden />
            {addLabel}
            {checked.size > 0 && (
              <span className="rounded-full bg-white/25 px-1.5 text-[10px] tabular-nums">{checked.size}</span>
            )}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ---------------------------------- totals box ---------------------------------- */

function TotalCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "debit" | "credit" | "neutral";
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground">{label}:</span>
      <span
        className={cn(
          "min-w-24 rounded-md border px-2 py-1 text-end text-xs font-bold tabular-nums",
          tone === "debit" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
          tone === "credit" && "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400",
          tone === "neutral" && "border-border bg-muted/50 text-foreground",
        )}
        dir="ltr"
      >
        {value}
      </span>
    </div>
  );
}

/* ---------------------------------- main form ---------------------------------- */

export function VoucherNewForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "app" && w.appKey === "accounting")?.maximized ?? false,
  );
  const { scope, loaded: orgLoaded } = useOrgScope();
  const authUser = useAuthStore((s) => s.user?.displayName ?? "");

  /* ------------------------- منابع فرم (meta) ------------------------- */
  const [meta, setMeta] = React.useState<VoucherMeta | null>(null);
  const [metaLoading, setMetaLoading] = React.useState(true);
  const [metaError, setMetaError] = React.useState(false);

  /* ------------------------------ هدر سند ------------------------------ */
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [voucherNo, setVoucherNo] = React.useState("");
  const [serialNo, setSerialNo] = React.useState("");
  const [subNo, setSubNo] = React.useState("");
  const [voucherTypeRef, setVoucherTypeRef] = React.useState<number | null>(null);
  const [nature, setNature] = React.useState(1);
  const [status, setStatus] = React.useState(1);
  const [dateDisplay, setDateDisplay] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [description2, setDescription2] = React.useState("");
  const [creatorName, setCreatorName] = React.useState("");

  /* ------------------------------ اقلام سند ------------------------------ */
  const [rows, setRows] = React.useState<ItemRow[]>(() => [blankRow()]);
  const [selectedRow, setSelectedRow] = React.useState(0);
  const [mode, setMode] = React.useState<"grid" | "form">("grid");
  const [formRow, setFormRow] = React.useState(0); // ردیف فعال حالت فرمی

  /* ------------------------------ لیست/ناوبری ------------------------------ */
  const [records, setRecords] = React.useState<VoucherListItem[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  const markDirty = React.useCallback(() => setDirty(true), []);

  const moeinById = React.useMemo(() => new Map((meta?.moeinAccounts ?? []).map((m) => [m.id, m])), [meta]);
  const detailById = React.useMemo(() => new Map((meta?.detailItems ?? []).map((d) => [d.id, d])), [meta]);
  const currencyById = React.useMemo(() => new Map((meta?.currencies ?? []).map((c) => [c.id, c])), [meta]);
  const typeById = React.useMemo(() => new Map((meta?.docTypes ?? []).map((d) => [d.id, d])), [meta]);

  const detailLevelsCount = Math.min(20, Math.max(1, meta?.config.detailLevelsCount ?? 10));
  const showTrackCols = meta?.config.showDocDateTrackCap ?? false;
  const trackMandatory = meta?.config.docDateTrackEntryMandatory ?? false;
  const showCurrencyCols = meta?.config.showCurrencyCaps ?? false;

  /** وضعیت قفل هر ستون تفصیلی برای یک ردیف — ⚠️ فرمان مالک: فقط انواعِ
   *  متصل‌شده به همان معین قابل انتخاب‌اند؛ ستون بی‌ارتباط قفل 🔒 می‌شود. */
  const levelInfoOf = React.useCallback(
    (moeinRef: number | null, levelIndex: number): { locked: boolean; typeRefs: number[] } => {
      if (moeinRef == null) return { locked: true, typeRefs: [] };
      const m = moeinById.get(moeinRef);
      const lv = m?.detailLevels.find((x) => x.levelIndex === levelIndex);
      if (!lv || !lv.isActive || lv.typeRefs.length === 0) return { locked: true, typeRefs: [] };
      return { locked: false, typeRefs: lv.typeRefs };
    },
    [moeinById],
  );

  const loadMeta = React.useCallback(async (): Promise<VoucherMeta | null> => {
    try {
      const res = await api.get<VoucherMeta>("vouchers/meta");
      setMeta(res);
      setMetaError(false);
      return res;
    } catch {
      setMetaError(true);
      return null;
    } finally {
      setMetaLoading(false);
    }
  }, []);

  const fetchRecords = React.useCallback(async (): Promise<VoucherListItem[]> => {
    const res = await api.get<{ items: VoucherListItem[] }>(
      `vouchers${scope.businessStructureRef ? `?structureId=${scope.businessStructureRef}` : ""}`,
    );
    return res.items ?? [];
  }, [scope.businessStructureRef]);

  const applyRecords = React.useCallback((rs: VoucherListItem[]) => {
    setRecords(rs);
    setListLoading(false);
  }, []);

  /** شماره‌گذاری خودکار — پیشنهاد سرور (تک‌مرجع نهایی در POST است). */
  const refreshNumbers = React.useCallback(
    async (typeRef: number | null) => {
      try {
        const qs = new URLSearchParams();
        if (typeRef != null) qs.set("voucherTypeRef", String(typeRef));
        if (scope.businessStructureRef) qs.set("structureId", String(scope.businessStructureRef));
        const res = await api.get<{ voucherNo: number; serialNo: number }>(
          `vouchers/next-number${qs.toString() ? `?${qs.toString()}` : ""}`,
        );
        setVoucherNo(String(res.voucherNo));
        setSerialNo(String(res.serialNo));
      } catch {
        /* بی‌صدا — سرور در POST تخصیص نهایی را می‌کند */
      }
    },
    [scope.businessStructureRef],
  );

  const resetForm = React.useCallback(
    () => {
      setCurrentId(null);
      setDirty(false);
      setVoucherNo("");
      setSerialNo("");
      setSubNo("");
      setVoucherTypeRef(null);
      setNature(1);
      setStatus(1);
      setDateDisplay(storedToDisplayDate(tehranTodayISO(), locale));
      setDescription("");
      setDescription2("");
      setCreatorName(authUser || t("vc.creatorGuest"));
      setRows([blankRow()]);
      setSelectedRow(0);
      setFormRow(0);
      void refreshNumbers(null);
    },
    [authUser, locale, refreshNumbers, t],
  );

  /* بار اول: meta + شماره‌گذاری + فهرست — پس از بارگذاری OrgScope (دامنهٔ ساختار) */
  React.useEffect(() => {
    if (!orgLoaded) return;
    let alive = true;
    void (async () => {
      const m = await loadMeta();
      if (!alive) return;
      setDateDisplay(storedToDisplayDate(tehranTodayISO(), locale));
      setCreatorName(authUser || t("vc.creatorGuest"));
      /* ارز پایهٔ پیکربندی = پیش‌فرض ستون ارز ردیف‌ها (وقتی سقف ارزی فعال است) */
      if (m?.config.showCurrencyCaps && m.config.baseCurrencyCode) {
        const cur = m.currencies.find((c) => c.code === m.config.baseCurrencyCode);
        if (cur) {
          setRows((prev) => prev.map((r) => (r.currencyRef == null ? { ...r, currencyRef: cur.id } : r)));
        }
      }
      await refreshNumbers(null);
      if (!alive) return;
      fetchRecords()
        .then((rs) => alive && applyRecords(rs))
        .catch(() => alive && applyRecords([]));
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgLoaded, loadMeta, refreshNumbers, fetchRecords, applyRecords]);

  /* شماره‌گذاری خودکار با انتخاب نوع سند به‌روز می‌شود (در onPick فراخوانی
     می‌شود — نه در effect — تا setState زنجیره‌ای رخ ندهد) */

  /* ------------------------------ ردیف‌ها ------------------------------ */

  const setRow = React.useCallback(
    (idx: number, patch: Partial<ItemRow>) => {
      setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
      markDirty();
    },
    [markDirty],
  );

  const deleteRow = React.useCallback(
    (idx: number) => {
      setRows((prev) => (prev.length <= 1 ? [blankRow()] : prev.filter((_, i) => i !== idx)));
      setSelectedRow(0);
      setFormRow(0);
      markDirty();
    },
    [markDirty],
  );

  /** انتخاب معین برای ردیف — تفصیلی‌های ستون‌های قفل‌شده پاک می‌شوند. */
  const pickMoein = React.useCallback(
    (idx: number, moeinId: number) => {
      setRows((prev) =>
        prev.map((r, i) => {
          if (i !== idx) return r;
          const cleaned: Record<number, number | null> = {};
          for (const [k, v] of Object.entries(r.details)) {
            const li = Number(k);
            const info = levelInfoOf(moeinId, li);
            if (!info.locked && v != null) cleaned[li] = v;
          }
          return { ...r, moeinRef: moeinId, details: cleaned };
        }),
      );
      markDirty();
    },
    [levelInfoOf, markDirty],
  );

  /** انتخاب چندتایی معین — هر انتخاب اضافی یک ردیف جدید (فرمان مالک). */
  const pickMoeinMany = React.useCallback(
    (idx: number, ids: number[]) => {
      if (ids.length === 0) return;
      setRows((prev) => {
        const next = [...prev];
        const first = ids[0];
        const cur = next[idx];
        const cleaned: Record<number, number | null> = {};
        for (const [k, v] of Object.entries(cur.details)) {
          const li = Number(k);
          if (!levelInfoOf(first, li).locked && v != null) cleaned[li] = v;
        }
        next[idx] = { ...cur, moeinRef: first, details: cleaned };
        for (let i = 1; i < ids.length; i++) {
          const nr = blankRow();
          nr.moeinRef = ids[i];
          if (showCurrencyCols && meta?.config.baseCurrencyCode) {
            const cur2 = meta.currencies.find((c) => c.code === meta.config.baseCurrencyCode);
            if (cur2) nr.currencyRef = cur2.id;
          }
          next.splice(idx + i, 0, nr);
        }
        return next;
      });
      markDirty();
      toast.success(t("vc.moeinAddedToast").replace("{n}", String(ids.length)));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levelInfoOf, markDirty, t, showCurrencyCols],
  );

  const pickDetail = React.useCallback(
    (idx: number, levelIndex: number, detailItemId: number) => {
      setRows((prev) =>
        prev.map((r, i) => (i === idx ? { ...r, details: { ...r.details, [levelIndex]: detailItemId } } : r)),
      );
      markDirty();
    },
    [markDirty],
  );

  /* ------------------------------ محاسبات فوتر ------------------------------ */
  const totals = React.useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    for (const r of rows) {
      totalDebit += amountOf(r.debit);
      totalCredit += amountOf(r.credit);
    }
    const diff = totalDebit - totalCredit;
    return {
      totalDebit,
      totalCredit,
      balanceDebit: diff > 0 ? diff : 0,
      balanceCredit: diff < 0 ? -diff : 0,
      balanced: diff === 0 && totalDebit > 0,
    };
  }, [rows]);

  /** ردیفِ مبنای فوتر (راست) = ردیف انتخاب‌شده (یا اولین ردیف دارای معین) */
  const footerRowIdx = Math.min(selectedRow, rows.length - 1);
  const footerRow = rows[footerRowIdx];
  const footerMoein = footerRow?.moeinRef != null ? moeinById.get(footerRow.moeinRef) : undefined;

  /* ------------------------------ بازکردن سند ------------------------------ */
  const applyDetail = React.useCallback(
    (d: VoucherDetail["item"]) => {
      setCurrentId(d.id);
      setDirty(false);
      setVoucherNo(String(d.voucherNo));
      setSerialNo(String(d.serialNo));
      setSubNo(d.subNo == null ? "" : String(d.subNo));
      setVoucherTypeRef(d.voucherTypeRef);
      setNature(d.nature);
      setStatus(d.status);
      setDateDisplay(storedToDisplayDate(d.date, locale));
      setDescription(d.description);
      setDescription2(d.description2 ?? "");
      setCreatorName(d.creatorName || t("vc.creatorGuest"));
      const nextRows = d.items.map((it) => {
        const r = blankRow();
        r.moeinRef = it.moeinRef;
        for (const det of it.details) r.details[det.levelIndex] = det.detailItemRef;
        r.description = it.description;
        r.debit = it.debit && it.debit !== "0" ? it.debit : "";
        r.credit = it.credit && it.credit !== "0" ? it.credit : "";
        r.trackDate = storedToDisplayDate(it.trackDate, locale);
        r.trackNumber = it.trackNumber ?? "";
        r.currencyRef = it.currencyRef;
        r.currencyValue = it.currencyValue ?? "";
        r.currencyRate = it.currencyRate ?? "";
        return r;
      });
      setRows(nextRows.length > 0 ? nextRows : [blankRow()]);
      setSelectedRow(0);
      setFormRow(0);
    },
    [locale, t],
  );

  const openVoucher = React.useCallback(
    async (id: number) => {
      try {
        const res = await api.get<VoucherDetail>(`vouchers/${id}`);
        applyDetail(res.item);
        toast.success(t("abar.itemOpened"));
      } catch (e) {
        toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
      }
    },
    [applyDetail, t],
  );

  /* ------------------------------ ذخیره ------------------------------ */

  const validate = (): string | null => {
    if (voucherTypeRef == null) return t("vc.errTypeRequired");
    const dateISO = displayToStoredDate(dateDisplay, locale, normalizeDigits);
    if (dateDisplay.trim() === "" || dateISO == null) return t("vc.errDateRequired");
    if (description.trim() === "") return t("vc.errDescriptionRequired");
    const filled = rows.filter(
      (r) => r.moeinRef != null || r.description.trim() !== "" || amountOf(r.debit) > 0 || amountOf(r.credit) > 0,
    );
    if (filled.length === 0) return t("vc.errItemsRequired");
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const isEmpty =
        r.moeinRef == null && r.description.trim() === "" && amountOf(r.debit) === 0 && amountOf(r.credit) === 0;
      if (isEmpty) continue; // ردیف‌های کاملاً خالی نادیده گرفته می‌شوند
      const rowNo = i + 1;
      if (r.moeinRef == null) return t("vc.errRowMoein").replace("{i}", String(rowNo));
      if (r.description.trim() === "") return t("vc.errRowDesc").replace("{i}", String(rowNo));
      if (amountOf(r.debit) > 0 && amountOf(r.credit) > 0)
        return t("vc.errRowAmount").replace("{i}", String(rowNo));
      if (showTrackCols && trackMandatory && (r.trackDate.trim() === "" || r.trackNumber.trim() === "")) {
        return t("vc.errRowTrack").replace("{i}", String(rowNo));
      }
    }
    return null;
  };

  const buildPayload = () => {
    const dateISO = displayToStoredDate(dateDisplay, locale, normalizeDigits);
    const items = rows
      .map((r) => {
        if (r.moeinRef == null) return null;
        const details = Object.entries(r.details)
          .filter(([, v]) => v != null)
          .map(([k, v]) => ({ levelIndex: Number(k), detailItemRef: Number(v) }));
        return {
          moeinRef: r.moeinRef,
          description: r.description.trim(),
          debit: amountOf(r.debit) > 0 ? sanitizeAmount(r.debit) : undefined,
          credit: amountOf(r.credit) > 0 ? sanitizeAmount(r.credit) : undefined,
          trackDate: displayToStoredDate(r.trackDate, locale, normalizeDigits) ?? undefined,
          trackNumber: r.trackNumber.trim() || undefined,
          currencyRef: r.currencyRef ?? undefined,
          currencyValue: r.currencyValue.trim() || undefined,
          currencyRate: r.currencyRate.trim() || undefined,
          details,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x != null);
    return {
      voucherNo: Number(voucherNo) > 0 ? Number(voucherNo) : undefined,
      serialNo: Number(serialNo) > 0 ? Number(serialNo) : undefined,
      subNo: Number(subNo) > 0 ? Number(subNo) : undefined,
      voucherTypeRef: voucherTypeRef ?? 0,
      nature,
      status,
      date: dateISO ?? tehranTodayISO(),
      description: description.trim(),
      description2: description2.trim() || undefined,
      items,
      structureId: scope.businessStructureRef ?? undefined,
    };
  };

  const doSave = async (): Promise<boolean> => {
    const err = validate();
    if (err) {
      toast.error(err);
      return false;
    }
    const body = buildPayload();
    try {
      const res = currentId == null
        ? await api.post<VoucherDetail["item"]>("vouchers", body)
        : await api.put<VoucherDetail["item"]>(`vouchers/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      applyDetail(res);
      fetchRecords()
        .then(applyRecords)
        .catch(() => applyRecords([]));
      return true;
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
      return false;
    }
  };

  const doDelete = async (): Promise<void> => {
    if (currentId == null) {
      toast.info(t("dfb.noRecordSelected"));
      return;
    }
    try {
      await api.del(`vouchers/${currentId}`);
      toast.success(t("abar.deletedToast"));
      fetchRecords()
        .then(applyRecords)
        .catch(() => applyRecords([]));
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    }
  };

  /* ناوبری رکوردهای «|< < > >|» */
  const currentIndex = records.findIndex((r) => r.id === currentId);
  const nav = (i: number) => {
    const r = records[i];
    if (r) void openVoucher(r.id);
  };

  /* ------------------------------ list items اکشن‌بار ------------------------------ */
  const listItems = React.useMemo<ActionBarListItem[]>(
    () =>
      records.map((r) => ({
        id: String(r.id),
        title: `${r.voucherNo} - ${r.voucherTypeTitle}`,
        subtitle: r.description || undefined,
        cells: [
          { label: t("vc.voucherNo"), value: String(r.voucherNo) },
          { label: t("vc.serialNo"), value: String(r.serialNo) },
          { label: t("vc.date"), value: storedToDisplayDate(r.date, locale) },
          { label: t("vc.docType"), value: r.voucherTypeTitle },
          {
            label: t("vc.status"),
            value:
              r.status === 1 ? t("vc.statusInitial") : r.status === 2 ? t("vc.statusNote") : t("vc.statusApproved"),
          },
          { label: t("vc.description"), value: r.description },
        ],
      })),
    [records, t, locale],
  );

  /* ------------------------------ حالت بارگذاری ------------------------------ */
  if (metaLoading || !meta) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
        {metaError ? (
          <>
            <CircleAlertIcon />
            <span className="text-xs">{t("common.error")}</span>
            <button
              type="button"
              onClick={() => {
                setMetaLoading(true);
                void loadMeta();
              }}
              className="rounded-lg border px-3 py-1.5 text-xs hover:bg-foreground/5 cursor-pointer"
            >
              {t("abar.listRefresh")}
            </button>
          </>
        ) : (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            <span className="text-xs">{t("common.loading")}</span>
          </>
        )}
      </div>
    );
  }

  const docTypeRows: PickerRow[] = meta.docTypes.map((d) => ({ id: d.id, cells: [d.code, d.title, d.latinTitle] }));
  const currencyRows: PickerRow[] = meta.currencies.map((c) => ({ id: c.id, cells: [c.code, c.title, c.titleLatin] }));
  const selectedType = voucherTypeRef != null ? typeById.get(voucherTypeRef) : undefined;
  /* گزینه‌های ماهیت/وضعیت — لیست ثابت داخلی فرم (فرمان مالک) */
  const statusOptions = [
    { value: 1, label: t("vc.statusInitial"), enabled: true },
    { value: 2, label: t("vc.statusNote"), enabled: true },
    { value: 3, label: t("vc.statusApproved"), enabled: false },
    { value: 4, label: t("vc.statusPermanent"), enabled: false },
  ];

  const levelColumns = Array.from({ length: detailLevelsCount }, (_, i) => i + 1);

  /* ------------------------------ حالت فرمی ------------------------------ */
  const formIdx = Math.min(formRow, rows.length - 1);
  const formRowData = rows[formIdx];

  return (
    <>
      <section data-voucher-form className="flex h-full min-h-0 flex-col overflow-hidden bg-background/25">
        {/* ۱) هدر پنجره — نوار گرادیانی هم‌الگوی همهٔ فرم‌ها */}
        <header
          className="relative flex h-11 shrink-0 select-none items-center gap-2.5 rtl:bg-gradient-to-l ltr:bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600 px-3 text-white"
          onPointerDown={chrome?.onDragStart}
          onPointerMove={chrome?.onDragMove}
          onPointerUp={chrome?.onDragEnd}
          onPointerCancel={chrome?.onDragEnd}
          onDoubleClick={(e) => {
            if ((e.target as HTMLElement).closest("[data-window-btn]")) return;
            chrome?.onDoubleClick?.();
          }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20 shadow-inner">
            <FilePlus2 className="h-3.5 w-3.5" aria-hidden />
          </span>
          <h2 className="truncate text-sm font-bold tracking-tight drop-shadow-sm">{t("vc.formTitle")}</h2>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-inset ring-white/25">
            {t("app.accounting")}
          </span>
          <div className="ms-auto flex items-center gap-0.5">
            {chrome?.onMinimize && (
              <button
                type="button"
                data-window-btn
                aria-label={t("common.minimize")}
                onClick={chrome.onMinimize}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/15 cursor-pointer"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
            )}
            {chrome?.onToggleMaximize && (
              <button
                type="button"
                data-window-btn
                aria-label={t("common.maximize")}
                onClick={chrome.onToggleMaximize}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/15 cursor-pointer"
              >
                {headerMaximized ? <Copy className="h-3 w-3 -scale-x-100" aria-hidden /> : <Square className="h-3.5 w-3.5" aria-hidden />}
              </button>
            )}
            {chrome?.onClose && (
              <button
                type="button"
                data-window-btn
                aria-label={t("common.close")}
                onClick={chrome.onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/15 cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/25" />
        </header>

        {/* ۲) نوار اکشن + ناوبری رکوردها */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/60 bg-muted/40 px-3 py-2">
          <FormActionBar
            className="min-w-0 flex-1"
            onReset={() => {
              resetForm();
              toast.success(t("abar.resetToast"));
            }}
            onSave={async () => {
              await doSave();
            }}
            onSaveNew={async () => {
              if (await doSave()) {
                resetForm();
                if (voucherTypeRef != null) void refreshNumbers(voucherTypeRef);
              }
            }}
            onCopy={() => {
              /* کپی سند: شماره‌ها خالی می‌شوند تا در ذخیرهٔ بعدی تخصیص شود */
              setCurrentId(null);
              setVoucherNo("");
              setSerialNo("");
              setDirty(true);
              toast.success(t("abar.copyToast"));
            }}
            onDelete={doDelete}
            onPrint={() => {
              toast.success(t("abar.printToast"));
            }}
            onClose={onBack}
            listItems={listItems}
            listLoading={listLoading}
            onOpenListItem={(item) => {
              void openVoucher(Number(item.id));
            }}
            canDelete={currentId != null}
          />
          <div
            role="group"
            aria-label={t("sft.first")}
            className="flex shrink-0 items-center gap-0.5 rounded-lg border bg-background/60 p-1"
          >
            <NavGlyph label={t("sft.first")} onClick={() => nav(0)} Icon={ChevronFirst} />
            <NavGlyph label={t("sft.prev")} onClick={() => nav(Math.max(0, currentIndex - 1))} Icon={ChevronRight} />
            <NavGlyph
              label={t("sft.next")}
              onClick={() => nav(Math.min(records.length - 1, currentIndex + 1))}
              Icon={ChevronLeft}
            />
            <NavGlyph label={t("sft.last")} onClick={() => nav(records.length - 1)} Icon={ChevronLast} />
          </div>
        </div>

        {/* ۳) بدنه — سه بخش هدر / اقلام / فوتر (ستون فلکس با ارتفاع قطعی: اقلام flex-1 می‌گیرد و فوتر فشرده می‌ماند — Task 159) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 scrollbar-slim">
          {/* ---------- بخش هدر ---------- */}
          <div className="shrink-0 rounded-2xl border border-border/70 bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
              <FilePlus2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
              <h3 className="text-xs font-bold text-foreground/90">{t("vc.header")}</h3>
            </div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-2 px-3 py-3 md:grid-cols-2 xl:grid-cols-4">
              <HeaderField label={t("vc.voucherNo")} required readOnly>
                <Input
                  value={voucherNo}
                  readOnly
                  aria-label={t("vc.voucherNo")}
                  aria-readonly
                  dir="ltr"
                  className="h-7 bg-muted/40 text-xs tabular-nums"
                />
              </HeaderField>
              <HeaderField label={t("vc.serialNo")} required readOnly>
                <Input
                  value={serialNo}
                  readOnly
                  aria-label={t("vc.serialNo")}
                  aria-readonly
                  dir="ltr"
                  className="h-7 bg-muted/40 text-xs tabular-nums"
                />
              </HeaderField>
              <HeaderField label={t("vc.subNo")}>
                <Input
                  value={subNo}
                  onChange={(e) => {
                    setSubNo(normalizeDigits(e.target.value).replace(/[^0-9]/g, ""));
                    markDirty();
                  }}
                  aria-label={t("vc.subNo")}
                  dir="ltr"
                  className="h-7 text-xs tabular-nums"
                />
              </HeaderField>
              <HeaderField label={t("vc.creator")} readOnly>
                <Input
                  value={creatorName}
                  readOnly
                  aria-label={t("vc.creator")}
                  aria-readonly
                  className="h-7 bg-muted/40 text-xs"
                />
              </HeaderField>

              <HeaderField label={t("vc.date")} required>
                <Input
                  value={dateDisplay}
                  onChange={(e) => {
                    setDateDisplay(applyDateMask(e.target.value, false));
                    markDirty();
                  }}
                  aria-label={t("vc.date")}
                  dir="ltr"
                  placeholder="____/__/__"
                  className="h-7 text-xs tabular-nums"
                />
              </HeaderField>
              <HeaderField label={t("vc.docType")} required>
                <CellPicker
                  ariaLabel={t("vc.docType")}
                  display={selectedType ? `${selectedType.code} - ${selectedType.title}` : ""}
                  placeholder={t("vc.selectPlaceholder")}
                  filterPlaceholder={t("abar.listFilterPh")}
                  emptyLabel={t("vc.docTypeEmpty")}
                  columns={[
                    { label: t("vc.colCode"), width: "w-14" },
                    { label: t("vc.colTitle") },
                    { label: t("vc.colLatin") },
                  ]}
                  rows={docTypeRows}
                  onPick={(id) => {
                    setVoucherTypeRef(id);
                    /* ثبت جدید ⇒ شماره سند از شماره‌گذاری همان نوع (خودکار) */
                    if (currentId == null) void refreshNumbers(id);
                    markDirty();
                  }}
                />
              </HeaderField>
              <HeaderField label={t("vc.nature")} required>
                <select
                  value={nature}
                  aria-label={t("vc.nature")}
                  onChange={(e) => {
                    setNature(Number(e.target.value));
                    markDirty();
                  }}
                  className="h-7 w-full cursor-pointer rounded-md border border-input bg-background/70 px-2 text-xs text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value={1}>{t("vc.natureNormal")}</option>
                  <option value={2}>{t("vc.natureLegal")}</option>
                </select>
              </HeaderField>
              <HeaderField label={t("vc.status")} required>
                <select
                  value={status}
                  aria-label={t("vc.status")}
                  onChange={(e) => {
                    setStatus(Number(e.target.value));
                    markDirty();
                  }}
                  className="h-7 w-full cursor-pointer rounded-md border border-input bg-background/70 px-2 text-xs text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value} disabled={!s.enabled}>
                      {s.label}
                      {!s.enabled ? ` — ${t("vc.statusAfterApproval")}` : ""}
                    </option>
                  ))}
                </select>
              </HeaderField>

              <HeaderField label={t("vc.description")} required className="md:col-span-2">
                <Textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    markDirty();
                  }}
                  aria-label={t("vc.description")}
                  rows={1}
                  className="min-h-7 resize-none py-1 text-xs"
                />
              </HeaderField>
              <HeaderField label={t("vc.description2")} className="md:col-span-2">
                <Textarea
                  value={description2}
                  onChange={(e) => {
                    setDescription2(e.target.value);
                    markDirty();
                  }}
                  aria-label={t("vc.description2")}
                  rows={1}
                  className="min-h-7 resize-none py-1 text-xs"
                />
              </HeaderField>
            </div>
          </div>

          {/* ---------- بخش اقلام سند ---------- */}
          {/* flex-1: تمام ارتفاع صرفه‌جویی‌شدهٔ فوتر (Task 159) به همین بخش اختصاص می‌یابد؛
              Task 161: زیر lg کارت حداقلِ ارتفاع محتوا را دارد (اسکرول طبیعی بدنه) تا ویرایشگر فرمی
              در موبایل به لبهٔ ۳۶ فشرده نشود؛ در lg+ قرارداد Task 159 (کف min-h-36 + اسکرول داخلی) */}
          <div className="mt-3 flex min-h-36 max-lg:min-h-max flex-1 flex-col rounded-2xl border border-border/70 bg-card shadow-sm">
            <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-3 py-2">
              <Table2 className="h-3.5 w-3.5 text-teal-600" aria-hidden />
              <h3 className="text-xs font-bold text-foreground/90">{t("vc.items")}</h3>
              {/* چند مدل ورود اطلاعات (فرمان مالک): جدولی / فرمی */}
              <div
                role="group"
                aria-label={t("vc.modeLabel")}
                className="ms-auto flex items-center gap-0.5 rounded-lg border bg-background/60 p-0.5"
              >
                <ModeButton active={mode === "grid"} onClick={() => setMode("grid")} icon={<Table2 className="h-3.5 w-3.5" aria-hidden />}>
                  {t("vc.modeGrid")}
                </ModeButton>
                <ModeButton active={mode === "form"} onClick={() => setMode("form")} icon={<SquarePen className="h-3.5 w-3.5" aria-hidden />}>
                  {t("vc.modeForm")}
                </ModeButton>
              </div>
            </div>

            {mode === "grid" ? (
              /* ----- مدل جدولی: گرید شیت‌مانند با همهٔ ستون‌ها ----- */
              <div className="min-h-0 flex-1 overflow-auto scrollbar-slim" data-items-grid>
                <table className="w-full min-w-max border-separate border-spacing-0 text-xs">
                  <thead>
                    <tr>
                      <Th className="w-12 text-center">{t("vc.row")}</Th>
                      <Th className="min-w-36">{t("vc.moeinCode")}</Th>
                      {levelColumns.map((li) => (
                        <Th key={li} className="min-w-32 text-center">
                          {t("vc.detailCol").replace("{n}", String(li))}
                        </Th>
                      ))}
                      <Th className="min-w-48">{t("vc.description")}</Th>
                      <Th className="min-w-28 text-center">{t("vc.debit")}</Th>
                      <Th className="min-w-28 text-center">{t("vc.credit")}</Th>
                      {showTrackCols && <Th className="min-w-28 text-center">{t("vc.trackDate")}</Th>}
                      {showTrackCols && <Th className="min-w-28">{t("vc.trackNumber")}</Th>}
                      {showCurrencyCols && <Th className="min-w-28 text-center">{t("vc.baseCurrencyCol")}</Th>}
                      {showCurrencyCols && <Th className="min-w-28 text-center">{t("vc.currencyValueCol")}</Th>}
                      {showCurrencyCols && <Th className="min-w-24 text-center">{t("vc.currencyRateCol")}</Th>}
                      <Th className="w-9 text-center" aria-label={t("vc.deleteRow")} />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const isSel = idx === footerRowIdx;
                      return (
                        <tr
                          key={row.key}
                          onClick={() => setSelectedRow(idx)}
                          className={cn("transition-colors", isSel ? "bg-primary/5" : "hover:bg-foreground/[0.03]")}
                        >
                          <Td className="text-center tabular-nums text-muted-foreground">{idx + 1}</Td>
                          <Td>
                            <MoeinPickerCell
                              meta={meta.moeinAccounts}
                              value={row.moeinRef}
                              onPick={(id) => pickMoein(idx, id)}
                              onPickMany={(ids) => pickMoeinMany(idx, ids)}
                              emptyLabel={t("vc.moeinNoData")}
                              phLabel={t("vc.selectPlaceholder")}
                              addLabel={t("vc.addSelected")}
                              selLabel={t("vc.selectedCount")}
                              codeLabel={t("vc.moeinPickCode")}
                              titleLabel={t("vc.moeinPickTitle")}
                              searchLabel={t("vc.moeinPickSearch")}
                            />
                          </Td>
                          {levelColumns.map((li) => {
                            const info = levelInfoOf(row.moeinRef, li);
                            const selId = row.details[li] ?? null;
                            const selDetail = selId != null ? detailById.get(selId) : undefined;
                            if (info.locked) {
                              return (
                                <Td key={li} className="bg-muted/30 text-center">
                                  <span
                                    role="img"
                                    aria-label={t("vc.colLocked")}
                                    title={t("vc.colLocked")}
                                    className="inline-flex text-muted-foreground/50"
                                  >
                                    <Lock className="h-3.5 w-3.5" aria-hidden />
                                  </span>
                                </Td>
                              );
                            }
                            return (
                              <Td key={li}>
                                <CellPicker
                                  ariaLabel={`${t("vc.detailCol").replace("{n}", String(li))} — ${t("vc.row")} ${idx + 1}`}
                                  display={selDetail ? selDetail.code : ""}
                                  placeholder={t("vc.selectPlaceholder")}
                                  filterPlaceholder={t("abar.listFilterPh")}
                                  emptyLabel={t("vc.detailEmpty")}
                                  columns={[
                                    { label: t("vc.colCode"), width: "w-16" },
                                    { label: t("vc.colTitle") },
                                    { label: t("vc.colDetailType") },
                                  ]}
                                  rows={meta.detailItems
                                    .filter((d) => info.typeRefs.includes(d.detailTypeRef))
                                    .map((d) => ({ id: d.id, cells: [d.code, d.title, d.typeTitle] }))}
                                  onPick={(id) => pickDetail(idx, li, id)}
                                />
                              </Td>
                            );
                          })}
                          <Td>
                            <Input
                              value={row.description}
                              onChange={(e) => setRow(idx, { description: e.target.value })}
                              aria-label={`${t("vc.description")} — ${t("vc.row")} ${idx + 1}`}
                              className="h-7 border-input/70 bg-background/70 text-xs"
                            />
                          </Td>
                          <Td>
                            <Input
                              value={row.debit}
                              onChange={(e) => {
                                const next = sanitizeAmount(e.target.value);
                                setRow(idx, { debit: next, credit: next ? "" : row.credit });
                              }}
                              aria-label={`${t("vc.debit")} — ${t("vc.row")} ${idx + 1}`}
                              dir="ltr"
                              placeholder="0"
                              className="h-7 border-input/70 bg-background/70 text-center text-xs tabular-nums"
                            />
                          </Td>
                          <Td>
                            <Input
                              value={row.credit}
                              onChange={(e) => {
                                const next = sanitizeAmount(e.target.value);
                                setRow(idx, { credit: next, debit: next ? "" : row.debit });
                              }}
                              aria-label={`${t("vc.credit")} — ${t("vc.row")} ${idx + 1}`}
                              dir="ltr"
                              placeholder="0"
                              className="h-7 border-input/70 bg-background/70 text-center text-xs tabular-nums"
                            />
                          </Td>
                          {showTrackCols && (
                            <Td>
                              <Input
                                value={row.trackDate}
                                onChange={(e) => setRow(idx, { trackDate: applyDateMask(e.target.value, false) })}
                                aria-label={`${t("vc.trackDate")} — ${t("vc.row")} ${idx + 1}`}
                                dir="ltr"
                                placeholder={trackMandatory ? "" : "____/__/__"}
                                className="h-7 border-input/70 bg-background/70 text-center text-xs tabular-nums"
                              />
                            </Td>
                          )}
                          {showTrackCols && (
                            <Td>
                              <Input
                                value={row.trackNumber}
                                onChange={(e) => setRow(idx, { trackNumber: e.target.value })}
                                aria-label={`${t("vc.trackNumber")} — ${t("vc.row")} ${idx + 1}`}
                                className="h-7 border-input/70 bg-background/70 text-xs"
                              />
                            </Td>
                          )}
                          {showCurrencyCols && (
                            <Td>
                              <CellPicker
                                ariaLabel={`${t("vc.baseCurrencyCol")} — ${t("vc.row")} ${idx + 1}`}
                                display={
                                  row.currencyRef != null
                                    ? (() => {
                                        const c = currencyById.get(row.currencyRef);
                                        return c ? `${c.code} - ${c.title}` : "";
                                      })()
                                    : ""
                                }
                                placeholder={t("vc.selectPlaceholder")}
                                filterPlaceholder={t("abar.listFilterPh")}
                                emptyLabel={t("vc.currencyEmpty")}
                                columns={[
                                  { label: t("vc.colCode"), width: "w-16" },
                                  { label: t("vc.colTitle") },
                                  { label: t("vc.colLatin") },
                                ]}
                                rows={currencyRows}
                                onPick={(id) => setRow(idx, { currencyRef: id })}
                              />
                            </Td>
                          )}
                          {showCurrencyCols && (
                            <Td>
                              <Input
                                value={row.currencyValue}
                                onChange={(e) => setRow(idx, { currencyValue: sanitizeAmount(e.target.value) })}
                                aria-label={`${t("vc.currencyValueCol")} — ${t("vc.row")} ${idx + 1}`}
                                dir="ltr"
                                placeholder="0"
                                className="h-7 border-input/70 bg-background/70 text-center text-xs tabular-nums"
                              />
                            </Td>
                          )}
                          {showCurrencyCols && (
                            <Td>
                              <Input
                                value={row.currencyRate}
                                onChange={(e) => setRow(idx, { currencyRate: sanitizeAmount(e.target.value) })}
                                aria-label={`${t("vc.currencyRateCol")} — ${t("vc.row")} ${idx + 1}`}
                                dir="ltr"
                                placeholder="0"
                                className="h-7 border-input/70 bg-background/70 text-center text-xs tabular-nums"
                              />
                            </Td>
                          )}
                          <Td className="text-center">
                            <button
                              type="button"
                              aria-label={`${t("vc.deleteRow")} — ${t("vc.row")} ${idx + 1}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRow(idx);
                              }}
                              className="mx-auto flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ----- مدل فرمی: کارت تک‌ردیف با ناوبری (مناسب موبایل) ----- */
              /* Task 161 (اصلاح E2E): wrapper فلکسی + اسکرول داخلی گرید — همان معماری گرید جدولی؛
                 وگرنه در نماهای کم‌ارتفاع (موبایل) کارت اقلام با min-h-36 فشرده و محتوا روی فوتر می‌ریزد */
              <div className="flex min-h-0 flex-1 flex-col p-3">
                <div className="mb-2 flex shrink-0 flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground/80">
                    {t("vc.rowOf").replace("{i}", String(formIdx + 1)).replace("{n}", String(rows.length))}
                  </span>
                  <div className="ms-auto flex items-center gap-1">
                    <SmallTool label={t("sft.first")} onClick={() => setFormRow(0)} Icon={ChevronFirst} disabled={formIdx === 0} />
                    <SmallTool
                      label={t("vc.prevRow")}
                      onClick={() => setFormRow(Math.max(0, formIdx - 1))}
                      Icon={ChevronUp}
                      disabled={formIdx === 0}
                    />
                    <SmallTool
                      label={t("vc.nextRow")}
                      onClick={() => setFormRow(Math.min(rows.length - 1, formIdx + 1))}
                      Icon={ChevronDown}
                      disabled={formIdx >= rows.length - 1}
                    />
                    <SmallTool label={t("sft.last")} onClick={() => setFormRow(rows.length - 1)} Icon={ChevronLast} disabled={formIdx >= rows.length - 1} />
                    <SmallTool
                      label={t("vc.addRow")}
                      onClick={() => {
                        setRows((prev) => [...prev, blankRow()]);
                        setFormRow(rows.length);
                        setSelectedRow(rows.length);
                        markDirty();
                      }}
                      Icon={Plus}
                    />
                    <SmallTool label={t("vc.deleteRow")} onClick={() => deleteRow(formIdx)} Icon={X} danger />
                  </div>
                </div>
                <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-border/60 bg-background/50 p-3 scrollbar-slim sm:grid-cols-2 lg:grid-cols-3">
                  {/* Task 161 (فرمان مالک): در حالت فرمی عرض فیلدهای معین/تفصیلی‌ها/بدهکار/بستانکار/تاریخ و شماره پیگیری ۶۰٪ کم شده —
                      max-w-[40%] روی خودِ کنترل نسبت به پهنای فعلی (wrapper های flex-1)؛ شرح و ستون‌های ارز دست‌نخورده */}
                  <HeaderField label={t("vc.moeinCode")} required>
                    <MoeinPickerCell
                      className="max-w-[40%]"
                      meta={meta.moeinAccounts}
                      value={formRowData?.moeinRef ?? null}
                      onPick={(id) => {
                        pickMoein(formIdx, id);
                        setSelectedRow(formIdx);
                      }}
                      onPickMany={(ids) => pickMoeinMany(formIdx, ids)}
                      emptyLabel={t("vc.moeinNoData")}
                      phLabel={t("vc.selectPlaceholder")}
                      addLabel={t("vc.addSelected")}
                      selLabel={t("vc.selectedCount")}
                      codeLabel={t("vc.moeinPickCode")}
                      titleLabel={t("vc.moeinPickTitle")}
                      searchLabel={t("vc.moeinPickSearch")}
                    />
                  </HeaderField>
                  {levelColumns.map((li) => {
                    const info = levelInfoOf(formRowData?.moeinRef ?? null, li);
                    const selId = formRowData?.details[li] ?? null;
                    const selDetail = selId != null ? detailById.get(selId) : undefined;
                    return info.locked ? (
                      <HeaderField key={li} label={t("vc.detailCol").replace("{n}", String(li))}>
                        <span
                          className="flex h-7 max-w-[40%] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-muted-foreground/50"
                          role="img"
                          aria-label={t("vc.colLocked")}
                          title={t("vc.colLocked")}
                        >
                          <Lock className="h-3.5 w-3.5" aria-hidden />
                        </span>
                      </HeaderField>
                    ) : (
                      <HeaderField key={li} label={t("vc.detailCol").replace("{n}", String(li))}>
                        <CellPicker
                          className="max-w-[40%]"
                          ariaLabel={`${t("vc.detailCol").replace("{n}", String(li))} — ${t("vc.row")} ${formIdx + 1}`}
                          display={selDetail ? `${selDetail.code} - ${selDetail.title}` : ""}
                          placeholder={t("vc.selectPlaceholder")}
                          filterPlaceholder={t("abar.listFilterPh")}
                          emptyLabel={t("vc.detailEmpty")}
                          columns={[
                            { label: t("vc.colCode"), width: "w-16" },
                            { label: t("vc.colTitle") },
                            { label: t("vc.colDetailType") },
                          ]}
                          rows={meta.detailItems
                            .filter((d) => info.typeRefs.includes(d.detailTypeRef))
                            .map((d) => ({ id: d.id, cells: [d.code, d.title, d.typeTitle] }))}
                          onPick={(id) => {
                            pickDetail(formIdx, li, id);
                            setSelectedRow(formIdx);
                          }}
                        />
                      </HeaderField>
                    );
                  })}
                  <HeaderField label={t("vc.description")} required className="sm:col-span-2 lg:col-span-3">
                    <Textarea
                      value={formRowData?.description ?? ""}
                      onChange={(e) => setRow(formIdx, { description: e.target.value })}
                      aria-label={`${t("vc.description")} — ${t("vc.row")} ${formIdx + 1}`}
                      rows={2}
                      className="resize-none text-xs"
                    />
                  </HeaderField>
                  <HeaderField label={t("vc.debit")}>
                    <Input
                      value={formRowData?.debit ?? ""}
                      onChange={(e) => {
                        const next = sanitizeAmount(e.target.value);
                        setRow(formIdx, { debit: next, credit: next ? "" : (formRowData?.credit ?? "") });
                      }}
                      aria-label={`${t("vc.debit")} — ${t("vc.row")} ${formIdx + 1}`}
                      dir="ltr"
                      placeholder="0"
                      className="h-7 max-w-[40%] text-center text-xs tabular-nums"
                    />
                  </HeaderField>
                  <HeaderField label={t("vc.credit")}>
                    <Input
                      value={formRowData?.credit ?? ""}
                      onChange={(e) => {
                        const next = sanitizeAmount(e.target.value);
                        setRow(formIdx, { credit: next, debit: next ? "" : (formRowData?.debit ?? "") });
                      }}
                      aria-label={`${t("vc.credit")} — ${t("vc.row")} ${formIdx + 1}`}
                      dir="ltr"
                      placeholder="0"
                      className="h-7 max-w-[40%] text-center text-xs tabular-nums"
                    />
                  </HeaderField>
                  {showTrackCols && (
                    <>
                      <HeaderField label={t("vc.trackDate")}>
                        <Input
                          value={formRowData?.trackDate ?? ""}
                          onChange={(e) => setRow(formIdx, { trackDate: applyDateMask(e.target.value, false) })}
                          aria-label={`${t("vc.trackDate")} — ${t("vc.row")} ${formIdx + 1}`}
                          dir="ltr"
                          placeholder="____/__/__"
                          className="h-7 max-w-[40%] text-center text-xs tabular-nums"
                        />
                      </HeaderField>
                      <HeaderField label={t("vc.trackNumber")}>
                        <Input
                          value={formRowData?.trackNumber ?? ""}
                          onChange={(e) => setRow(formIdx, { trackNumber: e.target.value })}
                          aria-label={`${t("vc.trackNumber")} — ${t("vc.row")} ${formIdx + 1}`}
                          className="h-7 max-w-[40%] text-xs"
                        />
                      </HeaderField>
                    </>
                  )}
                  {showCurrencyCols && (
                    <>
                      <HeaderField label={t("vc.baseCurrencyCol")}>
                        <CellPicker
                          ariaLabel={`${t("vc.baseCurrencyCol")} — ${t("vc.row")} ${formIdx + 1}`}
                          display={
                            formRowData?.currencyRef != null
                              ? (() => {
                                  const c = currencyById.get(formRowData.currencyRef);
                                  return c ? `${c.code} - ${c.title}` : "";
                                })()
                              : ""
                          }
                          placeholder={t("vc.selectPlaceholder")}
                          filterPlaceholder={t("abar.listFilterPh")}
                          emptyLabel={t("vc.currencyEmpty")}
                          columns={[
                            { label: t("vc.colCode"), width: "w-16" },
                            { label: t("vc.colTitle") },
                            { label: t("vc.colLatin") },
                          ]}
                          rows={currencyRows}
                          onPick={(id) => setRow(formIdx, { currencyRef: id })}
                        />
                      </HeaderField>
                      <HeaderField label={t("vc.currencyValueCol")}>
                        <Input
                          value={formRowData?.currencyValue ?? ""}
                          onChange={(e) => setRow(formIdx, { currencyValue: sanitizeAmount(e.target.value) })}
                          aria-label={`${t("vc.currencyValueCol")} — ${t("vc.row")} ${formIdx + 1}`}
                          dir="ltr"
                          placeholder="0"
                          className="h-7 text-center text-xs tabular-nums"
                        />
                      </HeaderField>
                      <HeaderField label={t("vc.currencyRateCol")}>
                        <Input
                          value={formRowData?.currencyRate ?? ""}
                          onChange={(e) => setRow(formIdx, { currencyRate: sanitizeAmount(e.target.value) })}
                          aria-label={`${t("vc.currencyRateCol")} — ${t("vc.row")} ${formIdx + 1}`}
                          dir="ltr"
                          placeholder="0"
                          className="h-7 text-center text-xs tabular-nums"
                        />
                      </HeaderField>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRows((prev) => [...prev, blankRow()]);
                    setFormRow(rows.length);
                    setSelectedRow(rows.length);
                    markDirty();
                  }}
                  className="mt-2 flex h-8 shrink-0 items-center gap-1.5 self-start rounded-lg border border-dashed border-emerald-500/50 px-3 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  {t("vc.addRow")}
                </button>
              </div>
            )}
          </div>

          {/* ---------- بخش فوتر سند ---------- */}
          {/* Task 159: فوتر فشرده — راست حداکثر ۳ ردیف با اسکرول عمودی، بقیهٔ ارتفاع به اقلام می‌رسد */}
          <div className="mt-3 grid shrink-0 grid-cols-1 gap-3 rounded-2xl border border-border/70 bg-card shadow-sm lg:grid-cols-2">
            {/* راست فوتر — فقط نمایش (زنجیرهٔ حساب ردیف انتخاب‌شده) */}
            <div className="border-border/50 p-3 lg:border-e">
              <div className="mb-2 flex items-center gap-2">
                <Inbox className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                <h4 className="text-xs font-bold text-foreground/90">{t("vc.footerAccounts")}</h4>
              </div>
              {/* بیش از ۳ ردیف ⇒ اسکرول عمودی (max-h-24 = دقیقاً ۳ ردیف ۲۸px + ۲ فاصله ۶px) */}
              <div
                tabIndex={0}
                aria-label={t("vc.footerAccounts")}
                className="grid max-h-24 grid-cols-1 gap-x-4 gap-y-1.5 overflow-y-auto pe-1 scrollbar-slim sm:grid-cols-2"
              >
                <FooterReadonly label={t("vc.footerGroup")} value={footerMoein ? `${footerMoein.groupCode} - ${footerMoein.groupTitle}` : ""} />
                <FooterReadonly label={t("vc.footerLedger")} value={footerMoein ? `${footerMoein.ledgerCode} - ${footerMoein.ledgerTitle}` : ""} />
                <FooterReadonly
                  label={t("vc.footerMoein")}
                  value={footerMoein ? `${footerMoein.code} - ${footerMoein.title}` : ""}
                />
                {levelColumns.map((li) => {
                  const selId = footerRow?.details[li] ?? null;
                  const d = selId != null ? detailById.get(selId) : undefined;
                  return (
                    <FooterReadonly
                      key={li}
                      label={t("vc.footerDetailTitle").replace("{n}", String(li))}
                      value={d ? `${d.code} - ${d.title}` : ""}
                    />
                  );
                })}
              </div>
            </div>
            {/* چپ فوتر — محاسبات خودکار */}
            <div className="p-3">
              <div className="mb-2 flex items-center gap-2">
                <CalculatorIcon />
                <h4 className="text-xs font-bold text-foreground/90">{t("vc.footerTotals")}</h4>
                <span
                  className={cn(
                    "ms-auto rounded-full px-2 py-0.5 text-[10px] font-medium",
                    totals.balanced ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-500",
                  )}
                  aria-live="polite"
                >
                  {totals.balanced ? t("vc.balanceOk") : t("vc.balanceDiff")}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <TotalCell label={t("vc.totalDebit")} value={formatAmount(totals.totalDebit, locale)} tone="debit" />
                <TotalCell label={t("vc.totalCredit")} value={formatAmount(totals.totalCredit, locale)} tone="credit" />
                <TotalCell label={t("vc.balanceDebit")} value={formatAmount(totals.balanceDebit, locale)} tone="debit" />
                <TotalCell label={t("vc.balanceCredit")} value={formatAmount(totals.balanceCredit, locale)} tone="credit" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setRows((prev) => [...prev, blankRow()]);
                  setSelectedRow(rows.length);
                  markDirty();
                }}
                className="mt-3 flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-emerald-500/50 px-3 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                {t("vc.addRow")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------- small helpers ------------------------------- */

function Th({ className, children, ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "sticky top-0 z-10 border-b border-border/70 bg-muted/95 px-2 py-1.5 text-start font-semibold text-foreground/85 backdrop-blur",
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

function Td({ className, children, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("border-b border-border/40 px-1.5 py-1 align-middle", className)} {...rest}>
      {children}
    </td>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors cursor-pointer",
        active ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:bg-foreground/5",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function SmallTool({
  label,
  onClick,
  Icon,
  disabled,
  danger,
}: {
  label: string;
  onClick: () => void;
  Icon: React.ElementType;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md border border-border/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer",
        danger ? "text-rose-600 hover:bg-rose-500/10" : "text-foreground/70 hover:bg-foreground/5",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

function NavGlyph({
  label,
  onClick,
  Icon,
}: {
  label: string;
  onClick: () => void;
  Icon: React.ElementType;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

function FooterReadonly({ label, value }: { label: string; value: string }) {
  return (
    /* h-7 ثابت ⇒ ارتفاع هر ردیف دقیقاً ۲۸px برای محاسبهٔ سقف ۳ ردیفی فوتر (Task 159) */
    <div className="flex h-7 shrink-0 items-center gap-1.5">
      <span className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground">{label}:</span>
      <span className="min-w-0 flex-1 truncate rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-[11px] text-foreground/80">
        {value || "—"}
      </span>
    </div>
  );
}

function CircleAlertIcon() {
  return <CircleAlert className="h-6 w-6 text-rose-500" aria-hidden />;
}

function CalculatorIcon() {
  return <Calculator className="h-3.5 w-3.5 text-amber-600" aria-hidden />;
}
