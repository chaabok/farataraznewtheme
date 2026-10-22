'use client';

import { createElement, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { getIcon } from '@/components/desktop/icon-registry';
import { useTranslation } from '@/i18n';
import { useDismiss } from './use-dismiss';

interface FormShellProps {
  title: string;
  subtitle?: string;
  /** Lucide icon key resolved through the shared icon registry. */
  iconKey: string;
  /** Accent hex color from the FormDef (header gradient + glow). */
  accentColor: string;
  actionBar?: ReactNode;
  /** Collapsible section right below the action bar (records drawer). */
  subPanel?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

/**
 * Window chrome of every DB-driven form, rendered inside the desktop
 * WindowFrame: accent gradient header with an icon chip + help popover,
 * sticky action bar, content area (scrolls internally) and status footer.
 */
export function FormShell({
  title,
  subtitle,
  iconKey,
  accentColor,
  actionBar,
  subPanel,
  footer,
  children,
}: FormShellProps) {
  const { direction, t } = useTranslation();
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useDismiss<HTMLDivElement>(
    helpOpen,
    // Toggle instead of hard close so the button's own click feels right.
    () => setHelpOpen(false),
  );
  const rtl = direction === 'rtl';

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#171920]/95">
      {/* ── Accent gradient header ── */}
      <header
        className="relative flex h-12 shrink-0 items-center gap-2.5 overflow-hidden border-b border-white/10 px-3"
        style={{
          background: `linear-gradient(to ${rtl ? 'left' : 'right'}, ${accentColor}33, rgba(23,25,32,0) 58%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -top-20 start-6 h-32 w-56 rounded-full opacity-25 blur-3xl"
          style={{ background: accentColor }}
          aria-hidden="true"
        />
        <span
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-lg ring-1 ring-white/20"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}b3)`,
          }}
        >
          {createElement(getIcon(iconKey), {
            className: 'h-4 w-4 text-white drop-shadow-sm',
            strokeWidth: 1.9,
          })}
        </span>
        <div className="relative min-w-0 flex-1">
          <h2 className="truncate text-[13px] font-bold text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="truncate text-[10.5px] text-white/50">{subtitle}</p>
          )}
        </div>

        {/* Help popover */}
        <div ref={helpRef} className="relative">
          <button
            type="button"
            title={t('formWindow.helpTitle')}
            aria-label={t('formWindow.helpTitle')}
            aria-expanded={helpOpen}
            onClick={() => setHelpOpen((open) => !open)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {helpOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="absolute end-0 top-10 z-50 w-64 overflow-hidden rounded-xl bg-[#1b1e26]/[0.97] p-3 text-[11px] leading-relaxed text-white/70 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-xl"
              >
                <p className="mb-2 text-[11px] font-semibold text-white/90">
                  {t('formWindow.helpTitle')}
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <span className="text-red-400" aria-hidden="true">
                      *
                    </span>
                    {t('formWindow.requiredHint')}
                  </li>
                  <li>{t('formWindow.ctrlSHint')}</li>
                  <li>{t('formWindow.closeHint')}</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Sticky action bar + collapsible sub panel ── */}
      {actionBar}
      {subPanel}

      {/* ── Content area (the only scrollable region) ── */}
      <section className="min-h-0 flex-1 overflow-y-auto text-[12px] [scrollbar-width:thin]">
        {children}
      </section>

      {/* ── Status footer ── */}
      {footer}
    </div>
  );
}
