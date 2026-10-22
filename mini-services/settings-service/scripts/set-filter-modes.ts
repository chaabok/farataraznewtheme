/**
 * One-off migration helper for Task 13 (filter-values dropdown):
 * fills FormFieldDefinition.filterMode for every existing row using the
 * agreed default rule — lookup columns filter as `single`, everything
 * else as `multi`. Safe to re-run (idempotent UPDATE).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const fields = await prisma.formFieldDefinition.findMany({
    select: { id: true, fieldType: true, filterMode: true },
  });
  let single = 0;
  let multi = 0;
  for (const field of fields) {
    const next = field.fieldType === 'lookup' ? 'single' : 'multi';
    if (field.filterMode === next) continue;
    await prisma.formFieldDefinition.update({
      where: { id: field.id },
      data: { filterMode: next },
    });
    if (next === 'single') single += 1;
    else multi += 1;
  }
  console.log(
    `filterMode set — lookup→single: ${single}, others→multi: ${multi} ` +
      `(already correct: ${fields.length - single - multi}).`,
  );
}

main()
  .catch((error) => {
    console.error('filterMode migration failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
