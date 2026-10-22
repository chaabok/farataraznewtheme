'use client';

import { ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n';
import { LOCALE_SHORT } from '@/i18n/config';
import { useDesktopStore } from '@/store/desktop-store';
import { LanguageMenu } from './language-menu';
import { TaskbarClock } from './taskbar-clock';

/**
 * End side of the taskbar (system tray): hidden-icons chevron,
 * language picker and the live clock — network / sound / battery
 * icons were removed per user request (marked with red arrows).
 */
export function SystemTray() {
  const locale = useDesktopStore((s) => s.locale);
  const isLanguageMenuOpen = useDesktopStore((s) => s.isLanguageMenuOpen);
  const toggleLanguageMenu = useDesktopStore((s) => s.toggleLanguageMenu);
  const { t } = useTranslation();

  const showPlaceholder = (feature: string) =>
    toast({ title: feature, description: t('toast.comingSoon') });

  return (
    <div className="flex items-center gap-0.5 text-white/85">
      <button
        type="button"
        title={t('taskbar.hiddenIcons')}
        aria-label={t('taskbar.hiddenIcons')}
        onClick={() => showPlaceholder(t('taskbar.hiddenIcons'))}
        className="hidden h-9 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/10 sm:flex sm:h-11"
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      <button
        type="button"
        title={t('language.aria')}
        aria-label={t('language.aria')}
        aria-haspopup="menu"
        aria-expanded={isLanguageMenuOpen}
        data-language-toggle=""
        onClick={() => toggleLanguageMenu()}
        className="hidden h-9 items-center justify-center rounded-md px-1.5 text-[13px] font-semibold transition-colors hover:bg-white/10 sm:flex sm:h-11"
      >
        {LOCALE_SHORT[locale]}
      </button>

      <TaskbarClock />
      <LanguageMenu />
    </div>
  );
}
