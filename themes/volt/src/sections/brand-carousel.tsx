import { defineSection } from "@pai/theme-sdk";
import { Container, SmartLink, cn, num, paddingField, resolveHref, str } from "@pai/theme-kit";

/**
 * Brand carousel: logos (or crisp wordmarks when no logo is uploaded) in an endless marquee or a
 * static grid. Each brand links to a collection or a search for the brand name.
 */
export const voltBrandCarousel = defineSection({
  schema: {
    type: "brand-carousel",
    name: "Brand carousel",
    category: "social-proof",
    icon: "badge-check",
    description: "Official brands as an auto-scrolling marquee or grid. Leave the logo empty to show a wordmark.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Authorised reseller" },
      { type: "text", id: "heading", label: "Heading", default: "Shop by brand" },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "marquee",
        options: [
          { value: "marquee", label: "Auto-scrolling marquee" },
          { value: "grid", label: "Grid" },
        ],
      },
      { type: "range", id: "speed", label: "Marquee duration", min: 15, max: 90, step: 5, unit: "s", default: 40 },
      { type: "checkbox", id: "grayscale", label: "Monochrome logos (colour on hover)", default: true },
      paddingField("small"),
    ],
    blocks: [
      {
        type: "brand",
        name: "Brand",
        limit: 24,
        settings: [
          { type: "text", id: "name", label: "Brand name", default: "Brand" },
          { type: "image", id: "logo", label: "Logo", info: "Transparent PNG/SVG works best. Leave empty for a wordmark." },
          { type: "url", id: "link", label: "Link", info: "Defaults to a search for the brand name." },
        ],
      },
    ],
    presets: [
      {
        name: "Brand carousel",
        blocks: ["Apple", "Samsung", "Sony", "Xiaomi", "ASUS", "Dell", "JBL", "DJI", "Canon", "NVIDIA", "Keychron"].map((name) => ({ type: "brand", settings: { name } })),
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const brands = blocks
      .filter((b) => b.type === "brand" && str(b.settings.name))
      .map((b) => ({
        id: b.id,
        name: str(b.settings.name),
        logo: str(b.settings.logo),
        href: resolveHref(context, b.settings.link) || context.url(`/search?q=${encodeURIComponent(str(b.settings.name))}`),
      }));
    if (!brands.length) return null;
    const pad = { none: "0", small: "0.5", medium: "1", large: "1.5" }[str(s.padding, "small")] ?? "0.5";
    const mono = s.grayscale !== false;
    const tileClass = cn(
      "group flex h-20 min-w-40 items-center justify-center rounded-pai border border-pai-border bg-pai-muted/40 px-6 transition hover:border-pai-primary/60 hover:bg-pai-muted",
      mono && "[&_img]:opacity-60 [&_img]:grayscale hover:[&_img]:opacity-100 hover:[&_img]:grayscale-0",
    );
    const Mark = ({ b }: { b: (typeof brands)[number] }) =>
      b.logo ? (
        <img src={b.logo} alt={b.name} loading="lazy" className="max-h-9 w-auto max-w-[120px] object-contain" />
      ) : (
        <span className="font-heading text-xl font-bold tracking-tight opacity-60 transition group-hover:text-pai-primary group-hover:opacity-100">{b.name}</span>
      );
    // Marquee duplicates are decorative: not links, hidden from assistive tech.
    const Tile = ({ b, hidden }: { b: (typeof brands)[number]; hidden?: boolean }) =>
      hidden ? (
        <div className={tileClass}>
          <Mark b={b} />
        </div>
      ) : (
        <SmartLink href={b.href} ariaLabel={`Shop ${b.name}`} className={tileClass}>
          <Mark b={b} />
        </SmartLink>
      );
    return (
      <section aria-label={str(s.heading) || "Brands"} className="pai-section" style={{ ["--pai-section-pad" as string]: pad }}>
        <Container>
          {str(s.heading) || str(s.eyebrow) ? (
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                {str(s.eyebrow) ? <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-pai-primary">{str(s.eyebrow)}</p> : null}
                {str(s.heading) ? <h2 className="pai-h3 mt-1">{str(s.heading)}</h2> : null}
              </div>
            </div>
          ) : null}
          {s.layout === "grid" ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {brands.map((b) => (
                <li key={b.id}>
                  <Tile b={b} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
              <ul
                className="animate-pai-marquee flex w-max gap-3 pr-3 hover:[animation-play-state:paused] motion-reduce:animate-none"
                style={{ ["--pai-marquee-duration" as string]: `${num(s.speed, 40)}s` }}
              >
                {[...brands, ...brands].map((b, i) => (
                  <li key={`${b.id}-${i}`} aria-hidden={i >= brands.length || undefined}>
                    <Tile b={b} hidden={i >= brands.length} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>
    );
  },
});
