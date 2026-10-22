'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  FileText,
  Folder,
  FolderPlus,
  Network,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslation } from '@/i18n';
import type {
  FormDataMap,
  FormFieldDef,
  FormFieldValue,
  FormRecord,
} from '@/types/forms';
import { cn } from '@/lib/utils';
import type { FormMode } from './action-bar';
import { FieldRenderer } from './field-renderer';
import { FormTabs } from './form-tabs';
import { controlClasses } from './form-styles';
import {
  fieldLabel,
  formatFieldValue,
  pickListColumns,
  pickParentField,
} from './form-utils';
import { useDismiss } from './use-dismiss';

interface TreeFormProps {
  records: FormRecord[];
  fields: FormFieldDef[];
  /** Draft values of the loaded / new entry (owned by the form window). */
  draft: FormDataMap;
  mode: FormMode;
  /** Id of the record loaded in the detail box (null in new mode). */
  selectedId: string | null;
  /** True while a save/delete request is in flight. */
  isBusy: boolean;
  /** Accent hex color from the FormDef. */
  accentColor: string;
  /** Base path ending in `/lookups` for lookup fields. */
  lookupUrlBase: string;
  /** Clicking a tree node loads it into the detail box. */
  onSelect: (recordId: string) => void;
  onFieldChange: (fieldKey: string, value: FormFieldValue) => void;
  /**
   * Node context-menu «زیرشاخه جدید» — receives a preset map assigning
   * the right-clicked node as parent of the fresh entry.
   */
  onNewChild: (preset: FormDataMap) => void;
  /**
   * Node context-menu «حذف شاخه» — receives the right-clicked record id
   * (offered only for leaf nodes); the hosting window opens the shared
   * delete confirmation.
   */
  onDeleteNode: (recordId: string) => void;
  /** Per-node copy icon — starts a new entry prefilled with that node. */
  onCopyNode: (record: FormRecord) => void;
  /**
   * ── Optional backward-compatible extensions (§5.1 style) ──
   * Localized title of the tree panel header (default: «درختواره»). */
  panelTitle?: string;
  /** Per-node glyph override (e.g. structure-type icons). Returns the node. */
  renderNodeGlyph?: (record: FormRecord, hasChildren: boolean) => ReactNode;
  /**
   * Fully custom detail box content — replaces the default header-fields
   * + body-tabs renderer (used by dedicated windows hosting TreeForm).
   */
  detail?: ReactNode;
  /**
   * Gate for the «زیرشاخه جدید» context-menu entry — when provided and
   * returning false, the entry is hidden entirely (e.g. max tree depth).
   */
  canNewChild?: (record: FormRecord, depth: number) => boolean;
  /**
   * Gate for the «حذف شاخه» context-menu entry — when provided and
   * returning false, the entry is hidden (e.g. protected system nodes).
   */
  canDeleteNode?: (record: FormRecord) => boolean;
  /** Hides the per-node copy affordance (identity records etc.). */
  hideNodeCopy?: boolean;
}

interface TreeNode {
  record: FormRecord;
  depth: number;
  children: TreeNode[];
}

/**
 * Two-box renderer of `type: 'tree'` ERP forms (e.g. «گروه کالا-خدمت»):
 *
 * - Tree box (درختواره): a search field and the expandable hierarchy
 *   built from the records' parent field, with code badges, per-node
 *   copy and folder/file glyphs. Right-clicking a node opens a context
 *   menu: «زیرشاخه جدید» (new branch under it) and «حذف شاخه» (delete
 *   the branch — only for leaves without children). CRUD itself stays
 *   in the action bar of the hosting window.
 * - Detail box: the header fields of the selected record (the parent
 *   field renders as a self-referencing picker), plus the tabbed body
 *   sections — sharing the exact same field components as every form.
 *
 * Purely presentational: the record state machine (save/delete/navigate)
 * lives in the hosting DataFormWindow, so the whole CRUD surface —
 * action bar, confirm dialog, status footer — stays identical.
 */
export function TreeForm({
  records,
  fields,
  draft,
  mode,
  selectedId,
  isBusy,
  accentColor,
  lookupUrlBase,
  onSelect,
  onFieldChange,
  onNewChild,
  onDeleteNode,
  onCopyNode,
  panelTitle,
  renderNodeGlyph,
  detail,
  canNewChild,
  canDeleteNode,
  hideNodeCopy = false,
}: TreeFormProps) {
  const { direction, formatNumber, t } = useTranslation();

  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => a.sortOrder - b.sortOrder),
    [fields],
  );
  const parentField = useMemo(() => pickParentField(sortedFields), [sortedFields]);
  const { codeField, titleField } = useMemo(
    () => pickListColumns(sortedFields),
    [sortedFields],
  );

  // ── Hierarchy ────────────────────────────────────────────────────
  const nodes = useMemo<TreeNode[]>(() => {
    const byId = new Map<string, TreeNode>(
      records.map((record) => [record.id, { record, depth: 0, children: [] }]),
    );
    const roots: TreeNode[] = [];
    for (const node of byId.values()) {
      const parentValue = parentField
        ? node.record.data[parentField.fieldKey]
        : null;
      const parent =
        typeof parentValue === 'string' ? byId.get(parentValue) : undefined;
      if (parent && parent !== node) parent.children.push(node);
      else roots.push(node);
    }
    const flat: TreeNode[] = [];
    const walk = (list: TreeNode[], depth: number) => {
      for (const node of list) {
        node.depth = depth;
        flat.push(node);
        walk(node.children, depth + 1);
      }
    };
    walk(roots, 0);
    return flat;
  }, [records, parentField]);

  /** Ids of the selected record's descendants (excluded from parent picker). */
  const descendantIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedId) return ids;
    const walk = (list: TreeNode[]): boolean => {
      for (const node of list) {
        if (walk(node.children)) return true;
        if (node.record.id === selectedId) {
          ids.add(node.record.id);
          return true;
        }
        if (ids.size) ids.add(node.record.id);
      }
      return false;
    };
    walk(nodes);
    return ids;
  }, [nodes, selectedId]);

  // ── Search + expand state ───────────────────────────────────────
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

  const needle = query.trim().toLowerCase();
  const isSearching = needle.length > 0;

  /** Node matches when its code or title contains the query. */
  const nodeMatches = useCallback(
    (node: TreeNode) => {
      const code = codeField
        ? String(node.record.data[codeField.fieldKey] ?? '')
        : '';
      const title = titleField
        ? String(node.record.data[titleField.fieldKey] ?? '')
        : '';
      return (
        code.toLowerCase().includes(needle) ||
        title.toLowerCase().includes(needle)
      );
    },
    [codeField, needle, titleField],
  );

  /** Visible nodes while searching: matches + their ancestors. */
  const visibleNodes = useMemo(() => {
    if (!isSearching) return nodes;
    const keep = new Set<string>();
    const match = (list: TreeNode[]): boolean => {
      let any = false;
      for (const node of list) {
        const childMatch = match(node.children);
        if (childMatch || nodeMatches(node)) {
          keep.add(node.record.id);
          any = true;
        }
      }
      return any;
    };
    match(nodes);
    return nodes.filter((node) => keep.has(node.record.id));
  }, [isSearching, nodeMatches, nodes]);

  const toggle = useCallback((recordId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  }, []);

  // ── Node context menu (زیرشاخه جدید / حذف شاخه) ─────────────────
  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    recordId: string;
  } | null>(null);
  const closeMenu = useCallback(() => setMenu(null), []);
  const menuRef = useDismiss<HTMLDivElement>(menu !== null, closeMenu);

  /** Node the open menu belongs to (hidden again once it disappears). */
  const menuNode = useMemo(
    () =>
      menu
        ? nodes.find((node) => node.record.id === menu.recordId) ?? null
        : null,
    [menu, nodes],
  );

  /** Opens the menu inside the viewport (approximate panel size). */
  const openMenu = useCallback((event: React.MouseEvent, recordId: string) => {
    event.preventDefault();
    const x = Math.min(event.clientX, window.innerWidth - 220);
    const y = Math.min(event.clientY, window.innerHeight - 104);
    setMenu({ x: Math.max(8, x), y: Math.max(8, y), recordId });
  }, []);

  // Fixed-position menu must not linger above a scrolled/resized tree.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menu]);

  const handleMenuNewSub = useCallback(() => {
    if (!menu || !parentField) return;
    onNewChild({ [parentField.fieldKey]: menu.recordId });
    closeMenu();
  }, [closeMenu, menu, onNewChild, parentField]);

  const handleMenuDelete = useCallback(() => {
    if (!menu || mode === 'new' || isBusy) return;
    const node = nodes.find((item) => item.record.id === menu.recordId);
    if (!node || node.children.length > 0) return;
    onDeleteNode(menu.recordId);
    closeMenu();
  }, [closeMenu, isBusy, menu, mode, nodes, onDeleteNode]);

  // ── Body tabs (tabKey !== null groups, definition order kept) ───
  const bodyTabs = useMemo(() => {
    const groups: Array<{ key: string; name: string; fields: FormFieldDef[] }> = [];
    for (const field of sortedFields) {
      if (field.tabKey === null) continue;
      let group = groups.find((candidate) => candidate.key === field.tabKey);
      if (!group) {
        group = {
          key: field.tabKey,
          name: field.tabName ?? field.tabKey,
          fields: [],
        };
        groups.push(group);
      }
      group.fields.push(field);
    }
    return groups;
  }, [sortedFields]);

  const headerFields = useMemo(
    () => sortedFields.filter((field) => field.tabKey === null),
    [sortedFields],
  );

  const [activeTabKey, setActiveTabKey] = useState<string | null>(null);
  const activeBodyTab =
    bodyTabs.find((tab) => tab.key === activeTabKey) ?? bodyTabs[0] ?? null;

  const current = records.find((record) => record.id === selectedId) ?? null;
  const showDetail = mode === 'new' || current !== null;

  const renderFields = (list: FormFieldDef[]) => (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-4 sm:grid-cols-2">
      {list.map((field) =>
        parentField && field.fieldKey === parentField.fieldKey ? (
          <ParentPicker
            key={field.fieldKey}
            field={field}
            nodes={nodes}
            excludeIds={descendantIds}
            value={
              typeof draft[field.fieldKey] === 'string'
                ? (draft[field.fieldKey] as string)
                : null
            }
            onChange={(value) => onFieldChange(field.fieldKey, value)}
            disabled={isBusy}
          />
        ) : (
          <FieldRenderer
            key={field.fieldKey}
            field={field}
            value={draft[field.fieldKey] ?? null}
            onChange={(value) => onFieldChange(field.fieldKey, value)}
            disabled={isBusy}
            lookupUrlBase={lookupUrlBase}
          />
        ),
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      {/* ── Box 1: tree panel (درختواره) ─────────────────────────── */}
      <aside
        aria-label={t('formWindow.treePanel')}
        className="flex max-h-56 w-full shrink-0 flex-col border-b border-white/10 bg-white/[0.02] md:max-h-none md:w-60 md:border-b-0 md:border-e lg:w-72"
      >
        <div className="shrink-0 border-b border-white/10 px-3 pb-2.5 pt-3">
          {/* Panel title + record count */}
          <div className="mb-2.5 flex items-center gap-1.5">
            <Network className="h-3.5 w-3.5 text-white/45" aria-hidden="true" />
            <span className="text-[12px] font-semibold text-white/85">
              {panelTitle ?? t('formWindow.treePanel')}
            </span>
            <span className="rounded bg-white/[0.07] px-1.5 py-px text-[10px] tabular-nums text-white/45">
              {formatNumber(records.length)}
            </span>
          </div>

          {/* Search inside the tree (CRUD lives in the action bar) */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('formWindow.treeSearch')}
              aria-label={t('formWindow.treeSearch')}
              className={cn(controlClasses, 'h-7 ps-7 pe-7')}
            />
            {isSearching && (
              <button
                type="button"
                title={t('formWindow.clear')}
                aria-label={t('formWindow.clear')}
                onClick={() => setQuery('')}
                className="absolute end-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Nodes */}
        <div
          role="tree"
          aria-label={t('formWindow.treePanel')}
          className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-width:thin]"
        >
          {nodes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
              <Network className="h-5 w-5 text-white/25" aria-hidden="true" />
              <p className="text-[12px] text-white/40">
                {t('formWindow.emptyRecords')}
              </p>
            </div>
          ) : visibleNodes.length === 0 ? (
            <p className="px-3 py-8 text-center text-[12px] text-white/40">
              {t('formWindow.noMatch')}
            </p>
          ) : (
            visibleNodes.map((node) => {
              const hasChildren = node.children.length > 0;
              const isCollapsed = !isSearching && collapsed.has(node.record.id);
              const isSelected =
                mode !== 'new' && node.record.id === selectedId;
              return (
                <div
                  key={node.record.id}
                  role="treeitem"
                  aria-selected={isSelected}
                  aria-level={node.depth + 1}
                  aria-expanded={hasChildren ? !isCollapsed : undefined}
                  style={{ paddingInlineStart: node.depth * 14 }}
                  onContextMenu={(event) => openMenu(event, node.record.id)}
                >
                  <div
                    className={cn(
                      'group flex items-center gap-0.5 rounded-lg pe-1 transition-colors',
                      isSelected
                        ? 'bg-sky-500/15 ring-1 ring-sky-400/30'
                        : 'hover:bg-white/[0.05]',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(node.record.id)}
                      className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 ps-1.5 text-start"
                    >
                      {renderNodeGlyph ? (
                        renderNodeGlyph(node.record, hasChildren)
                      ) : hasChildren ? (
                        <Folder
                          className="h-3.5 w-3.5 shrink-0 text-amber-400/80"
                          aria-hidden="true"
                        />
                      ) : (
                        <FileText
                          className="h-3.5 w-3.5 shrink-0 text-white/40"
                          aria-hidden="true"
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate text-[12px] text-white/85">
                        {titleField
                          ? formatFieldValue(
                              titleField,
                              node.record.data[titleField.fieldKey],
                              formatNumber,
                            )
                          : node.record.id}
                      </span>
                      {codeField && (
                        <span className="shrink-0 rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-white/60">
                          {formatFieldValue(
                            codeField,
                            node.record.data[codeField.fieldKey],
                            formatNumber,
                          )}
                        </span>
                      )}
                    </button>
                    {!hideNodeCopy && (
                      <button
                        type="button"
                        title={t('formWindow.actionCopy')}
                        aria-label={t('formWindow.actionCopy')}
                        onClick={() => onCopyNode(node.record)}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={
                        hasChildren ? t('formWindow.treePanel') : undefined
                      }
                      disabled={!hasChildren}
                      onClick={() => toggle(node.record.id)}
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white/45 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40',
                        hasChildren
                          ? 'hover:bg-white/10 hover:text-white'
                          : 'pointer-events-none opacity-0',
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          'h-3.5 w-3.5 transition-transform rtl:-scale-x-100',
                          !isCollapsed && 'rotate-90 rtl:-rotate-90',
                        )}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Box 2: detail (fields + tabs) ────────────────────────── */}
      <section
        aria-label={t('formWindow.mainSection')}
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto [scrollbar-width:thin]"
      >
        {showDetail ? (
          detail !== undefined ? (
            detail
          ) : (
            <>
              <div className="bg-white/[0.02]">
                {renderFields(headerFields)}
              </div>
              {bodyTabs.length > 0 && (
                <div className="flex min-h-0 flex-col">
                  <FormTabs
                    tabs={bodyTabs.map((tab) => ({
                      key: tab.key,
                      name: tab.name,
                      count: tab.fields.length,
                    }))}
                    active={activeBodyTab?.key ?? null}
                    onChange={setActiveTabKey}
                    accentColor={accentColor}
                    direction={direction}
                  >
                    {renderFields(activeBodyTab?.fields ?? [])}
                  </FormTabs>
                </div>
              )}
            </>
          )
        ) : records.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <Network className="h-6 w-6 text-white/25" aria-hidden="true" />
            <p className="text-[13px] text-white/55">
              {t('formWindow.emptyRecords')}
            </p>
            <p className="text-[11px] text-white/35">
              {t('formWindow.emptyRecordsHint')}
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <Network className="h-6 w-6 text-white/25" aria-hidden="true" />
            <p className="text-[12px] text-white/45">
              {t('formWindow.treeSelectHint')}
            </p>
          </div>
        )}
      </section>

      {/* ── Node context menu (right click) ─────────────────────────── */}
      <AnimatePresence>
        {menu && menuNode && (
          <motion.div
            ref={menuRef}
            role="menu"
            aria-label={t('formWindow.treePanel')}
            initial={{ opacity: 0, scale: 0.95, y: -3 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -3 }}
            transition={{ duration: 0.13, ease: 'easeOut' }}
            style={{ left: menu.x, top: menu.y }}
            className="fixed z-[70] min-w-[190px] origin-top overflow-hidden rounded-xl bg-[#1b1e26]/[0.97] p-1 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-xl"
          >
            {!(menuNode && canNewChild && !canNewChild(menuNode.record, menuNode.depth)) && (
              <button
                type="button"
                role="menuitem"
                disabled={!parentField || isBusy}
                onClick={handleMenuNewSub}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[12px] text-white/85 transition-colors enabled:hover:bg-emerald-500/15 enabled:hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FolderPlus
                  className="h-3.5 w-3.5 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                {t('formWindow.treeContextNewSub')}
              </button>
            )}
            {!(menuNode && canDeleteNode && !canDeleteNode(menuNode.record)) && (
              <button
                type="button"
                role="menuitem"
                title={
                  menuNode.children.length > 0
                    ? t('formWindow.treeContextDeleteDisabled')
                    : undefined
                }
                disabled={menuNode.children.length > 0 || mode === 'new' || isBusy}
                onClick={handleMenuDelete}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[12px] text-white/85 transition-colors enabled:hover:bg-rose-500/15 enabled:hover:text-rose-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2
                  className="h-3.5 w-3.5 shrink-0 text-rose-400"
                  aria-hidden="true"
                />
                {t('formWindow.treeContextDelete')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ParentPickerProps {
  field: FormFieldDef;
  nodes: TreeNode[];
  /** Record ids that may not become a parent (self + descendants). */
  excludeIds: ReadonlySet<string>;
  value: string | null;
  onChange: (value: FormFieldValue) => void;
  disabled?: boolean;
}

/**
 * Self-referencing parent selector of tree forms: lists the form's own
 * records in hierarchy order (indented, code + title) and stores the
 * chosen record's id — the same value the tree hierarchy is built from.
 */
function ParentPicker({
  field,
  nodes,
  excludeIds,
  value,
  onChange,
  disabled,
}: ParentPickerProps) {
  const { locale, t } = useTranslation();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useDismiss<HTMLDivElement>(
    open,
    useCallback(() => setOpen(false), []),
  );

  const options = useMemo(
    () =>
      nodes
        .filter((node) => !excludeIds.has(node.record.id))
        .map((node) => ({ node, depth: node.depth })),
    [excludeIds, nodes],
  );

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return options;
    return options.filter(({ node }) => {
      const title = String(node.record.data.title ?? '');
      const code = String(node.record.data.code ?? '');
      return (
        title.toLowerCase().includes(needle) ||
        code.toLowerCase().includes(needle)
      );
    });
  }, [needle, options]);

  const labelOf = useCallback(
    (node: TreeNode) => {
      const title = String(node.record.data.title ?? '').trim();
      const code = String(node.record.data.code ?? '').trim();
      return code && title ? `${code} — ${title}` : title || code || node.record.id;
    },
    [],
  );

  const selectedNode = useMemo(
    () => nodes.find((node) => node.record.id === value) ?? null,
    [nodes, value],
  );

  const openPanel = () => {
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
  };

  const pick = (node: TreeNode) => {
    onChange(node.record.id);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        event.preventDefault();
        openPanel();
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(filtered.length - 1, index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = filtered[activeIndex];
      if (target) pick(target.node);
    } else if (event.key === 'Escape') {
      event.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-2',
        field.span === 2 && 'col-span-full',
      )}
      ref={rootRef}
      onKeyDown={onKeyDown}
    >
      {/* Label at the inline start: right side in RTL, left side in LTR. */}
      <label
        htmlFor={field.fieldKey}
        className="w-36 shrink-0 text-[12px] leading-6 text-white/70"
      >
        {fieldLabel(field, locale)}
        {field.isRequired && (
          <span
            title={t('formWindow.requiredHint')}
            aria-hidden="true"
            className="ms-1 text-[13px] leading-none text-red-400"
          >
            *
          </span>
        )}
      </label>
      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id={field.fieldKey}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-haspopup="listbox"
            disabled={disabled}
            onClick={() => (open ? setOpen(false) : openPanel())}
            className={cn(
              controlClasses,
              'flex items-center justify-between gap-2 pe-2 text-start',
            )}
          >
            <span
              className={cn(
                'min-w-0 flex-1 truncate',
                selectedNode ? 'text-white' : 'text-white/30',
              )}
            >
              {selectedNode
                ? labelOf(selectedNode)
                : t('formWindow.selectPlaceholder')}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-white/35" />
          </button>
        </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute top-full z-50 mt-1.5 w-full min-w-[220px] overflow-hidden rounded-xl bg-[#1b1e26]/[0.97] shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-white/35" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                placeholder={t('formWindow.search')}
                className="h-7 w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
            <div
              id={listboxId}
              role="listbox"
              aria-label={fieldLabel(field, locale)}
              className="max-h-64 overflow-y-auto py-1 [scrollbar-width:thin]"
            >
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-white/40">
                  {t('formWindow.noMatch')}
                </p>
              )}
              {filtered.map(({ node }, index) => {
                const isSelected = node.record.id === value;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={node.record.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => pick(node)}
                    style={{ paddingInlineStart: 12 + node.depth * 14 }}
                    className={cn(
                      'flex w-full items-center gap-2 pe-3 py-1.5 text-start text-[12px] transition-colors',
                      isActive
                        ? 'bg-sky-500/15 text-white'
                        : 'text-white/80 hover:bg-white/[0.05]',
                      isSelected && !isActive && 'bg-white/[0.04]',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {labelOf(node)}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                    )}
                  </button>
                );
              })}
            </div>
            {value !== null && value !== '' && (
              <div className="border-t border-white/10 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-300 transition-colors hover:bg-rose-500/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400/50"
                >
                  <X className="h-3.5 w-3.5" />
                  {t('formWindow.clear')}
                </button>
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
