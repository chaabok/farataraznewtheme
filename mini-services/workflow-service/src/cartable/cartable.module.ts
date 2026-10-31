import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { IdGenerationModule } from "../id-generation/id-generation.module";
import { CartableController } from "./cartable.controller";
import { CartableService } from "./cartable.service";
import { CartableSlaTimer } from "./cartable-sla.timer";

@Module({
  imports: [PrismaModule, IdGenerationModule],
  controllers: [CartableController],
  providers: [CartableService, CartableSlaTimer],
  exports: [CartableService],
})
export class CartableModule {}
