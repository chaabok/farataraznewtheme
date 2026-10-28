'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, Loader2, LogIn, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/i18n';
import { useDesktopStore } from '@/store/desktop-store';
import { LanguageMenu } from './taskbar/language-menu';

/**
 * Windows-style lock screen shown before authentication.
 * Sits above the desktop, blurring it, exactly like Win11's login.
 */
export function LoginOverlay() {
  const token = useAuthStore((s) => s.token);
  const isLoggingIn = useAuthStore((s) => s.isLoggingIn);
  const error = useAuthStore((s) => s.error);
  const errorKey = useAuthStore((s) => s.errorKey);
  const login = useAuthStore((s) => s.login);
  const { t } = useTranslation();
  const isLanguageMenuOpen = useDesktopStore((s) => s.isLanguageMenuOpen);
  const toggleLanguageMenu = useDesktopStore((s) => s.toggleLanguageMenu);

  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // rAF keeps the mount flag out of the synchronous effect body (lint-safe)
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted || token) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void login(username, password);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[600] flex items-center justify-center"
      role="dialog"
      aria-label={t('login.aria')}
    >
      <Image
        src="/wallpaper.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#0a1128]/60 backdrop-blur-2xl" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
        className="relative w-[min(360px,calc(100vw-1.5rem))] rounded-2xl border border-white/15 bg-white/5 p-8 text-center shadow-2xl shadow-black/50"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/80 shadow-lg shadow-sky-900/50 ring-2 ring-white/25">
          <User className="h-8 w-8 text-white" />
        </span>

        <h1 className="mt-4 text-lg font-bold text-white">{t('login.title')}</h1>
        <p className="mt-1 text-xs text-white/60">{t('login.subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-start">
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={t('login.username')}
            autoComplete="username"
            dir="ltr"
            className="h-11 w-full rounded-lg border border-white/15 bg-white/10 px-4 text-center text-sm text-white placeholder:text-white/40 focus:border-sky-400/60 focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('login.password')}
            autoComplete="current-password"
            dir="ltr"
            className="h-11 w-full rounded-lg border border-white/15 bg-white/10 px-4 text-center text-sm text-white placeholder:text-white/40 focus:border-sky-400/60 focus:outline-none"
          />

          {(errorKey || error) && (
            <p className="rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 text-center text-xs text-red-200">
              {errorKey ? t(`login.error.${errorKey}`) : error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || !username || !password}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingIn ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {t('login.submit')}
          </button>
        </form>

        <p className="mt-5 text-[11px] leading-5 text-white/45">
          {t('login.demoAccount')} — {t('login.username')}:{' '}
          <span dir="ltr">admin</span>
          <br />
          {t('login.password')}: <span dir="ltr">Admin@12345</span>
        </p>
      </motion.div>

      {/* Language picker (bottom corner, like the Windows lock screen) —
          lets the user switch fa/en/tr/ar BEFORE signing in. */}
      <div className="absolute bottom-5 end-5 z-50 flex flex-col items-end">
        {isLanguageMenuOpen && <LanguageMenu />}
        <button
          type="button"
          data-language-toggle
          aria-label={t('language.aria')}
          aria-haspopup="menu"
          aria-expanded={isLanguageMenuOpen}
          onClick={(event) => {
            event.stopPropagation();
            toggleLanguageMenu();
          }}
          className="mt-2 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/85 backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300/70"
        >
          <Languages className="h-5 w-5" strokeWidth={1.9} />
        </button>
      </div>
    </motion.div>
  );
}
