"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WindowKind =
  | "business-structure"
  | "settings"
  | "app"
  | "form-demo"
  | "tree-demo"
  | "dfb-builder"
  | "dfb-menu"
  | "dfb-form"
  | "dfb-studio"
  | "dfb-list"
  | "workflow"; // t181 — پنجرهٔ واحد زیرسیستم گردش کار (هاب: کارتابل/سمت‌ها/طراح/گزارش‌ها)

/**
 * Task 81 — a "window" is now a TAB of the desktop shell (owner request):
 * the floating-window chrome retired and every form opens inside the tab
 * strip below the dashboard header. The type keeps its historical name and
 * the `maximized` flag (always true — a tab always fills the workspace)
 * because form shells subscribe to it for their full-bleed styling.
 */
export interface WinState {
  id: string;
  kind: WindowKind;
  /** catalog key for kind === "app" (e.g. "accounting") */
  appKey?: string;
  /** Task 64 — dynamic title override (MainDataGrid list windows append the
      live record count: «فهرست کلّی خدمات (12)») — undefined = resolveWindowMeta title */
  titleOverride?: string;
  /** tabs are always full-area (legacy floating-window flag, kept for
      `windows.find(...)?.maximized` consumers) */
  maximized: boolean;
}

/** id of the implicit first tab — «صفحه اصلی» (the desktop itself) */
export const HOME_TAB_ID = "home";

/** free (px) position of a desktop icon inside the icons layer — Task 19 */
export interface IconPos {
  x: number;
  y: number;
}

/** default pinned ids of the taskbar footer dock — Task 35: the
    BusinessStructure shortcut left the desktop (moved into Settings), so only
    the settings app stays pinned by default */
export const DEFAULT_PINNED = ["settings"];

/** dock side of the dashboard header — Task 22 owner spec:
    "top" = horizontal FULL page-width bar (height = 52×0.7 = 36.4px),
    "left" / "right" = vertical full-height strip (thickness 36.4px). */
export type HeaderDock = "top" | "left" | "right";

/** Task 38 — desktop icon presentation: the classic free grid or a
    collapsible acrylic sidebar fed by the very same icon entries */
export type IconMode = "grid" | "sidebar";

interface DesktopState {
  /** open form tabs, in open order (the home tab is implicit and always first) */
  windows: WinState[];
  /** the active tab — HOME_TAB_ID shows the desktop itself */
  activeTabId: string;
  startOpen: boolean;
  /** dragged-free positions of desktop icons (id → px); absent id = default grid slot */
  iconPositions: Record<string, IconPos>;
  /** ids pinned to the taskbar footer dock, in display order */
  pinned: string[];
  /** dock side of the dashboard header (Task 22): top = horizontal, left/right = vertical */
  headerDock: HeaderDock;
  /** Task 38 — presentation of the desktop icons: "grid" (classic) | "sidebar" */
  iconMode: IconMode;
  /** Task 38 — sidebar rail state (collapsed = icons only, expanded = icons + labels) */
  sidebarCollapsed: boolean;
  /** transient: a desktop icon is currently dragged over the taskbar (drop affordance) */
  dragOverTaskbar: boolean;
  /** open a form as a tab (deduped by kind+appKey) and activate it */
  openWindow: (kind: WindowKind, appKey?: string) => void;
  /** close a tab; closing the active one activates its neighbour (or home) */
  closeWindow: (id: string) => void;
  /** switch the active tab */
  activateTab: (id: string) => void;
  /** Task 64 — live tab title (record-count in list windows); undefined =
      drop the override and fall back to the resolved meta title (Task 82:
      the «عمومی» window retitles itself while its سال مالی sub-page is open) */
  setWindowTitle: (id: string, title: string | undefined) => void;
  /** Task 82 — a tab reports its unsaved-data state (form has edits that were
      never saved); absent id = clean. Session-local, never persisted. */
  dirtyTabs: Record<string, boolean>;
  setTabDirty: (id: string, dirty: boolean) => void;
  /** Task 82 — fiscal-year change: every open form tab closes at once
      (home is implicit and stays) and the strip disappears */
  closeAllFormTabs: () => void;
  setStartOpen: (open: boolean) => void;
  setIconPos: (id: string, pos: IconPos) => void;
  resetIconLayout: () => void;
  /** returns true when the id was newly pinned (false = already pinned) */
  pinToTaskbar: (id: string) => boolean;
  unpinFromTaskbar: (id: string) => void;
  /** dock the dashboard header to an edge (Task 22) */
  setHeaderDock: (dock: HeaderDock) => void;
  /** Task 38 — switch the desktop icon presentation (grid ↔ sidebar) */
  setIconMode: (mode: IconMode) => void;
  /** Task 38 — collapse/expand the sidebar rail */
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDragOverTaskbar: (over: boolean) => void;
}

export const useDesktop = create<DesktopState>()(
  persist(
    (set, get) => ({
      windows: [],
      activeTabId: HOME_TAB_ID,
      startOpen: false,
      iconPositions: {},
      pinned: DEFAULT_PINNED,
      headerDock: "top" as HeaderDock,
      iconMode: "grid" as IconMode,
      sidebarCollapsed: false,
      dragOverTaskbar: false,
      openWindow: (kind, appKey) => {
        /* Task 36 — owner request: the desktop Settings icon and the taskbar
           Settings pin must show exactly the same information. Every launcher
           of the catalog "settings" app (desktop icon, start-menu grid) is
           redirected here to the real Settings window (kind "settings", with
           the Business Structure sub-page) instead of the §4.6 placeholder —
           one window instance shared by all entry points (owner-approved
           §4.6 exception; the other 26 catalog apps keep their placeholder). */
        if (kind === "app" && appKey === "settings") {
          kind = "settings";
          appKey = undefined;
        }
        /* Task 46 — the catalog "advancedTools" app opens its DB-driven forms
           menu (kind "dfb-menu" bound to the system node by appKey) instead of
           the §4.6 placeholder. The «فرمساز» launcher form inside that menu
           opens the real form builder + tree (dfb-builder) — and every future
           form of this menu (system or user-made) joins the same list
           automatically, straight from dfb.db. */
        /* Task 47 — the design studio opens per form (appKey = form id) right
           after the create-form wizard records the basic info, and from the
           builder tree; one window instance per form. */
        if (kind === "app" && appKey === "advancedTools") {
          kind = "dfb-menu";
          appKey = "app:advancedTools";
        }
        /* Task 81 — tabs: an already-open form is re-activated in place
           (browser semantics) instead of stacking a second instance. */
        const existing = get().windows.find((w) => w.kind === kind && w.appKey === appKey);
        if (existing) {
          set({ activeTabId: existing.id, startOpen: false });
          return;
        }
        const id = `${kind}:${appKey ?? ""}-${Date.now()}`;
        set((s) => ({
          startOpen: false,
          windows: [...s.windows, { id, kind, appKey, maximized: true }],
          activeTabId: id,
        }));
      },
      closeWindow: (id) =>
        set((s) => {
          const idx = s.windows.findIndex((w) => w.id === id);
          const windows = s.windows.filter((w) => w.id !== id);
          /* Task 82 — a closed tab can no longer be dirty */
          const dirtyTabs = { ...s.dirtyTabs };
          delete dirtyTabs[id];
          /* browser rule: closing the ACTIVE tab activates its neighbour —
             prefer the tab before it, fall back to the one after, else home */
          let activeTabId = s.activeTabId;
          if (s.activeTabId === id) {
            /* idx-1 in the filtered array = the tab BEFORE the closed one;
               closing the first tab falls forward to the new first */
            activeTabId =
              windows[Math.min(Math.max(idx - 1, 0), windows.length - 1)]?.id ?? HOME_TAB_ID;
          }
          return { windows, activeTabId, dirtyTabs };
        }),
      activateTab: (id) => set({ activeTabId: id }),
      setWindowTitle: (id, title) =>
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, titleOverride: title } : w)),
        })),
      /* Task 82 — dirty registry (same-reference no-op keeps listeners quiet) */
      dirtyTabs: {},
      setTabDirty: (id, dirty) =>
        set((s) =>
          Boolean(s.dirtyTabs[id]) === dirty ? s : { dirtyTabs: { ...s.dirtyTabs, [id]: dirty } },
        ),
      closeAllFormTabs: () =>
        set({ windows: [], activeTabId: HOME_TAB_ID, dirtyTabs: {} }),
      setStartOpen: (open) => set({ startOpen: open }),
      setIconPos: (id, pos) =>
        set((s) => ({ iconPositions: { ...s.iconPositions, [id]: pos } })),
      resetIconLayout: () => set({ iconPositions: {} }),
      pinToTaskbar: (id) => {
        if (get().pinned.includes(id)) return false;
        set((s) => ({ pinned: [...s.pinned, id] }));
        return true;
      },
      unpinFromTaskbar: (id) => set((s) => ({ pinned: s.pinned.filter((p) => p !== id) })),
      setHeaderDock: (dock) => set({ headerDock: dock }),
      setIconMode: (mode) => set({ iconMode: mode }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setDragOverTaskbar: (over) =>
        set((s) => (s.dragOverTaskbar === over ? s : { dragOverTaskbar: over })),
    }),
    {
      /* Task 19/22: persist ONLY the desktop layout (icon positions + footer pins + header dock).
         skipHydration keeps SSR markup deterministic; Desktop rehydrates after mount.
         Task 81 — tabs stay session-local on purpose: a fresh load always lands
         on the home tab with an empty strip (like a freshly opened browser). */
      name: "erp.desktop.layout",
      version: 2,
      /* Task 35/37 — one-time migrations: retired desktop shortcuts (the
         BusinessStructure form and — Task 37 — the userManagement catalog app
         both moved into the Settings window). Strip them from persisted footer
         pins and icon positions so existing layouts match the new desktop;
         no other persisted key is touched. */
      migrate: (persisted, version) => {
        if (version >= 2) return persisted as DesktopState;
        const s = (persisted ?? {}) as Partial<DesktopState>;
        const retired = ["business-structure", "userManagement"];
        return {
          ...s,
          pinned: (Array.isArray(s.pinned) ? s.pinned : DEFAULT_PINNED).filter(
            (id) => !retired.includes(id),
          ),
          iconPositions: Object.fromEntries(
            Object.entries(s.iconPositions ?? {}).filter(([id]) => !retired.includes(id)),
          ),
        } as DesktopState;
      },
      skipHydration: true,
      partialize: (s) => ({
        iconPositions: s.iconPositions,
        pinned: s.pinned,
        headerDock: s.headerDock,
        iconMode: s.iconMode,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    },
  ),
);
