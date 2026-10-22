import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * The 10 business modules of the ERP desktop.
 * `iconKey` doubles as the module id used by the frontend window manager.
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
];

async function main(): Promise<void> {
  // Reset seed: the desktop shows exactly the ERP module icons.
  await prisma.desktopIcon.deleteMany({});
  await prisma.desktopIcon.createMany({ data: MODULE_ICONS });
  console.log('Desktop icons reset to ' + MODULE_ICONS.length + ' ERP modules.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
