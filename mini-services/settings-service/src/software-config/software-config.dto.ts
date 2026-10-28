import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

/**
 * SoftwareConfig DTOs — Task 72 (تأیید مالک): «پیکربندی نرم افزارها».
 * هر تب = یک نرم‌افزار (appKey از کاتالوگ APP_CATALOG)؛ هر فیلد پیکربندی =
 * یک ردیف کلید/مقدار در جدول SoftwareConfig.
 */

/** نرم‌افزارهای دارای تب پیکربندی — ۷ مورد اعلام‌شدهٔ مالک؛ به‌مرور گسترش می‌یابد. */
export const SOFTWARE_CONFIG_APP_KEYS = [
  "general",
  "accounting",
  "receiptsPayment",
  "inventory",
  "sales",
  "fixedAssets",
  "payroll",
] as const;

export type SoftwareConfigAppKey = (typeof SOFTWARE_CONFIG_APP_KEYS)[number];

/**
 * رجیستری فیلدهای مجاز پیکربندی هر نرم‌افزار (سمت سرور — whitelist + قانون).
 * فیلدها «به‌مرور» توسط مالک اعلان می‌شوند؛ هر اعلام جدید = افزودن ورودی به
 * همین رجیستری (هم‌راستا با SOFTWARE_CONFIG_FIELDS فرانت در
 * src/components/erp/settings/software-config-window.tsx) — بدون مهاجرت دیتابیس.
 *
 * Task 73 — اولین فیلد اعلام‌شدهٔ مالک (تب حسابداری):
 *   «تعداد ماه‌های مالی» — عددی، پیش‌فرض ۱۲، حداکثر ۱۶.
 */
export interface SoftwareConfigFieldSpec {
  type: "text" | "number" | "date" | "checkbox" | "select" | "textarea";
  /** بازهٔ مجاز برای type:"number" (در صورت اعلام) */
  min?: number;
  max?: number;
  /** فقط عدد صحیح (شمارنده‌ها مثل تعداد ماه‌ها) */
  integer?: boolean;
  /** مقدار پیش‌فرض — مالکیت نمایش با فرانت است؛ سرور همان بازه را اعتبارسنجی می‌کند */
  defaultValue?: string;
  /** Task 137 — فیلد مشتق‌شده (فقط‌خواندنی در فرانت): مقدار مجاز =
   *  value(from) − Σ value(minus). اگر from و همهٔ minus در «همین payload»
   *  حاضر باشند، سرور برابری را کنترل می‌کند (خط دوم دفاعی)؛ وگرنه فقط
   *  همان بازهٔ min/max اعمال می‌شود. */
  derived?: { from: string; minus: string[] };
}

export const SOFTWARE_CONFIG_FIELDS: Record<
  SoftwareConfigAppKey,
  Readonly<Record<string, SoftwareConfigFieldSpec>>
> = {
  general: {
    /* Task 95 (درخواست مالک) — «ترجمه آنلاین اطلاعات فیلدها همزمان با ذخیره‌سازی»:
       وقتی فعال باشد، ذخیرهٔ فرم‌ها (فعلاً طرف حساب) ترجمهٔ آنلاین فیلدها را
       خودکار اجرا می‌کند؛ غیرفعال = فقط با کلیک دکمهٔ «ترجمه آنلاین». */
    autoTranslateOnSave: { type: "checkbox", defaultValue: "0" },
  },
  accounting: {
    fiscalMonthsCount: { type: "number", min: 1, max: 16, integer: true, defaultValue: "12" },

    /* Task 135 + 136 + 137 (درخواست مالک) — گروپ فیلد «طول کدینگ حسابها»
       (تب حسابداری): سطر ۱ = «طول کد حسابها» (۶ — Task 137 تازه) و
       «طول گروه حساب» (۲)؛ سطر ۲ = «طول حساب کل» (۲ — پیش‌فرض Task 137) و
       «طول حساب معین» (مشتق‌شدهٔ فقط‌خواندنی = طول کد حسابها − طول گروه حساب −
       طول حساب کل؛ عبارت مالک Task 137: «از تفریغ طول کدحسابها و طول گروه
       حساب و طول حساب کل محاسبه می شود و فیلد فقط خواندنی می باشد» —
       پیش‌فرض‌ها: 6−2−2=2)؛ سطر ۳ = «طول حساب تفصیلی» (۰).
       آینهٔ فرانت: SOFTWARE_CONFIG_FIELDS در software-config-window.tsx. */
    accCodeLen: { type: "number", min: 1, max: 15, integer: true, defaultValue: "6" },
    accGroupCodeLen: { type: "number", min: 1, max: 15, integer: true, defaultValue: "2" },
    accLedgerCodeLen: { type: "number", min: 1, max: 15, integer: true, defaultValue: "2" },
    accSubsidiaryCodeLen: {
      type: "number",
      min: 0,
      max: 15,
      integer: true,
      defaultValue: "2",
      derived: { from: "accCodeLen", minus: ["accGroupCodeLen", "accLedgerCodeLen"] },
    },
    /* Task 138 — مالک: «فیلد طول کدتفصیلی را بصورت پیش فرض با عدد 6
       تکمیل نمایید» ⇒ پیش‌فرض تفصیلی از ۰ به ۶. */
    accDetailCodeLen: { type: "number", min: 0, max: 15, integer: true, defaultValue: "6" },
  },
  receiptsPayment: {},
  inventory: {},
  sales: {},
  fixedAssets: {},
  payroll: {},
};

/** یک آیتم ذخیره — configValue خالی ("") یعنی «حذف تنظیم» (الگوی Task 68). */
export class UpsertSoftwareConfigItem {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  configKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  configValue?: string;
}

export class UpsertSoftwareConfigDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => UpsertSoftwareConfigItem)
  items!: UpsertSoftwareConfigItem[];
}
