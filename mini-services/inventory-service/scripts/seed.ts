import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS = [
  { name: 'کاغذ A4', sku: 'ST-1001', unit: 'بسته', quantity: 240, minQuantity: 50 },
  { name: 'کارت‌ریج پرینتر', sku: 'ST-1002', unit: 'عدد', quantity: 8, minQuantity: 10 },
  { name: 'کابل شبکه Cat6', sku: 'ST-1003', unit: 'متر', quantity: 500, minQuantity: 100 },
  { name: 'هارد اکسترنال', sku: 'ST-1004', unit: 'عدد', quantity: 3, minQuantity: 5 },
];

async function main(): Promise<void> {
  const count = await prisma.stockItem.count();
  if (count > 0) {
    console.log('Seed skipped: data already exists.');
    return;
  }
  await prisma.stockItem.createMany({ data: ITEMS });
  console.log('Seeded ' + ITEMS.length + ' records.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
