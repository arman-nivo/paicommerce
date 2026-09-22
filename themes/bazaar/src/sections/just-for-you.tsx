import { defineSection } from "@pai/theme-sdk";
import { PreviewNotice, bool, num, resolveHref, str } from "@pai/theme-kit";
import { Sparkles } from "lucide-react";
import { BazaarCard } from "../components/card";
import { BzSection, fallbackSortField, loadProducts, spacingField } from "../components/shared";
import { LoadMoreGrid } from "../client/load-more";

/**
 * "Just for you": an endless-feeling dense grid. The server renders up to `total` products; the
 * client reveals them `step` at a time (button or infinite scroll) and finally links to the catalogue.
 */
export const bazaarJustForYou = defineSection({
  schema: {
    type: "bazaar-just-for-you",
    name: "Just for you",
    category: "products",
    icon: "sparkles",
    description: "Dense 6-column product feed with “Load more” (or infinite scroll) that ends with a link to all products.",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Just for you" },
      { type: "collection", id: "collection", label: "Collection", info: "Optional. Leave empty to mix every category." },
      fallbackSortField("newest"),
      { type: "range", id: "total", label: "Products loaded", min: 12, max: 60, step: 6, default: 36 },
      { type: "range", id: "initial", label: "Shown at first", min: 6, max: 36, step: 6, default: 12 },
      { type: "range", id: "step", label: "Revealed per “Load more”", min: 6, max: 24, step: 6, default: 12 },
      { type: "checkbox", id: "auto", label: "Load more automatically while scrolling", default: false },
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
      { type: "text", id: "button_label", label: "Button label", default: "Load more" },
      { type: "text", id: "more_label", label: "Final link label", default: "Browse all products" },
      { type: "url", id: "more_link", label: "Final link", default: "/collections/all" },
      spacingField("small"),
    ],
    presets: [{ name: "Just for you" }],
  },
  component: async ({ settings: s, context }) => {
    const { items, sample } = await loadProducts(context, { collection: str(s.collection), sort: str(s.sort, "newest"), limit: num(s.total, 36) });
    if (!items.length) return null;
    const heading = str(s.heading, "Just for you");
    const cols = str(s.columns, "6") === "5" ? "lg:grid-cols-5" : "lg:grid-cols-6";
    return (
      <BzSection label={heading} padding={s.padding} className="bz-jfy">
        {sample ? <PreviewNotice context={context}>No products yet — showing sample products.</PreviewNotice> : null}
        <h2 className="bz-jfy-title mb-2.5 flex items-center gap-2 font-heading text-lg font-semibold sm:text-xl">
          <Sparkles className="size-5 text-pai-primary" aria-hidden />
          {heading}
        </h2>
        <LoadMoreGrid
          initial={num(s.initial, 12)}
          step={num(s.step, 12)}
          auto={bool(s.auto, false)}
          buttonLabel={str(s.button_label, "Load more")}
          moreLabel={str(s.more_label, "Browse all products")}
          moreHref={resolveHref(context, s.more_link, "/collections/all")}
          className={`grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 ${cols}`}
        >
          {items.map((p) => (
            <BazaarCard key={p.id} product={p} context={context} />
          ))}
        </LoadMoreGrid>
      </BzSection>
    );
  },
});
