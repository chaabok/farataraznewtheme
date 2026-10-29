import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import {
  appBaseOnCreate,
  baseDataScopeWhere,
  HEAD_OFFICE_NODE_ID,
  SYSTEM_ACTOR,
  type AppBaseScope,
} from "../../../_shared/app-base-entity";
import { resolveDetailTypeChain } from "../detail-type/canonical-detail-types";
import { allocateDetailTypeNumbering } from "../detail-type-numbering/allocate";

/**
 * DetailCodeAssignmentService — Task 146 (درخواست مالک):
 * «یک متد اختصاصی ایجاد کنید برای اختصاص کد تفصیلی به فرم‌های حساب‌های
 * تفصیلی که نوع آن‌ها در فرم نوع تفصیلی تعریف شده است و فرم‌های پایهٔ آن‌ها
 * در نرم‌افزارها ایجاد شده باشد مثل مرکز هزینه که فیلد کد تفصیل باید بر اساس
 * تنظیمات ساختار کسب و کار و تنظیمات شماره‌گذاری تفصیلی انجام شده است …
 * فیلد کد تفصیل در فرم مرکز هزینه باید بر اساس رنج تعیین‌شدهٔ ستون‌های
 * شماره شروع و شماره پایان به هر مرکز هزینه‌ای که تعریف می‌گردد بصورت
 * لایو ایجکسی اختصاص یابد.»
 *
 * تک‌مرجع تخصیص کد تفصیل برای همهٔ فرم‌های پایهٔ تفصیلی (امروز: مرکز هزینه؛
 * فردا: حساب بانکی، صندوق، انبار و … فقط یک مدخل در DETAIL_FORM_TYPE_MAP
 * می‌گیرند). زنجیرهٔ هر تخصیص:
 *   ۱. formKey ← نوع تفصیل مرجع (کد canonical — Task 122) که باید در فرم
 *      «نوع تفصیلی» تعریف شده باشد (۴۲۲ در نبودش).
 *   ۲. گرهٔ هدف از «تنظیمات ساختار کسب و کار» (structureId/OrgScope؛ نبود ⇒
 *      دفتر مرکزی) — عین قرارداد Task 122.
 *   ۳. ردیف شماره‌گذاری همان نوع (ستون‌های شماره شروع/شماره پایان — Task 131)
 *      در گرهٔ اقامت نوع؛ نبود ⇒ backfill خودکار (همان allocateDetailTypeNumbering
 *      قاعدهٔ Task 131 — تخصیص پیوستهٔ ۱۰۰۰تایی بدون تداخل).
 *   ۴. IsAutomatic=true ⇒ نخستین عدد بلااستفادهٔ بازه (used = کدهای عددیِ
 *      تفصیلی‌های دیده‌شده در دامنهٔ اشتراک) — mode:"automatic" با code؛
 *      IsAutomatic=false ⇒ mode:"manual" (فقط بازه اعلام می‌شود تا فرم فیلد
 *      را دستی با اعتبارسنجی درون‌بازه بپذیرد).
 *      بازهٔ تمام‌شده ⇒ mode:"automatic" + exhausted:true (۴۲۲ در ثبت نهایی).
 *
 * دو نقطهٔ مصرف:
 *   · GET /detail-code/allocate — لایو ایجکس فرم‌ها (پیشنهاد کد هنگام باز شدن
 *     فرم/ثبت جدید) — فرمِ خودکار، کد را فقط‌خواندنی نشان می‌دهد.
 *   · allocateDetailCode — تخصیص نهایی سمت سرور در ثبت (تک‌مرجع؛ حتی اگر
 *     کلاینت کد را دستکاری کند کد از همین متد می‌آید).
 */

/** رجیستری فرم‌های پایهٔ تفصیلی → کد مرجع نوع تفصیل (۲۱ آیتم canonical — Task 122). */
export const DETAIL_FORM_TYPE_MAP: Readonly<
  Record<string, { canonicalCode: string; title: string }>
> = {
  "cost-center": { canonicalCode: "15", title: "مراکز هزینه" },
  "project": { canonicalCode: "8", title: "پروژه" }, // Task 147 — تعریف پروژه
  "contract": { canonicalCode: "9", title: "قرارداد" }, // Task 148 — قرارداد جدید
};

/** اطلاعات ردیف شماره‌گذاری یک نوع تفصیل در یک گره. */
export interface NumberingInfo {
  id: bigint;
  startNumber: bigint;
  endNumber: bigint;
  isAutomatic: boolean;
}

/** پاسخ لایو ایجکس تخصص کد تفصیل. */
export interface DetailCodeAllocation {
  formKey: string;
  mode: "automatic" | "manual";
  code: string | null;
  rangeStart: number | null;
  rangeEnd: number | null;
  exhausted?: boolean;
  typeRef: number;
  typeCode: string;
  typeTitle: string;
}

/** ردیف DetailType با اقامت کامل (برای زنجیرهٔ AppBase). */
type FormTypeRow = {
  id: bigint;
  code: string;
  title: string;
  businessStructureRef: bigint;
  companyRef: bigint | null;
  branchRef: bigint | null;
  agencyRef: bigint | null;
  shopRef: bigint | null;
};

@Injectable()
export class DetailCodeAssignmentService {
  private readonly logger = new Logger(DetailCodeAssignmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /* ----------------------------- public API ------------------------------ */

  /**
   * متد اختصاصی لایو ایجکس — پیشنهاد کد تفصیل برای فرم‌های پایهٔ تفصیلی
   * بر پایهٔ نوع تفصیل (فرم نوع تفصیلی) + گرهٔ ساختار کسب و کار (تنظیمات
   * ساختار کسب و کار) + بازهٔ شماره شروع/شماره پایان (شماره‌گذاری تفصیلی ها).
   */
  async nextDetailCode(q: {
    formKey: string;
    structureId?: number;
    headOfficeShares?: boolean;
  }): Promise<DetailCodeAllocation> {
    const meta = this.assertFormKey(q.formKey);
    const scope = await this.resolveReadScope(q.structureId);
    const type = await this.resolveFormType(meta, scope, true);
    const numbering = await this.ensureNumbering(type);
    const base = {
      formKey: q.formKey,
      typeRef: Number(type.id),
      typeCode: type.code,
      typeTitle: type.title,
    };
    if (!numbering) {
      return {
        ...base,
        mode: "manual",
        code: null,
        rangeStart: null,
        rangeEnd: null,
      };
    }
    if (!numbering.isAutomatic) {
      return {
        ...base,
        mode: "manual",
        code: null,
        rangeStart: Number(numbering.startNumber),
        rangeEnd: Number(numbering.endNumber),
      };
    }
    /* used = کدهای عددی تفصیلی‌های دیده‌شده در دامنهٔ اشتراک گرهٔ فعال */
    const used = await this.usedCodeSet(scope, q.headOfficeShares === true);
    for (let n = numbering.startNumber; n <= numbering.endNumber; n += 1n) {
      const candidate = n.toString();
      if (!used.has(candidate)) {
        return {
          ...base,
          mode: "automatic",
          code: candidate,
          rangeStart: Number(numbering.startNumber),
          rangeEnd: Number(numbering.endNumber),
        };
      }
    }
    /* بازهٔ تمام‌شده — با فرم شماره‌گذاری تفصیلی ها بازهٔ تازه تعیین شود */
    return {
      ...base,
      mode: "automatic",
      code: null,
      rangeStart: Number(numbering.startNumber),
      rangeEnd: Number(numbering.endNumber),
      exhausted: true,
    };
  }

  /**
   * تخصیص نهایی سمت سرور (تک‌مرجع ثبت) — نخستین عدد بلااستفادهٔ بازهٔ خودکار
   * نوع تفصیلِ formKey در گرهٔ هدف. بازهٔ دستی/تمام‌شده ⇒ ۴۲۲ با پیام روشن.
   * usedCodes اختیاری است تا فراخواننده (مثلاً ثبت مرکز هزینه) کدهای تازه
   * ساختهٔ همان تراکنش را هم لحاظ کند.
   */
  async allocateDetailCode(q: {
    formKey: string;
    structureRef: bigint;
    usedCodes?: ReadonlySet<string>;
  }): Promise<string> {
    const meta = this.assertFormKey(q.formKey);
    const type = await this.resolveFormType(
      meta,
      {
        nodeId: q.structureRef,
        ...(await resolveDetailTypeChain(this.prisma, q.structureRef)),
      },
      true,
    );
    const numbering = await this.ensureNumbering(type);
    if (!numbering || !numbering.isAutomatic) {
      throw new BadRequestException({
        statusCode: 422,
        message: `ثبت کد تفصیل الزامی است؛ شماره‌گذاری نوع تفصیل «${type.code} - ${type.title}» خودکار نیست و کد تفصیل باید دستی وارد شود.`,
        messageKey: "common.error",
      });
    }
    const used = q.usedCodes ?? (await this.usedCodeSet({ nodeId: q.structureRef }, false));
    for (let n = numbering.startNumber; n <= numbering.endNumber; n += 1n) {
      const candidate = n.toString();
      if (!used.has(candidate)) return candidate;
    }
    throw new BadRequestException({
      statusCode: 422,
      message: `بازهٔ شماره‌گذاری نوع تفصیل «${type.code} - ${type.title}» تکمیل شده است (از ${numbering.startNumber} تا ${numbering.endNumber})؛ در فرم شماره‌گذاری تفصیلی ها بازهٔ تازه تعیین کنید.`,
      messageKey: "common.error",
    });
  }

  /**
   * یافتن نوع تفصیل مرجع یک formKey — نخست با کد canonical در دامنهٔ گرهٔ
   * هدف؛ در نبودش با عنوان مرجع. اگر نوع تفصیلی در فرم نوع تفصیلی تعریف
   * نشده باشد ⇒ ۴۲۲ با پیام روشن. (نصب‌های قدیمی که هنوز هیچ نوع تفصیلی
   * ندارند: نسخهٔ کمینهٔ نوع مرجع همان فرم backfill می‌شود.)
   */
  async resolveFormType(
    meta: { canonicalCode: string; title: string },
    scope: AppBaseScope,
    backfillIfNoTypes: boolean,
  ): Promise<FormTypeRow> {
    const byCode = await this.prisma.detailType.findFirst({
      where: { code: meta.canonicalCode, ...baseDataScopeWhere(scope, true) },
      orderBy: { id: "asc" },
    });
    if (byCode) return byCode;
    const byTitle = await this.prisma.detailType.findFirst({
      where: { title: meta.title, ...baseDataScopeWhere(scope, true) },
      orderBy: { id: "asc" },
    });
    if (byTitle) return byTitle;
    const anyType = await this.prisma.detailType.findFirst({
      where: baseDataScopeWhere(scope, true),
      select: { id: true },
    });
    if (anyType || !backfillIfNoTypes) {
      throw new BadRequestException({
        statusCode: 422,
        message: `نوع تفصیل «${meta.title}» (کد ${meta.canonicalCode}) در فرم نوع تفصیلی تعریف نشده است؛ نخست آن را در فرم نوع تفصیل جدید ایجاد کنید.`,
        messageKey: "common.error",
      });
    }
    /* گرهٔ هدف بدون هیچ نوع تفصیلی است (نصب قدیمی) — نوع مرجع backfill می‌شود */
    const created = await this.seedMissingFormType(meta, scope);
    this.logger.log(
      `DetailCodeAssignment — canonical type «${meta.title}» backfilled for node ${scope.nodeId} (Task 146)`,
    );
    return created;
  }

  /**
   * ردیف شماره‌گذاری نوع تفصیل (گرهٔ اقامت خود نوع — عین Task 131)؛ نبود ⇒
   * backfill خودکار و بازخوانی. خروجی همیشه آمادهٔ تخصیص است.
   */
  async ensureNumbering(type: {
    id: bigint;
    businessStructureRef: bigint;
    companyRef: bigint | null;
    branchRef: bigint | null;
    agencyRef: bigint | null;
    shopRef: bigint | null;
  }): Promise<NumberingInfo | null> {
    const sel = { id: true, startNumber: true, endNumber: true, isAutomatic: true } as const;
    const row = await this.prisma.detailTypeNumbering.findFirst({
      where: { detailTypeRef: type.id, businessStructureRef: type.businessStructureRef },
      select: sel,
    });
    if (row) return row;
    /* backfill خودکار — اقامت ردیف = آینهٔ ۸فیلد خود نوع تفصیل (عین Task 131) */
    const created = await allocateDetailTypeNumbering(
      this.prisma,
      this.idGen,
      {
        id: type.id,
        businessStructureRef: type.businessStructureRef,
        companyRef: type.companyRef,
        branchRef: type.branchRef,
        agencyRef: type.agencyRef,
        shopRef: type.shopRef,
      },
      { ...SYSTEM_ACTOR, nodeId: type.businessStructureRef },
    );
    if (!created) return null; // P2002 — ردیف همزمان ساخته شد؛ فراخوانی بعدی می‌گیرد
    return this.prisma.detailTypeNumbering.findFirst({
      where: { detailTypeRef: type.id, businessStructureRef: type.businessStructureRef },
      select: sel,
    });
  }

  /* ------------------------------ helpers -------------------------------- */

  /** formKey باید در رجیستری فرم‌های پایهٔ تفصیلی ثبت باشد — ۴۲۲. */
  private assertFormKey(formKey: string): { canonicalCode: string; title: string } {
    const meta = DETAIL_FORM_TYPE_MAP[formKey];
    if (!meta) {
      throw new BadRequestException({
        statusCode: 422,
        message: `فرم تفصیلی «${formKey}» در رجیستری متد تخصیص کد تفصیل ثبت نشده است.`,
        messageKey: "common.error",
      });
    }
    return meta;
  }

  /** مجموعهٔ کدهای تفصیلی‌های دیده‌شده در دامنه (فضای شماره‌گذاری مشترک گره). */
  private async usedCodeSet(scope: AppBaseScope, headOfficeShares: boolean): Promise<Set<string>> {
    const rows = await this.prisma.detailItem.findMany({
      where: baseDataScopeWhere(scope, headOfficeShares),
      select: { code: true },
    });
    return new Set(rows.map((r) => r.code.trim()));
  }

  /** ساخت نوع تفصیل مرجعِ مفقود برای گرهٔ هدف (IDGeneration + AppBase کامل). */
  private async seedMissingFormType(
    meta: { canonicalCode: string; title: string },
    scope: AppBaseScope,
  ): Promise<FormTypeRow> {
    const newId = await this.idGen.generateNextId("DetailType");
    return this.prisma.detailType.create({
      data: {
        id: BigInt(newId),
        code: meta.canonicalCode,
        title: meta.title,
        description: null,
        isActive: true,
        ...appBaseOnCreate({
          userId: SYSTEM_ACTOR.userId,
          nodeId: scope.nodeId,
          companyRef: scope.companyRef ?? null,
          branchRef: scope.branchRef ?? null,
          agencyRef: scope.agencyRef ?? null,
          shopRef: scope.shopRef ?? null,
        }),
      },
    });
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
}
