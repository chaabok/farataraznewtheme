import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { IdGenerationModule } from "../id-generation/id-generation.module";
import { DetailCodeAssignmentController } from "./detail-code-assignment.controller";
import { DetailCodeAssignmentService } from "./detail-code-assignment.service";

/**
 * DetailCodeAssignmentModule — Task 146: «متد اختصاصی تخصیص کد تفصیل» به
 * فرم‌های پایهٔ حساب‌های تفصیلی (مرکز هزینه و آینده‌ها). Service برای مصرف
 * سرویس‌های فرم‌های تفصیلی (cost-center و …) export می‌شود.
 */
@Module({
  imports: [PrismaModule, IdGenerationModule],
  controllers: [DetailCodeAssignmentController],
  providers: [DetailCodeAssignmentService],
  exports: [DetailCodeAssignmentService],
})
export class DetailCodeAssignmentModule {}
