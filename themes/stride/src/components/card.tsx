/**
 * Stride product card — a sharp "drop card": big media well with image swap, category /
 * colourway label, uppercase condensed title, a heavy price and a hover "Quick add" bar.
 * Used by every Stride section; the kit's own listings (collection, search, related products)
 * are restyled to match via the theme CSS in `index.ts`.
 */
import type { SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { Link, Placeholder, cn, discountPercent, formatMoney, moneyOf, stripHtml, truncate } from "@pai/theme-kit";
import { QuickAddButton, WishlistButton } from "@pai/theme-kit/client";

/** Drop heavy fields before handing a product to a client island. */
export function slim(p: SfProduct): SfProduct {
  return { ...p, description: truncate(stripHtml(p.description), 200), images: p.images.slice(0, 4) };
}

/** "Running · 3 colours" style label for a product. */
export function productLabel(p: SfProduct): string {
  const kind = p.productType || p.tags[0] || p.vendor || "";
  const colour = p.options.find((o) => /colou?r/i.test(o.name));
  const colours = colour && colour.values.length > 1 ? `${colour.values.length} colours` : "";
  return [kind, colours].filter(Boolean).join(" · ");
}

const isNew = (p: SfProduct) => {
  const t = new Date(p.createdAt).getTime();
  return t > 0 && Date.now() - t < 1000 * 60 * 60 * 24 * 21;
};

export function StrideCard({
  product: p,
  context,
  priority,
  ratio = "portrait",
  size = "md",
  index,
  className,
}: {
  product: SfProduct;
  context: StorefrontContext;
  priority?: boolean;
  ratio?: "portrait" | "square";
  size?: "sm" | "md";
  /** Optional rank number shown on the media ("01"). */
  index?: number;
  className?: string;
}) {
  const money = moneyOf(context);
  const fmt = (n: number) => formatMoney(n, money.currency, money.display);
  const img = p.featuredImage ?? p.images[0] ?? null;
  const img2 = p.images[1] && p.images[1].url !== img?.url ? p.images[1] : null;
  const off = discountPercent(p.price, p.compareAtPrice);
  const label = productLabel(p);
  return (
    <article className={cn("stride-card group relative flex h-full flex-col", className)}>
      <div className={cn("stride-card-media relative overflow-hidden bg-pai-muted", ratio === "square" ? "aspect-square" : "aspect-[4/5]")}>
        <Link href={p.url} tabIndex={-1} aria-hidden className="absolute inset-0">
          {img ? (
            <img src={img.url} alt="" loading={priority ? "eager" : "lazy"} decoding="async" className="stride-card-img absolute inset-0 size-full object-cover" />
          ) : (
            <Placeholder kind="product" className="absolute inset-0" />
          )}
          {img2 ? <img src={img2.url} alt="" loading="lazy" decoding="async" className="stride-card-img-2 absolute inset-0 size-full object-cover" /> : null}
        </Link>
        <div className="pointer-events-none absolute left-0 top-3 flex flex-col items-start gap-1">
          {!p.available ? (
            <span className="stride-tag bg-pai-fg text-pai-bg">Sold out</span>
          ) : off ? (
            <span className="stride-tag stride-tag-accent">−{off}%</span>
          ) : isNew(p) ? (
            <span className="stride-tag bg-pai-bg text-pai-fg">New</span>
          ) : null}
        </div>
        {typeof index === "number" ? (
          <span aria-hidden className="stride-card-index pointer-events-none absolute bottom-2 left-3 font-heading text-5xl leading-none text-white/90">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
        <div className="absolute right-3 top-3 z-10 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <WishlistButton productId={p.id} productTitle={p.title} className="size-9 rounded-none bg-pai-bg text-pai-fg shadow-none" />
        </div>
        {p.available ? (
          <div className="stride-qa z-10">
            <QuickAddButton product={slim(p)} mode="auto" label="Quick add +" />
          </div>
        ) : null}
      </div>
      <div className={cn("flex flex-1 flex-col", size === "sm" ? "gap-0.5 pt-3" : "gap-1 pt-4")}>
        {label ? <p className="stride-card-label truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-pai-fg/55">{label}</p> : null}
        <h3 className={cn("stride-card-title font-heading uppercase leading-[1.05]", size === "sm" ? "text-lg" : "text-xl md:text-[1.4rem]")}>
          <Link href={p.url} className="pai-line-clamp-2 outline-none after:absolute after:inset-0 after:content-[''] hover:text-pai-accent focus-visible:underline">
            {p.title}
          </Link>
        </h3>
        <p className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1 tabular-nums">
          <span className={cn("font-heading", size === "sm" ? "text-lg" : "text-xl", off ? "text-pai-sale" : "")}>
            {p.priceMax > p.price ? <span className="mr-1 font-body text-xs font-medium opacity-60">From</span> : null}
            {fmt(p.price)}
          </span>
          {off && p.compareAtPrice ? (
            <s className="text-sm opacity-50">
              <span className="sr-only">Was </span>
              {fmt(p.compareAtPrice)}
            </s>
          ) : null}
        </p>
      </div>
    </article>
  );
}
