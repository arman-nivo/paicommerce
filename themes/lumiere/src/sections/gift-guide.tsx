/**
 * Gift guide: curated edits by recipient, occasion or budget ("For her", "Under ৳25,000",
 * "Bridal"). Each guide pulls pieces from a collection → tag → price range → best sellers and is
 * shown as accessible tabs, or as a row of image tiles.
 */
import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { Link, PreviewNotice, ProductCard, SAMPLE_PRODUCTS, Section, SmartLink, cn, headingFields, num, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { GuideTabs } from "../client/guide-tabs";
import { Heading, loadProducts } from "./_lumiere";
import { IMG } from "../images";

export const giftGuide = defineSection({
  schema: {
    type: "gift-guide",
    name: "Gift guide",
    category: "products",
    icon: "gift",
    description: "Edits by recipient, occasion or budget — as tabs with products, or as image tiles.",
    settings: [
      ...headingFields({ eyebrow: "The gift guide", heading: "Something to be kept forever", subheading: "Chosen by our advisers, wrapped by hand and delivered fully insured.", align: "center" }),
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "tabs",
        options: [
          { value: "tabs", label: "Tabs with pieces" },
          { value: "tiles", label: "Image tiles" },
        ],
      },
      { type: "range", id: "limit", label: "Pieces per guide (tabs)", min: 2, max: 6, step: 1, default: 3 },
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "guide",
        name: "Guide",
        limit: 6,
        settings: [
          { type: "text", id: "label", label: "Label", default: "For her" },
          { type: "text", id: "hint", label: "Short hint", default: "Pearls, pendants & keepsakes" },
          { type: "image", id: "image", label: "Image", default: IMG.pearlEarring },
          { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
          { type: "textarea", id: "text", label: "Adviser's note", default: "Pieces she'll wear every day — and hand down one day." },
          { type: "header", label: "Products (first match wins)" },
          { type: "collection", id: "collection", label: "Collection" },
          { type: "text", id: "tag", label: "Products tagged" },
          { type: "number", id: "min_price", label: "Minimum price (৳)", min: 0 },
          { type: "number", id: "max_price", label: "Maximum price (৳)", min: 0, info: "E.g. 25000 for an “Under ৳25,000” guide." },
          { type: "text", id: "link_label", label: "Link label", default: "View the edit" },
          { type: "url", id: "link", label: "Link (optional)", info: "Defaults to the collection, tag search or price-filtered catalogue." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Gift guide",
        blocks: [
          { type: "guide", settings: { label: "For her", hint: "Pearls & pendants", tag: "gift", image: IMG.pearlEarring } },
          { type: "guide", settings: { label: "Under ৳25,000", hint: "Thoughtful, not extravagant", max_price: 25000, image: IMG.hoopsShadow } },
          { type: "guide", settings: { label: "Bridal", hint: "For the holud & the wedding", image: IMG.bride } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const guides = blocks.filter((b) => b.type === "guide");
    if (!guides.length) return null;
    const tiles = s.layout === "tiles";
    const limit = Math.max(2, Math.min(6, num(s.limit, 3)));
    let sample = false;
    const resolved = await Promise.all(
      guides.map(async (b) => {
        let products: SfProduct[] = [];
        if (!tiles) {
          products = (await loadProducts(context, b.settings, limit)).products;
          // Top up a thin edit with best sellers so the row never looks half-empty.
          if (products.length && products.length < limit) {
            const seen = new Set(products.map((p) => p.id));
            const more = await context.data.getProducts({ sort: "best-selling", limit: limit * 2 }).then((r) => r.items).catch(() => [] as SfProduct[]);
            const min = num(b.settings.min_price, 0) * 100;
            const max = num(b.settings.max_price, 0) * 100;
            products = [...products, ...more.filter((p) => !seen.has(p.id) && (!min || p.price >= min) && (!max || p.price <= max))].slice(0, limit);
          }
          if (!products.length && context.isPreview) {
            products = SAMPLE_PRODUCTS.slice(0, limit);
            sample = true;
          }
        }
        const bs = b.settings;
        const min = num(bs.min_price, 0);
        const max = num(bs.max_price, 0);
        const auto = str(bs.collection)
          ? `/collections/${str(bs.collection)}`
          : str(bs.tag)
            ? `/search?q=${encodeURIComponent(str(bs.tag))}`
            : min || max
              ? `/collections/all?${[min ? `min=${min}` : "", max ? `max=${max}` : ""].filter(Boolean).join("&")}`
              : "/collections/all";
        const href = resolveHref(context, bs.link) || context.url(auto);
        return { b, products, href };
      }),
    );
    const heading = str(s.heading);

    if (tiles) {
      return (
        <Section settings={s} ariaLabel={heading || "Gift guide"}>
          <Heading eyebrow={str(s.eyebrow)} heading={heading} text={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
          <ul className={cn("grid gap-5 sm:grid-cols-2", resolved.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
            {resolved.map(({ b, href }) => (
              <li key={b.id}>
                <Link href={href} className="group relative block aspect-[3/4] overflow-hidden bg-[#111] text-white">
                  {str(b.settings.image) ? <img src={str(b.settings.image)} alt={str(b.settings.image_alt)} loading="lazy" className="lumiere-slowzoom absolute inset-0 size-full object-cover opacity-85 transition duration-[1400ms] group-hover:opacity-100" /> : null}
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span aria-hidden className="absolute inset-3 border border-white/25 transition group-hover:border-[var(--lumiere-gold)]" />
                  <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-8 text-center">
                    {str(b.settings.hint) ? <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/70">{str(b.settings.hint)}</span> : null}
                    <span className="font-heading text-3xl leading-tight">{str(b.settings.label)}</span>
                    <span className="mt-2 text-[0.62rem] uppercase tracking-[0.28em] text-[var(--lumiere-gold)]">{str(b.settings.link_label, "View the edit")}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      );
    }

    const tabs = resolved.map(({ b, products, href }) => {
      const bs = b.settings;
      const image = str(bs.image) || products[0]?.featuredImage?.url || "";
      return {
        id: b.id,
        label: str(bs.label, "Gift"),
        hint: str(bs.hint),
        panel: (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-12">
            <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden bg-[#111] text-white">
              {image ? <img src={image} alt={str(bs.image_alt)} loading="lazy" className="lumiere-slowzoom absolute inset-0 size-full object-cover opacity-80" /> : null}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="relative p-8 md:p-10">
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--lumiere-gold)]">Adviser&apos;s note</p>
                {str(bs.text) ? <p className="mt-3 max-w-sm font-heading text-2xl leading-snug">{str(bs.text)}</p> : null}
                <SmartLink href={href} className="mt-6 inline-block border-b border-white/60 pb-1 text-[0.64rem] uppercase tracking-[0.28em] transition hover:border-[var(--lumiere-gold)] hover:text-[var(--lumiere-gold)]">
                  {str(bs.link_label, "View the edit")}
                </SmartLink>
              </div>
            </div>
            {products.length ? (
              <div className={cn("grid grid-cols-2 gap-x-5 gap-y-10", limit >= 3 && "md:grid-cols-3")}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} context={context} />
                ))}
              </div>
            ) : (
              <p className="self-center text-center font-heading text-xl opacity-60">New pieces for this edit are arriving soon.</p>
            )}
          </div>
        ),
      };
    });

    return (
      <Section settings={s} ariaLabel={heading || "Gift guide"} className="lumiere-gift-guide">
        {sample ? <PreviewNotice context={context}>Link each guide to a collection, tag or price range. Showing sample products.</PreviewNotice> : null}
        <Heading eyebrow={str(s.eyebrow)} heading={heading} text={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        <GuideTabs tabs={tabs} label={heading || "Gift guide"} />
      </Section>
    );
  },
});
