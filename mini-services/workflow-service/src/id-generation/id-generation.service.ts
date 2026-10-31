import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

/**
 * IdGenerationService (workflow-service) — قرارداد §16: هیچ autoincrement؛
 * یک ردیف شمارنده per table با خودترمیمی max(LastID+1, maxDbId+1).
 *
 * tx-aware (t177): تابع اختیاری tx می‌پذیرد تا داخل تراکنشِ اتمیِ موتور
 * (جابجایی نمونه) هم صدا شود — Prisma تراکنش تو در تو را نمی‌پذیرد، پس وقتی
 * tx داده شود منطق شمارنده روی همان tx اجرا می‌شود نه تراکنش تازه.
 */
type Tx = Prisma.TransactionClient;

@Injectable()
export class IdGenerationService {
  constructor(private readonly prisma: PrismaService) {}

  /** رزرو یک شناسه — خارج از تراکنش بیرونی. */
  async generateNextId(tableName: string): Promise<number> {
    return this.prisma.$transaction((tx: Tx) => this.nextInTx(tx, tableName), {
      timeout: 5_000,
      maxWait: 2_000,
    });
  }

  /** رزرو یک شناسه روی تراکنشِ داده‌شده (برای موتور اتمی). */
  async generateNextIdInTx(tx: Tx, tableName: string): Promise<number> {
    return this.nextInTx(tx, tableName);
  }

  private async nextInTx(tx: Tx, tableName: string): Promise<number> {
    let row = await tx.iDGeneration.findFirst({ where: { tableName } });
    if (!row) {
      const maxDbId = await this.maxDbId(tx, tableName);
      const nextId = Math.max(1, maxDbId + 1);
      try {
        await tx.iDGeneration.create({
          data: {
            idGenerationId: hashTableName(tableName),
            tableName,
            lastId: BigInt(nextId),
          },
        });
        return nextId;
      } catch {
        // race on first reservation — fall through to the update path
        row = await tx.iDGeneration.findFirst({ where: { tableName } });
        if (!row) throw new Error(`IDGeneration: cannot reserve counter for ${tableName}`);
      }
    }
    const nextId = Number(row.lastId) + 1;
    await tx.iDGeneration.update({
      where: { idGenerationId: row.idGenerationId },
      data: { lastId: BigInt(nextId) },
    });
    return nextId;
  }

  private async maxDbId(tx: Tx, tableName: string): Promise<number> {
    switch (tableName) {
      case "WorkflowRole":
        return Number(
          (await tx.workflowRole.aggregate({ _max: { workflowRoleId: true } }))._max.workflowRoleId ?? 0,
        );
      case "WorkflowRoleAssignment":
        return Number(
          (
            await tx.workflowRoleAssignment.aggregate({
              _max: { workflowRoleAssignmentId: true },
            })
          )._max.workflowRoleAssignmentId ?? 0,
        );
      case "WorkflowDefinition":
        return Number(
          (await tx.workflowDefinition.aggregate({ _max: { workflowDefinitionId: true } }))._max
            .workflowDefinitionId ?? 0,
        );
      case "WorkflowNode":
        return Number(
          (await tx.workflowNode.aggregate({ _max: { workflowNodeId: true } }))._max.workflowNodeId ?? 0,
        );
      case "WorkflowTransition":
        return Number(
          (
            await tx.workflowTransition.aggregate({ _max: { workflowTransitionId: true } })
          )._max.workflowTransitionId ?? 0,
        );
      case "WorkflowInstance":
        return Number(
          (await tx.workflowInstance.aggregate({ _max: { workflowInstanceId: true } }))._max
            .workflowInstanceId ?? 0,
        );
      case "WorkflowActionLog":
        return Number(
          (await tx.workflowActionLog.aggregate({ _max: { workflowActionLogId: true } }))._max
            .workflowActionLogId ?? 0,
        );
      case "WorkflowNotification":
        return Number(
          (
            await tx.workflowNotification.aggregate({ _max: { workflowNotificationId: true } })
          )._max.workflowNotificationId ?? 0,
        );
      case "WorkflowStatusMap":
        return Number(
          (await tx.workflowStatusMap.aggregate({ _max: { workflowStatusMapId: true } }))._max
            .workflowStatusMapId ?? 0,
        );
      default:
        return 0;
    }
  }
}

/** PK پایدار ردیف شمارنده از خود نام جدول (بدون وابستگی به کتابخانه). */
function hashTableName(name: string): bigint {
  let h = 5381n;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5n) + h + BigInt(name.charCodeAt(i))) & 0xffffffffffffffffn;
  }
  return h;
}
