/**
 * Bundle deals: colourful cards for ready-made sets (e.g. "Newborn welcome box") listing what's
 * inside, the bundle price, what you save and a button. A bundle can point at a real product
 * (its image, price and link are used unless overridden) or at any link.
 */
import type { CSSProperties } from "react";
import { Check, Package } from "lucide-react";
import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { ButtonLink, Placeholder, Section, SectionHeading, headingFields, num, paddingField, resolveHref, str } from "@pai/theme-kit";
import { IMG } from "../images";
import { Blob, backgroundField, backgroundStyle, funColor, funColorField, tint } from "./_playhouse";

export const bundleDeals = defineSection({
  schema: {
    type: "bundle-deals",
    name: "Bundle deals",
    category: "marketing",
    icon: "package",
    description: "Ready-made bundles with what's inside, the bundle price and your savings.",
    settings: [
      ...headingFields({ eyebrow: "Better together", heading: "Bundle up & save", subheading: "Our favourite combos, bundled at a sweeter price.", align: "center" }),
      { type: "text", id: "button_label", label: "Button label", default: "Get the bundle" },
      backgroundField("none"),
      paddingField(),
    ],
    blocks: [
      {
        type: "bundle",
        name: "Bundle",
        limit: 4,
        settings: [
          { type: "text", id: "title", label: "Title", default: "Little builder's box" },
          { type: "image", id: "image", label: "Image", default: IMG.colorBlocks },
          { type: "textarea", id: "items", label: "What's inside", default: "Wooden ABC blocks\nRainbow stacking rings\nJumbo crayons art kit", info: "One item per line." },
          { type: "number", id: "price", label: "Bundle price (৳)", min: 0, default: 0, info: "Leave 0 to use the linked product's price." },
          { type: "number", id: "compare_price", label: "Price if bought separately (৳)", min: 0, default: 0 },
          { type: "text", id: "badge", label: "Badge", default: "Best value" },
          { type: "product", id: "product", label: "Bundle product", info: "Optional — links to this product and uses its image and price." },
          { type: "url", id: "link", label: "Link", default: "/collections/all" },
          funColorField("color", "Colour", "sunshine"),
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Bundle deals",
        blocks: [
          { type: "bundle", settings: { title: "Little builder's box", image: IMG.colorBlocks, items: "Wooden ABC blocks (26 pcs)\nRainbow stacking rings\nJumbo crayons & markers kit", price: 2250, compare_price: 2650, badge: "Best value", link: "/collections/learning", color: "sunshine" } },
          { type: "bundle", settings: { title: "Newborn welcome box", image: IMG.babyTeeSet, items: "Newborn cotton essentials set\nBaby bear hooded romper\nCuddly teddy bear", price: 4150, compare_price: 4650, badge: "Gift ready", link: "/collections/baby", color: "bubblegum" } },
          { type: "bundle", settings: { title: "Happy pup kit", image: IMG.frenchieHoodie, items: "Premium adult dog food (3 kg)\nSqueaky plush dog toy\nCosy dog hoodie", price: 3750, compare_price: 4150, badge: "Pet favourite", link: "/collections/pet-supplies", color: "mint" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const list = blocks.filter((b) => b.type === "bundle" && str(b.settings.title));
    if (!list.length) {
      if (!context.isPreview) return null;
      return (
        <Section settings={s}>
          <p className="rounded-pai border-2 border-dashed border-pai-border p-8 text-center text-sm opacity-70">Add “Bundle” blocks to show your bundle deals.</p>
        </Section>
      );
    }
    const slugs = list.map((b) => str(b.settings.product)).filter(Boolean);
    const products = slugs.length ? ((await context.data.getProducts({ slugs, limit: slugs.length }).catch(() => null))?.items ?? []) : [];
    const bySlug = new Map<string, SfProduct>(products.map((p) => [p.slug, p]));
    const cols = list.length === 1 ? "max-w-xl mx-auto" : list.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : list.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4";

    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Bundle deals"} style={backgroundStyle(s.background)}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        <ul className={`grid gap-5 md:gap-6 ${cols}`}>
          {list.map((b, i) => {
            const bs = b.settings;
            const product = bySlug.get(str(bs.product));
            const color = funColor(bs.color, i);
            const price = num(bs.price, 0) > 0 ? num(bs.price, 0) * 100 : (product?.price ?? 0);
            const compare = num(bs.compare_price, 0) > 0 ? num(bs.compare_price, 0) * 100 : (product?.compareAtPrice ?? 0);
            const save = compare > price && price > 0 ? compare - price : 0;
            const pct = save ? Math.round((save / compare) * 100) : 0;
            const image = str(bs.image) || product?.featuredImage?.url || "";
            const href = product ? product.url : resolveHref(context, bs.link, "/collections/all");
            const items = str(bs.items)
              .split(/\n+/)
              .map((x) => x.trim())
              .filter(Boolean);
            return (
              <li key={b.id} className="ph-lift relative flex flex-col overflow-hidden rounded-[30px] bg-pai-card ring-1 ring-pai-border transition-transform duration-300" style={{ "--ph-tone": color } as CSSProperties}>
                <div className="relative isolate aspect-[4/3] overflow-hidden" style={{ background: tint(color, 45) }}>
                  <Blob variant={i} color="white" className="absolute -bottom-10 -right-10 -z-10 size-40 opacity-60" />
                  <div className="absolute inset-4 overflow-hidden rounded-[22px] border-4 border-white shadow-md">
                    {image ? <img src={image} alt="" loading="lazy" className="size-full object-cover" /> : <Placeholder kind="product" className="size-full" />}
                  </div>
                  {str(bs.badge) ? <span className="ph-badge absolute left-6 top-6 -rotate-3 bg-white text-pai-fg shadow-sm">{str(bs.badge)}</span> : null}
                  {pct ? (
                    <span className="absolute right-5 top-5 grid size-16 rotate-12 place-items-center rounded-full border-4 border-white bg-pai-sale text-center font-heading text-sm font-bold leading-none text-white shadow-md">
                      <span>
                        Save
                        <br />
                        {pct}%
                      </span>
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <h3 className="flex items-start gap-2 font-heading text-xl font-bold leading-tight md:text-2xl">
                    <Package className="mt-1 size-5 shrink-0" style={{ color }} aria-hidden />
                    {str(bs.title)}
                  </h3>
                  {items.length ? (
                    <ul className="mt-4 space-y-2 text-sm font-semibold" aria-label="In the bundle">
                      {items.map((it) => (
                        <li key={it} className="flex items-start gap-2">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[#1f1f1f]" style={{ background: color }}>
                            <Check className="size-3" strokeWidth={3} aria-hidden />
                          </span>
                          {it}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-auto pt-5">
                    {price ? (
                      <p className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-heading text-2xl font-bold">{context.formatMoney(price)}</span>
                        {save ? <s className="text-sm opacity-50">{context.formatMoney(compare)}</s> : null}
                        {save ? <span className="text-sm font-bold text-pai-sale">You save {context.formatMoney(save)}</span> : null}
                      </p>
                    ) : null}
                    <ButtonLink href={href} variant="primary" block className="ph-btn-pop mt-4">
                      {str(s.button_label, "Get the bundle")}
                    </ButtonLink>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>
    );
  },
});
