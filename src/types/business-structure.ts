/** Shared client-side types for the BusinessStructure domain (Task 17). */

export interface BsNode {
  id: number;
  parentRef: number;
  code: string;
  title: string;
  titleEn: string | null;
  businessStructureType: number | null;
  manager: string | null;
  logoUrl: string | null;
  isBasicInfoShared: boolean;
  activeStructureTypes: string | null;
  isActive: boolean;
  isSystem: boolean;
  version: number;
  childCount: number;
}

export interface BsListResponse {
  items: BsNode[];
  definedTypes: number[];
}

export interface BsSavePayload {
  parentRef?: number;
  title?: string;
  titleEn?: string | null;
  businessStructureType?: number | null;
  manager?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
  isBasicInfoShared?: boolean;
  activeStructureTypes?: number[] | null;
}

/** Parent-driven level rules (spec §1-4; Task 34 adds type 5 Store as the
 *  retail leaf level): which child types each parent type allows.
 *  1 Holding → Company/Branch/Agency/Store   2 Company → same
 *  3 Branch → Agency/Store   4 Agency → Agency/Store   5 Store → leaf. */
export const CHILD_TYPE_RULES: Record<number, number[]> = {
  1: [2, 3, 4, 5],
  2: [2, 3, 4, 5],
  3: [4, 5],
  4: [4, 5],
  5: [],
};

/** Root (Headquarters, type=null) accepts every structure type directly. */
export const ROOT_ALLOWED_TYPES = [1, 2, 3, 4, 5];

export const MAX_LEVELS = 5;

export function allowedChildTypes(parentType: number | null): number[] {
  if (parentType === null || parentType === undefined) return ROOT_ALLOWED_TYPES;
  return CHILD_TYPE_RULES[parentType] ?? [];
}

export function bsTypeColor(type: number | null): { bg: string; text: string; ring: string } {
  switch (type) {
    case 1:
      return { bg: "bg-violet-500/15", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-500/30" };
    case 2:
      return { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/30" };
    case 3:
      return { bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/30" };
    case 4:
      return { bg: "bg-sky-500/15", text: "text-sky-600 dark:text-sky-400", ring: "ring-sky-500/30" };
    case 5:
      return { bg: "bg-fuchsia-500/15", text: "text-fuchsia-600 dark:text-fuchsia-400", ring: "ring-fuchsia-500/30" };
    default:
      return { bg: "bg-primary/15", text: "text-primary", ring: "ring-primary/30" };
  }
}
