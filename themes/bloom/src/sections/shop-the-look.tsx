/**
 * Shop the look: an editorial image with numbered hotspots, the products used in the look and an
 * "add the full look" button.
 */
import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { Price, PreviewNotice, SAMPLE_PRODUCTS, Section, SmartLink, bool, cn, moneyOf, num, paddingField, schemeField, str } from "@pai/theme-kit";
import { AddAllButton } from "../client/add-all";
import { Accent, Eyebrow, RATIO } from "./_bloom";
import { IMG } from "../images";

export const shopTheLook = defineSection({
  schema: {
    type: "shop-the-look",
    name: "Shop the look",
    category: "products",
    icon: "scan-face",
    description: "Editorial image with product hotspots and an “add the full look” button.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Get the look" },
      { type: "text", id: "heading", label: "Heading", default: "The *soft glam* edit" },
      { type: "textarea", id: "text", label: "Text", default: "Dewy base, rosy cheeks and a velvet lip — four products, ten minutes." },
      { type: "image", id: "image", label: "Image", default: IMG.makeupPortrait },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Model wearing soft glam makeup" },
      {
        type: "select",
        id: "image_ratio",
        label: "Image ratio",
        default: "portrait",
        options: [
          { value: "portrait", label: "Portrait" },
          { value: "square", label: "Square" },
          { value: "tall", label: "Tall" },
        ],
      },
      {
        type: "select",
        id: "image_position",
        label: "Image position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      { type: "checkbox", id: "show_add_all", label: "Show “Add the look” button", default: true },
      { type: "checkbox", id: "auto_fill", label: "Fill empty spots with newest products", default: true },
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "spot",
        name: "Product",
        limit: 6,
        settings: [
          { type: "product", id: "product", label: "Product" },
          { type: "range", id: "x", label: "Hotspot horizontal position", min: 0, max: 100, step: 1, unit: "%", default: 50 },
          { type: "range", id: "y", label: "Hotspot vertical position", min: 0, max: 100, step: 1, unit: "%", default: 50 },
          { type: "text", id: "note", label: "How it's used", default: "", info: "E.g. “Dabbed on the apples of the cheeks”." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Shop the look",
        blocks: [
          { type: "spot", settings: { x: 56, y: 38, note: "Swept across the cheekbones" } },
          { type: "spot", settings: { x: 50, y: 64, note: "Pressed on with a fingertip" } },
          { type: "spot", settings: { x: 40, y: 30, note: "Blended softly on the lids" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const spotsB = blocks.filter((b) => b.type === "spot");
    const chosen = await Promise.all(spotsB.map((b) => (str(b.settings.product) ? context.data.getProduct(str(b.settings.product)).catch(() => null) : Promise.resolve(null))));
    const missing = chosen.filter((p) => !p).length;
    let fillers: SfProduct[] = [];
    if (missing && bool(s.auto_fill, true)) {
      const used = new Set(chosen.filter(Boolean).map((p) => p!.id));
      fillers = await context.data
        .getProducts({ sort: "newest", limit: missing + used.size })
        .then((r) => r.items.filter((p) => !used.has(p.id)))
        .catch(() => []);
    }
    let fi = 0;
    let sample = false;
    const spots = spotsB
      .map((b, i) => {
        let p = chosen[i] ?? (bool(s.auto_fill, true) ? fillers[fi++] : undefined) ?? null;
        if (!p && context.isPreview) {
          p = SAMPLE_PRODUCTS[i % SAMPLE_PRODUCTS.length]!;
          sample = true;
        }
        return p ? { id: b.id, p, x: num(b.settings.x, 50), y: num(b.settings.y, 50), note: str(b.settings.note) } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
    if (!spots.length) return null;

    const money = moneyOf(context);
    const heading = str(s.heading);
    const image = str(s.image) || IMG.makeupPortrait;
    const ratio = RATIO[str(s.image_ratio, "portrait")] ?? RATIO.portrait;
    const total = spots.reduce((sum, x) => sum + x.p.price, 0);
    const group = `look-${spotsB[0]?.id ?? "x"}`;

    return (
      <Section settings={s} ariaLabel={heading.replace(/\*/g, "") || "Shop the look"}>
        {sample ? <PreviewNotice context={context}>Pick a product for each spot. Showing sample products.</PreviewNotice> : null}
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr] lg:gap-16">
          <figure className={cn("relative overflow-hidden rounded-[calc(var(--pai-radius)*1.6)] bg-pai-muted", ratio, s.image_position === "right" && "md:order-2")}>
            <img src={image} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
            {spots.map((x, i) => (
              <details key={x.id} name={group} className="bloom-spot group absolute z-10 open:z-20" style={{ left: `${Math.max(4, Math.min(96, x.x))}%`, top: `${Math.max(4, Math.min(96, x.y))}%` }}>
                <summary
                  aria-label={`${i + 1}. ${x.p.title}`}
                  className="grid size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer list-none place-items-center rounded-full bg-white/90 text-xs font-semibold text-neutral-900 shadow-lg ring-[6px] ring-white/35 backdrop-blur transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-white group-open:bg-pai-accent group-open:text-white [&::-webkit-details-marker]:hidden"
                >
                  {i + 1}
                </summary>
                <SmartLink
                  href={x.p.url}
                  className={cn("animate-pai-pop absolute flex w-52 items-center gap-3 rounded-2xl bg-white p-2 pr-3 text-left text-neutral-900 shadow-2xl", x.x > 50 ? "right-3" : "left-3", x.y < 50 ? "top-5" : "bottom-5")}
                >
                  {x.p.featuredImage ? <img src={x.p.featuredImage.url} alt="" className="size-12 shrink-0 rounded-xl object-cover" /> : null}
                  <span className="min-w-0">
                    <span className="pai-line-clamp-2 block text-xs font-semibold">{x.p.title}</span>
                    <Price price={x.p.price} compareAt={x.p.compareAtPrice} size="sm" {...money} />
                  </span>
                </SmartLink>
              </details>
            ))}
          </figure>
          <div>
            {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
            {heading ? (
              <h2 className="pai-h2">
                <Accent text={heading} />
              </h2>
            ) : null}
            {str(s.text) ? <p className="mt-4 max-w-md opacity-75">{str(s.text)}</p> : null}
            <ol className="mt-8 space-y-3">
              {spots.map((x, i) => (
                <li key={x.id}>
                  <SmartLink href={x.p.url} className="group flex items-center gap-4 rounded-pai bg-pai-card p-3 shadow-[var(--bloom-card-shadow)] transition hover:-translate-y-0.5">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-[calc(var(--pai-radius)*0.7)] bg-pai-muted">
                      {x.p.featuredImage ? <img src={x.p.featuredImage.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pai-accent">Step {i + 1}</span>
                      <span className="pai-line-clamp-2 block font-medium group-hover:underline group-hover:underline-offset-4">{x.p.title}</span>
                      {x.note ? <span className="block text-xs opacity-60">{x.note}</span> : null}
                    </span>
                    <Price price={x.p.price} compareAt={x.p.compareAtPrice} size="sm" className="shrink-0" {...money} />
                  </SmartLink>
                </li>
              ))}
            </ol>
            {bool(s.show_add_all, true) && !sample ? (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm opacity-70">
                  Full look · <Price price={total} size="sm" {...money} />
                </p>
                <AddAllButton
                  className="sm:!w-auto"
                  label="Add the look to bag"
                  items={spots
                    .filter((x) => x.p.available)
                    .map((x) => ({ productId: x.p.id, variantId: x.p.variants.find((v) => v.available)?.id ?? x.p.variants[0]?.id ?? null, title: x.p.title, imageUrl: x.p.featuredImage?.url ?? null, price: x.p.price, url: x.p.url }))}
                />
              </div>
            ) : null}
          </div>
        </div>
      </Section>
    );
  },
});
