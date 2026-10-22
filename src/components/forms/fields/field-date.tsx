'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n';
import type { FormFieldValue } from '@/types/forms';
import { controlClasses } from '../form-styles';
import { isoToJalali, jalaliToIso, normalizeDigits, toPersianDigits } from './jalali';

interface FieldDateProps {
  id?: string;
  value: string | null;
  onChange: (value: FormFieldValue) => void;
  disabled?: boolean;
}

/**
 * Jalali (Solar Hijri) date control without any picker library: the user
 * types `1405/07/30`, the value is stored as an ISO `YYYY-MM-DD` string
 * and displayed back in the Jalali calendar for Persian/Arabic users.
 */
export function FieldDate({ id, value, onChange, disabled }: FieldDateProps) {
  const { locale, t } = useTranslation();
  const [focusedText, setFocusedText] = useState<string | null>(null);
  const usePersianDigits = locale === 'fa' || locale === 'ar';

  const display =
    focusedText !== null
      ? focusedText
      : value
        ? toJalaliText(value, usePersianDigits)
        : '';

  const commit = (raw: string) => {
    const cleaned = normalizeDigits(raw).trim();
    if (!cleaned) {
      onChange(null);
      return;
    }
    const match = /^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/.exec(cleaned);
    if (!match) return; // keep previous value on invalid input
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (year < 1700) {
      const iso = jalaliToIso(year, month, day);
      if (iso) onChange(iso);
      return;
    }
    // Gregorian input is accepted too (year >= 1700).
    const probe = new Date(Date.UTC(year, month - 1, day));
    if (
      probe.getUTCFullYear() === year &&
      probe.getUTCMonth() === month - 1 &&
      probe.getUTCDate() === day
    ) {
      onChange(
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      );
    }
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
        placeholder={usePersianDigits ? '۱۴۰۵/۰۷/۳۰' : '1405/07/30'}
        onFocus={() =>
          setFocusedText(value ? toJalaliText(value, false) : '')
        }
        onChange={(event) => setFocusedText(event.target.value)}
        onBlur={(event) => {
          commit(event.target.value);
          setFocusedText(null);
        }}
        className={controlClasses}
      />
      <p className="mt-1 text-[10px] leading-none text-white/30">
        {t('formWindow.jalaliHint')}
      </p>
    </div>
  );
}

/** Jalali text of an ISO value; `persianDigits` renders ۱۴۰۵/۰۷/۳۰ style. */
function toJalaliText(iso: string, persianDigits: boolean): string {
  const jalali = isoToJalali(iso);
  if (!jalali) return iso.slice(0, 10);
  const latin = `${jalali.jy}/${String(jalali.jm).padStart(2, '0')}/${String(
    jalali.jd,
  ).padStart(2, '0')}`;
  return persianDigits ? toPersianDigits(latin) : latin;
}
