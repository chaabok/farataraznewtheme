import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { InternalAuthGuard } from "../../_shared/internal-auth";
import { PrismaModule } from "./prisma/prisma.module";
import { IdGenerationModule } from "./id-generation/id-generation.module";
import { MenusModule } from "./menus/menus.module";
import { FormsModule } from "./forms/forms.module";
import { QueriesModule } from "./queries/queries.module";
import { HealthController } from "./health/health.controller";
import { SeedModule } from "./seed/seed.module";

@Module({
  imports: [
    PrismaModule,
    IdGenerationModule,
    MenusModule,
    FormsModule,
    QueriesModule,
    SeedModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: InternalAuthGuard }],
})
export class AppModule {}
