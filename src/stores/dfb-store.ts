"use client";

import { create } from "zustand";
import { appApi } from "@/lib/api";

/**
 * Dfb store (Task 45 — فرمساز): the builder tree (icons → submenus → forms)
 * loaded from dfb-service through the BFF (/api/advancedTools/** → :3003).
 * Also feeds the desktop layer: user-created MAIN icons (NodeType=1,
 * IsSystem=false) merge into the desktop icon list (grid + sidebar + start
 * menu) exactly like catalog apps (owner request, Task 45).
 */

export interface DfbFormSummary {
  id: number;
  menuRef: number;
  code: string;
  title: string;
  titleEn: string | null;
  componentKey: string; // simpleTwoRowTabbed | treeForm
  status: number;
  isSystem: boolean;
  systemKey: string | null;
  version: number;
}

export interface DfbMenuNode {
  id: number;
  parentRef: number;
  nodeType: number; // 1 = main icon, 2 = submenu
  code: string;
  title: string;
  titleEn: string | null;
  iconKey: string;
  appKey: string | null;
  sortOrder: number;
  isSystem: boolean;
  version: number;
  forms: DfbFormSummary[];
  children: DfbMenuNode[];
}

interface DfbState {
  tree: DfbMenuNode[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  /** user-created main icons for the desktop layer (alphabetically merged by callers) */
  userIcons: DfbMenuNode[];
}

function collectUserIcons(nodes: DfbMenuNode[], out: DfbMenuNode[]) {
  for (const n of nodes) {
    if (n.nodeType === 1 && !n.isSystem) out.push(n);
  }
}

export const useDfb = create<DfbState>()((set, get) => ({
  tree: [],
  loaded: false,
  loading: false,
  userIcons: [],
  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await appApi("advancedTools").get<{ items: DfbMenuNode[] }>("menus/tree");
      const tree = res.items ?? [];
      const userIcons: DfbMenuNode[] = [];
      collectUserIcons(tree, userIcons);
      set({ tree, userIcons, loaded: true, loading: false });
    } catch {
      set({ loading: false, loaded: true });
    }
  },
}));

/* ------------------------------- helpers ------------------------------- */

export function findMenuNode(nodes: DfbMenuNode[], id: number): DfbMenuNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const hit = n.children ? findMenuNode(n.children, id) : null;
    if (hit) return hit;
  }
  return null;
}

export function findFormInTree(nodes: DfbMenuNode[], id: number): DfbFormSummary | null {
  for (const n of nodes) {
    const f = n.forms.find((x) => x.id === id);
    if (f) return f;
    const hit = n.children ? findFormInTree(n.children, id) : null;
    if (hit) return hit;
  }
  return null;
}

/* ------------------- locale-aware display titles (Task 46) ----------------
   System nodes carry an appKey → the catalog's i18n labels cover all 11
   locales (§1.3); forms and user-created nodes only store title (fa) and
   titleEn (en), so other locales fall back to the stored title. */
export type DfbTitleish = { title: string; titleEn: string | null };

export function dfbFormTitle(form: DfbTitleish, locale: string): string {
  return locale === "en" && form.titleEn ? form.titleEn : form.title;
}

export function dfbNodeTitle(
  node: DfbTitleish & { isSystem: boolean; appKey: string | null },
  t: (k: never) => string,
  locale: string,
): string {
  if (node.isSystem && node.appKey) return t(`app.${node.appKey}` as never);
  return dfbFormTitle(node, locale);
}

/** root-level node lookup by catalog appKey (for "app:<appKey>" menu windows) */
export function findMenuNodeByAppKey(nodes: DfbMenuNode[], appKey: string): DfbMenuNode | null {
  return nodes.find((n) => n.nodeType === 1 && n.isSystem && n.appKey === appKey) ?? null;
}

/* ------------------------- form definition types ------------------------ */

export interface DfbFieldDef {
  id: number;
  formRef: number;
  tabRef: number | null;
  section: string;
  fieldKey: string;
  label: string;
  labelEn: string | null;
  fieldType: string; // text|number|select|lookup|checkbox|date|textarea
  required: boolean;
  readOnly: boolean;
  orderIndex: number;
  widthSpan: number;
  defaultValue: string | null;
  queryRef: number | null;
  queryFieldKey: string | null;
  isCustom: boolean;
  version: number;
}

export interface DfbTabDef {
  id: number;
  formRef: number;
  /** Task 50 — 0 = band-level row (the «جدول رکوردها» band itself)
      | >0 = a tab created with «افزودن تب» INSIDE that band (parent row id) */
  parentRef: number;
  title: string;
  titleEn: string | null;
  /** Task 49 — 1=grid (default/legacy, records via footer add button)
      | 2=input fields (no grid, plain input fields) */
  tabKind: number;
  orderIndex: number;
  version: number;
  /** Task 50 — correlation key echoed by the save endpoint so the fields
      phase can map tabRef to freshly regenerated tab ids */
  clientKey?: string | null;
}

export interface DfbFormDetail {
  id: number;
  menuRef: number;
  code: string;
  title: string;
  titleEn: string | null;
  componentKey: string;
  status: number;
  systemKey: string | null;
  isSystem: boolean;
  version: number;
  header: Record<string, unknown>;
  body: Record<string, unknown>;
  footer: Record<string, unknown>;
  tabs: DfbTabDef[];
  fields: DfbFieldDef[];
}

export const dfbApi = appApi("advancedTools");

export async function fetchFormDetail(id: number): Promise<DfbFormDetail> {
  const res = await dfbApi.get<{ item: DfbFormDetail }>(`forms/${id}`);
  return res.item;
}

/** Executes a bound query and returns [{ [column]: string|number|null }] */
export async function executeQuery(id: number): Promise<Record<string, unknown>[]> {
  const res = await dfbApi.post<{ rows: Record<string, unknown>[] }>(`queries/${id}/execute`, {});
  return res.rows ?? [];
}

/* ------------------- Task 48 — width percent (WidthSpan) ------------------
   DfbFormField.WidthSpan stores a PERCENT (25..100, step 5). Legacy rows
   used 1 = half / 2 = full → normalized here so pre-migration data and
   unmigrated snapshots keep their designed layout. */
export const DFB_WIDTH_MIN = 25;
export const DFB_WIDTH_MAX = 100;

export function normalizeFieldWidth(v: number | null | undefined): number {
  const n = Math.round(Number(v ?? 50));
  if (!Number.isFinite(n)) return 50;
  if (n < DFB_WIDTH_MIN) return n <= 1 ? 50 : 100; // legacy 1=half, 2=full
  return Math.min(DFB_WIDTH_MAX, Math.max(DFB_WIDTH_MIN, n));
}

/** maps a stored width to a tailwind min-width hint for tab TABLE columns */
export function widthMinWidthClass(pct: number): string {
  return pct >= 100 ? "min-w-72" : pct >= 75 ? "min-w-56" : pct >= 50 ? "min-w-40" : "min-w-28";
}

/**
 * Task 48 — shared query-option loader (runtime + studio preview):
 * executes every select/lookup field's bound query and maps rows to
 * {value,label} options with the same smart column mapping the runtime
 * used before (bound queryFieldKey = value; Title-ish column = label).
 */
export async function fetchQueryOptionsForFields(
  fields: Array<{ queryRef: number | null; queryFieldKey: string | null; fieldType: string }>,
): Promise<Record<number, Array<{ value: string; label: string }>>> {
  const bound = fields.filter(
    (f) => f.queryRef != null && (f.fieldType === "select" || f.fieldType === "lookup"),
  );
  const results = await Promise.all(
    bound.map(async (f) => {
      try {
        const rows = await executeQuery(f.queryRef!);
        const keys = rows.length ? Object.keys(rows[0]) : [];
        const valKey =
          f.queryFieldKey && keys.includes(f.queryFieldKey)
            ? f.queryFieldKey
            : (keys[0] ?? "ID");
        const labelKey =
          keys.find((k) => k !== valKey && /title|label|name/i.test(k)) ?? valKey;
        const options = rows
          .map((r) => ({
            value: String(r[valKey] ?? ""),
            label: String(r[labelKey] ?? r[valKey] ?? ""),
          }))
          .filter((o) => o.value !== "");
        return [f.queryRef!, options] as const;
      } catch {
        return [f.queryRef!, []] as const;
      }
    }),
  );
  return Object.fromEntries(results);
}

export async function saveFormData(
  formId: number,
  values: Record<string, string | boolean | null>,
  externalKey?: string,
): Promise<{ ok: boolean; dataId: number }> {
  return dfbApi.post(`forms/${formId}/data`, { values, externalKey });
}

export async function loadFormData(
  formId: number,
): Promise<Array<{ dataId: number; externalKey: string | null; values: Array<{ fieldRef: number; value: string | null }> }>> {
  const res = await dfbApi.get<{ items: Array<{ dataId: number; externalKey: string | null; values: Array<{ fieldRef: number; value: string | null }> }> }>(
    `forms/${formId}/data`,
  );
  return res.items ?? [];
}
