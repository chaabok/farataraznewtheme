import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * The 10 business modules of the ERP desktop.
 * `iconKey` doubles as the module id used by the frontend window manager.
 * Colors/sortOrder must stay in sync with `src/lib/modules-registry.ts`.
 */
const MODULE_ICONS = [
  { name: 'تنظیمات', iconKey: 'settings', color: '#64748b', sortOrder: 1 },
  { name: 'حسابداری', iconKey: 'accounting', color: '#10b981', sortOrder: 2 },
  { name: 'دریافت و پرداخت', iconKey: 'payment', color: '#f59e0b', sortOrder: 3 },
  { name: 'انبار', iconKey: 'inventory', color: '#8b5cf6', sortOrder: 4 },
  { name: 'فروش', iconKey: 'sales', color: '#22c55e', sortOrder: 5 },
  { name: 'دارایی ثابت', iconKey: 'fixedAsset', color: '#0ea5e9', sortOrder: 6 },
  { name: 'تدارکات', iconKey: 'procurement', color: '#f97316', sortOrder: 7 },
  { name: 'سفارشات', iconKey: 'order', color: '#3b82f6', sortOrder: 8 },
  { name: 'بهای تمام شده', iconKey: 'costing', color: '#ef4444', sortOrder: 9 },
  { name: 'صورتهای مالی', iconKey: 'financialStatement', color: '#14b8a6', sortOrder: 10 },
] as const;

/** Localized display names per iconKey (fa, en, tr, ar). */
const TRANSLATIONS: Record<string, Record<(typeof LOCALES)[number], string>> = {
  settings: { fa: 'تنظیمات', en: 'Settings', tr: 'Ayarlar', ar: 'الإعدادات' },
  accounting: { fa: 'حسابداری', en: 'Accounting', tr: 'Muhasebe', ar: 'المحاسبة' },
  payment: {
    fa: 'دریافت و پرداخت',
    en: 'Receivables & Payables',
    tr: 'Tahsilat ve Ödemeler',
    ar: 'المقبوضات والمدفوعات',
  },
  inventory: { fa: 'انبار', en: 'Warehouse', tr: 'Depo', ar: 'المستودع' },
  sales: { fa: 'فروش', en: 'Sales', tr: 'Satış', ar: 'المبيعات' },
  fixedAsset: {
    fa: 'دارایی ثابت',
    en: 'Fixed Assets',
    tr: 'Sabit Varlıklar',
    ar: 'الأصول الثابتة',
  },
  procurement: { fa: 'تدارکات', en: 'Procurement', tr: 'Satın Alma', ar: 'المشتريات' },
  order: { fa: 'سفارشات', en: 'Orders', tr: 'Siparişler', ar: 'الطلبيات' },
  costing: {
    fa: 'بهای تمام شده',
    en: 'Cost Accounting',
    tr: 'Maliyet Muhasebesi',
    ar: 'تكاليف الإنتاج',
  },
  financialStatement: {
    fa: 'صورتهای مالی',
    en: 'Financial Statements',
    tr: 'Mali Tablolar',
    ar: 'القوائم المالية',
  },
};

const LOCALES = ['fa', 'en', 'tr', 'ar'] as const;

async function main(): Promise<void> {
  // Reset seed: the desktop shows exactly the ERP module icons.
  // Translations first (cascade would handle it, but be explicit and cheap).
  await prisma.desktopIconTranslation.deleteMany({});
  await prisma.desktopIcon.deleteMany({});

  // createMany does not support nested writes → create each icon with its
  // 4 translations in one nested `create`.
  for (const icon of MODULE_ICONS) {
    await prisma.desktopIcon.create({
      data: {
        name: icon.name, // base name = Persian default
        iconKey: icon.iconKey,
        color: icon.color,
        sortOrder: icon.sortOrder,
        translations: {
          create: LOCALES.map((locale) => ({
            locale,
            name: TRANSLATIONS[icon.iconKey][locale],
          })),
        },
      },
    });
  }

  console.log(
    'Desktop icons reset to ' +
      MODULE_ICONS.length +
      ' ERP modules with ' +
      LOCALES.length +
      ' translations each (' +
      MODULE_ICONS.length * LOCALES.length +
      ' rows in DesktopIconTranslation).',
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
