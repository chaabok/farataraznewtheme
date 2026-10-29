import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { CostCenterService } from "./cost-center.service";
import { UpsertCostCenterDto } from "./cost-center.dto";

/**
 * CostCenter — Task 146 (درخواست مالک): فرم «مرکز هزینه جدید»
 * (نرم‌افزار «حسابداری» ← زیرمنوی «اطلاعات تفصیلی ها»).
 * GET    /cost-centers     — فهرست مراکز هزینه (join DetailItem + نوع تفصیل)
 * POST   /cost-centers     — ثبت جدید (کد تفصیل با متد اختصاصی تخصیص می‌یابد)
 * PUT    /cost-centers/:id — ویرایش (همان قوانین، خود رکورد مستثنا)
 * DELETE /cost-centers/:id — حذف (پروفایل + ردیف تفصیلی، اتمی)
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/cost-centers/**).
 */
@Controller("cost-centers")
export class CostCenterController {
  constructor(private readonly costCenters: CostCenterService) {}

  @Get()
  list(
    @Query("structureId") structureId?: string,
    @Query("headOfficeShares") headOfficeShares?: string,
  ) {
    const sid = Number(structureId);
    return this.costCenters.list({
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
      headOfficeShares: headOfficeShares === "true",
    });
  }

  @Post()
  create(@Body() dto: UpsertCostCenterDto) {
    return this.costCenters.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertCostCenterDto) {
    return this.costCenters.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.costCenters.remove(id);
  }
}
