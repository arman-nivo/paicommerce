/**
 * Cinematic hero: a full-bleed image (or muted MP4 loop) that drifts in a slow Ken Burns zoom,
 * optional letterbox bars edged in gold, a serif headline and a scroll cue. Motion is disabled for
 * visitors who prefer reduced motion and by the "Slow cinematic motion" theme setting.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, bool, buttonFields, cn, isVideoFile, num, readButton, str } from "@pai/theme-kit";
import { Eyebrow } from "./_lumiere";
import { LumiereKeyframes } from "./_keyframes";
import { IMG } from "../images";

export const cinematicHero = defineSection({
  schema: {
    type: "lumiere-hero",
    name: "Cinematic hero",
    category: "hero",
    icon: "clapperboard",
    description: "Full-screen image or video with a slow Ken Burns drift, letterbox bars and a serif headline.",
    settings: [
      { type: "image", id: "image", label: "Image", default: IMG.templeNecklace, info: "Also used as the video poster. Dark, low-key photos work best." },
      { type: "image", id: "mobile_image", label: "Mobile image (optional)", info: "A portrait crop for phones." },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "A 22K gold temple necklace and earrings resting on black velvet" },
      { type: "video", id: "video", label: "Background video (MP4)", info: "Optional. Plays muted and looped; the image is shown until it loads and for reduced-motion visitors." },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "The Bridal Collection · 2026" },
      { type: "textarea", id: "heading", label: "Heading", default: "Gold that remembers\nevery vow" },
      { type: "textarea", id: "text", label: "Text", default: "Hand-finished 22K temple sets, hallmarked and certified — made in our Dhaka atelier for the holud, the wedding and every anniversary after." },
      ...buttonFields("button", { label: "Discover bridal", link: "/collections/bridal", style: "light" }, "Primary button"),
      ...buttonFields("button2", { label: "Book a private viewing", link: "/pages/contact", style: "link" }, "Secondary button"),
      { type: "header", label: "Cinema" },
      {
        type: "select",
        id: "height",
        label: "Height",
        default: "full",
        options: [
          { value: "full", label: "Full screen" },
          { value: "large", label: "Large (80% of screen)" },
          { value: "medium", label: "Medium" },
        ],
      },
      {
        type: "select",
        id: "text_position",
        label: "Text position",
        default: "center",
        options: [
          { value: "center", label: "Centre" },
          { value: "bottom_center", label: "Bottom centre" },
          { value: "bottom_left", label: "Bottom left" },
        ],
      },
      { type: "range", id: "overlay", label: "Darken image", min: 0, max: 80, step: 5, unit: "%", default: 40 },
      { type: "checkbox", id: "ken_burns", label: "Slow Ken Burns zoom", default: true },
      { type: "checkbox", id: "letterbox", label: "Letterbox bars", default: true, info: "Thin black bars top and bottom, edged with a gold hairline." },
      { type: "checkbox", id: "scroll_cue", label: "Show scroll cue", default: true },
      { type: "text", id: "scroll_label", label: "Scroll cue label", default: "Discover" },
    ],
    presets: [
      { name: "Cinematic hero" },
      { name: "Cinematic hero — bottom left", settings: { text_position: "bottom_left", letterbox: false, height: "large" } },
    ],
  },
  component: ({ id, settings: s, context }) => {
    const image = str(s.image) || (context.isPreview ? IMG.templeNecklace : "");
    const mobile = str(s.mobile_image);
    const video = str(s.video);
    const hasVideo = !!video && isVideoFile(video);
    const heading = str(s.heading);
    const b1 = readButton(context, s, "button");
    const b2 = readButton(context, s, "button2");
    const pos = str(s.text_position, "center");
    const letterbox = bool(s.letterbox, true);
    const kb = bool(s.ken_burns, true);
    const h = s.height === "medium" ? "min-h-[560px]" : s.height === "large" ? "min-h-[80svh]" : "min-h-[100svh]";
    const overlay = Math.max(0, Math.min(80, num(s.overlay, 40))) / 100;
    const after = `lumiere-after-${id}`;

    return (
      <section aria-label={heading.replace(/\n/g, " ") || "Hero"} className={cn("lumiere-hero relative isolate flex overflow-hidden bg-[#0b0b0b] text-white", h)}>
        <LumiereKeyframes />
        <div aria-hidden={!str(s.image_alt)} className="absolute inset-0 -z-20 overflow-hidden">
          {image ? (
            <picture>
              {mobile ? <source media="(max-width: 767px)" srcSet={mobile} /> : null}
              <img src={image} alt={str(s.image_alt)} fetchPriority="high" className={cn("absolute inset-0 size-full object-cover", kb && "lumiere-kenburns")} />
            </picture>
          ) : null}
          {hasVideo ? (
            <video className="lumiere-hero-video absolute inset-0 size-full object-cover" src={video} poster={image || undefined} autoPlay muted loop playsInline preload="metadata" aria-hidden />
          ) : null}
        </div>
        <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(180deg, rgb(0 0 0 / ${overlay * 0.9}) 0%, rgb(0 0 0 / ${overlay * 0.55}) 45%, rgb(0 0 0 / ${Math.min(0.9, overlay * 1.4)}) 100%)` }} />
        <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `radial-gradient(ellipse 60% 55% at 50% 50%, rgb(0 0 0 / ${overlay * 0.7}), transparent 75%)` }} />
        {letterbox ? (
          <>
            <span aria-hidden className="lumiere-letterbox absolute inset-x-0 top-0 z-0 h-[5.5vh] bg-[#0b0b0b]" />
            <span aria-hidden className="lumiere-letterbox lumiere-letterbox-bottom absolute inset-x-0 bottom-0 z-0 h-[5.5vh] bg-[#0b0b0b]" />
          </>
        ) : null}

        <div
          className={cn(
            "pai-container relative z-10 flex w-full flex-col py-32",
            pos === "center" && "items-center justify-center text-center",
            pos === "bottom_center" && "items-center justify-end pb-[14vh] text-center",
            pos === "bottom_left" && "items-start justify-end pb-[14vh] text-left",
          )}
        >
          <div className={cn("lumiere-hero-copy flex max-w-4xl flex-col", pos === "bottom_left" ? "items-start" : "items-center")}>
            {str(s.eyebrow) ? (
              <Eyebrow light align={pos === "bottom_left" ? "left" : "center"} className="lumiere-hero-eyebrow">
                {str(s.eyebrow)}
              </Eyebrow>
            ) : null}
            {heading ? (
              <h1 className="pai-h1 lumiere-display whitespace-pre-line text-white">{heading}</h1>
            ) : null}
            {str(s.text) ? <p className="mt-7 max-w-xl text-[0.98rem] leading-relaxed text-white/80 md:text-lg">{str(s.text)}</p> : null}
            {b1 || b2 ? (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {b1 ? (
                  <ButtonLink href={b1.href} variant={b1.variant} size="lg" className="lumiere-hero-btn">
                    {b1.label}
                  </ButtonLink>
                ) : null}
                {b2 ? (
                  <ButtonLink href={b2.href} variant={b2.variant} size="lg" className="text-white">
                    {b2.label}
                  </ButtonLink>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {bool(s.scroll_cue, true) ? (
          <a href={`#${after}`} className="lumiere-scroll absolute bottom-[calc(5.5vh+1.25rem)] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-[0.6rem] uppercase tracking-[0.34em] text-white/75 transition hover:text-white focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white">
            <span>{str(s.scroll_label, "Discover")}</span>
            <span aria-hidden className="lumiere-scroll-line block h-10 w-px bg-white/30" />
          </a>
        ) : null}
        <span id={after} aria-hidden className="absolute bottom-0" />
      </section>
    );
  },
});
