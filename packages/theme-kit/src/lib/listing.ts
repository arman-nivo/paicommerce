import type { ProductQuery } from "@pai/theme-sdk";

export const DEFAULT_PAGE_SIZE = 24;
const SORTS = new Set(["manual", "newest", "price-asc", "price-desc", "best-selling", "rating", "title"]);

/**
 * Parse collection/search URL params (`sort`, `min`, `max` (major units), `instock=1`, `page`)
 * into a ProductQuery. Shared by the storefront (prefetching `context.products`) and the kit's
 * listing sections so both agree on the URL contract.
 */
export function listingQuery(
  searchParams: Record<string, string | undefined>,
  base: Pick<ProductQuery, "collection" | "query"> & { pageSize?: number; defaultSort?: ProductQuery["sort"] } = {},
): ProductQuery {
  const sort = searchParams.sort && SORTS.has(searchParams.sort) ? (searchParams.sort as ProductQuery["sort"]) : base.defaultSort;
  const toMinor = (v: string | undefined) => {
    const n = v ? parseFloat(v.replace(/[^0-9.]/g, "")) : NaN;
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
  };
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  return {
    collection: base.collection,
    query: base.query,
    sort,
    minPrice: toMinor(searchParams.min),
    maxPrice: toMinor(searchParams.max),
    inStock: searchParams.instock === "1" ? true : undefined,
    page,
    limit: base.pageSize ?? DEFAULT_PAGE_SIZE,
  };
}
