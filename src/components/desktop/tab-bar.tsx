"use client";

import * as React from "react";
import { House, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Task 81 — the desktop tab strip (owner request: «زیر هدر دسکتاپ»).
 *
 * Design language — a browser-grade strip dressed in the ERP shell:
 *   · glass (acrylic) rail docked under the header, tabs grow from its edge;
 *   · the ACTIVE tab lifts out of the glass into a solid surface and melts
 *     into the workspace panel below (no seam — the gradient underline rides
 *     exactly on the rail's bottom border);
 *   · the home tab («صفحه اصلی») is pinned first, unclosable, brand-tinted;
 *   · every form tab shows the form's real icon + live title (Task 64
 *     record-counts included) and a close dot that blushes red on hover;
 *   · entrance = a soft rise (tab-in), interactions = 200ms ease.
 */

export interface TabBarTab {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface TabBarProps {
  tabs: TabBarTab[];
  activeId: string;
  homeLabel: string;
  homeActive: boolean;
  closeLabel: string;
  onActivateHome: () => void;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** the gradient seam between the active tab and the workspace panel */
const UNDERLINE =
  "pointer-events-none absolute inset-x-2 bottom-0 h-[2.5px] rounded-t-full bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-400 shadow-[0_-1px_6px_oklch(0.72_0.15_165/0.45)]";

const TAB_SHAPE =
  "tab-in relative flex h-[27px] shrink-0 cursor-pointer select-none items-center gap-1.5 self-end rounded-t-[10px] px-2.5 transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

const TAB_IDLE = "text-muted-foreground/90 hover:bg-foreground/[0.07] hover:text-foreground";

const TAB_ACTIVE =
  "bg-background text-foreground shadow-[0_-3px_12px_-6px_oklch(0_0_0/0.35)]";

/** downscale the h-5 window glyphs (resolveWindowMeta) into 16px tab glyphs */
const TAB_ICON_WRAP =
  "flex h-4 w-4 shrink-0 items-center justify-center [&>span]:h-4 [&>span]:w-4 [&>span]:rounded-[6px] [&>svg]:h-3.5 [&>svg]:w-3.5";

export function TabBar({
  tabs,
  activeId,
  homeLabel,
  homeActive,
  closeLabel,
  onActivateHome,
  onActivate,
  onClose,
  className,
  style,
}: TabBarProps) {
  return (
    <div
      role="tablist"
      aria-label={homeLabel}
      data-tabbar
      style={style}
      className={cn(
        "acrylic-strong menu-in fixed z-[9190] flex h-[34px] items-stretch gap-1 overflow-hidden border-b border-foreground/10 px-2 shadow-sm",
        className,
      )}
    >
      {/* ── home tab (pinned first, unclosable) ─────────────────────────── */}
      <button
        type="button"
        role="tab"
        aria-selected={homeActive}
        title={homeLabel}
        onClick={onActivateHome}
        className={cn(
          TAB_SHAPE,
          homeActive ? TAB_ACTIVE : TAB_IDLE,
          "font-semibold",
        )}
      >
        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-[5px] bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-sm">
          <House className="h-2.5 w-2.5" aria-hidden />
        </span>
        <span className="max-w-40 truncate text-[11px] leading-none">{homeLabel}</span>
        {homeActive && <span aria-hidden className={UNDERLINE} />}
      </button>

      <span aria-hidden className="my-auto h-4 w-px shrink-0 bg-foreground/15" />

      {/* ── form tabs (scrollable rail) ─────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={active}
              tabIndex={0}
              title={tab.title}
              onClick={() => onActivate(tab.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onActivate(tab.id);
                }
              }}
              className={cn(TAB_SHAPE, "group", active ? TAB_ACTIVE : TAB_IDLE)}
            >
              <span className={TAB_ICON_WRAP}>{tab.icon}</span>
              <span className="max-w-36 truncate text-[11px] font-medium leading-none">
                {tab.title}
              </span>
              <button
                type="button"
                aria-label={closeLabel}
                title={closeLabel}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className={cn(
                  "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-muted-foreground/70 transition-all duration-150 hover:bg-red-500/15 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
                  active ? "opacity-80" : "opacity-0 group-hover:opacity-80",
                )}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
              {active && <span aria-hidden className={UNDERLINE} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
