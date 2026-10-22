'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { DesktopIcons } from './desktop-icons';
import { LoginOverlay } from './login-overlay';
import { ModuleMenu } from './module-menu/module-menu';
import { WindowLayer } from './windows/window-layer';
import { Taskbar } from './taskbar/taskbar';
import { useTranslation } from '@/i18n';
import { useDesktopStore } from '@/store/desktop-store';

/**
 * Root shell of the dashboard: wallpaper + desktop icon grid + module
 * windows on top, the module flyout menu launcher, Windows 11 style
 * taskbar (sticky footer) at the bottom, and the lock screen until the
 * user authenticates.
 */
export function DesktopShell() {
  const fetchIcons = useDesktopStore((s) => s.fetchIcons);
  const selectIcon = useDesktopStore((s) => s.selectIcon);
  const toggleStartMenu = useDesktopStore((s) => s.toggleStartMenu);
  const toggleLanguageMenu = useDesktopStore((s) => s.toggleLanguageMenu);
  const closeModuleMenu = useDesktopStore((s) => s.closeModuleMenu);
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
        toggleStartMenu(false);
        toggleLanguageMenu(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeModuleMenu, toggleStartMenu, toggleLanguageMenu]);

  return (
    <div className="flex min-h-screen flex-col">
      <main
        className="relative flex-1 overflow-hidden bg-[#0a1128]"
        aria-label={t('desktop.aria')}
        onClick={() => {
          selectIcon(null);
          toggleStartMenu(false);
          closeModuleMenu();
        }}
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
        {/* Module flyout menu (opened by clicking a desktop icon) */}
        <ModuleMenu />
      </main>

      <Taskbar />
      <LoginOverlay />
    </div>
  );
}
