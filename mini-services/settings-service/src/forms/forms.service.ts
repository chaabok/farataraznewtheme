import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@erp/shared';
import type { FormFieldDefinition, FormDefinition } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SaveRecordDto } from './dto/save-record.dto';
import type {
  FormDataMap,
  FormDef,
  FormFieldDef,
  FormFieldValue,
  FormRecord,
  FormSummary,
  ListColumnFilter,
  ListFilterOp,
  LookupOption,
} from './forms.types';

/** All route keys (moduleKey / formKey / lookupKey) share this whitelist. */
const KEY_PATTERN = /^[a-z][a-zA-Z0-9-]{0,49}$/;

/** Whitelist of the operator values accepted in `?filters=`. */
const FILTER_OPS: ReadonlySet<string> = new Set<ListFilterOp>([
  'all',
  'hasValue',
  'noValue',
  'contains',
  'notContains',
  'startsWith',
  'endsWith',
  'equals',
]);

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * Same normalization as the frontend grid used to apply client-side:
 * lowercase, Persian/Arabic yeh & kaf folding and digit conversion so a
 * typed filter matches the stored data regardless of the keyboard used.
 * (Mirror of `normalizeSearchText` in data-list-window.tsx.)
 */
function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ')
    .trim();
}

/**
 * Parses + validates the `?filters=` JSON query param of the records
 * endpoint. Everything unknown / malformed is dropped (never throws) so
 * a stale client cannot break the list; a fully-invalid payload simply
 * returns no filters (unfiltered response).
 */
function parseColumnFilters(raw: unknown): ListColumnFilter[] {
  let parsed: unknown;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const filters: ListColumnFilter[] = [];
  for (const entry of parsed.slice(0, 8)) {
    if (typeof entry !== 'object' || entry === null) continue;
    const candidate = entry as Record<string, unknown>;
    const field = typeof candidate.field === 'string' ? candidate.field : '';
    const op = typeof candidate.op === 'string' ? candidate.op : '';
    if (!KEY_PATTERN.test(field) || !FILTER_OPS.has(op)) continue;
    if (op === 'all') continue; // cleared client-side, nothing to apply
    const value =
      typeof candidate.value === 'string' ? candidate.value.slice(0, 200) : '';
    const needsValue = op !== 'hasValue' && op !== 'noValue';
    if (needsValue && value.trim() === '') continue;
    filters.push({ field, op: op as ListFilterOp, value });
  }
  return filters;
}

/**
 * Operator semantics of one `?filters=` entry against one cell. The
 * display text (already normalized) drives the text operators so filtering
 * matches what the user sees in the grid.
 */
function matchesFilter(
  raw: FormFieldValue,
  filter: ListColumnFilter,
  displayText: string,
): boolean {
  const needle = normalizeSearchText(filter.value ?? '');
  switch (filter.op) {
    case 'hasValue':
      return raw !== null && raw !== undefined && String(raw).trim() !== '';
    case 'noValue':
      return raw === null || raw === undefined || String(raw).trim() === '';
    case 'contains':
      return displayText.includes(needle);
    case 'notContains':
      return !displayText.includes(needle);
    case 'startsWith':
      return displayText.startsWith(needle);
    case 'endsWith':
      return displayText.endsWith(needle);
    case 'equals':
      return displayText === needle;
    default:
      return true;
  }
}

function assertKey(value: string, label: string): void {
  if (!KEY_PATTERN.test(value)) {
    throw new BadRequestException(`مقدار «${label}» نامعتبر است`);
  }
}

/** locale=fa → base (fa) string; otherwise labelEn with fa fallback. */
function pickLocalized(locale: string, fa: string, other: string | null): string {
  return locale === 'fa' ? fa : (other ?? fa);
}

function parseDataMap(dataJson: string): FormDataMap {
  try {
    const parsed: unknown = JSON.parse(dataJson);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as FormDataMap;
    }
  } catch {
    // corrupted row → behave like an empty record
  }
  return {};
}

function toFormRecord(
  id: string,
  dataJson: string,
  createdAt: Date,
  updatedAt: Date,
): FormRecord {
  return {
    id,
    data: parseDataMap(dataJson),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

@Injectable()
export class FormsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /:moduleKey → summaries of every active form of the module
   * (drives the «فهرست‌های اطلاعات» data-list menu on the frontend).
   */
  async listDefinitions(
    moduleKey: string,
    locale: string,
  ): Promise<FormSummary[]> {
    assertKey(moduleKey, 'moduleKey');

    const forms = await this.prisma.formDefinition.findMany({
      where: { isActive: true, moduleKey },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        moduleKey: true,
        formKey: true,
        name: true,
        nameEn: true,
        type: true,
        iconKey: true,
        accentColor: true,
      },
    });
    return forms.map((form) => ({
      moduleKey: form.moduleKey,
      formKey: form.formKey,
      name: pickLocalized(locale, form.name, form.nameEn),
      nameEn: form.nameEn,
      type: form.type as FormSummary['type'],
      iconKey: form.iconKey,
      accentColor: form.accentColor,
    }));
  }

  /** GET /:moduleKey/:formKey → localized FormDef (fields ordered by sortOrder). */
  async getDefinition(
    moduleKey: string,
    formKey: string,
    locale: string,
  ): Promise<FormDef> {
    assertKey(moduleKey, 'moduleKey');
    assertKey(formKey, 'formKey');

    const form = await this.prisma.formDefinition.findUnique({
      where: { moduleKey_formKey: { moduleKey, formKey } },
      include: {
        fields: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!form || !form.isActive) {
      throw new NotFoundException('فرم درخواستی یافت نشد');
    }

    return {
      id: form.id,
      moduleKey: form.moduleKey,
      formKey: form.formKey,
      name: pickLocalized(locale, form.name, form.nameEn),
      nameEn: form.nameEn,
      type: form.type as FormDef['type'],
      iconKey: form.iconKey,
      accentColor: form.accentColor,
      fields: form.fields.map((field) => mapField(field, locale)),
    };
  }

  /**
   * GET /:moduleKey/:formKey/records → saved records, oldest first.
   * `?filters=` (JSON ListColumnFilter[]) is evaluated SERVER-SIDE on the
   * normalized display text of each cell (lookup labels, tree parent
   * titles and checkbox labels resolved exactly like the frontend grid).
   */
  async listRecords(
    moduleKey: string,
    formKey: string,
    locale = 'fa',
    filtersParam?: string,
  ): Promise<FormRecord[]> {
    assertKey(moduleKey, 'moduleKey');
    assertKey(formKey, 'formKey');

    const form = await this.getActiveForm(moduleKey, formKey);
    const rows = await this.prisma.formDataRecord.findMany({
      where: { formId: form.id },
      orderBy: { createdAt: 'asc' },
    });
    const records = rows.map((row) =>
      toFormRecord(row.id, row.dataJson, row.createdAt, row.updatedAt),
    );

    const filters = parseColumnFilters(filtersParam);
    if (!filters.length) return records;

    const fields = await this.prisma.formFieldDefinition.findMany({
      where: { formId: form.id, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    const searchText = await this.buildSearchTextResolver(
      form.id,
      fields,
      records,
      locale,
    );

    return records.filter((record) =>
      filters.every((filter) =>
        matchesFilter(record.data[filter.field], filter, searchText(filter.field, record)),
      ),
    );
  }

  /** POST /:moduleKey/:formKey/records → create a saved record. */
  async createRecord(
    moduleKey: string,
    formKey: string,
    dto: SaveRecordDto,
  ): Promise<FormRecord> {
    assertKey(moduleKey, 'moduleKey');
    assertKey(formKey, 'formKey');

    const form = await this.getActiveForm(moduleKey, formKey);
    const dataJson = await this.stringifyFilteredData(form.id, dto.data);
    const row = await this.prisma.formDataRecord.create({
      data: { formId: form.id, dataJson },
    });
    return toFormRecord(row.id, row.dataJson, row.createdAt, row.updatedAt);
  }

  /** PUT /:moduleKey/:formKey/records/:recordId → replace the record data. */
  async updateRecord(
    moduleKey: string,
    formKey: string,
    recordId: string,
    dto: SaveRecordDto,
  ): Promise<FormRecord> {
    assertKey(moduleKey, 'moduleKey');
    assertKey(formKey, 'formKey');

    const form = await this.getActiveForm(moduleKey, formKey);
    const existing = await this.prisma.formDataRecord.findFirst({
      where: { id: recordId, formId: form.id },
    });
    if (!existing) {
      throw new NotFoundException('رکورد درخواستی یافت نشد');
    }

    const dataJson = await this.stringifyFilteredData(form.id, dto.data);
    const row = await this.prisma.formDataRecord.update({
      where: { id: existing.id },
      data: { dataJson },
    });
    return toFormRecord(row.id, row.dataJson, row.createdAt, row.updatedAt);
  }

  /** DELETE /:moduleKey/:formKey/records/:recordId. */
  async deleteRecord(
    moduleKey: string,
    formKey: string,
    recordId: string,
  ): Promise<void> {
    assertKey(moduleKey, 'moduleKey');
    assertKey(formKey, 'formKey');

    const form = await this.getActiveForm(moduleKey, formKey);
    const existing = await this.prisma.formDataRecord.findFirst({
      where: { id: recordId, formId: form.id },
    });
    if (!existing) {
      throw new NotFoundException('رکورد درخواستی یافت نشد');
    }
    await this.prisma.formDataRecord.delete({ where: { id: existing.id } });
  }

  /** GET /:moduleKey/:formKey/lookups/:lookupKey → options ordered by sortOrder. */
  async getLookupOptions(
    moduleKey: string,
    formKey: string,
    lookupKey: string,
    locale: string,
  ): Promise<LookupOption[]> {
    assertKey(moduleKey, 'moduleKey');
    assertKey(formKey, 'formKey');
    assertKey(lookupKey, 'lookupKey');

    await this.getActiveForm(moduleKey, formKey);
    const rows = await this.prisma.formLookupOption.findMany({
      where: { lookupKey },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      label: pickLocalized(locale, row.label, row.labelEn),
      labelEn: row.labelEn,
      parentId: row.parentId,
      sortOrder: row.sortOrder,
    }));
  }

  /** Active form or 404 — every route must pass through here. */
  private async getActiveForm(
    moduleKey: string,
    formKey: string,
  ): Promise<FormDefinition> {
    const form = await this.prisma.formDefinition.findUnique({
      where: { moduleKey_formKey: { moduleKey, formKey } },
    });
    if (!form || !form.isActive) {
      throw new NotFoundException('فرم درخواستی یافت نشد');
    }
    return form;
  }

  /**
   * Builds a `(fieldKey, record) → normalized display text` resolver that
   * mirrors the frontend `cellText`: tree-parent columns show the parent
   * record's title, lookup columns the localized option label and checkbox
   * cells their بلی/خیر (plus Yes/No + raw for cross-locale matching).
   */
  private async buildSearchTextResolver(
    formId: string,
    fields: FormFieldDefinition[],
    records: FormRecord[],
    locale: string,
  ): Promise<(fieldKey: string, record: FormRecord) => string> {
    const byKey = new Map(fields.map((field) => [field.fieldKey, field]));

    // Tree parent column: stored value = parent record id → title.
    const parentField =
      fields.find(
        (field) =>
          field.fieldKey === 'parentId' ||
          (field.fieldType === 'lookup' && /parent/i.test(field.fieldKey)),
      ) ?? null;
    const titleField =
      fields.find(
        (field) =>
          field !== parentField && /title|name|desc/i.test(field.fieldKey),
      ) ??
      fields.find((field) => field !== parentField) ??
      null;
    const parentTitles = new Map<string, string>();
    if (parentField) {
      for (const record of records) {
        const raw = titleField ? record.data[titleField.fieldKey] : null;
        parentTitles.set(
          record.id,
          raw === null || raw === undefined || raw === ''
            ? record.id
            : String(raw),
        );
      }
    }

    // Lookup columns: stored value = option code → localized label.
    const lookupKeys = [
      ...new Set(
        fields
          .filter((field) => field.fieldType === 'lookup' && field.lookupKey)
          .map((field) => field.lookupKey as string),
      ),
    ];
    const lookupLabels = new Map<string, Map<string, string>>();
    for (const key of lookupKeys) {
      const options = await this.prisma.formLookupOption.findMany({
        where: { lookupKey: key },
      });
      lookupLabels.set(
        key,
        new Map(
          options.map((option) => [
            option.code,
            pickLocalized(locale, option.label, option.labelEn),
          ]),
        ),
      );
    }

    return (fieldKey, record) => {
      const field = byKey.get(fieldKey);
      const raw = record.data[fieldKey];
      if (!field || raw === null || raw === undefined || raw === '') return '';
      if (field.fieldType === 'checkbox') {
        return normalizeSearchText(
          `${raw === true ? 'بلی Yes' : 'خیر No'} ${String(raw)}`,
        );
      }
      if (parentField && fieldKey === parentField.fieldKey) {
        return normalizeSearchText(parentTitles.get(String(raw)) ?? String(raw));
      }
      if (field.fieldType === 'lookup' && field.lookupKey) {
        const labels = lookupLabels.get(field.lookupKey);
        return normalizeSearchText(labels?.get(String(raw)) ?? String(raw));
      }
      return normalizeSearchText(String(raw));
    };
  }

  /** Keep only known active fieldKeys of the form, then serialize. */
  private async stringifyFilteredData(
    formId: string,
    data: Record<string, string | number | boolean | null>,
  ): Promise<string> {
    const fields = await this.prisma.formFieldDefinition.findMany({
      where: { formId, isActive: true },
      select: { fieldKey: true },
    });
    const knownKeys = new Set(fields.map((field) => field.fieldKey));

    const filtered: FormDataMap = {};
    for (const [key, value] of Object.entries(data)) {
      if (knownKeys.has(key)) {
        filtered[key] = value;
      }
    }
    return JSON.stringify(filtered);
  }
}

function mapField(field: FormFieldDefinition, locale: string): FormFieldDef {
  return {
    id: field.id,
    tabKey: field.tabKey,
    tabName:
      field.tabName === null
        ? null
        : pickLocalized(locale, field.tabName, field.tabNameEn),
    fieldKey: field.fieldKey,
    label: pickLocalized(locale, field.label, field.labelEn),
    labelEn: field.labelEn,
    fieldType: field.fieldType as FormFieldDef['fieldType'],
    isRequired: field.isRequired,
    span: field.span === 2 ? 2 : 1,
    lookupKey: field.lookupKey,
    defaultValue: field.defaultValue,
    sortOrder: field.sortOrder,
  };
}
