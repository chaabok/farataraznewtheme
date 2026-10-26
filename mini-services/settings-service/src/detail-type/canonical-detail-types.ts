import type { PrismaService } from "../prisma/prisma.service";
import type { IdGenerationService } from "../id-generation/id-generation.service";
import {
  appBaseOnCreate,
  type AppBaseActor,
  HEAD_OFFICE_NODE_ID,
} from "../../../_shared/app-base-entity";

/**
 * canonical-detail-types.ts — Task 122 (درخواست مالک):
 * «آیتم‌هایی که توی تصویر وجود دارد به ترتیب کد در فرم نوع تفصیلی ایجاد
 * کنید … با نصب دیتابیس این آیتم‌ها باید در جدول نوع تفصیل ایجاد گردد …
 * البته باید کنترل گردد که در جدول نوع تفصیلی اطلاعات وجود نداشته باشد.»
 *
 * ۲۱ آیتم مرجع — عین تصویر مالک (کد ۱ تا ۲۱، عنوان لاتین ندارد به فرمان
 * پیشین مالک/Task 110). کدها لاتین ذخیره می‌شوند (نرمال‌سازی فرم) و
 * ترتیب نمایش عددی-آگاه است (sortDetailTypeRows پایین).
 *
 * قواعد مالک که این فایل تنها منبع مشترکشان است:
 *  · قاعدهٔ ۳ (نصب تازه): جدول DetailType کاملاً خالی ⇒ ۲۱ ردیف برای
 *    دفتر مرکزی (ID=1) ساخته می‌شود؛ در غیر این صورت هیچ.
 *  · قاعدهٔ ۲ (شاخهٔ جدید): هر گرهٔ هلدینگ(1)/شرکت(2) فعال که تیک
 *    «استفاده از داده‌های مشترک دفتر مرکزی» (IsBasicInfoShared) را
 *    ندارد ⇒ پس از ایجاد، همین ۲۱ آیتم برای همان شاخه ساخته می‌شود
 *    (فراخوان از BusinessStructureService.create).
 */

/** عین تصویر مالک — ۲۱ عنوان فارسی؛ بدون عنوان لاتین. */
export const CANONICAL_DETAIL_TYPES: ReadonlyArray<{ code: string; title: string }> = [
  { code: "1", title: "حساب بانکی" },
  { code: "2", title: "صندوق" },
  { code: "3", title: "کارتخوان" },
  { code: "4", title: "درگاه های اینترنتی" },
  { code: "5", title: "ترجمه‌گر دلخواه" },
  { code: "6", title: "امضاضات مجوز" },
  { code: "7", title: "امضاضات حقوقی" },
  { code: "8", title: "پروژه" },
  { code: "9", title: "قرارداد" },
  { code: "10", title: "انبار" },
  { code: "11", title: "کالاهای و خدمات" },
  { code: "12", title: "اعتبارات اسنادی" },
  { code: "13", title: "گروه مشتریان" },
  { code: "14", title: "گروه تامین‌کنندگان" },
  { code: "15", title: "مراکز هزینه" },
  { code: "16", title: "تسهیلات مالی" },
  { code: "17", title: "دارایی های ثابت" },
  { code: "18", title: "سالو" },
  { code: "19", title: "گروه بندی کالا انبار" },
  { code: "20", title: "گروه بندی کالا فروش" },
  { code: "21", title: "کاتالوگ فروش" },
];

/** ترتیب عددی-آگاهِ کد («۱..۲۱» درست مرتب شود، کدهای حرفی آخر). */
export function sortDetailTypeRows<T extends { code: string }>(rows: T[]): T[] {
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

/**
 * زنجیرهٔ ارث AppBase برای یک گرهٔ ساختار: از گره به سمت ریشه بالا می‌رود و
 * companyRef/branchRef/agencyRef/shopRef را (اولین گرهٔ هر نوع در مسیر)
 * برمی‌گرداند — همان قرارداد ancestryChain فرانت (Task 78).
 */
export async function resolveDetailTypeChain(
  prisma: PrismaService,
  nodeId: bigint,
): Promise<{ companyRef: bigint | null; branchRef: bigint | null; agencyRef: bigint | null; shopRef: bigint | null }> {
  let companyRef: bigint | null = null;
  let branchRef: bigint | null = null;
  let agencyRef: bigint | null = null;
  let shopRef: bigint | null = null;
  let cur = await prisma.businessStructure.findUnique({
    where: { id: nodeId },
    select: { id: true, parentRef: true, businessStructureType: true },
  });
  let guard = 0;
  while (cur && guard++ <= 8) {
    const id = cur.id;
    const t = cur.businessStructureType;
    if (t === 5 && shopRef == null) shopRef = id;
    else if (t === 4 && agencyRef == null) agencyRef = id;
    else if (t === 3 && branchRef == null) branchRef = id;
    else if ((t === 1 || t === 2) && companyRef == null) companyRef = id;
    cur = cur.parentRef > 0n
      ? await prisma.businessStructure.findUnique({
          where: { id: cur.parentRef },
          select: { id: true, parentRef: true, businessStructureType: true },
        })
      : null;
  }
  return { companyRef, branchRef, agencyRef, shopRef };
}

/**
 * قاعدهٔ مالک — ۲۱ آیتم مرجع را برای یک گرهٔ ساختار می‌سازد.
 * گارد: اگر آن گره حتی یک ردیف تفصیل داشته باشد هیچ کاری نمی‌کند
 * (بدون دوبل‌نویسی — اجرای مکرر امن است). تعداد ساخته‌شده را برمی‌گرداند.
 */
export async function seedCanonicalDetailTypes(
  prisma: PrismaService,
  idGen: IdGenerationService,
  structureRef: bigint,
  actor: AppBaseActor,
): Promise<number> {
  const existing = await prisma.detailType.count({
    where: { businessStructureRef: structureRef },
  });
  if (existing > 0) return 0;
  const chain = await resolveDetailTypeChain(prisma, structureRef);
  let seeded = 0;
  for (const d of CANONICAL_DETAIL_TYPES) {
    const newId = await idGen.generateNextId("DetailType");
    await prisma.detailType.create({
      data: {
        id: BigInt(newId),
        code: d.code,
        title: d.title,
        description: null,
        isActive: true,
        ...appBaseOnCreate({ userId: actor.userId, nodeId: structureRef, ...chain }),
      },
    });
    seeded++;
  }
  return seeded;
}

/** قاعدهٔ ۳ مالک — فقط برای نصب تازه (خواننده: seed.service). */
export const DETAIL_TYPES_HEAD_OFFICE_REF = HEAD_OFFICE_NODE_ID;
