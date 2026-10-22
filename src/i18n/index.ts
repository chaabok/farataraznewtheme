'use client';

import { useCallback, useMemo } from 'react';
import { MODULES, type ModuleMeta } from '@/lib/modules-registry';
import { useDesktopStore } from '@/store/desktop-store';
import type { Direction, Locale } from '@/types/desktop';
import { DIR_BY_LOCALE, LOCALE_TAGS } from './config';
import { DICTIONARIES } from './dictionaries';

/** Translates `key` with fallback chain: locale → fa → raw key. */
export function translate(locale: Locale, key: string): string {
  return DICTIONARIES[locale][key] ?? DICTIONARIES.fa[key] ?? key;
}

/** Replaces `{placeholder}` tokens inside a translation template. */
export function formatTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** Shared select-option values → dictionary key (module-independent). */
export function optionKey(value: string): string {
  const map: Record<string, string> = {
    draft: 'status.draft',
    sent: 'status.sent',
    paid: 'status.paid',
    pending: 'status.pending',
    approved: 'status.approved',
    received: 'status.received',
    new: 'status.new',
    processing: 'status.processing',
    completed: 'status.completed',
    cancelled: 'status.cancelled',
    receipt: 'status.receipt',
    payment: 'status.payment',
    balance_sheet: 'status.balanceSheet',
    income_statement: 'status.incomeStatement',
    cash_flow: 'status.cashFlow',
  };
  return map[value] ?? `status.${value}`;
}

export interface LocalizedModuleField {
  key: string;
  type: ModuleMeta['fields'][number]['type'];
  required?: boolean;
  unitKey?: ModuleMeta['fields'][number]['unitKey'];
  options?: Array<{ value: string; label: string }>;
  label: string;
}

export interface LocalizedModuleStat {
  key: string;
  kind: ModuleMeta['stats'][number]['kind'];
  label: string;
}

export interface LocalizedModuleMeta {
  id: string;
  name: string;
  recordLabel: string;
  color: string;
  fields: LocalizedModuleField[];
  stats: LocalizedModuleStat[];
}

/**
 * Builds a fully localized view of a module definition: every user-facing
 * string is resolved from the dictionaries while the structure (keys, types,
 * colors) still comes from the single-source registry.
 */
export function getLocalizedModuleMeta(
  id: string,
  locale: Locale,
): LocalizedModuleMeta | null {
  const meta = MODULES[id];
  if (!meta) return null;

  return {
    id: meta.id,
    color: meta.color,
    name: translate(locale, `module.${meta.id}.name`),
    recordLabel: translate(locale, `module.${meta.id}.recordLabel`),
    fields: meta.fields.map((field) => ({
      key: field.key,
      type: field.type,
      required: field.required,
      unitKey: field.unitKey,
      label: translate(locale, `module.${meta.id}.field.${field.key}`),
      options: field.options?.map((option) => ({
        value: option.value,
        label: translate(locale, optionKey(option.value)),
      })),
    })),
    stats: meta.stats.map((stat) => ({
      key: stat.key,
      kind: stat.kind,
      label: translate(locale, `module.${meta.id}.stat.${stat.key}`),
    })),
  };
}

/** Unit suffix for a numeric field, localized. */
export function unitLabel(
  unitKey: 'toman' | 'percent' | undefined,
  t: (key: string) => string,
): string {
  if (unitKey === 'toman') return t('common.toman');
  if (unitKey === 'percent') return t('common.percent');
  return '';
}

export interface Translation {
  locale: Locale;
  direction: Direction;
  localeTag: string;
  t: (key: string) => string;
  tf: (key: string, vars: Record<string, string | number>) => string;
  formatNumber: (value: number) => string;
  formatMoney: (value: number) => string;
  formatDate: (value: Date | string | number) => string;
}

/** React hook bound to the desktop store's active locale. */
export function useTranslation(): Translation {
  const locale = useDesktopStore((s) => s.locale);

  const t = useCallback((key: string) => translate(locale, key), [locale]);
  const tf = useCallback(
    (key: string, vars: Record<string, string | number>) =>
      formatTemplate(translate(locale, key), vars),
    [locale],
  );

  return useMemo(() => {
    const localeTag = LOCALE_TAGS[locale];
    const numberFormatter = new Intl.NumberFormat(localeTag);
    const dateFormatter = new Intl.DateTimeFormat(localeTag, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return {
      locale,
      direction: DIR_BY_LOCALE[locale],
      localeTag,
      t,
      tf,
      formatNumber: (value: number) => numberFormatter.format(value),
      formatMoney: (value: number) =>
        `${numberFormatter.format(value)} ${translate(locale, 'common.toman')}`,
      formatDate: (value: Date | string | number) =>
        dateFormatter.format(new Date(value)),
    };
  }, [locale, t, tf]);
}
