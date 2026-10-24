import { Injectable, BadRequestException, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { CreateMenuDto, UpdateMenuDto } from "./menus.dto";
import { appBaseOnCreate, appBaseOnUpdate, SYSTEM_ACTOR } from "../../../_shared/app-base-entity";
import { toPlain } from "../shared/serialize";

/** lucide iconKeys allowed for user-created menus (mirror of frontend APP_ICONS keys). */
export const MENU_ICON_KEYS = [
  "settings", "calculator", "receiptsPayment", "warehouse", "cart", "landmark", "packageSearch",
  "globe", "sigma", "truckCheck", "factory", "handCoins", "users", "fileStack", "heartHandshake",
  "wrench", "userCog", "workflow", "messageSquare", "store", "megaphone", "snowflake", "flame",
  "fileBarChart", "barChart", "hammer", "boxes", "folder", "listTree", "clipboardList", "notebookPen",
] as const;

/**
 * DfbMenu service — درخت آیکون‌ها/زیرمنوهای فرمساز.
 * System icon nodes (IsSystem=true) are catalog-synced and read-only for users;
 * user nodes ( NodeType=1 icons with ParentRef=0, NodeType=2 submenus ) are fully editable.
 */
@Injectable()
export class MenusService {
  private readonly logger = new Logger(MenusService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** Full tree: icons → submenus → forms (leaves), per the owner's builder contract. */
  async tree() {
    const menus = await this.prisma.dfbMenu.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    const forms = await this.prisma.dfbForm.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true, menuRef: true, code: true, title: true, titleEn: true,
        componentKey: true, status: true, isSystem: true, systemKey: true, version: true,
      },
    });
    const byParent = new Map<number, Array<Record<string, unknown>>>();
    const nodeById = new Map<number, Record<string, unknown>>();
    for (const m of menus) {
      const parent = Number(m.parentRef);
      const node: Record<string, unknown> = {
        id: Number(m.id),
        parentRef: parent,
        nodeType: m.nodeType,
        code: m.code,
        title: m.title,
        titleEn: m.titleEn,
        iconKey: m.iconKey,
        appKey: m.appKey,
        sortOrder: m.sortOrder,
        isSystem: m.isSystem,
        version: m.version,
        forms: [] as Array<Record<string, unknown>>,
        children: [] as Array<Record<string, unknown>>,
      };
      const list = byParent.get(parent) ?? [];
      list.push(node);
      byParent.set(parent, list);
      nodeById.set(Number(m.id), node);
    }
    for (const f of forms) {
      const target = nodeById.get(Number(f.menuRef));
      if (target) {
        (target.forms as Array<Record<string, unknown>>).push({
          id: Number(f.id),
          menuRef: Number(f.menuRef),
          code: f.code,
          title: f.title,
          titleEn: f.titleEn,
          componentKey: f.componentKey,
          status: f.status,
          isSystem: f.isSystem,
          systemKey: f.systemKey,
          version: f.version,
        });
      }
    }
    const attach = (nodes: Array<Record<string, unknown>>) => {
      for (const n of nodes) {
        const kids = byParent.get(n.id as number) ?? [];
        n.children = kids;
        attach(kids);
      }
    };
    const roots = byParent.get(0) ?? [];
    attach(roots);
    return { items: toPlain(roots) };
  }

  async create(dto: CreateMenuDto) {
    const parentRef = BigInt(dto.parentRef ?? 0);
    const nodeType = dto.nodeType ?? (parentRef === 0n ? 1 : 2);
    if (parentRef !== 0n) {
      const parent = await this.prisma.dfbMenu.findUnique({ where: { id: parentRef } });
      if (!parent || !parent.isActive) throw new BadRequestException("منوی والد یافت نشد");
    }
    const iconKey =
      dto.iconKey && (MENU_ICON_KEYS as readonly string[]).includes(dto.iconKey)
        ? dto.iconKey
        : parentRef === 0n ? "boxes" : "folder";
    const id = await this.idGen.generateNextId("DfbMenu");
    const row = await this.prisma.dfbMenu.create({
      data: {
        id: BigInt(id),
        parentRef,
        nodeType,
        code: `DFB-M-${id}`,
        title: dto.title,
        titleEn: dto.titleEn ?? null,
        iconKey,
        sortOrder: id,
        isSystem: false,
        isActive: true,
        ...appBaseOnCreate(SYSTEM_ACTOR),
      },
    });
    this.logger.log(`DfbMenu created ID=${id} type=${nodeType} parent=${parentRef}`);
    return toPlain(row);
  }

  async update(id: number, dto: UpdateMenuDto) {
    const existing = await this.prisma.dfbMenu.findUnique({ where: { id: BigInt(id) } });
    if (!existing) throw new NotFoundException("منو یافت نشد");
    if (existing.isSystem) {
      // system nodes: catalog-driven fields stay catalog-owned (§4.1); only isActive flips
      if (dto.isActive === undefined) throw new BadRequestException("گره سیستمی فقط فعال/غیرفعال می‌شود");
      const row = await this.prisma.dfbMenu.update({
        where: { id: existing.id },
        data: { isActive: dto.isActive, ...appBaseOnUpdate(SYSTEM_ACTOR) },
      });
      return toPlain(row);
    }
    const data: Record<string, unknown> = { ...appBaseOnUpdate(SYSTEM_ACTOR) };
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.titleEn !== undefined) data.titleEn = dto.titleEn;
    if (dto.iconKey !== undefined && (MENU_ICON_KEYS as readonly string[]).includes(dto.iconKey)) {
      data.iconKey = dto.iconKey;
    }
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    const row = await this.prisma.dfbMenu.update({ where: { id: existing.id }, data });
    return toPlain(row);
  }

  async remove(id: number) {
    const existing = await this.prisma.dfbMenu.findUnique({ where: { id: BigInt(id) } });
    if (!existing) throw new NotFoundException("منو یافت نشد");
    if (existing.isSystem) throw new BadRequestException("آیکون سیستمی حذف‌شدنی نیست");
    const childCount = await this.prisma.dfbMenu.count({ where: { parentRef: BigInt(id) } });
    if (childCount > 0) throw new BadRequestException("ابتدا زیرمنوهای این منو را حذف کنید");
    const formCount = await this.prisma.dfbForm.count({ where: { menuRef: BigInt(id) } });
    if (formCount > 0) throw new BadRequestException("ابتدا فرم‌های این منو را حذف کنید");
    await this.prisma.dfbMenu.delete({ where: { id: BigInt(id) } });
    /* Task 68 — ترجمه‌های این منو هم پاک می‌شوند */
    await this.prisma.dfbTranslation.deleteMany({
      where: { entityType: "Menu", entityRef: BigInt(id) },
    });
    return { ok: true };
  }
}
