"use client";

import * as React from "react";

/**
 * useAlignedLabels (Task 25) — automatic label alignment for generated forms.
 *
 * Measures the natural text width of every `selector` element inside the
 * container, takes the MAXIMUM per visual row («row» scope — the legacy ask:
 * «هر ردیف با بزرگ‌ترین برچسبِ همان ردیف همتراز شود») or once for the whole
 * container («container» scope), and publishes the result as the CSS variable
 * `--label-w` on each row's cell (or on the container itself).
 *
 * Label markup contract (see SimpleFormTwoRowTabbed.FieldCell):
 *   <span data-form-label>                      ← fixed unit: [text-box][:][*]
 *     <span class="w-(--label-w)">              ← width driven by this hook
 *       <span data-form-label-text>…</span>     ← measured natural width
 *     </span>
 *     <span>:</span><span>*</span>              ← uniform tail keeps the
 *   </span>                                       inputs of a row aligned
 *
 * Design notes:
 * - measures `offsetWidth` (layout width — immune to transform animations,
 *   the Task 21 lesson);
 * - the MEASURED element is never width-constrained, so re-measuring after a
 *   text/locale change sees the true natural width (no feedback loop, no
 *   stale locked width);
 * - ResizeObserver re-fires on font loading, locale switches (fa↔en), zoom
 *   and container reflows; MutationObserver covers fields added/removed later;
 * - rows are grouped by a shared rounded top edge, which is direction- and
 *   RTL/LTR-safe;
 * - pure client hook; SSR renders natural (auto) widths and hydration aligns
 *   them before the first client paint.
 */

export type AlignedLabelsScope = "row" | "container";

export interface UseAlignedLabelsOptions {
  /** "row" (default) = per visual row; "container" = one shared width */
  scope?: AlignedLabelsScope;
  /** measured elements; default "[data-form-label-text]" */
  selector?: string;
  /** element receiving --label-w per row; default "[data-form-cell]" */
  cellSelector?: string;
}

/** layout effect on the client, effect during SSR (no server warning) */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function useAlignedLabels(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseAlignedLabelsOptions = {},
): void {
  const scope = options.scope ?? "row";
  const selector = options.selector ?? "[data-form-label-text]";
  const cellSelector = options.cellSelector ?? "[data-form-cell]";

  useIsomorphicLayoutEffect(() => {
    const root = containerRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;

    const observed = new WeakSet<HTMLElement>();

    const update = () => {
      const labels = Array.from(root.querySelectorAll<HTMLElement>(selector));
      if (labels.length === 0) return;

      /* watch labels that appeared after mount (dynamic field sets) */
      for (const el of labels) {
        if (!observed.has(el)) {
          observed.add(el);
          ro.observe(el);
        }
      }

      if (scope === "container") {
        let max = 0;
        for (const el of labels) max = Math.max(max, el.offsetWidth);
        if (max > 0) root.style.setProperty("--label-w", `${max}px`);
        return;
      }

      /* «row» scope — group labels by their visual row (shared top edge) */
      const rows = new Map<number, HTMLElement[]>();
      for (const el of labels) {
        const key = Math.round(el.getBoundingClientRect().top);
        const bucket = rows.get(key);
        if (bucket) bucket.push(el);
        else rows.set(key, [el]);
      }
      for (const bucket of rows.values()) {
        let max = 0;
        for (const el of bucket) max = Math.max(max, el.offsetWidth);
        if (max <= 0) continue;
        for (const el of bucket) {
          const host = el.closest<HTMLElement>(cellSelector) ?? root;
          host.style.setProperty("--label-w", `${max}px`);
        }
      }
    };

    const ro = new ResizeObserver(() => update());
    const mo = new MutationObserver(() => update());

    update();
    ro.observe(root);
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [containerRef, scope, selector, cellSelector]);
}
