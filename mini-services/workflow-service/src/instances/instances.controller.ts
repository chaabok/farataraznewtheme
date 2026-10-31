import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { InstancesService } from "./instances.service";
import type { StartInstanceDto, ActDto } from "./instances.dto";

@Controller("workflow-instances")
export class InstancesController {
  constructor(private readonly instances: InstancesService) {}

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
}
