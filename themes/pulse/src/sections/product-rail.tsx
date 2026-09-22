import { defineSection } from "@pai/theme-sdk";
import { Container, PreviewNotice, SmartLink, cn, loadSectionProducts, num, productSourceFields, resolveHref, str } from "@pai/theme-kit";
import { Carousel } from "@pai/theme-kit/client";
import { PulseCard } from "../components/card";
import { padOf } from "../components/utils";

export const pulseProductRail = defineSection({
  schema: {
    type: "pulse-products",
    name: "Product rail",
    category: "products",
    icon: "pill",
    description: "Products from a collection (or best sellers) in Pulse's clinical cards — carousel or grid.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "" },
      { type: "text", id: "heading", label: "Heading", default: "Bestsellers" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "" },
      ...productSourceFields({ source: "best-selling", limit: 10 }),
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
      { type: "range", id: "columns", label: "Columns (desktop)", min: 3, max: 6, step: 1, default: 5 },
      { type: "text", id: "link_label", label: "Link label", default: "View all" },
      { type: "url", id: "link", label: "Link", info: "Defaults to the collection." },
      {
        type: "select",
        id: "background",
        label: "Background",
        default: "default",
        options: [
          { value: "default", label: "Default" },
          { value: "muted", label: "Soft tint" },
        ],
      },
      {
        type: "select",
        id: "padding",
        label: "Vertical spacing",
        default: "medium",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
    ],
    presets: [
      { name: "Product rail" },
      { name: "Vitamins & supplements", settings: { heading: "Vitamins & supplements", source: "collection", collection: "vitamins-supplements" } },
    ],
  },
  component: async ({ settings: s, context }) => {
    const { products, sample, collectionUrl } = await loadSectionProducts(context, s, 10);
    if (!products.length) return null;
    const columns = num(s.columns, 5);
    const link = resolveHref(context, s.link) || collectionUrl || context.url("/collections/all");
    const grid = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" }[columns] ?? "lg:grid-cols-5";
    return (
      <section aria-label={str(s.heading) || "Products"} className={cn("pai-section", s.background === "muted" && "bg-pai-muted/60")} style={{ ["--pai-section-pad" as string]: padOf(s.padding) }}>
        <Container>
          {sample ? <PreviewNotice context={context}>No products matched — showing sample products.</PreviewNotice> : null}
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              {str(s.eyebrow) ? <p className="pai-eyebrow mb-1 text-pai-primary">{str(s.eyebrow)}</p> : null}
              {str(s.heading) ? <h2 className="pai-h3">{str(s.heading)}</h2> : null}
              {str(s.subheading) ? <p className="mt-1 text-sm opacity-70">{str(s.subheading)}</p> : null}
            </div>
            {str(s.link_label) ? (
              <SmartLink href={link} className="shrink-0 text-sm font-semibold text-pai-primary hover:underline">
                {str(s.link_label)} →
              </SmartLink>
            ) : null}
          </div>
          {s.layout === "grid" ? (
            <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4", grid)}>
              {products.map((p) => (
                <PulseCard key={p.id} product={p} context={context} />
              ))}
            </div>
          ) : (
            <Carousel perView={{ base: 2.1, md: 3.2, lg: columns }} gap={14} ariaLabel={str(s.heading) || "Products"}>
              {products.map((p) => (
                <PulseCard key={p.id} product={p} context={context} />
              ))}
            </Carousel>
          )}
        </Container>
      </section>
    );
  },
});
