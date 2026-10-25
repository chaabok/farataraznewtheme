"use client";

/**
 * OrgContextStore (Task 78 — درخواست مالک، هدر داشبورد):
 * «لیست کسب و کارهای از نوع هلدینگ و شرکت از فرم ساختار کسب و کار در هدر
 * داشبورد نمایش داده شود؛ به‌صورت پیش‌فرض اولین شرکت تعریف شده نمایش داده
 * شود ولی اگر کاربر آن را تغییر داد آخرین انتخاب کاربر نمایش داده شود؛
 * اگر برای هلدینگ/شرکت شعبه، نمایندگی یا فروشگاه تعریف شده بود هرکدام در
 * یک فیلد دیگر نمایش داده شود و بر اساس هر کدام از سطح‌های انتخاب شده
 * نمایش اطلاعات فرم‌ها در همان سطح فیلتر گردد.»
 *
 * Design:
 *  · tree — flat BusinessStructure list (settings-service via BFF) reloaded on
 *    the «erp:records-changed» event (entity=business-structure).
 *  · cascade — companies = type 1 (هلدینگ) | 2 (شرکت) active nodes sorted by
 *    id («اولین شرکت تعریف شده» = first created). branches/agencies/shops are
 *    the type-3/4/5 DESCENDANTS of the deepest selected level, so each deeper
 *    selector narrows to the currently selected path (CHILD_TYPE_RULES of the
 *    BS form) and the display filter can ride the same chain.
 *  · persistence — the four selected ids live in localStorage (erp.orgContext);
 *    the DEFAULT is always the first company (a missing/stale saved id falls
 *    back at runtime without being persisted until the user actually changes it).
 *  · filtering contract — OrgScope rides to dfb-service as query params
 *    (loadFormData) and OrgChain as body.org (saveFormData stamping); records
 *    of «دفتر مرکزی» stay visible when the root node's IsBasicInfoShared is ON
 *    (the standing base-data sharing contract, Task 44).
 */

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import { useSettings } from "@/stores/settings-store";
import type { BsListResponse, BsNode } from "@/types/business-structure";

/** BusinessStructure types (§ Task 34): 1=Holding 2=Company 3=Branch 4=Agency 5=Store */
export const BS_TYPE_HOLDING = 1;
export const BS_TYPE_COMPANY = 2;
export const BS_TYPE_BRANCH = 3;
export const BS_TYPE_AGENCY = 4;
export const BS_TYPE_STORE = 5;

/** compact option for the header dropdowns */
export interface OrgOption {
  id: number;
  label: string; // locale-aware title (fa default, en → titleEn)
}

/** chain stamped onto saved records + query scope for reads */
export interface OrgScope {
  /** deepest selected node id (the record's owning node) */
  businessStructureRef: number | null;
  companyRef: number | null;
  branchRef: number | null;
  agencyRef: number | null;
  shopRef: number | null;
  /** root «دفتر مرکزی» IsBasicInfoShared — head-office records stay visible */
  shared: boolean;
}

interface OrgState {
  tree: BsNode[];
  loaded: boolean;
  loading: boolean;
  /** persisted user selection (null = default → first company) */
  companyId: number | null;
  branchId: number | null;
  agencyId: number | null;
  shopId: number | null;
  load: () => Promise<void>;
  setCompany: (id: number | null) => void;
  setBranch: (id: number | null) => void;
  setAgency: (id: number | null) => void;
  setShop: (id: number | null) => void;
}

/* ------------------------------- tree helpers ------------------------------ */

function childrenMapOf(tree: BsNode[]): Map<number, BsNode[]> {
  const byParent = new Map<number, BsNode[]>();
  for (const n of tree) {
    const key = Number(n.parentRef);
    const list = byParent.get(key) ?? [];
    list.push(n);
    byParent.set(key, list);
  }
  return byParent;
}

/** active descendants of `rootId` whose BusinessStructureType = `type` (BFS, id-ordered) */
function descendantsOfType(byParent: Map<number, BsNode[]>, rootId: number, type: number): BsNode[] {
  const out: BsNode[] = [];
  const walk = (id: number) => {
    for (const c of (byParent.get(id) ?? []).slice().sort((a, b) => Number(a.id) - Number(b.id))) {
      if (!c.isActive) continue;
      if (c.businessStructureType === type) out.push(c);
      walk(Number(c.id)); // recurse regardless — deeper types nest under intermediate levels
    }
  };
  walk(rootId);
  return out;
}

/** هلدینگ + شرکت nodes (active, creation order = «اولین شرکت تعریف شده») */
function companiesOf(tree: BsNode[]): BsNode[] {
  return tree
    .filter(
      (n) =>
        n.isActive &&
        (n.businessStructureType === BS_TYPE_HOLDING || n.businessStructureType === BS_TYPE_COMPANY),
    )
    .sort((a, b) => Number(a.id) - Number(b.id));
}

/** root «دفتر مرکزی» node (ParentRef=0) — carries IsBasicInfoShared */
function rootNodeOf(tree: BsNode[]): BsNode | null {
  return tree.find((n) => Number(n.parentRef) === 0) ?? null;
}

function toOptions(nodes: BsNode[], locale: string): OrgOption[] {
  return nodes.map((n) => ({
    id: Number(n.id),
    label: locale === "en" && n.titleEn ? n.titleEn : n.title,
  }));
}

/* --------------------------------- the store -------------------------------- */

export const useOrgContext = create<OrgState>()(
  persist(
    (set, get) => ({
      tree: [],
      loaded: false,
      loading: false,
      companyId: null,
      branchId: null,
      agencyId: null,
      shopId: null,
      load: async () => {
        if (get().loading) return;
        set({ loading: true });
        try {
          const res = await api.get<BsListResponse>("business-structure");
          set({ tree: res.items ?? [], loaded: true, loading: false });
        } catch {
          set({ loading: false, loaded: true });
        }
      },
      /* هر تغییر شرکت، سطح‌های عمیق‌تر را پاک می‌کند (مسیر آبشاری همیشه سازگار) */
      setCompany: (id) => set({ companyId: id, branchId: null, agencyId: null, shopId: null }),
      setBranch: (id) => set({ branchId: id, agencyId: null, shopId: null }),
      setAgency: (id) => set({ agencyId: id, shopId: null }),
      setShop: (id) => set({ shopId: id }),
    }),
    {
      name: "erp.orgContext",
      version: 1,
      /* فقط انتخاب کاربر ذخیره می‌شود — درخت هر بار از سرویس می‌آید */
      partialize: (s) => ({ companyId: s.companyId, branchId: s.branchId, agencyId: s.agencyId, shopId: s.shopId }),
    },
  ),
);

/* ------------------------------ derived selectors --------------------------- */

export interface OrgLists {
  companies: OrgOption[];
  branches: OrgOption[];
  agencies: OrgOption[];
  shops: OrgOption[];
  /** effective (validated) selection — falls back to the FIRST company by default */
  companyId: number | null;
  branchId: number | null;
  agencyId: number | null;
  shopId: number | null;
}

function computeLists(state: OrgState, locale: string): OrgLists {
  const tree = state.tree;
  const byParent = childrenMapOf(tree);
  const companies = companiesOf(tree);
  const companyId = companies.some((c) => Number(c.id) === state.companyId)
    ? state.companyId
    : (companies[0] ? Number(companies[0].id) : null); // «اولین شرکت تعریف شده»
  const branches = companyId != null ? descendantsOfType(byParent, companyId, BS_TYPE_BRANCH) : [];
  const branchId = branches.some((b) => Number(b.id) === state.branchId) ? state.branchId : null;
  const agencies = descendantsOfType(byParent, branchId ?? companyId ?? -1, BS_TYPE_AGENCY);
  const agencyId = agencies.some((a) => Number(a.id) === state.agencyId) ? state.agencyId : null;
  const shops = descendantsOfType(byParent, agencyId ?? branchId ?? companyId ?? -1, BS_TYPE_STORE);
  const shopId = shops.some((s) => Number(s.id) === state.shopId) ? state.shopId : null;
  return {
    companies: toOptions(companies, locale),
    branches: toOptions(branches, locale),
    agencies: toOptions(agencies, locale),
    shops: toOptions(shops, locale),
    companyId,
    branchId,
    agencyId,
    shopId,
  };
}

const scopeKeyOf = (l: OrgLists): string =>
  `${l.companyId ?? ""}|${l.branchId ?? ""}|${l.agencyId ?? ""}|${l.shopId ?? ""}`;

/**
 * Task 78 — زنجیرهٔ اقامت کامل عمیق‌ترین گرهٔ انتخاب‌شده (قرارداد AppBase:
 * «Anchors resolved from the node's ancestry»). حتی وقتی کاربر مثلاً فقط
 * فروشگاه را انتخاب کرده (بدون عبور از شعبه)، ستون‌های زنجیرهٔ رکورد باید
 * جایگاه واقعی آن را در درخت نشان دهند تا فیلتر هر سطح بالاتر هم رکوردهای
 * زیرمجموعه را ببیند: نوع ۵→ShopRef، ۴→AgencyRef، ۳→BranchRef، ۱|۲→CompanyRef.
 */
function ancestryChain(
  tree: BsNode[],
  deepestId: number | null,
): { companyRef: number | null; branchRef: number | null; agencyRef: number | null; shopRef: number | null } {
  const byId = new Map(tree.map((n) => [Number(n.id), n]));
  let companyRef: number | null = null;
  let branchRef: number | null = null;
  let agencyRef: number | null = null;
  let shopRef: number | null = null;
  let cur = deepestId != null ? byId.get(deepestId) : undefined;
  let guard = 0;
  while (cur && guard++ <= 6) {
    const id = Number(cur.id);
    if (cur.businessStructureType === BS_TYPE_STORE && shopRef == null) shopRef = id;
    else if (cur.businessStructureType === BS_TYPE_AGENCY && agencyRef == null) agencyRef = id;
    else if (cur.businessStructureType === BS_TYPE_BRANCH && branchRef == null) branchRef = id;
    else if (
      (cur.businessStructureType === BS_TYPE_COMPANY || cur.businessStructureType === BS_TYPE_HOLDING) &&
      companyRef == null
    )
      companyRef = id;
    cur = Number(cur.parentRef) > 0 ? byId.get(Number(cur.parentRef)) : undefined;
  }
  return { companyRef, branchRef, agencyRef, shopRef };
}

/**
 * Reactive org cascade for UI + data scoping. Returns the four lists (already
 * narrowed along the selected path), the effective ids and a memoized
 * OrgScope/scopeKey — scopeKey changing means open form views must re-filter.
 */
export function useOrgScope(): {
  lists: OrgLists;
  scope: OrgScope;
  scopeKey: string;
  loaded: boolean;
} {
  const locale = useSettings((s) => s.locale);
  const tree = useOrgContext((s) => s.tree);
  const companyId = useOrgContext((s) => s.companyId);
  const branchId = useOrgContext((s) => s.branchId);
  const agencyId = useOrgContext((s) => s.agencyId);
  const shopId = useOrgContext((s) => s.shopId);
  const loaded = useOrgContext((s) => s.loaded);
  /* compute from the raw slice (single source) */
  const lists = React.useMemo(
    () => computeLists({ tree, companyId, branchId, agencyId, shopId } as OrgState, locale),
    [tree, companyId, branchId, agencyId, shopId, locale],
  );
  const root = React.useMemo(() => rootNodeOf(tree), [tree]);
  const deepest = lists.shopId ?? lists.agencyId ?? lists.branchId ?? lists.companyId;
  /* زنجیرهٔ اقامت = تبار کامل عمیق‌ترین گره (نه فقط مسیر انتخاب کاربر) */
  const chain = React.useMemo(() => ancestryChain(tree, deepest), [tree, deepest]);
  const scope = React.useMemo<OrgScope>(
    () => ({
      businessStructureRef: deepest,
      companyRef: chain.companyRef,
      branchRef: chain.branchRef,
      agencyRef: chain.agencyRef,
      shopRef: chain.shopRef,
      shared: root?.isBasicInfoShared ?? false,
    }),
    [deepest, chain, root],
  );
  const scopeKey = React.useMemo(() => scopeKeyOf(lists), [lists]);
  return { lists, scope, scopeKey, loaded };
}

/**
 * Loads the tree once per mount + reloads on «erp:records-changed»
 * (fired by the BusinessStructure form after every save/delete).
 */
export function useOrgTreeLoader(): void {
  const load = useOrgContext((s) => s.load);
  React.useEffect(() => {
    void load();
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ entity?: string }>).detail;
      if (detail?.entity === "business-structure") void load();
    };
    window.addEventListener("erp:records-changed", onChange);
    return () => window.removeEventListener("erp:records-changed", onChange);
  }, [load]);
}
