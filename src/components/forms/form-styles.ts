/**
 * Shared Tailwind class recipes of the generic form framework so every
 * field, button and panel of every DB-driven form looks identical.
 */

/** Standard text-like control (input / textarea / lookup trigger). */
export const controlClasses =
  'h-6 w-full rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-[12px] text-white ' +
  'placeholder:text-white/30 transition focus:border-sky-400/60 focus:bg-white/[0.06] ' +
  'focus:ring-2 focus:ring-sky-400/25 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

/** Standard fields grid; span-1 fields take one column, span-2 the full row. */
export const fieldsGridClasses =
  'grid grid-cols-1 gap-x-5 gap-y-4 p-4 sm:grid-cols-2';

/** Fallback accent color until the FormDef arrives from the API. */
export const DEFAULT_FORM_ACCENT = '#38bdf8';
