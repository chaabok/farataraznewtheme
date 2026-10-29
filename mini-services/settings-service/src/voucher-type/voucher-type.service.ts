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
import { UpsertVoucherTypeDto } from "./voucher-type.dto";

/**
 * VoucherTypeService — Task 153 (درخواست مالک): فرم «نوع سند جدید» در
 * نرم‌افزار «حسابداری» → زیرمنوی «سند حسابداری» (Task 150). رعایت کامل
 * ارث‌بری AppBaseEntity (۸فیلدی): ID از IDGeneration (§۱۶)، Version با §۲.۵
 * auto-rowversion، مهر Creator/LastModifier روی هر ردیف
 * (تا استقرار IAM = SYSTEM_ACTOR / دفتر مرکزی ID=۱ — الگوی CurrencyType).
 *
 * زنجیرهٔ اعتبارسنجی ثبت (خط دفاعی نهایی سمت سرور؛ فرانت همان قوانین را
 * پیش از ارسال هم چک می‌کند):
 *   ۱. کد/عنوان اجباری‌اند (۴۲۲ پیام روشن).
 *   ۲. نوع سند تکراری رد می‌شود (کد یا عنوان یکتا در ساختار سازمانی —
 *      هم‌راستا با unique index جدول — ۴۰۹).
 *
 * ۹ نوع پیش‌فرض تصویر مالک (سند عادی، افتتاحیه، اختتامیه، بستن حساب‌ها،
 * شرح و زبان، انتقال، اصلاح و حذف، حقوق و دستمزد، هزینه‌های عمومی) در
 * SeedService با گارد «اگر نبود بساز» بذر می‌شود (seedVoucherTypes).
 */

/** تبدیل ارقام فارسی/عربی به لاتین (سرور هر ورودی کاربری را نرمال می‌کند). */
function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

@Injectable()
export class VoucherTypeService {
  private readonly logger = new Logger(VoucherTypeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** فهرست انواع سند — مرتب با ترتیب عددی-آگاهِ کد (۱..۹ عین تصویر مالک؛
      کدهای حرفی در انتها — الگوی sortDetailTypeRows). */
  async list() {
    const rows = await this.prisma.voucherType.findMany({
      orderBy: [{ code: "asc" }],
    });
    rows.sort((a, b) => compareCodeAware(a.code, b.code));
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async create(dto: UpsertVoucherTypeDto) {
    const norm = this.normalizeInput(dto);
    await this.assertNotDuplicate(norm.code, norm.title, null);

    const newId = await this.idGen.generateNextId("VoucherType");
    const row = await this.prisma.voucherType.create({
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
      `VoucherType created — ID=${newId} Code=${norm.code} Title=${norm.title}`,
    );
    return this.toDto(row);
  }

  async update(id: number, dto: UpsertVoucherTypeDto) {
    const existing = await this.prisma.voucherType.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نوع سند با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const norm = this.normalizeInput(dto);
    await this.assertNotDuplicate(norm.code, norm.title, existing.id);

    const row = await this.prisma.voucherType.update({
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
    const existing = await this.prisma.voucherType.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نوع سند با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    await this.prisma.voucherType.delete({ where: { id: existing.id } });
    return { deleted: true, id };
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی ورودی + قوانین فیلدی (کد/عنوان اجباری؛ توضیحات اختیاری). */
  private normalizeInput(dto: UpsertVoucherTypeDto) {
    const code = toLatinDigits(String(dto.code ?? "")).trim();
    if (code === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت کد نوع سند الزامی است؛ کد نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (code.length > 20) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد نوع سند حداکثر ۲۰ نویسه است.",
        messageKey: "common.error",
      });
    }

    const title = String(dto.title ?? "").trim();
    if (title === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت عنوان نوع سند الزامی است؛ عنوان نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (title.length > 100) {
      throw new BadRequestException({
        statusCode: 422,
        message: "عنوان نوع سند حداکثر ۱۰۰ نویسه است.",
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
    const clash = await this.prisma.voucherType.findFirst({
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
        message: `نوع سند تکراری است: ${byWhat} قبلاً برای نوع سند «${clash.code} - ${clash.title}» ثبت شده است.`,
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

/** ترتیب عددی-آگاهِ کد: «۲» قبل از «۱۰» (الگوی سبک sortDetailTypeRows). */
export function compareCodeAware(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb) && a !== "" && b !== "") {
    return na - nb;
  }
  if (Number.isFinite(na) && a !== "") return -1; // کدهای عددی اول
  if (Number.isFinite(nb) && b !== "") return 1;
  return a.localeCompare(b, "fa");
}
