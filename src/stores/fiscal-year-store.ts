"use client";

/**
 * FiscalYearStore (Task 82 — درخواست مالک، فوتر دسکتاپ):
 * «در فوتر دسکتاپ، لیست سال‌های مالی تعریف شده توسط کاربر نمایش داده شود و
 * کاربر اگر سال مالی را تغییر داد تمامی فرم‌های باز در تب بار باید بسته شود…»
 *
 * Design (mirrors org-context-store, Task 78 conventions):
 *  · items — the flat fiscal-year list (settings-service via BFF,
 *    GET /api/settings/fiscal-year) reloaded on «erp:records-changed»
 *    (entity=fiscal-year — dispatched by the سال مالی form after save/delete).
 *  · persistence — the last user selection lives in localStorage
 *    (erp.fiscalYear); the DEFAULT is always the first fiscal year defined
 *    (a missing/stale saved id falls back at runtime without being persisted
 *    until the user actually changes it — same contract as the org context).
 *  · session semantics — the selection is THE active accounting context of
 *    the shell; changing it closes every open form tab (owner rule), which
 *    the FiscalYearFooter guard orchestrates.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export interface FiscalYearItem {
  id: number;
  code: string;
  title: string;
  startDate: string; // میلادی 'YYYY-MM-DD' (قرارداد ۷۷)
  endDate: string;
  isActive: boolean;
}

interface FiscalYearState {
  items: FiscalYearItem[];
  loaded: boolean;
  loading: boolean;
  /** Task 85 — the last load failed (the missing-year prompt never fires on
      an unknown state; a service hiccup must not raise a false dialog) */
  failed: boolean;
  /** persisted last user selection (null = default → first defined year) */
  fiscalYearId: number | null;
  load: () => Promise<void>;
  setFiscalYearId: (id: number | null) => void;
}

export const useFiscalYear = create<FiscalYearState>()(
  persist(
    (set, get) => ({
      items: [],
      loaded: false,
      loading: false,
      failed: false,
      fiscalYearId: null,
      load: async () => {
        if (get().loading) return;
        set({ loading: true });
        try {
          const res = await api.get<{ items?: FiscalYearItem[] }>("fiscal-year");
          set({ items: res.items ?? [], loaded: true, loading: false, failed: false });
        } catch {
          set({ loading: false, loaded: true, failed: true });
        }
      },
      setFiscalYearId: (id) => set({ fiscalYearId: id }),
    }),
    {
      name: "erp.fiscalYear",
      version: 1,
      /* فقط انتخاب کاربر ذخیره می‌شود — فهرست هر بار از سرویس می‌آید.
         skipHydration = SSR markup stays deterministic; the footer
         rehydrates after mount (same pattern as erp.desktop.layout). */
      partialize: (s) => ({ fiscalYearId: s.fiscalYearId }),
      skipHydration: true,
    },
  ),
);

/** effective selection — the saved id if still valid, else the first year */
export function effectiveFiscalYearId(s: FiscalYearState): number | null {
  if (s.fiscalYearId != null && s.items.some((i) => Number(i.id) === s.fiscalYearId)) {
    return s.fiscalYearId;
  }
  return s.items.length > 0 ? Number(s.items[0].id) : null;
}
