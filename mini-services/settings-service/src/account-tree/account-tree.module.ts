import { Module } from "@nestjs/common";
import { AccountTreeController } from "./account-tree.controller";
import { AccountTreeService } from "./account-tree.service";

/**
 * AccountTreeModule — Task 140: فرم «درختواره حسابها» (نرم‌افزار «حسابداری»
 * ← زیرمنوی «اطلاعات پایه») با کامپوننت SimpleTreeForm. ماژول NestJS با CRUD
 * کامل درخت ۴ سطحی + سطوح تفصیلی + تعدیل ماهیت + شرح‌های پرتکرار + کاربران
 * مجاز؛ محافظت‌شده با InternalAuthGuard سراسری (فقط BFF امضاشده می‌رسد؛
 * مسیر مرورگر: /api/settings/account-tree/**).
 */
@Module({
  controllers: [AccountTreeController],
  providers: [AccountTreeService],
  exports: [AccountTreeService],
})
export class AccountTreeModule {}
