/**
 * Nest hero: a big landscape room photograph with a linen caption card (or a 40/60 split), two
 * buttons and an optional "In the picture" product chip that links to the hero piece.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Container, Price, SmartLink, buttonFields, cn, moneyOf, num, readButton, schemeClass, schemeField, str } from "@pai/theme-kit";
import { Eyebrow } from "./_nest";
import { IMG } from "../images";

export const nestHero = defineSection({
  schema: {
    type: "nest-hero",
    name: "Nest hero",
    category: "hero",
    icon: "sofa",
    description: "Large room photograph with a caption card or split layout, and an “In the picture” product chip.",
    settings: [
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "card",
        options: [
          { value: "card", label: "Full-width image with caption card" },
          { value: "split", label: "Text left, large image right" },
          { value: "split_reverse", label: "Large image left, text right" },
        ],
      },
      { type: "image", id: "image", label: "Image", default: IMG.livingWarm, info: "A wide room shot, at least 2000px wide." },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Sunlit open-plan living room with a grey sofa and terracotta poufs" },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "The Monsoon Collection" },
      { type: "text", id: "heading", label: "Heading", default: "Rooms made for slow evenings" },
      { type: "textarea", id: "text", label: "Text", default: "Solid-wood furniture, soft linens and warm light — delivered and assembled in your home by our own team." },
      ...buttonFields("button", { label: "Shop the living room", link: "/collections/all", style: "primary" }, "Primary button"),
      ...buttonFields("button2", { label: "Visit the showroom", link: "/pages/contact", style: "link" }, "Secondary button"),
      { type: "textarea", id: "highlights", label: "Highlights (card layout)", default: "Free delivery & assembly in Dhaka\n0% EMI up to 12 months\n5-year frame warranty", info: "One per line — shown beside the caption card on desktop." },
      { type: "header", label: "In the picture" },
      { type: "product", id: "product", label: "Featured product", info: "Shows a small product chip on the image." },
      { type: "text", id: "product_label", label: "Chip label", default: "In the picture" },
      { type: "header", label: "Style" },
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
      { type: "range", id: "overlay", label: "Image shade", min: 0, max: 60, step: 5, unit: "%", default: 10 },
      schemeField("default"),
    ],
    presets: [{ name: "Nest hero" }, { name: "Nest hero — split", settings: { layout: "split", color_scheme: "muted" } }],
  },
  component: async ({ settings: s, context }) => {
    const layout = str(s.layout, "card");
    const image = str(s.image) || IMG.livingWarm;
    const heading = str(s.heading);
    const b1 = readButton(context, s, "button");
    const b2 = readButton(context, s, "button2");
    const product = str(s.product) ? await context.data.getProduct(str(s.product)).catch(() => null) : null;
    const money = moneyOf(context);
    const minH = s.height === "full" ? "min-h-[calc(100svh-150px)]" : s.height === "medium" ? "min-h-[480px]" : "min-h-[560px] lg:min-h-[680px]";

    const chip = product ? (
      <SmartLink href={product.url} className="group flex items-center gap-3 rounded-pai bg-pai-bg/95 p-2 pr-5 text-pai-fg shadow-[0_18px_40px_-24px_rgb(0_0_0/0.5)] backdrop-blur">
        {product.featuredImage ? <img src={product.featuredImage.url} alt="" className="size-14 shrink-0 rounded-[calc(var(--pai-radius)*0.75)] object-cover" /> : null}
        <span className="min-w-0">
          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-pai-accent">{str(s.product_label, "In the picture")}</span>
          <span className="block max-w-[14rem] truncate text-sm font-medium group-hover:underline group-hover:underline-offset-4">{product.title}</span>
          <Price price={product.price} compareAt={product.compareAtPrice} size="sm" {...money} />
        </span>
      </SmartLink>
    ) : null;

    const copy = (
      <>
        {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
        {heading ? <h1 className="pai-h1 nest-display">{heading}</h1> : null}
        {str(s.text) ? <p className="mt-5 max-w-md text-base leading-relaxed opacity-75 md:text-[1.08rem]">{str(s.text)}</p> : null}
        {b1 || b2 ? (
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
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
          </div>
        ) : null}
      </>
    );
    const shade = num(s.overlay, 10) / 100;
    const highlights = str(s.highlights)
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    if (layout === "split" || layout === "split_reverse") {
      const rev = layout === "split_reverse";
      return (
        <section aria-label={heading || "Hero"} className={cn("nest-hero relative", schemeClass(s.color_scheme))}>
          <div className={cn("grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]", minH, rev && "lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]")}>
            <div className={cn("flex items-center px-[max(1rem,calc((100vw-var(--pai-container))/2+1.5rem))] py-14 lg:py-20", rev ? "lg:order-2 lg:pl-16" : "lg:pr-16")}>
              <div className="max-w-xl">{copy}</div>
            </div>
            <div className={cn("relative min-h-[360px] overflow-hidden bg-pai-muted", rev && "lg:order-1")}>
              <img src={image} alt={str(s.image_alt)} fetchPriority="high" className="absolute inset-0 size-full object-cover" />
              {shade ? <span className="absolute inset-0 bg-black" style={{ opacity: shade }} /> : null}
              {chip ? <div className="absolute bottom-6 left-6 right-6 sm:right-auto">{chip}</div> : null}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section aria-label={heading || "Hero"} className={cn("nest-hero relative", schemeClass(s.color_scheme))}>
        <div className={cn("relative isolate overflow-hidden bg-pai-muted", minH)}>
          <img src={image} alt={str(s.image_alt)} fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />
          {shade ? <span className="absolute inset-0 -z-10 bg-black" style={{ opacity: shade }} /> : null}
          {chip ? <div className="absolute right-4 top-4 hidden md:right-8 md:top-8 md:block">{chip}</div> : null}
        </div>
        <Container className="relative lg:flex lg:items-end lg:justify-between lg:gap-16">
          <div className="nest-hero-card relative z-10 -mt-24 max-w-2xl lg:shrink-0 rounded-pai border border-pai-border bg-pai-bg p-7 shadow-[0_40px_80px_-60px_rgb(0_0_0/0.6)] sm:p-10 md:-mt-48 md:p-14">
            {copy}
          </div>
          {highlights.length ? (
            <ul className="hidden flex-1 divide-y divide-pai-border border-y border-pai-border lg:block">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-baseline gap-5 py-4">
                  <span className="font-heading text-sm opacity-45">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-heading text-lg">{h}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {chip ? <div className="mt-6 md:hidden">{chip}</div> : null}
        </Container>
      </section>
    );
  },
});
