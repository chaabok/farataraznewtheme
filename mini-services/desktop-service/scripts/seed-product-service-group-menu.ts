/**
 * Idempotent menu entry for the «گروه کالا-خدمت» tree form:
 * upserts one ModuleMenuForm (formKey = product-service-group, iconKey = boxes,
 * sortOrder = 4) under the FIRST menu (sortOrder 0) of moduleKey `settings`
 * in the desktop-service database, with fa/en/tr/ar translations.
 *
 * Safety: never deletes menus, forms or icons; if the settings module has
 * no menu yet, the script skips gracefully (exit 0).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FORM_ENTRY = {
  formKey: 'product-service-group',
  iconKey: 'boxes',
  sortOrder: 4,
  name: 'گروه کالا-خدمت', // base name (fa)
} as const;

const TRANSLATIONS: Array<{ locale: string; name: string }> = [
  { locale: 'fa', name: 'گروه کالا-خدمت' },
  { locale: 'en', name: 'Product-Service Group' },
  { locale: 'tr', name: 'Mal-Hizmet Grubu' },
  { locale: 'ar', name: 'مجموعة السلع والخدمات' },
];

async function main(): Promise<void> {
  const menu = await prisma.moduleMenu.findFirst({
    where: { moduleKey: 'settings' },
    orderBy: { sortOrder: 'asc' },
  });

  if (!menu) {
    console.log('Skipped: no menu exists for module "settings" — nothing to do.');
    return;
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
          upsert: TRANSLATIONS.map((t) => ({
            where: { formId_locale: { formId: existing.id, locale: t.locale } },
            update: { name: t.name },
            create: { locale: t.locale, name: t.name },
          })),
        },
      },
    });
    console.log(`Updated form "${FORM_ENTRY.formKey}" in menu "${menu.name}".`);
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
        create: TRANSLATIONS.map((t) => ({ locale: t.locale, name: t.name })),
      },
    },
  });
  console.log(`Created form "${FORM_ENTRY.formKey}" in menu "${menu.name}".`);
}

main()
  .catch((error) => {
    console.error('Menu seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
