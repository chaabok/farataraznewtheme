'use client';

import { createElement } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  List,
  Loader2,
  Plus,
  Printer,
  Save,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

export type FormMode = 'view' | 'new' | 'edit';

interface FormActionBarProps {
  mode: FormMode;
  isDirty: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  /** A saved record is loaded (enables copy/delete). */
  hasRecord: boolean;
  recordIndex: number;
  recordCount: number;
  isListOpen: boolean;
  onNew: () => void;
  onSave: () => void;
  /** Save the record, then reset the form for a fresh entry. */
  onSaveNew: () => void;
  /** Save the record after validation, then close the window. */
  onSaveClose: () => void;
  onCopy: () => void;
  onDelete: () => void;
  /** Delete the saved record after confirmation, then reset the form. */
  onDeleteNew: () => void;
  /** Delete the saved record after confirmation, then close the window. */
  onDeleteClose: () => void;
  onPrint: () => void;
  onToggleList: () => void;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  /** Hides the linear navigation cluster (tree forms select nodes instead). */
  hideNav?: boolean;
}

/** Staggered entrance of the action buttons. */
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
};

type Tint = 'sky' | 'emerald' | 'violet' | 'rose' | 'amber' | 'slate';

/** Static tint recipes — Tailwind needs literal classes to emit them. */
const TINT_CLASSES: Record<Tint, string> = {
  sky: 'bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 hover:shadow-[0_0_18px_-4px_rgba(56,189,248,0.55)]',
  emerald:
    'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 hover:shadow-[0_0_18px_-4px_rgba(52,211,153,0.55)]',
  violet:
    'bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 hover:shadow-[0_0_18px_-4px_rgba(167,139,250,0.55)]',
  rose: 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 hover:shadow-[0_0_18px_-4px_rgba(251,113,133,0.55)]',
  amber:
    'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 hover:shadow-[0_0_18px_-4px_rgba(251,191,36,0.55)]',
  slate:
    'bg-slate-500/20 text-slate-300 hover:bg-slate-400/30 hover:shadow-[0_0_18px_-4px_rgba(148,163,184,0.5)]',
};

const ACTION_BUTTON =
  'flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-white/10 transition-all duration-150 hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

/**
 * Base icon with a tiny corner badge (＋ new · × close). Members of a
 * family share the base glyph and tint, so "save & new" / "save & close"
 * read as natural extensions of Save — same for the Delete family.
 */
function BadgeIcon({ base, badge }: { base: LucideIcon; badge: LucideIcon }) {
  return (
    <span className="relative inline-flex h-4 w-4 items-center justify-center">
      {createElement(base, { className: 'h-4 w-4', strokeWidth: 2 })}
      <span
        aria-hidden="true"
        className="absolute -top-1.5 -end-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-current shadow-[0_0_6px_-1px_currentColor]"
      >
        {createElement(badge, {
          className: 'h-[7px] w-[7px] text-[#0b0f16]',
          strokeWidth: 4,
        })}
      </span>
    </span>
  );
}

/**
 * Sticky action bar of every form window: CRUD + list cluster on the
 * start side, record navigation on the end side (icons flip in RTL so
 * first/last stay visually correct).
 */
export function FormActionBar({
  mode,
  isDirty,
  isSaving,
  isDeleting,
  hasRecord,
  recordIndex,
  recordCount,
  isListOpen,
  onNew,
  onSave,
  onSaveNew,
  onSaveClose,
  onCopy,
  onDelete,
  onDeleteNew,
  onDeleteClose,
  onPrint,
  onToggleList,
  onFirst,
  onPrev,
  onNext,
  onLast,
  hideNav = false,
}: FormActionBarProps) {
  const { direction, t } = useTranslation();
  const rtl = direction === 'rtl';

  const navDisabled =
    mode !== 'view' || recordCount === 0 || isSaving || isDeleting;
  const atStart = recordIndex <= 0;
  const atEnd = recordIndex >= recordCount - 1;

  interface ActionItem {
    key: string;
    tint: Tint;
    icon: LucideIcon;
    /** Optional corner badge turning the base icon into a combined action. */
    badge?: LucideIcon;
    label: string;
    onClick: () => void;
    disabled: boolean;
    spinning?: boolean;
    pressed?: boolean;
  }

  const actions: ActionItem[] = [
    {
      key: 'new',
      tint: 'sky',
      icon: Plus,
      label: t('formWindow.actionNew'),
      onClick: onNew,
      disabled: mode === 'new' || isSaving || isDeleting,
    },
    {
      key: 'save',
      tint: 'emerald',
      icon: isSaving ? Loader2 : Save,
      label: t('formWindow.actionSave'),
      onClick: onSave,
      disabled: mode === 'view' || isSaving || isDeleting || !isDirty,
      spinning: isSaving,
    },
    {
      key: 'saveNew',
      tint: 'emerald',
      icon: Save,
      badge: Plus,
      label: t('formWindow.actionSaveNew'),
      onClick: onSaveNew,
      disabled: isSaving || isDeleting,
    },
    {
      key: 'saveClose',
      tint: 'emerald',
      icon: Save,
      badge: X,
      label: t('formWindow.actionSaveClose'),
      onClick: onSaveClose,
      disabled: isSaving || isDeleting,
    },
    {
      key: 'copy',
      tint: 'violet',
      icon: Copy,
      label: t('formWindow.actionCopy'),
      onClick: onCopy,
      disabled: mode !== 'view' || !hasRecord || isSaving || isDeleting,
    },
    {
      key: 'delete',
      tint: 'rose',
      icon: Trash2,
      label: t('formWindow.actionDelete'),
      onClick: onDelete,
      disabled: mode === 'new' || !hasRecord || isSaving || isDeleting,
    },
    {
      key: 'deleteNew',
      tint: 'rose',
      icon: Trash2,
      badge: Plus,
      label: t('formWindow.actionDeleteNew'),
      onClick: onDeleteNew,
      disabled: mode === 'new' || !hasRecord || isSaving || isDeleting,
    },
    {
      key: 'deleteClose',
      tint: 'rose',
      icon: Trash2,
      badge: X,
      label: t('formWindow.actionDeleteClose'),
      onClick: onDeleteClose,
      disabled: mode === 'new' || !hasRecord || isSaving || isDeleting,
    },
    {
      key: 'print',
      tint: 'amber',
      icon: Printer,
      label: t('formWindow.actionPrint'),
      onClick: onPrint,
      disabled: isSaving || isDeleting,
    },
    {
      key: 'list',
      tint: 'slate',
      icon: List,
      label: t('formWindow.actionList'),
      onClick: onToggleList,
      disabled: false,
      pressed: isListOpen,
    },
  ];

  const navActions: ActionItem[] = [
    {
      key: 'first',
      tint: 'slate',
      icon: rtl ? ChevronsRight : ChevronsLeft,
      label: t('formWindow.actionFirst'),
      onClick: onFirst,
      disabled: navDisabled || atStart,
    },
    {
      key: 'prev',
      tint: 'slate',
      icon: rtl ? ChevronRight : ChevronLeft,
      label: t('formWindow.actionPrev'),
      onClick: onPrev,
      disabled: navDisabled || atStart,
    },
    {
      key: 'next',
      tint: 'slate',
      icon: rtl ? ChevronLeft : ChevronRight,
      label: t('formWindow.actionNext'),
      onClick: onNext,
      disabled: navDisabled || atEnd,
    },
    {
      key: 'last',
      tint: 'slate',
      icon: rtl ? ChevronsLeft : ChevronsRight,
      label: t('formWindow.actionLast'),
      onClick: onLast,
      disabled: navDisabled || atEnd,
    },
  ];

  const renderButton = (action: ActionItem) => (
    <motion.button
      key={action.key}
      variants={itemVariants}
      type="button"
      title={action.label}
      aria-label={action.label}
      aria-pressed={action.pressed ? true : undefined}
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        ACTION_BUTTON,
        TINT_CLASSES[action.tint],
        action.pressed &&
          (action.tint === 'rose'
            ? 'bg-rose-500/40 text-rose-100 ring-rose-300/50'
            : 'bg-slate-400/30 text-slate-100 ring-slate-300/40'),
      )}
    >
      {action.badge ? (
        <BadgeIcon base={action.icon} badge={action.badge} />
      ) : (
        createElement(action.icon, {
          className: cn('h-4 w-4', action.spinning && 'animate-spin'),
          strokeWidth: 2,
        })
      )}
    </motion.button>
  );

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/[0.02] px-3 py-1.5">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap items-center gap-1.5"
      >
        {actions.map(renderButton)}
      </motion.div>
      {!hideNav && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center gap-1"
        >
          {navActions.map(renderButton)}
        </motion.div>
      )}
    </div>
  );
}
