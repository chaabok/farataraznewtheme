'use client';

import { createElement, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Minus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getLocalizedModuleMeta, useTranslation } from '@/i18n';
import { getIcon } from '../icon-registry';
import { useDesktopStore } from '@/store/desktop-store';

interface WindowFrameProps {
  moduleId: string;
  z: number;
  slot: number;
  children: ReactNode;
  /** Fallback title for windows without module meta (form windows). */
  title?: string;
  /** Fallback icon registry key for form windows (default `fileText`). */
  iconKey?: string;
  /** Fallback accent hex for form windows (default sky). */
  accentColor?: string;
  /** Overrides the default padded, height-capped window body. */
  bodyClassName?: string;
}

/**
 * Windows 11 style app window: draggable via its title bar, focusable
 * (click anywhere brings it to front) and closable. The physical left/top
 * drag positioning works identically in RTL and LTR; only the inline
 * spacing of the title bar uses logical classes.
 */
export function WindowFrame({
  moduleId,
  z,
  slot,
  children,
  title,
  iconKey,
  accentColor,
  bodyClassName,
}: WindowFrameProps) {
  const { locale, t } = useTranslation();
  const meta = getLocalizedModuleMeta(moduleId, locale);
  const closeWindow = useDesktopStore((s) => s.closeWindow);
  const focusWindow = useDesktopStore((s) => s.focusWindow);

  // Form windows (moduleId `form:<formKey>`) have no module meta — they
  // fall back to the descriptor passed by the window layer.
  const windowName = meta?.name ?? title ?? moduleId;
  const windowIconKey = meta ? moduleId : iconKey ?? 'fileText';
  const windowColor = meta?.color ?? accentColor ?? '#38bdf8';

  const [pos, setPos] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return { x: 8, y: 64 };
    }
    return { x: 96 + (slot % 6) * 36, y: 40 + (slot % 6) * 30 };
  });

  const dragState = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  if (!meta && !title) return null;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    focusWindow(moduleId);
    dragState.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - pos.x,
      offsetY: event.clientY - pos.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 160;
    setPos({
      x: Math.min(Math.max(event.clientX - drag.offsetX, -40), maxX),
      y: Math.min(Math.max(event.clientY - drag.offsetY, 0), maxY),
    });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId === event.pointerId) {
      dragState.current = null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onMouseDown={() => focusWindow(moduleId)}
      style={{ zIndex: z, left: pos.x, top: pos.y }}
      className="absolute flex w-[min(720px,calc(100vw-1rem))] flex-col overflow-hidden rounded-xl border border-white/15 bg-[#1e2128]/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
      role="dialog"
      aria-label={`${t('window.ariaPrefix')} ${windowName}`}
    >
      {/* Title bar (drag handle) */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => closeWindow(moduleId)}
        className="flex h-10 shrink-0 cursor-move touch-none select-none items-center gap-2.5 border-b border-white/10 bg-[#2a2d34]/90 px-3"
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-md ring-1 ring-white/15"
          style={{
            background: `linear-gradient(135deg, ${windowColor}, ${windowColor}b3)`,
          }}
        >
          {createElement(getIcon(windowIconKey), {
            className: 'h-3.5 w-3.5 text-white',
            strokeWidth: 2,
          })}
        </span>
        <span className="text-[13px] font-semibold text-white/90">
          {windowName}
        </span>
        {meta && (
          <span className="hidden text-[10px] text-white/35 sm:inline">
            {t('window.serviceBadge')}
          </span>
        )}

        <div className="ms-auto flex items-center gap-1">
          <button
            type="button"
            title={t('window.minimize')}
            aria-label={t('window.minimize')}
            onClick={(event) => {
              event.stopPropagation();
              toast({
                title: t('window.minimizeToast.title'),
                description: t('window.minimizeToast.desc'),
              });
            }}
            className="flex h-7 w-7 items-center justify-center rounded text-white/70 transition-colors hover:bg-white/10"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title={t('window.close')}
            aria-label={t('window.close')}
            onClick={(event) => {
              event.stopPropagation();
              closeWindow(moduleId);
            }}
            className="flex h-7 w-7 items-center justify-center rounded text-white/70 transition-colors hover:bg-red-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Window body — form windows swap in a taller, flush body */}
      <div className={bodyClassName ?? 'max-h-[min(64vh,560px)] overflow-y-auto p-4'}>
        {children}
      </div>
    </motion.div>
  );
}
