'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TaskbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Tooltip / accessible label. */
  label: string;
  /** Shows the Windows 11 "running app" underline indicator. */
  isActive?: boolean;
  children: ReactNode;
}

/**
 * A button inside the taskbar: hover glow, press feedback and the
 * small underline indicator for the active (running) app.
 */
export function TaskbarButton({
  label,
  isActive = false,
  className,
  children,
  ...props
}: TaskbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-md text-white/85 transition-colors duration-150 hover:bg-white/10 active:bg-white/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 sm:h-11 sm:w-11',
        isActive && 'bg-white/10',
        className,
      )}
      {...props}
    >
      {children}
      {isActive && (
        <span
          className="absolute bottom-[3px] left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full bg-sky-400/90"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
