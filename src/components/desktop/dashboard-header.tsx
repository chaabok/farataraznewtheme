"use client";

import * as React from "react";
import {
  CalendarDays,
  GripHorizontal,
  GripVertical,
  LayoutDashboard,
  PanelLeft,
  PanelRight,
  PanelTop,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSettings, useT } from "@/stores/settings-store";
import { useDesktop, type HeaderDock } from "@/stores/desktop-store";
import { FloatingMenu } from "./floating-menu";
import { OrgSelectors } from "./org-selectors";

/* Task 22 — dockable dashboard header (owner re-spec of Task 21):
   • "top"          → horizontal bar spanning the FULL page width,
                      height exactly 30% less than the 52px footer (52 × 0.7 = 36.4px)
   • "left"/"right" → vertical strip spanning the full desktop height (thickness 36.4px)
   The user drags the bar with the mouse; a live preview highlights the target edge
   (pointer x < 30% → left, > 70% → right, otherwise top) and release commits the dock.
   The dock persists in `erp.desktop.layout` (headerDock). */

const THICK = 36.4; /* 52 × 0.7 — owner height contract */
const TASKBAR_H = 52; /* keep the footer visible under vertical docks (§7.7) */
const DRAG_THRESHOLD = 6;

function zoneFor(x: number, vw: number): HeaderDock {
  if (x < vw * 0.3) return "left";
  if (x > vw * 0.7) return "right";
  return "top";
}

/* hydration-safe clock (same pattern as the taskbar): server snapshot = 0 */
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

export function DashboardHeader() {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const dock = useDesktop((s) => s.headerDock);
  const setHeaderDock = useDesktop((s) => s.setHeaderDock);
  const setStartOpen = useDesktop((s) => s.setStartOpen);

  /* SSR-safe: wait for the persisted layout rehydrate, then reveal the bar */
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    let alive = true;
    /* rehydrate() is typed `void | Promise<void>` in this zustand version */
    Promise.resolve(useDesktop.persist.rehydrate()).then(() => {
      if (alive) setMounted(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  /* narrow viewports get the compact content (icon search, no badge) */
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const vertical = dock !== "top";
  const barRef = React.useRef<HTMLElement>(null);

  /* live drag state: pointer-follow position + grab offset; zone = predicted dock */
  const [drag, setDrag] = React.useState<{ x: number; y: number } | null>(null);
  const [zone, setZone] = React.useState<HeaderDock>("top");
  const suppressClickRef = React.useRef(false);
  const [menu, setMenu] = React.useState<{ x: number; y: number } | null>(null);

  const beginDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const bar = barRef.current?.getBoundingClientRect();
    if (!bar) return;
    const grabX = e.clientX - bar.left;
    const grabY = e.clientY - bar.top;
    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    let active = false;
    let target: HeaderDock = dock;

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (!active && Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
      active = true;
      target = zoneFor(ev.clientX, window.innerWidth);
      setZone(target);
      setDrag({ x: ev.clientX - grabX, y: ev.clientY - grabY });
    };
    const finish = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      if (active) {
        /* a real drag happened — swallow the trailing click on child buttons */
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
        if (commit) setHeaderDock(target);
      }
      setDrag(null);
    };
    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId === pointerId) finish(true);
    };
    const onCancel = (ev: PointerEvent) => {
      if (ev.pointerId === pointerId) finish(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

  /* hydration-safe date — the footer shows the time, the header shows the weekday */
  const seconds = React.useSyncExternalStore(subscribeClock, clientSeconds, serverSeconds);
  const now = seconds > 0 ? new Date(seconds * 1_000) : null;
  const dateLong = now
    ? now.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })
    : "";
  const dateShort = now
    ? now.toLocaleDateString(locale, { day: "numeric", month: "short" })
    : "";

  if (!mounted) return null;

  const dragging = drag !== null;

  /* ---------- shared content pieces (used by the docked bar AND the drag ghost) ---------- */

  const grip = (
    <button
      type="button"
      aria-label={t("header.dragHint")}
      title={t("header.dragHint")}
      onClick={() => toast.info(t("header.dragHint"))}
      className="flex h-6 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
    >
      {vertical ? <GripHorizontal className="h-3.5 w-3.5" /> : <GripVertical className="h-3.5 w-3.5" />}
    </button>
  );

  const brandTile = (
    <span
      title={t("app.name")}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-md"
    >
      <LayoutDashboard className="h-3.5 w-3.5" />
    </span>
  );

  const searchBtn = vertical || narrow ? (
    <button
      type="button"
      onClick={() => setStartOpen(true)}
      title={t("header.search")}
      aria-label={t("header.search")}
      className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground/[0.06] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
    >
      <Search className="h-3 w-3" />
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setStartOpen(true)}
      title={t("header.search")}
      aria-label={t("header.search")}
      className="flex h-6 min-w-0 cursor-pointer items-center gap-1.5 rounded-full bg-foreground/[0.06] px-3 text-[11px] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
    >
      <Search className="h-3 w-3 shrink-0" />
      <span className="max-w-40 truncate">{t("header.search")}</span>
    </button>
  );

  const dateEl = vertical ? (
    <span
      className="flex shrink-0 flex-col items-center gap-1.5 pb-1 text-foreground/80"
      title={dateLong}
    >
      <CalendarDays className="h-3 w-3 text-muted-foreground" />
      <span style={{ writingMode: "vertical-rl" }} className="text-[10px] tabular-nums">
        {dateLong}
      </span>
    </span>
  ) : (
    <span
      className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-foreground/80"
      title={dateLong}
    >
      <CalendarDays className="h-3 w-3 text-muted-foreground" />
      <span className="tabular-nums">{narrow ? dateShort : dateLong}</span>
    </span>
  );

  const content = vertical ? (
    <>
      {grip}
      {brandTile}
      <span className="my-1 h-px w-4 shrink-0 bg-foreground/15" aria-hidden />
      {searchBtn}
      {/* Task 78 — فیلدهای آبشاری سطح سازمانی (شرکت/شعبه/نمایندگی/فروشگاه) */}
      <OrgSelectors vertical={vertical} narrow={narrow} />
      <span className="min-h-2 flex-1" aria-hidden />
      {dateEl}
    </>
  ) : (
    <>
      {grip}
      {brandTile}
      <span className="truncate text-xs font-semibold text-foreground/95">
        {t("app.shortName")}
      </span>
      {!narrow && (
        <span className="shrink-0 rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary">
          {t("header.dashboard")}
        </span>
      )}
      <span className="mx-1 hidden h-4 w-px shrink-0 bg-foreground/15 sm:block" aria-hidden />
      {searchBtn}
      {/* Task 78 — فیلدهای آبشاری سطح سازمانی (شرکت/شعبه/نمایندگی/فروشگاه)؛
          انتخاب هر سطح، نمایش اطلاعات فرم‌ها را در همان سطح فیلتر می‌کند */}
      <OrgSelectors vertical={vertical} narrow={narrow} />
      <span className="min-w-2 flex-1" aria-hidden />
      {dateEl}
    </>
  );

  /* ---------- geometry ---------- */

  const dockedStyle: React.CSSProperties =
    dock === "top"
      ? { top: 0, left: 0, right: 0, height: THICK }
      : { top: 0, bottom: TASKBAR_H, width: THICK, ...(dock === "left" ? { left: 0 } : { right: 0 }) };

  return (
    <>
      {/* docked bar (hidden while its ghost follows the pointer) */}
      <header
        key={dock}
        ref={barRef}
        data-desktop-header
        data-dock={dock}
        onPointerDown={beginDrag}
        onDoubleClick={() => {
          if (!suppressClickRef.current) setHeaderDock("top"); /* snap back to top */
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu({ x: e.clientX, y: e.clientY });
        }}
        onClickCapture={(e) => {
          if (suppressClickRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        style={dockedStyle}
        className={cn(
          "acrylic menu-in fixed z-[9200] flex select-none items-center border-foreground/10 shadow-sm",
          vertical ? "flex-col gap-1.5 px-1 py-2" : "flex-row gap-2 px-2 sm:px-3",
          dock === "top" && "border-b",
          dock === "left" && "border-r",
          dock === "right" && "border-l",
          dragging && "pointer-events-none opacity-0",
        )}
      >
        {content}
      </header>

      {/* while dragging: target-edge preview + ghost following the pointer */}
      {drag && (
        <>
          <div
            aria-hidden
            className="menu-in pointer-events-none fixed z-[9150] bg-primary/12 ring-2 ring-inset ring-primary/60"
            style={
              zone === "top"
                ? { top: 0, left: 0, right: 0, height: THICK }
                : { top: 0, bottom: TASKBAR_H, width: THICK, ...(zone === "left" ? { left: 0 } : { right: 0 }) }
            }
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                dir="auto"
                className="acrylic whitespace-nowrap rounded-full border bg-background/90 px-3 py-1 text-[11px] font-medium shadow-md"
              >
                {t("header.dropHint")}
              </span>
            </div>
          </div>

          <div aria-hidden className="pointer-events-none fixed z-[9600]" style={{ left: drag.x, top: drag.y }}>
            <div
              className={cn(
                "acrylic flex items-center rounded-xl border border-foreground/10 shadow-2xl ring-2 ring-primary/50",
                vertical ? "w-[36.4px] flex-col gap-1.5 px-1 py-2" : "h-[36.4px] gap-2 px-2",
              )}
            >
              {content}
            </div>
          </div>
        </>
      )}

      {/* context menu: dock to top / left / right */}
      {menu && (
        <FloatingMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            {
              label: t("header.dockTop"),
              icon: <PanelTop className="h-3.5 w-3.5" />,
              onSelect: () => setHeaderDock("top"),
            },
            {
              label: t("header.dockLeft"),
              icon: <PanelLeft className="h-3.5 w-3.5" />,
              onSelect: () => setHeaderDock("left"),
            },
            {
              label: t("header.dockRight"),
              icon: <PanelRight className="h-3.5 w-3.5" />,
              onSelect: () => setHeaderDock("right"),
            },
          ]}
        />
      )}
    </>
  );
}
