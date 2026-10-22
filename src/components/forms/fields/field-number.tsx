'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n';
import type { FormFieldValue } from '@/types/forms';
import { controlClasses } from '../form-styles';
import { normalizeDigits } from './jalali';

interface FieldNumberProps {
  id?: string;
  value: number | null;
  onChange: (value: FormFieldValue) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Numeric control with thousands separators: edits raw digits while
 * focused, shows the locale-formatted value (e.g. ۱٬۲۳۴٬۵۶۷) on blur.
 */
export function FieldNumber({
  id,
  value,
  onChange,
  disabled,
  placeholder,
}: FieldNumberProps) {
  const { formatNumber } = useTranslation();
  const [focusedText, setFocusedText] = useState<string | null>(null);

  const display =
    focusedText !== null
      ? focusedText
      : value === null || value === undefined
        ? ''
        : formatNumber(value);

  const commit = (raw: string) => {
    const cleaned = normalizeDigits(raw).replace(/[٬,،\s]/g, '');
    if (cleaned === '' || cleaned === '-' || cleaned === '.') {
      onChange(null);
      return;
    }
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) {
      onChange(parsed);
    }
    // Unparseable input keeps the previous value (input reverts on blur).
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      dir="ltr"
      value={display}
      disabled={disabled}
      placeholder={placeholder}
      onFocus={() => setFocusedText(value === null || value === undefined ? '' : String(value))}
      onChange={(event) => setFocusedText(event.target.value)}
      onBlur={(event) => {
        commit(event.target.value);
        setFocusedText(null);
      }}
      className={controlClasses}
    />
  );
}
