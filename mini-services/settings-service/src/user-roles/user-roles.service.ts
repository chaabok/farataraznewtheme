import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { UpsertUserRoleDto } from "./user-roles.dto";

/**
 * UserRole — Task 100 (درخواست مالک): فرم «نقش کاربری جدید» در پنجرهٔ تنظیمات
 * ← مدیریت کاربران. کاربر نقش‌های سازمان خودش را تعریف می‌کند و برای هر نقش
 * «محدودهٔ دسترسی» تعیین می‌کند (دو بُعد: نرم‌افزارها + ساختار سازمانی).
 *
 * قرارداد محدودهٔ دسترسی (انبارش در UserRoleScope):
 *   · ScopeType "software"  → RefKey = appKey نرم‌افزار (Systems.Code)؛
 *     نبودِ هیچ ردیف "software" = «همهٔ نرم‌افزارها» (بدون محدودیت).
 *   · ScopeType "structure" → RefKey = شناسهٔ گرهٔ BusinessStructure؛
 *     نبودِ هیچ ردیف "structure" = «کل ساختار سازمانی»؛ معنای هر گره شامل
 *     زیرمجموعه‌هایش است (به هنگام اعمال).
 * ردیف‌های محدوده با هر ثبت/ویرایش به‌صورت تراکنشی بازنویسی می‌شوند (الگوی
 * بازنویسی تب‌های طرف حساب — Task 84).
 *
 * زنجیرهٔ اعتبارسنجی ثبت (خط دفاعی نهایی سمت سرور):
 *   ۱. کد و عنوان اجباری‌اند.
 *   ۲. کد/عنوان تکراری در ساختار سازمانی رد می‌شود (409).
 *   ۳. در حالت برگزیده، آرایهٔ خالی از فرانت نمی‌آید (فرانت جلویش را می‌گیرد)؛
 *      آرایهٔ خالی دریافتی به معنای «بدون محدودیت» تفسیر می‌شود.
 *   ۴. appKeyهای ناشناخته و شناسه‌های گرهٔ ناموجود رد می‌شوند (422).
 *   ۵. نقش سیستمی (IsSystem) حذف‌شدنی نیست (403) — «مدیر سیستم» seed بوت.
 *
 * رعایت کامل بلوک ارث‌بری AppBaseEntity ۸فیلدی، ID دستی از IDGeneration
 * (§16)، Version با §2.5 auto-rowversion — تا استقرار IAM = SYSTEM_ACTOR.
 */

interface ScopeRow {
  scopeType: "software" | "structure";
  refKey: string;
}

/** نرمال‌سازی آرایهٔ رشته‌ای: trim + حذف خالی + یکتاسازی با حفظ ترتیب. */
function dedupeStrings(input: string[] | undefined): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const raw of input) {
    const v = String(raw ?? "").trim();
    if (v !== "" && !out.includes(v)) out.push(v);
  }
  return out;
}

@Injectable()
export class UserRolesService {
  private readonly logger = new Logger(UserRolesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** فهرست نقش‌ها با محدودهٔ دسترسی هرکدام (خواندن فعلاً سراسری؛ با IAM دامنه‌گذاری می‌شود). */
  async list() {
    const rows = await this.prisma.userRole.findMany({
      orderBy: [{ code: "asc" }],
      include: { scopes: { orderBy: [{ scopeType: "asc" }, { refKey: "asc" }] } },
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  async create(dto: UpsertUserRoleDto) {
    const norm = await this.normalizeInput(dto);
    await this.assertNotDuplicate(norm.code, norm.title, null);

    const newId = await this.idGen.generateNextId("UserRole");
    const scopeRows = await this.reserveScopeIds(norm.scopes);
    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.userRole.create({
        data: {
          id: BigInt(newId),
          code: norm.code,
          title: norm.title,
          description: norm.description,
          isActive: norm.isActive,
          isSystem: false, // نقش کاربر-تعریف هرگز سیستمی نیست
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
      if (scopeRows.length > 0) {
        await tx.userRoleScope.createMany({
          data: scopeRows.map((s) => ({
            ...s,
            userRoleRef: created.id,
            ...appBaseOnCreate(SYSTEM_ACTOR),
          })),
        });
      }
      return created;
    });
    this.logger.log(`UserRole created — ID=${newId} Code=${norm.code} Title=${norm.title}`);
    return this.readFull(row.id);
  }

  async update(id: number, dto: UpsertUserRoleDto) {
    const existing = await this.prisma.userRole.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نقش کاربری با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const norm = await this.normalizeInput(dto);
    await this.assertNotDuplicate(norm.code, norm.title, existing.id);

    const scopeRows = await this.reserveScopeIds(norm.scopes);
    const row = await this.prisma.$transaction(async (tx) => {
      /* بازنویسی کامل محدوده — الگوی تب‌های طرف حساب */
      await tx.userRoleScope.deleteMany({ where: { userRoleRef: existing.id } });
      const updated = await tx.userRole.update({
        where: { id: existing.id },
        data: {
          code: norm.code,
          title: norm.title,
          description: norm.description,
          isActive: norm.isActive,
          ...appBaseOnUpdate(SYSTEM_ACTOR),
        },
      });
      if (scopeRows.length > 0) {
        await tx.userRoleScope.createMany({
          data: scopeRows.map((s) => ({
            ...s,
            userRoleRef: existing.id,
            ...appBaseOnCreate(SYSTEM_ACTOR),
          })),
        });
      }
      return updated;
    });
    return this.readFull(row.id);
  }

  async remove(id: number) {
    const existing = await this.prisma.userRole.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نقش کاربری با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    if (existing.isSystem) {
      throw new ForbiddenException({
        statusCode: 403,
        message: `نقش سیستمی «${existing.title}» حذف‌شدنی نیست.`,
        messageKey: "common.error",
      });
    }
    await this.prisma.userRole.delete({ where: { id: existing.id } }); // scopes با Cascade
    return { deleted: true, id };
  }

  /** خواندن کامل یک نقش با ردیف‌های محدودهٔ دسترسی (پاسخ ثبت/ویرایش هم همین قرارداد است). */
  private async readFull(id: bigint) {
    const row = await this.prisma.userRole.findUnique({
      where: { id },
      include: { scopes: { orderBy: [{ scopeType: "asc" }, { refKey: "asc" }] } },
    });
    if (!row) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نقش کاربری با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    return this.toDto(row);
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی ورودی + اعتبارسنجی وجود appKeyها و گره‌های ساختار سازمانی. */
  private async normalizeInput(dto: UpsertUserRoleDto) {
    const code = String(dto.code ?? "").trim();
    if (code === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت کد نقش کاربری الزامی است؛ کد نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    const title = String(dto.title ?? "").trim();
    if (title === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت عنوان نقش کاربری الزامی است؛ عنوان نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    const description = String(dto.description ?? "").trim();

    const softwareKeys = dedupeStrings(dto.softwareKeys);
    const structureIds = dedupeStrings(dto.structureIds);

    /* appKeyهای ناشناخته رد می‌شوند (Systems مرجع نرم‌افزارهاست) */
    if (softwareKeys.length > 0) {
      const known = await this.prisma.systems.findMany({
        where: { code: { in: softwareKeys } },
        select: { code: true },
      });
      const knownSet = new Set(known.map((s) => s.code));
      const unknown = softwareKeys.filter((k) => !knownSet.has(k));
      if (unknown.length > 0) {
        throw new BadRequestException({
          statusCode: 422,
          message: `نرم‌افزار(های) ناشناخته در محدودهٔ دسترسی: ${unknown.join("، ")}`,
          messageKey: "common.error",
        });
      }
    }

    /* شناسه‌های گرهٔ ناموجود رد می‌شوند (BusinessStructure مرجع ساختار است) */
    if (structureIds.length > 0) {
      const numeric: bigint[] = [];
      for (const raw of structureIds) {
        if (!/^[0-9]+$/.test(raw)) {
          throw new BadRequestException({
            statusCode: 422,
            message: `شناسهٔ نامعتبر در محدودهٔ ساختار سازمانی: «${raw}»`,
            messageKey: "common.error",
          });
        }
        numeric.push(BigInt(raw));
      }
      const nodes = await this.prisma.businessStructure.findMany({
        where: { id: { in: numeric } },
        select: { id: true },
      });
      const nodeSet = new Set(nodes.map((n) => n.id.toString()));
      const missing = structureIds.filter((k) => !nodeSet.has(k));
      if (missing.length > 0) {
        throw new BadRequestException({
          statusCode: 422,
          message: `سطح(های) ناموجود در ساختار سازمانی: ${missing.join("، ")}`,
          messageKey: "common.error",
        });
      }
    }

    const scopes: ScopeRow[] = [
      ...softwareKeys.map((refKey) => ({ scopeType: "software" as const, refKey })),
      ...structureIds.map((refKey) => ({ scopeType: "structure" as const, refKey })),
    ];

    return {
      code,
      title,
      description: description === "" ? null : description,
      isActive: dto.isActive === true,
      scopes,
    };
  }

  /** قانون یکتایی مالک: کد/عنوان تکراری در ساختار سازمانی رد می‌شود (409). */
  private async assertNotDuplicate(code: string, title: string, excludeId: bigint | null) {
    const clash = await this.prisma.userRole.findFirst({
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
        message: `نقش کاربری تکراری است: ${byWhat} قبلاً برای نقش «${clash.code} - ${clash.title}» ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** رزرو بلاکی شناسهٔ ردیف‌های محدوده (§16 — ID دستی؛ §8 سوختن id در خطا پذیرفته است). */
  private async reserveScopeIds(
    scopes: ScopeRow[],
  ): Promise<Array<ScopeRow & { id: bigint }>> {
    if (scopes.length === 0) return [];
    const startId = await this.idGen.generateNextIdBlock("UserRoleScope", scopes.length);
    return scopes.map((s, i) => ({ ...s, id: BigInt(startId + i) }));
  }

  /* --------------------------------- dto --------------------------------- */

  private toDto(r: {
    id: bigint;
    code: string;
    title: string;
    description: string | null;
    isActive: boolean;
    isSystem: boolean;
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
    scopes: Array<{ scopeType: string; refKey: string }>;
  }) {
    return {
      id: Number(r.id), // §2.4 BigInt → number (گارد 2^53 در مولد ID)
      code: r.code,
      title: r.title,
      description: r.description ?? "",
      isActive: r.isActive,
      isSystem: r.isSystem,
      softwareKeys: r.scopes.filter((s) => s.scopeType === "software").map((s) => s.refKey),
      structureIds: r.scopes
        .filter((s) => s.scopeType === "structure")
        .map((s) => s.refKey),
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
