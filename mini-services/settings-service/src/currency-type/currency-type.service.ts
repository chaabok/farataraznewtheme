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
import { UpsertCurrencyTypeDto } from "./currency-type.dto";

/**
 * CurrencyType — Task 114 (درخواست مالک): فرم «نوع ارز جدید» در نرم‌افزار
 * «عمومی» → زیرمنوی «اطلاعات پایه». رعایت کامل فیلدهای ارث‌بری AppBaseEntity
 * (۸فیلدی): ID دستی از IDGeneration (§16)، Version با §2.5 auto-rowversion،
 * مهر Creator/LastModifier + زنجیرهٔ ساختار سازمانی روی هر ردیف
 * (تا استقرار IAM = SYSTEM_ACTOR / دفتر مرکزی ID=1).
 *
 * زنجیرهٔ اعتبارسنجی ثبت (خط دفاعی نهایی سمت سرور؛ فرانت همان قوانین را
 * پیش از ارسال هم چک می‌کند):
 *   ۱. کد/عنوان/عنوان لاتین اجباری‌اند و نمی‌توانند خالی باشند.
 *   ۲. نوع ارز تکراری رد می‌شود (کد یا عنوان یکتا در ساختار سازمانی —
 *      هم‌راستا با unique index دوتایی جدول).
 *   ۳. واحد مبنا عدد صحیح ≥ ۱؛ تعداد اعشار عدد صحیح ۰..۳ (ISO 4217).
 */

/** تبدیل ارقام فارسی/عربی به لاتین (سرور هر ورودی کاربری را نرمال می‌کند). */
function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

@Injectable()
export class CurrencyTypeService {
  private readonly logger = new Logger(CurrencyTypeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** فهرست انواع ارز (خواندن فعلاً سراسری؛ با اتصال IAM دامنه‌گذاری می‌شود). */
  async list() {
    const rows = await this.prisma.currencyType.findMany({
      orderBy: [{ code: "asc" }],
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async create(dto: UpsertCurrencyTypeDto) {
    const norm = this.normalizeInput(dto);
    await this.assertNotDuplicate(norm.code, norm.title, null);

    const newId = await this.idGen.generateNextId("CurrencyType");
    const row = await this.prisma.currencyType.create({
      data: {
        id: BigInt(newId),
        code: norm.code,
        title: norm.title,
        titleLatin: norm.titleLatin,
        baseUnit: norm.baseUnit,
        decimalPlaces: norm.decimalPlaces,
        decimalTitle: norm.decimalTitle,
        decimalTitleLatin: norm.decimalTitleLatin,
        isActive: norm.isActive,
        ...appBaseOnCreate(SYSTEM_ACTOR),
      },
    });
    this.logger.log(
      `CurrencyType created — ID=${newId} Code=${norm.code} Title=${norm.title}`,
    );
    return this.toDto(row);
  }

  async update(id: number, dto: UpsertCurrencyTypeDto) {
    const existing = await this.prisma.currencyType.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نوع ارز با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const norm = this.normalizeInput(dto);
    await this.assertNotDuplicate(norm.code, norm.title, existing.id);

    const row = await this.prisma.currencyType.update({
      where: { id: existing.id },
      data: {
        code: norm.code,
        title: norm.title,
        titleLatin: norm.titleLatin,
        baseUnit: norm.baseUnit,
        decimalPlaces: norm.decimalPlaces,
        decimalTitle: norm.decimalTitle,
        decimalTitleLatin: norm.decimalTitleLatin,
        isActive: norm.isActive,
        ...appBaseOnUpdate(SYSTEM_ACTOR),
      },
    });
    return this.toDto(row);
  }

  async remove(id: number) {
    const existing = await this.prisma.currencyType.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نوع ارز با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    await this.prisma.currencyType.delete({ where: { id: existing.id } });
    return { deleted: true, id };
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی ورودی + قوانین فیلدی (کد/عنوان/لاتین اجباری، اعداد معتبر). */
  private normalizeInput(dto: UpsertCurrencyTypeDto) {
    const code = toLatinDigits(String(dto.code ?? "")).trim();
    if (code === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت کد ارز الزامی است؛ کد نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }

    const title = String(dto.title ?? "").trim();
    if (title === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت عنوان ارز الزامی است؛ عنوان نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }

    const titleLatin = String(dto.titleLatin ?? "").trim();
    if (titleLatin === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت عنوان لاتین ارز الزامی است؛ عنوان لاتین نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }

    const baseUnit = Math.floor(Number(toLatinDigits(String(dto.baseUnit ?? 1))));
    if (!Number.isFinite(baseUnit) || baseUnit < 1) {
      throw new BadRequestException({
        statusCode: 422,
        message: "واحد مبنا باید عدد صحیح بزرگ‌تر از صفر باشد.",
        messageKey: "common.error",
      });
    }

    const decimalPlaces = Math.floor(
      Number(toLatinDigits(String(dto.decimalPlaces ?? 0))),
    );
    if (!Number.isFinite(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 3) {
      throw new BadRequestException({
        statusCode: 422,
        message: "تعداد اعشار باید عددی بین ۰ و ۳ باشد (الگوی ISO 4217).",
        messageKey: "common.error",
      });
    }

    const decimalTitle = String(dto.decimalTitle ?? "").trim() || null;
    const decimalTitleLatin = String(dto.decimalTitleLatin ?? "").trim() || null;

    return {
      code,
      title,
      titleLatin,
      baseUnit,
      decimalPlaces,
      decimalTitle,
      decimalTitleLatin,
      isActive: dto.isActive === true,
    };
  }

  /** قانون ۱ مالک: «نوع ارز تکراری ثبت نشود» (کد یا عنوان یکتا در ساختار). */
  private async assertNotDuplicate(
    code: string,
    title: string,
    excludeId: bigint | null,
  ) {
    const clash = await this.prisma.currencyType.findFirst({
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
        message: `نوع ارز تکراری است: ${byWhat} قبلاً برای ارز «${clash.code} - ${clash.title}» ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /* --------------------------------- dto --------------------------------- */

  private toDto(r: {
    id: bigint;
    code: string;
    title: string;
    titleLatin: string;
    baseUnit: number;
    decimalPlaces: number;
    decimalTitle: string | null;
    decimalTitleLatin: string | null;
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
    return {
      id: Number(r.id), // §2.4 BigInt → number (گارد 2^53 در مولد ID)
      code: r.code,
      title: r.title,
      titleLatin: r.titleLatin,
      baseUnit: r.baseUnit,
      decimalPlaces: r.decimalPlaces,
      decimalTitle: r.decimalTitle ?? "",
      decimalTitleLatin: r.decimalTitleLatin ?? "",
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
