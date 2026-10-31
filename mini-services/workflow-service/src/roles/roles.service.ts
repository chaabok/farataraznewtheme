import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { HEAD_OFFICE_NODE_ID } from "../../../_shared/app-base-entity";
import type { CreateRoleDto, UpdateRoleDto, BulkAssignmentsDto } from "./roles.dto";

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ids: IdGenerationService,
  ) {}

  async list() {
    const rows = await this.prisma.workflowRole.findMany({
      orderBy: { code: "asc" },
    });
    const assignments = await this.prisma.workflowRoleAssignment.findMany({
      orderBy: { workflowRoleAssignmentId: "asc" },
    });
    return {
      items: rows.map((r) => this.toDto(r, assignments.filter((a) => a.roleCode === r.code).length)),
    };
  }

  async getOne(id: bigint) {
    const r = await this.prisma.workflowRole.findUnique({ where: { workflowRoleId: id } });
    if (!r) throw new NotFoundException("سمت یافت نشد");
    const assignments = await this.prisma.workflowRoleAssignment.findMany({
      where: { roleCode: r.code },
      orderBy: { workflowRoleAssignmentId: "asc" },
    });
    return this.toDto(r, assignments);
  }

  async create(dto: CreateRoleDto) {
    const code = dto.code.trim();
    if (!code) throw new BadRequestException("کد سمت الزامی است");
    const dup = await this.prisma.workflowRole.findUnique({ where: { code } });
    if (dup) throw new BadRequestException("کد سمت تکراری است");
    const id = await this.ids.generateNextId("WorkflowRole");
    const row = await this.prisma.workflowRole.create({
      data: {
        workflowRoleId: BigInt(id),
        code,
        title: dto.title.trim(),
        description: (dto.description ?? "").trim(),
        isActive: dto.isActive ?? true,
        creator: dto.actor?.trim() || "system",
        businessStructureRef: HEAD_OFFICE_NODE_ID,
      },
    });
    return this.toDto(row, 0);
  }

  async update(id: bigint, dto: UpdateRoleDto) {
    const existing = await this.prisma.workflowRole.findUnique({ where: { workflowRoleId: id } });
    if (!existing) throw new NotFoundException("سمت یافت نشد");
    const row = await this.prisma.workflowRole.update({
      where: { workflowRoleId: id },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        description: dto.description !== undefined ? dto.description.trim() : undefined,
        isActive: dto.isActive,
        lastModifier: dto.actor?.trim() || "system",
      },
    });
    const count = await this.prisma.workflowRoleAssignment.count({ where: { roleCode: row.code } });
    return this.toDto(row, count);
  }

  /** حذف سمت — اگر گره‌ای یا تخصیصی به آن ارجاع می‌دهد ممنوع است. */
  async remove(id: bigint) {
    const existing = await this.prisma.workflowRole.findUnique({ where: { workflowRoleId: id } });
    if (!existing) throw new NotFoundException("سمت یافت نشد");
    if (existing.isSystem) throw new BadRequestException("سمت‌های سیستمی حذف‌شدنی نیستند");
    const usedByNode = await this.prisma.workflowNode.count({
      where: { roleCode: existing.code },
    });
    if (usedByNode > 0) {
      throw new BadRequestException(
        `این سمت در ${usedByNode} گرهٔ فرآیند استفاده شده است — ابتدا فرآیند را ویرایش کنید`,
      );
    }
    await this.prisma.$transaction([
      this.prisma.workflowRoleAssignment.deleteMany({ where: { roleCode: existing.code } }),
      this.prisma.workflowRole.delete({ where: { workflowRoleId: id } }),
    ]);
    return { ok: true };
  }

  /** تخصیص‌های یک سمت (برای تب گرید فرم). */
  async listAssignments(roleCode: string) {
    const rows = await this.prisma.workflowRoleAssignment.findMany({
      where: { roleCode },
      orderBy: { workflowRoleAssignmentId: "asc" },
    });
    return { items: rows.map((r) => this.assignmentToDto(r)) };
  }

  /**
   * سمت‌های فعال یک کاربر (t178 — آداپتور مشترک): آیا کاربر جاری اجازهٔ اقدام
   * روی گام جاری دارد؟ (موتور هم‌چنان مستقل راستی‌آزمایی می‌کند — FR-06)
   */
  async listAssignmentsByUser(userId?: string) {
    const uid = (userId ?? "").trim();
    if (!uid) return { items: [] };
    const now = new Date();
    const rows = await this.prisma.workflowRoleAssignment.findMany({
      where: {
        userId: uid,
        isActive: true,
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validTo: null }, { validTo: { gte: now } }] },
        ],
      },
      orderBy: { workflowRoleAssignmentId: "asc" },
    });
    return { items: rows.map((r) => this.assignmentToDto(r)) };
  }

  /**
   * ذخیرهٔ دسته‌ای با معنای REPLACE (یک تراکنش): تخصیص‌های فعلی سمت حذف و از
   * ردیف‌های گرید بازسازی می‌شوند — ساده، اتمی و هم‌خوان با تعامل گرید فرم.
   */
  async bulkAssignments(dto: BulkAssignmentsDto) {
    // t189 — ردیابی: چند ردیف واقعاً رسید؟ (payload خالی = پاک‌شدن داده با REPLACE)
    console.log(
      `[t189] bulkAssignments roleCode=${dto.roleCode} rowsIn=${(dto.rows ?? []).length} userIds=[${(dto.rows ?? []).map((r) => r.userId).join(",")}]`,
    );
    const role = await this.prisma.workflowRole.findUnique({ where: { code: dto.roleCode } });
    if (!role) throw new NotFoundException("سمت یافت نشد");
    const actor = dto.actor?.trim() || "system";
    const seen = new Set<string>();
    const rows = dto.rows ?? [];
    for (const r of rows) {
      const uid = (r.userId ?? "").trim();
      if (!uid) throw new BadRequestException("شناسهٔ کاربر در ردیف‌های تخصیص الزامی است");
      if (seen.has(uid)) throw new BadRequestException(`کاربر ${uid} در ردیف‌ها تکراری است`);
      seen.add(uid);
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.workflowRoleAssignment.deleteMany({ where: { roleCode: dto.roleCode } });
      for (const r of rows) {
        const id = await this.ids.generateNextIdInTx(tx, "WorkflowRoleAssignment");
        await tx.workflowRoleAssignment.create({
          data: {
            workflowRoleAssignmentId: BigInt(id),
            roleCode: dto.roleCode,
            userId: r.userId.trim(),
            userName: (r.userName ?? "").trim(),
            scope: (r.scope ?? "").trim(),
            validFrom: r.validFrom ? new Date(r.validFrom) : null,
            validTo: r.validTo ? new Date(r.validTo) : null,
            isActive: r.isActive ?? true,
            creator: actor,
            businessStructureRef: HEAD_OFFICE_NODE_ID,
          },
        });
      }
    });
    return this.listAssignments(dto.roleCode);
  }

  /* ------------------------------ mappers ------------------------------ */

  private toDto(
    r: {
      workflowRoleId: bigint;
      code: string;
      title: string;
      description: string;
      isActive: boolean;
      isSystem: boolean;
      version: number;
    },
    assignmentCountOrRows: number | Array<{ validFrom: Date | null; validTo: Date | null; isActive: boolean }>,
  ) {
    const count =
      typeof assignmentCountOrRows === "number"
        ? assignmentCountOrRows
        : assignmentCountOrRows.filter((a) => a.isActive).length;
    return {
      id: Number(r.workflowRoleId),
      code: r.code,
      title: r.title,
      description: r.description,
      isActive: r.isActive,
      isSystem: r.isSystem,
      assignmentCount: count,
      version: r.version,
    };
  }

  private assignmentToDto(r: {
    workflowRoleAssignmentId: bigint;
    roleCode: string;
    userId: string;
    userName: string;
    scope: string;
    validFrom: Date | null;
    validTo: Date | null;
    isActive: boolean;
  }) {
    const d = (v: Date | null) => (v ? v.toISOString().slice(0, 10) : "");
    return {
      id: Number(r.workflowRoleAssignmentId),
      roleCode: r.roleCode,
      userId: r.userId,
      userName: r.userName,
      scope: r.scope,
      validFrom: d(r.validFrom),
      validTo: d(r.validTo),
      isActive: r.isActive,
    };
  }
}
