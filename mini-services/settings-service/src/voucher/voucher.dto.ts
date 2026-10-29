import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

/**
 * Voucher DTOs — Task 158 (درخواست مالک): فرم «سند حسابداری جدید» در
 * نرم‌افزار «حسابداری» → زیرمنوی «سند حسابداری» (۳ بخش هدر/اقلام/فوتر).
 *
 * هدر (عین فرمان مالک):
 *   · شماره سند   — الزامی، خودکار طبق شماره‌گذاری؛ ۰/نبود ⇒ سرور MAX+۱
 *                   همان نوع سند را تخصیص می‌دهد (تک‌مرجع سمت سرور).
 *   · شماره عطف   — الزامی، خودکار؛ ۰/نبود ⇒ MAX+۱ سراسری گره.
 *   · شماره فرعی  — اختیاری.
 *   · ایجاد کننده — خودکار (Creator — فقط نمایش نام کاربر در فرم).
 *   · تاریخ سند   — الزامی؛ میلادی ISO 'YYYY-MM-DD' (قاعدهٔ Task 77).
 *   · نوع سند     — الزامی؛ انواع سیستمی (IsSystem) ۴۲۲ می‌گیرند.
 *   · ماهیت سند   — الزامی؛ ۱=عادی، ۲=قانونی (لیست ثابت فرم).
 *   · وضعیت       — الزامی؛ ۱=ثبت اولیه، ۲=یادداشت (۳=تاییدشده/۴=دائمی
 *                   فقط پس از تایید — در فرم صدور ۴۲۲).
 *   · شرح         — الزامی؛ شرح به زبان دوم اختیاری (عین فرم قدیمی).
 *
 * اقلام (جدول مالک): ردیف خودکار؛ کد معین الزامی (سطح ۳)؛ شرح اجباری؛
 * بدهکار/بستانکار اختیاری (هر دو همزمان ۴۲۲)؛ تفصیلی ۱..۲۰ اختیاری فقط از
 * انواع متصل‌شده به همان معین در کدینگ؛ ستون‌های شرطی پیگیری/ارز مطابق
 * سقف‌های پیکربندی (نمایش فرم) ولی در DTO همیشه مجاز — سقف، نمایش است نه
 * نگهداری داده.
 */
export class SaveVoucherItemDetailDto {
  /** سطح تفصیلی ۱..۲۰ (ستون تفصیلی N). */
  @IsInt()
  @Min(1)
  @Max(20)
  levelIndex!: number;

  /** رکورد تفصیلی انتخاب‌شده (DetailItem). */
  @IsInt()
  @Min(1)
  detailItemRef!: number;
}

export class SaveVoucherItemDto {
  /** کد معین — الزامی؛ باید AccountNode سطح ۳ باشد. */
  @IsInt()
  @Min(1)
  moeinRef!: number;

  /** شرح ردیف — اجباری (جدول مالک). */
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description!: string;

  /** بدهکار — اختیاری؛ رشتهٔ رقم لاتین (دقت بی‌کاستی، بدون Float). */
  @IsOptional()
  @IsString()
  @MaxLength(18)
  debit?: string;

  /** بستانکار — اختیاری؛ همزمان با بدهکار ۴۲۲. */
  @IsOptional()
  @IsString()
  @MaxLength(18)
  credit?: string;

  /** تاریخ پیگیری — اختیاری؛ میلادی ISO 'YYYY-MM-DD'. */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "تاریخ پیگیری باید میلادی و در قالب YYYY-MM-DD باشد.",
  })
  trackDate?: string;

  /** شماره پیگیری — اختیاری. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  trackNumber?: string;

  /** ارز پایه — اختیاری؛ شناسهٔ CurrencyType. */
  @IsOptional()
  @IsInt()
  @Min(1)
  currencyRef?: number;

  /** ارزش ارزی — اختیاری؛ رشتهٔ رقم لاتین. */
  @IsOptional()
  @IsString()
  @MaxLength(18)
  currencyValue?: string;

  /** نرخ ارز — اختیاری؛ رشتهٔ رقم لاتین. */
  @IsOptional()
  @IsString()
  @MaxLength(18)
  currencyRate?: string;

  /** تفصیلی‌های ردیف — هر سطح حداکثر یک مقدار. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => SaveVoucherItemDetailDto)
  details?: SaveVoucherItemDetailDto[];
}

export class SaveVoucherDto {
  /** شماره سند — خالی/۰ = تخصیص خودکار طبق شماره‌گذاری (MAX+۱ همان نوع). */
  @IsOptional()
  @IsInt()
  @Min(0)
  voucherNo?: number;

  /** شماره عطف — خالی/۰ = تخصیص خودکار (MAX+۱ سراسری گره). */
  @IsOptional()
  @IsInt()
  @Min(0)
  serialNo?: number;

  /** شماره فرعی — اختیاری. */
  @IsOptional()
  @IsInt()
  @Min(0)
  subNo?: number;

  /** نوع سند — الزامی؛ انواع سیستمی رد می‌شوند (فرمان مالک Task 158). */
  @IsInt()
  @Min(1)
  voucherTypeRef!: number;

  /** ماهیت سند — الزامی: ۱=عادی، ۲=قانونی. */
  @IsInt()
  @Min(1)
  @Max(2)
  nature!: number;

  /** وضعیت — پیش‌فرض ۱ (ثبت اولیه)؛ ۳/۴ فقط پس از تایید ⇒ ۴۲۲ در صدور. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  status?: number;

  /** تاریخ سند — الزامی؛ میلادی ISO 'YYYY-MM-DD' (Task 77). */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "تاریخ سند باید میلادی و در قالب YYYY-MM-DD باشد.",
  })
  date!: string;

  /** شرح — الزامی. */
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description!: string;

  /** شرح به زبان دوم — اختیاری (عین فرم قدیمی تصویر مالک). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description2?: string;

  /** اقلام سند — حداقل یک ردیف. */
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaveVoucherItemDto)
  items!: SaveVoucherItemDto[];

  /** گرهٔ ساختار سازمانی هدف (OrgScope فرانت) — نبود = دفتر مرکزی. */
  @IsOptional()
  @IsInt()
  @Min(1)
  structureId?: number;
}
