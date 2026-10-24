"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { appApi } from "@/lib/api";
import { useSettings } from "@/stores/settings-store";

/**
 * Dfb translations store (Task 68) — ترجمهٔ آفلاین ۱۱زبانهٔ محتوای دیتابیسی
 * فرمساز (عنوان منو/فرم و برچسب فیلدها).
 *
 * الگو: کل نقشهٔ ترجمه (جدول کوچک DfbTranslation روی dfb.db) یک‌بار واکشی و در
 * localStorage کش می‌شود؛ تغییر زبان نرم‌افزار = تعویض نقشهٔ فعال — بدون هیچ
 * درخواست شبکه (آفلاین کامل). منبع ترجمه با «کلید بیزینسی» پایدار است:
 *   · Menu:<menuId>:Title
 *   · Form:<formId>:Title
 *   · Field:<formRef>:<fieldKey>   (EntityRef = FormRef — پایدار در ذخیرهٔ مجدد)
 *   · Tab:<formRef>:<clientKey>    (Task 69 — ClientKey ذخیره‌شده در DfbFormTab)
 *   · Option:<formRef>:<fieldKey>::<value>  (Task 69 — آیتم‌های select/radio)
 *   · Value:<dataId>:<fieldKey>    (Task 70 — دادهٔ واردشدهٔ کاربر، فقط فیلد متنی)
 * زنجیرهٔ جایگزینی: ترجمهٔ زبان فعلی → متن اصلی (fa) → *_En میراث.
 */

export type DfbTransEntityType = "Menu" | "Form" | "Field" | "Tab" | "Option" | "Value";

export interface DfbTranslationRow {
  entityType: DfbTransEntityType;
  entityRef: number;
  fieldKey: string;
  lang: string;
  value: string;
}

/** کلید مرکب نقشهٔ کش‌شده */
export const dfbTransKey = (
  entityType: DfbTransEntityType,
  entityRef: number,
  fieldKey: string,
): string => `${entityType}:${entityRef}:${fieldKey}`;

interface DfbTranslationsState {
  /** lang → compositeKey → value */
  byLang: Record<string, Record<string, string>>;
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  /** به‌روزرسانی خوش‌بینانهٔ کش پس از ذخیره (value="" = حذف کلید) */
  applyLocal: (rows: DfbTranslationRow[]) => void;
}

const dfbTransApi = appApi("advancedTools");

export const useDfbTranslations = create<DfbTranslationsState>()(
  persist(
    (set, get) => ({
      byLang: {},
      loaded: false,
      loading: false,
      load: async () => {
        if (get().loading) return;
        set({ loading: true });
        try {
          const res = await dfbTransApi.get<{ items: DfbTranslationRow[] }>("translations");
          const byLang: Record<string, Record<string, string>> = {};
          for (const it of res.items ?? []) {
            if (!it?.lang || !it?.value) continue;
            (byLang[it.lang] ??= {})[dfbTransKey(it.entityType, it.entityRef, it.fieldKey)] = it.value;
          }
          set({ byLang, loaded: true, loading: false });
        } catch {
          set({ loading: false, loaded: true });
        }
      },
      applyLocal: (rows) => {
        set((s) => {
          const byLang = { ...s.byLang };
          for (const r of rows) {
            const map = { ...(byLang[r.lang] ?? {}) };
            const key = dfbTransKey(r.entityType, r.entityRef, r.fieldKey);
            if (r.value && r.value.trim()) map[key] = r.value.trim();
            else delete map[key]; // مقدار خالی = حذف ترجمه
            byLang[r.lang] = map;
          }
          return { byLang };
        });
      },
    }),
    {
      name: "erp.dfb-translations",
      partialize: (s) => ({ byLang: s.byLang }),
    },
  ),
);

/** واکشی یک‌باره در سطح اپ (در دسکتاپ صدا زده می‌شود) — fire-and-forget امن */
export async function ensureDfbTranslations(): Promise<void> {
  const s = useDfbTranslations.getState();
  if (!s.loaded && !s.loading) await s.load();
}

/**
 * نقشهٔ ترجمهٔ زبان فعلی (undefined در fa) — مشترک‌شده و reaktیو:
 * هر تغییری در کش/زبان باعث رندر مجدد مصرف‌کننده می‌شود.
 */
export function useDfbTrMap(): Record<string, string> | undefined {
  const locale = useSettings((s) => s.locale);
  const byLang = useDfbTranslations((s) => s.byLang);
  return locale === "fa" ? undefined : byLang[locale];
}

/**
 * ذخیرهٔ دسته‌ای ترجمه‌ها (مقدار خالی = حذف) + به‌روزرسانی خوش‌بینانهٔ کش —
 * پس از موفقیت، همهٔ پنجره‌های باز همان لحظه متن تازه را نشان می‌دهند.
 */
export async function saveDfbTranslations(rows: DfbTranslationRow[]): Promise<void> {
  await dfbTransApi.post("translations", { items: rows });
  useDfbTranslations.getState().applyLocal(rows);
}

/**
 * حل‌کنندهٔ مرکزی با زنجیرهٔ جایگزینی (Task 68):
 * ترجمهٔ زبان فعلی → fa (متن اصلی) → en میراث → متن اصلی.
 */
export function dfbResolveTr(
  tr: Record<string, string> | undefined,
  key: string,
  fa: string,
  en?: string | null,
): string {
  const v = tr?.[key];
  if (v && v.trim()) return v;
  return fa || en || "";
}

/** hook کمکی برای پنل ترجمهٔ فیلد (استودیو) — نقشهٔ یک زبان مشخص */
export function useDfbLangMap(lang: string): Record<string, string> {
  return useDfbTranslations((s) => s.byLang[lang] ?? {});
}
