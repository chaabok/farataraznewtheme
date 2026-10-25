"use client";

/**
 * OrgSelectors (Task 78 — درخواست مالک، هدر داشبورد):
 *   · فیلد ۱ — لیست کسب‌وکارهای نوع «هلدینگ/شرکت» از فرم ساختار کسب‌وکار؛
 *     پیش‌فرض = اولین شرکت تعریف‌شده، و پس از تغییر کاربر = آخرین انتخاب او
 *     (erp.orgContext در localStorage).
 *   · فیلد ۲/۳/۴ — فقط وقتی برای سطح انتخابی «شعبه / نمایندگی / فروشگاه»
 *     تعریف شده باشد نمایش داده می‌شوند و با انتخاب هر سطح عمیق‌تر، لیست
 *     سطح بعد به همان مسیر محدود می‌شود (قواعد فرزندیِ فرم ساختار کسب‌وکار).
 * انتخاب هر سطح، نمایش اطلاعات فرم‌ها را در همان سطح فیلتر می‌کند
 * (پیاده‌سازی سمت داده: loadFormData(scope) + saveFormData(org)).
 */

import * as React from "react";
import { Building, Building2, ChevronDown, Handshake, Store } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { useOrgContext, useOrgScope, useOrgTreeLoader } from "@/stores/org-context-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** sentinel value of the «همه» clear item (empty string is risky in Radix radio groups) */
const ALL = "__all__";

interface OrgSelectorProps {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  items: Array<{ id: number; label: string }>;
  onSelect: (id: number | null) => void;
  /** present → a leading «همه» item that clears the selection (back to the parent level) */
  allLabel?: string;
  iconOnly?: boolean;
}

function OrgSelector({ icon, label, value, items, onSelect, allLabel, iconOnly }: OrgSelectorProps) {
  const selected = items.find((i) => i.id === value) ?? null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={selected ? `${label}: ${selected.label}` : label}
          aria-label={label}
          className={cn(
            "flex h-6 min-w-0 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-foreground/[0.06] px-2 text-[11px] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground data-[state=open]:bg-foreground/10 data-[state=open]:text-foreground",
            iconOnly && "w-6 justify-center px-0",
          )}
        >
          {icon}
          {!iconOnly && (
            <span
              className={cn(
                "truncate tabular-nums",
                selected ? "max-w-28 font-medium text-foreground/85" : "max-w-24",
              )}
            >
              {selected ? selected.label : label}
            </span>
          )}
          {!iconOnly && <ChevronDown className="h-2.5 w-2.5 shrink-0 opacity-60" aria-hidden />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 min-w-44 overflow-y-auto">
        <DropdownMenuRadioGroup
          value={value != null ? String(value) : ALL}
          onValueChange={(v) => onSelect(v === ALL ? null : Number(v))}
        >
          {allLabel !== undefined && (
            <DropdownMenuRadioItem value={ALL} className="text-muted-foreground">
              {allLabel}
            </DropdownMenuRadioItem>
          )}
          {items.map((it) => (
            <DropdownMenuRadioItem key={it.id} value={String(it.id)}>
              {it.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The four cascade fields. Rendered inside the dockable dashboard header:
 *  · top dock    → pills with the selected title (icon-only on narrow screens)
 *  · left/right  → stacked icon-only buttons in the vertical strip
 * Clicks never drag the bar (pointerdown stops here); double-click never
 * snaps the dock back to top.
 */
export function OrgSelectors({ vertical, narrow }: { vertical: boolean; narrow: boolean }) {
  useOrgTreeLoader(); // بارگذاری درخت + بازخوانی با «erp:records-changed» فرم ساختار کسب‌وکار
  const t = useT();
  const { lists } = useOrgScope();
  const setCompany = useOrgContext((s) => s.setCompany);
  const setBranch = useOrgContext((s) => s.setBranch);
  const setAgency = useOrgContext((s) => s.setAgency);
  const setShop = useOrgContext((s) => s.setShop);

  if (lists.companies.length === 0) return null; // هنوز هلدینگ/شرکتی تعریف نشده

  const iconOnly = vertical || narrow;

  return (
    <div
      dir="auto"
      role="group"
      aria-label={t("header.orgCompany")}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className={cn("flex shrink-0 items-center gap-1.5", vertical && "flex-col")}
    >
      <OrgSelector
        icon={<Building2 className="h-3 w-3 shrink-0" aria-hidden />}
        label={t("header.orgCompany")}
        value={lists.companyId}
        items={lists.companies}
        onSelect={setCompany}
        iconOnly={iconOnly}
      />
      {lists.branches.length > 0 && (
        <OrgSelector
          icon={<Building className="h-3 w-3 shrink-0" aria-hidden />}
          label={t("header.orgBranch")}
          value={lists.branchId}
          items={lists.branches}
          onSelect={setBranch}
          allLabel={t("header.orgAll")}
          iconOnly={iconOnly}
        />
      )}
      {lists.agencies.length > 0 && (
        <OrgSelector
          icon={<Handshake className="h-3 w-3 shrink-0" aria-hidden />}
          label={t("header.orgAgency")}
          value={lists.agencyId}
          items={lists.agencies}
          onSelect={setAgency}
          allLabel={t("header.orgAll")}
          iconOnly={iconOnly}
        />
      )}
      {lists.shops.length > 0 && (
        <OrgSelector
          icon={<Store className="h-3 w-3 shrink-0" aria-hidden />}
          label={t("header.orgShop")}
          value={lists.shopId}
          items={lists.shops}
          onSelect={setShop}
          allLabel={t("header.orgAll")}
          iconOnly={iconOnly}
        />
      )}
    </div>
  );
}
