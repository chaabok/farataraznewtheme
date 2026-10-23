import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AppRegistryController } from "./app-registry.controller";
import { AppRegistryService } from "./app-registry.service";

@Module({
  imports: [PrismaModule],
  controllers: [AppRegistryController],
  providers: [AppRegistryService],
  exports: [AppRegistryService],
})
export class AppRegistryModule {}
