import { defineSection, type BlockInstance, type StorefrontContext } from "@pai/theme-sdk";
import { ButtonLink, Container, HERO_HEIGHTS, cn, heroPositionClasses, num, resolveHref, schemeClass, schemeField, str, type ButtonVariant } from "@pai/theme-kit";
import { IMG } from "../images";

const SPLIT_HEIGHTS: Record<string, string> = {
  small: "md:min-h-[440px]",
  medium: "md:min-h-[600px]",
  large: "md:min-h-[720px]",
  full: "md:min-h-[calc(100svh-4rem)]",
};

const BUTTON_STYLES = [
  { value: "primary", label: "Solid" },
  { value: "secondary", label: "Outline" },
  { value: "light", label: "White" },
  { value: "link", label: "Text link" },
];

function HeroBlocks({ blocks, context, light, align }: { blocks: BlockInstance[]; context: StorefrontContext; light: boolean; align: "left" | "center" | "right" }) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-5", align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left")}>
      {blocks.map((b) => {
        const s = b.settings;
        switch (b.type) {
          case "eyebrow":
            return str(s.text) ? (
              <p key={b.id} className="aurora-eyebrow text-xs font-medium uppercase tracking-[0.28em] opacity-90">
                {str(s.text)}
              </p>
            ) : null;
          case "heading": {
            const H = s.tag === "h1" ? "h1" : "h2";
            const size = str(s.size, "large");
            return str(s.text) ? (
              <H
                key={b.id}
                className={cn(
                  "font-heading font-normal leading-[1.02] tracking-[-0.01em] [text-wrap:balance] [text-transform:var(--pai-heading-transform,none)]",
                  size === "medium" && "text-[calc(clamp(2.25rem,4.5vw,3.75rem)*var(--pai-heading-scale))]",
                  size === "large" && "text-[calc(clamp(2.75rem,6.5vw,5.5rem)*var(--pai-heading-scale))]",
                  size === "xlarge" && "text-[calc(clamp(3.25rem,9vw,8rem)*var(--pai-heading-scale))]",
                )}
              >
                {str(s.text)}
              </H>
            ) : null;
          }
          case "text":
            return str(s.text) ? (
              <p key={b.id} className="max-w-lg text-base leading-relaxed opacity-85 md:text-lg [text-wrap:pretty]">
                {str(s.text)}
              </p>
            ) : null;
          case "buttons": {
            const buttons = [1, 2]
              .map((n) => ({ label: str(s[`label_${n}`]), href: resolveHref(context, s[`link_${n}`], "/collections/all"), style: str(s[`style_${n}`], n === 1 ? "primary" : "link") }))
              .filter((x) => x.label);
            if (!buttons.length) return null;
            return (
              <div key={b.id} className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 [justify-content:inherit]">
                {buttons.map((btn, i) => {
                  const variant = (btn.style === "light" || btn.style === "secondary" || btn.style === "link" ? btn.style : "primary") as ButtonVariant;
                  return (
                    <ButtonLink
                      key={i}
                      href={btn.href}
                      variant={variant}
                      size="lg"
                      className={cn(
                        "aurora-btn",
                        variant === "link" && "!px-0 text-sm font-semibold uppercase tracking-[0.18em]",
                        variant === "secondary" && light && "!border-white !text-white hover:!bg-white hover:!text-neutral-900",
                        variant === "primary" && light && "!bg-white !text-neutral-900 hover:!bg-white/90",
                      )}
                    >
                      {btn.label}
                    </ButtonLink>
                  );
                })}
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

export const auroraHero = defineSection({
  schema: {
    type: "aurora-hero",
    name: "Editorial hero",
    category: "hero",
    icon: "gallery-vertical-end",
    description: "Full-bleed or split-screen editorial hero with a detail image.",
    settings: [
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "full",
        options: [
          { value: "full", label: "Full-bleed image" },
          { value: "split_left", label: "Split — image left" },
          { value: "split_right", label: "Split — image right" },
        ],
      },
      { type: "image", id: "image", label: "Image", default: IMG.heroFashion },
      { type: "image", id: "mobile_image", label: "Mobile image", info: "Optional portrait image for phones." },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
      { type: "range", id: "focal_x", label: "Image focal point (horizontal)", min: 0, max: 100, step: 5, unit: "%", default: 50 },
      { type: "range", id: "focal_y", label: "Image focal point (vertical)", min: 0, max: 100, step: 5, unit: "%", default: 35 },
      {
        type: "select",
        id: "height",
        label: "Height",
        default: "large",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
          { value: "full", label: "Full screen" },
        ],
      },
      { type: "header", label: "Full-bleed layout" },
      {
        type: "select",
        id: "text_position",
        label: "Text position",
        default: "bottom-left",
        options: [
          { value: "top-left", label: "Top left" },
          { value: "middle-left", label: "Middle left" },
          { value: "bottom-left", label: "Bottom left" },
          { value: "middle-center", label: "Center" },
          { value: "bottom-center", label: "Bottom center" },
          { value: "middle-right", label: "Middle right" },
          { value: "bottom-right", label: "Bottom right" },
        ],
      },
      { type: "range", id: "overlay", label: "Overlay opacity", min: 0, max: 80, step: 5, unit: "%", default: 25 },
      {
        type: "select",
        id: "overlay_style",
        label: "Overlay style",
        default: "gradient",
        options: [
          { value: "gradient", label: "Gradient (behind text)" },
          { value: "solid", label: "Solid" },
        ],
      },
      {
        type: "select",
        id: "text_color",
        label: "Text colour",
        default: "light",
        options: [
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ],
      },
      { type: "header", label: "Split layout" },
      { type: "image", id: "detail_image", label: "Detail image", info: "Small overlapping image on the text side (desktop).", default: IMG.detail },
      {
        type: "select",
        id: "split_align",
        label: "Text alignment",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
        ],
      },
      schemeField("muted"),
    ],
    blocks: [
      { type: "eyebrow", name: "Eyebrow", limit: 1, settings: [{ type: "text", id: "text", label: "Text", default: "New season" }] },
      {
        type: "heading",
        name: "Heading",
        limit: 2,
        settings: [
          { type: "text", id: "text", label: "Heading", default: "Quiet luxury, made to be lived in" },
          {
            type: "select",
            id: "size",
            label: "Size",
            default: "large",
            options: [
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "xlarge", label: "Extra large" },
            ],
          },
          {
            type: "select",
            id: "tag",
            label: "Heading level",
            default: "h2",
            info: "Use H1 only for the first hero on the page.",
            options: [
              { value: "h1", label: "H1 (page title)" },
              { value: "h2", label: "H2" },
            ],
          },
        ],
      },
      { type: "text", name: "Text", limit: 2, settings: [{ type: "textarea", id: "text", label: "Text", default: "Natural fibres, considered cuts and colours that work together — season after season." }] },
      {
        type: "buttons",
        name: "Buttons",
        limit: 1,
        settings: [
          { type: "text", id: "label_1", label: "First button label", default: "Shop the collection" },
          { type: "url", id: "link_1", label: "First button link", default: "/collections/all" },
          { type: "select", id: "style_1", label: "First button style", default: "primary", options: BUTTON_STYLES },
          { type: "text", id: "label_2", label: "Second button label", default: "" },
          { type: "url", id: "link_2", label: "Second button link", default: "" },
          { type: "select", id: "style_2", label: "Second button style", default: "link", options: BUTTON_STYLES },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Editorial hero",
        blocks: [
          { type: "eyebrow", settings: { text: "The new season" } },
          { type: "heading", settings: { text: "Quiet luxury, made to be lived in" } },
          { type: "text" },
          { type: "buttons", settings: { label_2: "Explore the lookbook", link_2: "/collections/all" } },
        ],
      },
      {
        name: "Split editorial hero",
        settings: { layout: "split_right", image: IMG.editorialWoman, height: "large" },
        blocks: [
          { type: "eyebrow", settings: { text: "Studio edit" } },
          { type: "heading", settings: { text: "Made slowly. Worn often.", size: "medium" } },
          { type: "text" },
          { type: "buttons" },
        ],
      },
    ],
  },
  component: ({ id, settings: s, blocks, context }) => {
    const layout = str(s.layout, "full");
    const image = str(s.image) || (context.isPreview ? IMG.heroFashion : "");
    const mobileImage = str(s.mobile_image);
    const alt = str(s.image_alt);
    const pos = `${num(s.focal_x, 50)}% ${num(s.focal_y, 35)}%`;
    const height = HERO_HEIGHTS[str(s.height, "large")] ?? HERO_HEIGHTS.large;
    const priority = context.template === "index";
    const label = str(blocks.find((b) => b.type === "heading")?.settings.text, "Featured");

    const picture = (cls: string) =>
      image ? (
        <picture>
          {mobileImage ? <source media="(max-width: 767px)" srcSet={mobileImage} /> : null}
          <img src={image} alt={alt} style={{ objectPosition: pos }} fetchPriority={priority ? "high" : undefined} loading={priority ? "eager" : "lazy"} decoding="async" className={cls} />
        </picture>
      ) : (
        <div className={cn(cls, "bg-pai-muted")} aria-hidden />
      );

    if (layout === "full") {
      const light = s.text_color !== "dark";
      const position = str(s.text_position, "bottom-left");
      const [v, h] = position.split("-");
      const overlay = num(s.overlay, 25) / 100;
      const gradient = s.overlay_style !== "solid";
      const gradientDir = v === "top" ? "to bottom" : v === "bottom" ? "to top" : h === "right" ? "to left" : h === "center" ? "to top" : "to right";
      return (
        <section aria-label={label} data-section-id={id} className="aurora-hero relative isolate overflow-hidden">
          {picture("absolute inset-0 -z-20 size-full object-cover")}
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={
              gradient
                ? { background: `linear-gradient(${gradientDir}, rgba(0,0,0,${Math.min(0.9, overlay * 2.2)}) 0%, rgba(0,0,0,${overlay}) 45%, rgba(0,0,0,0) 100%)` }
                : { background: `rgba(0,0,0,${overlay})` }
            }
          />
          <Container className={cn("relative flex py-14 md:py-20", height, heroPositionClasses(position), light ? "text-white" : "text-neutral-900")}>
            <HeroBlocks blocks={blocks} context={context} light={light} align={h === "center" ? "center" : h === "right" ? "right" : "left"} />
          </Container>
        </section>
      );
    }

    const imageRight = layout === "split_right";
    const detail = str(s.detail_image);
    const center = s.split_align === "center";
    return (
      <section aria-label={label} data-section-id={id} className={cn("aurora-hero grid md:grid-cols-2", SPLIT_HEIGHTS[str(s.height, "large")] ?? SPLIT_HEIGHTS.large, schemeClass(s.color_scheme) || "bg-pai-bg")}>
        <div className={cn("relative min-h-[420px] overflow-hidden md:min-h-0", imageRight && "md:order-2")}>
          {picture("absolute inset-0 size-full object-cover")}
        </div>
        <div className={cn("relative flex items-center px-6 py-14 sm:px-10 md:px-14 md:py-20 lg:px-20", center && "justify-center")}>
          <div className={cn(detail && "xl:max-w-[62%]")}>
            <HeroBlocks blocks={blocks} context={context} light={false} align={center ? "center" : "left"} />
          </div>
          {detail ? (
            <img
              src={detail}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className={cn(
                "absolute bottom-10 right-10 hidden aspect-[3/4] w-[22%] max-w-[180px] rounded-pai object-cover shadow-xl xl:block",
              )}
            />
          ) : null}
        </div>
      </section>
    );
  },
});
