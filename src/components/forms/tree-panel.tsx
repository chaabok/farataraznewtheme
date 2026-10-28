'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Network } from 'lucide-react';
import { useTranslation } from '@/i18n';
import type { FormFieldDef, FormRecord } from '@/types/forms';
import { cn } from '@/lib/utils';
import { FieldRenderer } from './field-renderer';
import { formatFieldValue, pickListColumns } from './form-utils';

interface TreePanelProps {
  records: FormRecord[];
  fields: FormFieldDef[];
  /** Base path ending in `/lookups` used by lookup fields. */
  lookupUrlBase?: string;
}

interface TreeNode {
  record: FormRecord;
  depth: number;
  children: TreeNode[];
}

/**
 * Renderer for `type === 'tree'` forms: records become an expandable
 * hierarchy through their `parentId`-style field and a detail pane shows
 * the selected record with the same generic field components.
 */
export function TreePanel({ records, fields, lookupUrlBase }: TreePanelProps) {
  const { t, formatNumber } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => a.sortOrder - b.sortOrder),
    [fields],
  );

  const parentKey = useMemo(
    () =>
      sortedFields.find(
        (field) =>
          field.fieldKey === 'parentId' ||
          (field.fieldType === 'lookup' && /parent/i.test(field.fieldKey)),
      )?.fieldKey ?? null,
    [sortedFields],
  );

  const { codeField, titleField } = useMemo(
    () => pickListColumns(sortedFields),
    [sortedFields],
  );

  const nodes = useMemo<TreeNode[]>(() => {
    const byId = new Map<string, TreeNode>(
      records.map((record) => [
        record.id,
        { record, depth: 0, children: [] },
      ]),
    );
    const roots: TreeNode[] = [];
    for (const node of byId.values()) {
      const parentValue = parentKey
        ? node.record.data[parentKey]
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
  }, [records, parentKey]);

  const selected = records.find((record) => record.id === selectedId) ?? null;
  const childCount = (node: TreeNode) => node.children.length;

  const toggle = (recordId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
      {/* ── Tree pane ── */}
      <div className="max-h-[420px] overflow-y-auto rounded-xl bg-white/[0.02] p-2 ring-1 ring-white/10 [scrollbar-width:thin]">
        {nodes.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-white/40">
            {t('formWindow.emptyRecords')}
          </p>
        ) : (
          nodes.map((node) => {
            const hasChildren = childCount(node) > 0;
            const isCollapsed = collapsed.has(node.record.id);
            const isSelected = node.record.id === selectedId;
            return (
              <div
                key={node.record.id}
                style={{ paddingInlineStart: node.depth * 18 }}
              >
                <div
                  className={cn(
                    'group flex items-center gap-1 rounded-lg pe-2 transition-colors',
                    isSelected
                      ? 'bg-sky-500/15 ring-1 ring-sky-400/30'
                      : 'hover:bg-white/[0.05]',
                  )}
                >
                  <button
                    type="button"
                    aria-label={t('formWindow.actionList')}
                    aria-expanded={hasChildren ? !isCollapsed : undefined}
                    disabled={!hasChildren}
                    onClick={() => toggle(node.record.id)}
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/45 transition-colors',
                      hasChildren
                        ? 'hover:bg-white/10 hover:text-white'
                        : 'opacity-0',
                    )}
                  >
                    <ChevronRight
                      className={cn(
                        'h-3.5 w-3.5 transition-transform rtl:-scale-x-100',
                        !isCollapsed && 'rotate-90 rtl:-rotate-90',
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedId(node.record.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-start text-[12.5px]"
                  >
                    {codeField && (
                      <span className="shrink-0 rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-white/60">
                        {formatFieldValue(
                          codeField,
                          node.record.data[codeField.fieldKey],
                          formatNumber,
                        )}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-white/85">
                      {titleField
                        ? formatFieldValue(
                            titleField,
                            node.record.data[titleField.fieldKey],
                            formatNumber,
                          )
                        : node.record.id}
                    </span>
                    {hasChildren && (
                      <span className="shrink-0 text-[10px] tabular-nums text-white/35">
                        {formatNumber(childCount(node))}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Detail pane ── */}
      <div className="rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/10">
        {selected ? (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <p className="mb-3 truncate text-[12px] font-semibold text-white/85">
              {titleField
                ? formatFieldValue(
                    titleField,
                    selected.data[titleField.fieldKey],
                    formatNumber,
                  )
                : selected.id}
            </p>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              {sortedFields.map((field) => (
                <FieldRenderer
                  key={field.fieldKey}
                  field={field}
                  value={selected.data[field.fieldKey] ?? null}
                  onChange={() => undefined}
                  disabled
                  lookupUrlBase={lookupUrlBase}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 text-center">
            <Network className="h-6 w-6 text-white/25" aria-hidden="true" />
            <p className="text-[12px] text-white/40">
              {t('formWindow.selectPlaceholder')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
