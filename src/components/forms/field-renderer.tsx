'use client';

import type { ReactNode } from 'react';
import { useTranslation } from '@/i18n';
import type { FormFieldDef, FormFieldValue } from '@/types/forms';
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
 * Maps a `FormFieldDef` to the right control and wraps it in a labeled
 * row (label at the start, required marker as a red asterisk). The
 * surrounding `sm:grid-cols-2` grid is owned by the parent; span-2
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

  return (
    <div className={field.span === 2 ? 'col-span-full' : undefined}>
      <div className="mb-1.5 flex items-baseline gap-1">
        <label
          htmlFor={field.fieldKey}
          className="text-[13px] leading-none text-white/70"
        >
          {label}
        </label>
        {field.isRequired && (
          <span
            title={t('formWindow.requiredHint')}
            aria-hidden="true"
            className="text-[13px] leading-none text-red-400"
          >
            *
          </span>
        )}
      </div>
      {control}
    </div>
  );
}
