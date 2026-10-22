'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ArrowUpLeft, ChevronRight, RefreshCw, X } from 'lucide-react';
import { createElement } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { getLocalizedModuleMeta, useTranslation } from '@/i18n';
import { getModuleMeta } from '@/lib/modules-registry';
import { useAuthStore } from '@/store/auth-store';
import { useDesktopStore } from '@/store/desktop-store';
import { useSetupStore } from '@/store/setup-store';
import type { ModuleFormItem } from '@/types/desktop';
import { getIcon } from '../icon-registry';

/** Spring entrance of the whole flyout panel. */
const panelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 22 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/** Staggered entrance of the form cards. */
const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut' },
  },
};

/**
 * Windows 11 style module flyout menu — the creative launcher shown when
 * the user clicks a desktop icon. Dark glass matching the taskbar theme,
 * tinted with the module's own accent color, listing the module's menus
 * (from the desktop-service microservice, localized) and their forms.
 */
export function ModuleMenu() {
  const openModuleKey = useDesktopStore((s) => s.openMenuModuleKey);
  const menus = useDesktopStore((s) =>
    s.openMenuModuleKey
      ? (s.menusCache[`${s.locale}:${s.openMenuModuleKey}`] ?? null)
      : null,
  );
  const iconItem = useDesktopStore((s) =>
    s.openMenuModuleKey
      ? (s.icons.find((i) => i.iconKey === s.openMenuModuleKey) ?? null)
      : null,
  );
  const isMenusLoading = useDesktopStore((s) => s.isMenusLoading);
  const menusError = useDesktopStore((s) => s.menusError);
  const activeMenuId = useDesktopStore((s) => s.activeMenuId);
  const closeModuleMenu = useDesktopStore((s) => s.closeModuleMenu);
  const selectMenu = useDesktopStore((s) => s.selectMenu);
  const loadModuleMenus = useDesktopStore((s) => s.loadModuleMenus);
  const addFormTab = useDesktopStore((s) => s.addFormTab);
  const addListTab = useDesktopStore((s) => s.addListTab);
  const addBusinessStructureTab = useDesktopStore(
    (s) => s.addBusinessStructureTab,
  );
  const addModuleTab = useDesktopStore((s) => s.addModuleTab);
  const openSetupWindow = useSetupStore((s) => s.openSetupWindow);
  const isAuthenticated = useAuthStore((s) => Boolean(s.token));

  const { locale, direction, t, tf, formatNumber } = useTranslation();

  const meta = getLocalizedModuleMeta(openModuleKey ?? '', locale);
  const color = iconItem?.color ?? meta?.color ?? '#38bdf8';
  const moduleName = iconItem?.name ?? meta?.name ?? openModuleKey ?? '';

  const menuList = menus ?? [];
  const activeMenu =
    menuList.find((menu) => menu.id === activeMenuId) ?? menuList[0] ?? null;
  const totalForms = menuList.reduce((sum, menu) => sum + menu.forms.length, 0);

  /** Slides follow the reading direction (enter from the "forward" side). */
  const slide = direction === 'rtl' ? -1 : 1;

  /**
   * Opens the picked item as a workspace tab in the tab bar. The flyout
   * menu intentionally stays open — it is bound to the Home tab and
   * reappears when the user switches back to it.
   */
  const handleOpenForm = (form: ModuleFormItem) => {
    if (!openModuleKey) return;
    if (!isAuthenticated) {
      toast({
        title: t('toast.loginRequired.title'),
        description: t('toast.loginRequired.desc'),
      });
      return;
    }
    if (getModuleMeta(openModuleKey)) {
      // Special form: the application installation settings window
      // (selected services → main DB, unselected → secondary DB).
      if (openModuleKey === 'settings' && form.formKey === 'installation') {
        openSetupWindow();
        toast({
          title: form.name,
          description: t('setup.openedToast'),
        });
        return;
      }
      // Special window: the multi-company backbone «ساختار کسب و کار» —
      // a dedicated window hosting the generic TreeForm engine.
      if (
        openModuleKey === 'settings' &&
        form.formKey === 'business-structure'
      ) {
        addBusinessStructureTab({
          name: form.name,
          iconKey: form.iconKey,
        });
      } else if (form.formKey.startsWith('list:')) {
        addListTab({
          moduleKey: openModuleKey,
          formKey: form.formKey.slice('list:'.length),
          name: form.name,
          iconKey: form.iconKey,
        });
      } else if (form.formKey) {
        addFormTab({
          moduleKey: openModuleKey,
          formKey: form.formKey,
          name: form.name,
          iconKey: form.iconKey,
        });
      } else {
        // Generic module app (stats + records) as a workspace tab.
        addModuleTab({
          moduleId: openModuleKey,
          name: form.name,
          iconKey: form.iconKey,
          color,
        });
      }
      toast({
        title: form.name,
        description: tf('moduleMenu.formOpened', { module: moduleName }),
      });
    } else {
      toast({ title: form.name, description: t('toast.comingSoon') });
    }
  };

  return (
    <AnimatePresence>
      {openModuleKey && (
        <div key="module-menu-root">
          {/* Backdrop: dims the desktop only — the taskbar stays interactive */}
          <motion.button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => {
              event.stopPropagation();
              closeModuleMenu();
            }}
            className="absolute inset-0 z-[500] cursor-default bg-black/35 backdrop-blur-[2px]"
          />

          {/* Centered flyout panel */}
          <div
            className="pointer-events-none absolute inset-0 z-[501] flex items-center justify-center p-3"
            role="dialog"
            aria-modal="true"
            aria-label={`${t('moduleMenu.aria')} — ${moduleName}`}
          >
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto flex max-h-[min(80vh,640px)] w-[min(94vw,780px)] flex-col overflow-hidden rounded-2xl ring-1 ring-white/10 backdrop-blur-2xl"
              style={{
                background: 'rgba(23, 25, 32, 0.92)',
                boxShadow: `0 32px 90px -20px rgba(0, 0, 0, 0.65), 0 24px 80px -36px ${color}66`,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              {/* ── Header ── */}
              <div className="relative flex shrink-0 items-center gap-4 overflow-hidden px-5 pb-5 pt-6 sm:px-6">
                <div
                  className="pointer-events-none absolute -top-24 start-0 h-48 w-72 rounded-full opacity-25 blur-3xl"
                  style={{ background: color }}
                  aria-hidden="true"
                />
                <span
                  className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 ring-white/25"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}b3)`,
                  }}
                >
                  {createElement(
                    getIcon(iconItem?.iconKey ?? openModuleKey ?? 'monitor'),
                    {
                      className: 'h-7 w-7 text-white drop-shadow-sm',
                      strokeWidth: 1.8,
                    },
                  )}
                </span>
                <div className="relative min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold text-white">
                    {moduleName}
                  </h2>
                  <p className="mt-0.5 text-xs text-white/55">
                    {tf('moduleMenu.stats', {
                      forms: formatNumber(totalForms),
                      menus: formatNumber(menuList.length),
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  title={t('window.close')}
                  aria-label={t('window.close')}
                  onClick={closeModuleMenu}
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* ── Body: menu rail + forms ── */}
              <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto border-t border-white/[0.06] md:grid-cols-[252px_minmax(0,1fr)] md:overflow-hidden">
                {/* Menu rail */}
                <nav
                  aria-label={t('moduleMenu.aria')}
                  className="flex shrink-0 gap-1.5 overflow-x-auto p-3 [scrollbar-width:thin] md:flex-col md:overflow-x-visible md:overflow-y-auto"
                >
                  {isMenusLoading &&
                    !menuList.length &&
                    Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`menu-skeleton-${index}`}
                        className="flex h-[52px] w-full shrink-0 items-center gap-2.5 rounded-xl px-3 md:w-full"
                      >
                        <Skeleton className="h-8 w-8 shrink-0 rounded-lg bg-white/10" />
                        <Skeleton className="h-3.5 flex-1 rounded bg-white/[0.08]" />
                      </div>
                    ))}

                  {menuList.map((menu) => {
                    const isActive = activeMenu?.id === menu.id;
                    return (
                      <button
                        key={menu.id}
                        type="button"
                        onClick={() => selectMenu(menu.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`group relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 md:w-full ${
                          isActive
                            ? 'bg-white/[0.09] text-white'
                            : 'text-white/60 hover:bg-white/[0.05] hover:text-white/90'
                        }`}
                      >
                        {isActive && (
                          <span
                            className="absolute start-0 top-1/2 hidden h-6 w-[3px] -translate-y-1/2 rounded-full md:block"
                            style={{ background: color }}
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/10 transition-colors"
                          style={{
                            background: isActive
                              ? `${color}2e`
                              : 'rgba(255,255,255,0.05)',
                            color: isActive ? color : undefined,
                          }}
                        >
                          {createElement(getIcon(menu.iconKey), {
                            className: 'h-4 w-4',
                            strokeWidth: 1.9,
                            style: isActive
                              ? undefined
                              : { color: 'rgba(255,255,255,0.65)' },
                          })}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {menu.name}
                        </span>
                        <span className="hidden shrink-0 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/45 md:inline">
                          {formatNumber(menu.forms.length)}
                        </span>
                        <ChevronRight
                          className={`hidden h-4 w-4 shrink-0 text-white/35 transition-opacity rtl:-scale-x-100 md:block ${
                            isActive
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-60'
                          }`}
                        />
                      </button>
                    );
                  })}
                </nav>

                {/* Forms of the active menu */}
                <div className="min-h-0 p-4 md:overflow-y-auto [scrollbar-width:thin]">
                  {menusError && !menuList.length ? (
                    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 text-center">
                      <p className="max-w-xs text-sm text-red-200/90">
                        {menusError}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          openModuleKey && void loadModuleMenus(openModuleKey)
                        }
                        className="flex items-center gap-2 rounded-lg bg-white/[0.07] px-4 py-2 text-[13px] text-white/80 transition-colors hover:bg-white/[0.12]"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {t('common.retry')}
                      </button>
                    </div>
                  ) : isMenusLoading && !menuList.length ? (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton
                          key={`form-skeleton-${index}`}
                          className="h-[68px] rounded-xl bg-white/[0.05]"
                        />
                      ))}
                    </div>
                  ) : (
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={activeMenu?.id ?? 'empty'}
                        initial={{ opacity: 0, x: 10 * slide }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 * slide }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                      >
                        {activeMenu ? (
                          <>
                            <div className="mb-3 flex items-center justify-between gap-3 px-1">
                              <h3 className="truncate text-[13px] font-semibold text-white/85">
                                {activeMenu.name}
                              </h3>
                              <span className="shrink-0 text-[11px] text-white/40">
                                {tf('moduleMenu.formCount', {
                                  count: formatNumber(activeMenu.forms.length),
                                })}
                              </span>
                            </div>
                            {activeMenu.forms.length ? (
                              <motion.div
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid gap-2.5 sm:grid-cols-2"
                              >
                                {activeMenu.forms.map((form) => (
                                  <motion.button
                                    key={form.id}
                                    variants={itemVariants}
                                    type="button"
                                    onClick={() => handleOpenForm(form)}
                                    className="group relative flex items-center gap-3 overflow-hidden rounded-xl bg-white/[0.045] p-3.5 text-start ring-1 ring-white/[0.07] transition-all duration-150 hover:-translate-y-0.5 hover:bg-white/[0.085] hover:ring-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 active:scale-[0.98]"
                                  >
                                    <span
                                      className="absolute inset-y-3 start-0 w-[3px] rounded-full opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                      style={{ background: color }}
                                      aria-hidden="true"
                                    />
                                    <span
                                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-white/10"
                                      style={{ background: `${color}1f` }}
                                    >
                                      {createElement(getIcon(form.iconKey), {
                                        className: 'h-4 w-4',
                                        strokeWidth: 1.8,
                                        style: { color },
                                      })}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-white/90">
                                      {form.name}
                                    </span>
                                    <ArrowUpLeft className="h-4 w-4 shrink-0 text-white/40 opacity-0 transition-all duration-150 group-hover:opacity-100 ltr:-translate-x-1 ltr:rotate-90 rtl:translate-x-1" />
                                  </motion.button>
                                ))}
                              </motion.div>
                            ) : (
                              <p className="px-1 py-10 text-center text-sm text-white/40">
                                {t('moduleMenu.empty')}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="px-1 py-10 text-center text-sm text-white/40">
                            {t('moduleMenu.empty')}
                          </p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-3 sm:px-6">
                <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-white/35">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{moduleName}</span>
                </span>
                <span className="hidden shrink-0 text-[11px] text-white/30 sm:inline">
                  {t('moduleMenu.closeHint')}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
