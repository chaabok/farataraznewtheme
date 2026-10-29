import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { IdGenerationModule } from "../id-generation/id-generation.module";
import { DetailCodeAssignmentModule } from "../detail-code-assignment/detail-code-assignment.module";
import { ProjectController } from "./project.controller";
import { ProjectService } from "./project.service";

/**
 * ProjectModule — Task 147: فرم «تعریف پروژه» (اطلاعات تفصیلی ها).
 * کد سریالی سرور (nextSerialCode) + تخصیص کد تفصیل از DetailCodeAssignmentModule
 * (متد اختصاصی Task 146 — تک‌مرجع؛ formKey "project" ← نوع تفصیل «پروژه» کد ۸).
 */
@Module({
  imports: [PrismaModule, IdGenerationModule, DetailCodeAssignmentModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
