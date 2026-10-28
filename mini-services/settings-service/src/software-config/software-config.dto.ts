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

    /* Task 135 + Task 136 (درخواست مالک) — گروپ فیلد «طول کد حسابها»
       (تب حسابداری): سطر ۱ = «طول حساب کل» (۶) و «طول گروه حساب» (۲)؛
       سطر ۲ = «طول حساب معین» (۴) و «طول حساب تفصیلی» (۰).
       Task 136 — مالک: «فیلدهایی که … با فلش قرمز مشخص کردم … باید قابل
       تغییر باشند» ⇒ هر سه فیلد کل/گروه/معین ورودیِ مستقل و آزادند؛ قانون
       خودکارِ معین (Task 135) حذف شد. آینهٔ فرانت:
       SOFTWARE_CONFIG_FIELDS در software-config-window.tsx. */
    accLedgerCodeLen: { type: "number", min: 1, max: 15, integer: true, defaultValue: "6" },
    accGroupCodeLen: { type: "number", min: 1, max: 15, integer: true, defaultValue: "2" },
    accSubsidiaryCodeLen: { type: "number", min: 0, max: 15, integer: true, defaultValue: "4" },
    accDetailCodeLen: { type: "number", min: 0, max: 15, integer: true, defaultValue: "0" },
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
