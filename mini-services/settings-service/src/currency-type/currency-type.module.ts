import { Module } from "@nestjs/common";
import { CurrencyTypeController } from "./currency-type.controller";
import { CurrencyTypeService } from "./currency-type.service";

@Module({
  controllers: [CurrencyTypeController],
  providers: [CurrencyTypeService],
})
export class CurrencyTypeModule {}
