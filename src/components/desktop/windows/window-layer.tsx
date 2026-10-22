'use client';

import { AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '@/store/desktop-store';
import { WindowFrame } from './window-frame';
import { ModuleWindow } from './module-window';

/**
 * Renders all open module windows above the desktop, inside the desktop
 * area (windows never overlap the taskbar's stacking context).
 */
export function WindowLayer() {
  const windows = useDesktopStore((s) => s.windows);

  return (
    <AnimatePresence>
      {windows.map((win) => (
        <WindowFrame
          key={win.moduleId}
          moduleId={win.moduleId}
          z={win.z}
          slot={win.slot}
        >
          <ModuleWindow moduleId={win.moduleId} />
        </WindowFrame>
      ))}
    </AnimatePresence>
  );
}
