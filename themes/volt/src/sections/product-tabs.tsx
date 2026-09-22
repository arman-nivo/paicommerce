import { defineSection, type SfProduct, type StorefrontContext } from "@pai/theme-sdk";
import { Container, SAMPLE_PRODUCTS, SmartLink, num, paddingField, str } from "@pai/theme-kit";
import { Tabs } from "@pai/theme-kit/client";
import { VoltCard } from "../components/card";

/** Products for a tab: the collection when it exists, otherwise best sellers (never an empty tab). */
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

export const voltProductTabs = defineSection({
  schema: {
    type: "product-tabs",
    name: "Product tabs",
    category: "products",
    icon: "folder-kanban",
    description: "Tabbed product grids — one tab per collection (phones, laptops, audio …).",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Trending now" },
      { type: "text", id: "heading", label: "Heading", default: "Most wanted this week" },
      { type: "range", id: "limit", label: "Products per tab", min: 4, max: 12, step: 1, default: 8 },
      {
        type: "select",
        id: "columns",
        label: "Columns (desktop)",
        default: "4",
        options: [
          { value: "4", label: "4" },
          { value: "5", label: "5" },
        ],
      },
      paddingField("medium"),
    ],
    blocks: [
      {
        type: "tab",
        name: "Tab",
        limit: 6,
        settings: [
          { type: "text", id: "label", label: "Tab label", default: "Best sellers" },
          { type: "collection", id: "collection", label: "Collection", info: "Leave empty (or if it has no products) to show the source below." },
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
        name: "Product tabs",
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
    const cols = str(s.columns, "4") === "5" ? "lg:grid-cols-5" : "lg:grid-cols-4";
    const pad = { none: "0", small: "0.5", medium: "1", large: "1.5" }[str(s.padding, "medium")] ?? "1";
    return (
      <section aria-label={str(s.heading) || "Products"} className="pai-section" style={{ ["--pai-section-pad" as string]: pad }}>
        <Container>
          <div className="mb-4">
            {str(s.eyebrow) ? <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-pai-primary">{str(s.eyebrow)}</p> : null}
            {str(s.heading) ? <h2 className="pai-h2 mt-2">{str(s.heading)}</h2> : null}
          </div>
          <Tabs
            className="volt-tabs"
            tabs={filled.map((t) => ({
              id: t.id,
              label: t.label,
              content: (
                <div>
                  <div className={`grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 ${cols}`}>
                    {t.items.map((p) => (
                      <VoltCard key={p.id} product={p} context={context} />
                    ))}
                  </div>
                  {t.url ? (
                    <p className="mt-6 text-center">
                      <SmartLink href={t.url} className="text-sm font-semibold text-pai-primary hover:underline">
                        View all {t.label} →
                      </SmartLink>
                    </p>
                  ) : null}
                </div>
              ),
            }))}
          />
        </Container>
      </section>
    );
  },
});
