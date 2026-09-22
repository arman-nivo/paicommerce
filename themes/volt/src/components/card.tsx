/**
 * Volt product card — a dark "spec card": vendor chip, glowing media well, savings pill and a
 * one-tap add button. Used by every Volt section; the kit's own listings (collection, search,
 * related products) are restyled to match via the theme CSS in `index.ts`.
 */
import type { SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { Link, Placeholder, Rating, cn, discountPercent, formatMoney, moneyOf, stripHtml, truncate } from "@pai/theme-kit";
import { QuickAddButton, WishlistButton } from "@pai/theme-kit/client";

/** Drop heavy fields before handing a product to a client island. */
export function slim(p: SfProduct): SfProduct {
  return { ...p, description: truncate(stripHtml(p.description), 200), images: p.images.slice(0, 4) };
}

export function VoltCard({
  product: p,
  context,
  priority,
  size = "md",
  stockBar = false,
  className,
}: {
  product: SfProduct;
  context: StorefrontContext;
  priority?: boolean;
  size?: "sm" | "md";
  /** Show a "sold / claimed" progress bar (flash deals). */
  stockBar?: boolean;
  className?: string;
}) {
  const money = moneyOf(context);
  const fmt = (n: number) => formatMoney(n, money.currency, money.display);
  const img = p.featuredImage ?? p.images[0] ?? null;
  const off = discountPercent(p.price, p.compareAtPrice);
  const save = off && p.compareAtPrice ? p.compareAtPrice - p.price : 0;
  // Deterministic "claimed" percentage so server and client agree (no Math.random).
  const claimed = Math.min(94, 38 + ((p.slug.length * 7 + p.inventory * 3) % 55));
  return (
    <article className={cn("volt-card group relative flex h-full flex-col overflow-hidden rounded-pai border border-pai-border bg-pai-card transition duration-300", className)}>
      <div className="volt-card-media relative aspect-square overflow-hidden">
        <Link href={p.url} tabIndex={-1} aria-hidden className="absolute inset-0">
          {img ? (
            <img
              src={img.url}
              alt=""
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.05]"
            />
          ) : (
            <Placeholder kind="product" className="absolute inset-0" />
          )}
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {!p.available ? (
            <span className="volt-chip bg-pai-fg/85 text-pai-bg">Sold out</span>
          ) : off ? (
            <span className="volt-chip bg-pai-sale text-white">−{off}%</span>
          ) : null}
        </div>
        <div className="absolute right-3 top-3 z-10 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <WishlistButton productId={p.id} productTitle={p.title} className="size-8 bg-black/60 text-white" />
        </div>
      </div>
      <div className={cn("flex flex-1 flex-col gap-1.5", size === "sm" ? "p-3" : "p-4")}>
        {p.vendor ? <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-pai-accent">{p.vendor}</p> : null}
        <h3 className={cn("font-medium leading-snug", size === "sm" ? "text-[0.85rem]" : "text-[0.95rem]")}>
          <Link href={p.url} className="pai-line-clamp-2 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline">
            {p.title}
          </Link>
        </h3>
        {p.rating.count > 0 ? <Rating value={p.rating.average} count={p.rating.count} size={12} /> : null}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            <p className={cn("font-heading font-bold tabular-nums", size === "sm" ? "text-base" : "text-lg", off && "text-pai-primary")}>
              {p.priceMax > p.price ? <span className="mr-1 text-xs font-normal opacity-60">From</span> : null}
              {fmt(p.price)}
            </p>
            {off && p.compareAtPrice ? (
              <p className="text-xs opacity-60">
                <s>{fmt(p.compareAtPrice)}</s> <span className="ml-1 font-semibold text-pai-accent">Save {fmt(save)}</span>
              </p>
            ) : (
              <p className={cn("text-xs", p.available ? "text-emerald-400/90" : "opacity-50")}>{p.available ? "In stock" : "Out of stock"}</p>
            )}
          </div>
          {p.available ? (
            <div className="relative z-10 shrink-0">
              <QuickAddButton product={slim(p)} mode="icon" className="size-10 rounded-[min(var(--pai-button-radius),12px)]" />
            </div>
          ) : null}
        </div>
        {stockBar ? (
          <div className="mt-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-pai-fg/10">
              <div className="volt-meter h-full rounded-full" style={{ width: `${claimed}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] font-medium opacity-70">{claimed}% claimed</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
