import { defineSection, type SfCollection } from "@pai/theme-sdk";
import { Section, SmartLink, bool, cn, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { ArrowUpRight } from "lucide-react";
import { IMG } from "../images";

const GRID: Record<string, string> = {
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
  "6": "sm:grid-cols-2 lg:grid-cols-3",
};

/**
 * Shop-by-sport tiles: one block per sport with image, big uppercase label, index number and
 * product count. Each tile links to its collection (or a custom link); missing collections fall
 * back to "shop all" so the tile never dead-ends.
 */
export const strideSportTiles = defineSection({
  schema: {
    type: "stride-sport-tiles",
    name: "Shop by sport",
    category: "collections",
    icon: "trophy",
    description: "Image tiles per sport with giant labels, index numbers and hover motion.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Choose your game" },
      { type: "text", id: "heading", label: "Heading", default: "Shop by sport" },
      { type: "text", id: "link_label", label: "Link label", default: "All sports" },
      { type: "url", id: "link", label: "Link", default: "/collections" },
      {
        type: "select",
        id: "columns",
        label: "Columns (desktop)",
        default: "3",
        options: [
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
      {
        type: "select",
        id: "ratio",
        label: "Tile shape",
        default: "portrait",
        options: [
          { value: "portrait", label: "Portrait" },
          { value: "square", label: "Square" },
          { value: "landscape", label: "Landscape" },
        ],
      },
      { type: "checkbox", id: "feature_first", label: "Make the first tile large", default: true },
      { type: "checkbox", id: "show_numbers", label: "Show index numbers", default: true },
      { type: "checkbox", id: "show_count", label: "Show product count", default: true },
      schemeField(),
      paddingField(),
    ],
    blocks: [
      {
        type: "sport",
        name: "Sport",
        limit: 12,
        settings: [
          { type: "collection", id: "collection", label: "Collection" },
          { type: "text", id: "title", label: "Label", default: "Running", info: "Defaults to the collection title." },
          { type: "text", id: "caption", label: "Caption", default: "Road, track & trail" },
          { type: "image", id: "image", label: "Image", default: IMG.sprint, info: "Defaults to the collection image." },
          { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
          { type: "url", id: "link", label: "Custom link", info: "Overrides the collection link." },
        ],
      },
    ],
    maxBlocks: 12,
    presets: [
      {
        name: "Shop by sport",
        blocks: [
          { type: "sport", settings: { collection: "running", title: "Running", caption: "Road, track & trail", image: IMG.sprint } },
          { type: "sport", settings: { collection: "gym-training", title: "Gym & training", caption: "Strength & conditioning", image: IMG.deadlift } },
          { type: "sport", settings: { collection: "football-cricket", title: "Football & cricket", caption: "Match-day ready", image: IMG.batsman } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const sports = blocks.filter((b) => b.type === "sport");
    if (!sports.length) return null;
    const cols = await Promise.all(
      sports.map((b) => (str(b.settings.collection) ? context.data.getCollection(str(b.settings.collection)).catch(() => null) : Promise.resolve(null as SfCollection | null))),
    );
    const ratio = str(s.ratio, "portrait");
    const aspect = ratio === "square" ? "aspect-square" : ratio === "landscape" ? "aspect-[4/3]" : "aspect-[3/4]";
    const feature = bool(s.feature_first, true) && sports.length >= 3;
    const link = resolveHref(context, s.link);
    const heading = str(s.heading);

    return (
      <Section settings={s} ariaLabel={heading || "Shop by sport"} width="wide">
        {heading || str(s.eyebrow) ? (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
            <div>
              {str(s.eyebrow) ? <p className="stride-kicker mb-3">{str(s.eyebrow)}</p> : null}
              {heading ? <h2 className="pai-h1">{heading}</h2> : null}
            </div>
            {str(s.link_label) && link ? (
              <SmartLink href={link} className="stride-link">
                {str(s.link_label)}
              </SmartLink>
            ) : null}
          </div>
        ) : null}
        <ul className={cn("grid grid-cols-1 gap-3 md:gap-4", GRID[str(s.columns, "3")] ?? GRID["3"])}>
          {sports.map((b, i) => {
            const bs = b.settings;
            const c = cols[i];
            const title = str(bs.title) || c?.title || "Shop";
            const href = resolveHref(context, bs.link) || c?.url || context.url("/collections/all");
            const image = str(bs.image) || c?.image?.url || "";
            const big = feature && i === 0;
            return (
              <li key={b.id} className={cn(big && "sm:col-span-2 lg:col-span-2 lg:row-span-2")}>
                <SmartLink
                  href={href}
                  className={cn("stride-tile group relative isolate flex h-full min-h-[18rem] flex-col justify-end overflow-hidden bg-pai-fg p-5 text-white md:p-7", big ? "aspect-[4/5] sm:aspect-auto" : aspect)}
                >
                  {image ? (
                    <img src={image} alt={str(bs.image_alt)} loading={i < 3 ? "eager" : "lazy"} decoding="async" className="stride-tile-img absolute inset-0 -z-20 size-full object-cover" />
                  ) : null}
                  <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/25 to-black/5 transition duration-500 group-hover:from-black/90" />
                  {bool(s.show_numbers, true) ? (
                    <span aria-hidden className="stride-outline absolute right-4 top-2 font-heading text-6xl leading-none opacity-80 md:text-7xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  ) : null}
                  <span className="flex items-end justify-between gap-4">
                    <span className="min-w-0">
                      {str(bs.caption) ? <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">{str(bs.caption)}</span> : null}
                      <span className={cn("stride-tile-title block font-heading uppercase leading-[0.9]", big ? "text-[clamp(3rem,6vw,6rem)]" : "text-[clamp(2.25rem,3.6vw,3.5rem)]")}>{title}</span>
                      {bool(s.show_count, true) && c && c.productsCount > 0 ? (
                        <span className="mt-2 block text-xs font-medium text-white/70">{c.productsCount} products</span>
                      ) : null}
                    </span>
                    <span aria-hidden className="stride-tile-arrow grid size-12 shrink-0 place-items-center bg-pai-accent text-[var(--stride-accent-fg)]">
                      <ArrowUpRight className="size-6" />
                    </span>
                  </span>
                </SmartLink>
              </li>
            );
          })}
        </ul>
      </Section>
    );
  },
});
