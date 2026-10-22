import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS = [
  { customer: 'شرکت آریا', total: 68000000, status: 'completed' },
  { customer: 'فروشگاه مهر', total: 24000000, status: 'processing' },
  { customer: 'بازرگانی سپهر', total: 41500000, status: 'new' },
  { customer: 'تعاونی نور', total: 9800000, status: 'cancelled' },
];

async function main(): Promise<void> {
  const count = await prisma.customerOrder.count();
  if (count > 0) {
    console.log('Seed skipped: data already exists.');
    return;
  }
  await prisma.customerOrder.createMany({ data: ITEMS });
  console.log('Seeded ' + ITEMS.length + ' records.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
