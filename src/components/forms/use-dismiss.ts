'use client';

import { useEffect, useRef } from 'react';

/**
 * Dismisses floating panels (lookup popover, help popover) on outside
 * pointer-down or Escape. Attach the returned ref to the panel's root.
 */
export function useDismiss<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        ref.current &&
        target instanceof Node &&
        !ref.current.contains(target)
      ) {
        onClose();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return ref;
}
