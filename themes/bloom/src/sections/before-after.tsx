/**
 * Before/after comparison slider with results stats (e.g. "92% saw brighter skin").
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Price, Section, SmartLink, buttonFields, cn, moneyOf, num, paddingField, readButton, schemeField, str } from "@pai/theme-kit";
import { CompareSlider } from "../client/compare-slider";
import { Accent, Eyebrow, RATIO } from "./_bloom";
import { IMG } from "../images";

export const beforeAfter = defineSection({
  schema: {
    type: "before-after",
    name: "Before / after",
    category: "media",
    icon: "columns-2",
    description: "Drag-to-compare images with results and a call to action.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Real results" },
      { type: "text", id: "heading", label: "Heading", default: "Four weeks to *brighter* skin" },
      { type: "textarea", id: "text", label: "Text", default: "Our Vitamin C Brightening Serum, used morning and night with SPF. Results from customers in our 28-day glow challenge." },
      { type: "image", id: "before_image", label: "Before image", default: IMG.heroPortrait },
      { type: "image", id: "after_image", label: "After image", default: IMG.heroPortrait },
      {
        type: "select",
        id: "before_filter",
        label: "Before image treatment",
        default: "none",
        info: "“Dull” is for illustrative demos only — use real, unedited customer photos for results claims.",
        options: [
          { value: "none", label: "None (use real photos)" },
          { value: "dull", label: "Dull & uneven (illustration)" },
        ],
      },
      { type: "text", id: "before_label", label: "Before label", default: "Day 1" },
      { type: "text", id: "after_label", label: "After label", default: "Day 28" },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Customer's skin" },
      { type: "range", id: "start", label: "Initial divider position", min: 10, max: 90, step: 5, unit: "%", default: 50 },
      {
        type: "select",
        id: "ratio",
        label: "Image ratio",
        default: "portrait",
        options: [
          { value: "square", label: "Square" },
          { value: "portrait", label: "Portrait" },
          { value: "landscape", label: "Landscape" },
        ],
      },
      {
        type: "select",
        id: "image_position",
        label: "Slider position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      { type: "text", id: "disclaimer", label: "Footnote", default: "Illustrative images. Self-assessment by 60 customers after 28 days; individual results vary." },
      { type: "product", id: "product", label: "Featured product", info: "Shown as a small card; the button links to it." },
      ...buttonFields("button", { label: "Shop the serum", link: "/collections/all", style: "primary" }),
      schemeField("muted"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "stat",
        name: "Result",
        limit: 4,
        settings: [
          { type: "text", id: "value", label: "Value", default: "92%" },
          { type: "text", id: "label", label: "Label", default: "saw brighter, more even skin" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Before / after",
        blocks: [
          { type: "stat", settings: { value: "92%", label: "saw brighter, more even skin" } },
          { type: "stat", settings: { value: "87%", label: "noticed faded dark spots" } },
          { type: "stat", settings: { value: "4.8★", label: "average rating from 2,300 reviews" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const before = str(s.before_image);
    const after = str(s.after_image);
    if ((!before || !after) && !context.isPreview) return null;
    const heading = str(s.heading);
    const product = str(s.product) ? await context.data.getProduct(str(s.product)).catch(() => null) : null;
    const b0 = readButton(context, s, "button");
    const btn = b0 && product ? { ...b0, href: product.url } : b0;
    const money = moneyOf(context);
    const stats = blocks.filter((b) => b.type === "stat");
    const alt = str(s.image_alt, "Comparison");
    return (
      <Section settings={s} ariaLabel={heading.replace(/\*/g, "") || "Before and after"}>
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-20">
          <div className={cn("mx-auto w-full max-w-[560px]", s.image_position === "right" && "md:order-2")}>
            <CompareSlider
              before={before || IMG.heroPortrait}
              after={after || IMG.heroPortrait}
              beforeAlt={`${alt} — ${str(s.before_label, "before")}`}
              afterAlt={`${alt} — ${str(s.after_label, "after")}`}
              beforeLabel={str(s.before_label)}
              afterLabel={str(s.after_label)}
              start={num(s.start, 50)}
              ratio={RATIO[str(s.ratio, "portrait")] ?? RATIO.portrait}
              beforeFilter={s.before_filter === "dull" ? "saturate(.55) brightness(.9) contrast(.92) sepia(.12)" : undefined}
            />
          </div>
          <div>
            {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
            {heading ? (
              <h2 className="pai-h2">
                <Accent text={heading} />
              </h2>
            ) : null}
            {str(s.text) ? <p className="mt-4 max-w-lg text-base leading-relaxed opacity-75 md:text-lg">{str(s.text)}</p> : null}
            {stats.length ? (
              <dl className="mt-8 grid gap-6 sm:grid-cols-3">
                {stats.map((b) => (
                  <div key={b.id} className="border-t border-pai-accent/40 pt-4">
                    <dt className="sr-only">{str(b.settings.label)}</dt>
                    <dd>
                      <span className="block font-heading text-4xl text-pai-accent">{str(b.settings.value)}</span>
                      <span className="mt-1 block text-sm opacity-75">{str(b.settings.label)}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {product ? (
              <SmartLink href={product.url} className="mt-9 flex max-w-sm items-center gap-4 rounded-pai bg-pai-bg p-3 shadow-[var(--bloom-card-shadow)] transition hover:-translate-y-0.5">
                {product.featuredImage ? <img src={product.featuredImage.url} alt="" loading="lazy" className="size-16 rounded-[calc(var(--pai-radius)*0.7)] object-cover" /> : null}
                <span className="min-w-0">
                  <span className="pai-line-clamp-2 block text-sm font-medium">{product.title}</span>
                  <Price price={product.price} compareAt={product.compareAtPrice} priceMax={product.priceMax} size="sm" {...money} />
                </span>
              </SmartLink>
            ) : null}
            {btn ? (
              <ButtonLink href={btn.href} variant={btn.variant} size="lg" className={product ? "mt-5" : "mt-9"}>
                {btn.label}
              </ButtonLink>
            ) : null}
            {str(s.disclaimer) ? <p className="mt-5 text-xs opacity-55">{str(s.disclaimer)}</p> : null}
          </div>
        </div>
      </Section>
    );
  },
});
