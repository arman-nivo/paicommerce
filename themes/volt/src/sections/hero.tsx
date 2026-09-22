import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Container, SmartLink, bool, buttonFields, cn, formatMoney, moneyOf, readButton, resolveHref, str } from "@pai/theme-kit";
import { IMG } from "../images";

/**
 * Launch hero: a large glowing product stage (spec chips, "from" price, two CTAs) beside a stack
 * of promo tiles. If a product is picked, its price and link are used automatically.
 */
export const voltHero = defineSection({
  schema: {
    type: "volt-hero",
    name: "Launch hero",
    category: "hero",
    icon: "rocket",
    description: "Product launch stage with glow, spec chips and live price, plus stacked promo tiles.",
    settings: [
      { type: "product", id: "product", label: "Featured product", info: "Optional — pulls the price and link." },
      { type: "image", id: "image", label: "Image", default: IMG.phoneDark },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Flagship smartphone on a dark background" },
      { type: "text", id: "eyebrow", label: "Badge", default: "Just launched" },
      { type: "text", id: "heading", label: "Heading", default: "Pro power. Pocket size." },
      { type: "textarea", id: "text", label: "Text", default: "The latest flagships with official warranty, 0% EMI on select cards and same-day delivery in Dhaka." },
      { type: "text", id: "specs", label: "Spec chips", default: "A17 Pro chip, 48MP camera, Titanium build, USB-C", info: "Comma separated, up to 5." },
      { type: "text", id: "price_label", label: "Price label", default: "Starting at", info: "Shown with the featured product's price." },
      ...buttonFields("button", { label: "Buy now", link: "/collections/all", style: "primary" }),
      ...buttonFields("button2", { label: "Compare models", link: "/collections/all", style: "secondary" }, "Second button"),
      { type: "checkbox", id: "glow", label: "Show glow effect", default: true },
      {
        type: "select",
        id: "height",
        label: "Height",
        default: "large",
        options: [
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
    ],
    blocks: [
      {
        type: "promo",
        name: "Promo tile",
        limit: 3,
        settings: [
          { type: "image", id: "image", label: "Image", default: IMG.headphonesDark },
          { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
          { type: "text", id: "eyebrow", label: "Badge", default: "Up to 20% off" },
          { type: "text", id: "heading", label: "Heading", default: "Noise-cancelling audio" },
          { type: "text", id: "link_label", label: "Link label", default: "Shop audio" },
          { type: "url", id: "link", label: "Link", default: "/collections/all" },
        ],
      },
    ],
    maxBlocks: 3,
    presets: [
      {
        name: "Launch hero",
        blocks: [
          { type: "promo" },
          { type: "promo", settings: { image: IMG.gamingPc, eyebrow: "New", heading: "Gaming rigs & GPUs", link_label: "Shop gaming" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const product = str(s.product) ? await context.data.getProduct(str(s.product)).catch(() => null) : null;
    const money = moneyOf(context);
    const image = str(s.image) || product?.featuredImage?.url || "";
    const specs = str(s.specs)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 5);
    const b1 = readButton(context, s, "button");
    const b2 = readButton(context, s, "button2");
    const href1 = b1 ? (product && !str(s.button_link) ? product.url : b1.href) : "";
    const tall = s.height !== "medium";
    const promos = blocks.filter((b) => b.type === "promo");

    return (
      <section aria-label={str(s.heading) || "Featured"} className="volt-hero pt-4 md:pt-6">
        <Container className={cn("grid gap-4", promos.length && "lg:grid-cols-[2fr_1fr]")}>
          <div
            className={cn(
              "relative isolate grid overflow-hidden rounded-[calc(var(--pai-radius)*1.6)] border border-pai-border bg-[radial-gradient(120%_120%_at_85%_40%,color-mix(in_srgb,var(--pai-primary)_16%,transparent),transparent_55%),linear-gradient(160deg,var(--pai-muted),var(--pai-bg))] md:grid-cols-[1.1fr_1fr]",
              tall ? "md:min-h-[560px]" : "md:min-h-[440px]",
            )}
          >
            {bool(s.glow, true) ? <div aria-hidden className="volt-glow pointer-events-none absolute right-[8%] top-1/2 -z-10 size-[26rem] -translate-y-1/2 rounded-full bg-pai-primary/25 blur-[90px]" /> : null}
            <div className="relative z-10 flex flex-col justify-center gap-5 p-6 sm:p-10 lg:p-14">
              {str(s.eyebrow) ? (
                <p className="volt-chip w-fit border border-pai-primary/40 bg-pai-primary/10 text-pai-primary">
                  <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-pai-primary" aria-hidden />
                  {str(s.eyebrow)}
                </p>
              ) : null}
              {str(s.heading) ? <h1 className="pai-h1 volt-display [text-wrap:balance]">{str(s.heading)}</h1> : null}
              {str(s.text) ? <p className="max-w-md text-base opacity-70 md:text-lg">{str(s.text)}</p> : null}
              {specs.length ? (
                <ul className="flex flex-wrap gap-2" aria-label="Key specs">
                  {specs.map((x) => (
                    <li key={x} className="rounded-full border border-pai-border bg-pai-bg/50 px-3 py-1 font-mono text-[11px] uppercase tracking-wider opacity-85 backdrop-blur">
                      {x}
                    </li>
                  ))}
                </ul>
              ) : null}
              {product ? (
                <p className="text-sm opacity-70">
                  {str(s.price_label, "Starting at")}{" "}
                  <span className="font-heading text-2xl font-bold text-pai-fg opacity-100">{formatMoney(product.priceMin || product.price, money.currency, money.display)}</span>
                </p>
              ) : null}
              <div className="mt-1 flex flex-wrap gap-3">
                {b1 ? (
                  <ButtonLink href={href1} variant={b1.variant} size="lg" className="volt-btn-glow">
                    {b1.label}
                  </ButtonLink>
                ) : null}
                {b2 ? (
                  <ButtonLink href={b2.href} variant={b2.variant} size="lg">
                    {b2.label}
                  </ButtonLink>
                ) : null}
              </div>
            </div>
            <div className="relative min-h-[280px] md:min-h-0">
              {image ? (
                <img
                  src={image}
                  alt={str(s.image_alt)}
                  fetchPriority="high"
                  className="absolute inset-0 size-full object-cover [mask-image:linear-gradient(90deg,transparent,#000_30%)] max-md:[mask-image:linear-gradient(0deg,transparent,#000_30%)]"
                />
              ) : null}
            </div>
          </div>
          {promos.length ? (
            <div className={cn("grid gap-3 md:gap-4", promos.length > 1 && "grid-cols-2 lg:grid-cols-1")}>
              {promos.map((b, i) => {
                const bs = b.settings;
                const href = resolveHref(context, bs.link, "/collections/all");
                return (
                  <SmartLink
                    key={b.id}
                    href={href}
                    className="group relative isolate flex min-h-[170px] flex-col justify-end overflow-hidden rounded-[calc(var(--pai-radius)*1.6)] border border-pai-border p-4 transition hover:border-pai-primary/60 md:min-h-[200px] md:p-6"
                  >
                    {str(bs.image) ? (
                      <img src={str(bs.image)} alt={str(bs.image_alt)} loading={i === 0 ? "eager" : "lazy"} className="absolute inset-0 -z-20 size-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : null}
                    <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    {str(bs.eyebrow) ? <span className="volt-chip mb-2 w-fit bg-pai-primary text-pai-primary-fg">{str(bs.eyebrow)}</span> : null}
                    <span className="font-heading text-base font-bold leading-tight text-white sm:text-xl md:text-2xl">{str(bs.heading)}</span>
                    {str(bs.link_label) ? <span className="mt-2 text-sm font-semibold text-pai-primary">{str(bs.link_label)} →</span> : null}
                  </SmartLink>
                );
              })}
            </div>
          ) : null}
        </Container>
      </section>
    );
  },
});
