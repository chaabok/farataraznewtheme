import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS = [
  { customer: 'شرکت آریا', amount: 68000000, status: 'paid' },
  { customer: 'فروشگاه مهر', amount: 24000000, status: 'sent' },
  { customer: 'هلدینگ پارس', amount: 132000000, status: 'paid' },
  { customer: 'تعاونی نور', amount: 9800000, status: 'draft' },
];

async function main(): Promise<void> {
  const count = await prisma.saleInvoice.count();
  if (count > 0) {
    console.log('Seed skipped: data already exists.');
    return;
  }
  await prisma.saleInvoice.createMany({ data: ITEMS });
  console.log('Seeded ' + ITEMS.length + ' records.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
