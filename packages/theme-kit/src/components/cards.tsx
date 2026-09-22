/**
 * Product / collection / article cards and grids. Server-safe; interactive bits (quick add,
 * wishlist) are small client islands from `@pai/theme-kit/client`.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import type { SfCollection, SfPost, SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { aspectClass, bool, cn, gridColsClass, str, stripHtml, truncate } from "../lib/utils";
import { Badge, Placeholder, Price, Rating, moneyOf } from "./primitives";
import { QuickAddButton } from "../client/quick-view";
import { WishlistButton } from "../client/widgets";
import { Carousel } from "../client/widgets";

/* ─────────────────────────── product card ─────────────────────────── */

export type ProductCardOptions = {
  ratio: string; // square | portrait | tall | landscape
  style: "standard" | "card" | "minimal" | "overlay";
  align: "left" | "center";
  showVendor: boolean;
  showRating: boolean;
  quickAdd: boolean;
  hoverSwap: boolean;
  saleBadge: boolean;
  wishlist: boolean;
};

/** Product card options from the theme's global "Product cards" settings. */
export function cardOptions(context: Pick<StorefrontContext, "theme">, overrides: Partial<ProductCardOptions> = {}): ProductCardOptions {
  const t = context.theme;
  return {
    ratio: str(t.card_image_ratio, "portrait"),
    style: (str(t.card_style, "standard") as ProductCardOptions["style"]) ?? "standard",
    align: t.card_text_align === "center" ? "center" : "left",
    showVendor: bool(t.card_show_vendor, false),
    showRating: bool(t.card_show_rating, true),
    quickAdd: bool(t.card_quick_add, true),
    hoverSwap: bool(t.card_hover_swap, true),
    saleBadge: bool(t.card_show_sale_badge, true),
    wishlist: bool(t.card_show_wishlist, true),
    ...overrides,
  };
}

export type ProductCardProps = {
  product: SfProduct;
  context: StorefrontContext;
  options?: Partial<ProductCardOptions>;
  /** Eager-load the image (first row above the fold). */
  priority?: boolean;
  className?: string;
  /** Extra content under the price (themes: e.g. colour dots). */
  footer?: ReactNode;
};

/** Drop heavy fields before handing a product to a client island. */
function slimProduct(p: SfProduct): SfProduct {
  return { ...p, description: truncate(stripHtml(p.description), 240), images: p.images.slice(0, 6) };
}

/** The standard product card used by every product listing in the kit. */
export function ProductCard({ product: p, context, options, priority, className, footer }: ProductCardProps) {
  const o = cardOptions(context, options);
  const money = moneyOf(context);
  const img = p.featuredImage ?? p.images[0] ?? null;
  const img2 = o.hoverSwap ? p.images[1] : undefined;
  const off = p.compareAtPrice && p.compareAtPrice > p.price ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0;
  const isNew = Date.now() - new Date(p.createdAt).getTime() < 1000 * 60 * 60 * 24 * 21 && new Date(p.createdAt).getTime() > 0;
  const overlay = o.style === "overlay";
  const center = o.align === "center";

  const info = (
    <div className={cn("flex flex-col gap-1", center && "items-center text-center", overlay ? "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12 text-white" : o.style === "card" ? "p-4" : "pt-3")}>
      {o.showVendor && p.vendor ? <p className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-60">{p.vendor}</p> : null}
      <h3 className="text-[0.95rem] font-medium leading-snug">
        <Link href={p.url} className="pai-line-clamp-2 hover:underline hover:underline-offset-4">
          {p.title}
        </Link>
      </h3>
      {o.showRating && p.rating.count > 0 ? <Rating value={p.rating.average} count={p.rating.count} size={13} /> : null}
      <Price price={p.price} compareAt={p.compareAtPrice} priceMax={p.priceMax} {...money} />
      {footer}
    </div>
  );

  return (
    <article
      data-zoom={o.style !== "minimal"}
      className={cn(
        "pai-product-card group relative flex flex-col",
        o.style === "card" && "overflow-hidden rounded-pai border border-pai-border bg-pai-card",
        className,
      )}
    >
      <div className={cn("pai-card-media relative overflow-hidden bg-pai-muted", aspectClass(o.ratio), o.style === "card" ? "" : "rounded-pai")}>
        <Link href={p.url} aria-label={p.title} className="absolute inset-0" tabIndex={-1}>
          {img ? (
            <img
              src={img.url}
              alt={img.alt ?? p.title}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <Placeholder kind="product" className="absolute inset-0" />
          )}
          {img2 ? <img src={img2.url} alt="" aria-hidden loading="lazy" decoding="async" className="pai-card-img-2 absolute inset-0 size-full object-cover" /> : null}
        </Link>
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {!p.available ? <Badge tone="soldout">Sold out</Badge> : off && o.saleBadge ? <Badge tone="sale">−{off}%</Badge> : null}
          {isNew && p.available ? <Badge tone="new">New</Badge> : null}
        </div>
        {o.wishlist ? (
          <div className="absolute right-2.5 top-2.5 transition md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <WishlistButton productId={p.id} productTitle={p.title} />
          </div>
        ) : null}
        {o.quickAdd && p.available && !overlay ? <QuickAddButton product={slimProduct(p)} mode="auto" /> : null}
        {overlay ? info : null}
      </div>
      {overlay ? null : info}
    </article>
  );
}

/** Responsive product grid. */
export function ProductGrid({
  products,
  context,
  columns = 4,
  mobileColumns = 2,
  options,
  className,
  priorityCount = 0,
}: {
  products: SfProduct[];
  context: StorefrontContext;
  columns?: number;
  mobileColumns?: number;
  options?: Partial<ProductCardOptions>;
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div className={cn("grid gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10", gridColsClass(columns, mobileColumns), className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} context={context} options={options} priority={i < priorityCount} />
      ))}
    </div>
  );
}

/** Grid or carousel of products depending on `layout`. */
export function ProductList({
  products,
  context,
  layout = "grid",
  columns = 4,
  mobileColumns = 2,
  options,
}: {
  products: SfProduct[];
  context: StorefrontContext;
  layout?: "grid" | "carousel";
  columns?: number;
  mobileColumns?: number;
  options?: Partial<ProductCardOptions>;
}) {
  if (layout === "carousel") {
    return (
      <Carousel perView={{ base: mobileColumns === 1 ? 1.2 : 2.1, md: Math.min(3, columns), lg: columns }} gap={20}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} context={context} options={options} />
        ))}
      </Carousel>
    );
  }
  return <ProductGrid products={products} context={context} columns={columns} mobileColumns={mobileColumns} options={options} />;
}

/* ─────────────────────────── collection card ─────────────────────────── */

export function CollectionCard({
  collection: c,
  style = "overlay",
  ratio = "portrait",
  showCount = false,
  className,
}: {
  collection: SfCollection;
  style?: "overlay" | "below" | "circle";
  ratio?: string;
  showCount?: boolean;
  className?: string;
}) {
  if (style === "circle") {
    return (
      <Link href={c.url} className={cn("group flex flex-col items-center gap-3 text-center", className)}>
        <span className="relative aspect-square w-full overflow-hidden rounded-full bg-pai-muted ring-1 ring-pai-border">
          {c.image ? <img src={c.image.url} alt={c.image.alt ?? c.title} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" /> : <Placeholder kind="collection" className="absolute inset-0" />}
        </span>
        <span className="text-sm font-semibold">{c.title}</span>
      </Link>
    );
  }
  if (style === "below") {
    return (
      <Link href={c.url} className={cn("group block", className)}>
        <span className={cn("relative block overflow-hidden rounded-pai bg-pai-muted", aspectClass(ratio))}>
          {c.image ? <img src={c.image.url} alt={c.image.alt ?? c.title} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" /> : <Placeholder kind="collection" className="absolute inset-0" />}
        </span>
        <span className="mt-3 flex items-center justify-between gap-2">
          <span className="font-heading text-lg font-semibold">{c.title}</span>
          {showCount ? <span className="text-sm opacity-60">{c.productsCount}</span> : null}
        </span>
      </Link>
    );
  }
  return (
    <Link href={c.url} className={cn("group relative block overflow-hidden rounded-pai bg-pai-muted", aspectClass(ratio), className)}>
      {c.image ? <img src={c.image.url} alt={c.image.alt ?? c.title} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" /> : <Placeholder kind="collection" className="absolute inset-0" />}
      <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-5 text-white">
        <span>
          <span className="block font-heading text-xl font-semibold md:text-2xl">{c.title}</span>
          {showCount ? <span className="text-sm opacity-80">{c.productsCount} products</span> : null}
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-neutral-900 transition group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}

/* ─────────────────────────── article card ─────────────────────────── */

export function ArticleCard({ post, className, showExcerpt = true, showDate = true, locale = "en" }: { post: SfPost; className?: string; showExcerpt?: boolean; showDate?: boolean; locale?: string }) {
  const date = post.publishedAt && new Date(post.publishedAt).getTime() > 0 ? new Date(post.publishedAt).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;
  return (
    <article className={cn("group flex flex-col", className)}>
      <Link href={post.url} className="relative block aspect-[16/10] overflow-hidden rounded-pai bg-pai-muted">
        {post.coverUrl ? <img src={post.coverUrl} alt={post.title} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" /> : <Placeholder kind="image" className="absolute inset-0" />}
      </Link>
      <div className="flex flex-col gap-2 pt-4">
        {showDate && (date || post.author) ? (
          <p className="text-xs opacity-60">
            {date}
            {date && post.author ? " · " : ""}
            {post.author}
          </p>
        ) : null}
        <h3 className="font-heading text-lg font-semibold leading-snug">
          <Link href={post.url} className="hover:underline hover:underline-offset-4">
            {post.title}
          </Link>
        </h3>
        {showExcerpt && post.excerpt ? <p className="pai-line-clamp-3 text-sm opacity-75">{post.excerpt}</p> : null}
      </div>
    </article>
  );
}
