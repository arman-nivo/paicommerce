"use client";
import * as React from "react";
import { BadgePercent, Banknote, Truck } from "lucide-react";
import { cn, Field, Input } from "@pai/ui";
import { MoneyInput } from "@/components/money-input";
import type { DiscountType } from "../_lib/shared";

const TYPES: { value: DiscountType; label: string; hint: string; icon: React.ReactNode }[] = [
  { value: "percentage", label: "Percentage", hint: "e.g. 10% off", icon: <BadgePercent className="size-5" /> },
  { value: "fixed", label: "Fixed amount", hint: "e.g. ৳200 off", icon: <Banknote className="size-5" /> },
  { value: "free_shipping", label: "Free shipping", hint: "No delivery charge", icon: <Truck className="size-5" /> },
];

export type DiscountSettings = {
  type: DiscountType;
  value: number; // percent or minor units
  minSubtotal: number | null;
  usageLimit: number | null;
  oncePerCustomer: boolean;
  startsAt: string; // datetime-local (Asia/Dhaka)
  endsAt: string;
  active: boolean;
};

/** Type radio cards + value input. */
export function TypeValueFields({ value, onChange }: { value: Pick<DiscountSettings, "type" | "value">; onChange: (patch: Partial<DiscountSettings>) => void }) {
  const pctInvalid = value.type === "percentage" && (value.value < 1 || value.value > 100);
  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Discount type" className="grid gap-2 sm:grid-cols-3">
        {TYPES.map((t) => {
          const on = value.type === t.value;
          return (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange({ type: t.value, value: t.value === value.type ? value.value : t.value === "percentage" ? 10 : t.value === "fixed" ? 10000 : 0 })}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                on ? "border-primary bg-accent ring-2 ring-primary/20" : "border-border hover:border-input hover:bg-muted/50",
              )}
            >
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{t.icon}</span>
              <span>
                <span className="block text-sm font-medium">{t.label}</span>
                <span className="block text-xs text-muted-foreground">{t.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
      {value.type === "percentage" && (
        <Field label="Discount percentage" error={pctInvalid ? "Enter a percentage between 1 and 100" : null} className="max-w-48">
          <div className="relative">
            <Input
              inputMode="numeric"
              value={value.value || ""}
              onChange={(e) => onChange({ value: Math.min(100, Number(e.target.value.replace(/\D/g, "")) || 0) })}
              className="pr-8 tabular-nums"
              placeholder="10"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
          </div>
        </Field>
      )}
      {value.type === "fixed" && (
        <Field label="Discount amount" error={value.value < 1 ? "Enter the amount to take off" : null} className="max-w-48">
          <MoneyInput value={value.value} onChange={(v) => onChange({ value: v ?? 0 })} />
        </Field>
      )}
      {value.type === "free_shipping" && <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">The delivery charge is removed at checkout when this code is used.</p>}
    </div>
  );
}

/** Minimum subtotal + usage limit inputs. */
export function RequirementFields({ value, onChange, usageLabel = "Total usage limit" }: { value: Pick<DiscountSettings, "minSubtotal" | "usageLimit">; onChange: (patch: Partial<DiscountSettings>) => void; usageLabel?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Minimum order subtotal" hint="Leave empty for no minimum">
        <MoneyInput value={value.minSubtotal} allowEmpty placeholder="No minimum" onChange={(v) => onChange({ minSubtotal: v || null })} />
      </Field>
      <Field label={usageLabel} hint="Leave empty for unlimited uses">
        <Input
          inputMode="numeric"
          value={value.usageLimit ?? ""}
          placeholder="Unlimited"
          onChange={(e) => {
            const n = Number(e.target.value.replace(/\D/g, ""));
            onChange({ usageLimit: n > 0 ? n : null });
          }}
          className="tabular-nums"
        />
      </Field>
    </div>
  );
}

export function DateFields({ value, onChange }: { value: Pick<DiscountSettings, "startsAt" | "endsAt">; onChange: (patch: Partial<DiscountSettings>) => void }) {
  const bad = value.startsAt && value.endsAt && value.endsAt <= value.startsAt;
  const input = "h-9 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-xs focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/15 dark:[color-scheme:dark]";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Starts" hint="Empty = starts immediately">
        <input type="datetime-local" className={input} value={value.startsAt} onChange={(e) => onChange({ startsAt: e.target.value })} />
      </Field>
      <Field label="Ends" error={bad ? "End must be after the start" : null} hint="Empty = never expires">
        <input type="datetime-local" className={input} value={value.endsAt} onChange={(e) => onChange({ endsAt: e.target.value })} />
      </Field>
    </div>
  );
}

export function settingsValid(s: DiscountSettings) {
  if (s.type === "percentage" && (s.value < 1 || s.value > 100)) return false;
  if (s.type === "fixed" && s.value < 1) return false;
  if (s.startsAt && s.endsAt && s.endsAt <= s.startsAt) return false;
  return true;
}
