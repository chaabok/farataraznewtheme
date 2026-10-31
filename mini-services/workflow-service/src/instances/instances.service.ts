import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { DefinitionsService } from "../definitions/definitions.service";
import { EntityLinkService } from "../entity-link/entity-link.service";
import { HEAD_OFFICE_NODE_ID } from "../../../_shared/app-base-entity";
import { Prisma } from "@prisma/client";
import type { StartInstanceDto, ActDto, UndoFinalDto, RegisterDependencyDto } from "./instances.dto";

type Tx = Prisma.TransactionClient;

/**
 * InstancesService — موتور حالت گردش کار (t177 فاز ۱ + t178 فاز ۲).
 *
 * ورود (D-3): فقط با وضعیت entry-gate («تایید کاربر») و اقدام آغازین
 * «ارسال به رسیدگی»؛ اسناد excluded («یادداشت») و pre-entry و engine-final
 * (تاییدشده/دائمی) رد می‌شوند (تصمیم‌های مالک D-3/D-7). از t178 وضعیت واقعی
 * سند از سرویس مالک (settings-service) خوانده می‌شود — «منبع حقیقت» — تا
 * ادعای فرمت قابل جعل نباشد.
 *
 * قفل هم‌زمانی (FR-06): برای هر سند حداکثر یک نمونهٔ running؛ اقدام فقط توسط
 * دارندهٔ سمتِ گرهٔ جاری (WorkflowRoleAssignment فعال و در بازه). endpoint
 * /lock برای قفل نرم سمت سرویس فرم (۴۲۳ روی PUT/DELETE سند در جریان).
 *
 * گذارها اتمی‌اند (یک تراکنش: جابجایی گره + تاریخچه + ابلاغ)؛ گرهٔ شرط خودکار
 * ارزیابی می‌شود (amount نسبت به آستانهٔ per فرم — D-2) تا گرهٔ پایان؛ وضعیت
 * پایانی سند از گرهٔ پایان فرآیند خوانده می‌شود (D-4) و از t178 روی سند
 * «نوشته» می‌شود (write-back فقط-موتور). رد = دلیل اجباری (FR-05)؛
 * ابطال = فقط آغازگر و با دلیل (FR-13). هیچ محدودیت دوره‌ای در ورود نیست (D-6).
 *
 * واگردِ تایید نهایی (D-5 — t178): نمونهٔ approved تا زمانی که «اقدام آتی» در
 * فرم‌های دیگر ثبت نشده واگردشدنی است؛ دفتر وابستگی (WorkflowDependency) با
 * endpoint فقط-موتور پر می‌شود و واگرد با وجود هر ردیفی ۴۰۹ می‌گیرد. واگرد
 * وضعیت سند را به گلوگاه ورود (۵) برمی‌گرداند تا ویرایش و ارسال مجدد ممکن شود.
 */

const STANDARD = {
  send: "ارسال به رسیدگی",
  approve: "تایید",
  reject: "رد",
  cancel: "ابطال",
} as const;

@Injectable()
export class InstancesService {
  private readonly logger = new Logger(InstancesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ids: IdGenerationService,
    private readonly defs: DefinitionsService,
    private readonly link: EntityLinkService,
  ) {}

  /* ------------------------------ شروع (ارسال به رسیدگی) ------------------------------ */

  async start(dto: StartInstanceDto) {
    const def = await this.defs.findActive(dto.entityType);

    /* منبع حقیقت گلوگاه ورود (D-3 — t178): وضعیت واقعی سند از سرویس مالک خوانده
       می‌شود؛ formStatus فقط زمانی معیار است که خواندن از منبع ممکن نباشد
       (fail-open مستند — دسترس‌ناپذیری سرویس فرم نباید همهٔ فرم‌ها را قفل کند). */
    let effectiveFormStatus = dto.formStatus;
    if (dto.entityType === "voucher") {
      const src = await this.link.getVoucherStatus(dto.entityId);
      if (src.ok && src.data && typeof src.data.status === "number") {
        effectiveFormStatus = src.data.status;
      } else if (dto.formStatus === undefined) {
        throw new BadRequestException(
          "خواندن وضعیت سند از سرویس مالک ناموفق بود — ورود به چرخهٔ رسیدگی رد شد",
        );
      } else {
        this.logger.warn(
          `منبع حقیقت در دسترس نبود (status=${src.status}) — اعتبارسنجی با formStatus اعلامی ادامه می‌یابد`,
        );
      }
    }

    // گلوگاه ورود (D-3) — وضعیت مؤثر (واقعی یا اعلامی)
    if (effectiveFormStatus !== undefined) {
      const map = await this.prisma.workflowStatusMap.findUnique({
        where: { entityType_formStatus: { entityType: dto.entityType, formStatus: effectiveFormStatus } },
      });
      if (!map) {
        throw new BadRequestException(
          `وضعیت ${effectiveFormStatus} برای entityType=${dto.entityType} در نگاشت گردش کار ثبت نشده است`,
        );
      }
      if (map.gateType === "excluded") {
        throw new BadRequestException(
          `اسناد با وضعیت «${map.description}» وارد چرخهٔ رسیدگی نمی‌شوند (تصمیم مالک D-3)`,
        );
      }
      if (map.gateType === "pre-entry") {
        throw new BadRequestException(
          `سند هنوز در وضعیت ورود («تایید کاربر») نیست — ابتدا سند را تایید کنید`,
        );
      }
      if (map.gateType === "engine-final") {
        throw new BadRequestException(
          `وضعیت ${effectiveFormStatus} فقط از مسیر موتور گردش کار قابل تنظیم است`,
        );
      }
    }

    // قفل هم‌زمانی (FR-06) — یک نمونهٔ فعال per سند
    const running = await this.prisma.workflowInstance.findFirst({
      where: { entityType: dto.entityType, entityId: dto.entityId, currentState: "running" },
    });
    if (running) {
      throw new BadRequestException(
        `برای این سند نمونهٔ فعال #${Number(running.workflowInstanceId)} وجود دارد — ابتدا آن را تکمیل یا ابطال کنید`,
      );
    }

    const nodes = await this.prisma.workflowNode.findMany({
      where: { definitionId: def.workflowDefinitionId },
    });
    const transitions = await this.prisma.workflowTransition.findMany({
      where: { definitionId: def.workflowDefinitionId },
    });
    const startNode = nodes.find((n) => n.nodeType === "start");
    if (!startNode) throw new BadRequestException("گرهٔ شروع در فرآیند تعریف نشده است");
    const firstTransition = transitions.find((t) => t.fromNodeId === startNode.workflowNodeId);
    if (!firstTransition) throw new BadRequestException("گذار خروجی گرهٔ شروع تعریف نشده است");
    const firstNode = nodes.find((n) => n.workflowNodeId === firstTransition.toNodeId);
    if (!firstNode) throw new BadRequestException("مقصد گذار گرهٔ شروع یافت نشد");

    const instanceId = await this.ids.generateNextId("WorkflowInstance");
    const created = await this.prisma.$transaction(async (tx) => {
      const inst = await tx.workflowInstance.create({
        data: {
          workflowInstanceId: BigInt(instanceId),
          definitionId: def.workflowDefinitionId,
          processVersion: def.processVersion,
          entityType: dto.entityType,
          entityId: dto.entityId,
          entityLabel: (dto.entityLabel ?? "").trim(),
          currentNodeId: firstNode.workflowNodeId,
          currentState: "running",
          startedBy: dto.startedBy.trim(),
          startedByName: (dto.startedByName ?? "").trim(),
          creator: dto.startedBy.trim() || "system",
          businessStructureRef: HEAD_OFFICE_NODE_ID,
        },
      });
      await this.logAction(tx, inst.workflowInstanceId, {
        fromNodeId: startNode.workflowNodeId,
        toNodeId: firstNode.workflowNodeId,
        action: firstTransition.action,
        actorId: dto.startedBy.trim(),
        actorName: (dto.startedByName ?? "").trim(),
        roleCode: "",
        comment: (dto.comment ?? "").trim(),
      });
      await this.notifyRole(tx, inst, firstNode);
      return inst;
    });

    return this.detail(created.workflowInstanceId);
  }

  /* ------------------------------ اقدام (تایید/رد/ابطال) ------------------------------ */

  async act(id: number, dto: ActDto) {
    const inst = await this.prisma.workflowInstance.findUnique({
      where: { workflowInstanceId: BigInt(id) },
    });
    if (!inst) throw new NotFoundException("نمونهٔ گردش کار یافت نشد");
    if (inst.currentState !== "running") {
      throw new BadRequestException(`نمونه در جریان نیست (وضعیت: ${inst.currentState})`);
    }
    const def = await this.prisma.workflowDefinition.findUnique({
      where: { workflowDefinitionId: inst.definitionId },
    });
    if (!def) throw new NotFoundException("فرآیند نمونه یافت نشد");
    const nodes = await this.prisma.workflowNode.findMany({
      where: { definitionId: inst.definitionId },
    });
    const transitions = await this.prisma.workflowTransition.findMany({
      where: { definitionId: inst.definitionId },
    });
    const currentNode = nodes.find((n) => n.workflowNodeId === inst.currentNodeId);
    if (!currentNode) throw new NotFoundException("گرهٔ جاری نمونه یافت نشد");

    const actorId = dto.actorId.trim();
    const actorName = (dto.actorName ?? "").trim();

    /* ابطال (FR-13 — پیش از تایید نهایی آزاد): فقط آغازگر، با دلیل */
    if (dto.action === STANDARD.cancel) {
      if (actorId !== inst.startedBy) {
        throw new ForbiddenException("فقط آغازگر گردش کار مجاز به ابطال نمونه است");
      }
      if (!(dto.comment ?? "").trim()) {
        throw new BadRequestException("ثبت دلیل برای ابطال الزامی است (FR-13)");
      }
      await this.prisma.$transaction(async (tx) => {
        await tx.workflowInstance.update({
          where: { workflowInstanceId: inst.workflowInstanceId },
          data: {
            currentState: "cancelled",
            finishedAt: new Date(),
            lastModifier: actorId,
          },
        });
        await this.logAction(tx, inst.workflowInstanceId, {
          fromNodeId: currentNode.workflowNodeId,
          toNodeId: 0n,
          action: STANDARD.cancel,
          actorId,
          actorName,
          roleCode: currentNode.roleCode,
          comment: (dto.comment ?? "").trim(),
        });
        await this.notifyUser(tx, inst, inst.startedBy, "گردش کار سند ابطال شد", actorName);
      });
      /* D-4/D-5 — ابطال ⇒ سند به گلوگاه ورود (۵) برمی‌گردد تا ویرایش و ارسال مجدد ممکن شود */
      await this.writeBackEntityStatus(inst.entityType, inst.entityId, 5, actorId);
      return this.detail(inst.workflowInstanceId);
    }

    /* تایید/رد — فقط دارندهٔ سمتِ گرهٔ جاری (FR-06) */
    if (currentNode.nodeType !== "action") {
      throw new BadRequestException("گرهٔ جاری قابل اقدام نیست");
    }
    const now = new Date();
    const hasRole = await this.prisma.workflowRoleAssignment.findFirst({
      where: {
        roleCode: currentNode.roleCode,
        userId: actorId,
        isActive: true,
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validTo: null }, { validTo: { gte: now } }] },
        ],
      },
    });
    if (!hasRole) {
      throw new ForbiddenException(
        `کاربر جاری دارندهٔ سمت «${currentNode.roleCode}» (گام جاری) نیست`,
      );
    }

    if (dto.action === STANDARD.reject) {
      if (!(dto.comment ?? "").trim()) {
        throw new BadRequestException("ثبت دلیل برای رد الزامی است (FR-05)");
      }
      const t = transitions.find(
        (x) => x.fromNodeId === currentNode.workflowNodeId && x.action === STANDARD.reject,
      );
      if (!t) throw new BadRequestException("از این گام گذار «رد» تعریف نشده است");
      const target = nodes.find((n) => n.workflowNodeId === t.toNodeId);
      if (!target) throw new NotFoundException("مقصد گذار رد یافت نشد");
      await this.prisma.$transaction(async (tx) => {
        await tx.workflowInstance.update({
          where: { workflowInstanceId: inst.workflowInstanceId },
          data: {
            currentNodeId: target.workflowNodeId,
            currentState: target.instanceState || "rejected",
            finishedAt: new Date(),
            finalStatus: target.finalStatus,
            lastModifier: actorId,
          },
        });
        await this.logAction(tx, inst.workflowInstanceId, {
          fromNodeId: currentNode.workflowNodeId,
          toNodeId: target.workflowNodeId,
          action: STANDARD.reject,
          actorId,
          actorName,
          roleCode: currentNode.roleCode,
          comment: (dto.comment ?? "").trim(),
        });
        await this.notifyUser(
          tx,
          inst,
          inst.startedBy,
          "سند بازگشت داده شد",
          `${actorName}: ${(dto.comment ?? "").trim()}`,
        );
      });
      /* D-4 — گرهٔ پایان رد (N7) وضعیت پایانی سند را تعیین می‌کند (۱ = ثبت اولیه) */
      await this.writeBackEntityStatus(inst.entityType, inst.entityId, target.finalStatus, actorId);
      return this.detail(inst.workflowInstanceId);
    }

    if (dto.action === STANDARD.approve) {
      const first = transitions.find(
        (x) => x.fromNodeId === currentNode.workflowNodeId && x.action === STANDARD.approve,
      );
      if (!first) throw new BadRequestException("از این گام گذار «تایید» تعریف نشده است");
      let target = nodes.find((n) => n.workflowNodeId === first.toNodeId);
      if (!target) throw new NotFoundException("مقصد گذار تایید یافت نشد");
      const hops: Array<{ fromId: bigint; toId: bigint; action: string }> = [
        { fromId: currentNode.workflowNodeId, toId: target.workflowNodeId, action: STANDARD.approve },
      ];
      /* گرهٔ شرط خودکار ارزیابی می‌شود (D-2) تا رسیدن به گرهٔ action یا پایان */
      let guard = 0;
      let walker = target;
      while (walker.nodeType === "condition" && guard++ < 10) {
        const outs = transitions.filter((x) => x.fromNodeId === walker.workflowNodeId);
        const chosen = this.pickConditionTransition(outs, {
          amount: dto.amount,
          threshold: def.thresholdAmount ?? undefined,
        });
        if (!chosen) throw new BadRequestException("هیچ گذار خروجی از گرهٔ شرط برآورده نشد");
        const next = nodes.find((n) => n.workflowNodeId === chosen.toNodeId);
        if (!next) throw new NotFoundException("مقصد گذار شرطی یافت نشد");
        hops.push({
          fromId: walker.workflowNodeId,
          toId: next.workflowNodeId,
          action: chosen.isDefault ? "خیر" : chosen.action || "بله",
        });
        walker = next;
      }
      target = walker;

      const finished = target.nodeType === "end";
      const instanceIdBig = inst.workflowInstanceId;
      await this.prisma.$transaction(async (tx) => {
        await tx.workflowInstance.update({
          where: { workflowInstanceId: instanceIdBig },
          data: {
            currentNodeId: target.workflowNodeId,
            ...(finished
              ? {
                  currentState: target.instanceState || "approved",
                  finishedAt: new Date(),
                  finalStatus: target.finalStatus,
                }
              : {}),
            lastModifier: actorId,
          },
        });
        for (const hop of hops) {
          await this.logAction(tx, instanceIdBig, {
            fromNodeId: hop.fromId,
            toNodeId: hop.toId,
            action: hop.action,
            actorId,
            actorName,
            roleCode: currentNode.roleCode,
            comment: (dto.comment ?? "").trim(),
          });
        }
        if (finished) {
          await this.notifyUser(
            tx,
            inst,
            inst.startedBy,
            "گردش کار سند به پایان رسید",
            `${actorName}: وضعیت پایانی سند بر اساس فرآیند اعمال شد (D-4)`,
          );
        } else {
          await this.notifyRole(tx, inst, target);
        }
      });
      /* D-4 — گرهٔ پایان موفق (N6) وضعیت پایانی سند را تعیین می‌کند (۳/۴) */
      if (finished) {
        await this.writeBackEntityStatus(inst.entityType, inst.entityId, target.finalStatus, actorId);
      }
      return this.detail(inst.workflowInstanceId);
    }

    throw new BadRequestException(
      `اقدام «${dto.action}» پشتیبانی نمی‌شود — اقدام‌های استاندارد: تایید / رد / ابطال`,
    );
  }

  /* ------------------- واگرد تایید نهایی (D-5 — t178 فاز ۲) ------------------- */

  /**
   * واگرد: فقط نمونهٔ approved و فقط تا پیش از ثبت «اقدام آتی» در فرم‌های دیگر.
   * دفتر وابستگی (WorkflowDependency) با endpoint فقط-موتور پر می‌شود؛ با وجود
   * هر ردیفی واگرد ۴۰۹ می‌گیرد. دلیل اجباری است و وضعیت سند به گلوگاه ورود (۵)
   * برمی‌گردد تا ویرایش و ارسال مجدد ممکن شود.
   */
  async undoFinal(id: number, dto: UndoFinalDto) {
    const inst = await this.prisma.workflowInstance.findUnique({
      where: { workflowInstanceId: BigInt(id) },
    });
    if (!inst) throw new NotFoundException("نمونهٔ گردش کار یافت نشد");
    if (inst.currentState !== "approved") {
      throw new BadRequestException("واگرد فقط برای نمونهٔ تاییدشدهٔ نهایی ممکن است (D-5)");
    }
    if (!(dto.comment ?? "").trim()) {
      throw new BadRequestException("ثبت دلیل برای واگرد الزامی است (D-5)");
    }
    const deps = await this.prisma.workflowDependency.findMany({
      where: { instanceId: inst.workflowInstanceId },
      orderBy: { workflowDependencyId: "asc" },
      take: 50,
    });
    if (deps.length > 0) {
      throw new ConflictException({
        statusCode: 409,
        message: `واگرد ممکن نیست — بر اساس این سند ${deps.length} اقدام آتی ثبت شده است (D-5)`,
        dependencies: deps.map((d) => ({
          id: Number(d.workflowDependencyId),
          entityType: d.dependentEntityType,
          entityId: d.dependentEntityId,
          label: d.dependentEntityLabel,
          registeredBy: d.registeredBy,
          createdAt: d.createdAt.toISOString(),
        })),
      });
    }
    const actorId = dto.actorId.trim();
    const actorName = (dto.actorName ?? "").trim();
    await this.prisma.$transaction(async (tx) => {
      await tx.workflowInstance.update({
        where: { workflowInstanceId: inst.workflowInstanceId },
        data: {
          currentState: "undone",
          finishedAt: new Date(),
          finalStatus: null,
          lastModifier: actorId,
        },
      });
      await this.logAction(tx, inst.workflowInstanceId, {
        fromNodeId: inst.currentNodeId,
        toNodeId: 0n,
        action: "واگرد",
        actorId,
        actorName,
        roleCode: "",
        comment: (dto.comment ?? "").trim(),
      });
      await this.notifyUser(
        tx,
        inst,
        inst.startedBy,
        "تایید نهایی سند واگرد شد",
        `${actorName}: ${(dto.comment ?? "").trim()}`,
      );
    });
    /* D-5 — بازگشت سند به گلوگاه ورود (۵ = تایید کاربر) */
    await this.writeBackEntityStatus(inst.entityType, inst.entityId, 5, actorId);
    return this.detail(inst.workflowInstanceId);
  }

  /** ثبت «اقدام آتی» بر اساس سند تاییدشده (فرم‌های مصرف‌کننده — فقط-موتور). */
  async registerDependency(id: number, dto: RegisterDependencyDto) {
    const inst = await this.prisma.workflowInstance.findUnique({
      where: { workflowInstanceId: BigInt(id) },
    });
    if (!inst) throw new NotFoundException("نمونهٔ گردش کار یافت نشد");
    if (inst.currentState !== "approved") {
      throw new BadRequestException("ثبت وابستگی فقط برای نمونهٔ تاییدشدهٔ نهایی معنا دارد");
    }
    const existing = await this.prisma.workflowDependency.findUnique({
      where: {
        instanceId_dependentEntityType_dependentEntityId: {
          instanceId: inst.workflowInstanceId,
          dependentEntityType: dto.dependentEntityType.trim(),
          dependentEntityId: dto.dependentEntityId.trim(),
        },
      },
    });
    if (existing) {
      return { id: Number(existing.workflowDependencyId), duplicate: true };
    }
    const depId = await this.ids.generateNextId("WorkflowDependency");
    const row = await this.prisma.workflowDependency.create({
      data: {
        workflowDependencyId: BigInt(depId),
        instanceId: inst.workflowInstanceId,
        dependentEntityType: dto.dependentEntityType.trim(),
        dependentEntityId: dto.dependentEntityId.trim(),
        dependentEntityLabel: (dto.dependentEntityLabel ?? "").trim(),
        registeredBy: (dto.registeredBy ?? "").trim(),
      },
    });
    return { id: Number(row.workflowDependencyId), duplicate: false };
  }

  /* ------------------------------ خواندن ------------------------------ */

  /** قفل نرم سند در جریان (FR-06) — سرویس فرم با این endpoint ویرایش را ۴۲۳ می‌کند. */
  async lock(entityType: string, entityId: string) {
    const row = await this.prisma.workflowInstance.findFirst({
      where: { entityType, entityId, currentState: "running" },
      select: { workflowInstanceId: true, currentNodeId: true },
    });
    return { locked: !!row, instanceId: row ? Number(row.workflowInstanceId) : null };
  }

  async list(query: {
    entityType?: string;
    entityId?: string;
    state?: string;
    startedBy?: string;
  }) {
    const rows = await this.prisma.workflowInstance.findMany({
      where: {
        ...(query.entityType ? { entityType: query.entityType } : {}),
        ...(query.entityId ? { entityId: query.entityId } : {}),
        ...(query.state ? { currentState: query.state } : {}),
        ...(query.startedBy ? { startedBy: query.startedBy } : {}),
      },
      orderBy: { workflowInstanceId: "desc" },
      take: 200,
    });
    const nodeIds = [...new Set(rows.map((r) => r.currentNodeId))];
    const nodes = nodeIds.length
      ? await this.prisma.workflowNode.findMany({ where: { workflowNodeId: { in: nodeIds } } })
      : [];
    const nodeTitle = new Map(nodes.map((n) => [n.workflowNodeId, n.title]));
    return {
      items: rows.map((r) => ({
        id: Number(r.workflowInstanceId),
        entityType: r.entityType,
        entityId: r.entityId,
        entityLabel: r.entityLabel,
        currentState: r.currentState,
        currentNodeTitle: nodeTitle.get(r.currentNodeId) ?? "",
        startedByName: r.startedByName,
        startedAt: r.startedAt.toISOString(),
        finishedAt: r.finishedAt?.toISOString() ?? null,
        finalStatus: r.finalStatus,
        processVersion: r.processVersion,
      })),
    };
  }

  /** جزئیات + خط زمانی اقدام‌ها (FR-10) + ابلاغ‌ها. */
  async detail(id: bigint) {
    const inst = await this.prisma.workflowInstance.findUnique({
      where: { workflowInstanceId: id },
    });
    if (!inst) throw new NotFoundException("نمونهٔ گردش کار یافت نشد");
    const def = await this.prisma.workflowDefinition.findUnique({
      where: { workflowDefinitionId: inst.definitionId },
    });
    const nodes = await this.prisma.workflowNode.findMany({
      where: { definitionId: inst.definitionId },
      orderBy: { orderIndex: "asc" },
    });
    const transitions = await this.prisma.workflowTransition.findMany({
      where: { definitionId: inst.definitionId },
      orderBy: { workflowTransitionId: "asc" },
    });
    const logs = await this.prisma.workflowActionLog.findMany({
      where: { instanceId: id },
      orderBy: { workflowActionLogId: "asc" },
    });
    const notifications = await this.prisma.workflowNotification.findMany({
      where: { instanceId: id },
      orderBy: { workflowNotificationId: "desc" },
    });
    const nodeById = new Map(nodes.map((n) => [n.workflowNodeId, n]));
    const currentNode = nodeById.get(inst.currentNodeId);
    return {
      id: Number(inst.workflowInstanceId),
      entityType: inst.entityType,
      entityId: inst.entityId,
      entityLabel: inst.entityLabel,
      currentState: inst.currentState,
      startedBy: inst.startedBy,
      startedByName: inst.startedByName,
      startedAt: inst.startedAt.toISOString(),
      finishedAt: inst.finishedAt?.toISOString() ?? null,
      finalStatus: inst.finalStatus,
      processVersion: inst.processVersion,
      definition: def
        ? {
            id: Number(def.workflowDefinitionId),
            code: def.code,
            name: def.name,
            thresholdAmount: def.thresholdAmount,
          }
        : null,
      currentNode: currentNode
        ? {
            id: Number(currentNode.workflowNodeId),
            nodeCode: currentNode.nodeCode,
            title: currentNode.title,
            nodeType: currentNode.nodeType,
            roleCode: currentNode.roleCode,
          }
        : null,
      nodes: nodes.map((n) => ({
        id: Number(n.workflowNodeId),
        nodeCode: n.nodeCode,
        title: n.title,
        nodeType: n.nodeType,
        roleCode: n.roleCode,
        finalStatus: n.finalStatus,
        instanceState: n.instanceState,
      })),
      transitions: transitions.map((t) => ({
        id: Number(t.workflowTransitionId),
        fromNodeId: Number(t.fromNodeId),
        toNodeId: Number(t.toNodeId),
        action: t.action,
        conditionExpr: t.conditionExpr,
        isDefault: t.isDefault,
      })),
      logs: logs.map((l) => ({
        id: Number(l.workflowActionLogId),
        action: l.action,
        actorId: l.actorId,
        actorName: l.actorName,
        fromNodeTitle: nodeById.get(l.fromNodeId)?.title ?? "",
        toNodeTitle: nodeById.get(l.toNodeId)?.title ?? "",
        comment: l.comment,
        createdAt: l.createdAt.toISOString(),
      })),
      notifications: notifications.map((n) => ({
        id: Number(n.workflowNotificationId),
        title: n.title,
        body: n.body,
        recipientRoleCode: n.recipientRoleCode,
        recipientUserId: n.recipientUserId,
        sentAt: n.sentAt.toISOString(),
        readAt: n.readAt?.toISOString() ?? null,
      })),
    };
  }

  /* ------------------------------ ابزارهای داخلی ------------------------------ */

  /**
   * اعمال وضعیت پایانی موتور روی فرم (D-4/D-5 — فقط entityType=voucher در فاز ۲).
   * همیشه پس از تراکنش اتمی موتور فراخوانی می‌شود؛ خطای آن نمونه را بازنمی‌گرداند
   * (best-effort + لاگ) — فرم با واکشی مجدد وضعیت واقعی را می‌خواند.
   */
  private async writeBackEntityStatus(
    entityType: string,
    entityId: string,
    status: number | null | undefined,
    actorId: string,
  ) {
    if (status == null) return;
    if (entityType !== "voucher") return; // فاز ۲ فقط سند — فرم‌های بعدی همین‌جا گسترش می‌یابند
    await this.link.writeBackVoucherStatus(entityId, status, actorId);
  }

  /**
   * انتخاب گذار خروجی گرهٔ شرط: اولین شرطِ برآورده؛ در نبود آن شاخهٔ پیش‌فرض
   * (خیر)؛ اگر شرط به amount نیاز داشته باشد و amount نیاید خطای روشن می‌دهیم —
   * دور زدن بی‌صدای ایستگاه تایید مدیر با نبودِ داده مجاز نیست (کنترل مالی).
   */
  private pickConditionTransition(
    outs: Array<{ toNodeId: bigint; action: string; conditionExpr: string; isDefault: boolean }>,
    ctx: { amount?: number; threshold?: number },
  ): { toNodeId: bigint; action: string; isDefault: boolean } | null {
    let fallback: { toNodeId: bigint; action: string; isDefault: boolean } | null = null;
    let missingAmount = false;
    for (const t of outs) {
      if (t.isDefault) {
        fallback = { toNodeId: t.toNodeId, action: t.action, isDefault: true };
        continue;
      }
      if (!t.conditionExpr.trim()) continue;
      const r = this.evalCondition(t.conditionExpr, ctx);
      if (r === "unevaluable") {
        missingAmount = true;
        continue;
      }
      if (r) return { toNodeId: t.toNodeId, action: t.action, isDefault: false };
    }
    if (missingAmount) {
      throw new BadRequestException(
        "ارزیابی شرط آستانه به مبلغ سند نیاز دارد — amount را همراه اقدام بفرستید",
      );
    }
    return fallback;
  }

  /** "amount > threshold" | "amount <= 250000" → true/false | "unevaluable" */
  private evalCondition(
    expr: string,
    ctx: { amount?: number; threshold?: number },
  ): boolean | "unevaluable" {
    const m = expr
      .trim()
      .match(/^amount\s*(>=|<=|==|!=|>|<)\s*(threshold|\d+(?:\.\d+)?)$/);
    if (!m) return false; // شرط ناشناخته = برآورده نمی‌شود
    const op = m[1];
    const rightRaw = m[2];
    let right: number | undefined;
    if (rightRaw === "threshold") right = ctx.threshold;
    else right = Number(rightRaw);
    const left = ctx.amount;
    if (left === undefined || right === undefined) return "unevaluable";
    switch (op) {
      case ">":
        return left > right;
      case ">=":
        return left >= right;
      case "<":
        return left < right;
      case "<=":
        return left <= right;
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      default:
        return false;
    }
  }

  private async logAction(
    tx: Tx,
    instanceId: bigint,
    data: {
      fromNodeId: bigint;
      toNodeId: bigint;
      action: string;
      actorId: string;
      actorName: string;
      roleCode: string;
      comment: string;
    },
  ) {
    const id = await this.ids.generateNextIdInTx(tx, "WorkflowActionLog");
    await tx.workflowActionLog.create({
      data: {
        workflowActionLogId: BigInt(id),
        instanceId,
        fromNodeId: data.fromNodeId,
        toNodeId: data.toNodeId,
        action: data.action,
        actorId: data.actorId,
        actorName: data.actorName,
        roleCode: data.roleCode,
        comment: data.comment,
      },
    });
  }

  /** ابلاغ به همهٔ کاربران فعال سمتِ گره (FR-07) — فاز ۳ کارتابل می‌خواند. */
  private async notifyRole(tx: Tx, inst: { workflowInstanceId: bigint; entityLabel: string; entityType: string }, node: { workflowNodeId: bigint; roleCode: string; title: string }) {
    if (!node.roleCode) return;
    const now = new Date();
    const users = await this.prisma.workflowRoleAssignment.findMany({
      where: {
        roleCode: node.roleCode,
        isActive: true,
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validTo: null }, { validTo: { gte: now } }] },
        ],
      },
    });
    const title = `در انتظار اقدام: ${node.title} — ${inst.entityLabel || inst.entityType}`;
    for (const u of users) {
      const id = await this.ids.generateNextIdInTx(tx, "WorkflowNotification");
      await tx.workflowNotification.create({
        data: {
          workflowNotificationId: BigInt(id),
          instanceId: inst.workflowInstanceId,
          nodeId: node.workflowNodeId,
          recipientRoleCode: node.roleCode,
          recipientUserId: u.userId,
          title,
          body: `سند «${inst.entityLabel || inst.entityType}» (${inst.entityId}) به گام «${node.title}» رسید`,
        },
      });
    }
  }

  private async notifyUser(
    tx: Tx,
    inst: { workflowInstanceId: bigint; entityLabel: string; entityType: string },
    userId: string,
    title: string,
    body: string,
  ) {
    if (!userId) return;
    const id = await this.ids.generateNextIdInTx(tx, "WorkflowNotification");
    await tx.workflowNotification.create({
      data: {
        workflowNotificationId: BigInt(id),
        instanceId: inst.workflowInstanceId,
        nodeId: 0n,
        recipientUserId: userId,
        title: `${title} — ${inst.entityLabel || inst.entityType}`,
        body,
      },
    });
  }
}
