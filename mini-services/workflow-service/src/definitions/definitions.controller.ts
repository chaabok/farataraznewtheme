import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { DefinitionsService } from "./definitions.service";
import type {
  CreateDefinitionDto,
  UpdateDefinitionMetaDto,
  TerminateDefinitionDto,
  SaveGraphDto,
  SaveLayoutDto,
  SaveConditionsDto,
} from "./definitions.dto";

/**
 * DefinitionsController — t180 فاز ۴: طراح بصری فرآیند.
 * GET = خواندن (فاز ۱) · POST/PUT/DELETE = نگارش دیاگرام، نسخه‌بندی و فعال‌سازی.
 */
@Controller("workflow-definitions")
export class DefinitionsController {
  constructor(private readonly defs: DefinitionsService) {}

  @Get()
  list(@Query("entityType") entityType?: string) {
    return this.defs.list(entityType);
  }

  @Post()
  create(@Body() dto: CreateDefinitionDto) {
    return this.defs.create(dto);
  }

  @Get(":id")
  getOne(@Param("id", ParseIntPipe) id: number) {
    return this.defs.getOne(BigInt(id));
  }

  @Put(":id")
  updateMeta(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateDefinitionMetaDto) {
    return this.defs.updateMeta(BigInt(id), dto);
  }

  /* t190 — خاتمهٔ فرآیند: مودالِ تاریخ (پیش‌فرض امروز) + توضیحات، با تأیید کاربر */
  @Put(":id/terminate")
  terminate(@Param("id", ParseIntPipe) id: number, @Body() dto: TerminateDefinitionDto) {
    return this.defs.terminate(BigInt(id), dto);
  }

  /* t190 — برگشت خاتمه: قید خاتمه پاک می‌شود و فیلدها آزاد می‌شوند */
  @Put(":id/reinstate")
  reinstate(@Param("id", ParseIntPipe) id: number) {
    return this.defs.reinstate(BigInt(id));
  }

  /* t191 — شرط‌های ورود (فیلترها): جایگزینی کامل با اعتبارسنجی فیلد/عملگر/اتصال */
  @Put(":id/conditions")
  saveConditions(@Param("id", ParseIntPipe) id: number, @Body() dto: SaveConditionsDto) {
    return this.defs.saveConditions(BigInt(id), dto);
  }

  @Put(":id/layout")
  saveLayout(@Param("id", ParseIntPipe) id: number, @Body() dto: SaveLayoutDto) {
    return this.defs.saveLayout(BigInt(id), dto);
  }

  @Put(":id/graph")
  saveGraph(@Param("id", ParseIntPipe) id: number, @Body() dto: SaveGraphDto) {
    return this.defs.saveGraph(BigInt(id), dto);
  }

  @Post(":id/versions")
  createNewVersion(@Param("id", ParseIntPipe) id: number) {
    return this.defs.createNewVersion(BigInt(id));
  }

  @Post(":id/activate")
  activate(@Param("id", ParseIntPipe) id: number) {
    return this.defs.activate(BigInt(id));
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.defs.remove(BigInt(id));
  }
}
