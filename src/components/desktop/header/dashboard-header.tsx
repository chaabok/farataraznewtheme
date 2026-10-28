'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

/**
 * Dashboard header — always visible above the tab bar (like the taskbar
 * footer, but on top). 2026 glass design: blurred surface, gradient brand
 * tile, notification bell and a user chip with a sign-out dropdown.
 */
export function DashboardHeader() {
  const { t } = useTranslation();
  const displayName = useAuthStore((s) => s.user?.displayName ?? '');
  const username = useAuthStore((s) => s.user?.username ?? '');
  const logout = useAuthStore((s) => s.logout);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Close the user dropdown on any outside click / Escape.
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsUserMenuOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleSignOut = useCallback(() => {
    setIsUserMenuOpen(false);
    logout();
    toast({ title: t('header.logoutToast') });
  }, [logout, t]);

  const initial = (displayName || username || '?').trim().charAt(0);

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-[#12141b]/85 px-3 backdrop-blur-2xl sm:gap-3 sm:px-5">
      {/* Top edge light — the 2026 glass rim */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-sky-400/50 to-transparent"
        aria-hidden="true"
      />

      {/* ── Brand ── */}
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg shadow-sky-950/50 ring-1 ring-white/25"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
          }}
        >
          <LayoutDashboard
            className="h-[18px] w-[18px] text-white drop-shadow-sm"
            strokeWidth={2}
          />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="flex items-center gap-1.5 truncate text-[13.5px] font-bold text-white">
            <span className="truncate">{t('app.name')}</span>
            <span className="hidden shrink-0 rounded-md bg-sky-400/15 px-1.5 py-px text-[9.5px] font-bold tracking-wide text-sky-300 ring-1 ring-sky-400/30 sm:inline">
              {t('header.brandBadge')}
            </span>
          </p>
          <p className="hidden text-[10.5px] text-white/40 sm:block">
            {t('header.brandSubtitle')}
          </p>
        </div>
      </div>

      {/* ── Ambient center hairline (pure decor) ── */}
      <span
        className="mx-2 hidden h-6 flex-1 items-center md:flex"
        aria-hidden="true"
      >
        <span className="h-px w-full bg-gradient-to-l from-white/[0.08] via-white/[0.14] to-transparent" />
      </span>
      <span className="flex-1 md:hidden" aria-hidden="true" />

      {/* ── Actions ── */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Notifications */}
        <button
          type="button"
          title={t('header.notifications')}
          aria-label={t('header.notifications')}
          onClick={() =>
            toast({
              title: t('header.notifications'),
              description: t('toast.comingSoon'),
            })
          }
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/60 ring-1 ring-white/10 transition-all hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400/60 active:scale-95"
        >
          <Bell className="h-[17px] w-[17px]" strokeWidth={1.9} />
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400 ring-2 ring-[#12141b]"
            aria-hidden="true"
          />
        </button>

        {/* User chip + dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen}
            onClick={() => setIsUserMenuOpen((open) => !open)}
            className={cn(
              'flex h-9 items-center gap-2 rounded-lg px-1.5 pe-2 ring-1 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400/60 active:scale-[0.98] sm:ps-1',
              isUserMenuOpen
                ? 'bg-white/[0.09] ring-white/20'
                : 'bg-white/[0.04] ring-white/10 hover:bg-white/[0.08]',
            )}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white shadow-inner ring-1 ring-white/25"
              style={{ background: 'linear-gradient(135deg, #0284c7, #22d3ee)' }}
              aria-hidden="true"
            >
              {initial}
            </span>
            <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
              <span className="max-w-[120px] truncate text-[11.5px] font-semibold text-white/90">
                {displayName || username || t('header.guest')}
              </span>
              <span className="text-[9.5px] text-white/40">
                {t('header.role')}
              </span>
            </span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 shrink-0 text-white/50 transition-transform duration-200',
                isUserMenuOpen && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                role="menu"
                aria-label={t('header.userMenu')}
                className="absolute end-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-xl border border-white/10 bg-[#1a1d26]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl"
              >
                <div className="border-b border-white/[0.07] px-4 py-3">
                  <p className="truncate text-[12.5px] font-bold text-white">
                    {displayName || username || t('header.guest')}
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] text-white/40">
                    {username ? `@${username}` : t('header.role')}
                  </p>
                </div>
                <div className="p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-[12.5px] font-medium text-rose-300/90 transition-colors hover:bg-rose-500/15 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400/50"
                  >
                    <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                    {t('header.logout')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
