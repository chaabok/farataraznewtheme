import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS = [
  { supplier: 'پخش سراسری کالا', itemName: 'کارت‌ریج پرینتر', total: 36000000, status: 'received' },
  { supplier: 'ابزار صنعتی نور', itemName: 'ست ابزار تعمیرات', total: 18500000, status: 'approved' },
  { supplier: 'رایانه پخش', itemName: 'گوشی سازمانی', total: 72000000, status: 'pending' },
];

async function main(): Promise<void> {
  const count = await prisma.purchaseOrder.count();
  if (count > 0) {
    console.log('Seed skipped: data already exists.');
    return;
  }
  await prisma.purchaseOrder.createMany({ data: ITEMS });
  console.log('Seeded ' + ITEMS.length + ' records.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
