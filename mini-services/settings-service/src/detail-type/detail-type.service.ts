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
import { UpsertDetailTypeDto } from "./detail-type.dto";

/**
 * DetailTypeService — Task 120 (درخواست مالک): فرم «نوع تفصیل جدید» در
 * نرم‌افزار «حسابداری» → زیرمنوی «اطلاعات پایه». رعایت کامل ارث‌بری
 * AppBaseEntity (۸فیلدی): ID از IDGeneration (§۱۶)، Version با §۲.۵
 * auto-rowversion، مهر Creator/LastModifier + زنجیرهٔ ساختار سازمانی
 * روی هر ردیف (تا استقرار IAM = SYSTEM_ACTOR / دفتر مرکزی ID=۱).
 *
 * زنجیرهٔ اعتبارسنجی ثبت (خط دفاعی نهایی سمت سرور؛ فرانت همان قوانین را
 * پیش از ارسال هم چک می‌کند):
 *   ۱. کد/عنوان اجباری‌اند (۴۲۲ پیام روشن).
 *   ۲. نوع تفصیل تکراری رد می‌شود (کد یا عنوان یکتا در ساختار سازمانی —
 *      هم‌راستا با unique index جدول — ۴۰۹).
 *
 * بدون فیلد عنوان لاتین — فرمان صریح مالک («عنوان لاتین را نیاز نداریم
 * که در فرم باشد»)؛ توضیحات اختیاری است.
 */

/** تبدیل ارقام فارسی/عربی به لاتین (سرور هر ورودی کاربری را نرمال می‌کند). */
function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

@Injectable()
export class DetailTypeService {
  private readonly logger = new Logger(DetailTypeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** فهرست انواع تفصیل (خواندن فعلاً سراسری؛ با اتصال IAM دامنه‌گذاری می‌شود). */
  async list() {
    const rows = await this.prisma.detailType.findMany({
      orderBy: [{ code: "asc" }],
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async create(dto: UpsertDetailTypeDto) {
    const norm = this.normalizeInput(dto);
    await this.assertNotDuplicate(norm.code, norm.title, null);

    const newId = await this.idGen.generateNextId("DetailType");
    const row = await this.prisma.detailType.create({
      data: {
        id: BigInt(newId),
        code: norm.code,
        title: norm.title,
        description: norm.description,
        isActive: norm.isActive,
        ...appBaseOnCreate(SYSTEM_ACTOR),
      },
    });
    this.logger.log(
      `DetailType created — ID=${newId} Code=${norm.code} Title=${norm.title}`,
    );
    return this.toDto(row);
  }

  async update(id: number, dto: UpsertDetailTypeDto) {
    const existing = await this.prisma.detailType.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نوع تفصیل با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const norm = this.normalizeInput(dto);
    await this.assertNotDuplicate(norm.code, norm.title, existing.id);

    const row = await this.prisma.detailType.update({
      where: { id: existing.id },
      data: {
        code: norm.code,
        title: norm.title,
        description: norm.description,
        isActive: norm.isActive,
        ...appBaseOnUpdate(SYSTEM_ACTOR),
      },
    });
    return this.toDto(row);
  }

  async remove(id: number) {
    const existing = await this.prisma.detailType.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نوع تفصیل با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    await this.prisma.detailType.delete({ where: { id: existing.id } });
    return { deleted: true, id };
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی ورودی + قوانین فیلدی (کد/عنوان اجباری؛ توضیحات اختیاری). */
  private normalizeInput(dto: UpsertDetailTypeDto) {
    const code = toLatinDigits(String(dto.code ?? "")).trim();
    if (code === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت کد نوع تفصیل الزامی است؛ کد نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (code.length > 20) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد نوع تفصیل حداکثر ۲۰ نویسه است.",
        messageKey: "common.error",
      });
    }

    const title = String(dto.title ?? "").trim();
    if (title === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت عنوان نوع تفصیل الزامی است؛ عنوان نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (title.length > 100) {
      throw new BadRequestException({
        statusCode: 422,
        message: "عنوان نوع تفصیل حداکثر ۱۰۰ نویسه است.",
        messageKey: "common.error",
      });
    }

    const description = String(dto.description ?? "").trim() || null;
    if (description && description.length > 500) {
      throw new BadRequestException({
        statusCode: 422,
        message: "توضیحات حداکثر ۵۰۰ نویسه است.",
        messageKey: "common.error",
      });
    }

    return { code, title, description, isActive: dto.isActive === true };
  }

  /** قانون یکتایی: کد یا عنوان تکراری در همان ساختار سازمانی رد می‌شود (۴۰۹). */
  private async assertNotDuplicate(
    code: string,
    title: string,
    excludeId: bigint | null,
  ) {
    const clash = await this.prisma.detailType.findFirst({
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
        message: `نوع تفصیل تکراری است: ${byWhat} قبلاً برای نوع تفصیل «${clash.code} - ${clash.title}» ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /* --------------------------------- dto --------------------------------- */

  private toDto(r: {
    id: bigint;
    code: string;
    title: string;
    description: string | null;
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
      description: r.description ?? "",
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
