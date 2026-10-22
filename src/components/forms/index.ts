/**
 * Barrel of the generic, database-driven form framework. Every form
 * window on the desktop renders through these components — changing one
 * of them changes every form at once.
 */
export { DataFormWindow } from './form-window';
export type { DataFormWindowProps } from './form-window';
export { FormShell } from './form-shell';
export { FormActionBar, type FormMode } from './action-bar';
export { FormTabs, type FormTabItem } from './form-tabs';
export { FieldRenderer } from './field-renderer';
export { TreePanel } from './tree-panel';
export { FormFooter, type FormStatus } from './form-footer';
export { FieldText } from './fields/field-text';
export { FieldNumber } from './fields/field-number';
export { FieldDate } from './fields/field-date';
export { FieldCheckbox } from './fields/field-checkbox';
export { FieldTextarea } from './fields/field-textarea';
export { LookupField } from './fields/field-lookup';
export * from './form-utils';
