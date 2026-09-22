"use client";

import { useId, useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link, useStorefront } from "@pai/theme-kit/client";

export type FinderItem = {
  id: string;
  title: string;
  url: string;
  image: string | null;
  price: number;
  compareAt: number | null;
  /** Age range in months, or null when unknown (matches every age). */
  months: [number, number] | null;
  /** Lower-cased tags + title words, used for the pet type filter. */
  keywords: string;
};

export type FinderPool = { key: "kid" | "baby" | "pet"; label: string; emoji: string; url: string; items: FinderItem[] };

type Option = { id: string; label: string; emoji?: string; months?: [number, number]; keyword?: RegExp };

const AGE_OPTIONS: Record<FinderPool["key"], Option[]> = {
  kid: [
    { id: "any", label: "Any age" },
    { id: "1-3", label: "1–3 years", emoji: "🧸", months: [12, 35] },
    { id: "3-5", label: "3–5 years", emoji: "🎨", months: [36, 59] },
    { id: "5-8", label: "5–8 years", emoji: "🚂", months: [60, 95] },
    { id: "8+", label: "8+ years", emoji: "🧩", months: [96, 999] },
  ],
  baby: [
    { id: "any", label: "Any age" },
    { id: "0-6", label: "0–6 months", emoji: "🍼", months: [0, 5] },
    { id: "6-12", label: "6–12 months", emoji: "🐣", months: [6, 11] },
    { id: "12-24", label: "1–2 years", emoji: "👣", months: [12, 24] },
  ],
  pet: [
    { id: "any", label: "Any pet" },
    { id: "dog", label: "Dog", emoji: "🐶", keyword: /\b(dog|dogs|puppy|pupp(y|ies)|canine)\b/ },
    { id: "cat", label: "Cat", emoji: "🐱", keyword: /\b(cat|cats|kitten|kittens|feline)\b/ },
  ],
};

const PALETTE = ["var(--ph-c1)", "var(--ph-c2)", "var(--ph-c3)", "var(--ph-c4)", "var(--ph-c5)"];

function Pills({ legend, name, options, value, onChange, step }: { legend: string; name: string; options: Option[]; value: string; onChange: (v: string) => void; step: number }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold">
        <span aria-hidden className="grid size-7 place-items-center rounded-full bg-pai-fg text-sm font-bold text-pai-bg">
          {step}
        </span>
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const checked = value === o.id;
          return (
            <label
              key={o.id}
              className={
                "relative inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ring-2 transition has-[:focus-visible]:ring-pai-primary has-[:focus-visible]:ring-offset-2 " +
                (checked ? "text-pai-fg shadow-[0_3px_0_rgba(0,0,0,.14)] ring-transparent" : "bg-pai-bg ring-pai-border hover:ring-pai-fg/30")
              }
              style={checked ? { background: PALETTE[(i + step) % PALETTE.length] } : undefined}
            >
              <input type="radio" name={name} value={o.id} checked={checked} onChange={() => onChange(o.id)} className="sr-only" />
              {o.emoji ? <span aria-hidden>{o.emoji}</span> : null}
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Interactive gift finder: who → age/type → budget, filtering a server-provided product pool. */
export function GiftFinder({ pools, budgets, defaultWho, limit, showProducts }: { pools: FinderPool[]; budgets: number[]; defaultWho: string; limit: number; showProducts: boolean }) {
  const sf = useStorefront();
  const uid = useId();
  const [who, setWho] = useState<string>(pools.some((p) => p.key === defaultWho) ? defaultWho : (pools[0]?.key ?? "kid"));
  const [age, setAge] = useState("any");
  const [budget, setBudget] = useState("any");
  const pool = pools.find((p) => p.key === who) ?? pools[0];

  const sorted = [...budgets].filter((b) => b > 0).sort((a, b) => a - b);
  const budgetOptions: (Option & { min?: number; max?: number })[] = [
    { id: "any", label: "Any budget" },
    ...sorted.map((b, i) => ({ id: `b${i}`, label: i === 0 ? `Under ${sf.format(b * 100)}` : `${sf.format(sorted[i - 1]! * 100)}–${sf.format(b * 100)}`, min: i === 0 ? undefined : sorted[i - 1], max: b })),
    ...(sorted.length ? [{ id: "top", label: `${sf.format(sorted[sorted.length - 1]! * 100)}+`, min: sorted[sorted.length - 1] }] : []),
  ];
  const ageOptions = AGE_OPTIONS[(pool?.key ?? "kid") as FinderPool["key"]];
  const ageOpt = ageOptions.find((o) => o.id === age) ?? ageOptions[0]!;
  const budgetOpt = budgetOptions.find((o) => o.id === budget) ?? budgetOptions[0]!;

  const matches = useMemo(() => {
    if (!pool) return [];
    return pool.items.filter((p) => {
      if (ageOpt.months && p.months && (p.months[1] < ageOpt.months[0] || p.months[0] > ageOpt.months[1])) return false;
      if (ageOpt.keyword && !ageOpt.keyword.test(p.keywords)) return false;
      if (budgetOpt.min !== undefined && p.price < budgetOpt.min * 100) return false;
      if (budgetOpt.max !== undefined && p.price > budgetOpt.max * 100) return false;
      return true;
    });
  }, [pool, ageOpt, budgetOpt]);

  if (!pool) return null;
  const params = new URLSearchParams();
  if (budgetOpt.min !== undefined) params.set("min", String(budgetOpt.min));
  if (budgetOpt.max !== undefined) params.set("max", String(budgetOpt.max));
  const seeAll = pool.url + (params.toString() ? (pool.url.includes("?") ? "&" : "?") + params.toString() : "");

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
      <form className="space-y-7" onSubmit={(e) => e.preventDefault()} aria-describedby={`${uid}-status`}>
        <Pills
          step={1}
          legend="Who's it for?"
          name={`${uid}-who`}
          value={who}
          onChange={(v) => {
            setWho(v);
            setAge("any");
          }}
          options={pools.map((p) => ({ id: p.key, label: p.label, emoji: p.emoji }))}
        />
        <Pills step={2} legend={pool.key === "pet" ? "What kind of pet?" : "How old are they?"} name={`${uid}-age`} value={ageOpt.id} onChange={setAge} options={ageOptions} />
        <Pills step={3} legend="What's your budget?" name={`${uid}-budget`} value={budgetOpt.id} onChange={setBudget} options={budgetOptions} />
      </form>

      <div className="rounded-[28px] bg-pai-bg p-4 shadow-[0_18px_40px_-26px_rgba(0,0,0,.45)] ring-1 ring-pai-border md:p-6">
        <p id={`${uid}-status`} role="status" aria-live="polite" className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Sparkles className="size-5 text-[var(--ph-c2)]" aria-hidden />
          {matches.length ? `We found ${matches.length} ${matches.length === 1 ? "idea" : "ideas"} for you` : "No exact matches — try another budget"}
        </p>
        {showProducts && matches.length ? (
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {matches.slice(0, limit).map((p, i) => (
              <li key={p.id}>
                <Link href={p.url} className="group flex h-full flex-col gap-2 rounded-[20px] p-2 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary" style={{ background: `color-mix(in srgb, ${PALETTE[i % PALETTE.length]} 22%, white)` }}>
                  <span className="relative block aspect-square overflow-hidden rounded-2xl bg-pai-muted">
                    {p.image ? <img src={p.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105" /> : null}
                  </span>
                  <span className="px-1 pb-1">
                    <span className="pai-line-clamp-2 text-sm font-bold leading-snug">{p.title}</span>
                    <span className="mt-0.5 block text-sm">
                      <span className={p.compareAt && p.compareAt > p.price ? "font-bold text-pai-sale" : "font-bold"}>{sf.format(p.price)}</span>
                      {p.compareAt && p.compareAt > p.price ? <s className="ml-1.5 text-xs opacity-60">{sf.format(p.compareAt)}</s> : null}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <Link href={seeAll} className="pai-btn pai-btn-primary mt-5 w-full gap-2">
          {matches.length ? "See all matching gifts" : `Browse ${pool.label.toLowerCase()} picks`}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
