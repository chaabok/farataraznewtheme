import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

/**
 * Contract DTOs — Task 148 (درخواست مالک): فرم «قرارداد جدید» در نرم‌افزار
 * «حسابداری» → زیرمنوی «اطلاعات تفصیلی ها».
 *
 * قرارداد فیلدها (عین فرم مالک):
 *   · شماره          — اجباری («شماره الزامی است»)، حداکثر ۲۰ نویسه،
 *                      یکتا در گرهٔ ساختار (۴۰۹ تکراری).
 *   · تاریخ          — اجباری («تاریخ الزامی است»)؛ میلادی ISO 'YYYY-MM-DD'
 *                      (قاعدهٔ مالک Task 77 — ذخیرهٔ میلادی، نمایش تقویم زبان).
 *   · پروژه          — اختیاری؛ شناسهٔ Project (وجود کنترل می‌شود).
 *   · محل انجام کار  — اختیاری، حداکثر ۱۰۰ نویسه.
 *   · طرف قرارداد    — اجباری («طرف قرارداد الزامی است»)؛ شناسهٔ Party
 *                      (وجود کنترل می‌شود).
 *   · کد تفصیل       — اختیاری در ارسال؛ خالی ⇒ تخصیص خودکار با «متد
 *                      اختصاصی» (detail-code-assignment — Task 146؛ formKey
 *                      "contract" ← نوع تفصیل «قرارداد» کد مرجع ۹) از بازهٔ
 *                      شماره شروع/شماره پایان همان نوع (فرم Task 131)؛
 *                      پر ⇒ دستی با قوانین عددی/درون‌بازه/یکتا («کد تفصیلی
 *                      الزامی است» در حالت دستی) — عین قرارداد فرم پروژه.
 *   · موضوع قرارداد  — اجباری («موضوع قرارداد الزامی است»)، حداکثر ۲۰۰
 *                      نویسه؛ «موضوع قرارداد (۲)» اختیاری.
 *   · عنوان تفصیلی   — اجباری («عنوان تفصیلی الزامی است»)، حداکثر ۱۰۰
 *                      نویسه، یکتا در نوع «قرارداد» و همان گره؛ «عنوان
 *                      تفصیلی (۲)» اختیاری.
 *   · تاریخ شروع/خاتمه — اختیاری؛ میلادی ISO.
 *   · مدت قرارداد    — اختیاری؛ عدد روز ≥ ۰.
 *   · مبلغ قرارداد   — اجباری («مبلغ قرارداد الزامی است»)؛ رشتهٔ رقم لاتین
 *                      (دقت بی‌کاستی — بدون Float)، حداکثر ۱۸ رقم.
 *   · شرح/شرح (۲)    — اختیاری، حداکثر ۵۰۰ نویسه (شرح اصلی در DetailItem).
 *   · فعال           — بولی (پیش‌فرض فرم: تیک فعال).
 */
export class UpsertContractDto {
  /** شماره قرارداد — اجباری، یکتا در گرهٔ ساختار. */
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  number!: string;

  /** تاریخ قرارداد — اجباری؛ میلادی ISO 'YYYY-MM-DD'. */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "تاریخ باید میلادی و در قالب YYYY-MM-DD باشد.",
  })
  date!: string;

  /** پروژهٔ مرتبط — اختیاری؛ شناسهٔ Project. */
  @IsOptional()
  @IsInt()
  @Min(1)
  projectRef?: number;

  /** طرف قرارداد — اجباری؛ شناسهٔ Party. */
  @IsInt()
  @Min(1)
  partyRef!: number;

  /** محل انجام کار — اختیاری. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  workLocation?: string;

  /** موضوع قرارداد — اجباری، حداکثر ۲۰۰ نویسه. */
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject!: string;

  /** موضوع قرارداد (۲) — اختیاری. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject2?: string;

  /** کد تفصیل — خالی = تخصیص خودکار از بازهٔ شماره‌گذاری نوع «قرارداد». */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  detailCode?: string;

  /** عنوان تفصیلی — اجباری، یکتا در نوع «قرارداد» + گره (DetailItem.Title). */
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  /** عنوان تفصیلی (۲) — اختیاری. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title2?: string;

  /** تاریخ شروع — اختیاری؛ میلادی ISO 'YYYY-MM-DD'. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "تاریخ شروع باید میلادی و در قالب YYYY-MM-DD باشد.",
  })
  startDate?: string;

  /** تاریخ خاتمه — اختیاری؛ میلادی ISO 'YYYY-MM-DD'. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "تاریخ خاتمه باید میلادی و در قالب YYYY-MM-DD باشد.",
  })
  endDate?: string;

  /** مدت قرارداد به روز — اختیاری. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(36500)
  durationDays?: number;

  /** مبلغ قرارداد — اجباری؛ رشتهٔ رقم لاتین (دقت بی‌کاستی). */
  @IsString()
  @MinLength(1)
  @MaxLength(18)
  amount!: string;

  /** شرح — اختیاری (DetailItem.Description). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /** شرح (۲) — اختیاری. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description2?: string;

  @IsBoolean()
  isActive!: boolean;

  /**
   * Task 122 (قرارداد مشترک) — گرهٔ ساختار سازمانی هدف (از OrgScope فرانت).
   * اختیاری: نبودِ آن = دفتر مرکزی. سرور وجود/فعال‌بودنِ گره را کنترل می‌کند.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  structureId?: number;
}
