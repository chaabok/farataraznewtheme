import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { COST_CENTER_TYPE_VALUES } from "./cost-center-type";

/**
 * CostCenter DTOs — Task 146 (درخواست مالک): فرم «مرکز هزینه جدید» در
 * نرم‌افزار «حسابداری» → زیرمنوی «اطلاعات تفصیلی ها».
 *
 * قرارداد فیلدها (عین فرم مالک):
 *   · کد              — اجباری («کد الزامی است»)، حداکثر ۲۰ نویسه، یکتا در گره.
 *   · عنوان           — اجباری («عنوان الزامی است»)، حداکثر ۱۰۰ نویسه،
 *                       یکتا در نوع تفصیل «مراکز هزینه» و همان گره.
 *   · نوع مرکز هزینه  — اجباری («نوع مرکز هزینه الزامی است»)؛ Enum رسمی
 *                       ۱..۵ (cost-center-type.ts) — @IsIn گارد لایهٔ ورودی.
 *   · کد تفصیل        — اختیاری در ارسال؛ خالی ⇒ تخصیص خودکار با «متد
 *                       اختصاصی» (detail-code-assignment) از بازهٔ شماره
 *                       شروع/شماره پایان همان نوع؛ پر ⇒ دستی با قوانین
 *                       عددی/درون‌بازه/یکتا («کد تفصیل الزامی است» در حالت دستی).
 *   · توضیحات         — اختیاری، حداکثر ۵۰۰ نویسه.
 *   · فعال            — بولی (پیش‌فرض فرم: تیک فعال).
 */
export class UpsertCostCenterDto {
  /** کد مرکز هزینه — اجباری، یکتا در گرهٔ ساختار. */
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code!: string;

  /** عنوان مرکز هزینه — اجباری، یکتا در نوع + گره. */
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  /** نوع مرکز هزینه — Enum 1..5. */
  @IsInt()
  @Min(1)
  @IsIn(COST_CENTER_TYPE_VALUES as number[])
  costCenterType!: number;

  /** کد تفصیل — خالی = تخصیص خودکار از بازهٔ شماره‌گذاری (متد اختصاصی). */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  detailCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

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
