'use client';

import { StartMenu } from './start-menu';
import { SystemTray } from './system-tray';
import { TaskbarCenter } from './taskbar-center';
import { useDesktopStore } from '@/store/desktop-store';

/**
 * The sticky footer of the dashboard — the Windows 11 taskbar:
 * centered Start / Search / pinned apps, system tray + live clock
 * on the right, blurred translucent surface.
 */
export function Taskbar() {
  const toggleStartMenu = useDesktopStore((s) => s.toggleStartMenu);

  return (
    <footer className="relative z-20 mt-auto border-t border-white/10 bg-[#1e2128]/85 shadow-[0_-1px_12px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <StartMenu />

      <div
        className="relative flex h-12 items-center justify-between px-2 sm:px-3"
        onClick={() => toggleStartMenu(false)}
      >
        {/* Left side: kept empty exactly like the reference screenshot */}
        <div className="flex-1" aria-hidden="true" />

        <TaskbarCenter />

        {/* Right side: system tray + clock */}
        <div className="flex flex-1 justify-end">
          <SystemTray />
        </div>
      </div>
    </footer>
  );
}
