'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, List, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n';
import { apiFetch, SessionExpiredError } from '@/lib/api-client';
import type { FormWindowInfo } from '@/store/desktop-store';
import type {
  FormDataMap,
  FormDef,
  FormFieldValue,
  FormRecord,
} from '@/types/forms';
import { cn } from '@/lib/utils';
import { FormActionBar, type FormMode } from './action-bar';
import { FieldRenderer } from './field-renderer';
import {
  DEFAULT_FORM_ACCENT,
  fieldsGridClasses,
} from './form-styles';
import { FormFooter, type FormStatus } from './form-footer';
import { FormShell } from './form-shell';
import { FormTabs } from './form-tabs';
import {
  buildDefaults,
  deriveTabs,
  fieldLabel,
  formTitle,
  isEmptyRequiredValue,
  isChangedValue,
  formatFieldValue,
  pickListColumns,
} from './form-utils';
import { TreePanel } from './tree-panel';

export interface DataFormWindowProps {
  /** Window id — `form:<formKey>` (moduleKey defaults to `settings`). */
  moduleId: string;
  /** Descriptor attached by `openFormWindow` in the desktop store. */
  form?: FormWindowInfo;
  /** Closes the hosting window ("save & close" / "delete & close"). */
  onClose?: () => void;
}

/** Which combined action a pending delete confirmation belongs to. */
type DeleteIntent = 'current' | 'new' | 'close' | null;

/** Outcome of the shared save pipeline. */
type SaveResult = 'saved' | 'clean' | 'invalid' | 'error';

/** Fallback parsing of the window id when no descriptor is attached. */
function parseModuleId(moduleId: string): {
  moduleKey: string | null;
  formKey: string | null;
} {
  if (!moduleId.startsWith('form:')) {
    return { moduleKey: null, formKey: null };
  }
  const formKey = moduleId.slice('form:'.length);
  return { moduleKey: formKey ? 'settings' : null, formKey: formKey || null };
}

/** Sentinel kept in state so load errors render through the dictionaries. */
const GENERIC_LOAD_ERROR = 'formWindow.loadError';

/**
 * Generic, database-driven form window: loads a FormDef + its records and
 * drives the whole view/new/edit state machine (dirty tracking, CRUD,
 * record navigation, Ctrl+S, records drawer) through the shared form
 * component library. One implementation renders every ERP form.
 */
export function DataFormWindow({ moduleId, form, onClose }: DataFormWindowProps) {
  const { locale, direction, t, tf, formatNumber } = useTranslation();

  const fallback = useMemo(() => parseModuleId(moduleId), [moduleId]);
  const moduleKey = form?.moduleKey ?? fallback.moduleKey;
  const formKey = form?.formKey ?? fallback.formKey;
  const basePath =
    moduleKey && formKey ? `/api/modules/${moduleKey}/forms/${formKey}` : null;
  const lookupUrlBase = basePath ? `${basePath}/lookups` : '';

  // ── Data ──
  const [def, setDef] = useState<FormDef | null>(null);
  const [records, setRecords] = useState<FormRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Record state machine ──
  const [mode, setMode] = useState<FormMode>('view');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [draft, setDraft] = useState<FormDataMap>({});
  const [baseline, setBaseline] = useState<FormDataMap>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  /**
   * Pending delete request awaiting the confirm dialog — `current` =
   * delete and stay, `new` = delete then reset for a fresh entry,
   * `close` = delete then close the window.
   */
  const [deleteIntent, setDeleteIntent] = useState<DeleteIntent>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState<string | null>(null);

  const current =
    currentIndex >= 0 && currentIndex < records.length
      ? records[currentIndex]
      : null;

  const isDirty = useMemo(() => {
    const keys = new Set([...Object.keys(baseline), ...Object.keys(draft)]);
    for (const key of keys) {
      if (isChangedValue(baseline[key], draft[key])) return true;
    }
    return false;
  }, [baseline, draft]);

  const status: FormStatus =
    mode === 'new' ? (isDirty ? 'unsaved' : 'new') : isDirty ? 'unsaved' : 'saved';

  // ── Loading ──
  const load = useCallback(async () => {
    if (!basePath) {
      setLoadError(GENERIC_LOAD_ERROR);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const [defRes, recordsRes] = await Promise.all([
        apiFetch<{ data: FormDef }>(
          `${basePath}?locale=${encodeURIComponent(locale)}`,
        ),
        apiFetch<{ data: FormRecord[] }>(`${basePath}/records`),
      ]);
      const nextDef = defRes.data;
      const nextRecords = recordsRes.data ?? [];
      setDef(nextDef);
      setRecords(nextRecords);

      if (nextRecords.length) {
        const lastIndex = nextRecords.length - 1;
        const last = nextRecords[lastIndex];
        setCurrentIndex(lastIndex);
        setDraft({ ...last.data });
        setBaseline({ ...last.data });
        setMode('view');
      } else {
        const defaults = buildDefaults(nextDef.fields);
        setCurrentIndex(-1);
        setDraft({ ...defaults });
        setBaseline({ ...defaults });
        setMode('new');
      }

      const firstTab = deriveTabs(nextDef, locale)[0] ?? null;
      setActiveTabKey(firstTab ? firstTab.key : null);
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      setLoadError(
        error instanceof Error && error.message
          ? error.message
          : GENERIC_LOAD_ERROR,
      );
    } finally {
      setIsLoading(false);
    }
  }, [basePath, locale]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshRecords = useCallback(async (): Promise<FormRecord[]> => {
    if (!basePath) return [];
    const res = await apiFetch<{ data: FormRecord[] }>(`${basePath}/records`);
    const list = res.data ?? [];
    setRecords(list);
    return list;
  }, [basePath]);

  // ── Record transitions ──
  const applyRecord = useCallback((index: number, list: FormRecord[]) => {
    const target = list[index];
    setCurrentIndex(index);
    setMode('view');
    if (target) {
      setDraft({ ...target.data });
      setBaseline({ ...target.data });
    }
  }, []);

  const navigateTo = useCallback(
    (index: number) => {
      if (isSaving || isDeleting) return;
      if (index < 0 || index >= records.length) return;
      if (mode !== 'view' && isDirty && !window.confirm(t('formWindow.navDiscardConfirm'))) {
        return;
      }
      applyRecord(index, records);
    },
    [applyRecord, isDeleting, isDirty, isSaving, mode, records, t],
  );

  const startNew = useCallback(
    (preset?: FormDataMap) => {
      if (!def) return;
      const base = { ...buildDefaults(def.fields), ...(preset ?? {}) };
      setDraft(base);
      setBaseline({ ...base });
      setMode('new');
      setCurrentIndex(-1);
    },
    [def],
  );

  const handleNew = useCallback(() => {
    if (mode === 'new') return;
    if (isDirty && !window.confirm(t('formWindow.navDiscardConfirm'))) return;
    startNew();
  }, [isDirty, mode, startNew, t]);

  const handleCopy = useCallback(() => {
    if (mode !== 'view' || !current) return;
    startNew({ ...current.data });
    toast({ title: t('formWindow.copyToast') });
  }, [current, mode, startNew, t]);

  /**
   * Shared save pipeline for every save action: validates required
   * fields, writes the draft to the database and refreshes the record
   * list. `keepRecord: false` skips re-selecting the saved record
   * (used by "save & new", which resets the form right after).
   */
  const performSave = useCallback(
    async (options?: { keepRecord?: boolean }): Promise<SaveResult> => {
      if (!def || !basePath || isSaving || isDeleting) return 'error';
      if (mode === 'view' || !isDirty) return 'clean';

      const missingField = def.fields.find((field) =>
        isEmptyRequiredValue(field, draft[field.fieldKey]),
      );
      if (missingField) {
        toast({
          title: fieldLabel(missingField, locale),
          description: t('formWindow.requiredHint'),
          variant: 'destructive',
        });
        return 'invalid';
      }

      setIsSaving(true);
      try {
        const saved =
          mode === 'new'
            ? (
                await apiFetch<{ data: FormRecord }>(`${basePath}/records`, {
                  method: 'POST',
                  body: { data: draft },
                })
              ).data
            : (
                await apiFetch<{ data: FormRecord }>(
                  `${basePath}/records/${encodeURIComponent(current?.id ?? '')}`,
                  { method: 'PUT', body: { data: draft } },
                )
              ).data;

        const list = await refreshRecords();
        if (options?.keepRecord !== false) {
          const index = list.findIndex((record) => record.id === saved.id);
          if (index >= 0) {
            applyRecord(index, list);
          } else {
            setMode('view');
          }
        }
        return 'saved';
      } catch (error) {
        if (!(error instanceof SessionExpiredError)) {
          toast({
            title: t('formWindow.saveError'),
            description: error instanceof Error ? error.message : undefined,
            variant: 'destructive',
          });
        }
        return 'error';
      } finally {
        setIsSaving(false);
      }
    },
    [
      applyRecord,
      basePath,
      current,
      def,
      draft,
      isDeleting,
      isDirty,
      isSaving,
      locale,
      mode,
      refreshRecords,
      t,
    ],
  );

  const handleSave = useCallback(async () => {
    const result = await performSave();
    if (result === 'saved') toast({ title: t('formWindow.saveSuccess') });
  }, [performSave, t]);

  /** Save & new: write the record, then reset the form for a fresh entry. */
  const handleSaveNew = useCallback(async () => {
    if (isSaving || isDeleting) return;
    const result = await performSave({ keepRecord: false });
    if (result === 'error' || result === 'invalid') return;
    startNew();
    if (result === 'saved') toast({ title: t('formWindow.saveNewSuccess') });
  }, [isDeleting, isSaving, performSave, startNew, t]);

  /** Save & close: write the record after validation, then close. */
  const handleSaveClose = useCallback(async () => {
    if (isSaving || isDeleting) return;
    const result = await performSave();
    if (result === 'error' || result === 'invalid') return;
    if (result === 'saved') toast({ title: t('formWindow.saveCloseSuccess') });
    onClose?.();
  }, [isDeleting, isSaving, onClose, performSave, t]);

  /** First click on any delete action opens the confirm dialog. */
  const requestDelete = useCallback(
    (intent: Exclude<DeleteIntent, null>) => {
      if (!current || mode === 'new' || isSaving || isDeleting) return;
      setDeleteIntent(intent);
    },
    [current, isDeleting, isSaving, mode],
  );

  /** Runs after the user presses «بلی» in the confirm dialog. */
  const confirmDelete = useCallback(async () => {
    if (isDeleting || !deleteIntent) return;
    const intent = deleteIntent;
    if (!basePath || !current) {
      setDeleteIntent(null);
      return;
    }
    setIsDeleting(true);
    try {
      // DELETE answers 204 with an empty body — nothing to parse.
      await apiFetch(
        `${basePath}/records/${encodeURIComponent(current.id)}`,
        {
          method: 'DELETE',
        },
      );
      setDeleteIntent(null);
      if (intent === 'close') {
        toast({ title: t('formWindow.deleteCloseSuccess') });
        onClose?.();
        return;
      }
      const list = await refreshRecords();
      if (intent === 'new') {
        startNew();
        toast({ title: t('formWindow.deleteNewSuccess') });
      } else if (list.length) {
        applyRecord(Math.min(currentIndex, list.length - 1), list);
        toast({ title: t('formWindow.deleteSuccess') });
      } else {
        setCurrentIndex(-1);
        startNew();
        toast({ title: t('formWindow.deleteSuccess') });
      }
    } catch (error) {
      setDeleteIntent(null);
      if (error instanceof SessionExpiredError) return;
      toast({
        title: error instanceof Error && error.message
          ? error.message
          : t('formWindow.loadError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [
    applyRecord,
    basePath,
    currentIndex,
    current,
    deleteIntent,
    isDeleting,
    onClose,
    refreshRecords,
    startNew,
    t,
  ]);

  const handlePrint = useCallback(() => {
    toast({ title: t('formWindow.printToast') });
  }, [t]);

  const handleFieldChange = useCallback(
    (fieldKey: string, value: FormFieldValue) => {
      setDraft((prev) => ({ ...prev, [fieldKey]: value }));
      setMode((prev) => (prev === 'view' ? 'edit' : prev));
    },
    [],
  );

  // Ctrl+S / Cmd+S saves the active draft (Escape is handled by the dialog).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        !event.altKey &&
        event.key.toLowerCase() === 's'
      ) {
        event.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  // ── Derived view models ──
  const sortedFields = useMemo(
    () => (def ? [...def.fields].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [def],
  );

  const tabs = useMemo(() => (def ? deriveTabs(def, locale) : []), [def, locale]);
  const activeTab =
    tabs.find((tab) => (tab.key ?? null) === (activeTabKey ?? null)) ??
    tabs[0] ??
    null;

  const listColumns = useMemo(
    () => pickListColumns(sortedFields),
    [sortedFields],
  );

  const title = def
    ? formTitle(def, locale)
    : form?.name ?? t('common.loading');
  const subtitle =
    mode === 'new'
      ? t('formWindow.newMode')
      : current
        ? tf('formWindow.recordOf', {
            n: formatNumber(currentIndex + 1),
            total: formatNumber(records.length),
          })
        : undefined;

  const accentColor = def?.accentColor || DEFAULT_FORM_ACCENT;

  /** The fields grid shared by simple forms and the active tab. */
  const renderFields = (fields: typeof sortedFields): ReactNode => (
    <div className={fieldsGridClasses}>
      {fields.map((field) => (
        <FieldRenderer
          key={field.fieldKey}
          field={field}
          value={draft[field.fieldKey] ?? null}
          onChange={(value) => handleFieldChange(field.fieldKey, value)}
          disabled={isSaving || isDeleting}
          lookupUrlBase={lookupUrlBase}
        />
      ))}
    </div>
  );

  let content: ReactNode;
  if (!def) {
    // Loading skeleton (error handled below).
    content = (
      <div className={fieldsGridClasses}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`form-skeleton-${index}`} className="space-y-1.5">
            <Skeleton className="h-3 w-24 bg-white/[0.08]" />
            <Skeleton className="h-10 w-full rounded-lg bg-white/[0.05]" />
          </div>
        ))}
      </div>
    );
  } else if (def.type === 'tree') {
    content = (
      <TreePanel
        records={records}
        fields={sortedFields}
        lookupUrlBase={lookupUrlBase}
      />
    );
  } else if (def.type === 'tabbed' && tabs.length > 0) {
    content = (
      <FormTabs
        tabs={tabs.map((tab) => ({
          key: tab.key,
          name: tab.name,
          count: tab.fields.length,
        }))}
        active={activeTab?.key ?? null}
        onChange={setActiveTabKey}
        accentColor={accentColor}
        direction={direction}
      >
        {renderFields(activeTab?.fields ?? [])}
      </FormTabs>
    );
  } else {
    content = renderFields(sortedFields);
  }

  const errorText =
    loadError === GENERIC_LOAD_ERROR ? t('formWindow.loadError') : loadError;

  return (
    <>
    <FormShell
      title={title}
      subtitle={subtitle}
      iconKey={def?.iconKey ?? form?.iconKey ?? 'fileText'}
      accentColor={accentColor}
      actionBar={
        <FormActionBar
          mode={mode}
          isDirty={isDirty}
          isSaving={isSaving}
          isDeleting={isDeleting}
          hasRecord={Boolean(current)}
          recordIndex={currentIndex}
          recordCount={records.length}
          isListOpen={isListOpen}
          onNew={handleNew}
          onSave={() => void handleSave()}
          onSaveNew={() => void handleSaveNew()}
          onSaveClose={() => void handleSaveClose()}
          onCopy={handleCopy}
          onDelete={() => requestDelete('current')}
          onDeleteNew={() => requestDelete('new')}
          onDeleteClose={() => requestDelete('close')}
          onPrint={handlePrint}
          onToggleList={() => setIsListOpen((open) => !open)}
          onFirst={() => navigateTo(0)}
          onPrev={() => navigateTo(Math.max(0, currentIndex - 1))}
          onNext={() => navigateTo(Math.min(records.length - 1, currentIndex + 1))}
          onLast={() => navigateTo(records.length - 1)}
        />
      }
      subPanel={
        <AnimatePresence initial={false}>
          {isListOpen && (
            <RecordsDrawer
              key="records-drawer"
              records={records}
              currentIndex={currentIndex}
              codeField={listColumns.codeField}
              titleField={listColumns.titleField}
              onJump={navigateTo}
              onClose={() => setIsListOpen(false)}
            />
          )}
        </AnimatePresence>
      }
      footer={
        <FormFooter
          status={status}
          position={
            current && mode !== 'new'
              ? { n: currentIndex + 1, total: records.length }
              : null
          }
          updatedAt={current?.updatedAt ?? null}
        />
      }
    >
      {errorText && !def ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="max-w-sm text-sm text-red-200/90">{errorText}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-2 rounded-lg bg-white/[0.07] px-4 py-2 text-[13px] text-white/80 transition-colors hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t('common.retry')}
          </button>
        </div>
      ) : (
        <>
          {errorText && def && (
            <div className="mx-4 mt-4 rounded-lg border border-red-400/30 bg-red-950/40 px-3 py-2 text-xs text-red-200/90">
              {errorText}
            </div>
          )}
          {records.length === 0 && def && def.type !== 'tree' ? (
            <div className="px-4 pb-2 pt-6 text-center">
              <p className="text-[13px] text-white/55">
                {t('formWindow.emptyRecords')}
              </p>
              <p className="mt-1 text-[11px] text-white/35">
                {t('formWindow.emptyRecordsHint')}
              </p>
            </div>
          ) : null}
          {content}
        </>
      )}
    </FormShell>

    {/* Single delete-confirmation dialog shared by all three delete actions. */}
    <AlertDialog
      open={deleteIntent !== null}
      onOpenChange={(open) => {
        if (!open) setDeleteIntent(null);
      }}
    >
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-[#1e2128]/95 text-white shadow-2xl shadow-black/60 backdrop-blur-xl sm:max-w-md">
        <AlertDialogHeader className="sm:text-start">
          <AlertDialogTitle className="flex items-center gap-2.5 text-base text-white">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 ring-1 ring-rose-400/30">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </span>
            {t('formWindow.deleteDialogTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-relaxed text-white/65">
            {t('formWindow.deleteDialogMessage')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-start">
          <AlertDialogCancel
            disabled={isDeleting}
            className="h-9 rounded-lg border-white/15 bg-white/[0.06] px-4 text-[13px] text-white/80 transition-colors hover:bg-white/[0.12] hover:text-white focus-visible:ring-white/40"
          >
            {t('formWindow.confirmNo')}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              // Keep the dialog open while the delete request runs.
              event.preventDefault();
              void confirmDelete();
            }}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-rose-500/90 px-4 text-[13px] text-white shadow-sm shadow-rose-950/40 transition-colors hover:bg-rose-500 focus-visible:ring-rose-300/60"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : null}
            {t('formWindow.confirmYes')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

interface RecordsDrawerProps {
  records: FormRecord[];
  currentIndex: number;
  codeField: ReturnType<typeof pickListColumns>['codeField'];
  titleField: ReturnType<typeof pickListColumns>['titleField'];
  onJump: (index: number) => void;
  onClose: () => void;
}

/** Collapsible records panel below the action bar (code + title columns). */
function RecordsDrawer({
  records,
  currentIndex,
  codeField,
  titleField,
  onJump,
  onClose,
}: RecordsDrawerProps) {
  const { t, formatNumber } = useTranslation();

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="shrink-0 overflow-hidden border-b border-white/10 bg-[#15171e]/70"
    >
      <div className="flex items-center justify-between px-3 pb-1 pt-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
          <List className="h-3.5 w-3.5 text-slate-300/80" aria-hidden="true" />
          {t('formWindow.recordsPanel')}
          <span className="rounded bg-white/[0.07] px-1.5 py-px text-[10px] tabular-nums text-white/45">
            {formatNumber(records.length)}
          </span>
        </span>
        <button
          type="button"
          title={t('formWindow.closeList')}
          aria-label={t('formWindow.closeList')}
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto px-2 pb-2 [scrollbar-width:thin]">
        {records.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-[13px] text-white/60">
              {t('formWindow.emptyRecords')}
            </p>
            <p className="mt-1 text-[11px] text-white/35">
              {t('formWindow.emptyRecordsHint')}
            </p>
          </div>
        ) : (
          records.map((record, index) => {
            const isCurrent = index === currentIndex;
            return (
              <button
                key={record.id}
                type="button"
                onClick={() => onJump(index)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start text-[12.5px] transition-colors',
                  isCurrent
                    ? 'bg-sky-500/15 ring-1 ring-sky-400/30'
                    : 'hover:bg-white/[0.05]',
                )}
              >
                <span className="w-6 shrink-0 text-end text-white/35 tabular-nums">
                  {formatNumber(index + 1)}
                </span>
                <span className="shrink-0 rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[10.5px] text-white/60">
                  {codeField
                    ? formatFieldValue(
                        codeField,
                        record.data[codeField.fieldKey],
                        formatNumber,
                      )
                    : '—'}
                </span>
                <span className="min-w-0 flex-1 truncate text-white/85">
                  {titleField
                    ? formatFieldValue(
                        titleField,
                        record.data[titleField.fieldKey],
                        formatNumber,
                      )
                    : record.id}
                </span>
                {isCurrent && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
