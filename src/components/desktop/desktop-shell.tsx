'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { DesktopIcons } from './desktop-icons';
import { Taskbar } from './taskbar/taskbar';
import { useDesktopStore } from '@/store/desktop-store';

/**
 * Root shell of the dashboard: wallpaper + desktop icon grid on top,
 * Windows 11 style taskbar (sticky footer) at the bottom.
 */
export function DesktopShell() {
  const fetchIcons = useDesktopStore((s) => s.fetchIcons);
  const selectIcon = useDesktopStore((s) => s.selectIcon);
  const toggleStartMenu = useDesktopStore((s) => s.toggleStartMenu);

  // Load icons from the NestJS desktop-service through the Next.js gateway.
  useEffect(() => {
    void fetchIcons();
  }, [fetchIcons]);

  // Close the start menu with the Escape key (Windows behaviour).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toggleStartMenu(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleStartMenu]);

  return (
    <div className="flex min-h-screen flex-col">
      <main
        className="relative flex-1 overflow-hidden bg-[#0a1128]"
        aria-label="دسکتاپ"
        onClick={() => {
          selectIcon(null);
          toggleStartMenu(false);
        }}
      >
        <Image
          src="/wallpaper.jpg"
          alt="والپیپر گل آبی شبیه ویندوز ۱۱"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Slight darkening so icon labels stay readable on bright petals */}
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />

        <DesktopIcons />
      </main>

      <Taskbar />
    </div>
  );
}
