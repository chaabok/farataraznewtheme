import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS = [
  { kind: 'receipt', party: 'شرکت آریا', amount: 45000000, description: 'پرداخت فاکتور ۱۰۲' },
  { kind: 'receipt', party: 'فروشگاه مهر', amount: 27500000, description: 'پیش‌پرداخت پروژه' },
  { kind: 'payment', party: 'تامین‌کننده سپهر', amount: 18000000, description: 'تسویه خرید کالا' },
  { kind: 'payment', party: 'اجاره ساختمان', amount: 9500000, description: 'اجاره مهر ۱۴۰۵' },
];

async function main(): Promise<void> {
  const count = await prisma.paymentRecord.count();
  if (count > 0) {
    console.log('Seed skipped: data already exists.');
    return;
  }
  await prisma.paymentRecord.createMany({ data: ITEMS });
  console.log('Seeded ' + ITEMS.length + ' records.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
