"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_LOCALE,
  dirOf,
  LOCALES,
  type Locale,
} from "@/i18n/config";
import { getDict, type Dict, type DictKey } from "@/i18n/dictionaries";

interface SettingsState {
  locale: Locale;
  /** Task 70 — زبان‌های فعال سامانه (fa همیشه فعال است — زبان پایه)؛
      سوییچر زبان و پنل‌های ترجمه فقط همین‌ها را نشان می‌دهند */
  activeLocales: Locale[];
  setLocale: (l: Locale) => void;
  toggleActiveLocale: (l: Locale) => void;
  t: (k: DictKey) => string;
  dir: () => "rtl" | "ltr";
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      activeLocales: [...LOCALES] as Locale[],
      setLocale: (l) => set({ locale: l }),
      toggleActiveLocale: (l) =>
        set((s) => {
          if (l === "fa") return s; // زبان پایه همیشه فعال است
          const has = s.activeLocales.includes(l);
          const next = has
            ? s.activeLocales.filter((x) => x !== l)
            : ([...LOCALES] as Locale[]).filter(
                (x) => x === l || s.activeLocales.includes(x),
              );
          return { activeLocales: next };
        }),
      t: (k) => {
        const dict: Dict = getDict(get().locale);
        return dict[k as keyof Dict] ?? String(k);
      },
      dir: () => dirOf(get().locale),
    }),
    {
      name: "erp.settings",
      version: 1,
      /* Task 71 — زبان‌های تازه (de/ru) برای کاربران موجود هم به‌صورت پیش‌فرض فعال شوند */
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<SettingsState>;
        const stored = Array.isArray(p.activeLocales) ? p.activeLocales : [];
        if (stored.length === 0) {
          p.activeLocales = [...LOCALES] as Locale[];
        } else if (version < 1) {
          const added = (["de", "ru"] as Locale[]).filter((l) => !stored.includes(l));
          p.activeLocales = [...stored, ...added] as Locale[];
        }
        return p as SettingsState;
      },
    },
  ),
);

/**
 * Reactive translator — returns a NEW function whenever the locale changes,
 * so every subscriber re-renders with fresh translations (§1.3).
 */
export function useT(): (k: DictKey) => string {
  const locale = useSettings((s) => s.locale);
  return React.useMemo(() => {
    const dict = getDict(locale);
    return (k: DictKey) => dict[k as keyof Dict] ?? String(k);
  }, [locale]);
}
