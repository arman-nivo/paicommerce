/**
 * Ingredient highlights: key actives orbiting a hero product shot (desktop) or stacked cards
 * (mobile). Each ingredient block has an image, what it does and an optional concentration.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Section, bool, buttonFields, cn, headingFields, paddingField, readButton, schemeField, str } from "@pai/theme-kit";
import { Accent, Blobs, Eyebrow } from "./_bloom";
import { IMG } from "../images";

export const ingredientHighlights = defineSection({
  schema: {
    type: "ingredient-highlights",
    name: "Ingredient highlights",
    category: "content",
    icon: "flask-conical",
    description: "Key ingredients around a central product image — what's inside and why it works.",
    settings: [
      ...headingFields({ eyebrow: "What's inside", heading: "Clean actives, *real* results", subheading: "Every formula is built around a few proven ingredients at effective strengths — nothing you don't need.", align: "center" }),
      { type: "image", id: "image", label: "Centre image", default: IMG.serumDropper },
      { type: "text", id: "image_alt", label: "Centre image description (alt text)", default: "Serum bottle with dropper" },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "orbit",
        options: [
          { value: "orbit", label: "Around the image" },
          { value: "grid", label: "Cards grid" },
        ],
      },
      { type: "checkbox", id: "show_images", label: "Show ingredient images", default: true },
      ...buttonFields("button", { label: "See full ingredient lists", link: "/pages/ingredients", style: "link" }),
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "ingredient",
        name: "Ingredient",
        limit: 8,
        settings: [
          { type: "image", id: "image", label: "Image" },
          { type: "text", id: "name", label: "Name", default: "Niacinamide" },
          { type: "text", id: "amount", label: "Concentration / source", default: "5%" },
          { type: "textarea", id: "text", label: "What it does", default: "Refines pores and evens tone without irritation." },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Ingredient highlights",
        blocks: [
          { type: "ingredient", settings: { name: "Vitamin C", amount: "15%", image: IMG.orange, text: "Brightens dullness and fades dark spots." } },
          { type: "ingredient", settings: { name: "Aloe vera", amount: "Organic", image: IMG.aloe, text: "Calms redness and soothes after sun." } },
          { type: "ingredient", settings: { name: "Hyaluronic acid", amount: "2%", image: IMG.dropperHand, text: "Draws in moisture for plump, bouncy skin." } },
          { type: "ingredient", settings: { name: "Raw honey", amount: "Sundarbans", image: IMG.honey, text: "Gently nourishes and protects the barrier." } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const items = blocks.filter((b) => b.type === "ingredient");
    if (!items.length && !context.isPreview) return null;
    const heading = str(s.heading);
    const center = s.heading_align !== "left";
    const showImg = bool(s.show_images, true);
    const btn = readButton(context, s, "button");
    const image = str(s.image) || IMG.serumDropper;

    const Card = ({ b, side }: { b: (typeof items)[number]; side?: "left" | "right" }) => (
      <li className={cn("flex items-center gap-4", side === "left" && "md:flex-row-reverse md:text-right")}>
        {showImg && str(b.settings.image) ? (
          <span className="relative size-20 shrink-0 overflow-hidden rounded-full bg-pai-muted ring-4 ring-pai-bg shadow-[var(--bloom-card-shadow)]">
            <img src={str(b.settings.image)} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
          </span>
        ) : (
          <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-pai-accent/15 font-heading text-xl text-pai-accent">
            {str(b.settings.name).charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-heading text-xl leading-tight">
            {str(b.settings.name)}
            {str(b.settings.amount) ? <span className="ml-2 align-middle text-xs font-medium uppercase tracking-[0.14em] text-pai-accent">{str(b.settings.amount)}</span> : null}
          </h3>
          {str(b.settings.text) ? <p className="mt-1 text-sm leading-relaxed opacity-75">{str(b.settings.text)}</p> : null}
        </div>
      </li>
    );

    const head = (
      <div className={cn("mb-12 max-w-2xl md:mb-16", center && "mx-auto text-center")}>
        {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
        {heading ? (
          <h2 className="pai-h2">
            <Accent text={heading} />
          </h2>
        ) : null}
        {str(s.subheading) ? <p className="mt-4 text-base opacity-75 md:text-lg">{str(s.subheading)}</p> : null}
      </div>
    );

    if (s.layout === "grid") {
      return (
        <Section settings={s} ariaLabel={heading.replace(/\*/g, "") || "Ingredients"} className="relative isolate overflow-hidden">
          {head}
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((b) => (
              <li key={b.id} className="flex flex-col overflow-hidden rounded-pai bg-pai-card shadow-[var(--bloom-card-shadow)]">
                {showImg && str(b.settings.image) ? (
                  <div className="relative aspect-[4/3] bg-pai-muted">
                    <img src={str(b.settings.image)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                  </div>
                ) : null}
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pai-accent">{str(b.settings.amount)}</p>
                  <h3 className="mt-1 font-heading text-xl">{str(b.settings.name)}</h3>
                  <p className="mt-2 text-sm opacity-75">{str(b.settings.text)}</p>
                </div>
              </li>
            ))}
          </ul>
          {btn ? (
            <div className="mt-10 text-center">
              <ButtonLink href={btn.href} variant={btn.variant}>
                {btn.label}
              </ButtonLink>
            </div>
          ) : null}
        </Section>
      );
    }

    const half = Math.ceil(items.length / 2);
    const left = items.slice(0, half);
    const right = items.slice(half);
    return (
      <Section settings={s} ariaLabel={heading.replace(/\*/g, "") || "Ingredients"} className="relative isolate overflow-hidden">
        <Blobs tone="muted" />
        {head}
        <div className="grid items-center gap-10 md:grid-cols-[1fr_minmax(240px,340px)_1fr] lg:gap-14">
          <ul className="order-2 space-y-8 md:order-1 md:space-y-14">
            {left.map((b) => (
              <Card key={b.id} b={b} side="left" />
            ))}
          </ul>
          <div className="relative order-1 mx-auto w-full max-w-[340px] md:order-2">
            <span aria-hidden className="absolute inset-[-8%] rounded-full border border-dashed border-pai-accent/40" />
            <div className="relative aspect-square overflow-hidden rounded-full bg-pai-muted shadow-[0_40px_80px_-50px_rgb(var(--pai-fg-rgb)/0.6)]">
              <img src={image} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
            </div>
          </div>
          <ul className="order-3 space-y-8 md:space-y-14">
            {right.map((b) => (
              <Card key={b.id} b={b} side="right" />
            ))}
          </ul>
        </div>
        {btn ? (
          <div className="mt-12 text-center">
            <ButtonLink href={btn.href} variant={btn.variant}>
              {btn.label}
            </ButtonLink>
          </div>
        ) : null}
      </Section>
    );
  },
});
