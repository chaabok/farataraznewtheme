'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, House, X } from 'lucide-react';
import { createElement } from 'react';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import { useDesktopStore, type DesktopTab } from '@/store/desktop-store';
import { getIcon } from '../icon-registry';

/** Staggered entrance of the whole strip. */
const barVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 30 },
  },
};

const tabVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.03 * index, duration: 0.22, ease: 'easeOut' as const },
  }),
};

/**
 * The dashboard tab bar — browser-style workspace tabs directly below the
 * header. First tab is always «صفحه اصلی» (the live desktop); every opened
 * form/module becomes a tab that stays alive while hidden. 2026 look:
 * glass strip, sliding active pill + accent underline (layoutId), edge
 * fade masks and hover scroll arrows when the tabs overflow.
 */
export function TabBar() {
  const { t, direction } = useTranslation();
  const tabs = useDesktopStore((s) => s.tabs);
  const activeTabId = useDesktopStore((s) => s.activeTabId);
  const activateTab = useDesktopStore((s) => s.activateTab);
  const closeTab = useDesktopStore((s) => s.closeTab);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);

  /** Recompute edge-fade + arrow visibility from the scroll position. */
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollStart(el.scrollLeft > 4);
    setCanScrollEnd(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useLayoutEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onResize = () => updateScrollState();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [tabs.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    // In RTL the visual "next" page is towards negative scrollLeft.
    const sign = direction === 'rtl' ? -1 : 1;
    el.scrollBy({ left: dir * sign * el.clientWidth * 0.6, behavior: 'smooth' });
  };

  const isHomeTab = (tab: DesktopTab) => tab.kind === 'home';

  return (
    <motion.nav
      variants={barVariants}
      initial="hidden"
      animate="visible"
      aria-label={t('tabs.tabBar')}
      className="relative z-20 flex h-[26px] shrink-0 items-stretch border-b border-white/10 bg-[#141721]/80 backdrop-blur-xl"
    >
      {/* Scroll arrows (only when overflowing) */}
      {canScrollStart && (
        <button
          type="button"
          aria-label={t('tabs.scrollStart')}
          onClick={() => scrollByPage(-1)}
          className="relative z-10 flex w-6 shrink-0 items-center justify-center text-white/50 transition-colors hover:text-white"
        >
          <ChevronLeft
            className={cn('h-3.5 w-3.5', direction === 'rtl' && 'rotate-180')}
          />
        </button>
      )}

      <div className="relative min-w-0 flex-1">
        {/* Edge fade masks */}
        <span
          className={cn(
            'pointer-events-none absolute inset-y-0 start-0 z-10 w-6 from-[#141721] to-transparent transition-opacity ltr:bg-gradient-to-r rtl:bg-gradient-to-l',
            canScrollStart ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            'pointer-events-none absolute inset-y-0 end-0 z-10 w-6 bg-gradient-to-l from-[#141721] to-transparent transition-opacity ltr:bg-gradient-to-l rtl:bg-gradient-to-r',
            canScrollEnd ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden="true"
        />

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex h-full items-stretch gap-0.5 overflow-x-auto px-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTabId === tab.id;
            const home = isHomeTab(tab);
            const Icon = home ? House : getIcon(tab.iconKey);
            return (
              <motion.div
                key={tab.id}
                custom={index}
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                className="relative flex shrink-0 items-stretch"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => activateTab(tab.id)}
                  onAuxClick={(event) => {
                    // Middle-click closes the tab (browser muscle memory).
                    if (event.button === 1 && !home) {
                      event.preventDefault();
                      closeTab(tab.id);
                    }
                  }}
                  title={home ? t('tabs.home') : tab.title}
                  className={cn(
                    'group relative flex min-w-0 items-center gap-1.5 rounded-t-lg px-2.5 pt-0.5 pb-0.5 text-[12px] font-medium transition-colors focus-visible:outline-none sm:px-3',
                    isActive
                      ? 'text-white'
                      : 'text-white/55 hover:bg-white/[0.05] hover:text-white/90',
                  )}
                >
                  {/* Sliding active pill */}
                  {isActive && (
                    <motion.span
                      layoutId="tab-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-x-1 inset-y-0.5 -z-10 rounded-lg bg-white/[0.08] ring-1 ring-white/10"
                      aria-hidden="true"
                    />
                  )}

                  {/* Icon chip */}
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 transition-all',
                      isActive ? 'ring-white/20' : 'ring-white/10',
                    )}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${tab.accentColor}33, ${tab.accentColor}14)`,
                            color: tab.accentColor,
                          }
                        : undefined
                    }
                  >
                    {createElement(Icon, {
                      className: cn('h-3 w-3', !isActive && 'text-white/60'),
                      strokeWidth: 1.9,
                    })}
                  </span>

                  <span className="max-w-[150px] truncate sm:max-w-[190px]">
                    {home ? t('tabs.home') : tab.title}
                  </span>

                  {/* Close button (not on Home) */}
                  {!home && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`${t('tabs.closeTab')} — ${tab.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        closeTab(tab.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.stopPropagation();
                          closeTab(tab.id);
                        }
                      }}
                      className="-me-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md text-white/40 opacity-0 transition-all hover:bg-white/10 hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 group-hover:opacity-100 data-[active]:opacity-100"
                      data-active={isActive ? 'true' : undefined}
                    >
                      <X className="h-2.5 w-2.5" strokeWidth={2.2} />
                    </span>
                  )}
                </button>

                {/* Accent underline indicator of the active tab */}
                {isActive && (
                  <motion.span
                    layoutId="tab-active-underline"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-x-2 bottom-0 h-[2px] rounded-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${tab.accentColor}, transparent)`,
                      boxShadow: `0 0 12px ${tab.accentColor}66`,
                    }}
                    aria-hidden="true"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {canScrollEnd && (
        <button
          type="button"
          aria-label={t('tabs.scrollEnd')}
          onClick={() => scrollByPage(1)}
          className="relative z-10 flex w-6 shrink-0 items-center justify-center text-white/50 transition-colors hover:text-white"
        >
          <ChevronRight
            className={cn('h-3.5 w-3.5', direction === 'rtl' && 'rotate-180')}
          />
        </button>
      )}
    </motion.nav>
  );
}
