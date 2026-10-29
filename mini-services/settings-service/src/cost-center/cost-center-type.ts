/**
 * CostCenterType — Task 146 (درخواست مالک): «فیلد نوع مرکز هزینه که شامل
 * ۱=اداری و تشکیلاتی، ۲=بازرگانی، ۳=تولیدی، ۴=خدماتی، ۵=عمومی — موارد فوق
 * را به صورت Enum تعریف کنید.»
 *
 * Enum رسمی نوع مرکز هزینه. در دیتابیس (SQLite — Prisma Enum را پشتیبانی
 * نمی‌کند) به‌صورت Int ذخیره می‌شود و همین Enum + گاردهای سرویس، اعتبار
 * مقدار را تضمین می‌کند (۴۲۲ برای هر مقدار خارج از ۱..۵).
 * برچسب‌های فارسی مرجع برای پیام‌های سرور/CSV؛ فرمِ فرانت برچسب را با کلید
 * i18n (cc.enum1..cc.enum5) در ۱۳ زبان نشان می‌دهد.
 */

export enum CostCenterTypeEnum {
  /** ۱ = اداری و تشکیلاتی */
  AdministrativeAndOrganizational = 1,
  /** ۲ = بازرگانی */
  Commercial = 2,
  /** ۳ = تولیدی */
  Manufacturing = 3,
  /** ۴ = خدماتی */
  Services = 4,
  /** ۵ = عمومی */
  General = 5,
}

/** مقادیر مجاز Enum — گارد سرویس (۴۲۲ خارج از این فهرست). */
export const COST_CENTER_TYPE_VALUES: readonly number[] = [
  CostCenterTypeEnum.AdministrativeAndOrganizational,
  CostCenterTypeEnum.Commercial,
  CostCenterTypeEnum.Manufacturing,
  CostCenterTypeEnum.Services,
  CostCenterTypeEnum.General,
];

/** برچسب فارسی مرجع هر مقدار Enum (پیام سرور / CSV). */
export const COST_CENTER_TYPE_LABELS: Readonly<Record<number, string>> = {
  [CostCenterTypeEnum.AdministrativeAndOrganizational]: "اداری و تشکیلاتی",
  [CostCenterTypeEnum.Commercial]: "بازرگانی",
  [CostCenterTypeEnum.Manufacturing]: "تولیدی",
  [CostCenterTypeEnum.Services]: "خدماتی",
  [CostCenterTypeEnum.General]: "عمومی",
};

/** برچسب امن یک مقدار Enum (برای DTO/پیام‌ها). */
export function costCenterTypeLabel(value: number): string {
  return COST_CENTER_TYPE_LABELS[value] ?? String(value);
}
