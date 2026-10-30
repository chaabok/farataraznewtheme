"use client";

import * as React from "react";

/**
 * Task 160 — زوم داخلی نرم‌افزار
 *
 * زومِ داخلی با ویژگی استاندارد CSS `zoom` روی <html> اعمال می‌شود (برخلاف
 * zoom مرورگر، فقط نرم‌افزار را اسکیل می‌کند و در localStorage می‌ماند).
 * پیش‌فرض ۱۱۰٪ طبق فرمان مالک (t162)؛ بازهٔ مجاز ۵۰٪ تا ۱۵۰٪ با گام ۵٪.
 *
 * دو ثابت CSS روی documentElement نگه داشته می‌شود:
 *   --erp-zoom      = z        (زوم اپ)
 *   --erp-zoom-inv  = 1 / z    (خنثی‌سازی موقعیت پاپ‌آورهای Radix)
 * چون floating-ui مختصات visual می‌دهد و transform داخل زیردرختِ زوم‌شده
 * دوباره در z ضرب می‌شود — رول counter-zoom در globals.css این را جبران
 * می‌کند (آزمایش‌شده در Chromium: wrapper خودش 1/z و محتوا دوباره z).
 */

export const DEFAULT_ZOOM = 1.1;
/** پیش‌فرض قدیمی (تا t161) — مقادیر ذخیره‌شدهٔ برابر با آن هنگام خواندن به پیش‌فرض تازه مهاجرت می‌کنند. */
const LEGACY_DEFAULT_ZOOM = 0.75;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 1.5;
export const STEP_ZOOM = 0.05;

const LS_KEY = "erp-internal-zoom";

let current: number | null = null; // null = هنوز سمت کلاینت خوانده نشده
const listeners = new Set<() => void>();

function clamp(v: number): number {
  if (!Number.isFinite(v)) return DEFAULT_ZOOM;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v));
}

/** زوم جاری — سمت سرور همیشه پیش‌فرض؛ سمت کلاینت از localStorage. */
export function erpZoom(): number {
  if (current != null) return current;
  if (typeof document === "undefined") return DEFAULT_ZOOM;
  let v = DEFAULT_ZOOM;
  try {
    const raw = document.documentElement.style.zoom || localStorage.getItem(LS_KEY);
    const parsed = raw ? parseFloat(String(raw)) : NaN;
    if (
      Number.isFinite(parsed) &&
      parsed >= MIN_ZOOM &&
      parsed <= MAX_ZOOM &&
      parsed !== LEGACY_DEFAULT_ZOOM /* t162 — پیش‌فرض قدیمی ⇒ ۱۱۰٪ */
    )
      v = parsed;
  } catch {
    /* private mode و… — پیش‌فرض */
  }
  current = v;
  return v;
}

/** اعمال زوم روی <html> + دو متغیر CSS + ماندگاری. */
export function applyZoom(v: number): void {
  const z = Math.round(clamp(v) * 100) / 100; /* بدون نویز ممیز شناور */
  current = z;
  try {
    localStorage.setItem(LS_KEY, String(z));
  } catch {
    /* بی‌خیال ماندگاری */
  }
  const root = document.documentElement;
  root.style.zoom = String(z);
  root.style.setProperty("--erp-zoom", String(z));
  root.style.setProperty("--erp-zoom-inv", String(1 / z));
  listeners.forEach((l) => l());
}

export function setZoom(v: number): void {
  applyZoom(clamp(v));
}
export function zoomIn(): void {
  setZoom(erpZoom() + STEP_ZOOM);
}
export function zoomOut(): void {
  setZoom(erpZoom() - STEP_ZOOM);
}
export function resetZoom(): void {
  setZoom(DEFAULT_ZOOM);
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** هوک واکنش‌پذیر زوم (server snapshot = پیش‌فرض ۱۱۰٪ — بدون mismatch). */
export function useErpZoom(): number {
  return React.useSyncExternalStore(subscribe, erpZoom, () => DEFAULT_ZOOM);
}

/* ---------- مختصات: visual (کلاینت) ↔ local (فضای زوم‌شدهٔ CSS) ---------- */
/** مختصات visual پوینتر را به فضای CSS محلی تبدیل می‌کند (برای left/top). */
export function v2l(v: number): number {
  return v / erpZoom();
}
/** مقدار محلی را به visual تبدیل می‌کند (برای مقایسه با clientX و …). */
export function l2v(v: number): number {
  return v * erpZoom();
}
