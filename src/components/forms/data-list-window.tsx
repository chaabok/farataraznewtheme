'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  createElement,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  Check,
  Columns3,
  FileDown,
  FilePen,
  FilePlus2,
  FileX2,
  Filter,
  Link2,
  Loader2,
  Printer,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n';
import { notifyRecordsChanged, RECORDS_CHANGED_EVENT } from '@/lib/app-events';
import { apiFetch, SessionExpiredError } from '@/lib/api-client';
import { useDesktopStore, type ListWindowInfo } from '@/store/desktop-store';
import type { Locale } from '@/types/desktop';
import type {
  FormDef,
  FormFieldDef,
  FormRecord,
  LookupOption,
} from '@/types/forms';
import { cn } from '@/lib/utils';
import { FormShell } from './form-shell';
import {
  fieldLabel,
  formTitle,
  formatFieldValue,
  pickParentField,
} from './form-utils';
import { DEFAULT_FORM_ACCENT } from './form-styles';

export interface DataListWindowProps {
  /** Tab id — `list:<formKey>` (moduleKey defaults to `settings`). */
  moduleId: string;
  /** Descriptor attached by `addListTab` in the desktop store. */
  list?: ListWindowInfo;
  /** Closes the hosting tab. */
  onClose?: () => void;
}

/** Fallback parsing of the tab id when no descriptor is attached. */
function parseListModuleId(moduleId: string): {
  moduleKey: string | null;
  formKey: string | null;
} {
  if (!moduleId.startsWith('list:')) {
    return { moduleKey: null, formKey: null };
  }
  const formKey = moduleId.slice('list:'.length);
  return { moduleKey: formKey ? 'settings' : null, formKey: formKey || null };
}

/** Sentinel kept in state so load errors render through the dictionaries. */
const GENERIC_LOAD_ERROR = 'dataList.loadError';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * Search normalization: lowercase, fold Persian/Arabic yeh & kaf variants
 * and convert Persian/Arabic digits to Latin so typed filters match the
 * stored data regardless of the keyboard used.
 */
function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ')
    .trim();
}

/** Lightweight table checkbox (button-based, no Radix overhead per row). */
function RowCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      onKeyDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      className={cn(
        'mx-auto flex h-4 w-4 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60',
        checked
          ? 'border-sky-300/70 bg-sky-500/80 text-white shadow-[0_0_8px_-2px_rgba(56,189,248,0.8)]'
          : 'border-white/25 bg-white/[0.04] hover:border-white/50',
      )}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3.2} />}
    </button>
  );
}

/**
 * Generic, database-driven records list («فهرست …»): every form saved
 * through the unified form system automatically gets one of these windows
 * with a filterable grid, multi-select, column chooser and the ERP-style
 * footer icon strip (new / edit / delete / view / export / print /
 * refresh / columns / filter).
 */
export function DataListWindow({ moduleId, list, onClose }: DataListWindowProps) {
  const { locale, t, tf, formatNumber } = useTranslation();
  const addFormTab = useDesktopStore((s) => s.addFormTab);

  const fallback = useMemo(() => parseListModuleId(moduleId), [moduleId]);
  const moduleKey = list?.moduleKey ?? fallback.moduleKey;
  const formKey = list?.formKey ?? fallback.formKey;
  const basePath =
    moduleKey && formKey ? `/api/modules/${moduleKey}/forms/${formKey}` : null;
  const lookupUrlBase = basePath ? `${basePath}/lookups` : '';

  // ── Data ──
  const [def, setDef] = useState<FormDef | null>(null);
  const [records, setRecords] = useState<FormRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** lookupKey → (option code → label). */
  const [lookupLabels, setLookupLabels] = useState<
    Record<string, Map<string, string>>
  >({});

  // ── View state ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isFilterRowVisible, setIsFilterRowVisible] = useState(true);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Loading ──
  const loadLookups = useCallback(
    async (formDef: FormDef) => {
      const keys = Array.from(
        new Set(
          formDef.fields
            .filter((field) => field.fieldType === 'lookup' && field.lookupKey)
            .map((field) => field.lookupKey as string),
        ),
      );
      if (!keys.length || !lookupUrlBase) return;
      const results = await Promise.all(
        keys.map((key) =>
          apiFetch<{ data: LookupOption[] }>(
            `${lookupUrlBase}/${encodeURIComponent(key)}?locale=${encodeURIComponent(locale)}`,
          )
            .then((payload): [string, Map<string, string>] => [
              key,
              new Map(
                (payload.data ?? []).map((option) => [
                  option.code,
                  locale === 'fa' ? option.label : (option.labelEn ?? option.label),
                ]),
              ),
            ])
            .catch((): [string, Map<string, string>] => [key, new Map()]),
        ),
      );
      setLookupLabels(Object.fromEntries(results));
    },
    [locale, lookupUrlBase],
  );

  const load = useCallback(async () => {
    if (!basePath) {
      setLoadError(GENERIC_LOAD_ERROR);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const defRes = await apiFetch<{ data: FormDef }>(
        `${basePath}?locale=${encodeURIComponent(locale)}`,
      );
      const nextDef = defRes.data;
      setDef(nextDef);
      setSelectedIds(new Set());

      const recordsRes = await apiFetch<{ data: FormRecord[] }>(
        `${basePath}/records`,
      );
      setRecords(recordsRes.data ?? []);
      void loadLookups(nextDef);
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      setLoadError(
        error instanceof Error && error.message
          ? error.message
          : GENERIC_LOAD_ERROR,
      );
    } finally {
      setIsLoading(false);
    }
  }, [basePath, loadLookups, locale]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshRecords = useCallback(async () => {
    if (!basePath) return;
    setIsRefreshing(true);
    try {
      const res = await apiFetch<{ data: FormRecord[] }>(`${basePath}/records`);
      const next = res.data ?? [];
      setRecords(next);
      setSelectedIds((prev) => {
        const nextIds = new Set(
          [...prev].filter((id) => next.some((record) => record.id === id)),
        );
        return nextIds.size === prev.size ? prev : nextIds;
      });
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      toast({
        title: t('dataList.loadError'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [basePath, t]);

  // Auto-refresh when a form window of the same form mutates records.
  useEffect(() => {
    if (!moduleKey || !formKey) return;
    const handler = (event: Event) => {
      const detail = (
        event as CustomEvent<{ moduleKey?: string; formKey?: string }>
      ).detail;
      if (detail?.moduleKey === moduleKey && detail?.formKey === formKey) {
        void refreshRecords();
      }
    };
    window.addEventListener(RECORDS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(RECORDS_CHANGED_EVENT, handler);
  }, [formKey, moduleKey, refreshRecords]);

  // ── Derived view models ──
  const sortedFields = useMemo(
    () => (def ? [...def.fields].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [def],
  );
  const parentField = useMemo(
    () => (def?.type === 'tree' ? pickParentField(sortedFields) : null),
    [def, sortedFields],
  );
  const visibleFields = useMemo(
    () => sortedFields.filter((field) => !hiddenColumns.has(field.fieldKey)),
    [hiddenColumns, sortedFields],
  );
  const fieldByKey = useMemo(
    () => new Map(sortedFields.map((field) => [field.fieldKey, field])),
    [sortedFields],
  );

  /** recordId → display title of that record (tree parent columns). */
  const parentTitles = useMemo(() => {
    const map = new Map<string, string>();
    if (!parentField) return map;
    const titleField =
      sortedFields.find(
        (field) =>
          field !== parentField && /title|name|desc/i.test(field.fieldKey),
      ) ??
      sortedFields.find((field) => field !== parentField) ??
      null;
    for (const record of records) {
      const raw = titleField ? record.data[titleField.fieldKey] : null;
      map.set(
        record.id,
        raw === null || raw === undefined || raw === ''
          ? record.id
          : String(raw),
      );
    }
    return map;
  }, [parentField, records, sortedFields]);

  /** Display text of one cell (checkbox → بلی/خیر, lookup → label, …). */
  const cellText = useCallback(
    (field: FormFieldDef, record: FormRecord): string => {
      const raw = record.data[field.fieldKey];
      if (field.fieldType === 'checkbox') {
        return raw === true ? t('dataList.yes') : t('dataList.no');
      }
      // Tree parent columns resolve the parent record's title (the
      // stored value is the parent record id — must run before lookup).
      if (parentField && field.fieldKey === parentField.fieldKey) {
        if (raw === null || raw === undefined || raw === '') return '—';
        return parentTitles.get(String(raw)) ?? String(raw);
      }
      if (field.fieldType === 'lookup') {
        if (raw === null || raw === undefined || raw === '') return '—';
        const labels = field.lookupKey
          ? lookupLabels[field.lookupKey]
          : undefined;
        return labels?.get(String(raw)) ?? String(raw);
      }
      return formatFieldValue(field, raw, formatNumber);
    },
    [formatNumber, lookupLabels, parentField, parentTitles, t],
  );

  const filteredRecords = useMemo(() => {
    const active = Object.entries(filters).filter(
      ([, value]) => value.trim() !== '',
    );
    if (!active.length) return records;
    const needles: Array<{ field: FormFieldDef; needle: string }> = [];
    for (const [key, value] of active) {
      const field = fieldByKey.get(key);
      if (field) needles.push({ field, needle: normalizeSearchText(value) });
    }
    if (!needles.length) return records;
    return records.filter((record) =>
      needles.every(({ field, needle }) =>
        normalizeSearchText(cellText(field, record)).includes(needle),
      ),
    );
  }, [cellText, fieldByKey, filters, records]);

  // ── Selection ──
  const toggleSelected = useCallback((recordId: string, additive: boolean) => {
    setSelectedIds((prev) => {
      if (!additive) return prev.has(recordId) ? new Set([recordId]) : new Set([recordId]);
      const next = new Set(prev);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  }, []);

  const handleRowClick = useCallback(
    (record: FormRecord, event: MouseEvent<HTMLTableRowElement>) => {
      if (event.ctrlKey || event.metaKey) {
        toggleSelected(record.id, true);
      } else {
        setSelectedIds((prev) =>
          prev.size === 1 && prev.has(record.id) ? prev : new Set([record.id]),
        );
      }
    },
    [toggleSelected],
  );

  const allVisibleSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((record) => selectedIds.has(record.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (filteredRecords.length && filteredRecords.every((record) => prev.has(record.id))) {
        return new Set();
      }
      return new Set(filteredRecords.map((record) => record.id));
    });
  }, [filteredRecords]);

  // ── Form integration ──
  const openForm = useCallback(
    (options?: { recordId?: string; startInNew?: boolean; nonce?: number }) => {
      if (!moduleKey || !formKey) return;
      addFormTab({
        moduleKey,
        formKey,
        name: def ? formTitle(def, locale) : (list?.name ?? formKey),
        iconKey: def?.iconKey ?? list?.iconKey ?? 'fileText',
        nonce: Date.now(),
        ...options,
      });
    },
    [addFormTab, def, formKey, list, locale, moduleKey],
  );

  const singleSelectedId =
    selectedIds.size === 1 ? [...selectedIds][0] ?? null : null;

  // ── Delete ──
  const requestDelete = useCallback(() => {
    if (!selectedIds.size || isDeleting || isRefreshing) return;
    setIsDeleteConfirmOpen(true);
  }, [isDeleting, isRefreshing, selectedIds.size]);

  const confirmDelete = useCallback(async () => {
    if (!basePath || !selectedIds.size || isDeleting) {
      setIsDeleteConfirmOpen(false);
      return;
    }
    setIsDeleting(true);
    try {
      for (const id of selectedIds) {
        // DELETE answers 204 with an empty body — nothing to parse.
        await apiFetch(`${basePath}/records/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
      }
      setIsDeleteConfirmOpen(false);
      const count = selectedIds.size;
      setSelectedIds(new Set());
      // The list listens to its own event too — one refresh for every
      // open list/form of this formKey (dispatchEvent is synchronous).
      notifyRecordsChanged({ moduleKey: moduleKey ?? '', formKey: formKey ?? '' });
      toast({
        title: tf('dataList.deleteSuccess', { count: formatNumber(count) }),
      });
    } catch (error) {
      setIsDeleteConfirmOpen(false);
      if (error instanceof SessionExpiredError) return;
      toast({
        title:
          error instanceof Error && error.message
            ? error.message
            : t('dataList.deleteError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [
    basePath,
    formatNumber,
    formKey,
    isDeleting,
    moduleKey,
    selectedIds,
    t,
    tf,
  ]);

  // ── Export / print ──
  const handleExport = useCallback(() => {
    if (!visibleFields.length || !filteredRecords.length) {
      toast({ title: t('dataList.exportEmpty') });
      return;
    }
    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = visibleFields.map((field) =>
      escapeCell(fieldLabel(field, locale)),
    );
    const rows = filteredRecords.map((record) =>
      visibleFields.map((field) => escapeCell(cellText(field, record))),
    );
    const csv =
      '\uFEFF' + [header, ...rows].map((row) => row.join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${formKey ?? 'list'}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast({ title: t('dataList.exportSuccess') });
  }, [cellText, filteredRecords, formKey, locale, t, visibleFields]);

  const handlePrint = useCallback(() => {
    toast({ title: t('formWindow.printToast') });
  }, [t]);

  const toggleColumn = useCallback((fieldKey: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(fieldKey)) next.delete(fieldKey);
      else next.add(fieldKey);
      return next;
    });
  }, []);

  // ── Chrome texts ──
  const listName = def
    ? formTitle(def, locale)
    : (list?.name ?? formKey ?? t('common.loading'));
  const title = tf('dataList.title', {
    name: listName,
    count: formatNumber(filteredRecords.length),
  });
  const subtitle = selectedIds.size
    ? tf('dataList.selectedCount', { count: formatNumber(selectedIds.size) })
    : tf('dataList.recordCount', { count: formatNumber(records.length) });

  const accentColor = def?.accentColor || DEFAULT_FORM_ACCENT;
  const hasActiveFilters = Object.values(filters).some(
    (value) => value.trim() !== '',
  );

  const errorText =
    loadError === GENERIC_LOAD_ERROR ? t('dataList.loadError') : loadError;

  /** The grid (or its loading / error / empty states). */
  let content: ReactNode;
  if (!def) {
    content = (
      <div className="space-y-2 p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={`list-skeleton-${index}`}
            className="h-8 w-full rounded-md bg-white/[0.05]"
          />
        ))}
      </div>
    );
  } else {
    content = (
      <div className="relative h-full min-h-0">
        <div className="h-full overflow-auto [scrollbar-width:thin]">
          <table className="w-full min-w-max border-separate border-spacing-0 text-[12px]">
            <thead>
              <tr>
                <th className="sticky top-0 z-30 h-9 w-10 border-b border-white/10 bg-[#1a1d26] px-2">
                  <RowCheckbox
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    label={t('dataList.selectAll')}
                  />
                </th>
                {visibleFields.map((field) => (
                  <th
                    key={field.fieldKey}
                    scope="col"
                    className="sticky top-0 z-30 h-9 min-w-[130px] max-w-[260px] border-b border-white/10 bg-[#1a1d26] px-3 text-center align-middle text-[11.5px] font-bold leading-tight text-white/85"
                  >
                    <span className="line-clamp-1" title={fieldLabel(field, locale)}>
                      {fieldLabel(field, locale)}
                    </span>
                  </th>
                ))}
              </tr>
              {isFilterRowVisible && (
                <tr>
                  <th className="sticky top-9 z-20 h-8 border-b border-white/10 bg-[#171a22] px-2 align-middle">
                    <button
                      type="button"
                      title={t('dataList.clearFilters')}
                      aria-label={t('dataList.clearFilters')}
                      disabled={!hasActiveFilters}
                      onClick={() => setFilters({})}
                      className="mx-auto flex h-6 w-6 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-30"
                    >
                      <Filter className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  {visibleFields.map((field) => (
                    <th
                      key={`filter-${field.fieldKey}`}
                      className="sticky top-9 z-20 h-8 border-b border-white/10 bg-[#171a22] px-1.5 align-middle"
                    >
                      <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-1.5 transition-colors focus-within:border-sky-400/50">
                        <Filter
                          className="h-3 w-3 shrink-0 text-white/30"
                          aria-hidden="true"
                        />
                        <input
                          type="text"
                          value={filters[field.fieldKey] ?? ''}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              [field.fieldKey]: event.target.value,
                            }))
                          }
                          placeholder={t('dataList.filterPlaceholder')}
                          aria-label={fieldLabel(field, locale)}
                          className="h-6 w-full min-w-0 bg-transparent text-[11px] text-white placeholder:text-white/25 focus:outline-none"
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 7 }).map((_, rowIndex) => (
                    <tr key={`list-row-skeleton-${rowIndex}`}>
                      <td className="h-8 border-b border-white/[0.05] px-2">
                        <Skeleton className="mx-auto h-3.5 w-3.5 rounded-sm bg-white/[0.07]" />
                      </td>
                      {visibleFields.map((field) => (
                        <td
                          key={field.fieldKey}
                          className="h-8 border-b border-white/[0.05] px-3"
                        >
                          <Skeleton className="mx-auto h-3.5 w-3/4 rounded-sm bg-white/[0.06]" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filteredRecords.map((record) => {
                    const isSelected = selectedIds.has(record.id);
                    return (
                      <tr
                        key={record.id}
                        onClick={(event) => handleRowClick(record, event)}
                        onDoubleClick={() =>
                          openForm({ recordId: record.id, nonce: Date.now() })
                        }
                        aria-selected={isSelected}
                        className={cn(
                          'cursor-default transition-colors',
                          isSelected
                            ? 'bg-sky-500/[0.14]'
                            : 'hover:bg-white/[0.035]',
                        )}
                      >
                        <td className="h-8 border-b border-white/[0.05] px-2 text-center">
                          <RowCheckbox
                            checked={isSelected}
                            onChange={() => toggleSelected(record.id, true)}
                            label={t('dataList.selectRow')}
                          />
                        </td>
                        {visibleFields.map((field) => (
                          <td
                            key={field.fieldKey}
                            title={cellText(field, record)}
                            className="h-8 max-w-[260px] truncate border-b border-white/[0.05] px-3 text-center tabular-nums text-white/80"
                          >
                            {cellText(field, record)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Empty / filter-empty states (overlay keeps the header grid visible) */}
        {!isLoading && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center p-6"
            aria-live="polite"
          >
            {records.length === 0 ? (
              <p className="text-[13px] text-white/45">
                {t('dataList.empty')}
              </p>
            ) : filteredRecords.length === 0 ? (
              <p className="text-[13px] text-white/45">
                {t('dataList.noFilterMatch')}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <FormShell
        title={title}
        subtitle={subtitle}
        iconKey={def?.iconKey ?? list?.iconKey ?? 'fileText'}
        accentColor={accentColor}
        footer={
          <DataListFooter
            isBusy={isLoading || isRefreshing || isDeleting}
            isRefreshing={isRefreshing}
            hasSelection={selectedIds.size > 0}
            hasSingleSelection={singleSelectedId !== null}
            isFilterRowVisible={isFilterRowVisible}
            isColumnsOpen={isColumnsOpen}
            hiddenColumnsCount={hiddenColumns.size}
            onRefresh={() => void refreshRecords()}
            onPrint={handlePrint}
            onExport={handleExport}
            onView={() => {
              if (singleSelectedId) {
                openForm({ recordId: singleSelectedId, nonce: Date.now() });
              }
            }}
            onEdit={() => {
              if (singleSelectedId) {
                openForm({ recordId: singleSelectedId, nonce: Date.now() });
              }
            }}
            onDelete={requestDelete}
            onNew={() => openForm({ startInNew: true })}
            onToggleFilter={() => setIsFilterRowVisible((visible) => !visible)}
            onToggleColumn={toggleColumn}
            onShowAllColumns={() => setHiddenColumns(new Set())}
            onColumnsOpenChange={setIsColumnsOpen}
            sortedFields={sortedFields}
            hiddenColumns={hiddenColumns}
            fieldLocale={locale}
          />
        }
      >
        {errorText && !def ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="max-w-sm text-sm text-red-200/90">{errorText}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-2 rounded-lg bg-white/[0.07] px-4 py-2 text-[13px] text-white/80 transition-colors hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t('common.retry')}
            </button>
          </div>
        ) : (
          <>
            {errorText && def && (
              <div className="mx-3 mt-3 rounded-lg border border-red-400/30 bg-red-950/40 px-3 py-2 text-xs text-red-200/90">
                {errorText}
              </div>
            )}
            {content}
          </>
        )}
      </FormShell>

      {/* Delete confirmation (بلی / خیر) — same dialog as the form windows. */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setIsDeleteConfirmOpen(false);
        }}
      >
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-[#1e2128]/95 text-white shadow-2xl shadow-black/60 backdrop-blur-xl sm:max-w-md">
          <AlertDialogHeader className="sm:text-start">
            <AlertDialogTitle className="flex items-center gap-2.5 text-base text-white">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 ring-1 ring-rose-400/30">
                <FileX2 className="h-4 w-4" aria-hidden="true" />
              </span>
              {t('formWindow.deleteDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed text-white/65">
              {selectedIds.size > 1
                ? tf('dataList.deleteDialogMessageMulti', {
                    count: formatNumber(selectedIds.size),
                  })
                : t('formWindow.deleteDialogMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-9 rounded-lg border-white/15 bg-white/[0.06] px-4 text-[13px] text-white/80 transition-colors hover:bg-white/[0.12] hover:text-white focus-visible:ring-white/40"
            >
              {t('formWindow.confirmNo')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                // Keep the dialog open while the delete request runs.
                event.preventDefault();
                void confirmDelete();
              }}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-rose-500/90 px-4 text-[13px] text-white shadow-sm shadow-rose-950/40 transition-colors hover:bg-rose-500 focus-visible:ring-rose-300/60"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : null}
              {t('formWindow.confirmYes')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Footer icon strip ────────────────────────────────────────────────────

type FooterTint = 'sky' | 'emerald' | 'rose' | 'slate';

/** Static tint recipes — Tailwind needs literal classes to emit them. */
const FOOTER_TINTS: Record<FooterTint, string> = {
  sky: 'bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 hover:shadow-[0_0_16px_-4px_rgba(56,189,248,0.55)]',
  emerald:
    'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 hover:shadow-[0_0_16px_-4px_rgba(52,211,153,0.55)]',
  rose: 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 hover:shadow-[0_0_16px_-4px_rgba(251,113,133,0.55)]',
  slate:
    'bg-slate-500/20 text-slate-300 hover:bg-slate-400/30 hover:shadow-[0_0_16px_-4px_rgba(148,163,184,0.5)]',
};

const FOOTER_BUTTON =
  'relative flex h-8 w-8 items-center justify-center rounded-md ring-1 ring-white/10 transition-all duration-150 hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

interface DataListFooterProps {
  isBusy: boolean;
  isRefreshing: boolean;
  hasSelection: boolean;
  hasSingleSelection: boolean;
  isFilterRowVisible: boolean;
  isColumnsOpen: boolean;
  hiddenColumnsCount: number;
  onRefresh: () => void;
  onPrint: () => void;
  onExport: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNew: () => void;
  onToggleFilter: () => void;
  onToggleColumn: (fieldKey: string) => void;
  onShowAllColumns: () => void;
  onColumnsOpenChange: (open: boolean) => void;
  sortedFields: FormFieldDef[];
  hiddenColumns: Set<string>;
  fieldLocale: Locale;
}

interface FooterAction {
  key: string;
  tint: FooterTint;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled: boolean;
  spinning?: boolean;
  pressed?: boolean;
}

/**
 * The ERP-style footer of the records list — the icon strip from the
 * reference screenshot: بازخوانی، چاپ، خروجی، مشاهده، اصلاح، حذف، جدید +
 * انتخاب ستون‌ها و نوار فیلتر (with a subtle separator before them).
 */
function DataListFooter({
  isBusy,
  isRefreshing,
  hasSelection,
  hasSingleSelection,
  isFilterRowVisible,
  isColumnsOpen,
  hiddenColumnsCount,
  onRefresh,
  onPrint,
  onExport,
  onView,
  onEdit,
  onDelete,
  onNew,
  onToggleFilter,
  onToggleColumn,
  onShowAllColumns,
  onColumnsOpenChange,
  sortedFields,
  hiddenColumns,
  fieldLocale,
}: DataListFooterProps) {
  const { t } = useTranslation();

  const actions: FooterAction[] = [
    {
      key: 'refresh',
      tint: 'sky',
      icon: isRefreshing ? Loader2 : RefreshCw,
      label: t('dataList.actionRefresh'),
      onClick: onRefresh,
      disabled: isBusy,
      spinning: isRefreshing,
    },
    {
      key: 'print',
      tint: 'sky',
      icon: Printer,
      label: t('dataList.actionPrint'),
      onClick: onPrint,
      disabled: false,
    },
    {
      key: 'export',
      tint: 'slate',
      icon: FileDown,
      label: t('dataList.actionExport'),
      onClick: onExport,
      disabled: false,
    },
    {
      key: 'view',
      tint: 'slate',
      icon: Link2,
      label: t('dataList.actionView'),
      onClick: onView,
      disabled: !hasSingleSelection || isBusy,
    },
    {
      key: 'edit',
      tint: 'emerald',
      icon: FilePen,
      label: t('dataList.actionEdit'),
      onClick: onEdit,
      disabled: !hasSingleSelection || isBusy,
    },
    {
      key: 'delete',
      tint: 'rose',
      icon: FileX2,
      label: t('dataList.actionDelete'),
      onClick: onDelete,
      disabled: !hasSelection || isBusy,
    },
    {
      key: 'new',
      tint: 'sky',
      icon: FilePlus2,
      label: t('dataList.actionNew'),
      onClick: onNew,
      disabled: false,
    },
  ];

  const renderButton = (action: FooterAction) => (
    <button
      key={action.key}
      type="button"
      title={action.label}
      aria-label={action.label}
      aria-pressed={action.pressed ? true : undefined}
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        FOOTER_BUTTON,
        FOOTER_TINTS[action.tint],
        action.pressed &&
          'bg-slate-400/30 text-slate-100 ring-slate-300/40',
      )}
    >
      {createElement(action.icon, {
        className: cn('h-4 w-4', action.spinning && 'animate-spin'),
        strokeWidth: 2,
      })}
    </button>
  );

  return (
    <div className="flex shrink-0 items-center gap-1 border-t border-white/10 bg-white/[0.02] px-2 py-1.5">
      {actions.map(renderButton)}

      {/* Column chooser */}
      <Popover open={isColumnsOpen} onOpenChange={onColumnsOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title={t('dataList.actionColumns')}
            aria-label={t('dataList.actionColumns')}
            aria-expanded={isColumnsOpen}
            className={cn(
              FOOTER_BUTTON,
              FOOTER_TINTS.slate,
              isColumnsOpen && 'bg-slate-400/30 text-slate-100 ring-slate-300/40',
            )}
          >
            <Columns3 className="h-4 w-4" strokeWidth={2} />
            {hiddenColumnsCount > 0 && (
              <span
                className="absolute -top-1 -end-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-sky-500 px-0.5 text-[9px] font-bold text-white"
                aria-hidden="true"
              >
                {hiddenColumnsCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={8}
          className="w-60 overflow-hidden rounded-xl border-white/10 bg-[#1b1e26]/[0.97] p-1.5 text-white shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-2 px-2 pb-1.5 pt-1">
            <span className="text-[11px] font-semibold text-white/70">
              {t('dataList.actionColumns')}
            </span>
            <button
              type="button"
              onClick={onShowAllColumns}
              className="rounded-md px-1.5 py-0.5 text-[10.5px] text-sky-300 transition-colors hover:bg-sky-500/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400/50"
            >
              {t('dataList.showAllColumns')}
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto [scrollbar-width:thin]">
            {sortedFields.map((field) => {
              const isHidden = hiddenColumns.has(field.fieldKey);
              return (
                <button
                  key={field.fieldKey}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={!isHidden}
                  onClick={() => onToggleColumn(field.fieldKey)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-[12px] text-white/80 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
                >
                  <span
                    className={cn(
                      'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors',
                      isHidden
                        ? 'border-white/25 bg-white/[0.04]'
                        : 'border-sky-300/70 bg-sky-500/80 text-white',
                    )}
                  >
                    {!isHidden && (
                      <Check className="h-2.5 w-2.5" strokeWidth={3.2} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {fieldLabel(field, fieldLocale)}
                  </span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Filter row toggle */}
      <button
        type="button"
        title={t('dataList.actionFilter')}
        aria-label={t('dataList.actionFilter')}
        aria-pressed={isFilterRowVisible}
        onClick={onToggleFilter}
        className={cn(
          FOOTER_BUTTON,
          FOOTER_TINTS.slate,
          isFilterRowVisible && 'bg-slate-400/30 text-slate-100 ring-slate-300/40',
        )}
      >
        <Filter className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

