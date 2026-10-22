import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS = [
  { title: 'خرید تجهیزات دفتر', description: 'سیستم و لوازم اداری', debit: 120000000, credit: 0 },
  { title: 'درآمد خدمات ماهانه', description: 'فاکتور خدمات مهر ۱۴۰۵', debit: 0, credit: 85000000 },
  { title: 'حقوق کارمندان', description: 'حقوق مهر ۱۴۰۵', debit: 320000000, credit: 0 },
];

async function main(): Promise<void> {
  const count = await prisma.journalEntry.count();
  if (count > 0) {
    console.log('Seed skipped: data already exists.');
    return;
  }
  await prisma.journalEntry.createMany({ data: ITEMS });
  console.log('Seeded ' + ITEMS.length + ' records.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
