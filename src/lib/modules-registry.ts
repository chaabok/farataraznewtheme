/**
 * Client-side metadata for the 10 ERP modules. This drives the generic
 * ModuleWindow UI (stats cards, record form and table) — one component
 * renders every module, and adding a module here + in the scaffolder is
 * all it takes to extend the system.
 */

export type ModuleFieldType = 'text' | 'number' | 'select';

export interface ModuleFieldOption {
  value: string;
  label: string;
}

export interface ModuleField {
  key: string;
  label: string;
  type: ModuleFieldType;
  required?: boolean;
  options?: ModuleFieldOption[];
  /** Suffix shown after numeric values (e.g. "تومان"). */
  unit?: string;
}

export interface ModuleStatMeta {
  key: string;
  label: string;
  kind: 'count' | 'money' | 'percent';
}

export interface ModuleMeta {
  id: string;
  name: string;
  /** Label for one record (used in empty states / toasts). */
  recordLabel: string;
  color: string;
  fields: ModuleField[];
  stats: ModuleStatMeta[];
}

const sel = (options: Array<[string, string]>): ModuleFieldOption[] =>
  options.map(([value, label]) => ({ value, label }));

const STATUS_SALE = sel([
  ['draft', 'پیش‌نویس'],
  ['sent', 'ارسال‌شده'],
  ['paid', 'پرداخت‌شده'],
]);

const STATUS_PURCHASE = sel([
  ['pending', 'در انتظار تایید'],
  ['approved', 'تاییدشده'],
  ['received', 'دریافت‌شده'],
]);

const STATUS_ORDER = sel([
  ['new', 'جدید'],
  ['processing', 'در حال انجام'],
  ['completed', 'تکمیل‌شده'],
  ['cancelled', 'لغو شده'],
]);

export const MODULES: Record<string, ModuleMeta> = {
  settings: {
    id: 'settings',
    name: 'تنظیمات',
    recordLabel: 'تنظیم',
    color: '#64748b',
    fields: [
      { key: 'key', label: 'کلید', type: 'text', required: true },
      { key: 'value', label: 'مقدار', type: 'text', required: true },
      { key: 'category', label: 'دسته', type: 'text' },
    ],
    stats: [
      { key: 'count', label: 'تعداد تنظیمات', kind: 'count' },
      { key: 'categories', label: 'دسته‌ها', kind: 'count' },
    ],
  },
  accounting: {
    id: 'accounting',
    name: 'حسابداری',
    recordLabel: 'سند حسابداری',
    color: '#10b981',
    fields: [
      { key: 'title', label: 'عنوان سند', type: 'text', required: true },
      { key: 'description', label: 'توضیحات', type: 'text' },
      { key: 'debit', label: 'بدهکار', type: 'number', unit: 'تومان' },
      { key: 'credit', label: 'بستانکار', type: 'number', unit: 'تومان' },
    ],
    stats: [
      { key: 'totalDebit', label: 'مجموع بدهکار', kind: 'money' },
      { key: 'totalCredit', label: 'مجموع بستانکار', kind: 'money' },
      { key: 'balance', label: 'تراز', kind: 'money' },
    ],
  },
  payment: {
    id: 'payment',
    name: 'دریافت و پرداخت',
    recordLabel: 'تراکنش',
    color: '#f59e0b',
    fields: [
      {
        key: 'kind',
        label: 'نوع',
        type: 'select',
        required: true,
        options: sel([
          ['receipt', 'دریافت'],
          ['payment', 'پرداخت'],
        ]),
      },
      { key: 'party', label: 'طرف حساب', type: 'text', required: true },
      { key: 'amount', label: 'مبلغ', type: 'number', required: true, unit: 'تومان' },
      { key: 'description', label: 'توضیحات', type: 'text' },
    ],
    stats: [
      { key: 'totalReceipts', label: 'مجموع دریافت‌ها', kind: 'money' },
      { key: 'totalPayments', label: 'مجموع پرداخت‌ها', kind: 'money' },
      { key: 'net', label: 'خالص', kind: 'money' },
    ],
  },
  inventory: {
    id: 'inventory',
    name: 'انبار',
    recordLabel: 'کالای انبار',
    color: '#8b5cf6',
    fields: [
      { key: 'name', label: 'نام کالا', type: 'text', required: true },
      { key: 'sku', label: 'کد کالا', type: 'text', required: true },
      { key: 'unit', label: 'واحد', type: 'text' },
      { key: 'quantity', label: 'موجودی', type: 'number', required: true },
      { key: 'minQuantity', label: 'حداقل موجودی', type: 'number' },
    ],
    stats: [
      { key: 'count', label: 'تعداد اقلام', kind: 'count' },
      { key: 'totalQuantity', label: 'موجودی کل', kind: 'count' },
      { key: 'lowStock', label: 'کمبود موجودی', kind: 'count' },
    ],
  },
  sales: {
    id: 'sales',
    name: 'فروش',
    recordLabel: 'فاکتور فروش',
    color: '#22c55e',
    fields: [
      { key: 'customer', label: 'مشتری', type: 'text', required: true },
      { key: 'amount', label: 'مبلغ', type: 'number', required: true, unit: 'تومان' },
      { key: 'status', label: 'وضعیت', type: 'select', options: STATUS_SALE },
    ],
    stats: [
      { key: 'count', label: 'تعداد فاکتورها', kind: 'count' },
      { key: 'totalAmount', label: 'مجموع فروش', kind: 'money' },
      { key: 'paidAmount', label: 'وصول‌شده', kind: 'money' },
    ],
  },
  fixedAsset: {
    id: 'fixedAsset',
    name: 'دارایی ثابت',
    recordLabel: 'دارایی',
    color: '#0ea5e9',
    fields: [
      { key: 'name', label: 'نام دارایی', type: 'text', required: true },
      { key: 'category', label: 'دسته', type: 'text' },
      { key: 'initialValue', label: 'ارزش اولیه', type: 'number', required: true, unit: 'تومان' },
      { key: 'depreciationRate', label: 'نرخ استهلاک', type: 'number', unit: '٪' },
    ],
    stats: [
      { key: 'count', label: 'تعداد دارایی‌ها', kind: 'count' },
      { key: 'totalValue', label: 'ارزش کل', kind: 'money' },
      { key: 'avgDepreciationRate', label: 'میانگین استهلاک', kind: 'percent' },
    ],
  },
  procurement: {
    id: 'procurement',
    name: 'تدارکات',
    recordLabel: 'سفارش خرید',
    color: '#f97316',
    fields: [
      { key: 'supplier', label: 'تامین‌کننده', type: 'text', required: true },
      { key: 'itemName', label: 'نام کالا', type: 'text', required: true },
      { key: 'total', label: 'مبلغ کل', type: 'number', required: true, unit: 'تومان' },
      { key: 'status', label: 'وضعیت', type: 'select', options: STATUS_PURCHASE },
    ],
    stats: [
      { key: 'count', label: 'تعداد سفارش‌ها', kind: 'count' },
      { key: 'totalValue', label: 'ارزش کل', kind: 'money' },
      { key: 'pendingCount', label: 'در انتظار تایید', kind: 'count' },
    ],
  },
  order: {
    id: 'order',
    name: 'سفارشات',
    recordLabel: 'سفارش مشتری',
    color: '#3b82f6',
    fields: [
      { key: 'customer', label: 'مشتری', type: 'text', required: true },
      { key: 'total', label: 'مبلغ کل', type: 'number', required: true, unit: 'تومان' },
      { key: 'status', label: 'وضعیت', type: 'select', options: STATUS_ORDER },
    ],
    stats: [
      { key: 'count', label: 'تعداد سفارش‌ها', kind: 'count' },
      { key: 'totalValue', label: 'ارزش کل', kind: 'money' },
      { key: 'openCount', label: 'سفارش باز', kind: 'count' },
    ],
  },
  costing: {
    id: 'costing',
    name: 'بهای تمام شده',
    recordLabel: 'قلم هزینه',
    color: '#ef4444',
    fields: [
      { key: 'product', label: 'محصول', type: 'text', required: true },
      { key: 'materialCost', label: 'هزینه مواد', type: 'number', unit: 'تومان' },
      { key: 'laborCost', label: 'نیروی انسانی', type: 'number', unit: 'تومان' },
      { key: 'overhead', label: 'سربار', type: 'number', unit: 'تومان' },
    ],
    stats: [
      { key: 'totalMaterial', label: 'هزینه مواد', kind: 'money' },
      { key: 'totalLabor', label: 'نیروی انسانی', kind: 'money' },
      { key: 'totalOverhead', label: 'سربار', kind: 'money' },
    ],
  },
  financialStatement: {
    id: 'financialStatement',
    name: 'صورتهای مالی',
    recordLabel: 'صورت مالی',
    color: '#14b8a6',
    fields: [
      { key: 'title', label: 'عنوان', type: 'text', required: true },
      {
        key: 'kind',
        label: 'نوع',
        type: 'select',
        required: true,
        options: sel([
          ['balance_sheet', 'ترازنامه'],
          ['income_statement', 'سود و زیان'],
          ['cash_flow', 'جریان نقدی'],
        ]),
      },
      { key: 'period', label: 'دوره', type: 'text', required: true },
      { key: 'netValue', label: 'ارزش خالص', type: 'number', required: true, unit: 'تومان' },
    ],
    stats: [
      { key: 'count', label: 'تعداد گزارش‌ها', kind: 'count' },
      { key: 'totalNetValue', label: 'خالص کل', kind: 'money' },
    ],
  },
};

export const MODULE_LIST: ModuleMeta[] = Object.values(MODULES);

export function getModuleMeta(moduleId: string): ModuleMeta | null {
  return MODULES[moduleId] ?? null;
}
