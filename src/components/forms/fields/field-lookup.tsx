'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api-client';
import { useTranslation } from '@/i18n';
import type { FormFieldValue, LookupOption } from '@/types/forms';
import { cn } from '@/lib/utils';
import { controlClasses } from '../form-styles';
import { useDismiss } from '../use-dismiss';

/** Options cache shared by every lookup field of the session. */
const lookupCache = new Map<string, LookupOption[]>();
const lookupInflight = new Map<string, Promise<LookupOption[]>>();

async function fetchOptions(url: string): Promise<LookupOption[]> {
  const cached = lookupCache.get(url);
  if (cached) return cached;
  const inflight = lookupInflight.get(url);
  if (inflight) return inflight;
  const promise = apiFetch<{ data: LookupOption[] }>(url)
    .then((payload) => {
      const list = payload.data ?? [];
      lookupCache.set(url, list);
      lookupInflight.delete(url);
      return list;
    })
    .catch((error) => {
      lookupInflight.delete(url);
      throw error;
    });
  lookupInflight.set(url, promise);
  return promise;
}

interface LookupFieldProps {
  id?: string;
  /** Selected option id (value stored in the record). */
  value: string | null;
  onChange: (value: FormFieldValue) => void;
  disabled?: boolean;
  /** Lookup group key of the field definition. */
  lookupKey: string;
  /** Base path ending in `/lookups`, e.g. `/api/modules/settings/forms/account-class/lookups`. */
  urlBase: string;
}

/**
 * Lookup control: an input-like trigger + a square "+" opener that shows
 * a glass popover with search, keyboard navigation and a clear action.
 * Options are fetched once per lookup key and cached module-level.
 */
export function LookupField({
  id,
  value,
  onChange,
  disabled,
  lookupKey,
  urlBase,
}: LookupFieldProps) {
  const { locale, t } = useTranslation();
  const listboxId = useId();
  const [options, setOptions] = useState<LookupOption[] | null>(
    () => lookupCache.get(`${urlBase}/${lookupKey}`) ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useDismiss<HTMLDivElement>(open, useCallback(() => setOpen(false), []));

  const load = useCallback(async () => {
    if (!urlBase || !lookupKey) return;
    setIsLoading(true);
    setError(false);
    try {
      const list = await fetchOptions(
        `${urlBase}/${encodeURIComponent(lookupKey)}`,
      );
      setOptions(list);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [urlBase, lookupKey]);

  // Resolve the selected option's label (and warm the cache) early.
  useEffect(() => {
    void load();
  }, [load]);

  const optionLabel = useCallback(
    (option: LookupOption) =>
      locale === 'fa' ? option.label : option.labelEn ?? option.label,
    [locale],
  );

  const selected = useMemo(
    () =>
      options?.find(
        (option) => option.id === value || option.code === value,
      ) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const list = options ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (option) =>
        option.code.toLowerCase().includes(needle) ||
        option.label.toLowerCase().includes(needle) ||
        (option.labelEn ?? '').toLowerCase().includes(needle),
    );
  }, [options, query]);

  const openPanel = () => {
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
    if (!options) void load();
  };

  const select = (option: LookupOption) => {
    // Records persist the stable option code (matches the seeded data
    // convention; option ids are internal DB keys).
    onChange(option.code);
    setOpen(false);
  };

  const clear = () => {
    onChange(null);
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
      if (target) select(target);
    } else if (event.key === 'Escape') {
      event.stopPropagation();
      setOpen(false);
    }
  };

  const selectedLabel = selected
    ? optionLabel(selected)
    : value
      ? String(value)
      : null;

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openPanel())}
          className={`${controlClasses} flex items-center justify-between gap-2 pe-2 text-start`}
        >
          <span
            className={cn(
              'min-w-0 flex-1 truncate',
              selectedLabel ? 'text-white' : 'text-white/30',
            )}
          >
            {selectedLabel ?? t('formWindow.selectPlaceholder')}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-white/35" />
        </button>

        <button
          type="button"
          title={t('formWindow.selectPlaceholder')}
          aria-label={t('formWindow.selectPlaceholder')}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openPanel())}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 ring-1 ring-white/10 transition-all duration-150 hover:bg-sky-500/30 hover:shadow-[0_0_16px_-4px_rgba(56,189,248,0.6)] active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
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
            {/* Search */}
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

            {/* Options */}
            <div
              id={listboxId}
              role="listbox"
              aria-label={t('formWindow.selectPlaceholder')}
              className="max-h-64 overflow-y-auto py-1 [scrollbar-width:thin]"
            >
              {isLoading &&
                !options?.length &&
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={`lookup-skeleton-${index}`} className="px-3 py-1.5">
                    <Skeleton className="h-6 w-full rounded-md bg-white/[0.06]" />
                  </div>
                ))}

              {error && !options?.length && (
                <p className="px-3 py-4 text-center text-xs text-red-200/80">
                  {t('formWindow.lookupError')}
                </p>
              )}

              {!isLoading && !error && !filtered.length && (
                <p className="px-3 py-4 text-center text-xs text-white/40">
                  {t('formWindow.noMatch')}
                </p>
              )}

              {filtered.map((option, index) => {
                const isSelected = option.id === value || option.code === value;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => select(option)}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-1.5 text-start text-[13px] transition-colors',
                      isActive
                        ? 'bg-sky-500/15 text-white'
                        : 'text-white/80 hover:bg-white/[0.05]',
                      isSelected && !isActive && 'bg-white/[0.04]',
                    )}
                  >
                    <span className="shrink-0 rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-white/60">
                      {option.code}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {optionLabel(option)}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Clear */}
            {value !== null && value !== '' && (
              <div className="border-t border-white/10 p-1.5">
                <button
                  type="button"
                  onClick={clear}
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
  );
}
