/**
 * TABLE_REGISTRY — the single source of truth for id-generation (spec §4/§9).
 * Dictionary-first: no reflection branches, no hardcoded name lists in services.
 * `canonical` is the standard table name stored in IDGeneration.TableName.
 * `reservedIds` are permanently excluded from generation (e.g. BusinessStructure root ID=1).
 * `strictSelfHeal` = table expects out-of-service inserts (raw-SQL seed / manual-ID import /
 *   backup restore) → always apply max(LastID+1, maxDbId+1) (spec §4 golden rule);
 *   otherwise the normal path relies on LastID only (spec §9).
 */
export interface TableEntry {
  canonical: string;
  pk: string;
  reservedIds?: number[];
  strictSelfHeal?: boolean;
}

export type TableKey =
  | "IDGeneration"
  | "BusinessStructure"
  | "BusinessStructureUser"
  | "Systems"
  | "SoftwareConfig" // Task 72 — پیکربندی نرم‌افزارها
  | "FiscalYear"; // Task 75 — سال مالی (اطلاعات پایه)

export const TABLE_REGISTRY: Record<TableKey, TableEntry> = {
  IDGeneration: {
    canonical: "IDGeneration",
    pk: "IDGenerationID",
  },
  BusinessStructure: {
    canonical: "BusinessStructure",
    pk: "ID",
    reservedIds: [1], // دفتر مرکزی — system-reserved root
    strictSelfHeal: true, // legacy import feeds manual IDs
  },
  BusinessStructureUser: {
    canonical: "BusinessStructureUser",
    pk: "ID",
  },
  Systems: {
    canonical: "Systems",
    pk: "ID",
  },
  SoftwareConfig: {
    canonical: "SoftwareConfig", // Task 72 — پیکربندی نرم‌افزارها (هر فیلد یک ردیف)
    pk: "ID",
  },
  FiscalYear: {
    canonical: "FiscalYear", // Task 75 — سال مالی (اطلاعات پایهٔ عمومی)
    pk: "ID",
  },
};

export function resolveEntry(key: string): TableEntry {
  const entry = TABLE_REGISTRY[key as TableKey];
  if (!entry) {
    throw new Error(
      `IDGeneration: unknown table "${key}" — register it in TABLE_REGISTRY first (spec §7).`,
    );
  }
  return entry;
}

/** possibleNames = {input name, canonical name} (spec §4 step 3) */
export function possibleNames(key: string): string[] {
  const entry = resolveEntry(key);
  return [...new Set([key, entry.canonical])];
}

/** 2^53 guard for bigint→number conversion (spec §9). */
export function bigToNumber(v: bigint): number {
  const n = Number(v);
  if (!Number.isSafeInteger(n)) {
    throw new Error(`IDGeneration: value ${v} exceeds 2^53 safe-integer threshold.`);
  }
  return n;
}
