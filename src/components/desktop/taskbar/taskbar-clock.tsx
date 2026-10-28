'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import {
  CALENDAR_BY_LOCALE,
  formatCalendarDate,
  localIsoDate,
} from '@/i18n/calendar';
import { HOUR12_LOCALES, LOCALE_TAGS } from '@/i18n/config';
import { useDesktopStore } from '@/store/desktop-store';

/**
 * Live clock at the end side of the taskbar:
 * top line = localized time, bottom line = localized date in the locale's
 * own calendar (Jalali for fa/ps, Kurdish solar for ckb, Hijri lunar for
 * ar, Gregorian otherwise) with the locale's digit family.
 * Rendered only after mount to avoid SSR hydration mismatches.
 */
export function TaskbarClock() {
  const locale = useDesktopStore((s) => s.locale);
  const { t } = useTranslation();
  const [now, setNow] = useState<Date | null>(null);

  // Formatters are rebuilt only when the interface language changes.
  const { timeFormatter, formatDate } = useMemo(() => {
    const tag = LOCALE_TAGS[locale];
    const kind = CALENDAR_BY_LOCALE[locale];
    return {
      timeFormatter: new Intl.DateTimeFormat(tag, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: HOUR12_LOCALES.includes(locale),
      }),
      formatDate: (date: Date) =>
        formatCalendarDate(localIsoDate(date), kind, locale) ??
        date.toISOString().slice(0, 10),
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
        {now ? formatDate(now) : '----/--/--'}
      </span>
    </button>
  );
}
