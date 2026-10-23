import { Module, Global } from "@nestjs/common";
import { IdGenerationService } from "./id-generation.service";

@Global()
@Module({
  providers: [IdGenerationService],
  exports: [IdGenerationService],
})
export class IdGenerationModule {}
