'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  createElement,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
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
  X,
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
  ListColumnFilter,
  ListFilterOp,
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
import {
  FilterValuesDropdown,
  FILTER_VALUES_PANEL_WIDTH,
} from './filter-values-dropdown';
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

// ── Resizable grid geometry (px) ──
/** Fixed width of the leading selection column. */
const CHECKBOX_COL_WIDTH = 40;
/** Width used for a data column that has no measured/custom width yet. */
const DEFAULT_COLUMN_WIDTH = 150;
/** Drag/keyboard clamps — beyond the max the grid scrolls horizontally. */
const MIN_COLUMN_WIDTH = 64;
const MAX_COLUMN_WIDTH = 1200;

/**
 * Read the rendered width of every data column from its header cell.
 * Used to freeze the whole grid the first time the user grabs a handle,
 * so resizing one column never reflows its neighbours.
 */
function measureColumns(table: HTMLTableElement | null): Record<string, number> | null {
  if (!table) return null;
  const measured: Record<string, number> = {};
  table
    .querySelectorAll<HTMLTableCellElement>('th[data-col]')
    .forEach((th) => {
      const key = th.dataset.col;
      if (key) measured[key] = th.getBoundingClientRect().width;
    });
  return Object.keys(measured).length ? measured : null;
}

/** Per-column filter state: operator + typed value (applied server-side). */
interface ColumnFilterState {
  op: ListFilterOp;
  value: string;
  /** Picked dropdown values — set when `op === 'in'`. */
  values?: string[];
}

/** Operators driven by the inline text input of the filter cell. */
const TEXT_FILTER_OPS: ReadonlySet<ListFilterOp> = new Set([
  'contains',
  'notContains',
  'startsWith',
  'endsWith',
  'equals',
]);

/**
 * Operator menu items — order mirrors the reference screenshot:
 * تمام / دارای مقدار / بدون مقدار / شروع با / پایان با / برابر با /
 * حاوی نباشد / حاوی تایپ‌شده.
 */
const FILTER_OP_ITEMS: Array<{ op: ListFilterOp; labelKey: string }> = [
  { op: 'all', labelKey: 'dataList.filterOpAll' },
  { op: 'hasValue', labelKey: 'dataList.filterOpHasValue' },
  { op: 'noValue', labelKey: 'dataList.filterOpNoValue' },
  { op: 'startsWith', labelKey: 'dataList.filterOpStartsWith' },
  { op: 'endsWith', labelKey: 'dataList.filterOpEndsWith' },
  { op: 'equals', labelKey: 'dataList.filterOpEquals' },
  { op: 'notContains', labelKey: 'dataList.filterOpNotContains' },
  { op: 'contains', labelKey: 'dataList.filterOpContains' },
];

/** True when a column contributes an effective server-side filter. */
function isColumnFilterActive(filter?: ColumnFilterState): boolean {
  if (!filter) return false;
  if (filter.op === 'hasValue' || filter.op === 'noValue') return true;
  if (filter.op === 'in') return (filter.values?.length ?? 0) > 0;
  return filter.value.trim() !== '';
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
  const { locale, t, tf, formatNumber, direction } = useTranslation();
  const addFormTab = useDesktopStore((s) => s.addFormTab);

  const fallback = useMemo(() => parseListModuleId(moduleId), [moduleId]);
  const moduleKey = list?.moduleKey ?? fallback.moduleKey;
  const formKey = list?.formKey ?? fallback.formKey;
  const basePath =
    moduleKey && formKey ? `/api/modules/${moduleKey}/forms/${formKey}` : null;
  const lookupUrlBase = basePath ? `${basePath}/lookups` : '';

  // ── Data ──
  const [def, setDef] = useState<FormDef | null>(null);
  /** Full dataset of the form (parent-title context + total count). */
  const [allRecords, setAllRecords] = useState<FormRecord[]>([]);
  /** Rows currently displayed — the server-filtered slice. */
  const [records, setRecords] = useState<FormRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  /** True while a debounced server-side filter query is in flight. */
  const [isFiltering, setIsFiltering] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** lookupKey → (option code → label). */
  const [lookupLabels, setLookupLabels] = useState<
    Record<string, Map<string, string>>
  >({});

  // ── View state ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, ColumnFilterState>>({});
  const [isFilterRowVisible, setIsFilterRowVisible] = useState(true);
  /** Open operator menu, anchored to the funnel button of one column. */
  const [filterMenu, setFilterMenu] = useState<{
    fieldKey: string;
    rect: DOMRect;
    left: number;
    openUp: boolean;
  } | null>(null);
  /**
   * Open filter-values dropdown («دراپ‌داون مقادیر فیلتر») anchored to
   * the value trigger of one column — lists the column's distinct values
   * and applies the picked ones as a server-side `op: 'in'` filter.
   */
  const [valueMenu, setValueMenu] = useState<{
    fieldKey: string;
    rect: DOMRect;
    left: number;
    openUp: boolean;
  } | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  /**
   * Explicit px width per data column — `null` = classic auto layout that
   * fills the window. Set on the first resize interaction (all columns are
   * frozen at their rendered widths, then only the grabbed one moves).
   */
  const [columnWidths, setColumnWidths] = useState<Record<string, number> | null>(null);
  /** Field currently being drag-resized (drives cursors + handle hint). */
  const [resizingField, setResizingField] = useState<string | null>(null);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /** Latest values for callbacks that must not re-create on every change. */
  const activeFiltersRef = useRef<ListColumnFilter[]>([]);
  const allRecordsRef = useRef<FormRecord[]>([]);
  const filterSeqRef = useRef(0);
  const filterMenuRef = useRef<HTMLDivElement | null>(null);
  const filterInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const tableRef = useRef<HTMLTableElement | null>(null);

  // ── Loading ──
  /** Records URL with the JSON `?filters=` payload (server-side filtering). */
  const fetchRecordsPage = useCallback(
    async (columns: ListColumnFilter[]): Promise<FormRecord[]> => {
      if (!basePath) return [];
      const params = new URLSearchParams({
        locale,
        // Keep the service-side checkbox display in sync with the grid
        // labels of the active UI locale (used by equals / in operators).
        yesLabel: t('dataList.yes'),
        noLabel: t('dataList.no'),
      });
      if (columns.length) {
        params.set('filters', JSON.stringify(columns));
      }
      const res = await apiFetch<{ data: FormRecord[] }>(
        `${basePath}/records?${params.toString()}`,
      );
      return res.data ?? [];
    },
    [basePath, locale, t],
  );
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

      const all = await fetchRecordsPage([]);
      setAllRecords(all);
      setRecords(all);
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
  }, [basePath, fetchRecordsPage, loadLookups, locale]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshRecords = useCallback(async () => {
    if (!basePath) return;
    setIsRefreshing(true);
    try {
      const next = await fetchRecordsPage([]);
      setAllRecords(next);
      const columns = activeFiltersRef.current;
      // Keep the visible slice consistent with the active column filters.
      const visible = columns.length
        ? await fetchRecordsPage(columns)
        : next;
      setRecords(visible);
      setSelectedIds((prev) => {
        const nextIds = new Set(
          [...prev].filter((id) => visible.some((record) => record.id === id)),
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
  }, [basePath, fetchRecordsPage, t]);

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
    for (const record of allRecords) {
      const raw = titleField ? record.data[titleField.fieldKey] : null;
      map.set(
        record.id,
        raw === null || raw === undefined || raw === ''
          ? record.id
          : String(raw),
      );
    }
    return map;
  }, [parentField, allRecords, sortedFields]);

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

  /**
   * Effective column filters sent to the service as `?filters=` JSON —
   * the grid itself no longer filters client-side.
   */
  const activeFilters = useMemo<ListColumnFilter[]>(
    () =>
      Object.entries(filters)
        .filter(([, filter]) => isColumnFilterActive(filter))
        .map(([field, filter]) =>
          filter.op === 'in'
            ? { field, op: filter.op, value: filter.value, values: filter.values ?? [] }
            : { field, op: filter.op, value: filter.value },
        ),
    [filters],
  );

  useEffect(() => {
    activeFiltersRef.current = activeFilters;
    allRecordsRef.current = allRecords;
  }, [activeFilters, allRecords]);

  // Server-side filtering: debounce typed values, then re-query the service.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (!activeFilters.length) {
        setRecords(allRecordsRef.current);
        setIsFiltering(false);
        return;
      }
      const seq = ++filterSeqRef.current;
      setIsFiltering(true);
      fetchRecordsPage(activeFilters)
        .then((next) => {
          if (filterSeqRef.current !== seq) return;
          setRecords(next);
        })
        .catch((error) => {
          if (filterSeqRef.current !== seq) return;
          if (error instanceof SessionExpiredError) return;
          toast({
            title: t('dataList.loadError'),
            description: error instanceof Error ? error.message : undefined,
            variant: 'destructive',
          });
        })
        .finally(() => {
          if (filterSeqRef.current === seq) setIsFiltering(false);
        });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [activeFilters, fetchRecordsPage, t]);

  /** The displayed rows — already filtered by the service. */
  const filteredRecords = records;

  // ── Column filter operator menu ──
  const toggleFilterMenu = useCallback(
    (fieldKey: string, button: HTMLButtonElement) => {
      // The two popovers are mutually exclusive.
      setValueMenu(null);
      setFilterMenu((prev) => {
        if (prev?.fieldKey === fieldKey) return null;
        const rect = button.getBoundingClientRect();
        const menuWidth = 184;
        const menuHeight = 290;
        return {
          fieldKey,
          rect,
          left: Math.max(
            8,
            Math.min(rect.left, window.innerWidth - menuWidth - 8),
          ),
          openUp:
            rect.bottom + menuHeight > window.innerHeight - 8 &&
            rect.top - menuHeight > 8,
        };
      });
    },
    [],
  );

  /** Opens the filter-values dropdown of one column (value trigger). */
  const toggleValueMenu = useCallback(
    (fieldKey: string, button: HTMLButtonElement) => {
      setFilterMenu(null);
      setValueMenu((prev) => {
        if (prev?.fieldKey === fieldKey) return null;
        const rect = button.getBoundingClientRect();
        const menuHeight = 420;
        return {
          fieldKey,
          rect,
          left: Math.max(
            8,
            Math.min(
              rect.left,
              window.innerWidth - FILTER_VALUES_PANEL_WIDTH - 8,
            ),
          ),
          openUp:
            rect.bottom + menuHeight > window.innerHeight - 8 &&
            rect.top - menuHeight > 8,
        };
      });
    },
    [],
  );

  const setFilterValue = useCallback((fieldKey: string, value: string) => {
    setFilters((prev) => {
      const current = prev[fieldKey];
      // Typing always implies value semantics: a fresh entry (and an entry
      // whose operator carries no value — تمام / دارای مقدار / بدون مقدار)
      // becomes «حاوی تایپ‌شده» so the input is never a dead end.
      const op: ListFilterOp =
        !current || current.op === 'hasValue' || current.op === 'noValue'
          ? 'contains'
          : current.op;
      return { ...prev, [fieldKey]: { op, value } };
    });
  }, []);

  const applyFilterOp = useCallback((fieldKey: string, op: ListFilterOp) => {
    setFilterMenu(null);
    setFilters((prev) => {
      const next = { ...prev };
      if (op === 'all') {
        delete next[fieldKey];
        return next;
      }
      const current = prev[fieldKey];
      next[fieldKey] = {
        op,
        value:
          op === 'hasValue' || op === 'noValue' ? '' : (current?.value ?? ''),
      };
      return next;
    });
    if (TEXT_FILTER_OPS.has(op)) {
      requestAnimationFrame(() => filterInputRefs.current[fieldKey]?.focus());
    }
  }, []);

  /** Clears one column filter (the × inside the trigger cell). */
  const clearColumnFilter = useCallback((fieldKey: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  }, []);

  /**
   * Commits the dropdown selection of one column as a server-side
   * `op: 'in'` filter (empty selection clears the column filter).
   */
  const applyColumnValues = useCallback(
    (fieldKey: string, values: string[]) => {
      setValueMenu(null);
      setFilters((prev) => {
        const next = { ...prev };
        if (!values.length) {
          delete next[fieldKey];
          return next;
        }
        next[fieldKey] = { op: 'in', value: '', values };
        return next;
      });
    },
    [],
  );

  // Dismiss the operator menu on outside click / Escape / scroll / resize.
  useEffect(() => {
    if (!filterMenu) return;
    const close = () => setFilterMenu(null);
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (filterMenuRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest('[data-filter-op-button]')
      ) {
        return;
      }
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [filterMenu]);

  // ── Column resize (mouse + keyboard) ──
  const isFixedLayout = columnWidths !== null;
  const fixedTotalWidth = useMemo(() => {
    if (!columnWidths) return 0;
    const dataSum = visibleFields.reduce(
      (sum, field) =>
        sum + (columnWidths[field.fieldKey] ?? DEFAULT_COLUMN_WIDTH),
      0,
    );
    return CHECKBOX_COL_WIDTH + dataSum;
  }, [columnWidths, visibleFields]);

  const beginColumnResize = useCallback(
    (fieldKey: string, event: ReactMouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      // Freeze every column at its current rendered width so the drag
      // changes ONLY the grabbed column (no neighbour reflow).
      const measured = measureColumns(tableRef.current);
      if (!measured) return;
      const startWidth = measured[fieldKey] ?? DEFAULT_COLUMN_WIDTH;
      setColumnWidths(measured);
      setResizingField(fieldKey);
      // The handle sits on the inline-end edge: in RTL that edge grows
      // leftwards, so the clientX delta flips sign.
      const resizeDir = direction === 'rtl' ? -1 : 1;
      const startX = event.clientX;
      const onMove = (moveEvent: MouseEvent) => {
        const next = Math.round(
          startWidth + (moveEvent.clientX - startX) * resizeDir,
        );
        const clamped = Math.min(
          MAX_COLUMN_WIDTH,
          Math.max(MIN_COLUMN_WIDTH, next),
        );
        setColumnWidths((prev) =>
          prev ? { ...prev, [fieldKey]: clamped } : prev,
        );
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        document.body.style.userSelect = '';
        setResizingField(null);
      };
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [direction],
  );

  /** Keyboard resize (Arrow keys) — freezes the grid on first use too. */
  const nudgeColumnWidth = useCallback((fieldKey: string, sign: 1 | -1) => {
    setColumnWidths((prev) => {
      const base = prev ?? measureColumns(tableRef.current) ?? {};
      const current = base[fieldKey] ?? DEFAULT_COLUMN_WIDTH;
      const next = Math.min(
        MAX_COLUMN_WIDTH,
        Math.max(MIN_COLUMN_WIDTH, current + sign * 24),
      );
      return { ...base, [fieldKey]: next };
    });
  }, []);

  /** Double-click / reset back to the auto-filling layout. */
  const resetColumnWidths = useCallback(() => setColumnWidths(null), []);

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
    (record: FormRecord, event: ReactMouseEvent<HTMLTableRowElement>) => {
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
  }, [cellText, records, formKey, locale, t, visibleFields]);

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
    : tf('dataList.recordCount', { count: formatNumber(allRecords.length) });

  const accentColor = def?.accentColor || DEFAULT_FORM_ACCENT;
  const hasActiveFilters = activeFilters.length > 0;

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
        <div
          className={cn(
            'h-full overflow-auto transition-opacity duration-200 [scrollbar-width:thin]',
            isFiltering && 'opacity-50',
            resizingField && 'cursor-col-resize select-none',
          )}
        >
          <table
            ref={tableRef}
            className={cn(
              'border-separate border-spacing-0 text-[12px]',
              isFixedLayout ? 'table-fixed' : 'w-full min-w-max',
            )}
            style={isFixedLayout ? { width: fixedTotalWidth } : undefined}
          >
            {isFixedLayout && (
              <colgroup>
                <col style={{ width: CHECKBOX_COL_WIDTH }} />
                {visibleFields.map((field) => (
                  <col
                    key={`col-${field.fieldKey}`}
                    style={{
                      width:
                        columnWidths?.[field.fieldKey] ?? DEFAULT_COLUMN_WIDTH,
                    }}
                  />
                ))}
              </colgroup>
            )}
            <thead>
              <tr>
                <th
                  className={cn(
                    'sticky top-0 z-30 h-9 border-b border-white/10 bg-[#1a1d26] px-2',
                    !isFixedLayout && 'w-10',
                  )}
                >
                  <RowCheckbox
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    label={t('dataList.selectAll')}
                  />
                </th>
                {visibleFields.map((field) => (
                  <th
                    key={field.fieldKey}
                    data-col={field.fieldKey}
                    scope="col"
                    className={cn(
                      'group/th sticky top-0 z-30 h-9 border-b border-white/10 bg-[#1a1d26] px-3 text-center align-middle text-[11.5px] font-bold leading-tight text-white/85',
                      !isFixedLayout && 'min-w-[130px] max-w-[260px]',
                    )}
                  >
                    <span className="line-clamp-1" title={fieldLabel(field, locale)}>
                      {fieldLabel(field, locale)}
                    </span>
                    <button
                      type="button"
                      aria-label={`${t('dataList.columnResizeHint')} — ${fieldLabel(field, locale)}`}
                      title={t('dataList.columnResizeHint')}
                      onMouseDown={(event) =>
                        beginColumnResize(field.fieldKey, event)
                      }
                      onDoubleClick={resetColumnWidths}
                      onKeyDown={(event) => {
                        if (
                          event.key !== 'ArrowLeft' &&
                          event.key !== 'ArrowRight'
                        )
                          return;
                        event.preventDefault();
                        const growsToEnd =
                          event.key ===
                          (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
                        nudgeColumnWidth(field.fieldKey, growsToEnd ? 1 : -1);
                      }}
                      className="absolute inset-y-0 end-0 z-10 flex w-2 cursor-col-resize touch-none items-stretch justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sky-400/60"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'h-full w-px transition-colors group-hover/th:bg-sky-400/60',
                          resizingField === field.fieldKey
                            ? 'bg-sky-400'
                            : 'bg-white/10',
                        )}
                      />
                    </button>
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
                  {visibleFields.map((field) => {
                    const columnFilter = filters[field.fieldKey];
                    const isActive = isColumnFilterActive(columnFilter);
                    // Text operators keep the inline input; every other
                    // state (none / hasValue / noValue / picked values)
                    // shows the value-dropdown trigger («فیلتر...»).
                    const isTextOp = columnFilter
                      ? TEXT_FILTER_OPS.has(columnFilter.op)
                      : false;
                    const pickedValues =
                      columnFilter?.op === 'in'
                        ? (columnFilter.values ?? [])
                        : [];
                    const extraCount = Math.max(0, pickedValues.length - 1);
                    const opLabel =
                      columnFilter?.op === 'hasValue'
                        ? t('dataList.filterOpHasValue')
                        : columnFilter?.op === 'noValue'
                          ? t('dataList.filterOpNoValue')
                          : null;
                    const isValueMenuOpen =
                      valueMenu?.fieldKey === field.fieldKey;
                    return (
                      <th
                        key={`filter-${field.fieldKey}`}
                        className="sticky top-9 z-20 h-8 border-b border-white/10 bg-[#171a22] px-1.5 align-middle"
                      >
                        <div
                          className={cn(
                            'flex items-center gap-1 rounded-md border bg-white/[0.04] px-1.5 transition-colors',
                            isActive
                              ? 'border-sky-400/50'
                              : 'border-white/10 focus-within:border-sky-400/50',
                          )}
                        >
                          <button
                            type="button"
                            data-filter-op-button="true"
                            title={t('dataList.filterMenuAria')}
                            aria-label={t('dataList.filterMenuAria')}
                            aria-haspopup="menu"
                            aria-expanded={
                              filterMenu?.fieldKey === field.fieldKey
                            }
                            onClick={(event) =>
                              toggleFilterMenu(
                                field.fieldKey,
                                event.currentTarget,
                              )
                            }
                            className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400/60',
                              isActive
                                ? 'bg-sky-500/25 text-sky-300'
                                : 'text-white/30 hover:bg-white/10 hover:text-white/80',
                            )}
                          >
                            <Filter className="h-3 w-3" />
                          </button>
                          {isTextOp ? (
                            <input
                              ref={(element) => {
                                filterInputRefs.current[field.fieldKey] = element;
                              }}
                              type="text"
                              value={columnFilter?.value ?? ''}
                              onChange={(event) =>
                                setFilterValue(field.fieldKey, event.target.value)
                              }
                              placeholder={t('dataList.filterPlaceholder')}
                              aria-label={fieldLabel(field, locale)}
                              className="h-6 w-full min-w-0 bg-transparent text-[11px] text-white placeholder:text-white/25 focus:outline-none"
                            />
                          ) : (
                            <>
                              <button
                                type="button"
                                data-filter-values-button="true"
                                title={t('dataList.filterValuesAria')}
                                aria-label={`${t('dataList.filterValuesAria')} — ${fieldLabel(field, locale)}`}
                                aria-haspopup="dialog"
                                aria-expanded={isValueMenuOpen}
                                onClick={(event) =>
                                  toggleValueMenu(
                                    field.fieldKey,
                                    event.currentTarget,
                                  )
                                }
                                className="flex h-6 min-w-0 flex-1 items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400/60"
                              >
                                <span
                                  className={cn(
                                    'min-w-0 flex-1 truncate text-start text-[11px]',
                                    pickedValues.length
                                      ? 'text-sky-200'
                                      : opLabel
                                        ? 'text-white/70'
                                        : 'text-white/45',
                                  )}
                                >
                                  {pickedValues.length
                                    ? pickedValues[0]
                                    : (opLabel ??
                                      t('dataList.filterPlaceholder'))}
                                </span>
                                {extraCount > 0 && (
                                  <span
                                    className="shrink-0 rounded-full bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-sky-200"
                                    aria-hidden="true"
                                  >
                                    +{formatNumber(extraCount)}
                                  </span>
                                )}
                                <ChevronDown
                                  className={cn(
                                    'h-3 w-3 shrink-0 transition-colors',
                                    isValueMenuOpen
                                      ? 'text-sky-300'
                                      : 'text-white/35',
                                  )}
                                />
                              </button>
                              {isActive && (
                                <button
                                  type="button"
                                  title={t('dataList.clearFilters')}
                                  aria-label={`${t('dataList.clearFilters')} — ${fieldLabel(field, locale)}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setValueMenu(null);
                                    clearColumnFilter(field.fieldKey);
                                  }}
                                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </th>
                    );
                  })}
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
                            className={cn(
                              'h-8 truncate border-b border-white/[0.05] px-3 text-center text-[10px] tabular-nums text-white/80',
                              !isFixedLayout && 'max-w-[260px]',
                            )}
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
            {allRecords.length === 0 ? (
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
            isBusy={isLoading || isRefreshing || isDeleting || isFiltering}
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

      {/* Column filter operator menu — the funnel-click popup. */}
      <AnimatePresence>
        {filterMenu && (
          <motion.div
            ref={filterMenuRef}
            role="menu"
            aria-label={t('dataList.filterMenuAria')}
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.13, ease: 'easeOut' }}
            className="fixed z-[80] min-w-[176px] overflow-hidden rounded-xl border border-white/10 bg-[#1b1e26]/[0.97] p-1 shadow-2xl shadow-black/50 backdrop-blur-xl"
            style={
              filterMenu.openUp
                ? {
                    bottom: window.innerHeight - filterMenu.rect.top + 4,
                    left: filterMenu.left,
                  }
                : {
                    top: filterMenu.rect.bottom + 4,
                    left: filterMenu.left,
                  }
            }
          >
            {FILTER_OP_ITEMS.map((item) => {
              const currentOp = filters[filterMenu.fieldKey]?.op ?? 'all';
              const isSelected = currentOp === item.op;
              return (
                <button
                  key={item.op}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => applyFilterOp(filterMenu.fieldKey, item.op)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-[7px] text-start text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400/50',
                    isSelected
                      ? 'bg-sky-500/25 text-sky-100'
                      : 'text-white/80 hover:bg-white/[0.07]',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {t(item.labelKey)}
                  </span>
                  {isSelected && (
                    <Check
                      className="h-3.5 w-3.5 shrink-0 text-sky-300"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter-values dropdown — the beautiful value picker of the
          clicked filter cell («دراپ‌داون مقادیر فیلتر»). */}
      <AnimatePresence>
        {valueMenu &&
          (() => {
            const field = sortedFields.find(
              (item) => item.fieldKey === valueMenu.fieldKey,
            );
            if (!field || !basePath) return null;
            const params = new URLSearchParams({
              locale,
              yesLabel: t('dataList.yes'),
              noLabel: t('dataList.no'),
            });
            const selectedValues =
              filters[field.fieldKey]?.op === 'in'
                ? (filters[field.fieldKey]?.values ?? [])
                : [];
            return (
              <FilterValuesDropdown
                field={field}
                anchor={valueMenu}
                valuesUrl={`${basePath}/fields/${encodeURIComponent(field.fieldKey)}/values?${params.toString()}`}
                cacheKey={`${moduleKey ?? ''}/${formKey ?? ''}/${field.fieldKey}/${locale}`}
                selected={selectedValues}
                onApply={(values) => applyColumnValues(field.fieldKey, values)}
                onClose={() => setValueMenu(null)}
              />
            );
          })()}
      </AnimatePresence>

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

