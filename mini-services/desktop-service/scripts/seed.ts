import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_ICONS = [
  { name: 'این کامپیوتر', iconKey: 'monitor', color: '#38bdf8', sortOrder: 1 },
  { name: 'سطل بازیافت', iconKey: 'trash', color: '#94a3b8', sortOrder: 2 },
  { name: 'فایل‌های من', iconKey: 'folder', color: '#f59e0b', sortOrder: 3 },
  { name: 'گزارش‌ها', iconKey: 'fileText', color: '#ef4444', sortOrder: 4 },
  { name: 'دوربین مداربسته', iconKey: 'cctv', color: '#10b981', sortOrder: 5 },
  { name: 'تحلیل داده', iconKey: 'barChart', color: '#a78bfa', sortOrder: 6 },
  { name: 'پیام‌رسان', iconKey: 'send', color: '#0ea5e9', sortOrder: 7 },
  { name: 'تنظیمات', iconKey: 'settings', color: '#64748b', sortOrder: 8 },
];

async function main(): Promise<void> {
  const count = await prisma.desktopIcon.count();

  if (count > 0) {
    console.log(`Seed skipped: ${count} icons already exist.`);
    return;
  }

  await prisma.desktopIcon.createMany({ data: DEFAULT_ICONS });
  console.log(`Seeded ${DEFAULT_ICONS.length} desktop icons.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
