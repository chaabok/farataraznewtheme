import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * CatalogService — t180 فاز ۴: «فرم‌هایی که قرار است در گردش کار شرکت
 * داشته باشند باید توسط کاربر انتخاب شود». کاتالوگ فرم‌های دارای فیلد وضعیت +
 * کلید Participates (انتخاب کاربر). فرمِ بدون آداپتورِ متصل انتخاب‌شدنی نیست
 * (AdapterReady=false) و خروجِ فرمی که نمونهٔ running دارد ممکن نیست.
 */
@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.workflowEntityCatalog.findMany({
      orderBy: { workflowEntityCatalogId: "asc" },
    });
    const defs = await this.prisma.workflowDefinition.findMany({
      where: { isActive: true },
    });
    const activeByEntity = new Map<string, { id: number; code: string; name: string; processVersion: number }>();
    for (const d of defs) {
      activeByEntity.set(d.entityType, {
        id: Number(d.workflowDefinitionId),
        code: d.code,
        name: d.name,
        processVersion: d.processVersion,
      });
    }
    const runningCounts = await this.prisma.workflowInstance.groupBy({
      by: ["entityType"],
      where: { currentState: "running" },
      _count: { _all: true },
    });
    const running = new Map(runningCounts.map((g) => [g.entityType, g._count._all]));
    return {
      items: rows.map((r) => ({
        id: Number(r.workflowEntityCatalogId),
        entityType: r.entityType,
        formTitle: r.formTitle,
        softwareName: r.softwareName,
        description: r.description,
        hasStatusField: r.hasStatusField,
        adapterReady: r.adapterReady,
        participates: r.participates,
        runningInstances: running.get(r.entityType) ?? 0,
        activeDefinition: activeByEntity.get(r.entityType) ?? null,
      })),
    };
  }

  async setParticipation(entityType: string, participates: boolean) {
    const row = await this.prisma.workflowEntityCatalog.findUnique({ where: { entityType } });
    if (!row) throw new NotFoundException("فرم در کاتالوگ گردش کار یافت نشد");
    if (participates && !row.adapterReady) {
      throw new BadRequestException(
        `آداپتور مشترک گردش کار هنوز روی فرم «${row.formTitle}» متصل نشده است — انتخاب این فرم فعلاً ممکن نیست`,
      );
    }
    if (!participates) {
      const running = await this.prisma.workflowInstance.count({
        where: { entityType, currentState: "running" },
      });
      if (running > 0) {
        throw new ConflictException(
          `فرم «${row.formTitle}» ${running} نمونهٔ در جریان دارد — ابتدا نمونه‌ها را تکمیل یا ابطال کنید`,
        );
      }
    }
    if (row.participates !== participates) {
      await this.prisma.workflowEntityCatalog.update({
        where: { entityType },
        data: { participates },
      });
    }
    const fresh = await this.prisma.workflowEntityCatalog.findUniqueOrThrow({ where: { entityType } });
    return {
      id: Number(fresh.workflowEntityCatalogId),
      entityType: fresh.entityType,
      formTitle: fresh.formTitle,
      participates: fresh.participates,
      adapterReady: fresh.adapterReady,
    };
  }
}
