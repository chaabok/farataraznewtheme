"use client";

/* Task 32 — the former BsDetail card moved onto the SimpleTreeForm shell:
   the shell now owns the detail header / action bar / field grid. This module
   keeps the BusinessStructure domain atoms — the type icon glyph, the
   activeStructureTypes parser and the logo uploader that rides the shell's
   detailExtra slot. All behavior is preserved verbatim. */

import * as React from "react";
import {
  Building,
  Building2,
  Landmark,
  Store,
  ShoppingBag,
  Users,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/stores/settings-store";
import { Button } from "@/components/ui/button";
import { bsTypeColor } from "@/types/business-structure";

/* ------------------------------------------------------------------ */

export function BsTypeIcon({
  type,
  className,
}: {
  type: number | null;
  className?: string;
}) {
  const c = bsTypeColor(type);
  /* Task 34 — type 5 (Store) rides the same colored-chip family; the icons of
     types 1-4 are UNCHANGED (owner request: no visual change to the forms). */
  const Icon =
    type === 1
      ? Building2
      : type === 2
        ? Building
        : type === 3
          ? Store
          : type === 4
            ? Users
            : type === 5
              ? ShoppingBag
              : Landmark;
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ring-1",
        c.bg,
        c.text,
        c.ring,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

/* ------------------------------------------------------------------ */

export function parseTypes(json: string | null): number[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.map(Number).filter((n) => Number.isFinite(n)) : [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */

/**
 * Task 32 — logo uploader rendered inside the SimpleTreeForm `detailExtra`
 * slot (the shell's field grid has no file-input primitive). Same 256KB
 * cap and data-URL handling as the former BsDetail card.
 */
export function BsLogoUploader({
  logoUrl,
  onChange,
}: {
  logoUrl: string | null;
  onChange: (v: string | null) => void;
}) {
  const t = useT();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const onFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 256 * 1024) {
      toast.error(t("bs.msg.saveError"), { description: "logo > 256KB" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="mt-3 rounded-xl border border-border bg-card/50 p-3.5">
      <p className="mb-2 text-xs font-semibold">{t("bs.field.logo")}</p>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-card/50">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="logo" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            {t("bs.field.logo")}
          </Button>
          {logoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onChange(null)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
    </div>
  );
}
