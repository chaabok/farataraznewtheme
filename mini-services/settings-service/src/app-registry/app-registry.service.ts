import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { APP_CATALOG } from "../../../_shared/app-catalog";

/**
 * AppRegistry — DB-driven app catalog for the mesh (§5.4 philosophy).
 * Boot-synced (idempotent) from the shared APP_CATALOG. Runtime flips of
 * dbMode/isEnabled in the DB always win over code (they are never overwritten).
 */
@Injectable()
export class AppRegistryService implements OnModuleInit {
  private readonly logger = new Logger(AppRegistryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.syncFromCatalog();
  }

  async syncFromCatalog() {
    const existing = await this.prisma.appRegistry.findMany();
    const byKey = new Map(existing.map((r) => [r.appKey, r]));
    let changed = 0;
    for (const app of APP_CATALOG) {
      const row = byKey.get(app.appKey);
      // §2.5: update only on REAL drift — identical boot-syncs must never churn
      // Version/UpdatedAt. dbMode/isEnabled runtime flips always win over code
      // and are never part of the update (§4.5).
      const drift =
        !row ||
        row.titleFa !== app.titleFa ||
        row.titleKey !== app.titleKey ||
        row.iconKey !== app.iconKey ||
        row.appGroup !== app.appGroup ||
        row.order !== app.order ||
        row.port !== app.port ||
        row.host !== app.host;
      await this.prisma.appRegistry.upsert({
        where: { appKey: app.appKey },
        create: {
          appKey: app.appKey,
          titleFa: app.titleFa,
          titleKey: app.titleKey,
          iconKey: app.iconKey,
          appGroup: app.appGroup,
          order: app.order,
          port: app.port,
          dbMode: app.dbMode,
          host: app.host,
        },
        update: drift
          ? {
              titleFa: app.titleFa,
              titleKey: app.titleKey,
              iconKey: app.iconKey,
              appGroup: app.appGroup,
              order: app.order,
              port: app.port,
              host: app.host,
            }
          : {},
      });
      if (drift) changed += 1;
    }
    this.logger.log(`AppRegistry synced (${APP_CATALOG.length} apps, ${changed} changed)`);
  }

  async list() {
    const items = await this.prisma.appRegistry.findMany({
      where: { isEnabled: true },
      orderBy: { order: "asc" },
    });
    return { items };
  }
}
