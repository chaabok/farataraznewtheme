'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n';
import {
  CALENDAR_BY_LOCALE,
  calendarExample,
  calendarHintKey,
  calendarToIso,
  formatCalendarDate,
} from '@/i18n/calendar';
import type { FormFieldValue } from '@/types/forms';
import { controlClasses } from '../form-styles';
import { normalizeDigits } from './jalali';

interface FieldDateProps {
  id?: string;
  value: string | null;
  onChange: (value: FormFieldValue) => void;
  disabled?: boolean;
}

/**
 * Locale-aware date control without any picker library: the user types the
 * date of THEIR calendar (Jalali for fa/ps, Kurdish solar for ckb, Hijri
 * lunar for ar, Gregorian otherwise), the value is stored as an ISO
 * `YYYY-MM-DD` string and displayed back through the same calendar.
 */
export function FieldDate({ id, value, onChange, disabled }: FieldDateProps) {
  const { locale, t } = useTranslation();
  const kind = CALENDAR_BY_LOCALE[locale];
  const [focusedText, setFocusedText] = useState<string | null>(null);

  const display =
    focusedText !== null
      ? focusedText
      : value
        ? (formatCalendarDate(value, kind, locale) ?? value.slice(0, 10))
        : '';

  const commit = (raw: string) => {
    const cleaned = normalizeDigits(raw).trim();
    if (!cleaned) {
      onChange(null);
      return;
    }
    const match = /^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/.exec(cleaned);
    if (!match) return; // keep previous value on invalid input
    const iso = calendarToIso(
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      kind,
    );
    if (iso) onChange(iso);
  };

  return (
    <div>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        dir="ltr"
        value={display}
        disabled={disabled}
        placeholder={calendarExample(kind, locale)}
        onFocus={() =>
          setFocusedText(
            value
              ? (formatCalendarDate(value, kind, locale, { latin: true }) ??
                  value.slice(0, 10))
              : '',
          )
        }
        onChange={(event) => setFocusedText(event.target.value)}
        onBlur={(event) => {
          commit(event.target.value);
          setFocusedText(null);
        }}
        className={controlClasses}
      />
      <p className="mt-1 text-[10px] leading-none text-white/30">
        {t(calendarHintKey(kind))}
      </p>
    </div>
  );
}
