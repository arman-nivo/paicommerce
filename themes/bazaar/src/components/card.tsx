/**
 * Bazaar product card — the dense marketplace tile: white card, square image, small two-line
 * title, bold price in the primary colour, strike price + −% badge, rating with count and
 * "Free delivery" / "COD" micro chips, plus a one-tap add button. Used by every Bazaar section;
 * the kit's own listings (collection, search, related) are restyled to match via theme CSS.
 */
import type { SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { Link, Placeholder, bool, cn, discountPercent, formatMoney, moneyOf, num, str, stripHtml, truncate } from "@pai/theme-kit";
import { QuickAddButton, WishlistButton } from "@pai/theme-kit/client";
import { Star } from "lucide-react";

/** Drop heavy fields before handing a product to a client island. */
export function slim(p: SfProduct): SfProduct {
  return { ...p, description: truncate(stripHtml(p.description), 160), images: p.images.slice(0, 4) };
}

/** Deterministic 0–1 hash of a slug, so server and client agree (no Math.random). */
export function seeded(slug: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < slug.length; i++) h = Math.imul(h ^ slug.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

/** "Sold" share for flash-sale meters — deterministic per product, 35–94 %. */
export function soldPercent(p: SfProduct): number {
  if (!p.available) return 100;
  return Math.round(35 + seeded(p.slug, 7) * 59);
}

export type CardVariant = "default" | "deal";

export function BazaarCard({
  product: p,
  context,
  priority,
  variant = "default",
  className,
}: {
  product: SfProduct;
  context: StorefrontContext;
  priority?: boolean;
  /** `deal` = flash-sale tile: big price, strike price and a sold meter instead of rating/chips. */
  variant?: CardVariant;
  className?: string;
}) {
  const t = context.theme;
  const money = moneyOf(context);
  const fmt = (n: number) => formatMoney(n, money.currency, money.display);
  const img = p.featuredImage ?? p.images[0] ?? null;
  const off = discountPercent(p.price, p.compareAtPrice);
  const freeOver = num(t.card_free_delivery_over, 999) * 100;
  const showFree = freeOver > 0 && p.price >= freeOver;
  const showCod = bool(t.card_show_cod, true);
  const showRating = bool(t.card_show_rating, true);
  const showBadge = bool(t.card_show_sale_badge, true);
  const quickAdd = bool(t.card_quick_add, true) && p.available;
  const wishlist = bool(t.card_show_wishlist, true);
  const deal = variant === "deal";
  const sold = soldPercent(p);

  return (
    <article className={cn("bz-card group relative flex h-full flex-col overflow-hidden rounded-pai bg-pai-card", className)}>
      <div className="bz-card-media relative aspect-square overflow-hidden bg-white">
        <Link href={p.url} tabIndex={-1} aria-hidden className="absolute inset-0">
          {img ? (
            <img
              src={img.url}
              alt=""
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <Placeholder kind="product" className="absolute inset-0" />
          )}
        </Link>
        {!p.available ? (
          <span className="bz-badge pointer-events-none absolute left-0 top-2 bg-pai-fg/85 text-pai-bg">Sold out</span>
        ) : off && showBadge ? (
          <span className="bz-badge pointer-events-none absolute left-0 top-2 bg-pai-sale text-white">−{off}%</span>
        ) : null}
        {wishlist ? (
          <div className="absolute right-1.5 top-1.5 z-10 hidden transition sm:block md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <WishlistButton productId={p.id} productTitle={p.title} className="size-7 shadow-none [&_svg]:size-4" />
          </div>
        ) : null}
        {quickAdd ? (
          <div className="absolute bottom-1.5 right-1.5 z-10 transition md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
            <QuickAddButton product={slim(p)} mode="icon" className="size-8 [&_svg]:size-4" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2 sm:p-2.5">
        <h3 className="bz-card-title text-[0.8rem] leading-[1.3] sm:text-[0.82rem]">
          <Link href={p.url} className="pai-line-clamp-2 min-h-[2.6em] outline-none after:absolute after:inset-0 after:content-[''] hover:text-pai-primary focus-visible:underline">
            {p.title}
          </Link>
        </h3>
        <p className={cn("font-heading font-bold tabular-nums leading-none text-pai-primary", deal ? "text-lg" : "text-base")}>
          {p.priceMax > p.price ? <span className="mr-0.5 text-[0.7rem] font-medium opacity-70">from</span> : null}
          {fmt(p.price)}
        </p>
        {off && p.compareAtPrice ? (
          <p className="flex items-center gap-1.5 text-[0.7rem] leading-none">
            <s className="opacity-50">{fmt(p.compareAtPrice)}</s>
            <span className="font-semibold text-pai-sale">−{off}%</span>
          </p>
        ) : !deal ? (
          <p className="h-[0.7rem]" aria-hidden />
        ) : null}

        {deal ? (
          <div className="mt-auto pt-1.5">
            <div className="bz-meter h-2 overflow-hidden rounded-full" role="img" aria-label={`${sold}% sold`}>
              <span className="block h-full rounded-full" style={{ width: `${sold}%` }} />
            </div>
            <p className="mt-1 text-[0.68rem] font-medium opacity-70">{p.available ? (sold >= 85 ? "Almost gone!" : `${sold}% sold`) : "Sold out"}</p>
          </div>
        ) : (
          <div className="mt-auto flex flex-col gap-1 pt-1">
            {showRating && p.rating.count > 0 ? (
              <p className="flex items-center gap-1 text-[0.7rem] leading-none" aria-label={`Rated ${p.rating.average.toFixed(1)} out of 5 from ${p.rating.count} reviews`}>
                <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                <span className="font-semibold">{p.rating.average.toFixed(1)}</span>
                <span className="opacity-55">({p.rating.count})</span>
              </p>
            ) : null}
            {showFree || showCod ? (
              <p className="flex flex-wrap gap-1">
                {showFree ? <span className="bz-chip bz-chip-free">{str(t.card_free_label, "Free delivery")}</span> : null}
                {showCod ? <span className="bz-chip">{str(t.card_cod_label, "COD")}</span> : null}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
