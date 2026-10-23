import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { InternalAuthGuard } from "../../_shared/internal-auth";
import { PrismaModule } from "./prisma/prisma.module";
import { IdGenerationModule } from "./id-generation/id-generation.module";
import { BusinessStructureModule } from "./business-structure/business-structure.module";
import { AppRegistryModule } from "./app-registry/app-registry.module";
import { SystemsModule } from "./systems/systems.module";
import { HealthController } from "./health/health.controller";
import { SeedModule } from "./seed/seed.module";

@Module({
  imports: [
    PrismaModule,
    IdGenerationModule,
    BusinessStructureModule,
    AppRegistryModule,
    SystemsModule,
    SeedModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: InternalAuthGuard }],
})
export class AppModule {}
