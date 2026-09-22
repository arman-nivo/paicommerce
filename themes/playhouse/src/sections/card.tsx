/**
 * The Playhouse product card — used by every listing (via `listingOverrides`) and by the theme's
 * own sections. Rounded "toy box" card with a soft coloured backdrop that rotates per product,
 * sticker badges (New!, −20%, Bestseller, age range), rating stars and a pill quick-add button.
 */
import type { CSSProperties } from "react";
import { Star } from "lucide-react";
import type { SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { Link, Placeholder, Price, Rating, aspectClass, bool, cardOptions, cn, moneyOf, str, stripHtml, truncate } from "@pai/theme-kit";
import { WishlistButton } from "@pai/theme-kit/client";
import { PillQuickAdd } from "../client/quick-add";
import { Blob, FOCUS, ageBadge, funAt, hashIndex, isBestseller, isNewProduct, tint } from "./_playhouse";

export type CardProps = { product: SfProduct; context: StorefrontContext; priority?: boolean };

/** Drop heavy fields before handing a product to a client island. */
export function slimProduct(p: SfProduct): SfProduct {
  return { ...p, description: truncate(stripHtml(p.description), 200), images: p.images.slice(0, 5) };
}

const SWATCH_OPTION = /^(colou?r|shade)$/i;

export function PlayhouseCard({ product: p, context, priority }: CardProps) {
  const o = cardOptions(context);
  const money = moneyOf(context);
  const backdrop = str(context.theme.card_backdrop, "rainbow");
  const idx = hashIndex(p.id || p.slug);
  const tone = funAt(idx);
  const img = p.featuredImage ?? p.images[0] ?? null;
  const img2 = o.hoverSwap ? p.images[1] : undefined;
  const off = p.compareAtPrice && p.compareAtPrice > p.price ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0;
  const isNew = p.available && isNewProduct(p, context);
  const best = p.available && isBestseller(p, context);
  const age = bool(context.theme.badge_age, true) ? ageBadge(p) : null;
  const minimal = o.style === "minimal";
  const center = o.align === "center";
  const framed = backdrop !== "none";
  const swatches = p.options.find((opt) => SWATCH_OPTION.test(opt.name))?.values.slice(0, 5) ?? [];
  const mediaBg = backdrop === "rainbow" ? tint(tone, 30) : "var(--pai-muted)";

  return (
    <article
      className={cn(
        "ph-card ph-lift group relative flex h-full flex-col transition-[transform,box-shadow] duration-300",
        !minimal && "rounded-[calc(var(--pai-radius)+4px)] bg-pai-card p-2 ring-1 ring-pai-border hover:shadow-[0_14px_30px_-16px_color-mix(in_srgb,var(--pai-fg)_45%,transparent)] sm:p-2.5",
      )}
      style={{ "--ph-tone": tone } as CSSProperties}
    >
      <div className={cn("pai-card-media relative isolate overflow-hidden rounded-pai", aspectClass(o.ratio))} style={{ background: mediaBg }}>
        {framed ? (
          <>
            <Blob variant={idx} color={tone} className="absolute -right-8 -top-10 -z-10 size-32 opacity-60" />
            <Blob variant={idx + 1} color="white" className="absolute -bottom-12 -left-10 -z-10 size-36 opacity-50" />
          </>
        ) : null}
        <Link href={p.url} tabIndex={-1} aria-hidden className={cn("absolute", framed ? "inset-2.5 sm:inset-3" : "inset-0")}>
          <span className={cn("relative block size-full overflow-hidden bg-pai-bg", framed ? "rounded-[max(8px,calc(var(--pai-radius)-8px))] shadow-[0_6px_16px_-10px_rgba(0,0,0,.45)]" : "")}>
            {img ? (
              <img src={img.url} alt={img.alt ?? p.title} loading={priority ? "eager" : "lazy"} decoding="async" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.05]" />
            ) : (
              <Placeholder kind="product" className="absolute inset-0" />
            )}
            {img2 ? <img src={img2.url} alt="" aria-hidden loading="lazy" decoding="async" className="pai-card-img-2 absolute inset-0 size-full object-cover" /> : null}
          </span>
        </Link>

        <div className="pointer-events-none absolute left-1.5 top-1.5 flex flex-col items-start gap-1.5 sm:left-2 sm:top-2">
          {!p.available ? (
            <span className="ph-badge bg-pai-fg text-pai-bg">Sold out</span>
          ) : off && o.saleBadge ? (
            <span className="ph-badge ph-sticker -rotate-6 bg-pai-sale text-white">−{off}%</span>
          ) : null}
          {isNew ? <span className="ph-badge rotate-3 bg-[var(--ph-c5)] text-pai-fg">New!</span> : null}
          {best ? (
            <span className="ph-badge -rotate-2 bg-[var(--ph-c1)] text-pai-fg">
              <Star className="size-3 fill-current" aria-hidden strokeWidth={0} /> Bestseller
            </span>
          ) : null}
        </div>

        {o.wishlist ? (
          <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2">
            <WishlistButton productId={p.id} productTitle={p.title} className="size-9 ring-2 ring-white" />
          </div>
        ) : null}

        {age ? (
          <span className="ph-badge pointer-events-none absolute bottom-1.5 left-1.5 bg-white text-pai-fg shadow-sm sm:bottom-2 sm:left-2">
            <span aria-hidden className="size-2 rounded-full" style={{ background: tone }} />
            <span className="sr-only">Age </span>
            {age}
          </span>
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col gap-1 px-1 pt-3", center && "items-center text-center", minimal && "px-0")}>
        {o.showVendor && p.vendor ? <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-60">{p.vendor}</p> : null}
        <h3 className="font-heading text-[0.98rem] font-semibold leading-snug sm:text-[1.05rem]">
          <Link href={p.url} className={cn("pai-line-clamp-2 rounded-sm decoration-2 underline-offset-4 hover:underline", FOCUS)} style={{ textDecorationColor: tone }}>
            {p.title}
          </Link>
        </h3>
        {o.showRating && p.rating.count > 0 ? <Rating value={p.rating.average} count={p.rating.count} size={14} /> : null}
        <div className={cn("mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1", center && "justify-center")}>
          <Price price={p.price} compareAt={p.compareAtPrice} priceMax={p.priceMax} {...money} className="font-heading text-base" />
          {swatches.length ? (
            <span className="flex items-center gap-1" aria-label={`${swatches.length} colours`}>
              {swatches.map((c) => (
                <span key={c} title={c} className="size-3.5 rounded-full ring-1 ring-black/15" style={{ background: c.toLowerCase().replace(/\s+/g, "") }} />
              ))}
            </span>
          ) : null}
        </div>
        {o.quickAdd ? (
          <div className="pt-2.5">
            <PillQuickAdd product={slimProduct(p)} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
