/**
 * Craft regions: a stylised, hand-drawn-style map of Bangladesh with numbered pins (positioned by
 * x/y settings — illustrative, not geographically precise) and an accessible, numbered list of
 * regions with craft, description, photo and link. Pins are links to their list entry.
 */
import { defineSection } from "@pai/theme-sdk";
import { Icon, Section, SmartLink, bool, cn, num, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { Accent, Eyebrow, plain } from "./_artisan";
import { IMG } from "../images";

/** Abstract outline (viewBox 0 0 100 120) — a stylised silhouette, deliberately not a survey map. */
const OUTLINE =
  "M24 4 L31 9 L37 12 L44 15 L50 19 L57 21 L64 19 L72 20 L81 21 L90 24 L91 30 L85 34 L79 37 L77 44 L73 49 L75 55 L80 58 L84 64 L87 73 L89 83 L90 93 L87 104 L84 99 L80 90 L76 81 L71 76 L66 73 L63 80 L57 79 L51 84 L44 82 L37 86 L30 84 L25 80 L23 71 L24 62 L19 56 L15 48 L20 42 L13 36 L16 28 L22 23 L19 15 Z";
const RIVERS = ["M30 12 C 38 26, 44 34, 49 46 S 56 62, 60 78", "M14 44 C 26 46, 38 48, 49 47", "M80 30 C 72 40, 64 46, 58 56"];

export const craftRegions = defineSection({
  schema: {
    type: "craft-regions",
    name: "Craft regions map",
    category: "content",
    icon: "map",
    description: "Stylised Bangladesh map with numbered pins and a list of craft regions (region, craft, description, photo, link).",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Where it's made" },
      { type: "text", id: "heading", label: "Heading", default: "A map of *living crafts*" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "Every district has a craft it's known for. These are the villages and towns our pieces come from." },
      {
        type: "select",
        id: "map_position",
        label: "Map position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      { type: "checkbox", id: "show_rivers", label: "Draw rivers", default: true },
      { type: "checkbox", id: "show_images", label: "Show photos in the list", default: true },
      { type: "text", id: "sea_label", label: "Sea label", default: "Bay of Bengal" },
      { type: "text", id: "map_note", label: "Map note", default: "Illustrative map — not to scale." },
      schemeField("muted"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "region",
        name: "Region",
        limit: 10,
        settings: [
          { type: "text", id: "craft", label: "Craft", default: "Nakshi kantha" },
          { type: "text", id: "region", label: "Region", default: "Jamalpur" },
          { type: "textarea", id: "text", label: "Description", default: "Layers of old saris quilted with running stitches into storytelling motifs." },
          { type: "image", id: "image", label: "Photo" },
          { type: "text", id: "image_alt", label: "Photo description (alt text)", default: "" },
          { type: "range", id: "x", label: "Pin — horizontal position", min: 0, max: 100, step: 1, unit: "%", default: 44 },
          { type: "range", id: "y", label: "Pin — vertical position", min: 0, max: 100, step: 1, unit: "%", default: 24 },
          { type: "collection", id: "collection", label: "Link to collection" },
          { type: "url", id: "link", label: "Custom link", info: "Overrides the collection link." },
        ],
      },
    ],
    maxBlocks: 10,
    presets: [
      {
        name: "Craft regions map",
        blocks: [
          { type: "region", settings: { craft: "Nakshi kantha", region: "Jamalpur", x: 44, y: 23, text: "Old saris layered and quilted with running stitch into storytelling motifs.", image: IMG.rustBedspread } },
          { type: "region", settings: { craft: "Jamdani weaving", region: "Rupganj, Narayanganj", x: 56, y: 43, text: "Featherlight muslin with motifs woven in by hand on pit looms — a UNESCO-listed tradition.", image: IMG.yarn } },
          { type: "region", settings: { craft: "Brass & bell-metal", region: "Dhamrai", x: 47, y: 41, text: "Lost-wax casting and hand-hammered kansa, passed down through families of smiths.", image: IMG.metalsmith } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const regions = blocks.filter((b) => b.type === "region" && str(b.settings.craft));
    if (!regions.length) return null;
    // Only link collections that exist in this store (defaults reference the demo catalogue).
    const cols = await Promise.all(regions.map((b) => (str(b.settings.collection) ? context.data.getCollection(str(b.settings.collection)).catch(() => null) : Promise.resolve(null))));
    const heading = str(s.heading);
    const right = s.map_position === "right";
    const showImages = bool(s.show_images, true);
    return (
      <Section settings={s} ariaLabel={plain(heading) || "Craft regions"} className="artisan-paper">
        <div className="mb-12 max-w-2xl">
          {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
          {heading ? (
            <h2 className="pai-h2">
              <Accent text={heading} />
            </h2>
          ) : null}
          {str(s.subheading) ? <p className="mt-4 max-w-xl opacity-75">{str(s.subheading)}</p> : null}
        </div>
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <figure className={cn("artisan-map-card relative mx-auto w-full max-w-[34rem] p-5 sm:p-8 lg:sticky lg:top-32", right && "lg:order-2")}>
            <div className="relative aspect-[5/6]">
              <svg viewBox="0 0 100 120" className="absolute inset-0 size-full" role="img" aria-label="Stylised map of Bangladesh showing craft regions">
                <path d={OUTLINE} className="artisan-map-land" strokeLinejoin="round" />
                {bool(s.show_rivers, true)
                  ? RIVERS.map((d, i) => <path key={i} d={d} className="artisan-map-river" fill="none" strokeLinecap="round" />)
                  : null}
                <g className="artisan-map-compass" transform="translate(88 8)">
                  <path d="M0 -5 L2 2 L0 0.6 L-2 2 Z" />
                  <text y="9" textAnchor="middle" fontSize="4.5">N</text>
                </g>
              </svg>
              {str(s.sea_label) ? <span aria-hidden className="artisan-hand absolute bottom-[3%] left-[40%] -translate-x-1/2 text-xl opacity-60 sm:text-2xl">{str(s.sea_label)}</span> : null}
              {regions.map((b, i) => {
                const x = Math.max(3, Math.min(97, num(b.settings.x, 50)));
                const y = Math.max(3, Math.min(97, num(b.settings.y, 50)));
                return (
                  <a
                    key={b.id}
                    href={`#region-${b.id}`}
                    className="artisan-pin group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={`${i + 1}. ${str(b.settings.craft)} — ${str(b.settings.region)}`}
                  >
                    <span className="artisan-pin-dot grid size-7 place-items-center rounded-full text-[11px] font-semibold">{i + 1}</span>
                    <span aria-hidden className={cn("artisan-pin-label pointer-events-none absolute top-1/2 hidden -translate-y-1/2 whitespace-nowrap px-2.5 py-1 text-xs group-hover:block group-focus-visible:block", x > 60 ? "right-9" : "left-9")}>
                      {str(b.settings.craft)} · {str(b.settings.region)}
                    </span>
                  </a>
                );
              })}
            </div>
            {str(s.map_note) ? <figcaption className="mt-3 text-center text-[11px] italic opacity-55">{str(s.map_note)}</figcaption> : null}
          </figure>

          <ol className="artisan-regions">
            {regions.map((b, i) => {
              const bs = b.settings;
              const href = resolveHref(context, bs.link) || cols[i]?.url || "";
              return (
                <li key={b.id} id={`region-${b.id}`} className="artisan-region grid scroll-mt-40 grid-cols-[auto_1fr] gap-x-5 py-6 sm:grid-cols-[auto_1fr_auto]">
                  <span aria-hidden className="artisan-region-num grid size-9 place-items-center rounded-full text-sm font-semibold">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] opacity-60">
                      <Icon name="map-pin" className="-mt-0.5 mr-1 inline size-3.5" />
                      {str(bs.region)}
                    </p>
                    <h3 className="mt-1 font-heading text-2xl leading-tight">{str(bs.craft)}</h3>
                    {str(bs.text) ? <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed opacity-75">{str(bs.text)}</p> : null}
                    {href ? (
                      <SmartLink href={href} className="artisan-arrow-link mt-3 inline-flex items-center gap-1.5 text-sm font-medium" ariaLabel={`Shop ${str(bs.craft)}`}>
                        Shop {str(bs.craft).toLowerCase()} <Icon name="arrow-right" className="size-4" />
                      </SmartLink>
                    ) : null}
                  </div>
                  {showImages && str(bs.image) ? (
                    <span className="artisan-mat col-start-2 mt-4 block w-28 sm:col-start-3 sm:mt-0 sm:w-32">
                      <span className="relative block aspect-square overflow-hidden bg-pai-muted">
                        <img src={str(bs.image)} alt={str(bs.image_alt)} loading="lazy" className="absolute inset-0 size-full object-cover" />
                      </span>
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </Section>
    );
  },
});
