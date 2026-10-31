import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { HEAD_OFFICE_NODE_ID } from "../../../_shared/app-base-entity";
import type {
  CreateDelegationDto,
  MarkReadDto,
  SlaCheckDto,
  UpdateDelegationDto,
} from "./cartable.dto";

/**
 * CartableService — کارتابل گردش کار (t179 — فاز ۳ نقشهٔ راه: کارتابل/ابلاغ،
 * تفویض و SLA).
 *
 * کارتابل (FR-07/08): پنج صندوق per کاربر —
 *  · tasks     گام‌های در انتظار اقدام من (دارندهٔ سمتِ گرهٔ جاری یا نمایندهٔ تفویض معتبر)
 *  · started   نمونه‌هایی که من آغاز کرده‌ام (همهٔ وضعیت‌ها)
 *  · notifications  ابلاغ‌های دریافتی (خوانده‌نشده/خوانده‌شده + علامت‌گذاری)
 *  · actions   تاریخچهٔ اقدام‌های من (از دفتر append-only)
 *  · delegations    تفویض‌های من (صادره/وارد) با CRUD بازه‌دار (FR-09)
 *
 * SLA (FR-12): هر گرهٔ action می‌تواند SLAHours داشته باشد؛ موعدها از زمان
 * ورود نمونه به گره (آخرین ActionLog با مقصدِ گرهٔ جاری) محاسبه و در فهرست
 * کارتابل به‌صورت ok/warning/breach نشان داده می‌شود. runSlaCheck برای
 * نمونه‌هایِ ازموعده‌گذشته ابلاغ kind=sla به دارندگان سمت + آغازگر می‌سازد
 * (dedupe per گره — یک هشدار برای هر پارک روی گره) و با تایمر داخلی هر
 * ۵ دقیقه اجرا می‌شود؛ endpoint دستی هم برای تست/عملیات موجود است.
 */
@Injectable()
export class CartableService {
  private readonly logger = new Logger(CartableService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ids: IdGenerationService,
  ) {}

  /* ------------------------------ خواندن کارتابل ------------------------------ */

  /** سمت‌های مؤثر کاربر: تخصیص مستقیم فعال + سمت‌های تفویض‌گرفتهٔ معتبر. */
  private async effectiveRoleCodes(userId: string, now: Date): Promise<Set<string>> {
    const codes = new Set<string>();
    if (!userId.trim()) return codes;
    const assigns = await this.prisma.workflowRoleAssignment.findMany({
      where: {
        userId,
        isActive: true,
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validTo: null }, { validTo: { gte: now } }] },
        ],
      },
      select: { roleCode: true },
    });
    for (const a of assigns) codes.add(a.roleCode);
    const dels = await this.prisma.workflowDelegation.findMany({
      where: {
        delegateUserId: userId,
        isActive: true,
        validFrom: { lte: now },
        OR: [{ validTo: null }, { validTo: { gte: now } }],
      },
      select: { roleCode: true },
    });
    for (const d of dels) codes.add(d.roleCode);
    return codes;
  }

  /** زمان ورود نمونه به گرهٔ جاری = آخرین ActionLog با مقصد همان گره. */
  private async enteredAtOf(instanceId: bigint, currentNodeId: bigint, fallback: Date): Promise<Date> {
    const last = await this.prisma.workflowActionLog.findFirst({
      where: { instanceId, toNodeId: currentNodeId },
      orderBy: { workflowActionLogId: "desc" },
      select: { createdAt: true },
    });
    return last?.createdAt ?? fallback;
  }

  /** وضعیت SLA یک گام: none (بدون SLA) | ok | warning | breach + ساعت باقی‌مانده. */
  private slaStateOf(
    slaHours: number | null,
    enteredAt: Date,
    now: Date,
  ): { slaState: string; dueAt: string | null; hoursLeft: number | null } {
    if (!slaHours || slaHours <= 0) {
      return { slaState: "none", dueAt: null, hoursLeft: null };
    }
    const dueMs = enteredAt.getTime() + slaHours * 3_600_000;
    const hoursLeft = Math.round(((dueMs - now.getTime()) / 3_600_000) * 10) / 10;
    const state = hoursLeft < 0 ? "breach" : hoursLeft <= slaHours * 0.25 ? "warning" : "ok";
    return { slaState: state, dueAt: new Date(dueMs).toISOString(), hoursLeft };
  }

  /** گام‌های در انتظار اقدام کاربر (نمونه‌های running که گرهٔ جاری‌شان سمتِ او را می‌خواهد). */
  async tasks(userId: string) {
    const now = new Date();
    const roles = await this.effectiveRoleCodes(userId, now);
    if (roles.size === 0) return { items: [], roleCodes: [] };
    const rows = await this.prisma.workflowInstance.findMany({
      where: { currentState: "running" },
      orderBy: { workflowInstanceId: "desc" },
      take: 300,
    });
    const nodeIds = [...new Set(rows.map((r) => r.currentNodeId))];
    const nodes = nodeIds.length
      ? await this.prisma.workflowNode.findMany({ where: { workflowNodeId: { in: nodeIds } } })
      : [];
    const nodeById = new Map(nodes.map((n) => [n.workflowNodeId, n]));
    const roleRows = await this.prisma.workflowRole.findMany();
    const roleTitle = new Map(roleRows.map((r) => [r.code, r.title]));
    const defIds = [...new Set(rows.map((r) => r.definitionId))];
    const defs = defIds.length
      ? await this.prisma.workflowDefinition.findMany({ where: { workflowDefinitionId: { in: defIds } } })
      : [];
    const defName = new Map(defs.map((d) => [d.workflowDefinitionId, d.name]));

    const items: Array<Record<string, unknown>> = [];
    for (const r of rows) {
      const node = nodeById.get(r.currentNodeId);
      if (!node || node.nodeType !== "action" || !roles.has(node.roleCode)) continue;
      const enteredAt = await this.enteredAtOf(r.workflowInstanceId, r.currentNodeId, r.startedAt);
      const sla = this.slaStateOf(node.slaHours, enteredAt, now);
      items.push({
        id: Number(r.workflowInstanceId),
        entityType: r.entityType,
        entityId: r.entityId,
        entityLabel: r.entityLabel,
        processName: defName.get(r.definitionId) ?? "",
        currentNodeId: Number(node.workflowNodeId),
        currentNodeCode: node.nodeCode,
        currentNodeTitle: node.title,
        roleCode: node.roleCode,
        roleTitle: roleTitle.get(node.roleCode) ?? node.roleCode,
        enteredAt: enteredAt.toISOString(),
        slaHours: node.slaHours,
        ...sla,
        startedBy: r.startedBy,
        startedByName: r.startedByName,
        startedAt: r.startedAt.toISOString(),
      });
    }
    /* تأخیرها بالاتر، سپس نزدیک‌ترین موعد */
    items.sort((a, b) => {
      const rank = { breach: 0, warning: 1, ok: 2, none: 3 } as Record<string, number>;
      const ra = rank[String(a.slaState)] ?? 3;
      const rb = rank[String(b.slaState)] ?? 3;
      if (ra !== rb) return ra - rb;
      return Number(b.id) - Number(a.id);
    });
    return { items, roleCodes: [...roles] };
  }

  /** نمونه‌هایی که کاربر آغاز کرده (آخرین ۱۰۰ — همهٔ وضعیت‌ها). */
  async started(userId: string) {
    const rows = await this.prisma.workflowInstance.findMany({
      where: { startedBy: userId },
      orderBy: { workflowInstanceId: "desc" },
      take: 100,
    });
    const nodeIds = [...new Set(rows.map((r) => r.currentNodeId))];
    const nodes = nodeIds.length
      ? await this.prisma.workflowNode.findMany({ where: { workflowNodeId: { in: nodeIds } } })
      : [];
    const nodeTitle = new Map(nodes.map((n) => [n.workflowNodeId, n.title]));
    const defIds = [...new Set(rows.map((r) => r.definitionId))];
    const defs = defIds.length
      ? await this.prisma.workflowDefinition.findMany({ where: { workflowDefinitionId: { in: defIds } } })
      : [];
    const defName = new Map(defs.map((d) => [d.workflowDefinitionId, d.name]));
    return {
      items: rows.map((r) => ({
        id: Number(r.workflowInstanceId),
        entityType: r.entityType,
        entityId: r.entityId,
        entityLabel: r.entityLabel,
        processName: defName.get(r.definitionId) ?? "",
        currentState: r.currentState,
        currentNodeTitle: nodeTitle.get(r.currentNodeId) ?? "",
        startedAt: r.startedAt.toISOString(),
        finishedAt: r.finishedAt?.toISOString() ?? null,
        finalStatus: r.finalStatus,
      })),
    };
  }

  /** ابلاغ‌های دریافتی کاربر (آخرین ۱۰۰ — kind: action|info|sla). */
  async notifications(userId: string) {
    const rows = await this.prisma.workflowNotification.findMany({
      where: { recipientUserId: userId },
      orderBy: { workflowNotificationId: "desc" },
      take: 100,
    });
    const instIds = [...new Set(rows.map((r) => r.instanceId))];
    const insts = instIds.length
      ? await this.prisma.workflowInstance.findMany({
          where: { workflowInstanceId: { in: instIds } },
          select: {
            workflowInstanceId: true,
            entityLabel: true,
            entityType: true,
            entityId: true,
            currentState: true,
          },
        })
      : [];
    const instById = new Map(insts.map((i) => [i.workflowInstanceId, i]));
    return {
      unread: rows.filter((r) => !r.readAt).length,
      items: rows.map((r) => {
        const inst = instById.get(r.instanceId);
        return {
          id: Number(r.workflowNotificationId),
          kind: r.kind,
          title: r.title,
          body: r.body,
          recipientRoleCode: r.recipientRoleCode,
          instanceId: Number(r.instanceId),
          entityLabel: inst?.entityLabel ?? "",
          entityType: inst?.entityType ?? "",
          entityId: inst?.entityId ?? "",
          instanceState: inst?.currentState ?? "",
          sentAt: r.sentAt.toISOString(),
          readAt: r.readAt?.toISOString() ?? null,
        };
      }),
    };
  }

  /** تاریخچهٔ اقدام‌های کاربر (append-only — آخرین ۱۰۰) با اطلاعات سند. */
  async myActions(userId: string) {
    const rows = await this.prisma.workflowActionLog.findMany({
      where: { actorId: userId },
      orderBy: { workflowActionLogId: "desc" },
      take: 100,
    });
    const instIds = [...new Set(rows.map((r) => r.instanceId))];
    const insts = instIds.length
      ? await this.prisma.workflowInstance.findMany({
          where: { workflowInstanceId: { in: instIds } },
          select: {
            workflowInstanceId: true,
            entityLabel: true,
            entityType: true,
            entityId: true,
            currentState: true,
          },
        })
      : [];
    const instById = new Map(insts.map((i) => [i.workflowInstanceId, i]));
    const nodeIds = [
      ...new Set(rows.flatMap((r) => [r.fromNodeId, r.toNodeId]).filter((x) => x > 0n)),
    ];
    const nodes = nodeIds.length
      ? await this.prisma.workflowNode.findMany({ where: { workflowNodeId: { in: nodeIds } } })
      : [];
    const nodeTitle = new Map(nodes.map((n) => [n.workflowNodeId, n.title]));
    return {
      items: rows.map((r) => {
        const inst = instById.get(r.instanceId);
        return {
          id: Number(r.workflowActionLogId),
          action: r.action,
          fromNodeTitle: nodeTitle.get(r.fromNodeId) ?? "",
          toNodeTitle: nodeTitle.get(r.toNodeId) ?? "",
          roleCode: r.roleCode,
          comment: r.comment,
          viaDelegation: r.viaDelegation,
          delegatorId: r.delegatorId,
          instanceId: Number(r.instanceId),
          entityLabel: inst?.entityLabel ?? "",
          entityType: inst?.entityType ?? "",
          entityId: inst?.entityId ?? "",
          instanceState: inst?.currentState ?? "",
          createdAt: r.createdAt.toISOString(),
        };
      }),
    };
  }

  /** علامت‌گذاری ابلاغ‌ها به خوانده‌شده — همهٔ خوانده‌نشده‌ها یا فقط ids. */
  async markRead(dto: MarkReadDto) {
    const updated = await this.prisma.workflowNotification.updateMany({
      where: {
        recipientUserId: dto.userId.trim(),
        readAt: null,
        ...(dto.ids?.length ? { workflowNotificationId: { in: dto.ids.map((x) => BigInt(x)) } } : {}),
      },
      data: { readAt: new Date() },
    });
    return { updated: updated.count };
  }

  /** شمارنده‌های بج کارتابل (زنگولهٔ نوار وظیفه). */
  async summary(userId: string) {
    const now = new Date();
    const uid = userId.trim();
    const [roles, runningStarted, unread, incoming] = await Promise.all([
      this.effectiveRoleCodes(uid, now),
      this.prisma.workflowInstance.count({ where: { startedBy: uid, currentState: "running" } }),
      this.prisma.workflowNotification.count({ where: { recipientUserId: uid, readAt: null } }),
      this.prisma.workflowDelegation.count({
        where: {
          delegateUserId: uid,
          isActive: true,
          validFrom: { lte: now },
          OR: [{ validTo: null }, { validTo: { gte: now } }],
        },
      }),
    ]);
    let taskCount = 0;
    let slaBreaches = 0;
    if (roles.size > 0) {
      const rows = await this.prisma.workflowInstance.findMany({
        where: { currentState: "running" },
        select: { workflowInstanceId: true, currentNodeId: true, startedAt: true },
        take: 300,
      });
      const nodeIds = [...new Set(rows.map((r) => r.currentNodeId))];
      const nodes = nodeIds.length
        ? await this.prisma.workflowNode.findMany({ where: { workflowNodeId: { in: nodeIds } } })
        : [];
      const nodeById = new Map(nodes.map((n) => [n.workflowNodeId, n]));
      for (const r of rows) {
        const node = nodeById.get(r.currentNodeId);
        if (!node || node.nodeType !== "action" || !roles.has(node.roleCode)) continue;
        taskCount++;
        if (node.slaHours && node.slaHours > 0) {
          const enteredAt = await this.enteredAtOf(r.workflowInstanceId, r.currentNodeId, r.startedAt);
          const sla = this.slaStateOf(node.slaHours, enteredAt, now);
          if (sla.slaState === "breach") slaBreaches++;
        }
      }
    }
    return {
      tasks: taskCount,
      slaBreaches,
      unread,
      startedRunning: runningStarted,
      incomingDelegations: incoming,
    };
  }

  /* ------------------------------ SLA — بررسی و ارتقا (FR-12) ------------------------------ */

  /**
   * اجرای بررسی SLA روی نمونه‌های running: هر نمونه که موعد گرهٔ جاری‌اش
   * گذشته باشد (و برای این پارک هنوز هشداری ساخته نشده) یک ابلاغ kind=sla
   * برای دارندگان سمتِ گره + آغازگر می‌سازد. dedupe per گره — بازگشت به همان
   * گره هشدار تازه می‌سازد اما پارکِ ممتد فقط یک‌بار.
   */
  async runSlaCheck(dto?: SlaCheckDto) {
    const now = dto?.now ? new Date(dto.now) : new Date();
    const limit = dto?.limit ?? 300;
    const rows = await this.prisma.workflowInstance.findMany({
      where: { currentState: "running" },
      orderBy: { workflowInstanceId: "asc" },
      take: limit,
    });
    const nodeIds = [...new Set(rows.map((r) => r.currentNodeId))];
    const nodes = nodeIds.length
      ? await this.prisma.workflowNode.findMany({ where: { workflowNodeId: { in: nodeIds } } })
      : [];
    const nodeById = new Map(nodes.map((n) => [n.workflowNodeId, n]));

    let checked = 0;
    let created = 0;
    for (const r of rows) {
      const node = nodeById.get(r.currentNodeId);
      if (!node || node.nodeType !== "action" || !node.slaHours || node.slaHours <= 0) continue;
      checked++;
      const enteredAt = await this.enteredAtOf(r.workflowInstanceId, r.currentNodeId, r.startedAt);
      const dueMs = enteredAt.getTime() + node.slaHours * 3_600_000;
      if (now.getTime() <= dueMs) continue; // هنوز منقضی نشده
      const existing = await this.prisma.workflowNotification.findFirst({
        where: { instanceId: r.workflowInstanceId, nodeId: r.currentNodeId, kind: "sla" },
        select: { workflowNotificationId: true },
      });
      if (existing) continue; // یک هشدار per پارک روی گره
      const label = r.entityLabel || r.entityType;
      const title = `هشدار SLA: گذر از موعد «${node.title}» — ${label}`;
      const body = `سند «${label}» (${r.entityId}) از موعد ${node.slaHours} ساعتهٔ گام «${node.title}» گذشته است — رسیدگی فوری.`;
      const holders = await this.prisma.workflowRoleAssignment.findMany({
        where: { roleCode: node.roleCode, isActive: true },
        select: { userId: true },
      });
      const recipients = new Set<string>(holders.map((h) => h.userId));
      if (r.startedBy) recipients.add(r.startedBy);
      for (const uid of recipients) {
        const id = await this.ids.generateNextId("WorkflowNotification");
        await this.prisma.workflowNotification.create({
          data: {
            workflowNotificationId: BigInt(id),
            instanceId: r.workflowInstanceId,
            nodeId: r.currentNodeId,
            kind: "sla",
            recipientRoleCode: node.roleCode,
            recipientUserId: uid,
            title,
            body,
          },
        });
        created++;
      }
    }
    if (created > 0) this.logger.log(`SLA check: ${checked} گام بررسی شد — ${created} هشدار ساخته شد`);
    return { checked, created, now: now.toISOString() };
  }

  /* ------------------------------ تفویض (FR-09) ------------------------------ */

  /** تفویض‌های کاربر — direction: in (به من) | out (از من) | all. */
  async listDelegations(userId: string, direction: string) {
    const uid = userId.trim();
    const where =
      direction === "in"
        ? { delegateUserId: uid }
        : direction === "out"
          ? { delegatorUserId: uid }
          : { OR: [{ delegatorUserId: uid }, { delegateUserId: uid }] };
    const rows = await this.prisma.workflowDelegation.findMany({
      where,
      orderBy: { workflowDelegationId: "desc" },
      take: 200,
    });
    const roleRows = await this.prisma.workflowRole.findMany();
    const roleTitle = new Map(roleRows.map((r) => [r.code, r.title]));
    const now = new Date();
    return {
      items: rows.map((d) => ({
        id: Number(d.workflowDelegationId),
        roleCode: d.roleCode,
        roleTitle: roleTitle.get(d.roleCode) ?? d.roleCode,
        delegatorUserId: d.delegatorUserId,
        delegatorName: d.delegatorName,
        delegateUserId: d.delegateUserId,
        delegateName: d.delegateName,
        validFrom: d.validFrom.toISOString(),
        validTo: d.validTo?.toISOString() ?? null,
        comment: d.comment,
        isActive: d.isActive,
        currentlyValid:
          d.isActive && d.validFrom <= now && (d.validTo == null || d.validTo >= now),
      })),
    };
  }

  /**
   * ایجاد تفویض: تفویض‌کننده باید دارندهٔ مستقیم سمت باشد (تفویضِ تفویض
   * ممنوع — زنجیرهٔ نمایندگی مجاز نیست)، نماینده ≠ تفویض‌کننده، بازهٔ معتبر
   * و بدون ردیف فعالِ تکراری.
   */
  async createDelegation(dto: CreateDelegationDto) {
    const roleCode = dto.roleCode.trim();
    const delegator = dto.delegatorUserId.trim();
    const delegate = dto.delegateUserId.trim();
    if (!roleCode || !delegator || !delegate) {
      throw new BadRequestException("سمت، تفویض‌کننده و نماینده الزامی‌اند");
    }
    if (delegator === delegate) {
      throw new BadRequestException("تفویض سمت به خود ممکن نیست");
    }
    const role = await this.prisma.workflowRole.findUnique({ where: { code: roleCode } });
    if (!role || !role.isActive) {
      throw new BadRequestException(`سمت «${roleCode}» یافت نشد یا غیرفعال است`);
    }
    /* تفویض فقط از دارندهٔ مستقیم (تخصیص فعال) — نه از نمایندهٔ تفویضی */
    const holder = await this.prisma.workflowRoleAssignment.findFirst({
      where: { roleCode, userId: delegator, isActive: true },
      select: { workflowRoleAssignmentId: true },
    });
    if (!holder) {
      throw new BadRequestException(
        `تفویض‌کننده دارندهٔ مستقیم سمت «${roleTitleOr(role)}» نیست — تفویضِ تفویض مجاز نیست`,
      );
    }
    const validFrom = new Date(dto.validFrom);
    const validTo = dto.validTo ? new Date(dto.validTo) : null;
    if (Number.isNaN(validFrom.getTime())) {
      throw new BadRequestException("شروع بازهٔ تفویض نامعتبر است");
    }
    if (validTo && (Number.isNaN(validTo.getTime()) || validTo <= validFrom)) {
      throw new BadRequestException("پایان بازهٔ تفویض باید بعد از شروع آن باشد");
    }
    const dup = await this.prisma.workflowDelegation.findFirst({
      where: { roleCode, delegatorUserId: delegator, delegateUserId: delegate, isActive: true },
      select: { workflowDelegationId: true },
    });
    if (dup) {
      throw new BadRequestException("تفویض فعالِ یکسان برای این سمت و نماینده وجود دارد");
    }
    const id = await this.ids.generateNextId("WorkflowDelegation");
    const row = await this.prisma.workflowDelegation.create({
      data: {
        workflowDelegationId: BigInt(id),
        roleCode,
        delegatorUserId: delegator,
        delegatorName: (dto.delegatorName ?? "").trim(),
        delegateUserId: delegate,
        delegateName: (dto.delegateName ?? "").trim(),
        validFrom,
        validTo,
        comment: (dto.comment ?? "").trim(),
        creator: dto.actor?.trim() || delegator,
        businessStructureRef: HEAD_OFFICE_NODE_ID,
      },
    });
    return this.delegationDto(row, roleTitle);
  }

  /** ویرایش بازه/وضعیت/توضیح تفویض — کاربر فقط تفویض صادرهٔ خودش را ویرایش می‌کند. */
  async updateDelegation(id: number, userId: string, dto: UpdateDelegationDto) {
    const row = await this.prisma.workflowDelegation.findUnique({
      where: { workflowDelegationId: BigInt(id) },
    });
    if (!row) throw new NotFoundException("تفویض یافت نشد");
    if (row.delegatorUserId !== userId.trim()) {
      throw new BadRequestException("فقط تفویض‌کننده مجاز به ویرایش است");
    }
    const validFrom = dto.validFrom ? new Date(dto.validFrom) : row.validFrom;
    const validTo =
      dto.validTo !== undefined ? (dto.validTo ? new Date(dto.validTo) : null) : row.validTo;
    if (Number.isNaN(validFrom.getTime())) {
      throw new BadRequestException("شروع بازهٔ تفویض نامعتبر است");
    }
    if (validTo && (Number.isNaN(validTo.getTime()) || validTo <= validFrom)) {
      throw new BadRequestException("پایان بازهٔ تفویض باید بعد از شروع آن باشد");
    }
    const updated = await this.prisma.workflowDelegation.update({
      where: { workflowDelegationId: BigInt(id) },
      data: {
        validFrom,
        validTo,
        isActive: dto.isActive ?? row.isActive,
        comment: dto.comment !== undefined ? dto.comment.trim() : row.comment,
        lastModifier: dto.actor?.trim() || userId.trim(),
      },
    });
    const role = await this.prisma.workflowRole.findUnique({ where: { code: row.roleCode } });
    return this.delegationDto(updated, new Map([[row.roleCode, role?.title ?? row.roleCode]]));
  }

  /** لغو تفویض — فقط تفویض‌کننده. */
  async removeDelegation(id: number, userId: string) {
    const row = await this.prisma.workflowDelegation.findUnique({
      where: { workflowDelegationId: BigInt(id) },
    });
    if (!row) throw new NotFoundException("تفویض یافت نشد");
    if (row.delegatorUserId !== userId.trim()) {
      throw new BadRequestException("فقط تفویض‌کننده مجاز به لغو است");
    }
    await this.prisma.workflowDelegation.delete({
      where: { workflowDelegationId: BigInt(id) },
    });
    return { ok: true };
  }

  /* ------------------------------ mappers ------------------------------ */

  private delegationDto(
    d: {
      workflowDelegationId: bigint;
      roleCode: string;
      delegatorUserId: string;
      delegatorName: string;
      delegateUserId: string;
      delegateName: string;
      validFrom: Date;
      validTo: Date | null;
      comment: string;
      isActive: boolean;
    },
    roleTitle: Map<string, string>,
  ) {
    const now = new Date();
    return {
      id: Number(d.workflowDelegationId),
      roleCode: d.roleCode,
      roleTitle: roleTitle.get(d.roleCode) ?? d.roleCode,
      delegatorUserId: d.delegatorUserId,
      delegatorName: d.delegatorName,
      delegateUserId: d.delegateUserId,
      delegateName: d.delegateName,
      validFrom: d.validFrom.toISOString(),
      validTo: d.validTo?.toISOString() ?? null,
      comment: d.comment,
      isActive: d.isActive,
      currentlyValid:
        d.isActive && d.validFrom <= now && (d.validTo == null || d.validTo >= now),
    };
  }
}

function roleTitleOr(role: { title: string; code: string }): string {
  return role.title || role.code;
}
