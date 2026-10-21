'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Power, Search, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getIcon } from '../icon-registry';
import { useDesktopStore } from '@/store/desktop-store';

/**
 * Windows 11 style start menu: search box, pinned app grid and the
 * bottom user / power row. Opens above the start button, centered.
 */
export function StartMenu() {
  const isOpen = useDesktopStore((s) => s.isStartMenuOpen);
  const pinnedApps = useDesktopStore((s) => s.pinnedApps);

  const notify = (title: string) =>
    toast({ title, description: 'این بخش در سفارش‌های بعدی فعال خواهد شد.' });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-label="منوی شروع"
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={(event) => event.stopPropagation()}
          className="absolute bottom-[calc(100%+10px)] left-1/2 z-30 w-[540px] max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-xl border border-white/10 bg-[#25272c]/95 p-5 shadow-2xl shadow-black/60 backdrop-blur-2xl"
        >
          {/* Search box */}
          <div className="flex h-10 items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 text-white/70">
            <Search className="h-4 w-4 shrink-0" />
            <span className="text-sm">جستجو برای برنامه‌ها و تنظیمات...</span>
          </div>

          {/* Pinned apps */}
          <p className="mb-3 mt-5 text-[13px] font-semibold text-white/90">
            پین‌شده
          </p>
          <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
            {pinnedApps.map((app) => {
              const Icon = getIcon(app.iconKey);
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => notify(app.label)}
                  className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg shadow-md shadow-black/40 ring-1 ring-white/15"
                    style={{
                      background: `linear-gradient(135deg, ${app.color}, ${app.color}b3)`,
                    }}
                  >
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                  </span>
                  <span className="line-clamp-1 text-[11px] text-white/85">
                    {app.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom row: user + power */}
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => notify('حساب کاربری')}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/80 ring-1 ring-white/25">
                <User className="h-4 w-4 text-white" />
              </span>
              <span className="text-[13px] font-medium text-white/90">
                کاربر میهمان
              </span>
            </button>

            <button
              type="button"
              title="خاموش کردن"
              aria-label="خاموش کردن"
              onClick={() => notify('خاموش کردن')}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              <Power className="h-5 w-5" strokeWidth={1.9} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
