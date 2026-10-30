"use client";

import { create } from "zustand";

/**
 * Task 160 — وضعیت ذره‌بین (لوپ). فقط برای نشست جاری است و ذخیره نمی‌شود.
 * وقتی فعال است، لایهٔ LoupeLayer نشانگر را دنبال می‌کند و عنصر زیر نشانگر
 * را بزرگ‌نمایی می‌کند.
 */
interface LoupeState {
  active: boolean;
  toggle: () => void;
  setActive: (v: boolean) => void;
}

export const useLoupe = create<LoupeState>()((set) => ({
  active: false,
  toggle: () => set((s) => ({ active: !s.active })),
  setActive: (v) => set({ active: v }),
}));
