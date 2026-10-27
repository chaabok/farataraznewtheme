import type { PrismaService } from "../prisma/prisma.service";
import type { IdGenerationService } from "../id-generation/id-generation.service";
import { appBaseOnCreate, type AppBaseActor } from "../../../_shared/app-base-entity";

/**
 * allocate.ts — Task 131 (درخواست مالک): تخصیص خودکار بازهٔ شماره‌گذاری.
 *
 * قاعدهٔ مالک: «کاربر هر نوع تفصیلی در فرم نوع تفصیلی ایجاد کرد باید بصورت
 * خودکار در فرم شماره گذاری مشاهده شود و بصورت خودکار رنج شماره شروع و
 * شماره پایان برای آن تعیین گردد … شماره ها نباید با شماره های تفصیلی
 * دیگر تداخل داشته باشد.»
 *
 * قاعدهٔ تخصیص (تفسیر اعلامی §0.6 — عین الگوی تصویر مالک):
 *   · پهنای پیش‌فرض هر بازه = ۱۰۰۰ شماره؛
 *   · StartNumber = MAX(EndNumber) ردیف‌های همان گرهٔ ساختار + ۱
 *     (نخستین بازهٔ یک گره از ۱ آغاز می‌شود) ⇒ بازه‌ها پیوسته‌اند و
 *     هیچ‌گاه با بازهٔ موجود تداخل نمی‌کنند؛
 *   · شکاف ناشی از حذف دوباره استفاده نمی‌شود (فلسفهٔ gap پذیرفتهٔ §2.4)؛
 *   · خودکار=true و شرکت=false — عین پیش‌فرض تصویر مالک.
 *
 * اقامت ردیف: آینهٔ ۸فیلد AppBase خودِ نوع تفصیل (businessStructureRef و
 * زنجیرهٔ company/branch/agency/shop از ردیف تفصیل کپی می‌شود) تا قرارداد
 * اشتراک داده (baseDataScopeWhere) برای هر دو جدول یکسان بماند.
 *
 * دو فراخواننده: DetailTypeService.create (بلافاصله پس از ثبت تفصیل) و
 * backfill فهرست شماره‌گذاری (برای تفصیل‌های قدیمیِ بدون ردیف — از جمله
 * ۲۱ آیتم مرجع Task 122). تابع آزاد است تا وابستگی حلقوی ماژولی ساخته نشود.
 */

/** پهنای پیش‌فرض بازهٔ خودکار هر نوع تفصیل (عین تصویر مالک: ۱۰۰۰ شماره). */
export const DETAIL_NUMBERING_WIDTH = 1000n;

export interface DetailTypeResidency {
  id: bigint;
  businessStructureRef: bigint;
  companyRef: bigint | null;
  branchRef: bigint | null;
  agencyRef: bigint | null;
  shopRef: bigint | null;
}

/**
 * یک ردیف شماره‌گذاری با بازهٔ تازه (بدون تداخل) برای نوع تفصیل می‌سازد.
 * اگر ردیفِ همان (detailTypeRef, structureRef) همزمان توسط درخواست دیگری
 * ساخته شده باشد، P2002 قید یکتا گرفته می‌شود و null برمی‌گردد (idempotent).
 */
export async function allocateDetailTypeNumbering(
  prisma: PrismaService,
  idGen: IdGenerationService,
  detailType: DetailTypeResidency,
  actor: AppBaseActor,
): Promise<{ id: bigint; startNumber: bigint; endNumber: bigint } | null> {
  const maxRow = await prisma.detailTypeNumbering.aggregate({
    _max: { endNumber: true },
    where: { businessStructureRef: detailType.businessStructureRef },
  });
  const start = (maxRow._max.endNumber ?? 0n) + 1n;
  const end = start + DETAIL_NUMBERING_WIDTH - 1n;
  const newId = await idGen.generateNextId("DetailTypeNumbering");
  try {
    const row = await prisma.detailTypeNumbering.create({
      data: {
        id: BigInt(newId),
        detailTypeRef: detailType.id,
        startNumber: start,
        endNumber: end,
        isAutomatic: true,
        isCompany: false,
        ...appBaseOnCreate({
          userId: actor.userId,
          nodeId: detailType.businessStructureRef,
          companyRef: detailType.companyRef,
          branchRef: detailType.branchRef,
          agencyRef: detailType.agencyRef,
          shopRef: detailType.shopRef,
        }),
      },
    });
    return { id: row.id, startNumber: row.startNumber, endNumber: row.endNumber };
  } catch (e) {
    /* قید یکتای (DetailTypeRef, BusinessStructureRef) — ردیف همزمان ساخته شد */
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return null;
    }
    throw e;
  }
}
