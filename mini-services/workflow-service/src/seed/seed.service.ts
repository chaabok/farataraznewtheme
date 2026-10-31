import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { HEAD_OFFICE_NODE_ID } from "../../../_shared/app-base-entity";

/**
 * SeedService — بوت workflow.db (t177 — فاز ۱):
 *  · ۴ سمت پیش‌فرض گردش کار (D-1 — سمت‌های جدید، نه نقش‌های auth)
 *  · فرآیند مرجع WF-VOUCHER نسخهٔ ۱ — عیناً فلوچارت مصوب (diagram-1، t176):
 *    گلوگاه ورود «تایید کاربر» + اقدام «ارسال به رسیدگی»، رسیدگی حسابدار،
 *    تایید سرپرست، شرط آستانهٔ per فرم (D-2)، تایید مدیر، پایان با وضعیت
 *    پایانی تعریف‌شده در گرهٔ پایان (D-4) و گرهٔ رد با برگشت به ثبت اولیه.
 *  · نگاشت وضعیت سند (FR-11): ۱ pre-entry · ۵ entry-gate · ۲ excluded ·
 *    ۳/۴ engine-final.
 * Idempotent: اگر ردیف‌های seed موجود باشند دست نمی‌زند.
 */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ids: IdGenerationService,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedVoucherDefinition();
    await this.seedStatusMap();
    await this.seedEntityCatalog();
    await this.repairVoucherLayout();
  }

  private async seedRoles() {
    const count = await this.prisma.workflowRole.count();
    if (count > 0) return;
    const roles = [
      { code: "RS-REGISTRANT", title: "کاربر ثبت‌کننده", description: "آغازگر گردش کار — ارسال سند به رسیدگی (فاز ۱ فلوچارت)" },
      { code: "RS-ACCOUNTANT", title: "حسابدار رسیدگی", description: "بازبینی اقلام و تطابق با مدرک پشتیبان (فاز ۲ فلوچارت)" },
      { code: "RS-SUPERVISOR", title: "سرپرست رسیدگی", description: "بررسی معیارهای کنترلی و انطباق با بودجه (فاز ۳ فلوچارت)" },
      { code: "RS-MANAGER", title: "مدیر رسیدگی", description: "ایستگاه تایید اسناد بالاتر از آستانهٔ فرم (فاز ۳ فلوچارت — شرط D-2)" },
    ];
    for (const r of roles) {
      const id = await this.ids.generateNextId("WorkflowRole");
      await this.prisma.workflowRole.create({
        data: {
          workflowRoleId: BigInt(id),
          code: r.code,
          title: r.title,
          description: r.description,
          isSystem: true,
          creator: "system",
          businessStructureRef: HEAD_OFFICE_NODE_ID,
        },
      });
    }
    this.logger.log(`Seeded ${roles.length} workflow roles (سمت‌های گردش کار — D-1)`);
  }

  private async seedVoucherDefinition() {
    const existing = await this.prisma.workflowDefinition.findFirst({
      where: { code: "WF-VOUCHER", processVersion: 1 },
    });
    if (existing) return;

    const defId = await this.ids.generateNextId("WorkflowDefinition");
    const def = await this.prisma.workflowDefinition.create({
      data: {
        workflowDefinitionId: BigInt(defId),
        code: "WF-VOUCHER",
        name: "گردش رسیدگی سند حسابداری",
        entityType: "voucher",
        processVersion: 1,
        // D-2 — آستانهٔ per فرم (نمونهٔ قابل ویرایش؛ ۱۰۰ میلیون ریال)
        thresholdAmount: 100_000_000,
        isActive: true,
        creator: "system",
        businessStructureRef: HEAD_OFFICE_NODE_ID,
      },
    });
    const defBig = def.workflowDefinitionId;

    const nodeSpecs = [
      { nodeCode: "N1", nodeType: "start", title: "شروع — گلوگاه ورود: تایید کاربر", roleCode: "", orderIndex: 1, finalStatus: null, instanceState: "", slaHours: null },
      { nodeCode: "N2", nodeType: "action", title: "رسیدگی و مطابقت (حسابدار رسیدگی)", roleCode: "RS-ACCOUNTANT", orderIndex: 2, finalStatus: null, instanceState: "", slaHours: 24 },
      { nodeCode: "N3", nodeType: "action", title: "تایید سرپرست رسیدگی", roleCode: "RS-SUPERVISOR", orderIndex: 3, finalStatus: null, instanceState: "", slaHours: 24 },
      { nodeCode: "N4", nodeType: "condition", title: "جمع سند بالاتر از آستانهٔ فرم است؟", roleCode: "", orderIndex: 4, finalStatus: null, instanceState: "", slaHours: null },
      { nodeCode: "N5", nodeType: "action", title: "تایید مدیر رسیدگی", roleCode: "RS-MANAGER", orderIndex: 5, finalStatus: null, instanceState: "", slaHours: 48 },
      { nodeCode: "N6", nodeType: "end", title: "پایان موفق رسیدگی", roleCode: "", orderIndex: 6, finalStatus: 4, instanceState: "approved", slaHours: null },
      { nodeCode: "N7", nodeType: "end", title: "ردشده — برگشت به ثبت‌کننده (وضعیت ۱)", roleCode: "", orderIndex: 7, finalStatus: 1, instanceState: "rejected", slaHours: null },
    ];
    const nodeIds = new Map<string, bigint>();
    for (const n of nodeSpecs) {
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
          orderIndex: n.orderIndex,
          finalStatus: n.finalStatus,
          instanceState: n.instanceState,
        },
      });
      nodeIds.set(n.nodeCode, row.workflowNodeId);
    }

    const transitionSpecs = [
      { from: "N1", to: "N2", action: "ارسال به رسیدگی", conditionExpr: "", isDefault: false },
      { from: "N2", to: "N3", action: "تایید", conditionExpr: "", isDefault: false },
      { from: "N2", to: "N7", action: "رد", conditionExpr: "", isDefault: false },
      { from: "N3", to: "N4", action: "تایید", conditionExpr: "", isDefault: false },
      { from: "N4", to: "N5", action: "بله", conditionExpr: "amount > threshold", isDefault: false },
      { from: "N4", to: "N6", action: "خیر", conditionExpr: "", isDefault: true },
      { from: "N5", to: "N6", action: "تایید", conditionExpr: "", isDefault: false },
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
    this.logger.log("Seeded WF-VOUCHER v1 (۷ گره / ۷ گذار — فلوچارت مصوب t176)");
  }

  private async seedStatusMap() {
    const count = await this.prisma.workflowStatusMap.count();
    if (count > 0) return;
    const rows = [
      { formStatus: 1, gateType: "pre-entry", description: "ثبت اولیه — پیش از ورود؛ مقصد گرهٔ رد" },
      { formStatus: 2, gateType: "excluded", description: "یادداشت — خارج از چرخه (D-3)" },
      { formStatus: 3, gateType: "engine-final", description: "تاییدشده — فقط از مسیر موتور" },
      { formStatus: 4, gateType: "engine-final", description: "دائمی — نمونهٔ وضعیت پایانی گرهٔ پایان (D-4)" },
      { formStatus: 5, gateType: "entry-gate", description: "تایید کاربر — گلوگاه ورود با اقدام «ارسال به رسیدگی» (D-3)" },
    ];
    for (const r of rows) {
      const id = await this.ids.generateNextId("WorkflowStatusMap");
      await this.prisma.workflowStatusMap.create({
        data: {
          workflowStatusMapId: BigInt(id),
          entityType: "voucher",
          formStatus: r.formStatus,
          gateType: r.gateType,
          description: r.description,
          creator: "system",
          businessStructureRef: HEAD_OFFICE_NODE_ID,
        },
      });
    }
    this.logger.log("Seeded voucher status map (۵ ردیف — FR-11 / D-3)");
  }

  /**
   * t180 فاز ۴ — کاتالوگ فرم‌های دارای فیلد وضعیت (تصمیم مالک: انتخاب فرم‌ها
   * با کاربر). فعلاً فقط «سند حسابداری» هم آداپتور متصل دارد (t178) و هم
   * مشارکت فعال — بقیهٔ فرم‌ها کاندیدند و پس از اتصال آداپتور انتخاب‌شدنی
   * می‌شوند (AdapterReady=false ⇒ انتخاب‌شدنی نیست).
   */
  private async seedEntityCatalog() {
    const count = await this.prisma.workflowEntityCatalog.count();
    if (count > 0) return;
    const rows = [
      {
        entityType: "voucher",
        formTitle: "سند حسابداری",
        softwareName: "حسابداری",
        description: "چرخهٔ رسیدگی سند: ارسال به رسیدگی پس از تایید کاربر (D-3) تا وضعیت پایانی گرهٔ پایان (D-4)",
        adapterReady: true,
        participates: true,
      },
      {
        entityType: "contract",
        formTitle: "قرارداد",
        softwareName: "قراردادها",
        description: "فرم دارای فیلد وضعیت — آداپتور مشترک هنوز متصل نشده است",
        adapterReady: false,
        participates: false,
      },
      {
        entityType: "chart-account",
        formTitle: "درختواره حساب‌ها",
        softwareName: "حسابداری",
        description: "فرم دارای فیلد وضعیت — آداپتور مشترک هنوز متصل نشده است",
        adapterReady: false,
        participates: false,
      },
      {
        entityType: "user",
        formTitle: "کاربر جدید",
        softwareName: "تنظیمات",
        description: "فرم دارای فیلد وضعیت — آداپتور مشترک هنوز متصل نشده است",
        adapterReady: false,
        participates: false,
      },
      {
        entityType: "counterparty",
        formTitle: "طرف حساب",
        softwareName: "حسابداری",
        description: "فرم دارای فیلد وضعیت — آداپتور مشترک هنوز متصل نشده است",
        adapterReady: false,
        participates: false,
      },
    ];
    for (const r of rows) {
      const id = await this.ids.generateNextId("WorkflowEntityCatalog");
      await this.prisma.workflowEntityCatalog.create({
        data: {
          workflowEntityCatalogId: BigInt(id),
          entityType: r.entityType,
          formTitle: r.formTitle,
          softwareName: r.softwareName,
          description: r.description,
          adapterReady: r.adapterReady,
          participates: r.participates,
          creator: "system",
          businessStructureRef: HEAD_OFFICE_NODE_ID,
        },
      });
    }
    this.logger.log(
      "Seeded workflow entity catalog (۵ فرم دارای وضعیت — مشارکت فعلاً فقط سند حسابداری)",
    );
  }

  /**
   * t180 فاز ۴ — ترمیم یک‌بارهٔ مختصات بوم طراح برای نسخه‌های قدیمی که گره‌هایشان
   * همه روی ۰/۰ است (فارغ از حالت «در استفاده» — جابجایی صرفاً نمایشی است).
   */
  private async repairVoucherLayout() {
    const defs = await this.prisma.workflowDefinition.findMany();
    for (const d of defs) {
      const nodes = await this.prisma.workflowNode.findMany({ where: { definitionId: d.workflowDefinitionId } });
      if (nodes.length === 0 || nodes.some((n) => n.posX !== 0 || n.posY !== 0)) continue;
      /* چیدمان پیش‌فرض بوم — عیناً ترتیب فلوچارت مصوب */
      const layout: Record<string, { x: number; y: number }> = {
        N1: { x: 340, y: 30 },
        N2: { x: 340, y: 150 },
        N3: { x: 340, y: 270 },
        N4: { x: 340, y: 390 },
        N5: { x: 620, y: 510 },
        N6: { x: 340, y: 640 },
        N7: { x: 60, y: 270 },
      };
      for (const n of nodes) {
        const pos = layout[n.nodeCode];
        if (!pos) continue;
        await this.prisma.workflowNode.update({
          where: { workflowNodeId: n.workflowNodeId },
          data: { posX: pos.x, posY: pos.y },
        });
      }
      this.logger.log(`Repaired designer layout for ${d.code} v${d.processVersion}`);
    }
  }
}
