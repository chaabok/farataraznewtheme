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

/** Boolean control: shadcn checkbox with an inline clickable label. */
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
    <div className="flex h-6 items-center">
      <label
        htmlFor={id}
        className="flex cursor-pointer select-none items-center gap-2.5"
      >
        <Checkbox
          id={id}
          checked={value}
          disabled={disabled}
          onCheckedChange={(checked) => onChange(checked === true)}
          className="h-4 w-4 border-white/20 bg-white/[0.04] data-[state=checked]:border-sky-400/70 data-[state=checked]:bg-sky-500/80"
        />
        <span className="text-[12px] text-white/80">{label}</span>
        {required && (
          <span
            title={requiredHint}
            aria-hidden="true"
            className="text-[13px] leading-none text-red-400"
          >
            *
          </span>
        )}
      </label>
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
