'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Languages } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { translate, useTranslation } from '@/i18n';
import { DIR_BY_LOCALE, LOCALES } from '@/i18n/config';
import type { Locale } from '@/types/desktop';
import { useDesktopStore } from '@/store/desktop-store';

/**
 * Windows 11 style language picker popup, anchored above the taskbar tray
 * button. Uses logical `end-0` positioning so it mirrors with RTL/LTR.
 *
 * Click-away is handled with a window `pointerdown` listener instead of a
 * fixed overlay: the taskbar footer has `backdrop-filter`, which makes it a
 * containing block for fixed descendants, so a `fixed inset-0` overlay would
 * not cover the whole viewport. Rendered only while `isLanguageMenuOpen`.
 */
export function LanguageMenu() {
  const isOpen = useDesktopStore((s) => s.isLanguageMenuOpen);
  const toggleLanguageMenu = useDesktopStore((s) => s.toggleLanguageMenu);
  const setLocale = useDesktopStore((s) => s.setLocale);
  const locale = useDesktopStore((s) => s.locale);
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Escape closes the popup while it is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toggleLanguageMenu(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, toggleLanguageMenu]);

  // Close on any pointer press outside the panel (the tray toggle button is
  // excluded so its own click handler can close the menu).
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (panelRef.current?.contains(target)) return;
      if (target.closest('[data-language-toggle]')) return;
      toggleLanguageMenu(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen, toggleLanguageMenu]);

  if (!isOpen) return null;

  const handleSelect = (next: Locale) => {
    setLocale(next);
    // Toast must be phrased in the NEW language — the hook-bound `t` still
    // carries the locale that was active when the click happened.
    toast({
      title: translate(next, 'language.changeToast.title'),
      description: translate(next, 'language.changeToast.desc'),
    });
  };

  return (
    <motion.div
      ref={panelRef}
      role="menu"
      aria-label={t('language.title')}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      onClick={(event) => event.stopPropagation()}
      className="absolute bottom-[calc(100%+8px)] end-0 z-40 w-[260px] rounded-xl border border-white/10 bg-[#25272c]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl"
    >
      {/* Title row */}
      <div className="flex items-center gap-2 px-2 pb-2 pt-1 text-[12px] font-semibold text-white/90">
        <Languages className="h-4 w-4 text-sky-300" strokeWidth={1.9} />
        {t('language.title')}
      </div>

      <div className="space-y-0.5">
        {LOCALES.map((item) => {
          const active = item === locale;
          return (
            <button
              key={item}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={() => handleSelect(item)}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-white/90">
                  {t(`language.${item}`)}
                </span>
                <span className="block truncate text-[10px] text-white/45">
                  {DIR_BY_LOCALE[item] === 'rtl'
                    ? t('language.dirRtl')
                    : t('language.dirLtr')}
                </span>
              </span>
              {active && <Check className="h-4 w-4 shrink-0 text-sky-400" />}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
