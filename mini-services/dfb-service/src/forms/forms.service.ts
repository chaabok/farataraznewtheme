import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import {
  AddFieldDto,
  CreateFormDto,
  SaveFormDataDto,
  UpdateFormDto,
  assertComponentKey,
  assertFieldType,
} from "./forms.dto";
import { appBaseOnCreate, appBaseOnUpdate, SYSTEM_ACTOR } from "../../../_shared/app-base-entity";
import { parseJsonColumn, toPlain } from "../shared/serialize";

/**
 * DfbForm service — تعریف/ویرایش فرم‌ها (سیستمی و کاربر)، تب‌ها و فیلدها،
 * افزودن فیلد به فرم سیستمی (IsCustom=true) و ذخیره/خواندن دادهٔ رکوردها (EAV).
 */
@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /* ------------------------------- read ------------------------------- */

  /** Full definition: form + tabs + fields (+header/body/footer parsed). */
  async findOne(id: number) {
    const form = await this.prisma.dfbForm.findUnique({ where: { id: BigInt(id) } });
    if (!form) throw new NotFoundException("فرم یافت نشد");
    const [tabs, fields] = await Promise.all([
      this.prisma.dfbFormTab.findMany({ where: { formRef: BigInt(id) }, orderBy: { orderIndex: "asc" } }),
      this.prisma.dfbFormField.findMany({ where: { formRef: BigInt(id) }, orderBy: { orderIndex: "asc" } }),
    ]);
    return {
      item: {
        ...toPlain(form),
        header: parseJsonColumn(form.headerJson),
        body: parseJsonColumn(form.bodyJson),
        footer: parseJsonColumn(form.footerJson),
        tabs: tabs.map((t) => ({
          id: Number(t.id),
          formRef: Number(t.formRef),
          parentRef: Number(t.parentRef), // Task 50 — 0=band-level | >0=tab inside that band row
          title: t.title,
          titleEn: t.titleEn,
          tabKind: t.tabKind, // Task 49 — 1=grid (default) | 2=input fields
          orderIndex: t.orderIndex,
          version: t.version,
        })),
        fields: fields.map((f) => ({
          id: Number(f.id),
          formRef: Number(f.formRef),
          tabRef: f.tabRef != null ? Number(f.tabRef) : null,
          section: f.section,
          fieldKey: f.fieldKey,
          label: f.label,
          labelEn: f.labelEn,
          fieldType: f.fieldType,
          required: f.required,
          readOnly: f.readOnly,
          orderIndex: f.orderIndex,
          widthSpan: f.widthSpan,
          defaultValue: f.defaultValue,
          queryRef: f.queryRef != null ? Number(f.queryRef) : null,
          queryFieldKey: f.queryFieldKey,
          isCustom: f.isCustom,
          version: f.version,
        })),
      },
    };
  }

  /* ------------------------------- create ------------------------------ */

  async create(dto: CreateFormDto) {
    assertComponentKey(dto.componentKey);
    const menu = await this.prisma.dfbMenu.findUnique({ where: { id: BigInt(dto.menuRef) } });
    if (!menu) throw new BadRequestException("منوی مقصد یافت نشد");
    const id = await this.idGen.generateNextId("DfbForm");
    const form = await this.prisma.dfbForm.create({
      data: {
        id: BigInt(id),
        menuRef: BigInt(dto.menuRef),
        code: `DFB-F-${id}`,
        title: dto.title,
        titleEn: dto.titleEn ?? null,
        componentKey: dto.componentKey,
        headerJson: dto.header ? JSON.stringify(dto.header) : null,
        bodyJson: dto.body ? JSON.stringify(dto.body) : null,
        footerJson: dto.footer ? JSON.stringify(dto.footer) : null,
        status: dto.status ?? 1,
        isSystem: false,
        ...appBaseOnCreate(SYSTEM_ACTOR),
      },
    });
    if (dto.tabs?.length) await this.replaceTabs(id, dto.tabs);
    if (dto.fields?.length) await this.replaceFields(id, dto.fields);
    this.logger.log(`DfbForm created ID=${id} under menu=${dto.menuRef} component=${dto.componentKey}`);
    return (await this.findOne(id)).item;
  }

  /* ------------------------------- update ------------------------------ */

  async update(id: number, dto: UpdateFormDto) {
    const form = await this.prisma.dfbForm.findUnique({ where: { id: BigInt(id) } });
    if (!form) throw new NotFoundException("فرم یافت نشد");
    const data: Record<string, unknown> = { ...appBaseOnUpdate(SYSTEM_ACTOR) };
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.titleEn !== undefined) data.titleEn = dto.titleEn;
    if (dto.header !== undefined) data.headerJson = JSON.stringify(dto.header);
    if (dto.body !== undefined) data.bodyJson = JSON.stringify(dto.body);
    if (dto.footer !== undefined) data.footerJson = JSON.stringify(dto.footer);
    if (dto.status !== undefined) data.status = dto.status;
    await this.prisma.dfbForm.update({ where: { id: BigInt(id) }, data });

    // layout sections are user-form owned: system forms keep their shape (only
    // custom fields grow); user forms replace tabs/fields wholesale
    let tabKeys: Array<{ dbId: number; clientKey?: string }> = [];
    if (!form.isSystem) {
      if (dto.tabs) tabKeys = await this.replaceTabs(id, dto.tabs);
      if (dto.fields) await this.replaceFields(id, dto.fields, /*keepCustom*/ false);
    }
    const item = (await this.findOne(id)).item;
    /* Task 50 — echo each tab's clientKey so the studio's fields phase can
       map tabRef to the FRESH tab ids (ids regenerate on every save) */
    if (tabKeys.length > 0) {
      const keyById = new Map(tabKeys.map((k) => [k.dbId, k.clientKey]));
      item.tabs = item.tabs.map((tb) => ({ ...tb, clientKey: keyById.get(tb.id) ?? null }));
    }
    return item;
  }

  async remove(id: number) {
    const form = await this.prisma.dfbForm.findUnique({ where: { id: BigInt(id) } });
    if (!form) throw new NotFoundException("فرم یافت نشد");
    if (form.isSystem) throw new BadRequestException("فرم سیستمی حذف‌شدنی نیست");
    await this.prisma.$transaction(async (tx) => {
      const dataRows = await tx.dfbFormData.findMany({ where: { formRef: BigInt(id) } });
      if (dataRows.length) {
        await tx.dfbFormDataValue.deleteMany({
          where: { dataRef: { in: dataRows.map((d) => d.id) } },
        });
        await tx.dfbFormData.deleteMany({ where: { formRef: BigInt(id) } });
      }
      await tx.dfbFormField.deleteMany({ where: { formRef: BigInt(id) } });
      await tx.dfbFormTab.deleteMany({ where: { formRef: BigInt(id) } });
      await tx.dfbForm.delete({ where: { id: BigInt(id) } });
    });
    this.logger.log(`DfbForm deleted ID=${id}`);
    return { ok: true };
  }

  /* --------------------------- add field (system too) --------------------------- */

  /** افزودن فیلد — روی فرم سیستمی به‌صورت فیلد الحاقی (IsCustom=true) ثبت می‌شود. */
  async addField(formId: number, dto: AddFieldDto) {
    assertFieldType(dto.fieldType);
    const form = await this.prisma.dfbForm.findUnique({ where: { id: BigInt(formId) } });
    if (!form) throw new NotFoundException("فرم یافت نشد");
    const id = await this.idGen.generateNextId("DfbFormField");
    const row = await this.prisma.dfbFormField.create({
      data: {
        id: BigInt(id),
        formRef: BigInt(formId),
        tabRef: dto.tabRef != null ? BigInt(dto.tabRef) : null,
        section: dto.section ?? "body",
        fieldKey: dto.fieldKey,
        label: dto.label,
        labelEn: dto.labelEn ?? null,
        fieldType: dto.fieldType,
        required: dto.required ?? false,
        readOnly: dto.readOnly ?? false,
        orderIndex: dto.orderIndex ?? 0,
        widthSpan: dto.widthSpan ?? 1,
        defaultValue: dto.defaultValue ?? null,
        queryRef: dto.queryRef != null ? BigInt(dto.queryRef) : null,
        queryFieldKey: dto.queryFieldKey ?? null,
        isCustom: form.isSystem, // کاربر فقط به فرم سیستمی «فیلد الحاقی» اضافه می‌کند
        ...appBaseOnCreate(SYSTEM_ACTOR),
      },
    });
    await this.prisma.dfbForm.update({
      where: { id: BigInt(formId) },
      data: appBaseOnUpdate(SYSTEM_ACTOR),
    });
    this.logger.log(`DfbFormField added ID=${id} form=${formId} type=${dto.fieldType} custom=${form.isSystem}`);
    return { item: toPlain(row) };
  }

  async removeField(fieldId: number) {
    const field = await this.prisma.dfbFormField.findUnique({ where: { id: BigInt(fieldId) } });
    if (!field) throw new NotFoundException("فیلد یافت نشد");
    if (!field.isCustom) throw new BadRequestException("فیلد سیستمی حذف‌شدنی نیست");
    await this.prisma.dfbFormField.delete({ where: { id: BigInt(fieldId) } });
    return { ok: true };
  }

  /* ------------------------------- form data (EAV) ------------------------------- */

  /** ذخیرهٔ رکورد فرم: هر فیلد = یک سطر DfbFormDataValue (الگوی EAV). */
  async saveData(formId: number, dto: SaveFormDataDto) {
    const form = await this.prisma.dfbForm.findUnique({ where: { id: BigInt(formId) } });
    if (!form) throw new NotFoundException("فرم یافت نشد");
    const fields = await this.prisma.dfbFormField.findMany({ where: { formRef: BigInt(formId) } });
    const fieldMap = new Map(fields.map((f) => [Number(f.id), f]));

    const externalKey = dto.externalKey ?? null;
    const existing = externalKey
      ? await this.prisma.dfbFormData.findUnique({
          where: { formRef_externalKey: { formRef: BigInt(formId), externalKey } },
        })
      : null;

    let dataId: number;
    if (existing) {
      await this.prisma.dfbFormData.update({
        where: { id: existing.id },
        data: appBaseOnUpdate(SYSTEM_ACTOR),
      });
      dataId = Number(existing.id);
    } else {
      dataId = await this.idGen.generateNextId("DfbFormData");
      await this.prisma.dfbFormData.create({
        data: {
          id: BigInt(dataId),
          formRef: BigInt(formId),
          externalKey,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
    }

    for (const [rawFieldId, rawValue] of Object.entries(dto.values ?? {})) {
      const fieldIdNum = Number(rawFieldId);
      if (!fieldMap.has(fieldIdNum)) continue; // unknown field — ignore (defensive)
      const value =
        typeof rawValue === "boolean" ? (rawValue ? "1" : "0") : rawValue == null ? null : String(rawValue);
      await this.prisma.dfbFormDataValue.upsert({
        where: { dataRef_fieldRef: { dataRef: BigInt(dataId), fieldRef: BigInt(fieldIdNum) } },
        create: {
          id: BigInt(await this.idGen.generateNextId("DfbFormDataValue")),
          dataRef: BigInt(dataId),
          fieldRef: BigInt(fieldIdNum),
          value,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
        update: { value, ...appBaseOnUpdate(SYSTEM_ACTOR) },
      });
    }
    this.logger.log(`DfbFormData saved form=${formId} data=${dataId} values=${Object.keys(dto.values ?? {}).length}`);
    return { ok: true, dataId };
  }

  /** خواندن مقادیر یک رکورد (یا همهٔ رکوردهای فرم برای فهرست). */
  async loadData(formId: number, externalKey?: string) {
    const rows = await this.prisma.dfbFormData.findMany({
      where: {
        formRef: BigInt(formId),
        ...(externalKey ? { externalKey } : {}),
      },
      orderBy: { id: "asc" },
    });
    const ids = rows.map((r) => r.id);
    const values = ids.length
      ? await this.prisma.dfbFormDataValue.findMany({ where: { dataRef: { in: ids } } })
      : [];
    const byData = new Map<number, Array<{ fieldRef: number; value: string | null }>>();
    for (const v of values) {
      const key = Number(v.dataRef);
      const list = byData.get(key) ?? [];
      list.push({ fieldRef: Number(v.fieldRef), value: v.value });
      byData.set(key, list);
    }
    return {
      items: rows.map((r) => ({
        dataId: Number(r.id),
        externalKey: r.externalKey,
        version: r.version,
        values: byData.get(Number(r.id)) ?? [],
      })),
    };
  }

  /* ------------------------------- internals ------------------------------- */

  private async replaceTabs(
    formId: number,
    tabs: Array<{
      id?: number; title: string; titleEn?: string; tabKind?: number; orderIndex?: number;
      clientKey?: string; parentKey?: string; // Task 50 — hierarchy correlation
    }>,
  ): Promise<Array<{ dbId: number; clientKey?: string }>> {
    await this.prisma.dfbFormTab.deleteMany({ where: { formRef: BigInt(formId) } });
    /* Task 50 — two passes: band rows first (parentKey empty, ParentRef=0),
       then the tabs INSIDE each records-table band resolved against the
       freshly generated parent ids via clientKey → parentKey. */
    const created: Array<{ dbId: number; clientKey?: string }> = [];
    const keyMap = new Map<string, bigint>();
    const bandRows = tabs.filter((t) => !t.parentKey);
    const childRows = tabs.filter((t) => t.parentKey);
    let order = 0;
    for (const t of bandRows) {
      const id = await this.idGen.generateNextId("DfbFormTab");
      await this.prisma.dfbFormTab.create({
        data: {
          id: BigInt(id),
          formRef: BigInt(formId),
          parentRef: BigInt(0),
          title: t.title,
          titleEn: t.titleEn ?? null,
          tabKind: t.tabKind === 2 ? 2 : 1, // Task 49 — 1=grid (default/legacy) | 2=input fields
          orderIndex: t.orderIndex ?? order++,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
      if (t.clientKey) keyMap.set(t.clientKey, BigInt(id));
      created.push({ dbId: Number(id), clientKey: t.clientKey });
    }
    for (const t of childRows) {
      const parent = t.parentKey ? keyMap.get(t.parentKey) : undefined;
      if (!parent) throw new BadRequestException("باندِ والدِ تب یافت نشد");
      const id = await this.idGen.generateNextId("DfbFormTab");
      await this.prisma.dfbFormTab.create({
        data: {
          id: BigInt(id),
          formRef: BigInt(formId),
          parentRef: parent, // تبِ داخل باندِ «جدول رکوردها»
          title: t.title,
          titleEn: t.titleEn ?? null,
          tabKind: t.tabKind === 2 ? 2 : 1, // tabs inside a records-table band are grids
          orderIndex: t.orderIndex ?? 0,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
      if (t.clientKey) keyMap.set(t.clientKey, BigInt(id));
      created.push({ dbId: Number(id), clientKey: t.clientKey });
    }
    return created;
  }

  private async replaceFields(
    formId: number,
    fields: Array<{
      id?: number; fieldKey: string; label: string; labelEn?: string; fieldType: string;
      tabRef?: number | null; section?: string; required?: boolean; readOnly?: boolean;
      orderIndex?: number; widthSpan?: number; defaultValue?: string | null;
      queryRef?: number | null; queryFieldKey?: string | null;
    }>,
    keepCustom = true,
  ) {
    for (const f of fields) assertFieldType(f.fieldType);
    await this.prisma.$transaction(async (tx) => {
      if (keepCustom) {
        await tx.dfbFormField.deleteMany({ where: { formRef: BigInt(formId), isCustom: false } });
      } else {
        await tx.dfbFormField.deleteMany({ where: { formRef: BigInt(formId) } });
      }
    });
    let order = 0;
    for (const f of fields) {
      const id = await this.idGen.generateNextId("DfbFormField");
      await this.prisma.dfbFormField.create({
        data: {
          id: BigInt(id),
          formRef: BigInt(formId),
          tabRef: f.tabRef != null ? BigInt(f.tabRef) : null,
          section: f.section ?? "body",
          fieldKey: f.fieldKey,
          label: f.label,
          labelEn: f.labelEn ?? null,
          fieldType: f.fieldType,
          required: f.required ?? false,
          readOnly: f.readOnly ?? false,
          orderIndex: f.orderIndex ?? order++,
          widthSpan: f.widthSpan ?? 1,
          defaultValue: f.defaultValue ?? null,
          queryRef: f.queryRef != null ? BigInt(f.queryRef) : null,
          queryFieldKey: f.queryFieldKey ?? null,
          isCustom: false,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
    }
  }
}
