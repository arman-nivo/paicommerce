import { defineSection, type SfCollection, type StorefrontContext } from "@pai/theme-sdk";
import { cn, gridColsClass, list, num, str } from "../lib/utils";
import { SAMPLE_COLLECTIONS, SAMPLE_POSTS, STOCK_IMAGES } from "../lib/samples";
import { ButtonLink, Image, Section, SectionHeading, SmartLink, resolveHref } from "../components/primitives";
import { ArticleCard, CollectionCard, ProductList } from "../components/cards";
import { Carousel } from "../client/widgets";
import { columnsField, headingFields, loadSectionProducts, mobileColumnsField, paddingField, PreviewNotice, productSourceFields, schemeField } from "./_shared";

/* ─────────────────────────── featured collection ─────────────────────────── */

export const featuredCollection = defineSection({
  schema: {
    type: "featured-collection",
    name: "Featured collection",
    category: "products",
    icon: "shopping-bag",
    description: "Products from a collection as a grid or carousel.",
    settings: [
      ...headingFields({ heading: "New arrivals", subheading: "" }),
      ...productSourceFields({ source: "collection", limit: 8 }),
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
      mobileColumnsField(2),
      { type: "checkbox", id: "show_view_all", label: "Show “View all” link", default: true },
      schemeField(),
      paddingField(),
    ],
    presets: [{ name: "Featured collection" }, { name: "Product carousel", settings: { layout: "carousel", heading: "Trending now" } }],
  },
  component: async ({ settings: s, context }) => {
    const { products, sample, collectionUrl } = await loadSectionProducts(context, s, 8);
    if (!products.length) return null;
    const viewAll = s.show_view_all !== false ? { label: "View all", href: collectionUrl ?? context.url("/collections/all") } : null;
    return (
      <Section settings={s}>
        {sample && str(s.source, "collection") === "collection" ? <PreviewNotice context={context}>Select a collection to show your products. Showing sample products.</PreviewNotice> : null}
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "center" ? "center" : "left"} action={s.heading_align === "center" ? null : viewAll} />
        <ProductList products={products} context={context} layout={s.layout === "carousel" ? "carousel" : "grid"} columns={num(s.columns, 4)} mobileColumns={num(s.mobile_columns, 2)} />
        {viewAll && s.heading_align === "center" ? (
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

/* ─────────────────────────── product grid (tabs) ─────────────────────────── */

export const productGrid = defineSection({
  schema: {
    type: "product-grid",
    name: "Product grid",
    category: "products",
    icon: "layout-grid",
    description: "A larger grid of products with a button below — great for “Best sellers”.",
    settings: [
      ...headingFields({ heading: "Best sellers", align: "center" }),
      ...productSourceFields({ source: "best-selling", limit: 12 }),
      columnsField(4),
      mobileColumnsField(2),
      { type: "text", id: "button_label", label: "Button label", default: "Shop all products" },
      { type: "url", id: "button_link", label: "Button link", default: "/collections/all" },
      schemeField(),
      paddingField(),
    ],
    presets: [{ name: "Product grid" }],
  },
  component: async ({ settings: s, context }) => {
    const { products } = await loadSectionProducts(context, s, 12);
    if (!products.length) return null;
    return (
      <Section settings={s}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        <ProductList products={products} context={context} columns={num(s.columns, 4)} mobileColumns={num(s.mobile_columns, 2)} />
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

/* ─────────────────────────── collection list ─────────────────────────── */

async function loadCollections(context: StorefrontContext, slugs: string[], limit: number): Promise<SfCollection[]> {
  let cols: SfCollection[] = [];
  try {
    cols = slugs.length ? await context.data.getCollections({ slugs }) : await context.data.getCollections({ limit });
    if (slugs.length) {
      const order = new Map(slugs.map((x, i) => [x, i]));
      cols = cols.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
    }
  } catch {
    cols = [];
  }
  if (!cols.length && context.isPreview) return SAMPLE_COLLECTIONS.slice(0, limit);
  return cols.slice(0, limit);
}

export const collectionList = defineSection({
  schema: {
    type: "collection-list",
    name: "Collection list",
    category: "collections",
    icon: "library",
    description: "Showcase your collections with images.",
    settings: [
      ...headingFields({ heading: "Shop by category" }),
      { type: "text", id: "collections", label: "Collections (slugs, comma separated)", info: "Leave empty to show your first collections." },
      { type: "range", id: "limit", label: "Maximum collections", min: 2, max: 12, step: 1, default: 4 },
      {
        type: "select",
        id: "card_style",
        label: "Card style",
        default: "overlay",
        options: [
          { value: "overlay", label: "Title on image" },
          { value: "below", label: "Title below image" },
          { value: "circle", label: "Circles" },
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
        id: "layout",
        label: "Layout",
        default: "grid",
        options: [
          { value: "grid", label: "Grid" },
          { value: "carousel", label: "Carousel" },
        ],
      },
      columnsField(4, 2, 6),
      { type: "checkbox", id: "show_count", label: "Show product count", default: false },
      schemeField(),
      paddingField(),
    ],
    presets: [{ name: "Collection list" }],
  },
  component: async ({ settings: s, context }) => {
    const slugs = str(s.collections)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const cols = await loadCollections(context, slugs.length ? slugs : list(s.collection_list), num(s.limit, 4));
    if (!cols.length) return null;
    const style = (str(s.card_style, "overlay") as "overlay" | "below" | "circle") ?? "overlay";
    const columns = num(s.columns, 4);
    const cards = cols.map((c) => <CollectionCard key={c.id} collection={c} style={style} ratio={str(s.image_ratio, "portrait")} showCount={s.show_count === true} />);
    return (
      <Section settings={s}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "center" ? "center" : "left"} action={{ label: "All collections", href: context.url("/collections") }} />
        {s.layout === "carousel" ? (
          <Carousel perView={{ base: style === "circle" ? 3.3 : 1.5, md: Math.min(columns, 3), lg: columns }} gap={20}>
            {cards}
          </Carousel>
        ) : (
          <div className={cn("grid gap-4 md:gap-6", style === "circle" ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6" : gridColsClass(columns, 2))}>{cards}</div>
        )}
      </Section>
    );
  },
});

/* ─────────────────────────── category tiles ─────────────────────────── */

export const categoryTiles = defineSection({
  schema: {
    type: "category-tiles",
    name: "Category tiles",
    category: "collections",
    icon: "shapes",
    description: "Hand-picked tiles with your own image, title and link (bento layout).",
    settings: [
      ...headingFields({ heading: "" }),
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "bento",
        options: [
          { value: "bento", label: "Bento (first tile large)" },
          { value: "grid", label: "Even grid" },
          { value: "circles", label: "Circles" },
        ],
      },
      { type: "range", id: "overlay", label: "Overlay opacity", min: 0, max: 80, step: 5, unit: "%", default: 25 },
      schemeField(),
      paddingField(),
    ],
    blocks: [
      {
        type: "tile",
        name: "Tile",
        limit: 8,
        settings: [
          { type: "image", id: "image", label: "Image", default: STOCK_IMAGES.gallery[0] },
          { type: "text", id: "title", label: "Title", default: "Category" },
          { type: "text", id: "subtitle", label: "Subtitle", default: "" },
          { type: "url", id: "link", label: "Link", default: "/collections/all" },
          { type: "collection", id: "collection", label: "Or link to a collection" },
        ],
      },
    ],
    presets: [
      {
        name: "Category tiles",
        blocks: [
          { type: "tile", settings: { title: "Women", subtitle: "New season styles", image: STOCK_IMAGES.gallery[0] } },
          { type: "tile", settings: { title: "Men", image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=900&q=80" } },
          { type: "tile", settings: { title: "Accessories", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    if (!blocks.length) return null;
    const layout = str(s.layout, "bento");
    const tiles = blocks.map((b, i) => {
      const bs = b.settings;
      const href = str(bs.collection) ? context.url(`/collections/${str(bs.collection)}`) : resolveHref(context, bs.link, "/collections/all");
      if (layout === "circles") {
        return (
          <SmartLink key={b.id} href={href} className="group flex flex-col items-center gap-3 text-center">
            <Image src={str(bs.image)} alt={str(bs.title)} ratio="aspect-square" wrapperClassName="w-full rounded-full ring-1 ring-pai-border" className="transition duration-700 group-hover:scale-105" />
            <span className="text-sm font-semibold">{str(bs.title)}</span>
          </SmartLink>
        );
      }
      const big = layout === "bento" && i === 0 && blocks.length >= 3;
      return (
        <SmartLink key={b.id} href={href} className={cn("group relative block min-h-56 overflow-hidden rounded-pai bg-pai-muted", big ? "md:row-span-2 md:min-h-[520px]" : "md:min-h-[250px]", layout === "grid" && "aspect-[4/5] md:min-h-0")}>
          <img src={str(bs.image)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-black" style={{ opacity: num(s.overlay, 25) / 100 }} />
          <span className="absolute inset-x-0 bottom-0 p-6 text-white">
            <span className={cn("block font-heading font-semibold", big ? "text-3xl" : "text-xl")}>{str(bs.title)}</span>
            {str(bs.subtitle) ? <span className="mt-1 block text-sm opacity-85">{str(bs.subtitle)}</span> : null}
            <span className="mt-3 inline-block text-sm font-semibold underline underline-offset-4">Shop now</span>
          </span>
        </SmartLink>
      );
    });
    return (
      <Section settings={s}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "center" ? "center" : "left"} />
        <div
          className={cn(
            "grid gap-4",
            layout === "circles" ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6" : layout === "bento" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : gridColsClass(Math.min(4, blocks.length), 2),
          )}
        >
          {tiles}
        </div>
      </Section>
    );
  },
});

/* ─────────────────────────── blog posts ─────────────────────────── */

export const blogPosts = defineSection({
  schema: {
    type: "blog-posts",
    name: "Blog posts",
    category: "content",
    icon: "newspaper",
    settings: [
      ...headingFields({ heading: "From the journal" }),
      { type: "range", id: "limit", label: "Posts", min: 2, max: 9, step: 1, default: 3 },
      columnsField(3, 2, 4),
      { type: "checkbox", id: "show_excerpt", label: "Show excerpt", default: true },
      schemeField(),
      paddingField(),
    ],
    presets: [{ name: "Blog posts" }],
  },
  component: async ({ settings: s, context }) => {
    let posts = (await context.data.getPosts({ limit: num(s.limit, 3) }).catch(() => null))?.items ?? [];
    if (!posts.length && context.isPreview) posts = SAMPLE_POSTS;
    if (!posts.length) return null;
    return (
      <Section settings={s}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "center" ? "center" : "left"} action={{ label: "Read the blog", href: context.url("/blog") }} />
        <div className={cn("grid gap-8", gridColsClass(num(s.columns, 3), 1))}>
          {posts.map((p) => (
            <ArticleCard key={p.id} post={p} showExcerpt={s.show_excerpt !== false} locale={context.store.locale} />
          ))}
        </div>
      </Section>
    );
  },
});
