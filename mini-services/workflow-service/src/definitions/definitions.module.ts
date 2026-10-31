import { Module } from "@nestjs/common";
import { IdGenerationModule } from "../id-generation/id-generation.module";
import { DefinitionsController } from "./definitions.controller";
import { DefinitionsService } from "./definitions.service";

/** t180 فاز ۴ — DefinitionsModule به IdGeneration نیاز دارد (ساخت گره/گذار در تراکنش طراح). */
@Module({
  imports: [IdGenerationModule],
  controllers: [DefinitionsController],
  providers: [DefinitionsService],
  exports: [DefinitionsService],
})
export class DefinitionsModule {}
