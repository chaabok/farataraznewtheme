import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@erp/shared';
import type { BusinessStructure } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RootSettingsDto, SaveNodeDto } from './dto/save-node.dto';
import type { BsRootSettings } from './business-structure.types';

/**
 * Structure types — the clean greenfield enum (legacy "Department = 4"
 * naming mismatch intentionally not carried over):
 * 0 = reserved system root · 1 = Headquarter/Holding · 2 = Company ·
 * 3 = Branch · 4 = Agency.
 */
const TYPE_SYSTEM = 0;
const TYPE_HEADQUARTER = 1;

/** Parent-type → allowed child-types (validated SERVER-side, never UI-only). */
const ALLOWED_CHILD_TYPES: Readonly<Record<number, readonly number[]>> = {
  0: [1], // system root → headquarter only
  1: [2, 3, 4], // headquarter → company / branch / agency
  2: [2, 3, 4], // company → company / branch / agency
  3: [4], // branch → agency only
  4: [4], // agency → agency only (branch under agency is forbidden)
};

/** Maximum business depth below the system root (root itself = level 0). */
const MAX_LEVEL = 4;

/** Namespaced Setting keys — the single source of truth (no dual-write). */
const SETTING_SHARE = 'bs.shareHeadquarterData';
const SETTING_ACTIVE = 'bs.activeStructureTypes';
const DEFAULT_ACTIVE_TYPES = [1, 2, 3, 4];

/** Persian system messages (domain-level errors, mirrored by UI toasts). */
const MSG = {
  parentRequired: 'گره والد مشخص نشده است.',
  parentNotFound: 'گره والد یافت نشد.',
  typeNotAllowed: 'این نوع ساختار زیر والد انتخاب‌شده مجاز نیست.',
  typeInactive: 'این نوع ساختار در تنظیمات ریشه غیرفعال است.',
  maxLevel: 'حداکثر ۴ سطح ساختار مجاز است.',
  systemImmutable: 'ریشه سیستمی از این فرم قابل ویرایش نیست.',
  systemDelete: 'ریشه سیستمی قابل حذف نیست.',
  hasChildren: 'ابتدا زیرشاخه‌های این گره را حذف کنید.',
  notFound: 'گره مورد نظر یافت نشد.',
  duplicateCode: 'کد ساختار تکراری است؛ دوباره تلاش کنید.',
  typeInUse: 'انواع ساختارهایی که از قبل در سیستم ثبت شده‌اند، غیرقابل غیرفعال‌سازی هستند.',
} as const;

@Injectable()
export class BusinessStructureService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Memoized per-process bootstrap of the reserved system records. */
  private bootstrapPromise: Promise<void> | null = null;

  /**
   * Idempotent bootstrap (§ natural-key check, never blind INSERT):
   * the reserved system root «ساختار سیستم» (isSystem) with the seeded
   * «دفتر مرکزی» (01) and «شرکت نمونه یک» (01-01) beneath it — the same
   * bootstrap contract as the legacy system, keyed on uuid + isSystem.
   */
  private ensureBootstrap(): Promise<void> {
    this.bootstrapPromise ??= (async () => {
      const root = await this.prisma.businessStructure.findFirst({
        where: { isSystem: true },
      });
      if (root) return;

      const systemRoot = await this.prisma.businessStructure
        .create({
          data: {
            parentRef: '0',
            code: '00',
            title: 'ساختار سیستم',
            titleEn: 'System Structure',
            structureType: TYPE_SYSTEM,
            isSystem: true,
            isActive: true,
          },
        })
        .catch((error) => {
          // A parallel boot won the unique (parentRef, code) race — fine.
          if (typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002') {
            return null;
          }
          throw error;
        });
      if (!systemRoot) return;

      // Headquarter (01) directly under the system root; the sample
      // company (01-01) beneath it — hierarchical code semantics AND the
      // parent-driven rules both require company under headquarter.
      const headquarter = await this.prisma.businessStructure
        .create({
          data: {
            parentRef: systemRoot.id,
            code: '01',
            title: 'دفتر مرکزی',
            titleEn: 'Headquarters',
            structureType: TYPE_HEADQUARTER,
            isActive: true,
          },
        })
        .catch((error) => {
          if (typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002') {
            return null;
          }
          throw error;
        });
      if (!headquarter) return;

      await this.prisma.businessStructure.create({
        data: {
          parentRef: headquarter.id,
          code: '01-01',
          title: 'شرکت نمونه یک',
          titleEn: 'Sample Company One',
          structureType: 2,
          isActive: true,
        },
      });
    })().catch((error) => {
      // Allow a later request to retry a failed bootstrap.
      this.bootstrapPromise = null;
      throw error;
    });
    return this.bootstrapPromise;
  }

  /** Flat list (client builds the tree); code order == hierarchical order. */
  async list(): Promise<BusinessStructure[]> {
    await this.ensureBootstrap();
    return this.prisma.businessStructure.findMany({
      orderBy: [{ code: 'asc' }],
    });
  }

  /** The two root-only options (defaults when never saved). */
  async getSettings(): Promise<BsRootSettings> {
    const rows = await this.prisma.setting.findMany({
      where: { key: { in: [SETTING_SHARE, SETTING_ACTIVE] } },
    });
    const share = rows.find((row) => row.key === SETTING_SHARE)?.value;
    const active = rows.find((row) => row.key === SETTING_ACTIVE)?.value;
    const parsedActive = active
      ? active
          .split(',')
          .map((part) => Number.parseInt(part, 10))
          .filter((value) => Number.isInteger(value) && value >= 1 && value <= 4)
      : [];
    return {
      shareHeadquarterData: share === 'true',
      activeStructureTypes: parsedActive.length
        ? Array.from(new Set(parsedActive)).sort((a, b) => a - b)
        : [...DEFAULT_ACTIVE_TYPES],
    };
  }

  /**
   * Saves the two root-only options atomically. Types already present in
   * the tree can never be deactivated (union contract of the legacy form).
   */
  async updateRootSettings(dto: RootSettingsDto): Promise<BsRootSettings> {
    const used = await this.prisma.businessStructure.findMany({
      where: { isSystem: false },
      select: { structureType: true },
    });
    const usedTypes = new Set(used.map((row) => row.structureType));
    for (const type of usedTypes) {
      if (!dto.activeStructureTypes.includes(type)) {
        throw new BadRequestException(MSG.typeInUse);
      }
    }

    const requested = Array.from(new Set(dto.activeStructureTypes)).sort(
      (a, b) => a - b,
    );
    await this.prisma.$transaction([
      this.prisma.setting.upsert({
        where: { key: SETTING_SHARE },
        update: { value: String(dto.shareHeadquarterData) },
        create: { key: SETTING_SHARE, value: String(dto.shareHeadquarterData) },
      }),
      this.prisma.setting.upsert({
        where: { key: SETTING_ACTIVE },
        update: { value: requested.join(',') },
        create: { key: SETTING_ACTIVE, value: requested.join(',') },
      }),
    ]);
    return { shareHeadquarterData: dto.shareHeadquarterData, activeStructureTypes: requested };
  }

  /** Creates a node — hierarchy rules, depth, active types and code are SERVER-side. */
  async create(dto: SaveNodeDto): Promise<BusinessStructure> {
    if (!dto.parentRef) throw new BadRequestException(MSG.parentRequired);
    const parent = await this.prisma.businessStructure.findUnique({
      where: { id: dto.parentRef },
    });
    if (!parent) throw new BadRequestException(MSG.parentNotFound);

    await this.assertChildType(parent, dto.structureType);
    const parentLevel = await this.levelOf(parent);
    if (parentLevel + 1 > MAX_LEVEL) throw new BadRequestException(MSG.maxLevel);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const siblings = await tx.businessStructure.findMany({
          where: { parentRef: parent.id },
          select: { code: true },
        });
        const code = this.nextCode(parent, siblings.map((s) => s.code));
        return tx.businessStructure.create({
          data: {
            parentRef: parent.id,
            code,
            title: dto.title,
            titleEn: dto.titleEn ?? null,
            structureType: dto.structureType,
            manager: dto.manager ?? null,
            logoUrl: dto.logoUrl ?? null,
            isActive: dto.isActive ?? true,
          },
        });
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        (error as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictException(MSG.duplicateCode);
      }
      throw error;
    }
  }

  /** Updates the editable fields; identity (code/parent/isSystem) is immutable. */
  async update(id: string, dto: SaveNodeDto): Promise<BusinessStructure> {
    const node = await this.prisma.businessStructure.findUnique({ where: { id } });
    if (!node) throw new NotFoundException(MSG.notFound);
    if (node.isSystem) throw new BadRequestException(MSG.systemImmutable);

    const parent = await this.prisma.businessStructure.findUnique({
      where: { id: node.parentRef },
    });
    if (!parent) throw new BadRequestException(MSG.parentNotFound);

    await this.assertChildType(parent, dto.structureType);
    if (dto.structureType !== node.structureType) {
      // Changing the type must keep every existing child legal.
      const children = await this.prisma.businessStructure.findMany({
        where: { parentRef: node.id },
        select: { structureType: true },
      });
      const allowed = ALLOWED_CHILD_TYPES[dto.structureType] ?? [];
      for (const child of children) {
        if (!allowed.includes(child.structureType)) {
          throw new BadRequestException(MSG.typeNotAllowed);
        }
      }
    }

    return this.prisma.businessStructure.update({
      where: { id },
      data: {
        title: dto.title,
        titleEn: dto.titleEn ?? null,
        structureType: dto.structureType,
        manager: dto.manager ?? null,
        logoUrl: dto.logoUrl ?? null,
        isActive: dto.isActive ?? true,
        version: { increment: 1 },
      },
    });
  }

  /** Delete protections: never the system root, never a node with children. */
  async remove(id: string): Promise<void> {
    const node = await this.prisma.businessStructure.findUnique({ where: { id } });
    if (!node) throw new NotFoundException(MSG.notFound);
    if (node.isSystem) throw new BadRequestException(MSG.systemDelete);
    const children = await this.prisma.businessStructure.count({
      where: { parentRef: id },
    });
    if (children > 0) throw new BadRequestException(MSG.hasChildren);
    // Seed/Unseed integration arrives with the defaults engine (phase 18);
    // nothing default-seeded exists yet, so a plain delete is safe today.
    await this.prisma.businessStructure.delete({ where: { id } });
  }

  // ── Private helpers ────────────────────────────────────────────────

  /** Parent-type rule + root-level active-types filter (server-side). */
  private async assertChildType(
    parent: BusinessStructure,
    structureType: number,
  ): Promise<void> {
    const allowed = ALLOWED_CHILD_TYPES[parent.structureType] ?? [];
    if (!allowed.includes(structureType)) {
      throw new BadRequestException(MSG.typeNotAllowed);
    }
    if (structureType !== TYPE_SYSTEM) {
      const { activeStructureTypes } = await this.getSettings();
      if (!activeStructureTypes.includes(structureType)) {
        throw new BadRequestException(MSG.typeInactive);
      }
    }
  }

  /** Level below the virtual root: system root = 0, its children = 1 … */
  private async levelOf(node: BusinessStructure): Promise<number> {
    let level = 0;
    let cursor = node;
    const guard = new Set<string>();
    while (cursor.parentRef !== '0') {
      if (guard.has(cursor.id)) break; // cycle safety net
      guard.add(cursor.id);
      const parent = await this.prisma.businessStructure.findUnique({
        where: { id: cursor.parentRef },
      });
      if (!parent) break;
      cursor = parent;
      level += 1;
      if (level > MAX_LEVEL + 2) break; // defensive cap
    }
    return level;
  }

  /** Server-side hierarchical code: «02» on level 1, «01-03» deeper. */
  private nextCode(parent: BusinessStructure, siblingCodes: string[]): string {
    if (parent.parentRef === '0') {
      const max = siblingCodes.reduce(
        (acc, code) => Math.max(acc, Number.parseInt(code, 10) || 0),
        0,
      );
      return String(max + 1).padStart(2, '0');
    }
    const prefix = `${parent.code}-`;
    const max = siblingCodes.reduce((acc, code) => {
      if (!code.startsWith(prefix)) return acc;
      const suffix = Number.parseInt(code.slice(prefix.length), 10);
      return Number.isFinite(suffix) ? Math.max(acc, suffix) : acc;
    }, 0);
    return `${prefix}${String(max + 1).padStart(2, '0')}`;
  }
}
