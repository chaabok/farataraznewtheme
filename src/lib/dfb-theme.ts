/**
 * Dfb form shell theme contract (Task 47 — استودیوی طراحی فرم).
 * The design studio persists {theme, titleSize, font} inside DfbForm's
 * headerJson.style (FormHeaderDto.style); the studio canvas preview and the
 * form runtime both resolve them through THIS single map, so what the owner
 * designs is exactly what runs (§4.1 single-source spirit at the UI layer).
 * Theme colors avoid indigo/blue (§0.5).
 */
import type { CSSProperties } from "react";

export interface DfbFormStyle {
  theme?: string; // teal | emerald | amber | violet | rose
  titleSize?: string; // sm | md | lg
  font?: string; // sans | serif | mono
  /** Task 48 — bank-level horizontal alignment, keyed "main" | "tab{i}"
      (tab order index — stable across tab-id regeneration on save) */
  bankAlign?: Record<string, string>; // "start" | "center" | "end"
}

/** Task 48 — bank alignment resolution (unknown/absent = start) */
export type DfbBankAlign = "start" | "center" | "end";
export function dfbBankAlign(style: DfbFormStyle | null | undefined, bankKey: string): DfbBankAlign {
  const v = style?.bankAlign?.[bankKey];
  return v === "center" || v === "end" ? v : "start";
}

/** gradient overrides for the form shell header strip (twMerge-merged over
    the teal base classes, so an unknown/absent key = the default teal) */
export const DFB_THEME_HEADER: Record<string, string> = {
  teal: "",
  emerald: "from-emerald-600 via-emerald-600 to-green-600",
  amber: "from-amber-500 via-amber-500 to-orange-600",
  violet: "from-violet-600 via-violet-600 to-purple-700",
  rose: "from-rose-500 via-rose-500 to-red-600",
};

/** design-studio swatch row (same keys as DFB_THEME_HEADER) */
export const DFB_THEME_SWATCHES: Array<{ key: string; tile: string }> = [
  { key: "teal", tile: "from-teal-500 to-emerald-600" },
  { key: "emerald", tile: "from-emerald-500 to-green-600" },
  { key: "amber", tile: "from-amber-400 to-orange-600" },
  { key: "violet", tile: "from-violet-500 to-purple-700" },
  { key: "rose", tile: "from-rose-500 to-red-600" },
];

/** title font-size overrides for the form shell header <h2> */
export const DFB_TITLE_SIZE: Record<string, string> = {
  sm: "text-[13px]",
  md: "text-[15px]",
  lg: "text-[17px]",
};

/** body font-family stacks (inline style — fonts are not tailwind utilities) */
export const DFB_FONT_FAMILY: Record<string, string> = {
  sans: "",
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};

/** resolved props for the two form shells (SimpleFormTwoRowTabbed /
    SimpleTreeForm Task-47 theme hooks) */
export function dfbShellTheme(style?: DfbFormStyle | null): {
  headerClassName?: string;
  titleClassName?: string;
  bodyStyle?: CSSProperties;
} {
  if (!style) return {};
  const headerClassName = DFB_THEME_HEADER[style.theme ?? ""] || undefined;
  const titleClassName = DFB_TITLE_SIZE[style.titleSize ?? ""] || undefined;
  const family = DFB_FONT_FAMILY[style.font ?? ""] || "";
  return {
    headerClassName,
    titleClassName,
    bodyStyle: family ? { fontFamily: family } : undefined,
  };
}
