import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { InternalAuthGuard } from "../../_shared/internal-auth";
import { AppsModule } from "./apps/apps.module";

@Module({
  imports: [AppsModule],
  providers: [{ provide: APP_GUARD, useClass: InternalAuthGuard }],
})
export class AppModule {}
