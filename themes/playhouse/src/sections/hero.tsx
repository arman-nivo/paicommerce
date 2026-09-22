/**
 * Playhouse hero: big friendly headline with a squiggle-highlighted word, two pill CTAs, a photo
 * framed in a blob with a floating second "bubble" photo, colourful shapes, a sticker and trust
 * chips (blocks), finished with a wavy bottom edge.
 */
import type { CSSProperties } from "react";
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Icon, ICON_OPTIONS, Placeholder, bool, buttonFields, cn, readButton, str } from "@pai/theme-kit";
import { IMG } from "../images";
import { Blob, PlayhouseStyles, Sparkle, Squiggle, Wave, funAt, funColor, funColorField, tint } from "./_playhouse";

export const playhouseHero = defineSection({
  schema: {
    type: "playhouse-hero",
    name: "Playful hero",
    category: "hero",
    icon: "party-popper",
    description: "Big headline, two buttons, a blob-framed photo and colourful shapes.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "New toys just landed" },
      { type: "text", id: "heading", label: "Heading", default: "Toys that spark big imaginations" },
      { type: "text", id: "highlight", label: "Highlighted words", default: "big imaginations", info: "Must appear in the heading — gets a colourful squiggle." },
      { type: "textarea", id: "subheading", label: "Subheading", default: "Wooden classics, learning kits and cuddly friends — safety-checked, gift-ready and delivered across Bangladesh." },
      ...buttonFields("button", { label: "Shop all toys", link: "/collections/all", style: "primary" }, "Primary button"),
      ...buttonFields("button2", { label: "Shop by age", link: "/collections/learning", style: "secondary" }, "Secondary button"),
      { type: "header", label: "Images" },
      { type: "image", id: "image", label: "Main image", default: IMG.heroKids },
      { type: "text", id: "image_alt", label: "Main image description", default: "A laughing child with colourful paint on her face" },
      { type: "image", id: "image_2", label: "Bubble image", default: IMG.woodenTrain },
      { type: "text", id: "image_2_alt", label: "Bubble image description", default: "Wooden toy train set" },
      {
        type: "select",
        id: "image_position",
        label: "Image position",
        default: "right",
        options: [
          { value: "right", label: "Right" },
          { value: "left", label: "Left" },
        ],
      },
      { type: "header", label: "Style" },
      funColorField("background", "Background colour", "sunshine"),
      funColorField("highlight_color", "Highlight colour", "bubblegum"),
      { type: "text", id: "sticker", label: "Sticker text", default: "Up to 30% off", info: "Round sticker on the image. Leave empty to hide." },
      { type: "checkbox", id: "shapes", label: "Show floating shapes", default: true },
      { type: "checkbox", id: "wave", label: "Wavy bottom edge", default: true },
    ],
    blocks: [
      {
        type: "chip",
        name: "Trust chip",
        limit: 4,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "shield-check", options: ICON_OPTIONS },
          { type: "text", id: "text", label: "Text", default: "Safety-checked toys" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Playful hero",
        blocks: [
          { type: "chip", settings: { icon: "shield-check", text: "Safety-checked toys" } },
          { type: "chip", settings: { icon: "banknote", text: "Cash on delivery" } },
          { type: "chip", settings: { icon: "gift", text: "Free gift wrap" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const heading = str(s.heading, "Toys that spark big imaginations");
    const hl = str(s.highlight);
    const at = hl ? heading.toLowerCase().indexOf(hl.toLowerCase()) : -1;
    const hlColor = funColor(s.highlight_color, 1);
    const bg = funColor(s.background, 0);
    const primary = readButton(context, s, "button");
    const secondary = readButton(context, s, "button2");
    const image = str(s.image);
    const image2 = str(s.image_2);
    const left = s.image_position === "left";
    const shapes = bool(s.shapes, true);
    const wave = bool(s.wave, true) && context.theme.wavy_edges !== false;
    const chips = blocks.filter((b) => b.type === "chip" && str(b.settings.text));

    const title =
      at >= 0 ? (
        <>
          {heading.slice(0, at)}
          <span className="relative inline-block whitespace-nowrap">
            <span className="relative z-10">{heading.slice(at, at + hl.length)}</span>
            <Squiggle className="absolute -bottom-1 left-0 h-3 w-full md:-bottom-2 md:h-4" color={hlColor} />
          </span>
          {heading.slice(at + hl.length)}
        </>
      ) : (
        heading
      );

    return (
      <section aria-label={heading} className="ph-hero relative isolate overflow-hidden" style={{ background: tint(bg, 38), "--ph-hl": hlColor } as CSSProperties}>
        <PlayhouseStyles />
        {shapes ? (
          <div aria-hidden className="absolute inset-0 -z-10">
            <Blob variant={0} color={tint(bg, 70)} className="ph-float absolute -left-24 -top-24 size-80 [animation-duration:9s]" />
            <Blob variant={2} color="white" className="ph-float absolute -bottom-24 left-[38%] size-60 opacity-50 [animation-delay:-3s] [animation-duration:11s]" />
            <Sparkle className="ph-float absolute left-[8%] top-[18%] size-6 [animation-delay:-1s]" color={funAt(3)} />
            <Sparkle className="ph-float absolute right-[45%] top-[10%] size-4 [animation-delay:-4s]" color={funAt(1)} />
            <span className="ph-float absolute bottom-[22%] left-[5%] size-5 rounded-full [animation-delay:-2s]" style={{ background: funAt(4) }} />
            <span className="ph-float absolute right-[6%] top-[12%] size-8 rounded-full border-[5px] [animation-delay:-5s]" style={{ borderColor: funAt(1) }} />
          </div>
        ) : null}
        <div className={cn("pai-container grid items-center gap-10 pb-16 pt-10 md:grid-cols-2 md:gap-8 md:pb-24 md:pt-14 lg:gap-16", wave && "pb-20 md:pb-28")}>
          <div className={cn("relative z-10 max-w-xl", left && "md:order-2")}>
            {str(s.eyebrow) ? (
              <p className="mb-4 inline-flex -rotate-2 items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-extrabold shadow-[0_3px_0_rgba(0,0,0,.08)]">
                <Sparkle className="size-4" color={hlColor} />
                {str(s.eyebrow)}
              </p>
            ) : null}
            <h2 className="font-heading font-bold leading-[1.02] tracking-tight [text-wrap:balance]" style={{ fontSize: "calc(clamp(2.4rem, 6vw, 4.4rem) * var(--pai-heading-scale))" }}>
              {title}
            </h2>
            {str(s.subheading) ? <p className="mt-5 max-w-lg text-lg font-semibold opacity-80 md:text-xl">{str(s.subheading)}</p> : null}
            {primary || secondary ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {primary ? (
                  <ButtonLink href={primary.href} variant={primary.variant} size="lg" className="ph-btn-pop">
                    {primary.label}
                  </ButtonLink>
                ) : null}
                {secondary ? (
                  <ButtonLink href={secondary.href} variant={secondary.variant === "secondary" ? "light" : secondary.variant} size="lg" className="ph-btn-pop ring-2 ring-pai-fg/10">
                    {secondary.label}
                  </ButtonLink>
                ) : null}
              </div>
            ) : null}
            {chips.length ? (
              <ul className="mt-8 flex flex-wrap gap-2">
                {chips.map((c, i) => (
                  <li key={c.id} className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-1.5 pr-3.5 text-sm font-bold backdrop-blur">
                    <span className="grid size-7 place-items-center rounded-full text-[#1f1f1f]" style={{ background: funAt(i + 2) }}>
                      <Icon name={str(c.settings.icon, "star")} className="size-4" />
                    </span>
                    {str(c.settings.text)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className={cn("relative mx-auto w-full max-w-[520px]", left && "md:order-1")}>
            <Blob variant={1} color={funAt(3)} className="absolute -inset-6 -z-10 size-[calc(100%+3rem)] rotate-12 opacity-90" />
            <div className="ph-hero-img relative aspect-square overflow-hidden rounded-[42%_58%_55%_45%/48%_42%_58%_52%] border-[6px] border-white shadow-[0_24px_50px_-24px_rgba(0,0,0,.45)]">
              {image ? <img src={image} alt={str(s.image_alt)} fetchPriority="high" className="absolute inset-0 size-full object-cover" /> : <Placeholder kind="lifestyle" className="absolute inset-0" />}
            </div>
            {image2 ? (
              <div className={cn("ph-float absolute -bottom-6 size-32 overflow-hidden rounded-full border-[5px] border-white shadow-xl [animation-duration:7s] md:size-40", left ? "-right-2 md:-right-6" : "-left-2 md:-left-8")}>
                <img src={image2} alt={str(s.image_2_alt)} loading="lazy" className="size-full object-cover" />
              </div>
            ) : null}
            {str(s.sticker) ? (
              <p className={cn("ph-sticker absolute -top-3 grid size-24 place-items-center rounded-full border-4 border-white p-3 text-center font-heading text-[0.95rem] font-bold leading-tight text-pai-fg shadow-lg md:size-28 md:text-lg", left ? "-left-2" : "-right-2")} style={{ background: hlColor }}>
                <span className="-rotate-12">{str(s.sticker)}</span>
              </p>
            ) : null}
          </div>
        </div>
        {wave ? <Wave className="absolute inset-x-0 bottom-0 text-pai-bg" variant={0} /> : null}
      </section>
    );
  },
});
