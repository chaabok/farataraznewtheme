/**
 * Idempotent menu entry for the «ساختار کسب و کار» backbone window:
 * upserts a dedicated ModuleMenu («تنظیمات ساختاری») under moduleKey
 * `settings` with one ModuleMenuForm (formKey = business-structure,
 * iconKey = network) + fa/en/tr/ar translations.
 *
 * Safety: never deletes menus, forms or icons; the first run creates the
 * menu, later runs only refresh the names (natural key = moduleKey+name
 * for the menu, menuId+formKey for the form).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MENU_ENTRY = {
  moduleKey: 'settings',
  name: 'تنظیمات ساختاری',
  iconKey: 'building2',
  sortOrder: 98,
} as const;

const FORM_ENTRY = {
  formKey: 'business-structure',
  iconKey: 'network',
  sortOrder: 0,
  name: 'ساختار کسب و کار',
} as const;

const MENU_TRANSLATIONS: Array<{ locale: string; name: string }> = [
  { locale: 'fa', name: 'تنظیمات ساختاری' },
  { locale: 'en', name: 'Structural Settings' },
  { locale: 'tr', name: 'Yapısal Ayarlar' },
  { locale: 'ar', name: 'الإعدادات الهيكلية' },
];

const FORM_TRANSLATIONS: Array<{ locale: string; name: string }> = [
  { locale: 'fa', name: 'ساختار کسب و کار' },
  { locale: 'en', name: 'Business Structure' },
  { locale: 'tr', name: 'İş Yapısı' },
  { locale: 'ar', name: 'هيكل الأعمال' },
];

async function main(): Promise<void> {
  let menu = await prisma.moduleMenu.findFirst({
    where: { moduleKey: MENU_ENTRY.moduleKey, name: MENU_ENTRY.name },
  });

  if (!menu) {
    menu = await prisma.moduleMenu.create({
      data: {
        moduleKey: MENU_ENTRY.moduleKey,
        name: MENU_ENTRY.name,
        iconKey: MENU_ENTRY.iconKey,
        sortOrder: MENU_ENTRY.sortOrder,
        translations: {
          create: MENU_TRANSLATIONS.map((item) => ({
            locale: item.locale,
            name: item.name,
          })),
        },
      },
    });
    console.log(`Created menu "${MENU_ENTRY.name}".`);
  } else {
    await prisma.moduleMenu.update({
      where: { id: menu.id },
      data: {
        iconKey: MENU_ENTRY.iconKey,
        sortOrder: MENU_ENTRY.sortOrder,
        translations: {
          upsert: MENU_TRANSLATIONS.map((item) => ({
            where: { menuId_locale: { menuId: menu!.id, locale: item.locale } },
            update: { name: item.name },
            create: { locale: item.locale, name: item.name },
          })),
        },
      },
    });
    console.log(`Refreshed menu "${MENU_ENTRY.name}".`);
  }

  const existing = await prisma.moduleMenuForm.findFirst({
    where: { menuId: menu.id, formKey: FORM_ENTRY.formKey },
  });

  if (existing) {
    await prisma.moduleMenuForm.update({
      where: { id: existing.id },
      data: {
        name: FORM_ENTRY.name,
        iconKey: FORM_ENTRY.iconKey,
        sortOrder: FORM_ENTRY.sortOrder,
        translations: {
          upsert: FORM_TRANSLATIONS.map((item) => ({
            where: { formId_locale: { formId: existing.id, locale: item.locale } },
            update: { name: item.name },
            create: { locale: item.locale, name: item.name },
          })),
        },
      },
    });
    console.log(`Refreshed form "${FORM_ENTRY.formKey}".`);
    return;
  }

  await prisma.moduleMenuForm.create({
    data: {
      menuId: menu.id,
      name: FORM_ENTRY.name,
      formKey: FORM_ENTRY.formKey,
      iconKey: FORM_ENTRY.iconKey,
      sortOrder: FORM_ENTRY.sortOrder,
      translations: {
        create: FORM_TRANSLATIONS.map((item) => ({
          locale: item.locale,
          name: item.name,
        })),
      },
    },
  });
  console.log(`Created form "${FORM_ENTRY.formKey}".`);
}

main()
  .catch((error) => {
    console.error('Business-structure menu seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
