'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { FormFieldValue } from '@/types/forms';
import { cn } from '@/lib/utils';

interface FieldCheckboxProps {
  id?: string;
  label: string;
  required?: boolean;
  requiredHint?: string;
  value: boolean;
  onChange: (value: FormFieldValue) => void;
  disabled?: boolean;
}

/** Boolean control: label at the inline start (right in RTL, left in
 * LTR) with the clickable checkbox after it — the same horizontal row
 * every other field type uses. */
export function FieldCheckbox({
  id,
  label,
  required,
  requiredHint,
  value,
  onChange,
  disabled,
}: FieldCheckboxProps) {
  return (
    <div className="flex h-6 items-center gap-2">
      <label
        htmlFor={id}
        className="w-36 shrink-0 cursor-pointer select-none text-[12.5px] leading-6 text-white/80"
      >
        {label}
        {required && (
          <span
            title={requiredHint}
            aria-hidden="true"
            className="ms-1 text-[13px] leading-none text-red-400"
          >
            *
          </span>
        )}
      </label>
      <Checkbox
        id={id}
        checked={value}
        disabled={disabled}
        onCheckedChange={(checked) => onChange(checked === true)}
        className="h-4 w-4 shrink-0 border-white/20 bg-white/[0.04] data-[state=checked]:border-sky-400/70 data-[state=checked]:bg-sky-500/80"
      />
    </div>
  );
}

/** Shared inline hint row rendered under inputs (kept for future use). */
export function FieldHint({ children }: { children: string }) {
  return (
    <p className={cn('mt-1 text-[10px] leading-none text-white/30')}>
      {children}
    </p>
  );
}
