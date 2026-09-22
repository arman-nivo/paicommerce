"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { formatMoney } from "@pai/core";
import { cn } from "@pai/ui";

export type PricingPlan = {
  code: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  highlighted: boolean;
  features: string[];
  monthlyHref: string;
  yearlyHref: string;
  cta: string;
};

export function savingsPct(p: { priceMonthly: number; priceYearly: number }) {
  if (!p.priceMonthly) return 0;
  return Math.round((1 - p.priceYearly / (p.priceMonthly * 12)) * 100);
}

export function PricingCards({ plans, compact, dark }: { plans: PricingPlan[]; compact?: boolean; dark?: boolean }) {
  const [yearly, setYearly] = useState(true);
  const maxSave = Math.max(0, ...plans.map(savingsPct));

  return (
    <div>
      <div className="flex justify-center">
        <div
          role="radiogroup"
          aria-label="Billing interval"
          className={cn("relative inline-flex rounded-full p-1 ring-1", dark ? "bg-white/5 ring-white/10" : "bg-slate-100 ring-slate-200")}
        >
          {[
            { v: false, label: "Monthly" },
            { v: true, label: "Yearly" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={yearly === o.v}
              onClick={() => setYearly(o.v)}
              className={cn(
                "relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition",
                yearly === o.v ? (dark ? "bg-white text-slate-900 shadow" : "bg-white text-slate-900 shadow-sm") : dark ? "text-slate-300" : "text-slate-500",
              )}
            >
              {o.label}
              {o.v && maxSave > 0 && <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">Save {maxSave}%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("mt-10 grid gap-5", plans.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3")}>
        {plans.map((p) => {
          const monthlyEquivalent = yearly ? Math.round(p.priceYearly / 12) : p.priceMonthly;
          const save = savingsPct(p);
          const free = p.priceMonthly === 0;
          return (
            <div
              key={p.code}
              className={cn(
                "relative flex flex-col rounded-3xl p-7 transition",
                p.highlighted
                  ? "bg-slate-950 text-white shadow-[0_30px_60px_-20px_rgba(37,69,235,0.55)] ring-2 ring-brand-500 xl:-my-3 xl:py-10"
                  : dark
                    ? "bg-white/[0.04] text-white ring-1 ring-white/10"
                    : "bg-white ring-1 ring-slate-200",
              )}
            >
              {p.highlighted && (
                <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  <Sparkles className="size-3.5" /> Most popular
                </span>
              )}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className={cn("mt-1 min-h-10 text-sm", p.highlighted || dark ? "text-slate-400" : "text-slate-500")}>{p.tagline}</p>
              <div className="mt-6 flex items-end gap-1.5">
                <span className="font-display text-4xl font-extrabold tracking-tight">{free ? "৳0" : formatMoney(monthlyEquivalent, p.currency)}</span>
                <span className={cn("pb-1.5 text-sm", p.highlighted || dark ? "text-slate-400" : "text-slate-500")}>/month</span>
              </div>
              <p className={cn("mt-1 h-5 text-xs", p.highlighted || dark ? "text-slate-400" : "text-slate-500")}>
                {free ? "Free forever" : yearly ? (
                  <>
                    {formatMoney(p.priceYearly, p.currency)} billed yearly{save > 0 && <span className="ml-1 font-semibold text-emerald-500">· save {save}%</span>}
                  </>
                ) : (
                  "Billed monthly · cancel anytime"
                )}
              </p>
              <a
                href={yearly ? p.yearlyHref : p.monthlyHref}
                className={cn(
                  "group mt-6 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition",
                  p.highlighted
                    ? "bg-gradient-to-r from-brand-500 to-violet-500 text-white hover:opacity-95"
                    : dark
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-800",
                )}
              >
                {p.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              {!compact && (
                <ul className="mt-7 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <Check className={cn("mt-0.5 size-4 shrink-0", p.highlighted ? "text-brand-400" : "text-brand-600")} />
                      <span className={p.highlighted || dark ? "text-slate-300" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
              {compact && (
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <Check className={cn("mt-0.5 size-4 shrink-0", p.highlighted ? "text-brand-400" : "text-brand-600")} />
                      <span className={p.highlighted || dark ? "text-slate-300" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
