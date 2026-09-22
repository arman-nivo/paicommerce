"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Minus, Plus } from "lucide-react";
import { useCart, useStorefront } from "@pai/theme-kit/client";

export type BuyVariant = { id: string | null; label: string; price: number; compareAt: number | null; available: boolean };
export type BuyProduct = { id: string; title: string; url: string; imageUrl: string | null; optionName: string | null; variants: BuyVariant[] };

const cx = (...c: (string | number | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/**
 * FreshMart card footer: unit/weight chips, live price and an "Add" button that turns into a
 * − qty + stepper once the selected unit is in the cart. Adds silently (no drawer) so shoppers
 * can fill a basket quickly; the header and bottom nav show the running count.
 */
export function FreshBuy({ product, size = "md" }: { product: BuyProduct; size?: "md" | "lg" }) {
  const { cart, add, update } = useCart();
  const sf = useStorefront();
  const firstAvailable = Math.max(0, product.variants.findIndex((v) => v.available));
  const [index, setIndex] = useState(firstAvailable);
  const [busy, setBusy] = useState(false);
  const v = product.variants[index] ?? product.variants[0];
  const key = `${product.id}:${v?.id ?? ""}`;
  const line = useMemo(() => cart.lines.find((l) => l.key === key), [cart.lines, key]);
  if (!v) return null;

  const onAdd = async () => {
    if (!v.available || busy) return;
    setBusy(true);
    await add(
      {
        productId: product.id,
        variantId: v.id,
        quantity: 1,
        optimistic: { title: product.title, imageUrl: product.imageUrl, price: v.price, variantTitle: v.id ? v.label : null, url: product.url },
      },
      { silent: true },
    );
    setBusy(false);
  };

  const chips = product.variants.length > 1;
  const btn = size === "lg" ? "h-11 text-sm" : "h-9 text-[13px]";
  return (
    <div className="mt-auto flex flex-col gap-2.5 pt-1">
      {chips ? (
        product.variants.length <= 3 ? (
          <div role="radiogroup" aria-label={product.optionName ?? "Size"} className="flex flex-wrap gap-1.5">
            {product.variants.map((x, i) => (
              <button
                key={x.id ?? i}
                type="button"
                role="radio"
                aria-checked={i === index}
                disabled={!x.available}
                onClick={() => setIndex(i)}
                className={cx(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary",
                  i === index ? "border-pai-primary bg-[color-mix(in_srgb,var(--pai-primary)_12%,transparent)] text-pai-primary" : "border-pai-border hover:border-pai-fg/40",
                  !x.available && "line-through opacity-40",
                )}
              >
                {x.label}
              </button>
            ))}
          </div>
        ) : (
          <label className="block">
            <span className="sr-only">{product.optionName ?? "Size"}</span>
            <select
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-pai-border bg-pai-bg px-2 py-1.5 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary"
            >
              {product.variants.map((x, i) => (
                <option key={x.id ?? i} value={i} disabled={!x.available}>
                  {x.label} — {sf.format(x.price)}
                </option>
              ))}
            </select>
          </label>
        )
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 flex-col leading-tight">
          <span className={cx("font-bold tabular-nums", size === "lg" ? "text-lg" : "text-[15px]", v.compareAt && v.compareAt > v.price && "text-pai-sale")}>{sf.format(v.price)}</span>
          {v.compareAt && v.compareAt > v.price ? <s className="text-[11px] tabular-nums opacity-50">{sf.format(v.compareAt)}</s> : null}
        </p>
        {!v.available ? (
          <span className={cx("inline-flex items-center rounded-lg bg-pai-muted px-3 font-semibold opacity-70", btn)}>Out of stock</span>
        ) : line ? (
          <div className={cx("inline-flex items-center overflow-hidden rounded-lg bg-pai-primary text-pai-primary-fg", btn)} aria-live="polite">
            <button type="button" onClick={() => update(line.key, line.quantity - 1)} aria-label={`Remove one ${product.title}`} className="grid h-full w-8 place-items-center transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white">
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-6 text-center font-bold tabular-nums">{line.quantity}</span>
            <button type="button" onClick={() => update(line.key, line.quantity + 1)} aria-label={`Add one more ${product.title}`} className="grid h-full w-8 place-items-center transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white">
              <Plus className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            disabled={busy}
            aria-label={`Add ${product.title}${chips ? ` (${v.label})` : ""} to cart`}
            className={cx(
              "inline-flex items-center gap-1 rounded-lg border-2 border-pai-primary px-3.5 font-bold text-pai-primary transition hover:bg-pai-primary hover:text-pai-primary-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2 disabled:opacity-60",
              btn,
            )}
          >
            {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <Plus className="size-3.5" strokeWidth={3} />}
            Add
          </button>
        )}
      </div>
    </div>
  );
}
