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
  FormRecord,
  FormSummary,
  LookupOption,
} from './forms.types';

/** All route keys (moduleKey / formKey / lookupKey) share this whitelist. */
const KEY_PATTERN = /^[a-z][a-zA-Z0-9-]{0,49}$/;

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

  /** GET /:moduleKey/:formKey/records → saved records, oldest first. */
  async listRecords(moduleKey: string, formKey: string): Promise<FormRecord[]> {
    assertKey(moduleKey, 'moduleKey');
    assertKey(formKey, 'formKey');

    const form = await this.getActiveForm(moduleKey, formKey);
    const rows = await this.prisma.formDataRecord.findMany({
      where: { formId: form.id },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) =>
      toFormRecord(row.id, row.dataJson, row.createdAt, row.updatedAt),
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
