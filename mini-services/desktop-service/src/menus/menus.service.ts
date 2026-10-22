import { Inject, Injectable, Logger } from '@erp/shared';
import type { Prisma } from '@prisma/client';
import { normalizeLocale } from '../icons/icons.service';
import { PrismaService } from '../prisma/prisma.service';

/** Flat shape of one form entry inside a menu (localized). */
export interface LocalizedMenuForm {
  id: string;
  formKey: string;
  iconKey: string;
  name: string;
  sortOrder: number;
}

/** Flat shape of one module menu with its forms (localized). */
export interface LocalizedModuleMenu {
  id: string;
  iconKey: string;
  name: string;
  sortOrder: number;
  forms: LocalizedMenuForm[];
}

/** Payload returned for GET /api/menus/:moduleKey. */
export interface ModuleMenuPayload {
  moduleKey: string;
  menus: LocalizedModuleMenu[];
}

type MenuWithRelations = Prisma.ModuleMenuGetPayload<{
  include: {
    translations: true;
    forms: { include: { translations: true } };
  };
}>;

type FormWithTranslations = MenuWithRelations['forms'][number];

@Injectable()
export class MenusService {
  private readonly logger = new Logger(MenusService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  /**
   * Resolve a display name with the same fallback chain as the icons:
   * requested locale → 'fa' → 'en' → first available translation → base name.
   */
  private resolveName(
    baseName: string,
    translations: Array<{ locale: string; name: string }>,
    locale: ReturnType<typeof normalizeLocale>,
  ): string {
    const byLocale = new Map(
      translations.map((t) => [t.locale, t.name]),
    );
    return (
      byLocale.get(locale) ??
      byLocale.get('fa') ??
      byLocale.get('en') ??
      translations[0]?.name ??
      baseName
    );
  }

  private toLocalizedForm(
    form: FormWithTranslations,
    locale: ReturnType<typeof normalizeLocale>,
  ): LocalizedMenuForm {
    return {
      id: form.id,
      formKey: form.formKey,
      iconKey: form.iconKey,
      name: this.resolveName(form.name, form.translations, locale),
      sortOrder: form.sortOrder,
    };
  }

  private toLocalizedMenu(
    menu: MenuWithRelations,
    locale: ReturnType<typeof normalizeLocale>,
  ): LocalizedModuleMenu {
    return {
      id: menu.id,
      iconKey: menu.iconKey,
      name: this.resolveName(menu.name, menu.translations, locale),
      sortOrder: menu.sortOrder,
      forms: menu.forms.map((form) => this.toLocalizedForm(form, locale)),
    };
  }

  /** All menus (+ forms) of one module, ordered by sortOrder. */
  async findByModule(
    moduleKey: string,
    locale?: string,
  ): Promise<ModuleMenuPayload> {
    const requested = normalizeLocale(locale);
    const menus = await this.prisma.moduleMenu.findMany({
      where: { moduleKey },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: { orderBy: { locale: 'asc' } },
        forms: {
          orderBy: { sortOrder: 'asc' },
          include: { translations: { orderBy: { locale: 'asc' } } },
        },
      },
    });
    return {
      moduleKey,
      menus: menus.map((menu) => this.toLocalizedMenu(menu, requested)),
    };
  }
}
