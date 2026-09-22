import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Container, bool, buttonFields, cn, embedUrl, isVideoFile, num, readButton, str } from "@pai/theme-kit";
import { HeroMedia } from "../client/hero-media";
import { IMG } from "../images";

const SIZES: Record<string, string> = {
  medium: "text-[clamp(3rem,9vw,8rem)]",
  large: "text-[clamp(3.5rem,11vw,10rem)]",
  xl: "text-[clamp(4rem,13.5vw,12.5rem)]",
};

const HEIGHTS: Record<string, string> = {
  full: "min-h-[clamp(620px,100svh,1080px)]",
  large: "min-h-[clamp(580px,88svh,940px)]",
  medium: "min-h-[clamp(520px,70svh,760px)]",
};

/**
 * Oversized typographic hero: full-bleed video (mp4 or YouTube/Vimeo) over a poster image,
 * giant stacked headline lines (solid / outline / accent), two CTAs and a stat ticker.
 */
export const strideHero = defineSection({
  schema: {
    type: "stride-hero",
    name: "Video hero",
    category: "hero",
    icon: "clapperboard",
    description: "Full-bleed video or image with giant stacked headline lines, two buttons and a scrolling stat ticker.",
    settings: [
      { type: "header", label: "Media" },
      { type: "image", id: "image", label: "Poster image", default: IMG.heroRunners, info: "Shown while the video loads, on slow connections and to visitors who prefer reduced motion." },
      { type: "image", id: "image_mobile", label: "Poster image (mobile)", info: "Optional portrait crop for phones." },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Runners training at dusk against a blue sky" },
      { type: "video", id: "video", label: "Background video", info: "An .mp4/.webm URL, or a YouTube / Vimeo link. Plays muted and looped. Leave empty to use the image." },
      { type: "range", id: "overlay", label: "Overlay darkness", min: 0, max: 90, step: 5, unit: "%", default: 45 },
      { type: "header", label: "Text" },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "New season · Built to move" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "Performance footwear, training gear and kit for every sport — delivered across all 64 districts with cash on delivery." },
      {
        type: "select",
        id: "headline_size",
        label: "Headline size",
        default: "large",
        options: [
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
          { value: "xl", label: "Extra large" },
        ],
      },
      {
        type: "select",
        id: "align",
        label: "Text alignment",
        default: "left",
        options: [
          { value: "left", label: "Bottom left" },
          { value: "center", label: "Centered" },
        ],
      },
      {
        type: "select",
        id: "height",
        label: "Height",
        default: "full",
        options: [
          { value: "full", label: "Full screen" },
          { value: "large", label: "Large" },
          { value: "medium", label: "Medium" },
        ],
      },
      ...buttonFields("button", { label: "Shop new season", link: "/collections/all", style: "accent" }),
      ...buttonFields("button2", { label: "Find your sport", link: "/collections", style: "secondary" }, "Second button"),
      { type: "header", label: "Stat ticker" },
      { type: "checkbox", id: "show_ticker", label: "Show stat ticker", default: true },
      { type: "range", id: "ticker_speed", label: "Ticker speed", min: 10, max: 80, step: 5, unit: "s", default: 35, info: "Seconds per loop — higher is slower." },
    ],
    blocks: [
      {
        type: "line",
        name: "Headline line",
        limit: 4,
        settings: [
          { type: "text", id: "text", label: "Text", default: "Move" },
          {
            type: "select",
            id: "style",
            label: "Style",
            default: "solid",
            options: [
              { value: "solid", label: "Solid" },
              { value: "outline", label: "Outline" },
              { value: "accent", label: "Accent colour" },
            ],
          },
        ],
      },
      {
        type: "stat",
        name: "Ticker stat",
        limit: 8,
        settings: [
          { type: "text", id: "value", label: "Value", default: "64" },
          { type: "text", id: "label", label: "Label", default: "Districts delivered" },
        ],
      },
    ],
    maxBlocks: 12,
    presets: [
      {
        name: "Video hero",
        blocks: [
          { type: "line", settings: { text: "Run", style: "solid" } },
          { type: "line", settings: { text: "Lift", style: "outline" } },
          { type: "line", settings: { text: "Repeat", style: "accent" } },
          { type: "stat", settings: { value: "64", label: "Districts delivered" } },
          { type: "stat", settings: { value: "COD", label: "Pay on delivery" } },
          { type: "stat", settings: { value: "7-day", label: "Easy returns" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const lines = blocks.filter((b) => b.type === "line" && str(b.settings.text));
    const stats = blocks.filter((b) => b.type === "stat" && (str(b.settings.value) || str(b.settings.label)));
    const video = str(s.video);
    const file = video && isVideoFile(video) ? video : "";
    const embed = video && !file ? embedUrl(video, { autoplay: true, muted: true, loop: true }) : null;
    const b1 = readButton(context, s, "button");
    const b2 = readButton(context, s, "button2");
    const center = s.align === "center";
    const overlay = num(s.overlay, 45) / 100;
    const title = lines.map((l) => str(l.settings.text)).join(" ");
    const ticker = bool(s.show_ticker, true) && stats.length > 0;
    const Stat = ({ id }: { id: string }) => {
      const b = stats.find((x) => x.id === id)!;
      return (
        <span className="inline-flex items-baseline gap-2.5 pr-10">
          <span className="font-heading text-2xl leading-none text-pai-accent md:text-3xl">{str(b.settings.value)}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">{str(b.settings.label)}</span>
          <span aria-hidden className="pl-8 text-pai-accent">✕</span>
        </span>
      );
    };

    return (
      <section aria-label={title || "Hero"} className={cn("stride-hero pai-scheme-inverse relative isolate flex overflow-hidden", HEIGHTS[str(s.height, "full")] ?? HEIGHTS.full)}>
        <HeroMedia
          poster={str(s.image)}
          posterMobile={str(s.image_mobile)}
          alt={str(s.image_alt)}
          video={file}
          embed={embed}
          className="absolute inset-0 -z-20"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background: `linear-gradient(0deg, rgba(0,0,0,${Math.min(0.95, overlay + 0.35)}) 0%, rgba(0,0,0,${overlay * 0.6}) 45%, rgba(0,0,0,${overlay * 0.5}) 100%)${center ? "" : `, linear-gradient(90deg, rgba(0,0,0,${overlay * 0.9}) 0%, transparent 70%)`}`,
          }}
        />
        <Container
          width="wide"
          className={cn(
            "relative flex flex-col justify-end pt-[calc(var(--pai-header-h,72px)+3rem)]",
            ticker ? "pb-28 md:pb-32" : "pb-14 md:pb-20",
            center && "items-center text-center",
          )}
        >
          {str(s.eyebrow) ? (
            <p className="stride-kicker mb-5 text-white">
              <span aria-hidden className="stride-kicker-dot" />
              {str(s.eyebrow)}
            </p>
          ) : null}
          {lines.length ? (
            <h1 className={cn("stride-display text-white", SIZES[str(s.headline_size, "large")] ?? SIZES.large)}>
              {lines.map((l) => (
                <span
                  key={l.id}
                  className={cn("block", l.settings.style === "outline" && "stride-outline", l.settings.style === "accent" && "text-pai-accent")}
                >
                  {str(l.settings.text)}
                </span>
              ))}
            </h1>
          ) : null}
          {str(s.subheading) ? <p className={cn("mt-6 max-w-xl text-base text-white/85 md:text-lg", center && "mx-auto")}>{str(s.subheading)}</p> : null}
          {b1 || b2 ? (
            <div className={cn("mt-8 flex flex-wrap gap-3", center && "justify-center")}>
              {b1 ? (
                <ButtonLink href={b1.href} variant={b1.variant} size="lg" className="stride-btn-arrow">
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
        </Container>

        {ticker ? (
          <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/15 bg-black/35 py-4 text-white backdrop-blur-md">
            <ul className="sr-only">
              {stats.map((b) => (
                <li key={b.id}>
                  {str(b.settings.value)} {str(b.settings.label)}
                </li>
              ))}
            </ul>
            <div aria-hidden className="stride-marquee overflow-hidden" style={{ ["--stride-marquee-duration" as string]: `${num(s.ticker_speed, 35)}s` }}>
              <div className="stride-marquee-track">
                {[0, 1].map((copy) => (
                  <div key={copy} className="stride-marquee-group">
                    {[...stats, ...stats].map((b, i) => (
                      <Stat key={`${copy}-${i}`} id={b.id} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    );
  },
});
