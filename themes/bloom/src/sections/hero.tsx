/**
 * Bloom hero: an arched portrait next to an airy headline (or a full-bleed variant), with a
 * floating rating badge and a small secondary image — the theme's signature first impression.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Container, Icon, Rating, bool, buttonFields, cn, num, readButton, schemeClass, schemeField, str } from "@pai/theme-kit";
import { Accent, Blobs, Eyebrow, plain } from "./_bloom";
import { IMG } from "../images";

export const bloomHero = defineSection({
  schema: {
    type: "bloom-hero",
    name: "Bloom hero",
    category: "hero",
    icon: "flower",
    description: "Arched portrait with an airy headline, rating badge and two buttons.",
    settings: [
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "arch",
        options: [
          { value: "arch", label: "Arched image right" },
          { value: "arch_left", label: "Arched image left" },
          { value: "full", label: "Full-bleed image" },
        ],
      },
      { type: "image", id: "image", label: "Main image", default: IMG.heroPortrait },
      { type: "text", id: "image_alt", label: "Main image description (alt text)", default: "Model with glowing, dewy skin" },
      { type: "image", id: "image_2", label: "Small round image", default: IMG.serumBottle, info: "Arched layouts only." },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "New · Glow Ritual" },
      { type: "text", id: "heading", label: "Heading", default: "Skin that feels like *spring*", info: "Wrap a word in *asterisks* for the italic accent." },
      { type: "textarea", id: "text", label: "Text", default: "Gentle, effective skincare made for humid days and South Asian skin — dermatologist-approved and delivered in 48 hours." },
      ...buttonFields("button", { label: "Shop skincare", link: "/collections/all", style: "primary" }, "Primary button"),
      ...buttonFields("button2", { label: "Find your routine", link: "#section-routine-builder", style: "link" }, "Secondary button"),
      { type: "header", label: "Rating badge" },
      { type: "checkbox", id: "show_badge", label: "Show rating badge", default: true },
      { type: "range", id: "badge_rating", label: "Rating", min: 3, max: 5, step: 0.1, default: 4.9 },
      { type: "text", id: "badge_text", label: "Badge text", default: "from 12,000+ happy customers" },
      { type: "header", label: "Style" },
      { type: "range", id: "overlay", label: "Overlay (full-bleed)", min: 0, max: 70, step: 5, unit: "%", default: 20 },
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
      schemeField("muted"),
    ],
    presets: [{ name: "Bloom hero" }, { name: "Bloom hero — full bleed", settings: { layout: "full", color_scheme: "default" } }],
  },
  component: ({ settings: s, context }) => {
    const layout = str(s.layout, "arch");
    const image = str(s.image) || (context.isPreview ? IMG.heroPortrait : "");
    const heading = str(s.heading);
    const b1 = readButton(context, s, "button");
    const b2 = readButton(context, s, "button2");
    const minH = s.height === "full" ? "min-h-[calc(100svh-120px)]" : s.height === "medium" ? "min-h-[460px]" : "min-h-[600px]";
    const badge = bool(s.show_badge, true) ? (
      <div className="flex items-center gap-3 rounded-full bg-pai-bg/95 py-2 pl-3 pr-5 text-pai-fg shadow-[0_18px_40px_-20px_rgb(0_0_0/0.35)] backdrop-blur">
        <span className="grid size-9 place-items-center rounded-full bg-pai-accent/15 text-pai-accent">
          <Icon name="heart" className="size-4 fill-current" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            {num(s.badge_rating, 4.9).toFixed(1)} <Rating value={num(s.badge_rating, 4.9)} size={12} />
          </span>
          <span className="text-xs opacity-65">{str(s.badge_text)}</span>
        </span>
      </div>
    ) : null;
    const text = (align: "left" | "center", light = false) => (
      <div className={cn("relative z-10 flex max-w-xl flex-col", align === "center" ? "items-center text-center" : "items-start", light && "text-white")}>
        {str(s.eyebrow) ? <Eyebrow className={light ? "text-white" : undefined}>{str(s.eyebrow)}</Eyebrow> : null}
        {heading ? (
          <h1 className="pai-h1 bloom-display" aria-label={plain(heading)}>
            <Accent text={heading} />
          </h1>
        ) : null}
        {str(s.text) ? <p className="mt-5 max-w-md text-base leading-relaxed opacity-80 md:text-lg">{str(s.text)}</p> : null}
        {b1 || b2 ? (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {b1 ? (
              <ButtonLink href={b1.href} variant={light && b1.variant === "primary" ? "light" : b1.variant} size="lg">
                {b1.label}
              </ButtonLink>
            ) : null}
            {b2 ? (
              <ButtonLink href={b2.href} variant={b2.variant} size="lg">
                {b2.label}
              </ButtonLink>
            ) : null}
          </div>
        ) : null}
      </div>
    );

    if (layout === "full") {
      return (
        <section aria-label={plain(heading) || "Hero"} className={cn("relative isolate flex items-center overflow-hidden", minH)}>
          {image ? <img src={image} alt={str(s.image_alt)} fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover" /> : <div className="absolute inset-0 -z-20 bg-pai-muted" />}
          <span className="absolute inset-0 -z-10 bg-gradient-to-r from-black/55 via-black/20 to-transparent" style={{ opacity: Math.min(1, num(s.overlay, 20) / 35 + 0.3) }} />
          <Container className="py-20">
            {text("left", true)}
            {badge ? <div className="mt-10 inline-block">{badge}</div> : null}
          </Container>
        </section>
      );
    }

    const reverse = layout === "arch_left";
    return (
      <section aria-label={plain(heading) || "Hero"} className={cn("relative isolate overflow-hidden", schemeClass(s.color_scheme))}>
        <Blobs />
        <Container className={cn("grid items-center gap-12 py-14 md:grid-cols-[1.05fr_1fr] md:py-20 lg:gap-20", minH)}>
          <div className={cn(reverse && "md:order-2")}>{text("left")}</div>
          <div className={cn("relative mx-auto w-full max-w-[520px]", reverse && "md:order-1")}>
            <div className="bloom-arch relative aspect-[4/5] overflow-hidden bg-pai-muted shadow-[0_40px_80px_-50px_rgb(var(--pai-fg-rgb)/0.55)]">
              {image ? <img src={image} alt={str(s.image_alt)} fetchPriority="high" className="absolute inset-0 size-full object-cover" /> : null}
            </div>
            {str(s.image_2) ? (
              <div className={cn("absolute -bottom-6 size-32 overflow-hidden rounded-full border-[6px] border-pai-bg shadow-xl md:size-40", reverse ? "-right-4 md:-right-10" : "-left-4 md:-left-10")}>
                <img src={str(s.image_2)} alt="" loading="lazy" className="size-full object-cover" />
              </div>
            ) : null}
            {badge ? <div className={cn("absolute top-10", reverse ? "-left-4 md:-left-12" : "-right-3 md:-right-12")}>{badge}</div> : null}
          </div>
        </Container>
      </section>
    );
  },
});
