import { Injectable, Logger } from '@erp/shared';
import { Inject } from '@erp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIconDto } from './dto/create-icon.dto';
import type { Prisma } from '@prisma/client';

/** Locales that can be requested for icon display names. */
const SUPPORTED_LOCALES = ['fa', 'en', 'tr', 'ar'] as const;
export type IconLocale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: IconLocale = 'fa';

/**
 * Whitelist an arbitrary locale string to one of the supported locales.
 * Anything unknown (or missing) falls back to the Persian default.
 */
export function normalizeLocale(locale?: string): IconLocale {
  return SUPPORTED_LOCALES.includes(locale as IconLocale)
    ? (locale as IconLocale)
    : DEFAULT_LOCALE;
}

/** Flat shape returned to the frontend (no timestamps, localized name). */
export interface LocalizedIcon {
  id: string;
  name: string;
  iconKey: string;
  color: string;
  sortOrder: number;
}

type IconWithTranslations = Prisma.DesktopIconGetPayload<{
  include: { translations: true };
}>;

@Injectable()
export class IconsService {
  private readonly logger = new Logger(IconsService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  /**
   * Resolve the display name with the fallback chain:
   * requested locale → 'fa' → 'en' → first available translation → base name.
   * Translations are ordered by locale so the last-resort "first available"
   * pick is deterministic (also on PostgreSQL, where heap order is not).
   */
  private resolveName(icon: IconWithTranslations, locale: IconLocale): string {
    const byLocale = new Map(
      icon.translations.map((t) => [t.locale, t.name]),
    );
    return (
      byLocale.get(locale) ??
      byLocale.get(DEFAULT_LOCALE) ??
      byLocale.get('en') ??
      icon.translations[0]?.name ??
      icon.name
    );
  }

  private toLocalized(
    icon: IconWithTranslations,
    locale: IconLocale,
  ): LocalizedIcon {
    return {
      id: icon.id,
      name: this.resolveName(icon, locale),
      iconKey: icon.iconKey,
      color: icon.color,
      sortOrder: icon.sortOrder,
    };
  }

  async findAll(locale?: string): Promise<LocalizedIcon[]> {
    const requested = normalizeLocale(locale);
    const icons = await this.prisma.desktopIcon.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: { orderBy: { locale: 'asc' } } },
    });
    return icons.map((icon) => this.toLocalized(icon, requested));
  }

  async findOne(id: string, locale?: string): Promise<LocalizedIcon | null> {
    const requested = normalizeLocale(locale);
    const icon = await this.prisma.desktopIcon.findUnique({
      where: { id },
      include: { translations: { orderBy: { locale: 'asc' } } },
    });
    return icon ? this.toLocalized(icon, requested) : null;
  }

  async create(dto: CreateIconDto): Promise<LocalizedIcon> {
    this.logger.log(`Creating icon "${dto.name}"`);
    const icon = await this.prisma.desktopIcon.create({ data: dto });
    return this.toLocalized({ ...icon, translations: [] }, DEFAULT_LOCALE);
  }
}
