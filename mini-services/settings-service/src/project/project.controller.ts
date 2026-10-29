import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { UpsertProjectDto } from "./project.dto";

/**
 * Project — Task 147 (درخواست مالک): فرم «تعریف پروژه»
 * (نرم‌افزار «حسابداری» ← زیرمنوی «اطلاعات تفصیلی ها»).
 * GET    /projects            — فهرست پروژه ها (join DetailItem + نوع تفصیل)
 * GET    /projects/next-code  — کد سریالی بعدی (لایو ایجکس فرم — «بصورت
 *                               سریالی و پشت سرهم» بنا به فرمان مالک)
 * POST   /projects            — ثبت جدید (کد سریالی + کد تفصیل با متد اختصاصی)
 * PUT    /projects/:id        — ویرایش (کد سریالی تغییرناپذیر)
 * DELETE /projects/:id        — حذف (پروفایل + ردیف تفصیلی، اتمی)
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/projects/**).
 */
@Controller("projects")
export class ProjectController {
  constructor(private readonly projects: ProjectService) {}

  @Get()
  list(
    @Query("structureId") structureId?: string,
    @Query("headOfficeShares") headOfficeShares?: string,
  ) {
    const sid = Number(structureId);
    return this.projects.list({
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
      headOfficeShares: headOfficeShares === "true",
    });
  }

  @Get("next-code")
  nextCode(@Query("structureId") structureId?: string) {
    const sid = Number(structureId);
    return this.projects.nextCode({
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
    });
  }

  @Post()
  create(@Body() dto: UpsertProjectDto) {
    return this.projects.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.projects.remove(id);
  }
}
