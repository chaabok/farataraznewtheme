import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { IdGenerationModule } from "../id-generation/id-generation.module";
import { DetailCodeAssignmentModule } from "../detail-code-assignment/detail-code-assignment.module";
import { CostCenterController } from "./cost-center.controller";
import { CostCenterService } from "./cost-center.service";

/**
 * CostCenterModule — Task 146: فرم «مرکز هزینه جدید» (اطلاعات تفصیلی ها).
 * تخصیص کد تفصیل از DetailCodeAssignmentModule (متد اختصاصی — تک‌مرجع).
 */
@Module({
  imports: [PrismaModule, IdGenerationModule, DetailCodeAssignmentModule],
  controllers: [CostCenterController],
  providers: [CostCenterService],
})
export class CostCenterModule {}
