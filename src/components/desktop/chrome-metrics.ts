"use client";

/**
 * Task 81 — dashboard chrome metrics (owner request: tab bar under the header).
 *
 * When the first form opens, a tab bar appears below the dashboard header and —
 * per the owner contract — the header and footer automatically REDUCE their
 * height to give the strip room without starving the workspace:
 *
 *   idle (no tabs)                    tab bar open (≥1 form tab)
 *   ─────────────────────────────     ─────────────────────────────
 *   header  36.4px  (52 × 0.7)        header  28px
 *   tabbar  —                         tabbar  34px
 *   footer  52px                      footer  38px
 *
 * Every surface that positions against the chrome (desktop icon layer, side
 * dock offsets, windows→tabs layer, start menu, toaster) reads the live
 * numbers from useChromeMetrics so the whole shell breathes together.
 */

import { useDesktop } from "@/stores/desktop-store";

/** owner height contract of Task 22 (52 × 0.7) while no tab bar is open */
export const HEADER_THICK = 36.4;
/** compact header thickness while the tab bar is open (Task 81) */
export const HEADER_THICK_COMPACT = 28;
/** height of the Task 81 tab strip below the header */
export const TABBAR_H = 34;
/** taskbar height while no tab bar is open */
export const TASKBAR_H = 52;
/** compact taskbar height while the tab bar is open (Task 81) */
export const TASKBAR_H_COMPACT = 38;

export interface ChromeMetrics {
  /** true while at least one form tab is open (the strip is visible) */
  tabbarOpen: boolean;
  /** current header thickness (top dock height / side dock width) */
  headerH: number;
  /** current tab strip height (0 when hidden) */
  tabbarH: number;
  /** current taskbar height */
  taskbarH: number;
  /** distance from the top edge to the workspace (header + tab bar) */
  contentTop: number;
}

export function useChromeMetrics(): ChromeMetrics {
  const tabbarOpen = useDesktop((s) => s.windows.length > 0);
  const headerH = tabbarOpen ? HEADER_THICK_COMPACT : HEADER_THICK;
  const taskbarH = tabbarOpen ? TASKBAR_H_COMPACT : TASKBAR_H;
  const tabbarH = tabbarOpen ? TABBAR_H : 0;
  return { tabbarOpen, headerH, tabbarH, taskbarH, contentTop: headerH + tabbarH };
}
