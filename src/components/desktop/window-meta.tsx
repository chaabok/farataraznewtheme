"use client";

/**
 * Window metadata resolver — extracted from desktop.tsx (Task 82) so the
 * fiscal-year footer (taskbar tray) can resolve a tab's display title for
 * the unsaved-data alarm («اطلاعات ذخیره نشده در فرم [نام فرم] وجود دارد»)
 * without importing the desktop shell back (circular-import safety).
 *
 * The title matches EXACTLY what the Task-81 tab strip shows:
 * `win.titleOverride ?? resolveWindowMeta(...).title`.
 */

import * as React from "react";
import { BarChart3, FilePlus2, Inbox, ListChecks, ListTree, Network, PencilRuler, Workflow, Wrench } from "lucide-react";
import { useT } from "@/stores/settings-store";
import type { WinState, WindowKind } from "@/stores/desktop-store";
import {
  useDfb,
  findMenuNode,
  findFormInTree,
  findMenuNodeByAppKey,
  dfbNodeTitle,
  dfbFormTitle,
} from "@/stores/dfb-store";
import { AppTile } from "./app-tile";
import { DfbGlyph } from "@/components/erp/form-builder/dfb-dialogs";
import { BusinessStructureWindow } from "@/components/erp/business-structure/bs-window";
import { SettingsWindow } from "@/components/erp/settings-window";
import { AppPlaceholderWindow } from "@/components/erp/app-placeholder-window";
import { GeneralWindow } from "@/components/erp/general/general-window";
import { AccountingWindow } from "@/components/erp/accounting/accounting-window";
import { FormDemoWindow } from "@/components/erp/form-demo-window";
import { TreeDemoWindow } from "@/components/erp/tree-demo-window";
import { FormBuilderWindow } from "@/components/erp/form-builder/form-builder-window";
import { DfbMenuWindow } from "@/components/erp/form-builder/dfb-menu-window";
import { DfbFormRuntime } from "@/components/erp/form-builder/dfb-form-runtime";
import { FormDesignStudio } from "@/components/erp/form-builder/dfb-studio";
import { RecordsListWindow } from "@/components/erp/form-builder/records-list-window";
import { WorkflowMenu } from "@/components/erp/workflow/workflow-menu";
import { WorkflowCartable } from "@/components/erp/workflow/workflow-cartable";
import { WorkflowReports } from "@/components/erp/workflow/workflow-reports";
import { WorkflowRoleForm } from "@/components/erp/settings/workflow-role-form";
import { WorkflowDesignerForm } from "@/components/erp/settings/workflow-designer-form";

interface StaticWindowMeta {
  titleKey: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

/* Task 45 — dfb-menu/dfb-form resolve dynamically in resolveWindowMeta,
   so the static map only covers the fixed kinds (Partial on purpose). */
export const STATIC_WINDOWS: Partial<Record<Exclude<WindowKind, "app">, StaticWindowMeta>> = {
  "business-structure": {
    titleKey: "menus.businessStructure",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-violet-700 text-white">
        <Network className="h-3 w-3" />
      </span>
    ),
    content: <BusinessStructureWindow />,
  },
  settings: {
    titleKey: "settings.title",
    icon: <AppTile appKey="settings" className="h-5 w-5 rounded-md" iconClass="h-3 w-3" />,
    content: <SettingsWindow />,
  },
  /* Task 24 — live sample of the SimpleFormTwoRowTabbed form shell (additive;
     the 27 catalog placeholders keep their §4.6 contract untouched) */
  "form-demo": {
    titleKey: "fdf.iconLabel",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
        <FilePlus2 className="h-3 w-3" />
      </span>
    ),
    content: <FormDemoWindow />,
  },
  /* Task 30 — live sample of the SimpleTreeForm master-detail shell
     (additive; the 27 catalog placeholders keep their §4.6 contract) */
  "tree-demo": {
    titleKey: "stf.iconLabel",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <ListTree className="h-3 w-3" />
      </span>
    ),
    content: <TreeDemoWindow />,
  },
  /* Task 45/46 — the form builder (فرمساز) of the advancedTools app
     (dfb-service). Since Task 46 the advancedTools icon opens the app's
     forms menu (kind "dfb-menu", ref "app:advancedTools") and the «فرمساز»
     launcher form inside that menu opens THIS builder window — one shared
     instance for every entry point. */
  "dfb-builder": {
    titleKey: "dfb.builderTitle",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-600 to-amber-800 text-white">
        <Wrench className="h-3 w-3" />
      </span>
    ),
    content: <FormBuilderWindow />,
  },
  /* t183 — فرمان مالک: «هر کدام از تب‌های فرم گردش کار را یک فرم کنید و
     در منوی گردش کار قرار دهید» — هاب t181 به الگوی منوی فرم‌ها تبدیل شد
     (مثل "ابزارهای پیشرفته"): آیکون گردش کار دسکتاپ/استارت/پین، منو را
     باز می‌کند و هر آیتم فرم مستقل خودش را در تب جداگانه باز می‌کند؛
     زنگولهٔ نوار وظیفه مستقیماً کارتابل را باز می‌کند. */
  "workflow-menu": {
    titleKey: "wf.hub.title",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-cyan-600 to-teal-700 text-white">
        <Workflow className="h-3 w-3" />
      </span>
    ),
    content: <WorkflowMenu />,
  },
  "workflow-cartable": {
    titleKey: "wf.cartable.title",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-teal-600 text-white">
        <Inbox className="h-3 w-3" />
      </span>
    ),
    content: <WorkflowCartable />,
  },
  "workflow-roles": {
    titleKey: "wf.formTitle",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-cyan-800 text-white">
        <Workflow className="h-3 w-3" />
      </span>
    ),
    content: <WorkflowRoleForm />,
  },
  "workflow-designer": {
    titleKey: "wf.des.title",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-cyan-600 to-teal-700 text-white">
        <PencilRuler className="h-3 w-3" />
      </span>
    ),
    content: <WorkflowDesignerForm />,
  },
  "workflow-reports": {
    titleKey: "wf.rep.navLabel",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-cyan-700 text-white">
        <BarChart3 className="h-3 w-3" />
      </span>
    ),
    content: <WorkflowReports />,
  },
};

export function resolveWindowMeta(
  win: WinState,
  t: ReturnType<typeof useT>,
  dfbTree: ReturnType<typeof useDfb.getState>["tree"],
  locale: string,
  trMap?: Record<string, string>, // Task 68 — نقشهٔ ترجمهٔ زبان فعلی
) {
  if (win.kind === "app") {
    const appKey = win.appKey ?? "";
    /* Task 75 — the «عمومی» app is the FIRST catalog app with announced real
       content (owner: menu عمومی ← submenu اطلاعات پایه ← form سال مالی جدید).
       Task 119 — «حسابداری» is the SECOND one: منوی حسابداری با زیرمنوی
       اطلاعات پایه (AccountingWindow)؛ بقیهٔ appKeyها قرارداد placeholder
       §4.6 خود را دارند. */
    const content =
      appKey === "general" ? (
        <GeneralWindow />
      ) : appKey === "accounting" ? (
        <AccountingWindow />
      ) : (
        <AppPlaceholderWindow appKey={appKey} />
      );
    return {
      title: t(`app.${appKey}` as never),
      icon: <AppTile appKey={appKey} className="h-5 w-5 rounded-md" iconClass="h-3 w-3" />,
      content,
    };
  }
  /* Task 45/46 — dynamic dfb windows: titles come from the builder tree
     (dfb.db). A dfb-menu ref is either a numeric node id (user icons) or
     "app:<appKey>" (a system catalog app's forms menu — Task 46): while the
     tree is still loading the catalog label/icon answer for it, then the
     live node takes over. */
  if (win.kind === "dfb-menu") {
    const ref = win.appKey ?? "";
    const appRef = ref.startsWith("app:") ? ref.slice(4) : null;
    const node = appRef
      ? findMenuNodeByAppKey(dfbTree, appRef)
      : findMenuNode(dfbTree, Number(ref));
    return {
      title: node
        ? dfbNodeTitle(node, t, locale, trMap)
        : appRef
          ? t(`app.${appRef}` as never)
          : t("dfb.menuNotFound"),
      icon: node ? (
        <DfbGlyph iconKey={node.iconKey} className="h-5 w-5 rounded-md" iconClass="h-3 w-3" />
      ) : appRef ? (
        <AppTile appKey={appRef} className="h-5 w-5 rounded-md" iconClass="h-3 w-3" />
      ) : (
        (STATIC_WINDOWS["dfb-builder"]?.icon ?? null)
      ),
      content: <DfbMenuWindow menuRef={ref} />,
    };
  }
  if (win.kind === "dfb-form") {
    const formId = Number(win.appKey ?? 0);
    const form = findFormInTree(dfbTree, formId);
    return {
      title: form ? dfbFormTitle(form, locale, trMap) : t("dfb.formNotFound"),
      icon: (
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
          <FilePlus2 className="h-3 w-3" />
        </span>
      ),
      content: <DfbFormRuntime formId={formId} />,
    };
  }
  /* Task 64 — the form's master-list window (فهرست کلّی) — MainDataGrid */
  if (win.kind === "dfb-list") {
    const formId = Number(win.appKey ?? 0);
    const form = findFormInTree(dfbTree, formId);
    return {
      title: form
        ? `${t("dfb.list.title")} — ${dfbFormTitle(form, locale, trMap)}`
        : t("dfb.list.title"),
      icon: (
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <ListChecks className="h-3 w-3" />
        </span>
      ),
      content: <RecordsListWindow formId={formId} />,
    };
  }
  /* Task 47 — the per-form design studio (استودیوی طراحی فرم) */
  if (win.kind === "dfb-studio") {
    const formId = Number(win.appKey ?? 0);
    const form = findFormInTree(dfbTree, formId);
    return {
      title: form
        ? `${t("dfb.studio.title")} — ${dfbFormTitle(form, locale, trMap)}`
        : t("dfb.studio.title"),
      icon: (
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <Wrench className="h-3 w-3" />
        </span>
      ),
      content: <FormDesignStudio formId={formId} />,
    };
  }
  const meta = STATIC_WINDOWS[win.kind];
  if (!meta) {
    /* unreachable today — every fixed kind has a static entry */
    return { title: win.kind, icon: null, content: null };
  }
  return { title: t(meta.titleKey as never), icon: meta.icon, content: meta.content };
}
