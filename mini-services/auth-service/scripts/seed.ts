import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    username: 'admin',
    password: 'Admin@12345',
    displayName: 'مدیر سیستم',
    role: 'admin',
  },
  {
    username: 'user',
    password: 'User@12345',
    displayName: 'کاربر نمونه',
    role: 'user',
  },
];

async function main(): Promise<void> {
  for (const demo of DEMO_USERS) {
    const existing = await prisma.user.findUnique({
      where: { username: demo.username },
    });
    if (existing) {
      console.log(`User "${demo.username}" already exists, skipping.`);
      continue;
    }
    const passwordHash = await bcrypt.hash(demo.password, 12);
    await prisma.user.create({
      data: {
        username: demo.username,
        passwordHash,
        displayName: demo.displayName,
        role: demo.role,
      },
    });
    console.log(`Created user "${demo.username}" (${demo.role}).`);
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
