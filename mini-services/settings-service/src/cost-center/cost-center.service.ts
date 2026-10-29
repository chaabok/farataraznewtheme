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
  baseDataScopeWhere,
  HEAD_OFFICE_NODE_ID,
  SYSTEM_ACTOR,
  type AppBaseScope,
} from "../../../_shared/app-base-entity";
import { UpsertCostCenterDto } from "./cost-center.dto";
import {
  COST_CENTER_TYPE_VALUES,
  costCenterTypeLabel,
} from "./cost-center-type";
import {
  DetailCodeAssignmentService,
  type NumberingInfo,
} from "../detail-code-assignment/detail-code-assignment.service";
import { resolveDetailTypeChain } from "../detail-type/canonical-detail-types";

/**
 * CostCenterService — Task 146 (درخواست مالک): فرم «مرکز هزینه جدید» در
 * نرم‌افزار «حسابداری» ← زیرمنوی «اطلاعات تفصیلی ها».
 *
 * مرکز هزینه یک «حساب تفصیلی» است (نوع «مراکز هزینه» — کد مرجع ۱۵ از فرم
 * نوع تفصیلی) + پروفایل اختصاصی (کد، نوع Enum). هر ثبت/ویرایش دو ردیف
 * هم‌تراز می‌سازد (تراکنش اتمی):
 *   · DetailItem  — کد تفصیل/عنوان/توضیحات/فعال (در فهرست «ایجاد تفصیلی ها»
 *     هم دیده می‌شود؛ فضای شماره‌گذاری مشترک همهٔ تفصیلی‌ها).
 *   · CostCenter  — کد مرکز هزینه + نوع مرکز هزینه (Enum 1..5).
 *
 * کد تفصیل با «متد اختصاصی تخصیص کد تفصیل» (DetailCodeAssignmentService —
 * Task 146) تخصیص می‌یابد:
 *   · ثبت تازه با کد تفصیل خالی و شماره‌گذاری خودکار ⇒ نخستین عدد
 *     بلااستفادهٔ بازهٔ [شماره شروع..شماره پایان] همان نوع در گرهٔ فعال
 *     ساختار کسب و کار — تک‌مرجع تخصیص سرور است (کلاینت فقط پیشنهاد می‌بیند).
 *   · شماره‌گذاری دستی ⇒ کد تفصیل دستی با قوانین عددی/درون‌بازه/یکتا.
 *
 * زنجیرهٔ اعتبارسنجی سرور (خط دفاعی نهایی — فرانت همان قوانین را پیش از
 * ارسال با پیام‌های دقیق مالک چک می‌کند): ۴۲۲ فیلدی، ۴۰۹ تکراری، ۴۰۴ ناموجود.
 */

/** تبدیل ارقام فارسی/عربی به لاتین (سرور هر ورودی کاربری را نرمال می‌کند). */
function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** ترتیب عددی-آگاهِ کد («۱..۲۱» درست مرتب شود، کدهای حرفی آخر). */
function sortNumericAware<T extends { code: string }>(rows: T[]): T[] {
  const key = (code: string): [number, string] => {
    const m = /^(\d+)$/.exec(code.trim());
    return m ? [Number(m[1]), ""] : [Number.MAX_SAFE_INTEGER, code];
  };
  return [...rows].sort((a, b) => {
    const [na, sa] = key(a.code);
    const [nb, sb] = key(b.code);
    return na - nb || sa.localeCompare(sb);
  });
}

@Injectable()
export class CostCenterService {
  private readonly logger = new Logger(CostCenterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
    private readonly assignment: DetailCodeAssignmentService,
  ) {}

  /* -------------------------------- read --------------------------------- */

  /**
   * فهرست مراکز هزینه — Task 122 (قرارداد واحد اشتراک داده): با structureId ⇒
   * ردیف‌های گرهٔ فعال + در صورت اشتراک (headOfficeShares) دفتر مرکزی؛
   * بدون پارامتر ⇒ دفتر مرکزی. ترتیب: عددی-آگاهِ کد مرکز هزینه.
   */
  async list(q: { structureId?: number; headOfficeShares?: boolean } = {}) {
    const scope = await this.resolveReadScope(q.structureId);
    const rows = await this.prisma.costCenter.findMany({
      where: baseDataScopeWhere(scope, q.headOfficeShares === true),
    });
    /* join دستی DetailItem + نوع تفصیل (بدون relation در اسکیما) */
    const itemRefs = rows.map((r) => r.detailItemRef);
    const items = await this.prisma.detailItem.findMany({
      where: { id: { in: itemRefs } },
      select: {
        id: true,
        detailTypeRef: true,
        code: true,
        title: true,
        description: true,
        isActive: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const itemMap = new Map(items.map((i) => [i.id, i]));
    const typeIds = [...new Set(items.map((i) => i.detailTypeRef))];
    const types = await this.prisma.detailType.findMany({
      where: { id: { in: typeIds } },
      select: { id: true, code: true, title: true },
    });
    const typeMap = new Map(types.map((t) => [t.id, t]));
    const joined = rows
      .map((r) => {
        const item = itemMap.get(r.detailItemRef);
        if (!item) return null; // ردیف یتیم — نمایش داده نمی‌شود
        const dt = typeMap.get(item.detailTypeRef);
        return this.toDto(r, item, dt?.code ?? "", dt?.title ?? "");
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    return { items: sortNumericAware(joined) };
  }

  /* ------------------------------- mutations ------------------------------ */

  /** ثبت مرکز هزینه — کد تفصیل خالی + شماره‌گذاری خودکار ⇒ متد اختصاصی. */
  async create(dto: UpsertCostCenterDto) {
    const target = await this.resolveTargetStructure(dto.structureId);
    const norm = this.normalizeInput(dto);

    const type = await this.assignment.resolveFormType(
      { canonicalCode: "15", title: "مراکز هزینه" },
      { nodeId: target.structureRef, ...target.chain },
      true,
    );
    const numbering = await this.assignment.ensureNumbering(type);

    /* کد تفصیل — تخصیص با متد اختصاصی (لایو ایجکس فقط پیشنهاد می‌دهد) */
    let detailCode = norm.detailCode;
    if (detailCode === "") {
      detailCode = await this.assignment.allocateDetailCode({
        formKey: "cost-center",
        structureRef: target.structureRef,
      });
    } else {
      this.assertDetailCodeFormat(detailCode, numbering, type);
      await this.assertDetailCodeAvailable(detailCode, target.structureRef, null);
    }

    /* یکتایی کد مرکز هزینه و عنوان در گرهٔ هدف */
    await this.assertCenterCodeAvailable(norm.code, target.structureRef, null);
    await this.assertTitleAvailable(norm.title, target.structureRef, null, type);

    /* ثبت اتمی: DetailItem (تفصیلی) + CostCenter (پروفایل Enum) */
    const detailItemId = await this.idGen.generateNextId("DetailItem");
    const centerId = await this.idGen.generateNextId("CostCenter");
    const { item, center } = await this.prisma.$transaction(async (tx) => {
      const item = await tx.detailItem.create({
        data: {
          id: BigInt(detailItemId),
          detailTypeRef: type.id,
          code: detailCode,
          title: norm.title,
          description: norm.description,
          isActive: norm.isActive,
          ...appBaseOnCreate({
            userId: SYSTEM_ACTOR.userId,
            nodeId: target.structureRef,
            ...target.chain,
          }),
        },
      });
      const center = await tx.costCenter.create({
        data: {
          id: BigInt(centerId),
          detailItemRef: item.id,
          code: norm.code,
          costCenterType: norm.costCenterType,
          ...appBaseOnCreate({
            userId: SYSTEM_ACTOR.userId,
            nodeId: target.structureRef,
            ...target.chain,
          }),
        },
      });
      return { item, center };
    });
    this.logger.log(
      `CostCenter created — ID=${centerId} Code=${norm.code} Type=${costCenterTypeLabel(norm.costCenterType)} DetailCode=${detailCode} Title=${norm.title} Structure=${target.structureRef}`,
    );
    return this.toDto(center, item, type.code, type.title);
  }

  async update(id: number, dto: UpsertCostCenterDto) {
    const existing = await this.prisma.costCenter.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `مرکز هزینه با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const item = await this.prisma.detailItem.findUnique({ where: { id: existing.detailItemRef } });
    if (!item) {
      throw new NotFoundException({
        statusCode: 404,
        message: `ردیف تفصیلی مرکز هزینه با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const target = await this.resolveTargetStructure(dto.structureId);
    const norm = this.normalizeInput(dto);
    const type = await this.assignment.resolveFormType(
      { canonicalCode: "15", title: "مراکز هزینه" },
      { nodeId: target.structureRef, ...target.chain },
      true,
    );
    const numbering = await this.assignment.ensureNumbering(type);

    /* ویرایش: کد تفصیل همیشه صریح و معتبر می‌ماند (تخصیص خودکار فقط ثبت تازه؛
       ارسال خالی = حفظ کد فعلی) */
    let detailCode = norm.detailCode === "" ? item.code : norm.detailCode;
    this.assertDetailCodeFormat(detailCode, numbering, type);
    await this.assertDetailCodeAvailable(detailCode, target.structureRef, item.id);
    await this.assertCenterCodeAvailable(norm.code, target.structureRef, existing.id);
    await this.assertTitleAvailable(norm.title, target.structureRef, item.id, type);

    const { updatedItem, updatedCenter } = await this.prisma.$transaction(async (tx) => {
      const updatedItem = await tx.detailItem.update({
        where: { id: item.id },
        data: {
          code: detailCode,
          title: norm.title,
          description: norm.description,
          isActive: norm.isActive,
          ...appBaseOnUpdate(SYSTEM_ACTOR),
        },
      });
      const updatedCenter = await tx.costCenter.update({
        where: { id: existing.id },
        data: {
          code: norm.code,
          costCenterType: norm.costCenterType,
          ...appBaseOnUpdate(SYSTEM_ACTOR),
        },
      });
      return { updatedItem, updatedCenter };
    });
    return this.toDto(updatedCenter, updatedItem, type.code, type.title);
  }

  async remove(id: number) {
    const existing = await this.prisma.costCenter.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `مرکز هزینه با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.costCenter.delete({ where: { id: existing.id } });
      await tx.detailItem.delete({ where: { id: existing.detailItemRef } });
    });
    return { deleted: true, id };
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی ورودی + قوانین فیلدی دقیق مالک (کد/عنوان/نوع Enum). */
  private normalizeInput(dto: UpsertCostCenterDto) {
    const code = toLatinDigits(String(dto.code ?? "")).replace(/\s+/g, "");
    if (code === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد الزامی است؛ کد مرکز هزینه نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (code.length > 20) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد مرکز هزینه حداکثر ۲۰ نویسه است.",
        messageKey: "common.error",
      });
    }
    const title = String(dto.title ?? "").trim();
    if (title === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "عنوان الزامی است؛ عنوان مرکز هزینه نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (title.length > 100) {
      throw new BadRequestException({
        statusCode: 422,
        message: "عنوان مرکز هزینه حداکثر ۱۰۰ نویسه است.",
        messageKey: "common.error",
      });
    }
    const costCenterType = Number(dto.costCenterType);
    if (!Number.isInteger(costCenterType) || !COST_CENTER_TYPE_VALUES.includes(costCenterType)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "نوع مرکز هزینه الزامی است؛ مقدار باید یکی از موارد Enum (۱ تا ۵) باشد.",
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
    const detailCode = toLatinDigits(String(dto.detailCode ?? "")).replace(/\s+/g, "");
    if (detailCode.length > 20) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد تفصیل حداکثر ۲۰ نویسه است.",
        messageKey: "common.error",
      });
    }
    return {
      code,
      title,
      costCenterType,
      description,
      detailCode,
      isActive: dto.isActive === true,
    };
  }

  /** کد تفصیل باید عددی باشد و اگر بازهٔ شماره‌گذاری موجود است، درون آن بماند. */
  private assertDetailCodeFormat(
    code: string,
    numbering: NumberingInfo | null,
    type: { code: string; title: string },
  ) {
    if (!/^[0-9]+$/.test(code)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد تفصیل باید فقط عدد باشد.",
        messageKey: "common.error",
      });
    }
    if (numbering) {
      const n = BigInt(code);
      if (n < numbering.startNumber || n > numbering.endNumber) {
        throw new BadRequestException({
          statusCode: 422,
          message: `کد تفصیل باید در بازهٔ شماره‌گذاری نوع تفصیل «${type.code} - ${type.title}» باشد (از ${numbering.startNumber} تا ${numbering.endNumber}).`,
          messageKey: "common.error",
        });
      }
    }
  }

  /** یکتایی کد تفصیل در گرهٔ ساختار (فضای شماره‌گذاری مشترک همهٔ انواع) — ۴۰۹. */
  private async assertDetailCodeAvailable(
    code: string,
    structureRef: bigint,
    excludeDetailItemId: bigint | null,
  ) {
    const clash = await this.prisma.detailItem.findFirst({
      where: {
        businessStructureRef: structureRef,
        code,
        ...(excludeDetailItemId ? { id: { not: excludeDetailItemId } } : {}),
      },
      select: { id: true, code: true, title: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `کد تفصیل تکراری است: کد «${code}» قبلاً برای تفصیلی «${clash.code} - ${clash.title}» ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** یکتایی کد مرکز هزینه در گرهٔ ساختار — ۴۰۹. */
  private async assertCenterCodeAvailable(
    code: string,
    structureRef: bigint,
    excludeId: bigint | null,
  ) {
    const clash = await this.prisma.costCenter.findFirst({
      where: {
        businessStructureRef: structureRef,
        code,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, code: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `کد مرکز هزینه تکراری است: کد «${code}» قبلاً ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** یکتایی عنوان در نوع «مراکز هزینه» و همان گرهٔ ساختار — ۴۰۹. */
  private async assertTitleAvailable(
    title: string,
    structureRef: bigint,
    excludeDetailItemId: bigint | null,
    type: { id: bigint; code: string; title: string },
  ) {
    const clash = await this.prisma.detailItem.findFirst({
      where: {
        businessStructureRef: structureRef,
        detailTypeRef: type.id,
        title,
        ...(excludeDetailItemId ? { id: { not: excludeDetailItemId } } : {}),
      },
      select: { id: true, title: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `عنوان مرکز هزینه تکراری است: عنوان «${title}» قبلاً ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** Task 122 — گرهٔ هدف: structureId اختیاری؛ نامعتبر ⇒ ۴۲۲؛ نبود ⇒ دفتر مرکزی. */
  private async resolveTargetStructure(structureId?: number) {
    if (structureId == null || !Number.isFinite(structureId) || structureId <= 0) {
      return {
        structureRef: HEAD_OFFICE_NODE_ID,
        chain: await resolveDetailTypeChain(this.prisma, HEAD_OFFICE_NODE_ID),
      };
    }
    const structureRef = BigInt(structureId);
    const node = await this.prisma.businessStructure.findUnique({
      where: { id: structureRef },
      select: { id: true, isActive: true, title: true },
    });
    if (!node || !node.isActive) {
      throw new BadRequestException({
        statusCode: 422,
        message: `ساختار سازمانی با شناسهٔ ${structureId} یافت نشد یا غیرفعال است.`,
        messageKey: "common.error",
      });
    }
    return {
      structureRef,
      chain: await resolveDetailTypeChain(this.prisma, structureRef),
    };
  }

  /** دامنهٔ خواندن (Task 122 — قرارداد واحد اشتراک داده). */
  private async resolveReadScope(structureId?: number): Promise<AppBaseScope> {
    if (structureId != null && Number.isFinite(structureId) && structureId > 0) {
      const structureRef = BigInt(structureId);
      return { nodeId: structureRef, ...(await resolveDetailTypeChain(this.prisma, structureRef)) };
    }
    return { nodeId: HEAD_OFFICE_NODE_ID, ...(await resolveDetailTypeChain(this.prisma, HEAD_OFFICE_NODE_ID)) };
  }

  /* --------------------------------- dto --------------------------------- */

  private toDto(
    center: {
      id: bigint;
      detailItemRef: bigint;
      code: string;
      costCenterType: number;
      version: number;
      businessStructureRef: bigint;
      createdAt: Date;
      updatedAt: Date;
    },
    item: {
      id: bigint;
      code: string;
      title: string;
      description: string | null;
      isActive: boolean;
      version: number;
      createdAt: Date;
      updatedAt: Date;
    },
    typeCode: string,
    typeTitle: string,
  ) {
    return {
      id: Number(center.id), // §2.4 BigInt → number (گارد 2^53 در مولد ID)
      detailItemId: Number(center.detailItemRef),
      code: center.code,
      costCenterType: center.costCenterType,
      costCenterTypeLabel: costCenterTypeLabel(center.costCenterType),
      title: item.title,
      detailCode: item.code,
      typeCode,
      typeTitle,
      description: item.description ?? "",
      isActive: item.isActive,
      version: center.version,
      structureId: Number(center.businessStructureRef),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
