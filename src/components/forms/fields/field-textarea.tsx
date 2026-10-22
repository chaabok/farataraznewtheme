'use client';

import type { FormFieldValue } from '@/types/forms';
import { controlClasses } from '../form-styles';

interface FieldTextareaProps {
  id?: string;
  value: string;
  onChange: (value: FormFieldValue) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
}

/** Multi-line control of the generic form renderer (full-width rows). */
export function FieldTextarea({
  id,
  value,
  onChange,
  disabled,
  placeholder,
  rows = 3,
}: FieldTextareaProps) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`${controlClasses} h-auto min-h-[84px] resize-y py-2 leading-relaxed`}
    />
  );
}
