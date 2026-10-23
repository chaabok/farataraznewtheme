import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { APP_CATALOG } from "../../../_shared/app-catalog";

/**
 * Systems — master registry of ALL ERP software (legacy "Gnr"."Systems", §2.6).
 * The desktop items are the platform's main software; new software may be added
 * later. Boot-sync is idempotent from APP_CATALOG (§4.1 single source of truth):
 *   · missing rows are created with a manual PK through IdGenerationService (§2.4);
 *   · catalog-driven fields (TitleFa/TitleKey/IconKey/AppGroup/SortOrder) are
 *     updated ONLY on real drift (§2.5 — Version must reflect genuine change);
 *   · IsActive is never touched by the sync (§4.5 philosophy: DB wins over code).
 */
@Injectable()
export class SystemsService implements OnModuleInit {
  private readonly logger = new Logger(SystemsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  async onModuleInit() {
    await this.syncFromCatalog();
  }

  async syncFromCatalog() {
    const existing = await this.prisma.systems.findMany();
    const byCode = new Map(existing.map((r) => [r.code, r]));
    let created = 0;
    let updated = 0;

    for (const app of APP_CATALOG) {
      const row = byCode.get(app.appKey);
      const drift =
        !!row &&
        (row.titleFa !== app.titleFa ||
          (row.titleKey ?? null) !== app.titleKey ||
          row.iconKey !== app.iconKey ||
          row.appGroup !== app.appGroup ||
          row.sortOrder !== app.order);

      if (!row) {
        // PK from the counter (§2.4) — never autoincrement
        const newId = await this.idGen.generateNextId("Systems");
        await this.prisma.systems.create({
          data: {
            id: BigInt(newId),
            code: app.appKey,
            titleFa: app.titleFa,
            titleKey: app.titleKey,
            iconKey: app.iconKey,
            appGroup: app.appGroup,
            sortOrder: app.order,
          },
        });
        created += 1;
      } else if (drift) {
        await this.prisma.systems.update({
          where: { id: row.id },
          data: {
            titleFa: app.titleFa,
            titleKey: app.titleKey,
            iconKey: app.iconKey,
            appGroup: app.appGroup,
            sortOrder: app.order,
          },
        });
        updated += 1;
      }
    }
    this.logger.log(
      `Systems synced from APP_CATALOG (total ${APP_CATALOG.length}, created ${created}, updated ${updated})`,
    );
  }

  /* --------------------------------- read -------------------------------- */

  async list() {
    const items = await this.prisma.systems.findMany({ orderBy: { sortOrder: "asc" } });
    return { items: items.map((s) => this.toDto(s)) };
  }

  async byCode(code: string) {
    const row = await this.prisma.systems.findUnique({ where: { code } });
    return row ? this.toDto(row) : null;
  }

  /* ------------------------------- mapping ------------------------------- */

  private toDto(s: {
    id: bigint;
    code: string;
    titleFa: string;
    titleKey: string | null;
    iconKey: string;
    appGroup: string;
    sortOrder: number;
    isActive: boolean;
    version: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: Number(s.id), // §2.4 BigInt → number (2^53 guard applied at generation)
      code: s.code,
      titleFa: s.titleFa,
      titleKey: s.titleKey,
      iconKey: s.iconKey,
      appGroup: s.appGroup,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
      version: s.version,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  }
}
