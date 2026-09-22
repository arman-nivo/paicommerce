/**
 * Artisan hero: an editorial opener on textured paper. "Framed" puts the photo in a mat with a
 * taped polaroid and a museum tag; "Full bleed" lays a paper card over a large image.
 * The heading is the page's only h1; `*word*` renders in the handwritten accent font.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Container, buttonFields, cn, num, readButton, schemeClass, schemeField, str } from "@pai/theme-kit";
import { Accent, Eyebrow, HandNote, plain } from "./_artisan";
import { IMG } from "../images";

export const artisanHero = defineSection({
  schema: {
    type: "artisan-hero",
    name: "Artisan hero",
    category: "hero",
    icon: "frame",
    description: "Editorial hero on textured paper: framed photo with a polaroid and museum tag, or a full-bleed image with a paper card.",
    settings: [
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "framed",
        options: [
          { value: "framed", label: "Framed photo (right)" },
          { value: "framed_left", label: "Framed photo (left)" },
          { value: "full", label: "Full-bleed image with paper card" },
        ],
      },
      { type: "image", id: "image", label: "Image", default: IMG.potteryWheel },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "A potter's clay-covered hands shaping a pot on the wheel" },
      { type: "image", id: "image_2", label: "Polaroid image", info: "Small taped photo on the framed layouts. Leave empty to hide.", default: IMG.handmadeCups },
      { type: "text", id: "image_2_alt", label: "Polaroid description (alt text)", default: "Hand-pinched cups stacked to dry" },
      { type: "text", id: "polaroid_caption", label: "Polaroid caption", default: "drying day" },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "The spring collection" },
      { type: "text", id: "heading", label: "Heading", default: "Made slowly, *by hand*, in Bangladesh" },
      { type: "textarea", id: "text", label: "Text", default: "Pottery, kantha, brass and jute from the craft villages of Bangladesh — every piece signed by the maker who made it." },
      { type: "text", id: "note", label: "Handwritten note", default: "each piece is one of a kind", info: "Shown in the accent font next to the buttons." },
      ...buttonFields("button", { label: "Shop the collection", link: "/collections/all", style: "primary" }, "Primary button"),
      ...buttonFields("button2", { label: "Meet the makers", link: "/pages/about", style: "link" }, "Secondary button"),
      { type: "header", label: "Museum tag" },
      { type: "text", id: "tag_title", label: "Tag title", default: "Stoneware vase, no. 14" },
      { type: "text", id: "tag_text", label: "Tag details", default: "Bijoypur clay · wood-fired · 3 days" },
      { type: "header", label: "Full-bleed layout" },
      { type: "range", id: "overlay", label: "Image darkening", min: 0, max: 70, step: 5, unit: "%", default: 15 },
      {
        type: "select",
        id: "height",
        label: "Height",
        default: "large",
        options: [
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
          { value: "full", label: "Full screen" },
        ],
      },
      schemeField("default"),
    ],
    presets: [{ name: "Artisan hero" }],
  },
  component: ({ settings: s, context }) => {
    const layout = str(s.layout, "framed");
    const heading = str(s.heading);
    const image = str(s.image) || IMG.potteryWheel;
    const b1 = readButton(context, s, "button");
    const b2 = readButton(context, s, "button2");
    const eyebrow = str(s.eyebrow);
    const tagTitle = str(s.tag_title);
    const buttons =
      b1 || b2 || str(s.note) ? (
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          {b1 ? (
            <ButtonLink href={b1.href} variant={b1.variant} size="lg">
              {b1.label}
            </ButtonLink>
          ) : null}
          {b2 ? (
            <ButtonLink href={b2.href} variant={b2.variant} size="lg">
              {b2.label}
            </ButtonLink>
          ) : null}
          {str(s.note) ? <HandNote arrow="left" className="basis-full sm:basis-auto">{str(s.note)}</HandNote> : null}
        </div>
      ) : null;
    const copy = (
      <>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        {heading ? (
          <h1 className="pai-h1 artisan-display [text-wrap:balance]">
            <Accent text={heading} />
          </h1>
        ) : null}
        {str(s.text) ? <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed opacity-80">{str(s.text)}</p> : null}
        {buttons}
      </>
    );

    if (layout === "full") {
      const heights: Record<string, string> = { medium: "min-h-[560px]", large: "min-h-[680px] md:min-h-[760px]", full: "min-h-[calc(100svh-150px)]" };
      return (
        <section aria-label={plain(heading) || "Hero"} className={cn("artisan-hero relative isolate flex items-end overflow-hidden", heights[str(s.height, "large")] ?? heights.large)}>
          <img src={image} alt={str(s.image_alt)} fetchPriority="high" decoding="async" className="absolute inset-0 -z-20 size-full object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-black" style={{ opacity: num(s.overlay, 15) / 100 }} />
          <Container className="w-full pb-10 pt-40 md:pb-16">
            <div className={cn("artisan-paper-card artisan-stitch-box max-w-xl p-7 sm:p-10", schemeClass(s.color_scheme))}>{copy}</div>
          </Container>
        </section>
      );
    }

    const left = layout === "framed_left";
    const img2 = str(s.image_2);
    return (
      <section aria-label={plain(heading) || "Hero"} className={cn("artisan-hero artisan-paper relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16", schemeClass(s.color_scheme))}>
        <Container className="grid items-center gap-12 md:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div className={cn("relative z-10", left && "md:order-2")}>{copy}</div>
          <div className={cn("relative mx-auto w-full max-w-[36rem]", left && "md:order-1")}>
            <figure className="artisan-frame relative">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={image} alt={str(s.image_alt)} fetchPriority="high" decoding="async" className="absolute inset-0 size-full object-cover" />
              </div>
            </figure>
            {img2 ? (
              <figure className={cn("artisan-polaroid absolute -bottom-10 w-[42%] max-w-[13rem]", left ? "-right-2 rotate-[4deg] md:-right-10" : "-left-2 -rotate-[5deg] md:-left-12")}>
                <span aria-hidden className="artisan-tape" />
                <div className="relative aspect-square overflow-hidden">
                  <img src={img2} alt={str(s.image_2_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                </div>
                {str(s.polaroid_caption) ? <figcaption className="artisan-hand pt-1.5 text-center text-xl leading-none">{str(s.polaroid_caption)}</figcaption> : null}
              </figure>
            ) : null}
            {tagTitle ? (
              <div className={cn("artisan-tag absolute top-8 max-w-[14rem] px-4 py-3 text-xs", left ? "left-3 md:-left-8" : "right-3 md:-right-8")}>
                <span aria-hidden className="artisan-tag-hole" />
                <p className="font-heading text-[0.95rem] leading-tight">{tagTitle}</p>
                {str(s.tag_text) ? <p className="mt-1 opacity-70">{str(s.tag_text)}</p> : null}
              </div>
            ) : null}
          </div>
        </Container>
      </section>
    );
  },
});
