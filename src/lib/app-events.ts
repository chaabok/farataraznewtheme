/**
 * Cross-component UI events (window-level CustomEvent bus).
 *
 * The data-list window listens for record mutations made by form windows
 * of the same form so open lists refresh themselves without polling.
 */
export const RECORDS_CHANGED_EVENT = 'erp:records-changed';

export interface RecordsChangedDetail {
  moduleKey: string;
  formKey: string;
}

/** Notifies every open records list that records of a form changed. */
export function notifyRecordsChanged(detail: RecordsChangedDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(RECORDS_CHANGED_EVENT, { detail }));
}
