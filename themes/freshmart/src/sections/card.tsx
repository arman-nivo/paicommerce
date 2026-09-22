/**
 * FreshMart product card — built for fast basket-filling:
 * compact square packshot, discount + "Fresh today" badges, unit hint, weight/pack chips and a
 * prominent Add button that becomes a quantity stepper (see client/card-buy.tsx).
 */
import type { SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { Link, Placeholder, Rating, bool, cn, str } from "@pai/theme-kit";
import { WishlistButton } from "@pai/theme-kit/client";
import { Zap } from "lucide-react";
import { FreshBuy, type BuyProduct } from "../client/card-buy";
import type { CardProps } from "./listings";

/** "Fresh Carrot (500 g)" → { name: "Fresh Carrot", unit: "500 g" } */
export function splitUnit(title: string): { name: string; unit: string | null } {
  const m = title.match(/^(.*?)\s*\(([^)]*\d[^)]*)\)\s*$/);
  return m ? { name: m[1]!.trim(), unit: m[2]!.trim() } : { name: title, unit: null };
}

const unitNumber = (label: string) => {
  const m = label.toLowerCase().match(/([\d.]+)\s*(kg|g|l|ml|pcs|dozen)?/);
  if (!m) return label.toLowerCase().includes("half") ? 0.5 : 1;
  const n = parseFloat(m[1]!);
  return m[2] === "g" || m[2] === "ml" ? n / 1000 : n;
};

/** Serializable buy data for the client island (variants sorted small → large). */
export function buyData(p: SfProduct): BuyProduct {
  const optionName = p.options[0]?.name ?? null;
  const variants = p.variants.length
    ? [...p.variants]
        .sort((a, b) => a.price - b.price || unitNumber(a.title) - unitNumber(b.title))
        .map((v) => ({ id: v.id, label: v.title, price: v.price, compareAt: v.compareAtPrice, available: v.available }))
    : [{ id: null, label: splitUnit(p.title).unit ?? "1 pc", price: p.price, compareAt: p.compareAtPrice, available: p.available }];
  return { id: p.id, title: p.title, url: p.url, imageUrl: p.featuredImage?.url ?? p.images[0]?.url ?? null, optionName, variants };
}

export function discountOf(p: SfProduct): number {
  const v = p.variants.find((x) => x.compareAtPrice && x.compareAtPrice > x.price);
  const price = v?.price ?? p.price;
  const cmp = v?.compareAtPrice ?? p.compareAtPrice;
  return cmp && cmp > price ? Math.round(((cmp - price) / cmp) * 100) : 0;
}

export function FreshCard({ product: p, context, priority, className, size = "md" }: CardProps & { className?: string; size?: "md" | "lg" }) {
  const t = context.theme;
  const img = p.featuredImage ?? p.images[0] ?? null;
  const off = discountOf(p);
  const { name, unit } = splitUnit(p.title);
  const freshLabel = str(t.fm_fresh_badge, "");
  const fresh = !!freshLabel && /fruit|vegetable|meat|fish|dairy|bakery|bread|egg/i.test(p.productType ?? "");
  const eta = str(t.fm_card_eta, "");
  const lowStock = p.available && p.inventory > 0 && p.inventory <= 5;
  return (
    <article className={cn("fm-card group relative flex h-full flex-col rounded-pai border border-pai-border bg-pai-card p-2.5 transition hover:border-pai-primary/40 hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,.35)] md:p-3", className)}>
      <div className="relative aspect-square overflow-hidden rounded-[calc(var(--pai-radius)-4px)] bg-pai-muted">
        <Link href={p.url} tabIndex={-1} aria-hidden className="absolute inset-0">
          {img ? (
            <img src={img.url} alt={img.alt ?? p.title} loading={priority ? "eager" : "lazy"} decoding="async" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]" />
          ) : (
            <Placeholder kind="product" className="absolute inset-0" />
          )}
        </Link>
        <div className="pointer-events-none absolute left-1.5 top-1.5 flex flex-col items-start gap-1">
          {!p.available ? (
            <span className="rounded-md bg-pai-fg/85 px-1.5 py-0.5 text-[10px] font-bold uppercase text-pai-bg">Sold out</span>
          ) : off && bool(t.card_show_sale_badge, true) ? (
            <span className="rounded-md bg-pai-sale px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">{off}% off</span>
          ) : null}
          {fresh && p.available ? <span className="rounded-md bg-pai-bg/95 px-1.5 py-0.5 text-[10px] font-bold text-pai-primary shadow-sm">{freshLabel}</span> : null}
        </div>
        {bool(t.card_show_wishlist, true) ? (
          <div className="absolute right-1.5 top-1.5">
            <WishlistButton productId={p.id} productTitle={p.title} className="size-8" />
          </div>
        ) : null}
        {eta && p.available ? (
          <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-0.5 rounded-md bg-pai-bg/95 px-1.5 py-0.5 text-[10px] font-bold shadow-sm">
            <Zap className="size-3 fill-amber-400 text-amber-500" aria-hidden />
            {eta}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-0.5 pt-2.5">
        {bool(t.card_show_vendor, false) && p.vendor && p.vendor !== context.store.name ? <p className="text-[11px] font-semibold uppercase tracking-wide opacity-55">{p.vendor}</p> : null}
        <h3 className={cn("font-semibold leading-snug", size === "lg" ? "text-base" : "text-[0.9rem]")}>
          <Link href={p.url} className="pai-line-clamp-2 rounded-sm hover:text-pai-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary">
            {name}
          </Link>
        </h3>
        <p className="flex items-center gap-2 text-xs opacity-60">
          {unit ? <span>{unit}</span> : p.variants.length > 3 ? <span>{p.variants.length} sizes</span> : null}
          {lowStock ? <span className="font-semibold text-pai-sale opacity-100">Only {p.inventory} left</span> : null}
        </p>
        {bool(t.card_show_rating, false) && p.rating.count > 0 ? <Rating value={p.rating.average} count={p.rating.count} size={12} /> : null}
        <FreshBuy product={buyData(p)} size={size} />
      </div>
    </article>
  );
}
