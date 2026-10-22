/**
 * Client contract of the multi-company backbone («ساختار کسب و کار»)
 * — mirrors `settings-service/src/business-structure/business-structure.types.ts`.
 */

/** 0=System root (reserved) · 1=Headquarter · 2=Company · 3=Branch · 4=Agency. */
export type BsStructureType = 0 | 1 | 2 | 3 | 4;

/** Parent-type → allowed child-types (UI mirror; the server re-validates). */
export const BS_ALLOWED_CHILD_TYPES: Readonly<
  Record<number, readonly number[]>
> = {
  0: [1],
  1: [2, 3, 4],
  2: [2, 3, 4],
  3: [4],
  4: [4],
};

/** Maximum business depth below the system root (server-enforced too). */
export const BS_MAX_LEVEL = 4;

/** One node of the business-structure tree (flat row from the API). */
export interface BsNode {
  id: string;
  parentRef: string;
  code: string;
  title: string;
  titleEn: string | null;
  structureType: number;
  manager: string | null;
  logoUrl: string | null;
  isActive: boolean;
  isSystem: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** The two root-only options of the system-structure node. */
export interface BsRootSettings {
  shareHeadquarterData: boolean;
  activeStructureTypes: number[];
}
