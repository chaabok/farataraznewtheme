import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * ReportsService — گزارش گردش/گلوگاه و داشبورد گردش سازمان (t181 — فاز ۵
 * نقشهٔ راه: «گزارش گردش/گلوگاه + داشبورد گردش سازمان»).
 *
 * سه خوانش روی همان دیتای موتور (بدون کپی داده — ارجاع سبک):
 *  · overview     کارت‌های KPI داشبورد: شمارش نمونه‌ها per وضعیت، میانگین زمان
 *                 طی‌شدن، نقض SLA فعال، تفویض‌های فعال و تفکیک per فرم.
 *  · bottlenecks  گلوگاه‌ها: برای هر گره (per نسخهٔ فرآیند) — چندبار ورود،
 *                 میانگین/بیشینهٔ توقفِ بسته‌شده، گره‌هایِ هم‌اکنون منتظر و
 *                 نقض SLA باز. الگوریتم: قدم‌زدن رخدادهای ActionLog هر نمونه —
 *                 پارک روی گره با ورودِ گذار باز می‌شود و با گذار بعدی
 *                 بسته می‌شود؛ پارکِ ممتدِ نمونهٔ running «منتظرِ فعلی» است.
 *  · instances    فهرست نمونه‌های اخیر با گام جاری، ساعت انتظار و وضعیت SLA —
 *                 با فیلتر وضعیت/فرم (برای جدول داشبورد).
 */

interface DwellAcc {
  entered: number;
  closedMs: number;
  closedCount: number;
  maxMs: number;
  openCount: number;
  openBreach: number;
  openMaxMs: number;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ------------------------------ داشبورد — KPI ------------------------------ */

  async overview() {
    const now = new Date();
    const [byState, finishedRows, runningRows, activeDelegations, byEntityState] =
      await Promise.all([
        this.prisma.workflowInstance.groupBy({
          by: ["currentState"],
          _count: { _all: true },
        }),
        this.prisma.workflowInstance.findMany({
          where: { finishedAt: { not: null } },
          select: { startedAt: true, finishedAt: true },
          take: 2000,
          orderBy: { workflowInstanceId: "desc" },
        }),
        this.prisma.workflowInstance.findMany({
          where: { currentState: "running" },
          select: {
            workflowInstanceId: true,
            currentNodeId: true,
            startedAt: true,
          },
          take: 1000,
        }),
        this.prisma.workflowDelegation.count({
          where: {
            isActive: true,
            validFrom: { lte: now },
            OR: [{ validTo: null }, { validTo: { gte: now } }],
          },
        }),
        this.prisma.workflowInstance.groupBy({
          by: ["entityType", "currentState"],
          _count: { _all: true },
        }),
      ]);

    const counts = { total: 0, running: 0, approved: 0, rejected: 0, cancelled: 0 };
    for (const g of byState) {
      const n = g._count._all;
      counts.total += n;
      if (g.currentState === "running") counts.running += n;
      else if (g.currentState === "approved") counts.approved += n;
      else if (g.currentState === "rejected") counts.rejected += n;
      else if (g.currentState === "cancelled") counts.cancelled += n;
    }

    /* میانگین زمان طی‌شدن (نمونه‌های خاتمه‌یافته) — ساعت با یک رقم اعشار */
    let avgCompletionHours: number | null = null;
    if (finishedRows.length > 0) {
      const totalMs = finishedRows.reduce(
        (acc, r) =>
          acc + (r.finishedAt ? r.finishedAt.getTime() - r.startedAt.getTime() : 0),
        0,
      );
      avgCompletionHours = Math.round((totalMs / finishedRows.length / 3_600_000) * 10) / 10;
    }

    /* نقض SLA باز: نمونه‌های running روی گرهٔ action با موعد گذشته */
    const nodeIds = [...new Set(runningRows.map((r) => r.currentNodeId))];
    const nodes = nodeIds.length
      ? await this.prisma.workflowNode.findMany({ where: { workflowNodeId: { in: nodeIds } } })
      : [];
    const nodeById = new Map(nodes.map((n) => [n.workflowNodeId, n]));
    let slaBreachedNow = 0;
    for (const r of runningRows) {
      const node = nodeById.get(r.currentNodeId);
      if (!node || node.nodeType !== "action" || !node.slaHours || node.slaHours <= 0) continue;
      const enteredAt = await this.enteredAtOf(r.workflowInstanceId, r.currentNodeId, r.startedAt);
      if (now.getTime() > enteredAt.getTime() + node.slaHours * 3_600_000) slaBreachedNow++;
    }

    /* تفکیک per فرم (entityType) */
    const perEntityMap = new Map<
      string,
      { total: number; running: number; approved: number; rejected: number; cancelled: number }
    >();
    const emptyEntity = () => ({
      total: 0,
      running: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    });
    for (const g of byEntityState) {
      const row = perEntityMap.get(g.entityType) ?? emptyEntity();
      row.total += g._count._all;
      if (g.currentState in row) (row as Record<string, number>)[g.currentState] += g._count._all;
      perEntityMap.set(g.entityType, row);
    }

    return {
      counts,
      avgCompletionHours,
      slaBreachedNow,
      activeDelegations,
      runningOnActionNode: runningRows.filter((r) => {
        const node = nodeById.get(r.currentNodeId);
        return node?.nodeType === "action";
      }).length,
      perEntityType: [...perEntityMap.entries()].map(([entityType, c]) => ({
        entityType,
        ...c,
      })),
    };
  }

  /* ------------------------------ گلوگاه‌ها ------------------------------ */

  async bottlenecks() {
    const now = new Date();
    const [instances, logs, allNodes, roles] = await Promise.all([
      this.prisma.workflowInstance.findMany({
        select: {
          workflowInstanceId: true,
          definitionId: true,
          currentNodeId: true,
          currentState: true,
          startedAt: true,
          finishedAt: true,
        },
        take: 1000,
        orderBy: { workflowInstanceId: "desc" },
      }),
      this.prisma.workflowActionLog.findMany({
        select: {
          instanceId: true,
          fromNodeId: true,
          toNodeId: true,
          createdAt: true,
        },
        take: 20000,
        orderBy: { workflowActionLogId: "asc" },
      }),
      this.prisma.workflowNode.findMany(),
      this.prisma.workflowRole.findMany({ select: { code: true, title: true } }),
    ]);
    const nodeById = new Map(allNodes.map((n) => [n.workflowNodeId, n]));
    const roleTitle = new Map(roles.map((r) => [r.code, r.title]));

    /* قدم‌زدن رخدادها: هر گذار، توقفِ گرهٔ مبدأ را می‌بندد و پارک روی مقصد را باز می‌کند */
    const logsByInstance = new Map<string, { from: bigint; to: bigint; at: Date }[]>();
    for (const l of logs) {
      const list = logsByInstance.get(String(l.instanceId)) ?? [];
      list.push({ from: l.fromNodeId, to: l.toNodeId, at: l.createdAt });
      logsByInstance.set(String(l.instanceId), list);
    }

    const acc = new Map<string, DwellAcc>();
    const keyOf = (definitionId: bigint, nodeId: bigint) => `${definitionId}:${nodeId}`;
    const accOf = (key: string) => {
      let a = acc.get(key);
      if (!a) {
        a = {
          entered: 0,
          closedMs: 0,
          closedCount: 0,
          maxMs: 0,
          openCount: 0,
          openBreach: 0,
          openMaxMs: 0,
        };
        acc.set(key, a);
      }
      return a;
    };
    const closeDwell = (nodeId: bigint, from: Date, to: Date) => {
      const node = nodeById.get(nodeId);
      if (!node) return;
      const ms = Math.max(0, to.getTime() - from.getTime());
      const a = accOf(keyOf(node.definitionId, nodeId));
      a.entered++;
      a.closedMs += ms;
      a.closedCount++;
      if (ms > a.maxMs) a.maxMs = ms;
    };
    const openDwell = (nodeId: bigint, from: Date, instanceEnd: Date | null) => {
      const node = nodeById.get(nodeId);
      if (!node) return;
      const until = instanceEnd ?? now;
      const ms = Math.max(0, until.getTime() - from.getTime());
      const a = accOf(keyOf(node.definitionId, nodeId));
      a.entered++;
      a.openCount++;
      if (ms > a.openMaxMs) a.openMaxMs = ms;
      if (node.nodeType === "action" && node.slaHours && node.slaHours > 0) {
        if (until.getTime() > from.getTime() + node.slaHours * 3_600_000) a.openBreach++;
      }
    };

    for (const inst of instances) {
      const evts = logsByInstance.get(String(inst.workflowInstanceId)) ?? [];
      let parkedAt: bigint | null = inst.currentNodeId; // گرهٔ پارک اولیه = گرهٔ شروع
      let parkedSince = inst.startedAt;
      for (const e of evts) {
        if (parkedAt) closeDwell(parkedAt, parkedSince, e.at);
        parkedAt = e.to;
        parkedSince = e.at;
      }
      if (parkedAt) {
        /* گرهٔ پایانی: با finishedAt بسته می‌شود؛ والا منتظرِ فعلی (running) */
        if (nodeById.get(parkedAt)?.nodeType === "end" && inst.finishedAt) {
          closeDwell(parkedAt, parkedSince, inst.finishedAt);
        } else {
          openDwell(
            parkedAt,
            parkedSince,
            inst.currentState === "running" ? null : inst.finishedAt,
          );
        }
      }
    }

    /* تزئین با نام گره/فرآیند و مرتب‌سازی بر اهمیت (میانگین توقف + انتظار باز) */
    const defIds = [...new Set([...acc.keys()].map((k) => BigInt(k.split(":")[0])))];
    const defs = defIds.length
      ? await this.prisma.workflowDefinition.findMany({
          where: { workflowDefinitionId: { in: defIds } },
          select: {
            workflowDefinitionId: true,
            code: true,
            name: true,
            processVersion: true,
            entityType: true,
          },
        })
      : [];
    const defById = new Map(defs.map((d) => [d.workflowDefinitionId, d]));

    const items = [...acc.entries()]
      .map(([key, a]) => {
        const [defIdStr, nodeIdStr] = key.split(":");
        const node = nodeById.get(BigInt(nodeIdStr));
        const def = defById.get(BigInt(defIdStr));
        return {
          definitionCode: def?.code ?? "",
          definitionName: def?.name ?? "",
          processVersion: def?.processVersion ?? 0,
          entityType: def?.entityType ?? "",
          nodeCode: node?.nodeCode ?? "",
          nodeTitle: node?.title ?? "",
          nodeType: node?.nodeType ?? "",
          roleCode: node?.roleCode ?? "",
          roleTitle: node?.roleCode ? (roleTitle.get(node.roleCode) ?? "") : "",
          slaHours: node?.slaHours ?? null,
          entered: a.entered,
          avgHours:
            a.closedCount > 0
              ? Math.round((a.closedMs / a.closedCount / 3_600_000) * 10) / 10
              : 0,
          maxHours: Math.round((a.maxMs / 3_600_000) * 10) / 10,
          openCount: a.openCount,
          openBreach: a.openBreach,
          openMaxHours: Math.round((a.openMaxMs / 3_600_000) * 10) / 10,
        };
      })
      .filter((x) => x.nodeType === "action")
      .sort(
        (x, y) =>
          y.avgHours - x.avgHours || y.openCount - x.openCount || y.entered - x.entered,
      )
      .slice(0, 12);

    return { generatedAt: now.toISOString(), items };
  }

  /* ------------------------------ نمونه‌های اخیر ------------------------------ */

  async instances(query: { status?: string; entityType?: string; limit?: string }) {
    const now = new Date();
    const status = (query.status ?? "").trim();
    const entityType = (query.entityType ?? "").trim();
    const limit = Math.min(Math.max(Number(query.limit ?? 50) || 50, 1), 200);
    const where: Record<string, unknown> = {};
    if (["running", "approved", "rejected", "cancelled"].includes(status)) {
      where.currentState = status;
    }
    if (entityType) where.entityType = entityType;

    const [total, rows] = await Promise.all([
      this.prisma.workflowInstance.count({ where }),
      this.prisma.workflowInstance.findMany({
        where,
        orderBy: { workflowInstanceId: "desc" },
        take: limit,
      }),
    ]);
    const nodeIds = [...new Set(rows.map((r) => r.currentNodeId))];
    const nodes = nodeIds.length
      ? await this.prisma.workflowNode.findMany({ where: { workflowNodeId: { in: nodeIds } } })
      : [];
    const nodeById = new Map(nodes.map((n) => [n.workflowNodeId, n]));

    const items = [];
    for (const r of rows) {
      const node = nodeById.get(r.currentNodeId);
      const enteredAt = await this.enteredAtOf(r.workflowInstanceId, r.currentNodeId, r.startedAt);
      const waitingHours =
        Math.round(((now.getTime() - enteredAt.getTime()) / 3_600_000) * 10) / 10;
      let slaState = "none";
      let hoursLeft: number | null = null;
      if (
        r.currentState === "running" &&
        node?.nodeType === "action" &&
        node.slaHours &&
        node.slaHours > 0
      ) {
        hoursLeft =
          Math.round(
            ((enteredAt.getTime() + node.slaHours * 3_600_000 - now.getTime()) / 3_600_000) * 10,
          ) / 10;
        slaState = hoursLeft < 0 ? "breach" : hoursLeft <= node.slaHours * 0.25 ? "warning" : "ok";
      }
      items.push({
        id: String(r.workflowInstanceId),
        entityType: r.entityType,
        entityLabel: r.entityLabel,
        currentState: r.currentState,
        processVersion: r.processVersion,
        currentNodeTitle: node?.title ?? "",
        nodeType: node?.nodeType ?? "",
        startedByName: r.startedByName,
        startedAt: r.startedAt.toISOString(),
        finishedAt: r.finishedAt?.toISOString() ?? null,
        waitingHours: r.currentState === "running" ? waitingHours : null,
        slaState,
        hoursLeft,
      });
    }
    return { total, items };
  }

  /* ------------------------------ کمک‌کارها ------------------------------ */

  private async enteredAtOf(
    instanceId: bigint,
    currentNodeId: bigint,
    fallback: Date,
  ): Promise<Date> {
    const last = await this.prisma.workflowActionLog.findFirst({
      where: { instanceId, toNodeId: currentNodeId },
      orderBy: { workflowActionLogId: "desc" },
      select: { createdAt: true },
    });
    return last?.createdAt ?? fallback;
  }
}
