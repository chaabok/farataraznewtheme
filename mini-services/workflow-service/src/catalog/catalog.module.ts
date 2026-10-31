import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";

/** t180 فاز ۴ — کاتالوگ فرم‌های مشارکت‌کننده در گردش کار (انتخاب کاربر). */
@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
