"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, Sigma } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
  type SimpleFormTab,
} from "@/components/forms/simple-form-two-row-tabbed";
import {
  SimpleTreeForm,
  type SimpleTreeFormNode,
} from "@/components/forms/simple-tree-form";
import type { FormAction } from "@/components/forms/action-bar";
import { useWindowChrome } from "@/components/desktop/app-window";
import { dfbShellTheme, type DfbFormStyle } from "@/lib/dfb-theme";
import {
  fetchFormDetail, executeQuery, saveFormData, loadFormData,
  type DfbFormDetail, type DfbFieldDef,
} from "@/stores/dfb-store";

/**
 * DfbFormRuntime (Task 45) — runs a DfbForm definition: renders the template
 * chosen in the builder (SimpleFormTwoRowTabbed or SimpleTreeForm) with the
 * stored header/body/footer, query-bound select/lookup options and the EAV
 * record store (DfbFormData/DfbFormDataValue on dfb.db). Custom fields added
 * to system forms render here too (IsCustom=true rows).
 */
export function DfbFormRuntime({ formId }: { formId: number }) {
  /* keyed by formId: each open definition mounts fresh state (no
     setState-in-effect resets — react-hooks/set-state-in-effect) */
  return <RuntimeInner key={formId} formId={formId} />;
}

function RuntimeInner({ formId }: { formId: number }) {
  const t = useT();
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "dfb-form" && w.appKey === String(formId))?.maximized ?? false,
  );
  const closeThisWindow = React.useCallback(() => {
    const win = useDesktop.getState().windows.find((w) => w.kind === "dfb-form" && w.appKey === String(formId));
    if (win) useDesktop.getState().closeWindow(win.id);
  }, [formId]);

  const [detail, setDetail] = React.useState<DfbFormDetail | null>(null);
  const [error, setError] = React.useState(false);

  /* values keyed by fieldId (string) */
  const [values, setValues] = React.useState<Record<string, string | boolean>>({});
  const [queryOptions, setQueryOptions] = React.useState<Record<number, Array<{ value: string; label: string }>>>({});
  const [records, setRecords] = React.useState<Array<{ dataId: number; values: Record<string, string | boolean> }>>([]);
  const [currentDataId, setCurrentDataId] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);

  const loadRecords = React.useCallback(async (d: DfbFormDetail) => {
    try {
      const items = await loadFormData(d.id);
      setRecords(
        items.map((it) => ({
          dataId: it.dataId,
          values: Object.fromEntries(
            it.values.map((v) => {
              const f = d.fields.find((x) => x.id === v.fieldRef);
              const isBool = f?.fieldType === "checkbox";
              return [String(v.fieldRef), isBool ? v.value === "1" : (v.value ?? "")];
            }),
          ),
        })),
      );
    } catch {
      /* record list is best-effort */
    }
  }, []);

  React.useEffect(() => {
    let alive = true;
    fetchFormDetail(formId)
      .then(async (d) => {
        if (!alive) return;
        setDetail(d);
        await loadRecords(d);
        /* fetch options for query-bound select/lookup fields */
        const bound = d.fields.filter((f) => f.queryRef != null && (f.fieldType === "select" || f.fieldType === "lookup"));
        const results = await Promise.all(
          bound.map(async (f) => {
            try {
              const rows = await executeQuery(f.queryRef!);
              /* value column: the bound queryFieldKey when present in the
                 response, otherwise the query's first selected column —
                 label prefers a Title-ish column (displayColumn semantics) */
              const keys = rows.length ? Object.keys(rows[0]) : [];
              const valKey =
                f.queryFieldKey && keys.includes(f.queryFieldKey)
                  ? f.queryFieldKey
                  : (keys[0] ?? "ID");
              const labelKey =
                keys.find((k) => k !== valKey && /title|label|name/i.test(k)) ?? valKey;
              const options = rows
                .map((r) => ({
                  value: String(r[valKey] ?? ""),
                  label: String(r[labelKey] ?? r[valKey] ?? ""),
                }))
                .filter((o) => o.value !== "");
              return [f.queryRef!, options] as const;
            } catch {
              return [f.queryRef!, []] as const;
            }
          }),
        );
        if (alive) setQueryOptions(Object.fromEntries(results));
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, [formId, loadRecords]);

  const onFieldChange = React.useCallback((id: string, value: string | boolean) => {
    setValues((v) => ({ ...v, [id]: value }));
  }, []);

  const save = React.useCallback(async () => {
    if (!detail) return;
    const missing = detail.fields.filter((f) => f.required && f.section !== "footer" && (values[String(f.id)] === undefined || values[String(f.id)] === ""));
    if (missing.length > 0) {
      toast.error(`${t("dfb.requiredFieldsMissing")}: ${missing.map((m) => m.label).join("، ")}`);
      return;
    }
    setBusy(true);
    try {
      const payload: Record<string, string | boolean | null> = {};
      for (const f of detail.fields) {
        if (f.section === "footer") continue;
        const v = values[String(f.id)];
        if (v === undefined) continue;
        payload[String(f.id)] = f.fieldType === "checkbox" ? Boolean(v) : String(v);
      }
      const res = await saveFormData(detail.id, payload);
      setCurrentDataId(res.dataId);
      toast.success(t("abar.savedToast"));
      await loadRecords(detail);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  }, [detail, values, t, loadRecords]);

  const reset = React.useCallback(() => {
    setValues({});
    setCurrentDataId(null);
  }, []);

  const openRecord = React.useCallback(
    (dataId: string) => {
      const rec = records.find((r) => String(r.dataId) === dataId);
      if (!rec) return;
      setValues(rec.values);
      setCurrentDataId(rec.dataId);
    },
    [records],
  );

  if (error) {
    return <div className="grid h-full place-items-center p-6 text-sm text-muted-foreground">{t("dfb.formNotFound")}</div>;
  }
  if (!detail) {
    return <div className="grid h-full place-items-center p-6 text-sm text-muted-foreground">{t("common.loading")}</div>;
  }

  const header = detail.header ?? {};
  const footer = detail.footer ?? {};
  const footerButtons = Array.isArray(footer.buttons) ? (footer.buttons as string[]) : [];
  /* Task 47 — design-studio shell style (theme / title size / font) applied
     to the running form — what the owner designed is what runs */
  const shellTheme = dfbShellTheme((header.style ?? null) as DfbFormStyle | null);

  const toShellType = (ft: string): SimpleFormField["type"] =>
    (["text", "number", "select", "lookup", "checkbox", "date", "textarea"].includes(ft)
      ? ft
      : "text") as SimpleFormField["type"];

  const footerHandlers: Record<string, FormAction | undefined> = {
    save,
    reset,
    saveNew: async () => {
      await save();
      reset();
    },
    saveClose: async () => {
      await save();
      closeThisWindow();
    },
    delete: async () => {
      if (currentDataId == null) {
        toast.info(t("dfb.noRecordSelected"));
        return;
      }
      reset();
      toast.success(t("abar.resetToast"));
    },
    print: () => window.print(),
  };

  /* ------------------------- simpleTwoRowTabbed runtime ------------------------- */
  if (detail.componentKey !== "treeForm") {
    const bodyFields = detail.fields.filter((f) => f.section === "body");
    const mainFields = bodyFields.filter((f) => f.tabRef == null);
    const toSimpleField = (f: DfbFieldDef): SimpleFormField => ({
      id: String(f.id),
      label: f.label,
      type: toShellType(f.fieldType),
      required: f.required,
      value: f.fieldType === "checkbox" ? undefined : String(values[String(f.id)] ?? ""),
      checked: f.fieldType === "checkbox" ? Boolean(values[String(f.id)]) : undefined,
      readOnly: f.readOnly,
      options:
        f.queryRef != null && queryOptions[f.queryRef]
          ? queryOptions[f.queryRef]
          : undefined,
      ltr: f.fieldType === "number" || f.fieldType === "date",
      disabled: busy,
    });

    const tabs: SimpleFormTab[] = detail.tabs.map((tb) => {
      const tabFields = bodyFields.filter((f) => f.tabRef === tb.id);
      return {
        id: String(tb.id),
        label: tb.title,
        columns: tabFields.map((f) => ({ id: String(f.id), label: f.label })),
      };
    });

    return (
      <SimpleFormTwoRowTabbed
        title={detail.title}
        badge={(header.badge as string) ?? undefined}
        icon={<FileText className="h-3.5 w-3.5" aria-hidden />}
        headerClassName={shellTheme.headerClassName}
        titleClassName={shellTheme.titleClassName}
        bodyStyle={shellTheme.bodyStyle}
        fields={mainFields.map(toSimpleField)}
        onFieldChange={onFieldChange}
        tabs={tabs}
        onSave={footerButtons.includes("save") ? save : undefined}
        onReset={footerButtons.includes("reset") ? footerHandlers.reset : undefined}
        onSaveNew={footerButtons.includes("saveNew") ? footerHandlers.saveNew : undefined}
        onSaveClose={footerButtons.includes("saveClose") ? footerHandlers.saveClose : undefined}
        onDelete={footerButtons.includes("delete") ? footerHandlers.delete : undefined}
        onPrint={footerButtons.includes("print") ? footerHandlers.print : undefined}
        onClose={closeThisWindow}
        onHeaderClose={closeThisWindow}
        onHeaderMinimize={chrome?.onMinimize}
        onHeaderMaximize={chrome?.onToggleMaximize}
        headerMaximized={headerMaximized}
        onHeaderDragStart={chrome?.onDragStart}
        onHeaderDragMove={chrome?.onDragMove}
        onHeaderDragEnd={chrome?.onDragEnd}
        onHeaderDoubleClick={chrome?.onDoubleClick}
        onHelp={() => { toast.info(t("dfb.builderNote")); }}
        canSave={!busy}
        listItems={records.map((r) => ({ id: String(r.dataId), title: String(r.dataId) }))}
        onOpenListItem={(item) => openRecord(item.id)}
      />
    );
  }

  /* ------------------------------ treeForm runtime ------------------------------ */
  const treeFields = detail.fields.filter((f) => f.section === "body");
  const recordLabel = (rec: { dataId: number; values: Record<string, string | boolean> }) => {
    const firstText = treeFields.find((f) => f.fieldType === "text" || f.fieldType === "select");
    const v = firstText ? rec.values[String(firstText.id)] : undefined;
    return v ? String(v) : `${t("dfb.record")} ${rec.dataId}`;
  };
  const nodes: SimpleTreeFormNode[] = records.map((r) => ({
    id: `r${r.dataId}`,
    label: recordLabel(r),
  }));
  const selectedRecordId = currentDataId != null ? `r${currentDataId}` : null;

  const openRecordByNode = (nodeId: string) => {
    const rec = records.find((r) => `r${r.dataId}` === nodeId);
    if (rec) {
      setValues(rec.values);
      setCurrentDataId(rec.dataId);
    } else {
      reset();
    }
  };

  return (
    <SimpleTreeForm
      treeTitle={detail.title}
      treeEmptyText={t("dfb.noRecords")}
      nodes={nodes}
      selectedId={selectedRecordId}
      onSelect={(node) => openRecordByNode(node?.id ?? "")}
      badge={(header.badge as string) ?? undefined}
      icon={<Sigma className="h-3.5 w-3.5" aria-hidden />}
      headerClassName={shellTheme.headerClassName}
      titleClassName={shellTheme.titleClassName}
      bodyStyle={shellTheme.bodyStyle}
      fields={treeFields.map((f) => ({
        id: String(f.id),
        label: f.label,
        type: toShellType(f.fieldType),
        required: f.required,
        value: f.fieldType === "checkbox" ? undefined : String(values[String(f.id)] ?? ""),
        checked: f.fieldType === "checkbox" ? Boolean(values[String(f.id)]) : undefined,
        readOnly: f.readOnly,
        options:
          f.queryRef != null && queryOptions[f.queryRef] ? queryOptions[f.queryRef] : undefined,
      }))}
      onFieldChange={onFieldChange}
      onSave={save}
      onReset={reset}
      onClose={closeThisWindow}
      onHeaderClose={closeThisWindow}
      onHeaderMinimize={chrome?.onMinimize}
      onHeaderMaximize={chrome?.onToggleMaximize}
      headerMaximized={headerMaximized}
      onHeaderDragStart={chrome?.onDragStart}
      onHeaderDragMove={chrome?.onDragMove}
      onHeaderDragEnd={chrome?.onDragEnd}
      onHeaderDoubleClick={chrome?.onDoubleClick}
      onHelp={() => { toast.info(t("dfb.builderNote")); }}
      canSave={!busy}
    />
  );
}
