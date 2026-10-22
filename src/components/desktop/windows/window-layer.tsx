'use client';

import { AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '@/store/desktop-store';
import { DataFormWindow } from '@/components/forms';
import { WindowFrame } from './window-frame';
import { ModuleWindow } from './module-window';

/**
 * Full-height, flush window body used by form windows (their own chrome);
 * combined with `dockBottom` the status footer touches the taskbar.
 */
const FORM_BODY_CLASS = 'flex min-h-0 flex-1 flex-col overflow-hidden';

/**
 * Renders all open module windows above the desktop, inside the desktop
 * area (windows never overlap the taskbar's stacking context). Form
 * windows (`form:<formKey>`) render the generic DataFormWindow instead.
 */
export function WindowLayer() {
  const windows = useDesktopStore((s) => s.windows);
  const closeWindow = useDesktopStore((s) => s.closeWindow);

  return (
    <AnimatePresence>
      {windows.map((win) => (
        <WindowFrame
          key={win.moduleId}
          moduleId={win.moduleId}
          z={win.z}
          slot={win.slot}
          title={win.form?.name}
          iconKey={win.form?.iconKey}
          accentColor={win.form ? '#38bdf8' : undefined}
          bodyClassName={win.form ? FORM_BODY_CLASS : undefined}
          dockBottom={Boolean(win.form)}
        >
          {win.form ? (
            <DataFormWindow
              moduleId={win.moduleId}
              form={win.form}
              onClose={() => closeWindow(win.moduleId)}
            />
          ) : (
            <ModuleWindow moduleId={win.moduleId} />
          )}
        </WindowFrame>
      ))}
    </AnimatePresence>
  );
}
