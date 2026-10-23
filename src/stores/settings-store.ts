"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_LOCALE,
  dirOf,
  type Locale,
} from "@/i18n/config";
import { getDict, type Dict, type DictKey } from "@/i18n/dictionaries";

interface SettingsState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (k: DictKey) => string;
  dir: () => "rtl" | "ltr";
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (l) => set({ locale: l }),
      t: (k) => {
        const dict: Dict = getDict(get().locale);
        return dict[k as keyof Dict] ?? String(k);
      },
      dir: () => dirOf(get().locale),
    }),
    { name: "erp.settings" },
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
