import { defineSection, type SettingField, type StorefrontContext } from "@pai/theme-sdk";
import { bool, cn, embedUrl, isVideoFile, num, str } from "../lib/utils";
import { STOCK_IMAGES } from "../lib/samples";
import { ButtonLink, Container, Image, RichText, Section, SectionHeading } from "../components/primitives";
import { ProductList } from "../components/cards";
import { Countdown, Slideshow, VideoPlayer } from "../client/widgets";
import { buttonFields, headingFields, imageRatioField, loadSectionProducts, paddingField, readButton, schemeField } from "./_shared";

/* ─────────────────────────── shared hero bits ─────────────────────────── */

const HEIGHTS: Record<string, string> = {
  small: "min-h-[380px] md:min-h-[440px]",
  medium: "min-h-[480px] md:min-h-[600px]",
  large: "min-h-[560px] md:min-h-[760px]",
  full: "min-h-[calc(100svh-4rem)]",
};

const heightField: SettingField = {
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
};

const positionField: SettingField = {
  type: "select",
  id: "content_position",
  label: "Content position",
  default: "middle-left",
  options: [
    { value: "top-left", label: "Top left" },
    { value: "middle-left", label: "Middle left" },
    { value: "bottom-left", label: "Bottom left" },
    { value: "middle-center", label: "Center" },
    { value: "bottom-center", label: "Bottom center" },
    { value: "middle-right", label: "Middle right" },
    { value: "bottom-right", label: "Bottom right" },
  ],
};

function positionClasses(pos: string) {
  const [v, h] = pos.split("-");
  return cn(
    "flex flex-col",
    v === "top" ? "justify-start" : v === "bottom" ? "justify-end" : "justify-center",
    h === "center" ? "items-center text-center" : h === "right" ? "items-end text-right" : "items-start text-left",
  );
}

type HeroContent = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  buttons: ({ label: string; href: string; variant: "primary" | "secondary" | "light" | "accent" | "link" } | null)[];
  textColor: "light" | "dark";
  headingTag?: "h1" | "h2";
};

/** Text block used by hero-like sections. */
export function HeroText({ c, className }: { c: HeroContent; className?: string }) {
  const H = c.headingTag ?? "h2";
  const light = c.textColor === "light";
  return (
    <div className={cn("max-w-2xl", light ? "text-white" : "text-neutral-900", className)}>
      {c.eyebrow ? <p className="pai-eyebrow mb-4 !opacity-90">{c.eyebrow}</p> : null}
      {c.heading ? <H className="pai-h1 [text-wrap:balance]">{c.heading}</H> : null}
      {c.subheading ? <p className="mt-5 text-base opacity-90 md:text-lg [text-wrap:pretty]">{c.subheading}</p> : null}
      {c.buttons.some(Boolean) ? (
        <div className="mt-8 flex flex-wrap gap-3 [justify-content:inherit]">
          {c.buttons.filter(Boolean).map((b, i) => {
            // On imagery, outline buttons follow the text colour.
            const variant = b!.variant === "secondary" ? "secondary" : b!.variant;
            return (
              <ButtonLink
                key={i}
                href={b!.href}
                variant={variant}
                size="lg"
                className={cn(variant === "secondary" && light && "!border-white !text-white hover:!bg-white hover:!text-neutral-900", variant === "link" && "!px-0")}
              >
                {b!.label}
              </ButtonLink>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function heroContent(context: StorefrontContext, s: Record<string, unknown>, headingTag: "h1" | "h2" = "h2"): HeroContent {
  return {
    eyebrow: str(s.eyebrow),
    heading: str(s.heading),
    subheading: str(s.subheading),
    buttons: [readButton(context, s, "button"), readButton(context, s, "button2")],
    textColor: s.text_color === "dark" ? "dark" : "light",
    headingTag,
  };
}

/* ─────────────────────────── hero banner ─────────────────────────── */

export const heroBanner = defineSection({
  schema: {
    type: "hero-banner",
    name: "Hero banner",
    category: "hero",
    icon: "image",
    description: "Full-width image or video with headline and buttons.",
    settings: [
      { type: "image", id: "image", label: "Image", default: STOCK_IMAGES.hero },
      { type: "image", id: "mobile_image", label: "Mobile image", info: "Optional portrait image for phones." },
      { type: "video", id: "video", label: "Background video (MP4)", info: "Plays muted in a loop instead of the image." },
      { type: "range", id: "overlay", label: "Overlay opacity", min: 0, max: 90, step: 5, unit: "%", default: 30 },
      heightField,
      positionField,
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
      { type: "checkbox", id: "full_width", label: "Full width", default: true },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "New collection" },
      { type: "text", id: "heading", label: "Heading", default: "Effortless style for every day" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "Discover pieces made to be lived in — thoughtfully designed, delivered to your door." },
      ...buttonFields("button", { label: "Shop now", link: "/collections/all", style: "light" }, "Primary button"),
      ...buttonFields("button2", { label: "", link: "", style: "secondary" }, "Secondary button"),
    ],
    presets: [{ name: "Hero banner" }],
  },
  component: ({ settings: s, context, id }) => {
    const img = str(s.image, STOCK_IMAGES.hero);
    const mobileImg = str(s.mobile_image);
    const video = str(s.video);
    const full = bool(s.full_width, true);
    const content = heroContent(context, s, "h1");
    const first = context.template === "index";
    return (
      <section aria-label={str(s.heading, "Hero")} className={cn(full ? "" : "pai-container pt-6")} data-section-id={id}>
        <div className={cn("relative isolate overflow-hidden", HEIGHTS[str(s.height, "large")] ?? HEIGHTS.large, !full && "rounded-pai")}>
          {video && isVideoFile(video) ? (
            <video src={video} poster={img} autoPlay muted loop playsInline className="absolute inset-0 -z-20 size-full object-cover" />
          ) : (
            <picture>
              {mobileImg ? <source media="(max-width: 767px)" srcSet={mobileImg} /> : null}
              <img src={img} alt="" fetchPriority={first ? "high" : undefined} loading={first ? "eager" : "lazy"} className="absolute inset-0 -z-20 size-full object-cover" />
            </picture>
          )}
          <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: num(s.overlay, 30) / 100 }} />
          <Container className={cn("relative flex py-16 md:py-24", HEIGHTS[str(s.height, "large")] ?? HEIGHTS.large, positionClasses(str(s.content_position, "middle-left")))}>
            <HeroText c={content} />
          </Container>
        </div>
      </section>
    );
  },
});

/* ─────────────────────────── slideshow ─────────────────────────── */

export const slideshow = defineSection({
  schema: {
    type: "slideshow",
    name: "Slideshow",
    category: "hero",
    icon: "gallery-horizontal",
    settings: [
      heightField,
      { type: "checkbox", id: "autoplay", label: "Auto-rotate slides", default: true },
      { type: "range", id: "speed", label: "Change slides every", min: 3, max: 12, step: 1, unit: "s", default: 6 },
      { type: "checkbox", id: "full_width", label: "Full width", default: true },
    ],
    blocks: [
      {
        type: "slide",
        name: "Slide",
        limit: 8,
        settings: [
          { type: "image", id: "image", label: "Image", default: STOCK_IMAGES.hero2 },
          { type: "image", id: "mobile_image", label: "Mobile image" },
          { type: "range", id: "overlay", label: "Overlay opacity", min: 0, max: 90, step: 5, unit: "%", default: 30 },
          positionField,
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
          { type: "text", id: "eyebrow", label: "Eyebrow", default: "" },
          { type: "text", id: "heading", label: "Heading", default: "Slide heading" },
          { type: "textarea", id: "subheading", label: "Subheading", default: "Tell customers about this collection or offer." },
          ...buttonFields("button", { label: "Shop now", link: "/collections/all", style: "light" }),
        ],
      },
    ],
    presets: [
      {
        name: "Slideshow",
        blocks: [
          { type: "slide", settings: { image: STOCK_IMAGES.hero, heading: "The new season edit", eyebrow: "Just landed" } },
          { type: "slide", settings: { image: STOCK_IMAGES.hero3, heading: "Up to 40% off", eyebrow: "Limited time", content_position: "middle-center" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    if (!blocks.length) return null;
    const h = HEIGHTS[str(s.height, "large")] ?? HEIGHTS.large;
    const full = bool(s.full_width, true);
    return (
      <section aria-label="Slideshow" className={cn(!full && "pai-container pt-6")}>
        <Slideshow autoplay={bool(s.autoplay, true) ? num(s.speed, 6) * 1000 : 0} className={cn(!full && "rounded-pai")}>
          {blocks.map((b, i) => {
            const bs = b.settings;
            const img = str(bs.image, STOCK_IMAGES.hero2);
            return (
              <div key={b.id} className={cn("relative isolate overflow-hidden", h)}>
                <picture>
                  {str(bs.mobile_image) ? <source media="(max-width: 767px)" srcSet={str(bs.mobile_image)} /> : null}
                  <img src={img} alt="" loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 && context.template === "index" ? "high" : undefined} className="absolute inset-0 -z-20 size-full object-cover" />
                </picture>
                <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: num(bs.overlay, 30) / 100 }} />
                <Container className={cn("relative flex py-16 md:py-24", h, positionClasses(str(bs.content_position, "middle-left")))}>
                  <HeroText c={{ ...heroContent(context, bs, i === 0 ? "h1" : "h2"), buttons: [readButton(context, bs, "button")] }} />
                </Container>
              </div>
            );
          })}
        </Slideshow>
      </section>
    );
  },
});

/* ─────────────────────────── image with text ─────────────────────────── */

export const imageWithText = defineSection({
  schema: {
    type: "image-with-text",
    name: "Image with text",
    category: "content",
    icon: "layout-panel-left",
    settings: [
      { type: "image", id: "image", label: "Image", default: STOCK_IMAGES.lifestyle },
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
      imageRatioField("portrait"),
      {
        type: "select",
        id: "image_width",
        label: "Image width",
        default: "half",
        options: [
          { value: "third", label: "One third" },
          { value: "half", label: "Half" },
          { value: "wide", label: "Two thirds" },
        ],
      },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Our story" },
      { type: "text", id: "heading", label: "Heading", default: "Made with care, designed to last" },
      { type: "richtext", id: "text", label: "Text", default: "<p>We work directly with local makers to create timeless essentials from premium materials — at honest prices. Every piece is quality-checked before it reaches you.</p>" },
      ...buttonFields("button", { label: "Learn more", link: "/pages/about", style: "secondary" }),
      schemeField("default"),
      paddingField(),
    ],
    presets: [{ name: "Image with text" }],
  },
  component: ({ settings: s, context }) => {
    const btn = readButton(context, s, "button");
    const right = s.image_position === "right";
    const widths: Record<string, string> = { third: "md:grid-cols-[1fr_2fr]", half: "md:grid-cols-2", wide: "md:grid-cols-[3fr_2fr]" };
    const widthsRight: Record<string, string> = { third: "md:grid-cols-[2fr_1fr]", half: "md:grid-cols-2", wide: "md:grid-cols-[2fr_3fr]" };
    const ratio = str(s.image_ratio, "portrait");
    const ratioClass = ratio === "square" ? "aspect-square" : ratio === "landscape" ? "aspect-[4/3]" : ratio === "tall" ? "aspect-[2/3]" : ratio === "wide" ? "aspect-video" : "aspect-[4/5]";
    return (
      <Section settings={s}>
        <div className={cn("grid items-center gap-8 md:gap-16", (right ? widthsRight : widths)[str(s.image_width, "half")])}>
          <Image src={str(s.image, STOCK_IMAGES.lifestyle)} alt={str(s.heading)} ratio={ratioClass} wrapperClassName={cn("rounded-pai", right && "md:order-2")} />
          <div className="max-w-xl">
            {str(s.eyebrow) ? <p className="pai-eyebrow mb-3">{str(s.eyebrow)}</p> : null}
            {str(s.heading) ? <h2 className="pai-h2">{str(s.heading)}</h2> : null}
            <RichText html={str(s.text)} className="mt-5 opacity-85" />
            {btn ? (
              <ButtonLink href={btn.href} variant={btn.variant} className="mt-8">
                {btn.label}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </Section>
    );
  },
});

/* ─────────────────────────── video ─────────────────────────── */

export const video = defineSection({
  schema: {
    type: "video",
    name: "Video",
    category: "media",
    icon: "clapperboard",
    settings: [
      ...headingFields({ heading: "See it in action", align: "center" }),
      { type: "url", id: "video_url", label: "YouTube, Vimeo or MP4 URL", default: "https://www.youtube.com/watch?v=ScMzIvxBSi4" },
      { type: "image", id: "poster", label: "Cover image", default: STOCK_IMAGES.lifestyle2 },
      { type: "checkbox", id: "background", label: "Play as muted background (MP4 only)", default: false },
      { type: "checkbox", id: "full_width", label: "Full width", default: false },
      schemeField(),
      paddingField(),
    ],
    presets: [{ name: "Video" }],
  },
  component: ({ settings: s }) => {
    const url = str(s.video_url);
    const embed = url && !isVideoFile(url) ? embedUrl(url) : null;
    const poster = str(s.poster, STOCK_IMAGES.lifestyle2);
    return (
      <Section settings={s}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "center" ? "center" : "left"} />
        <div className="relative aspect-video overflow-hidden rounded-pai bg-black">
          {bool(s.background) && url && isVideoFile(url) ? (
            <video src={url} poster={poster} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />
          ) : (
            <VideoPlayer src={isVideoFile(url) ? url : undefined} embed={embed} poster={poster} title={str(s.heading, "Video")} className="absolute inset-0" />
          )}
        </div>
      </Section>
    );
  },
});

/* ─────────────────────────── countdown / flash sale ─────────────────────────── */

function endOfWeek(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7 || 7));
  d.setUTCHours(18, 0, 0, 0); // midnight Dhaka
  return d.toISOString();
}

export const countdown = defineSection({
  schema: {
    type: "countdown",
    name: "Flash sale countdown",
    category: "marketing",
    icon: "timer",
    description: "Countdown timer with optional sale products.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Flash sale" },
      { type: "text", id: "heading", label: "Heading", default: "Deals end soon" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "Up to 50% off selected items — while stocks last." },
      { type: "datetime", id: "end_date", label: "Ends at", info: "Leave empty to count down to the end of this week." },
      { type: "text", id: "expired_text", label: "Text after it ends", default: "This sale has ended — stay tuned for the next one!" },
      ...buttonFields("button", { label: "Shop the sale", link: "/collections/all", style: "primary" }),
      { type: "header", label: "Products" },
      { type: "checkbox", id: "show_products", label: "Show products", default: true },
      {
        type: "select",
        id: "source",
        label: "Products",
        default: "on-sale",
        options: [
          { value: "on-sale", label: "On sale" },
          { value: "collection", label: "From a collection" },
          { value: "best-selling", label: "Best sellers" },
        ],
      },
      { type: "collection", id: "collection", label: "Collection" },
      { type: "range", id: "limit", label: "Maximum products", min: 2, max: 12, step: 1, default: 4 },
      schemeField("muted"),
      paddingField(),
    ],
    presets: [{ name: "Flash sale countdown" }],
  },
  component: async ({ settings: s, context }) => {
    const end = str(s.end_date) || endOfWeek();
    const btn = readButton(context, s, "button");
    const { products } = bool(s.show_products, true) ? await loadSectionProducts(context, s, 4) : { products: [] };
    return (
      <Section settings={s}>
        <div className={cn("flex flex-col items-center gap-6 text-center", products.length && "mb-10")}>
          <div>
            {str(s.eyebrow) ? <p className="pai-eyebrow mb-2 text-pai-sale !opacity-100">{str(s.eyebrow)}</p> : null}
            <h2 className="pai-h2">{str(s.heading)}</h2>
            {str(s.subheading) ? <p className="mx-auto mt-3 max-w-xl opacity-75">{str(s.subheading)}</p> : null}
          </div>
          <Countdown to={end} expiredLabel={str(s.expired_text)} />
          {btn && !products.length ? (
            <ButtonLink href={btn.href} variant={btn.variant}>
              {btn.label}
            </ButtonLink>
          ) : null}
        </div>
        {products.length ? (
          <>
            <ProductList products={products} context={context} columns={Math.min(4, products.length)} />
            {btn ? (
              <div className="mt-10 text-center">
                <ButtonLink href={btn.href} variant={btn.variant}>
                  {btn.label}
                </ButtonLink>
              </div>
            ) : null}
          </>
        ) : null}
      </Section>
    );
  },
});

/** Re-export for themes composing their own hero sections. */
export { HEIGHTS as HERO_HEIGHTS, positionClasses as heroPositionClasses, heroContent };
