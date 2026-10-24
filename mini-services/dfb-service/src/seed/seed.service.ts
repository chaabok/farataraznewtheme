import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { APP_CATALOG } from "../../../_shared/app-catalog";
import { appBaseOnCreate, SYSTEM_ACTOR } from "../../../_shared/app-base-entity";

/**
 * SYSTEM_FORMS — registry of the ERP's built-in forms (in the owner's words:
 * «تمام فرم‌هایی که بصورت سیستمی ایجاد می‌شوند به تفکیک هر آیکون و منو باید در
 * درختواره فرم‌ساز نمایش داده شوند»). Each entry anchors a DfbForm row
 * (IsSystem=true) under the DfbMenu icon node of its hosting app; users can
 * add custom fields (IsCustom=true) to them from the builder.
 * New system forms register HERE as their analysis documents arrive (§4.6).
 */
interface SystemFormSeed {
  systemKey: string;
  anchorAppKey: string; // catalog appKey of the icon node it lives under
  code: string;
  titleFa: string;
  titleEn: string;
  componentKey: string; // "simpleTwoRowTabbed" | "treeForm"
}

const SYSTEM_FORMS: SystemFormSeed[] = [
  {
    systemKey: "gnr.businessStructure",
    anchorAppKey: "general", // عمومی — سرویس عمومی (Gnr) میزبان ساختار کسب‌وکار است
    code: "BS",
    titleFa: "ساختار کسب و کار",
    titleEn: "Business Structure",
    componentKey: "treeForm",
  },
];

/**
 * Boot seed (idempotent) — اسکیمای Dfb:
 *  1) pre-seed IDGeneration counter rows for every Dfb table,
 *  2) sync the 28 catalog apps as system icon nodes (DfbMenu, IsSystem=true,
 *     ParentRef=0, NodeType=1, AppKey=appKey) — catalog stays the single source
 *     of truth (§4.1); drift updates code-driven fields only on real change,
 *  3) register SYSTEM_FORMS as system forms under their anchor icon.
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
    /* 1) pre-seed counter rows (self-heal bootstrap) */
    for (const table of [
      "DfbMenu",
      "DfbForm",
      "DfbFormTab",
      "DfbFormField",
      "DfbQuery",
      "DfbQueryField",
      "DfbFormData",
      "DfbFormDataValue",
    ]) {
      const exists = await this.prisma.iDGeneration.findUnique({ where: { tableName: table } });
      if (!exists) {
        const rows: Array<{ m: bigint | null }> = await this.prisma.$queryRawUnsafe(
          `SELECT MAX("IDGenerationID") AS m FROM "IDGeneration"`,
        );
        const counterId = Number(rows[0]?.m ?? 0n) + 1;
        const maxRows: Array<{ m: bigint | null }> = await this.prisma.$queryRawUnsafe(
          `SELECT MAX("ID") AS m FROM "${table}"`,
        );
        const lastId = maxRows[0]?.m ?? 0n;
        await this.prisma.iDGeneration.create({
          data: { idGenerationId: BigInt(counterId), tableName: table, lastId },
        });
        this.logger.log(`seeded IDGeneration counter for ${table} (LastID=${lastId})`);
      }
    }

    /* 2) catalog apps → system icon nodes (§4.1 single source, idempotent sync) */
    let created = 0;
    let updated = 0;
    for (const app of APP_CATALOG) {
      const existing = await this.prisma.dfbMenu.findFirst({
        where: { parentRef: 0n, isSystem: true, appKey: app.appKey },
      });
      if (!existing) {
        const id = await this.idGen.generateNextId("DfbMenu");
        await this.prisma.dfbMenu.create({
          data: {
            id: BigInt(id),
            parentRef: 0n,
            nodeType: 1,
            code: app.appKey,
            title: app.titleFa,
            titleEn: null,
            iconKey: app.iconKey,
            appKey: app.appKey,
            sortOrder: app.order,
            isSystem: true,
            isActive: true,
            ...appBaseOnCreate(SYSTEM_ACTOR),
          },
        });
        created++;
      } else {
        const drift =
          existing.title !== app.titleFa ||
          existing.iconKey !== app.iconKey ||
          existing.sortOrder !== app.order;
        if (drift) {
          await this.prisma.dfbMenu.update({
            where: { id: existing.id },
            data: {
              title: app.titleFa,
              iconKey: app.iconKey,
              sortOrder: app.order,
            },
          });
          updated++;
        }
      }
    }
    if (created || updated) {
      this.logger.log(`DfbMenu sync: ${created} created, ${updated} updated (${APP_CATALOG.length} catalog apps)`);
    }

    /* 3) system forms under their anchor icon */
    for (const sf of SYSTEM_FORMS) {
      const anchor = await this.prisma.dfbMenu.findFirst({
        where: { parentRef: 0n, isSystem: true, appKey: sf.anchorAppKey },
      });
      if (!anchor) continue;
      const existing = await this.prisma.dfbForm.findFirst({
        where: { systemKey: sf.systemKey },
      });
      if (!existing) {
        const id = await this.idGen.generateNextId("DfbForm");
        await this.prisma.dfbForm.create({
          data: {
            id: BigInt(id),
            menuRef: anchor.id,
            code: sf.code,
            title: sf.titleFa,
            titleEn: sf.titleEn,
            componentKey: sf.componentKey,
            status: 2,
            systemKey: sf.systemKey,
            isSystem: true,
            ...appBaseOnCreate(SYSTEM_ACTOR),
          },
        });
        this.logger.log(`seeded system form ${sf.systemKey} (ID=${id}) under "${sf.anchorAppKey}"`);
      } else if (
        existing.title !== sf.titleFa ||
        existing.componentKey !== sf.componentKey ||
        existing.menuRef !== anchor.id
      ) {
        await this.prisma.dfbForm.update({
          where: { id: existing.id },
          data: { title: sf.titleFa, componentKey: sf.componentKey, menuRef: anchor.id },
        });
      }
    }
  }
}
