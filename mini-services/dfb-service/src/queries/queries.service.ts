import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { CreateQueryDto } from "./queries.dto";
import { appBaseOnCreate, appBaseOnUpdate, SYSTEM_ACTOR } from "../../../_shared/app-base-entity";
import { toPlain } from "../shared/serialize";
import { InternalHttpClient } from "../../../_shared/internal-http";

/**
 * QUERY_TABLES — whitelist of queryable source tables (consultation Q4 default:
 * no free-form SQL — the user picks a table + columns from the builder UI and
 * the service builds a read-only, parameterized fetch; filters bind to
 * whitelisted columns only, so injection and out-of-scope reads are impossible).
 * "remote" sources are fetched from settings-service over the §4.2 signed
 * internal channel; "local" sources read dfb.db directly via Prisma.
 */
export interface QueryableColumn {
  name: string;
  labelFa: string;
  labelEn: string;
}
export interface QueryableTable {
  key: string;
  labelFa: string;
  labelEn: string;
  scope: "local" | "remote";
  valueColumn: string; // column used as the option value when bound to a field
  displayColumn: string; // column shown as the option label
  columns: QueryableColumn[];
  /** whitelisted column → source row key (settings-service DTOs are camelCase) */
  keyMap?: Record<string, string>;
}

export const QUERY_TABLES: QueryableTable[] = [
  {
    key: "BusinessStructure",
    labelFa: "ساختار کسب و کار",
    labelEn: "Business Structure",
    scope: "remote",
    valueColumn: "ID",
    displayColumn: "Title",
    keyMap: {
      ID: "id",
      Code: "code",
      Title: "title",
      Title_En: "titleEn",
      BusinessStructure: "businessStructureType",
      Manager: "manager",
    },
    columns: [
      { name: "ID", labelFa: "شناسه", labelEn: "ID" },
      { name: "Code", labelFa: "کد", labelEn: "Code" },
      { name: "Title", labelFa: "عنوان", labelEn: "Title" },
      { name: "Title_En", labelFa: "عنوان (لاتین)", labelEn: "Title (EN)" },
      { name: "BusinessStructure", labelFa: "نوع", labelEn: "Type" },
      { name: "Manager", labelFa: "مدیر", labelEn: "Manager" },
    ],
  },
  {
    key: "Systems",
    labelFa: "نرم‌افزارها",
    labelEn: "Systems",
    scope: "remote",
    valueColumn: "ID",
    displayColumn: "TitleFa",
    keyMap: {
      ID: "id",
      Code: "code",
      TitleFa: "titleFa",
    },
    columns: [
      { name: "ID", labelFa: "شناسه", labelEn: "ID" },
      { name: "Code", labelFa: "کد", labelEn: "Code" },
      { name: "TitleFa", labelFa: "عنوان", labelEn: "Title" },
    ],
  },
  {
    key: "DfbMenu",
    labelFa: "منوهای فرمساز",
    labelEn: "Builder Menus",
    scope: "local",
    valueColumn: "ID",
    displayColumn: "Title",
    keyMap: {
      ID: "id",
      Code: "code",
      Title: "title",
      NodeType: "nodeType",
    },
    columns: [
      { name: "ID", labelFa: "شناسه", labelEn: "ID" },
      { name: "Code", labelFa: "کد", labelEn: "Code" },
      { name: "Title", labelFa: "عنوان", labelEn: "Title" },
      { name: "NodeType", labelFa: "نوع", labelEn: "Type" },
    ],
  },
];

function resolveTable(key: string): QueryableTable {
  const t = QUERY_TABLES.find((x) => x.key === key);
  if (!t) throw new BadRequestException(`جدول «${key}» در فهرست مجاز کوئری نیست`);
  return t;
}

function assertColumns(table: QueryableTable, columns: string[]) {
  for (const c of columns) {
    if (!table.columns.some((tc) => tc.name === c)) {
      throw new BadRequestException(`ستون «${c}» در جدول «${table.key}» مجاز نیست`);
    }
  }
}

interface QueryRow {
  [column: string]: string | number | null;
}

/** DfbQuery service — کوئری‌های ذخیره‌شده + اجرای فقط-خواندنی با whitelist. */
@Injectable()
export class QueriesService {
  private readonly logger = new Logger(QueriesService.name);
  private readonly settings = new InternalHttpClient(
    process.env.INTERNAL_API_KEY ?? "farataraz-internal-dev-key-2026",
  );
  private readonly settingsUrl = process.env.SETTINGS_SERVICE_URL ?? "http://127.0.0.1:3001";

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /* ------------------------------- metadata ------------------------------- */

  tables() {
    return { items: QUERY_TABLES };
  }

  /* --------------------------------- CRUD --------------------------------- */

  async list() {
    const rows = await this.prisma.dfbQuery.findMany({ orderBy: { id: "asc" } });
    const fields = await this.prisma.dfbQueryField.findMany({ orderBy: { orderIndex: "asc" } });
    const byQuery = new Map<number, Array<Record<string, unknown>>>();
    for (const f of fields) {
      const key = Number(f.queryRef);
      const list = byQuery.get(key) ?? [];
      list.push({
        id: Number(f.id),
        fieldName: f.fieldName,
        alias: f.alias,
        orderIndex: f.orderIndex,
      });
      byQuery.set(key, list);
    }
    return {
      items: rows.map((q) => ({
        id: Number(q.id),
        code: q.code,
        title: q.title,
        titleEn: q.titleEn,
        sourceTable: q.sourceTable,
        filterColumn: q.filterColumn,
        filterValue: q.filterValue,
        isActive: q.isActive,
        version: q.version,
        fields: byQuery.get(Number(q.id)) ?? [],
      })),
    };
  }

  async create(dto: CreateQueryDto) {
    const table = resolveTable(dto.sourceTable);
    const columns = dto.fields.map((f) => f.fieldName);
    if (!columns.length) throw new BadRequestException("حداقل یک ستون انتخاب کنید");
    assertColumns(table, columns);
    if (dto.filterColumn) {
      assertColumns(table, [dto.filterColumn]);
    }
    const id = await this.idGen.generateNextId("DfbQuery");
    await this.prisma.dfbQuery.create({
      data: {
        id: BigInt(id),
        code: `DFB-Q-${id}`,
        title: dto.title,
        titleEn: dto.titleEn ?? null,
        sourceTable: dto.sourceTable,
        filterColumn: dto.filterColumn ?? null,
        filterValue: dto.filterValue ?? null,
        ...appBaseOnCreate(SYSTEM_ACTOR),
      },
    });
    let order = 0;
    for (const f of dto.fields) {
      const fid = await this.idGen.generateNextId("DfbQueryField");
      await this.prisma.dfbQueryField.create({
        data: {
          id: BigInt(fid),
          queryRef: BigInt(id),
          fieldName: f.fieldName,
          alias: f.alias ?? null,
          orderIndex: f.orderIndex ?? order++,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
    }
    this.logger.log(`DfbQuery created ID=${id} table=${dto.sourceTable} columns=${columns.length}`);
    return { item: { id } };
  }

  async remove(id: number) {
    const q = await this.prisma.dfbQuery.findUnique({ where: { id: BigInt(id) } });
    if (!q) throw new NotFoundException("کوئری یافت نشد");
    await this.prisma.$transaction(async (tx) => {
      await tx.dfbQueryField.deleteMany({ where: { queryRef: BigInt(id) } });
      await tx.dfbQuery.delete({ where: { id: BigInt(id) } });
    });
    return { ok: true };
  }

  /* -------------------------------- execute ------------------------------- */

  /** Runs a saved query (read-only) — returns whitelisted columns only. */
  async execute(id: number) {
    const q = await this.prisma.dfbQuery.findUnique({ where: { id: BigInt(id) } });
    if (!q) throw new NotFoundException("کوئری یافت نشد");
    const fields = await this.prisma.dfbQueryField.findMany({
      where: { queryRef: BigInt(id) },
      orderBy: { orderIndex: "asc" },
    });
    const table = resolveTable(q.sourceTable);
    const columns = fields.map((f) => f.fieldName);
    assertColumns(table, columns);
    if (q.filterColumn) assertColumns(table, [q.filterColumn]);

    let rows: QueryRow[];
    if (table.scope === "local") {
      rows = await this.runLocal(table, columns, q.filterColumn, q.filterValue);
    } else {
      rows = await this.runRemote(table, columns, q.filterColumn, q.filterValue);
    }
    return {
      columns: fields.map((f) => ({
        name: f.fieldName,
        alias: f.alias,
        labelFa: table.columns.find((c) => c.name === f.fieldName)?.labelFa ?? f.fieldName,
      })),
      rows: rows.map((r) => toPlain(r)),
    };
  }

  /* -------------------------------- internals ------------------------------ */

  private async runLocal(
    table: QueryableTable,
    columns: string[],
    filterColumn: string | null,
    filterValue: string | null,
  ): Promise<QueryRow[]> {
    const select: Record<string, true> = {};
    const keyMap = table.keyMap ?? {};
    for (const c of columns) {
      select[(keyMap[c] ?? c) as never] = true;
    }
    if (filterColumn) select[(keyMap[filterColumn] ?? filterColumn) as never] = true;
    // only local whitelist source today: DfbMenu
    const rows = (await this.prisma.dfbMenu.findMany({
      select: select as { id: true },
      where: { isActive: true },
    })) as Array<Record<string, unknown>>;
    // project camelCase Prisma fields back onto the whitelisted column names
    const back = Object.fromEntries(Object.entries(keyMap).map(([col, src]) => [src, col]));
    const mapped = rows.map((r) => {
      const row: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(r)) row[back[k] ?? k] = v;
      return row;
    });
    return mapped.map((r) => this.projectRow(r, columns, filterColumn, filterValue));
  }

  private async runRemote(
    table: QueryableTable,
    columns: string[],
    filterColumn: string | null,
    filterValue: string | null,
  ): Promise<QueryRow[]> {
    const path = table.key === "BusinessStructure" ? "/business-structure" : "/systems";
    const res = await this.settings.call<{ items?: Array<Record<string, unknown>> }>(
      this.settingsUrl,
      path,
      { method: "GET", timeoutMs: 4000 },
    );
    if (!res.ok || !res.data?.items) return [];
    const keyMap = table.keyMap ?? {};
    const mapped = res.data.items.map((r) => {
      const row: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(r)) row[k] = v;
      for (const [col, src] of Object.entries(keyMap)) row[col] = r[src];
      return row;
    });
    return mapped.map((r) => this.projectRow(r, columns, filterColumn, filterValue));
  }

  /** SELECT of whitelisted columns + optional equality filter — the ONLY filter shape. */
  private projectRow(
    row: Record<string, unknown>,
    columns: string[],
    filterColumn: string | null,
    filterValue: string | null,
  ): QueryRow | null {
    if (filterColumn && filterValue != null && filterValue !== "") {
      const actual = row[filterColumn];
      const normalized =
        actual instanceof Date
          ? actual.toISOString()
          : typeof actual === "bigint"
            ? Number(actual)
            : actual;
      if (String(normalized ?? "") !== filterValue) return null;
    }
    const out: QueryRow = {};
    for (const c of columns) {
      const v = row[c];
      out[c] =
        v == null
          ? null
          : typeof v === "bigint"
            ? Number(v)
            : typeof v === "number"
              ? v
              : String(v);
    }
    return out;
  }
}
