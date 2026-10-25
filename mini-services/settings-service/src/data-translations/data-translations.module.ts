import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { IdGenerationModule } from "../id-generation/id-generation.module";
import { DataTranslationsController } from "./data-translations.controller";
import { DataTranslationsService } from "./data-translations.service";

@Module({
  imports: [PrismaModule, IdGenerationModule],
  controllers: [DataTranslationsController],
  providers: [DataTranslationsService],
})
export class DataTranslationsModule {}
