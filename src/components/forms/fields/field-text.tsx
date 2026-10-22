'use client';

import type { FormFieldValue } from '@/types/forms';
import { controlClasses } from '../form-styles';

interface FieldTextProps {
  id?: string;
  value: string;
  onChange: (value: FormFieldValue) => void;
  disabled?: boolean;
  placeholder?: string;
}

/** Single-line text control of the generic form renderer. */
export function FieldText({
  id,
  value,
  onChange,
  disabled,
  placeholder,
}: FieldTextProps) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={controlClasses}
    />
  );
}
