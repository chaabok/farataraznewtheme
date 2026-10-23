export const LOCALES = [
  "fa",
  "en",
  "tr",
  "ar",
  "hi",
  "ps",
  "ckb",
  "pt",
  "ko",
  "fr",
  "zh",
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fa";

/** §1.4 — RTL locales per AGENTS.md */
export const DIR_BY_LOCALE: Record<Locale, "rtl" | "ltr"> = {
  fa: "rtl",
  ar: "rtl",
  ps: "rtl",
  ckb: "rtl",
  en: "ltr",
  tr: "ltr",
  hi: "ltr",
  pt: "ltr",
  ko: "ltr",
  fr: "ltr",
  zh: "ltr",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
  tr: "Türkçe",
  ar: "العربية",
  hi: "हिन्दी",
  ps: "پښتو",
  ckb: "کوردی",
  pt: "Português",
  ko: "한국어",
  fr: "Français",
  zh: "中文",
};

export function dirOf(locale: string): "rtl" | "ltr" {
  return DIR_BY_LOCALE[locale as Locale] ?? "ltr";
}
