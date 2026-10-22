import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS = [
  { key: 'companyName', value: 'شرکت بازرگانی نمونه', category: 'general' },
  { key: 'fiscalYear', value: '1405', category: 'general' },
  { key: 'currency', value: 'تومان', category: 'financial' },
  { key: 'taxRate', value: '9', category: 'financial' },
];

async function main(): Promise<void> {
  const count = await prisma.setting.count();
  if (count > 0) {
    console.log('Seed skipped: data already exists.');
    return;
  }
  await prisma.setting.createMany({ data: ITEMS });
  console.log('Seeded ' + ITEMS.length + ' records.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
