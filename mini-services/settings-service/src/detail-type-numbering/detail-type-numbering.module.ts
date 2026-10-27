import { Module } from "@nestjs/common";
import { DetailTypeNumberingController } from "./detail-type-numbering.controller";
import { DetailTypeNumberingService } from "./detail-type-numbering.service";

/**
 * DetailTypeNumberingModule — Task 131: فرم «شماره گذاری تفصیلی ها»
 * (حسابداری ← اطلاعات پایه). Prisma/IdGeneration از PrismaModule سراسری
 * تامین می‌شوند؛ تخصیص خودکار تابع آزادِ allocate.ts است (بدون وابستگی
 * حلقوی به DetailTypeModule).
 */
@Module({
  controllers: [DetailTypeNumberingController],
  providers: [DetailTypeNumberingService],
})
export class DetailTypeNumberingModule {}
