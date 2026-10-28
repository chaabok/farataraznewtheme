/**
 * Client-side structure metadata for the 10 ERP modules. This drives the
 * generic ModuleWindow UI (stats cards, record form and table) — one component
 * renders every module, and adding a module here + in the scaffolder is
 * all it takes to extend the system.
 *
 * IMPORTANT: this file is structure-only (keys, types, colors). All
 * user-facing labels are resolved from the i18n dictionaries via
 * `getLocalizedModuleMeta(id, locale)` in `src/i18n/index.ts`.
 */

export type ModuleFieldType = 'text' | 'number' | 'select';

/** Localizable unit suffix attached to numeric fields. */
export type ModuleUnitKey = 'toman' | 'percent';

export interface ModuleFieldOption {
  value: string;
}

export interface ModuleField {
  key: string;
  type: ModuleFieldType;
  required?: boolean;
  options?: ModuleFieldOption[];
  unitKey?: ModuleUnitKey;
}

export interface ModuleStatMeta {
  key: string;
  kind: 'count' | 'money' | 'percent';
}

export interface ModuleMeta {
  id: string;
  color: string;
  fields: ModuleField[];
  stats: ModuleStatMeta[];
}

const opts = (...values: string[]): ModuleFieldOption[] =>
  values.map((value) => ({ value }));

/** Shared status vocabularies (labels live in the i18n dictionaries). */
const STATUS_SALE = opts('draft', 'sent', 'paid');
const STATUS_PURCHASE = opts('pending', 'approved', 'received');
const STATUS_ORDER = opts('new', 'processing', 'completed', 'cancelled');

export const MODULES: Record<string, ModuleMeta> = {
  settings: {
    id: 'settings',
    color: '#64748b',
    fields: [
      { key: 'key', type: 'text', required: true },
      { key: 'value', type: 'text', required: true },
      { key: 'category', type: 'text' },
    ],
    stats: [
      { key: 'count', kind: 'count' },
      { key: 'categories', kind: 'count' },
    ],
  },
  accounting: {
    id: 'accounting',
    color: '#10b981',
    fields: [
      { key: 'title', type: 'text', required: true },
      { key: 'description', type: 'text' },
      { key: 'debit', type: 'number', unitKey: 'toman' },
      { key: 'credit', type: 'number', unitKey: 'toman' },
    ],
    stats: [
      { key: 'totalDebit', kind: 'money' },
      { key: 'totalCredit', kind: 'money' },
      { key: 'balance', kind: 'money' },
    ],
  },
  payment: {
    id: 'payment',
    color: '#f59e0b',
    fields: [
      { key: 'kind', type: 'select', required: true, options: opts('receipt', 'payment') },
      { key: 'party', type: 'text', required: true },
      { key: 'amount', type: 'number', required: true, unitKey: 'toman' },
      { key: 'description', type: 'text' },
    ],
    stats: [
      { key: 'totalReceipts', kind: 'money' },
      { key: 'totalPayments', kind: 'money' },
      { key: 'net', kind: 'money' },
    ],
  },
  inventory: {
    id: 'inventory',
    color: '#8b5cf6',
    fields: [
      { key: 'name', type: 'text', required: true },
      { key: 'sku', type: 'text', required: true },
      { key: 'unit', type: 'text' },
      { key: 'quantity', type: 'number', required: true },
      { key: 'minQuantity', type: 'number' },
    ],
    stats: [
      { key: 'count', kind: 'count' },
      { key: 'totalQuantity', kind: 'count' },
      { key: 'lowStock', kind: 'count' },
    ],
  },
  sales: {
    id: 'sales',
    color: '#22c55e',
    fields: [
      { key: 'customer', type: 'text', required: true },
      { key: 'amount', type: 'number', required: true, unitKey: 'toman' },
      { key: 'status', type: 'select', options: STATUS_SALE },
    ],
    stats: [
      { key: 'count', kind: 'count' },
      { key: 'totalAmount', kind: 'money' },
      { key: 'paidAmount', kind: 'money' },
    ],
  },
  fixedAsset: {
    id: 'fixedAsset',
    color: '#0ea5e9',
    fields: [
      { key: 'name', type: 'text', required: true },
      { key: 'category', type: 'text' },
      { key: 'initialValue', type: 'number', required: true, unitKey: 'toman' },
      { key: 'depreciationRate', type: 'number', unitKey: 'percent' },
    ],
    stats: [
      { key: 'count', kind: 'count' },
      { key: 'totalValue', kind: 'money' },
      { key: 'avgDepreciationRate', kind: 'percent' },
    ],
  },
  procurement: {
    id: 'procurement',
    color: '#f97316',
    fields: [
      { key: 'supplier', type: 'text', required: true },
      { key: 'itemName', type: 'text', required: true },
      { key: 'total', type: 'number', required: true, unitKey: 'toman' },
      { key: 'status', type: 'select', options: STATUS_PURCHASE },
    ],
    stats: [
      { key: 'count', kind: 'count' },
      { key: 'totalValue', kind: 'money' },
      { key: 'pendingCount', kind: 'count' },
    ],
  },
  order: {
    id: 'order',
    color: '#3b82f6',
    fields: [
      { key: 'customer', type: 'text', required: true },
      { key: 'total', type: 'number', required: true, unitKey: 'toman' },
      { key: 'status', type: 'select', options: STATUS_ORDER },
    ],
    stats: [
      { key: 'count', kind: 'count' },
      { key: 'totalValue', kind: 'money' },
      { key: 'openCount', kind: 'count' },
    ],
  },
  costing: {
    id: 'costing',
    color: '#ef4444',
    fields: [
      { key: 'product', type: 'text', required: true },
      { key: 'materialCost', type: 'number', unitKey: 'toman' },
      { key: 'laborCost', type: 'number', unitKey: 'toman' },
      { key: 'overhead', type: 'number', unitKey: 'toman' },
    ],
    stats: [
      { key: 'totalMaterial', kind: 'money' },
      { key: 'totalLabor', kind: 'money' },
      { key: 'totalOverhead', kind: 'money' },
    ],
  },
  financialStatement: {
    id: 'financialStatement',
    color: '#14b8a6',
    fields: [
      { key: 'title', type: 'text', required: true },
      {
        key: 'kind',
        type: 'select',
        required: true,
        options: opts('balance_sheet', 'income_statement', 'cash_flow'),
      },
      { key: 'period', type: 'text', required: true },
      { key: 'netValue', type: 'number', required: true, unitKey: 'toman' },
    ],
    stats: [
      { key: 'count', kind: 'count' },
      { key: 'totalNetValue', kind: 'money' },
    ],
  },
};

export const MODULE_LIST: ModuleMeta[] = Object.values(MODULES);

export function getModuleMeta(moduleId: string): ModuleMeta | null {
  return MODULES[moduleId] ?? null;
}
