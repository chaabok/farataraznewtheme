"use client";

import * as React from "react";
import { Minus, Square, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDesktop, type WinState, type WindowKind } from "@/stores/desktop-store";
import { useT } from "@/stores/settings-store";

const TASKBAR_H = 52;

/* Task 28 — chromeless windows render NO light title bar: their form header
   (green gradient strip of SimpleFormTwoRowTabbed / SimpleTreeForm) becomes
   the drag handle and hosts the minimize/maximize/close caption buttons via
   WindowChrome. Extend this list when another window kind adopts the form
   shell. Task 32 — BusinessStructureWindow adopts SimpleTreeForm.
   Task 62 — the design studio (dfb-studio) joins: the owner asked for the
   light title bar to be removed entirely and for minimize/maximize caption
   buttons to live in the studio toolbar row (next to «ذخیره قالب»). */
const CHROMELESS_KINDS: readonly WindowKind[] = [
  "form-demo",
  "tree-demo",
  "business-structure",
  "dfb-builder",
  "dfb-form",
  "dfb-studio",
];

/** Caption-button + drag API a chromeless host injects into its content. */
export interface WindowChromeApi {
  onDragStart: (e: React.PointerEvent) => void;
  onDragMove: (e: React.PointerEvent) => void;
  onDragEnd: (e: React.PointerEvent) => void;
  /** double-click on the header strip toggles maximize (Windows caption rule) */
  onDoubleClick: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
}

const WindowChromeContext = React.createContext<WindowChromeApi | null>(null);

/** Consume the hosting window's caption API (null outside a window). */
export function useWindowChrome(): WindowChromeApi | null {
  return React.useContext(WindowChromeContext);
}

interface AppWindowProps {
  win: WinState;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function AppWindow({ win, title, icon, children }: AppWindowProps) {
  const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow } =
    useDesktop();
  const t = useT();
  const dragRef = React.useRef<{ dx: number; dy: number } | null>(null);
  const resizeRef = React.useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  /* latest window state for stable drag callbacks (no stale closures,
     no per-frame context churn while dragging) */
  const winRef = React.useRef(win);
  React.useLayoutEffect(() => {
    winRef.current = win;
  });

  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const startDrag = React.useCallback(
    (e: React.PointerEvent) => {
      const w = winRef.current;
      if ((e.target as HTMLElement).closest("[data-window-btn]")) return;
      focusWindow(w.id);
      if (w.maximized) return;
      dragRef.current = { dx: e.clientX - w.x, dy: e.clientY - w.y };
      /* capture keeps the drag alive when the pointer leaves the strip;
         a vanished pointer (synthetic/edge cases) must not crash — the
         header-targeted handlers still receive events while it hovers */
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* no active pointer — ignore */
      }
    },
    [focusWindow],
  );
  const moveDrag = React.useCallback(
    (e: React.PointerEvent) => {
      const w = winRef.current;
      if (!dragRef.current) return;
      const x = clamp(e.clientX - dragRef.current.dx, -w.w + 140, vw - 80);
      const y = clamp(e.clientY - dragRef.current.dy, 0, vh - TASKBAR_H - 40);
      moveWindow(w.id, x, y);
    },
    [moveWindow, vw, vh],
  );
  const endDrag = React.useCallback(() => {
    dragRef.current = null;
  }, []);
  const doubleClickHeader = React.useCallback(
    () => toggleMaximize(winRef.current.id),
    [toggleMaximize],
  );

  const onResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    focusWindow(win.id);
    resizeRef.current = { x: e.clientX, y: e.clientY, w: win.w, h: win.h };
    /* same vanished-pointer guard as startDrag — synthetic/edge-case
       pointers must not crash (uncaught NotFoundError in dev.log) */
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* no active pointer — ignore */
    }
  };
  const onResizePointerMove = (e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const r = resizeRef.current;
    resizeWindow(win.id, r.w + (e.clientX - r.x), r.h + (e.clientY - r.y));
  };
  const onResizePointerUp = () => (resizeRef.current = null);

  const maximized = win.maximized;
  const chromeless = CHROMELESS_KINDS.includes(win.kind);
  /* Task 28 — stable caption API for the chromeless form header */
  const chrome: WindowChromeApi = {
    onDragStart: startDrag,
    onDragMove: moveDrag,
    onDragEnd: endDrag,
    onDoubleClick: doubleClickHeader,
    onMinimize: () => minimizeWindow(win.id),
    onToggleMaximize: () => toggleMaximize(win.id),
    onClose: () => closeWindow(win.id),
  };

  /* clamp to viewport so windows never overflow on small screens */
  const effW = Math.min(win.w, vw - 24);
  const effH = Math.min(win.h, vh - TASKBAR_H - 24);
  const effX = clamp(win.x, 12, Math.max(12, vw - effW - 12));
  const effY = clamp(win.y, 12, Math.max(12, vh - TASKBAR_H - effH - 12));

  const frameStyle: React.CSSProperties = maximized
    ? { inset: 0, zIndex: win.z }
    : { left: effX, top: effY, width: effW, height: effH, zIndex: win.z };
  /* Task 62 — minimized windows stay MOUNTED (display:none) instead of
     unmounting: in-window React state (design-studio undo history, unsaved
     drafts) must survive a minimize → restore round-trip — Windows
     semantics. The taskbar restore path flips `minimized` back to false. */
  if (win.minimized) frameStyle.display = "none";

  return (
    <div
      className={cn(
        /* Task 31 — the window root is OPAQUE (bg-card): desktop icons /
           wallpaper behind an open window must never bleed through the form
           (owner report). Acrylic glass stays on flyouts, taskbar and start
           menu — authentic Windows-11: window frames are solid. */
        "pointer-events-auto absolute flex flex-col overflow-hidden rounded-xl bg-card win-shadow window-in",
        maximized && "rounded-none",
      )}
      style={
        /* Task 28 — the windows layer already stops at the taskbar
           (bottom: 52); a maximized window simply fills the layer, so the
           form footer sits flush on the desktop footer (no 52px gap). */
        frameStyle
      }
      onPointerDown={() => focusWindow(win.id)}
    >
      {/* title bar (skipped for chromeless kinds — their content header takes over) */}
      {!chromeless && (
        <div
          className="flex h-10 shrink-0 cursor-default items-center gap-2 border-b border-border/60 px-3 select-none"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onDoubleClick={doubleClickHeader}
        >
          <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
          <span className="truncate text-xs font-semibold text-foreground/90">{title}</span>
          <div className="ms-auto flex items-center">
            <button
              data-window-btn
              aria-label={t("common.minimize")}
              className="flex h-8 w-10 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/10 cursor-pointer"
              onClick={() => minimizeWindow(win.id)}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              data-window-btn
              aria-label={t("common.maximize")}
              className="flex h-8 w-10 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/10 cursor-pointer"
              onClick={() => toggleMaximize(win.id)}
            >
              {maximized ? <Copy className="h-3 w-3 -scale-x-100" /> : <Square className="h-3 w-3" />}
            </button>
            <button
              data-window-btn
              aria-label={t("common.close")}
              className="flex h-8 w-10 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-red-500 hover:text-white cursor-pointer"
              onClick={() => closeWindow(win.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* body */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <WindowChromeContext.Provider value={chrome}>{children}</WindowChromeContext.Provider>
      </div>

      {/* resize handle */}
      {!maximized && (
        <div
          className="absolute bottom-0 end-0 h-5 w-5 cursor-nwse-resize touch-none"
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
        />
      )}
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}
