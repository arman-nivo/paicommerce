/**
 * Editorial split: a big, edge-to-edge image beside a story (rich text), optional fact rows
 * (label / value) and a call to action. Reversible, with an optional small inset image.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, RichText, bool, buttonFields, cn, readButton, schemeClass, schemeField, str } from "@pai/theme-kit";
import { Eyebrow, RATIO, ratioOptions } from "./_nest";
import { IMG } from "../images";

export const editorialSplit = defineSection({
  schema: {
    type: "editorial-split",
    name: "Editorial split",
    category: "media",
    icon: "book-open",
    description: "Large image beside a story, fact rows and a button. Image can sit left or right.",
    settings: [
      { type: "image", id: "image", label: "Image", default: IMG.bedRust },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Oak bed dressed in rust-coloured linen against a plaster wall" },
      { type: "select", id: "image_ratio", label: "Image ratio (mobile)", default: "landscape", options: ratioOptions(["landscape", "square", "portrait"]) },
      { type: "image", id: "inset_image", label: "Small inset image", info: "Optional detail shot overlapping the main image." },
      { type: "checkbox", id: "reverse", label: "Image on the right", default: false },
      { type: "checkbox", id: "full_bleed", label: "Image runs to the edge of the screen", default: true },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "The bedroom edit" },
      { type: "text", id: "heading", label: "Heading", default: "Sleep in linen the colour of Rajshahi clay" },
      { type: "richtext", id: "text", label: "Text", default: "<p>Stone-washed linen that gets softer with every wash, on an oak frame built to be handed down. We dress every bed in our showroom this way — come and lie down on one.</p>" },
      ...buttonFields("button", { label: "Shop the bedroom", link: "/collections/all", style: "primary" }),
      schemeField("default"),
    ],
    blocks: [
      {
        type: "fact",
        name: "Fact row",
        limit: 5,
        settings: [
          { type: "text", id: "label", label: "Label", default: "Frame" },
          { type: "text", id: "value", label: "Value", default: "Solid oak, mortise & tenon joints" },
        ],
      },
    ],
    maxBlocks: 5,
    presets: [
      {
        name: "Editorial split",
        blocks: [
          { type: "fact", settings: { label: "Frame", value: "Solid oak, mortise & tenon joints" } },
          { type: "fact", settings: { label: "Linen", value: "100% stone-washed flax" } },
          { type: "fact", settings: { label: "Delivery", value: "Assembled in your bedroom" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const image = str(s.image) || IMG.bedRust;
    const heading = str(s.heading);
    const btn = readButton(context, s, "button");
    const facts = blocks.filter((b) => b.type === "fact" && str(b.settings.label));
    const reverse = bool(s.reverse);
    const bleed = bool(s.full_bleed, true);
    const ratio = RATIO[str(s.image_ratio, "landscape")] ?? RATIO.landscape;
    const inset = str(s.inset_image);

    return (
      <section aria-label={heading || "Story"} className={cn("nest-editorial", schemeClass(s.color_scheme), !bleed && "pai-container py-[var(--pai-section-spacing)]")}>
        <div className={cn("grid lg:min-h-[640px] lg:grid-cols-2", !bleed && "gap-12 lg:gap-20")}>
          <div className={cn("relative", reverse && "lg:order-2")}>
            <div className={cn("relative h-full overflow-hidden bg-pai-muted lg:aspect-auto", ratio, !bleed && "rounded-pai")}>
              <img src={image} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
            </div>
            {inset ? (
              <div className={cn("absolute -bottom-10 hidden w-44 overflow-hidden rounded-pai border-[6px] border-pai-bg shadow-xl md:block lg:w-56", reverse ? "-left-10" : "-right-10")}>
                <img src={inset} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
              </div>
            ) : null}
          </div>
          <div
            className={cn(
              "flex items-center py-14 lg:py-24",
              bleed && "px-4 sm:px-8",
              bleed && (reverse ? "lg:pl-[max(2rem,calc((100vw-var(--pai-container))/2+2rem))]" : "lg:pr-[max(2rem,calc((100vw-var(--pai-container))/2+2rem))]"),
              bleed && (reverse ? (inset ? "lg:pr-28" : "lg:pr-20") : inset ? "lg:pl-28" : "lg:pl-20"),
              reverse && "lg:order-1",
            )}
          >
            <div className="max-w-xl">
              {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
              {heading ? <h2 className="pai-h2 nest-title">{heading}</h2> : null}
              {str(s.text) ? <RichText html={str(s.text)} className="mt-5 text-[1.02rem] leading-relaxed opacity-80" /> : null}
              {facts.length ? (
                <dl className="mt-8 divide-y divide-pai-border border-y border-pai-border text-sm">
                  {facts.map((f) => (
                    <div key={f.id} className="grid grid-cols-[8rem_1fr] gap-4 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] opacity-55">{str(f.settings.label)}</dt>
                      <dd>{str(f.settings.value)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {btn ? (
                <div className="mt-9">
                  <ButtonLink href={btn.href} variant={btn.variant} size="lg">
                    {btn.label}
                  </ButtonLink>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  },
});
