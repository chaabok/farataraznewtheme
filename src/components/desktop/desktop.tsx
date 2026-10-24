"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  ListChecks,
  ListTree,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  PinOff,
  RotateCcw,
  Wrench,
} from "lucide-react";
import { useTheme } from "next-themes";
import { DirectionProvider } from "@radix-ui/react-direction";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSettings, useT } from "@/stores/settings-store";
import { useDesktop, type WinState, type WindowKind } from "@/stores/desktop-store";
import { useAppRegistry } from "@/stores/app-registry-store";
import { AppWindow } from "./app-window";
import { AppTile } from "./app-tile";
import { Taskbar } from "./taskbar";
import { DashboardHeader } from "./dashboard-header";
import { StartMenu } from "./start-menu";
import { FloatingMenu } from "./floating-menu";
import { BusinessStructureWindow } from "@/components/erp/business-structure/bs-window";
import { SettingsWindow } from "@/components/erp/settings-window";
import { AppPlaceholderWindow } from "@/components/erp/app-placeholder-window";
import { FormDemoWindow } from "@/components/erp/form-demo-window";
import { TreeDemoWindow } from "@/components/erp/tree-demo-window";
import { FormBuilderWindow } from "@/components/erp/form-builder/form-builder-window";
import { DfbMenuWindow } from "@/components/erp/form-builder/dfb-menu-window";
import { DfbFormRuntime } from "@/components/erp/form-builder/dfb-form-runtime";
import { FormDesignStudio } from "@/components/erp/form-builder/dfb-studio";
import { RecordsListWindow } from "@/components/erp/form-builder/records-list-window";
import { DfbGlyph } from "@/components/erp/form-builder/dfb-dialogs";
import {
  useDfb, findMenuNode, findFormInTree, findMenuNodeByAppKey,
  dfbNodeTitle, dfbFormTitle,
} from "@/stores/dfb-store";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

interface StaticWindowMeta {
  titleKey: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

/* Task 45 — dfb-menu/dfb-form resolve dynamically in resolveWindowMeta,
   so the static map only covers the fixed kinds (Partial on purpose). */
const STATIC_WINDOWS: Partial<Record<Exclude<WindowKind, "app">, StaticWindowMeta>> = {
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
};

function resolveWindowMeta(
  win: WinState,
  t: ReturnType<typeof useT>,
  dfbTree: ReturnType<typeof useDfb.getState>["tree"],
  locale: string,
) {
  if (win.kind === "app") {
    const appKey = win.appKey ?? "";
    return {
      title: t(`app.${appKey}` as never),
      icon: <AppTile appKey={appKey} className="h-5 w-5 rounded-md" iconClass="h-3 w-3" />,
      content: <AppPlaceholderWindow appKey={appKey} />,
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
        ? dfbNodeTitle(node, t, locale)
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
      title: form ? dfbFormTitle(form, locale) : t("dfb.formNotFound"),
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
        ? `${t("dfb.list.title")} — ${dfbFormTitle(form, locale)}`
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
        ? `${t("dfb.studio.title")} — ${dfbFormTitle(form, locale)}`
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

/* ---------------- Task 19 — desktop icon drag & drop geometry ---------------- */

const ICON_W = 84;
const ICON_H = 100;
const GRID_STEP_X = 88;
const GRID_STEP_Y = 106;
const GRID_PAD = 8;
/* Task 22: header thickness = 52 × 0.7 = 36.4px (owner height contract).
   Docked header reserves its strip: layers below/beside it get this + the 8px pad. */
const HEADER_THICK = 36.4;
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
         mixed alphabetical ordering via the language collator below) */
      ...dfbUserIcons.map((n) => ({
        id: `dfb-menu-${n.id}`,
        kind: "dfb-menu" as WindowKind,
        appKey: String(n.id),
        label: n.title,
        iconKey: n.iconKey,
      })),
    ];
    /* Task 39 — owner request: order by the active language's collation in
       BOTH presentations, so the desktop grid and the sidebar always tell
       the same story (labels are unique, the id is just a stable tiebreak). */
    return base.sort(
      (a, b) => collator.compare(a.label, b.label) || collator.compare(a.id, b.id),
    );
  }, [apps, dfbUserIcons, t, collator]);

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
  const startOffset = startDockedHeader ? HEADER_THICK + GRID_PAD : GRID_PAD;
  const topOffset = headerDock === "top" ? HEADER_THICK + GRID_PAD : GRID_PAD;
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
        top: headerDock === "top" ? HEADER_THICK + GRID_PAD : GRID_PAD,
        bottom: 60,
        left: headerDock === "left" ? HEADER_THICK + GRID_PAD : GRID_PAD,
        right: headerDock === "right" ? HEADER_THICK + GRID_PAD : GRID_PAD,
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
            className={cn(
              "group flex w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-white/12 focus:outline-none cursor-pointer",
              freeMode && "absolute touch-none",
              selected === entry.id && "bg-white/18 ring-1 ring-white/30",
              dragging && "opacity-30",
            )}
          >
            {iconGlyph(entry)}
            <span className="line-clamp-2 rounded-md px-1 text-center text-[11px] font-medium leading-tight text-white drop-shadow group-focus-visible:bg-white/20">
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
            <span className="line-clamp-2 rounded-md bg-black/30 px-1 text-center text-[11px] font-medium leading-tight text-white">
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
            bottom: 60,
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
            style={{ bottom: 64, insetInlineStart: toggleStart }}
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
  const { windows, setStartOpen, startOpen } = useDesktop();
  const headerDock = useDesktop((s) => s.headerDock);
  const { resolvedTheme } = useTheme();
  /* Task 45 — dfb tree feeds the dynamic window titles/icons (dfb-menu/dfb-form) */
  const dfbTree = useDfb((s) => s.tree);
  const dfbLoad = useDfb((s) => s.load);

  React.useEffect(() => {
    void dfbLoad();
  }, [dfbLoad]);

  /* apply locale direction + language to <html> */
  React.useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

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
        <DesktopIcons />

        {/* Task 22 — dockable dashboard header (drag to top / left / right edges) */}
        <DashboardHeader />

        {/* windows layer — clipped around the docked header strip + footer (Task 22);
            pointer-events-none so empty areas fall through to desktop icons */}
        <div
          className="pointer-events-none absolute z-[100]"
          style={{
            top: headerDock === "top" ? HEADER_THICK : 0,
            left: headerDock === "left" ? HEADER_THICK : 0,
            right: headerDock === "right" ? HEADER_THICK : 0,
            bottom: 52,
          }}
        >
          {windows.map((win) => {
            const meta = resolveWindowMeta(win, t, dfbTree, locale);
            return (
              <AppWindow key={win.id} win={win} title={win.titleOverride ?? meta.title} icon={meta.icon}>
                {meta.content}
              </AppWindow>
            );
          })}
        </div>

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
