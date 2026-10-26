/**
 * Task 105 — seed مرجع جغرافیا: تمامی کشورهای جهان + پایتخت‌ها + استان‌های
 * ایران + شهرهای هر استان، در مدل GeoLocation سرویس تنظیمات.
 *
 * ویژگی‌های حیاتی:
 *  · ادغام (merge) نه بازنویسی: هر گرهٔ موجود با تطبیق (ParentRef, Title)
 *    بازیافت می‌شود — دادهٔ مالک (ایران/فارس/شیراز از Task 103) دست‌نخورده
 *    می‌ماند؛ اجرای مجدد = صفر رکورد جدید (idempotent).
 *  · شناسه‌ها از قرارداد idGen (§3-§6): رزرو یک بلاک پیوسته در IDGeneration
 *    با فرمول خودترمیم max(LastID+1, MAX(ID)+1) — گپ‌ها پذیرفته‌شده‌اند.
 *  · کد خواهرها یکتا (unique[ParentRef,Code]) = بیشینهٔ کد خواهرهای موجود + ۱
 *    به ترتیب الفبای فارسی (Intl.Collator("fa")).
 *  · ترتیب درخت: ایران و فارس و شیراز (دادهٔ مالک، کد ۱) سرِ جایشان می‌مانند؛
 *    بقیه بر اساس کد (الفبای فارسی) مرتب می‌شوند.
 *  · پایتخت ایران (تهران) زیر «استان تهران» است — برای ایران شاخهٔ پایتختِ
 *    مستقیم ساخته نمی‌شود؛ بقیهٔ کشورها پایتخت‌شان زیر خودشان است (قاعدهٔ
 *    Task 105: کشور → استان | شهر).
 *
 * اجرا:  cd mini-services/settings-service && bun scripts/geo-seed/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { COUNTRIES, type CountryEntry } from "./countries";
import { IRAN_PROVINCES, type ProvinceEntry } from "./iran";

const prisma = new PrismaClient();
const TABLE = "GeoLocation";
const IRAN_TITLE = "ایران";
const TYPE_COUNTRY = 1;
const TYPE_PROVINCE = 2;
const TYPE_CITY = 3;

interface PlannedNode {
  /** شناسهٔ موقت (منفی) برای گره‌های جدید؛ پس از رزرو بلاک به شناسهٔ واقعی نگاشت می‌شود */
  tempId: number;
  /** 0 = ریشهٔ مجازی؛ >0 = شناسهٔ موجود؛ <0 = شناسهٔ موقت والدِ همین اجرا */
  parentKey: number;
  levelType: number;
  code: number;
  title: string;
  titleLatin: string;
}

const faCollator = new Intl.Collator("fa");
const faSorted = <T>(arr: T[], title: (x: T) => string): T[] =>
  [...arr].sort((a, b) => faCollator.compare(title(a), title(b)));

function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

/** رزرو بلاک شناسه — الگوی IdGenerationService.nextInTx (فرمول خودترمیم §4). */
async function reserveIdBlock(count: number): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const maxRows: Array<{ m: bigint | null }> =
      await tx.$queryRawUnsafe(`SELECT MAX("ID") AS m FROM "GeoLocation"`);
    const maxDbId = maxRows[0]?.m != null ? Number(maxRows[0].m) : 0;

    const row = await tx.iDGeneration.findFirst({ where: { tableName: TABLE } });
    if (!row) {
      // بوت‌استرپ ردیف تازهٔ شمارنده (spec §4 step 6)
      const nextId = Math.max(1, maxDbId + 1);
      const cntRows: Array<{ m: bigint | null }> =
        await tx.$queryRawUnsafe(`SELECT MAX("IDGenerationID") AS m FROM "IDGeneration"`);
      const counterId = (cntRows[0]?.m != null ? Number(cntRows[0].m) : 0) + 1;
      await tx.iDGeneration.create({
        data: {
          idGenerationId: BigInt(counterId),
          tableName: TABLE,
          lastId: BigInt(nextId + count - 1),
        },
      });
      return nextId;
    }
    const candidate = Math.max(Number(row.lastId) + 1, maxDbId + 1);
    await tx.iDGeneration.update({
      where: { idGenerationId: row.idGenerationId },
      data: { lastId: BigInt(candidate + count - 1) },
    });
    return candidate;
  });
}

async function main(): Promise<void> {
  const existing = await prisma.geoLocation.findMany();
  console.log(`• رکوردهای موجود: ${existing.length}`);

  /* کلید (ParentRef|Title) → گرهٔ موجود */
  const byKey = new Map<string, { id: bigint; code: number }>();
  const maxCode = new Map<number, number>(); // ParentRef → بیشینهٔ کد خواهرها
  for (const r of existing) {
    const key = `${Number(r.parentRef)}|${r.title.trim()}`;
    if (byKey.has(key)) fail(`عنوان تکراری در پایگاه: «${r.title}» زیر والد ${Number(r.parentRef)}`);
    byKey.set(key, { id: r.id, code: r.code });
    const p = Number(r.parentRef);
    maxCode.set(p, Math.max(maxCode.get(p) ?? 0, r.code));
  }

  const nextCodeFor = (parent: number): number => {
    const c = (maxCode.get(parent) ?? 0) + 1;
    maxCode.set(parent, c);
    return c;
  };

  const planned: PlannedNode[] = [];
  let tempCounter = 0;
  const tempId = (): number => --tempCounter;

  /** گرهٔ موجود را بازیافت یا گرهٔ جدید برنامه‌ریزی کن؛ شناسه (عدد) برمی‌گرداند */
  const reuseOrPlan = (
    parentKey: number,
    title: string,
    titleLatin: string,
    levelType: number,
  ): { id: number; reused: boolean } => {
    const hit = byKey.get(`${parentKey}|${title}`);
    if (hit) return { id: Number(hit.id), reused: true };
    const tid = tempId();
    planned.push({
      tempId: tid,
      parentKey,
      levelType,
      code: nextCodeFor(parentKey),
      title,
      titleLatin,
    });
    return { id: tid, reused: false };
  };

  /* ---------------- ۱) کشورها (ریشهٔ مجازی، ParentRef=0) ---------------- */
  const seenCountry = new Set<string>();
  const stats = { countriesNew: 0, capitalsNew: 0, provincesNew: 0, citiesNew: 0 };
  let iranId = 0;
  for (const c of faSorted(COUNTRIES, (x) => x.title)) {
    if (seenCountry.has(c.title)) fail(`کشور تکراری در دادهٔ ورودی: «${c.title}»`);
    seenCountry.add(c.title);
    const { id: cid, reused } = reuseOrPlan(0, c.title, c.titleLatin, TYPE_COUNTRY);
    if (reused) console.log(`  · کشور موجود بازیافت شد: ${c.title}`);
    else stats.countriesNew++;
    if (c.title === IRAN_TITLE) {
      iranId = cid;
      continue; // پایتخت ایران زیر استان تهران می‌آید — نه زیر خود کشور
    }
    /* پایتخت → شهر زیر کشور (قاعدهٔ Task 105) */
    const cap = reuseOrPlan(cid, c.capital, c.capitalLatin, TYPE_CITY);
    if (!cap.reused) stats.capitalsNew++;
  }
  if (!iranId) fail("گرهٔ «ایران» یافت نشد و ساخته نشد — جریان نامعتبر است");

  /* ------------- ۲) استان‌های ایران (والد: گرهٔ «ایران») -------------- */
  const provinceIds = new Map<string, number>();
  for (const p of faSorted(IRAN_PROVINCES, (x) => x.title)) {
    const { id: pid, reused } = reuseOrPlan(iranId, p.title, p.titleLatin, TYPE_PROVINCE);
    if (reused) console.log(`  · استان موجود بازیافت شد: ${p.title}`);
    else stats.provincesNew++;
    provinceIds.set(p.title, pid);
  }

  /* ------------------- ۳) شهرهای هر استان ------------------- */
  for (const p of IRAN_PROVINCES) {
    const pid = provinceIds.get(p.title);
    if (pid == null) fail(`شناسهٔ استان «${p.title}» از دست رفت`);
    const seen = new Set<string>();
    for (const c of faSorted(p.cities, (x) => x.title)) {
      if (seen.has(c.title)) fail(`شهر تکراری در «${p.title}»: «${c.title}»`);
      seen.add(c.title);
      const { reused } = reuseOrPlan(pid, c.title, c.titleLatin, TYPE_CITY);
      if (!reused) stats.citiesNew++;
    }
  }

  console.log(
    `• برنامهٔ درج: ${planned.length} رکورد جدید ` +
      `(کشور ${stats.countriesNew}، پایتخت ${stats.capitalsNew}، استان ${stats.provincesNew}، شهر ${stats.citiesNew})` +
      (planned.length === 0 ? " — هیچ‌چیز برای درج نیست (اجرای مجدد)" : ""),
  );
  if (planned.length === 0) {
    console.log("✓ داده کامل است — پایان.");
    return;
  }

  /* ---------- ۴) رزرو بلاک شناسه و نگاشت شناسه‌های موقت → واقعی ---------- */
  const startId = await reserveIdBlock(planned.length);
  const idMap = new Map<number, bigint>(); // tempId → realId
  planned.forEach((n, i) => idMap.set(n.tempId, BigInt(startId + i)));

  const now = new Date();
  const rows = planned.map((n) => {
    const parentRef =
      n.parentKey === 0
        ? 0n
        : n.parentKey > 0
          ? BigInt(n.parentKey)
          : (idMap.get(n.parentKey) ?? fail(`والد موقت ${n.parentKey} نگاشت نشد`));
    return {
      id: idMap.get(n.tempId) ?? fail("شناسهٔ موقت نگاشت نشد"),
      parentRef,
      levelType: n.levelType,
      code: n.code,
      title: n.title,
      titleLatin: n.titleLatin,
      isActive: true,
      version: 1,
      creator: "system",
      lastModifier: null,
      businessStructureRef: 1n, // دفتر مرکزی (SYSTEM_ACTOR)
      companyRef: null,
      branchRef: null,
      agencyRef: null,
      shopRef: null,
      createdAt: now,
      updatedAt: now,
    };
  });

  await prisma.geoLocation.createMany({ data: rows });

  /* ---------------------------- ۵) راستی‌آزمایی ---------------------------- */
  const total = await prisma.geoLocation.count();
  const countries = await prisma.geoLocation.count({ where: { levelType: TYPE_COUNTRY } });
  const provinces = await prisma.geoLocation.count({
    where: { parentRef: BigInt(iranId), levelType: TYPE_PROVINCE },
  });
  const fars = byKey.get(`${iranId}|فارس`);
  const farsCities = fars
    ? await prisma.geoLocation.count({ where: { parentRef: fars.id } })
    : 0;
  const germany = await prisma.geoLocation.findFirst({
    where: { parentRef: 0n, titleLatin: "Germany" },
  });
  const berlin = germany
    ? await prisma.geoLocation.findFirst({ where: { parentRef: germany.id } })
    : null;
  const counter = await prisma.iDGeneration.findFirst({ where: { tableName: TABLE } });

  console.log("—— راستی‌آزمایی ——");
  console.log(`  کل رکوردها: ${total}`);
  console.log(`  کشورها (سطح ۱): ${countries}`);
  console.log(`  استان‌های ایران: ${provinces}`);
  console.log(`  شهرهای فارس: ${farsCities}`);
  console.log(
    `  آلمان → ${berlin ? `${berlin.title} / ${berlin.titleLatin} (نوع ${berlin.levelType}, کد ${berlin.code})` : "پیدا نشد!"}`,
  );
  console.log(`  شمارندهٔ IDGeneration[GeoLocation] = ${counter ? Number(counter.lastId) : "?"}`);
  console.log("✓ seed کامل شد.");
}

main()
  .catch((e) => {
    console.error("✗ خطای seed:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
