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
    SeedModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: InternalAuthGuard }],
})
export class AppModule {}
