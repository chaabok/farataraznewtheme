"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/stores/settings-store";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface TreeFormNode {
  /** unique key (server id as string, or tmp:… for pending rows) */
  id: string;
  parentId: string | null;
  label: string;
  /** hierarchical code shown as a badge (e.g. 01-01) */
  code?: string | null;
  /** domain type used by renderIcon (e.g. 1=holding 2=company 3=branch 4=agency) */
  type?: number | null;
  /** 0-based depth */
  depth: number;
  isActive?: boolean;
  isSystem?: boolean;
}

export interface TreeFormProps {
  nodes: TreeFormNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  title?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loadingText?: string;
  loading?: boolean;
  maxLevels?: number;
  /** disable adding children under this node (defaults: node depth + 1 > maxLevels) */
  canCreateChild?: (node: TreeFormNode) => boolean;
  canDelete?: (node: TreeFormNode) => boolean;
  onCreateChild?: (parent: TreeFormNode | null) => void;
  onDelete?: (node: TreeFormNode) => void;
  renderIcon?: (node: TreeFormNode) => React.ReactNode;
  renderBadges?: (node: TreeFormNode) => React.ReactNode;
  toolbarExtra?: React.ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function buildIndex(nodes: TreeFormNode[]) {
  const children = new Map<string, TreeFormNode[]>();
  const byId = new Map<string, TreeFormNode>();
  for (const n of nodes) {
    byId.set(n.id, n);
    const key = n.parentId ?? "__root__";
    if (!children.has(key)) children.set(key, []);
    children.get(key)!.push(n);
  }
  for (const list of children.values()) {
    list.sort((a, b) => (a.code ?? a.label).localeCompare(b.code ?? b.label, "en"));
  }
  return { children, byId };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function TreeForm({
  nodes,
  selectedId,
  onSelect,
  title,
  searchPlaceholder,
  emptyText,
  loadingText,
  loading = false,
  maxLevels = 4,
  canCreateChild,
  canDelete,
  onCreateChild,
  onDelete,
  renderIcon,
  renderBadges,
  toolbarExtra,
  className,
}: TreeFormProps) {
  const t = useT();
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [menu, setMenu] = React.useState<{ x: number; y: number; node: TreeFormNode } | null>(
    null,
  );

  const index = React.useMemo(() => buildIndex(nodes), [nodes]);

  /* matching + auto-expand ancestors of matches */
  const matchIds = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const hits = new Set<string>();
    for (const n of nodes) {
      if (
        n.label.toLowerCase().includes(q) ||
        (n.code ?? "").toLowerCase().includes(q)
      ) {
        hits.add(n.id);
      }
    }
    // add ancestors so hits are visible
    for (const n of nodes) {
      if (!hits.has(n.id)) continue;
      let cur = n.parentId;
      while (cur) {
        hits.add(cur);
        cur = index.byId.get(cur)?.parentId ?? null;
      }
    }
    return hits;
  }, [query, nodes, index]);

  /* while searching, matched rows are force-expanded (derived in render — no effect) */

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const closeMenu = React.useCallback(() => setMenu(null), []);
  React.useEffect(() => {
    if (!menu) return;
    const onAny = () => closeMenu();
    window.addEventListener("pointerdown", onAny);
    window.addEventListener("resize", onAny);
    return () => {
      window.removeEventListener("pointerdown", onAny);
      window.removeEventListener("resize", onAny);
    };
  }, [menu, closeMenu]);

  const defaultCanCreate = (n: TreeFormNode) => n.depth + 1 < maxLevels;

  const renderRows = (parentId: string | null): React.ReactNode[] => {
    const list = index.children.get(parentId ?? "__root__") ?? [];
    const rows: React.ReactNode[] = [];
    for (const node of list) {
      if (matchIds && !matchIds.has(node.id)) continue;
      const kids = (index.children.get(node.id) ?? []).filter(
        (c) => !matchIds || matchIds.has(c.id),
      );
      const isOpen = matchIds ? true : expanded.has(node.id);
      const selected = node.id === selectedId;
      const hasChildren = kids.length > 0 || (index.children.get(node.id) ?? []).length > 0;
      const addable = (canCreateChild ?? defaultCanCreate)(node);
      rows.push(
        <div key={node.id}>
          <div
            role="treeitem"
            aria-selected={selected}
            aria-expanded={hasChildren ? isOpen : undefined}
            tabIndex={0}
            onClick={() => {
              onSelect(node.id);
              if (hasChildren) toggle(node.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(node.id);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              onSelect(node.id);
              setMenu({ x: e.clientX, y: e.clientY, node });
            }}
            className={cn(
              "group relative flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm transition-colors",
              selected
                ? "bg-primary/12 font-medium text-primary shadow-[inset_0_0_0_1px] shadow-primary/25"
                : "hover:bg-foreground/6",
            )}
            style={{ marginInlineStart: `${node.depth * 16}px` }}
          >
            {/* expand chevron */}
            <button
              type="button"
              tabIndex={-1}
              aria-label="toggle"
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded text-muted-foreground",
                hasChildren ? "hover:bg-foreground/12 cursor-pointer" : "invisible",
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggle(node.id);
              }}
            >
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
              )}
            </button>

            {renderIcon?.(node)}

            <span className="truncate">{node.label}</span>
            {node.isSystem && (
              <Badge variant="muted" className="hidden shrink-0 px-1.5 py-0 text-[10px] sm:inline">
                SYS
              </Badge>
            )}
            {node.code ? (
              <span className="hidden shrink-0 rounded-md bg-foreground/6 px-1.5 py-0.5 font-mono text-[10px] tracking-tight text-muted-foreground sm:inline">
                {node.code}
              </span>
            ) : null}
            {renderBadges?.(node)}
            {node.isActive === false && (
              <span className="ms-auto h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" title="inactive" />
            )}

            {/* quick add */}
            {onCreateChild && addable && (
              <button
                type="button"
                tabIndex={-1}
                aria-label={t("bs.addNode")}
                className="ms-auto hidden h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/15 hover:text-primary group-hover:flex cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateChild(node);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {isOpen && kids.length > 0 && <div>{renderRows(node.id)}</div>}
        </div>,
      );
    }
    return rows;
  };

  const rootNode: TreeFormNode | null = React.useMemo(() => {
    const roots = index.children.get("__root__") ?? [];
    return roots[0] ?? null;
  }, [index]);

  const rootAddable = onCreateChild && (!rootNode || (canCreateChild ?? defaultCanCreate)(rootNode));

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      {/* header */}
      <div className="shrink-0 space-y-2 border-b border-border/70 p-3">
        <div className="flex items-center gap-2">
          {title && <span className="text-xs font-semibold text-muted-foreground">{title}</span>}
          <div className="ms-auto flex items-center gap-1.5">
            {toolbarExtra}
            {onCreateChild && (
              <button
                type="button"
                disabled={!rootAddable}
                title={
                  rootAddable
                    ? t("bs.newSubtree")
                    : matchIds
                      ? t("common.search")
                      : t("bs.addDisabledMax")
                }
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                onClick={() => onCreateChild(rootNode)}
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder ?? t("common.search")}
            className="h-8 rounded-lg bg-card/60 ps-8 text-xs"
          />
        </div>
      </div>

      {/* body */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-slim p-2" role="tree" aria-label={title}>
        {loading ? (
          <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            {loadingText ?? t("common.loading")}
          </div>
        ) : nodes.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">{emptyText ?? t("bs.emptyTree")}</p>
        ) : (
          renderRows(null)
        )}
      </div>

      {/* context menu */}
      {menu && (
        <div
          className="acrylic-strong fixed z-[13000] min-w-40 rounded-xl border p-1 shadow-lg win-shadow menu-in"
          style={{
            left: Math.min(menu.x, window.innerWidth - 190),
            top: Math.min(menu.y, window.innerHeight - 120),
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {onCreateChild && (canCreateChild ?? defaultCanCreate)(menu.node) && (
            <button
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent cursor-pointer"
              onClick={() => {
                onCreateChild(menu.node);
                closeMenu();
              }}
            >
              <Pencil className="h-3.5 w-3.5 text-primary" />
              {t("bs.newSubtree")}
            </button>
          )}
          {onDelete && (canDelete?.(menu.node) ?? true) && (
            <button
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
              onClick={() => {
                onDelete(menu.node);
                closeMenu();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("bs.deleteBranch")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* keep tree-line visuals importable */
export { ChevronLeft };
