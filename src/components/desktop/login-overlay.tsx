'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, LogIn, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

/**
 * Windows-style lock screen shown before authentication.
 * Sits above the desktop, blurring it, exactly like Win11's login.
 */
export function LoginOverlay() {
  const token = useAuthStore((s) => s.token);
  const isLoggingIn = useAuthStore((s) => s.isLoggingIn);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);

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
      className="fixed inset-0 z-40 flex items-center justify-center"
      role="dialog"
      aria-label="صفحه ورود"
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

        <h1 className="mt-4 text-lg font-bold text-white">ورود به داشبورد</h1>
        <p className="mt-1 text-xs text-white/60">
          برای دسترسی به ماژول‌های سازمانی وارد شوید
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-right">
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="نام کاربری"
            autoComplete="username"
            dir="ltr"
            className="h-11 w-full rounded-lg border border-white/15 bg-white/10 px-4 text-center text-sm text-white placeholder:text-white/40 focus:border-sky-400/60 focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="رمز عبور"
            autoComplete="current-password"
            dir="ltr"
            className="h-11 w-full rounded-lg border border-white/15 bg-white/10 px-4 text-center text-sm text-white placeholder:text-white/40 focus:border-sky-400/60 focus:outline-none"
          />

          {error && (
            <p className="rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 text-center text-xs text-red-200">
              {error}
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
            ورود
          </button>
        </form>

        <p className="mt-5 text-[11px] leading-5 text-white/45">
          حساب دمو — نام کاربری: <span dir="ltr">admin</span>
          <br />
          رمز عبور: <span dir="ltr">Admin@12345</span>
        </p>
      </motion.div>
    </motion.div>
  );
}
