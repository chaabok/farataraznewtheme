import { Module } from "@nestjs/common";
import { DetailTypeController } from "./detail-type.controller";
import { DetailTypeService } from "./detail-type.service";

/**
 * DetailTypeModule — Task 120: فرم «نوع تفصیل جدید» (نرم‌افزار «حسابداری» ←
 * زیرمنوی «اطلاعات پایه»). ماژول NestJS با CRUD کامل؛ محافظت‌شده با
 * InternalAuthGuard سراسری (فقط BFF امضاشده می‌رسد؛ مسیر مرورگر:
 * /api/settings/detail-type/**).
 */
@Module({
  controllers: [DetailTypeController],
  providers: [DetailTypeService],
})
export class DetailTypeModule {}
