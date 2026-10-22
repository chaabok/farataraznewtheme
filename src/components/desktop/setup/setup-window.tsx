'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
  Database,
  FileStack,
  HardDrive,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import { createElement } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { getIcon } from '@/components/desktop/icon-registry';
import { getLocalizedModuleMeta, useTranslation } from '@/i18n';
import { useSetupStore } from '@/store/setup-store';
import type { SetupDatabaseItem } from '@/types/desktop';

/** Spring entrance of the installation settings window. */
const panelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 22 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 340, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

const MAIN_ACCENT = '#38bdf8';
const SECONDARY_ACCENT = '#34d399';

function DatabaseCard({
  database,
  label,
  accent,
  icon,
}: {
  database: SetupDatabaseItem;
  label: string;
  accent: string;
  icon: 'main' | 'secondary';
}) {
  const { tf, formatNumber } = useTranslation();
  return (
    <div
      className="relative flex items-center gap-3 overflow-hidden rounded-xl bg-white/[0.04] p-3.5 ring-1 ring-white/10"
      role="status"
    >
      <div
        className="pointer-events-none absolute -top-10 end-0 h-24 w-32 rounded-full opacity-15 blur-2xl"
        style={{ background: accent }}
        aria-hidden="true"
      />
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg ring-1 ring-white/25"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}b3)`,
        }}
      >
        {createElement(icon === 'main' ? Database : HardDrive, {
          className: 'h-5 w-5 text-white',
          strokeWidth: 1.8,
        })}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-white/90">
          {label}
        </p>
        <p
          dir="ltr"
          className="truncate text-start font-mono text-[11px] text-white/40"
        >
          {database.file}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[10px] text-white/70">
          {tf('setup.selectedServices', {
            count: formatNumber(database.serviceCount),
          })}
        </span>
        <span className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[10px] text-white/55">
          {tf('setup.recordsCount', {
            count: formatNumber(database.recordCount),
          })}
        </span>
      </div>
    </div>
  );
}

/**
 * Windows 11 style "App Installation Settings" window:
 * selected services install into the MAIN database, unselected ones into
 * the SECONDARY database — switching a service migrates its records
 * between the two databases purely through the setup-service API.
 */
export function SetupWindow() {
  const isOpen = useSetupStore((s) => s.isSetupWindowOpen);
  const overview = useSetupStore((s) => s.overview);
  const isLoading = useSetupStore((s) => s.isLoading);
  const error = useSetupStore((s) => s.error);
  const pendingKey = useSetupStore((s) => s.pendingKey);
  const closeSetupWindow = useSetupStore((s) => s.closeSetupWindow);
  const fetchOverview = useSetupStore((s) => s.fetchOverview);
  const toggleService = useSetupStore((s) => s.toggleService);
  const addDemoRecord = useSetupStore((s) => s.addDemoRecord);

  const { locale, t, tf, formatNumber } = useTranslation();

  const databases = overview?.databases ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="setup-window-root">
          {/* Backdrop: dims the desktop; click closes the window */}
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
              closeSetupWindow();
            }}
            className="absolute inset-0 z-[500] cursor-default bg-black/40 backdrop-blur-[2px]"
          />

          {/* Centered glass panel */}
          <div
            className="pointer-events-none absolute inset-0 z-[501] flex items-center justify-center p-3"
            role="dialog"
            aria-modal="true"
            aria-label={t('setup.aria')}
          >
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto flex max-h-[min(84vh,700px)] w-[min(94vw,720px)] flex-col overflow-hidden rounded-2xl ring-1 ring-white/10 backdrop-blur-2xl"
              style={{
                background: 'rgba(23, 25, 32, 0.93)',
                boxShadow:
                  '0 32px 90px -20px rgba(0, 0, 0, 0.65), 0 24px 80px -36px rgba(56, 189, 248, 0.4)',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              {/* ── Header ── */}
              <div className="relative flex shrink-0 items-center gap-4 overflow-hidden px-5 pb-4 pt-6 sm:px-6">
                <div
                  className="pointer-events-none absolute -top-24 start-0 h-48 w-72 rounded-full opacity-20 blur-3xl"
                  style={{
                    background: `linear-gradient(120deg, ${MAIN_ACCENT}, ${SECONDARY_ACCENT})`,
                  }}
                  aria-hidden="true"
                />
                <span
                  className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 ring-white/25"
                  style={{
                    background: `linear-gradient(135deg, ${MAIN_ACCENT}, ${SECONDARY_ACCENT})`,
                  }}
                >
                  <Database
                    className="h-7 w-7 text-white drop-shadow-sm"
                    strokeWidth={1.8}
                  />
                </span>
                <div className="relative min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold text-white">
                    {t('setup.title')}
                  </h2>
                  <p className="mt-0.5 line-clamp-2 text-xs text-white/55">
                    {t('setup.subtitle')}
                  </p>
                </div>
                <button
                  type="button"
                  title={t('window.close')}
                  aria-label={t('window.close')}
                  onClick={closeSetupWindow}
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* ── Database cards ── */}
              <div className="grid shrink-0 grid-cols-1 gap-2.5 border-t border-white/[0.06] px-5 py-4 sm:grid-cols-2 sm:px-6">
                {databases.length ? (
                  databases.map((database) => (
                    <DatabaseCard
                      key={database.key}
                      database={database}
                      label={
                        database.key === 'main'
                          ? t('setup.mainDb')
                          : t('setup.secondaryDb')
                      }
                      accent={
                        database.key === 'main' ? MAIN_ACCENT : SECONDARY_ACCENT
                      }
                      icon={database.key}
                    />
                  ))
                ) : (
                  <>
                    <Skeleton className="h-[68px] rounded-xl bg-white/[0.05]" />
                    <Skeleton className="h-[68px] rounded-xl bg-white/[0.05]" />
                  </>
                )}
              </div>

              {/* ── Services list ── */}
              <div className="min-h-0 flex-1 overflow-y-auto border-t border-white/[0.06] px-5 py-3 [scrollbar-width:thin] sm:px-6">
                {error && !isLoading ? (
                  <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-center">
                    <p className="max-w-xs text-sm text-red-200/90">{error}</p>
                    <button
                      type="button"
                      onClick={() => void fetchOverview()}
                      className="flex items-center gap-2 rounded-lg bg-white/[0.07] px-4 py-2 text-[13px] text-white/80 transition-colors hover:bg-white/[0.12]"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {t('common.retry')}
                    </button>
                  </div>
                ) : isLoading && !overview ? (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton
                        key={`service-skeleton-${index}`}
                        className="h-[58px] rounded-xl bg-white/[0.05]"
                      />
                    ))}
                  </div>
                ) : (
                  <ul
                    className="flex flex-col gap-1.5"
                    aria-label={t('setup.title')}
                  >
                    {(overview?.services ?? []).map((service) => {
                      const meta = getLocalizedModuleMeta(
                        service.moduleKey,
                        locale,
                      );
                      const name = meta?.name ?? service.name;
                      const color = meta?.color ?? MAIN_ACCENT;
                      const pending = pendingKey === service.moduleKey;
                      return (
                        <li
                          key={service.moduleKey}
                          className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.05] transition-colors hover:bg-white/[0.05]"
                        >
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-white/10"
                            style={{ background: `${color}24` }}
                          >
                            {createElement(getIcon(service.moduleKey), {
                              className: 'h-4 w-4',
                              strokeWidth: 1.8,
                              style: { color },
                            })}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-white/90">
                              {name}
                            </p>
                            <p className="flex items-center gap-1.5 text-[11px] text-white/45">
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{
                                  background:
                                    service.databaseKey === 'main'
                                      ? MAIN_ACCENT
                                      : SECONDARY_ACCENT,
                                }}
                                aria-hidden="true"
                              />
                              {t(
                                service.databaseKey === 'main'
                                  ? 'setup.installedMain'
                                  : 'setup.installedSecondary',
                              )}
                            </p>
                          </div>

                          <span
                            className="flex shrink-0 items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1 text-[11px] text-white/60"
                            title={tf('setup.recordsCount', {
                              count: formatNumber(service.recordCount),
                            })}
                          >
                            <FileStack className="h-3.5 w-3.5" />
                            {formatNumber(service.recordCount)}
                          </span>

                          <button
                            type="button"
                            title={t('setup.addRecord')}
                            aria-label={t('setup.addRecord')}
                            disabled={pending}
                            onClick={() =>
                              void addDemoRecord(service.moduleKey)
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>

                          <Switch
                            checked={service.selected}
                            disabled={pending}
                            onCheckedChange={(checked) =>
                              void toggleService(service.moduleKey, checked)
                            }
                            aria-label={`${name} — ${
                              service.selected
                                ? t('setup.mainDb')
                                : t('setup.secondaryDb')
                            }`}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-3 sm:px-6">
                <button
                  type="button"
                  title={t('setup.refresh')}
                  aria-label={t('setup.refresh')}
                  onClick={() => void fetchOverview()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <span className="min-w-0 truncate text-[11px] text-white/35">
                  {t('setup.footerHint')}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
