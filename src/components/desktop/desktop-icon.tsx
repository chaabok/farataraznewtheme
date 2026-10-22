'use client';

import { createElement } from 'react';
import { getIcon } from './icon-registry';
import { cn } from '@/lib/utils';
import { useDesktopStore } from '@/store/desktop-store';
import type { DesktopIconItem } from '@/types/desktop';

interface DesktopIconProps {
  icon: DesktopIconItem;
}

/**
 * A single icon on the desktop.
 * Clicking it opens the module flyout menu — the creative Windows 11 style
 * launcher that lists the module's menus and forms (fetched from the
 * desktop-service microservice, localized for the active language).
 */
export function DesktopIcon({ icon }: DesktopIconProps) {
  const selectedIconId = useDesktopStore((s) => s.selectedIconId);
  const selectIcon = useDesktopStore((s) => s.selectIcon);
  const openModuleMenu = useDesktopStore((s) => s.openModuleMenu);

  const isSelected = selectedIconId === icon.id;

  return (
    <button
      type="button"
      aria-label={icon.name}
      aria-haspopup="dialog"
      onClick={(event) => {
        event.stopPropagation();
        selectIcon(icon.id);
        openModuleMenu(icon.iconKey);
      }}
      className={cn(
        'flex h-[92px] w-[88px] select-none flex-col items-center gap-1.5 rounded-md border px-1 pb-1 pt-2.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300/70',
        isSelected
          ? 'border-sky-300/50 bg-sky-400/25'
          : 'border-transparent hover:border-white/15 hover:bg-white/10',
      )}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] shadow-md shadow-black/40 ring-1 ring-white/20"
        style={{
          background: `linear-gradient(135deg, ${icon.color}, ${icon.color}b3)`,
        }}
      >
        {createElement(getIcon(icon.iconKey), {
          className: 'h-6 w-6 text-white drop-shadow-sm',
          strokeWidth: 1.8,
        })}
      </span>
      <span className="line-clamp-2 text-center text-[11px] font-medium leading-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
        {icon.name}
      </span>
    </button>
  );
}
