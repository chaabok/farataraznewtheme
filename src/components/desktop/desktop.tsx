"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  ListTree,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  PinOff,
  RotateCcw,
} from "lucide-react";
import { useTheme } from "next-themes";
import { DirectionProvider } from "@radix-ui/react-direction";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSettings, useT } from "@/stores/settings-store";
import {
  useDesktop,
  HOME_TAB_ID,
  type WindowKind,
} from "@/stores/desktop-store";
import { useAppRegistry } from "@/stores/app-registry-store";
import { TabSurface } from "./app-window";
import { TabBar } from "./tab-bar";
import { useChromeMetrics } from "./chrome-metrics";
import { AppTile } from "./app-tile";
import { resolveWindowMeta } from "./window-meta";
import { Taskbar } from "./taskbar";
import { DashboardHeader } from "./dashboard-header";
import { StartMenu } from "./start-menu";
import { FloatingMenu } from "./floating-menu";
import { DfbGlyph } from "@/components/erp/form-builder/dfb-dialogs";
import {
  useDfb,
  dfbNodeTitle,
} from "@/stores/dfb-store";
import { ensureDfbTranslations, useDfbTrMap, useDfbTranslations } from "@/stores/dfb-translations";
import { useOrgContext } from "@/stores/org-context-store";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

/* Task 82 — STATIC_WINDOWS + resolveWindowMeta live in window-meta.tsx now
   (shared with the taskbar's fiscal-year footer for alarm titles). */

/* ---------------- Task 19 — desktop icon drag & drop geometry ---------------- */

const ICON_W = 84;
const ICON_H = 100;
const GRID_STEP_X = 88;
const GRID_STEP_Y = 106;
const GRID_PAD = 8;
/* Task 81 — header thickness lives in chrome-metrics.ts now (dynamic:
   the header auto-shrinks while the tab strip is open) */
const DRAG_THRESHOLD = 6;

interface IconEntry {
  id: string;
  kind: WindowKind;
  appKey?: string;
  label: string;
  /** Task 45 — iconKey of user-created dfb main icons (glyph via getIconKeyGlyph) */
  iconKey?: string;
}

function DesktopIcons() {
  const t = useT();
  const dir = useSettings((s) => s.dir());
  const locale = useSettings((s) => s.locale);
  /* Task 39 — owner request: icons are ordered by the selected language
     (fa → Persian alphabet, en → A-Z, …) via Intl collation. */
  const collator = React.useMemo(() => new Intl.Collator(locale, { numeric: true }), [locale]);
  const openWindow = useDesktop((s) => s.openWindow);
  const iconPositions = useDesktop((s) => s.iconPositions);
  const pinned = useDesktop((s) => s.pinned);
  const setIconPos = useDesktop((s) => s.setIconPos);
  const resetIconLayout = useDesktop((s) => s.resetIconLayout);
  const pinToTaskbar = useDesktop((s) => s.pinToTaskbar);
  const setDragOverTaskbar = useDesktop((s) => s.setDragOverTaskbar);
  const headerDock = useDesktop((s) => s.headerDock);
  /* Task 81 — the icon layer clears the header AND the tab strip while it is open */
  const metrics = useChromeMetrics();
  /* Task 38 — sidebar presentation state (owner request) */
  const iconMode = useDesktop((s) => s.iconMode);
  const sidebarCollapsed = useDesktop((s) => s.sidebarCollapsed);
  const setIconMode = useDesktop((s) => s.setIconMode);
  const setSidebarCollapsed = useDesktop((s) => s.setSidebarCollapsed);
  const { apps, load } = useAppRegistry();
  /* Task 45 — user-created main icons (فرمساز) merge into the very same list:
     grid, sidebar and context-menu all treat them exactly like catalog apps */
  const dfbUserIcons = useDfb((s) => s.userIcons);
  const dfbLoad = useDfb((s) => s.load);
  const trMapDesktopIcons = useDfbTrMap(); // Task 68

  const layerRef = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<{ w: number; h: number } | null>(null);
  const [freeMode, setFreeMode] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [menu, setMenu] = React.useState<{
    x: number;
    y: number;
    entry: IconEntry;
    source: "grid" | "sidebar";
  } | null>(null);
  const [ghost, setGhost] = React.useState<{
    entry: IconEntry;
    x: number;
    y: number;
    overTaskbar: boolean;
  } | null>(null);
  const suppressClickRef = React.useRef(false);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    void dfbLoad();
  }, [dfbLoad]);

  /* SSR-safe: persisted layout (icon positions + footer pins) rehydrated after mount */
  React.useEffect(() => {
    void useDesktop.persist.rehydrate();
  }, []);

  /* free positioning + dragging on ≥640px viewports; small screens keep the wrap flow */
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const apply = () => setFreeMode(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* measure the icons layer for clamping (viewport resizes keep icons inside).
     Task 39: re-attach on every grid (re)mount — the layer unmounts while the
     Task-38 sidebar is open, so a one-shot observer would leave a stale rect. */
  React.useEffect(() => {
    if (iconMode !== "grid") return;
    const el = layerRef.current;
    if (!el) return;
    const update = () => setRect({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [iconMode]);

  const clampPos = React.useCallback(
    (p: { x: number; y: number }): { x: number; y: number } => {
      const w = rect?.w ?? (typeof window !== "undefined" ? Math.max(0, window.innerWidth - 16) : 1264);
      const h = rect?.h ?? (typeof window !== "undefined" ? Math.max(0, window.innerHeight - 68) : 732);
      return {
        x: Math.min(Math.max(p.x, 0), Math.max(0, w - ICON_W)),
        y: Math.min(Math.max(p.y, 0), Math.max(0, h - ICON_H)),
      };
    },
    [rect],
  );

  /* default slot = column-major grid anchored to the start edge (right in RTL, left in LTR) */
  const defaultPos = React.useCallback(
    (index: number): { x: number; y: number } => {
      const h = rect?.h ?? (typeof window !== "undefined" ? Math.max(1, window.innerHeight - 68) : 732);
      const w = rect?.w ?? (typeof window !== "undefined" ? Math.max(1, window.innerWidth - 16) : 1264);
      const rows = Math.max(1, Math.floor((h - GRID_PAD) / GRID_STEP_Y));
      const col = Math.floor(index / rows);
      const row = index % rows;
      const x = dir === "rtl" ? w - GRID_PAD - ICON_W - col * GRID_STEP_X : GRID_PAD + col * GRID_STEP_X;
      return { x, y: GRID_PAD + row * GRID_STEP_Y };
    },
    [rect, dir],
  );

  /* Task 35 — the BusinessStructure shortcut left the desktop: the form
     moved into the Settings window as a sub-page (owner request). Icons:
     the Task-24/Task-30 form-shell samples, then the catalog apps minus
     userManagement — it moved into the Settings window too (Task 37). */
  const items = React.useMemo<IconEntry[]>(() => {
    const base: IconEntry[] = [
      { id: "form-demo", kind: "form-demo", label: t("fdf.iconLabel") },
      { id: "tree-demo", kind: "tree-demo", label: t("stf.iconLabel") },
      ...apps
        .filter((a) => a.appKey !== "userManagement")
        .map((a) => ({
          id: a.appKey,
          kind: "app" as WindowKind,
          appKey: a.appKey,
          label: t(a.titleKey as never),
        })),
      /* Task 45 — user-created main icons (isSystem=false, NodeType=1):
         same grid slot semantics as catalog apps (owner-confirmed default:
         mixed alphabetical ordering via the language collator below).
         Task 68 — label via the translation map (fallback fa). */
      ...dfbUserIcons.map((n) => ({
        id: `dfb-menu-${n.id}`,
        kind: "dfb-menu" as WindowKind,
        appKey: String(n.id),
        label: dfbNodeTitle(n, t, locale, trMapDesktopIcons),
        iconKey: n.iconKey,
      })),
    ];
    /* Task 39 — owner request: order by the active language's collation in
       BOTH presentations, so the desktop grid and the sidebar always tell
       the same story (labels are unique, the id is just a stable tiebreak). */
    return base.sort(
      (a, b) => collator.compare(a.label, b.label) || collator.compare(a.id, b.id),
    );
  }, [apps, dfbUserIcons, t, collator, locale, trMapDesktopIcons]);

  /* Task 36 — the catalog "settings" icon opens the real Settings window too:
     openWindow redirects (app, "settings") → kind "settings", so this icon,
     the taskbar pin and the start-menu tile all share one Settings window. */
  const activate = (entry: IconEntry) => openWindow(entry.kind, entry.appKey);

  /* Task 39 — self-heal: a persisted icon layout whose icons visually overlap
     (a legacy pile, or positions clamped together by a resize) is discarded in
     favor of the clean language-sorted grid. Deliberate drag positions that do
     NOT overlap are left untouched, and plain re-renders (selection, drag
     ghost…) never re-evaluate this — only grid (re)mounts and real layer
     geometry changes do. */
  React.useEffect(() => {
    if (iconMode !== "grid" || !freeMode || !rect) return;
    const saved = useDesktop.getState().iconPositions;
    const pts = items.map((entry, i) => clampPos(saved[entry.id] ?? defaultPos(i)));
    for (let a = 0; a < pts.length; a++) {
      for (let b = a + 1; b < pts.length; b++) {
        const p = pts[a];
        const q = pts[b];
        if (p.x < q.x + ICON_W && q.x < p.x + ICON_W && p.y < q.y + ICON_H && q.y < p.y + ICON_H) {
          resetIconLayout();
          return;
        }
      }
    }
  }, [iconMode, freeMode, rect, items, clampPos, defaultPos, resetIconLayout]);

  const beginDragTracking = (e: React.PointerEvent, entry: IconEntry) => {
    if (!freeMode || e.button !== 0) return;
    const btn = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const grab = { x: e.clientX - btn.left, y: e.clientY - btn.top };
    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    const taskbarTop =
      document.querySelector<HTMLElement>("[data-taskbar]")?.getBoundingClientRect().top ??
      (typeof window !== "undefined" ? window.innerHeight - 52 : 748);
    let active = false;
    let over = false;

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (!active) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
        active = true;
        setSelected(entry.id);
      }
      const o = ev.clientY >= taskbarTop - 12;
      if (o !== over) {
        over = o;
        setDragOverTaskbar(o);
      }
      setGhost({ entry, x: ev.clientX - grab.x, y: ev.clientY - grab.y, overTaskbar: o });
    };

    const finish = (ev: PointerEvent | null, commit: boolean) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      setDragOverTaskbar(false);
      setGhost(null);
      if (!active) return; /* plain click — let onClick/dblclick behave normally */
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
      if (!commit || !ev) return;
      if (over) {
        if (pinToTaskbar(entry.id)) toast.success(t("taskbar.pinnedToast"));
        else toast.info(t("taskbar.alreadyPinned"));
        return;
      }
      const layer = layerRef.current?.getBoundingClientRect();
      if (!layer) return;
      setIconPos(
        entry.id,
        clampPos({
          x: ev.clientX - grab.x - layer.left,
          y: ev.clientY - grab.y - layer.top,
        }),
      );
    };

    const onUp = (ev: PointerEvent) => finish(ev, true);
    const onCancel = () => finish(null, false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

  const handleClick = (e: React.MouseEvent, entry: IconEntry) => {
    if (suppressClickRef.current) return;
    setSelected(entry.id);
    /* touch devices: single tap opens (desktop convention: double-click) */
    if (window.matchMedia?.("(pointer: coarse)").matches) activate(entry);
  };

  const handleContextMenu = (e: React.MouseEvent, entry: IconEntry) => {
    e.preventDefault();
    setSelected(entry.id);
    setMenu({ x: e.clientX, y: e.clientY, entry, source: "grid" });
  };

  const iconGlyph = (entry: IconEntry) =>
    entry.id === "form-demo" ? (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg">
        <FilePlus2 className="h-6 w-6" />
      </span>
    ) : entry.id === "tree-demo" ? (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
        <ListTree className="h-6 w-6" />
      </span>
    ) : entry.kind === "dfb-menu" ? (
      <DfbGlyph iconKey={entry.iconKey ?? "folder"} className="h-12 w-12 rounded-2xl" iconClass="h-6 w-6" />
    ) : (
      <AppTile appKey={entry.appKey ?? ""} className="h-12 w-12 rounded-2xl" iconClass="h-6 w-6" />
    );

  /* Task 38 — sidebar geometry: the panel docks on the inline-start edge,
     sliding clear of a dashboard header docked on the same side (§1.4:
     logical positioning only — no physical classes). */
  const sidebarOpen = iconMode === "sidebar";
  const startDockedHeader =
    (dir === "rtl" && headerDock === "right") || (dir === "ltr" && headerDock === "left");
  const startOffset = startDockedHeader ? metrics.headerH + GRID_PAD : GRID_PAD;
  const topOffset =
    (headerDock === "top" ? metrics.headerH : 0) + metrics.tabbarH + GRID_PAD;
  const SIDEBAR_W = "min(272px, 100vw - 72px)";
  const toggleStart = sidebarOpen
    ? `calc(${startOffset}px + ${sidebarCollapsed ? "64px" : SIDEBAR_W} + 8px)`
    : `${startOffset + 4}px`;
  const ToggleIcon = sidebarOpen
    ? dir === "rtl"
      ? PanelRightClose
      : PanelLeftClose
    : dir === "rtl"
      ? PanelRightOpen
      : PanelLeftOpen;
  const SidebarCollapseIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const SidebarExpandIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  /* Task 38 — sidebar icon style: compact tightly-rounded tiles (vs the
     desktop's large rounded glyphs) so the presentation visibly changes
     when switching modes (owner request). */
  const sidebarGlyph = (entry: IconEntry) =>
    entry.id === "form-demo" ? (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
        <FilePlus2 className="h-4 w-4" />
      </span>
    ) : entry.id === "tree-demo" ? (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
        <ListTree className="h-4 w-4" />
      </span>
    ) : entry.kind === "dfb-menu" ? (
      <DfbGlyph iconKey={entry.iconKey ?? "folder"} className="h-8 w-8 rounded-lg" iconClass="h-4 w-4" />
    ) : (
      <AppTile appKey={entry.appKey ?? ""} className="h-8 w-8 rounded-lg" iconClass="h-4 w-4" />
    );

  return (
    <>
      {iconMode === "grid" && (
      <div
        ref={layerRef}
        aria-label={t("startmenu.pinned")}
      style={{
        top: topOffset,
        bottom: metrics.taskbarH + 8,
        left: headerDock === "left" ? metrics.headerH + GRID_PAD : GRID_PAD,
        right: headerDock === "right" ? metrics.headerH + GRID_PAD : GRID_PAD,
      }}
      className={cn(
        "absolute z-0 select-none",
        freeMode
          ? "block"
          : "flex flex-row flex-wrap content-start gap-0.5 sm:flex-col sm:flex-wrap",
      )}
    >
      {items.map((entry, i) => {
        const pos = freeMode ? clampPos(iconPositions[entry.id] ?? defaultPos(i)) : null;
        const dragging = ghost?.entry.id === entry.id;
        return (
          <button
            key={entry.id}
            aria-pressed={selected === entry.id}
            onClick={(e) => handleClick(e, entry)}
            onDoubleClick={() => activate(entry)}
            onContextMenu={(e) => handleContextMenu(e, entry)}
            onPointerDown={(e) => beginDragTracking(e, entry)}
            style={pos ? { left: pos.x, top: pos.y } : undefined}
            title={entry.label}
            className={cn(
              "group flex w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-white/12 focus:outline-none cursor-pointer",
              freeMode && "absolute touch-none",
              selected === entry.id && "bg-white/18 ring-1 ring-white/30",
              dragging && "opacity-30",
            )}
          >
            {iconGlyph(entry)}
            {/* Task 94 — w-full + overflow-wrap:anywhere keep long single words
                (e.g. "Kundenbeziehungsmanagement") inside the 84px cell so
                labels wrap/ellipsize instead of overlapping neighbours. */}
            <span className="line-clamp-2 w-full min-w-0 rounded-md px-1 text-center text-[11px] font-medium leading-tight text-white drop-shadow [overflow-wrap:anywhere] group-focus-visible:bg-white/20">
              {entry.label}
            </span>
          </button>
        );
      })}

      {/* drag ghost following the pointer (fixed overlay, never intercepts events) */}
      {ghost && (
        <div aria-hidden className="pointer-events-none fixed z-[9600] w-[84px]" style={{ left: ghost.x, top: ghost.y }}>
          <div
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl p-2 transition-transform duration-100",
              ghost.overTaskbar ? "scale-[0.62] opacity-90" : "scale-105 opacity-95 drop-shadow-2xl",
            )}
          >
            {iconGlyph(ghost.entry)}
            {/* Task 94 — same wrap rules as the grid labels (see above). */}
            <span className="line-clamp-2 w-full min-w-0 rounded-md bg-black/30 px-1 text-center text-[11px] font-medium leading-tight text-white [overflow-wrap:anywhere]">
              {ghost.entry.label}
            </span>
          </div>
        </div>
      )}

      </div>
      )}

      {/* Task 38 — collapsible acrylic sidebar fed by the very same icon
          entries (owner request): compact tiles + labels, rail/expanded
          states, single-click launch, same context-menu contract. */}
      {sidebarOpen && (
        <aside
          aria-label={t("sidebar.title")}
          style={{
            insetInlineStart: startOffset,
            top: topOffset,
            bottom: metrics.taskbarH + 8,
            width: sidebarCollapsed ? 64 : SIDEBAR_W,
          }}
          className="acrylic-strong menu-in win-shadow absolute z-[80] flex flex-col overflow-hidden rounded-2xl border border-border/60 shadow-xl transition-[width] duration-300"
        >
          {/* header: title + count + rail toggle */}
          <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border/60 px-2">
            {!sidebarCollapsed && (
              <>
                <span className="min-w-0 flex-1 truncate px-1 text-xs font-semibold text-foreground/90">
                  {t("sidebar.title")}
                </span>
                <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">
                  {items.length}
                </Badge>
              </>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-expanded={!sidebarCollapsed}
              aria-label={sidebarCollapsed ? t("sidebar.expand") : t("sidebar.collapse")}
              title={sidebarCollapsed ? t("sidebar.expand") : t("sidebar.collapse")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground cursor-pointer"
            >
              {sidebarCollapsed ? (
                <SidebarExpandIcon className="h-4 w-4" aria-hidden />
              ) : (
                <SidebarCollapseIcon className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>

          {/* items — same entries as the desktop grid, new presentation */}
          <nav className="min-h-0 flex-1 overflow-y-auto scrollbar-slim p-2">
            <ul className={cn("flex flex-col gap-0.5", sidebarCollapsed && "items-center")}>
              {items.map((entry) => (
                <li key={entry.id} className="w-full">
                  <button
                    type="button"
                    aria-pressed={selected === entry.id}
                    title={sidebarCollapsed ? entry.label : undefined}
                    onClick={() => {
                      setSelected(entry.id);
                      activate(entry);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelected(entry.id);
                      setMenu({ x: e.clientX, y: e.clientY, entry, source: "sidebar" });
                    }}
                    className={cn(
                      sidebarCollapsed
                        ? "flex h-10 w-10 items-center justify-center rounded-xl"
                        : "flex w-full items-center gap-2.5 rounded-xl p-2 text-start",
                      "transition-colors hover:bg-foreground/8 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected === entry.id && "bg-foreground/10 ring-1 ring-foreground/15",
                    )}
                  >
                    {sidebarGlyph(entry)}
                    {!sidebarCollapsed && (
                      <span className="min-w-0 truncate text-xs font-medium text-foreground/90">
                        {entry.label}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}

      {/* Task 38 — floating view toggle: opens the sidebar / restores the
          desktop icon grid; rides the sidebar edge with a smooth transition.
          Task 40 — owner request: the button shows ONLY its icon; the title
          lives in a beautiful shadcn/ui tooltip (instead of inline text and
          the native title attribute). */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => {
              if (!sidebarOpen) {
                setIconMode("sidebar");
                return;
              }
              /* Task 39 — owner request: returning to the desktop icon view must
                 never resurrect a stale/piled layout. The icons are laid out
                 fresh: sorted by the active language, sequential columns anchored
                 to the start edge (right in RTL, left in LTR) — no manual
                 rearranging needed. Free dragging still works inside the grid
                 session; the next round-trip re-arranges again. */
              resetIconLayout();
              setIconMode("grid");
            }}
            aria-pressed={sidebarOpen}
            aria-label={sidebarOpen ? t("sidebar.toGrid") : t("sidebar.toSidebar")}
            style={{ bottom: metrics.taskbarH + 12, insetInlineStart: toggleStart }}
            className="acrylic-strong win-shadow absolute z-[9300] flex h-10 w-10 items-center justify-center rounded-full border text-foreground/90 shadow-lg transition-[inset-inline-start] duration-300 hover:bg-foreground/10 cursor-pointer"
          >
            <ToggleIcon className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={10} className="rounded-full px-3.5 font-medium">
          {sidebarOpen ? t("sidebar.toGrid") : t("sidebar.toSidebar")}
        </TooltipContent>
      </Tooltip>

      {/* icon context menu: open / pin–unpin taskbar / reset layout */}
      {menu && (
        <FloatingMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            {
              label: t("ctx.open"),
              icon: <ExternalLink className="h-3.5 w-3.5" />,
              onSelect: () => activate(menu.entry),
            },
            pinned.includes(menu.entry.id)
              ? {
                  label: t("ctx.unpinTaskbar"),
                  icon: <PinOff className="h-3.5 w-3.5" />,
                  onSelect: () => {
                    useDesktop.getState().unpinFromTaskbar(menu.entry.id);
                    toast.success(t("taskbar.unpinnedToast"));
                  },
                }
              : {
                  label: t("ctx.pinTaskbar"),
                  icon: <Pin className="h-3.5 w-3.5" />,
                  onSelect: () => {
                    if (pinToTaskbar(menu.entry.id)) toast.success(t("taskbar.pinnedToast"));
                    else toast.info(t("taskbar.alreadyPinned"));
                  },
                },
            ...(freeMode && menu.source === "grid"
              ? [
                  {
                    label: t("ctx.resetLayout"),
                    icon: <RotateCcw className="h-3.5 w-3.5" />,
                    onSelect: () => resetIconLayout(),
                  },
                ]
              : []),
          ]}
        />
      )}
    </>
  );
}

export function Desktop() {
  const t = useT();
  const dir = useSettings((s) => s.dir());
  const locale = useSettings((s) => s.locale);
  const { windows, activeTabId, activateTab, closeWindow, setStartOpen, startOpen } =
    useDesktop();
  const headerDock = useDesktop((s) => s.headerDock);
  const { resolvedTheme } = useTheme();
  /* Task 45 — dfb tree feeds the dynamic window titles/icons (dfb-menu/dfb-form) */
  const dfbTree = useDfb((s) => s.tree);
  const dfbLoad = useDfb((s) => s.load);
  const trMap = useDfbTrMap(); // Task 68
  /* Task 81 — chrome metrics (header/tabbar/taskbar heights) */
  const metrics = useChromeMetrics();

  React.useEffect(() => {
    void dfbLoad();
    void ensureDfbTranslations(); // Task 68 — واکشی یک‌بارهٔ نقشهٔ ترجمه (کش آفلاین)
  }, [dfbLoad]);

  /* Task 94 (خطای hydration در کُنسول مالک) — بازخوانی وضعیت ماندگار کاربر
     پس از mount — همان قرارداد erp.desktop.layout (skipHydration):
     رندر اولِ کلاینت با پیش‌فرض‌ها (fa/rtl) انجام می‌شود و با سرور یکسان است،
     پس hydration هیچ‌گاه mismatch نمی‌دهد (icon toggler/DOM dir/برچسب‌ها)؛
     زبان/انتخاب‌های واقعی کاربر بلافاصله پس از hydration اعمال می‌شود. */
  React.useEffect(() => {
    void Promise.resolve(useSettings.persist.rehydrate());
    void Promise.resolve(useOrgContext.persist.rehydrate());
    void Promise.resolve(useDfbTranslations.persist.rehydrate());
  }, []);

  /* apply locale direction + language to <html> */
  React.useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  /* Task 99 (بازخورد مالک) — عنوان پنجرهٔ مرورگر هم باید با زبان نرم‌افزار
     عوض شود؛ متادیتای layout فقط پیش‌فرض SSR (فارسی) است و در زبان‌های
     دیگر ثابت می‌ماند — این افکت عنوان را با هر تغییر زبان تازه می‌کند. */
  React.useEffect(() => {
    document.title = t("app.docTitle");
  }, [t]);

  /* Task 81 — tab-bar contract: «تب اول صفحه اصلی باشد و فرم از تب دوم باز شود»
     homeActive → the desktop (icons/sidebar) owns the workspace;
     every form lives in its own tab of the strip below the header. */
  const homeActive = activeTabId === HOME_TAB_ID;
  const tabsOpen = windows.length > 0;

  /* resolve every tab's title/icon/content once per render — the strip and
     the workspace panels share the same meta (Task 64 live titles included) */
  const metas = windows.map((win) => resolveWindowMeta(win, t, dfbTree, locale, trMap));

  /* the strip sits under the header (top dock) or beside a vertical one */
  const tabbarStyle: React.CSSProperties =
    headerDock === "top"
      ? { top: metrics.headerH, left: 0, right: 0 }
      : headerDock === "left"
        ? { top: 0, left: metrics.headerH, right: 0 }
        : { top: 0, right: metrics.headerH, left: 0 };

  const panelsStyle: React.CSSProperties = {
    top: metrics.contentTop,
    bottom: metrics.taskbarH + 6,
    left: headerDock === "left" ? metrics.headerH + 8 : 8,
    right: headerDock === "right" ? metrics.headerH + 8 : 8,
  };

  return (
    <DirectionProvider dir={dir}>
      <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "relative h-dvh w-screen overflow-hidden",
          resolvedTheme === "dark" ? "erp-wallpaper-dark" : "erp-wallpaper",
        )}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setStartOpen(false);
        }}
      >
        {/* Task 81 — the desktop (icons + sidebar) is the HOME tab content;
            it yields the workspace while a form tab is active */}
        {homeActive && <DesktopIcons />}

        {/* Task 22 — dockable dashboard header (drag to top / left / right edges) */}
        <DashboardHeader />

        {/* Task 81 — the tab strip below the header; appears with the first
            form tab and disappears when the last one closes */}
        {tabsOpen && (
          <TabBar
            tabs={windows.map((win, i) => ({
              id: win.id,
              title: win.titleOverride ?? metas[i].title,
              icon: metas[i].icon,
            }))}
            activeId={activeTabId}
            homeLabel={t("tabs.home")}
            homeActive={homeActive}
            closeLabel={t("tabs.close")}
            onActivateHome={() => activateTab(HOME_TAB_ID)}
            onActivate={activateTab}
            onClose={closeWindow}
            style={tabbarStyle}
          />
        )}

        {/* Task 81 — workspace panels: every open tab stays MOUNTED (hidden
            while inactive) so unsaved drafts / undo history survive switches;
            panels sit between the strip and the auto-shrunk taskbar */}
        {tabsOpen && (
          <div className="pointer-events-none absolute z-[100]" style={panelsStyle}>
            {windows.map((win, i) => (
              <TabSurface key={win.id} win={win} active={win.id === activeTabId}>
                {metas[i].content}
              </TabSurface>
            ))}
          </div>
        )}

        {startOpen && <StartMenu />}
        <Taskbar />

        <Toaster
          position={dir === "rtl" ? "bottom-left" : "bottom-right"}
          offset={64}
          richColors
          closeButton
        />
      </div>
      </TooltipProvider>
    </DirectionProvider>
  );
}
