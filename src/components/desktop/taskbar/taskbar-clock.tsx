'use client';

import { useEffect, useState } from 'react';

const timeFormatter = new Intl.DateTimeFormat('fa-IR', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * Live clock at the right side of the taskbar:
 * top line = time (e.g. "۴:۳۰ ق.ظ"), bottom line = Jalali date (e.g. "۱۴۰۵/۰۷/۰۴").
 * Rendered only after mount to avoid SSR hydration mismatches.
 */
export function TaskbarClock() {
  const [now, setNow] = useState<Date | null>(null);

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
      title="تاریخ و زمان"
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
