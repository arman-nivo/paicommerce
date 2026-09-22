/**
 * Pulse product card — a clean, clinical card: form badge (Tablet / Capsule / Supplement …),
 * "Rx" flag for prescription items, manufacturer line, savings and a full-width add button.
 * The kit's listing cards (collection, search, related) are restyled to match in `index.ts`.
 */
import type { SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { Link, Placeholder, Rating, cn, discountPercent, formatMoney, moneyOf, stripHtml, truncate } from "@pai/theme-kit";
import { QuickAddButton } from "@pai/theme-kit/client";

export function slim(p: SfProduct): SfProduct {
  return { ...p, description: truncate(stripHtml(p.description), 200), images: p.images.slice(0, 4) };
}

/** Prescription-only products are tagged `rx`, `prescription` or `prescription-required`. */
export function isRx(p: Pick<SfProduct, "tags">): boolean {
  return p.tags.some((t) => /^(rx|prescription|prescription-required)$/i.test(t));
}

export function PulseCard({ product: p, context, priority, className }: { product: SfProduct; context: StorefrontContext; priority?: boolean; className?: string }) {
  const money = moneyOf(context);
  const fmt = (n: number) => formatMoney(n, money.currency, money.display);
  const img = p.featuredImage ?? p.images[0] ?? null;
  const off = discountPercent(p.price, p.compareAtPrice);
  const rx = isRx(p);
  return (
    <article className={cn("pulse-card group relative flex h-full flex-col overflow-hidden rounded-pai border border-pai-border bg-pai-card transition duration-300", className)}>
      <div className="relative aspect-square overflow-hidden bg-pai-muted">
        <Link href={p.url} tabIndex={-1} aria-hidden className="absolute inset-0">
          {img ? (
            <img src={img.url} alt="" loading={priority ? "eager" : "lazy"} decoding="async" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]" />
          ) : (
            <Placeholder kind="product" className="absolute inset-0" />
          )}
        </Link>
        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <span className="flex flex-col items-start gap-1">
            {p.productType ? <span className="pulse-pill bg-white/95 text-pai-fg shadow-sm">{p.productType}</span> : null}
            {rx ? <span className="pulse-pill bg-amber-100 text-amber-900">Rx required</span> : null}
          </span>
          {!p.available ? <span className="pulse-pill bg-pai-fg text-pai-bg">Out of stock</span> : off ? <span className="pulse-pill bg-pai-sale text-white">{off}% off</span> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        {p.vendor ? <p className="truncate text-[11px] font-medium text-pai-primary">{p.vendor}</p> : null}
        <h3 className="text-[0.9rem] font-semibold leading-snug">
          <Link href={p.url} className="pai-line-clamp-2 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline">
            {p.title}
          </Link>
        </h3>
        {p.rating.count > 0 ? <Rating value={p.rating.average} count={p.rating.count} size={12} /> : null}
        <p className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          <span className="text-base font-bold tabular-nums">{p.priceMax > p.price ? <span className="mr-1 text-xs font-normal opacity-60">From</span> : null}{fmt(p.price)}</span>
          {off && p.compareAtPrice ? <s className="text-xs opacity-50">{fmt(p.compareAtPrice)}</s> : null}
        </p>
        {p.available ? (
          <div className="relative z-10 mt-2.5">
            <QuickAddButton product={slim(p)} mode="bar" label="Add to cart" className="pulse-add !bg-pai-primary/10 !text-pai-primary !shadow-none hover:!bg-pai-primary hover:!text-pai-primary-fg" />
          </div>
        ) : (
          <p className="mt-2.5 rounded-pai-btn border border-dashed border-pai-border py-2 text-center text-xs font-medium opacity-70">Notify me when available</p>
        )}
      </div>
    </article>
  );
}
