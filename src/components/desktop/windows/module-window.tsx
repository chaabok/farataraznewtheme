'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, SessionExpiredError } from '@/lib/api-client';
import { getModuleMeta, type ModuleField } from '@/lib/modules-registry';

type RecordData = Record<string, unknown>;
type StatsData = Record<string, number>;

const numberFormatter = new Intl.NumberFormat('fa-IR');
const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function formatValue(field: ModuleField, raw: unknown): string {
  if (raw === null || raw === undefined || raw === '') return '—';
  if (field.type === 'select') {
    return field.options?.find((o) => o.value === raw)?.label ?? String(raw);
  }
  if (field.type === 'number') {
    const num = Number(raw);
    if (!Number.isFinite(num)) return String(raw);
    return numberFormatter.format(num) + (field.unit ? ' ' + field.unit : '');
  }
  return String(raw);
}

function statusBadgeColor(value: string): string {
  const palette: Record<string, string> = {
    draft: 'bg-slate-400',
    sent: 'bg-amber-400',
    paid: 'bg-emerald-400',
    pending: 'bg-amber-400',
    approved: 'bg-sky-400',
    received: 'bg-emerald-400',
    new: 'bg-sky-400',
    processing: 'bg-violet-400',
    completed: 'bg-emerald-400',
    cancelled: 'bg-red-400',
    receipt: 'bg-emerald-400',
    payment: 'bg-orange-400',
    balance_sheet: 'bg-teal-400',
    income_statement: 'bg-lime-400',
    cash_flow: 'bg-cyan-400',
  };
  return palette[value] ?? 'bg-white/40';
}

/**
 * Generic ERP module app rendered inside its desktop window.
 * One component serves all 10 modules via the modules registry:
 * stats cards (module microservice aggregates) + create form + records table.
 */
export function ModuleWindow({ moduleId }: { moduleId: string }) {
  const meta = getModuleMeta(moduleId);

  const [items, setItems] = useState<RecordData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([
        apiFetch<{ data: RecordData[] }>(`/api/modules/${moduleId}`),
        apiFetch<{ data: StatsData }>(`/api/modules/${moduleId}/stats`),
      ]);
      setItems(itemsRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      if (err instanceof SessionExpiredError) return;
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!meta) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const body: Record<string, string | number> = {};
      for (const field of meta.fields) {
        const value = form[field.key]?.trim();
        if (value === undefined || value === '') continue;
        // Numeric DTO fields need real numbers (class-validator @IsNumber)
        body[field.key] =
          field.type === 'number' && Number.isFinite(Number(value))
            ? Number(value)
            : value;
      }
      await apiFetch(`/api/modules/${moduleId}`, { method: 'POST', body });
      toast({ title: `${meta.recordLabel} ثبت شد` });
      setForm({});
      await load();
    } catch (err) {
      if (err instanceof SessionExpiredError) return;
      toast({
        title: 'ثبت ناموفق بود',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {meta.stats.map((stat) => {
          const raw = stats?.[stat.key];
          let display = '—';
          if (raw !== undefined && raw !== null) {
            const num = Number(raw);
            if (stat.kind === 'money') {
              display = numberFormatter.format(num) + ' تومان';
            } else if (stat.kind === 'percent') {
              display = numberFormatter.format(num) + '٪';
            } else {
              display = numberFormatter.format(num);
            }
          }
          return (
            <div
              key={stat.key}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5"
            >
              <p className="text-[10px] text-white/50">{stat.label}</p>
              <p className="mt-1 truncate text-[13px] font-bold text-white">
                {loading ? '···' : display}
              </p>
            </div>
          );
        })}
      </div>

      {/* Create form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
      >
        <p className="mb-2.5 text-[11px] font-semibold text-white/60">
          ثبت {meta.recordLabel} جدید
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {meta.fields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1 block text-[10px] text-white/50">
                {field.label}
                {field.required && <span className="text-red-400"> *</span>}
              </span>
              {field.type === 'select' ? (
                <select
                  value={form[field.key] ?? ''}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-md border border-white/15 bg-white/10 px-2 text-xs text-white focus:border-sky-400/60 focus:outline-none [&>option]:bg-[#1e2128]"
                >
                  <option value="">انتخاب کنید...</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={form[field.key] ?? ''}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-md border border-white/15 bg-white/10 px-2 text-xs text-white placeholder:text-white/30 focus:border-sky-400/60 focus:outline-none"
                />
              )}
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-3 flex h-9 items-center gap-2 rounded-md bg-sky-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-500 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          ثبت در سرویس {meta.name}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-950/50 p-3 text-xs text-red-200">
          <p className="font-semibold">خطا در دریافت داده از میکروسرویس</p>
          <p className="mt-1 text-red-200/80">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 flex items-center gap-1.5 rounded-md border border-red-400/40 px-2.5 py-1.5 text-[11px] text-red-100 transition-colors hover:bg-red-500/20"
          >
            <RefreshCw className="h-3 w-3" />
            تلاش مجدد
          </button>
        </div>
      )}

      {/* Records table */}
      <div className="overflow-hidden rounded-lg border border-white/10">
        <div className="max-h-56 overflow-auto">
          <table className="w-full min-w-[480px] text-right text-xs">
            <thead className="sticky top-0 bg-[#2a2d34] text-white/70">
              <tr>
                <th className="px-2.5 py-2 font-medium">#</th>
                {meta.fields.map((field) => (
                  <th key={field.key} className="px-2.5 py-2 font-medium">
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={meta.fields.length + 1}
                    className="px-3 py-6 text-center text-white/40"
                  >
                    در حال دریافت از میکروسرویس...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={meta.fields.length + 1}
                    className="px-3 py-6 text-center text-white/40"
                  >
                    هنوز {meta.recordLabel}ی ثبت نشده است
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((item, index) => (
                  <tr
                    key={String(item.id ?? index)}
                    className="border-t border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-2.5 py-2 text-white/35">
                      {numberFormatter.format(index + 1)}
                    </td>
                    {meta.fields.map((field) => (
                      <td
                        key={field.key}
                        className="whitespace-nowrap px-2.5 py-2 text-white/85"
                      >
                        {field.type === 'select' &&
                        typeof item[field.key] === 'string' &&
                        item[field.key] !== '' ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusBadgeColor(
                                String(item[field.key]),
                              )}`}
                            />
                            {formatValue(field, item[field.key])}
                          </span>
                        ) : (
                          formatValue(field, item[field.key])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
