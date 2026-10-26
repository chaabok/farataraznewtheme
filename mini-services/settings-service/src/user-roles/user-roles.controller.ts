import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { UserRolesService } from "./user-roles.service";
import { UpsertUserRoleDto } from "./user-roles.dto";

/**
 * UserRole — Task 100: فرم «نقش کاربری جدید» (تنظیمات ← مدیریت کاربران).
 * GET    /user-role       — فهرست نقش‌ها با محدودهٔ دسترسی هرکدام
 * POST   /user-role       — ثبت نقش جدید (کد/عنوان + محدودهٔ نرم‌افزاری/سازمانی)
 * PUT    /user-role/:id   — ویرایش (محدوده به‌صورت تراکنشی بازنویسی می‌شود)
 * DELETE /user-role/:id   — حذف (نقش سیستمی رد می‌شود — 403)
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/user-role/**).
 */
@Controller("user-role")
export class UserRolesController {
  constructor(private readonly userRoles: UserRolesService) {}

  @Get()
  list() {
    return this.userRoles.list();
  }

  @Post()
  create(@Body() dto: UpsertUserRoleDto) {
    return this.userRoles.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertUserRoleDto) {
    return this.userRoles.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.userRoles.remove(id);
  }
}
