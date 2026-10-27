import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import {
  appBaseOnCreate,
  appBaseOnUpdate,
  baseDataScopeWhere,
  HEAD_OFFICE_NODE_ID,
  SYSTEM_ACTOR,
  type AppBaseScope,
} from "../../../_shared/app-base-entity";
import { resolveDetailTypeChain } from "../detail-type/canonical-detail-types";
import { UpsertUserDto } from "./users.dto";

/**
 * User — Task 126 (درخواست مالک): فرم «کاربر جدید» در تنظیمات ← مدیریت کاربران
 * با کامپوننت SimpleTreeForm. هر کاربر: طرف حساب (لیست «نام/نام خانوادگی»
 * از فرم تعریف طرف حساب)، نام کاربری (>۵ نویسه)، کلمه عبور + تکرار (با دکمهٔ
 * مشاهده — ذخیره‌سازی همیشه هش scrypt نمک‌دار است)، نقش کاربری (لیست نقش‌ها)
 * و درختوارهٔ دسترسی‌ها (منوها ← زیرمنوها ← فرم‌ها ← آیکون‌های اکشن بار؛
 * با کلیک فعال/غیرفعال و دکمهٔ «همه»).
 *
 * قاعدهٔ سازمانی مالک (Task 126): «این فرم به ازای هر شرکت و هلدینگ می‌باشد و
 * در سطح هلدینگ و شرکت‌هایی که وجود دارد باید اطلاعات کاربری ایجاد شود... مگر
 * اینکه تیک استفاده از داده مشترک دفتر مرکزی فعال باشد که در این صورت کاربران
 * مشترک هست و نباید برای هر شرکت بصورت مجزا تعریف گردد» ⇒
 *   ثبت یک کاربر ⇒ ردیف دفتر مرکزی (۱) + یک ردیف برای «هر» شاخهٔ فعال
 *   هلدینگ(1)/شرکت(2) با IsBasicInfoShared=false؛ شاخهٔ دارای تیک ردیف مجزا
 *   نمی‌گیرد و با قرارداد اشتراک (baseDataScopeWhere) از دفتر مرکزی می‌خواند.
 * ردیف‌های درختوارهٔ دسترسی (UserAccess) برای «هر» ردیف ساخته می‌شوند.
 *
 * زنجیرهٔ اعتبارسنجی سرور:
 *   ۱. نام و نام خانوادگی + نام کاربری + نقش اجباری‌اند؛ نام کاربری باید
 *      بیشتر از ۵ نویسه باشد.
 *   ۲. کلمه عبور در ثبت اجباری است؛ در ویرایش خالی = بدون تغییر.
 *   ۳. تکرار نام کاربری در همان گرهٔ ساختار رد می‌شود (409).
 *   ۴. partyRef/userRoleRef ناموجود رد می‌شود (422).
 *   ۵. شاخه‌های دسترسی نرمال و شناخته‌شده‌اند (nodeType ∈ menu/submenu/form/action).
 *
 * رعایت کامل بلوک ارث‌بری AppBaseEntity ۸فیلدی، ID دستی از IDGeneration
 * (§2.4)، Version با §2.5 auto-rowversion — تا استقرار IAM = SYSTEM_ACTOR.
 */

interface AccessRow {
  nodeType: string;
  refKey: string;
}

const ACCESS_NODE_TYPES = new Set(["menu", "submenu", "form", "action"]);

/** نرمال‌سازی آرایهٔ رشته‌ای: trim + حذف خالی + یکتاسازی با حفظ ترتیب. */
function dedupeAccess(input: Array<{ nodeType?: string; refKey?: string }> | undefined): AccessRow[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: AccessRow[] = [];
  for (const raw of input) {
    const nodeType = String(raw?.nodeType ?? "").trim();
    const refKey = String(raw?.refKey ?? "").trim();
    if (!ACCESS_NODE_TYPES.has(nodeType) || refKey === "") continue;
    const key = `${nodeType}|${refKey}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ nodeType, refKey });
  }
  return out;
}

/** هش scrypt نمک‌دار — قالب «salt:hash» (هر دو hex). */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /**
   * فهرست کاربران — قرارداد واحد اشتراک داده (baseDataScopeWhere): با
   * structureId ⇒ ردیف‌های گرهٔ فعال + در صورت اشتراک (headOfficeShares)
   * ردیف‌های دفتر مرکزی؛ بدون پارامتر ⇒ خواندن سراسری.
   */
  async list(q: { structureId?: number; headOfficeShares?: boolean } = {}) {
    const include = {
      role: { select: { code: true, title: true } },
      accesses: { orderBy: [{ nodeType: "asc" as const }, { refKey: "asc" as const }] },
    };
    if (q.structureId != null && Number.isFinite(q.structureId) && q.structureId > 0) {
      const structureRef = BigInt(q.structureId);
      const chain = await resolveDetailTypeChain(this.prisma, structureRef);
      const scope: AppBaseScope = { nodeId: structureRef, ...chain };
      const rows = await this.prisma.user.findMany({
        where: baseDataScopeWhere(scope, q.headOfficeShares === true),
        orderBy: [{ fullName: "asc" }, { username: "asc" }],
        include,
      });
      return { items: rows.map((r) => this.toDto(r)) };
    }
    const rows = await this.prisma.user.findMany({
      orderBy: [{ fullName: "asc" }, { username: "asc" }],
      include,
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  /**
   * ثبت کاربر — قاعدهٔ سازمانی مالک: ردیف دفتر مرکزی + یک ردیف برای هر
   * شاخهٔ هلدینگ/شرکتِ فعالِ بدون تیکِ «داده مشترک دفتر مرکزی». همهٔ ردیف‌ها
   * و درختوارهٔ دسترسی‌شان در «یک» تراکنش ساخته می‌شوند.
   */
  async create(dto: UpsertUserDto) {
    const norm = await this.normalizeInput(dto, { requirePassword: true });
    const targets = await this.resolveCreateTargets();

    /* یکتایی نام کاربری در گره‌های هدف (409 با پیام فارسی) */
    const clash = await this.prisma.user.findFirst({
      where: { username: norm.username, businessStructureRef: { in: targets } },
      select: { id: true, username: true, businessStructureRef: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `نام کاربری «${norm.username}» قبلاً برای ساختار سازمانی #${clash.businessStructureRef} ثبت شده است.`,
        messageKey: "common.error",
      });
    }

    /* رزرو بلاکی شناسه‌ها (§2.4) — کاربرها و ردیف‌های دسترسی */
    const userIds = await this.idGen.generateNextIdBlock("User", targets.length);
    const accessTotal = targets.length * norm.accesses.length;
    const accessIds =
      accessTotal > 0
        ? await this.idGen.generateNextIdBlock("UserAccess", accessTotal)
        : [];

    /* زنجیرهٔ ارث هر گره پیش از تراکنش (کلاینت tx نوع PrismaService ندارد) */
    const targetChains = new Map<bigint, Awaited<ReturnType<typeof resolveDetailTypeChain>>>();
    for (const target of targets) {
      targetChains.set(target, await resolveDetailTypeChain(this.prisma, target));
    }

    await this.prisma.$transaction(async (tx) => {
      let accessCursor = 0;
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const chain = targetChains.get(target)!;
        await tx.user.create({
          data: {
            id: BigInt(userIds[i]),
            partyRef: norm.partyRef,
            fullName: norm.fullName,
            username: norm.username,
            passwordHash: norm.passwordHash,
            userRoleRef: norm.userRoleRef,
            isActive: norm.isActive,
            ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: target, ...chain }),
          },
        });
        if (norm.accesses.length > 0) {
          await tx.userAccess.createMany({
            data: norm.accesses.map((a) => ({
              id: BigInt(accessIds[accessCursor++]),
              userRef: BigInt(userIds[i]),
              nodeType: a.nodeType,
              refKey: a.refKey,
              ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: target, ...chain }),
            })),
          });
        }
      }
    });
    this.logger.log(
      `User created — ${targets.length} row(s) [${targets.join(",")}] Username=${norm.username} Role=${norm.userRoleRef} Accesses=${norm.accesses.length}/row (Task 126)`,
    );
    /* ردیف اصلی = دفتر مرکزی (اولین هدف) — پاسخ ثبت هم همین قرارداد است */
    return this.readFull(BigInt(userIds[0]));
  }

  /** ویرایش «یک» ردیف کاربر — درختوارهٔ دسترسی تراکنشی بازنویسی می‌شود. */
  async update(id: number, dto: UpsertUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `کاربر با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const norm = await this.normalizeInput(dto, { requirePassword: false });

    /* یکتایی نام کاربری در همان گره (به‌جز خود ردیف) */
    const clash = await this.prisma.user.findFirst({
      where: {
        username: norm.username,
        businessStructureRef: existing.businessStructureRef,
        id: { not: existing.id },
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `نام کاربری «${norm.username}» قبلاً برای این ساختار سازمانی ثبت شده است.`,
        messageKey: "common.error",
      });
    }

    const accessRows = await this.reserveAccessIds(norm.accesses);
    await this.prisma.$transaction(async (tx) => {
      /* بازنویسی کامل درختوارهٔ دسترسی — الگوی محدودهٔ نقش‌ها (Task 100) */
      await tx.userAccess.deleteMany({ where: { userRef: existing.id } });
      await tx.user.update({
        where: { id: existing.id },
        data: {
          partyRef: norm.partyRef,
          fullName: norm.fullName,
          username: norm.username,
          /* کلمه عبور خالی = بدون تغییر */
          ...(norm.passwordHash ? { passwordHash: norm.passwordHash } : {}),
          userRoleRef: norm.userRoleRef,
          isActive: norm.isActive,
          ...appBaseOnUpdate(SYSTEM_ACTOR),
        },
      });
      if (accessRows.length > 0) {
        await tx.userAccess.createMany({
          data: accessRows.map((a) => ({
            ...a,
            userRef: existing.id,
            ...appBaseOnCreate(SYSTEM_ACTOR),
          })),
        });
      }
    });
    return this.readFull(existing.id);
  }

  async remove(id: number) {
    const existing = await this.prisma.user.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `کاربر با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    await this.prisma.user.delete({ where: { id: existing.id } }); // accesses با Cascade
    this.logger.log(`User deleted — ID=${id} Username=${existing.username}`);
    return { deleted: true, id };
  }

  /** خواندن کامل یک کاربر با نقش و ردیف‌های دسترسی (پاسخ ثبت/ویرایش هم همین است). */
  private async readFull(id: bigint) {
    const row = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: { select: { code: true, title: true } },
        accesses: { orderBy: [{ nodeType: "asc" }, { refKey: "asc" }] },
      },
    });
    if (!row) {
      throw new NotFoundException({
        statusCode: 404,
        message: `کاربر با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    return this.toDto(row);
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی ورودی + اعتبارسنجی قواعد مالک با پیام فارسی. */
  private async normalizeInput(
    dto: UpsertUserDto,
    opts: { requirePassword: boolean },
  ) {
    const fullName = String(dto.fullName ?? "").trim();
    if (fullName === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "انتخاب نام و نام خانوادگی از لیست طرف حساب الزامی است.",
        messageKey: "common.error",
      });
    }
    const username = String(dto.username ?? "").trim();
    if (username === "" || username.length <= 5) {
      throw new BadRequestException({
        statusCode: 422,
        message: "نام کاربری باید بیشتر از ۵ نویسه باشد و نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }

    const passwordRaw = String(dto.password ?? "");
    let passwordHash: string | null = null;
    if (passwordRaw !== "") {
      passwordHash = hashPassword(passwordRaw);
    } else if (opts.requirePassword) {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت کلمه عبور الزامی است؛ کلمه عبور نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }

    const userRoleRef = BigInt(dto.userRoleRef);
    const role = await this.prisma.userRole.findUnique({
      where: { id: userRoleRef },
      select: { id: true },
    });
    if (!role) {
      throw new BadRequestException({
        statusCode: 422,
        message: `نقش کاربری با شناسهٔ ${dto.userRoleRef} یافت نشد؛ ابتدا نقش را در فرم «نقش کاربری جدید» تعریف کنید.`,
        messageKey: "common.error",
      });
    }

    let partyRef: bigint | null = null;
    if (dto.partyRef != null && Number.isFinite(dto.partyRef) && dto.partyRef > 0) {
      const pr = BigInt(dto.partyRef);
      const party = await this.prisma.party.findUnique({ where: { id: pr }, select: { id: true } });
      if (!party) {
        throw new BadRequestException({
          statusCode: 422,
          message: `طرف حساب با شناسهٔ ${dto.partyRef} یافت نشد.`,
          messageKey: "common.error",
        });
      }
      partyRef = pr;
    }

    return {
      partyRef,
      fullName: fullName.slice(0, 200),
      username,
      passwordHash,
      userRoleRef,
      isActive: dto.isActive !== false,
      accesses: dedupeAccess(dto.accesses),
    };
  }

  /**
   * گره‌های هدف ثبت (قاعدهٔ مالک Task 126): دفتر مرکزی (۱) + همهٔ شاخه‌های
   * فعال هلدینگ(1)/شرکت(2) با IsBasicInfoShared=false.
   */
  private async resolveCreateTargets(): Promise<bigint[]> {
    const nodes = await this.prisma.businessStructure.findMany({
      where: { isActive: true, businessStructureType: { in: [1, 2] } },
      select: { id: true, isBasicInfoShared: true },
    });
    const targets = new Set<bigint>([HEAD_OFFICE_NODE_ID]);
    for (const n of nodes) {
      if (!n.isBasicInfoShared) targets.add(n.id);
    }
    return [...targets];
  }

  /** رزرو بلاکی شناسهٔ ردیف‌های دسترسی (§2.4 — ID دستی؛ gap پذیرفته‌شده). */
  private async reserveAccessIds(accesses: AccessRow[]): Promise<Array<AccessRow & { id: bigint }>> {
    if (accesses.length === 0) return [];
    const startId = await this.idGen.generateNextIdBlock("UserAccess", accesses.length);
    return accesses.map((a, i) => ({ ...a, id: BigInt(startId + i) }));
  }

  /* --------------------------------- dto --------------------------------- */

  private toDto(r: {
    id: bigint;
    partyRef: bigint | null;
    fullName: string;
    username: string;
    userRoleRef: bigint;
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
    role?: { code: string; title: string } | null;
    accesses: Array<{ nodeType: string; refKey: string }>;
  }) {
    return {
      id: Number(r.id), // §2.4 BigInt → number (گارد 2^53 در مولد ID)
      partyRef: r.partyRef == null ? null : Number(r.partyRef),
      fullName: r.fullName,
      username: r.username,
      userRoleRef: Number(r.userRoleRef),
      roleCode: r.role?.code ?? "",
      roleTitle: r.role?.title ?? "",
      isActive: r.isActive,
      accesses: r.accesses.map((a) => ({ nodeType: a.nodeType, refKey: a.refKey })),
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
