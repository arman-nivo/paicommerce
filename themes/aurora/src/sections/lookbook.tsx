import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { Price, PreviewNotice, SAMPLE_PRODUCTS, Section, SectionHeading, SmartLink, bool, cn, headingFields, moneyOf, num, paddingField, schemeField, str } from "@pai/theme-kit";
import { IMG } from "../images";

type Spot = { id: string; n: number; x: number; y: number; label: string; product: SfProduct };

const RATIOS: Record<string, string> = {
  portrait: "aspect-[4/5]",
  tall: "aspect-[2/3]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
};

function HotspotCard({ spot, money }: { spot: Spot; money: ReturnType<typeof moneyOf> }) {
  const p = spot.product;
  const img = p.featuredImage ?? p.images[0] ?? null;
  return (
    <SmartLink href={p.url} className="flex w-40 items-center gap-3 rounded-pai bg-pai-bg p-2.5 pr-3 sm:w-60 sm:pr-4 text-left text-pai-fg shadow-2xl ring-1 ring-black/5 transition hover:ring-pai-fg/30">
      <span className="relative hidden aspect-[4/5] w-16 shrink-0 overflow-hidden sm:block rounded-[min(var(--pai-radius),6px)] bg-pai-muted">
        {img ? <img src={img.url} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" /> : null}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="pai-line-clamp-2 text-sm font-medium leading-snug">{spot.label || p.title}</span>
        <Price price={p.price} compareAt={p.compareAtPrice} priceMax={p.priceMax} size="sm" {...money} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-60">View product →</span>
      </span>
    </SmartLink>
  );
}

export const lookbook = defineSection({
  schema: {
    type: "lookbook",
    name: "Lookbook",
    category: "media",
    icon: "scan-search",
    description: "A large image with shoppable hotspots that link to products.",
    settings: [
      ...headingFields({ eyebrow: "Lookbook", heading: "Shop the look", subheading: "Tap the markers to discover each piece.", align: "left" }),
      { type: "image", id: "image", label: "Image", default: IMG.lookbook },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
      {
        type: "select",
        id: "image_ratio",
        label: "Image ratio",
        default: "portrait",
        options: [
          { value: "portrait", label: "Portrait (4:5)" },
          { value: "tall", label: "Tall (2:3)" },
          { value: "square", label: "Square" },
          { value: "landscape", label: "Landscape (4:3)" },
          { value: "wide", label: "Wide (16:9)" },
        ],
      },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "split",
        options: [
          { value: "split", label: "Image with product list" },
          { value: "split_reverse", label: "Product list, then image" },
          { value: "full", label: "Image only" },
        ],
      },
      { type: "checkbox", id: "show_numbers", label: "Number the hotspots", default: true },
      { type: "checkbox", id: "auto_fill", label: "Fill empty hotspots with newest products", default: true, info: "Hotspots without a product show your newest products instead of being hidden." },
      schemeField("default"),
      paddingField("medium"),
    ],
    blocks: [
      {
        type: "hotspot",
        name: "Hotspot",
        limit: 8,
        settings: [
          { type: "product", id: "product", label: "Product" },
          { type: "range", id: "x", label: "Horizontal position", min: 0, max: 100, step: 1, unit: "%", default: 50 },
          { type: "range", id: "y", label: "Vertical position", min: 0, max: 100, step: 1, unit: "%", default: 50 },
          { type: "text", id: "label", label: "Label", info: "Optional — defaults to the product title." },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Lookbook",
        blocks: [
          { type: "hotspot", settings: { x: 46, y: 28 } },
          { type: "hotspot", settings: { x: 58, y: 55 } },
          { type: "hotspot", settings: { x: 40, y: 82 } },
        ],
      },
    ],
  },
  component: async ({ id, settings: s, blocks, context }) => {
    const hotspots = blocks.filter((b) => b.type === "hotspot");
    const autoFill = bool(s.auto_fill, true);

    // Resolve every chosen product server-side (in parallel).
    const chosen = await Promise.all(
      hotspots.map((b) => {
        const slug = str(b.settings.product);
        return slug ? context.data.getProduct(slug).catch(() => null) : Promise.resolve(null);
      }),
    );
    let fillers: SfProduct[] = [];
    const missing = chosen.filter((p) => !p).length;
    if (missing && autoFill) {
      try {
        const used = new Set(chosen.filter(Boolean).map((p) => p!.id));
        fillers = (await context.data.getProducts({ sort: "newest", limit: missing + used.size })).items.filter((p) => !used.has(p.id));
      } catch {
        fillers = [];
      }
    }
    let sample = false;
    let fi = 0;
    let si = 0;
    const spots: Spot[] = [];
    hotspots.forEach((b, i) => {
      let product = chosen[i] ?? (autoFill ? fillers[fi++] : undefined) ?? null;
      if (!product && context.isPreview) {
        product = SAMPLE_PRODUCTS[si++ % SAMPLE_PRODUCTS.length]!;
        sample = true;
      }
      if (!product) return;
      spots.push({
        id: b.id,
        n: spots.length + 1,
        x: Math.max(3, Math.min(97, num(b.settings.x, 50))),
        y: Math.max(3, Math.min(97, num(b.settings.y, 50))),
        label: str(b.settings.label),
        product,
      });
    });

    const image = str(s.image) || (context.isPreview ? IMG.lookbook : "");
    if (!image && !spots.length) return null;

    const money = moneyOf(context);
    const layout = str(s.layout, "split");
    const numbers = bool(s.show_numbers, true);
    const ratio = RATIOS[str(s.image_ratio, "portrait")] ?? RATIOS.portrait;
    const heading = str(s.heading);
    const group = `lookbook-${id}`;

    const figure = (
      <figure className={cn("relative overflow-hidden rounded-pai bg-pai-muted", ratio)}>
        {image ? <img src={image} alt={str(s.image_alt) || heading || "Lookbook"} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" /> : null}
        {spots.map((spot) => {
          const right = spot.x > 50;
          const below = spot.y < 50;
          return (
            <details
              key={spot.id}
              name={group}
              className="aurora-hotspot group absolute z-10 open:z-20"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              <summary
                className="relative grid size-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer list-none place-items-center rounded-full bg-white text-xs font-semibold text-neutral-900 shadow-lg ring-4 ring-white/40 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white group-open:bg-neutral-900 group-open:text-white [&::-webkit-details-marker]:hidden"
                aria-label={`${numbers ? `${spot.n}. ` : ""}${spot.label || spot.product.title}`}
              >
                <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-white/60 group-open:hidden motion-reduce:hidden" />
                <span aria-hidden className="relative">{numbers ? spot.n : "+"}</span>
              </summary>
              <div className={cn("animate-pai-pop absolute", right ? "right-0 sm:right-2" : "left-0 sm:left-2", below ? "top-6" : "bottom-6")}>
                <HotspotCard spot={spot} money={money} />
              </div>
            </details>
          );
        })}
        {!spots.length && context.isPreview ? (
          <figcaption className="absolute inset-x-4 bottom-4 rounded-pai bg-pai-bg/90 p-3 text-center text-xs">Add hotspot blocks and pick products to make this image shoppable.</figcaption>
        ) : null}
      </figure>
    );

    if (layout === "full") {
      return (
        <Section settings={s} ariaLabel={heading || "Lookbook"}>
          {sample ? <PreviewNotice context={context}>Pick a product for each hotspot. Showing sample products.</PreviewNotice> : null}
          <SectionHeading eyebrow={str(s.eyebrow)} title={heading} subtitle={str(s.subheading)} align={s.heading_align === "center" ? "center" : "left"} />
          {figure}
        </Section>
      );
    }

    return (
      <Section settings={s} ariaLabel={heading || "Lookbook"}>
        {sample ? <PreviewNotice context={context}>Pick a product for each hotspot. Showing sample products.</PreviewNotice> : null}
        <div className="grid items-center gap-10 md:grid-cols-[1.25fr_1fr] lg:gap-20">
          <div className={cn(layout === "split_reverse" && "md:order-2")}>{figure}</div>
          <div className="flex flex-col">
            {str(s.eyebrow) ? <p className="pai-eyebrow mb-3">{str(s.eyebrow)}</p> : null}
            {heading ? <h2 className="pai-h2">{heading}</h2> : null}
            {str(s.subheading) ? <p className="mt-4 max-w-md opacity-75">{str(s.subheading)}</p> : null}
            {spots.length ? (
              <ol className="mt-8 divide-y divide-pai-border border-y border-pai-border">
                {spots.map((spot) => {
                  const p = spot.product;
                  const img = p.featuredImage ?? p.images[0] ?? null;
                  return (
                    <li key={spot.id}>
                      <SmartLink href={p.url} className="group flex items-center gap-4 py-4">
                        {numbers ? <span className="w-6 shrink-0 font-heading text-lg opacity-50">{String(spot.n).padStart(2, "0")}</span> : null}
                        <span className="relative block aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-[min(var(--pai-radius),6px)] bg-pai-muted">
                          {img ? <img src={img.url} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="pai-line-clamp-2 block text-[0.95rem] font-medium group-hover:underline group-hover:underline-offset-4">{spot.label || p.title}</span>
                          {p.vendor ? <span className="block text-xs opacity-60">{p.vendor}</span> : null}
                        </span>
                        <Price price={p.price} compareAt={p.compareAtPrice} priceMax={p.priceMax} size="sm" className="shrink-0 justify-end" {...money} />
                      </SmartLink>
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </div>
        </div>
      </Section>
    );
  },
});
