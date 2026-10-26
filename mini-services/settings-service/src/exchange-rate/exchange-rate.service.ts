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
import { UpsertExchangeRateDto } from "./exchange-rate.dto";

/**
 * ExchangeRate — Task 116 (درخواست مالک): فرم «نرخ برابری جدید» در نرم‌افزار
 * «عمومی» → زیرمنوی «عملیات». رعایت کامل فیلدهای ارث‌بری AppBaseEntity
 * (۸فیلدی): ID دستی از IDGeneration (§16)، Version با §2.5 auto-rowversion،
 * مهر Creator/LastModifier + زنجیرهٔ ساختار سازمانی روی هر ردیف
 * (تا استقرار IAM = SYSTEM_ACTOR / دفتر مرکزی ID=1).
 *
 * زنجیرهٔ اعتبارسنجی ثبت (خط دفاعی نهایی سمت سرور؛ فرانت همان قوانین را
 * پیش از ارسال هم چک می‌کند):
 *   ۱. تاریخ موثر اجباری و باید 'YYYY-MM-DD' میلادیِ واقعی باشد (Task 77).
 *   ۲. ارز مبنا/مورد مبادله اجباری، باید در CurrencyType موجود و متمایز باشند.
 *   ۳. نرخ برابری اجباری و باید عددی > ۰ باشد (Decimal SQLite ندارد — رشته).
 *   ۴. واحد مبادله اختیاری؛ در صورت ورود عدد صحیح ≥ ۱ (خالی = از ارز مبنا).
 *   ۵. نرخ تکراری همان جفت‌ارز در همان تاریخ رد می‌شود (409 — unique).
 */

/** تبدیل ارقام فارسی/عربی به لاتین (سرور هر ورودی کاربری را نرمال می‌کند). */
function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** اعتبارسنجی تاریخ میلادی 'YYYY-MM-DD' واقعی (ماه/روز در محدوده). */
function isValidGregorianISO(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1) return false;
  const daysInMonth = [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return d <= daysInMonth[mo - 1];
}

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** فهرست نرخ‌ها — جدیدترین تاریخ اول (خواندن فعلاً سراسری؛ با IAM دامنه‌گذاری می‌شود). */
  async list() {
    const rows = await this.prisma.exchangeRate.findMany({
      orderBy: [{ effectiveDate: "desc" }, { id: "desc" }],
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async create(dto: UpsertExchangeRateDto) {
    const norm = await this.normalizeInput(dto, null);

    const newId = await this.idGen.generateNextId("ExchangeRate");
    const row = await this.prisma.exchangeRate.create({
      data: {
        id: BigInt(newId),
        effectiveDate: norm.effectiveDate,
        baseCurrencyRef: BigInt(norm.baseCurrencyRef),
        quoteCurrencyRef: BigInt(norm.quoteCurrencyRef),
        exchangeUnit: norm.exchangeUnit,
        rate: norm.rate,
        ...appBaseOnCreate(SYSTEM_ACTOR),
      },
    });
    this.logger.log(
      `ExchangeRate created — ID=${newId} ${norm.effectiveDate} ${norm.baseCurrencyRef}→${norm.quoteCurrencyRef} rate=${norm.rate}`,
    );
    return this.toDto(row);
  }

  async update(id: number, dto: UpsertExchangeRateDto) {
    const existing = await this.prisma.exchangeRate.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نرخ برابری با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const norm = await this.normalizeInput(dto, existing.id);

    const row = await this.prisma.exchangeRate.update({
      where: { id: existing.id },
      data: {
        effectiveDate: norm.effectiveDate,
        baseCurrencyRef: BigInt(norm.baseCurrencyRef),
        quoteCurrencyRef: BigInt(norm.quoteCurrencyRef),
        exchangeUnit: norm.exchangeUnit,
        rate: norm.rate,
        ...appBaseOnUpdate(SYSTEM_ACTOR),
      },
    });
    return this.toDto(row);
  }

  async remove(id: number) {
    const existing = await this.prisma.exchangeRate.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نرخ برابری با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    await this.prisma.exchangeRate.delete({ where: { id: existing.id } });
    return { deleted: true, id };
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی ورودی + قوانین فیلدی + گارد ارزهای موجود/متمایز/تکراری. */
  private async normalizeInput(dto: UpsertExchangeRateDto, excludeId: bigint | null) {
    const effectiveDate = String(dto.effectiveDate ?? "").trim();
    if (effectiveDate === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت تاریخ موثر الزامی است؛ تاریخ نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (!isValidGregorianISO(effectiveDate)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "تاریخ موثر معتبر نیست؛ قالب صحیح 'YYYY-MM-DD' میلادی است.",
        messageKey: "common.error",
      });
    }

    const baseCurrencyRef = Math.floor(Number(toLatinDigits(String(dto.baseCurrencyRef ?? 0))));
    const quoteCurrencyRef = Math.floor(Number(toLatinDigits(String(dto.quoteCurrencyRef ?? 0))));
    if (!Number.isFinite(baseCurrencyRef) || baseCurrencyRef < 1) {
      throw new BadRequestException({
        statusCode: 422,
        message: "انتخاب ارز مبنا الزامی است.",
        messageKey: "common.error",
      });
    }
    if (!Number.isFinite(quoteCurrencyRef) || quoteCurrencyRef < 1) {
      throw new BadRequestException({
        statusCode: 422,
        message: "انتخاب ارز مورد مبادله الزامی است.",
        messageKey: "common.error",
      });
    }
    if (baseCurrencyRef === quoteCurrencyRef) {
      throw new BadRequestException({
        statusCode: 422,
        message: "ارز مبنا و ارز مورد مبادله نمی‌توانند یکسان باشند.",
        messageKey: "common.error",
      });
    }
    const baseCur = await this.prisma.currencyType.findUnique({
      where: { id: BigInt(baseCurrencyRef) },
      select: { id: true, code: true, title: true },
    });
    if (!baseCur) {
      throw new BadRequestException({
        statusCode: 422,
        message: `ارز مبنا با شناسهٔ ${baseCurrencyRef} در انواع ارز یافت نشد.`,
        messageKey: "common.error",
      });
    }
    const quoteCur = await this.prisma.currencyType.findUnique({
      where: { id: BigInt(quoteCurrencyRef) },
      select: { id: true, code: true, title: true },
    });
    if (!quoteCur) {
      throw new BadRequestException({
        statusCode: 422,
        message: `ارز مورد مبادله با شناسهٔ ${quoteCurrencyRef} در انواع ارز یافت نشد.`,
        messageKey: "common.error",
      });
    }

    /* واحد مبادله — اختیاری؛ خالی = استخراج از ارز مبنا (placeholder تصویر) */
    let exchangeUnit: number | null = null;
    const rawUnit = String(dto.exchangeUnit ?? "").trim();
    if (rawUnit !== "") {
      exchangeUnit = Math.floor(Number(toLatinDigits(rawUnit)));
      if (!Number.isFinite(exchangeUnit) || exchangeUnit < 1) {
        throw new BadRequestException({
          statusCode: 422,
          message: "واحد مبادله باید عدد صحیح بزرگ‌تر از صفر باشد.",
          messageKey: "common.error",
        });
      }
    }

    /* نرخ برابری — اجباری، عدد مثبت؛ رشتهٔ نرمال (Decimal SQLite ندارد) */
    const rawRate = toLatinDigits(String(dto.rate ?? "")).trim();
    if (rawRate === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت نرخ برابری الزامی است؛ نرخ نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (!/^\d{1,12}(\.\d{1,8})?$/.test(rawRate) || Number(rawRate) <= 0) {
      throw new BadRequestException({
        statusCode: 422,
        message: "نرخ برابری باید عددی بزرگ‌تر از صفر باشد.",
        messageKey: "common.error",
      });
    }
    /* نرمال‌سازی عددی (حذف صفرهای پیشرو/انتهایی — «01.500» → «1.5») */
    const rate = String(Number(rawRate));

    /* قانون یکتایی: همان جفت‌ارز در همان تاریخ فقط یک‌بار (در همان ساختار) */
    const clash = await this.prisma.exchangeRate.findFirst({
      where: {
        businessStructureRef: HEAD_OFFICE_NODE_ID,
        effectiveDate,
        baseCurrencyRef: BigInt(baseCurrencyRef),
        quoteCurrencyRef: BigInt(quoteCurrencyRef),
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, effectiveDate: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `نرخ برابری تکراری است: برای جفت‌ارز «${baseCur.code} → ${quoteCur.code}» در تاریخ ${effectiveDate} قبلاً نرخ ثبت شده است.`,
        messageKey: "common.error",
      });
    }

    return {
      effectiveDate,
      baseCurrencyRef,
      quoteCurrencyRef,
      exchangeUnit,
      rate,
    };
  }

  /* --------------------------------- dto --------------------------------- */

  private toDto(r: {
    id: bigint;
    effectiveDate: string;
    baseCurrencyRef: bigint;
    quoteCurrencyRef: bigint;
    exchangeUnit: number | null;
    rate: string;
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
    return {
      id: Number(r.id), // §2.4 BigInt → number (گارد 2^53 در مولد ID)
      effectiveDate: r.effectiveDate,
      baseCurrencyRef: Number(r.baseCurrencyRef),
      quoteCurrencyRef: Number(r.quoteCurrencyRef),
      exchangeUnit: r.exchangeUnit,
      rate: r.rate,
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
