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
import { UpsertDetailItemDto } from "./detail-item.dto";
import { resolveDetailTypeChain } from "../detail-type/canonical-detail-types";
import { allocateDetailTypeNumbering } from "../detail-type-numbering/allocate";

/**
 * Task 154 (درخواست مالک): فرم «تفصیلی سایر» در زیرمنوی «اطلاعات تفصیلی ها»
 * — رکوردهای این فرم تفصیلی‌های نوع ثابت «سایر»اند (پنجمین دستهٔ کلاسیک
 * تفصیلی معین: شناور/مراکز/پروژه/قرارداد/سایر — هم‌تراز فرم‌های اختصاصی
 * مرکز هزینه/پروژه/قرارداد). نوع «سایر» اگر نبود سمت سرور ساخته می‌شود
 * (کد ۲۲ — بلافاصله پس از ۲۱ آیتم مرجع Task 122) با ردیف شماره‌گذاری
 * خودکار (allocateDetailTypeNumbering — Task 131) تا کد تفصیل لایو باشد.
 */
const OTHER_CATEGORY_TITLE = "سایر";
/** نخستین کد پیشنهادی برای نوع «سایر» — در اشغال بودن، بعدی آزاد می‌گیرد. */
const OTHER_CATEGORY_BASE_CODE = 22;

/**
 * DetailItemService — سرویس مشترک رکورد تفصیلی (Task 144؛ اصلاح Task 174:
 * فرم عمومی «ایجاد تفصیلی ها» حذف شد — مصرف‌کنندهٔ اصلی endpointها اکنون
 * فرم «تفصیلی سایر» (Task 154) است) در نرم‌افزار «حسابداری» → «اطلاعات
 * تفصیلی ها». رکورد تفصیلی (مقدار عملیاتی یک نوع تفصیل) با کد خودکار از
 * بازهٔ شماره‌گذاری همان نوع (Task 131).
 *
 * رعایت کامل ارث‌بری AppBaseEntity (۸فیلدی): ID از IDGeneration (§۱۶)،
 * Version با §۲.۵ auto-rowversion، مهر Creator/LastModifier + زنجیرهٔ
 * ساختار سازمانی روی هر ردیف (تا استقرار IAM = SYSTEM_ACTOR).
 *
 * زنجیرهٔ اعتبارسنجی ثبت (خط دفاعی نهایی سمت سرور؛ فرانت همان قوانین را
 * پیش از ارسال هم چک می‌کند):
 *   ۱. نوع تفصیل اجباری است و باید در دامنهٔ گرهٔ هدف دیده شود (۴۲۲/۴۰۴).
 *   ۲. کد تفصیلی عددی است؛ اگر ردیف شماره‌گذاری نوع موجود باشد باید درون
 *      بازهٔ [StartNumber..EndNumber] باشد (قاعدهٔ مالک Task 131: «شماره‌ها
 *      نباید با شماره‌های تفصیلی دیگر تداخل داشته باشند») — ۴۲۲.
 *   ۳. کد یکتا در گرهٔ ساختار است (فضای شماره‌گذاری مشترک همهٔ انواع) — ۴۰۹.
 *   ۴. عنوان اجباری است و در همان نوع + گره یکتا — ۴۰۹.
 *   ۵. کد خالی + شماره‌گذاری خودکار ⇒ نخستین عدد بلااستفادهٔ بازه تخصیص
 *      می‌یابد؛ بازهٔ تمام‌شده ⇒ ۴۲۲ با پیام روشن.
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

/** اطلاعات ردیف شماره‌گذاری یک نوع تفصیل در یک گره (برای کد خودکار/دستی). */
interface NumberingInfo {
  id: bigint;
  startNumber: bigint;
  endNumber: bigint;
  isAutomatic: boolean;
}

@Injectable()
export class DetailItemService {
  private readonly logger = new Logger(DetailItemService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /* -------------------------------- read -------------------------------- */

  /**
   * فهرست تفصیلی‌ها — Task 122 (قرارداد واحد اشتراک داده): با structureId ⇒
   * ردیف‌های گرهٔ فعال + در صورت اشتراک (headOfficeShares) دفتر مرکزی؛
   * بدون پارامتر ⇒ دفتر مرکزی. detailTypeRef ⇒ فیلتر یک نوع تفصیل.
   * ترتیب: عددی-آگاهِ کد.
   */
  async list(q: {
    structureId?: number;
    headOfficeShares?: boolean;
    detailTypeRef?: number;
  } = {}) {
    const scope = await this.resolveReadScope(q.structureId);
    const rows = await this.prisma.detailItem.findMany({
      where: {
        ...baseDataScopeWhere(scope, q.headOfficeShares === true),
        ...(q.detailTypeRef != null && Number.isFinite(q.detailTypeRef) && q.detailTypeRef > 0
          ? { detailTypeRef: BigInt(q.detailTypeRef) }
          : {}),
      },
      orderBy: [{ code: "asc" }],
    });
    /* join دستی نوع تفصیل (بدون relation در اسکیما) — عنوان/کد نوع برای جدول */
    const types = await this.prisma.detailType.findMany({
      where: baseDataScopeWhere(scope, true),
      select: { id: true, code: true, title: true },
    });
    const typeMap = new Map(types.map((t) => [String(t.id), t]));
    return {
      items: sortNumericAware(rows).map((r) => {
        const dt = typeMap.get(String(r.detailTypeRef));
        return this.toDto(r, dt?.code ?? "", dt?.title ?? "");
      }),
    };
  }

  /**
   * پیشنهاد کد تفصیلی — «نحوهٔ نمایش کد» فرم Task 144:
   *   · ردیف شماره‌گذاری نوع (گرهٔ فعال؛ در نبودش ردیف دفتر مرکزی) مبناست.
   *   · IsAutomatic=true ⇒ نخستین عدد بلااستفادهٔ بازه (used = کدهای عددیِ
   *     تفصیلی‌های دیده‌شده در دامنهٔ اشتراک) — mode:"automatic".
   *   · IsAutomatic=false ⇒ mode:"manual" (کاربر کد را در بازه وارد می‌کند).
   *   · بدون ردیف شماره‌گذاری ⇒ mode:"manual" با range تهی.
   */
  async nextCode(q: { detailTypeRef: number; structureId?: number; headOfficeShares?: boolean }) {
    const detailTypeRef = BigInt(q.detailTypeRef);
    const target = await this.resolveTargetStructure(q.structureId);
    const type = await this.prisma.detailType.findUnique({
      where: { id: detailTypeRef },
      select: { id: true, code: true, title: true },
    });
    if (!type) {
      throw new NotFoundException({
        statusCode: 404,
        message: `نوع تفصیل با شناسهٔ ${q.detailTypeRef} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const numbering = await this.resolveNumbering(detailTypeRef, target.structureRef);
    if (!numbering) {
      return {
        mode: "manual" as const,
        code: null,
        rangeStart: null,
        rangeEnd: null,
        typeCode: type.code,
        typeTitle: type.title,
      };
    }
    const start = numbering.startNumber;
    const end = numbering.endNumber;
    if (!numbering.isAutomatic) {
      return {
        mode: "manual" as const,
        code: null,
        rangeStart: Number(start),
        rangeEnd: Number(end),
        typeCode: type.code,
        typeTitle: type.title,
      };
    }
    /* used = کدهای عددی تفصیلی‌های دیده‌شده در دامنهٔ اشتراک گرهٔ فعال */
    const scope = await this.resolveReadScope(q.structureId);
    const usedRows = await this.prisma.detailItem.findMany({
      where: baseDataScopeWhere(scope, q.headOfficeShares === true),
      select: { code: true },
    });
    const used = new Set(usedRows.map((r) => r.code.trim()));
    for (let n = start; n <= end; n += 1n) {
      const candidate = n.toString();
      if (!used.has(candidate)) {
        return {
          mode: "automatic" as const,
          code: candidate,
          rangeStart: Number(start),
          rangeEnd: Number(end),
          typeCode: type.code,
          typeTitle: type.title,
        };
      }
    }
    /* بازهٔ تمام‌شده — گلوگاه شماره‌گذاری را دستی یا با بازهٔ تازه باز کنند */
    return {
      mode: "automatic" as const,
      code: null,
      rangeStart: Number(start),
      rangeEnd: Number(end),
      exhausted: true,
      typeCode: type.code,
      typeTitle: type.title,
    };
  }

  /* ------------------------------- mutations ------------------------------ */

  /**
   * Task 154 — تضمین وجود نوع تفصیل «سایر» برای فرم «تفصیلی سایر»:
   *   · ابتدا جست‌وجو در دامنهٔ خواندن گرهٔ فعال (با اشتراک دفتر مرکزی —
   *     قرارداد Task 122)؛ نوع موجود همان مرجع است و دوبل ساخته نمی‌شود.
   *   · نبود ⇒ ساخت با کد آزاد (از ۲۲) + ردیف شماره‌گذاری خودکار
   *     (allocateDetailTypeNumbering — عین DetailTypeService.create).
   *   · همیشه ردیف شماره‌گذاری گارانتی می‌شود تا /next-code حالت
   *     «automatic» بدهد و کد تفصیل لایو پیشنهاد شود.
   * اجرای مکرر امن است (idempotent — P2002 همزمانی هم گرفته می‌شود).
   */
  async ensureOtherCategory(q: {
    structureId?: number;
    headOfficeShares?: boolean;
  }) {
    const target = await this.resolveTargetStructure(q.structureId);
    const scope: AppBaseScope = { nodeId: target.structureRef, ...target.chain };
    /* ۱) نوع «سایر» در دامنهٔ خواندن (عین assertTypeVisible — اشتراک همیشه) */
    let type = await this.prisma.detailType.findFirst({
      where: {
        ...baseDataScopeWhere(scope, true),
        title: OTHER_CATEGORY_TITLE,
      },
      select: {
        id: true,
        code: true,
        title: true,
        businessStructureRef: true,
        companyRef: true,
        branchRef: true,
        agencyRef: true,
        shopRef: true,
      },
    });
    let created = false;
    if (!type) {
      /* ۲) ساخت نوع «سایر» با نخستین کد عددی آزاد (از ۲۲) */
      let code = String(OTHER_CATEGORY_BASE_CODE);
      for (let guard = 0; guard < 100; guard++) {
        const taken = await this.prisma.detailType.findFirst({
          where: { businessStructureRef: target.structureRef, code },
          select: { id: true },
        });
        if (!taken) break;
        code = String(Number(code) + 1);
      }
      const newId = await this.idGen.generateNextId("DetailType");
      try {
        type = await this.prisma.detailType.create({
          data: {
            id: BigInt(newId),
            code,
            title: OTHER_CATEGORY_TITLE,
            description: null,
            isActive: true,
            ...appBaseOnCreate({
              userId: SYSTEM_ACTOR.userId,
              nodeId: target.structureRef,
              ...target.chain,
            }),
          },
        });
        created = true;
      } catch (e) {
        /* همزمانی: P2002 ⇒ رکورد را که رقیب ساخته بازخوانی کن */
        const refetched = await this.prisma.detailType.findFirst({
          where: { businessStructureRef: target.structureRef, title: OTHER_CATEGORY_TITLE },
          select: {
            id: true,
            code: true,
            title: true,
            businessStructureRef: true,
            companyRef: true,
            branchRef: true,
            agencyRef: true,
            shopRef: true,
          },
        });
        if (!refetched) throw e;
        type = refetched;
      }
    }
    /* ۳) گارانتی ردیف شماره‌گذاری خودکار (Task 131 — تفصیل‌های قدیمی هم) */
    const numbering = await this.prisma.detailTypeNumbering.findFirst({
      where: { detailTypeRef: type.id, businessStructureRef: type.businessStructureRef },
      select: { id: true },
    });
    if (!numbering) {
      await allocateDetailTypeNumbering(this.prisma, this.idGen, type, SYSTEM_ACTOR);
    }
    if (created) {
      this.logger.log(
        `OtherCategory ensured — DetailType «${OTHER_CATEGORY_TITLE}» created ID=${type.id} Code=${type.code} Structure=${target.structureRef} (Task 154)`,
      );
    }
    return {
      id: Number(type.id),
      code: type.code,
      title: type.title,
      created,
    };
  }

  /** ثبت تفصیلی — کد خالی + شماره‌گذاری خودکار ⇒ تخصیص خودکار نخستین عدد آزاد. */
  async create(dto: UpsertDetailItemDto) {
    const target = await this.resolveTargetStructure(dto.structureId);
    const type = await this.assertTypeVisible(dto.detailTypeRef, target.structureRef);
    const norm = this.normalizeInput(dto);
    const numbering = await this.resolveNumbering(BigInt(dto.detailTypeRef), target.structureRef);

    let code = norm.code;
    if (code === "") {
      if (!numbering || !numbering.isAutomatic) {
        throw new BadRequestException({
          statusCode: 422,
          message: `ثبت کد تفصیلی الزامی است؛ شماره‌گذاری نوع تفصیل «${type.code} - ${type.title}» خودکار نیست و کد باید دستی وارد شود.`,
          messageKey: "common.error",
        });
      }
      code = await this.allocateAutomaticCode(numbering, target.structureRef, type);
    } else {
      this.assertCodeFormat(code, numbering, type);
      await this.assertCodeAvailable(code, target.structureRef, null);
    }
    await this.assertTitleAvailable(dto.detailTypeRef, target.structureRef, norm.title, null, type);

    const newId = await this.idGen.generateNextId("DetailItem");
    const row = await this.prisma.detailItem.create({
      data: {
        id: BigInt(newId),
        detailTypeRef: BigInt(dto.detailTypeRef),
        code,
        title: norm.title,
        description: norm.description,
        isActive: norm.isActive,
        ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: target.structureRef, ...target.chain }),
      },
    });
    this.logger.log(
      `DetailItem created — ID=${newId} Type=${type.code}/${type.title} Code=${code} Title=${norm.title} Structure=${target.structureRef}`,
    );
    return this.toDto(row, type.code, type.title);
  }

  async update(id: number, dto: UpsertDetailItemDto) {
    const existing = await this.prisma.detailItem.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `تفصیلی با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const target = await this.resolveTargetStructure(dto.structureId);
    const type = await this.assertTypeVisible(dto.detailTypeRef, target.structureRef);
    const norm = this.normalizeInput(dto);
    const numbering = await this.resolveNumbering(BigInt(dto.detailTypeRef), target.structureRef);

    /* ویرایش: کد همیشه باید صریح و معتبر باشد (تخصیص خودکار فقط در ثبت تازه) */
    const code = norm.code === "" ? existing.code : norm.code;
    this.assertCodeFormat(code, numbering, type);
    await this.assertCodeAvailable(code, target.structureRef, existing.id);
    await this.assertTitleAvailable(dto.detailTypeRef, target.structureRef, norm.title, existing.id, type);

    const row = await this.prisma.detailItem.update({
      where: { id: existing.id },
      data: {
        detailTypeRef: BigInt(dto.detailTypeRef),
        code,
        title: norm.title,
        description: norm.description,
        isActive: norm.isActive,
        ...appBaseOnUpdate(SYSTEM_ACTOR),
      },
    });
    return this.toDto(row, type.code, type.title);
  }

  async remove(id: number) {
    const existing = await this.prisma.detailItem.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `تفصیلی با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    await this.prisma.detailItem.delete({ where: { id: existing.id } });
    return { deleted: true, id };
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی ورودی + قوانین فیلدی (عنوان اجباری؛ توضیحات اختیاری). */
  private normalizeInput(dto: UpsertDetailItemDto) {
    const code = toLatinDigits(String(dto.code ?? "")).replace(/\s+/g, "");
    if (code.length > 20) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد تفصیلی حداکثر ۲۰ نویسه است.",
        messageKey: "common.error",
      });
    }
    const title = String(dto.title ?? "").trim();
    if (title === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت عنوان تفصیلی الزامی است؛ عنوان نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (title.length > 100) {
      throw new BadRequestException({
        statusCode: 422,
        message: "عنوان تفصیلی حداکثر ۱۰۰ نویسه است.",
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

  /** کد باید عددی باشد و اگر بازهٔ شماره‌گذاری موجود است، درون آن بماند. */
  private assertCodeFormat(code: string, numbering: NumberingInfo | null, type: { code: string; title: string }) {
    if (!/^[0-9]+$/.test(code)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد تفصیلی باید فقط عدد باشد.",
        messageKey: "common.error",
      });
    }
    if (numbering) {
      const n = BigInt(code);
      if (n < numbering.startNumber || n > numbering.endNumber) {
        throw new BadRequestException({
          statusCode: 422,
          message: `کد تفصیلی باید در بازهٔ شماره‌گذاری نوع تفصیل «${type.code} - ${type.title}» باشد (از ${numbering.startNumber} تا ${numbering.endNumber}).`,
          messageKey: "common.error",
        });
      }
    }
  }

  /** قانون یکتایی کد در گرهٔ ساختار (فضای شماره‌گذاری مشترک همهٔ انواع) — ۴۰۹. */
  private async assertCodeAvailable(code: string, structureRef: bigint, excludeId: bigint | null) {
    const clash = await this.prisma.detailItem.findFirst({
      where: {
        businessStructureRef: structureRef,
        code,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, code: true, title: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `کد تفصیلی تکراری است: کد «${code}» قبلاً برای تفصیلی «${clash.code} - ${clash.title}» ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** قانون یکتایی عنوان در همان نوع تفصیل و همان گرهٔ ساختار — ۴۰۹. */
  private async assertTitleAvailable(
    detailTypeRef: number,
    structureRef: bigint,
    title: string,
    excludeId: bigint | null,
    type: { code: string; title: string },
  ) {
    const clash = await this.prisma.detailItem.findFirst({
      where: {
        businessStructureRef: structureRef,
        detailTypeRef: BigInt(detailTypeRef),
        title,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, code: true, title: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `عنوان تفصیلی تکراری است: عنوان «${title}» قبلاً در نوع تفصیل «${type.code} - ${type.title}» ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** نخستین عدد بلااستفادهٔ بازهٔ خودکار؛ بازهٔ تمام‌شده ⇒ ۴۲۲. */
  private async allocateAutomaticCode(
    numbering: NumberingInfo,
    structureRef: bigint,
    type: { code: string; title: string },
  ): Promise<string> {
    const usedRows = await this.prisma.detailItem.findMany({
      where: { businessStructureRef: structureRef },
      select: { code: true },
    });
    const used = new Set(usedRows.map((r) => r.code.trim()));
    for (let n = numbering.startNumber; n <= numbering.endNumber; n += 1n) {
      const candidate = n.toString();
      if (!used.has(candidate)) return candidate;
    }
    throw new BadRequestException({
      statusCode: 422,
      message: `بازهٔ شماره‌گذاری نوع تفصیل «${type.code} - ${type.title}» تکمیل شده است (از ${numbering.startNumber} تا ${numbering.endNumber})؛ بازهٔ تازه تعیین کنید.`,
      messageKey: "common.error",
    });
  }

  /** نوع تفصیل باید در دامنهٔ گرهٔ هدف (با اشتراک دفتر مرکزی) دیده شود — ۴۲۲. */
  private async assertTypeVisible(detailTypeRef: number, structureRef: bigint) {
    const chain = await resolveDetailTypeChain(this.prisma, structureRef);
    const type = await this.prisma.detailType.findFirst({
      where: {
        id: BigInt(detailTypeRef),
        ...baseDataScopeWhere({ nodeId: structureRef, ...chain }, true),
      },
      select: { id: true, code: true, title: true },
    });
    if (!type) {
      throw new BadRequestException({
        statusCode: 422,
        message: `نوع تفصیل با شناسهٔ ${detailTypeRef} در دامنهٔ گرهٔ فعال یافت نمی‌شود.`,
        messageKey: "common.error",
      });
    }
    return type;
  }

  /** ردیف شماره‌گذاری نوع در گرهٔ هدف؛ در نبودش ردیف دفتر مرکزی (اشتراک). */
  private async resolveNumbering(detailTypeRef: bigint, structureRef: bigint): Promise<NumberingInfo | null> {
    const row = await this.prisma.detailTypeNumbering.findFirst({
      where: { detailTypeRef, businessStructureRef: structureRef },
      select: { id: true, startNumber: true, endNumber: true, isAutomatic: true },
    });
    if (row) return row;
    if (structureRef !== HEAD_OFFICE_NODE_ID) {
      const ho = await this.prisma.detailTypeNumbering.findFirst({
        where: { detailTypeRef, businessStructureRef: HEAD_OFFICE_NODE_ID },
        select: { id: true, startNumber: true, endNumber: true, isAutomatic: true },
      });
      return ho;
    }
    return null;
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
    r: {
      id: bigint;
      detailTypeRef: bigint;
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
    },
    typeCode: string,
    typeTitle: string,
  ) {
    return {
      id: Number(r.id), // §2.4 BigInt → number (گارد 2^53 در مولد ID)
      detailTypeRef: Number(r.detailTypeRef),
      typeCode,
      typeTitle,
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
