import { Module } from "@nestjs/common";
import { DetailItemController } from "./detail-item.controller";
import { DetailItemService } from "./detail-item.service";

/**
 * DetailItemModule — سرویس مشترک رکورد تفصیلی (Task 144؛ اصلاح Task 174:
 * فرم عمومی «ایجاد تفصیلی ها» بطور کامل حذف شد ولی endpointها مشترک‌اند و
 * باقی‌اند: تفصیلی سایر (Task 154) با همین CRUD/next-code/other-category
 * کار می‌کند و متای فرم سند (vouchers/meta) و فرم‌های تخصصی
 * مرکز هزینه/پروژه/قرارداد به دادهٔ همین جدول تکیه دارند؛ حذف ماژول یا
 * جدول DetailItem تفصیلی سایر و تفصیلی اسناد را می‌شکند). ماژول NestJS با
 * CRUD کامل + پیشنهاد کد خودکار از بازهٔ شماره‌گذاری (Task 131)؛
 * محافظت‌شده با InternalAuthGuard سراسری
 * (فقط BFF امضاشده می‌رسد؛ مسیر مرورگر: /api/settings/detail-items/**).
 */
@Module({
  controllers: [DetailItemController],
  providers: [DetailItemService],
  exports: [DetailItemService],
})
export class DetailItemModule {}
