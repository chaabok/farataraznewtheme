import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
  ArrayMaxSize,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * AccountTree DTOs — Task 140 (درخواست مالک): فرم «درختواره حسابها» در
 * نرم‌افزار «حسابداری» ← زیرمنوی «اطلاعات پایه» (کامپوننت SimpleTreeForm).
 *
 * درخت ۴ سطحی با ریشهٔ «ساختار کدینگ حساب‌ها»:
 *   گروه حساب (۱) ← حساب کل (۲) ← حساب معین (۳) ← شاخه تفصیلی (۴)
 *
 * Enum‌ها (عین پرامپت مالک):
 *   AccountType (فقط گروه): ۱=ترازنامه‌ای، ۲=سود و زیانی، ۳=انتظامی
 *   Nature گروه/کل: ۱=بدهکار، ۲=بستانکار، ۷=مهم نیست
 *   Nature معین: ۳=بدهکار طی دوره، ۴=بستانکار طی دوره، ۵=بدهکار پایان دوره،
 *                ۶=بستانکار پایان دوره، ۷=مهم نیست
 *   NatureControl (فقط معین با ماهیت ۳/۴): ۱=بدون کنترل، ۲=هشدار و ادامه،
 *                                          ۳=هشدار و توقف
 *   DetailedLevel: ۱ تا ۲۰ (سطح اول…بیستم)
 */

/** طول مجاز کد هر سطح — از SoftwareConfig حسابداری (Task 135/137/139). */
export const ACCOUNT_LEVEL_CODELEN_SOURCE = {
  group: "accGroupCodeLen", // پیش‌فرض ۲
  ledger: "accLedgerCodeLen", // پیش‌فرض ۲ ⇒ کل = گروه + لجر
  subsidiary: "accSubsidiaryCodeLen", // پیش‌فرض ۲ ⇒ معین = گروه + کل + معین
  detailLevelsCount: "accDetailLevels", // Task 139 — پیش‌فرض ۱۰، حداکثر ۲۰
} as const;

export const ACCOUNT_DEFAULT_CODE_LEN = { group: 2, ledger: 2, subsidiary: 2 } as const;
export const ACCOUNT_DEFAULT_DETAIL_LEVELS = 10;
export const ACCOUNT_MAX_LEVELS = 4;
export const ACCOUNT_MAX_DETAIL_LEVEL_INDEX = 20;

/** یک سطر «سطوح تفصیلی» — عنوانِ هر سطح (فعال فقط‌نمایشی است). */
export class AccountDetailLevelItemDto {
  @IsInt()
  @Min(1)
  @Max(ACCOUNT_MAX_DETAIL_LEVEL_INDEX)
  levelIndex!: number;

  @IsString()
  @MaxLength(100)
  title!: string;

  @IsBoolean()
  isActive!: boolean;
}

/** یک سطر «معین تعدیل ماهیت». */
export class AccountNatureAdjustItemDto {
  @IsInt()
  @Min(1)
  adjustAccountRef!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description2?: string;
}

/** یک سطر «شرح های پرتکرار». */
export class AccountRecurringDescItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description2?: string;
}

/** یک سطر «کاربران مجاز» با ۶ مجوز سند. */
export class AccountAllowedUserItemDto {
  @IsInt()
  @Min(1)
  userRef!: number;

  @IsBoolean()
  permCreate!: boolean; // ایجاد سند

  @IsBoolean()
  permView!: boolean; // مشاهده سند

  @IsBoolean()
  permEdit!: boolean; // ویرایش سند

  @IsBoolean()
  permDelete!: boolean; // حذف سند

  @IsBoolean()
  permReport!: boolean; // گزارش

  @IsBoolean()
  permSend!: boolean; // ارسال اطلاعات
}

export class SaveAccountNodeDto {
  /**
   * والد (undefined/تهی = گروه حساب زیر ریشهٔ مجازی). سرور سطح را از والد
   * می‌سازد (والد + ۱، حداکثر ۴) و تغییر والدِ گره موجود را رد می‌کند.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  parentRef?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  latinTitle?: string;

  @IsBoolean()
  isActive!: boolean;

  /** فقط سطح ۱ — ۱=ترازنامه‌ای، ۲=سود و زیانی، ۳=انتظامی */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  accountType?: number;

  /** گروه/کل: ۱/۲/۷ — معین: ۳/۴/۵/۶/۷ — شاخه: ۰ (سرور نرمال می‌کند) */
  @IsInt()
  @Min(0)
  @Max(7)
  nature!: number;

  /** فقط معین با ماهیت ۳/۴ — ۱=بدون کنترل، ۲=هشدار و ادامه، ۳=هشدار و توقف */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  natureControl?: number;

  /** پنج ویژگی معین — ۰=خاموش، ۱=فعال، ۲=فعال-اجباری (تفسیر اعلامی §0.6) */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  featureQuantitative?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  featureTrackingNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  featureTrackingDate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  featureCurrency?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  featureRevaluable?: number;

  /* ---- مجموعه‌های فرزند گره (ارسال اختیاری؛ ارسال = بازنویسی کامل) ---- */

  @IsOptional()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AccountDetailLevelItemDto)
  detailLevels?: AccountDetailLevelItemDto[];

  @IsOptional()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => AccountNatureAdjustItemDto)
  natureAdjust?: AccountNatureAdjustItemDto[];

  @IsOptional()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => AccountRecurringDescItemDto)
  recurringDesc?: AccountRecurringDescItemDto[];

  @IsOptional()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => AccountAllowedUserItemDto)
  allowedUsers?: AccountAllowedUserItemDto[];
}

export class AssignDetailTypeDto {
  @IsInt()
  @Min(1)
  @Max(ACCOUNT_MAX_DETAIL_LEVEL_INDEX)
  levelIndex!: number;

  @IsInt()
  @Min(1)
  detailTypeRef!: number;
}

/**
 * Task 171 (درخواست مالک) — افزودن «یک» شرح پرتکرار به معین از خودِ فرم سند
 * (کلید F6 روی ستون شرح یا دکمهٔ دیسکت همان فیلد): متن شرحِ قلم سند به
 * تب «شرح های پرتکرار» همان معین در درختواره حسابها افزوده می‌شود.
 */
export class AddRecurringDescDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description2?: string;
}
