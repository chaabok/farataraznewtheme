'use client';

import { cn } from '@/lib/utils';

/**
 * The Windows 11 logo: four rounded blue squares.
 */
export function WindowsLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn('grid grid-cols-2 gap-[2.5px]', className)}
      aria-hidden="true"
    >
      <span className="h-[7.5px] w-[7.5px] rounded-[1.5px] bg-sky-400" />
      <span className="h-[7.5px] w-[7.5px] rounded-[1.5px] bg-sky-400" />
      <span className="h-[7.5px] w-[7.5px] rounded-[1.5px] bg-sky-400" />
      <span className="h-[7.5px] w-[7.5px] rounded-[1.5px] bg-sky-400" />
    </span>
  );
}
