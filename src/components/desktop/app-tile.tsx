"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getAppIcon } from "@/lib/app-catalog";

/** Gradient glyph tile for an ERP app (used by desktop icons, start menu, window headers). */
export function AppTile({
  appKey,
  className,
  iconClass,
  style,
  iconStyle,
}: {
  appKey: string;
  className?: string;
  iconClass?: string;
  /* Task 19: additive sizing hooks for the smart-sizing footer dock (§5.1-style additive change) */
  style?: React.CSSProperties;
  iconStyle?: React.CSSProperties;
}) {
  const glyph = getAppIcon(appKey);
  const Icon = glyph?.Icon;
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
        glyph?.tile ?? "from-slate-400 to-slate-600",
        className ?? "h-9 w-9",
      )}
    >
      {Icon ? (
        <Icon style={iconStyle} className={iconClass ?? "h-5 w-5"} />
      ) : (
        <span className="text-[10px]">···</span>
      )}
    </span>
  );
}
