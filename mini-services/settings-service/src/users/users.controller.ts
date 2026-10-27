import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpsertUserDto } from "./users.dto";

/**
 * User — Task 126: فرم «کاربر جدید» (تنظیمات ← مدیریت کاربران).
 * GET    /user                     — فهرست کاربران (قرارداد اشتراک: structureId + headOfficeShares)
 * POST   /user                     — ثبت کاربر (دفتر مرکزی + هر هلدینگ/شرکتِ بدون تیکِ داده مشترک)
 * PUT    /user/:id                 — ویرایش یک ردیف (درختوارهٔ دسترسی تراکنشی بازنویسی می‌شود)
 * DELETE /user/:id                 — حذف (ردیف‌های دسترسی با Cascade)
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/user/**).
 */
@Controller("user")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(
    @Query("structureId") structureId?: string,
    @Query("headOfficeShares") headOfficeShares?: string,
  ) {
    return this.users.list({
      structureId: structureId != null && structureId !== "" ? Number(structureId) : undefined,
      headOfficeShares: headOfficeShares === "true",
    });
  }

  @Post()
  create(@Body() dto: UpsertUserDto) {
    return this.users.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertUserDto) {
    return this.users.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.users.remove(id);
  }
}
