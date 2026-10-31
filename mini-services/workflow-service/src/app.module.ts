import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { InternalAuthGuard } from "../../_shared/internal-auth";
import { PrismaModule } from "./prisma/prisma.module";
import { IdGenerationModule } from "./id-generation/id-generation.module";
import { EntityLinkModule } from "./entity-link/entity-link.module";
import { RolesModule } from "./roles/roles.module";
import { DefinitionsModule } from "./definitions/definitions.module";
import { InstancesModule } from "./instances/instances.module";
import { StatusMapModule } from "./status-map/status-map.module";
import { CartableModule } from "./cartable/cartable.module"; // t179 فاز ۳ — کارتابل/ابلاغ/تفویض/SLA
import { CatalogModule } from "./catalog/catalog.module"; // t180 فاز ۴ — کاتالوگ فرم‌های مشارکت‌کننده
import { SeedModule } from "./seed/seed.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    PrismaModule,
    IdGenerationModule,
    EntityLinkModule, // t178 — پل سبک موتور → سرویس مالک فرم (منبع حقیقت D-3 / write-back D-4)
    RolesModule,
    DefinitionsModule,
    InstancesModule,
    StatusMapModule,
    CartableModule, // t179 — کارتابل، تفویض بازه‌دار و موتور SLA
    CatalogModule, // t180 فاز ۴ — دفتر فرم‌های مشارکت‌کننده (انتخاب کاربر)
    SeedModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: InternalAuthGuard }],
})
export class AppModule {}
