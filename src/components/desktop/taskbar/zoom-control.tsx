"use client";

import * as React from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/stores/settings-store";
import {
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  STEP_ZOOM,
  useErpZoom,
  zoomIn,
  zoomOut,
  resetZoom,
} from "@/lib/erp-zoom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Task 160 — دکمهٔ زوم داخلی نوار وضعیت: درصد جاری را نشان می‌دهد و با کلیک،
 * کنترل کم/زیاد کردن (− / درصد / +) و بازنشانی به ۷۵٪ را باز می‌کند.
 */
export function ZoomControl() {
  const t = useT();
  const zoom = useErpZoom();
  const pct = Math.round(zoom * 100);

  const stepBtn =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 text-foreground/75 transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${t("taskbar.zoom")} — ${pct}%`}
          title={t("taskbar.zoom")}
          className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors hover:bg-foreground/10 cursor-pointer"
        >
          <ZoomIn className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span dir="ltr" className="tabular-nums" suppressHydrationWarning>
            {pct}%
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2">
        <div className="flex items-center justify-between gap-1.5">
          <button
            type="button"
            aria-label={t("taskbar.zoomOut")}
            title={t("taskbar.zoomOut")}
            disabled={zoom - STEP_ZOOM < MIN_ZOOM - 1e-9}
            onClick={zoomOut}
            className={stepBtn}
          >
            <ZoomOut className="h-4 w-4" aria-hidden />
          </button>
          <span
            dir="ltr"
            aria-live="polite"
            suppressHydrationWarning
            className="min-w-14 text-center text-sm font-bold tabular-nums text-foreground"
          >
            {pct}%
          </span>
          <button
            type="button"
            aria-label={t("taskbar.zoomIn")}
            title={t("taskbar.zoomIn")}
            disabled={zoom + STEP_ZOOM > MAX_ZOOM + 1e-9}
            onClick={zoomIn}
            className={stepBtn}
          >
            <ZoomIn className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <button
          type="button"
          onClick={resetZoom}
          className={cn(
            "mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground cursor-pointer",
            Math.abs(zoom - DEFAULT_ZOOM) < 1e-9 && "hidden",
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          {t("taskbar.zoomReset")}
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
