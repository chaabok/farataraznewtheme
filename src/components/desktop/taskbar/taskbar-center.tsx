'use client';

import { LayoutGrid, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getIcon } from '../icon-registry';
import { useDesktopStore } from '@/store/desktop-store';
import { TaskbarButton } from './taskbar-button';
import { WindowsLogo } from './windows-logo';

/**
 * Center of the taskbar (Windows 11 style): Start, Search, Task View,
 * pinned apps and the running module windows — absolutely centered
 * regardless of tray width.
 */
export function TaskbarCenter() {
  const pinnedApps = useDesktopStore((s) => s.pinnedApps);
  const isStartMenuOpen = useDesktopStore((s) => s.isStartMenuOpen);
  const toggleStartMenu = useDesktopStore((s) => s.toggleStartMenu);
  const activeTaskbarAppId = useDesktopStore((s) => s.activeTaskbarAppId);
  const setActiveTaskbarApp = useDesktopStore((s) => s.setActiveTaskbarApp);
  const windows = useDesktopStore((s) => s.windows);
  const focusWindow = useDesktopStore((s) => s.focusWindow);

  const notify = (title: string) =>
    toast({ title, description: 'این بخش در سفارش‌های بعدی فعال خواهد شد.' });

  return (
    <div
      className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5"
      onClick={(event) => event.stopPropagation()}
    >
      <TaskbarButton
        label="شروع"
        isActive={isStartMenuOpen}
        aria-expanded={isStartMenuOpen}
        onClick={() => toggleStartMenu()}
      >
        <WindowsLogo />
      </TaskbarButton>

      <TaskbarButton
        label="جستجو"
        className="hidden sm:flex"
        onClick={() => notify('جستجو')}
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </TaskbarButton>

      <TaskbarButton
        label="نمای وظایف"
        className="hidden sm:flex"
        onClick={() => notify('نمای وظایف')}
      >
        <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </TaskbarButton>

      <span className="mx-1 hidden h-6 w-px bg-white/15 sm:block" aria-hidden="true" />

      {/* Running module windows */}
      {windows.map((win) => {
        const Icon = getIcon(win.moduleId);
        return (
          <TaskbarButton
            key={`win-${win.moduleId}`}
            label={win.moduleId}
            isActive
            onClick={() => focusWindow(win.moduleId)}
          >
            <Icon className="h-[18px] w-[18px] text-sky-300" strokeWidth={1.9} />
          </TaskbarButton>
        );
      })}

      {windows.length > 0 && (
        <span
          className="mx-1 hidden h-6 w-px bg-white/15 sm:block"
          aria-hidden="true"
        />
      )}

      {/* Pinned apps */}
      {pinnedApps.map((app, index) => {
        const Icon = getIcon(app.iconKey);
        return (
          <TaskbarButton
            key={app.id}
            label={app.label}
            isActive={activeTaskbarAppId === app.id}
            className={cn(index > 2 && 'hidden sm:flex')}
            onClick={() => {
              setActiveTaskbarApp(
                activeTaskbarAppId === app.id ? null : app.id,
              );
              notify(app.label);
            }}
          >
            <span
              className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] shadow-sm shadow-black/30 ring-1 ring-white/15"
              style={{
                background: `linear-gradient(135deg, ${app.color}, ${app.color}b3)`,
              }}
            >
              <Icon className="h-4 w-4 text-white" strokeWidth={1.8} />
            </span>
          </TaskbarButton>
        );
      })}
    </div>
  );
}
