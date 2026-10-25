import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import {
  appBaseOnCreate,
  appBaseOnUpdate,
  HEAD_OFFICE_NODE_ID,
  SYSTEM_ACTOR,
} from "../../../_shared/app-base-entity";
import { UpsertFiscalYearDto } from "./fiscal-year.dto";

/**
 * FiscalYear — Task 75 (درخواست مالک): فرم «سال مالی جدید» در نرم‌افزار
 * «عمومی» → زیرمنوی «اطلاعات پایه». رعایت کامل فیلدهای ارث‌بری AppBaseEntity
 * (۸فیلدی — نسخهٔ Task 76: مهر زمانی را CreatedAt/UpdatedAt پرایسما دارد):
 * ID دستی از IDGeneration (§16)، Version با §2.5 auto-rowversion،
 * مهر Creator/LastModifier + زنجیرهٔ ساختار سازمانی روی هر ردیف
 * (تا استقرار IAM = SYSTEM_ACTOR / دفتر مرکزی ID=1).
 *
 * زنجیرهٔ اعتبارسنجی ثبت (خط دفاعی نهایی سمت سرور؛ فرانت همان قوانین را
 * پیش از ارسال هم چک می‌کند):
 *   ۱. کد اجباری است و نمی‌تواند خالی باشد.
 *   ۲. عنوان اجباری است، فقط عدد و دقیقاً ۴ کاراکتر (مثل «1404»).
 *   ۳. سال مالی تکراری رد می‌شود (کد یا عنوان یکتا در ساختار سازمانی —
 *      هم‌راستا با unique index دوتایی جدول).
 *   ۴. بازهٔ شروع/پایان تکراری (هم‌پوشان با هر سال مالی موجود) رد می‌شود.
 *   ۵. طول بازه از «تعداد ماه‌های مالی» (SoftwareConfig → appKey "accounting"
 *      → configKey "fiscalMonthsCount"، پیش‌فرض ۱۲) بیشتر نباشد.
 */

/** تبدیل ارقام فارسی/عربی به لاتین (سرور هر ورودی کاربری را نرمال می‌کند). */
function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** 'YYYY/MM/DD' یا 'YYYYMMDD' → 'YYYYMMDD' شمسی نرمال، یا null وقتی نامعتبر است. */
function normalizeShamsiDate(raw: string | undefined | null): string | null {
  if (raw == null) return null;
  const digits = toLatinDigits(String(raw)).replace(/[^0-9]/g, "");
  if (digits.length !== 8) return null;
  const y = Number(digits.slice(0, 4));
  const m = Number(digits.slice(4, 6));
  const d = Number(digits.slice(6, 8));
  if (y < 1300 || y > 1500) return null; // گارد معقول بازهٔ سال شمسی
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  return digits;
}

function parseShamsi(yyyymmdd: string): { y: number; m: number; d: number } {
  return {
    y: Number(yyyymmdd.slice(0, 4)),
    m: Number(yyyymmdd.slice(4, 6)),
    d: Number(yyyymmdd.slice(6, 8)),
  };
}

/**
 * تعداد ماهِ سپری‌شدهٔ بازهٔ [start, end] — دقیق تا سطح روز:
 * از 1404/01/01 تا 1405/01/01 دقیقاً ۱۲ ماه است؛ تا 1405/01/02 می‌شود ۱۳ ماه.
 */
function elapsedMonths(start: string, end: string): number {
  const a = parseShamsi(start);
  const b = parseShamsi(end);
  let months = (b.y * 12 + b.m) - (a.y * 12 + a.m);
  if (b.d < a.d) months -= 1; // ماهِ آخر کامل نشده
  return months;
}

/** هم‌پوشانی دو بازهٔ بسته: [s1,e1] ∩ [s2,e2] ≠ ∅ ؟ (تاریخ تک‌روزی = [d,d]) */
function rangesOverlap(
  s1: string | null,
  e1: string | null,
  s2: string,
  e2: string,
): boolean {
  const a1 = s1 ?? e1;
  const b1 = e1 ?? s1;
  if (!a1 || !b1) return false; // ردیف بدون تاریخ در کنترل بازه بی‌معناست
  return a1 <= e2 && s2 <= b1;
}

const DEFAULT_FISCAL_MONTHS = 12;

@Injectable()
export class FiscalYearService {
  private readonly logger = new Logger(FiscalYearService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** فهرست سال‌های مالی (خواندن فعلاً سراسری؛ با اتصال IAM دامنه‌گذاری می‌شود). */
  async list() {
    const rows = await this.prisma.fiscalYear.findMany({
      orderBy: [{ code: "asc" }],
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async create(dto: UpsertFiscalYearDto) {
    const norm = this.normalizeInput(dto);
    await this.assertNotDuplicate(norm.code, norm.title, null);
    await this.assertRangeRules(norm.startDate, norm.endDate, null);

    const newId = await this.idGen.generateNextId("FiscalYear");
    const row = await this.prisma.fiscalYear.create({
      data: {
        id: BigInt(newId),
        code: norm.code,
        title: norm.title,
        startDate: norm.startDate,
        endDate: norm.endDate,
        isActive: norm.isActive,
        ...appBaseOnCreate(SYSTEM_ACTOR),
      },
    });
    this.logger.log(`FiscalYear created — ID=${newId} Code=${norm.code} Title=${norm.title}`);
    return this.toDto(row);
  }

  async update(id: number, dto: UpsertFiscalYearDto) {
    const existing = await this.prisma.fiscalYear.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `سال مالی با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const norm = this.normalizeInput(dto);
    await this.assertNotDuplicate(norm.code, norm.title, existing.id);
    await this.assertRangeRules(norm.startDate, norm.endDate, existing.id);

    const row = await this.prisma.fiscalYear.update({
      where: { id: existing.id },
      data: {
        code: norm.code,
        title: norm.title,
        startDate: norm.startDate,
        endDate: norm.endDate,
        isActive: norm.isActive,
        ...appBaseOnUpdate(SYSTEM_ACTOR),
      },
    });
    return this.toDto(row);
  }

  async remove(id: number) {
    const existing = await this.prisma.fiscalYear.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `سال مالی با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    await this.prisma.fiscalYear.delete({ where: { id: existing.id } });
    return { deleted: true, id };
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی ورودی + قوانین فیلدی (کد اجباری، عنوان عددی ۴رقمی، تاریخ‌ها). */
  private normalizeInput(dto: UpsertFiscalYearDto) {
    const code = toLatinDigits(String(dto.code ?? "")).trim();
    if (code === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت کد سال مالی الزامی است؛ کد نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }

    const title = toLatinDigits(String(dto.title ?? "")).trim();
    if (title === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت عنوان سال مالی الزامی است؛ عنوان نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (!/^[0-9]{4}$/.test(title)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "عنوان سال مالی فقط عدد قابل قبول است و باید دقیقاً ۴ کاراکتر باشد.",
        messageKey: "common.error",
      });
    }

    let startDate: string | null = null;
    let endDate: string | null = null;
    if (dto.startDate != null && String(dto.startDate).trim() !== "") {
      startDate = normalizeShamsiDate(dto.startDate);
      if (!startDate) {
        throw new BadRequestException({
          statusCode: 422,
          message: "قالب تاریخ شروع باید YYYY/MM/DD باشد.",
          messageKey: "common.error",
        });
      }
    }
    if (dto.endDate != null && String(dto.endDate).trim() !== "") {
      endDate = normalizeShamsiDate(dto.endDate);
      if (!endDate) {
        throw new BadRequestException({
          statusCode: 422,
          message: "قالب تاریخ پایان باید YYYY/MM/DD باشد.",
          messageKey: "common.error",
        });
      }
    }
    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException({
        statusCode: 422,
        message: "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.",
        messageKey: "common.error",
      });
    }

    return {
      code,
      title,
      startDate,
      endDate,
      isActive: dto.isActive === true,
    };
  }

  /** قانون ۱ مالک: «کاربر نمی‌تواند سال مالی تکراری ثبت کند» (کد یا عنوان). */
  private async assertNotDuplicate(code: string, title: string, excludeId: bigint | null) {
    const clash = await this.prisma.fiscalYear.findFirst({
      where: {
        businessStructureRef: HEAD_OFFICE_NODE_ID,
        OR: [{ code }, { title }],
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, code: true, title: true },
    });
    if (clash) {
      const byWhat = clash.code === code ? `کد «${code}»` : `عنوان «${title}»`;
      throw new ConflictException({
        statusCode: 409,
        message: `سال مالی تکراری است: ${byWhat} قبلاً برای سال مالی «${clash.code} - ${clash.title}» ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** قوانین ۲ و ۳ مالک: بازهٔ تکراری رد؛ طول بازه ≤ «تعداد ماه‌های مالی». */
  private async assertRangeRules(
    startDate: string | null,
    endDate: string | null,
    excludeId: bigint | null,
  ) {
    if (!startDate && !endDate) return;

    const rows = await this.prisma.fiscalYear.findMany({
      where: {
        businessStructureRef: HEAD_OFFICE_NODE_ID,
        OR: [{ startDate: { not: null } }, { endDate: { not: null } }],
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, code: true, title: true, startDate: true, endDate: true },
    });

    /* قانون ۲ — بازهٔ شروع و پایان تکراری (هم‌پوشان با هر سال مالی موجود) */
    const overlapping = rows.find((r) =>
      rangesOverlap(r.startDate, r.endDate, startDate!, endDate!),
    );
    if (overlapping) {
      const fmt = (d: string | null) =>
        d ? `${d.slice(0, 4)}/${d.slice(4, 6)}/${d.slice(6, 8)}` : "—";
      throw new ConflictException({
        statusCode: 409,
        message: `بازهٔ تاریخ شروع و پایان تکراری است و با سال مالی «${overlapping.code} - ${overlapping.title}» (${fmt(overlapping.startDate)} تا ${fmt(overlapping.endDate)}) هم‌پوشانی دارد.`,
        messageKey: "common.error",
      });
    }

    /* قانون ۳ — طول بازه از «تعداد ماه‌های مالی» تب حسابداری بیشتر نباشد */
    if (startDate && endDate) {
      const limit = await this.getFiscalMonthsLimit();
      const months = elapsedMonths(startDate, endDate);
      if (months > limit) {
        throw new BadRequestException({
          statusCode: 422,
          message: `طول بازهٔ سال مالی (${months} ماه) نمی‌تواند بیشتر از «تعداد ماه‌های مالی» (${limit} ماه) در تنظیمات نرم‌افزار ← تب حسابداری باشد.`,
          messageKey: "common.error",
        });
      }
    }
  }

  /**
   * «تعداد ماه‌های مالی» از پیکربندی نرم‌افزار (تب حسابداری) — همان مقداری که
   * در پنجرهٔ تنظیمات ذخیره می‌شود؛ ردیف ذخیره‌نشده = پیش‌فرض ۱۲ (قرارداد Task 74).
   */
  private async getFiscalMonthsLimit(): Promise<number> {
    const row = await this.prisma.softwareConfig.findUnique({
      where: {
        appKey_configKey_businessStructureRef: {
          appKey: "accounting",
          configKey: "fiscalMonthsCount",
          businessStructureRef: HEAD_OFFICE_NODE_ID,
        },
      },
      select: { configValue: true },
    });
    const n = row?.configValue ? Number(row.configValue) : NaN;
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : DEFAULT_FISCAL_MONTHS;
  }

  /* --------------------------------- dto --------------------------------- */

  private toDto(r: {
    id: bigint;
    code: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    version: number;
    creator: string;
    lastModifier: string | null;
    businessStructureRef: bigint;
    companyRef: bigint | null;
    branchRef: bigint | null;
    agencyRef: bigint | null;
    shopRef: bigint | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const fmt = (d: string | null) =>
      d ? `${d.slice(0, 4)}/${d.slice(4, 6)}/${d.slice(6, 8)}` : "";
    return {
      id: Number(r.id), // §2.4 BigInt → number (گارد 2^53 در مولد ID)
      code: r.code,
      title: r.title,
      startDate: fmt(r.startDate),
      endDate: fmt(r.endDate),
      isActive: r.isActive,
      version: r.version,
      creator: r.creator,
      lastModifier: r.lastModifier,
      businessStructureRef: Number(r.businessStructureRef),
      companyRef: r.companyRef == null ? null : Number(r.companyRef),
      branchRef: r.branchRef == null ? null : Number(r.branchRef),
      agencyRef: r.agencyRef == null ? null : Number(r.agencyRef),
      shopRef: r.shopRef == null ? null : Number(r.shopRef),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }
}
