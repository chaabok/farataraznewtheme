import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS = [
  { title: 'ترازنامه پایان مهر ۱۴۰۵', kind: 'balance_sheet', period: '1405-07', netValue: 12400000000 },
  { title: 'صورت سود و زیان مهر ۱۴۰۵', kind: 'income_statement', period: '1405-07', netValue: 1850000000 },
  { title: 'صورت جریان نقدی مهر ۱۴۰۵', kind: 'cash_flow', period: '1405-07', netValue: 940000000 },
];

async function main(): Promise<void> {
  const count = await prisma.statement.count();
  if (count > 0) {
    console.log('Seed skipped: data already exists.');
    return;
  }
  await prisma.statement.createMany({ data: ITEMS });
  console.log('Seeded ' + ITEMS.length + ' records.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
