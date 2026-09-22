import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { ButtonLink, Container, Placeholder, Rating, SmartLink, bool, cn, formatMoney, moneyOf, paddingField, str } from "@pai/theme-kit";
import { Check, Minus } from "lucide-react";

/** Parse "Label: value" lines into ordered pairs. */
export function parseSpecs(text: string): [string, string][] {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const i = line.indexOf(":");
      if (i < 1) return null;
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()] as [string, string];
    })
    .filter((x): x is [string, string] => !!x && !!x[0]);
}

export const IPHONE = "Display: 6.1″ Super Retina XDR, 120Hz\nChip: A17 Pro (3 nm)\nMain camera: 48MP · 3× telephoto\nBattery: Up to 23 h video\nStorage: 128 GB – 1 TB\nBuild: Titanium, IP68\nCharging: USB-C, MagSafe";
export const GALAXY = "Display: 6.8″ Dynamic AMOLED 2X, 120Hz\nChip: Snapdragon 8 Gen 3\nMain camera: 200MP · 5× telephoto\nBattery: 5000 mAh\nStorage: 256 GB – 1 TB\nBuild: Titanium, IP68\nCharging: 45W wired, S Pen included";
export const REDMI = "Display: 6.67″ AMOLED, 120Hz\nChip: Snapdragon 7s Gen 2\nMain camera: 200MP OIS\nBattery: 5100 mAh\nStorage: 256 GB\nBuild: Glass back, IP54\nCharging: 67W turbo";

export const voltSpecCompare = defineSection({
  schema: {
    type: "spec-compare",
    name: "Spec comparison",
    category: "products",
    icon: "table-2",
    description: "Side-by-side comparison table of 2–4 products with specs you type in.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Compare" },
      { type: "text", id: "heading", label: "Heading", default: "Find your flagship" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "Three of our best-selling phones, spec for spec. All with official warranty." },
      { type: "checkbox", id: "show_rating", label: "Show ratings", default: true },
      { type: "text", id: "button_label", label: "Button label", default: "View details" },
      paddingField("medium"),
    ],
    blocks: [
      {
        type: "product",
        name: "Product",
        limit: 4,
        settings: [
          { type: "product", id: "product", label: "Product" },
          { type: "text", id: "title", label: "Title override", info: "Used when no product is selected or to shorten the name." },
          { type: "text", id: "badge", label: "Badge", default: "" },
          { type: "checkbox", id: "highlight", label: "Highlight this column", default: false },
          { type: "textarea", id: "specs", label: "Specs", default: "Display: \nChip: \nCamera: \nBattery: ", info: "One per line as “Label: value”. Rows with the same label line up across products. Use “yes” / “no” for tick marks." },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Spec comparison",
        blocks: [
          { type: "product", settings: { product: "apple-iphone-15-pro", title: "iPhone 15 Pro", specs: IPHONE } },
          { type: "product", settings: { product: "samsung-galaxy-s24-ultra", title: "Galaxy S24 Ultra", badge: "Editor's pick", highlight: true, specs: GALAXY } },
          { type: "product", settings: { product: "xiaomi-redmi-note-13-pro", title: "Redmi Note 13 Pro", badge: "Best value", specs: REDMI } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const cols = (
      await Promise.all(
        blocks
          .filter((b) => b.type === "product")
          .slice(0, 4)
          .map(async (b) => {
            const slug = str(b.settings.product);
            const product: SfProduct | null = slug ? await context.data.getProduct(slug).catch(() => null) : null;
            const title = str(b.settings.title) || product?.title || "";
            return { id: b.id, product, title, badge: str(b.settings.badge), highlight: bool(b.settings.highlight), specs: new Map(parseSpecs(str(b.settings.specs))) };
          }),
      )
    ).filter((c) => c.title && (c.product || context.isPreview || c.specs.size));
    if (cols.length < 2 && !context.isPreview) return null;

    const labels: string[] = [];
    for (const c of cols) for (const k of c.specs.keys()) if (!labels.includes(k)) labels.push(k);
    const money = moneyOf(context);
    const pad = { none: "0", small: "0.5", medium: "1", large: "1.5" }[str(s.padding, "medium")] ?? "1";

    const cell = (v: string | undefined) => {
      if (!v) return <Minus className="mx-auto size-4 opacity-30" aria-label="Not available" />;
      if (/^(yes|✓|true)$/i.test(v)) return <Check className="mx-auto size-5 text-pai-primary" aria-label="Yes" />;
      if (/^(no|✗|false)$/i.test(v)) return <Minus className="mx-auto size-4 opacity-30" aria-label="No" />;
      return v;
    };

    return (
      <section aria-label={str(s.heading) || "Compare"} className="pai-section" style={{ ["--pai-section-pad" as string]: pad }}>
        <Container>
          <div className="mb-8 max-w-2xl">
            {str(s.eyebrow) ? <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-pai-primary">{str(s.eyebrow)}</p> : null}
            {str(s.heading) ? <h2 className="pai-h2 mt-2">{str(s.heading)}</h2> : null}
            {str(s.subheading) ? <p className="mt-3 opacity-70">{str(s.subheading)}</p> : null}
          </div>
          <div className="pai-no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
            <table className="volt-compare w-full min-w-[640px] table-fixed border-separate border-spacing-0 text-sm">
              <caption className="sr-only">{str(s.heading) || "Product comparison"}</caption>
              <colgroup>
                <col className="w-[22%] md:w-[20%]" />
                {cols.map((c) => (
                  <col key={c.id} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <td className="sticky left-0 z-10 bg-pai-bg" />
                  {cols.map((c) => {
                    const p = c.product;
                    const img = p?.featuredImage ?? p?.images[0];
                    return (
                      <th key={c.id} scope="col" className={cn("relative rounded-t-pai px-3 pb-5 pt-4 text-left align-top font-normal md:px-5", c.highlight && "volt-compare-hl bg-pai-muted")}>
                        {c.badge ? <span className="volt-chip absolute right-3 top-3 bg-pai-primary text-pai-primary-fg">{c.badge}</span> : null}
                        <div className="relative mx-auto mb-4 aspect-square w-full max-w-[180px] overflow-hidden rounded-pai bg-pai-muted">
                          {img ? <img src={img.url} alt={img.alt ?? c.title} loading="lazy" className="absolute inset-0 size-full object-cover" /> : <Placeholder kind="product" className="absolute inset-0" />}
                        </div>
                        {p?.vendor ? <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-pai-accent">{p.vendor}</p> : null}
                        <p className="font-heading text-base font-bold leading-tight md:text-lg">
                          {p ? (
                            <SmartLink href={p.url} className="hover:text-pai-primary">
                              {c.title}
                            </SmartLink>
                          ) : (
                            c.title
                          )}
                        </p>
                        {p && bool(s.show_rating, true) && p.rating.count > 0 ? <Rating value={p.rating.average} count={p.rating.count} size={12} className="mt-1" /> : null}
                        {p ? (
                          <p className="mt-2">
                            <span className="font-heading text-lg font-bold tabular-nums">{formatMoney(p.price, money.currency, money.display)}</span>
                            {p.compareAtPrice && p.compareAtPrice > p.price ? <s className="ml-2 text-xs opacity-50">{formatMoney(p.compareAtPrice, money.currency, money.display)}</s> : null}
                          </p>
                        ) : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {labels.map((label) => (
                  <tr key={label} className="group">
                    <th scope="row" className="sticky left-0 z-10 border-t border-pai-border bg-pai-bg py-3.5 pr-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
                      {label}
                    </th>
                    {cols.map((c) => (
                      <td key={c.id} className={cn("border-t border-pai-border px-3 py-3.5 text-center transition group-hover:bg-pai-muted/40 md:px-5", c.highlight && "bg-pai-muted")}>
                        {cell(c.specs.get(label))}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="sticky left-0 z-10 bg-pai-bg" />
                  {cols.map((c) => (
                    <td key={c.id} className={cn("rounded-b-pai px-3 pb-5 pt-4 md:px-5", c.highlight && "bg-pai-muted")}>
                      {c.product && str(s.button_label) ? (
                        <ButtonLink href={c.product.url} variant={c.highlight ? "primary" : "outline"} size="sm" block>
                          {str(s.button_label)}
                        </ButtonLink>
                      ) : null}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>
    );
  },
});
