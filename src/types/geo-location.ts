/** Shared client-side types + tree rules for the GeoLocation domain (Task 103). */

export interface GeoNode {
  id: number;
  parentRef: number; // 0 = ریشهٔ مجازی فرم (سطح کشور)
  levelType: number; // 1=کشور 2=استان 3=شهر 4=روستا 5=خیابان 6=کوچه (ترتیب مالک)
  code: number;
  title: string;
  titleLatin: string;
  isActive: boolean;
  version: number;
  childCount: number;
}

export interface GeoListResponse {
  items: GeoNode[];
}

export interface GeoSavePayload {
  parentRef?: number;
  levelType?: number;
  code?: number;
  title?: string;
  titleLatin?: string;
  isActive?: boolean;
}

/**
 * Parent-driven level rules — عین عبارت مالک در Task 103: «اولین شاخه کشور
 * می‌باشد؛ زیرشاخهٔ کشور فقط استان قابل تعریف است و زیرشاخهٔ استان فقط شهر
 * قابل تعریف است». Task 105 (دادهٔ کامل کشورها + پایتخت‌ها): «شهر» هم به
 * فرزندان مجازِ کشور اضافه شد تا پایتختِ کشورهای فاقد استانِ ثبت‌شده
 * (تمام کشورها به‌جز ایران) مستقیماً زیر خودِ کشور ثبت شود.
 * ادامهٔ سطوح پایین‌تر (فرض اعلام‌شدهٔ کارنام Task 103):
 * شهر → خیابان/روستا؛ روستا/خیابان → کوچه؛ کوچه برگ است.
 * (تک‌منبع حقیقت روی سرور است — این نسخهٔ آینهٔ فرانت برای گیتِ UI است.)
 */
export const GEO_CHILD_TYPE_RULES: Record<number, number[]> = {
  1: [2, 3], // کشور → استان | شهر (پایتخت — Task 105)
  2: [3], // استان → شهر
  3: [4, 5], // شهر → روستا/خیابان (فرض اعلام‌شده)
  4: [6], // روستا → کوچه (فرض اعلام‌شده)
  5: [6], // خیابان → کوچه
  6: [], // کوچه — برگ
};

/** ریشهٔ مجازی فرم فقط کشور می‌پذیرد (اولین شاخه = کشور). */
export const GEO_ROOT_ALLOWED = [1];

export function geoAllowedChildTypes(parentType: number | null): number[] {
  if (parentType == null) return GEO_ROOT_ALLOWED;
  return GEO_CHILD_TYPE_RULES[parentType] ?? [];
}

/** رنگ‌های نوع‌ها — بدون indigo/blue (قواعد UI)؛ هر نوع هویت رنگی خودش. */
export function geoTypeColor(type: number): { bg: string; text: string; ring: string } {
  switch (type) {
    case 1: // کشور
      return { bg: "bg-teal-500/15", text: "text-teal-600 dark:text-teal-400", ring: "ring-teal-500/30" };
    case 2: // استان
      return { bg: "bg-violet-500/15", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-500/30" };
    case 3: // شهر
      return { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/30" };
    case 4: // روستا
      return { bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/30" };
    case 5: // خیابان
      return { bg: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", ring: "ring-orange-500/30" };
    case 6: // کوچه
      return { bg: "bg-fuchsia-500/15", text: "text-fuchsia-600 dark:text-fuchsia-400", ring: "ring-fuchsia-500/30" };
    default:
      return { bg: "bg-primary/15", text: "text-primary", ring: "ring-primary/30" };
  }
}
