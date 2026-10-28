'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

export interface FormTabItem {
  /** Tab key (`null` = main section). */
  key: string | null;
  name: string;
  /** Number of fields inside the tab (shown as a badge). */
  count: number;
}

interface FormTabsProps {
  tabs: FormTabItem[];
  active: string | null;
  onChange: (key: string | null) => void;
  /** Accent hex color from the FormDef (active pill gradient). */
  accentColor: string;
  /** Reading direction — slides the panel in from the forward side. */
  direction: 'rtl' | 'ltr';
  children?: ReactNode;
}

/**
 * Segmented tab strip with a spring `layoutId` active indicator and a
 * direction-aware slide transition of the active panel.
 */
export function FormTabs({
  tabs,
  active,
  onChange,
  accentColor,
  direction,
  children,
}: FormTabsProps) {
  const { formatNumber } = useTranslation();
  const slide = direction === 'rtl' ? -1 : 1;

  if (!tabs.length) return <>{children}</>;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="tablist"
        aria-label={tabs.map((tab) => tab.name).join(' · ')}
        className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-white/10 bg-white/[0.02] px-3 py-1.5 [scrollbar-width:thin]"
      >
        {tabs.map((tab) => {
          const isActive = (tab.key ?? null) === (active ?? null);
          return (
            <button
              key={tab.key ?? 'main'}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key ?? null)}
              className={cn(
                'relative shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40',
                isActive
                  ? 'text-white'
                  : 'text-white/55 hover:bg-white/[0.04] hover:text-white/85',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="form-tab-active-pill"
                  className="absolute inset-0 rounded-lg ring-1 ring-white/15"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}66, ${accentColor}1f)`,
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {tab.name}
                <span
                  className={cn(
                    'rounded-md px-1.5 py-px text-[10px] tabular-nums',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white/[0.07] text-white/45',
                  )}
                >
                  {formatNumber(tab.count)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active ?? 'main'}
            initial={{ opacity: 0, x: 16 * slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 * slide }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
