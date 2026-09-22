/**
 * Folio's product card: a 2:3 book cover with a spine highlight and a soft "book on a table"
 * shadow, serif title, author line, format hint, rating and price. Digital products (eBooks,
 * courses …) get a "Digital" badge and instant-download copy. Used by every listing via
 * `listingOverrides(FolioCard)` and by Folio's own sections.
 */
import type { ReactNode } from "react";
import type { SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { Download } from "lucide-react";
import { Link, Placeholder, Price, Rating, bool, cn, moneyOf, str } from "@pai/theme-kit";
import { QuickAddButton } from "@pai/theme-kit/client";
import { SaveBookButton } from "../client/wishlist";
import { bookMeta, type BookMeta } from "../lib/book";
import { slimProduct } from "../lib/slim";
import type { CardProps } from "./listings";

/** Should this product get the spine effect? */
export function spineFor(meta: Pick<BookMeta, "bookish">, context: Pick<StorefrontContext, "theme">): boolean {
  const mode = str(context.theme.card_book_effect, "auto");
  return mode === "spine" || (mode === "auto" && meta.bookish);
}

/** A book cover (2:3) with optional spine/shadow. Children render on top (badges, buttons). */
export function BookCover({
  product: p,
  spine = true,
  priority,
  className,
  sizes,
  children,
  linked = true,
}: {
  product: SfProduct;
  spine?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  children?: ReactNode;
  linked?: boolean;
}) {
  const img = p.featuredImage ?? p.images[0] ?? null;
  const media = img ? (
    <img src={img.url} alt={img.alt || p.title} loading={priority ? "eager" : "lazy"} decoding="async" sizes={sizes} className="folio-cover-img absolute inset-0 size-full object-cover" />
  ) : (
    <Placeholder kind="product" className="absolute inset-0" />
  );
  return (
    <div className={cn("folio-cover relative aspect-[2/3] bg-pai-muted", spine ? "folio-cover--book" : "folio-cover--flat", className)}>
      {linked ? (
        <Link href={p.url} tabIndex={-1} aria-hidden className="absolute inset-0 overflow-hidden rounded-[inherit]">
          {media}
        </Link>
      ) : (
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]">{media}</div>
      )}
      {spine ? <span aria-hidden className="folio-spine pointer-events-none absolute inset-y-0 left-0 w-4 rounded-l-[inherit]" /> : null}
      {children}
    </div>
  );
}

/** "by Author" line linking to a search for the author. */
export function AuthorLink({ author, context, className, prefix = "" }: { author: string; context: StorefrontContext; className?: string; prefix?: string }) {
  return (
    <Link href={context.url(`/search?q=${encodeURIComponent(author)}`)} className={cn("folio-author italic hover:underline hover:underline-offset-4", className)}>
      {prefix}
      {author}
    </Link>
  );
}

export function DigitalBadge({ context, className }: { context: StorefrontContext; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-[min(var(--pai-radius),4px)] bg-pai-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-pai-primary-fg shadow-sm", className)}>
      <Download className="size-3" aria-hidden />
      {str(context.theme.digital_badge_label, "Digital")}
    </span>
  );
}

export function FolioCard({ product: p, context, priority, size = "md" }: CardProps & { size?: "sm" | "md" }) {
  const meta = bookMeta(p, context);
  const t = context.theme;
  const spine = spineFor(meta, context);
  const off = p.compareAtPrice && p.compareAtPrice > p.price ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0;
  const bestseller = p.tags.some((x) => /^best-?seller$/i.test(x));
  const showRating = bool(t.card_show_rating, true) && p.rating.count > 0;
  const quickAdd = bool(t.card_quick_add, true) && p.available;
  const wishlist = bool(t.card_show_wishlist, true);

  return (
    <article className={cn("folio-card group relative flex flex-col", size === "sm" && "folio-card--sm")}>
      <div className="folio-cover-stage relative">
        <BookCover product={p} spine={spine} priority={priority} sizes="(min-width: 1024px) 20vw, 45vw">
          <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1.5">
            {!p.available ? (
              <span className="rounded-[2px] bg-pai-fg px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-pai-bg">Sold out</span>
            ) : off && bool(t.card_show_sale_badge, true) ? (
              <span className="rounded-[2px] bg-pai-sale px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">−{off}%</span>
            ) : null}
            {meta.digital ? <DigitalBadge context={context} /> : null}
            {bestseller && !meta.digital && size === "md" ? (
              <span className="rounded-[2px] bg-pai-bg/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-pai-fg shadow-sm">Bestseller</span>
            ) : null}
          </div>
          {wishlist ? (
            <div className="absolute right-2 top-2 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
              <SaveBookButton
                book={{ id: p.id, title: meta.title, author: meta.author, url: p.url, image: p.featuredImage?.url ?? p.images[0]?.url ?? null, price: p.price }}
                className="grid size-8 place-items-center rounded-full bg-pai-bg/95 text-pai-fg shadow-sm transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary aria-pressed:text-pai-primary"
              />
            </div>
          ) : null}
          {quickAdd ? <QuickAddButton product={slimProduct(p)} mode="auto" label={meta.digital ? "Get instant access" : "Add to bag"} /> : null}
        </BookCover>
      </div>
      <div className={cn("flex flex-col gap-1", size === "sm" ? "pt-3" : "pt-4")}>
        {bool(t.card_show_format, true) && meta.format ? (
          <p className="folio-format-hint flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-[0.14em] opacity-60">
            {meta.digital ? <Download className="size-3" aria-hidden /> : null}
            {meta.format}
          </p>
        ) : null}
        <h3 className={cn("font-heading leading-snug", size === "sm" ? "text-[0.95rem]" : "text-[1.02rem]")}>
          <Link href={p.url} className="pai-line-clamp-2 hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2">
            {meta.title}
          </Link>
        </h3>
        {bool(t.card_show_author, true) && meta.author ? <AuthorLink author={meta.author} context={context} prefix="by " className="w-fit text-sm opacity-75" /> : null}
        {showRating ? <Rating value={p.rating.average} count={p.rating.count} size={12} className="mt-0.5" /> : null}
        <Price price={p.price} compareAt={p.compareAtPrice} priceMax={p.priceMax} {...moneyOf(context)} className="mt-1" size={size === "sm" ? "sm" : "md"} />
      </div>
    </article>
  );
}
