"use client";

import * as React from "react";
import { ListTree } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import {
  SimpleTreeForm,
  type SimpleTreeFormNode,
} from "@/components/forms/simple-tree-form";
import type { SimpleFormField } from "@/components/forms/simple-form-two-row-tabbed";
import type { ActionBarListItem } from "@/components/forms/action-bar";
import { useWindowChrome, useTabDirty } from "@/components/desktop/app-window";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type PlaceKind = "country" | "province" | "city";

/* sample detail data of the demo tree — NOT business data (§4.6); the
   «latin» strings are sample DATA (the legacy form's own «Tehran Provine»
   column), not UI chrome, so they stay outside the 11 dictionaries */
const PLACES: Record<string, { labelKey: string; latin: string; code: string; kind: PlaceKind }> = {
  geo: { labelKey: "stf.geoTitle", latin: "Geographic Locations", code: "0", kind: "country" },
  iran: { labelKey: "stf.iran", latin: "Iran", code: "1", kind: "country" },
  "tehran-province": { labelKey: "stf.tehranProvince", latin: "Tehran Province", code: "10", kind: "province" },
  tehran: { labelKey: "stf.tehran", latin: "Tehran", code: "101", kind: "city" },
  alborz: { labelKey: "stf.alborz", latin: "Alborz Province", code: "20", kind: "province" },
  karaj: { labelKey: "stf.karaj", latin: "Karaj", code: "201", kind: "city" },
};

type DemoValues = { type: string; code: string; title: string; latinTitle: string; active: boolean };

/**
 * TreeDemoWindow (Task 30) — live sample of the SimpleTreeForm shell
 * (legacy «محل های جغرافیایی»): master tree pane + detail form pane with
 * the legacy action bar. Sample data only — catalog apps keep their §4.6
 * placeholder contract.
 */
export function TreeDemoWindow() {
  const t = useT();
  /* Task 28 contract — chromeless host: the green form header hosts the
     caption buttons and drags the window; maximized state subscribes reactively */
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "tree-demo")?.maximized ?? false,
  );

  const closeThisWindow = React.useCallback(() => {
    const win = useDesktop.getState().windows.find((w) => w.kind === "tree-demo");
    if (win) useDesktop.getState().closeWindow(win.id);
  }, []);

  const nodes = React.useMemo<SimpleTreeFormNode[]>(
    () => [
      {
        id: "geo",
        label: t("stf.geoTitle"),
        icon: "globe",
        children: [
          {
            id: "iran",
            label: t("stf.iran"),
            icon: "flag",
            children: [
              {
                id: "tehran-province",
                label: t("stf.tehranProvince"),
                icon: "pin",
                children: [{ id: "tehran", label: t("stf.tehran"), icon: "dot" }],
              },
              {
                id: "alborz",
                label: t("stf.alborz"),
                icon: "pin",
                children: [{ id: "karaj", label: t("stf.karaj"), icon: "dot" }],
              },
            ],
          },
        ],
      },
    ],
    [t],
  );

  /* detail values of a node, straight from the sample data */
  const valuesOf = React.useCallback(
    (id: string): DemoValues => {
      const p = PLACES[id] ?? PLACES.geo;
      return {
        type: p.kind,
        code: p.code,
        title: t(p.labelKey as never),
        latinTitle: p.latin,
        active: true,
      };
    },
    [t],
  );

  /* legacy screenshot state: a province leaf is selected on open */
  const [selectedId, setSelectedId] = React.useState<string | null>("tehran-province");
  const [values, setValues] = React.useState<DemoValues>(() => valuesOf("tehran-province"));
  /* Task 82 — unsaved-data flag of the hosting tab (demo form obeys the
     same fiscal-year alarm contract as real forms) */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  const onSelect = React.useCallback(
    (node: SimpleTreeFormNode | null) => {
      const id = node?.id ?? null;
      setSelectedId(id);
      setValues(valuesOf(id ?? "geo"));
      setDirty(false); // Task 82 — رکورد (گره) ذخیره‌شده باز شد
    },
    [valuesOf],
  );

  const onFieldChange = React.useCallback((id: string, value: string | boolean) => {
    setDirty(true); // Task 82 — ویرایش ذخیره‌نشده
    setValues((v) => ({ ...v, [id]: value }));
  }, []);

  const fields = React.useMemo<SimpleFormField[]>(
    () => [
      {
        id: "type",
        label: t("stf.type"),
        required: true,
        type: "select" as const,
        value: values.type,
        options: [
          { value: "country", label: t("stf.optCountry") },
          { value: "province", label: t("stf.optProvince") },
          { value: "city", label: t("stf.optCity") },
        ],
      },
      { id: "code", label: t("fdf.code"), required: true, type: "number" as const, value: values.code },
      { id: "title", label: t("fdf.name"), required: true, value: values.title },
      { id: "latinTitle", label: t("stf.latinTitle"), required: true, value: values.latinTitle },
      { id: "active", label: t("fdf.active"), type: "checkbox" as const, checked: values.active },
    ],
    [t, values],
  );

  /* the records-list dropdown lists every tree node (opens it in the tree) */
  const listItems = React.useMemo<ActionBarListItem[]>(
    () => Object.entries(PLACES).map(([id, p]) => ({ id, title: t(p.labelKey as never) })),
    [t],
  );

  return (
    <SimpleTreeForm
      treeTitle={t("stf.geoTitle")}
      nodes={nodes}
      defaultSelectedId={selectedId}
      onSelect={onSelect}
      badge={t("fdf.badge")}
      icon={<ListTree className="h-3.5 w-3.5" aria-hidden />}
      fields={fields}
      onFieldChange={onFieldChange}
      onReset={() => {
        setValues(valuesOf(selectedId ?? "geo"));
        setDirty(false); // Task 82 — بازنشانی به مقادیر ذخیره‌شده
        toast.success(t("abar.resetToast"));
      }}
      onSave={async () => {
        await delay(550);
        setDirty(false); // Task 82 — ذخیرهٔ نمونه
        toast.success(t("abar.savedToast"));
      }}
      onCopy={() => {
        toast.success(t("abar.copyToast"));
      }}
      onDelete={async () => {
        await delay(350);
        toast.success(t("abar.deletedToast"));
      }}
      onPrint={() => {
        toast.success(t("abar.printToast"));
      }}
      onClose={closeThisWindow}
      onHeaderClose={closeThisWindow}
      onHeaderMinimize={chrome?.onMinimize}
      onHeaderMaximize={chrome?.onToggleMaximize}
      headerMaximized={headerMaximized}
      onHeaderDragStart={chrome?.onDragStart}
      onHeaderDragMove={chrome?.onDragMove}
      onHeaderDragEnd={chrome?.onDragEnd}
      onHeaderDoubleClick={chrome?.onDoubleClick}
      onHelp={() => {
        toast.info(t("abar.demoNote"));
      }}
      canSave={Boolean(selectedId)}
      canCopy={Boolean(selectedId)}
      canDelete={Boolean(selectedId)}
      listItems={listItems}
      onOpenListItem={(item) => {
        const node = PLACES[item.id]
          ? { id: item.id, label: item.title, icon: "dot" as const }
          : null;
        if (node) onSelect(node);
        toast.success(t("abar.itemOpened"));
      }}
    />
  );
}
