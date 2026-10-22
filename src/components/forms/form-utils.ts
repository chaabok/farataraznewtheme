import { translate } from '@/i18n';
import type { Locale } from '@/types/desktop';
import type {
  FormDef,
  FormFieldDef,
  FormDataMap,
  FormFieldValue,
} from '@/types/forms';

/** Locale-aware label of a field (fa base label vs. the English fallback). */
export function fieldLabel(field: FormFieldDef, locale: Locale): string {
  return locale === 'fa' ? field.label : field.labelEn ?? field.label;
}

/** Locale-aware title of a form definition. */
export function formTitle(def: FormDef, locale: Locale): string {
  return locale === 'fa' ? def.name : def.nameEn ?? def.name;
}

/** Dirty check for one field value (empty string ≈ null, false ≈ null). */
export function isChangedValue(
  a: FormFieldValue | undefined,
  b: FormFieldValue | undefined,
): boolean {
  const normalize = (value: FormFieldValue | undefined) =>
    value === '' || value === undefined ? null : value;
  const left = normalize(a);
  const right = normalize(b);
  if (left === right) return false;
  if ((left === null || left === false) && (right === null || right === false)) {
    return false;
  }
  return String(left ?? '') !== String(right ?? '');
}

/** True when a required field is still empty (per field type). */
export function isEmptyRequiredValue(
  field: FormFieldDef,
  value: FormFieldValue | undefined,
): boolean {
  // Optional fields are never blocking — only `isRequired` ones validate.
  if (!field.isRequired) return false;
  if (field.fieldType === 'checkbox') return value !== true;
  return value === null || value === undefined || value === '';
}

/** Applies `defaultValue` of every field (typed per field type). */
export function buildDefaults(fields: FormFieldDef[]): FormDataMap {
  const data: FormDataMap = {};
  for (const field of fields) {
    if (field.defaultValue === null || field.defaultValue === '') continue;
    if (field.fieldType === 'checkbox') {
      data[field.fieldKey] = field.defaultValue === 'true';
    } else if (field.fieldType === 'number') {
      const parsed = Number(field.defaultValue);
      if (Number.isFinite(parsed)) data[field.fieldKey] = parsed;
    } else {
      data[field.fieldKey] = field.defaultValue;
    }
  }
  return data;
}

export interface DerivedTab {
  key: string | null;
  name: string;
  fields: FormFieldDef[];
}

/**
 * Groups fields into tabs preserving definition order. Simple/tree forms
 * get a single implicit section; tabbed forms group by `tabKey`.
 */
export function deriveTabs(def: FormDef, locale: Locale): DerivedTab[] {
  const fields = [...def.fields].sort((a, b) => a.sortOrder - b.sortOrder);
  if (def.type !== 'tabbed') {
    return [
      { key: null, name: translate(locale, 'formWindow.mainSection'), fields },
    ];
  }
  const groups: DerivedTab[] = [];
  for (const field of fields) {
    let group = groups.find((candidate) => candidate.key === field.tabKey);
    if (!group) {
      group = {
        key: field.tabKey,
        name:
          (locale === 'fa'
            ? field.tabName
            : field.tabNameEn ?? field.tabName) ??
          translate(locale, 'formWindow.mainSection'),
        fields: [],
      };
      groups.push(group);
    }
    group.fields.push(field);
  }
  return groups;
}

/**
 * Picks the two columns shown in the records list and the tree labels:
 * a `code`-like field and a `title/name`-like one (first-field fallbacks).
 */
export function pickListColumns(fields: FormFieldDef[]): {
  codeField: FormFieldDef | null;
  titleField: FormFieldDef | null;
} {
  const sorted = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);
  const codeField =
    sorted.find((field) => /code/i.test(field.fieldKey)) ?? null;
  const titleField =
    sorted.find(
      (field) =>
        field !== codeField && /title|name|desc/i.test(field.fieldKey),
    ) ??
    sorted.find((field) => field !== codeField) ??
    null;
  return { codeField, titleField };
}

/** Formats a raw record value for flat lists (records panel / tree). */
export function formatFieldValue(
  field: FormFieldDef | null,
  value: FormFieldValue | undefined,
  formatNumber: (value: number) => string,
): string {
  if (value === null || value === undefined || value === '') return '—';
  if (field?.fieldType === 'number' && typeof value === 'number') {
    return formatNumber(value);
  }
  return String(value);
}
