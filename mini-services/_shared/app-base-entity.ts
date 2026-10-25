/**
 * AppBaseEntity — base contract of EVERY operational entity in the ERP mesh
 * (owner request, confirmed «بلی» on 1405/08/01 after the recorded consultation).
 *
 * Every business record is "resident" of the BusinessStructure tree: at create
 * time the owning node chain is stamped onto the row, so base-data reads can be
 * scoped WITHOUT joining the tree, and the head-office sharing flag
 * («استفاده از داده‌های مشترک دفتر مرکزی» = IsBasicInfoShared of the ROOT node,
 * ID=1) decides visibility:
 *   · ON  → head-office base data is visible and usable in every subsidiary;
 *   · OFF → subsidiaries see ONLY their own chain records (never the head
 *           office's base data).
 *
 * Layers (Prisma has no model inheritance — §2.3):
 *   1) SCHEMA: every operational Prisma model carries the 8-column block
 *      verbatim (template in settings-service/prisma/schema.prisma; legacy
 *      PascalCase @@map per §2.6) and registers its model in VERSIONED_MODELS
 *      (prisma.service.ts) for the §2.5 auto-rowversion.
 *   2) CODE: service-layer entities/DTOs implement AppBaseEntityFields; create
 *      flows spread appBaseOnCreate(actor), update flows spread
 *      appBaseOnUpdate(actor) — audit fields are NEVER user-writable.
 *   3) READ: base-data queries append baseDataScopeWhere(...) so the sharing
 *      contract has exactly ONE implementation.
 *
 * Platform tables (Setting/AppRegistry/Systems/IDGeneration/BusinessStructure/
 * BusinessStructureUser) are EXEMPT by owner confirmation (consult Q2).
 *
 * Task 76 (owner decision 1405/08/03): the Shamsi date/time stamp columns
 * (CreationDate/CreationTime/LastModificationDate/LastModificationTime) were
 * REMOVED from the inheritance block — CreatedAt/UpdatedAt (Prisma epoch UTC)
 * already carry the exact same timing logic. Creator/LastModifier stay: they
 * carry the "who", which timestamps cannot. When a Shamsi wall-clock view of
 * CreatedAt/UpdatedAt is needed (UI/reports), convert at read time with
 * tehranNowParts(new Date(row.createdAt)) below. Actor is the IAM UserID;
 * until real IAM wiring arrives services pass SYSTEM_ACTOR (consult Q5).
 */

/** Column set of the base entity (Prisma field names, camelCase). */
export const APP_BASE_FIELDS = [
  "version",
  "creator",
  "lastModifier",
  "businessStructureRef",
  "companyRef",
  "branchRef",
  "agencyRef",
  "shopRef",
] as const;

/** The root «دفتر مرکزی» node — system-reserved BusinessStructure ID (§2.4). */
export const HEAD_OFFICE_NODE_ID = 1n;

/** Who is writing: IAM user + its anchor chain in the structure tree. */
export interface AppBaseActor {
  /** IAM UserID (until real IAM lands: SYSTEM_ACTOR.userId = "system"). */
  userId: string;
  /** The node the record is created from (owner of the row). */
  nodeId: bigint;
  /** Anchors resolved from the node's ancestry (null when a level is absent). */
  companyRef?: bigint | null;
  branchRef?: bigint | null;
  agencyRef?: bigint | null;
  shopRef?: bigint | null;
}

/** Common fields every operational entity inherits. */
export interface AppBaseEntityFields {
  /** §2.5 auto-rowversion — never written manually (middleware bumps it). */
  version: number;
  creator: string;
  lastModifier: string | null;
  businessStructureRef: bigint;
  companyRef: bigint | null;
  branchRef: bigint | null;
  agencyRef: bigint | null;
  shopRef: bigint | null;
}

/** Default actor until IAM wires real users through the BFF. */
export const SYSTEM_ACTOR: AppBaseActor = {
  userId: "system",
  nodeId: HEAD_OFFICE_NODE_ID,
};

/* --------------------- Shamsi clock (display conversion) -------------------- */

/** Gregorian→Jalali (standard algorithm, dependency-free). */
export function gregorianToJalali(
  gy: number,
  gm: number,
  gd: number,
): { jy: number; jm: number; jd: number } {
  const gDayMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  const y = gy - (gy <= 1600 ? 621 : 1600);
  const y2 = gm > 2 ? y + 1 : y;
  let days =
    365 * y +
    Math.floor((y2 + 3) / 4) -
    Math.floor((y2 + 99) / 100) +
    Math.floor((y2 + 399) / 400) -
    80 +
    gd +
    gDayMonth[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Tehran wall clock for a given instant, split into Shamsi date + time strings.
 * Task 76: no longer stamped into rows — use it at READ time to render the
 * Shamsi view of technical timestamps, e.g. tehranNowParts(row.createdAt).
 */
export function tehranNowParts(at: Date = new Date()): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const { jy, jm, jd } = gregorianToJalali(get("year"), get("month"), get("day"));
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(at);
  return { date: `${jy}${pad2(jm)}${pad2(jd)}`, time: time.replaceAll(":", "") };
}

/* ------------------------------ audit helpers ------------------------------ */

/**
 * Spread into prisma `.create({ data })` — fills the "who" + tree anchors.
 * Task 76: timing is owned by CreatedAt/UpdatedAt (@default(now())/@updatedAt);
 * only the actor and residency chain are stamped here.
 */
export function appBaseOnCreate(actor: AppBaseActor): Omit<AppBaseEntityFields, "version"> {
  return {
    creator: actor.userId,
    lastModifier: null,
    businessStructureRef: actor.nodeId,
    companyRef: actor.companyRef ?? null,
    branchRef: actor.branchRef ?? null,
    agencyRef: actor.agencyRef ?? null,
    shopRef: actor.shopRef ?? null,
  };
}

/** Spread into prisma `.update({ data })` — stamps the modifier ("who"). */
export function appBaseOnUpdate(actor: AppBaseActor) {
  return { lastModifier: actor.userId };
}

/* ------------------------------ read scoping ------------------------------- */

/** Anchor chain of a user (their node ancestry), for read scoping. */
export interface AppBaseScope {
  nodeId: bigint;
  companyRef?: bigint | null;
  branchRef?: bigint | null;
  agencyRef?: bigint | null;
  shopRef?: bigint | null;
}

/**
 * The ONE place implementing the sharing contract for base-data reads:
 *   headOfficeShares=false → only records whose anchor chain intersects the
 *   user's own chain (their node/company/branch/agency/shop);
 *   headOfficeShares=true  → additionally every record owned by the root node
 *   (دفتر مرکزی), visible and usable in all subsidiaries.
 * Returns a Prisma-compatible `{ OR: [...] }` fragment (keys are the camelCase
 * Prisma fields of the AppBase block).
 */
export function baseDataScopeWhere(
  scope: AppBaseScope,
  headOfficeShares: boolean,
): { OR: Array<Record<string, bigint>> } {
  const or: Array<Record<string, bigint>> = [{ businessStructureRef: scope.nodeId }];
  if (scope.companyRef != null) or.push({ companyRef: scope.companyRef });
  if (scope.branchRef != null) or.push({ branchRef: scope.branchRef });
  if (scope.agencyRef != null) or.push({ agencyRef: scope.agencyRef });
  if (scope.shopRef != null) or.push({ shopRef: scope.shopRef });
  if (headOfficeShares) or.push({ businessStructureRef: HEAD_OFFICE_NODE_ID });
  return { OR: or };
}
