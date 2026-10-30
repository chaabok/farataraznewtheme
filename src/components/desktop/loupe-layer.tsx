"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { erpZoom } from "@/lib/erp-zoom";
import { useLoupe } from "@/stores/loupe-store";
import { cn } from "@/lib/utils";

/**
 * Task 160 — ذره‌بین نرم‌افزار (لوپ)
 *
 * با دکمهٔ نوار وضعیت فعال می‌شود؛ سپس هر عنصری که نشانگر روی آن قرار بگیرد
 * با zoom ۱٫۵ برابر بزرگ می‌شود (ویژگی CSS zoom ⇒ متن واضح، بدون شکستن
 * transform های موجود) + حلقهٔ ذره‌بین دنبال‌کنندهٔ نشانگر. خروج با Esc یا
 * کلیک دوباره روی همان دکمه.
 *
 * نکتهٔ مختصات: چون <html> زوم داخلی دارد، لِنز (fixed) با counter-zoom
 * رندر می‌شود تا مختصات visual پوینتر مستقیم روی آن بنشیند.
 */

const LOUPE_FACTOR = 1.5;

interface Saved {
  el: HTMLElement;
  zoom: string;
  outline: string;
  outlineOffset: string;
}

export function LoupeLayer() {
  const active = useLoupe((s) => s.active);
  const [mounted, setMounted] = React.useState(false);
  const lensRef = React.useRef<HTMLDivElement>(null);
  const savedRef = React.useRef<Saved | null>(null);
  const lastPoint = React.useRef<{ x: number; y: number } | null>(null);
  const rafRef = React.useRef(0);

  React.useEffect(() => setMounted(true), []);

  /* پاک‌سازی بزرگ‌نمایی عنصر قبلی */
  const clearMagnify = React.useCallback(() => {
    const s = savedRef.current;
    if (!s) return;
    s.el.style.zoom = s.zoom;
    s.el.style.outline = s.outline;
    s.el.style.outlineOffset = s.outlineOffset;
    savedRef.current = null;
  }, []);

  React.useEffect(() => {
    if (!active || !mounted) return;
    const root = document.documentElement;
    root.classList.add("loupe-active");

    const frame = () => {
      rafRef.current = 0;
      const p = lastPoint.current;
      const lens = lensRef.current;
      if (!p || !lens) return;
      /* لِنز با counter-zoom رندر می‌شود ⇒ transform مستقیماً visual است */
      lens.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      const el = document.elementFromPoint(p.x, p.y);
      if (!(el instanceof HTMLElement) || el === document.body || el === root) {
        clearMagnify();
        return;
      }
      const cur = savedRef.current;
      if (cur?.el === el) return;
      clearMagnify();
      savedRef.current = {
        el,
        zoom: el.style.zoom,
        outline: el.style.outline,
        outlineOffset: el.style.outlineOffset,
      };
      el.style.zoom = String(LOUPE_FACTOR);
      el.style.outline = "2px solid #10b981";
      el.style.outlineOffset = "1px";
    };

    const schedule = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      lastPoint.current = { x: e.clientX, y: e.clientY };
      lensRef.current?.style.setProperty("opacity", "1");
      schedule();
    };
    const onLeave = () => {
      if (lensRef.current) lensRef.current.style.opacity = "0";
    };
    const onScroll = () => schedule();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") useLoupe.getState().setActive(false);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll, { capture: true } as never);
      window.removeEventListener("keydown", onKey);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      clearMagnify();
      lastPoint.current = null;
      root.classList.remove("loupe-active");
    };
  }, [active, mounted, clearMagnify]);

  if (!active || !mounted) return null;
  const z = erpZoom();

  return createPortal(
    <div
      ref={lensRef}
      aria-hidden
      data-loupe-lens
      /* counter-zoom ⇒ اندازهٔ لِنز مستقل از زوم داخلی؛ transform = visual */
      style={{ zoom: 1 / z, transform: "translate3d(-100px,-100px,0)" }}
      className="pointer-events-none fixed left-0 top-0 z-[9900] opacity-0 transition-opacity duration-150"
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        {/* حلقهٔ ذره‌بین */}
        <div
          className={cn(
            "h-20 w-20 rounded-full border-[3px] border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15),0_10px_30px_rgba(0,0,0,0.25)]",
            "bg-emerald-400/5 backdrop-blur-[0.5px]",
          )}
        />
        {/* نشانگر مرکز */}
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500" />
        {/* برچسب ضریب */}
        <span
          dir="ltr"
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-1.5 py-px text-[9px] font-bold text-white shadow"
        >
          ×{LOUPE_FACTOR}
        </span>
      </div>
    </div>,
    document.body,
  );
}
