import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Icon, Section, bool, cn, formatMoney, moneyOf, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { IMG } from "../images";
import { STRIDE_ICONS } from "../lib/icons";

/**
 * Performance feature callouts: a hero product image in the centre with numbered feature
 * callouts on the left and right (blocks). Pick a product to pull in its price and link.
 */
export const strideFeatureCallouts = defineSection({
  schema: {
    type: "stride-feature-callouts",
    name: "Feature callouts",
    category: "media",
    icon: "crosshair",
    description: "Product image in the centre with numbered tech callouts either side.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Engineered for speed" },
      { type: "text", id: "heading", label: "Heading", default: "Every gram earns its place" },
      { type: "textarea", id: "text", label: "Text", default: "" },
      { type: "product", id: "product", label: "Product", info: "Optional — adds its price and a buy button." },
      { type: "image", id: "image", label: "Image", default: IMG.shoeFlying, info: "A product cut-out on white works best." },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Lightweight running shoe floating mid-air" },
      { type: "checkbox", id: "blend", label: "Cut-out mode (blend a pure-white background into the page)", default: false, info: "Off: the image is shown as a circle framed by the accent ring." },
      { type: "text", id: "backdrop_word", label: "Backdrop word", default: "Velocity", info: "Giant outlined word behind the image. Leave empty to hide." },
      { type: "text", id: "button_label", label: "Button label", default: "Shop now" },
      { type: "url", id: "button_link", label: "Button link", info: "Defaults to the product page." },
      schemeField(),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "feature",
        name: "Feature",
        limit: 6,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "zap", options: STRIDE_ICONS },
          { type: "text", id: "title", label: "Title", default: "Responsive foam" },
          { type: "textarea", id: "text", label: "Text", default: "Springs back on every stride for more energy return." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Feature callouts",
        blocks: [
          { type: "feature", settings: { icon: "wind", title: "Breathable knit", text: "Engineered mesh keeps air moving through Dhaka humidity." } },
          { type: "feature", settings: { icon: "zap", title: "Responsive foam", text: "Springs back on every stride for more energy return." } },
          { type: "feature", settings: { icon: "shield-check", title: "Grippy outsole", text: "Rubber pods bite on wet roads and dusty tracks." } },
          { type: "feature", settings: { icon: "feather", title: "Featherweight", text: "Just 240 g in a men's size 9 — you'll forget it's there." } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const product = str(s.product) ? await context.data.getProduct(str(s.product)).catch(() => null) : null;
    const money = moneyOf(context);
    const features = blocks.filter((b) => b.type === "feature");
    const half = Math.ceil(features.length / 2);
    const left = features.slice(0, half);
    const right = features.slice(half);
    const image = str(s.image) || product?.featuredImage?.url || "";
    const href = resolveHref(context, s.button_link) || product?.url || "";
    const heading = str(s.heading);

    const Callout = ({ b, n, side }: { b: (typeof features)[number]; n: number; side: "left" | "right" }) => (
      <li className={cn("stride-callout relative flex gap-4", side === "left" && "lg:flex-row-reverse lg:text-right")}>
        <span className="stride-callout-num grid size-12 shrink-0 place-items-center border-2 border-current font-heading text-xl leading-none">{String(n).padStart(2, "0")}</span>
        <span className="min-w-0">
          <span className={cn("mb-1.5 flex items-center gap-2", side === "left" && "lg:flex-row-reverse")}>
            <Icon name={str(b.settings.icon, "zap")} className="size-5 shrink-0 text-pai-accent" />
            <span className="font-heading text-2xl uppercase leading-none">{str(b.settings.title)}</span>
          </span>
          {str(b.settings.text) ? <span className="block text-sm leading-relaxed opacity-70">{str(b.settings.text)}</span> : null}
        </span>
      </li>
    );

    return (
      <Section settings={s} ariaLabel={heading || "Features"} width="wide" className="overflow-hidden">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          {str(s.eyebrow) ? <p className="stride-kicker mb-3 justify-center">{str(s.eyebrow)}</p> : null}
          {heading ? <h2 className="pai-h1">{heading}</h2> : null}
          {str(s.text) ? <p className="mx-auto mt-4 max-w-xl opacity-75">{str(s.text)}</p> : null}
        </div>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,1.25fr)_1fr] lg:gap-8">
          <ol className="order-2 space-y-8 lg:order-1 lg:space-y-14">
            {left.map((b, i) => (
              <Callout key={b.id} b={b} n={i + 1} side="left" />
            ))}
          </ol>
          <div className="relative order-1 mx-auto w-full max-w-xl lg:order-2">
            {str(s.backdrop_word) ? (
              <span aria-hidden className="stride-outline pointer-events-none absolute inset-x-[-30%] top-1/2 -translate-y-1/2 select-none text-center font-heading text-[clamp(5rem,14vw,13rem)] uppercase leading-none opacity-20">
                {str(s.backdrop_word)}
              </span>
            ) : null}
            <div className="relative aspect-square">
              <span aria-hidden className={cn("stride-disc absolute rounded-full bg-pai-accent", bool(s.blend, false) ? "inset-[8%]" : "inset-[3%]")} />
              {image ? (
                <img
                  src={image}
                  alt={str(s.image_alt) || product?.title || ""}
                  loading="lazy"
                  decoding="async"
                  className={cn("absolute", bool(s.blend, false) ? "inset-0 size-full object-contain mix-blend-multiply" : "inset-[7%] size-[86%] rounded-full object-cover")}
                />
              ) : null}
            </div>
            {product || (str(s.button_label) && href) ? (
              <div className="relative mt-6 flex flex-wrap items-center justify-center gap-4">
                {product ? (
                  <p className="text-center">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] opacity-60">{product.title}</span>
                    <span className="font-heading text-3xl">{formatMoney(product.price, money.currency, money.display)}</span>
                  </p>
                ) : null}
                {str(s.button_label) && href ? (
                  <ButtonLink href={href} variant="primary" size="lg" className="stride-btn-arrow">
                    {str(s.button_label)}
                  </ButtonLink>
                ) : null}
              </div>
            ) : null}
          </div>
          <ol start={half + 1} className="order-3 space-y-8 lg:space-y-14">
            {right.map((b, i) => (
              <Callout key={b.id} b={b} n={half + i + 1} side="right" />
            ))}
          </ol>
        </div>
      </Section>
    );
  },
});
