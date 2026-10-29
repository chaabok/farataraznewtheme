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
import { UpsertProjectDto } from "./project.dto";
import {
  DetailCodeAssignmentService,
  type NumberingInfo,
} from "../detail-code-assignment/detail-code-assignment.service";
import { resolveDetailTypeChain } from "../detail-type/canonical-detail-types";

/**
 * ProjectService — Task 147 (درخواست مالک): فرم «تعریف پروژه» در نرم‌افزار
 * «حسابداری» ← زیرمنوی «اطلاعات تفصیلی ها».
 *
 * پروژه یک «حساب تفصیلی» است (نوع «پروژه» — کد مرجع ۸ از فرم نوع تفصیلی)
 * + پروفایل اختصاصی. هر ثبت/ویرایش دو ردیف هم‌تراز می‌سازد (تراکنش اتمی):
 *   · DetailItem — کد تفصیل/عنوان/توضیحات/فعال (در فهرست «ایجاد تفصیلی ها»
 *     هم دیده می‌شود؛ فضای شماره‌گذاری مشترک همهٔ تفصیلی‌ها).
 *   · Project    — کد پروژه (سریالی).
 *
 * کد پروژه — بنا به فرمان مالک «فیلد کد اجباری و بصورت سریالی و پشت سرهم
 * شماره اختصاص یابد»: متد nextSerialCode نخستین عدد بلااستفادهٔ گرهٔ ساختار
 * را برمی‌گرداند (۱، ۲، ۳، … — سری پیوسته حتی پس از حذف ردیف‌های میانی)؛
 * فرم با لایو ایجکس (GET /projects/next-code) پیش‌پر می‌کند و فقط‌خواندنی
 * نشان می‌دهد؛ منبع نهایی تخصیص سرور است (تک‌مرجع). پس از ثبت تغییرناپذیر.
 *
 * کد تفصیل — تخصیص با «متد اختصاصی تخصص کد تفصیل» (DetailCodeAssignmentService
 * — Task 146، formKey "project" ← نوع تفصیل «پروژه» کد ۸) بر پایهٔ تنظیمات
 * ساختار کسب و کار (گرهٔ فعال OrgScope) و ردیف شماره‌گذاری همان نوع (ستون‌های
 * شماره شروع/شماره پایان — Task 131):
 *   · ثبت تازه با کد تفصیل خالی و شماره‌گذاری خودکار ⇒ نخستین عدد
 *     بلااستفادهٔ بازه — تخصیص نهایی همیشه سمت سرور است.
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
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
    private readonly assignment: DetailCodeAssignmentService,
  ) {}

  /* -------------------------------- read --------------------------------- */

  /**
   * فهرست پروژه ها — Task 122 (قرارداد واحد اشتراک داده): با structureId ⇒
   * ردیف‌های گرهٔ فعال + در صورت اشتراک (headOfficeShares) دفتر مرکزی؛
   * بدون پارامتر ⇒ دفتر مرکزی. ترتیب: عددی-آگاهِ کد پروژه.
   */
  async list(q: { structureId?: number; headOfficeShares?: boolean } = {}) {
    const scope = await this.resolveReadScope(q.structureId);
    const rows = await this.prisma.project.findMany({
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

  /** ثبت پروژه — کد سریالی سرور + کد تفصیل از متد اختصاصی. */
  async create(dto: UpsertProjectDto) {
    const target = await this.resolveTargetStructure(dto.structureId);
    const norm = this.normalizeInput(dto);

    const type = await this.assignment.resolveFormType(
      { canonicalCode: "8", title: "پروژه" },
      { nodeId: target.structureRef, ...target.chain },
      true,
    );
    const numbering = await this.assignment.ensureNumbering(type);

    /* کد تفصیل — تخصیص با متد اختصاصی (لایو ایجکس فقط پیشنهاد می‌دهد) */
    let detailCode = norm.detailCode;
    if (detailCode === "") {
      detailCode = await this.assignment.allocateDetailCode({
        formKey: "project",
        structureRef: target.structureRef,
      });
    } else {
      this.assertDetailCodeFormat(detailCode, numbering, type);
      await this.assertDetailCodeAvailable(detailCode, target.structureRef, null);
    }

    /* کد پروژه سریالی — نخستین عدد بلااستفاده (پشت سرهم) در گرهٔ هدف */
    const code = norm.code !== "" ? norm.code : await this.nextSerialCode(target.structureRef);
    this.assertProjectCodeFormat(code);
    await this.assertProjectCodeAvailable(code, target.structureRef, null);
    await this.assertTitleAvailable(norm.title, target.structureRef, null, type);

    /* ثبت اتمی: DetailItem (تفصیلی) + Project (پروفایل سریالی) */
    const detailItemId = await this.idGen.generateNextId("DetailItem");
    const projectId = await this.idGen.generateNextId("Project");
    const { item, project } = await this.prisma.$transaction(async (tx) => {
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
      const project = await tx.project.create({
        data: {
          id: BigInt(projectId),
          detailItemRef: item.id,
          code,
          ...appBaseOnCreate({
            userId: SYSTEM_ACTOR.userId,
            nodeId: target.structureRef,
            ...target.chain,
          }),
        },
      });
      return { item, project };
    });
    this.logger.log(
      `Project created — ID=${projectId} Code=${code} DetailCode=${detailCode} Title=${norm.title} Structure=${target.structureRef}`,
    );
    return this.toDto(project, item, type.code, type.title);
  }

  async update(id: number, dto: UpsertProjectDto) {
    const existing = await this.prisma.project.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `پروژه با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const item = await this.prisma.detailItem.findUnique({ where: { id: existing.detailItemRef } });
    if (!item) {
      throw new NotFoundException({
        statusCode: 404,
        message: `ردیف تفصیلی پروژه با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const target = await this.resolveTargetStructure(dto.structureId);
    const norm = this.normalizeInput(dto);
    const type = await this.assignment.resolveFormType(
      { canonicalCode: "8", title: "پروژه" },
      { nodeId: target.structureRef, ...target.chain },
      true,
    );
    const numbering = await this.assignment.ensureNumbering(type);

    /* کد پروژه سریالی پس از ثبت تغییرناپذیر است (بنا به فرمان مالک:
       شماره بصورت سریالی و پشت سرهم تخصص می‌یابد) — ورودی کد نادیده گرفته
       می‌شود و همین کد ثبت‌شده باقی می‌ماند. */
    /* ویرایش: کد تفصیل همیشه صریح و معتبر می‌ماند (تخصیص خودکار فقط ثبت تازه؛
       ارسال خالی = حفظ کد فعلی) */
    let detailCode = norm.detailCode === "" ? item.code : norm.detailCode;
    this.assertDetailCodeFormat(detailCode, numbering, type);
    await this.assertDetailCodeAvailable(detailCode, target.structureRef, item.id);
    await this.assertTitleAvailable(norm.title, target.structureRef, item.id, type);

    const { updatedItem, updatedProject } = await this.prisma.$transaction(async (tx) => {
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
      const updatedProject = await tx.project.update({
        where: { id: existing.id },
        data: {
          ...appBaseOnUpdate(SYSTEM_ACTOR),
        },
      });
      return { updatedItem, updatedProject };
    });
    return this.toDto(updatedProject, updatedItem, type.code, type.title);
  }

  async remove(id: number) {
    const existing = await this.prisma.project.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `پروژه با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.project.delete({ where: { id: existing.id } });
      await tx.detailItem.delete({ where: { id: existing.detailItemRef } });
    });
    return { deleted: true, id };
  }

  /* ----------------------------- serial code ------------------------------ */

  /**
   * لایو ایجکس کد سریالی فرم (GET /projects/next-code) — گرهٔ هدف با همان
   * قرارداد Task 122 حل می‌شود (نبودِ structureId ⇒ دفتر مرکزی).
   */
  async nextCode(q: { structureId?: number }): Promise<{ code: string; serial: true }> {
    const scope = await this.resolveReadScope(q.structureId);
    const code = await this.nextSerialCode(scope.nodeId);
    return { code, serial: true };
  }

  /**
   * متد کد سریالی پروژه (فرمان مالک Task 147 — «بصورت سریالی و پشت سرهم»):
   * نخستین عدد بلااستفاده از ۱ در گرهٔ ساختار — سری پیوسته می‌ماند حتی اگر
   * ردیف‌های میانی حذف شده باشند (پُرکردن حفره پیش از شماره‌های تازه).
   */
  async nextSerialCode(structureRef: bigint): Promise<string> {
    const rows = await this.prisma.project.findMany({
      where: { businessStructureRef: structureRef },
      select: { code: true },
    });
    const used = new Set(
      rows.map((r) => r.code.trim()).filter((c) => /^[0-9]+$/.test(c)),
    );
    let n = 1;
    while (used.has(String(n))) n += 1;
    return String(n);
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی ورودی + قوانین فیلدی دقیق مالک (عنوان/توضیحات/کد تفصیل). */
  private normalizeInput(dto: UpsertProjectDto) {
    const code = toLatinDigits(String(dto.code ?? "")).replace(/\s+/g, "");
    if (code.length > 20) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد پروژه حداکثر ۲۰ نویسه است.",
        messageKey: "common.error",
      });
    }
    const title = String(dto.title ?? "").trim();
    if (title === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "عنوان الزامی است؛ عنوان پروژه نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (title.length > 100) {
      throw new BadRequestException({
        statusCode: 422,
        message: "عنوان پروژه حداکثر ۱۰۰ نویسه است.",
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
      description,
      detailCode,
      isActive: dto.isActive === true,
    };
  }

  /** کد پروژه سریالی است ⇒ فقط عدد (فرمان مالک — «شماره» سریالی). */
  private assertProjectCodeFormat(code: string) {
    if (!/^[0-9]+$/.test(code)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد پروژه باید فقط عدد باشد (شماره‌گذاری سریالی و پشت سرهم).",
        messageKey: "common.error",
      });
    }
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

  /** یکتایی کد پروژه در گرهٔ ساختار — ۴۰۹. */
  private async assertProjectCodeAvailable(
    code: string,
    structureRef: bigint,
    excludeId: bigint | null,
  ) {
    const clash = await this.prisma.project.findFirst({
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
        message: `کد پروژه تکراری است: کد «${code}» قبلاً ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** یکتایی عنوان در نوع «پروژه» و همان گرهٔ ساختار — ۴۰۹. */
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
        message: `عنوان پروژه تکراری است: عنوان «${title}» قبلاً ثبت شده است.`,
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
    project: {
      id: bigint;
      detailItemRef: bigint;
      code: string;
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
      id: Number(project.id), // §2.4 BigInt → number (گارد 2^53 در مولد ID)
      detailItemId: Number(project.detailItemRef),
      code: project.code,
      title: item.title,
      detailCode: item.code,
      typeCode,
      typeTitle,
      description: item.description ?? "",
      isActive: item.isActive,
      version: project.version,
      structureId: Number(project.businessStructureRef),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
