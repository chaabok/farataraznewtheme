import { Module } from "@nestjs/common";
import { DetailItemController } from "./detail-item.controller";
import { DetailItemService } from "./detail-item.service";

/**
 * DetailItemModule — Task 144: فرم «ایجاد تفصیلی ها» (نرم‌افزار «حسابداری» ←
 * زیرمنوی «اطلاعات پایه»). ماژول NestJS با CRUD کامل + پیشنهاد کد خودکار از
 * بازهٔ شماره‌گذاری (Task 131)؛ محافظت‌شده با InternalAuthGuard سراسری
 * (فقط BFF امضاشده می‌رسد؛ مسیر مرورگر: /api/settings/detail-items/**).
 */
@Module({
  controllers: [DetailItemController],
  providers: [DetailItemService],
  exports: [DetailItemService],
})
export class DetailItemModule {}
