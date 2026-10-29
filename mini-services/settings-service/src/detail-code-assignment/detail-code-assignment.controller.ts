import { Controller, Get, Query } from "@nestjs/common";
import { DetailCodeAssignmentService } from "./detail-code-assignment.service";

/**
 * DetailCodeAssignment — Task 146 (درخواست مالک): «متد اختصاصی تخصیص کد
 * تفصیل» به فرم‌های پایهٔ حساب‌های تفصیلی (مثل مرکز هزینه) بصورت لایو ایجکس.
 *
 * GET /detail-code/allocate?form=cost-center&structureId=&headOfficeShares=
 *   → پیشنهاد کد تفصیل بر پایهٔ نوع تفصیل (فرم نوع تفصیلی) + گرهٔ فعال ساختار
 *     کسب و کار + بازهٔ شماره شروع/شماره پایان (فرم شماره‌گذاری تفصیلی ها).
 *     mode:"automatic" ⇒ code آماده (فیلد فرم فقط‌خواندنی)؛ mode:"manual" ⇒
 *     فیلد باز با اعتبارسنجی درون‌بازه؛ exhausted ⇒ بازهٔ تازه لازم است.
 *
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/detail-code/**).
 */
@Controller("detail-code")
export class DetailCodeAssignmentController {
  constructor(private readonly assignment: DetailCodeAssignmentService) {}

  @Get("allocate")
  allocate(
    @Query("form") form?: string,
    @Query("structureId") structureId?: string,
    @Query("headOfficeShares") headOfficeShares?: string,
  ) {
    const sid = Number(structureId);
    return this.assignment.nextDetailCode({
      formKey: (form ?? "").trim(),
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
      headOfficeShares: headOfficeShares === "true",
    });
  }
}
