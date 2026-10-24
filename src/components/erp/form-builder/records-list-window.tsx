"use client";

import * as React from "react";
import { FilePlus2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import {
  fetchFormDetail, loadFormData, dfbFormTitle, dfbFieldLabel, dfbApi, isDfbInputField,
  type DfbFormDetail,
} from "@/stores/dfb-store";
import { useDfbTrMap } from "@/stores/dfb-translations";
import {
  MainDataGrid, GridActionButton, type MainGridColumn, type MainGridRow,
} from "./main-data-grid";
import { ConfirmDeleteDialog } from "@/components/forms/action-bar";

/**
 * RecordsListWindow (Task 64 — owner request «فهرست کلّی») — the form's
 * record list window rendered with MainDataGrid: one column per input field
 * (+ کد), the classic per-column operator filters, and the bottom action bar
 * (افزودن رکورد → opens the entry form · حذف رکورد (§0.8 confirm) ·
 * بازخوانی · CSV export). The live record count rides the window title
 * («فهرست کلّی خدمات (3)») via desktop-store.setWindowTitle.
 */
export function RecordsListWindow({ formId }: { formId: number }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const trMap = useDfbTrMap(); // Task 68

  const [detail, setDetail] = React.useState<DfbFormDetail | null>(null);
  const [rows, setRows] = React.useState<MainGridRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

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
        cols.push({
          key: String(f.id),
          label: dfbFieldLabel(f, locale, trMap), // Task 68
          width: 170,
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
    </div>
  );
}
