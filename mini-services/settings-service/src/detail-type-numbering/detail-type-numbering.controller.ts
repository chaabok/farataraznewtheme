import { Body, Controller, Get, Param, ParseIntPipe, Put, Query } from "@nestjs/common";
import { DetailTypeNumberingService } from "./detail-type-numbering.service";
import { UpdateDetailTypeNumberingDto } from "./detail-type-numbering.dto";

/**
 * DetailTypeNumbering — Task 131 (درخواست مالک): فرم «شماره گذاری تفصیلی ها»
 * (نرم‌افزار «حسابداری» ← زیرمنوی «اطلاعات پایه»، کامپوننت MainDataGrid).
 * GET /detail-type-numbering      — فهرست join‌شده + backfill خودکار بازه‌ها
 * PUT /detail-type-numbering/:id  — ویرایش بازه/پرچم‌ها با کنترل تداخل ۴۰۹
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/detail-type-numbering/**).
 */
@Controller("detail-type-numbering")
export class DetailTypeNumberingController {
  constructor(private readonly numbering: DetailTypeNumberingService) {}

  @Get()
  list(
    @Query("structureId") structureId?: string,
    @Query("headOfficeShares") headOfficeShares?: string,
  ) {
    /* قرارداد اشتراک دادهٔ واحد (Task 122) — عین detail-type */
    const sid = Number(structureId);
    return this.numbering.list({
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
      headOfficeShares: headOfficeShares === "true",
    });
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateDetailTypeNumberingDto) {
    return this.numbering.update(id, dto);
  }
}
