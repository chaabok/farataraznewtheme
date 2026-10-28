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
import { CurrencyTypeModule } from "./currency-type/currency-type.module";
import { ExchangeRateModule } from "./exchange-rate/exchange-rate.module";
import { DetailTypeModule } from "./detail-type/detail-type.module";
import { DetailTypeNumberingModule } from "./detail-type-numbering/detail-type-numbering.module";
import { UsersModule } from "./users/users.module";
import { AccountTreeModule } from "./account-tree/account-tree.module";
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
    CurrencyTypeModule, // Task 114 — نوع ارز (اطلاعات پایه)
    ExchangeRateModule, // Task 116 — نرخ برابری ارز (عملیات)
    DetailTypeModule, // Task 120 — نوع تفصیل جدید (اطلاعات پایهٔ حسابداری)
    DetailTypeNumberingModule, // Task 131 — شماره گذاری تفصیلی ها (اطلاعات پایهٔ حسابداری)
    UsersModule, // Task 126 — کاربران (مدیریت کاربران — فرم کاربر جدید)
    AccountTreeModule, // Task 140 — درختواره حسابها (اطلاعات پایهٔ حسابداری)
    SeedModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: InternalAuthGuard }],
})
export class AppModule {}
