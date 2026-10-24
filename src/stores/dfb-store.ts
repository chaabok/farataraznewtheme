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
  title: string;
  titleEn: string | null;
  orderIndex: number;
  version: number;
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
