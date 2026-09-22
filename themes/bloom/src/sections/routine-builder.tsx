/**
 * Routine builder: pick a skin concern, see a step-by-step routine (Cleanse → Treat → Moisturise →
 * Protect) built from real products, with an "add the whole routine" button.
 */
import { defineSection, type SfProduct, type StorefrontContext } from "@pai/theme-sdk";
import { Price, PreviewNotice, SAMPLE_PRODUCTS, Section, SmartLink, cn, headingFields, list, moneyOf, paddingField, schemeField, str } from "@pai/theme-kit";
import { RoutineTabs } from "../client/routine-tabs";
import { AddAllButton } from "../client/add-all";
import { Accent, Eyebrow } from "./_bloom";
import { IMG } from "../images";

/** Products for one concern: picked products → collection → tag → best sellers. */
async function loadConcern(context: StorefrontContext, s: Record<string, unknown>, limit: number): Promise<SfProduct[]> {
  const slugs = list(s.products);
  try {
    if (slugs.length) {
      const r = await context.data.getProducts({ slugs, limit: slugs.length });
      const order = new Map(slugs.map((x, i) => [x, i]));
      const found = r.items.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
      if (found.length) return found.slice(0, limit);
    }
    const col = str(s.collection);
    if (col) {
      const r = await context.data.getProducts({ collection: col, limit });
      if (r.items.length) return r.items;
    }
    const tag = str(s.tag);
    if (tag) {
      const r = await context.data.getProducts({ tag, limit });
      if (r.items.length) return r.items;
    }
    return (await context.data.getProducts({ sort: "best-selling", limit })).items;
  } catch {
    return [];
  }
}

export const routineBuilder = defineSection({
  schema: {
    type: "routine-builder",
    name: "Routine builder",
    category: "products",
    icon: "list-checks",
    description: "Skin-concern tiles that reveal a step-by-step routine of products.",
    settings: [
      ...headingFields({ eyebrow: "Routine builder", heading: "Your skin, your *ritual*", subheading: "Choose what you'd like to work on — we'll build a simple routine that fits.", align: "center" }),
      { type: "text", id: "steps", label: "Step names", default: "Cleanse, Tone, Treat, Moisturise, Protect", info: "Comma separated, applied to products in order." },
      { type: "range", id: "limit", label: "Products per routine", min: 2, max: 5, step: 1, default: 4 },
      { type: "checkbox", id: "show_add_all", label: "Show “Add routine to bag”", default: true },
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "concern",
        name: "Skin concern",
        limit: 6,
        settings: [
          { type: "text", id: "title", label: "Concern", default: "Dullness" },
          { type: "text", id: "hint", label: "Short hint", default: "Glow & radiance" },
          { type: "image", id: "image", label: "Tile image" },
          { type: "textarea", id: "text", label: "Why this routine", default: "Antioxidants by day, gentle renewal by night." },
          { type: "product_list", id: "products", label: "Routine products (in order)", limit: 5 },
          { type: "collection", id: "collection", label: "Or use a collection", info: "Used when no products are picked." },
          { type: "text", id: "tag", label: "Or products tagged", info: "Used when no products or collection are set." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Routine builder",
        blocks: [
          { type: "concern", settings: { title: "Dullness", hint: "Glow & radiance", image: IMG.orange } },
          { type: "concern", settings: { title: "Dryness", hint: "Hydration", image: IMG.dropperHand } },
          { type: "concern", settings: { title: "Sensitivity", hint: "Calm & repair", image: IMG.aloe } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const concerns = blocks.filter((b) => b.type === "concern");
    if (!concerns.length) return null;
    const limit = Math.max(2, Math.min(5, Number(s.limit) || 4));
    const stepNames = str(s.steps, "Cleanse, Treat, Moisturise, Protect")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    let sample = false;
    const resolved = await Promise.all(
      concerns.map(async (b) => {
        let products = await loadConcern(context, b.settings, limit);
        if (!products.length && context.isPreview) {
          products = SAMPLE_PRODUCTS.slice(0, limit);
          sample = true;
        }
        return { b, products };
      }),
    );
    if (resolved.every((r) => !r.products.length)) return null;
    const money = moneyOf(context);
    const heading = str(s.heading);
    const center = s.heading_align !== "left";

    const tabs = resolved.map(({ b, products }) => {
      const total = products.reduce((sum, p) => sum + p.price, 0);
      return {
        id: b.id,
        label: str(b.settings.title, "Concern"),
        hint: str(b.settings.hint),
        image: str(b.settings.image) || products[0]?.featuredImage?.url,
        panel: (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <ol className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {products.map((p, i) => {
                const img = p.featuredImage ?? p.images[0] ?? null;
                return (
                  <li key={p.id} className="relative">
                    <SmartLink href={p.url} className="group flex h-full flex-col rounded-pai bg-pai-card p-3 shadow-[var(--bloom-card-shadow)] transition hover:-translate-y-1">
                      <span className="absolute left-5 top-5 z-10 rounded-full bg-pai-bg/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-sm">
                        {String(i + 1).padStart(2, "0")} · {stepNames[i] ?? "Step"}
                      </span>
                      <span className="relative block aspect-square overflow-hidden rounded-[calc(var(--pai-radius)*0.8)] bg-pai-muted">
                        {img ? <img src={img.url} alt={img.alt ?? p.title} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" /> : null}
                      </span>
                      <span className="mt-3 flex flex-1 flex-col gap-1 px-1 pb-1">
                        <span className="pai-line-clamp-2 text-sm font-medium">{p.title}</span>
                        <Price price={p.price} compareAt={p.compareAtPrice} priceMax={p.priceMax} size="sm" {...money} />
                      </span>
                    </SmartLink>
                  </li>
                );
              })}
            </ol>
            <aside className="rounded-pai bg-pai-muted p-6">
              <p className="pai-eyebrow text-pai-accent">Your {str(b.settings.title).toLowerCase()} routine</p>
              {str(b.settings.text) ? <p className="mt-3 font-heading text-xl leading-snug">{str(b.settings.text)}</p> : null}
              <ul className="mt-5 space-y-2 text-sm">
                {products.map((p, i) => (
                  <li key={p.id} className="flex items-baseline gap-2">
                    <span className="font-semibold text-pai-accent">{i + 1}.</span>
                    <span className="opacity-80">{stepNames[i] ?? "Step"}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-baseline justify-between border-t border-pai-border pt-4 text-sm">
                <span className="opacity-70">Routine total</span>
                <Price price={total} size="md" {...money} />
              </p>
              {s.show_add_all !== false ? (
                <AddAllButton
                  className="mt-4"
                  label="Add routine to bag"
                  items={products
                    .filter((p) => p.available && !sample)
                    .map((p) => ({ productId: p.id, variantId: p.variants.find((v) => v.available)?.id ?? p.variants[0]?.id ?? null, title: p.title, imageUrl: p.featuredImage?.url ?? null, price: p.price, url: p.url }))}
                />
              ) : null}
            </aside>
          </div>
        ),
      };
    });

    return (
      <Section settings={s} ariaLabel={heading.replace(/\*/g, "") || "Routine builder"}>
        {sample ? <PreviewNotice context={context}>Pick products for each concern. Showing sample products.</PreviewNotice> : null}
        <div className={cn("mb-10 max-w-2xl", center && "mx-auto text-center")}>
          {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
          {heading ? (
            <h2 className="pai-h2">
              <Accent text={heading} />
            </h2>
          ) : null}
          {str(s.subheading) ? <p className="mt-4 text-base opacity-75 md:text-lg">{str(s.subheading)}</p> : null}
        </div>
        <RoutineTabs tabs={tabs} label="Skin concerns" />
      </Section>
    );
  },
});
