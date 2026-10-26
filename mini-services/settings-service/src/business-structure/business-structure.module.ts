import { Module } from "@nestjs/common";
import { BusinessStructureController } from "./business-structure.controller";
import { BusinessStructureService } from "./business-structure.service";
import { DetailTypeModule } from "../detail-type/detail-type.module";

/**
 * Task 122 — DetailTypeModule وارد شد: BusinessStructureService پس از
 * ایجاد شاخهٔ هلدینگ/شرکت بدون تیک «داده‌های مشترک دفتر مرکزی»، ۲۱ آیتم
 * مرجع «نوع تفصیل» را برای همان شاخه seed می‌کند (قاعدهٔ مالک).
 */
@Module({
  imports: [DetailTypeModule],
  controllers: [BusinessStructureController],
  providers: [BusinessStructureService],
  exports: [BusinessStructureService],
})
export class BusinessStructureModule {}
