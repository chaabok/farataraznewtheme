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
  | "dfb-form";

export interface WinState {
  id: string;
  kind: WindowKind;
  /** catalog key for kind === "app" (e.g. "accounting") */
  appKey?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  prev?: { x: number; y: number; w: number; h: number };
}

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
  windows: WinState[];
  zTop: number;
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
  openWindow: (kind: WindowKind, appKey?: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number, x?: number, y?: number) => void;
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

const MIN_W = 520;
const MIN_H = 400;

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function defaultBounds(): { x: number; y: number; w: number; h: number } {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const taskbar = 52;
  if (vw < 640) {
    return { x: 12, y: 12, w: vw - 24, h: vh - taskbar - 24 };
  }
  const w = clamp(Math.round(vw * 0.78), MIN_W, 1240);
  const h = clamp(Math.round((vh - taskbar) * 0.86), MIN_H, 940);
  const n = Math.floor(Math.random() * 3);
  return {
    x: Math.max(12, Math.round((vw - w) / 2) + n * 26 - 26),
    y: Math.max(12, Math.round((vh - taskbar - h) / 2) + n * 18 - 18),
    w,
    h,
  };
}

export const useDesktop = create<DesktopState>()(
  persist(
    (set, get) => ({
      windows: [],
      zTop: 10,
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
        if (kind === "app" && appKey === "advancedTools") {
          kind = "dfb-menu";
          appKey = "app:advancedTools";
        }
        const existing = get().windows.find((w) => w.kind === kind && w.appKey === appKey);
        if (existing) {
          set((s) => ({
            zTop: s.zTop + 1,
            startOpen: false,
            windows: s.windows.map((w) =>
              w.id === existing.id ? { ...w, z: s.zTop + 1, minimized: false } : w,
            ),
          }));
          return;
        }
        const b = defaultBounds();
        set((s) => ({
          startOpen: false,
          zTop: s.zTop + 1,
          windows: [
            ...s.windows,
            {
              id: `${kind}:${appKey ?? ""}-${Date.now()}`,
              kind,
              appKey,
              x: b.x,
              y: b.y,
              w: b.w,
              h: b.h,
              z: s.zTop + 1,
              minimized: false,
              maximized: false,
            },
          ],
        }));
      },
      closeWindow: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),
      focusWindow: (id) =>
        set((s) => ({ zTop: s.zTop + 1, windows: s.windows.map((w) => (w.id === id ? { ...w, z: s.zTop + 1 } : w)) })),
      minimizeWindow: (id) =>
        set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)) })),
      toggleMaximize: (id) =>
        set((s) => ({
          windows: s.windows.map((w) => {
            if (w.id !== id) return w;
            if (w.maximized) {
              const p = w.prev ?? { x: 40, y: 40, w: 900, h: 600 };
              return { ...w, maximized: false, ...p, prev: undefined };
            }
            return { ...w, maximized: true, prev: { x: w.x, y: w.y, w: w.w, h: w.h } };
          }),
        })),
      moveWindow: (id, x, y) =>
        set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)) })),
      resizeWindow: (id, w, h, x, y) =>
        set((s) => ({
          windows: s.windows.map((win) =>
            win.id === id
              ? {
                  ...win,
                  w: Math.max(MIN_W, w),
                  h: Math.max(MIN_H, h),
                  x: x !== undefined ? x : win.x,
                  y: y !== undefined ? y : win.y,
                }
              : win,
          ),
        })),
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
         skipHydration keeps SSR markup deterministic; Desktop rehydrates after mount. */
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
