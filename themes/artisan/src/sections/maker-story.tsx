/**
 * Maker story: a large framed portrait beside a long-form story with a drop cap, a handwritten
 * pull-quote, the maker's signature, a few "fact" blocks and (optionally) one of their pieces as a
 * museum-label card.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Price, RichText, Section, SmartLink, buttonFields, cn, moneyOf, paddingField, readButton, schemeField, str } from "@pai/theme-kit";
import { Accent, Eyebrow, RATIO, plain, regionOf } from "./_artisan";
import { IMG } from "../images";

export const makerStory = defineSection({
  schema: {
    type: "maker-story",
    name: "Maker story",
    category: "content",
    icon: "book-open",
    description: "Large portrait + long-form story with a handwritten pull-quote, signature and one of the maker's pieces.",
    settings: [
      { type: "image", id: "image", label: "Portrait", default: IMG.potteryWheel },
      { type: "text", id: "image_alt", label: "Portrait description (alt text)", default: "Rahima's hands shaping a pot on the wheel" },
      { type: "text", id: "image_caption", label: "Photo caption", default: "Bijoypur, Netrokona — the wheel she inherited from her mother" },
      {
        type: "select",
        id: "image_ratio",
        label: "Portrait ratio",
        default: "tall",
        options: [
          { value: "portrait", label: "Portrait (4:5)" },
          { value: "tall", label: "Tall (2:3)" },
          { value: "square", label: "Square" },
        ],
      },
      {
        type: "select",
        id: "image_position",
        label: "Portrait position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Meet the maker" },
      { type: "text", id: "heading", label: "Heading", default: "Thirty-one years at the *same wheel*" },
      {
        type: "richtext",
        id: "story",
        label: "Story",
        default:
          "<p>Rahima Begum learned to centre clay before she learned to write her name. Her mother threw water pots for the Bijoypur market; Rahima now throws the speckled vases and cups you see here, on the same kick-wheel, from the same white clay dug a few fields away.</p><p>Each pot is thrown, left to firm up overnight, trimmed by hand and wood-fired with her neighbours' work. No two come out of the kiln alike — the ash decides the glaze.</p>",
      },
      { type: "textarea", id: "quote", label: "Handwritten pull-quote", default: "The clay tells me when it is ready. I only have to listen." },
      { type: "text", id: "signature", label: "Signature", default: "Rahima Begum" },
      { type: "text", id: "role", label: "Maker's craft & village", default: "Potter · Bijoypur, Netrokona" },
      { type: "product", id: "product", label: "Featured piece", info: "Shown as a museum-label card. Leave empty to hide." },
      ...buttonFields("button", { label: "Shop Rahima's pottery", link: "/collections/pottery-ceramics", style: "secondary" }),
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "fact",
        name: "Fact",
        limit: 4,
        settings: [
          { type: "text", id: "label", label: "Label", default: "Craft" },
          { type: "text", id: "value", label: "Value", default: "Wood-fired stoneware" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Maker story",
        blocks: [
          { type: "fact", settings: { label: "Craft", value: "Wood-fired stoneware" } },
          { type: "fact", settings: { label: "Years at the wheel", value: "31" } },
          { type: "fact", settings: { label: "Pieces a week", value: "About 40" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const heading = str(s.heading);
    const product = str(s.product) ? await context.data.getProduct(str(s.product)).catch(() => null) : null;
    const money = moneyOf(context);
    const btn = readButton(context, s, "button");
    const facts = blocks.filter((b) => b.type === "fact" && str(b.settings.value));
    const right = s.image_position === "right";
    const ratio = RATIO[str(s.image_ratio, "tall")] ?? RATIO.tall;

    return (
      <Section settings={s} ariaLabel={plain(heading) || "Maker story"} className="artisan-paper">
        <div className="grid items-start gap-12 md:grid-cols-[1fr_1.15fr] lg:gap-20">
          <figure className={cn("md:sticky md:top-32", right && "md:order-2")}>
            <div className="artisan-frame">
              <div className={cn("relative overflow-hidden bg-pai-muted", ratio)}>
                <img src={str(s.image) || IMG.potteryWheel} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
              </div>
            </div>
            {str(s.image_caption) ? <figcaption className="mt-5 flex gap-3 text-sm italic opacity-70">
              <span aria-hidden className="artisan-stitch mt-2.5 w-6 shrink-0" />
              {str(s.image_caption)}
            </figcaption> : null}
          </figure>

          <div className="md:pt-6">
            {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
            {heading ? (
              <h2 className="pai-h2 [text-wrap:balance]">
                <Accent text={heading} />
              </h2>
            ) : null}
            <RichText html={str(s.story)} className="artisan-story mt-7 text-[1.05rem] leading-[1.8] opacity-90" />

            {str(s.quote) ? (
              <blockquote className="artisan-pullquote relative my-10 pl-8">
                <span aria-hidden className="artisan-hand absolute -left-1 -top-6 text-7xl leading-none text-pai-accent/40">“</span>
                <p className="artisan-hand text-[2rem] leading-[1.15] text-pai-accent sm:text-[2.35rem]">{str(s.quote)}</p>
              </blockquote>
            ) : null}

            {str(s.signature) ? (
              <div className="flex items-end gap-4">
                <div>
                  <p className="artisan-hand artisan-signature text-4xl leading-none">{str(s.signature)}</p>
                  {str(s.role) ? <p className="mt-2 text-xs uppercase tracking-[0.18em] opacity-60">{str(s.role)}</p> : null}
                </div>
              </div>
            ) : null}

            {facts.length ? (
              <dl className={cn("artisan-facts mt-10 grid gap-px", facts.length === 1 ? "grid-cols-1" : facts.length === 3 ? "grid-cols-3" : "grid-cols-2", facts.length === 4 && "sm:grid-cols-4")}>
                {facts.map((f) => (
                  <div key={f.id} className="bg-pai-bg px-3 py-4 sm:px-4">
                    <dt className="text-[11px] uppercase tracking-[0.16em] opacity-60">{str(f.settings.label)}</dt>
                    <dd className="mt-1 font-heading text-lg sm:text-xl">{str(f.settings.value)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
              {product ? (
                <SmartLink href={product.url} className="artisan-mini-card group flex flex-1 items-center gap-4 p-3 pr-5">
                  <span className="relative size-20 shrink-0 overflow-hidden bg-pai-muted">
                    {product.featuredImage ? <img src={product.featuredImage.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-[0.18em] opacity-60">Made by {str(s.signature) || product.vendor || "our makers"}</span>
                    <span className="pai-line-clamp-2 block font-heading text-lg leading-snug group-hover:underline group-hover:underline-offset-4">{product.title}</span>
                    <span className="flex items-center gap-2 text-xs opacity-70">
                      {regionOf(product)} · <Price price={product.price} compareAt={product.compareAtPrice} size="sm" {...money} />
                    </span>
                  </span>
                </SmartLink>
              ) : null}
              {btn ? (
                <ButtonLink href={btn.href} variant={btn.variant}>
                  {btn.label}
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </div>
      </Section>
    );
  },
});
