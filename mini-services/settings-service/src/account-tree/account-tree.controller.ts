import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { AccountTreeService } from "./account-tree.service";
import { AssignDetailTypeDto, SaveAccountNodeDto } from "./account-tree.dto";

/**
 * AccountTree — Task 140 (درخواست مالک): فرم «درختواره حسابها»
 * (نرم‌افزار «حسابداری» ← زیرمنوی «اطلاعات پایه»).
 * GET    /account-tree                      — فهرست تخت گره‌ها
 * GET    /account-tree/:id                  — جزئیات کامل گره (+config)
 * POST   /account-tree                      — ثبت گره تازه
 * PUT    /account-tree/:id                  — ویرایش گره (+بازنویسی مجموعه‌ها)
 * DELETE /account-tree/:id                  — حذف گره (با فرزند رد می‌شود)
 * POST   /account-tree/:id/detail-types     — انتساب نوع تفصیلی به سطح
 * DELETE /account-tree/:id/detail-types/:aid — حذف انتساب
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/account-tree/**).
 */
@Controller("account-tree")
export class AccountTreeController {
  constructor(private readonly accountTree: AccountTreeService) {}

  @Get()
  list() {
    return this.accountTree.list();
  }

  @Get(":id")
  detail(@Param("id", ParseIntPipe) id: number) {
    return this.accountTree.detail(id);
  }

  @Post()
  create(@Body() dto: SaveAccountNodeDto) {
    return this.accountTree.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: SaveAccountNodeDto) {
    return this.accountTree.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.accountTree.remove(id);
  }

  @Post(":id/detail-types")
  assignDetailType(@Param("id", ParseIntPipe) id: number, @Body() dto: AssignDetailTypeDto) {
    return this.accountTree.assignDetailType(id, dto);
  }

  @Delete(":id/detail-types/:assignmentId")
  removeDetailType(
    @Param("id", ParseIntPipe) id: number,
    @Param("assignmentId", ParseIntPipe) assignmentId: number,
  ) {
    return this.accountTree.removeDetailType(id, assignmentId);
  }
}
