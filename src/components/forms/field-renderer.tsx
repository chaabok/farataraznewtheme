'use client';

import type { ReactNode } from 'react';
import { useTranslation } from '@/i18n';
import type { FormFieldDef, FormFieldValue } from '@/types/forms';
import { cn } from '@/lib/utils';
import { fieldLabel } from './form-utils';
import { FieldCheckbox } from './fields/field-checkbox';
import { FieldDate } from './fields/field-date';
import { FieldNumber } from './fields/field-number';
import { FieldText } from './fields/field-text';
import { FieldTextarea } from './fields/field-textarea';
import { LookupField } from './fields/field-lookup';

interface FieldRendererProps {
  field: FormFieldDef;
  value: FormFieldValue;
  onChange: (value: FormFieldValue) => void;
  disabled?: boolean;
  /** Base path ending in `/lookups` used by lookup fields. */
  lookupUrlBase?: string;
}

/**
 * Maps a `FormFieldDef` to the right control and wraps it in a horizontal
 * labeled row: the label sits at the inline start (right side in RTL,
 * left side in LTR) and the input fills the rest of the row — so the
 * input is always on the opposite side of the label in both directions.
 * The surrounding `sm:grid-cols-2` grid is owned by the parent; span-2
 * fields claim the full row with `col-span-full`.
 */
export function FieldRenderer({
  field,
  value,
  onChange,
  disabled,
  lookupUrlBase,
}: FieldRendererProps) {
  const { locale, t } = useTranslation();
  const label = fieldLabel(field, locale);

  let control: ReactNode;
  switch (field.fieldType) {
    case 'number': {
      const numeric =
        typeof value === 'number'
          ? value
          : typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))
            ? Number(value)
            : null;
      control = (
        <FieldNumber
          id={field.fieldKey}
          value={numeric}
          onChange={onChange}
          disabled={disabled}
        />
      );
      break;
    }
    case 'date':
      control = (
        <FieldDate
          id={field.fieldKey}
          value={typeof value === 'string' && value ? value : null}
          onChange={onChange}
          disabled={disabled}
        />
      );
      break;
    case 'lookup':
      control = (
        <LookupField
          id={field.fieldKey}
          value={typeof value === 'string' && value ? value : null}
          onChange={onChange}
          disabled={disabled}
          lookupKey={field.lookupKey ?? ''}
          urlBase={lookupUrlBase ?? ''}
        />
      );
      break;
    case 'textarea':
      control = (
        <FieldTextarea
          id={field.fieldKey}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          disabled={disabled}
        />
      );
      break;
    default:
      control = (
        <FieldText
          id={field.fieldKey}
          value={typeof value === 'string' ? value : value === null || value === undefined ? '' : String(value)}
          onChange={onChange}
          disabled={disabled}
        />
      );
  }

  if (field.fieldType === 'checkbox') {
    return (
      <div className={field.span === 2 ? 'col-span-full' : undefined}>
        <FieldCheckbox
          id={field.fieldKey}
          label={label}
          required={field.isRequired}
          requiredHint={t('formWindow.requiredHint')}
          value={value === true}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    );
  }

  // Horizontal field row: label first = inline start (right in RTL,
  // left in LTR), control second = the opposite side. `leading-6` keeps
  // the label's first line exactly as tall as the h-6 control.
  return (
    <div
      className={cn(
        'flex items-start gap-2',
        field.span === 2 && 'col-span-full',
      )}
    >
      <label
        htmlFor={field.fieldKey}
        className="w-36 shrink-0 text-[12.5px] leading-6 text-white/70"
      >
        {label}
        {field.isRequired && (
          <span
            title={t('formWindow.requiredHint')}
            aria-hidden="true"
            className="ms-1 text-[13px] leading-none text-red-400"
          >
            *
          </span>
        )}
      </label>
      <div className="min-w-0 flex-1">{control}</div>
    </div>
  );
}
