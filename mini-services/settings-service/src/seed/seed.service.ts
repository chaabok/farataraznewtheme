import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";

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
  }
}
