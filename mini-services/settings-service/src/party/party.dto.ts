import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Party DTOs — Task 84 (درخواست مالک): فرم «طرف حساب جدید» در نرم‌افزار
 * «عمومی» ← زیرمنوی «اطلاعات پایه».
 *
 * قرارداد فیلدها (عین عبارت مالک):
 *   · «ماهیت»        — natural (شخص حقیقی، پیش‌فرض) | legal (شخص حقوقی).
 *   · «نوع فرعی»     — فقط برای شخص حقوقی فعال؛ سرور در حالت حقیقی پاکش می‌کند.
 *   · «نام»          — اجباری.
 *   · حقیقی: «نام خانوادگی» اجباری + «نام (2) (لاتین)» / «نام خانوادگی (2)
 *             (لاتین)» اختیاری.  حقوقی: «نام لاتین» اختیاری.
 *   · «کد تفصیلی»    — خودکار از شماره‌گذاری (سرور max+1)؛ حقیقی ← نوع تفصیلی ۶،
 *                     حقوقی ← نوع تفصیلی ۷. ورودیِ کلاینت نادیده گرفته می‌شود.
 *   · «کد اقتصادی»   — اختیاری.
 *   · حقیقی: «کد ملی»؛ حقوقی: «شناسه ملی» + «شماره ثبت» — تغییر ماهیت،
 *             فیلدهای حالت دیگر را پاک می‌کند (سرور هم همان را اعمال می‌کند).
 *   · «فعال»         — بولی، پیش‌فرض تیک.
 *   · details (تب جزئیات): برای هر نقش (تامین‌کننده/مشتری/واسط فروش) تیک +
 *             مبلغ مانده + وضعیت بدهکار/بستانکار؛ مبلغ غیر صفر ⇔ وضعیت اجباری.
 *   · other (تب سایر اطلاعات): گذرنامه/وبسایت/ایمیل/تاریخ ازدواج/تاریخ تولد؛
 *             تاریخ‌ها میلادی 'YYYY-MM-DD' (قرارداد Task 77).
 *   · persons/addresses/phones (تب‌های جدولی) — ردیف‌های کامل؛ ردیف خالی نادیده.
 */

export const PARTY_NATURES = ["natural", "legal"] as const;
export const PARTY_SUBTYPES = [
  "other",
  "ministry",
  "govAgency",
  "govCompany",
  "govOther",
  "publicNonGov",
  "private",
] as const;
export const PARTY_ADDR_TYPES = [
  "official",
  "workplace",
  "invoice",
  "goods",
  "warehouse",
  "home",
  "postal",
  "other",
] as const;
export const PARTY_PHONE_TYPES = [
  "office",
  "mobile",
  "home",
  "other",
  "faxOffice",
  "faxHome",
  "faxOther",
] as const;
export const PARTY_SIDES = ["debtor", "creditor"] as const;

/** تب «جزئیات» — سه نقش با ساختار یکسان: تیک ← مبلغ ← وضعیت. */
export class PartyDetailsDto {
  @IsBoolean()
  isSupplier!: boolean;

  @IsOptional()
  @IsNumber()
  supplierBalance?: number | null;

  @IsOptional()
  @IsIn(PARTY_SIDES as unknown as string[])
  supplierSide?: string | null;

  @IsBoolean()
  isCustomer!: boolean;

  @IsOptional()
  @IsNumber()
  customerBalance?: number | null;

  @IsOptional()
  @IsIn(PARTY_SIDES as unknown as string[])
  customerSide?: string | null;

  @IsBoolean()
  isSalesAgent!: boolean;

  @IsOptional()
  @IsNumber()
  salesAgentBalance?: number | null;

  @IsOptional()
  @IsIn(PARTY_SIDES as unknown as string[])
  salesAgentSide?: string | null;
}

/** تب «سایر اطلاعات». */
export class PartyOtherDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  passportNo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string | null;

  /** میلادی 'YYYY-MM-DD' (Task 77) */
  @IsOptional()
  @IsString()
  @MaxLength(10)
  marriageDate?: string | null;

  /** میلادی 'YYYY-MM-DD' (Task 77) */
  @IsOptional()
  @IsString()
  @MaxLength(10)
  birthDate?: string | null;
}

/** تب «افراد مرتبط» — نام و نام خانوادگی اجباری. */
export class PartyPersonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  relation?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  nationalId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string | null;
}

/** تب «نشانی» — نوع آدرس، شهر (CityRef) و آدرس کامل اجباری. */
export class PartyAddressDto {
  @IsIn(PARTY_ADDR_TYPES as unknown as string[])
  addrType!: string;

  @IsOptional()
  @IsNumber()
  cityRef?: number | null;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  fullAddress!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string | null;

  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @IsOptional()
  @IsNumber()
  latitude?: number | null;
}

/** تب «تلفن». */
export class PartyPhoneDto {
  @IsIn(PARTY_PHONE_TYPES as unknown as string[])
  phoneType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  number?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  extension?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string | null;
}

export class UpsertPartyDto {
  @IsIn(PARTY_NATURES as unknown as string[])
  nature!: string;

  @IsOptional()
  @IsIn(PARTY_SUBTYPES as unknown as string[])
  subtype?: string | null;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  latinName2?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  latinLastName2?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  latinName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  economicCode?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  nationalId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  legalIdentity?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  registrationNo?: string | null;

  @IsBoolean()
  isActive!: boolean;

  @ValidateNested()
  @Type(() => PartyDetailsDto)
  details!: PartyDetailsDto;

  @ValidateNested()
  @Type(() => PartyOtherDto)
  other!: PartyOtherDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartyPersonDto)
  persons!: PartyPersonDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartyAddressDto)
  addresses!: PartyAddressDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartyPhoneDto)
  phones!: PartyPhoneDto[];
}
