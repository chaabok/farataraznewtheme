import { Module } from "@nestjs/common";
import { DetailTypeController } from "./detail-type.controller";
import { DetailTypeService } from "./detail-type.service";

/**
 * DetailTypeModule — Task 120: فرم «نوع تفصیل جدید» (نرم‌افزار «حسابداری» ←
 * زیرمنوی «اطلاعات پایه»). ماژول NestJS با CRUD کامل؛ محافظت‌شده با
 * InternalAuthGuard سراسری (فقط BFF امضاشده می‌رسد؛ مسیر مرورگر:
 * /api/settings/detail-type/**).
 * Task 122: DetailTypeService export شد تا BusinessStructureService بعد از
 * ایجاد شاخهٔ هلدینگ/شرکت بدون تیک مشترک، ۲۱ آیتم مرجع را برای همان شاخه
 * بسازد (قاعدهٔ مالک).
 */
@Module({
  controllers: [DetailTypeController],
  providers: [DetailTypeService],
  exports: [DetailTypeService],
})
export class DetailTypeModule {}
