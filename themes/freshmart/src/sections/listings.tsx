/**
 * Listing sections re-rendered with this theme's own product card.
 *
 * The kit's listing sections (featured collection, product grid, related products, collection,
 * search and 404) render the kit `ProductCard` directly. To give the theme its own card everywhere,
 * we keep each kit section's schema (so merchant configs stay compatible) and swap its component
 * for one that renders `Card`. Used via `createBaseTheme({ overrideSections: listingOverrides(Card) })`.
 */
import { Suspense, type ComponentType, type ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import type { SectionDefinition, SfProduct, StorefrontContext } from "@pai/theme-sdk";
import {
  Breadcrumbs,
  ButtonLink,
  DEFAULT_PAGE_SIZE,
  EmptyState,
  Pagination,
  PreviewNotice,
  SAMPLE_PRODUCTS,
  Section,
  SectionHeading,
  bool,
  cn,
  formatMoney,
  listingQuery,
  loadSectionProducts,
  num,
  resolveHref,
  str,
  withQuery,
} from "@pai/theme-kit";
import { Carousel, CollectionFilters, FilterDrawerButton, SearchBox, SortSelect } from "@pai/theme-kit/client";

export type CardProps = { product: SfProduct; context: StorefrontContext; priority?: boolean };
export type CardComponent = ComponentType<CardProps>;

export type ListingOptions = {
  /** Grid classes for a desktop/mobile column count. */
  gridClass?: (columns: number, mobile: number) => string;
  /** Carousel slides per view. */
  perView?: (columns: number) => { base: number; md: number; lg: number };
  /** Rendered above the product grid on collection pages (e.g. sub-category chips). */
  collectionIntro?: (context: StorefrontContext) => Promise<ReactNode> | ReactNode;
};

const defaultGrid = (columns: number, mobile: number) => {
  const d: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-3 lg:grid-cols-4",
    5: "md:grid-cols-3 lg:grid-cols-5",
    6: "md:grid-cols-4 lg:grid-cols-6",
  };
  return cn("grid gap-x-3 gap-y-6 md:gap-x-5 md:gap-y-8", mobile === 1 ? "grid-cols-1" : "grid-cols-2", d[Math.min(6, Math.max(1, columns))]);
};

type Override = (base: SectionDefinition<any>) => SectionDefinition<any>;

/** Build `overrideSections` entries that render `Card` in every kit listing section. */
export function listingOverrides(Card: CardComponent, opts: ListingOptions = {}): Record<string, Override> {
  const gridClass = opts.gridClass ?? defaultGrid;
  const perView = opts.perView ?? ((c: number) => ({ base: 2.15, md: Math.min(3, c), lg: c }));

  function Grid({ products, context, columns = 4, mobile = 2, priority = 0 }: { products: SfProduct[]; context: StorefrontContext; columns?: number; mobile?: number; priority?: number }) {
    return (
      <div className={gridClass(columns, mobile)}>
        {products.map((p, i) => (
          <Card key={p.id} product={p} context={context} priority={i < priority} />
        ))}
      </div>
    );
  }

  function List({ products, context, layout, columns = 4, mobile = 2 }: { products: SfProduct[]; context: StorefrontContext; layout?: unknown; columns?: number; mobile?: number }) {
    if (layout === "carousel") {
      return (
        <Carousel perView={perView(columns)} gap={16}>
          {products.map((p) => (
            <Card key={p.id} product={p} context={context} />
          ))}
        </Carousel>
      );
    }
    return <Grid products={products} context={context} columns={columns} mobile={mobile} />;
  }

  const featured: Override = (base) => ({
    ...base,
    component: async ({ settings: s, context }) => {
      const { products, sample, collectionUrl } = await loadSectionProducts(context, s, 8);
      if (!products.length) return null;
      const center = s.heading_align === "center";
      const viewAll = s.show_view_all !== false ? { label: "View all", href: collectionUrl ?? context.url("/collections/all") } : null;
      return (
        <Section settings={s} ariaLabel={str(s.heading) || "Products"}>
          {sample && str(s.source, "collection") === "collection" ? <PreviewNotice context={context}>Select a collection to show your products. Showing sample products.</PreviewNotice> : null}
          <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={center ? "center" : "left"} action={center ? null : viewAll} />
          <List products={products} context={context} layout={s.layout} columns={num(s.columns, 4)} mobile={num(s.mobile_columns, 2)} />
          {viewAll && center ? (
            <div className="mt-10 text-center">
              <ButtonLink href={viewAll.href} variant="secondary">
                View all
              </ButtonLink>
            </div>
          ) : null}
        </Section>
      );
    },
  });

  const productGrid: Override = (base) => ({
    ...base,
    component: async ({ settings: s, context }) => {
      const { products } = await loadSectionProducts(context, s, 12);
      if (!products.length) return null;
      return (
        <Section settings={s} ariaLabel={str(s.heading) || "Products"}>
          <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
          <Grid products={products} context={context} columns={num(s.columns, 4)} mobile={num(s.mobile_columns, 2)} />
          {str(s.button_label) ? (
            <div className="mt-12 text-center">
              <ButtonLink href={resolveHref(context, s.button_link, "/collections/all")} variant="primary" size="lg">
                {str(s.button_label)}
              </ButtonLink>
            </div>
          ) : null}
        </Section>
      );
    },
  });

  const related: Override = (base) => ({
    ...base,
    component: async ({ settings: s, context }) => {
      const limit = num(s.limit, 4);
      let products = context.product ? await context.data.getRelatedProducts(context.product.id, limit).catch(() => []) : [];
      if (!products.length && context.product) {
        products = (await context.data.getProducts({ sort: "best-selling", limit: limit + 1 }).catch(() => null))?.items.filter((p) => p.id !== context.product!.id).slice(0, limit) ?? [];
      }
      if (!products.length && context.isPreview) products = SAMPLE_PRODUCTS.slice(1, limit + 1);
      if (!products.length) return null;
      return (
        <Section settings={s} ariaLabel={str(s.heading) || "Related products"}>
          <SectionHeading title={str(s.heading)} />
          <List products={products} context={context} layout={s.layout} columns={num(s.columns, 4)} />
        </Section>
      );
    },
  });

  const mainCollection: Override = (base) => ({
    ...base,
    component: async ({ settings: s, context }) => {
      const collection = context.collection;
      const perPage = num(s.per_page, DEFAULT_PAGE_SIZE);
      const slug = collection?.slug && collection.slug !== "all" ? collection.slug : undefined;
      const result =
        context.products && context.products.pageSize === perPage
          ? context.products
          : await context.data.getProducts(listingQuery(context.searchParams, { collection: slug, pageSize: perPage }));
      let items = result.items;
      if (!items.length && context.isPreview && !collection) items = SAMPLE_PRODUCTS;
      const title = collection?.title ?? "All products";
      const filters = str(s.filters, "sidebar");
      const symbol = formatMoney(0, context.store.currency).replace(/[\d.,\s]/g, "") || "৳";
      const banner = bool(s.show_banner, true) && collection?.image;
      const active = !!(context.searchParams.min || context.searchParams.max || context.searchParams.instock);
      const crumbs = [{ label: "Home", href: context.url("/") }, { label: "Collections", href: context.url("/collections") }, { label: title }];
      const intro = opts.collectionIntro ? await opts.collectionIntro(context) : null;
      const columns = num(s.columns, 4) - (filters === "sidebar" && num(s.columns, 4) > 3 ? 1 : 0);
      return (
        <>
          {banner ? (
            <div className="relative isolate flex min-h-[220px] items-end overflow-hidden md:min-h-[320px]">
              <img src={collection!.image!.url} alt="" className="absolute inset-0 -z-20 size-full object-cover" fetchPriority="high" />
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 to-black/10" />
              <div className="pai-container pb-9 text-white">
                <Breadcrumbs items={crumbs} className="mb-3 text-white" />
                <h1 className="pai-h1">{title}</h1>
                {bool(s.show_description, true) && collection?.description ? <p className="mt-3 max-w-2xl opacity-90">{collection.description}</p> : null}
              </div>
            </div>
          ) : null}
          <Section settings={s}>
            {!banner ? (
              <div className="mb-8">
                <Breadcrumbs items={crumbs} className="mb-3" />
                <h1 className="pai-h1">{title}</h1>
                {bool(s.show_description, true) && collection?.description ? <p className="mt-3 max-w-2xl opacity-75">{collection.description}</p> : null}
              </div>
            ) : null}
            {intro}
            <div className={cn("grid gap-10", filters === "sidebar" && "lg:grid-cols-[240px_1fr]")}>
              {filters === "sidebar" ? (
                <aside className="hidden lg:block" aria-label="Filters">
                  <div className="sticky top-28">
                    <Suspense>
                      <CollectionFilters currencySymbol={symbol} />
                    </Suspense>
                  </div>
                </aside>
              ) : null}
              <div className="min-w-0">
                <div className="mb-6 flex items-center justify-between gap-3 border-b border-pai-border pb-4">
                  <div className="flex items-center gap-3">
                    {filters !== "none" ? (
                      <Suspense>
                        <FilterDrawerButton currencySymbol={symbol} className={cn(filters === "sidebar" && "lg:hidden")} />
                      </Suspense>
                    ) : null}
                    <p className="text-sm opacity-70">
                      {result.total} {result.total === 1 ? "product" : "products"}
                    </p>
                  </div>
                  {bool(s.show_sort, true) ? (
                    <Suspense>
                      <SortSelect />
                    </Suspense>
                  ) : null}
                </div>
                {items.length ? (
                  <Grid products={items} context={context} columns={columns} mobile={num(s.mobile_columns, 2)} priority={4} />
                ) : (
                  <EmptyState
                    icon={<ShoppingBag className="size-6 opacity-70" />}
                    title={active ? "No products match these filters" : "No products here yet"}
                    description={active ? "Try removing some filters or widening the price range." : "Check back soon — new products are on the way."}
                    action={active ? { label: "Clear filters", href: context.url(context.path) } : { label: "Browse all products", href: context.url("/collections/all") }}
                  />
                )}
                <Pagination page={result.page} pageCount={result.pageCount} hrefFor={(p) => withQuery(context, { page: p === 1 ? null : p })} />
              </div>
            </div>
          </Section>
        </>
      );
    },
  });

  const mainSearch: Override = (base) => ({
    ...base,
    component: async ({ settings: s, context }) => {
      const q = (context.searchParams.q ?? "").trim();
      const perPage = num(s.per_page, DEFAULT_PAGE_SIZE);
      const result = q
        ? context.products && context.products.pageSize === perPage
          ? context.products
          : await context.data.getProducts(listingQuery(context.searchParams, { query: q, pageSize: perPage }))
        : null;
      const popular = !result?.items.length ? (await context.data.getProducts({ sort: "best-selling", limit: 8 }).catch(() => null))?.items ?? [] : [];
      return (
        <Section settings={s}>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h1 className="pai-h2 mb-6">{q ? `Results for “${q}”` : "Search our store"}</h1>
            <SearchBox defaultValue={q} predictive={false} />
            {result ? <p className="mt-4 text-sm opacity-70">{result.total} results</p> : null}
          </div>
          {result?.items.length ? (
            <>
              <div className="mb-6 flex justify-end">
                <Suspense>
                  <SortSelect />
                </Suspense>
              </div>
              <Grid products={result.items} context={context} columns={num(s.columns, 4)} mobile={num(s.mobile_columns, 2)} />
              <Pagination page={result.page} pageCount={result.pageCount} hrefFor={(p) => withQuery(context, { page: p === 1 ? null : p })} />
            </>
          ) : (
            <>
              {q ? <p className="mb-10 text-center opacity-75">No products matched your search. Try a different word or browse our best sellers below.</p> : null}
              {popular.length ? (
                <>
                  <SectionHeading title="Popular right now" align="center" size="h3" />
                  <Grid products={popular} context={context} columns={4} />
                </>
              ) : null}
            </>
          )}
        </Section>
      );
    },
  });

  const main404: Override = (base) => ({
    ...base,
    component: async ({ settings: s, context }) => {
      const products = bool(s.show_products, true) ? (await context.data.getProducts({ sort: "best-selling", limit: 4 }).catch(() => null))?.items ?? [] : [];
      return (
        <Section settings={s}>
          <div className="mx-auto max-w-xl text-center">
            <p className="font-heading text-7xl font-bold opacity-15 md:text-8xl" aria-hidden>
              404
            </p>
            <h1 className="pai-h2 mt-2">{str(s.heading, "Page not found")}</h1>
            <p className="mt-4 opacity-75">{str(s.text)}</p>
            <SearchBox className="mx-auto mt-8 max-w-md text-left" />
            <ButtonLink href={context.url("/collections/all")} className="mt-6">
              Continue shopping
            </ButtonLink>
          </div>
          {products.length ? (
            <div className="mt-20">
              <SectionHeading title="Popular right now" align="center" size="h3" />
              <Grid products={products} context={context} columns={4} />
            </div>
          ) : null}
        </Section>
      );
    },
  });

  return {
    "featured-collection": featured,
    "product-grid": productGrid,
    "related-products": related,
    "main-collection": mainCollection,
    "main-search": mainSearch,
    "main-404": main404,
  };
}
