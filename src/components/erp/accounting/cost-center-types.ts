/**
 * CostCenterType (client) — Task 146 (درخواست مالک): «فیلد نوع مرکز هزینه
 * که شامل ۱=اداری و تشکیلاتی، ۲=بازرگانی، ۳=تولیدی، ۴=خدماتی، ۵=عمومی —
 * موارد فوق را به صورت Enum تعریف کنید.»
 *
 * قرینهٔ Enum سرور (mini-services/settings-service/src/cost-center/
 * cost-center-type.ts). در دیتابیس Int ذخیره می‌شود؛ برچسب هر مقدار با کلید
 * i18n (cc.enum1..cc.enum5) در ۱۳ زبان رندر می‌شود و در منوی بازشو با
 * پیشوند عددی (عین فهرست مالک: «1 - اداری و تشکیلاتی») نمایش می‌یابد.
 */

/** Enum رسمی نوع مرکز هزینه — مقدار عددی = کد مالک. */
export enum CostCenterType {
  /** ۱ = اداری و تشکیلاتی */
  Administrative = 1,
  /** ۲ = بازرگانی */
  Commercial = 2,
  /** ۳ = تولیدی */
  Manufacturing = 3,
  /** ۴ = خدماتی */
  Services = 4,
  /** ۵ = عمومی */
  General = 5,
}

/** مدخل Enum برای منوی بازشوی فرم — labelKey به ۱۳ زبان ترجمه می‌شود. */
export interface CostCenterTypeItem {
  value: CostCenterType;
  labelKey: string;
}

/** ۵ مدخل Enum به ترتیب مالک (۱ تا ۵). */
export const COST_CENTER_TYPE_ITEMS: readonly CostCenterTypeItem[] = [
  { value: CostCenterType.Administrative, labelKey: "cc.enum1" },
  { value: CostCenterType.Commercial, labelKey: "cc.enum2" },
  { value: CostCenterType.Manufacturing, labelKey: "cc.enum3" },
  { value: CostCenterType.Services, labelKey: "cc.enum4" },
  { value: CostCenterType.General, labelKey: "cc.enum5" },
];
