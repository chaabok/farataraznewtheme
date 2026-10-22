'use client';

import { motion } from 'framer-motion';
import { Power, Search, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { getLocalizedModuleMeta, useTranslation } from '@/i18n';
import { MODULE_LIST } from '@/lib/modules-registry';
import { getIcon } from '../icon-registry';
import { useDesktopStore } from '@/store/desktop-store';

/**
 * Windows 11 style start menu: search box, pinned ERP module grid and the
 * bottom user / power row (power = logout). Opens above the start button.
 */
export function StartMenu() {
  const isOpen = useDesktopStore((s) => s.isStartMenuOpen);
  const openWindow = useDesktopStore((s) => s.openWindow);
  const toggleStartMenu = useDesktopStore((s) => s.toggleStartMenu);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { locale, t } = useTranslation();

  const notify = (title: string) =>
    toast({ title, description: t('toast.comingSoon') });

  const handleLogout = () => {
    toggleStartMenu(false);
    logout();
    toast({
      title: t('toast.loggedOut.title'),
      description: t('toast.loggedOut.desc'),
    });
  };

  return (
    <motion.div
      role="dialog"
      aria-label={t('startMenu.aria')}
      initial={false}
      animate={
        isOpen
          ? { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' }
          : { opacity: 0, y: 14, scale: 0.98, pointerEvents: 'none' }
      }
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={(event) => event.stopPropagation()}
      className="absolute bottom-[calc(100%+10px)] left-1/2 z-30 w-[540px] max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-xl border border-white/10 bg-[#25272c]/95 p-5 shadow-2xl shadow-black/60 backdrop-blur-2xl"
    >
      {/* Search box */}
      <div className="flex h-10 items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 text-white/70">
        <Search className="h-4 w-4 shrink-0" />
        <span className="text-sm">{t('startMenu.search')}</span>
      </div>

      {/* ERP modules (names resolved from the dictionaries per locale) */}
      <p className="mb-3 mt-5 text-[13px] font-semibold text-white/90">
        {t('startMenu.sectionTitle')}
      </p>
      <div className="grid max-h-[240px] grid-cols-3 gap-1 overflow-y-auto sm:grid-cols-5">
        {MODULE_LIST.map((module) => {
          const meta = getLocalizedModuleMeta(module.id, locale);
          if (!meta) return null;
          const Icon = getIcon(module.id);
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => openWindow(module.id)}
              className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg shadow-md shadow-black/40 ring-1 ring-white/15"
                style={{
                  background: `linear-gradient(135deg, ${module.color}, ${module.color}b3)`,
                }}
              >
                <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
              </span>
              <span className="line-clamp-1 text-[11px] text-white/85">
                {meta.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom row: user + power */}
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => notify(t('startMenu.account'))}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/80 ring-1 ring-white/25">
            <User className="h-4 w-4 text-white" />
          </span>
          <span className="text-[13px] font-medium text-white/90">
            {user?.displayName ?? t('startMenu.guest')}
          </span>
        </button>

        <button
          type="button"
          title={t('startMenu.logoutTitle')}
          aria-label={t('startMenu.logoutTitle')}
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-red-500/80 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        >
          <Power className="h-5 w-5" strokeWidth={1.9} />
        </button>
      </div>
    </motion.div>
  );
}
