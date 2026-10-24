"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Circle,
  Flag,
  Folder,
  Globe,
  Inbox,
  MapPin,
  Minus,
  Plus,
  Square,
  Copy,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/stores/settings-store";
import {
  FormActionBar,
  type ActionBarListItem,
  type FormAction,
} from "@/components/forms/action-bar";
import { useAlignedLabels, type AlignedLabelsScope } from "@/components/forms/use-aligned-labels";
import { FieldCell, HeaderButton } from "@/components/forms/form-primitives";
import type { SimpleFormField } from "@/components/forms/simple-form-two-row-tabbed";

/* ------------------------------------------------------------------ */
/* Public API — SimpleTreeForm (Task 30)                                */
/* ------------------------------------------------------------------ */

/** glyph rendered before a tree node label (legacy «محل‌های جغرافیایی» set) */
export type SimpleTreeIcon = "globe" | "flag" | "pin" | "folder" | "dot";

export interface SimpleTreeFormNode {
  id: string;
  label: string;
  /** legacy glyph kind OR a fully custom element (e.g. Task-32 BsTypeIcon) */
  icon?: SimpleTreeIcon | React.ReactNode;
  children?: SimpleTreeFormNode[];
}

export interface SimpleTreeFormProps {
  /** tree panel title (e.g. «محل های جغرافیایی») — also the tree region label */
  treeTitle: string;
  /** the hierarchical master data (tree pane) */
  nodes: SimpleTreeFormNode[];
  /** initially selected node id (the detail pane shows its fields) */
  defaultSelectedId?: string | null;
  /** Task 32 — OPTIONAL controlled selection mirror: when provided, the
      component's selection follows this id across caller-driven changes
      (save/delete refetches). Omit for the Task-30 uncontrolled behavior. */
  selectedId?: string | null;
  /** fires whenever the user selects another node — the caller swaps `fields` */
  onSelect?: (node: SimpleTreeFormNode | null) => void;

  /** Task 32 — overrides the computed «جزئیات: X» header title
      (create-mode: «جدید — والد: X»); null = computed title */
  detailTitleOverride?: string | null;
  /** Task 32 — detail empty-state copy (default: sft.noData) */
  emptyText?: string;
  /** Task 32 — extra content under the field grid (logo uploader,
      union warnings); rendered only while a node is selected */
  detailExtra?: React.ReactNode;
  /** Task 32 — message rendered when the tree has no nodes
      (loading/empty); omitted = blank pane */
  treeEmptyText?: string;

  /* ----- Task 33 — OPTIONAL node context menu (right-click) -----
     Right-clicking a tree row opens the Windows-11 acrylic flyout with
     «افزودن شاخه» (create a child under the right-clicked node) and
     «حذف شاخه» (delete the right-clicked node). Omitting a handler hides
     its item — and with NO handlers the menu never opens, so the Task-30
     uncontrolled shell and the demo window keep their exact behavior
     (§5.1 additive). */
  /** fires when the user picks «افزودن شاخه» on a row (parent = that row) */
  onAddBranch?: (parent: SimpleTreeFormNode) => void;
  /** optional per-node gating — false hides the add item for that node */
  canAddBranch?: (node: SimpleTreeFormNode) => boolean;
  /** fires when the user picks «حذف شاخه» on a row (confirmation is the
      CALLER's duty — e.g. the FormActionBar ConfirmDeleteDialog family) */
  onDeleteBranch?: (node: SimpleTreeFormNode) => void;
  /** optional per-node gating — false hides the delete item for that node */
  canDeleteBranch?: (node: SimpleTreeFormNode) => boolean;
  /** optional label overrides (defaults: bs.addNode / bs.deleteBranch) */
  addBranchLabel?: string;
  deleteBranchLabel?: string;

  /** small pill after the detail header title (e.g. «نمونه») */
  badge?: string;
  /** glyph inside the gradient header tile */
  icon?: React.ReactNode;

  /* ----- Task 47 — design-studio theme hooks (all optional) ----- */
  headerClassName?: string;
  titleClassName?: string;
  bodyStyle?: React.CSSProperties;

  /** detail fields of the SELECTED node (legacy: نوع/کد/عنوان/عنوان لاتین/فعال) */
  fields: SimpleFormField[];
  onFieldChange?: (id: string, value: string | boolean) => void;
  /** label alignment scope (Task 25.1 contract, default "container") */
  labelScope?: AlignedLabelsScope;

  /* ----- Task-20 legacy action bar pass-through (composed) ----- */
  onReset?: FormAction;
  onSave?: FormAction;
  onSaveNew?: FormAction;
  onSaveClose?: FormAction;
  onCopy?: FormAction;
  onDelete?: FormAction;
  onDeleteNew?: FormAction;
  onDeleteClose?: FormAction;
  onPrint?: FormAction;
  /** composed into «ذخیره و بستن» / «حذف و بستن» by FormActionBar */
  onClose?: FormAction;
  /** Task 28 — help rides INSIDE the action bar as its 11th gradient tile */
  onHelp?: FormAction;
  listItems?: ActionBarListItem[];
  listLoading?: boolean;
  onOpenListItem?: (item: ActionBarListItem) => void;
  canSave?: boolean;
  canCopy?: boolean;
  canDelete?: boolean;
  canPrint?: boolean;

  /* ----- OPTIONAL chromeless-window header controls (Task 28 contract) -----
     The gradient header hosts the caption buttons and drags the window. */
  onHeaderMinimize?: () => void;
  headerMaximized?: boolean;
  onHeaderDragStart?: (e: React.PointerEvent) => void;
  onHeaderDragMove?: (e: React.PointerEvent) => void;
  onHeaderDragEnd?: (e: React.PointerEvent) => void;
  onHeaderDoubleClick?: () => void;
  onHeaderClose?: () => void;
  onHeaderMaximize?: () => void;

  className?: string;
}

/* ------------------------------------------------------------------ */
/* Internals                                                            */
/* ------------------------------------------------------------------ */

const GLYPH_CLASSES: Record<SimpleTreeIcon, string> = {
  globe: "text-teal-600 dark:text-teal-400",
  flag: "text-rose-500 dark:text-rose-400",
  pin: "text-amber-500 dark:text-amber-400",
  folder: "text-emerald-600 dark:text-emerald-400",
  dot: "text-muted-foreground",
};

function NodeGlyph({ kind }: { kind?: SimpleTreeIcon }) {
  const k = kind ?? "dot";
  const cls = cn("h-3.5 w-3.5 shrink-0", GLYPH_CLASSES[k]);
  switch (k) {
    case "globe":
      return <Globe className={cls} aria-hidden />;
    case "flag":
      return <Flag className={cls} aria-hidden />;
    case "pin":
      return <MapPin className={cls} aria-hidden />;
    case "folder":
      return <Folder className={cls} aria-hidden />;
    default:
      return <Circle className={cn(cls, "h-2.5 w-2.5")} aria-hidden />;
  }
}

function flatten(
  nodes: SimpleTreeFormNode[],
  pick: (n: SimpleTreeFormNode) => boolean,
): SimpleTreeFormNode | null {
  for (const n of nodes) {
    if (pick(n)) return n;
    const hit = n.children ? flatten(n.children, pick) : null;
    if (hit) return hit;
  }
  return null;
}

/**
 * SimpleTreeForm (Task 30) — the legacy master-detail tree shell
 * («محل های جغرافیایی»): a direction-aware two-pane layout with the tree
 * pane on the inline START side (right in RTL / left in LTR) and the detail
 * form pane on the END side. The detail pane reuses the exact form-shell
 * contract of SimpleFormTwoRowTabbed: gradient header hosting the Task-28
 * window caption buttons (and the drag handle of a chromeless host window),
 * the Task-20 FormActionBar (including the Task-28 help tile) and the
 * Task-25 aligned field grid with Task-27 compact metrics. Tree rows carry
 * role=treeitem semantics (aria-expanded/aria-selected, Enter/Space select).
 */
export function SimpleTreeForm({
  treeTitle,
  nodes,
  defaultSelectedId = null,
  selectedId: selectedIdProp,
  onSelect,
  badge,
  icon,
  fields,
  onFieldChange,
  labelScope = "container",
  onReset,
  onSave,
  onSaveNew,
  onSaveClose,
  onCopy,
  onDelete,
  onDeleteNew,
  onDeleteClose,
  onPrint,
  onClose,
  onHelp,
  listItems,
  listLoading,
  onOpenListItem,
  canSave = true,
  canCopy = true,
  canDelete = true,
  canPrint = true,
  detailTitleOverride,
  emptyText,
  detailExtra,
  treeEmptyText,
  onAddBranch,
  canAddBranch,
  onDeleteBranch,
  canDeleteBranch,
  addBranchLabel,
  deleteBranchLabel,
  headerClassName,
  titleClassName,
  bodyStyle,
  onHeaderClose,
  onHeaderMaximize,
  onHeaderMinimize,
  headerMaximized,
  onHeaderDragStart,
  onHeaderDragMove,
  onHeaderDragEnd,
  onHeaderDoubleClick,
  className,
}: SimpleTreeFormProps) {
  const t = useT();

  /* selection lives inside the component (master pane owns navigation);
     the caller mirrors it through onSelect to swap the `fields` prop */
  const [selectedId, setSelectedId] = React.useState<string | null>(defaultSelectedId);
  const selected = React.useMemo(
    () => (selectedId ? flatten(nodes, (n) => n.id === selectedId) : null),
    [nodes, selectedId],
  );

  /* Task 32 — controlled mirror: a caller that owns navigation state
     (BusinessStructure CRUD) drives selection across save/delete refetches;
     the Task-30 uncontrolled behavior is preserved when the prop is omitted.
     Derive-during-render (React-recommended "adjusting state on prop change"
     pattern) — no effect, no cascading render. */
  const [renderedProp, setRenderedProp] = React.useState<string | null | undefined>(
    selectedIdProp,
  );
  if (selectedIdProp !== renderedProp) {
    setRenderedProp(selectedIdProp);
    setSelectedId(selectedIdProp ?? null);
  }

  /* every branch starts expanded (legacy look: the full path is visible) */
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set());

  /* Task 33 — node context menu (right-click). Closes on OUTSIDE pointerdown
     / Escape / resize (FloatingMenu contract — closing on the item's own
     pointerdown would unmount it before its click event lands). */
  const [menu, setMenu] = React.useState<{
    x: number;
    y: number;
    node: SimpleTreeFormNode;
  } | null>(null);
  const [menuPos, setMenuPos] = React.useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const closeMenu = React.useCallback(() => setMenu(null), []);

  /* keep the flyout inside the viewport (measured, like FloatingMenu) */
  React.useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el || !menu) return;
    const r = el.getBoundingClientRect();
    setMenuPos({
      x: Math.max(8, Math.min(menu.x, window.innerWidth - r.width - 8)),
      y: Math.max(8, Math.min(menu.y, window.innerHeight - r.height - 8)),
    });
  }, [menu]);

  React.useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", closeMenu);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", closeMenu);
    };
  }, [menu, closeMenu]);

  /* per-node visibility of the flyout items (also guards empty bubbles) */
  const menuAddable =
    menu !== null && onAddBranch !== undefined && (canAddBranch?.(menu.node) ?? true);
  const menuDeletable =
    menu !== null && onDeleteBranch !== undefined && (canDeleteBranch?.(menu.node) ?? true);

  const select = React.useCallback(
    (node: SimpleTreeFormNode) => {
      setSelectedId(node.id);
      onSelect?.(node);
    },
    [onSelect],
  );

  const toggleBranch = React.useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* Task 25.1 — aligned label widths for the detail field grid */
  const fieldsGridRef = React.useRef<HTMLDivElement | null>(null);
  useAlignedLabels(fieldsGridRef, { scope: labelScope });

  const renderNodes = (list: SimpleTreeFormNode[], depth: number) =>
    list.map((node) => {
      const hasKids = Boolean(node.children?.length);
      const open = hasKids && !collapsed.has(node.id);
      const isSelected = node.id === selectedId;
      return (
        <div key={node.id}>
          <div
            role="treeitem"
            aria-selected={isSelected}
            aria-expanded={hasKids ? open : undefined}
            aria-level={depth + 1}
            data-tree-node={node.id}
            tabIndex={0}
            onClick={() => select(node)}
            onContextMenu={(e) => {
              /* Task 33 — right-click opens the node flyout. With NO handlers
                 wired the Task-30 native behavior is left untouched; with
                 handlers but no applicable item the native menu is suppressed
                 without an empty bubble. Right-click selects the row first
                 (Windows-Explorer/legacy TreeForm behavior). */
              if (!onAddBranch && !onDeleteBranch) return;
              e.preventDefault();
              const offers =
                (onAddBranch && (canAddBranch?.(node) ?? true)) ||
                (onDeleteBranch && (canDeleteBranch?.(node) ?? true));
              if (!offers) return;
              select(node);
              setMenu({ x: e.clientX, y: e.clientY, node });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                select(node);
              }
            }}
            style={{ paddingInlineStart: `${depth * 14 + 6}px` }}
            className={cn(
              "group flex cursor-pointer items-center gap-1.5 rounded-lg py-1 pe-2 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "bg-primary/15 font-semibold text-primary ring-1 ring-primary/30"
                : "text-foreground/85 hover:bg-foreground/5",
            )}
          >
            {React.isValidElement(node.icon) ? (
              node.icon
            ) : (
              <NodeGlyph kind={node.icon as SimpleTreeIcon | undefined} />
            )}
            <span className="min-w-0 truncate">{node.label}</span>
            {hasKids && (
              <button
                type="button"
                aria-label={node.label}
                aria-expanded={open}
                title={node.label}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBranch(node.id);
                }}
                className="ms-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    !open && "ltr:-rotate-90 rtl:rotate-90",
                  )}
                  aria-hidden
                />
              </button>
            )}
          </div>
          {open && node.children && (
            <div role="group" className="min-w-0">
              {renderNodes(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });

  const detailTitle =
    detailTitleOverride ??
    (selected ? `${t("stf.details")}: ${selected.label}` : t("stf.details"));

  return (
    <section
      data-simple-tree-form
      aria-label={treeTitle}
      className={cn("flex h-full min-h-0 flex-col overflow-hidden bg-background/25 sm:flex-row", className)}
    >
      {/* 1) tree pane — inline START side (right in RTL, left in LTR) */}
      <div className="flex h-44 min-h-0 shrink-0 flex-col border-b border-border/60 bg-background/40 sm:h-auto sm:w-72 sm:border-b-0 sm:border-e lg:w-80">
        <div className="flex h-11 shrink-0 select-none items-center gap-2 border-b border-border/60 bg-muted/40 px-3">
          <span className="truncate text-sm font-bold tracking-tight">{treeTitle}</span>
        </div>
        <div
          role="tree"
          aria-label={treeTitle}
          className="min-h-0 flex-1 overflow-y-auto p-2 scrollbar-slim"
        >
          {renderNodes(nodes, 0)}
          {nodes.length === 0 && treeEmptyText && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">{treeEmptyText}</p>
          )}
        </div>
      </div>

      {/* 2) detail pane — the form shell (identical contract to
          SimpleFormTwoRowTabbed) */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* 2a) gradient form header — drag handle + caption buttons
            (chromeless host contract, Task 28) */}
        <header
          className={cn(
            "relative flex h-11 shrink-0 select-none items-center gap-2.5 rtl:bg-gradient-to-l ltr:bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600 px-3 text-white",
            headerClassName,
          )}
          onPointerDown={onHeaderDragStart}
          onPointerMove={onHeaderDragMove}
          onPointerUp={onHeaderDragEnd}
          onPointerCancel={onHeaderDragEnd}
          onDoubleClick={(e) => {
            if ((e.target as HTMLElement).closest("[data-window-btn]")) return;
            onHeaderDoubleClick?.();
          }}
        >
          {icon && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20 shadow-inner">
              {icon}
            </span>
          )}
          <h2 className={cn("truncate text-sm font-bold tracking-tight drop-shadow-sm", titleClassName)}>{detailTitle}</h2>
          {badge && (
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-inset ring-white/25">
              {badge}
            </span>
          )}
          <div className="ms-auto flex items-center gap-0.5">
            {onHeaderMinimize && (
              <HeaderButton onClick={onHeaderMinimize} label={t("common.minimize")}>
                <Minus className="h-4 w-4" aria-hidden />
              </HeaderButton>
            )}
            {onHeaderMaximize && (
              <HeaderButton onClick={onHeaderMaximize} label={t("common.maximize")}>
                {headerMaximized ? (
                  <Copy className="h-3 w-3 -scale-x-100" aria-hidden />
                ) : (
                  <Square className="h-3 w-3" aria-hidden />
                )}
              </HeaderButton>
            )}
            {onHeaderClose && (
              <HeaderButton onClick={onHeaderClose} label={t("common.close")}>
                <X className="h-4 w-4" aria-hidden />
              </HeaderButton>
            )}
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/25"
          />
        </header>

        {/* 2b) action strip — legacy FormActionBar + Task-28 help tile */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/60 bg-muted/40 px-3 py-2">
          <FormActionBar
            className="min-w-0 flex-1"
            onReset={onReset}
            onSave={onSave}
            onSaveNew={onSaveNew}
            onSaveClose={onSaveClose}
            onCopy={onCopy}
            onDelete={onDelete}
            onDeleteNew={onDeleteNew}
            onDeleteClose={onDeleteClose}
            onPrint={onPrint}
            onClose={onClose}
            onHelp={onHelp}
            listItems={listItems}
            listLoading={listLoading}
            onOpenListItem={onOpenListItem}
            canSave={canSave}
            canCopy={canCopy}
            canDelete={canDelete}
            canPrint={canPrint}
          />
        </div>

        {/* 2c) scrollable detail body — aligned field grid (or empty state) */}
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-slim" style={bodyStyle}>
          {selected ? (
            <div className="px-4 pb-2 pt-2.5">
              <div
                ref={fieldsGridRef}
                className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3"
              >
                {fields.map((f) => (
                  <FieldCell key={f.id} field={f} onChange={onFieldChange} idPrefix="stf" />
                ))}
              </div>
              {detailExtra}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <Inbox className="h-7 w-7 opacity-50" aria-hidden />
              <span className="text-xs">{emptyText ?? t("sft.noData")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Task 33 — node context flyout (right-click): Win-11 acrylic menu
          family, portaled to body so no window/pane overflow-hidden (or any
          future containing block) can clip it; z above taskbar/start menu,
          same layer as the legacy TreeForm menu. */}
      {menu && (menuAddable || menuDeletable) &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={treeTitle}
            className="acrylic-strong menu-in fixed z-[13000] min-w-40 rounded-xl border p-1 shadow-lg win-shadow"
            style={{ left: menuPos.x, top: menuPos.y }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {menuAddable && (
              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  onAddBranch?.(menu.node);
                  closeMenu();
                }}
              >
                <Plus className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                {addBranchLabel ?? t("bs.addNode")}
              </button>
            )}
            {menuDeletable && (
              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  onDeleteBranch?.(menu.node);
                  closeMenu();
                }}
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {deleteBranchLabel ?? t("bs.deleteBranch")}
              </button>
            )}
          </div>,
          document.body,
        )}
    </section>
  );
}
