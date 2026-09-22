import { defineSection, type SectionDefinition, type SfProduct } from "@pai/theme-sdk";
import { PreviewNotice, SAMPLE_PRODUCTS, SmartLink, bool, cn, list, num, resolveHref, str } from "@pai/theme-kit";
import { Carousel } from "@pai/theme-kit/client";
import { BazaarCard } from "../components/card";
import { BzHead, BzSection, fallbackSortField, loadProducts, spacingField } from "../components/shared";

/**
 * Dense product rail: a heading bar with "See more", many compact cards (carousel or grid) and an
 * optional tall side banner. Drop it on the home page once per collection.
 */
export const bazaarProductRail = defineSection({
  schema: {
    type: "bazaar-product-rail",
    name: "Product rail",
    category: "products",
    icon: "rows-3",
    description: "Heading + “See more”, a dense carousel or grid of compact cards, and an optional side banner.",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Best sellers" },
      { type: "text", id: "subheading", label: "Tagline", default: "" },
      { type: "collection", id: "collection", label: "Collection", info: "Falls back to the option below when empty or missing." },
      fallbackSortField("best-selling"),
      { type: "product_list", id: "products", label: "Hand-picked products (optional)", limit: 24 },
      { type: "range", id: "limit", label: "Maximum products", min: 4, max: 24, step: 1, default: 12 },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "carousel",
        options: [
          { value: "carousel", label: "Carousel" },
          { value: "grid", label: "Grid" },
        ],
      },
      {
        type: "select",
        id: "columns",
        label: "Cards per row (desktop)",
        default: "6",
        options: [
          { value: "5", label: "5" },
          { value: "6", label: "6" },
        ],
      },
      { type: "text", id: "link_label", label: "Link label", default: "See more" },
      { type: "url", id: "link", label: "Link", info: "Defaults to the collection." },
      { type: "header", label: "Side banner" },
      { type: "checkbox", id: "show_banner", label: "Show side banner (desktop)", default: false },
      { type: "image", id: "banner_image", label: "Image" },
      { type: "text", id: "banner_alt", label: "Image description (alt text)", default: "" },
      { type: "text", id: "banner_eyebrow", label: "Badge", default: "Top picks" },
      { type: "text", id: "banner_heading", label: "Heading", default: "Handpicked for you" },
      { type: "text", id: "banner_text", label: "Text", default: "" },
      { type: "url", id: "banner_link", label: "Link", info: "Defaults to the rail link." },
      spacingField("small"),
    ],
    presets: [{ name: "Product rail" }, { name: "Product rail with banner", settings: { show_banner: true } }],
  },
  component: async ({ settings: s, context }) => {
    const limit = num(s.limit, 12);
    const { items, url, sample } = await loadProducts(context, { collection: str(s.collection), sort: str(s.sort, "best-selling"), limit, manual: list(s.products) });
    if (!items.length) return null;
    const heading = str(s.heading, "Products");
    const link = resolveHref(context, s.link) || url || context.url("/collections/all");
    const banner = bool(s.show_banner, false) && str(s.banner_image);
    const six = str(s.columns, "6") === "6";
    const perLg = banner ? (six ? 5 : 4) : six ? 6 : 5;

    return (
      <BzSection label={heading} padding={s.padding} className="bz-rail">
        {sample ? <PreviewNotice context={context}>Pick a collection — showing sample products.</PreviewNotice> : null}
        <div className="rounded-pai bg-pai-card">
          <BzHead title={heading} href={link} linkLabel={str(s.link_label, "See more")} className="bz-head-bar px-3 py-2.5 sm:px-4">
            {str(s.subheading) ? <p className="hidden text-[0.8rem] opacity-60 sm:block">{str(s.subheading)}</p> : null}
          </BzHead>
          <div className={cn("grid gap-2 p-2 sm:p-3", banner && "lg:grid-cols-[210px_minmax(0,1fr)]")}>
            {banner ? (
              <SmartLink href={resolveHref(context, s.banner_link) || link} className="bz-side-banner group relative isolate hidden overflow-hidden rounded-pai p-4 text-white lg:flex lg:flex-col lg:justify-end">
                <img src={str(s.banner_image)} alt={str(s.banner_alt)} loading="lazy" decoding="async" className="absolute inset-0 -z-20 size-full object-cover transition duration-700 group-hover:scale-105" />
                <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {str(s.banner_eyebrow) ? <span className="bz-pill mb-2 bg-pai-accent text-[#1a1a1a]">{str(s.banner_eyebrow)}</span> : null}
                <span className="font-heading text-xl font-bold leading-tight">{str(s.banner_heading)}</span>
                {str(s.banner_text) ? <span className="mt-1 text-xs opacity-85">{str(s.banner_text)}</span> : null}
                <span className="mt-2 text-xs font-bold text-pai-accent">Shop now →</span>
              </SmartLink>
            ) : null}
            <div className="min-w-0">
              {s.layout === "grid" ? (
                <ul className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4", perLg === 6 ? "lg:grid-cols-6" : perLg === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4")}>
                  {items.map((p) => (
                    <li key={p.id}>
                      <BazaarCard product={p} context={context} className="bz-card-flat" />
                    </li>
                  ))}
                </ul>
              ) : (
                <Carousel perView={{ base: 2.3, md: 4, lg: perLg }} gap={8} ariaLabel={heading}>
                  {items.map((p) => (
                    <BazaarCard key={p.id} product={p} context={context} className="bz-card-flat" />
                  ))}
                </Carousel>
              )}
            </div>
          </div>
        </div>
      </BzSection>
    );
  },
});

/**
 * The kit's `related-products` (schema unchanged) rendered as a Bazaar rail: white panel, heading
 * bar and dense cards — so the product page matches the home page.
 */
export const bazaarRelated = (base: SectionDefinition<any>): SectionDefinition<any> => ({
  ...base,
  component: async ({ settings: s, context }) => {
    const limit = num(s.limit, 12);
    let items = context.product ? await context.data.getRelatedProducts(context.product.id, limit).catch(() => [] as SfProduct[]) : [];
    if (!items.length && context.isPreview) items = SAMPLE_PRODUCTS.slice(1, limit + 1);
    if (!items.length) return null;
    const heading = str(s.heading, "You may also like");
    const cols = Math.min(6, Math.max(4, num(s.columns, 6)));
    return (
      <BzSection label={heading} padding={s.padding} className="bz-rail">
        <div className="rounded-pai bg-pai-card">
          <BzHead title={heading} className="bz-head-bar px-3 py-2.5 sm:px-4" />
          <div className="p-2 sm:p-3">
            {s.layout === "grid" ? (
              <ul className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4", cols === 6 ? "lg:grid-cols-6" : cols === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4")}>
                {items.map((p) => (
                  <li key={p.id}>
                    <BazaarCard product={p} context={context} className="bz-card-flat" />
                  </li>
                ))}
              </ul>
            ) : (
              <Carousel perView={{ base: 2.3, md: 4, lg: cols }} gap={8} ariaLabel={heading}>
                {items.map((p) => (
                  <BazaarCard key={p.id} product={p} context={context} className="bz-card-flat" />
                ))}
              </Carousel>
            )}
          </div>
        </div>
      </BzSection>
    );
  },
});
