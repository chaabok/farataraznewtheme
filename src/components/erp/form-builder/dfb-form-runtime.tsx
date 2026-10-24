"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, Sigma } from "lucide-react";
import { useT, useSettings } from "@/stores/settings-store";
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
import { ACTION_BAR_KEYS } from "@/components/forms/action-bar";
import { useWindowChrome } from "@/components/desktop/app-window";
import { dfbShellTheme, dfbBankAlign, type DfbFormStyle } from "@/lib/dfb-theme";
import {
  fetchFormDetail, saveFormData, loadFormData,
  fetchQueryOptionsForFields, normalizeFieldWidth, widthMinWidthClass,
  dfbFormTitle, executeFormScript, parseFieldConfig, isDfbInputField,
  fieldConfigItems, fieldItemsScript, rowsToItems, DFB_ITEM_FIELD_TYPES,
  type DfbFormDetail, type DfbFieldDef, type DfbFieldItem,
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
  const locale = useSettings((s) => s.locale);
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
  /* Task 58 — script-sourced items of select/radio fields (keyed by field id);
     static ConfigJson.items ride directly off the field def */
  const [scriptItemOptions, setScriptItemOptions] = React.useState<Record<string, DfbFieldItem[]>>({});
  const [records, setRecords] = React.useState<Array<{ dataId: number; values: Record<string, string | boolean> }>>([]);
  const [currentDataId, setCurrentDataId] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  /* Task 53 — script prefill cache (re-applied after reset) */
  const scriptPrefillRef = React.useRef<Record<string, string>>({});

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
        /* fetch options for query-bound select/lookup fields (shared helper,
           Task 48 — same mapping the studio preview uses) */
        const options = await fetchQueryOptionsForFields(d.fields);
        if (alive) setQueryOptions(options);
        /* Task 58 — run the itemsScript of every select/radio field that has
           one; the fetched rows become the field's opening list (the owner
           rule: «آیتم‌ها را از اسکریپت بتواند اضافه کند») */
        const itemScriptFields = d.fields.filter(
          (f) => DFB_ITEM_FIELD_TYPES.includes(f.fieldType) && fieldItemsScript(parseFieldConfig(f.configJson)).trim(),
        );
        if (itemScriptFields.length > 0) {
          const itemsMap: Record<string, DfbFieldItem[]> = {};
          await Promise.all(
            itemScriptFields.map(async (f) => {
              try {
                const cfg = parseFieldConfig(f.configJson);
                const res = await executeFormScript(fieldItemsScript(cfg));
                const vf = typeof cfg.itemsValueField === "string" ? cfg.itemsValueField : undefined;
                itemsMap[String(f.id)] = rowsToItems(res.rows, vf);
              } catch {
                /* a failing items script leaves the field with its static items */
              }
            }),
          );
          if (alive) setScriptItemOptions(itemsMap);
        }
        /* Task 53 — run each script field and prefill the fields bound to it
           (config { bindScript, bindField }) from the script's FIRST row; the
           bound fields stay editable — this is just their starting value. */
        const scriptFields = d.fields.filter(
          (f) => f.fieldType === "script" &&
            typeof parseFieldConfig(f.configJson).script === "string" &&
            String(parseFieldConfig(f.configJson).script).trim(),
        );
        if (scriptFields.length > 0) {
          const prefill: Record<string, string> = {};
          await Promise.all(
            scriptFields.map(async (sf) => {
              try {
                const res = await executeFormScript(String(parseFieldConfig(sf.configJson).script));
                const row0 = res.rows[0] ?? {};
                for (const f of d.fields) {
                  const cfg = parseFieldConfig(f.configJson);
                  if (cfg.bindScript === sf.fieldKey && typeof cfg.bindField === "string") {
                    const v = row0[cfg.bindField];
                    if (v != null) prefill[String(f.id)] = String(v);
                  }
                }
              } catch {
                /* a failing script never blocks the form */
              }
            }),
          );
          if (alive && Object.keys(prefill).length > 0) {
            scriptPrefillRef.current = prefill;
            setValues((v) => ({ ...prefill, ...v }));
          }
        }
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
    /* Task 53 — shapes + the script element have NO value: excluded from
       required-checks and the EAV payload; FOOTER band fields now SAVE like
       every other field (they are ordinary inputs, just placed at the end) */
    const inputFields = detail.fields.filter((f) => isDfbInputField(f.fieldType));
    const missing = inputFields.filter(
      (f) => f.required && (values[String(f.id)] === undefined || values[String(f.id)] === ""),
    );
    if (missing.length > 0) {
      toast.error(`${t("dfb.requiredFieldsMissing")}: ${missing.map((m) => m.label).join("، ")}`);
      return;
    }
    setBusy(true);
    try {
      const payload: Record<string, string | boolean | null> = {};
      for (const f of inputFields) {
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
    setValues({ ...scriptPrefillRef.current }); // Task 53 — re-apply script prefill
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
  /* Task 48 — owner rule «تمامی آیکون‌های اکشن بار بصورت پیش‌فرض»: a form
     without a stored (or with an empty) button list renders the FULL
     legacy action bar; stored subsets are honored through the allowlist */
  const storedButtons = Array.isArray(footer.buttons)
    ? (footer.buttons as string[]).filter((b) => (ACTION_BAR_KEYS as readonly string[]).includes(b))
    : [];
  const footerButtons = storedButtons.length > 0 ? storedButtons : [...ACTION_BAR_KEYS];
  /* Task 47 — design-studio shell style (theme / title size / font) applied
     to the running form — what the owner designed is what runs */
  const shellStyle = (header.style ?? null) as DfbFormStyle | null;
  const shellTheme = dfbShellTheme(shellStyle);

  const toShellType = (ft: string): SimpleFormField["type"] =>
    (["text", "number", "select", "lookup", "checkbox", "date", "textarea", "radio",
      "line", "box", "circle", "oval", "script"].includes(ft)
      ? ft
      : "text") as SimpleFormField["type"];

  /* Task 58 — items of a select/radio field: bound-query options win, then
     the script-fetched items, then the items defined in the studio —
     merged VALUE-UNIQUE (a script row and a studio-defined item with the
     same value must not render twice) */
  const resolveFieldOptions = (f: DfbFieldDef): Array<{ value: string; label: string }> | undefined => {
    if (f.queryRef != null && queryOptions[f.queryRef]) return queryOptions[f.queryRef];
    const merged: Array<{ value: string; label: string }> = [];
    const seen = new Set<string>();
    for (const it of [...(scriptItemOptions[String(f.id)] ?? []), ...fieldConfigItems(parseFieldConfig(f.configJson))]) {
      if (seen.has(it.value)) continue;
      seen.add(it.value);
      merged.push(it);
    }
    return merged.length > 0 ? merged : undefined;
  };

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
    /* Task 48 — full action bar: copy keeps the entered values but detaches
       the record so saving stores it as a NEW row */
    copy: async () => {
      setCurrentDataId(null);
      toast.info(t("abar.copy"));
    },
    delete: async () => {
      if (currentDataId == null) {
        toast.info(t("dfb.noRecordSelected"));
        return;
      }
      reset();
      toast.success(t("abar.resetToast"));
    },
    deleteNew: async () => {
      if (currentDataId == null) {
        toast.info(t("dfb.noRecordSelected"));
        return;
      }
      reset();
      toast.success(t("abar.resetToast"));
    },
    deleteClose: async () => {
      if (currentDataId == null) {
        toast.info(t("dfb.noRecordSelected"));
        return;
      }
      reset();
      toast.success(t("abar.resetToast"));
      closeThisWindow();
    },
    print: () => window.print(),
  };

  /* ------------------------- simpleTwoRowTabbed runtime ------------------------- */
  if (detail.componentKey !== "treeForm") {
    const bodyFields = detail.fields.filter((f) => f.section === "body");
    const mainFields = bodyFields.filter((f) => f.tabRef == null);
    /* Task 53 — «باند فوتر» fields run in the template's pinned end zone */
    const footerBandFields = detail.fields.filter((f) => f.section === "footer");
    const toSimpleField = (f: DfbFieldDef): SimpleFormField => ({
      id: String(f.id),
      label: f.label,
      type: toShellType(f.fieldType),
      required: f.required,
      value: f.fieldType === "checkbox" ? undefined : String(values[String(f.id)] ?? ""),
      checked: f.fieldType === "checkbox" ? Boolean(values[String(f.id)]) : undefined,
      readOnly: f.readOnly,
      widthPct: normalizeFieldWidth(f.widthSpan),
      options: resolveFieldOptions(f),
      ltr: f.fieldType === "number" || f.fieldType === "date",
      disabled: busy,
    });

    /* Task 52 (owner rule «عنوان عناصر طراحی در پیش‌نمایش نباید نمایش داده
       شود») — bands are DESIGN elements and never render as tabs. The tabs
       created with «افزودن تب» inside a records-table band are flattened
       into the ONE top-level strip, exactly like the sample form. */
    const bandTabs = detail.tabs.filter((tb) => !tb.parentRef);
    const childrenOf = (bandId: number) => detail.tabs.filter((tb) => tb.parentRef === bandId);
    const columnsOf = (tabId: number) =>
      bodyFields
        .filter((f) => f.tabRef === tabId)
        .map((f) => ({
          id: String(f.id),
          label: f.label,
          required: f.required,
          minWidth: widthMinWidthClass(normalizeFieldWidth(f.widthSpan)),
          /* Task 58 — the grid cell renders the SAME editor as the body
             field (checkbox → checkbox, select → list, date → mask, ...) */
          type: toShellType(f.fieldType),
          options: resolveFieldOptions(f),
        }));

    const tabs: SimpleFormTab[] = [];
    for (const tb of bandTabs) {
      const tabLabel = dfbFormTitle(tb, locale);
      /* Task 49 — input-fields band (TabKind=2): plain inputs, no grid;
         the band title doubles as the tab's user-facing name */
      if (tb.tabKind === 2) {
        tabs.push({
          id: String(tb.id),
          label: tabLabel,
          kind: "fields" as const,
          columns: [], // Task 49 — fields bands have no grid columns
          fields: bodyFields
            .filter((f) => f.tabRef === tb.id)
            .map(toSimpleField),
        });
        continue;
      }
      const kids = childrenOf(tb.id);
      if (kids.length > 0) {
        /* each «افزودن تب» tab = its own grid tab in the flat strip */
        for (const ct of kids) {
          tabs.push({
            id: String(ct.id),
            label: dfbFormTitle(ct, locale),
            columns: columnsOf(ct.id),
          });
        }
        /* defensive: direct band-level fields (pre-Task 50 layout) keep a
           grid of their own, titled after the band */
        const direct = columnsOf(tb.id);
        if (direct.length > 0) {
          tabs.push({ id: `band-${tb.id}`, label: tabLabel, columns: direct });
        }
      } else {
        /* legacy single-grid band (no «افزودن تب» tabs yet) */
        tabs.push({
          id: String(tb.id),
          label: tabLabel,
          columns: columnsOf(tb.id),
        });
      }
    }

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
        footerFields={footerBandFields.map(toSimpleField)}
        actions={footerButtons}
        fieldsAlign={dfbBankAlign(shellStyle, "main")}
        onSave={footerButtons.includes("save") ? save : undefined}
        onReset={footerButtons.includes("reset") ? footerHandlers.reset : undefined}
        onSaveNew={footerButtons.includes("saveNew") ? footerHandlers.saveNew : undefined}
        onSaveClose={footerButtons.includes("saveClose") ? footerHandlers.saveClose : undefined}
        onCopy={footerButtons.includes("copy") ? footerHandlers.copy : undefined}
        onDelete={footerButtons.includes("delete") ? footerHandlers.delete : undefined}
        onDeleteNew={footerButtons.includes("deleteNew") ? footerHandlers.deleteNew : undefined}
        onDeleteClose={footerButtons.includes("deleteClose") ? footerHandlers.deleteClose : undefined}
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
  /* Task 53 — tree forms append the footer-band fields after the body fields
     (SimpleTreeForm has no separate footer zone; nothing is lost) */
  const treeFields = [
    ...detail.fields.filter((f) => f.section === "body"),
    ...detail.fields.filter((f) => f.section === "footer"),
  ];
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
      actions={footerButtons}
      fieldsAlign={dfbBankAlign(shellStyle, "main")}
      fields={treeFields.map((f) => ({
        id: String(f.id),
        label: f.label,
        type: toShellType(f.fieldType),
        required: f.required,
        value: f.fieldType === "checkbox" ? undefined : String(values[String(f.id)] ?? ""),
        checked: f.fieldType === "checkbox" ? Boolean(values[String(f.id)]) : undefined,
        readOnly: f.readOnly,
        widthPct: normalizeFieldWidth(f.widthSpan),
        options: resolveFieldOptions(f),
      }))}
      onFieldChange={onFieldChange}
      onSave={save}
      onReset={reset}
      onCopy={footerButtons.includes("copy") ? footerHandlers.copy : undefined}
      onDelete={footerButtons.includes("delete") ? footerHandlers.delete : undefined}
      onDeleteNew={footerButtons.includes("deleteNew") ? footerHandlers.deleteNew : undefined}
      onDeleteClose={footerButtons.includes("deleteClose") ? footerHandlers.deleteClose : undefined}
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
    />
  );
}
