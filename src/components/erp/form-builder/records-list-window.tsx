"use client";

import * as React from "react";
import { FilePlus2, Keyboard, Languages, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import {
  fetchFormDetail, loadFormData, dfbFormTitle, dfbFieldLabel, dfbApi, isDfbInputField,
  type DfbFormDetail,
} from "@/stores/dfb-store";
import {
  dfbTransKey, useDfbTrMap, useDfbTranslations,
} from "@/stores/dfb-translations";
import {
  MainDataGrid, GridActionButton, type MainGridColumn, type MainGridRow,
} from "./main-data-grid";
import { ConfirmDeleteDialog } from "@/components/forms/action-bar";
import { DfbTranslationsBody } from "./field-translations";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { LOCALES, type Locale } from "@/i18n/config";

/**
 * RecordsListWindow (Task 64 — owner request «فهرست کلّی») — the form's
 * record list window rendered with MainDataGrid: one column per input field
 * (+ کد), the classic per-column operator filters, and the bottom action bar
 * (افزودن رکورد → opens the entry form · حذف رکورد (§0.8 confirm) ·
 * بازخوانی · ترجمه (Task 70) · CSV export). The live record count rides the
 * window title («فهرست کلّی خدمات (3)») via desktop-store.setWindowTitle.
 *
 * Task 70 — دکمهٔ «ترجمه» با دو حالت:
 *   · ترجمهٔ خودکار (آنلاین): فیلدهای متنی رکورد انتخاب‌شده با یک فراخوانی LLM
 *     به همهٔ زبان‌های فعال ترجمه و در DfbTranslation (Value) ذخیره می‌شود.
 *   · ورود دستی (آفلاین): دیالوگ ترجمهٔ رکورد — پنل زبان برای هر فیلد متنی.
 * نمایش: ستون‌های متنی گرید با زنجیرهٔ جایگزینی (ترجمهٔ زبان فعلی → مقدار اصلی) رندر می‌شوند.
 */
export function RecordsListWindow({ formId }: { formId: number }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const activeLocales = useSettings((s) => s.activeLocales);
  const trMap = useDfbTrMap(); // Task 68

  const [detail, setDetail] = React.useState<DfbFormDetail | null>(null);
  const [rows, setRows] = React.useState<MainGridRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  /* Task 70 */
  const [translating, setTranslating] = React.useState(false);
  const [offlineOpen, setOfflineOpen] = React.useState(false);

  /* زبان‌های مقصد ترجمهٔ خودکار = زبان‌های فعال منهای fa (زبان پایه) */
  const targetLangs = React.useMemo(
    () => (LOCALES as Locale[]).filter((l) => l !== "fa" && activeLocales.includes(l)),
    [activeLocales],
  );

  const fetchRows = React.useCallback(async () => {
    const d = await fetchFormDetail(formId);
    const items = await loadFormData(formId);
    return { d, items } as const;
  }, [formId]);

  const applyRows = React.useCallback(
    (d: DfbFormDetail, items: Awaited<ReturnType<typeof loadFormData>>) => {
      const yes = t("dfb.list.yes");
      setDetail(d);
      setRows(
        items.map((it) => {
          const row: MainGridRow = { __id: String(it.dataId), __code: String(it.dataId) };
          for (const v of it.values) {
            const f = d.fields.find((x) => x.id === v.fieldRef);
            if (!f) continue;
            row[String(v.fieldRef)] =
              f.fieldType === "checkbox" ? (v.value === "1" ? yes : "") : (v.value ?? "");
          }
          return row;
        }),
      );
      setLoading(false);
      setBusy(false);
    },
    [t],
  );

  React.useEffect(() => {
    let alive = true;
    fetchRows()
      .then((r) => {
        if (alive) applyRows(r.d, r.items);
      })
      .catch(() => {
        if (alive) {
          setRows([]);
          setLoading(false);
          setBusy(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [fetchRows, applyRows]);

  const refresh = React.useCallback(() => {
    setBusy(true);
    fetchRows()
      .then((r) => applyRows(r.d, r.items))
      .catch(() => {
        setRows([]);
        setBusy(false);
        toast.error(t("common.error"));
      });
  }, [fetchRows, applyRows, t]);

  /* live title: «فهرست کلّی {form} ({count})» — the classic ERP list title */
  React.useEffect(() => {
    const win = useDesktop
      .getState()
      .windows.find((w) => w.kind === "dfb-list" && w.appKey === String(formId));
    if (!win) return;
    const label = detail ? dfbFormTitle(detail, locale, trMap) : "";
    useDesktop
      .getState()
      .setWindowTitle(win.id, `${t("dfb.list.title")} ${label} (${rows.length})`.trim());
  }, [detail, rows.length, t, locale, formId, trMap]);

  const columns = React.useMemo<MainGridColumn[]>(() => {
    const cols: MainGridColumn[] = [
      {
        key: "__code",
        label: t("dfb.list.code"),
        width: 90,
        render: (row) => <span className="font-mono text-[11px]" dir="ltr">{String(row.__code ?? "")}</span>,
      },
    ];
    if (detail) {
      for (const f of [...detail.fields]
        .filter((x) => isDfbInputField(x.fieldType))
        .sort((a, b) => a.orderIndex - b.orderIndex)) {
        const isTextual = f.fieldType === "text" || f.fieldType === "textarea";
        cols.push({
          key: String(f.id),
          label: dfbFieldLabel(f, locale, trMap), // Task 68
          width: 170,
          /* Task 70 — ستون‌های متنی: ترجمهٔ زبان فعلی (Value:dataId:fieldKey)
             با جایگزینی به مقدار اصلی؛ ارجاع به trMap زنده است تا تغییر زبان
             بدون واکشی مجدد رکوردها رندر را تازه کند */
          ...(isTextual
            ? {
                render: (row: MainGridRow) => {
                  const base = String(row[String(f.id)] ?? "");
                  const tr = trMap?.[dfbTransKey("Value", Number(row.__id), f.fieldKey)];
                  return tr && tr.trim() ? tr : base;
                },
              }
            : {}),
        });
      }
    }
    return cols;
  }, [detail, t, locale, trMap]);

  const doDelete = React.useCallback(async () => {
    if (!selectedId) return;
    try {
      await dfbApi.del(`forms/${formId}/data/${Number(selectedId)}`);
      toast.success(t("dfb.list.deletedToast"));
      setSelectedId(null);
      refresh();
    } catch {
      toast.error(t("common.error"));
    }
  }, [selectedId, formId, t, refresh]);

  /* Task 70 — ترجمهٔ خودکار (آنلاین): فیلدهای متنی رکورد انتخاب‌شده با یک
     فراخوانی LLM به همهٔ زبان‌های فعال ترجمه و پس از موفقیت، نقشهٔ کش
     کلاینت یک‌بار از سرور بازخوانی می‌شود (نمایش فوری در گرید) */
  const translateOnline = React.useCallback(async () => {
    if (!selectedId) {
      toast.info(t("dfb.noRecordSelected"));
      return;
    }
    if (targetLangs.length === 0) {
      toast.info(t("settings.activeLangs"));
      return;
    }
    setTranslating(true);
    try {
      const res = await fetch("/api/dfb-translations/auto-translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ formId, dataId: Number(selectedId), langs: targetLangs }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || t("common.error"));
      }
      await useDfbTranslations.getState().load(); // بازخوانی نقشهٔ ترجمه (ردیف‌های Value تازه)
      toast.success(t("dfb.list.translateDone"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setTranslating(false);
    }
  }, [selectedId, formId, targetLangs, t]);

  /* پایهٔ فیلدهای متنی رکورد انتخاب‌شده برای دیالوگ آفلاین */
  const selectedRow = React.useMemo(
    () => rows.find((r) => r.__id === selectedId) ?? null,
    [rows, selectedId],
  );
  const textualFields = React.useMemo(
    () =>
      (detail?.fields ?? [])
        .filter((f) => f.fieldType === "text" || f.fieldType === "textarea")
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [detail],
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-3">
      <MainDataGrid
        columns={columns}
        rows={rows}
        loading={loading}
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
        onRowDoubleClick={() => useDesktop.getState().openWindow("dfb-form", String(formId))}
        csvFileName={detail ? `list-${detail.code || detail.id}` : "list"}
        className="min-h-0 flex-1"
        actions={
          <>
            <GridActionButton
              icon={FilePlus2}
              tint="emerald"
              label={t("dfb.list.addRecord")}
              onClick={() => useDesktop.getState().openWindow("dfb-form", String(formId))}
            />
            <GridActionButton
              icon={Trash2}
              tint="rose"
              label={t("dfb.list.deleteRecord")}
              disabled={!selectedId || busy}
              onClick={() => setConfirmDelete(true)}
            />
            <GridActionButton
              icon={RefreshCw}
              tint="teal"
              label={t("dfb.list.refresh")}
              disabled={busy}
              onClick={refresh}
            />
            {/* Task 70 — دکمهٔ ترجمه: آنلاین (خودکار) / آفلاین (دستی) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <GridActionButton
                  icon={Languages}
                  tint="violet"
                  label={t("dfb.list.translate")}
                  disabled={busy || translating}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem
                  disabled={!selectedId || translating}
                  onClick={translateOnline}
                >
                  <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  <span className="flex flex-col">
                    <span>{t("dfb.list.translateOnline")}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {targetLangs.length} {t("dfb.list.translateLangsHint")}
                    </span>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!selectedId || translating}
                  onClick={() => setOfflineOpen(true)}
                >
                  <Keyboard className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="flex flex-col">
                    <span>{t("dfb.list.translateOffline")}</span>
                    <span className="text-[10px] text-muted-foreground">{t("dfb.list.translateOfflineHint")}</span>
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />
      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("dfb.list.deleteRecord")}
        body={t("dfb.list.deleteConfirm")}
        onConfirm={doDelete}
      />
      {/* Task 70 — دیالوگ «ورود دستی (آفلاین)»: پنل ترجمهٔ زبان‌ها برای هر فیلد
          متنی رکورد انتخاب‌شده؛ ذخیرهٔ خودکار با debounce مثل استودیو */}
      <Dialog open={offlineOpen} onOpenChange={setOfflineOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto scrollbar-slim">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Languages className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden />
              {t("dfb.list.translateManualTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("dfb.list.translateOfflineHint")}
              <span className="mx-1 font-mono text-[10px]" dir="ltr">#{selectedId ?? ""}</span>
            </DialogDescription>
          </DialogHeader>
          {textualFields.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
              {t("dfb.list.translateNoTextFields")}
            </p>
          ) : (
            <div className="grid gap-3">
              {textualFields.map((f) => (
                <div key={f.fieldKey} className="grid gap-1">
                  <span className="text-xs font-medium">{dfbFieldLabel(f, locale, trMap)}</span>
                  <DfbTranslationsBody
                    entityType="Value"
                    entityRef={Number(selectedId)}
                    fieldKey={f.fieldKey}
                    fallbackFa={String(selectedRow?.[String(f.id)] ?? "")}
                    labelKey="dfb.i18n.valueTitle"
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
