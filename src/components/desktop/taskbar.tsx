"use client";

import * as React from "react";
import { Search, Network, Languages, Pin, PinOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSettings, useT } from "@/stores/settings-store";
import { useDesktop, type WindowKind } from "@/stores/desktop-store";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n/config";
import { AppTile } from "./app-tile";
import { FloatingMenu } from "./floating-menu";
import { useDfb, findMenuNode } from "@/stores/dfb-store";
import { DfbGlyph } from "@/components/erp/form-builder/dfb-dialogs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface PinnedMeta {
  kind: WindowKind;
  appKey?: string;
  titleKey: string;
}

function pinnedMeta(id: string): PinnedMeta {
  if (id === "business-structure") return { kind: "business-structure", titleKey: "menus.businessStructure" };
  if (id === "settings") return { kind: "settings", titleKey: "settings.title" };
  /* Task 45 — user-created dfb main icons pinned to the dock */
  if (id.startsWith("dfb-menu-")) {
    const menuId = Number(id.slice("dfb-menu-".length));
    return { kind: "dfb-menu", appKey: String(menuId), titleKey: `dfb-menu-${menuId}` };
  }
  return { kind: "app", appKey: id, titleKey: `app.${id}` };
}

/* dock tile glyph — scales with the smart size (Task 19) */
function PinnedGlyph({ id, size }: { id: string; size: number }) {
  const tile = Math.round(size * 0.82);
  const glyph = Math.max(10, Math.round(tile * 0.58));
  if (id === "business-structure") {
    return (
      <span
        style={{ width: tile, height: tile }}
        className="flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md"
      >
        <Network style={{ width: glyph, height: glyph }} />
      </span>
    );
  }
  /* Task 45 — dfb icon glyph by its stored iconKey */
  if (id.startsWith("dfb-menu-")) {
    const menuId = Number(id.slice("dfb-menu-".length));
    const node = findMenuNode(useDfb.getState().tree, menuId);
    return (
      <DfbGlyph
        iconKey={node?.iconKey ?? "folder"}
        className="rounded-lg"
        iconClass=""
        style={{ width: tile, height: tile }}
      />
    );
  }
  return (
    <AppTile
      appKey={id}
      className="rounded-lg"
      style={{ width: tile, height: tile }}
      iconStyle={{ width: glyph, height: glyph }}
    />
  );
}

function WinLogo() {
  return (
    <span className="grid h-5 w-5 grid-cols-2 gap-[2.5px]">
      <span className="rounded-[3px] bg-sky-400" />
      <span className="rounded-[3px] bg-sky-300" />
      <span className="rounded-[3px] bg-sky-300" />
      <span className="rounded-[3px] bg-sky-400" />
    </span>
  );
}

/* hydration-safe clock: server snapshot = 0, client ticks every second */
function subscribeClock(onChange: () => void) {
  const id = setInterval(onChange, 1_000);
  return () => clearInterval(id);
}
function clientSeconds() {
  return Math.floor(Date.now() / 1_000);
}
function serverSeconds() {
  return 0;
}

const DOCK_GAP = 4;

export function Taskbar() {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const setLocale = useSettings((s) => s.setLocale);
  const { windows, openWindow, focusWindow, minimizeWindow, startOpen, setStartOpen } =
    useDesktop();
  const pinned = useDesktop((s) => s.pinned);
  const dragOverTaskbar = useDesktop((s) => s.dragOverTaskbar);
  const unpinFromTaskbar = useDesktop((s) => s.unpinFromTaskbar);
  const seconds = React.useSyncExternalStore(subscribeClock, clientSeconds, serverSeconds);
  const now = seconds > 0 ? new Date(seconds * 1_000) : null;
  const [menu, setMenu] = React.useState<{ x: number; y: number; id: string } | null>(null);

  /* measured width of the footer dock drives the smart sizing */
  const dockRef = React.useRef<HTMLDivElement>(null);
  const [dockW, setDockW] = React.useState(0);
  React.useEffect(() => {
    const el = dockRef.current;
    if (!el) return;
    const update = () => setDockW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* §Task-19 smart sizing: the more icons are pinned in the dashboard footer,
     the smaller every icon becomes — continuously, clamped to a usable range. */
  const count = pinned.length;
  const size =
    count === 0
      ? 40
      : Math.max(22, Math.min(40, Math.floor((dockW - 8 - (count - 1) * DOCK_GAP) / count) || 22));

  const time = now ? now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) : "--:--";
  const date = now
    ? now.toLocaleDateString(locale, { year: "numeric", month: "numeric", day: "numeric" })
    : "";

  const toggleId = (id: string) => {
    const meta = pinnedMeta(id);
    const win = windows.find((w) => w.kind === meta.kind && w.appKey === meta.appKey);
    if (!win) {
      openWindow(meta.kind, meta.appKey);
      return;
    }
    if (win.minimized) {
      focusWindow(win.id);
      useDesktop.setState((s) => ({
        windows: s.windows.map((w) => (w.id === win.id ? { ...w, minimized: false } : w)),
      }));
      return;
    }
    const isTop = Math.max(...windows.filter((w) => !w.minimized).map((w) => w.z)) === win.z;
    if (isTop && windows.filter((w) => !w.minimized).length > 1) minimizeWindow(win.id);
    else focusWindow(win.id);
  };

  return (
    <div
      data-taskbar
      className="taskbar-shadow acrylic-strong absolute inset-x-0 bottom-0 z-[9000] flex h-[52px] items-center gap-1.5 px-2 sm:px-3"
    >
      {/* start + search */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          aria-label="Start"
          onClick={() => setStartOpen(!startOpen)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-foreground/10 cursor-pointer",
            startOpen && "bg-foreground/10",
          )}
        >
          <WinLogo />
        </button>

        <div className="mx-1 hidden items-center gap-1 rounded-full acrylic px-3 py-1.5 sm:flex">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="max-w-40 truncate text-xs text-muted-foreground">
            {t("taskbar.search")}
          </span>
        </div>
      </div>

      {/* dashboard footer dock — icons dragged from the desktop land here (Task 19) */}
      <div
        ref={dockRef}
        aria-label={t("startmenu.pinned")}
        className={cn(
          "no-scrollbar relative flex min-w-0 flex-1 items-center overflow-x-auto rounded-xl py-1.5 transition-all",
          count > 0 && "px-1",
          dragOverTaskbar && "bg-primary/15 ring-2 ring-primary/50",
        )}
      >
        <div className="mx-auto flex items-center" style={{ gap: DOCK_GAP }}>
          {count === 0 && <Pin className="h-4 w-4 text-muted-foreground/40" />}
          {pinned.map((id) => {
            const meta = pinnedMeta(id);
            const win = windows.find((w) => w.kind === meta.kind && w.appKey === meta.appKey);
            const running = Boolean(win) && !win?.minimized;
            const dotW = Math.max(5, Math.round(size * 0.3));
            /* Task 45 — dfb pins show their DB title (not a dictionary key) */
            const dfbLabel = id.startsWith("dfb-menu-")
              ? findMenuNode(useDfb.getState().tree, Number(id.slice("dfb-menu-".length)))?.title
              : undefined;
            const pinLabel = dfbLabel ?? t(meta.titleKey as never);
            return (
              <button
                key={id}
                title={pinLabel}
                aria-label={pinLabel}
                onClick={() => toggleId(id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({ x: e.clientX, y: e.clientY, id });
                }}
                style={{ width: size, height: size }}
                className={cn(
                  "relative flex shrink-0 items-center justify-center rounded-lg transition-all hover:bg-foreground/10 cursor-pointer",
                  running && "bg-foreground/8",
                )}
              >
                <PinnedGlyph id={id} size={size} />
                {win && (
                  <span
                    style={{ width: win.minimized ? Math.max(3, Math.round(dotW * 0.45)) : dotW }}
                    className={cn(
                      "absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all",
                      running ? "bg-primary" : "bg-muted-foreground/70",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* tray */}
      <div className="flex shrink-0 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={t("common.language")}
              className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors hover:bg-foreground/10 cursor-pointer"
            >
              <Languages className="h-4 w-4 text-muted-foreground" />
              {locale.toUpperCase()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto scrollbar-slim">
            {LOCALES.map((l) => (
              <DropdownMenuItem
                key={l}
                onClick={() => setLocale(l as Locale)}
                className={cn(locale === l && "bg-accent font-semibold")}
              >
                <span className="w-8 font-mono text-[10px] text-muted-foreground">{l}</span>
                {LOCALE_NAMES[l as Locale]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-col items-end leading-tight" dir="ltr">
          <span className="text-xs font-medium tabular-nums">{time}</span>
          <span className="text-[10px] text-muted-foreground tabular-nums">{date}</span>
        </div>
      </div>

      {/* drop hint while a desktop icon hovers over the footer */}
      {dragOverTaskbar && (
        <div
          dir="auto"
          className="acrylic menu-in pointer-events-none absolute -top-9 left-1/2 z-[9100] -translate-x-1/2 whitespace-nowrap rounded-full border bg-background/90 px-3 py-1 text-[11px] font-medium shadow-md"
        >
          {t("taskbar.dropHint")}
        </div>
      )}

      {/* dock icon context menu: unpin */}
      {menu && (
        <FloatingMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            {
              label: t("ctx.unpinTaskbar"),
              icon: <PinOff className="h-3.5 w-3.5" />,
              onSelect: () => {
                unpinFromTaskbar(menu.id);
                toast.success(t("taskbar.unpinnedToast"));
              },
            },
          ]}
        />
      )}
    </div>
  );
}
