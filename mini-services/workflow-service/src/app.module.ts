import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { InternalAuthGuard } from "../../_shared/internal-auth";
import { PrismaModule } from "./prisma/prisma.module";
import { IdGenerationModule } from "./id-generation/id-generation.module";
import { RolesModule } from "./roles/roles.module";
import { DefinitionsModule } from "./definitions/definitions.module";
import { InstancesModule } from "./instances/instances.module";
import { StatusMapModule } from "./status-map/status-map.module";
import { SeedModule } from "./seed/seed.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    PrismaModule,
    IdGenerationModule,
    RolesModule,
    DefinitionsModule,
    InstancesModule,
    StatusMapModule,
    SeedModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: InternalAuthGuard }],
})
export class AppModule {}
