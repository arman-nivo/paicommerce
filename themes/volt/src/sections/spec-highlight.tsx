import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Container, ICON_OPTIONS, Icon, bool, cn, formatMoney, moneyOf, paddingField, readButton, buttonFields, str } from "@pai/theme-kit";
import { IMG } from "../images";

const TECH_ICONS = [
  { value: "cpu", label: "Chip / CPU" },
  { value: "camera", label: "Camera" },
  { value: "battery-charging", label: "Battery" },
  { value: "monitor", label: "Display" },
  { value: "smartphone", label: "Phone" },
  { value: "headphones", label: "Audio" },
  { value: "wifi", label: "Wireless" },
  { value: "hard-drive", label: "Storage" },
  { value: "memory-stick", label: "Memory" },
  { value: "gauge", label: "Performance" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "droplets", label: "Water resistance" },
  { value: "weight", label: "Weight" },
  { value: "fan", label: "Cooling" },
  ...ICON_OPTIONS,
];

export const voltSpecHighlight = defineSection({
  schema: {
    type: "spec-highlight",
    name: "Tech specs highlight",
    category: "products",
    icon: "cpu",
    description: "Hero-sized product shot with big spec numbers, a live price and buy buttons.",
    settings: [
      { type: "product", id: "product", label: "Product", info: "Pulls the price, link and image (unless you set one below)." },
      { type: "image", id: "image", label: "Image", default: IMG.headphonesDark },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Over-ear noise-cancelling headphones" },
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
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Spotlight" },
      { type: "text", id: "heading", label: "Heading", default: "Silence, engineered." },
      { type: "textarea", id: "text", label: "Text", default: "Industry-leading noise cancellation with eight microphones, 30-hour battery and multipoint pairing — tuned for long flights and longer workdays." },
      ...buttonFields("button", { label: "Buy now", link: "", style: "primary" }),
      { type: "checkbox", id: "show_price", label: "Show product price", default: true },
      paddingField("medium"),
    ],
    blocks: [
      {
        type: "spec",
        name: "Spec",
        limit: 6,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "cpu", options: TECH_ICONS },
          { type: "text", id: "value", label: "Value", default: "30h" },
          { type: "text", id: "label", label: "Label", default: "Battery life" },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Tech specs highlight",
        settings: { product: "sony-wh-1000xm5-noise-cancelling-headphones" },
        blocks: [
          { type: "spec", settings: { icon: "headphones", value: "8 mics", label: "Adaptive ANC" } },
          { type: "spec", settings: { icon: "battery-charging", value: "30h", label: "Battery life" } },
          { type: "spec", settings: { icon: "zap", value: "3 min", label: "= 3h playback" } },
          { type: "spec", settings: { icon: "bluetooth", value: "2×", label: "Multipoint pairing" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const product = str(s.product) ? await context.data.getProduct(str(s.product)).catch(() => null) : null;
    const image = str(s.image) || product?.featuredImage?.url || "";
    const btn = readButton(context, s, "button");
    const href = btn ? (str(s.button_link) ? btn.href : product?.url ?? btn.href) : "";
    const money = moneyOf(context);
    const right = s.image_position === "right";
    const specs = blocks.filter((b) => b.type === "spec");
    const pad = { none: "0", small: "0.5", medium: "1", large: "1.5" }[str(s.padding, "medium")] ?? "1";

    return (
      <section aria-label={str(s.heading) || "Spotlight"} className="pai-section" style={{ ["--pai-section-pad" as string]: pad }}>
        <Container>
          <div className="relative isolate grid items-center gap-8 overflow-hidden rounded-[calc(var(--pai-radius)*1.6)] border border-pai-border bg-pai-muted/50 p-4 md:grid-cols-2 md:gap-12 md:p-6 lg:p-8">
            <div aria-hidden className={cn("pointer-events-none absolute top-1/2 -z-10 size-[30rem] -translate-y-1/2 rounded-full bg-pai-accent/15 blur-[100px]", right ? "right-0" : "left-0")} />
            <div className={cn("relative aspect-square overflow-hidden rounded-pai bg-pai-bg md:aspect-[4/5]", right && "md:order-2")}>
              {image ? <img src={image} alt={str(s.image_alt) || product?.title || ""} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" /> : null}
              {product?.vendor ? <span className="volt-chip absolute left-4 top-4 bg-black/70 text-white backdrop-blur">{product.vendor}</span> : null}
            </div>
            <div className="flex flex-col gap-5 py-2 md:py-6 md:pr-4">
              {str(s.eyebrow) ? <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-pai-accent">{str(s.eyebrow)}</p> : null}
              {str(s.heading) ? <h2 className="pai-h2 volt-display [text-wrap:balance]">{str(s.heading)}</h2> : null}
              {str(s.text) ? <p className="max-w-lg opacity-70">{str(s.text)}</p> : null}
              {specs.length ? (
                <dl className="grid grid-cols-2 gap-3 pt-2">
                  {specs.map((b) => (
                    <div key={b.id} className="volt-spec flex flex-col rounded-pai border border-pai-border bg-pai-bg/60 p-4">
                      <Icon name={str(b.settings.icon, "cpu")} className="mb-3 size-5 text-pai-primary" />
                      <dt className="order-last mt-1.5 text-xs uppercase tracking-wider opacity-60">{str(b.settings.label)}</dt>
                      <dd className="font-heading text-2xl font-bold leading-none tabular-nums md:text-3xl">{str(b.settings.value)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <div className="flex flex-wrap items-center gap-5 pt-2">
                {product && bool(s.show_price, true) ? (
                  <p>
                    <span className="block text-xs uppercase tracking-wider opacity-60">Price</span>
                    <span className="font-heading text-2xl font-bold tabular-nums">{formatMoney(product.price, money.currency, money.display)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price ? (
                      <s className="ml-2 text-sm opacity-50">{formatMoney(product.compareAtPrice, money.currency, money.display)}</s>
                    ) : null}
                  </p>
                ) : null}
                {btn && href ? (
                  <ButtonLink href={href} variant={btn.variant} size="lg" className="volt-btn-glow">
                    {btn.label}
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  },
});
