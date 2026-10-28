'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building,
  Building2,
  Check,
  ChevronDown,
  Copy,
  FileText,
  ImageUp,
  Info,
  Landmark,
  Loader2,
  Network,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  Store,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
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
import type { DesktopTab } from '@/store/desktop-store';
import type {
  BsNode,
  BsRootSettings,
} from '@/types/business-structure';
import {
  BS_ALLOWED_CHILD_TYPES,
  BS_MAX_LEVEL,
} from '@/types/business-structure';
import type {
  FormDataMap,
  FormFieldDef,
  FormRecord,
} from '@/types/forms';
import { cn } from '@/lib/utils';
import { FormFooter, type FormStatus } from './form-footer';
import { FormShell } from './form-shell';
import { controlClasses } from './form-styles';
import { isChangedValue } from './form-utils';
import { TreeForm } from './tree-form';
import { useDismiss } from './use-dismiss';

/**
 * Dedicated window of «ساختار کسب و کار» — the multi-company backbone.
 *
 * The tree column reuses the generic `TreeForm` engine (search, hierarchy,
 * context menu) through its backward-compatible extension props (§5.1);
 * the detail column is bespoke per the reference design: a «تب اصلی /
 * کاربران مجاز» switch, the two-mode behavior (reserved system root vs.
 * business nodes), the parent-driven conditional structure-type picker,
 * the logo dropzone and the server-side hierarchical code.
 */

const BASE_PATH = '/api/modules/settings/business-structure';

/** Tree-engine field map (code + title columns + parent hierarchy). */
const BS_FIELDS: FormFieldDef[] = [
  {
    id: 'bs-parent',
    tabKey: null,
    tabName: null,
    fieldKey: 'parentId',
    label: 'والد',
    labelEn: 'Parent',
    fieldType: 'lookup',
    isRequired: false,
    span: 2,
    lookupKey: null,
    defaultValue: null,
    sortOrder: 0,
  },
  {
    id: 'bs-code',
    tabKey: null,
    tabName: null,
    fieldKey: 'code',
    label: 'کد',
    labelEn: 'Code',
    fieldType: 'text',
    isRequired: false,
    span: 1,
    lookupKey: null,
    defaultValue: null,
    sortOrder: 1,
  },
  {
    id: 'bs-title',
    tabKey: null,
    tabName: null,
    fieldKey: 'title',
    label: 'عنوان',
    labelEn: 'Title',
    fieldType: 'text',
    isRequired: true,
    span: 1,
    lookupKey: null,
    defaultValue: null,
    sortOrder: 2,
  },
  {
    id: 'bs-titleEn',
    tabKey: null,
    tabName: null,
    fieldKey: 'titleEn',
    label: 'عنوان لاتین',
    labelEn: 'Latin Title',
    fieldType: 'text',
    isRequired: false,
    span: 1,
    lookupKey: null,
    defaultValue: null,
    sortOrder: 3,
  },
];

/** Visual identity of every structure type (user-specified palette). */
interface BsTypeMeta {
  icon: LucideIcon;
  className: string;
  softClass: string;
  labelKey: string;
}

const BS_TYPE_META: Readonly<Record<number, BsTypeMeta>> = {
  0: {
    icon: Landmark,
    className: 'text-slate-300',
    softClass: 'bg-slate-400/15 text-slate-200 ring-slate-300/30',
    labelKey: 'bs.type.system',
  },
  1: {
    icon: Building2,
    className: 'text-violet-400',
    softClass: 'bg-violet-500/15 text-violet-300 ring-violet-400/30',
    labelKey: 'bs.type.headquarter',
  },
  2: {
    icon: Building,
    className: 'text-amber-400',
    softClass: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
    labelKey: 'bs.type.company',
  },
  3: {
    icon: Store,
    className: 'text-emerald-400',
    softClass: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
    labelKey: 'bs.type.branch',
  },
  4: {
    icon: Users,
    className: 'text-sky-400',
    softClass: 'bg-sky-500/15 text-sky-300 ring-sky-400/30',
    labelKey: 'bs.type.agency',
  },
};

const BS_ACTIVE_TYPES = [1, 2, 3, 4] as const;
const BS_LOGO_MAX_BYTES = 5 * 1024 * 1024;

type BsDetailTab = 'main' | 'users';

/** API row → generic FormRecord consumed by the tree engine. */
function toFormRecord(node: BsNode): FormRecord {
  return {
    id: node.id,
    data: {
      parentId: node.parentRef === '0' ? null : node.parentRef,
      code: node.code,
      title: node.title,
      titleEn: node.titleEn,
      structureType: node.structureType,
      manager: node.manager,
      logoUrl: node.logoUrl,
      isActive: node.isActive,
      isSystem: node.isSystem,
    },
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
}

function typeMetaOf(value: unknown): BsTypeMeta {
  return BS_TYPE_META[Number(value)] ?? BS_TYPE_META[2];
}

export interface BusinessStructureWindowProps {
  /** The workspace tab hosting this window. */
  tab: DesktopTab;
  /** Closes the hosting tab. */
  onClose?: () => void;
}

type SaveResult = 'saved' | 'clean' | 'invalid' | 'error';

export function BusinessStructureWindow({
  onClose,
}: BusinessStructureWindowProps) {
  const { t, tf, formatNumber } = useTranslation();

  // ── Data ───────────────────────────────────────────────────────────
  const [records, setRecords] = useState<FormRecord[]>([]);
  const [rootSettings, setRootSettings] = useState<BsRootSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Record state machine ──────────────────────────────────────────
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FormDataMap>({});
  const [baseline, setBaseline] = useState<FormDataMap>({});
  const [rootDraft, setRootDraft] = useState<BsRootSettings>({
    shareHeadquarterData: false,
    activeStructureTypes: [...BS_ACTIVE_TYPES],
  });
  const [rootBaseline, setRootBaseline] = useState<BsRootSettings>({
    shareHeadquarterData: false,
    activeStructureTypes: [...BS_ACTIVE_TYPES],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<BsDetailTab>('main');

  const byId = useMemo(
    () => new Map(records.map((record) => [record.id, record])),
    [records],
  );
  const current = mode === 'new' ? null : (selectedId ? (byId.get(selectedId) ?? null) : null);
  const isRootNode = current?.data.isSystem === true;

  const isNodeDirty = useMemo(() => {
    const keys = new Set([...Object.keys(baseline), ...Object.keys(draft)]);
    for (const key of keys) {
      if (isChangedValue(baseline[key], draft[key])) return true;
    }
    return false;
  }, [baseline, draft]);
  const isRootDirty = useMemo(
    () =>
      rootDraft.shareHeadquarterData !== rootBaseline.shareHeadquarterData ||
      rootDraft.activeStructureTypes.length !==
        rootBaseline.activeStructureTypes.length ||
      rootDraft.activeStructureTypes.some(
        (type, index) => rootBaseline.activeStructureTypes[index] !== type,
      ),
    [rootBaseline, rootDraft],
  );
  const isDirty = isRootNode ? isRootDirty : isNodeDirty;

  const status: FormStatus =
    mode === 'new'
      ? isDirty
        ? 'unsaved'
        : 'new'
      : isDirty
        ? 'unsaved'
        : 'saved';

  /** Depth of every node (system root = 0) via parent-chain resolution. */
  const depthById = useMemo(() => {
    const depths = new Map<string, number>();
    const resolve = (id: string, guard: Set<string>): number => {
      const cached = depths.get(id);
      if (cached !== undefined) return cached;
      const record = byId.get(id);
      const parentValue = record?.data.parentId;
      if (!record || typeof parentValue !== 'string' || !byId.has(parentValue)) {
        depths.set(id, 0);
        return 0;
      }
      if (guard.has(id)) return 0; // cycle safety net
      guard.add(id);
      const depth = 1 + resolve(parentValue, guard);
      depths.set(id, depth);
      return depth;
    };
    for (const record of records) resolve(record.id, new Set());
    return depths;
  }, [byId, records]);

  /** Types present in the tree — can never be deactivated at the root. */
  const usedTypes = useMemo(() => {
    const types = new Set<number>();
    for (const record of records) {
      if (record.data.isSystem !== true) {
        types.add(Number(record.data.structureType));
      }
    }
    return types;
  }, [records]);

  // ── Loading ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [listRes, settingsRes] = await Promise.all([
        apiFetch<{ data: BsNode[] }>(BASE_PATH),
        apiFetch<{ data: BsRootSettings }>(`${BASE_PATH}/settings`),
      ]);
      const nextRecords = (listRes.data ?? []).map(toFormRecord);
      setRecords(nextRecords);
      const nextSettings: BsRootSettings = {
        shareHeadquarterData: settingsRes.data.shareHeadquarterData,
        activeStructureTypes: settingsRes.data.activeStructureTypes,
      };
      setRootSettings(nextSettings);
      setRootDraft({
        ...nextSettings,
        activeStructureTypes: [...nextSettings.activeStructureTypes],
      });
      setRootBaseline({
        ...nextSettings,
        activeStructureTypes: [...nextSettings.activeStructureTypes],
      });

      setSelectedId((previous) => {
        if (previous && nextRecords.some((record) => record.id === previous)) {
          return previous;
        }
        return nextRecords[0]?.id ?? null;
      });
      setMode('view');
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      setLoadError(
        error instanceof Error && error.message ? error.message : '',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Applies a saved/selected record into view mode. */
  const applyRecord = useCallback((record: FormRecord | null) => {
    setDetailTab('main');
    if (!record) {
      setSelectedId(null);
      setDraft({});
      setBaseline({});
      setMode('view');
      return;
    }
    setSelectedId(record.id);
    setDraft({ ...record.data });
    setBaseline({ ...record.data });
    setMode('view');
  }, []);

  // ── Node transitions ──────────────────────────────────────────────
  const handleSelect = useCallback(
    (recordId: string) => {
      if (isSaving || isDeleting) return;
      if (recordId === selectedId && mode === 'view') return;
      if (isDirty && !window.confirm(t('formWindow.navDiscardConfirm'))) return;
      applyRecord(byId.get(recordId) ?? null);
    },
    [applyRecord, byId, isDeleting, isDirty, isSaving, mode, selectedId, t],
  );

  const systemRootId = useMemo(
    () => records.find((record) => record.data.isSystem === true)?.id ?? null,
    [records],
  );

  /** Allowed + active structure types under a given parent value. */
  const allowedTypesFor = useCallback(
    (parentId: unknown): number[] => {
      const parentType =
        typeof parentId === 'string' && byId.has(parentId)
          ? Number(byId.get(parentId)!.data.structureType)
          : 0;
      const allowed = BS_ALLOWED_CHILD_TYPES[parentType] ?? [];
      const active = rootSettings?.activeStructureTypes ?? [...BS_ACTIVE_TYPES];
      return allowed.filter((type) => active.includes(type));
    },
    [byId, rootSettings],
  );

  const startNew = useCallback(
    (preset?: FormDataMap) => {
      const parentId =
        preset?.parentId ??
        (mode !== 'new' && current && current.data.isSystem !== true
          ? current.id
          : systemRootId);
      const firstAllowed = allowedTypesFor(parentId)[0] ?? 2;
      const base: FormDataMap = {
        parentId: typeof parentId === 'string' ? parentId : null,
        code: null,
        title: '',
        titleEn: '',
        structureType: firstAllowed,
        manager: '',
        logoUrl: null,
        isActive: true,
        ...(preset ?? {}),
      };
      setDraft(base);
      setBaseline({ ...base });
      setMode('new');
      setDetailTab('main');
    },
    [allowedTypesFor, current, mode, systemRootId],
  );

  const handleNew = useCallback(() => {
    if (mode === 'new') return;
    // Level cap: a node on the last allowed level cannot take children.
    if (
      current &&
      current.data.isSystem !== true &&
      (depthById.get(current.id) ?? 0) >= BS_MAX_LEVEL
    ) {
      toast({
        title: t('bs.maxDepthTitle'),
        description: t('bs.maxDepthHint'),
        variant: 'destructive',
      });
      return;
    }
    if (isDirty && !window.confirm(t('formWindow.navDiscardConfirm'))) return;
    startNew();
  }, [current, depthById, isDirty, mode, startNew, t]);

  const handleCopy = useCallback(() => {
    if (mode !== 'view' || !current || current.data.isSystem === true) return;
    if (isDirty && !window.confirm(t('formWindow.navDiscardConfirm'))) return;
    startNew({ ...current.data, code: null });
    toast({ title: t('formWindow.copyToast') });
  }, [current, isDirty, mode, startNew, t]);

  // ── Save pipelines ────────────────────────────────────────────────
  const refreshRecords = useCallback(async (): Promise<FormRecord[]> => {
    const res = await apiFetch<{ data: BsNode[] }>(BASE_PATH);
    const list = (res.data ?? []).map(toFormRecord);
    setRecords(list);
    return list;
  }, []);

  const announceCompanyList = useCallback(() => {
    // Consumed by the future company selector (multi-tenancy phase).
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('company-list-updated'));
    }
  }, []);

  const validateNodeDraft = useCallback((): boolean => {
    if (!String(draft.title ?? '').trim()) {
      toast({
        title: t('bs.fieldTitle'),
        description: t('formWindow.requiredHint'),
        variant: 'destructive',
      });
      return false;
    }
    if (!String(draft.titleEn ?? '').trim()) {
      toast({
        title: t('bs.fieldTitleEn'),
        description: t('formWindow.requiredHint'),
        variant: 'destructive',
      });
      return false;
    }
    if (draft.structureType === null || draft.structureType === undefined) {
      toast({
        title: t('bs.fieldType'),
        description: t('bs.typeRequired'),
        variant: 'destructive',
      });
      return false;
    }
    if (mode === 'new' && typeof draft.parentId !== 'string') {
      toast({ title: t('bs.parentMissing'), variant: 'destructive' });
      return false;
    }
    return true;
  }, [draft, mode, t]);

  const performSave = useCallback(
    async (options?: { keepRecord?: boolean }): Promise<SaveResult> => {
      if (isSaving || isDeleting) return 'error';
      if (!isDirty) return 'clean';

      if (isRootNode) {
        setIsSaving(true);
        try {
          const saved = (
            await apiFetch<{ data: BsRootSettings }>(
              `${BASE_PATH}/root-settings`,
              { method: 'PUT', body: rootDraft },
            )
          ).data;
          const next: BsRootSettings = {
            shareHeadquarterData: saved.shareHeadquarterData,
            activeStructureTypes: [...saved.activeStructureTypes],
          };
          setRootBaseline({ ...next, activeStructureTypes: [...next.activeStructureTypes] });
          setRootSettings({ ...next, activeStructureTypes: [...next.activeStructureTypes] });
          announceCompanyList();
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
      }

      if (!validateNodeDraft()) return 'invalid';
      const titleEn =
        String(draft.titleEn ?? '').trim() || String(draft.title ?? '').trim();
      setIsSaving(true);
      try {
        const payload = {
          title: String(draft.title ?? '').trim(),
          titleEn,
          structureType: Number(draft.structureType),
          manager: draft.manager ? String(draft.manager) : null,
          logoUrl: draft.logoUrl ? String(draft.logoUrl) : null,
          isActive: draft.isActive === true,
        };
        const saved =
          mode === 'new'
            ? (
                await apiFetch<{ data: BsNode }>(BASE_PATH, {
                  method: 'POST',
                  body: { ...payload, parentRef: draft.parentId },
                })
              ).data
            : (
                await apiFetch<{ data: BsNode }>(
                  `${BASE_PATH}/${encodeURIComponent(current?.id ?? '')}`,
                  { method: 'PUT', body: payload },
                )
              ).data;

        const list = await refreshRecords();
        announceCompanyList();
        if (options?.keepRecord !== false) {
          const fresh = list.find((record) => record.id === saved.id) ?? null;
          applyRecord(fresh);
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
      announceCompanyList,
      applyRecord,
      current,
      draft,
      isDeleting,
      isDirty,
      isRootNode,
      isSaving,
      mode,
      refreshRecords,
      rootDraft,
      t,
      validateNodeDraft,
    ],
  );

  const handleSave = useCallback(async () => {
    const result = await performSave();
    if (result === 'saved') toast({ title: t('formWindow.saveSuccess') });
  }, [performSave, t]);

  const handleSaveNew = useCallback(async () => {
    if (isSaving || isDeleting) return;
    const parentPreset: FormDataMap =
      mode === 'new'
        ? { parentId: (draft.parentId ?? null) as string | null }
        : current && current.data.isSystem !== true
          ? { parentId: current.id }
          : {};
    const result = await performSave({ keepRecord: false });
    if (result === 'error' || result === 'invalid') return;
    startNew(parentPreset);
    if (result === 'saved') toast({ title: t('formWindow.saveNewSuccess') });
  }, [
    current,
    draft.parentId,
    isDeleting,
    isSaving,
    mode,
    performSave,
    startNew,
    t,
  ]);

  const handleSaveClose = useCallback(async () => {
    if (isSaving || isDeleting) return;
    const result = await performSave();
    if (result === 'error' || result === 'invalid') return;
    if (result === 'saved') toast({ title: t('formWindow.saveCloseSuccess') });
    onClose?.();
  }, [isDeleting, isSaving, onClose, performSave, t]);

  // ── Delete pipeline ───────────────────────────────────────────────
  const requestDelete = useCallback(
    (targetId?: string) => {
      if (mode === 'new' || isSaving || isDeleting) return;
      const target = targetId ? (byId.get(targetId) ?? null) : current;
      if (!target || target.data.isSystem === true) return;
      setDeleteTargetId(target.id);
      setIsDeleteOpen(true);
    },
    [byId, current, isDeleting, isSaving, mode],
  );

  const confirmDelete = useCallback(async () => {
    if (isDeleting || !deleteTargetId) return;
    setIsDeleting(true);
    try {
      await apiFetch(`${BASE_PATH}/${encodeURIComponent(deleteTargetId)}`, {
        method: 'DELETE',
      });
      setIsDeleteOpen(false);
      setDeleteTargetId(null);
      announceCompanyList();
      const list = await refreshRecords();
      applyRecord(list[0] ?? null);
      toast({ title: t('formWindow.deleteSuccess') });
    } catch (error) {
      setIsDeleteOpen(false);
      setDeleteTargetId(null);
      if (error instanceof SessionExpiredError) return;
      toast({
        title:
          error instanceof Error && error.message
            ? error.message
            : t('formWindow.deleteDialogTitle'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [announceCompanyList, applyRecord, deleteTargetId, isDeleting, refreshRecords, t]);

  // ── Draft mutations ───────────────────────────────────────────────
  const handleFieldChange = useCallback(
    (fieldKey: string, value: string | number | boolean | null) => {
      setDraft((prev) => ({ ...prev, [fieldKey]: value }));
      setMode((prev) => (prev === 'view' ? 'edit' : prev));
    },
    [],
  );

  const handleTitleBlur = useCallback(() => {
    if (mode === 'view') return;
    setDraft((prev) => {
      if (String(prev.titleEn ?? '').trim()) return prev;
      const title = String(prev.title ?? '').trim();
      return title ? { ...prev, titleEn: title } : prev;
    });
  }, [mode]);

  // Ctrl+S / Cmd+S saves the active draft.
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

  // ── Logo dropzone ─────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const handleLogoFile = useCallback(
    (file: File | null | undefined) => {
      setLogoError(null);
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setLogoError(t('bs.logoInvalid'));
        return;
      }
      if (file.size > BS_LOGO_MAX_BYTES) {
        setLogoError(t('bs.logoTooLarge'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        handleFieldChange(
          'logoUrl',
          typeof reader.result === 'string' ? reader.result : null,
        );
      };
      reader.onerror = () => setLogoError(t('bs.logoInvalid'));
      reader.readAsDataURL(file);
    },
    [handleFieldChange, t],
  );

  // ── Tree engine wiring ────────────────────────────────────────────
  const renderNodeGlyph = useCallback((record: FormRecord) => {
    const meta = typeMetaOf(record.data.structureType);
    const Icon = record.data.isSystem === true ? Network : meta.icon;
    return (
      <Icon
        className={cn(
          'h-3.5 w-3.5 shrink-0',
          record.data.isSystem === true ? 'text-slate-300/90' : meta.className,
          record.data.isSystem !== true &&
            record.data.isActive === false &&
            'opacity-45',
        )}
        aria-hidden="true"
      />
    );
  }, []);

  /** Detail box content of the main tab (mode/selection driven). */
  const mainDetail = useMemo((): ReactNode => {
    if (mode === 'new') {
      const parentId =
        typeof draft.parentId === 'string' ? draft.parentId : null;
      const parent = parentId ? (byId.get(parentId) ?? null) : null;
      const parentTitle = parent
        ? String(parent.data.title ?? '')
        : t('bs.type.system');
      return (
        <div className="p-4">
          <p className="mb-3 flex flex-wrap items-center gap-1.5 text-[11.5px] text-white/55">
            <Info className="h-3.5 w-3.5 text-emerald-400/80" aria-hidden="true" />
            {tf('bs.newUnder', { name: parentTitle })}
            {parent && (
              <span className="rounded bg-white/[0.07] px-1.5 py-px font-mono text-[10px] text-white/60">
                {String(parent.data.code ?? '')}
              </span>
            )}
          </p>
          <BsNodeFields
            draft={draft}
            isBusy={isSaving || isDeleting}
            allowedTypes={allowedTypesFor(draft.parentId)}
            onFieldChange={handleFieldChange}
            onTitleBlur={handleTitleBlur}
            onLogoFile={handleLogoFile}
            logoError={logoError}
            fileInputRef={fileInputRef}
            isNew
          />
        </div>
      );
    }

    if (!current) {
      return (
        <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <Network className="h-6 w-6 text-white/25" aria-hidden="true" />
          <p className="text-[12.5px] text-white/45">{t('bs.selectNode')}</p>
        </div>
      );
    }

    if (isRootNode) {
      return (
        <BsRootPanel
          draft={rootDraft}
          usedTypes={usedTypes}
          isBusy={isSaving || isDeleting}
          onChange={(next) => {
            setRootDraft(next);
            setMode((prev) => (prev === 'view' ? 'edit' : prev));
          }}
        />
      );
    }

    return (
      <div className="p-4">
        <BsNodeFields
          draft={draft}
          isBusy={isSaving || isDeleting}
          allowedTypes={allowedTypesFor(current.data.parentId)}
          onFieldChange={handleFieldChange}
          onTitleBlur={handleTitleBlur}
          onLogoFile={handleLogoFile}
          logoError={logoError}
          fileInputRef={fileInputRef}
          isNew={false}
        />
      </div>
    );
  }, [
    allowedTypesFor,
    byId,
    current,
    draft,
    handleFieldChange,
    handleLogoFile,
    handleTitleBlur,
    isDeleting,
    isRootNode,
    isSaving,
    logoError,
    mode,
    rootDraft,
    t,
    tf,
    usedTypes,
  ]);

  const detailTitle = useMemo(() => {
    if (mode === 'new') return t('bs.newNodeTitle');
    if (!current) return t('bs.title');
    return tf('bs.detailsOf', { name: String(current.data.title ?? '') });
  }, [current, mode, t, tf]);

  const detailBadge = useMemo((): ReactNode => {
    if (mode === 'new') {
      return (
        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-medium text-emerald-300 ring-1 ring-emerald-400/30">
          {t('formWindow.newMode')}
        </span>
      );
    }
    if (!current) return null;
    if (isRootNode) {
      return (
        <span className="rounded-md bg-slate-400/15 px-2 py-0.5 text-[10.5px] font-medium text-slate-200 ring-1 ring-slate-300/30">
          {t('bs.type.system')}
        </span>
      );
    }
    return (
      <span
        className={cn(
          'rounded-md px-2 py-0.5 text-[10.5px] font-medium ring-1',
          typeMetaOf(current.data.structureType).softClass,
        )}
      >
        {t(typeMetaOf(current.data.structureType).labelKey)}
      </span>
    );
  }, [current, isRootNode, mode, t]);

  const handleDetailTab = useCallback(
    (next: BsDetailTab) => {
      if (next === detailTab) return;
      if (isDirty && !window.confirm(t('formWindow.navDiscardConfirm'))) return;
      setDetailTab(next);
      if (next === 'main' && mode === 'view') return;
    },
    [detailTab, isDirty, mode, t],
  );

  // ── Action bar (tree CRUD cluster, project palette §8.6) ──────────
  const ACTION_BUTTON =
    'flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-white/10 transition-all duration-150 hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

  const actionBar = (
    <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-white/10 bg-white/[0.02] px-3 py-1.5">
      <button
        type="button"
        title={t('formWindow.actionNew')}
        aria-label={t('formWindow.actionNew')}
        onClick={handleNew}
        disabled={mode === 'new' || isSaving || isDeleting}
        className={cn(
          ACTION_BUTTON,
          'bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 hover:shadow-[0_0_18px_-4px_rgba(56,189,248,0.55)]',
        )}
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        title={t('formWindow.actionSave')}
        aria-label={t('formWindow.actionSave')}
        onClick={() => void handleSave()}
        disabled={mode === 'view' || isSaving || isDeleting || !isDirty}
        className={cn(
          ACTION_BUTTON,
          'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 hover:shadow-[0_0_18px_-4px_rgba(52,211,153,0.55)]',
        )}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Save className="h-4 w-4" strokeWidth={2} />
        )}
      </button>
      <button
        type="button"
        title={t('formWindow.actionSaveNew')}
        aria-label={t('formWindow.actionSaveNew')}
        onClick={() => void handleSaveNew()}
        disabled={isSaving || isDeleting}
        className={cn(
          ACTION_BUTTON,
          'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 hover:shadow-[0_0_18px_-4px_rgba(52,211,153,0.55)]',
        )}
      >
        <span className="relative inline-flex h-4 w-4 items-center justify-center">
          <Save className="h-4 w-4" strokeWidth={2} />
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -end-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-current shadow-[0_0_6px_-1px_currentColor]"
          >
            <Plus className="h-[7px] w-[7px] text-[#0b0f16]" strokeWidth={4} />
          </span>
        </span>
      </button>
      <button
        type="button"
        title={t('formWindow.actionSaveClose')}
        aria-label={t('formWindow.actionSaveClose')}
        onClick={() => void handleSaveClose()}
        disabled={isSaving || isDeleting}
        className={cn(
          ACTION_BUTTON,
          'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 hover:shadow-[0_0_18px_-4px_rgba(52,211,153,0.55)]',
        )}
      >
        <span className="relative inline-flex h-4 w-4 items-center justify-center">
          <Save className="h-4 w-4" strokeWidth={2} />
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -end-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-current shadow-[0_0_6px_-1px_currentColor]"
          >
            <X className="h-[7px] w-[7px] text-[#0b0f16]" strokeWidth={4} />
          </span>
        </span>
      </button>
      <button
        type="button"
        title={t('formWindow.actionCopy')}
        aria-label={t('formWindow.actionCopy')}
        onClick={handleCopy}
        disabled={mode !== 'view' || !current || isRootNode || isSaving || isDeleting}
        className={cn(
          ACTION_BUTTON,
          'bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 hover:shadow-[0_0_18px_-4px_rgba(167,139,250,0.55)]',
        )}
      >
        <Copy className="h-4 w-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        title={t('formWindow.actionDelete')}
        aria-label={t('formWindow.actionDelete')}
        onClick={() => requestDelete()}
        disabled={mode === 'new' || !current || isRootNode || isSaving || isDeleting}
        className={cn(
          ACTION_BUTTON,
          'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 hover:shadow-[0_0_18px_-4px_rgba(251,113,133,0.55)]',
        )}
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} />
      </button>
      <span className="ms-auto flex items-center gap-1.5 text-[11px] text-white/40">
        <span className="rounded bg-white/[0.07] px-1.5 py-0.5 tabular-nums">
          {formatNumber(records.length)}
        </span>
        <span className="hidden sm:inline">{t('bs.nodeCount')}</span>
      </span>
    </div>
  );

  return (
    <>
      <FormShell
        title={t('bs.title')}
        subtitle={
          mode === 'new'
            ? t('formWindow.newMode')
            : current
              ? tf('bs.detailsOf', { name: String(current.data.title ?? '') })
              : undefined
        }
        iconKey="network"
        accentColor="#38bdf8"
        actionBar={actionBar}
        footer={
          <FormFooter
            status={status}
            position={null}
            updatedAt={current?.updatedAt ?? null}
          />
        }
      >
        {loadError ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="max-w-sm text-sm text-red-200/90">{loadError}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-2 rounded-lg bg-white/[0.07] px-4 py-2 text-[13px] text-white/80 transition-colors hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              {t('common.retry')}
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[16rem_1fr]">
            <Skeleton className="h-64 rounded-xl bg-white/[0.05]" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`bs-skeleton-${index}`} className="space-y-1.5">
                  <Skeleton className="h-3 w-24 bg-white/[0.08]" />
                  <Skeleton className="h-6 w-full rounded-md bg-white/[0.05]" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <TreeForm
            records={records}
            fields={BS_FIELDS}
            draft={draft}
            mode={mode}
            selectedId={mode === 'new' ? null : selectedId}
            isBusy={isSaving || isDeleting}
            accentColor="#38bdf8"
            lookupUrlBase=""
            panelTitle={t('bs.treePanel')}
            renderNodeGlyph={renderNodeGlyph}
            detail={
              <BsDetailFrame
                title={detailTitle}
                badge={detailBadge}
                activeTab={detailTab}
                onTabChange={handleDetailTab}
              >
                {mainDetail}
              </BsDetailFrame>
            }
            canNewChild={(_record, depth) => depth < BS_MAX_LEVEL}
            canDeleteNode={(record) => record.data.isSystem !== true}
            onSelect={handleSelect}
            onFieldChange={handleFieldChange}
            onNewChild={(preset) => {
              const parentId = preset.parentId;
              if (
                typeof parentId === 'string' &&
                (depthById.get(parentId) ?? 0) >= BS_MAX_LEVEL
              ) {
                toast({
                  title: t('bs.maxDepthTitle'),
                  description: t('bs.maxDepthHint'),
                  variant: 'destructive',
                });
                return;
              }
              if (isDirty && !window.confirm(t('formWindow.navDiscardConfirm'))) {
                return;
              }
              startNew(preset);
            }}
            onDeleteNode={(recordId) => requestDelete(recordId)}
            onCopyNode={(record) => {
              if (isDirty && !window.confirm(t('formWindow.navDiscardConfirm'))) {
                return;
              }
              startNew({ ...record.data, code: null });
              toast({ title: t('formWindow.copyToast') });
            }}
          />
        )}
      </FormShell>

      {/* Delete confirmation — same dialog contract as the generic forms */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteOpen(false);
            setDeleteTargetId(null);
          }
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
              {deleteTargetId
                ? tf('bs.deleteNodeMessage', {
                    name: String(byId.get(deleteTargetId)?.data.title ?? ''),
                  })
                : t('formWindow.deleteDialogMessage')}
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

// ── Detail frame («جزئیات: …» header + tab pills + body) ─────────────

function BsDetailFrame({
  title,
  badge,
  activeTab,
  onTabChange,
  children,
}: {
  title: string;
  badge: ReactNode | null;
  activeTab: BsDetailTab;
  onTabChange: (next: BsDetailTab) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-2 border-s-[3px] border-s-sky-400/70 bg-sky-500/[0.08] px-3 py-2">
          <Building2
            className="h-4 w-4 shrink-0 text-sky-300/90"
            aria-hidden="true"
          />
          <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white/90">
            {title}
          </h3>
          {badge}
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5"
          role="tablist"
          aria-label={title}
        >
          <BsDetailPill
            active={activeTab === 'main'}
            icon={FileText}
            label={t('bs.tabMain')}
            onClick={() => onTabChange('main')}
          />
          <BsDetailPill
            active={activeTab === 'users'}
            icon={Users}
            label={t('bs.tabUsers')}
            onClick={() => onTabChange('users')}
          />
        </div>
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]"
        role="tabpanel"
      >
        {activeTab === 'main' ? (
          children
        ) : (
          <BsUsersPanel />
        )}
      </div>
    </div>
  );
}

function BsDetailPill({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium ring-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
        active
          ? 'bg-sky-500/20 text-sky-200 ring-sky-400/40'
          : 'bg-white/[0.04] text-white/60 ring-white/10 hover:bg-white/[0.08] hover:text-white/85',
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

/** «کاربران مجاز» tab — wired to the IAM phase (19). */
function BsUsersPanel() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] ring-1 ring-white/10">
        <Users className="h-5 w-5 text-white/35" aria-hidden="true" />
      </span>
      <p className="text-[12.5px] text-white/50">{t('bs.usersPlaceholder')}</p>
    </div>
  );
}

// ── Field scaffolding (horizontal layout §5.5) ───────────────────────

function BsField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-2">
      <label className="w-36 shrink-0 pt-1 text-[12px] leading-6 text-white/70">
        {label}
        {required && (
          <span
            title={t('formWindow.requiredHint')}
            aria-hidden="true"
            className="ms-1 text-[13px] leading-none text-red-400"
          >
            *
          </span>
        )}
      </label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** The structure-type combobox: allowed options only, glyph per type. */
function BsTypeSelect({
  value,
  options,
  disabled,
  onChange,
  ariaLabel,
}: {
  value: number | null;
  options: number[];
  disabled?: boolean;
  onChange: (value: number) => void;
  ariaLabel: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const rootRef = useDismiss<HTMLDivElement>(open, close);
  const listboxId = useId();

  const selected = value !== null ? typeMetaOf(value) : null;
  const SelectedIcon = selected?.icon;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          controlClasses,
          'flex items-center justify-between gap-2 text-start',
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {SelectedIcon ? (
            <SelectedIcon
              className={cn('h-3.5 w-3.5 shrink-0', selected?.className)}
              aria-hidden="true"
            />
          ) : null}
          <span
            className={cn(
              'truncate',
              value === null ? 'text-white/30' : 'text-white',
            )}
          >
            {value !== null
              ? t(selected?.labelKey ?? 'bs.type.company')
              : t('formWindow.selectPlaceholder')}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-white/35 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            role="listbox"
            id={listboxId}
            aria-label={ariaLabel}
            className="absolute top-full z-50 mt-1.5 w-full min-w-[200px] overflow-hidden rounded-xl bg-[#1b1e26]/[0.97] shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-xl"
          >
            <div className="max-h-56 overflow-y-auto py-1 [scrollbar-width:thin]">
              {options.length === 0 ? (
                <p className="px-3 py-4 text-center text-[12px] text-white/40">
                  {t('bs.noAllowedTypes')}
                </p>
              ) : (
                options.map((type) => {
                  const meta = typeMetaOf(type);
                  const Icon = meta.icon;
                  const isSelected = type === value;
                  return (
                    <button
                      key={type}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(type);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-1.5 text-start text-[12px] transition-colors',
                        isSelected
                          ? 'bg-sky-500/15 text-white'
                          : 'text-white/80 hover:bg-white/[0.05]',
                      )}
                    >
                      <Icon
                        className={cn('h-3.5 w-3.5 shrink-0', meta.className)}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {t(meta.labelKey)}
                      </span>
                      {isSelected && (
                        <Check
                          className="h-3.5 w-3.5 shrink-0 text-sky-400"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Logo dropzone (reference design: dashed panel, ≤5MB, image preview). */
function BsLogoDropzone({
  value,
  disabled,
  error,
  onFile,
  onClear,
  fileInputRef,
  compact = false,
}: {
  value: string | null;
  disabled?: boolean;
  error?: string | null;
  onFile: (file: File | null | undefined) => void;
  onClear?: () => void;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1">
      <input
        ref={fileInputRef ?? undefined}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-2.5">
          <img
            src={value}
            alt={t('bs.logoAlt')}
            className="h-12 w-12 shrink-0 rounded-lg bg-white/[0.06] object-contain p-1 ring-1 ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] text-white/75">
              {t('bs.logoSelected')}
            </p>
            <div className="mt-1 flex gap-1.5">
              <button
                type="button"
                disabled={disabled}
                onClick={() => fileInputRef?.current?.click()}
                className="rounded-md bg-white/[0.07] px-2 py-0.5 text-[11px] text-white/75 transition-colors hover:bg-white/[0.12] hover:text-white disabled:opacity-40"
              >
                {t('bs.logoReplace')}
              </button>
              {onClear && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onClear}
                  className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] text-rose-300 transition-colors hover:bg-rose-500/25 disabled:opacity-40"
                >
                  {t('bs.logoRemove')}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef?.current?.click()}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-white/45 transition-all hover:border-sky-400/40 hover:bg-sky-500/[0.05] hover:text-sky-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/30 disabled:opacity-40',
            compact ? 'h-16' : 'h-24',
          )}
        >
          <ImageUp className="h-5 w-5" aria-hidden="true" />
          <span className="px-2 text-center text-[11px] leading-4">
            {t('bs.logoHint')}
          </span>
        </button>
      )}
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </div>
  );
}

// ── Node fields (تب اصلی for business nodes + new mode) ──────────────

function BsNodeFields({
  draft,
  isBusy,
  allowedTypes,
  onFieldChange,
  onTitleBlur,
  onLogoFile,
  logoError,
  fileInputRef,
  isNew,
}: {
  draft: FormDataMap;
  isBusy: boolean;
  allowedTypes: number[];
  onFieldChange: (
    key: string,
    value: string | number | boolean | null,
  ) => void;
  onTitleBlur: () => void;
  onLogoFile: (file: File | null | undefined) => void;
  logoError: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isNew: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
      <BsField label={t('bs.fieldCode')}>
        <input
          type="text"
          readOnly
          value={isNew ? '' : String(draft.code ?? '')}
          placeholder={isNew ? t('bs.codeAuto') : ''}
          aria-label={t('bs.fieldCode')}
          className={cn(controlClasses, 'font-mono')}
        />
      </BsField>

      <BsField label={t('bs.fieldTitle')} required>
        <input
          type="text"
          value={String(draft.title ?? '')}
          disabled={isBusy}
          onChange={(event) => onFieldChange('title', event.target.value)}
          onBlur={onTitleBlur}
          aria-label={t('bs.fieldTitle')}
          className={controlClasses}
        />
      </BsField>

      <BsField label={t('bs.fieldTitleEn')} required>
        <input
          type="text"
          dir="ltr"
          value={String(draft.titleEn ?? '')}
          disabled={isBusy}
          onChange={(event) => onFieldChange('titleEn', event.target.value)}
          onBlur={onTitleBlur}
          aria-label={t('bs.fieldTitleEn')}
          className={cn(controlClasses, 'text-start')}
        />
      </BsField>

      <BsField label={t('bs.fieldType')} required>
        <BsTypeSelect
          value={
            draft.structureType === null || draft.structureType === undefined
              ? null
              : Number(draft.structureType)
          }
          options={allowedTypes}
          disabled={isBusy}
          onChange={(value) => onFieldChange('structureType', value)}
          ariaLabel={t('bs.fieldType')}
        />
      </BsField>

      <BsField label={t('bs.fieldManager')}>
        <input
          type="text"
          value={String(draft.manager ?? '')}
          disabled={isBusy}
          onChange={(event) => onFieldChange('manager', event.target.value)}
          aria-label={t('bs.fieldManager')}
          className={controlClasses}
        />
      </BsField>

      <BsField label={t('bs.fieldActive')}>
        <label className="flex h-6 cursor-pointer items-center gap-2 text-[12px] text-white/75">
          <input
            type="checkbox"
            checked={draft.isActive === true}
            disabled={isBusy}
            onChange={(event) => onFieldChange('isActive', event.target.checked)}
            aria-label={t('bs.fieldActive')}
            className="h-3.5 w-3.5 accent-sky-500"
          />
          {draft.isActive === true ? t('dataList.yes') : t('dataList.no')}
        </label>
      </BsField>

      <div className="sm:col-span-2">
        <BsField label={t('bs.fieldLogo')}>
          <BsLogoDropzone
            value={draft.logoUrl ? String(draft.logoUrl) : null}
            disabled={isBusy}
            error={logoError}
            onFile={onLogoFile}
            onClear={() => onFieldChange('logoUrl', null)}
            fileInputRef={fileInputRef}
          />
        </BsField>
      </div>
    </div>
  );
}

// ── Root panel (تنظیمات «ساختار سیستم») ──────────────────────────────

function BsRootPanel({
  draft,
  usedTypes,
  isBusy,
  onChange,
}: {
  draft: BsRootSettings;
  usedTypes: Set<number>;
  isBusy: boolean;
  onChange: (next: BsRootSettings) => void;
}) {
  const { t } = useTranslation();

  const toggleType = (type: number, checked: boolean) => {
    if (checked) {
      onChange({
        ...draft,
        activeStructureTypes: [...draft.activeStructureTypes, type].sort(
          (a, b) => a - b,
        ),
      });
      return;
    }
    if (usedTypes.has(type)) return; // union contract — used types stay on
    onChange({
      ...draft,
      activeStructureTypes: draft.activeStructureTypes.filter(
        (item) => item !== type,
      ),
    });
  };

  return (
    <div className="space-y-4 p-4">
      {/* Shared base info */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={draft.shareHeadquarterData}
            disabled={isBusy}
            onChange={(event) =>
              onChange({ ...draft, shareHeadquarterData: event.target.checked })
            }
            aria-label={t('bs.shareBaseInfo')}
            className="mt-0.5 h-3.5 w-3.5 accent-sky-500"
          />
          <span className="text-[12.5px] leading-5 text-white/80">
            {t('bs.shareBaseInfo')}
          </span>
        </label>
        <p className="mt-1.5 ps-6 text-[11px] leading-4 text-white/40">
          {t('bs.shareBaseInfoHint')}
        </p>
      </div>

      {/* Active structure types (multi checkbox) */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <p className="mb-2.5 text-[12.5px] font-medium text-white/80">
          {t('bs.activeTypes')}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {BS_ACTIVE_TYPES.map((type) => {
            const meta = typeMetaOf(type);
            const Icon = meta.icon;
            const checked = draft.activeStructureTypes.includes(type);
            const locked = usedTypes.has(type);
            return (
              <label
                key={type}
                title={locked ? t('bs.typeLocked') : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors',
                  checked
                    ? 'border-sky-400/30 bg-sky-500/[0.08]'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isBusy || locked}
                  onChange={(event) => toggleType(type, event.target.checked)}
                  aria-label={t(meta.labelKey)}
                  className="h-3.5 w-3.5 accent-sky-500"
                />
                <Icon
                  className={cn('h-4 w-4 shrink-0', meta.className)}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-[12px] text-white/80">
                  {t(meta.labelKey)}
                </span>
                {locked && (
                  <ShieldAlert
                    className="h-3.5 w-3.5 shrink-0 text-amber-400/80"
                    aria-hidden="true"
                  />
                )}
              </label>
            );
          })}
        </div>
        <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-400/25 bg-amber-500/[0.08] px-2.5 py-2">
          <ShieldAlert
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400"
            aria-hidden="true"
          />
          <p className="text-[11.5px] leading-4 text-amber-200/90">
            {t('bs.activeTypesWarning')}
          </p>
        </div>
      </div>
    </div>
  );
}
