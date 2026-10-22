/**
 * Shared contract for the unified, database-driven form system.
 *
 * Every ERP form (simple / tabbed / tree) is described by a FormDef
 * persisted in a microservice database (settings-service owns the
 * metadata) and rendered by the generic component library in
 * `src/components/forms/`. Changing a component changes every form.
 */

/** Rendering type of a form. */
export type FormType = 'simple' | 'tabbed' | 'tree';

/** Supported field types of the generic renderer. */
export type FormFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'lookup'
  | 'textarea';

/** Value of a single field inside a record. */
export type FormFieldValue = string | number | boolean | null;

/** A saved record: `{ fieldKey: value }`. */
export type FormDataMap = Record<string, FormFieldValue>;

/** One field definition row (FormFieldDefinition in the DB). */
export interface FormFieldDef {
  id: string;
  /** Owning tab key — `null` for the main section of simple/tabbed forms. */
  tabKey: string | null;
  /** Tab display name (base locale, fa). */
  tabName: string | null;
  /** English tab display name (fallback for en/tr/ar). */
  tabNameEn?: string | null;
  fieldKey: string;
  /** Persian label (default locale). */
  label: string;
  /** English label (fallback for en/tr/ar until full translations). */
  labelEn: string | null;
  fieldType: FormFieldType;
  isRequired: boolean;
  /** 1 = half width, 2 = full width inside the fields grid. */
  span: 1 | 2;
  /** Lookup group key (fieldType === 'lookup'). */
  lookupKey: string | null;
  defaultValue: string | null;
  sortOrder: number;
  /**
   * Column-filter dropdown mode of the data-list window («دراپ‌داون
   * مقادیر فیلتر»): `single` = one value at a time, `multi` = checkboxes.
   * Optional (backward-compatible §5.1) — `undefined` renders as `multi`.
   */
  filterMode?: 'single' | 'multi';
}

/** One form definition row (FormDefinition in the DB) with its fields. */
export interface FormDef {
  id: string;
  moduleKey: string;
  formKey: string;
  /** Persian name (default locale). */
  name: string;
  nameEn: string | null;
  type: FormType;
  iconKey: string;
  /** Accent color used by the window chrome and action bar. */
  accentColor: string;
  fields: FormFieldDef[];
}

/** Tabs derived from a form definition (order preserved). */
export interface FormTab {
  key: string | null;
  name: string;
  nameEn: string | null;
  fields: FormFieldDef[];
}

/**
 * Lightweight form summary (no fields) — `GET /api/modules/:module/forms`
 * (module-root listing used by the «فهرست‌های اطلاعات» data-list menu).
 */
export interface FormSummary {
  moduleKey: string;
  formKey: string;
  name: string;
  nameEn: string | null;
  type: FormType;
  iconKey: string;
  accentColor: string;
}

/** One saved record of a form. */
export interface FormRecord {
  id: string;
  data: FormDataMap;
  createdAt: string;
  updatedAt: string;
}

/** One lookup option (FormLookupOption in the DB). */
export interface LookupOption {
  id: string;
  code: string;
  label: string;
  labelEn: string | null;
  parentId: string | null;
  sortOrder: number;
}

/**
 * Server-side filter operators of the data-list windows
 * (`GET .../records?filters=[…]` — evaluated inside the owning service).
 * `all` clears the column filter; `hasValue` / `noValue` need no value;
 * the rest compare the normalized display text of the cell. `in` matches
 * one of the picked dropdown values (`values`, exact display-text match).
 */
export type ListFilterOp =
  | 'all'
  | 'hasValue'
  | 'noValue'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'in';

/** One column filter entry of the `?filters=` JSON query param. */
export interface ListColumnFilter {
  /** Active fieldKey of the form. */
  field: string;
  op: ListFilterOp;
  /** Ignored for `all` / `hasValue` / `noValue`. */
  value?: string;
  /** Picked dropdown values — only for `op: 'in'`. */
  values?: string[];
}

/** One distinct display value of a column — the filter-values dropdown list.
 *  `GET .../fields/:fieldKey/values` → `{ data: FieldValueOption[] }`. */
export interface FieldValueOption {
  /** Display text exactly as rendered in the grid cell. */
  value: string;
  /** How many records carry this value. */
  count: number;
}

/** `GET /api/modules/:module/forms/:formKey` → `{ data: FormDef }`. */
/** `GET /api/modules/:module/forms` → `{ data: FormSummary[] }`. */
/** `GET /api/modules/:module/forms/:formKey/records` → `{ data: FormRecord[] }`. */
/** `POST /api/modules/:module/forms/:formKey/records` body `{ data: FormDataMap }` → 201 `{ data: FormRecord }`. */
/** `PUT /api/modules/:module/forms/:formKey/records/:recordId` body `{ data: FormDataMap }` → `{ data: FormRecord }`. */
/** `DELETE /api/modules/:module/forms/:formKey/records/:recordId` → 204. */
/** `GET /api/modules/:module/forms/:formKey/lookups/:lookupKey` → `{ data: LookupOption[] }`. */
