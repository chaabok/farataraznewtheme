'use client';

import { BatteryMedium, ChevronUp, Volume2, Wifi } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TaskbarClock } from './taskbar-clock';

/**
 * Right side of the taskbar (system tray): hidden-icons chevron,
 * keyboard language, network / sound / battery, and the live clock —
 * exactly like the Windows 11 tray in the reference screenshot.
 */
export function SystemTray() {
  const showPlaceholder = (feature: string) =>
    toast({ title: `${feature}`, description: 'این بخش در سفارش‌های بعدی فعال خواهد شد.' });

  return (
    <div className="flex items-center gap-0.5 text-white/85">
      <button
        type="button"
        title="آیکون‌های مخفی"
        aria-label="آیکون‌های مخفی"
        onClick={() => showPlaceholder('آیکون‌های مخفی')}
        className="hidden h-9 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/10 sm:flex sm:h-11"
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      <button
        type="button"
        title="زبان ورودی: فارسی"
        aria-label="زبان ورودی: فارسی"
        onClick={() => showPlaceholder('تغییر زبان ورودی')}
        className="hidden h-9 items-center justify-center rounded-md px-1.5 text-[13px] font-semibold transition-colors hover:bg-white/10 sm:flex sm:h-11"
      >
        فا
      </button>

      <button
        type="button"
        title="شبکه"
        aria-label="شبکه"
        onClick={() => showPlaceholder('تنظیمات شبکه')}
        className="flex h-9 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/10 sm:h-11"
      >
        <Wifi className="h-4 w-4" strokeWidth={1.9} />
      </button>

      <button
        type="button"
        title="صدا"
        aria-label="صدا"
        onClick={() => showPlaceholder('تنظیمات صدا')}
        className="flex h-9 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/10 sm:h-11"
      >
        <Volume2 className="h-4 w-4" strokeWidth={1.9} />
      </button>

      <button
        type="button"
        title="باتری"
        aria-label="باتری"
        onClick={() => showPlaceholder('وضعیت باتری')}
        className="flex h-9 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/10 sm:h-11"
      >
        <BatteryMedium className="h-5 w-5" strokeWidth={1.9} />
      </button>

      <TaskbarClock />
    </div>
  );
}
