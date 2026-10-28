/**
 * Seed the «گروه کالا-خدمت» tree form (type = 'tree') of settings-service.
 *
 * Idempotent (same rules as seed-forms.ts):
 * - FormDefinition is upserted by (moduleKey, formKey).
 * - FormFieldDefinitions are delete+recreated on every run (records
 *   reference fields by fieldKey, not by id).
 * - FormDataRecords are NEVER touched; the sample tree nodes are only
 *   created when the form has no records at all.
 *
 * The tree hierarchy is stored in the records themselves:
 * `data.parentId` = id of the parent FormDataRecord (self-referencing),
 * exactly what the TreeForm component builds its درختواره from.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Form definition
// ---------------------------------------------------------------------------

const FORM = {
  moduleKey: 'settings',
  formKey: 'product-service-group',
  name: 'گروه کالا-خدمت',
  nameEn: 'Product-Service Group',
  type: 'tree',
  iconKey: 'boxes',
  accentColor: '#10b981',
  sortOrder: 20,
} as const;

// ---------------------------------------------------------------------------
// Fields — header (tabKey = null) + two body tabs
// ---------------------------------------------------------------------------

const MAIN_TAB = {
  tabKey: null,
  tabName: 'اطلاعات اصلی',
  tabNameEn: 'Main Information',
} as const;

const RELATED_GOODS_TAB = {
  tabKey: 'related-goods',
  tabName: 'کالاهای مرتبط',
  tabNameEn: 'Related Goods',
} as const;

const EXTRA_FIELDS_TAB = {
  tabKey: 'extra-fields',
  tabName: 'فیلدهای اضافی',
  tabNameEn: 'Extra Fields',
} as const;

interface FieldSeed {
  tab: { tabKey: string | null; tabName: string; tabNameEn: string };
  fieldKey: string;
  label: string;
  labelEn: string;
  fieldType: 'text' | 'number' | 'date' | 'checkbox' | 'lookup' | 'textarea';
  isRequired: boolean;
  span: 1 | 2;
  lookupKey?: string;
  defaultValue?: string;
}

const FIELDS: FieldSeed[] = [
  // ── بخش هدر (فیلدهای اصلی) ──────────────────────────────────────
  { tab: MAIN_TAB, fieldKey: 'code', label: 'کد (نشانگر اصلی - ۲ رقم)', labelEn: 'Main Code (2-digit)', fieldType: 'text', isRequired: true, span: 1 },
  { tab: MAIN_TAB, fieldKey: 'displayCode', label: 'کد نمایشی', labelEn: 'Display Code', fieldType: 'text', isRequired: false, span: 1 },
  { tab: MAIN_TAB, fieldKey: 'title', label: 'عنوان', labelEn: 'Title', fieldType: 'text', isRequired: true, span: 1 },
  { tab: MAIN_TAB, fieldKey: 'title2', label: 'عنوان (۲)', labelEn: 'Second Title', fieldType: 'text', isRequired: false, span: 1 },
  // Self-referencing parent — TreeForm renders it as a record picker and
  // builds the درختواره from `parentId` values.
  { tab: MAIN_TAB, fieldKey: 'parentId', label: 'تودرتوها', labelEn: 'Parent Group', fieldType: 'lookup', isRequired: false, span: 1 },
  { tab: MAIN_TAB, fieldKey: 'isActive', label: 'فعال', labelEn: 'Active', fieldType: 'checkbox', isRequired: false, span: 1, defaultValue: 'true' },
  // ── کالاهای مرتبط ───────────────────────────────────────────────
  { tab: RELATED_GOODS_TAB, fieldKey: 'goodsCode', label: 'کد کالا', labelEn: 'Goods Code', fieldType: 'text', isRequired: false, span: 1 },
  { tab: RELATED_GOODS_TAB, fieldKey: 'goodsTitle', label: 'نام کالا', labelEn: 'Goods Name', fieldType: 'text', isRequired: false, span: 1 },
  { tab: RELATED_GOODS_TAB, fieldKey: 'measureUnit', label: 'واحد سنجش', labelEn: 'Measure Unit', fieldType: 'lookup', isRequired: false, span: 1, lookupKey: 'unit' },
  // ── فیلدهای اضافی ───────────────────────────────────────────────
  { tab: EXTRA_FIELDS_TAB, fieldKey: 'description', label: 'توضیحات', labelEn: 'Description', fieldType: 'textarea', isRequired: false, span: 2 },
  { tab: EXTRA_FIELDS_TAB, fieldKey: 'saleAllowed', label: 'قابل فروش', labelEn: 'Salable', fieldType: 'checkbox', isRequired: false, span: 1, defaultValue: 'true' },
];

// ---------------------------------------------------------------------------
// Sample tree nodes (only created when the form has no records)
// Mirrors the reference: کالا ۱۰ → مواد اولیه ۱۰۰۱ → ۱۰۰۱۰۱/۱۰۰۱۰۲ ، خدمت ۲۰ → ۲۰۰۱
// ---------------------------------------------------------------------------

interface NodeSeed {
  data: Record<string, string | number | boolean>;
  /** Index into this array of the parent node (undefined = root). */
  parentIndex?: number;
}

const SAMPLE_NODES: NodeSeed[] = [
  { data: { code: '10', title: 'کالا', title2: 'Goods', isActive: true } },
  { data: { code: '1001', title: 'مواد اولیه', isActive: true }, parentIndex: 0 },
  { data: { code: '100101', title: 'مواد اولیه بسته بندی', title2: 'Packaging Raw Materials', isActive: true }, parentIndex: 1 },
  { data: { code: '100102', title: 'مواد اولیه کمک', title2: 'Auxiliary Raw Materials', isActive: true }, parentIndex: 1 },
  { data: { code: '20', title: 'خدمت', title2: 'Services', isActive: true } },
  { data: { code: '2001', title: 'مشاوره', title2: 'Consulting', isActive: true }, parentIndex: 4 },
];

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // 1) Form definition (upsert by moduleKey + formKey)
  const form = await prisma.formDefinition.upsert({
    where: {
      moduleKey_formKey: { moduleKey: FORM.moduleKey, formKey: FORM.formKey },
    },
    update: {
      name: FORM.name,
      nameEn: FORM.nameEn,
      type: FORM.type,
      iconKey: FORM.iconKey,
      accentColor: FORM.accentColor,
      sortOrder: FORM.sortOrder,
      isActive: true,
    },
    create: { ...FORM },
  });

  // 2) Fields — delete + recreate (records reference fieldKeys, not ids)
  await prisma.formFieldDefinition.deleteMany({ where: { formId: form.id } });
  await prisma.formFieldDefinition.createMany({
    data: FIELDS.map((field, index) => ({
      formId: form.id,
      tabKey: field.tab.tabKey,
      tabName: field.tab.tabName,
      tabNameEn: field.tab.tabNameEn,
      fieldKey: field.fieldKey,
      label: field.label,
      labelEn: field.labelEn,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      span: field.span,
      lookupKey: field.lookupKey ?? null,
      defaultValue: field.defaultValue ?? null,
      sortOrder: index + 1,
    })),
  });

  // 3) Sample tree records — only when there are none (never delete data).
  //    Created sequentially so parentId can point at real record ids.
  const recordCount = await prisma.formDataRecord.count({
    where: { formId: form.id },
  });
  let createdCount = 0;
  if (recordCount === 0) {
    const idByIndex: string[] = [];
    for (let index = 0; index < SAMPLE_NODES.length; index += 1) {
      const node = SAMPLE_NODES[index];
      const data = { ...node.data };
      if (node.parentIndex !== undefined) {
        data.parentId = idByIndex[node.parentIndex];
      }
      const row = await prisma.formDataRecord.create({
        data: { formId: form.id, dataJson: JSON.stringify(data) },
      });
      idByIndex[index] = row.id;
      createdCount += 1;
    }
  }

  console.log(
    `Seed OK: tree form "${FORM.formKey}" (${FIELDS.length} fields, ` +
      `${recordCount === 0 ? `${createdCount} nodes created` : `${recordCount} nodes kept`}).`,
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
