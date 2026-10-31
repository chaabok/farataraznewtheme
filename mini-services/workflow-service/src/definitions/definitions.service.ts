import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * DefinitionsService — خواندن تعریف فرآیند + گره‌ها و گذارها (FR-01).
 * فاز ۱ فقط خواندنی است؛ طراح بصری (ایجاد نسخهٔ جدید) فاز ۴ نقشهٔ راه است.
 */
@Injectable()
export class DefinitionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(entityType?: string) {
    const defs = await this.prisma.workflowDefinition.findMany({
      where: entityType ? { entityType } : undefined,
      orderBy: [{ code: "asc" }, { processVersion: "desc" }],
    });
    return {
      items: defs.map((d) => ({
        id: Number(d.workflowDefinitionId),
        code: d.code,
        name: d.name,
        entityType: d.entityType,
        processVersion: d.processVersion,
        thresholdAmount: d.thresholdAmount,
        isActive: d.isActive,
      })),
    };
  }

  async getOne(id: bigint) {
    const d = await this.prisma.workflowDefinition.findUnique({
      where: { workflowDefinitionId: id },
    });
    if (!d) throw new NotFoundException("فرآیند یافت نشد");
    const nodes = await this.prisma.workflowNode.findMany({
      where: { definitionId: id },
      orderBy: { orderIndex: "asc" },
    });
    const transitions = await this.prisma.workflowTransition.findMany({
      where: { definitionId: id },
      orderBy: { workflowTransitionId: "asc" },
    });
    return {
      id: Number(d.workflowDefinitionId),
      code: d.code,
      name: d.name,
      entityType: d.entityType,
      processVersion: d.processVersion,
      thresholdAmount: d.thresholdAmount,
      isActive: d.isActive,
      nodes: nodes.map((n) => ({
        id: Number(n.workflowNodeId),
        nodeCode: n.nodeCode,
        nodeType: n.nodeType,
        title: n.title,
        roleCode: n.roleCode,
        slaHours: n.slaHours,
        orderIndex: n.orderIndex,
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
    };
  }

  /** تعریف فعال یک entityType — قلب ورود موتور. */
  async findActive(entityType: string) {
    const d = await this.prisma.workflowDefinition.findFirst({
      where: { entityType, isActive: true },
      orderBy: { processVersion: "desc" },
    });
    if (!d) throw new NotFoundException(`فرآیند فعالی برای entityType=${entityType} تعریف نشده است`);
    return d;
  }
}
