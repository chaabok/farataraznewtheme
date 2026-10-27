import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { IdGenerationModule } from "../id-generation/id-generation.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

/**
 * UsersModule — Task 126: فرم «کاربر جدید» (تنظیمات ← مدیریت کاربران) با
 * SimpleTreeForm؛ مدل‌های User + UserAccess (§2.7 PK=نام‌جدول+ID، bigint).
 */
@Module({
  imports: [PrismaModule, IdGenerationModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
