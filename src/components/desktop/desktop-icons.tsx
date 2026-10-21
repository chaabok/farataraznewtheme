'use client';

import { DesktopIcon } from './desktop-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useDesktopStore } from '@/store/desktop-store';

/**
 * The desktop icon grid. Icons are laid out column-first (top-to-bottom,
 * then next column) exactly like the Windows desktop, starting top-left.
 */
export function DesktopIcons() {
  const icons = useDesktopStore((s) => s.icons);
  const isLoading = useDesktopStore((s) => s.isLoading);
  const error = useDesktopStore((s) => s.error);

  return (
    <div
      className="pointer-events-none absolute inset-0 p-2 sm:p-3"
      role="region"
      aria-label="آیکون‌های دسکتاپ"
    >
      <div className="pointer-events-auto grid h-full max-h-full grid-flow-col grid-rows-[repeat(auto-fill,92px)] justify-start gap-x-1 overflow-hidden">
        {isLoading &&
          Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex h-[92px] w-[88px] flex-col items-center gap-2 px-1 pt-3"
            >
              <Skeleton className="h-11 w-11 rounded-[10px] bg-white/15" />
              <Skeleton className="h-3 w-14 rounded bg-white/10" />
            </div>
          ))}

        {!isLoading &&
          !error &&
          icons.map((icon) => <DesktopIcon key={icon.id} icon={icon} />)}

        {!isLoading && error && (
          <div className="mt-4 max-w-xs rounded-lg border border-red-400/30 bg-red-950/60 p-3 text-xs leading-5 text-red-200 backdrop-blur-md">
            <p className="font-semibold">خطا در بارگذاری آیکون‌ها</p>
            <p className="mt-1 text-red-200/80">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
