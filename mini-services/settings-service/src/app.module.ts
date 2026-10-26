import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { InternalAuthGuard } from "../../_shared/internal-auth";
import { PrismaModule } from "./prisma/prisma.module";
import { IdGenerationModule } from "./id-generation/id-generation.module";
import { BusinessStructureModule } from "./business-structure/business-structure.module";
import { AppRegistryModule } from "./app-registry/app-registry.module";
import { SystemsModule } from "./systems/systems.module";
import { SoftwareConfigModule } from "./software-config/software-config.module";
import { FiscalYearModule } from "./fiscal-year/fiscal-year.module";
import { PartyModule } from "./party/party.module";
import { DataTranslationsModule } from "./data-translations/data-translations.module";
import { UserRolesModule } from "./user-roles/user-roles.module";
import { GeoLocationModule } from "./geo-location/geo-location.module";
import { HealthController } from "./health/health.controller";
import { SeedModule } from "./seed/seed.module";

@Module({
  imports: [
    PrismaModule,
    IdGenerationModule,
    BusinessStructureModule,
    AppRegistryModule,
    SystemsModule,
    SoftwareConfigModule,
    FiscalYearModule,
    PartyModule,
    DataTranslationsModule, // Task 92 — انبار ترجمهٔ دادهٔ فرم‌های سیستمی
    UserRolesModule, // Task 100 — نقش‌های کاربری (مدیریت کاربران)
    GeoLocationModule, // Task 103 — محل‌های جغرافیایی (اطلاعات پایه)
    SeedModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: InternalAuthGuard }],
})
export class AppModule {}
