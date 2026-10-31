import { Controller, Get, Query } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * StatusMapController — نگاشت وضعیت فرم به چرخه (FR-11؛ D-3): مرجع واحدِ
 * «کدام وضعیت وارد چرخه می‌شود / کدام خارج است / کدام فقط از موتور».
 */
@Controller("workflow-status-map")
export class StatusMapController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query("entityType") entityType?: string) {
    const rows = await this.prisma.workflowStatusMap.findMany({
      where: entityType ? { entityType } : undefined,
      orderBy: { formStatus: "asc" },
    });
    return {
      items: rows.map((r) => ({
        id: Number(r.workflowStatusMapId),
        entityType: r.entityType,
        formStatus: r.formStatus,
        gateType: r.gateType,
        description: r.description,
      })),
    };
  }
}
