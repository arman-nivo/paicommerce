import { defineSection } from "@pai/theme-sdk";
import { Container, ICON_OPTIONS, Icon, SmartLink, cn, paddingField, resolveHref, str } from "@pai/theme-kit";
import { IMG } from "../images";

const SIZE: Record<string, string> = {
  small: "lg:col-span-1 lg:row-span-1",
  wide: "sm:col-span-2 lg:col-span-2 lg:row-span-1",
  tall: "lg:col-span-1 lg:row-span-2",
  large: "sm:col-span-2 lg:col-span-2 lg:row-span-2",
};

export const voltBento = defineSection({
  schema: {
    type: "bento-grid",
    name: "Bento feature grid",
    category: "content",
    icon: "layout-dashboard",
    description: "Dark bento grid mixing image tiles, glowing stat tiles and feature cards.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Why Volt" },
      { type: "text", id: "heading", label: "Heading", default: "Built for people who read spec sheets" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "" },
      paddingField("medium"),
    ],
    blocks: [
      {
        type: "tile",
        name: "Tile",
        limit: 8,
        settings: [
          {
            type: "select",
            id: "size",
            label: "Size",
            default: "small",
            options: [
              { value: "small", label: "Small (1×1)" },
              { value: "wide", label: "Wide (2×1)" },
              { value: "tall", label: "Tall (1×2)" },
              { value: "large", label: "Large (2×2)" },
            ],
          },
          {
            type: "select",
            id: "style",
            label: "Style",
            default: "image",
            options: [
              { value: "image", label: "Image with text" },
              { value: "stat", label: "Big number (glow)" },
              { value: "feature", label: "Icon feature" },
            ],
          },
          { type: "image", id: "image", label: "Image", default: IMG.laptopGlow },
          { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
          { type: "select", id: "icon", label: "Icon (feature style)", default: "shield-check", options: ICON_OPTIONS },
          { type: "text", id: "stat", label: "Big number (stat style)", default: "24h" },
          { type: "text", id: "eyebrow", label: "Eyebrow", default: "" },
          { type: "text", id: "heading", label: "Heading", default: "Tile heading" },
          { type: "textarea", id: "text", label: "Text", default: "" },
          { type: "text", id: "link_label", label: "Link label", default: "" },
          { type: "url", id: "link", label: "Link" },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Bento feature grid",
        blocks: [
          { type: "tile", settings: { size: "large", style: "image", image: IMG.gamingPc, eyebrow: "Gaming", heading: "Frames per second, not seconds per frame", link_label: "Shop gaming", link: "/collections/all" } },
          { type: "tile", settings: { size: "small", style: "stat", stat: "100%", heading: "Genuine products", text: "Sourced from official distributors." } },
          { type: "tile", settings: { size: "small", style: "feature", icon: "truck", heading: "Same-day Dhaka delivery", text: "Order before 2 pm." } },
          { type: "tile", settings: { size: "wide", style: "image", image: IMG.laptopGlow, eyebrow: "Laptops", heading: "Thin, light, ridiculously fast", link_label: "Shop laptops", link: "/collections/all" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const tiles = blocks.filter((b) => b.type === "tile");
    if (!tiles.length) return null;
    const pad = { none: "0", small: "0.5", medium: "1", large: "1.5" }[str(s.padding, "medium")] ?? "1";
    return (
      <section aria-label={str(s.heading) || "Features"} className="pai-section" style={{ ["--pai-section-pad" as string]: pad }}>
        <Container>
          {str(s.heading) || str(s.eyebrow) ? (
            <div className="mb-8 max-w-2xl">
              {str(s.eyebrow) ? <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-pai-primary">{str(s.eyebrow)}</p> : null}
              {str(s.heading) ? <h2 className="pai-h2 mt-2 [text-wrap:balance]">{str(s.heading)}</h2> : null}
              {str(s.subheading) ? <p className="mt-3 opacity-70">{str(s.subheading)}</p> : null}
            </div>
          ) : null}
          <div className="grid auto-rows-[minmax(220px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((b) => {
              const t = b.settings;
              const style = str(t.style, "image");
              const href = resolveHref(context, t.link);
              const label = str(t.link_label);
              const base = cn(
                "group relative isolate flex flex-col overflow-hidden rounded-[calc(var(--pai-radius)*1.6)] border border-pai-border p-6 transition duration-300 hover:border-pai-primary/50",
                SIZE[str(t.size, "small")] ?? SIZE.small,
              );
              const body = (
                <>
                  {style === "image" && str(t.image) ? (
                    <>
                      <img src={str(t.image)} alt={str(t.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 -z-20 size-full object-cover transition duration-700 group-hover:scale-105" />
                      <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
                    </>
                  ) : null}
                  {style === "stat" ? <span aria-hidden className="absolute -right-16 -top-16 -z-10 size-56 rounded-full bg-pai-primary/25 blur-3xl transition group-hover:bg-pai-primary/35" /> : null}
                  {style === "feature" ? (
                    <span className="mb-auto grid size-12 place-items-center rounded-pai border border-pai-border bg-pai-bg text-pai-primary">
                      <Icon name={str(t.icon, "shield-check")} className="size-6" />
                    </span>
                  ) : null}
                  {style === "stat" ? <span className="volt-stat mb-auto font-heading text-6xl font-bold leading-none tracking-tight text-pai-primary md:text-7xl">{str(t.stat)}</span> : null}
                  <span className={cn("mt-auto block", style === "image" && "text-white")}>
                    {str(t.eyebrow) ? <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] opacity-75">{str(t.eyebrow)}</span> : null}
                    {str(t.heading) ? <span className={cn("block font-heading font-bold leading-tight", str(t.size) === "large" ? "text-2xl md:text-4xl" : "text-xl")}>{str(t.heading)}</span> : null}
                    {str(t.text) ? <span className="mt-2 block text-sm opacity-70">{str(t.text)}</span> : null}
                    {label && href ? <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-pai-primary">{label} <span aria-hidden>→</span></span> : null}
                  </span>
                </>
              );
              const bg = style === "image" ? "bg-pai-muted" : "bg-pai-muted/60";
              return href ? (
                <SmartLink key={b.id} href={href} className={cn(base, bg)}>
                  {body}
                </SmartLink>
              ) : (
                <div key={b.id} className={cn(base, bg)}>
                  {body}
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    );
  },
});
