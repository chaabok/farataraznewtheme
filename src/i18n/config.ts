import type { Direction, Locale } from '@/types/desktop';

/**
 * Central i18n configuration: the four supported languages, their layout
 * directions and their Intl tags.
 *
 * - fa (فارسی)  → RTL (icons flow right → left)
 * - ar (العربية) → RTL (icons flow right → left)
 * - en (English) → LTR (icons flow left → right)
 * - tr (Türkçe)  → LTR (icons flow left → right)
 */
export const LOCALES: Locale[] = ['fa', 'en', 'tr', 'ar'];

export const DEFAULT_LOCALE: Locale = 'fa';

/** Cookie used to persist the chosen language (read server-side too). */
export const LOCALE_COOKIE = 'erp.locale';

export const DIR_BY_LOCALE: Record<Locale, Direction> = {
  fa: 'rtl',
  ar: 'rtl',
  en: 'ltr',
  tr: 'ltr',
};

/** BCP-47 tag used for Intl number/date formatting. */
export const LOCALE_TAGS: Record<Locale, string> = {
  fa: 'fa-IR',
  en: 'en-US',
  tr: 'tr-TR',
  ar: 'ar-EG',
};

/** Compact label shown in the taskbar language button (like Win11 "فا"). */
export const LOCALE_SHORT: Record<Locale, string> = {
  fa: 'فا',
  en: 'EN',
  tr: 'TR',
  ar: 'ع',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value);
}

/** Parses a raw cookie value into a safe Locale (falls back to `fa`). */
export function parseLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
