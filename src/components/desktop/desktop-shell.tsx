'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { DataFormWindow, DataListWindow } from '@/components/forms';
import { useTranslation } from '@/i18n';
import { useDesktopStore } from '@/store/desktop-store';
import { useSetupStore } from '@/store/setup-store';
import { DesktopIcons } from './desktop-icons';
import { DashboardHeader } from './header/dashboard-header';
import { LoginOverlay } from './login-overlay';
import { ModuleMenu } from './module-menu/module-menu';
import { SetupWindow } from './setup/setup-window';
import { TabBar } from './tabs/tab-bar';
import { Taskbar } from './taskbar/taskbar';
import { ModuleWindow } from './windows/module-window';
import { WindowLayer } from './windows/window-layer';

/**
 * Root shell of the dashboard — a 2026 workspace layout:
 *
 *   ┌────────────────────────────┐
 *   │ Header      (always)       │
 *   ├────────────────────────────┤
 *   │ Tab bar     (once revealed)│
 *   ├────────────────────────────┤
 *   │ Content     (flex-1)       │  ← Home tab = live desktop (icons,
 *   │                             │    flyout menus, floating windows);
 *   │                             │    every opened form/module lives in
 *   │                             │    its own keep-alive tab panel
 *   ├────────────────────────────┤
 *   │ Taskbar     (always)       │
 *   └────────────────────────────┘
 *
 * The lock screen covers everything until the user authenticates.
 */
export function DesktopShell() {
  const fetchIcons = useDesktopStore((s) => s.fetchIcons);
  const selectIcon = useDesktopStore((s) => s.selectIcon);
  const toggleStartMenu = useDesktopStore((s) => s.toggleStartMenu);
  const toggleLanguageMenu = useDesktopStore((s) => s.toggleLanguageMenu);
  const closeModuleMenu = useDesktopStore((s) => s.closeModuleMenu);
  const closeSetupWindow = useSetupStore((s) => s.closeSetupWindow);
  const tabs = useDesktopStore((s) => s.tabs);
  const activeTabId = useDesktopStore((s) => s.activeTabId);
  const isTabBarActive = useDesktopStore((s) => s.isTabBarActive);
  const closeTab = useDesktopStore((s) => s.closeTab);
  const { t } = useTranslation();

  // Load icons from the NestJS desktop-service through the Next.js gateway.
  useEffect(() => {
    void fetchIcons();
  }, [fetchIcons]);

  // Close the flyout menus with Escape (Windows behaviour).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModuleMenu();
        closeSetupWindow();
        toggleStartMenu(false);
        toggleLanguageMenu(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    closeModuleMenu,
    closeSetupWindow,
    toggleStartMenu,
    toggleLanguageMenu,
  ]);

  const homeActive = activeTabId === 'home';

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ── Header: always visible, like the footer taskbar ── */}
      <DashboardHeader />

      {/* ── Tab bar: revealed with the first module menu, then permanent ── */}
      {isTabBarActive && <TabBar />}

      <main
        className="relative min-h-0 flex-1 overflow-hidden bg-[#0a1128]"
        aria-label={t('desktop.aria')}
        onClick={() => {
          selectIcon(null);
          toggleStartMenu(false);
          closeModuleMenu();
        }}
      >
        {/* ── Home panel: the live desktop (kept mounted, state preserved) ── */}
        <div
          className={cn(
            'absolute inset-0 transition-[opacity,visibility] duration-200',
            homeActive
              ? 'visible opacity-100'
              : 'pointer-events-none invisible opacity-0',
          )}
          aria-hidden={!homeActive}
        >
          <Image
            src="/wallpaper.jpg"
            alt={t('app.name')}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Slight darkening so icon labels stay readable on bright petals */}
          <div className="absolute inset-0 bg-black/10" aria-hidden="true" />

          <DesktopIcons />
          <WindowLayer />
          {/* Module flyout menu (opened by clicking a desktop icon) —
              it lives on the Home tab and never auto-closes when a form
              opens in another tab; it reappears when the user returns. */}
          <ModuleMenu />
          {/* App installation settings (opened from the settings module menu) */}
          <SetupWindow />
        </div>

        {/* ── Keep-alive panels of opened form/module tabs ── */}
        {tabs
          .filter((tab) => tab.kind !== 'home')
          .map((tab) => {
            const active = activeTabId === tab.id;
            return (
              <div
                key={tab.id}
                role="tabpanel"
                aria-label={tab.title}
                aria-hidden={!active}
                className={cn(
                  'absolute inset-0 flex flex-col bg-[#0b101d] transition-[opacity,visibility] duration-200',
                  active
                    ? 'visible opacity-100'
                    : 'pointer-events-none invisible opacity-0',
                )}
              >
                {tab.kind === 'form' && tab.form ? (
                  <DataFormWindow
                    moduleId={tab.id}
                    form={tab.form}
                    onClose={() => closeTab(tab.id)}
                  />
                ) : tab.kind === 'list' && tab.list ? (
                  <DataListWindow
                    moduleId={tab.id}
                    list={tab.list}
                    onClose={() => closeTab(tab.id)}
                  />
                ) : tab.moduleId ? (
                  <div className="h-full overflow-y-auto p-4 sm:p-5 [scrollbar-width:thin]">
                    <div className="mx-auto max-w-4xl">
                      <ModuleWindow moduleId={tab.moduleId} />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
      </main>

      <Taskbar />
      <LoginOverlay />
    </div>
  );
}
