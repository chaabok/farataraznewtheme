import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { IdGenerationModule } from "../id-generation/id-generation.module";
import { DetailCodeAssignmentModule } from "../detail-code-assignment/detail-code-assignment.module";
import { ContractController } from "./contract.controller";
import { ContractService } from "./contract.service";

/**
 * ContractModule — Task 148: فرم «قرارداد جدید» (اطلاعات تفصیلی ها).
 * تخصیص کد تفصیلی از DetailCodeAssignmentModule (متد اختصاصی Task 146 —
 * تک‌مرجع؛ formKey "contract" ← نوع تفصیل «قرارداد» کد مرجع ۹) — دقیقاً
 * همانند قرارداد فرم پروژه (Task 147).
 */
@Module({
  imports: [PrismaModule, IdGenerationModule, DetailCodeAssignmentModule],
  controllers: [ContractController],
  providers: [ContractService],
})
export class ContractModule {}
