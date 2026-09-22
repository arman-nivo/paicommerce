import { defineSection } from "@pai/theme-sdk";
import { SmartLink, cn, num, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";

const SIZES: Record<string, string> = {
  small: "text-[clamp(2rem,4.5vw,3.5rem)]",
  medium: "text-[clamp(2.75rem,7vw,5.5rem)]",
  large: "text-[clamp(3.5rem,10vw,8.5rem)]",
};

/**
 * Giant scrolling text band — a loud typographic divider between sections. Words alternate
 * solid / outline, separated by a symbol. The motion stops for visitors who prefer reduced motion.
 */
export const strideMarquee = defineSection({
  schema: {
    type: "stride-marquee",
    name: "Scrolling text band",
    category: "marketing",
    icon: "move-horizontal",
    description: "Oversized, looping uppercase words with alternating outline style.",
    settings: [
      { type: "textarea", id: "items", label: "Words", default: "Run faster, Lift heavier, Play harder, Recover smarter", info: "Comma separated." },
      {
        type: "select",
        id: "style",
        label: "Style",
        default: "alternate",
        options: [
          { value: "alternate", label: "Alternate solid / outline" },
          { value: "solid", label: "Solid" },
          { value: "outline", label: "Outline" },
        ],
      },
      {
        type: "select",
        id: "separator",
        label: "Separator",
        default: "✕",
        options: [
          { value: "✕", label: "✕ Cross" },
          { value: "✦", label: "✦ Star" },
          { value: "●", label: "● Dot" },
          { value: "/", label: "/ Slash" },
          { value: "→", label: "→ Arrow" },
        ],
      },
      {
        type: "select",
        id: "size",
        label: "Text size",
        default: "medium",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
      { type: "range", id: "speed", label: "Speed", min: 10, max: 90, step: 5, unit: "s", default: 40, info: "Seconds per loop — higher is slower." },
      {
        type: "select",
        id: "direction",
        label: "Direction",
        default: "left",
        options: [
          { value: "left", label: "Right to left" },
          { value: "right", label: "Left to right" },
        ],
      },
      { type: "checkbox", id: "tilt", label: "Slight tilt", default: false },
      { type: "url", id: "link", label: "Link", info: "Optional — makes the whole band clickable." },
      schemeField("accent"),
    ],
    presets: [{ name: "Scrolling text band" }],
  },
  component: ({ settings: s, context }) => {
    const items = str(s.items)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 12);
    if (!items.length) return null;
    const style = str(s.style, "alternate");
    const sep = str(s.separator, "✕");
    const href = resolveHref(context, s.link);
    const repeated = items.length < 4 ? [...items, ...items, ...items] : [...items, ...items];
    const band = (
      <div
        aria-hidden
        className={cn("stride-marquee py-4 md:py-6", s.direction === "right" && "stride-marquee-reverse")}
        style={{ ["--stride-marquee-duration" as string]: `${num(s.speed, 40)}s` }}
      >
        <div className="stride-marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="stride-marquee-group">
              {repeated.map((w, i) => (
                <span key={`${copy}-${i}`} className={cn("stride-display inline-flex items-center whitespace-nowrap", SIZES[str(s.size, "medium")] ?? SIZES.medium)}>
                  <span className={cn(style === "outline" || (style === "alternate" && i % 2 === 1) ? "stride-outline" : "")}>{w}</span>
                  <span className="px-[0.35em] text-[0.55em] opacity-90">{sep}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
    return (
      <section
        className={cn("stride-band relative overflow-hidden", schemeClass(s.color_scheme), s.tilt ? "py-8" : "")}
      >
        <div className={cn(s.tilt ? "-mx-4 -rotate-2 bg-[inherit] shadow-[0_0_0_1px_var(--pai-border)]" : "")}>
          {href ? (
            <SmartLink href={href} ariaLabel={items.join(", ")} className="block">
              {band}
            </SmartLink>
          ) : (
            band
          )}
        </div>
        {href ? null : <p className="sr-only">{items.join(" · ")}</p>}
      </section>
    );
  },
});
