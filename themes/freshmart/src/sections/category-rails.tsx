/** Product rails by category: one horizontal row per collection with a "See all" link. */
import { defineSection, type SfCollection, type SfProduct } from "@pai/theme-sdk";
import { SAMPLE_PRODUCTS, Section, SectionHeading, SmartLink, bool, num, paddingField, resolveHref, schemeField, str, headingFields } from "@pai/theme-kit";
import { Carousel } from "@pai/theme-kit/client";
import { ChevronRight } from "lucide-react";
import { FreshCard } from "./card";

type Rail = { id: string; title: string; subtitle: string; image: string | null; href: string; products: SfProduct[] };

export const categoryRails = defineSection({
  schema: {
    type: "category-rails",
    name: "Product rails by category",
    category: "products",
    icon: "rows-3",
    description: "A scrollable product row for each collection you add.",
    settings: [
      ...headingFields({ heading: "", subheading: "" }),
      { type: "range", id: "limit", label: "Products per rail", min: 4, max: 16, step: 1, default: 10 },
      { type: "range", id: "per_view", label: "Cards visible (desktop)", min: 4, max: 6, step: 1, default: 5 },
      { type: "checkbox", id: "fallback", label: "Fill empty rails with best sellers", default: true },
      schemeField(),
      paddingField("medium"),
    ],
    blocks: [
      {
        type: "rail",
        name: "Category rail",
        limit: 6,
        settings: [
          { type: "collection", id: "collection", label: "Collection" },
          { type: "text", id: "heading", label: "Heading", info: "Defaults to the collection title." },
          { type: "text", id: "subheading", label: "Subheading", default: "" },
          { type: "text", id: "link_label", label: "Link label", default: "See all" },
          { type: "url", id: "link", label: "Link", info: "Defaults to the collection page." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [{ name: "Product rails by category", blocks: [{ type: "rail" }, { type: "rail" }] }],
  },
  component: async ({ settings: s, blocks, context }) => {
    const limit = num(s.limit, 10);
    const railBlocks = blocks.filter((b) => b.type === "rail");
    const rails: (Rail & { linkLabel: string })[] = (
      await Promise.all(
        railBlocks.map(async (b, i) => {
          const slug = str(b.settings.collection);
          const [col, res] = slug
            ? await Promise.all([context.data.getCollection(slug).catch(() => null as SfCollection | null), context.data.getProducts({ collection: slug, limit }).catch(() => null)])
            : [null, null];
          let products = res?.items ?? [];
          if (!products.length && bool(s.fallback, true)) products = (await context.data.getProducts({ sort: "best-selling", limit, page: i + 1 }).catch(() => null))?.items ?? [];
          if (!products.length && context.isPreview) products = SAMPLE_PRODUCTS.slice(0, limit);
          return {
            id: b.id,
            title: str(b.settings.heading) || col?.title || (slug ? "" : "Popular picks"),
            subtitle: str(b.settings.subheading) || "",
            image: col?.image?.url ?? null,
            href: str(b.settings.link) ? resolveHref(context, b.settings.link) : col?.url ?? context.url("/collections/all"),
            linkLabel: str(b.settings.link_label, "See all"),
            products,
          };
        }),
      )
    ).filter((r) => r.products.length && r.title);
    if (!rails.length) return null;
    const pv = Math.min(6, Math.max(4, num(s.per_view, 5)));
    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Shop by category"}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "center" ? "center" : "left"} />
        <div className="space-y-10 md:space-y-12">
          {rails.map((r) => (
            <section key={r.id} aria-labelledby={`${r.id}-title`}>
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-pai-border pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  {r.image ? <img src={r.image} alt="" loading="lazy" className="size-10 shrink-0 rounded-full object-cover ring-2 ring-pai-border md:size-12" /> : null}
                  <div className="min-w-0">
                    <h3 id={`${r.id}-title`} className="pai-h3 truncate">
                      {r.title}
                    </h3>
                    {r.subtitle ? <p className="truncate text-sm opacity-65">{r.subtitle}</p> : null}
                  </div>
                </div>
                <SmartLink href={r.href} className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-pai-muted px-3 py-1.5 text-sm font-bold text-pai-primary transition hover:bg-pai-primary hover:text-pai-primary-fg">
                  {r.linkLabel} <ChevronRight className="size-4" aria-hidden />
                </SmartLink>
              </div>
              <Carousel perView={{ base: 2.15, md: 3.3, lg: pv }} gap={12} ariaLabel={r.title}>
                {r.products.map((p) => (
                  <FreshCard key={p.id} product={p} context={context} />
                ))}
              </Carousel>
            </section>
          ))}
        </div>
      </Section>
    );
  },
});
