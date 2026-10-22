'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { motion } from 'framer-motion';
import { Check, Filter, ListFilter, Loader2, Search, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/i18n';
import { apiFetch, SessionExpiredError } from '@/lib/api-client';
import type { FormFieldDef, FieldValueOption } from '@/types/forms';
import { cn } from '@/lib/utils';

/**
 * FilterValuesDropdown — the beautiful value-picker of the data-list
 * filter row («دراپ‌داون مقادیر فیلتر»).
 *
 * Clicking a column filter cell opens this panel: the distinct display
 * values of that column (fetched SERVER-SIDE from
 * `…/fields/:fieldKey/values`) are listed with record counts so the user
 * can see the field's data and pick one item (single mode) or several
 * items (multi mode). The picked values are applied as a server-side
 * `op: 'in'` filter — the grid itself never filters client-side.
 *
 * Selection mode is optional per form/field (`FormFieldDef.filterMode`;
 * `undefined` → multi).
 */

/** Anchor geometry captured from the trigger button (fixed positioning). */
export interface FilterValuesAnchor {
  rect: DOMRect;
  left: number;
  openUp: boolean;
}

interface FilterValuesDropdownProps {
  /** Column definition — drives the header label + selection mode. */
  field: FormFieldDef;
  anchor: FilterValuesAnchor;
  /** `GET …/fields/:fieldKey/values?locale=…` (BFF-relative, §3.3). */
  valuesUrl: string;
  /** Cache bucket `moduleKey/formKey/fieldKey/locale`. */
  cacheKey: string;
  /** Currently applied values of the column (`op: 'in'`). */
  selected: string[];
  onApply: (values: string[]) => void;
  onClose: () => void;
}

/** Column-width of the panel — kept in sync with the trigger clamping. */
export const FILTER_VALUES_PANEL_WIDTH = 272;
/** List height cap (§8.2 — long lists scroll with a custom scrollbar). */
const LIST_MAX_HEIGHT = 288;
/** Module-level response cache — reopened dropdowns render instantly. */
const valuesCache = new Map<string, FieldValueOption[]>();
const CACHE_CAP = 48;

/**
 * Same normalization the backend applies to filter text: Persian/Arabic
 * digits → latin, Arabic yeh/kaf → Persian, ZWNJ → space, lowercase.
 */
function normalizeQuery(value: string): string {
  return value
    .toLowerCase()
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ')
    .trim();
}

export function FilterValuesDropdown({
  field,
  anchor,
  valuesUrl,
  cacheKey,
  selected,
  onApply,
  onClose,
}: FilterValuesDropdownProps) {
  const { t, tf, formatNumber } = useTranslation();
  const multi = field.filterMode !== 'single';

  /** Draft selection — committed on «اعمال» (multi) or row click (single). */
  const [draft, setDraft] = useState<Set<string>>(() => new Set(selected));
  const [options, setOptions] = useState<FieldValueOption[] | null>(() =>
    cacheKey ? (valuesCache.get(cacheKey) ?? null) : null,
  );
  const [isLoading, setIsLoading] = useState(options === null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');

  const panelRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // ── Fetch the distinct values (server-side, cached per column) ──
  // Cache hits were resolved synchronously at useState initialization —
  // only real fetches run through this effect.
  useEffect(() => {
    if (options !== null) return;
    let alive = true;
    apiFetch<{ data: FieldValueOption[] }>(valuesUrl)
      .then((payload) => {
        if (!alive) return;
        const data = payload.data ?? [];
        if (cacheKey) {
          if (valuesCache.size >= CACHE_CAP) {
            const oldest = valuesCache.keys().next().value;
            if (oldest !== undefined) valuesCache.delete(oldest);
          }
          valuesCache.set(cacheKey, data);
        }
        setOptions(data);
      })
      .catch((error) => {
        if (!alive || error instanceof SessionExpiredError) return;
        setLoadError(
          error instanceof Error && error.message
            ? error.message
            : t('dataList.filterValuesLoadError'),
        );
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [cacheKey, options, t, valuesUrl, attempt]);

  // ── Dismiss on outside click / Escape / window resize / outer scroll ──
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        (target.closest('[data-filter-values-button]') ||
          target.closest('[data-filter-op-button]'))
      ) {
        return;
      }
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    // Inner list scrolling must not close the panel — only outer scrolls do.
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && panelRef.current?.contains(event.target)) {
        return;
      }
      onClose();
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onClose);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onClose);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [onClose]);

  /** Options surviving the search box (normalized, mirror of backend). */
  const shownOptions = useMemo(() => {
    if (!options) return [];
    const needle = normalizeQuery(query);
    if (!needle) return options;
    return options.filter((option) =>
      normalizeQuery(option.value).includes(needle),
    );
  }, [options, query]);

  const toggleDraft = useCallback((value: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }, []);

  const selectShown = useCallback(() => {
    setDraft((prev) => {
      const next = new Set(prev);
      for (const option of shownOptions) next.add(option.value);
      return next;
    });
  }, [shownOptions]);

  const applyDraft = useCallback(() => {
    onApply(multi ? [...draft] : [...draft].slice(0, 1));
  }, [draft, multi, onApply]);

  /** ArrowUp/ArrowDown roving focus across the value rows. */
  const onListKeyDown = useCallback((event: ReactKeyboardEvent) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const rows = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-value-row]',
      ) ?? [],
    );
    if (!rows.length) return;
    event.preventDefault();
    const index = rows.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    const nextIndex =
      event.key === 'ArrowDown'
        ? Math.min(rows.length - 1, index + 1)
        : Math.max(0, index - 1);
    rows[nextIndex === -1 ? 0 : nextIndex].focus();
  }, []);

  const hasSelection = draft.size > 0;
  const singleActive = !multi && selected.length > 0;

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label={`${t('dataList.filterValuesAria')} — ${field.label}`}
      initial={{ opacity: 0, y: anchor.openUp ? 4 : -4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: anchor.openUp ? 4 : -4, scale: 0.97 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      style={
        anchor.openUp
          ? {
              bottom: window.innerHeight - anchor.rect.top + 4,
              left: anchor.left,
            }
          : {
              top: anchor.rect.bottom + 4,
              left: anchor.left,
            }
      }
      className="fixed z-[80] flex w-[272px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1b1e26]/[0.97] shadow-2xl shadow-black/50 backdrop-blur-xl"
    >
      {/* ── Header: field label + selection-mode hint ── */}
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-2.5 py-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/25">
          <Filter className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-white/90">
          {field.label}
        </span>
        <span
          className={cn(
            'shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-medium ring-1',
            multi
              ? 'bg-sky-500/10 text-sky-300 ring-sky-400/25'
              : 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/25',
          )}
        >
          {multi
            ? t('dataList.filterValuesMultiHint')
            : t('dataList.filterValuesSingleHint')}
        </span>
      </div>

      {/* ── Search box ── */}
      <div className="px-2.5 pb-1.5 pt-2">
        <div className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 transition-colors focus-within:border-sky-400/50">
          <Search className="h-3.5 w-3.5 shrink-0 text-white/35" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('dataList.filterValuesSearch')}
            aria-label={t('dataList.filterValuesSearch')}
            className="h-full min-w-0 flex-1 bg-transparent text-[11.5px] text-white placeholder:text-white/30 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('dataList.filterValuesClear')}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Value list ── */}
      <div
        ref={listRef}
        onKeyDown={onListKeyDown}
        className="min-h-[64px] overflow-y-auto px-1.5 pb-1.5 [scrollbar-width:thin]"
        style={{ maxHeight: LIST_MAX_HEIGHT }}
      >
        {isLoading ? (
          <div className="space-y-1 p-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={`filter-value-skeleton-${index}`}
                className="h-8 w-full rounded-lg bg-white/[0.05]"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-2 px-3 py-5 text-center">
            <p className="text-[11.5px] leading-relaxed text-red-200/90">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() => {
                setLoadError(null);
                setIsLoading(true);
                setAttempt((value) => value + 1);
              }}
              className="flex items-center gap-1.5 rounded-md bg-white/[0.07] px-2.5 py-1 text-[11px] text-white/80 transition-colors hover:bg-white/[0.12]"
            >
              <Loader2 className="h-3 w-3" />
              {t('common.retry')}
            </button>
          </div>
        ) : !options || options.length === 0 ? (
          <p className="px-3 py-5 text-center text-[11.5px] leading-relaxed text-white/45">
            {t('dataList.filterValuesEmpty')}
          </p>
        ) : shownOptions.length === 0 ? (
          <p className="px-3 py-5 text-center text-[11.5px] leading-relaxed text-white/45">
            {t('dataList.filterValuesNoMatch')}
          </p>
        ) : (
          shownOptions.map((option) => {
            const isPicked = draft.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                data-value-row="true"
                role={multi ? 'menuitemcheckbox' : 'menuitemradio'}
                aria-checked={isPicked}
                title={option.value}
                onClick={() => (multi ? toggleDraft(option.value) : onApply([option.value]))}
                className={cn(
                  'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400/50',
                  isPicked
                    ? 'bg-sky-500/[0.16] text-white'
                    : 'text-white/80 hover:bg-white/[0.06]',
                )}
              >
                {multi ? (
                  <span
                    className={cn(
                      'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors',
                      isPicked
                        ? 'border-sky-300/70 bg-sky-500/80 text-white'
                        : 'border-white/25 bg-white/[0.04] group-hover:border-white/50',
                    )}
                  >
                    {isPicked && (
                      <Check className="h-2.5 w-2.5" strokeWidth={3.2} />
                    )}
                  </span>
                ) : (
                  <span
                    className={cn(
                      'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors',
                      isPicked
                        ? 'border-emerald-300/70 bg-emerald-500/80'
                        : 'border-white/25 bg-white/[0.04] group-hover:border-white/50',
                    )}
                  >
                    {isPicked && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-[11.5px]">
                  {option.value}
                </span>
                <span
                  className="shrink-0 rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[9.5px] tabular-nums text-white/55"
                  title={formatNumber(option.count)}
                >
                  {formatNumber(option.count)}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* ── Footer: quick actions + apply ── */}
      {(multi || hasSelection || singleActive) && (
        <div className="flex items-center gap-1.5 border-t border-white/[0.07] bg-white/[0.02] px-2 py-1.5">
          <span className="flex min-w-0 flex-1 items-center gap-1 text-[10.5px] text-white/55">
            <ListFilter className="h-3 w-3 shrink-0 text-white/35" />
            <span className="truncate">
              {hasSelection
                ? tf('dataList.filterValuesSelectedCount', {
                    count: formatNumber(draft.size),
                  })
                : tf('dataList.filterValuesCount', {
                    count: formatNumber(options?.length ?? 0),
                  })}
            </span>
          </span>
          {multi && shownOptions.length > 0 && (
            <button
              type="button"
              onClick={selectShown}
              className="shrink-0 rounded-md px-1.5 py-1 text-[10.5px] text-sky-300 transition-colors hover:bg-sky-500/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400/50"
            >
              {t('dataList.filterValuesSelectShown')}
            </button>
          )}
          {(hasSelection || singleActive) && (
            <button
              type="button"
              onClick={() => onApply([])}
              className="shrink-0 rounded-md px-1.5 py-1 text-[10.5px] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              {t('dataList.filterValuesClear')}
            </button>
          )}
          {multi && (
            <button
              type="button"
              disabled={!hasSelection}
              onClick={applyDraft}
              className={cn(
                'flex h-7 shrink-0 items-center gap-1 rounded-md px-2.5 text-[11px] font-medium text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300/60',
                hasSelection
                  ? 'bg-sky-500/90 hover:bg-sky-500'
                  : 'pointer-events-none opacity-40',
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
              {t('dataList.filterValuesApply')}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
