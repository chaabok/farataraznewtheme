import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { ContractService } from "./contract.service";
import { UpsertContractDto } from "./contract.dto";

/**
 * Contract — Task 148 (درخواست مالک): فرم «قرارداد جدید»
 * (نرم‌افزار «حسابداری» ← زیرمنوی «اطلاعات تفصیلی ها»).
 * GET    /contracts       — فهرست قراردادها (join DetailItem + Party + Project)
 * POST   /contracts       — ثبت جدید (کد تفصیلی با متد اختصاصی — عین پروژه)
 * PUT    /contracts/:id   — ویرایش
 * DELETE /contracts/:id   — حذف (پروفایل + ردیف تفصیلی، اتمی)
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/contracts/**).
 */
@Controller("contracts")
export class ContractController {
  constructor(private readonly contracts: ContractService) {}

  @Get()
  list(
    @Query("structureId") structureId?: string,
    @Query("headOfficeShares") headOfficeShares?: string,
  ) {
    const sid = Number(structureId);
    return this.contracts.list({
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
      headOfficeShares: headOfficeShares === "true",
    });
  }

  @Post()
  create(@Body() dto: UpsertContractDto) {
    return this.contracts.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertContractDto) {
    return this.contracts.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.contracts.remove(id);
  }
}
