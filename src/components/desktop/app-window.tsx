"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDesktop, type WinState } from "@/stores/desktop-store";

/**
 * Task 81 — the floating window retired; this file now hosts the TAB surface.
 *
 * The owner's tab-bar contract (زیر هدر دسکتاپ): every form opens as a tab of
 * the strip below the dashboard header and its content fills the workspace
 * between the strip and the (auto-shrunk) taskbar. Tabs stay MOUNTED while
 * hidden — unsaved drafts / undo history survive tab switches exactly like
 * they survived the old minimize (Task 62 semantics, browser carrier).
 *
 * The historical chrome API stays: chromeless form shells (Task 28/62) wire
 * their green header to it. Drag handlers become no-ops (nothing floats
 * anymore) and minimize/maximize are simply ABSENT (undefined) so the caption
 * buttons disappear from every form header; close still closes the TAB.
 */

/** Header-strip API a tab injects into its chromeless form shell. */
export interface WindowChromeApi {
  onDragStart: (e: React.PointerEvent) => void;
  onDragMove: (e: React.PointerEvent) => void;
  onDragEnd: (e: React.PointerEvent) => void;
  onDoubleClick: () => void;
  /** retired with the floating chrome — left undefined so caption buttons hide */
  onMinimize?: () => void;
  onToggleMaximize?: () => void;
  /** closes the hosting TAB */
  onClose: () => void;
}

const WindowChromeContext = React.createContext<WindowChromeApi | null>(null);

/** Consume the hosting tab's header API (null outside a tab). */
export function useWindowChrome(): WindowChromeApi | null {
  return React.useContext(WindowChromeContext);
}

const noop = () => {};

interface TabSurfaceProps {
  win: WinState;
  /** false → the tab content stays mounted but hidden (state preservation) */
  active: boolean;
  children: React.ReactNode;
}

export function TabSurface({ win, active, children }: TabSurfaceProps) {
  const closeWindow = useDesktop((s) => s.closeWindow);

  const chrome = React.useMemo<WindowChromeApi>(
    () => ({
      onDragStart: noop,
      onDragMove: noop,
      onDragEnd: noop,
      onDoubleClick: noop,
      onClose: () => closeWindow(win.id),
    }),
    [closeWindow, win.id],
  );

  return (
    <section
      role="tabpanel"
      aria-label={win.kind}
      hidden={!active}
      className={cn(
        /* Opaque card like the old window body (Task 31 rule): the desktop
           wallpaper must never bleed through an open form. Top edge stays
           open — the active tab of the strip sits flush on it. */
        "pointer-events-auto absolute inset-0 flex flex-col overflow-hidden rounded-b-xl border border-t-0 border-border/60 bg-card win-shadow window-in",
      )}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <WindowChromeContext.Provider value={chrome}>{children}</WindowChromeContext.Provider>
      </div>
    </section>
  );
}
