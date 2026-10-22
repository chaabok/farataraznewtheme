'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { LOCALE_TAGS } from '@/i18n/config';
import { useDesktopStore } from '@/store/desktop-store';

/**
 * Live clock at the end side of the taskbar:
 * top line = localized time, bottom line = localized date
 * (Jalali digits for fa, Arabic-Indic for ar, latin for en/tr).
 * Rendered only after mount to avoid SSR hydration mismatches.
 */
export function TaskbarClock() {
  const locale = useDesktopStore((s) => s.locale);
  const { t } = useTranslation();
  const [now, setNow] = useState<Date | null>(null);

  // Formatters are rebuilt only when the interface language changes.
  const { timeFormatter, dateFormatter } = useMemo(() => {
    const tag = LOCALE_TAGS[locale];
    return {
      timeFormatter: new Intl.DateTimeFormat(tag, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: locale !== 'tr',
      }),
      dateFormatter: new Intl.DateTimeFormat(tag, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    };
  }, [locale]);

  useEffect(() => {
    // rAF keeps the first paint after mount out of the synchronous effect body
    const firstFrame = requestAnimationFrame(() => setNow(new Date()));
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      cancelAnimationFrame(firstFrame);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <button
      type="button"
      title={t('taskbar.clock')}
      className="flex h-9 flex-col items-center justify-center rounded-md px-2 text-[11px] leading-[15px] text-white/90 transition-colors hover:bg-white/10 sm:h-11"
    >
      <span suppressHydrationWarning>
        {now ? timeFormatter.format(now) : '--:--'}
      </span>
      <span suppressHydrationWarning>
        {now ? dateFormatter.format(now) : '----/--/--'}
      </span>
    </button>
  );
}
