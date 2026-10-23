"use client";

import * as React from "react";
import type { FormAction } from "./types";

/**
 * Shared busy-state runner for action-bar buttons (Task 20).
 * Guarantees: single-flight (re-entrant calls ignored), errors never leave the
 * handler unhandled (caller toasts its own errors), busy resets always.
 */
export function useActionRun() {
  const [busy, setBusy] = React.useState(false);
  const busyRef = React.useRef(false);

  const run = React.useCallback((fn?: FormAction): Promise<void> => {
    if (!fn || busyRef.current) return Promise.resolve();
    busyRef.current = true;
    setBusy(true);
    return Promise.resolve()
      .then(fn)
      .catch((error) => console.error("[form-action-bar]", error))
      .finally(() => {
        busyRef.current = false;
        setBusy(false);
      });
  }, []);

  return { busy, run };
}
