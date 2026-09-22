import { defineSection, type SfCollection } from "@pai/theme-sdk";
import { SmartLink, bool, cn, heroPositionClasses, num, resolveHref, str } from "@pai/theme-kit";
import { IMG } from "../images";

const HEIGHTS: Record<string, string> = {
  medium: "min-h-[380px] md:min-h-[520px]",
  large: "min-h-[460px] md:min-h-[680px]",
  tall: "min-h-[520px] md:min-h-[820px]",
};

/** Two or three side-by-side campaign panels (e.g. Women / Men), each linking to a collection. */
export const splitBanner = defineSection({
  schema: {
    type: "split-banner",
    name: "Split collection banner",
    category: "collections",
    icon: "columns-2",
    description: "Side-by-side image panels that link to collections.",
    settings: [
      {
        type: "select",
        id: "height",
        label: "Height",
        default: "large",
        options: [
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
          { value: "tall", label: "Tall" },
        ],
      },
      {
        type: "select",
        id: "text_position",
        label: "Text position",
        default: "bottom-left",
        options: [
          { value: "bottom-left", label: "Bottom left" },
          { value: "bottom-center", label: "Bottom center" },
          { value: "middle-center", label: "Center" },
          { value: "top-left", label: "Top left" },
        ],
      },
      { type: "range", id: "overlay", label: "Overlay opacity", min: 0, max: 80, step: 5, unit: "%", default: 30 },
      { type: "checkbox", id: "full_width", label: "Full width", default: true },
      { type: "checkbox", id: "gap", label: "Space between panels", default: false },
    ],
    blocks: [
      {
        type: "panel",
        name: "Panel",
        limit: 3,
        settings: [
          { type: "collection", id: "collection", label: "Collection", info: "Sets the link, and the image/title when left empty." },
          { type: "image", id: "image", label: "Image" },
          { type: "text", id: "eyebrow", label: "Eyebrow", default: "" },
          { type: "text", id: "heading", label: "Heading", default: "" },
          { type: "text", id: "link_label", label: "Link label", default: "Shop now" },
          { type: "url", id: "link", label: "Link", info: "Overrides the collection link." },
        ],
      },
    ],
    maxBlocks: 3,
    presets: [
      {
        name: "Split collection banner",
        blocks: [
          { type: "panel", settings: { image: IMG.editorialWoman, eyebrow: "New in", heading: "Women", link: "/collections/all" } },
          { type: "panel", settings: { image: IMG.editorialMan, eyebrow: "New in", heading: "Men", link: "/collections/all" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const panels = blocks.filter((b) => b.type === "panel");
    if (!panels.length) return null;
    const cols = await Promise.all(
      panels.map((b) => (str(b.settings.collection) ? context.data.getCollection(str(b.settings.collection)).catch(() => null) : Promise.resolve(null as SfCollection | null))),
    );
    const fallbacks = [IMG.editorialWoman, IMG.editorialMan, IMG.detail];
    const items = panels
      .map((b, i) => {
        const bs = b.settings;
        const c = cols[i];
        const image = str(bs.image) || c?.image?.url || (context.isPreview || !c ? fallbacks[i % fallbacks.length]! : "");
        const heading = str(bs.heading) || c?.title || "";
        const href = str(bs.link) ? resolveHref(context, bs.link) : c?.url ?? context.url("/collections/all");
        return { id: b.id, image, heading, eyebrow: str(bs.eyebrow), label: str(bs.link_label), href };
      })
      .filter((p) => p.heading || p.image);
    if (!items.length) return null;
    const h = HEIGHTS[str(s.height, "large")] ?? HEIGHTS.large;
    const gap = bool(s.gap);
    const full = bool(s.full_width, true);
    const overlay = num(s.overlay, 30) / 100;
    const pos = str(s.text_position, "bottom-left");
    return (
      <section aria-label="Featured collections" className={cn(!full && "pai-container", gap && "py-4")}>
        <div className={cn("grid", items.length === 3 ? "md:grid-cols-3" : items.length === 2 ? "md:grid-cols-2" : "", gap && "gap-4")}>
          {items.map((p, i) => (
            <SmartLink key={p.id} href={p.href} className={cn("group relative isolate flex overflow-hidden text-white", h, (gap || !full) && "rounded-pai")}>
              {p.image ? (
                <img src={p.image} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async" className="absolute inset-0 -z-20 size-full object-cover transition duration-[1200ms] ease-out group-hover:scale-[1.03]" />
              ) : (
                <span className="absolute inset-0 -z-20 bg-pai-muted" />
              )}
              <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(to top, rgba(0,0,0,${Math.min(0.85, overlay * 2)}), rgba(0,0,0,${overlay / 3}) 55%, rgba(0,0,0,0))` }} />
              <span className={cn("w-full p-8 md:p-12", heroPositionClasses(pos))}>
                {p.eyebrow ? <span className="mb-3 block text-xs font-medium uppercase tracking-[0.28em] opacity-90">{p.eyebrow}</span> : null}
                {p.heading ? <span className="block font-heading text-[calc(clamp(2rem,4vw,3.5rem)*var(--pai-heading-scale))] leading-none [text-transform:var(--pai-heading-transform,none)]">{p.heading}</span> : null}
                {p.label ? (
                  <span className="mt-5 inline-block border-b border-white/70 pb-1 text-xs font-semibold uppercase tracking-[0.2em] transition group-hover:border-white">{p.label}</span>
                ) : null}
              </span>
            </SmartLink>
          ))}
        </div>
      </section>
    );
  },
});
