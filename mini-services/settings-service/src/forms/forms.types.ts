/**
 * Response shapes of the forms API.
 *
 * Mirror of the LOCKED frontend contract in
 * `/home/z/my-project/src/types/forms.ts` — keep both files in sync.
 * (Microservices stay decoupled from the Next.js app tree, hence the copy.)
 */

/** Value of a single field inside a record. */
export type FormFieldValue = string | number | boolean | null;

/** A saved record payload: `{ fieldKey: value }`. */
export type FormDataMap = Record<string, FormFieldValue>;

/** One field definition row (FormFieldDefinition in the DB). */
export interface FormFieldDef {
  id: string;
  /** Owning tab key — `null` for the main section of simple/tabbed forms. */
  tabKey: string | null;
  /** Tab display name, localized per the `?locale=` query param. */
  tabName: string | null;
  fieldKey: string;
  /** Label, localized per the `?locale=` query param (fa default). */
  label: string;
  /** English label (raw, fallback for other locales). */
  labelEn: string | null;
  fieldType: 'text' | 'number' | 'date' | 'checkbox' | 'lookup' | 'textarea';
  isRequired: boolean;
  /** 1 = half width, 2 = full width inside the fields grid. */
  span: 1 | 2;
  /** Lookup group key (fieldType === 'lookup'). */
  lookupKey: string | null;
  defaultValue: string | null;
  sortOrder: number;
  /**
   * Column-filter dropdown mode of the data-list window.
   * Optional (backward-compatible) — `undefined` renders as `multi`.
   */
  filterMode?: 'single' | 'multi';
}

/** One form definition row (FormDefinition in the DB) with its fields. */
export interface FormDef {
  id: string;
  moduleKey: string;
  formKey: string;
  /** Name, localized per the `?locale=` query param (fa default). */
  name: string;
  /** English name (raw, fallback for other locales). */
  nameEn: string | null;
  type: 'simple' | 'tabbed' | 'tree';
  iconKey: string;
  /** Accent color used by the window chrome and action bar. */
  accentColor: string;
  fields: FormFieldDef[];
}

/**
 * Lightweight form summary for menus / data lists
 * (no field rows — those come from the per-form definition endpoint).
 */
export interface FormSummary {
  moduleKey: string;
  formKey: string;
  /** Name, localized per the `?locale=` query param (fa default). */
  name: string;
  /** English name (raw, fallback for other locales). */
  nameEn: string | null;
  type: 'simple' | 'tabbed' | 'tree';
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
  /** Label, localized per the `?locale=` query param (fa default). */
  label: string;
  /** English label (raw, fallback for other locales). */
  labelEn: string | null;
  parentId: string | null;
  sortOrder: number;
}

/**
 * Server-side filter operators of the data-list windows
 * (`?filters=[…]` query param on the records endpoint — evaluated here,
 * inside the owning service, on the normalized *display text* of cells).
 * `in` matches one of the picked dropdown values (`values`).
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
  field: string;
  op: ListFilterOp;
  value?: string;
  /** Picked dropdown values — only for `op: 'in'`. */
  values?: string[];
}

/** One distinct display value of a column (filter-values dropdown list). */
export interface FieldValueOption {
  /** Display text exactly as rendered in the grid cell. */
  value: string;
  /** How many records carry this value. */
  count: number;
}
