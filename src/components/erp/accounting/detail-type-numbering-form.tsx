"use client";

import * as React from "react";
import { ListOrdered, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useT } from "@/stores/settings-store";
import {
  useOrgScope,
  useOrgContext,
} from "@/stores/org-context-store";
import { useTabDirty } from "@/components/desktop/app-window";
import {
  MainDataGrid,
  GridActionButton,
  type MainGridColumn,
  type MainGridRow,
} from "@/components/erp/form-builder/main-data-grid";
import { cn } from "@/lib/utils";

/**
 * DetailTypeNumberingForm — Task 131 (درخواست مالک): فرم «شماره گذاری
 * تفصیلی ها» در نرم‌افزار «حسابداری» ← زیرمنوی «اطلاعات پایه» با کامپوننت
 * MainDataGrid — عین تصویر مالک: شش ستون
 *   کد | عنوان تفصیل | خودکار | شرکت | شماره شروع | شماره پایان
 *
 * قواعد مالک که این فرم پیاده‌شان می‌کند:
 *   ۱. هر نوع تفصیلی که در «نوع تفصیل جدید» (Task 120) ثبت شود به‌صورت
 *      خودکار همین‌جا دیده می‌شود (سرور ردیفش را خودکار می‌سازد؛ این فرم
 *      هم رویداد erp:records-changed و هم بازخوانی دستی دارد) و بازهٔ
 *      شماره شروع/پایان‌اش خودکار تخصیص می‌یابد (پیوستهٔ ۱۰۰۰تایی).
 *   ۲. شماره‌ها نباید با تفصیل‌های دیگر تداخل کنند — کنترل دولایه:
 *      فرانت پیش از ارسال و سرور روی هر PUT (۴۰۹ پیام فارسی).
 *   ۳. ستون‌های «خودکار» و «شرکت» چک‌باکس‌اند (پیش‌فرض تصویر: تیک/خالی).
 *
 * ویرایش درجریان است: شماره شروع/پایان و چک‌باکس‌ها مستقیم در سلول ویرایش
 * و با دکمهٔ «ذخیره» (نوار پایینِ گرید — عین آیکون ذخیرهٔ تصویر مالک) همهٔ
 * ردیف‌های تغییرکرده یکجا PUT می‌شوند؛ کد/عنوان فقط‌خواندنی‌اند (مالکِ
 * آن‌ها فرم نوع تفصیل است). Task 82 — فلگ برگهٔ کثیف.
 */

interface NumberingDto {
  id: number;
  detailTypeRef: number;
  code: string;
  title: string;
  startNumber: number;
  endNumber: number;
  isAutomatic: boolean;
  isCompany: boolean;
  structureId: number;
}

interface EditableRow {
  id: number;
  code: string;
  title: string;
  start: string;
  end: string;
  aut: boolean;
  comp: boolean;
}

/** تبدیل ارقام فارسی/عربی به لاتین (هم‌سو با نرمال‌سازی سرور) */
const toLatinDigits = (s: string): string =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

export function DetailTypeNumberingForm() {
  const t = useT();
  /* Task 122 — دامنهٔ گرهٔ فعالِ انتخاب‌گر سازمانی (قرارداد واحد اشتراک) */
  const { scope, loaded: orgLoaded } = useOrgScope();
  const orgTree = useOrgContext((s) => s.tree);
  const activeNode = React.useMemo(
    () =>
      orgTree.find((n) => Number(n.id) === (scope.businessStructureRef ?? -1)) ?? null,
    [orgTree, scope.businessStructureRef],
  );

  const [rows, setRows] = React.useState<EditableRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [gridSelectedId, setGridSelectedId] = React.useState<string | null>(null);

  /* ردیف‌های تغییرکرده (هنوز ذخیره‌نشده) + Task 82 — فلگ برگه */
  const [dirtyIds, setDirtyIds] = React.useState<ReadonlySet<number>>(new Set());
  const dirty = dirtyIds.size > 0;
  useTabDirty(dirty);

  const fetchRows = React.useCallback(async (): Promise<NumberingDto[]> => {
    /* تا آماده‌شدن درخت سازمان چیزی نمی‌گیریم (الگوی Task 122) */
    if (!orgLoaded) return [];
    const qs = new URLSearchParams();
    if (scope.businessStructureRef != null) {
      qs.set("structureId", String(scope.businessStructureRef));
      qs.set("headOfficeShares", scope.shared ? "true" : "false");
    }
    const res = await api.get<{ items?: NumberingDto[] }>(
      `detail-type-numbering${qs.size ? `?${qs.toString()}` : ""}`,
    );
    return res.items ?? [];
  }, [orgLoaded, scope.businessStructureRef, scope.shared]);

  const applyDtos = React.useCallback((dtos: NumberingDto[]) => {
    setRows(
      dtos.map((r) => ({
        id: r.id,
        code: r.code,
        title: r.title,
        start: String(r.startNumber),
        end: String(r.endNumber),
        aut: r.isAutomatic,
        comp: r.isCompany,
      })),
    );
    setDirtyIds(new Set()); // مقادیر سرور ملاک‌اند
    setLoading(false);
  }, []);

  const refetch = React.useCallback(async () => {
    try {
      applyDtos(await fetchRows());
    } catch {
      applyDtos([]);
    }
  }, [fetchRows, applyDtos]);

  React.useEffect(() => {
    let alive = true;
    fetchRows().then(
      (dtos) => alive && applyDtos(dtos),
      () => alive && applyDtos([]),
    );
    return () => {
      alive = false;
    };
  }, [fetchRows, applyDtos]);

  /* §5.6 — وقتی نوع تفصیل ثبت/حذف می‌شود، فهرست شماره‌گذاری زنده تازه شود */
  React.useEffect(() => {
    const onRecordsChanged = (e: Event): void => {
      const entity = (e as CustomEvent<{ entity?: string }>).detail?.entity;
      if (entity === "detail-type") void refetch();
    };
    window.addEventListener("erp:records-changed", onRecordsChanged);
    return () => window.removeEventListener("erp:records-changed", onRecordsChanged);
  }, [refetch]);

  const patchRow = React.useCallback(
    (id: number, patch: Partial<Pick<EditableRow, "start" | "end" | "aut" | "comp">>) => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      setDirtyIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    },
    [],
  );

  /* ورودی‌های عددی: ارقام فارسی/عربی → لاتین، فقط رقم */
  const onNumberInput = React.useCallback(
    (id: number, field: "start" | "end", raw: string) => {
      const latin = toLatinDigits(raw).replace(/[^\d]/g, "").slice(0, 12);
      patchRow(id, { [field]: latin } as Partial<EditableRow>);
    },
    [patchRow],
  );

  /* ذخیرهٔ همهٔ ردیف‌های تغییرکرده — زنجیرهٔ اعتبارسنجی فرانت، هم‌سو با سرور */
  const doSave = React.useCallback(async () => {
    if (saving) return;
    const changed = rows.filter((r) => dirtyIds.has(r.id));
    if (changed.length === 0) {
      toast.info(t("dtn.noChanges"));
      return;
    }
    for (const r of changed) {
      if (r.start.trim() === "" || r.end.trim() === "") {
        toast.error(t("dtn.errInvalid"));
        return;
      }
      const s = Number(r.start);
      const e = Number(r.end);
      if (!Number.isSafeInteger(s) || !Number.isSafeInteger(e) || s < 1 || e < 1) {
        toast.error(t("dtn.errInvalid"));
        return;
      }
      if (s > e) {
        toast.error(t("dtn.errOrder"));
        return;
      }
    }
    setSaving(true);
    try {
      for (const r of changed) {
        await api.put(`detail-type-numbering/${r.id}`, {
          startNumber: Number(r.start),
          endNumber: Number(r.end),
          isAutomatic: r.aut,
          isCompany: r.comp,
        });
      }
      toast.success(t("abar.savedToast"));
      await refetch();
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      toast.error(msg);
      await refetch(); // مقادیر سرور ملاک‌اند (۴۰۹ تداخل و…)
    } finally {
      setSaving(false);
    }
  }, [rows, dirtyIds, saving, t, refetch]);

  /* ---- MainDataGrid — عین تصویر مالک (شش ستون؛ ویرایش درجریان) ---- */
  const gridRows = React.useMemo<MainGridRow[]>(
    () =>
      rows.map((r) => ({
        __id: String(r.id),
        code: r.code,
        title: r.title,
        aut: r.aut,
        comp: r.comp,
        start: r.start,
        end: r.end,
      })),
    [rows],
  );

  const yesNo = (v: boolean) => (v ? t("abar.listYes") : t("abar.listNo"));

  const checkboxCell = (
    row: MainGridRow,
    field: "aut" | "comp",
    label: string,
  ): React.ReactNode => (
    <input
      type="checkbox"
      aria-label={`${label} — ${String(row.code)}`}
      checked={Boolean(row[field])}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => patchRow(Number(row.__id), { [field]: e.target.checked })}
      className="h-4 w-4 cursor-pointer accent-primary"
    />
  );

  const numberCell = (
    row: MainGridRow,
    field: "start" | "end",
    label: string,
  ): React.ReactNode => (
    <input
      dir="ltr"
      inputMode="numeric"
      aria-label={`${label} — ${String(row.code)}`}
      value={String(row[field] ?? "")}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onNumberInput(Number(row.__id), field, e.target.value)}
      className={cn(
        "h-7 w-full min-w-0 rounded-md border bg-background/80 px-2 text-center text-xs tabular-nums outline-none",
        "focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors",
      )}
    />
  );

  const gridColumns = React.useMemo<MainGridColumn[]>(
    () => [
      { key: "code", label: t("dtn.code"), width: 90, align: "center" },
      { key: "title", label: t("dtn.title"), width: 220 },
      {
        key: "aut",
        label: t("dtn.automatic"),
        width: 100,
        align: "center",
        value: (row) => yesNo(Boolean(row.aut)),
        render: (row) => checkboxCell(row, "aut", t("dtn.automatic")),
      },
      {
        key: "comp",
        label: t("dtn.company"),
        width: 100,
        align: "center",
        value: (row) => yesNo(Boolean(row.comp)),
        render: (row) => checkboxCell(row, "comp", t("dtn.company")),
      },
      {
        key: "start",
        label: t("dtn.startNumber"),
        width: 150,
        align: "center",
        value: (row) => String(row.start ?? ""),
        render: (row) => numberCell(row, "start", t("dtn.startNumber")),
      },
      {
        key: "end",
        label: t("dtn.endNumber"),
        width: 150,
        align: "center",
        value: (row) => String(row.end ?? ""),
        render: (row) => numberCell(row, "end", t("dtn.endNumber")),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, rows, patchRow, onNumberInput],
  );

  return (
    <section aria-label={t("dtn.formTitle")} className="flex flex-col gap-3">
      {/* سربرگ فرم — عنوان + راهنما + گرهٔ سازمانی فعال */}
      <div className="flex flex-wrap items-center gap-2">
        <ListOrdered className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h3 className="text-xs font-semibold text-muted-foreground">{t("dtn.listTitle")}</h3>
        {activeNode && (
          <span
            className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-400"
            title={activeNode.title}
          >
            {activeNode.title}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground/70">{t("dtn.hint")}</span>
      </div>

      <MainDataGrid
        columns={gridColumns}
        rows={gridRows}
        loading={loading}
        selectedId={gridSelectedId}
        onSelectedIdChange={setGridSelectedId}
        csvFileName="detail-type-numbering"
        className="max-h-[60vh] min-h-[280px]"
        actions={
          <>
            <GridActionButton
              icon={Save}
              label={t("abar.save")}
              tint="emerald"
              disabled={saving || !dirty}
              onClick={() => void doSave()}
            />
            <GridActionButton
              icon={RefreshCw}
              label={t("abar.listRefresh")}
              tint="violet"
              onClick={() => void refetch()}
            />
          </>
        }
      />
    </section>
  );
}
