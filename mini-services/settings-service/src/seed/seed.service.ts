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
    /* 1) default settings */
    const defaults: Array<[string, string]> = [
      ["bs.shareHeadquarterData", "false"],
      ["bs.activeStructureTypes", "[1,2,3,4]"],
    ];
    for (const [key, value] of defaults) {
      await this.prisma.setting.upsert({ where: { key }, create: { key, value }, update: {} });
    }

    /* 2) system-reserved root — direct INSERT at ID=1 (never via counter) */
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
          isSystem: true,
          isActive: true,
        },
      });
      this.logger.log("seeded BusinessStructure root ID=1");
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
  }
}
