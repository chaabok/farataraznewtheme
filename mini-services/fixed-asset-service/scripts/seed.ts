import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS = [
  { name: 'ساختمان دفتر مرکزی', category: 'املاک', initialValue: 8500000000, depreciationRate: 2 },
  { name: 'خودرو وانت', category: 'نقلیه', initialValue: 950000000, depreciationRate: 15 },
  { name: 'سرور و تجهیزات شبکه', category: 'رایانه‌ای', initialValue: 420000000, depreciationRate: 25 },
];

async function main(): Promise<void> {
  const count = await prisma.asset.count();
  if (count > 0) {
    console.log('Seed skipped: data already exists.');
    return;
  }
  await prisma.asset.createMany({ data: ITEMS });
  console.log('Seeded ' + ITEMS.length + ' records.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
