import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { HEAD_OFFICE_NODE_ID } from "../../../_shared/app-base-entity";
import type {
  CreateDefinitionDto,
  UpdateDefinitionMetaDto,
  TerminateDefinitionDto,
  SaveGraphDto,
  SaveLayoutDto,
} from "./definitions.dto";

type Tx = import("@prisma/client").Prisma.TransactionClient;

/**
 * DefinitionsService — t180 فاز ۴: طراح بصری فرآیند (نقشهٔ راه فاز ۴).
 *
 * تصمیم مالک: «فرم‌هایی که قرار است در گردش کار شرکت داشته باشند باید توسط
 * کاربر انتخاب شود و دیاگرام چرخش آن فرم در ابتدا مشخص گردد» — این سرویس
 * نوشتن دیاگرام (گره/گذار/شرط/SLA) روی WorkflowDefinition را با اعتبارسنجی
 * موتور-سازگار فراهم می‌کند و نسخه‌بندی FR-01 را کامل می‌کند:
 *  · نسخه‌ای که نمونهٔ گردش کار دارد «قطعی» است (PUT graph ⇒ ۴۰۹) — ویرایشش
 *    فقط با «نسخهٔ جدید» (کپی کامل گره/گذار با نگاشت ID)؛ جابجایی گره‌ها
 *    (layout) صرفاً نمایشی است و حتی روی نسخهٔ قطعی آزاد است.
 *  · فعال‌سازی (activate) فقط با دیاگرامِ معتبر ممکن است و برای هر entityType
 *    فقط یک نسخهٔ فعال می‌ماند (موتور با findActive همان را اجرا می‌کند).
 *  · حذف تعریف فقط بدون نمونه و (اگر فعال است) با وجود نسخهٔ فعال دیگر.
 */

const CONDITION_RE = /^amount\s*(>=|<=|==|!=|>|<)\s*(threshold|\d+(?:\.\d+)?)$/;
const NODE_TYPES = new Set(["start", "action", "condition", "end"]);
const VALID_ACTIONS = new Set(["ارسال به رسیدگی", "تایید", "رد", "بله", "خیر"]);

@Injectable()
export class DefinitionsService {
  private readonly logger = new Logger(DefinitionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ids: IdGenerationService,
  ) {}

  /* ------------------------------ خواندن ------------------------------ */

  async list(entityType?: string) {
    const defs = await this.prisma.workflowDefinition.findMany({
      where: entityType ? { entityType } : undefined,
      orderBy: [{ code: "asc" }, { processVersion: "desc" }],
    });
    const defIds = defs.map((d) => d.workflowDefinitionId);
    const instanceCounts = new Map<bigint, number>();
    const nodeCounts = new Map<bigint, number>();
    if (defIds.length) {
      const insts = await this.prisma.workflowInstance.groupBy({
        by: ["definitionId"],
        where: { definitionId: { in: defIds } },
        _count: { _all: true },
      });
      for (const g of insts) instanceCounts.set(g.definitionId, g._count._all);
      const nds = await this.prisma.workflowNode.groupBy({
        by: ["definitionId"],
        where: { definitionId: { in: defIds } },
        _count: { _all: true },
      });
      for (const g of nds) nodeCounts.set(g.definitionId, g._count._all);
    }
    return {
      items: defs.map((d) => ({
        id: Number(d.workflowDefinitionId),
        code: d.code,
        name: d.name,
        description: d.description,
        entityType: d.entityType,
        processVersion: d.processVersion,
        thresholdAmount: d.thresholdAmount,
        isActive: d.isActive,
        /* t190 — خاتمهٔ فرآیند */
        isTerminated: d.isTerminated,
        terminatedAt: d.terminatedAt ? d.terminatedAt.toISOString().slice(0, 10) : null,
        terminationNote: d.terminationNote,
        usedByInstances: (instanceCounts.get(d.workflowDefinitionId) ?? 0) > 0,
        instanceCount: instanceCounts.get(d.workflowDefinitionId) ?? 0,
        nodeCount: nodeCounts.get(d.workflowDefinitionId) ?? 0,
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
    const instanceCount = await this.prisma.workflowInstance.count({
      where: { definitionId: id },
    });
    return {
      id: Number(d.workflowDefinitionId),
      code: d.code,
      name: d.name,
      description: d.description,
      entityType: d.entityType,
      processVersion: d.processVersion,
      thresholdAmount: d.thresholdAmount,
      isActive: d.isActive,
      /* t190 — خاتمهٔ فرآیند */
      isTerminated: d.isTerminated,
      terminatedAt: d.terminatedAt ? d.terminatedAt.toISOString().slice(0, 10) : null,
      terminationNote: d.terminationNote,
      usedByInstances: instanceCount > 0,
      instanceCount,
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
        posX: n.posX,
        posY: n.posY,
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

  /* ------------------------------ ساخت و متا ------------------------------ */

  /**
   * فرآیند جدید (نسخهٔ ۱) با دیاگرام آغازین معتبر: شروع → گام اقدام (اولین
   * سمت فعال) → پایان موفق + گرهٔ رد. فقط برای فرمِ «مشارکت‌کننده» در کاتالوگ
   * (t180 — انتخاب فرم‌ها با کاربر) مجاز است.
   */
  async create(dto: CreateDefinitionDto) {
    const code = dto.code.trim();
    const name = dto.name.trim();
    const entityType = dto.entityType.trim();
    if (!code || !name || !entityType) {
      throw new BadRequestException("کد فرآیند، نام و فرم الزامی است");
    }
    const cat = await this.prisma.workflowEntityCatalog.findUnique({
      where: { entityType },
    });
    if (!cat || !cat.participates) {
      throw new BadRequestException(
        `فرم «${entityType}» در گردش کار مشارکت داده نشده است — ابتدا از بخش «فرم‌های مشارکت‌کننده» انتخابش کنید`,
      );
    }
    const dup = await this.prisma.workflowDefinition.findFirst({
      where: { code, processVersion: 1 },
    });
    if (dup) throw new ConflictException(`فرآیندی با کد «${code}» از قبل وجود دارد`);
    const firstRole = await this.prisma.workflowRole.findFirst({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });
    if (!firstRole) {
      throw new BadRequestException("هیچ سمت فعالی برای گام اقدام وجود ندارد — ابتدا سمت بسازید");
    }

    const defId = await this.ids.generateNextId("WorkflowDefinition");
    const def = await this.prisma.workflowDefinition.create({
      data: {
        workflowDefinitionId: BigInt(defId),
        code,
        name,
        description: (dto.description ?? "").trim(),
        entityType,
        processVersion: 1,
        thresholdAmount:
          dto.thresholdAmount === undefined ||
          dto.thresholdAmount === null ||
          Number.isNaN(Number(dto.thresholdAmount))
            ? null
            : Number(dto.thresholdAmount),
        isActive: false, // پس از ویرایش دیاگرام با «فعال‌سازی» وارد موتور می‌شود
        creator: "designer",
        businessStructureRef: HEAD_OFFICE_NODE_ID,
      },
    });
    const defBig = def.workflowDefinitionId;

    /* دیاگرام آغازین: N1 شروع → N2 اقدام (اولین سمت) → N3 پایان موفق (۳) / N4 رد (۱) */
    const nodeSpecs = [
      { nodeCode: "N1", nodeType: "start", title: "شروع — گلوگاه ورود: تایید کاربر", roleCode: "", slaHours: null as number | null, finalStatus: null as number | null, instanceState: "", posX: 340, posY: 30 },
      { nodeCode: "N2", nodeType: "action", title: "گام اقدام نخست", roleCode: firstRole.code, slaHours: 24 as number | null, finalStatus: null, instanceState: "", posX: 340, posY: 150 },
      { nodeCode: "N3", nodeType: "end", title: "پایان موفق", roleCode: "", slaHours: null, finalStatus: 3 as number | null, instanceState: "approved", posX: 340, posY: 270 },
      { nodeCode: "N4", nodeType: "end", title: "ردشده — برگشت به ثبت‌کننده", roleCode: "", slaHours: null, finalStatus: 1 as number | null, instanceState: "rejected", posX: 60, posY: 150 },
    ];
    const nodeIds = new Map<string, bigint>();
    for (let i = 0; i < nodeSpecs.length; i++) {
      const n = nodeSpecs[i];
      const id = await this.ids.generateNextId("WorkflowNode");
      const row = await this.prisma.workflowNode.create({
        data: {
          workflowNodeId: BigInt(id),
          definitionId: defBig,
          nodeCode: n.nodeCode,
          nodeType: n.nodeType,
          title: n.title,
          roleCode: n.roleCode,
          slaHours: n.slaHours,
          orderIndex: i + 1,
          finalStatus: n.finalStatus,
          instanceState: n.instanceState,
          posX: n.posX,
          posY: n.posY,
        },
      });
      nodeIds.set(n.nodeCode, row.workflowNodeId);
    }
    const transitionSpecs = [
      { from: "N1", to: "N2", action: "ارسال به رسیدگی", conditionExpr: "", isDefault: false },
      { from: "N2", to: "N3", action: "تایید", conditionExpr: "", isDefault: false },
      { from: "N2", to: "N4", action: "رد", conditionExpr: "", isDefault: false },
    ];
    for (const t of transitionSpecs) {
      const id = await this.ids.generateNextId("WorkflowTransition");
      await this.prisma.workflowTransition.create({
        data: {
          workflowTransitionId: BigInt(id),
          definitionId: defBig,
          fromNodeId: nodeIds.get(t.from)!,
          toNodeId: nodeIds.get(t.to)!,
          action: t.action,
          conditionExpr: t.conditionExpr,
          isDefault: t.isDefault,
        },
      });
    }
    this.logger.log(`Definition ${code} v1 created (starter graph) — entityType=${entityType}`);
    return this.getOne(defBig);
  }

  async updateMeta(id: bigint, dto: UpdateDefinitionMetaDto) {
    const d = await this.prisma.workflowDefinition.findUnique({ where: { workflowDefinitionId: id } });
    if (!d) throw new NotFoundException("فرآیند یافت نشد");
    /* t190 — فرآیند خاتمه‌یافته فقط-خواندنی است (فرمان مالک) */
    if (d.isTerminated) {
      throw new ConflictException("این فرآیند خاتمه یافته است — فیلدها فقط-خواندنی‌اند؛ برای ویرایش ابتدا «برگشت خاتمه» را بزنید");
    }
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) throw new BadRequestException("نام فرآیند خالی است");
      data.name = name;
    }
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.thresholdAmount !== undefined) {
      data.thresholdAmount =
        dto.thresholdAmount === null || Number.isNaN(Number(dto.thresholdAmount))
          ? null
          : Number(dto.thresholdAmount);
    }
    if (Object.keys(data).length > 0) {
      await this.prisma.workflowDefinition.update({
        where: { workflowDefinitionId: id },
        data,
      });
    }
    return this.getOne(id);
  }

  /* ------------------------------ خاتمهٔ فرآیند (t190) ------------------------------ */

  /**
   * خاتمهٔ فرآیند (فرمان مالک t190): «فرآیندها ممکن است خاتمه پیدا کنند و
   * فرآیندهای فرم از یک بازه تاریخی تغییر پیدا کند». با تأیید کاربر:
   *  · IsTerminated=true + TerminatedAt + TerminationNote ثبت می‌شود؛
   *  · نسخه از موتور خارج می‌شود (IsActive=false) — ورودهای تازه به نسخهٔ
   *    جانشینِ همان فرم ارجاع می‌شود؛ نمونه‌های جاری دست‌نخورده می‌مانند؛
   *  · نسخهٔ خاتمه‌یافته فقط-خواندنی است (updateMeta/saveGraph/activate قفل).
   * «برگشت خاتمه» (reinstate) قفل‌ها را باز می‌کند (بدون فعال‌سازیِ خودکار).
   */
  async terminate(id: bigint, dto: TerminateDefinitionDto) {
    const d = await this.prisma.workflowDefinition.findUnique({ where: { workflowDefinitionId: id } });
    if (!d) throw new NotFoundException("فرآیند یافت نشد");
    const raw = (dto.terminatedAt ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      throw new BadRequestException("تاریخ خاتمه معتبر نیست — قالب مورد انتظار YYYY-MM-DD است");
    }
    const at = new Date(`${raw}T00:00:00.000Z`);
    if (Number.isNaN(at.getTime())) {
      throw new BadRequestException("تاریخ خاتمه معتبر نیست");
    }
    await this.prisma.workflowDefinition.update({
      where: { workflowDefinitionId: id },
      data: {
        isTerminated: true,
        terminatedAt: at,
        terminationNote: (dto.note ?? "").trim(),
        isActive: false,
      },
    });
    this.logger.log(`Terminated ${d.code} v${d.processVersion} at ${raw} (entityType=${d.entityType})`);
    return this.getOne(id);
  }

  /** برگشت خاتمه (t190): قید خاتمه و تاریخ/توضیحات آن پاک می‌شود؛ نسخه
   *  غیرفعال می‌ماند — فعال‌سازی دوباره با دیاگرامِ معتبر دستی انجام می‌شود. */
  async reinstate(id: bigint) {
    const d = await this.prisma.workflowDefinition.findUnique({ where: { workflowDefinitionId: id } });
    if (!d) throw new NotFoundException("فرآیند یافت نشد");
    if (!d.isTerminated) {
      throw new BadRequestException("این فرآیند خاتمه نیافته است — برگشت خاتمه ممکن نیست");
    }
    await this.prisma.workflowDefinition.update({
      where: { workflowDefinitionId: id },
      data: { isTerminated: false, terminatedAt: null, terminationNote: "" },
    });
    this.logger.log(`Termination reverted for ${d.code} v${d.processVersion}`);
    return this.getOne(id);
  }

  /* ------------------------------ طراح دیاگرام ------------------------------ */

  /**
   * ذخیرهٔ مختصات گره‌ها (درگ بوم) — حتی برای نسخهٔ در استفاده مجاز است چون
   * صرفاً نمایشی است و هیچ اثری روی موتور ندارد.
   */
  async saveLayout(id: bigint, dto: SaveLayoutDto) {
    const d = await this.prisma.workflowDefinition.findUnique({ where: { workflowDefinitionId: id } });
    if (!d) throw new NotFoundException("فرآیند یافت نشد");
    const nodes = await this.prisma.workflowNode.findMany({
      where: { definitionId: id },
    });
    const byId = new Map(nodes.map((n) => [Number(n.workflowNodeId), n]));
    let count = 0;
    for (const p of dto.positions ?? []) {
      const n = byId.get(p.nodeId);
      if (!n) continue;
      await this.prisma.workflowNode.update({
        where: { workflowNodeId: n.workflowNodeId },
        data: {
          posX: Math.max(0, Math.min(4000, Math.round(p.posX || 0))),
          posY: Math.max(0, Math.min(4000, Math.round(p.posY || 0))),
        },
      });
      count++;
    }
    return { ok: true, count };
  }

  /**
   * جایگزینی کامل گره‌ها/گذارها در یک تراکنش — قلب طراح بصری.
   * فقط نسخهٔ «بدون نمونهٔ گردش کار» ویرایش شدنی است (FR-01 — نسخهٔ در استفاده
   * قطعی است؛ ۴۰۹ با راهنمای «نسخهٔ جدید»). سرور قبل از نوشتن، دیاگرام را با
   * همان قواعدی که موتور اجرا می‌کند اعتبارسنجی می‌کند — دیاگرام نامعتبر هرگز
   * ذخیره نمی‌شود.
   */
  async saveGraph(id: bigint, dto: SaveGraphDto) {
    const d = await this.prisma.workflowDefinition.findUnique({ where: { workflowDefinitionId: id } });
    if (!d) throw new NotFoundException("فرآیند یافت نشد");
    /* t190 — فرآیند خاتمه‌یافته فقط-خواندنی است (فرمان مالک) */
    if (d.isTerminated) {
      throw new ConflictException("این فرآیند خاتمه یافته است — دیاگرام فقط-خواندنی است؛ برای ادامه «نسخهٔ جدید» بسازید یا «برگشت خاتمه» را بزنید");
    }
    const used = await this.prisma.workflowInstance.count({ where: { definitionId: id } });
    if (used > 0) {
      throw new ConflictException(
        `این نسخهٔ فرآیند در استفاده است (${used} نمونهٔ گردش کار) — برای ویرایش، «نسخهٔ جدید» بسازید`,
      );
    }

    const { nodeSpecs, transitionSpecs } = await this.validateAndNormalize(id, dto, d.entityType);

    await this.prisma.$transaction(async (tx) => {
      await tx.workflowTransition.deleteMany({ where: { definitionId: id } });
      await tx.workflowNode.deleteMany({ where: { definitionId: id } });
      const nodeIds = new Map<string, bigint>();
      for (const n of nodeSpecs) {
        const nid = await this.ids.generateNextIdInTx(tx, "WorkflowNode");
        const row = await tx.workflowNode.create({
          data: {
            workflowNodeId: BigInt(nid),
            definitionId: id,
            nodeCode: n.nodeCode,
            nodeType: n.nodeType,
            title: n.title,
            roleCode: n.roleCode,
            slaHours: n.slaHours,
            orderIndex: n.orderIndex,
            finalStatus: n.finalStatus,
            instanceState: n.instanceState,
            posX: n.posX,
            posY: n.posY,
          },
        });
        nodeIds.set(n.nodeCode, row.workflowNodeId);
      }
      for (const t of transitionSpecs) {
        const tid = await this.ids.generateNextIdInTx(tx, "WorkflowTransition");
        await tx.workflowTransition.create({
          data: {
            workflowTransitionId: BigInt(tid),
            definitionId: id,
            fromNodeId: nodeIds.get(t.fromCode)!,
            toNodeId: nodeIds.get(t.toCode)!,
            action: t.action,
            conditionExpr: t.conditionExpr,
            isDefault: t.isDefault,
          },
        });
      }
    });
    this.logger.log(`Graph replaced for ${d.code} v${d.processVersion} — ${nodeSpecs.length} nodes / ${transitionSpecs.length} transitions`);
    return this.getOne(id);
  }

  /**
   * نسخهٔ جدید از روی یک تعریف (کپی کامل گره/گذار با نگاشت ID تازه) — نسخهٔ
   * تازه غیرفعال است؛ پس از ویرایش با «فعال‌سازی» وارد موتور می‌شود. نمونه‌های
   * جاری به نسخهٔ خودشان ارجاع دارند و دست‌نخورده می‌مانند.
   */
  async createNewVersion(id: bigint) {
    const src = await this.prisma.workflowDefinition.findUnique({ where: { workflowDefinitionId: id } });
    if (!src) throw new NotFoundException("فرآیند یافت نشد");
    const max = await this.prisma.workflowDefinition.aggregate({
      where: { code: src.code },
      _max: { processVersion: true },
    });
    const nextVersion = (max._max.processVersion ?? 0) + 1;
    const defId = await this.ids.generateNextId("WorkflowDefinition");
    const created = await this.prisma.$transaction(async (tx) => {
      const def = await tx.workflowDefinition.create({
        data: {
          workflowDefinitionId: BigInt(defId),
          code: src.code,
          name: src.name,
          description: src.description,
          entityType: src.entityType,
          processVersion: nextVersion,
          thresholdAmount: src.thresholdAmount,
          isActive: false,
          creator: "designer",
          businessStructureRef: HEAD_OFFICE_NODE_ID,
        },
      });
      const nodes = await tx.workflowNode.findMany({ where: { definitionId: id } });
      const transitions = await tx.workflowTransition.findMany({ where: { definitionId: id } });
      const idMap = new Map<bigint, bigint>();
      for (const n of nodes) {
        const nid = await this.ids.generateNextIdInTx(tx, "WorkflowNode");
        const row = await tx.workflowNode.create({
          data: {
            workflowNodeId: BigInt(nid),
            definitionId: def.workflowDefinitionId,
            nodeCode: n.nodeCode,
            nodeType: n.nodeType,
            title: n.title,
            roleCode: n.roleCode,
            slaHours: n.slaHours,
            orderIndex: n.orderIndex,
            finalStatus: n.finalStatus,
            instanceState: n.instanceState,
            posX: n.posX,
            posY: n.posY,
          },
        });
        idMap.set(n.workflowNodeId, row.workflowNodeId);
      }
      for (const t of transitions) {
        const tid = await this.ids.generateNextIdInTx(tx, "WorkflowTransition");
        await tx.workflowTransition.create({
          data: {
            workflowTransitionId: BigInt(tid),
            definitionId: def.workflowDefinitionId,
            fromNodeId: idMap.get(t.fromNodeId)!,
            toNodeId: idMap.get(t.toNodeId)!,
            action: t.action,
            conditionExpr: t.conditionExpr,
            isDefault: t.isDefault,
          },
        });
      }
      return def;
    });
    this.logger.log(`New version ${src.code} v${nextVersion} copied from v${src.processVersion}`);
    return this.getOne(created.workflowDefinitionId);
  }

  /**
   * فعال‌سازی نسخه (فقط یک نسخهٔ فعال per entityType): ابتدا دیاگرام
   * اعتبارسنجی می‌شود (۴۰۰ با فهرست خطاها)، سپس در یک تراکنش بقیهٔ نسخه‌های
   * همان فرم خاموش و این نسخه روشن می‌شود.
   */
  async activate(id: bigint) {
    const d = await this.prisma.workflowDefinition.findUnique({ where: { workflowDefinitionId: id } });
    if (!d) throw new NotFoundException("فرآیند یافت نشد");
    /* t190 — نسخهٔ خاتمه‌یافته وارد موتور نمی‌شود */
    if (d.isTerminated) {
      throw new ConflictException("این فرآیند خاتمه یافته است — برای فعال‌سازی ابتدا «برگشت خاتمه» را بزنید");
    }
    const nodes = await this.prisma.workflowNode.findMany({ where: { definitionId: id } });
    const transitions = await this.prisma.workflowTransition.findMany({
      where: { definitionId: id },
    });
    const dto: SaveGraphDto = {
      nodes: nodes.map((n) => ({
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
        fromCode: nodes.find((n) => n.workflowNodeId === t.fromNodeId)?.nodeCode ?? "",
        toCode: nodes.find((n) => n.workflowNodeId === t.toNodeId)?.nodeCode ?? "",
        action: t.action,
        conditionExpr: t.conditionExpr,
        isDefault: t.isDefault,
      })),
    };
    const errs = await this.validateGraph(id, dto, d.entityType);
    if (errs.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: `${errs[0]}${errs.length > 1 ? ` (+${errs.length - 1} خطای دیگر)` : ""}`,
        errors: errs,
      });
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.workflowDefinition.updateMany({
        where: { entityType: d.entityType, isActive: true, NOT: { workflowDefinitionId: id } },
        data: { isActive: false },
      });
      await tx.workflowDefinition.update({
        where: { workflowDefinitionId: id },
        data: { isActive: true },
      });
    });
    this.logger.log(`Activated ${d.code} v${d.processVersion} (entityType=${d.entityType})`);
    return this.getOne(id);
  }

  async remove(id: bigint) {
    const d = await this.prisma.workflowDefinition.findUnique({ where: { workflowDefinitionId: id } });
    if (!d) throw new NotFoundException("فرآیند یافت نشد");
    /* t190 — نسخهٔ خاتمه‌یافته سابقهٔ فرآیندِ فرم است و حذف نمی‌شود */
    if (d.isTerminated) {
      throw new ConflictException("این فرآیند خاتمه یافته است — سابقهٔ فرآیند حذف‌شدنی نیست");
    }
    const used = await this.prisma.workflowInstance.count({ where: { definitionId: id } });
    if (used > 0) {
      throw new ConflictException(
        `این نسخهٔ فرآیند در استفاده است (${used} نمونهٔ گردش کار) — حذف ممکن نیست`,
      );
    }
    if (d.isActive) {
      const others = await this.prisma.workflowDefinition.count({
        where: { entityType: d.entityType, isActive: true, NOT: { workflowDefinitionId: id } },
      });
      if (others === 0) {
        throw new BadRequestException(
          "این تنها نسخهٔ فعال فرم است — ابتدا نسخهٔ دیگری را فعال کنید یا فرم را از مشارکت خارج کنید",
        );
      }
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.workflowTransition.deleteMany({ where: { definitionId: id } });
      await tx.workflowNode.deleteMany({ where: { definitionId: id } });
      await tx.workflowDefinition.delete({ where: { workflowDefinitionId: id } });
    });
    return { ok: true };
  }

  /* ------------------------------ اعتبارسنجی دیاگرام ------------------------------ */

  /**
   * اعتبارسنجی موتور-سازگار — همان قراردادهایی که InstancesService اجرا
   * می‌کند: یک شروع با یک گذارِ «ارسال به رسیدگی»، گرهٔ اقدام با سمتِ فعال و
   * گذارِ «تایید»، گرهٔ شرط با دو شاخه (شرطِ معتبر + پیش‌فرض «خیر»)، گرهٔ پایان
   * با وضعیت پایانی (D-4)، همهٔ گره‌ها قابل‌دسترس، «رد» فقط به گرهٔ پایانِ رد.
   */
  private async validateAndNormalize(
    defId: bigint,
    dto: SaveGraphDto,
    entityType: string,
  ): Promise<{ nodeSpecs: Required<import("./definitions.dto").GraphNodeDto>[]; transitionSpecs: Required<import("./definitions.dto").GraphTransitionDto>[] }> {
    const errs = await this.validateGraph(defId, dto, entityType);
    if (errs.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: `${errs[0]}${errs.length > 1 ? ` (+${errs.length - 1} خطای دیگر)` : ""}`,
        errors: errs,
      });
    }
    const nodes = [...dto.nodes].map((n, i) => ({
      nodeCode: n.nodeCode.trim(),
      nodeType: n.nodeType,
      title: n.title.trim(),
      roleCode: (n.roleCode ?? "").trim(),
      slaHours: n.slaHours ?? null,
      orderIndex: n.orderIndex ?? i + 1,
      finalStatus: n.finalStatus ?? null,
      instanceState: (n.instanceState ?? "").trim(),
      posX: Math.max(0, Math.min(4000, Math.round(n.posX ?? 0))),
      posY: Math.max(0, Math.min(4000, Math.round(n.posY ?? 0))),
    }));
    const transitions = [...dto.transitions].map((t) => ({
      fromCode: t.fromCode.trim(),
      toCode: t.toCode.trim(),
      action: t.action.trim(),
      conditionExpr: (t.conditionExpr ?? "").trim(),
      isDefault: !!t.isDefault,
    }));
    return { nodeSpecs: nodes, transitionSpecs: transitions };
  }

  private async validateGraph(
    _defId: bigint,
    dto: SaveGraphDto,
    _entityType: string,
  ): Promise<string[]> {
    const errs: string[] = [];
    const nodes = dto.nodes ?? [];
    const transitions = dto.transitions ?? [];

    if (nodes.length < 2) errs.push("دیاگرام حداقل باید یک گرهٔ شروع و یک گرهٔ پایان داشته باشد");
    const codes = nodes.map((n) => (n.nodeCode ?? "").trim());
    if (codes.some((c) => !c)) errs.push("همهٔ گره‌ها باید کد داشته باشند");
    if (new Set(codes).size !== codes.length) errs.push("کد گره‌ها باید یکتا باشد");
    for (const n of nodes) {
      if (!NODE_TYPES.has(n.nodeType)) errs.push(`نوع گرهٔ «${n.title}» نامعتبر است`);
      if (!(n.title ?? "").trim()) errs.push("همهٔ گره‌ها باید عنوان داشته باشند");
    }

    const starts = nodes.filter((n) => n.nodeType === "start");
    if (starts.length !== 1) errs.push("دقیقاً یک گرهٔ شروع لازم است");
    const ends = nodes.filter((n) => n.nodeType === "end");
    if (ends.length < 1) errs.push("حداقل یک گرهٔ پایان لازم است");
    const byCode = new Map(nodes.map((n) => [(n.nodeCode ?? "").trim(), n]));

    for (const t of transitions) {
      const from = (t.fromCode ?? "").trim();
      const to = (t.toCode ?? "").trim();
      if (!byCode.has(from) || !byCode.has(to)) {
        errs.push(`گذار «${t.action}» به گرهٔ ناموجود اشاره می‌کند`);
        continue;
      }
      if (from === to) errs.push("گذار از یک گره به خودش مجاز نیست");
      const action = (t.action ?? "").trim();
      if (!action) errs.push(`گذار از ${from} به ${to} بدون اقدام است`);
      else if (!VALID_ACTIONS.has(action))
        errs.push(`اقدام «${action}» معتبر نیست (ارسال به رسیدگی / تایید / رد / بله / خیر)`);
    }

    /* شروع: یک گذار خروجی با اقدام «ارسال به رسیدگی» (D-3) */
    if (starts.length === 1) {
      const outs = transitions.filter((t) => (t.fromCode ?? "").trim() === starts[0].nodeCode);
      if (outs.length !== 1) errs.push("گرهٔ شروع باید دقیقاً یک گذار خروجی داشته باشد");
      else if ((outs[0].action ?? "").trim() !== "ارسال به رسیدگی")
        errs.push("اقدام گذارِ خروجی گرهٔ شروع باید «ارسال به رسیدگی» باشد");
    }

    /* گرهٔ اقدام: سمتِ فعال + گذارِ «تایید»؛ «رد» فقط به گرهٔ پایانِ رد */
    const roles = await this.prisma.workflowRole.findMany({ where: { isActive: true } });
    const roleCodes = new Set(roles.map((r) => r.code));
    for (const n of nodes.filter((x) => x.nodeType === "action")) {
      const outs = transitions.filter((t) => (t.fromCode ?? "").trim() === n.nodeCode);
      if (!(n.roleCode ?? "").trim()) errs.push(`گرهٔ اقدام «${n.title}» بدون سمت است`);
      else if (!roleCodes.has((n.roleCode ?? "").trim()))
        errs.push(`سمت «${n.roleCode}» در گرهٔ «${n.title}» موجود/فعال نیست`);
      if (!outs.some((t) => (t.action ?? "").trim() === "تایید"))
        errs.push(`گرهٔ اقدام «${n.title}» گذارِ «تایید» ندارد`);
      for (const t of outs.filter((x) => (x.action ?? "").trim() === "رد")) {
        const target = byCode.get((t.toCode ?? "").trim());
        if (!target || target.nodeType !== "end" || target.instanceState !== "rejected") {
          errs.push(`گذار «رد» از گرهٔ «${n.title}» باید به گرهٔ پایانِ «ردشده» برسد`);
        }
      }
    }

    /* گرهٔ شرط: دو شاخه — شرطِ معتبر + پیش‌فرضِ یکتا (خیر) */
    for (const n of nodes.filter((x) => x.nodeType === "condition")) {
      const outs = transitions.filter((t) => (t.fromCode ?? "").trim() === n.nodeCode);
      if (outs.length < 2) errs.push(`گرهٔ شرط «${n.title}» باید دو شاخه (بله/خیر) داشته باشد`);
      const defaults = outs.filter((t) => t.isDefault);
      if (defaults.length !== 1)
        errs.push(`گرهٔ شرط «${n.title}» باید دقیقاً یک شاخهٔ پیش‌فرض (خیر) داشته باشد`);
      for (const t of outs.filter((x) => !x.isDefault)) {
        if (!CONDITION_RE.test((t.conditionExpr ?? "").trim())) {
          errs.push(
            `شرط گذار از گرهٔ «${n.title}» معتبر نیست — قالب مجاز: amount > threshold (یا عملگرهای >= <= == != < با عدد ثابت)`,
          );
        }
      }
    }

    /* گرهٔ پایان: وضعیت پایانی (D-4) + جفت‌سازی instanceState؛ بدون گذار خروجی */
    for (const n of ends) {
      if (n.finalStatus === undefined || n.finalStatus === null || Number.isNaN(Number(n.finalStatus)))
        errs.push(`گرهٔ پایان «${n.title}» بدون وضعیت پایانی سند است (D-4)`);
      if (n.instanceState !== "approved" && n.instanceState !== "rejected")
        errs.push(`گرهٔ پایان «${n.title}» باید سرنوشتِ approved یا rejected داشته باشد`);
      if (
        n.instanceState === "rejected" &&
        n.finalStatus !== null &&
        n.finalStatus !== undefined &&
        Number(n.finalStatus) !== 1
      ) {
        errs.push(`گرهٔ پایانِ رد «${n.title}» باید وضعیت پایانی ۱ (ثبت اولیه) داشته باشد`);
      }
      if (transitions.some((t) => (t.fromCode ?? "").trim() === n.nodeCode))
        errs.push(`گرهٔ پایان «${n.title}» نباید گذار خروجی داشته باشد`);
    }

    /* دسترس‌پذیری: همهٔ گره‌ها از شروع قابل‌رسیدن‌اند */
    if (starts.length === 1) {
      const adj = new Map<string, string[]>();
      for (const t of transitions) {
        const f = (t.fromCode ?? "").trim();
        const to = (t.toCode ?? "").trim();
        if (!adj.has(f)) adj.set(f, []);
        adj.get(f)!.push(to);
      }
      const seen = new Set<string>([starts[0].nodeCode]);
      const queue = [starts[0].nodeCode];
      while (queue.length) {
        const cur = queue.shift()!;
        for (const nxt of adj.get(cur) ?? []) {
          if (!seen.has(nxt)) {
            seen.add(nxt);
            queue.push(nxt);
          }
        }
      }
      for (const n of nodes) {
        if (!seen.has(n.nodeCode)) errs.push(`گرهٔ «${n.title}» از شروع قابل‌دسترس نیست (گذار ورودی ندارد)`);
      }
    }

    /* گذار تکراری */
    const seenKeys = new Set<string>();
    for (const t of transitions) {
      const key = `${(t.fromCode ?? "").trim()}|${(t.toCode ?? "").trim()}|${(t.action ?? "").trim()}`;
      if (seenKeys.has(key)) errs.push("گذار تکراری (مبدأ/مقصد/اقدام یکسان) مجاز نیست");
      seenKeys.add(key);
    }

    return errs;
  }
}
