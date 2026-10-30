"use client";

import * as React from "react";
import { erpZoom } from "@/lib/erp-zoom";

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

/**
 * Tiny floating context menu (Task 19) for desktop icons (open / pin / reset layout)
 * and taskbar dock icons (unpin). Closes on outside pointerdown or Escape.
 */
export function FloatingMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x, y });

  /* keep the menu inside the viewport — Task 160: clientX/Y برحسب visual است و
     چون <html> زوم داخلی دارد، left/top باید به فضای محلی (تقسیم بر زوم) برود */
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const z = erpZoom();
    const r = el.getBoundingClientRect();
    setPos({
      x: Math.max(8 / z, Math.min(x / z, (window.innerWidth - r.width - 8) / z)),
      y: Math.max(8 / z, Math.min(y / z, (window.innerHeight - r.height - 8) / z)),
    });
  }, [x, y]);

  React.useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      dir="auto"
      style={{ left: pos.x, top: pos.y }}
      className="acrylic-strong menu-in fixed z-[9800] min-w-44 rounded-xl border bg-popover/95 p-1.5 text-popover-foreground shadow-xl"
    >
      {items.map((it) => (
        <button
          key={it.label}
          role="menuitem"
          onClick={() => {
            it.onSelect();
            onClose();
          }}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-xs font-medium transition-colors hover:bg-foreground/10 focus:bg-foreground/10 focus:outline-none"
        >
          {it.icon && (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">
              {it.icon}
            </span>
          )}
          <span className="truncate">{it.label}</span>
        </button>
      ))}
    </div>
  );
}
