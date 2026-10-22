'use client';

import { useEffect } from 'react';
import { useDesktopStore } from '@/store/desktop-store';

/**
 * Mounted once inside the root layout. After hydration it syncs the Zustand
 * store with the locale the server already rendered from the language cookie
 * (html lang/dir), so the very first paint is correct and texts switch
 * immediately afterwards without a hydration mismatch.
 */
export function LocaleSync() {
  useEffect(() => {
    useDesktopStore.getState().initLocaleFromDocument();
  }, []);

  return null;
}
