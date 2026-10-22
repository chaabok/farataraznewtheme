import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS = [
  { product: 'دفتر ۱۰۰ برگ', materialCost: 18500, laborCost: 9200, overhead: 4300 },
  { product: 'پوشه رنگی', materialCost: 12000, laborCost: 6400, overhead: 3100 },
  { product: 'ست اداری', materialCost: 46000, laborCost: 21500, overhead: 9800 },
];

async function main(): Promise<void> {
  const count = await prisma.costItem.count();
  if (count > 0) {
    console.log('Seed skipped: data already exists.');
    return;
  }
  await prisma.costItem.createMany({ data: ITEMS });
  console.log('Seeded ' + ITEMS.length + ' records.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
