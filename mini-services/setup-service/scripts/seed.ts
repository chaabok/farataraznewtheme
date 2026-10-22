/**
 * Seed for setup-service:
 * 1. Installs the 10 ERP modules into the installation registry
 *    (selected → main database, unselected → secondary database).
 * 2. Creates a few demo records per module inside the database the
 *    module is currently installed in (only when empty → idempotent).
 *
 * Run: bun scripts/seed.ts
 */
import { PrismaClient } from '@prisma/client';
import {
  PrismaClient as DataClient,
} from '../src/generated/data-client';

const MAIN_URL = 'file:/home/z/my-project/db/main.db';
const SECONDARY_URL = 'file:/home/z/my-project/db/secondary.db';

interface ModuleSeed {
  moduleKey: string;
  name: string;
  selected: boolean;
  sortOrder: number;
  demoTitles: string[];
}

const MODULES: ModuleSeed[] = [
  {
    moduleKey: 'settings',
    name: 'تنظیمات',
    selected: true,
    sortOrder: 1,
    demoTitles: ['پروفایل سازمان', 'تقویم مالی'],
  },
  {
    moduleKey: 'accounting',
    name: 'حسابداری',
    selected: true,
    sortOrder: 2,
    demoTitles: ['سند افتتاحیه ۱۴۰۴', 'هزینه اداری مهر'],
  },
  {
    moduleKey: 'payment',
    name: 'دریافت و پرداخت',
    selected: false,
    sortOrder: 3,
    demoTitles: ['دریافت نقدی از مشتری', 'پرداخت به تأمین‌کننده'],
  },
  {
    moduleKey: 'inventory',
    name: 'انبار',
    selected: false,
    sortOrder: 4,
    demoTitles: ['رسید ورود کالا', 'حواله خروج'],
  },
  {
    moduleKey: 'sales',
    name: 'فروش',
    selected: false,
    sortOrder: 5,
    demoTitles: ['فاکتور فروش شماره ۱۰۲۴', 'پیش‌فاکتور مشتری'],
  },
  {
    moduleKey: 'fixedAsset',
    name: 'دارایی ثابت',
    selected: false,
    sortOrder: 6,
    demoTitles: ['سرور مرکزی', 'خودرو سازمانی'],
  },
  {
    moduleKey: 'procurement',
    name: 'تدارکات',
    selected: false,
    sortOrder: 7,
    demoTitles: ['درخواست خرید کاغذ', 'سفارش خرید تجهیزات'],
  },
  {
    moduleKey: 'order',
    name: 'سفارشات',
    selected: false,
    sortOrder: 8,
    demoTitles: ['سفارش مشتری ۲۰۹۱', 'سفارش در حال پردازش'],
  },
  {
    moduleKey: 'costing',
    name: 'بهای تمام شده',
    selected: false,
    sortOrder: 9,
    demoTitles: ['هزینه مواد محصول A', 'دستمزد مستقیم خط تولید'],
  },
  {
    moduleKey: 'financialStatement',
    name: 'صورت‌های مالی',
    selected: false,
    sortOrder: 10,
    demoTitles: ['ترازنامه پایان دوره', 'صورت سود و زیان'],
  },
];

const registry = new PrismaClient();
const mainDb = new DataClient({ datasourceUrl: MAIN_URL });
const secondaryDb = new DataClient({ datasourceUrl: SECONDARY_URL });

async function seedDemoRecords(seed: ModuleSeed): Promise<void> {
  const db = seed.selected ? mainDb : secondaryDb;
  const existing = await db.appRecord.count({
    where: { moduleKey: seed.moduleKey },
  });
  if (existing > 0) return;

  await db.appRecord.createMany({
    data: seed.demoTitles.map((title, index) => ({
      moduleKey: seed.moduleKey,
      title,
      payload: JSON.stringify({ seeded: true, index }),
    })),
  });
}

async function main(): Promise<void> {
  for (const seed of MODULES) {
    await registry.serviceInstall.upsert({
      where: { moduleKey: seed.moduleKey },
      update: { name: seed.name, sortOrder: seed.sortOrder },
      create: {
        moduleKey: seed.moduleKey,
        name: seed.name,
        selected: seed.selected,
        sortOrder: seed.sortOrder,
      },
    });
    await seedDemoRecords(seed);
  }

  const installed = MODULES.filter((m) => m.selected).length;
  console.log(
    `setup-service seeded: ${MODULES.length} modules ` +
      `(${installed} → main.db, ${MODULES.length - installed} → secondary.db)`,
  );
}

main()
  .catch((error) => {
    console.error('seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([
      registry.$disconnect(),
      mainDb.$disconnect(),
      secondaryDb.$disconnect(),
    ]);
  });
