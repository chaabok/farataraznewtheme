/**
 * TABLE_REGISTRY (dfb-service) — the single source of truth for id-generation
 * (spec §4/§9). Every Dfb operational table uses manual BigInt PK "ID" (§16).
 */
export interface TableEntry {
  canonical: string;
  pk: string;
  reservedIds?: number[];
  strictSelfHeal?: boolean;
}

export type TableKey =
  | "IDGeneration"
  | "DfbMenu"
  | "DfbForm"
  | "DfbFormTab"
  | "DfbFormField"
  | "DfbQuery"
  | "DfbQueryField"
  | "DfbFormData"
  | "DfbFormDataValue"
  | "DfbTranslation";

export const TABLE_REGISTRY: Record<TableKey, TableEntry> = {
  IDGeneration: { canonical: "IDGeneration", pk: "IDGenerationID" },
  DfbMenu: { canonical: "DfbMenu", pk: "DfbMenuID" },
  DfbForm: { canonical: "DfbForm", pk: "DfbFormID" },
  DfbFormTab: { canonical: "DfbFormTab", pk: "DfbFormTabID" },
  DfbFormField: { canonical: "DfbFormField", pk: "DfbFormFieldID" },
  DfbQuery: { canonical: "DfbQuery", pk: "DfbQueryID" },
  DfbQueryField: { canonical: "DfbQueryField", pk: "DfbQueryFieldID" },
  DfbFormData: { canonical: "DfbFormData", pk: "DfbFormDataID" },
  DfbFormDataValue: { canonical: "DfbFormDataValue", pk: "DfbFormDataValueID" },
  DfbTranslation: { canonical: "DfbTranslation", pk: "DfbTranslationID" }, // Task 68
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
