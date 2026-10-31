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
import { CartableService } from "./cartable.service";
import type {
  CreateDelegationDto,
  MarkReadDto,
  SlaCheckDto,
  UpdateDelegationDto,
} from "./cartable.dto";

/**
 * CartableController — کارتابل گردش کار (t179 فاز ۳).
 * همهٔ مسیرها userId صریح می‌گیرند (هم‌الگوی t178 — BFF کاربر جاری را از
 * auth می‌داند؛ موتور هم مستقل راستی‌آزمایی می‌کند).
 */
@Controller("workflow-cartable")
export class CartableController {
  constructor(private readonly cartable: CartableService) {}

  /** بج زنگولهٔ نوار وظیفه */
  @Get("summary")
  summary(@Query("userId") userId: string) {
    return this.cartable.summary(userId ?? "");
  }

  /** گام‌های در انتظار اقدام من */
  @Get("tasks")
  tasks(@Query("userId") userId: string) {
    return this.cartable.tasks(userId ?? "");
  }

  /** آغازشده‌های من */
  @Get("started")
  started(@Query("userId") userId: string) {
    return this.cartable.started(userId ?? "");
  }

  /** ابلاغ‌های من */
  @Get("notifications")
  notifications(@Query("userId") userId: string) {
    return this.cartable.notifications(userId ?? "");
  }

  /** علامت‌گذاری ابلاغ‌ها به خوانده‌شده */
  @Post("notifications/read")
  markRead(@Body() dto: MarkReadDto) {
    return this.cartable.markRead(dto);
  }

  /** تاریخچهٔ اقدام‌های من */
  @Get("actions")
  myActions(@Query("userId") userId: string) {
    return this.cartable.myActions(userId ?? "");
  }

  /** اجرای دستی بررسی SLA (تایمر داخلی هر ۵ دقیقه هم اجرا می‌کند) */
  @Post("sla-check")
  slaCheck(@Body() dto: SlaCheckDto) {
    return this.cartable.runSlaCheck(dto ?? {});
  }

  /* -------- تفویض (FR-09) -------- */

  @Get("delegations")
  listDelegations(@Query("userId") userId: string, @Query("direction") direction?: string) {
    return this.cartable.listDelegations(userId ?? "", direction ?? "all");
  }

  @Post("delegations")
  createDelegation(@Body() dto: CreateDelegationDto) {
    return this.cartable.createDelegation(dto);
  }

  @Put("delegations/:id")
  updateDelegation(
    @Param("id", ParseIntPipe) id: number,
    @Query("userId") userId: string,
    @Body() dto: UpdateDelegationDto,
  ) {
    return this.cartable.updateDelegation(id, userId ?? "", dto);
  }

  @Delete("delegations/:id")
  removeDelegation(@Param("id", ParseIntPipe) id: number, @Query("userId") userId: string) {
    return this.cartable.removeDelegation(id, userId ?? "");
  }
}
