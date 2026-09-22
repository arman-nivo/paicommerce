"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useProductForm, useStorefront } from "@pai/theme-kit/client";

const perMonth = (price: number, months: number) => (price > 0 && months > 0 ? Math.ceil(price / months / 100) * 100 : 0);

/**
 * EMI calculator: a radio group of tenures (arrow keys move between them) and the monthly
 * instalment for the chosen tenure at 0% interest. Prices are in minor units.
 */
export function EmiCalculator({ price, months, defaultMonths, label = "Choose a tenure" }: { price: number; months: number[]; defaultMonths: number; label?: string }) {
  const { format } = useStorefront();
  const initial = Math.max(0, months.indexOf(defaultMonths));
  const [active, setActive] = useState(initial === -1 ? months.length - 1 : initial);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelId = useId();
  const m = months[active] ?? defaultMonths;
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + months.length) % months.length;
    setActive(next);
    refs.current[next]?.focus();
  };
  return (
    <div>
      <p id={labelId} className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] opacity-70">
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={labelId} onKeyDown={onKey} className="flex flex-wrap gap-2">
        {months.map((n, i) => (
          <button
            key={n}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={i === active}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={
              "min-w-16 rounded-pai-btn border px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current " +
              (i === active ? "border-current bg-current/10" : "border-current/25 opacity-75 hover:border-current/60 hover:opacity-100")
            }
          >
            {n} months
          </button>
        ))}
      </div>
      <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1" aria-live="polite">
        <span className="font-heading text-4xl leading-none md:text-5xl">{format(perMonth(price, m))}</span>
        <span className="text-sm opacity-70">/ month × {m} months</span>
      </p>
      <p className="mt-2 text-sm opacity-65">
        Total {format(price)} · 0% interest · no hidden fees
      </p>
    </div>
  );
}

/**
 * EMI line on the product page. Follows the selected variant's price through `useProductForm()`
 * and hides itself below the minimum EMI amount.
 */
export function EmiNote({ months, minPrice, text, detail, fallbackPrice }: { months: number; minPrice: number; text: string; detail?: string; fallbackPrice: number }) {
  const form = useProductForm();
  const { format } = useStorefront();
  const price = (form?.price ?? fallbackPrice) * Math.max(1, form?.quantity ?? 1);
  if (!price || price < minPrice) return null;
  const line = text.replace("{amount}", format(perMonth(price, months))).replace("{months}", String(months));
  return (
    <div className="nest-emi flex items-start gap-3 rounded-pai border border-pai-border bg-pai-card px-4 py-3 text-sm">
      <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-pai-accent/15 text-[0.7rem] font-bold text-pai-accent">
        0%
      </span>
      <span>
        <span className="block font-medium">{line}</span>
        {detail ? <span className="mt-0.5 block text-xs opacity-65">{detail}</span> : null}
      </span>
    </div>
  );
}
