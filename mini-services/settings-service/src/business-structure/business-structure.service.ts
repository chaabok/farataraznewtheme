import { Injectable, HttpException, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { CreateBsDto, UpdateBsDto } from "./business-structure.dto";

/**
 * Parent-driven level rules (spec §1-4; Task 34 adds type 5 Store as the
 * retail leaf level) — single source of truth on the server:
 *   root (Headquarters, type=null) → [1,2,3,4,5]
 *   1 Holding → [2,3,4,5]   2 Company → [2,3,4,5]
 *   3 Branch → [4,5]        4 Agency → [4,5]   5 Store → leaf (no children)
 * Max depth: 5 levels below the root (Task 34: 4 → 5 for the Store level).
 *
 * Task 79 — type ticks on the root (ActiveStructureTypes) gate which structure
 * types may be DEFINED at all: effective enabled types = union of the
 * system-mandated Holding (1 — ticked by default on install, the user cannot
 * remove it) and the ticks saved on the root node. Unticking a type blocks
 * only NEW nodes of that type (existing nodes are preserved).
 */
const TYPE_FA: Record<number, string> = {
  1: "هلدینگ",
  2: "شرکت",
  3: "شعبه",
  4: "نمایندگی",
  5: "فروشگاه",
};

function parseTypesJson(raw: string | null | undefined): number[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is number => typeof x === "number" && Number.isInteger(x) && x >= 1 && x <= 5,
    );
  } catch {
    return [];
  }
}
const CHILD_TYPE_RULES: Record<number, number[]> = {
  1: [2, 3, 4, 5],
  2: [2, 3, 4, 5],
  3: [4, 5],
  4: [4, 5],
  5: [],
};
const ROOT_ALLOWED = [1, 2, 3, 4, 5];
const MAX_DEPTH = 5;
const ROOT_ID = 1;

function allowedChildTypes(parentType: number | null): number[] {
  if (parentType == null) return ROOT_ALLOWED;
  return CHILD_TYPE_RULES[parentType] ?? [];
}

function fail(status: number, message: string, messageKey?: string): never {
  throw new HttpException({ statusCode: status, message, messageKey }, status);
}

@Injectable()
export class BusinessStructureService {
  private readonly logger = new Logger(BusinessStructureService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /* ------------------------------- mapping ------------------------------ */

  private toDto(n: {
    id: bigint;
    parentRef: bigint;
    code: string;
    title: string;
    titleEn: string | null;
    businessStructureType: number | null;
    manager: string | null;
    logoUrl: string | null;
    isBasicInfoShared: boolean;
    activeStructureTypes: string | null;
    isActive: boolean;
    isSystem: boolean;
    version: number;
  }) {
    return {
      id: Number(n.id),
      parentRef: Number(n.parentRef),
      code: n.code,
      title: n.title,
      titleEn: n.titleEn,
      businessStructureType: n.businessStructureType,
      manager: n.manager,
      logoUrl: n.logoUrl,
      isBasicInfoShared: n.isBasicInfoShared,
      activeStructureTypes: n.activeStructureTypes,
      isActive: n.isActive,
      isSystem: n.isSystem,
      version: n.version,
      childCount: 0,
    };
  }

  /** Task 79 — effective enabled types = {1 Holding} ∪ root ticks. */
  private async effectiveActiveTypes(): Promise<number[]> {
    const root = await this.prisma.businessStructure.findUnique({
      where: { id: BigInt(ROOT_ID) },
      select: { activeStructureTypes: true },
    });
    return [...new Set([1, ...parseTypesJson(root?.activeStructureTypes)])].sort(
      (a, b) => a - b,
    );
  }

  /* --------------------------------- read -------------------------------- */

  async list() {
    const [items, childGroups] = await Promise.all([
      this.prisma.businessStructure.findMany({ orderBy: { code: "asc" } }),
      this.prisma.businessStructure.groupBy({ by: ["parentRef"], _count: { parentRef: true } }),
    ]);
    const counts = new Map<number, number>();
    for (const g of childGroups) counts.set(Number(g.parentRef), g._count.parentRef);

    const definedTypes = [
      ...new Set(
        items.map((i) => i.businessStructureType).filter((t): t is number => t != null),
      ),
    ].sort((a, b) => a - b);

    return {
      items: items.map((n) => ({ ...this.toDto(n), childCount: counts.get(Number(n.id)) ?? 0 })),
      definedTypes,
    };
  }

  /* -------------------------------- create ------------------------------- */

  async create(dto: CreateBsDto) {
    const parent = await this.prisma.businessStructure.findUnique({
      where: { id: BigInt(dto.parentRef) },
    });
    if (!parent) fail(404, "گرهٔ والد یافت نشد", "bs.msg.loadError");

    const parentType = parent.id === BigInt(ROOT_ID) ? null : parent.businessStructureType;
    const allowed = allowedChildTypes(parentType ?? null);
    if (!allowed.includes(dto.businessStructureType)) {
      fail(422, `نوع مجاز برای این والد: ${allowed.join(", ")}`, "bs.val.typeRequired");
    }

    // Task 79 — the type must be ticked on the root (Holding is always on)
    const effective = await this.effectiveActiveTypes();
    if (!effective.includes(dto.businessStructureType)) {
      fail(
        422,
        `تعریف شاخه از نوع «${TYPE_FA[dto.businessStructureType] ?? dto.businessStructureType}» فعال نیست — ابتدا در دفتر مرکزی تیک آن را بزنید`,
        "bs.val.typeDisabled",
      );
    }

    const depth = await this.depthOf(parent);
    if (depth + 1 > MAX_DEPTH) {
      fail(422, "حداکثر عمق ساختار (۵ سطح) تکمیل است");
    }

    // id generation runs in its own short transaction (spec §6; gaps accepted)
    const newId = await this.idGen.generateNextId("BusinessStructure");

    const created = await this.prisma.$transaction(async (tx) => {
      const code = await this.nextChildCode(tx, parent);
      try {
        return await tx.businessStructure.create({
          data: {
            id: BigInt(newId),
            parentRef: BigInt(dto.parentRef),
            code,
            title: dto.title.trim(),
            titleEn: dto.titleEn.trim(),
            businessStructureType: dto.businessStructureType,
            manager: dto.manager?.trim() || null,
            logoUrl: dto.logoUrl ?? null,
            isActive: dto.isActive ?? true,
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          fail(409, "کد تکراری است — دوباره تلاش کنید");
        }
        throw e;
      }
    });

    return { item: this.toDto(created) };
  }

  /* -------------------------------- update ------------------------------- */

  async update(id: number, dto: UpdateBsDto) {
    const node = await this.prisma.businessStructure.findUnique({ where: { id: BigInt(id) } });
    if (!node) fail(404, "گره یافت نشد", "bs.msg.loadError");

    if (node.id === BigInt(ROOT_ID)) {
      // Task 79 — the Holding tick is system-mandated: it can never be removed
      if (
        dto.activeStructureTypes !== undefined &&
        !dto.activeStructureTypes.includes(1)
      ) {
        fail(
          422,
          "تیک «هلدینگ» پیش‌فرض سیستم است و قابل برداشتن نیست",
          "bs.val.holdingLocked",
        );
      }
      /* ---- ROOT MODE: single-endpoint transaction (entity + Setting mirror) ---- */
      const updated = await this.prisma.$transaction(async (tx) => {
        const row = await tx.businessStructure.update({
          where: { id: BigInt(ROOT_ID) },
          data: {
            isBasicInfoShared: dto.isBasicInfoShared ?? node.isBasicInfoShared,
            activeStructureTypes:
              dto.activeStructureTypes !== undefined
                ? JSON.stringify(dto.activeStructureTypes)
                : node.activeStructureTypes,
            isActive: dto.isActive ?? node.isActive,
            // §2.5: Version is auto-bumped by the global PrismaService middleware
          },
        });
        const kv: Array<[string, string]> = [
          ["bs.shareHeadquarterData", String(row.isBasicInfoShared)],
          ["bs.activeStructureTypes", row.activeStructureTypes ?? "[]"],
        ];
        for (const [key, value] of kv) {
          await tx.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
        }
        return row;
      });
      return { item: this.toDto(updated) };
    }

    /* ---- NON-ROOT MODE ---- */
    const parent = await this.prisma.businessStructure.findUnique({
      where: { id: node.parentRef },
    });

    if (dto.title !== undefined && !dto.title.trim()) fail(422, "عنوان الزامی است", "bs.val.titleRequired");
    if (dto.titleEn !== undefined && !dto.titleEn.trim())
      fail(422, "عنوان لاتین الزامی است", "bs.val.titleEnRequired");

    if (dto.businessStructureType !== undefined && dto.businessStructureType !== node.businessStructureType) {
      const parentType = parent && parent.id === BigInt(ROOT_ID) ? null : (parent?.businessStructureType ?? null);
      if (!allowedChildTypes(parentType).includes(dto.businessStructureType)) {
        fail(422, "نوع انتخابی با قواعد سطح والد سازگار نیست", "bs.val.typeRequired");
      }
      // Task 79 — changing a node TO an unticked type is also a definition
      if (!(await this.effectiveActiveTypes()).includes(dto.businessStructureType)) {
        fail(
          422,
          `تعریف شاخه از نوع «${TYPE_FA[dto.businessStructureType] ?? dto.businessStructureType}» فعال نیست — ابتدا در دفتر مرکزی تیک آن را بزنید`,
          "bs.val.typeDisabled",
        );
      }
      // children of this node must remain legal under the new type
      const childTypes = await this.prisma.businessStructure.findMany({
        where: { parentRef: node.id },
        select: { businessStructureType: true },
      });
      for (const c of childTypes) {
        if (c.businessStructureType != null &&
            !allowedChildTypes(dto.businessStructureType).includes(c.businessStructureType)) {
          fail(422, "تغییر نوع به دلیل ناسازگاری با زیرشاخه‌های موجود مجاز نیست");
        }
      }
    }

    const updated = await this.prisma.businessStructure.update({
      where: { id: BigInt(id) },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        titleEn: dto.titleEn !== undefined ? dto.titleEn.trim() : undefined,
        businessStructureType: dto.businessStructureType,
        manager: dto.manager !== undefined ? dto.manager?.trim() || null : undefined,
        logoUrl: dto.logoUrl !== undefined ? dto.logoUrl : undefined,
        isActive: dto.isActive,
        // §2.5: Version is auto-bumped by the global PrismaService middleware
      },
    });
    return { item: this.toDto(updated) };
  }

  /* -------------------------------- delete ------------------------------- */

  async remove(id: number) {
    if (id === ROOT_ID) fail(409, "دفتر مرکزی قابل حذف نیست", "bs.msg.deleteBlockedRoot");

    const node = await this.prisma.businessStructure.findUnique({ where: { id: BigInt(id) } });
    if (!node) fail(404, "گره یافت نشد", "bs.msg.loadError");
    if (node.isSystem) fail(409, "رکورد سیستمی قابل حذف نیست", "bs.msg.deleteBlockedSystem");

    const children = await this.prisma.businessStructure.count({ where: { parentRef: BigInt(id) } });
    if (children > 0) {
      fail(409, "این شاخه دارای زیرشاخه است و حذف نمی‌شود", "bs.msg.deleteBlockedChildren");
    }

    await this.prisma.businessStructure.delete({ where: { id: BigInt(id) } });
    return { ok: true };
  }

  /* ------------------------------- helpers ------------------------------- */

  private async depthOf(node: { id: bigint; parentRef: bigint }): Promise<number> {
    let depth = 0;
    let cur = node.parentRef;
    const guard = new Set<string>();
    while (cur && cur !== 0n && !guard.has(cur.toString())) {
      guard.add(cur.toString());
      const p = await this.prisma.businessStructure.findUnique({ where: { id: cur } });
      if (!p) break;
      depth += 1;
      if (depth > MAX_DEPTH + 1) break;
      cur = p.parentRef;
    }
    return depth;
  }

  /** code = parentCode-NN where NN = max sibling suffix + 1 (zero-padded). */
  private async nextChildCode(
    tx: Prisma.TransactionClient,
    parent: { id: bigint; code: string },
  ): Promise<string> {
    const siblings = await tx.businessStructure.findMany({
      where: { parentRef: parent.id },
      select: { code: true },
    });
    let maxSuffix = 0;
    const prefix = `${parent.code}-`;
    for (const s of siblings) {
      const tail = s.code.startsWith(prefix) ? s.code.slice(prefix.length) : "";
      const n = Number(tail);
      if (Number.isFinite(n)) maxSuffix = Math.max(maxSuffix, n);
    }
    return `${prefix}${String(maxSuffix + 1).padStart(2, "0")}`;
  }
}
