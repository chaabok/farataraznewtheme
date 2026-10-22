'use client';

import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

export type FormStatus = 'saved' | 'unsaved' | 'new';

interface FormFooterProps {
  status: FormStatus;
  /** 1-based position of the loaded record (null in new-entry mode). */
  position: { n: number; total: number } | null;
  /** `updatedAt` ISO timestamp of the loaded record. */
  updatedAt: string | null;
}

const STATUS_CONFIG: Record<
  FormStatus,
  { dot: string; pill: string; labelKey: string }
> = {
  unsaved: {
    dot: 'bg-amber-400',
    pill: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
    labelKey: 'formWindow.unsaved',
  },
  saved: {
    dot: 'bg-emerald-400',
    pill: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
    labelKey: 'formWindow.saved',
  },
  new: {
    dot: 'bg-sky-400',
    pill: 'bg-sky-500/15 text-sky-300 ring-sky-400/30',
    labelKey: 'formWindow.newMode',
  },
};

/**
 * Status footer of every form window: save-state pill, record position,
 * locale-aware last-update timestamp and the Ctrl+S hint.
 */
export function FormFooter({ status, position, updatedAt }: FormFooterProps) {
  const { localeTag, t, tf, formatNumber } = useTranslation();
  const config = STATUS_CONFIG[status];
  const updated = updatedAt
    ? new Date(updatedAt).toLocaleString(localeTag)
    : null;

  return (
    <footer className="flex h-10 shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-[#15171e]/85 px-3">
      <span
        className={cn(
          'flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium ring-1',
          config.pill,
        )}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            config.dot,
            status === 'unsaved' && 'animate-pulse',
          )}
          aria-hidden="true"
        />
        {t(config.labelKey)}
      </span>

      <div className="flex min-w-0 items-center gap-3 text-[10.5px] text-white/40">
        {position && (
          <span className="shrink-0 tabular-nums">
            {tf('formWindow.recordOf', {
              n: formatNumber(position.n),
              total: formatNumber(position.total),
            })}
          </span>
        )}
        {updated && (
          <span className="hidden shrink-0 sm:inline" title={t('formWindow.saved')}>
            {updated}
          </span>
        )}
        <span className="hidden shrink-0 md:inline">
          {t('formWindow.ctrlSHint')}
        </span>
      </div>
    </footer>
  );
}
