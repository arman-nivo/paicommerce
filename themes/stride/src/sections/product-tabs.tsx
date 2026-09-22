import { defineSection, type SfProduct, type StorefrontContext } from "@pai/theme-sdk";
import { SAMPLE_PRODUCTS, Section, SmartLink, cn, num, paddingField, schemeField, str } from "@pai/theme-kit";
import { Carousel, Tabs } from "@pai/theme-kit/client";
import { StrideCard } from "../components/card";

/** Products for a tab: the collection when it has products, otherwise the fallback sort (never an empty tab). */
export async function tabProducts(context: StorefrontContext, collection: string, source: string, limit: number): Promise<{ items: SfProduct[]; url: string | null }> {
  try {
    if (collection) {
      const [r, c] = await Promise.all([context.data.getProducts({ collection, limit }), context.data.getCollection(collection)]);
      if (r.items.length) return { items: r.items, url: c?.url ?? null };
    }
    const sort = source === "newest" ? "newest" : source === "rating" ? "rating" : "best-selling";
    const r = await context.data.getProducts({ sort, limit });
    if (r.items.length) return { items: r.items, url: null };
  } catch {
    /* fall through */
  }
  return { items: context.isPreview ? SAMPLE_PRODUCTS.slice(0, limit) : [], url: null };
}

/**
 * Product rail with tabs — one tab per collection (Running, Gym, Football …). Each tab is a
 * horizontal carousel of Stride cards (or a grid), with a "Shop all" link to the collection.
 */
export const strideProductTabs = defineSection({
  schema: {
    type: "stride-product-tabs",
    name: "Product rail with tabs",
    category: "products",
    icon: "folder-kanban",
    description: "Tabbed product carousels — one tab per sport or collection.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Fresh drops" },
      { type: "text", id: "heading", label: "Heading", default: "Gear up by sport" },
      { type: "range", id: "limit", label: "Products per tab", min: 4, max: 12, step: 1, default: 8 },
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
        id: "ratio",
        label: "Image shape",
        default: "portrait",
        options: [
          { value: "portrait", label: "Portrait" },
          { value: "square", label: "Square" },
        ],
      },
      { type: "checkbox", id: "numbered", label: "Show rank numbers", default: false },
      schemeField(),
      paddingField(),
    ],
    blocks: [
      {
        type: "tab",
        name: "Tab",
        limit: 6,
        settings: [
          { type: "text", id: "label", label: "Tab label", default: "Best sellers" },
          { type: "collection", id: "collection", label: "Collection", info: "Leave empty (or if it has no products) to show the fallback below." },
          {
            type: "select",
            id: "source",
            label: "Fallback products",
            default: "best-selling",
            options: [
              { value: "best-selling", label: "Best sellers" },
              { value: "newest", label: "Newest" },
              { value: "rating", label: "Top rated" },
            ],
          },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Product rail with tabs",
        blocks: [
          { type: "tab", settings: { label: "Best sellers", source: "best-selling" } },
          { type: "tab", settings: { label: "New arrivals", source: "newest" } },
          { type: "tab", settings: { label: "Top rated", source: "rating" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const limit = num(s.limit, 8);
    const tabs = await Promise.all(
      blocks
        .filter((b) => b.type === "tab")
        .map(async (b) => ({ id: b.id, label: str(b.settings.label, "Products"), ...(await tabProducts(context, str(b.settings.collection), str(b.settings.source), limit)) })),
    );
    const filled = tabs.filter((t) => t.items.length);
    if (!filled.length) return null;
    const ratio = s.ratio === "square" ? "square" : "portrait";
    const numbered = Boolean(s.numbered);
    const heading = str(s.heading);

    const body = (t: (typeof filled)[number]) => (
      <div>
        {s.layout === "grid" ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4">
            {t.items.map((p, i) => (
              <StrideCard key={p.id} product={p} context={context} ratio={ratio} index={numbered ? i : undefined} />
            ))}
          </div>
        ) : (
          <Carousel perView={{ base: 1.5, md: 2.6, lg: 4 }} gap={16} ariaLabel={t.label} className="stride-carousel">
            {t.items.map((p, i) => (
              <StrideCard key={p.id} product={p} context={context} ratio={ratio} index={numbered ? i : undefined} />
            ))}
          </Carousel>
        )}
        {t.url ? (
          <p className="mt-8">
            <SmartLink href={t.url} className="stride-link">
              Shop all {t.label}
            </SmartLink>
          </p>
        ) : null}
      </div>
    );

    return (
      <Section settings={s} ariaLabel={heading || "Products"} width="wide">
        <div className="mb-6">
          {str(s.eyebrow) ? <p className="stride-kicker mb-3">{str(s.eyebrow)}</p> : null}
          {heading ? <h2 className="pai-h1">{heading}</h2> : null}
        </div>
        {filled.length > 1 ? (
          <Tabs className={cn("stride-tabs")} tabs={filled.map((t) => ({ id: t.id, label: t.label, content: body(t) }))} />
        ) : (
          body(filled[0]!)
        )}
      </Section>
    );
  },
});
