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
 * رجیستری کلیدهای مجاز پیکربندی هر نرم‌افزار (سمت سرور — whitelist).
 * فیلدها «به‌مرور» توسط مالک اعلان می‌شوند؛ هر اعلام جدید = افزودن کلید به
 * همین رجیستری (هم‌راستا با SOFTWARE_CONFIG_FIELDS فرانت در
 * src/components/erp/settings/software-config-window.tsx) — بدون مهاجرت دیتابیس.
 * تا اعلام اولین فیلدها، رجیستری هر ۷ نرم‌افزار خالی است و PUT هر کلیدی
 * با پیام روشن رد می‌شود (۴۲۲).
 */
export const SOFTWARE_CONFIG_FIELDS: Record<SoftwareConfigAppKey, readonly string[]> = {
  general: [],
  accounting: [],
  receiptsPayment: [],
  inventory: [],
  sales: [],
  fixedAssets: [],
  payroll: [],
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
