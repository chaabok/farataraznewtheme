import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { IdGenerationModule } from "../id-generation/id-generation.module";
import { VoucherController } from "./voucher.controller";
import { VoucherService } from "./voucher.service";

/**
 * VoucherModule — Task 158: فرم «سند حسابداری جدید» (سرشاخهٔ اسناد با
 * ۳ بخش هدر/اقلام/فوتر). وابستگی‌ها: Prisma + IDGeneration (§16 دستی).
 */
@Module({
  imports: [PrismaModule, IdGenerationModule],
  controllers: [VoucherController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
