import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { existsSync } from "node:fs";
import path from "node:path";
// Bun's built-in SQLite driver — provided by the Bun runtime itself (no npm
// types installed in this package), used READ-ONLY for the Task 59 schema
// tree + the connected-database script reader.
// @ts-expect-error — "bun:sqlite" ships with the Bun runtime
import { Database } from "bun:sqlite";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { APP_CATALOG } from "../../../_shared/app-catalog";
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

/* ----------------- Task 59 — connected-database schema types ----------------- */

/** one column of a table/view (PRAGMA table_info) */
interface SchemaFieldOut {
  name: string;
  type: string;
  pk: boolean;
  notNull: boolean;
}

/** one table or view of a connected database */
interface SchemaTableOut {
  name: string;
  type: "table" | "view";
  fields: SchemaFieldOut[];
}

/** one connected database + the software (catalog apps) using it */
interface SchemaGroupOut {
  dbFile: string;
  apps: Array<{ appKey: string; titleFa: string; iconKey: string; order: number }>;
  tables: SchemaTableOut[];
}

/**
 * Task 53 (owner request — «فیلد اسکریپت‌نویسی») — SCRIPT_ROW_CAP: script
 * results are capped (rows AND output) through a tiny read-only API handed to
 * the sandboxed function. No free SQL, no writes — the same defense-in-depth
 * posture as QUERY_TABLES (no free-form SQL, owner Q4).
 */
const SCRIPT_ROW_CAP = 200;

/**
 * Task 59 — resolution order for script reads: the فرمساز's own dedicated
 * database first (dfb.db), then the shared platform database (custom.db).
 */
const CONNECTED_DB_FILES = ["dfb.db", "custom.db"] as const;
const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]{0,62}$/;

/**
 * DfbForm service — تعریف/ویرایش فرم‌ها (سیستمی و کاربر)، تب‌ها و فیلدها،
 * افزودن فیلد به فرم سیستمی (IsCustom=true) و ذخیره/خواندن دادهٔ رکوردها (EAV).
 */
@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  /** Task 59 — read-only SQLite handles per db file (shared for the process) */
  private readonly sqliteConns = new Map<string, InstanceType<typeof Database>>();
  /** Task 59 — column cache per db file → table (schema introspection) */
  private readonly columnsCache = new Map<string, Map<string, SchemaFieldOut[]>>();
  private schemaCache: { at: number; items: SchemaGroupOut[] } | null = null;
  private static readonly SCHEMA_TTL_MS = 15000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /* ---------------- Task 59 — connected-database introspection ---------------- */

  /** resolves db/<file> at the project root (service cwd = mini-services/<svc>) */
  private dbFilePath(file: string): string | null {
    const p = path.resolve(process.cwd(), "..", "..", "db", file);
    return existsSync(p) ? p : null;
  }

  /** read-only connection — scripts and introspection can never write */
  private sqliteConn(file: string): InstanceType<typeof Database> | null {
    const hit = this.sqliteConns.get(file);
    if (hit) return hit;
    const p = this.dbFilePath(file);
    if (!p) return null;
    const db = new Database(p, { readonly: true });
    this.sqliteConns.set(file, db);
    return db;
  }

  /** full column info of a table/view (cached); null = unknown object */
  private columnsFull(file: string, table: string): SchemaFieldOut[] | null {
    const perFile = this.columnsCache.get(file) ?? new Map<string, SchemaFieldOut[]>();
    const hit = perFile.get(table);
    if (hit) return hit;
    const db = this.sqliteConn(file);
    if (!db) return null;
    const safe = table.replace(/"/g, '""');
    const rows = db
      .query(`PRAGMA table_info("${safe}")`)
      .all() as Array<{ name: string; type: string; notnull: number; pk: number }>;
    if (rows.length === 0) return null;
    const fields = rows.map((r) => ({
      name: r.name,
      type: (r.type || "TEXT").toUpperCase(),
      pk: r.pk > 0,
      notNull: r.notnull === 1,
    }));
    perFile.set(table, fields);
    this.columnsCache.set(file, perFile);
    return fields;
  }

  /** finds which connected db holds a table/view (custom.db first) */
  private locateTable(name: string): { file: string; fields: SchemaFieldOut[] } | null {
    for (const file of CONNECTED_DB_FILES) {
      const fields = this.columnsFull(file, name);
      if (fields && fields.length > 0) return { file, fields };
    }
    return null;
  }

  /**
   * Task 59 — GET advancedTools/forms/schema/tree
   * نرم‌افزارها (کاتالوگ) → بانک متصل هر کدام → جداول و ویوها → فیلدها.
   * Deduped by physical db file (shared-mode apps point at custom.db).
   */
  schemaTree(): { items: SchemaGroupOut[] } {
    if (this.schemaCache && Date.now() - this.schemaCache.at < FormsService.SCHEMA_TTL_MS) {
      return { items: this.schemaCache.items };
    }
    const groups = new Map<string, SchemaGroupOut>();
    for (const a of [...APP_CATALOG].sort((x, y) => x.order - y.order)) {
      /* dedicated apps own their db file; shared apps sit on the main db */
      const dbFile = a.dbMode === "dedicated" ? "dfb.db" : "custom.db";
      const g = groups.get(dbFile) ?? { dbFile, apps: [], tables: [] };
      g.apps.push({ appKey: a.appKey, titleFa: a.titleFa, iconKey: a.iconKey, order: a.order });
      groups.set(dbFile, g);
    }
    for (const g of groups.values()) {
      const db = this.sqliteConn(g.dbFile);
      if (!db) {
        g.tables = [];
        continue;
      }
      const objs = db
        .query(
          "SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY type, name",
        )
        .all() as Array<{ name: string; type: string }>;
      g.tables = objs
        .map((o) => {
          const fields = this.columnsFull(g.dbFile, o.name) ?? [];
          return { name: o.name, type: o.type === "view" ? ("view" as const) : ("table" as const), fields };
        })
        .filter((t) => t.fields.length > 0);
    }
    const items = [...groups.values()];
    this.schemaCache = { at: Date.now(), items };
    this.logger.log(`schema tree: ${items.length} db group(s), ${items.reduce((n, g) => n + g.tables.length, 0)} object(s)`);
    return { items };
  }

  /**
   * Task 59 — safe read of a connected-db table/view for scripts: identifiers
   * validated against the REAL schema (PRAGMA), values bound as parameters,
   * equality-only WHERE, row cap, read-only connection. No free SQL, no writes.
   */
  private sqliteFindMany(
    file: string,
    table: string,
    opts?: { where?: Record<string, unknown>; take?: number; orderBy?: Record<string, unknown> },
  ): Array<Record<string, unknown>> {
    const fields = this.columnsFull(file, table);
    if (!fields || fields.length === 0) throw new BadRequestException(`جدول «${table}» در بانک متصل یافت نشد`);
    const colSet = new Set(fields.map((f) => f.name));
    const ident = (c: string) => {
      if (!colSet.has(c)) throw new BadRequestException(`ستون «${c}» در «${table}» وجود ندارد`);
      return `"${c.replace(/"/g, '""')}"`;
    };
    const params: unknown[] = [];
    let sql = `SELECT * FROM "${table.replace(/"/g, '""')}"`;
    if (opts?.where && typeof opts.where === "object") {
      const conds: string[] = [];
      for (const [k, v] of Object.entries(opts.where)) {
        conds.push(`${ident(k)} = ?`);
        params.push(v as unknown);
      }
      if (conds.length > 0) sql += ` WHERE ${conds.join(" AND ")}`;
    }
    if (opts?.orderBy && typeof opts.orderBy === "object") {
      const first = Object.entries(opts.orderBy)[0];
      if (first && typeof first[1] === "string") {
        sql += ` ORDER BY ${ident(first[0])} ${first[1].toLowerCase() === "desc" ? "DESC" : "ASC"}`;
      }
    }
    const take = Math.min(Number(opts?.take ?? 50) || 50, SCRIPT_ROW_CAP);
    sql += ` LIMIT ?`;
    params.push(take);
    const db = this.sqliteConn(file);
    if (!db) throw new BadRequestException(`بانک «${file}» در دسترس نیست`);
    const rows = db.query(sql).all(...(params as unknown[])) as Array<Record<string, unknown>>;
    return rows.map((r) => toPlain(r) as Record<string, unknown>);
  }

  /* ------------------- Task 62 — SQL-style select for scripts ------------------- */

  /**
   * Task 62 (owner report) — the owner naturally writes SQL in the script
   * editor («select * from DfbForm»). A tiny read-only SELECT parser over the
   * SAME safe reader — no free SQL ever reaches SQLite:
   *   select <cols|*> from <Table> [where <col> = <lit> [and ...]] [limit N]
   * Table may also be written as db.table("X"). Returns null when the source
   * is NOT a select statement (falls through to the JS sandbox); throws a
   * clear BadRequest when it looks like a select but cannot be parsed.
   */
  private parseSqlSelect(src: string): {
    cols: string[] | null;
    table: string;
    where: Record<string, unknown>;
    limit: number;
  } | null {
    const s = src.trim().replace(/;+\s*$/, "");
    if (!/^select\b/i.test(s)) return null;

    const m = /^select\s+(.+?)\s+from\s+(.+)$/is.exec(s);
    if (!m) throw new BadRequestException("دستور select نامعتبر است؛ نمونه: select * from DfbForm");
    const colsPart = m[1].trim();
    let tail = m[2].trim();

    /* table source: db.table("X") | "X" | 'X' | bare identifier */
    let table: string | null = null;
    const dbt = /^db\.table\(\s*(["'`])([^"'`]+)\1\s*\)/i.exec(tail);
    if (dbt) {
      table = dbt[2];
      tail = tail.slice(dbt[0].length).trim();
    } else {
      const quoted = /^(["'`])([^"'`]+)\1/.exec(tail);
      const bare = /^([A-Za-z_][A-Za-z0-9_]*)/.exec(tail);
      if (quoted) {
        table = quoted[2];
        tail = tail.slice(quoted[0].length).trim();
      } else if (bare) {
        table = bare[1];
        tail = tail.slice(bare[0].length).trim();
      }
    }
    if (!table || !IDENT_RE.test(table)) {
      throw new BadRequestException(`نام جدول در select نامعتبر است: ${table ?? "—"}`);
    }

    /* column list: * or comma-separated identifiers (validated against schema later) */
    let cols: string[] | null = null;
    if (colsPart !== "*") {
      cols = colsPart.split(",").map((c) => c.trim().replace(/^["'`]+|["'`]+$/g, "")).filter(Boolean);
      if (cols.length === 0) throw new BadRequestException("فهرست ستون‌های select خالی است");
      for (const c of cols) {
        if (!IDENT_RE.test(c)) throw new BadRequestException(`ستون نامعتبر در select: ${c}`);
      }
    }

    /* tail: [where …] [limit N] — where is equality-only, AND-chained, bound values */
    let limit = SCRIPT_ROW_CAP;
    const where: Record<string, unknown> = {};
    const wm = /^where\s+(.+?)(?:\s+limit\s+(\d+))?$/is.exec(tail);
    const lm = /^limit\s+(\d+)$/is.exec(tail);
    if (wm) {
      if (wm[2]) limit = Math.min(Number(wm[2]), SCRIPT_ROW_CAP);
      for (const piece of wm[1].split(/\band\b/i)) {
        const cm = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*$/.exec(piece);
        if (!cm) throw new BadRequestException("در where فقط «ستون = مقدار» (با and) پذیرفته می‌شود");
        const lit = cm[2];
        const sq = /^'([^']*)'$/.exec(lit);
        const dq = /^"([^"]*)"$/.exec(lit);
        if (sq) where[cm[1]] = sq[1];
        else if (dq) where[cm[1]] = dq[1];
        else if (/^-?\d+(\.\d+)?$/.test(lit)) where[cm[1]] = Number(lit);
        else throw new BadRequestException(`مقدار where پشتیبانی نمی‌شود: ${lit} (فقط رشتهٔ نقل‌قولی یا عدد)`);
      }
    } else if (lm) {
      limit = Math.min(Number(lm[1]), SCRIPT_ROW_CAP);
    } else if (tail !== "") {
      throw new BadRequestException("بخش پایانی select قابل فهم نیست؛ نمونه: select * from DfbForm limit 10");
    }

    return { cols, table, where, limit };
  }

  /** executes a parsed SQL-style select via locateTable + sqliteFindMany */
  private execSqlSelect(plan: {
    cols: string[] | null;
    table: string;
    where: Record<string, unknown>;
    limit: number;
  }): Array<Record<string, unknown>> {
    const loc = this.locateTable(plan.table);
    if (!loc) {
      throw new BadRequestException(`جدول یا ویو «${plan.table}» در بانک‌های اطلاعاتی متصل یافت نشد`);
    }
    if (plan.cols) {
      const names = new Set(loc.fields.map((f) => f.name));
      for (const c of plan.cols) {
        if (!names.has(c)) throw new BadRequestException(`ستون «${c}» در «${plan.table}» وجود ندارد`);
      }
    }
    const rows = this.sqliteFindMany(loc.file, plan.table, {
      where: Object.keys(plan.where).length > 0 ? plan.where : undefined,
      take: plan.limit,
    });
    if (!plan.cols) return rows;
    return rows.map((r) => {
      const out: Record<string, unknown> = {};
      for (const c of plan.cols!) out[c] = r[c] ?? null;
      return out;
    });
  }

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
        ...(toPlain(form) as Record<string, unknown>), // Task 59 — toPlain returns unknown; spread needs the object cast
        header: parseJsonColumn(form.headerJson),
        body: parseJsonColumn(form.bodyJson),
        footer: parseJsonColumn(form.footerJson),
        tabs: tabs.map((t) => ({
          id: Number(t.id),
          formRef: Number(t.formRef),
          parentRef: Number(t.parentRef), // Task 50 — 0=band-level | >0=tab inside that band row
          clientKey: t.clientKey, // Task 69 — هویت پایدار ترجمهٔ عنوان تب
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
          configJson: f.configJson, // Task 53 — script/bind/shape config
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
      /* Task 68/69 — ترجمه‌های فرم و فیلدها و تب‌ها و آیتم‌ها (EntityRef = formId) پاک می‌شوند */
      await tx.dfbTranslation.deleteMany({
        where: { entityRef: BigInt(id), entityType: { in: ["Form", "Field", "Tab", "Option"] } },
      });
      /* Task 70 — ترجمهٔ داده‌های واردشدهٔ رکوردهای این فرم (EntityRef = dataId) */
      await tx.dfbTranslation.deleteMany({
        where: { entityType: "Value", entityRef: { in: dataRows.map((d) => d.id) } },
      });
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
        configJson: dto.configJson ?? null, // Task 53
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
    /* Task 68 — ترجمه‌های این فیلد (هویت پایدار: formRef + fieldKey) پاک می‌شوند */
    await this.prisma.dfbTranslation.deleteMany({
      where: { entityType: "Field", entityRef: field.formRef, fieldKey: field.fieldKey },
    });
    /* Task 69 — ترجمه‌های آیتم‌های این فیلد (کلید مرکب `<fieldKey>::<value>`) پاک می‌شوند؛
       پسوند :: جلوترِ پیشوندی‌بودن نام فیلدهای مشابه (fld_a در برابر fld_ab) را می‌گیرد */
    await this.prisma.dfbTranslation.deleteMany({
      where: { entityType: "Option", entityRef: field.formRef, fieldKey: { startsWith: `${field.fieldKey}::` } },
    });
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

  /**
   * Task 64 — حذف یک رکورد EAV (درخواست مالک — MainDataGrid «فهرست کلّی»):
   * ابتدا مقادیر (DfbFormDataValue) سپس خود رکورد (DfbFormData) حذف می‌شود؛
   * رکورد باید متعلق به همین فرم باشد تا حذف بین-فرمی ممکن نشود.
   */
  async removeData(formId: number, dataId: number) {
    const rec = await this.prisma.dfbFormData.findUnique({ where: { id: BigInt(dataId) } });
    if (!rec || Number(rec.formRef) !== formId) throw new NotFoundException("رکورد یافت نشد");
    const values = await this.prisma.dfbFormDataValue.deleteMany({ where: { dataRef: BigInt(dataId) } });
    await this.prisma.dfbFormData.delete({ where: { id: BigInt(dataId) } });
    /* Task 70 — ترجمهٔ داده‌های واردشدهٔ این رکورد هم پاک می‌شود */
    await this.prisma.dfbTranslation.deleteMany({
      where: { entityType: "Value", entityRef: BigInt(dataId) },
    });
    this.logger.log(`DfbFormData removed form=${formId} data=${dataId} values=${values.count}`);
    return { ok: true };
  }

  /* --------------------------- Task 53 — form scripts --------------------------- */

  /**
   * اجرای اسکریپت فرم (درخواست مالک — فیلد «اسکریپت‌نویسی»): اسکریپت یک
   * تابع جاوااسکریپت است که با API فقط-خواندنیِ db اجرا می‌شود و آرایه‌ای
   * از اشیاء (یا یک شیء) برمی‌گرداند. سرویس نام ستون‌های خروجی (فیلدهای
   * واکشی‌شده) را استخراج می‌کند تا استودیو بگذارد کاربر آن‌ها را انتخاب کند
   * و ران‌تایم بتواند فیلدهای متصل را پیش‌پر کند.
   *
   * امنیت: بدون SQL آزاد؛ جداول whitelist از طریق Prisma delegate + (Task 59)
   * هر جدول/ویوی بانک‌های متصل از طریق خوانندهٔ امن sqlite (شناسه‌های اعتبارسنجی‌شده
   * با PRAGMA، مقادیر پارامتری، اتصال فقط-خواندنی)، سقف ردیف (SCRIPT_ROW_CAP)،
   * بدون دسترسی به network/fs/process (تابع فقط «db» را می‌بیند؛ strict mode).
   */
  async runScript(script: string) {
    const src = String(script ?? "");
    if (!src.trim()) throw new BadRequestException("اسکریپت خالی است");
    if (src.length > 16000) throw new BadRequestException("اسکریپت بیش از حد بلند است");

    /* Task 62 (owner report) — the owner naturally writes SQL («select * from
       DfbForm»). If the source IS a select statement, run it through the SAME
       safe sqlite reader (validated identifiers, bound values, read-only, row
       cap) — no free SQL reaches SQLite. Anything else stays a JS body. */
    const sqlPlan = this.parseSqlSelect(src);
    if (sqlPlan) {
      let rows: Array<Record<string, unknown>>;
      try {
        rows = this.execSqlSelect(sqlPlan);
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`form script failed: ${msg}`);
        throw new BadRequestException(`خطای اجرای اسکریپت: ${msg}`);
      }
      const fields: string[] = [];
      for (const r of rows.slice(0, 20)) {
        for (const k of Object.keys(r ?? {})) {
          if (!fields.includes(k)) fields.push(k);
        }
      }
      this.logger.log(`form script executed rows=${rows.length} fields=${fields.length}`);
      return { ok: true, fields, rowCount: rows.length, rows: rows.slice(0, 50) };
    }

    const svc = this; // Task 59 — the connected-db reader needs `this`
    const db = {
      /** db.table("DfbMenu").findMany({ where: {...}, take: 50 }) — read-only.
       *  Task 59 — EVERY read (whitelisted Dfb tables AND any other table/view
       *  of the connected databases) goes through ONE safe SQLite reader so
       *  scripts always see the PHYSICAL column names — exactly the names the
       *  schema tree shows the owner (validated identifiers, bound values,
       *  read-only connection, row cap). No free SQL, no writes. */
      table(name: string) {
        if (!IDENT_RE.test(name)) throw new BadRequestException(`نام جدول نامعتبر: ${name}`);
        const loc = svc.locateTable(name);
        if (!loc) {
          throw new BadRequestException(`جدول یا ویو «${name}» در بانک‌های اطلاعاتی متصل یافت نشد`);
        }
        return {
          async findMany(opts?: { where?: Record<string, unknown>; take?: number; orderBy?: Record<string, unknown> }) {
            return svc.sqliteFindMany(loc.file, name, opts);
          },
        };
      },
    };

    let result: unknown;
    try {
      /* AsyncFunction — scripts may use top-level `await` (db calls) */
      const AsyncFunction = Object.getPrototypeOf(async function () {
        /* noop */
      }).constructor;
      const fn = new AsyncFunction("db", `"use strict";\n${src}\n`);
      result = await fn(db);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`form script failed: ${msg}`);
      throw new BadRequestException(`خطای اجرای اسکریپت: ${msg}`);
    }

    let rows: Array<Record<string, unknown>>;
    if (Array.isArray(result)) rows = result as Array<Record<string, unknown>>;
    else if (result != null && typeof result === "object") rows = [result as Record<string, unknown>];
    else throw new BadRequestException("خروجی اسکریپت باید آرایه‌ای از اشیاء یا یک شیء باشد");

    rows = rows.slice(0, SCRIPT_ROW_CAP).map((r) => (r && typeof r === "object" ? (toPlain(r) as Record<string, unknown>) : {}));
    /* fetched fields = union of the first rows' keys (stable order) */
    const fields: string[] = [];
    for (const r of rows.slice(0, 20)) {
      for (const k of Object.keys(r ?? {})) {
        if (!fields.includes(k)) fields.push(k);
      }
    }
    this.logger.log(`form script executed rows=${rows.length} fields=${fields.length}`);
    return { ok: true, fields, rowCount: rows.length, rows: rows.slice(0, 50) };
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
       freshly generated parent ids via clientKey → parentKey.
       Task 69 — clientKey now PERSISTS (ClientKey column) so tab titles keep
       their stable translation identity (Tab:<formRef>:<clientKey>) across
       saves that regenerate tab ids. */
    const created: Array<{ dbId: number; clientKey?: string }> = [];
    const keyMap = new Map<string, bigint>();
    const bandRows = tabs.filter((t) => !t.parentKey);
    const childRows = tabs.filter((t) => t.parentKey);
    let order = 0;
    for (const t of bandRows) {
      const id = await this.idGen.generateNextId("DfbFormTab");
      const cKey = t.clientKey?.trim() || `tab_${id}`;
      await this.prisma.dfbFormTab.create({
        data: {
          id: BigInt(id),
          formRef: BigInt(formId),
          parentRef: BigInt(0),
          clientKey: cKey, // Task 69
          title: t.title,
          titleEn: t.titleEn ?? null,
          tabKind: t.tabKind === 2 ? 2 : 1, // Task 49 — 1=grid (default/legacy) | 2=input fields
          orderIndex: t.orderIndex ?? order++,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
      keyMap.set(cKey, BigInt(id));
      created.push({ dbId: Number(id), clientKey: cKey });
    }
    for (const t of childRows) {
      const parent = t.parentKey ? keyMap.get(t.parentKey) : undefined;
      if (!parent) throw new BadRequestException("باندِ والدِ تب یافت نشد");
      const id = await this.idGen.generateNextId("DfbFormTab");
      const cKey = t.clientKey?.trim() || `tab_${id}`;
      await this.prisma.dfbFormTab.create({
        data: {
          id: BigInt(id),
          formRef: BigInt(formId),
          parentRef: parent, // تبِ داخل باندِ «جدول رکوردها»
          clientKey: cKey, // Task 69
          title: t.title,
          titleEn: t.titleEn ?? null,
          tabKind: t.tabKind === 2 ? 2 : 1, // tabs inside a records-table band are grids
          orderIndex: t.orderIndex ?? 0,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
      keyMap.set(cKey, BigInt(id));
      created.push({ dbId: Number(id), clientKey: cKey });
    }
    /* Task 69 — همگام‌سازی ترجمه‌های عنوان تب: باند/تبی که دیگر در فرم نیست
       (حذف با «حذف باند/تب») یتیم می‌شود؛ کلیدهای زنده = clientKeyهای همین ذخیره */
    const liveCKeys = created.map((c) => c.clientKey).filter((k): k is string => Boolean(k));
    const tabTrRows = await this.prisma.dfbTranslation.findMany({
      where: { entityType: "Tab", entityRef: BigInt(formId) },
      select: { id: true, fieldKey: true },
    });
    const staleTabTrIds = tabTrRows.filter((r) => !liveCKeys.includes(r.fieldKey)).map((r) => r.id);
    if (staleTabTrIds.length > 0) {
      await this.prisma.dfbTranslation.deleteMany({ where: { id: { in: staleTabTrIds } } });
    }
    return created;
  }

  private async replaceFields(
    formId: number,
    fields: Array<{
      id?: number; fieldKey: string; label: string; labelEn?: string; fieldType: string;
      tabRef?: number | null; section?: string; required?: boolean; readOnly?: boolean;
      orderIndex?: number; widthSpan?: number; defaultValue?: string | null;
      queryRef?: number | null; queryFieldKey?: string | null; configJson?: string | null;
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
          configJson: f.configJson ?? null, // Task 53
          isCustom: false,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
    }
    /* Task 68 — همگام‌سازی ترجمه‌های فیلد: هویت ترجمه = (formRef، fieldKey)؛
       کلیدهایی که دیگر در فرم نیستند (حذف فیلد) یتیم می‌شوند و پاک می‌شوند */
    const liveKeys = fields.map((f) => f.fieldKey);
    await this.prisma.dfbTranslation.deleteMany({
      where: {
        entityType: "Field",
        entityRef: BigInt(formId),
        ...(liveKeys.length > 0 ? { fieldKey: { notIn: liveKeys } } : {}),
      },
    });
    /* Task 69 — همگام‌سازی ترجمه‌های آیتم‌ها (هویت = `<fieldKey>::<value>`)؛
       آیتم‌هایی که از ConfigJson حذف شده‌اند (یا فیلدشان دیگر نیست) یتیم می‌شوند */
    const liveOpts = new Set<string>();
    for (const f of fields) {
      if (!f.configJson) continue;
      let cfg: unknown = null;
      try {
        cfg = JSON.parse(f.configJson);
      } catch {
        continue; // config خراب — آیتمی برای حفظ نیست
      }
      const items = (cfg as { items?: unknown } | null)?.items;
      if (!Array.isArray(items)) continue;
      for (const it of items) {
        const value =
          typeof it === "string"
            ? it.trim()
            : String((it as { value?: unknown }).value ?? (it as { label?: unknown }).label ?? "").trim();
        if (value) liveOpts.add(`${f.fieldKey}::${value}`);
      }
    }
    const optRows = await this.prisma.dfbTranslation.findMany({
      where: { entityType: "Option", entityRef: BigInt(formId) },
      select: { id: true, fieldKey: true },
    });
    const staleOptIds = optRows.filter((r) => !liveOpts.has(r.fieldKey)).map((r) => r.id);
    if (staleOptIds.length > 0) {
      await this.prisma.dfbTranslation.deleteMany({ where: { id: { in: staleOptIds } } });
    }
  }
}
