import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { InstancesService } from "./instances.service";
import { EngineKeyGuard } from "../../../_shared/engine-auth";
import type { StartInstanceDto, ActDto, UndoFinalDto, RegisterDependencyDto } from "./instances.dto";

@Controller("workflow-instances")
export class InstancesController {
  constructor(private readonly instances: InstancesService) {}

  /** مسیرهای ثابت پیش از :id (ترتیب مسیریابی NestJS). */
  @Get("lock")
  lock(@Query("entityType") entityType: string, @Query("entityId") entityId: string) {
    return this.instances.lock(entityType, entityId);
  }

  @Get()
  list(
    @Query("entityType") entityType?: string,
    @Query("entityId") entityId?: string,
    @Query("state") state?: string,
    @Query("startedBy") startedBy?: string,
  ) {
    return this.instances.list({ entityType, entityId, state, startedBy });
  }

  @Get(":id")
  detail(@Param("id", ParseIntPipe) id: number) {
    return this.instances.detail(BigInt(id));
  }

  /** شروع چرخه — «ارسال به رسیدگی / ارسال به گردش کار» (D-3) */
  @Post()
  start(@Body() dto: StartInstanceDto) {
    return this.instances.start(dto);
  }

  /** اقدام استاندارد روی گام جاری — تایید / رد / ابطال (FR-04/05/13) */
  @Post(":id/act")
  act(@Param("id", ParseIntPipe) id: number, @Body() dto: ActDto) {
    return this.instances.act(id, dto);
  }

  /** واگرد تایید نهایی — فقط تا پیش از اقدام آتی (D-5 — t178) */
  @Post(":id/undo-final")
  undoFinal(@Param("id", ParseIntPipe) id: number, @Body() dto: UndoFinalDto) {
    return this.instances.undoFinal(id, dto);
  }

  /** ثبت اقدام آتی در دفتر وابستگی واگرد (فقط-موتور — t178) */
  @Post(":id/dependencies")
  @UseGuards(EngineKeyGuard)
  registerDependency(@Param("id", ParseIntPipe) id: number, @Body() dto: RegisterDependencyDto) {
    return this.instances.registerDependency(id, dto);
  }
}
