/**
 * Main template sections — the "body" of product, collection, search, cart, page, blog, article,
 * account and 404 templates. Each reads its resource from the StorefrontContext.
 */
import { Suspense, type ComponentType } from "react";
import Link from "next/link";
import { ArrowLeft, Package, ShoppingBag, Truck } from "lucide-react";
import { defineSection, type BlockInstance, type BlockSchema, type SectionComponent, type SectionDefinition, type SfProduct, type StorefrontContext } from "@pai/theme-sdk";
import { aspectClass, bool, cn, formatMoney, gridColsClass, num, str } from "../lib/utils";
import { SAMPLE_POSTS, SAMPLE_PRODUCTS } from "../lib/samples";
import { getAccountData, getStoreUrl } from "../lib/types";
import { DEFAULT_PAGE_SIZE, listingQuery } from "../lib/listing";
import { Breadcrumbs, ButtonLink, EmptyState, Pagination, Rating, RichText, Section, SectionHeading, moneyOf, withQuery } from "../components/primitives";
import { Icon, ICON_OPTIONS } from "../components/icons";
import { ArticleCard, CollectionCard, ProductGrid, ProductList } from "../components/cards";
import {
  AddToCartButton,
  BuyNowButton,
  ProductGallery,
  ProductPrice,
  ProductProvider,
  QuantitySelector,
  StickyAddToCart,
  StockIndicator,
  TrackProductView,
  VariantPicker,
} from "../client/product";
import { Accordion, ShareButtons } from "../client/widgets";
import { CartPageView } from "../client/cart-ui";
import { SearchBox } from "../client/search";
import { CollectionFilters, ContactForm, FilterDrawerButton, LoginForm, RegisterForm, SortSelect } from "../client/forms";
import { columnsField, mobileColumnsField, paddingField, schemeField } from "./_shared";

const productOf = (context: StorefrontContext): SfProduct | null => context.product ?? (context.isPreview ? SAMPLE_PRODUCTS[0]! : null);

/* ─────────────────────────── main product ─────────────────────────── */

/** Renders the kit's built-in main-product blocks (exported so custom renderers can fall back to it). */
export function ProductBlock({ block, product, context }: ProductBlockProps) {
  const s = block.settings;
  switch (block.type) {
    case "vendor":
      return product.vendor ? <p className="pai-eyebrow">{product.vendor}</p> : null;
    case "title":
      return <h1 className="pai-h2 [text-wrap:balance]">{product.title}</h1>;
    case "rating":
      return product.rating.count > 0 ? (
        <a href="#reviews" className="inline-flex w-fit items-center gap-2 text-sm hover:underline">
          <Rating value={product.rating.average} size={16} showValue />
          <span className="opacity-70">{product.rating.count} reviews</span>
        </a>
      ) : null;
    case "price":
      return (
        <div>
          <ProductPrice />
          {bool(s.show_tax_note) ? <p className="mt-1 text-xs opacity-60">{str(s.tax_note, "Price includes VAT. Delivery charge calculated at checkout.")}</p> : null}
        </div>
      );
    case "sku":
      return product.variants[0]?.sku ? <p className="text-xs opacity-60">SKU: {product.variants[0].sku}</p> : null;
    case "variant_picker":
      return <VariantPicker style={(str(s.style, "swatch") as "swatch" | "buttons" | "dropdown") ?? "swatch"} />;
    case "stock":
      return <StockIndicator lowStockThreshold={num(s.threshold, 5)} />;
    case "buy_buttons":
      return (
        <div className="space-y-3" data-pai-main-atc>
          <div className="flex gap-3">
            {bool(s.show_quantity, true) ? <QuantitySelector /> : null}
            <div className="flex-1">
              <AddToCartButton />
            </div>
          </div>
          {bool(s.show_buy_now, true) ? <BuyNowButton label={str(s.buy_now_label, "Buy it now")} variant={s.buy_now_style === "primary" ? "primary" : "secondary"} /> : null}
        </div>
      );
    case "description":
      return product.description ? (
        bool(s.collapsed) ? (
          <Accordion items={[{ id: "desc", title: "Description", content: <RichText html={product.description} />, defaultOpen: false }]} />
        ) : (
          <RichText html={product.description} className="text-[0.95rem] opacity-90" />
        )
      ) : null;
    case "collapsible_tab":
      return (
        <Accordion
          className="border-t-0"
          items={[
            {
              id: block.id,
              title: str(s.heading, "Details"),
              icon: str(s.icon) ? <Icon name={str(s.icon)} className="size-4" /> : undefined,
              content: s.source === "description" ? <RichText html={product.description} /> : <RichText html={str(s.content)} />,
              defaultOpen: bool(s.open),
            },
          ]}
        />
      );
    case "delivery_info":
      return (
        <div className="grid gap-3 rounded-pai bg-pai-muted p-4 text-sm sm:grid-cols-2">
          <div className="flex gap-3">
            <Truck className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">{str(s.inside_title, "Inside Dhaka")}</p>
              <p className="opacity-70">{str(s.inside_text, "Delivery in 1–2 days")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Package className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">{str(s.outside_title, "Outside Dhaka")}</p>
              <p className="opacity-70">{str(s.outside_text, "Delivery in 3–5 days")}</p>
            </div>
          </div>
          {str(s.note) ? <p className="text-xs opacity-70 sm:col-span-2">{str(s.note)}</p> : null}
        </div>
      );
    case "trust":
      return (
        <ul className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            [str(s.icon_1, "banknote"), str(s.text_1, "Cash on delivery")],
            [str(s.icon_2, "rotate-ccw"), str(s.text_2, "7-day easy returns")],
            [str(s.icon_3, "shield-check"), str(s.text_3, "100% genuine")],
          ].map(([icon, text], i) => (
            <li key={i} className="flex flex-col items-center gap-1.5 rounded-pai border border-pai-border p-3">
              <Icon name={icon} className="size-5" />
              <span className="font-medium">{text}</span>
            </li>
          ))}
        </ul>
      );
    case "text":
      return <RichText html={str(s.text)} className="text-sm" />;
    case "share":
      return <ShareButtons title={product.title} url={getStoreUrl(context) ? `${getStoreUrl(context)}/products/${product.slug}` : undefined} />;
    default:
      return null;
  }
}

/** Props passed to a main-product block renderer. */
export type ProductBlockProps = { block: BlockInstance; product: SfProduct; context: StorefrontContext };

/**
 * A custom main-product block: its schema (shown in the customizer's "Add block" list) and a
 * component. The component renders inside the product form, so client children may use
 * `useProductForm()` and the other product components from `@pai/theme-kit/client`.
 * A block whose `schema.type` matches a base block type replaces that block's schema and renderer.
 */
export type ProductBlockExtension = { schema: BlockSchema; component: ComponentType<ProductBlockProps> };

function mainProductComponent(renderers: Map<string, ComponentType<ProductBlockProps>>): SectionComponent {
  return ({ settings: s, blocks, context }) => {
      const product = productOf(context);
      if (!product) return null;
      const ratio = aspectClass(str(s.image_ratio, "portrait"));
      const media = str(s.media_width, "medium");
      const cols = media === "small" ? "md:grid-cols-[5fr_6fr]" : media === "large" ? "md:grid-cols-[3fr_2fr]" : "md:grid-cols-[1.15fr_1fr]";
      const off = product.compareAtPrice && product.compareAtPrice > product.price;
      const crumbs = [
        { label: "Home", href: context.url("/") },
        ...(context.collection ? [{ label: context.collection.title, href: context.collection.url }] : [{ label: "Shop", href: context.url("/collections/all") }]),
        { label: product.title },
      ];
      return (
        <Section settings={s}>
          <ProductProvider product={product} initialVariantId={context.searchParams.variant}>
            {bool(s.show_breadcrumbs, true) ? <Breadcrumbs items={crumbs} className="mb-5" /> : null}
            <div className={cn("grid gap-8 lg:gap-14", cols)}>
              <div className="min-w-0">
                <ProductGallery
                  layout={(str(s.gallery_layout, "thumbnails-bottom") as "thumbnails-bottom" | "thumbnails-left" | "grid" | "stacked") ?? "thumbnails-bottom"}
                  ratio={ratio}
                  zoom={bool(s.zoom, true)}
                  badge={
                    !product.available ? (
                      <span className="absolute left-3 top-3 rounded-[min(var(--pai-radius),6px)] bg-pai-fg px-2.5 py-1 text-xs font-bold uppercase text-pai-bg">Sold out</span>
                    ) : off ? (
                      <span className="absolute left-3 top-3 rounded-[min(var(--pai-radius),6px)] bg-pai-sale px-2.5 py-1 text-xs font-bold uppercase text-white">Sale</span>
                    ) : null
                  }
                />
              </div>
              <div className={cn("flex min-w-0 flex-col gap-5", bool(s.sticky_info, true) && "md:sticky md:top-24 md:self-start")}>
                {blocks.map((b) => (
                  (() => {
                    const Custom = renderers.get(b.type);
                    return Custom ? <Custom key={b.id} block={b} product={product} context={context} /> : <ProductBlock key={b.id} block={b} product={product} context={context} />;
                  })()
                ))}
              </div>
            </div>
            {bool(s.sticky_atc, true) ? <StickyAddToCart /> : null}
            {context.product ? <TrackProductView product={{ id: product.id, title: product.title, price: product.price }} /> : null}
          </ProductProvider>
        </Section>
      );
    };
}

export const mainProduct = defineSection({
  schema: {
    type: "main-product",
    name: "Product information",
    category: "template",
    icon: "package",
    templates: ["product"],
    limit: 1,
    settings: [
      {
        type: "select",
        id: "gallery_layout",
        label: "Gallery layout",
        default: "thumbnails-bottom",
        options: [
          { value: "thumbnails-bottom", label: "Thumbnails below" },
          { value: "thumbnails-left", label: "Thumbnails left" },
          { value: "grid", label: "Grid (2 columns)" },
          { value: "stacked", label: "Stacked" },
        ],
      },
      {
        type: "select",
        id: "image_ratio",
        label: "Image ratio",
        default: "portrait",
        options: [
          { value: "square", label: "Square" },
          { value: "portrait", label: "Portrait" },
          { value: "landscape", label: "Landscape" },
        ],
      },
      {
        type: "select",
        id: "media_width",
        label: "Gallery width",
        default: "medium",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
      { type: "checkbox", id: "zoom", label: "Enable image zoom", default: true },
      { type: "checkbox", id: "sticky_info", label: "Sticky product info on desktop", default: true },
      { type: "checkbox", id: "sticky_atc", label: "Sticky add-to-cart bar on scroll", default: true },
      { type: "checkbox", id: "show_breadcrumbs", label: "Show breadcrumbs", default: true },
      schemeField(),
      paddingField("small"),
    ],
    blocks: [
      { type: "vendor", name: "Vendor", limit: 1, settings: [] },
      { type: "title", name: "Title", limit: 1, settings: [] },
      { type: "rating", name: "Rating", limit: 1, settings: [] },
      {
        type: "price",
        name: "Price",
        limit: 1,
        settings: [
          { type: "checkbox", id: "show_tax_note", label: "Show tax / delivery note", default: false },
          { type: "text", id: "tax_note", label: "Note", default: "Price includes VAT. Delivery charge calculated at checkout." },
        ],
      },
      { type: "sku", name: "SKU", limit: 1, settings: [] },
      {
        type: "variant_picker",
        name: "Variant picker",
        limit: 1,
        settings: [
          {
            type: "select",
            id: "style",
            label: "Style",
            default: "swatch",
            options: [
              { value: "swatch", label: "Swatches + buttons" },
              { value: "buttons", label: "Buttons" },
              { value: "dropdown", label: "Dropdowns" },
            ],
          },
        ],
      },
      { type: "stock", name: "Stock indicator", limit: 1, settings: [{ type: "range", id: "threshold", label: "Low stock threshold", min: 1, max: 20, step: 1, default: 5 }] },
      {
        type: "buy_buttons",
        name: "Buy buttons",
        limit: 1,
        settings: [
          { type: "checkbox", id: "show_quantity", label: "Show quantity selector", default: true },
          { type: "checkbox", id: "show_buy_now", label: "Show “Buy it now”", default: true },
          { type: "text", id: "buy_now_label", label: "Buy now label", default: "Buy it now" },
          {
            type: "select",
            id: "buy_now_style",
            label: "Buy now style",
            default: "secondary",
            options: [
              { value: "secondary", label: "Outline" },
              { value: "primary", label: "Solid" },
            ],
          },
        ],
      },
      { type: "description", name: "Description", limit: 1, settings: [{ type: "checkbox", id: "collapsed", label: "Show as collapsible tab", default: false }] },
      {
        type: "collapsible_tab",
        name: "Collapsible tab",
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Delivery & returns" },
          { type: "select", id: "icon", label: "Icon", default: "truck", options: [{ value: "", label: "None" }, ...ICON_OPTIONS] },
          {
            type: "select",
            id: "source",
            label: "Content",
            default: "custom",
            options: [
              { value: "custom", label: "Custom text" },
              { value: "description", label: "Product description" },
            ],
          },
          { type: "richtext", id: "content", label: "Text", default: "<p>Inside Dhaka: 1–2 days. Outside Dhaka: 3–5 days. Easy returns within 7 days of delivery.</p>" },
          { type: "checkbox", id: "open", label: "Open by default", default: false },
        ],
      },
      {
        type: "delivery_info",
        name: "Delivery info",
        limit: 1,
        settings: [
          { type: "text", id: "inside_title", label: "Zone 1 title", default: "Inside Dhaka" },
          { type: "text", id: "inside_text", label: "Zone 1 text", default: "Delivery in 1–2 days · ৳70" },
          { type: "text", id: "outside_title", label: "Zone 2 title", default: "Outside Dhaka" },
          { type: "text", id: "outside_text", label: "Zone 2 text", default: "Delivery in 3–5 days · ৳130" },
          { type: "text", id: "note", label: "Note", default: "Cash on delivery available nationwide." },
        ],
      },
      {
        type: "trust",
        name: "Trust icons",
        limit: 1,
        settings: [
          { type: "select", id: "icon_1", label: "Icon 1", default: "banknote", options: ICON_OPTIONS },
          { type: "text", id: "text_1", label: "Text 1", default: "Cash on delivery" },
          { type: "select", id: "icon_2", label: "Icon 2", default: "rotate-ccw", options: ICON_OPTIONS },
          { type: "text", id: "text_2", label: "Text 2", default: "7-day easy returns" },
          { type: "select", id: "icon_3", label: "Icon 3", default: "shield-check", options: ICON_OPTIONS },
          { type: "text", id: "text_3", label: "Text 3", default: "100% genuine" },
        ],
      },
      { type: "text", name: "Text", settings: [{ type: "richtext", id: "text", label: "Text", default: "<p>Add a size guide, care tips or any extra info.</p>" }] },
      { type: "share", name: "Share buttons", limit: 1, settings: [] },
    ],
  },
  component: mainProductComponent(new Map()),
});

/**
 * Build a `main-product` section with extra (or replacement) block types without copying the
 * kit's block renderer. Use with `createBaseTheme({ overrideSections: { "main-product": … } })`.
 *
 * @example
 * overrideSections: { "main-product": (base) => extendMainProduct([sizeGuideBlock], base) }
 */
export function extendMainProduct(extensions: ProductBlockExtension[], base: SectionDefinition<any> = mainProduct): SectionDefinition<any> {
  const renderers = new Map(extensions.map((e) => [e.schema.type, e.component] as const));
  const baseBlocks = (base.schema.blocks ?? []).filter((b) => !renderers.has(b.type));
  return {
    ...base,
    schema: { ...base.schema, blocks: [...baseBlocks, ...extensions.map((e) => e.schema)] },
    component: mainProductComponent(renderers),
  };
}

/* ─────────────────────────── product reviews ─────────────────────────── */

export const productReviews = defineSection({
  schema: {
    type: "product-reviews",
    name: "Product reviews",
    category: "template",
    icon: "star",
    templates: ["product"],
    limit: 1,
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Customer reviews" },
      { type: "range", id: "limit", label: "Reviews shown", min: 3, max: 30, step: 1, default: 8 },
      { type: "checkbox", id: "hide_when_empty", label: "Hide when there are no reviews", default: false },
      schemeField(),
      paddingField(),
    ],
    presets: [{ name: "Product reviews" }],
  },
  component: async ({ settings: s, context }) => {
    const product = productOf(context);
    if (!product) return null;
    const reviews = context.product ? await context.data.getReviews(product.id, num(s.limit, 8)).catch(() => []) : [];
    if (!reviews.length && bool(s.hide_when_empty)) return null;
    const dist = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => Math.round(r.rating) === star).length }));
    return (
      <Section settings={s}>
        <div id="reviews" className="grid scroll-mt-24 gap-10 md:grid-cols-[300px_1fr] md:gap-16">
          <div>
            <h2 className="pai-h3">{str(s.heading, "Customer reviews")}</h2>
            {product.rating.count > 0 ? (
              <>
                <div className="mt-4 flex items-end gap-3">
                  <span className="font-heading text-5xl font-bold">{product.rating.average.toFixed(1)}</span>
                  <div className="pb-1.5">
                    <Rating value={product.rating.average} size={18} />
                    <p className="text-xs opacity-65">Based on {product.rating.count} reviews</p>
                  </div>
                </div>
                {reviews.length ? (
                  <ul className="mt-5 space-y-1.5">
                    {dist.map((d) => (
                      <li key={d.star} className="flex items-center gap-2 text-xs">
                        <span className="w-3">{d.star}</span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-pai-muted">
                          <span className="block h-full rounded-full bg-amber-400" style={{ width: `${(d.count / reviews.length) * 100}%` }} />
                        </span>
                        <span className="w-6 text-right opacity-60">{d.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-sm opacity-70">No reviews yet. Reviews from verified buyers will appear here.</p>
            )}
          </div>
          <ul className="divide-y divide-pai-border">
            {reviews.map((r) => (
              <li key={r.id} className="py-5 first:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <Rating value={r.rating} size={14} />
                  <time className="text-xs opacity-60">{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time>
                </div>
                {r.title ? <p className="mt-2 font-semibold">{r.title}</p> : null}
                {r.body ? <p className="mt-1 text-sm opacity-85">{r.body}</p> : null}
                <p className="mt-2 text-xs font-medium opacity-70">
                  {r.customerName} · <span className="text-emerald-600">Verified buyer</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    );
  },
});

/* ─────────────────────────── related products ─────────────────────────── */

export const relatedProducts = defineSection({
  schema: {
    type: "related-products",
    name: "Related products",
    category: "products",
    icon: "sparkles",
    templates: ["product"],
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "You may also like" },
      { type: "range", id: "limit", label: "Products", min: 2, max: 12, step: 1, default: 4 },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "grid",
        options: [
          { value: "grid", label: "Grid" },
          { value: "carousel", label: "Carousel" },
        ],
      },
      columnsField(4),
      schemeField(),
      paddingField(),
    ],
    presets: [{ name: "Related products" }],
  },
  component: async ({ settings: s, context }) => {
    const limit = num(s.limit, 4);
    let products = context.product ? await context.data.getRelatedProducts(context.product.id, limit).catch(() => []) : [];
    if (!products.length && context.isPreview) products = SAMPLE_PRODUCTS.slice(1, limit + 1);
    if (!products.length) return null;
    return (
      <Section settings={s}>
        <SectionHeading title={str(s.heading)} />
        <ProductList products={products} context={context} layout={s.layout === "carousel" ? "carousel" : "grid"} columns={num(s.columns, 4)} />
      </Section>
    );
  },
});

/* ─────────────────────────── main collection ─────────────────────────── */

export const mainCollection = defineSection({
  schema: {
    type: "main-collection",
    name: "Collection products",
    category: "template",
    icon: "layout-grid",
    templates: ["collection"],
    limit: 1,
    settings: [
      { type: "checkbox", id: "show_banner", label: "Show collection banner", default: true },
      { type: "checkbox", id: "show_description", label: "Show collection description", default: true },
      {
        type: "select",
        id: "filters",
        label: "Filters",
        default: "sidebar",
        options: [
          { value: "sidebar", label: "Sidebar (desktop) + drawer (mobile)" },
          { value: "drawer", label: "Drawer only" },
          { value: "none", label: "Hidden" },
        ],
      },
      { type: "checkbox", id: "show_sort", label: "Show sorting", default: true },
      { type: "range", id: "per_page", label: "Products per page", min: 8, max: 48, step: 4, default: DEFAULT_PAGE_SIZE },
      columnsField(4, 2, 5),
      mobileColumnsField(2),
      schemeField(),
      paddingField("small"),
    ],
  },
  component: async ({ settings: s, context }) => {
    const collection = context.collection;
    const perPage = num(s.per_page, DEFAULT_PAGE_SIZE);
    const slug = collection?.slug && collection.slug !== "all" ? collection.slug : undefined;
    const result =
      context.products && context.products.pageSize === perPage
        ? context.products
        : await context.data.getProducts(listingQuery(context.searchParams, { collection: slug, pageSize: perPage }));
    let items = result.items;
    const sample = !items.length && context.isPreview && !collection;
    if (sample) items = SAMPLE_PRODUCTS;
    const title = collection?.title ?? "All products";
    const filters = str(s.filters, "sidebar");
    const symbol = formatMoney(0, context.store.currency).replace(/[\d.,\s]/g, "") || "৳";
    const banner = bool(s.show_banner, true) && collection?.image;
    const active = !!(context.searchParams.min || context.searchParams.max || context.searchParams.instock);
    return (
      <>
        {banner ? (
          <div className="relative isolate flex min-h-[260px] items-end overflow-hidden md:min-h-[360px]">
            <img src={collection!.image!.url} alt="" className="absolute inset-0 -z-20 size-full object-cover" fetchPriority="high" />
            <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 to-black/10" />
            <div className="pai-container pb-10 text-white">
              <Breadcrumbs items={[{ label: "Home", href: context.url("/") }, { label: "Collections", href: context.url("/collections") }, { label: title }]} className="mb-3 text-white" />
              <h1 className="pai-h1">{title}</h1>
              {bool(s.show_description, true) && collection?.description ? <p className="mt-3 max-w-2xl opacity-90">{collection.description}</p> : null}
            </div>
          </div>
        ) : null}
        <Section settings={s}>
          {!banner ? (
            <div className="mb-8">
              <Breadcrumbs items={[{ label: "Home", href: context.url("/") }, { label: "Collections", href: context.url("/collections") }, { label: title }]} className="mb-3" />
              <h1 className="pai-h1">{title}</h1>
              {bool(s.show_description, true) && collection?.description ? <p className="mt-3 max-w-2xl opacity-75">{collection.description}</p> : null}
            </div>
          ) : null}
          <div className={cn("grid gap-10", filters === "sidebar" && "lg:grid-cols-[240px_1fr]")}>
            {filters === "sidebar" ? (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
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
                <ProductGrid products={items} context={context} columns={num(s.columns, 4) - (filters === "sidebar" && num(s.columns, 4) > 3 ? 1 : 0)} mobileColumns={num(s.mobile_columns, 2)} priorityCount={4} />
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

/* ─────────────────────────── collections list page ─────────────────────────── */

export const mainCollectionsList = defineSection({
  schema: {
    type: "main-collections-list",
    name: "Collections list",
    category: "template",
    icon: "library",
    templates: ["collections"],
    limit: 1,
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Collections" },
      {
        type: "select",
        id: "card_style",
        label: "Card style",
        default: "overlay",
        options: [
          { value: "overlay", label: "Title on image" },
          { value: "below", label: "Title below image" },
        ],
      },
      columnsField(3, 2, 4),
      schemeField(),
      paddingField(),
    ],
  },
  component: async ({ settings: s, context }) => {
    const cols = await context.data.getCollections({ limit: 100 });
    return (
      <Section settings={s}>
        <SectionHeading title={str(s.heading, "Collections")} size="h1" />
        {cols.length ? (
          <div className={cn("grid gap-5 md:gap-6", gridColsClass(num(s.columns, 3), 1))}>
            {cols.map((c) => (
              <CollectionCard key={c.id} collection={c} style={s.card_style === "below" ? "below" : "overlay"} ratio="landscape" showCount />
            ))}
          </div>
        ) : (
          <EmptyState title="No collections yet" action={{ label: "Browse all products", href: context.url("/collections/all") }} />
        )}
      </Section>
    );
  },
});

/* ─────────────────────────── search ─────────────────────────── */

export const mainSearch = defineSection({
  schema: {
    type: "main-search",
    name: "Search results",
    category: "template",
    icon: "search",
    templates: ["search"],
    limit: 1,
    settings: [columnsField(4, 2, 5), mobileColumnsField(2), { type: "range", id: "per_page", label: "Results per page", min: 8, max: 48, step: 4, default: DEFAULT_PAGE_SIZE }, schemeField(), paddingField("small")],
  },
  component: async ({ settings: s, context }) => {
    const q = (context.searchParams.q ?? "").trim();
    const perPage = num(s.per_page, DEFAULT_PAGE_SIZE);
    const result = q
      ? context.products && context.products.pageSize === perPage
        ? context.products
        : await context.data.getProducts(listingQuery(context.searchParams, { query: q, pageSize: perPage }))
      : null;
    const popular = !result?.items.length ? (await context.data.getProducts({ sort: "best-selling", limit: 8 })).items : [];
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
            <ProductGrid products={result.items} context={context} columns={num(s.columns, 4)} mobileColumns={num(s.mobile_columns, 2)} />
            <Pagination page={result.page} pageCount={result.pageCount} hrefFor={(p) => withQuery(context, { page: p === 1 ? null : p })} />
          </>
        ) : (
          <>
            {q ? <p className="mb-10 text-center opacity-75">No products matched your search. Try a different word or browse our best sellers below.</p> : null}
            {popular.length ? (
              <>
                <SectionHeading title="Popular right now" align="center" size="h3" />
                <ProductGrid products={popular} context={context} columns={4} />
              </>
            ) : null}
          </>
        )}
      </Section>
    );
  },
});

/* ─────────────────────────── cart ─────────────────────────── */

export const mainCart = defineSection({
  schema: {
    type: "main-cart",
    name: "Cart",
    category: "template",
    icon: "shopping-cart",
    templates: ["cart"],
    limit: 1,
    settings: [{ type: "text", id: "heading", label: "Heading", default: "Your cart" }, schemeField(), paddingField("small")],
  },
  component: ({ settings: s, context }) => (
    <Section settings={s}>
      <CartPageView heading={str(s.heading, "Your cart")} showNote={bool(context.theme.cart_show_note)} />
    </Section>
  ),
});

/* ─────────────────────────── page ─────────────────────────── */

export const mainPage = defineSection({
  schema: {
    type: "main-page",
    name: "Page content",
    category: "template",
    icon: "file-text",
    templates: ["page"],
    limit: 1,
    settings: [
      {
        type: "select",
        id: "width",
        label: "Content width",
        default: "narrow",
        options: [
          { value: "narrow", label: "Narrow (reading)" },
          { value: "default", label: "Page width" },
        ],
      },
      { type: "text", id: "contact_pages", label: "Show contact form on pages", default: "contact, contact-us", info: "Comma separated page handles." },
      schemeField(),
      paddingField(),
    ],
  },
  component: ({ settings: s, context }) => {
    const page = context.page;
    if (!page) {
      return context.isPreview ? (
        <Section settings={s} width="narrow">
          <h1 className="pai-h1">Page title</h1>
          <p className="mt-6 opacity-70">Your page content will appear here.</p>
        </Section>
      ) : null;
    }
    const contact = str(s.contact_pages, "contact, contact-us")
      .split(",")
      .map((x) => x.trim())
      .includes(page.slug);
    return (
      <Section settings={s} width={s.width === "default" ? "default" : "narrow"}>
        <Breadcrumbs items={[{ label: "Home", href: context.url("/") }, { label: page.title }]} className="mb-4" />
        <h1 className="pai-h1 mb-8">{page.title}</h1>
        <RichText html={page.content} className="text-[1.02rem]" />
        {contact ? (
          <div className="mt-12 border-t border-pai-border pt-10">
            <h2 className="pai-h3 mb-6">Send us a message</h2>
            <ContactForm />
          </div>
        ) : null}
      </Section>
    );
  },
});

/* ─────────────────────────── blog ─────────────────────────── */

export const mainBlog = defineSection({
  schema: {
    type: "main-blog",
    name: "Blog posts",
    category: "template",
    icon: "newspaper",
    templates: ["blog"],
    limit: 1,
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Journal" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "Stories, guides and news from our team." },
      columnsField(3, 1, 4),
      { type: "checkbox", id: "feature_first", label: "Feature the latest post", default: true },
      schemeField(),
      paddingField(),
    ],
  },
  component: async ({ settings: s, context }) => {
    const page = Math.max(1, parseInt(context.searchParams.page ?? "1", 10) || 1);
    const result = context.posts ?? (await context.data.getPosts({ page, limit: 12 }));
    let posts = result.items;
    if (!posts.length && context.isPreview) posts = SAMPLE_POSTS;
    const [first, ...rest] = posts;
    const feature = bool(s.feature_first, true) && result.page === 1 && first;
    return (
      <Section settings={s}>
        <SectionHeading title={str(s.heading, "Journal")} subtitle={str(s.subheading)} size="h1" />
        {!posts.length ? <EmptyState title="No posts yet" description="Check back soon for stories and updates." /> : null}
        {feature ? (
          <Link href={first.url} className="group mb-12 grid items-center gap-6 md:grid-cols-2 md:gap-10">
            <span className="relative block aspect-[16/10] overflow-hidden rounded-pai bg-pai-muted">
              {first.coverUrl ? <img src={first.coverUrl} alt="" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" /> : null}
            </span>
            <span>
              <span className="pai-eyebrow">Latest</span>
              <span className="pai-h2 mt-2 block group-hover:underline group-hover:underline-offset-4">{first.title}</span>
              {first.excerpt ? <span className="mt-3 block opacity-75">{first.excerpt}</span> : null}
              <span className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Read article</span>
            </span>
          </Link>
        ) : null}
        <div className={cn("grid gap-x-6 gap-y-10", gridColsClass(num(s.columns, 3), 1))}>
          {(feature ? rest : posts).map((p) => (
            <ArticleCard key={p.id} post={p} locale={context.store.locale} />
          ))}
        </div>
        <Pagination page={result.page} pageCount={result.pageCount} hrefFor={(p) => withQuery(context, { page: p === 1 ? null : p })} />
      </Section>
    );
  },
});

export const mainArticle = defineSection({
  schema: {
    type: "main-article",
    name: "Blog post",
    category: "template",
    icon: "book-open",
    templates: ["article"],
    limit: 1,
    settings: [
      { type: "checkbox", id: "show_cover", label: "Show cover image", default: true },
      { type: "checkbox", id: "show_share", label: "Show share buttons", default: true },
      schemeField(),
      paddingField(),
    ],
  },
  component: ({ settings: s, context }) => {
    const post = context.post ?? (context.isPreview ? SAMPLE_POSTS[0]! : null);
    if (!post) return null;
    const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
    return (
      <Section settings={s}>
        <article className="mx-auto max-w-3xl">
          <Link href={context.url("/blog")} className="mb-6 inline-flex items-center gap-1.5 text-sm opacity-70 hover:opacity-100">
            <ArrowLeft className="size-4" /> Back to blog
          </Link>
          <header className="mb-8">
            <h1 className="pai-h1 [text-wrap:balance]">{post.title}</h1>
            <p className="mt-4 text-sm opacity-65">
              {date}
              {date && post.author ? " · " : ""}
              {post.author}
            </p>
          </header>
          {bool(s.show_cover, true) && post.coverUrl ? <img src={post.coverUrl} alt="" className="mb-10 aspect-[16/9] w-full rounded-pai object-cover" fetchPriority="high" /> : null}
          <RichText html={post.content || post.excerpt} className="text-[1.05rem]" />
          {post.tags.length ? (
            <ul className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <li key={t} className="rounded-full bg-pai-muted px-3 py-1 text-xs">
                  #{t}
                </li>
              ))}
            </ul>
          ) : null}
          {bool(s.show_share, true) ? <ShareButtons title={post.title} className="mt-10 border-t border-pai-border pt-6" /> : null}
        </article>
      </Section>
    );
  },
});

/* ─────────────────────────── account ─────────────────────────── */

const STATUS_TONE: Record<string, string> = {
  unfulfilled: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  processing: "bg-sky-100 text-sky-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  returned: "bg-rose-100 text-rose-800",
  cancelled: "bg-neutral-200 text-neutral-700",
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  refunded: "bg-neutral-200 text-neutral-700",
};

function StatusPill({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", STATUS_TONE[status] ?? "bg-pai-muted")}>{status.replace(/_/g, " ")}</span>;
}

export const mainAccount = defineSection({
  schema: {
    type: "main-account",
    name: "Customer account",
    category: "template",
    icon: "user",
    templates: ["account"],
    limit: 1,
    settings: [
      { type: "text", id: "login_heading", label: "Login heading", default: "Welcome back" },
      { type: "text", id: "register_heading", label: "Register heading", default: "Create your account" },
      { type: "textarea", id: "register_text", label: "Register intro", default: "Track orders, save your address and check out faster." },
      schemeField(),
      paddingField(),
    ],
  },
  component: ({ settings: s, context }) => {
    const acc = getAccountData(context) ?? { view: context.customer ? "overview" : "login" };
    const money = moneyOf(context);
    const fmt = (n: number) => formatMoney(n, money.currency, money.display);
    const returnTo = acc.returnTo ?? "/account";

    if (acc.view === "login" || acc.view === "register") {
      const login = acc.view === "login";
      return (
        <Section settings={s}>
          <div className="mx-auto max-w-md">
            <h1 className="pai-h2 mb-2 text-center">{login ? str(s.login_heading, "Welcome back") : str(s.register_heading, "Create your account")}</h1>
            <p className="mb-8 text-center text-sm opacity-70">{login ? "Log in with your phone number or email." : str(s.register_text)}</p>
            <div className="rounded-pai border border-pai-border p-6 md:p-8">{login ? <LoginForm returnTo={returnTo} /> : <RegisterForm returnTo={returnTo} />}</div>
            <p className="mt-6 text-center text-sm opacity-70">
              Just want to check an order?{" "}
              <Link href={context.url("/track-order")} className="font-semibold underline underline-offset-4">
                Track it here
              </Link>
            </p>
          </div>
        </Section>
      );
    }

    const customer = context.customer;
    if (acc.view === "order") {
      const o = acc.order;
      if (!o) return <Section settings={s}><EmptyState title="Order not found" action={{ label: "Back to account", href: context.url("/account") }} /></Section>;
      const addr = o.shippingAddress ?? {};
      return (
        <Section settings={s}>
          <Link href={context.url("/account")} className="mb-6 inline-flex items-center gap-1.5 text-sm opacity-70 hover:opacity-100">
            <ArrowLeft className="size-4" /> All orders
          </Link>
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <h1 className="pai-h2">Order #{o.number}</h1>
            <StatusPill status={o.fulfillmentStatus} />
            <StatusPill status={o.paymentStatus} />
          </div>
          <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
            <div>
              <ul className="divide-y divide-pai-border rounded-pai border border-pai-border">
                {o.items.map((it, i) => (
                  <li key={i} className="flex items-center gap-4 p-4">
                    <span className="size-16 shrink-0 overflow-hidden rounded-[min(var(--pai-radius),8px)] bg-pai-muted">{it.imageUrl ? <img src={it.imageUrl} alt="" className="pai-img-cover" /> : null}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{it.title}</span>
                      {it.variantTitle ? <span className="block text-xs opacity-65">{it.variantTitle}</span> : null}
                      <span className="block text-xs opacity-65">
                        {fmt(it.price)} × {it.quantity}
                      </span>
                    </span>
                    <span className="text-sm font-semibold">{fmt(it.total)}</span>
                  </li>
                ))}
              </ul>
              {o.events.length ? (
                <div className="mt-8">
                  <h2 className="mb-4 font-heading text-lg font-semibold">Order timeline</h2>
                  <ol className="space-y-4 border-l border-pai-border pl-5">
                    {o.events.map((e, i) => (
                      <li key={i} className="relative">
                        <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-pai-primary" />
                        <p className="text-sm">{e.message}</p>
                        <p className="text-xs opacity-60">{new Date(e.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
            <aside className="h-fit space-y-5 rounded-pai bg-pai-muted p-6 text-sm">
              <dl className="space-y-1.5">
                <div className="flex justify-between"><dt className="opacity-70">Subtotal</dt><dd>{fmt(o.subtotal)}</dd></div>
                {o.discountTotal ? <div className="flex justify-between"><dt className="opacity-70">Discount</dt><dd>−{fmt(o.discountTotal)}</dd></div> : null}
                <div className="flex justify-between"><dt className="opacity-70">Delivery{o.deliveryZone ? ` (${o.deliveryZone})` : ""}</dt><dd>{fmt(o.shippingTotal)}</dd></div>
                <div className="flex justify-between border-t border-pai-border pt-2 text-base font-semibold"><dt>Total</dt><dd>{fmt(o.total)}</dd></div>
              </dl>
              <div>
                <p className="font-semibold">Shipping to</p>
                <p className="opacity-75">{[addr.name, addr.phone, addr.line1, addr.area, addr.district].filter(Boolean).join(", ")}</p>
              </div>
              <p><span className="font-semibold">Payment:</span> <span className="opacity-75">{o.paymentMethod.replace(/_/g, " ")}</span></p>
              {o.trackingUrl ? <ButtonLink href={o.trackingUrl} variant="primary" block>Track parcel</ButtonLink> : null}
            </aside>
          </div>
        </Section>
      );
    }

    const orders = acc.orders ?? [];
    return (
      <Section settings={s}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="pai-eyebrow mb-1">My account</p>
            <h1 className="pai-h2">Hi, {customer?.name?.split(" ")[0] ?? "there"} 👋</h1>
          </div>
          <a href={context.url("/account/logout")} className="text-sm underline underline-offset-4 opacity-75 hover:opacity-100">
            Log out
          </a>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <h2 className="mb-4 font-heading text-lg font-semibold">Order history</h2>
            {orders.length ? (
              <div className="overflow-x-auto rounded-pai border border-pai-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-pai-muted text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Order</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pai-border">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-pai-muted/50">
                        <td className="px-4 py-3">
                          <Link href={context.url(`/account/orders/${o.id}`)} className="font-semibold underline underline-offset-4">
                            #{o.number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 opacity-75">{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className="px-4 py-3"><StatusPill status={o.fulfillmentStatus} /></td>
                        <td className="px-4 py-3 text-right font-medium">{fmt(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={<Package className="size-6 opacity-70" />} title="No orders yet" description="When you place an order it will show up here." action={{ label: "Start shopping", href: context.url("/collections/all") }} />
            )}
          </div>
          <aside className="h-fit rounded-pai bg-pai-muted p-6 text-sm">
            <h2 className="mb-3 font-heading text-lg font-semibold">Account details</h2>
            <p className="font-medium">{customer?.name}</p>
            {customer?.phone ? <p className="opacity-75">{customer.phone}</p> : null}
            {customer?.email ? <p className="opacity-75">{customer.email}</p> : null}
          </aside>
        </div>
      </Section>
    );
  },
});

/* ─────────────────────────── 404 ─────────────────────────── */

export const main404 = defineSection({
  schema: {
    type: "main-404",
    name: "Page not found",
    category: "template",
    icon: "circle-alert",
    templates: ["404"],
    limit: 1,
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Page not found" },
      { type: "textarea", id: "text", label: "Text", default: "The page you're looking for doesn't exist or has moved. Try searching or head back to the shop." },
      { type: "checkbox", id: "show_products", label: "Show popular products", default: true },
      schemeField(),
      paddingField("large"),
    ],
  },
  component: async ({ settings: s, context }) => {
    const products = bool(s.show_products, true) ? (await context.data.getProducts({ sort: "best-selling", limit: 4 }).catch(() => null))?.items ?? [] : [];
    return (
      <Section settings={s}>
        <div className="mx-auto max-w-xl text-center">
          <p className="font-heading text-7xl font-bold opacity-15 md:text-8xl">404</p>
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
            <ProductList products={products} context={context} columns={4} />
          </div>
        ) : null}
      </Section>
    );
  },
});
