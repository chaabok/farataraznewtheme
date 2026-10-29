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
  | "FiscalYear" // Task 75 — سال مالی (اطلاعات پایه)
  | "Party" // Task 84 — طرف حساب (اطلاعات پایهٔ عمومی)
  | "PartyPerson" // Task 84 — افراد مرتبطِ طرف حساب
  | "PartyAddress" // Task 84 — نشانی‌های طرف حساب
  | "PartyPhone" // Task 84 — تلفن‌های طرف حساب
  | "City" // Task 84 — جدول شهرها (مرجع)
  | "DataTranslation" // Task 92 — انبار ترجمهٔ دادهٔ فرم‌های سیستمی
  | "UserRole" // Task 100 — نقش‌های کاربری (مدیریت کاربران)
  | "UserRoleScope" // Task 100 — محدودهٔ دسترسی نقش‌ها
  | "GeoLocation" // Task 103 — محل‌های جغرافیایی (درخت اطلاعات پایه)
  | "CurrencyType" // Task 114 — نوع ارز (اطلاعات پایهٔ عمومی)
  | "ExchangeRate" // Task 116 — نرخ برابری ارز (عملیات عمومی)
  | "DetailType" // Task 120 — نوع تفصیل جدید (اطلاعات پایهٔ حسابداری)
  | "DetailTypeNumbering" // Task 131 — شماره گذاری تفصیلی ها (اطلاعات پایهٔ حسابداری)
  | "DetailItem" // Task 144 — ایجاد تفصیلی ها (اطلاعات پایهٔ حسابداری)
  | "CostCenter" // Task 146 — مرکز هزینه جدید (اطلاعات تفصیلی ها)
  | "User" // Task 126 — کاربران (مدیریت کاربران)
  | "UserAccess" // Task 126 — درختوارهٔ دسترسی کاربران
  | "AccountNode" // Task 140 — درختواره حسابها (اطلاعات پایهٔ حسابداری)
  | "AccountDetailLevel" // Task 140 — سطوح تفصیلی گره‌های معین
  | "AccountDetailLevelType" // Task 140 — انتساب نوع تفصیلی به سطح
  | "AccountNatureAdjust" // Task 140 — معین تعدیل ماهیت
  | "AccountRecurringDesc" // Task 140 — شرح های پرتکرار
  | "AccountAllowedUser"; // Task 140 — کاربران مجاز

export const TABLE_REGISTRY: Record<TableKey, TableEntry> = {
  IDGeneration: {
    canonical: "IDGeneration",
    pk: "IDGenerationID",
  },
  BusinessStructure: {
    canonical: "BusinessStructure",
    pk: "BusinessStructureID",
    reservedIds: [1], // دفتر مرکزی — system-reserved root
    strictSelfHeal: true, // legacy import feeds manual IDs
  },
  BusinessStructureUser: {
    canonical: "BusinessStructureUser",
    pk: "BusinessStructureUserID",
  },
  Systems: {
    canonical: "Systems",
    pk: "SystemsID",
  },
  SoftwareConfig: {
    canonical: "SoftwareConfig", // Task 72 — پیکربندی نرم‌افزارها (هر فیلد یک ردیف)
    pk: "SoftwareConfigID",
  },
  FiscalYear: {
    canonical: "FiscalYear", // Task 75 — سال مالی (اطلاعات پایهٔ عمومی)
    pk: "FiscalYearID",
  },
  Party: {
    canonical: "Party", // Task 84 — طرف حساب
    pk: "PartyID",
  },
  PartyPerson: {
    canonical: "PartyPerson", // Task 84 — افراد مرتبط
    pk: "PartyPersonID",
  },
  PartyAddress: {
    canonical: "PartyAddress", // Task 84 — نشانی
    pk: "PartyAddressID",
  },
  PartyPhone: {
    canonical: "PartyPhone", // Task 84 — تلفن
    pk: "PartyPhoneID",
  },
  City: {
    canonical: "City", // Task 84 — جدول شهرها (مرجع؛ seed دستی)
    pk: "CityID",
  },
  DataTranslation: {
    canonical: "DataTranslation", // Task 92 — ترجمهٔ دادهٔ فرم‌های سیستمی
    pk: "DataTranslationID",
  },
  UserRole: {
    canonical: "UserRole", // Task 100 — نقش‌های کاربری
    pk: "UserRoleID",
  },
  UserRoleScope: {
    canonical: "UserRoleScope", // Task 100 — محدودهٔ دسترسی نقش‌ها
    pk: "UserRoleScopeID",
  },
  GeoLocation: {
    canonical: "GeoLocation", // Task 103 — محل‌های جغرافیایی (درخت اطلاعات پایه)
    pk: "GeoLocationID",
  },
  CurrencyType: {
    canonical: "CurrencyType", // Task 114 — نوع ارز (اطلاعات پایهٔ عمومی)
    pk: "CurrencyTypeID",
  },
  ExchangeRate: {
    canonical: "ExchangeRate", // Task 116 — نرخ برابری ارز (عملیات عمومی)
    pk: "ExchangeRateID",
  },
  DetailType: {
    canonical: "DetailType", // Task 120 — نوع تفصیل جدید (اطلاعات پایهٔ حسابداری)
    pk: "DetailTypeID",
  },
  DetailTypeNumbering: {
    canonical: "DetailTypeNumbering", // Task 131 — شماره گذاری تفصیلی ها
    pk: "DetailTypeNumberingID", // §2.7
  },
  DetailItem: {
    canonical: "DetailItem", // Task 144 — ایجاد تفصیلی ها
    pk: "DetailItemID", // §2.7
  },
  CostCenter: {
    canonical: "CostCenter", // Task 146 — مرکز هزینه جدید
    pk: "CostCenterID", // §2.7
  },
  User: {
    canonical: "User", // Task 126 — کاربران (مدیریت کاربران)
    pk: "UserID",
  },
  UserAccess: {
    canonical: "UserAccess", // Task 126 — درختوارهٔ دسترسی کاربران
    pk: "UserAccessID",
  },
  AccountNode: {
    canonical: "AccountNode", // Task 140 — درختواره حسابها
    pk: "AccountNodeID",
  },
  AccountDetailLevel: {
    canonical: "AccountDetailLevel", // Task 140 — سطوح تفصیلی
    pk: "AccountDetailLevelID",
  },
  AccountDetailLevelType: {
    canonical: "AccountDetailLevelType", // Task 140 — انتساب نوع تفصیلی
    pk: "AccountDetailLevelTypeID",
  },
  AccountNatureAdjust: {
    canonical: "AccountNatureAdjust", // Task 140 — معین تعدیل ماهیت
    pk: "AccountNatureAdjustID",
  },
  AccountRecurringDesc: {
    canonical: "AccountRecurringDesc", // Task 140 — شرح های پرتکرار
    pk: "AccountRecurringDescID",
  },
  AccountAllowedUser: {
    canonical: "AccountAllowedUser", // Task 140 — کاربران مجاز
    pk: "AccountAllowedUserID",
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
