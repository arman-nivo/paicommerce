/**
 * Small helpers shared by Bazaar sections: product loading with graceful fallbacks, the compact
 * section frame (white panel with a heading bar) and schema fields.
 */
import type { ReactNode } from "react";
import type { SettingField, SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { Container, SAMPLE_PRODUCTS, SmartLink, cn, str } from "@pai/theme-kit";
import { ChevronRight } from "lucide-react";

export type ProductSort = "best-selling" | "newest" | "rating" | "price-asc" | "on-sale";

/**
 * Products for a Bazaar section: the collection when it exists and has products, otherwise the
 * fallback sort (never an empty rail on the live store; sample products in the customizer).
 */
export async function loadProducts(
  context: StorefrontContext,
  opts: { collection?: string; sort?: string; limit: number; manual?: string[] },
): Promise<{ items: SfProduct[]; url: string | null; sample: boolean }> {
  const { limit } = opts;
  try {
    if (opts.manual?.length) {
      const r = await context.data.getProducts({ slugs: opts.manual, limit: Math.max(limit, opts.manual.length) });
      const order = new Map(opts.manual.map((x, i) => [x, i]));
      const items = r.items.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0)).slice(0, limit);
      if (items.length) return { items, url: null, sample: false };
    }
    if (opts.collection) {
      const [r, c] = await Promise.all([context.data.getProducts({ collection: opts.collection, limit }), context.data.getCollection(opts.collection)]);
      if (r.items.length) return { items: r.items, url: c?.url ?? null, sample: false };
    }
    const sort = str(opts.sort, "best-selling");
    if (sort === "on-sale") {
      const r = await context.data.getProducts({ sort: "best-selling", limit: 60 });
      const sale = r.items.filter((p) => p.onSale);
      if (sale.length) return { items: sale.slice(0, limit), url: null, sample: false };
    }
    const r = await context.data.getProducts({ sort: sort === "on-sale" ? "best-selling" : (sort as "best-selling"), limit });
    if (r.items.length) return { items: r.items, url: null, sample: false };
  } catch {
    /* fall through */
  }
  return { items: context.isPreview ? SAMPLE_PRODUCTS.slice(0, limit) : [], url: null, sample: context.isPreview };
}

/** Fallback product order select shared by rail-like sections. */
export const fallbackSortField = (def = "best-selling"): SettingField => ({
  type: "select",
  id: "sort",
  label: "Products (or fallback when the collection is empty)",
  default: def,
  options: [
    { value: "best-selling", label: "Best sellers" },
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Top rated" },
    { value: "on-sale", label: "On sale" },
    { value: "price-asc", label: "Lowest price" },
  ],
});

/** Vertical spacing select (Bazaar is compact: small by default). */
export const spacingField = (def = "small"): SettingField => ({
  type: "select",
  id: "padding",
  label: "Vertical spacing",
  default: def,
  options: [
    { value: "none", label: "None" },
    { value: "small", label: "Compact" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ],
});

export function padValue(v: unknown): string {
  return { none: "0", small: "0.5", medium: "1", large: "1.5" }[str(v, "small")] ?? "0.5";
}

/** Outer wrapper: a `pai-section` with Bazaar's compact spacing. */
export function BzSection({ label, padding, className, children, id }: { label: string; padding: unknown; className?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} aria-label={label} className={cn("pai-section", className)} style={{ ["--pai-section-pad" as string]: padValue(padding) }}>
      <Container>{children}</Container>
    </section>
  );
}

/** Section heading row: title (+ optional icon / extra) and a "See more" link on the right. */
export function BzHead({
  title,
  href,
  linkLabel = "See more",
  icon,
  children,
  className,
  as: Tag = "h2",
}: {
  title: string;
  href?: string | null;
  linkLabel?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className={cn("bz-head flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      <Tag className="flex items-center gap-2 font-heading text-lg font-semibold leading-tight sm:text-xl">
        {icon}
        {title}
      </Tag>
      {children}
      {href && linkLabel ? (
        <SmartLink href={href} className="bz-more ml-auto inline-flex items-center gap-0.5 whitespace-nowrap text-[0.8rem] font-semibold uppercase tracking-wide text-pai-primary hover:underline">
          {linkLabel}
          <ChevronRight className="size-4" aria-hidden />
        </SmartLink>
      ) : null}
    </div>
  );
}
