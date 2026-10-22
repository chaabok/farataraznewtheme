/**
 * Seed the database-driven form system of settings-service.
 *
 * Idempotent:
 * - FormDefinition is upserted by (moduleKey, formKey).
 * - FormFieldDefinitions are delete+recreated on every run (safe — records
 *   reference fields by fieldKey, not by id).
 * - FormLookupOptions of the managed lookupKeys are delete+recreated
 *   (records reference options by code, not by id).
 * - FormDataRecords are NEVER touched; the 2 sample records are only
 *   created when the form has no records at all.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Form definition
// ---------------------------------------------------------------------------

const MODULE_KEY = 'settings';
const FORM_KEY = 'account-class';

const FORM = {
  moduleKey: MODULE_KEY,
  formKey: FORM_KEY,
  name: 'طبقه حساب معین جدید',
  nameEn: 'New Subsidiary Account Class',
  type: 'tabbed',
  iconKey: 'layers',
  accentColor: '#0ea5e9',
  sortOrder: 10,
} as const;

/** Main section (tabKey = null). */
const MAIN_TAB = {
  tabKey: null,
  tabName: 'اطلاعات اصلی',
  tabNameEn: 'Main Information',
} as const;

const ACCOUNTING_TAB = {
  tabKey: 'accounting-info',
  tabName: 'اطلاعات حسابداری',
  tabNameEn: 'Accounting Information',
} as const;

const GOODS_TAB = {
  tabKey: 'goods-info',
  tabName: 'کالا',
  tabNameEn: 'Goods',
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
  /** Data-list column filter dropdown mode (undefined = multi). */
  filterMode?: 'single' | 'multi';
}

const FIELDS: FieldSeed[] = [
  // ── اطلاعات اصلی ────────────────────────────────────────────────
  { tab: MAIN_TAB, fieldKey: 'code', label: 'کد', labelEn: 'Code', fieldType: 'number', isRequired: true, span: 1 },
  { tab: MAIN_TAB, fieldKey: 'title', label: 'عنوان', labelEn: 'Title', fieldType: 'text', isRequired: true, span: 1 },
  { tab: MAIN_TAB, fieldKey: 'title2', label: 'عنوان (۲)', labelEn: 'Second Title', fieldType: 'text', isRequired: false, span: 1 },
  { tab: MAIN_TAB, fieldKey: 'effect', label: 'اثر', labelEn: 'Effect', fieldType: 'lookup', isRequired: true, span: 1, lookupKey: 'account-effect' },
  { tab: MAIN_TAB, fieldKey: 'parentAccount', label: 'حساب والد', labelEn: 'Parent Account', fieldType: 'lookup', isRequired: false, span: 2, lookupKey: 'account-parent' },
  { tab: MAIN_TAB, fieldKey: 'isActive', label: 'فعال', labelEn: 'Active', fieldType: 'checkbox', isRequired: false, span: 1, defaultValue: 'true' },
  // ── اطلاعات حسابداری ────────────────────────────────────────────
  { tab: ACCOUNTING_TAB, fieldKey: 'moeinPost', label: 'معین بفرود:', labelEn: 'Post Subsidiary', fieldType: 'lookup', isRequired: false, span: 2, lookupKey: 'moein-post' },
  { tab: ACCOUNTING_TAB, fieldKey: 'moeinReturn', label: 'معین برگشت از فروش:', labelEn: 'Sales Return Subsidiary', fieldType: 'lookup', isRequired: false, span: 2, lookupKey: 'moein-return' },
  { tab: ACCOUNTING_TAB, fieldKey: 'moeinCogs', label: 'معین برای تمام شده فروش:', labelEn: 'COGS Subsidiary', fieldType: 'lookup', isRequired: false, span: 2, lookupKey: 'moein-cogs' },
  { tab: ACCOUNTING_TAB, fieldKey: 'moeinArAccum', label: 'معین حسابهای دریافتی انباشه:', labelEn: 'Accumulated Receivables', fieldType: 'lookup', isRequired: false, span: 2, lookupKey: 'moein-ar-accum' },
  { tab: ACCOUNTING_TAB, fieldKey: 'moeinArCompanies', label: 'معین حسابهای دریافتی شرکتها:', labelEn: 'Company Receivables', fieldType: 'lookup', isRequired: false, span: 2, lookupKey: 'moein-ar-companies' },
  { tab: ACCOUNTING_TAB, fieldKey: 'moeinPrepaid', label: 'معین پیش دریافت ها:', labelEn: 'Prepayments Subsidiary', fieldType: 'lookup', isRequired: false, span: 2, lookupKey: 'moein-prepaid' },
  // ── کالا ────────────────────────────────────────────────────────
  { tab: GOODS_TAB, fieldKey: 'unit', label: 'واحد شمارش', labelEn: 'Counting Unit', fieldType: 'lookup', isRequired: false, span: 1, lookupKey: 'unit' },
  { tab: GOODS_TAB, fieldKey: 'vatRate', label: 'نرخ ارزش افزوده (٪)', labelEn: 'VAT Rate', fieldType: 'number', isRequired: false, span: 1 },
  { tab: GOODS_TAB, fieldKey: 'goodsNote', label: 'توضیحات کالا', labelEn: 'Goods Note', fieldType: 'textarea', isRequired: false, span: 2 },
];

// ---------------------------------------------------------------------------
// Lookup options
// ---------------------------------------------------------------------------

interface LookupSeed {
  code: string;
  label: string;
  labelEn: string;
  /** Children are attached to the option with this code (same lookupKey). */
  parentCode?: string;
}

/** lookupKey → ordered options. */
const LOOKUPS: Record<string, LookupSeed[]> = {
  'account-effect': [
    { code: 'debit', label: 'بدهکار', labelEn: 'Bedehkar' },
    { code: 'credit', label: 'بستانکار', labelEn: 'Bestankar' },
    { code: 'both', label: 'هردو', labelEn: 'Both' },
  ],
  'account-parent': [
    { code: 'assets', label: 'دارایی‌ها', labelEn: 'Assets' },
    { code: 'receivables', label: 'حساب‌های دریافتنی تجاری', labelEn: 'Trade Receivables', parentCode: 'assets' },
    { code: 'inventory', label: 'موجودی کالا', labelEn: 'Inventory', parentCode: 'assets' },
    { code: 'liabilities', label: 'بدهی‌ها', labelEn: 'Liabilities' },
    { code: 'payables', label: 'حساب‌های پرداختنی تجاری', labelEn: 'Trade Payables', parentCode: 'liabilities' },
    { code: 'prepaid', label: 'پیش‌دریافت‌ها', labelEn: 'Customer Prepayments', parentCode: 'liabilities' },
    { code: 'equity', label: 'حقوق مالکانه', labelEn: 'Equity' },
    { code: 'income', label: 'درآمدها', labelEn: 'Revenues' },
    { code: 'expense', label: 'هزینه‌ها', labelEn: 'Expenses' },
  ],
  'moein-post': [
    { code: '1101', label: 'حساب‌های دریافتنی تجاری', labelEn: 'Trade Receivables' },
    { code: '1102', label: 'اسناد دریافتنی', labelEn: 'Notes Receivable' },
    { code: '1201', label: 'موجودی کالا', labelEn: 'Inventory' },
  ],
  'moein-return': [
    { code: '4101', label: 'برگشت از فروش', labelEn: 'Sales Returns' },
    { code: '4102', label: 'تخفیفات فروش', labelEn: 'Sales Discounts' },
  ],
  'moein-cogs': [
    { code: '5101', label: 'بهای تمام‌شده کالای فروش‌رفته', labelEn: 'COGS' },
  ],
  'moein-ar-accum': [
    { code: '1103', label: 'ذخیره مطالبات مشکوک‌الوصول', labelEn: 'Allowance for Doubtful Debts' },
  ],
  'moein-ar-companies': [
    { code: '1104', label: 'دریافتنی از شرکت‌های گروه', labelEn: 'Intercompany Receivables' },
  ],
  'moein-prepaid': [
    { code: '2101', label: 'پیش‌دریافت مشتریان', labelEn: 'Customer Prepayments' },
  ],
  unit: [
    { code: 'pcs', label: 'عدد', labelEn: 'Piece' },
    { code: 'kg', label: 'کیلوگرم', labelEn: 'Kilogram' },
    { code: 'm', label: 'متر', labelEn: 'Meter' },
    { code: 'l', label: 'لیتر', labelEn: 'Liter' },
    { code: 'box', label: 'کارتن', labelEn: 'Carton' },
  ],
};

// ---------------------------------------------------------------------------
// Sample records (only created when the form has no records)
// ---------------------------------------------------------------------------

const SAMPLE_RECORDS: Array<Record<string, string | number | boolean>> = [
  {
    code: 101,
    title: 'مشتریان عمده',
    title2: 'Major Customers',
    effect: 'debit',
    parentAccount: 'receivables',
    isActive: true,
    moeinPost: '1101',
    moeinReturn: '4101',
    moeinCogs: '5101',
    moeinArAccum: '1103',
    moeinArCompanies: '1104',
    moeinPrepaid: '2101',
  },
  {
    code: 102,
    title: 'پیش‌دریافت مشتریان',
    effect: 'credit',
    parentAccount: 'prepaid',
    isActive: true,
    moeinPrepaid: '2101',
  },
];

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seedLookupOptions(): Promise<void> {
  const lookupKeys = Object.keys(LOOKUPS);
  await prisma.formLookupOption.deleteMany({
    where: { lookupKey: { in: lookupKeys } },
  });

  for (const [lookupKey, options] of Object.entries(LOOKUPS)) {
    // parents first, so children can link to the freshly created ids
    const idByCode = new Map<string, string>();
    let sortOrder = 0;
    for (const option of options.filter((o) => !o.parentCode)) {
      const row = await prisma.formLookupOption.create({
        data: {
          lookupKey,
          code: option.code,
          label: option.label,
          labelEn: option.labelEn,
          parentId: null,
          sortOrder: sortOrder++,
        },
      });
      idByCode.set(option.code, row.id);
    }
    for (const option of options.filter((o) => o.parentCode)) {
      const parentId = option.parentCode ? idByCode.get(option.parentCode) : undefined;
      if (!parentId) {
        throw new Error(
          `Lookup "${lookupKey}": parent "${String(option.parentCode)}" not found`,
        );
      }
      await prisma.formLookupOption.create({
        data: {
          lookupKey,
          code: option.code,
          label: option.label,
          labelEn: option.labelEn,
          parentId,
          sortOrder: sortOrder++,
        },
      });
    }
  }
}

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
      filterMode: field.filterMode ?? null,
    })),
  });

  // 3) Lookup options of the managed groups
  await seedLookupOptions();

  // 4) Sample records — only when there are none (never delete data)
  const recordCount = await prisma.formDataRecord.count({
    where: { formId: form.id },
  });
  if (recordCount === 0) {
    await prisma.formDataRecord.createMany({
      data: SAMPLE_RECORDS.map((data) => ({
        formId: form.id,
        dataJson: JSON.stringify(data),
      })),
    });
  }

  console.log(
    `Seed OK: form "${FORM_KEY}" (${FIELDS.length} fields), ` +
      `${Object.keys(LOOKUPS).length} lookup groups, ` +
      `${recordCount === 0 ? SAMPLE_RECORDS.length : recordCount} records ` +
      `(${recordCount === 0 ? 'created' : 'kept'}).`,
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
