import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { appBaseOnCreate, SYSTEM_ACTOR } from "../../../_shared/app-base-entity";
import {
  DETAIL_TYPES_HEAD_OFFICE_REF,
  seedCanonicalDetailTypes,
} from "../detail-type/canonical-detail-types";

/**
 * Boot seed (idempotent) — mirrors the legacy pre-seed contract (spec §2/§6):
 *  · pre-seed IDGeneration counter rows,
 *  · system-reserved BusinessStructure root ID=1 («دفتر مرکزی», code 01, IsSystem),
 *  · a sample company (01-01) fed through IdGenerationService — proving the counter
 *    can never reproduce the reserved root id.
 */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    /* 1) default settings — Task 79: fresh install ticks ONLY Holding (1);
       the user ticks Company/Branch/Agency/Store as needed. */
    const defaults: Array<[string, string]> = [
      ["bs.shareHeadquarterData", "false"],
      ["bs.activeStructureTypes", "[1]"],
    ];
    for (const [key, value] of defaults) {
      await this.prisma.setting.upsert({ where: { key }, create: { key, value }, update: {} });
    }

    /* 2) system-reserved root — direct INSERT at ID=1 (never via counter).
       Task 79: the Holding tick is system-mandated, so the root is born with
       ActiveStructureTypes "[1]". */
    const root = await this.prisma.businessStructure.findUnique({ where: { id: 1n } });
    if (!root) {
      await this.prisma.businessStructure.create({
        data: {
          id: 1n,
          parentRef: 0n,
          code: "01",
          title: "دفتر مرکزی",
          titleEn: "Headquarters",
          businessStructureType: null,
          activeStructureTypes: "[1]",
          isSystem: true,
          isActive: true,
        },
      });
      this.logger.log("seeded BusinessStructure root ID=1");
    }

    /* 2b) Task 79 backfill (idempotent, runs every boot) — older roots whose
       ActiveStructureTypes lost the Holding tick (e.g. "[]" or null before
       Task 79) are merged back to include 1; the Setting mirror follows.
       Safe by contract: the UI locks the Holding checkbox and the API rejects
       its removal, so this can never fight a user's choice. */
    const rootRow = await this.prisma.businessStructure.findUnique({
      where: { id: 1n },
      select: { activeStructureTypes: true },
    });
    if (rootRow) {
      let ticks: number[] = [];
      try {
        const parsed: unknown = JSON.parse(rootRow.activeStructureTypes ?? "[]");
        if (Array.isArray(parsed)) {
          ticks = parsed.filter(
            (x): x is number => typeof x === "number" && Number.isInteger(x) && x >= 1 && x <= 5,
          );
        }
      } catch {
        ticks = [];
      }
      if (!ticks.includes(1)) {
        const merged = JSON.stringify([...new Set([1, ...ticks])].sort((a, b) => a - b));
        await this.prisma.$transaction([
          this.prisma.businessStructure.update({
            where: { id: 1n },
            data: { activeStructureTypes: merged },
          }),
          this.prisma.setting.upsert({
            where: { key: "bs.activeStructureTypes" },
            create: { key: "bs.activeStructureTypes", value: merged },
            update: { value: merged },
          }),
        ]);
        this.logger.log(`backfilled root ActiveStructureTypes -> ${merged}`);
      }
    }

    /* 3) pre-seed counter rows (self-heal bootstrap) */
    const bsMax = await this.prisma.businessStructure.aggregate({ _max: { id: true } });
    const counterExists = await this.prisma.iDGeneration.findUnique({
      where: { tableName: "BusinessStructure" },
    });
    if (!counterExists) {
      const counterIdRow: Array<{ m: bigint | null }> =
        await this.prisma.$queryRawUnsafe(`SELECT MAX("IDGenerationID") AS m FROM "IDGeneration"`);
      const counterId = Number(counterIdRow[0]?.m ?? 0n) + 1;
      await this.prisma.iDGeneration.create({
        data: {
          idGenerationId: BigInt(counterId),
          tableName: "BusinessStructure",
          lastId: BigInt(bsMax._max.id ?? 0n),
        },
      });
    }
    const bsuCounter = await this.prisma.iDGeneration.findUnique({
      where: { tableName: "BusinessStructureUser" },
    });
    if (!bsuCounter) {
      const counterIdRow: Array<{ m: bigint | null }> =
        await this.prisma.$queryRawUnsafe(`SELECT MAX("IDGenerationID") AS m FROM "IDGeneration"`);
      const counterId = Number(counterIdRow[0]?.m ?? 0n) + 1;
      await this.prisma.iDGeneration.create({
        data: {
          idGenerationId: BigInt(counterId),
          tableName: "BusinessStructureUser",
          lastId: 0n,
        },
      });
    }

    /* 4) sample company through the counter (proves root reservation) */
    const sample = await this.prisma.businessStructure.findFirst({
      where: { code: "01-01" },
    });
    if (!sample) {
      const newId = await this.idGen.generateNextId("BusinessStructure");
      await this.prisma.businessStructure.create({
        data: {
          id: BigInt(newId),
          parentRef: 1n,
          code: "01-01",
          title: "شرکت نمونه",
          titleEn: "Sample Company",
          businessStructureType: 2,
          manager: null,
          isActive: true,
        },
      });
      this.logger.log(`seeded sample company ID=${newId} via IdGenerationService`);
    }

    /* 5) Task 84 — جدول شهرها (idempotent by Code): دراپ‌داونِ «شهر» تب
       «نشانی» فرم طرف حساب به این جدول متصل است (کد/عنوان/عنوان لاتین/
       استان/کشور). فهرست اولیه = شهرهای major ایران؛ توسعه با همین جدول. */
    const CITIES: Array<[string, string, string, string, string]> = [
      ["101", "تهران", "Tehran", "تهران", "ایران"],
      ["102", "مشهد", "Mashhad", "خراسان رضوی", "ایران"],
      ["103", "اصفهان", "Isfahan", "اصفهان", "ایران"],
      ["104", "شیراز", "Shiraz", "فارس", "ایران"],
      ["105", "تبریز", "Tabriz", "آذربایجان شرقی", "ایران"],
      ["106", "کرج", "Karaj", "البرز", "ایران"],
      ["107", "اهواز", "Ahvaz", "خوزستان", "ایران"],
      ["108", "قم", "Qom", "قم", "ایران"],
      ["109", "رشت", "Rasht", "گیلان", "ایران"],
      ["110", "کرمان", "Kerman", "کرمان", "ایران"],
      ["111", "یزد", "Yazd", "یزد", "ایران"],
      ["112", "ارومیه", "Urmia", "آذربایجان غربی", "ایران"],
      ["113", "زاهدان", "Zahedan", "سیستان و بلوچستان", "ایران"],
      ["114", "سمنان", "Semnan", "سمنان", "ایران"],
      ["115", "بجنورد", "Bojnord", "خراسان شمالی", "ایران"],
      ["116", "بیرجند", "Birjand", "خراسان جنوبی", "ایران"],
      ["117", "سنندج", "Sanandaj", "کردستان", "ایران"],
      ["118", "همدان", "Hamadan", "همدان", "ایران"],
      ["119", "بندرعباس", "Bandar Abbas", "هرمزگان", "ایران"],
      ["120", "قزوین", "Qazvin", "قزوین", "ایران"],
      ["121", "اراک", "Arak", "مرکزی", "ایران"],
      ["122", "کاشان", "Kashan", "اصفهان", "ایران"],
    ];
    let cityMaxId = 0n;
    const cityAgg = await this.prisma.city.aggregate({ _max: { id: true } });
    cityMaxId = cityAgg._max.id ?? 0n;
    for (const [code, title, titleLatin, province, country] of CITIES) {
      const exists = await this.prisma.city.findUnique({ where: { code } });
      if (exists) continue;
      cityMaxId += 1n;
      await this.prisma.city.create({
        data: {
          id: cityMaxId,
          code,
          title,
          titleLatin,
          provinceName: province,
          countryName: country,
          isActive: true,
          creator: "system",
          businessStructureRef: 1n,
        },
      });
    }

    /* 6) Task 100 — نقش سیستمی «مدیر سیستم» (idempotent by Code):
       محدودهٔ دسترسی ندارد (بدون ردیف UserRoleScope) یعنی دسترسی کامل به
       همهٔ نرم‌افزارها و کل ساختار سازمانی؛ IsSystem حذفش را رد می‌کند. */
    const sysRole = await this.prisma.userRole.findUnique({
      where: { code_businessStructureRef: { code: "ADMIN", businessStructureRef: 1n } },
    });
    if (!sysRole) {
      const roleId = await this.idGen.generateNextId("UserRole");
      await this.prisma.userRole.create({
        data: {
          id: BigInt(roleId),
          code: "ADMIN",
          title: "مدیر سیستم",
          description:
            "نقش سیستمی — دسترسی کامل به همهٔ نرم‌افزارها و کل ساختار سازمانی؛ محدودهٔ دسترسی ندارد.",
          isActive: true,
          isSystem: true,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
      this.logger.log(`seeded system UserRole ADMIN (مدیر سیستم) ID=${roleId}`);
    }

    /* 7) Task 114 — انواع ارز (idempotent by Code): فرم «نوع ارز جدید» در
       اطلاعات پایهٔ عمومی. Seed = ارزهای معتبر بین‌المللی ISO 4217:
       ریال ایران + ارزهای major جهان و همسایگان؛ تعداد اعشار = exponent
       استاندارد ISO (دینارها تا ۳ اعشار)؛ واحد مبنا = ۱. */
    const CURRENCIES: Array<{
      code: string;
      title: string;
      titleLatin: string;
      decimalPlaces: number;
      decimalTitle?: string;
      decimalTitleLatin?: string;
    }> = [
      { code: "IRR", title: "ریال ایران", titleLatin: "Iranian Rial", decimalPlaces: 0 },
      { code: "USD", title: "دلار آمریکا", titleLatin: "US Dollar", decimalPlaces: 2, decimalTitle: "سنت", decimalTitleLatin: "Cent" },
      { code: "EUR", title: "یورو", titleLatin: "Euro", decimalPlaces: 2, decimalTitle: "سنت", decimalTitleLatin: "Cent" },
      { code: "AED", title: "درهم امارات", titleLatin: "UAE Dirham", decimalPlaces: 2, decimalTitle: "فلس", decimalTitleLatin: "Fils" },
      { code: "SAR", title: "ریال سعودی", titleLatin: "Saudi Riyal", decimalPlaces: 2, decimalTitle: "هلله", decimalTitleLatin: "Halala" },
      { code: "QAR", title: "ریال قطر", titleLatin: "Qatari Riyal", decimalPlaces: 2, decimalTitle: "درهم", decimalTitleLatin: "Dirham" },
      { code: "OMR", title: "ریال عمان", titleLatin: "Omani Rial", decimalPlaces: 3, decimalTitle: "بیسا", decimalTitleLatin: "Baisa" },
      { code: "KWD", title: "دینار کویت", titleLatin: "Kuwaiti Dinar", decimalPlaces: 3, decimalTitle: "فلس", decimalTitleLatin: "Fils" },
      { code: "BHD", title: "دینار بحرین", titleLatin: "Bahraini Dinar", decimalPlaces: 3, decimalTitle: "فلس", decimalTitleLatin: "Fils" },
      { code: "IQD", title: "دینار عراق", titleLatin: "Iraqi Dinar", decimalPlaces: 3, decimalTitle: "فلس", decimalTitleLatin: "Fils" },
      { code: "AFN", title: "افغانی افغانستان", titleLatin: "Afghan Afghani", decimalPlaces: 2, decimalTitle: "پول", decimalTitleLatin: "Pul" },
      { code: "TRY", title: "لیر ترکیه", titleLatin: "Turkish Lira", decimalPlaces: 2, decimalTitle: "کوروش", decimalTitleLatin: "Kurus" },
      { code: "AZN", title: "منات آذربایجان", titleLatin: "Azerbaijani Manat", decimalPlaces: 2, decimalTitle: "قپیک", decimalTitleLatin: "Qapik" },
      { code: "TJS", title: "سومونی تاجیکستان", titleLatin: "Tajikistani Somoni", decimalPlaces: 2, decimalTitle: "دیرم", decimalTitleLatin: "Diram" },
      { code: "PKR", title: "روپیه پاکستان", titleLatin: "Pakistani Rupee", decimalPlaces: 2, decimalTitle: "پیسه", decimalTitleLatin: "Paisa" },
      { code: "INR", title: "روپیه هند", titleLatin: "Indian Rupee", decimalPlaces: 2, decimalTitle: "پیسه", decimalTitleLatin: "Paisa" },
      { code: "CNY", title: "یوان چین", titleLatin: "Chinese Yuan", decimalPlaces: 2, decimalTitle: "فن", decimalTitleLatin: "Fen" },
      { code: "JPY", title: "ین ژاپن", titleLatin: "Japanese Yen", decimalPlaces: 0 },
      { code: "KRW", title: "وون کره جنوبی", titleLatin: "South Korean Won", decimalPlaces: 0 },
      { code: "RUB", title: "روبل روسیه", titleLatin: "Russian Ruble", decimalPlaces: 2, decimalTitle: "کپیک", decimalTitleLatin: "Kopek" },
      { code: "GBP", title: "پوند انگلیس", titleLatin: "British Pound", decimalPlaces: 2, decimalTitle: "پنی", decimalTitleLatin: "Penny" },
      { code: "CHF", title: "فرانک سوئیس", titleLatin: "Swiss Franc", decimalPlaces: 2, decimalTitle: "راپن", decimalTitleLatin: "Rappen" },
      { code: "CAD", title: "دلار کانادا", titleLatin: "Canadian Dollar", decimalPlaces: 2, decimalTitle: "سنت", decimalTitleLatin: "Cent" },
      { code: "AUD", title: "دلار استرالیا", titleLatin: "Australian Dollar", decimalPlaces: 2, decimalTitle: "سنت", decimalTitleLatin: "Cent" },
      { code: "MYR", title: "رینگیت مالزی", titleLatin: "Malaysian Ringgit", decimalPlaces: 2, decimalTitle: "سن", decimalTitleLatin: "Sen" },
    ];
    let seededCur = 0;
    for (const c of CURRENCIES) {
      const exists = await this.prisma.currencyType.findFirst({
        where: { businessStructureRef: 1n, code: c.code },
      });
      if (exists) continue;
      const newId = await this.idGen.generateNextId("CurrencyType");
      await this.prisma.currencyType.create({
        data: {
          id: BigInt(newId),
          code: c.code,
          title: c.title,
          titleLatin: c.titleLatin,
          baseUnit: 1,
          decimalPlaces: c.decimalPlaces,
          decimalTitle: c.decimalTitle ?? null,
          decimalTitleLatin: c.decimalTitleLatin ?? null,
          isActive: true,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
      seededCur++;
    }
    if (seededCur > 0) {
      this.logger.log(`seeded ${seededCur} CurrencyType rows (ISO 4217, Task 114)`);
    }

    /* 7) Task 122 — قاعدهٔ مالک برای «نوع تفصیل» (حسابداری ← اطلاعات پایه):
       قاعدهٔ ۳ — «با نصب دیتابیس این آیتم‌ها باید در جدول نوع تفصیل ایجاد
       گردد. البته باید کنترل گردد که در جدول نوع تفصیلی اطلاعات وجود
       نداشته باشد» ⇒ در نصب تازه (جدول کاملاً خالی) ۲۱ آیتم مرجعِ عین
       تصویر مالک برای دفتر مرکزی ساخته می‌شود؛ وگرنه هیچ. */
    const dtTotal = await this.prisma.detailType.count();
    if (dtTotal === 0) {
      const seededHo = await seedCanonicalDetailTypes(
        this.prisma,
        this.idGen,
        DETAIL_TYPES_HEAD_OFFICE_REF,
        SYSTEM_ACTOR,
      );
      if (seededHo > 0) {
        this.logger.log(
          `seeded ${seededHo} canonical DetailType rows for head office (Task 122 — نصب تازهٔ دیتابیس)`,
        );
      }
    }

    /* 8) Task 122 — قاعدهٔ ۲ مالک برای گره‌های از پیش موجود: هر هلدینگ(1)/
       شرکت(2) فعال بدون تیک «داده‌های مشترک دفتر مرکزی» که هنوز هیچ ردیف
       تفصیلی ندارد، همین ۲۱ آیتم مرجع را می‌گیرد (اجرای مکرر امن — گارد
       درون seedCanonicalDetailTypes؛ بدون دوبل‌نویسی). */
    const hoNodes = await this.prisma.businessStructure.findMany({
      where: {
        isActive: true,
        businessStructureType: { in: [1, 2] },
        isBasicInfoShared: false,
      },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    let seededBranches = 0;
    for (const n of hoNodes) {
      seededBranches += await seedCanonicalDetailTypes(
        this.prisma,
        this.idGen,
        n.id,
        SYSTEM_ACTOR,
      );
    }
    if (seededBranches > 0) {
      this.logger.log(
        `seeded ${seededBranches} canonical DetailType rows for existing holding/company nodes (Task 122 — قاعدهٔ شاخه)`,
      );
    }
  }
}
