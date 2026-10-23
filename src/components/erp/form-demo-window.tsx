"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
  type SimpleFormTab,
} from "@/components/forms/simple-form-two-row-tabbed";
import type { ActionBarListItem } from "@/components/forms/action-bar";
import { useWindowChrome } from "@/components/desktop/app-window";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/* sample rows for the records-list dropdown — NOT business data (§4.6) */
const DEMO_ITEMS: ActionBarListItem[] = [
  { id: "1001", title: "1001" },
  { id: "1002", title: "1002" },
  { id: "1003", title: "1003" },
];

type DemoValues = Record<string, string | boolean>;

/**
 * FormDemoWindow (Task 24) — live sample of the SimpleFormTwoRowTabbed shell
 * («فرم اصلی نرم‌افزارها»): new-customer form with the legacy 10-icon action
 * bar, record navigation, two-row fields and OPTIONAL tabbed detail grids.
 * Sample data only — catalog apps keep their §4.6 placeholder contract.
 */
export function FormDemoWindow() {
  const t = useT();
  /* Task 28 — chromeless host: the green form header hosts the caption
     buttons and drags the window; maximized state subscribes reactively */
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "form-demo")?.maximized ?? false,
  );

  const closeThisWindow = React.useCallback(() => {
    const win = useDesktop.getState().windows.find((w) => w.kind === "form-demo");
    if (win) useDesktop.getState().closeWindow(win.id);
  }, []);

  /* three sample records the record-nav / list dropdown switch between */
  const records = React.useMemo<DemoValues[]>(
    () => [
      {
        code: "1001",
        name: `${t("fdf.sampleName")} 1`,
        customerType: "normal",
        balance: "0",
        formStatus: "direct",
        effect: t("fdf.rial"),
        active: true,
      },
      {
        code: "1002",
        name: `${t("fdf.sampleName")} 2`,
        customerType: "special",
        balance: "2500000",
        formStatus: "indirect",
        effect: t("fdf.rial"),
        active: true,
      },
      {
        code: "1003",
        name: `${t("fdf.sampleName")} 3`,
        customerType: "normal",
        balance: "980000",
        formStatus: "direct",
        effect: t("fdf.rial"),
        active: false,
      },
    ],
    [t],
  );

  const [recIndex, setRecIndex] = React.useState(0);
  const [values, setValues] = React.useState<DemoValues>(() => ({ ...records[0] }));

  const applyRecord = React.useCallback(
    (i: number) => {
      setRecIndex(i);
      setValues({ ...records[i] });
    },
    [records],
  );

  const onFieldChange = React.useCallback((id: string, value: string | boolean) => {
    setValues((v) => ({ ...v, [id]: value }));
  }, []);

  const fields = React.useMemo<SimpleFormField[]>(
    () => [
      { id: "code", label: t("fdf.code"), required: true, value: String(values.code ?? ""), readOnly: true },
      {
        id: "customerType",
        label: t("fdf.customerType"),
        required: true,
        type: "select",
        value: String(values.customerType ?? "normal"),
        options: [
          { value: "normal", label: t("fdf.typeNormal") },
          { value: "special", label: t("fdf.typeSpecial") },
        ],
      },
      { id: "name", label: t("fdf.name"), value: String(values.name ?? "") },
      {
        id: "customerGroup",
        label: t("fdf.customerGroup"),
        type: "lookup",
        placeholder: t("sft.selectPlaceholder"),
        onLookup: () => toast.info(t("abar.demoNote")),
      },
      {
        id: "balance",
        label: t("fdf.balance"),
        type: "number",
        value: String(values.balance ?? "0"),
        suffixChip: t("fdf.debit"),
      },
      {
        id: "formStatus",
        label: t("fdf.formStatus"),
        required: true,
        type: "select",
        value: String(values.formStatus ?? "direct"),
        options: [
          { value: "direct", label: t("fdf.dirDirect") },
          { value: "indirect", label: t("fdf.dirIndirect") },
        ],
      },
      {
        id: "effect",
        label: t("fdf.effect"),
        required: true,
        type: "lookup",
        value: String(values.effect ?? ""),
        onLookup: () => toast.info(t("abar.demoNote")),
      },
      { id: "active", label: t("fdf.active"), type: "checkbox", checked: values.active === true },
    ],
    [t, values],
  );

  /* OPTIONAL tabbed detail grids — both start empty («اطلاعاتی وجود ندارد») */
  const tabs = React.useMemo<SimpleFormTab[]>(
    () => [
      {
        id: "addresses",
        label: t("fdf.tabAddresses"),
        columns: [
          { id: "addrType", label: t("fdf.addrType"), required: true, minWidth: "min-w-28" },
          { id: "city", label: t("fdf.city"), required: true, minWidth: "min-w-28" },
          { id: "fullAddr", label: t("fdf.fullAddr"), required: true, minWidth: "min-w-64" },
          { id: "postal", label: t("fdf.postal"), minWidth: "min-w-28" },
        ],
      },
      {
        id: "contacts",
        label: t("fdf.tabContacts"),
        columns: [
          { id: "contactType", label: t("fdf.contactType"), required: true, minWidth: "min-w-28" },
          { id: "number", label: t("fdf.number"), required: true, minWidth: "min-w-32" },
          { id: "notes", label: t("fdf.notes"), minWidth: "min-w-48" },
        ],
      },
    ],
    [t],
  );

  return (
    <SimpleFormTwoRowTabbed
      title={t("fdf.title")}
      badge={t("fdf.badge")}
      icon={<ShoppingCart className="h-3.5 w-3.5" aria-hidden />}
      fields={fields}
      onFieldChange={onFieldChange}
      tabs={tabs}
      onSaveRows={() => toast.success(t("abar.savedToast"))}
      onFirst={() => applyRecord(0)}
      onPrev={() => applyRecord(Math.max(0, recIndex - 1))}
      onNext={() => applyRecord(Math.min(records.length - 1, recIndex + 1))}
      onLast={() => applyRecord(records.length - 1)}
      onReset={() => {
        applyRecord(recIndex);
        toast.success(t("abar.resetToast"));
      }}
      onSave={async () => {
        await delay(550);
        toast.success(t("abar.savedToast"));
      }}
      onCopy={() => {
        toast.success(t("abar.copyToast"));
      }}
      onDelete={async () => {
        await delay(350);
        applyRecord(0);
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
      listItems={DEMO_ITEMS}
      onOpenListItem={(item) => {
        const i = Number(item.id) - 1001;
        applyRecord(i >= 0 && i < records.length ? i : 0);
        toast.success(t("abar.itemOpened"));
      }}
    />
  );
}
