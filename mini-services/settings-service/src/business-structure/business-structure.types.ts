/**
 * Contract of the multi-company backbone endpoints
 * (`/api/business-structure/*` in settings-service — mirrored by the BFF
 * route `/api/modules/settings/business-structure/*`).
 */

/** One node of the business-structure tree (flat; the client builds the tree). */
export interface BsNode {
  id: string;
  /** Parent node id — the system root itself uses the literal "0". */
  parentRef: string;
  /** Hierarchical code («01», «01-01», …) — generated server-side. */
  code: string;
  title: string;
  titleEn: string | null;
  /** 0=System root (reserved) · 1=Headquarter · 2=Company · 3=Branch · 4=Agency. */
  structureType: number;
  manager: string | null;
  logoUrl: string | null;
  isActive: boolean;
  isSystem: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** The two root-only options («ساختار سیستم» detail panel). */
export interface BsRootSettings {
  shareHeadquarterData: boolean;
  activeStructureTypes: number[];
}
