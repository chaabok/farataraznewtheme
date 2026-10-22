import type { Locale } from '@/types/desktop';
import {
  isoToJalali,
  jalaliToIso,
  toPersianDigits,
} from '@/components/forms/fields/jalali';

/**
 * Per-locale calendar system of the dashboard.
 *
 * - `jalali`  → Solar Hijri (شمسی): fa, ps (Afghanistan shares this calendar)
 * - `kurdish` → Kurdish solar calendar (کۆچی هەتاوی): ckb — the Jalali solar
 *   months with the traditional year offset (+1321), so Newroz = 1/1
 * - `hijri`   → Hijri lunar calendar (Umm al-Qura, via Intl): ar
 * - `gregory` → Gregorian: every other locale
 */

export type CalendarKind = 'jalali' | 'kurdish' | 'hijri' | 'gregory';

export const CALENDAR_BY_LOCALE: Record<Locale, CalendarKind> = {
  fa: 'jalali',
  ps: 'jalali',
  ckb: 'kurdish',
  ar: 'hijri',
  en: 'gregory',
  tr: 'gregory',
  hi: 'gregory',
  pt: 'gregory',
  ko: 'gregory',
  fr: 'gregory',
  zh: 'gregory',
};

export const KURDISH_YEAR_OFFSET = 1321;

/** Dictionary key of the calendar hint shown under date fields. */
export function calendarHintKey(kind: CalendarKind): string {
  const suffix =
    kind === 'gregory'
      ? 'Gregory'
      : kind.charAt(0).toUpperCase() + kind.slice(1);
  return `formWindow.hint${suffix}`;
}

export interface CalendarParts {
  y: number;
  m: number;
  d: number;
}

// ─── Digit helpers ─────────────────────────────────────────────────────────

/** Eastern-Arabic digits (٠١٢…) used by ar and ckb. */
function toArabicDigits(input: string): string {
  return input.replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

/** Localizes ASCII digits to the digit family of the given locale. */
function localizeDigits(text: string, locale: Locale): string {
  if (locale === 'fa' || locale === 'ps') return toPersianDigits(text);
  if (locale === 'ar' || locale === 'ckb') return toArabicDigits(text);
  return text;
}

// ─── Local-time ISO helpers (never use UTC for "today") ────────────────────

/** `YYYY-MM-DD` of a Date in the LOCAL timezone (unlike toISOString). */
export function localIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isoFromUtcJdn(jdn: number): string {
  const ms = (jdn - 2440588) * 86400000;
  const date = new Date(ms);
  return date.toISOString().slice(0, 10);
}

function utcJdnOfIso(iso: string): number {
  return Math.floor(new Date(`${iso}T12:00:00Z`).getTime() / 86400000);
}

// ─── Hijri (Umm al-Qura via Intl, tabular Kuwaiti fallback) ────────────────

const HIJRI_TAG = 'en-u-ca-islamic-umalqura-nu-latn';

function hijriFormatter(): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(HIJRI_TAG, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Tabular (civil) Islamic calendar — deterministic ICU-free fallback. */
function hijriToJdnTabular(hy: number, hm: number, hd: number): number {
  return (
    hd +
    Math.ceil(29.5 * (hm - 1)) +
    (hy - 1) * 354 +
    Math.floor((3 + 11 * hy) / 30) +
    1948439
  );
}

function jdnToHijriTabular(jdn: number): CalendarParts {
  let l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const m = Math.floor((24 * l) / 709);
  const d = l - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { y, m, d };
}

function isoToHijriParts(iso: string): CalendarParts | null {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  try {
    const parts = hijriFormatter().formatToParts(date);
    const pick = (type: Intl.DateTimeFormatPartTypes): number => {
      const raw =
        parts.find((part) => part.type === type)?.value.replace(/\D/g, '') ??
        '';
      return raw ? Number(raw) : NaN;
    };
    const y = pick('year');
    const m = pick('month');
    const d = pick('day');
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
      return { y, m, d };
    }
  } catch {
    // Intl calendar unsupported → tabular below.
  }
  return jdnToHijriTabular(utcJdnOfIso(iso));
}

function hijriToIso(hy: number, hm: number, hd: number): string | null {
  if (hy < 1200 || hy > 1700 || hm < 1 || hm > 12 || hd < 1 || hd > 30) {
    return null;
  }
  // The tabular estimate drifts ≤2 days from Umm al-Qura — probe nearby days.
  const target = hy * 10000 + hm * 100 + hd;
  const estimate = hijriToJdnTabular(hy, hm, hd);
  for (let offset = 0; offset <= 5; offset += 1) {
    const candidates =
      offset === 0 ? [estimate] : [estimate - offset, estimate + offset];
    for (const jdn of candidates) {
      const iso = isoFromUtcJdn(jdn);
      const parts = isoToHijriParts(iso);
      if (parts && parts.y * 10000 + parts.m * 100 + parts.d === target) {
        return iso;
      }
    }
  }
  return isoFromUtcJdn(estimate);
}

// ─── Public conversions ────────────────────────────────────────────────────

/** Converts an ISO date into the given calendar's parts (null = invalid). */
export function isoToCalendar(
  iso: string,
  kind: CalendarKind,
): CalendarParts | null {
  switch (kind) {
    case 'gregory': {
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
      if (!match) return null;
      const parts = {
        y: Number(match[1]),
        m: Number(match[2]),
        d: Number(match[3]),
      };
      const probe = new Date(`${iso}T12:00:00Z`);
      if (
        Number.isNaN(probe.getTime()) ||
        probe.getUTCMonth() + 1 !== parts.m ||
        probe.getUTCDate() !== parts.d
      ) {
        return null;
      }
      return parts;
    }
    case 'jalali': {
      const j = isoToJalali(iso);
      return j ? { y: j.jy, m: j.jm, d: j.jd } : null;
    }
    case 'kurdish': {
      const j = isoToJalali(iso);
      return j
        ? { y: j.jy + KURDISH_YEAR_OFFSET, m: j.jm, d: j.jd }
        : null;
    }
    case 'hijri':
      return isoToHijriParts(iso);
  }
}

/** Converts calendar parts into an ISO `YYYY-MM-DD` string (null = invalid). */
export function calendarToIso(
  y: number,
  m: number,
  d: number,
  kind: CalendarKind,
): string | null {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return null;
  }
  switch (kind) {
    case 'gregory': {
      if (y < 1700 || y > 9999 || m < 1 || m > 12 || d < 1 || d > 31) {
        return null;
      }
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return isoToCalendar(iso, 'gregory') ? iso : null;
    }
    case 'jalali':
      return jalaliToIso(y, m, d);
    case 'kurdish':
      return jalaliToIso(y - KURDISH_YEAR_OFFSET, m, d);
    case 'hijri':
      return hijriToIso(y, m, d);
  }
}

/**
 * Renders an ISO date as `Y/M/D` in the locale's calendar with the locale's
 * digit family. `latin: true` forces ASCII digits (edit mode of date fields).
 */
export function formatCalendarDate(
  iso: string,
  kind: CalendarKind,
  locale: Locale,
  options?: { latin?: boolean },
): string | null {
  const parts = isoToCalendar(iso, kind);
  if (!parts) return null;
  const text = `${parts.y}/${String(parts.m).padStart(2, '0')}/${String(parts.d).padStart(2, '0')}`;
  return options?.latin ? text : localizeDigits(text, locale);
}

/** Example date shown in the placeholder of the date field per calendar. */
export function calendarExample(kind: CalendarKind, locale: Locale): string {
  const sample =
    kind === 'hijri'
      ? '1447/05/12'
      : kind === 'kurdish'
        ? `2726/07/30`
        : kind === 'jalali'
          ? '1405/07/30'
          : '2026/10/22';
  return localizeDigits(sample, locale);
}

/**
 * Localized timestamp for footers: calendar date + localized clock time.
 */
export function formatCalendarTimestamp(
  value: string | number | Date,
  kind: CalendarKind,
  locale: Locale,
  localeTag: string,
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const dateText =
    formatCalendarDate(localIsoDate(date), kind, locale) ??
    date.toISOString().slice(0, 10);
  const timeText = new Intl.DateTimeFormat(localeTag, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: ['fa', 'ar', 'ps', 'ckb', 'en', 'hi'].includes(locale),
  }).format(date);
  return `${dateText} ${timeText}`;
}
