import type { Direction, Locale } from '@/types/desktop';

/**
 * Central i18n configuration: the eleven supported languages, their layout
 * directions and their Intl tags.
 *
 * RTL (Arabic script): fa (فارسی), ar (العربية), ps (پښتو), ckb (کوردی)
 * LTR: en, tr, hi (हिन्दी), pt (Português), ko (한국어), fr (Français), zh (中文)
 *
 * Per-locale calendars (Jalali, Hijri, Kurdish solar, Gregorian) live in
 * `src/i18n/calendar.ts`.
 */
export const LOCALES: Locale[] = [
  'fa',
  'en',
  'tr',
  'ar',
  'hi',
  'ps',
  'ckb',
  'pt',
  'ko',
  'fr',
  'zh',
];

export const DEFAULT_LOCALE: Locale = 'fa';

/** Cookie used to persist the chosen language (read server-side too). */
export const LOCALE_COOKIE = 'erp.locale';

export const DIR_BY_LOCALE: Record<Locale, Direction> = {
  fa: 'rtl',
  ar: 'rtl',
  ps: 'rtl',
  ckb: 'rtl',
  en: 'ltr',
  tr: 'ltr',
  hi: 'ltr',
  pt: 'ltr',
  ko: 'ltr',
  fr: 'ltr',
  zh: 'ltr',
};

/** BCP-47 tag used for Intl number/date formatting. */
export const LOCALE_TAGS: Record<Locale, string> = {
  fa: 'fa-IR',
  en: 'en-US',
  tr: 'tr-TR',
  ar: 'ar-EG',
  hi: 'hi-IN',
  ps: 'ps-AF',
  ckb: 'ckb-IQ',
  pt: 'pt-BR',
  ko: 'ko-KR',
  fr: 'fr-FR',
  zh: 'zh-CN',
};

/** Compact label shown in the taskbar language button (like Win11 "فا"). */
export const LOCALE_SHORT: Record<Locale, string> = {
  fa: 'فا',
  en: 'EN',
  tr: 'TR',
  ar: 'ع',
  hi: 'हि',
  ps: 'پښ',
  ckb: 'کو',
  pt: 'PT',
  ko: '한',
  fr: 'FR',
  zh: '中',
};

/** Locales whose clock uses a 12-hour cycle (24h for tr/pt/ko/fr/zh). */
export const HOUR12_LOCALES: Locale[] = ['fa', 'ar', 'ps', 'ckb', 'en', 'hi'];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value);
}

/** Parses a raw cookie value into a safe Locale (falls back to `fa`). */
export function parseLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
