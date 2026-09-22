/**
 * Shop by room: large landscape room tiles (one block per room) with the room name, a short line
 * and a live product count from the linked collection. Mosaic (first room spans two rows) or grid.
 * Without blocks it lists the store's collections.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Icon, SAMPLE_COLLECTIONS, Section, SmartLink, bool, buttonFields, cn, num, paddingField, readButton, resolveHref, schemeField, str } from "@pai/theme-kit";
import { NestHeading, piecesLabel } from "./_nest";
import { IMG } from "../images";

type Tile = { id: string; title: string; text: string; image: string; alt: string; href: string; count: number | null };

export const roomTiles = defineSection({
  schema: {
    type: "room-tiles",
    name: "Shop by room",
    category: "collections",
    icon: "house",
    description: "Large room tiles linked to collections, with live product counts.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Shop by room" },
      { type: "text", id: "heading", label: "Heading", default: "Start with the room you live in most" },
      { type: "textarea", id: "subheading", label: "Text", default: "" },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "mosaic",
        options: [
          { value: "mosaic", label: "Mosaic — first room large" },
          { value: "grid", label: "Even grid" },
          { value: "row", label: "Scrolling row" },
        ],
      },
      { type: "range", id: "columns", label: "Columns (grid)", min: 2, max: 4, step: 1, default: 3 },
      { type: "checkbox", id: "show_counts", label: "Show number of pieces", default: true },
      {
        type: "select",
        id: "text_style",
        label: "Titles",
        default: "below",
        options: [
          { value: "below", label: "Below the image" },
          { value: "overlay", label: "On the image" },
        ],
      },
      ...buttonFields("button", { label: "All collections", link: "/collections", style: "link" }),
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "room",
        name: "Room",
        limit: 8,
        settings: [
          { type: "collection", id: "collection", label: "Collection" },
          { type: "text", id: "title", label: "Title", default: "", info: "Defaults to the collection title." },
          { type: "text", id: "text", label: "Short line", default: "" },
          { type: "image", id: "image", label: "Image", info: "Defaults to the collection image." },
          { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
          { type: "url", id: "link", label: "Link", info: "Defaults to the collection." },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Shop by room",
        blocks: [
          { type: "room", settings: { title: "Living room", text: "Sofas, armchairs & rugs", image: IMG.livingWarm } },
          { type: "room", settings: { title: "Bedroom", text: "Beds, bedside & linen", image: IMG.bedRust } },
          { type: "room", settings: { title: "Dining", text: "Tables & chairs", image: IMG.diningBoho } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const rooms = blocks.filter((b) => b.type === "room");
    const showCounts = bool(s.show_counts, true);
    let tiles: Tile[] = [];
    if (rooms.length) {
      const cols = await Promise.all(rooms.map((b) => (str(b.settings.collection) ? context.data.getCollection(str(b.settings.collection)).catch(() => null) : Promise.resolve(null))));
      tiles = rooms.map((b, i) => {
        const c = cols[i];
        return {
          id: b.id,
          title: str(b.settings.title) || c?.title || "",
          text: str(b.settings.text),
          image: str(b.settings.image) || c?.image?.url || "",
          alt: str(b.settings.image_alt),
          href: resolveHref(context, b.settings.link) || c?.url || context.url("/collections"),
          count: showCounts && c ? c.productsCount : null,
        };
      });
    } else {
      const cols = await context.data.getCollections({ limit: 6 }).catch(() => []);
      const list = cols.length ? cols : context.isPreview ? SAMPLE_COLLECTIONS : [];
      tiles = list.map((c) => ({ id: c.id, title: c.title, text: "", image: c.image?.url ?? "", alt: c.image?.alt ?? "", href: c.url, count: showCounts ? c.productsCount : null }));
    }
    tiles = tiles.filter((t) => t.title && (t.count === null || t.count > 0 || context.isPreview || !showCounts));
    if (!tiles.length) return null;

    const layout = str(s.layout, "mosaic");
    const overlay = s.text_style === "overlay";
    const btn = readButton(context, s, "button");
    const columns = Math.max(2, Math.min(4, num(s.columns, 3)));

    const card = (t: Tile, big = false) => (
      <SmartLink href={t.href} className={cn("group flex h-full flex-col", layout === "row" && "w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-[30vw]")}>
        <span className={cn("relative block overflow-hidden rounded-pai bg-pai-muted", big ? "aspect-[4/3] lg:aspect-auto lg:flex-1" : "aspect-[4/3]")}>
          {t.image ? <img src={t.image} alt={t.alt} loading="lazy" decoding="async" className="nest-zoom absolute inset-0 size-full object-cover" /> : null}
          {overlay ? (
            <>
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white md:p-7">
                <span>
                  <span className={cn("block font-heading leading-tight", big ? "text-3xl md:text-4xl" : "text-2xl")}>{t.title}</span>
                  {t.text ? <span className="mt-1 block text-sm opacity-85">{t.text}</span> : null}
                </span>
                {t.count !== null ? <span className="shrink-0 rounded-full border border-white/50 px-3 py-1 text-xs backdrop-blur-sm">{piecesLabel(t.count)}</span> : null}
              </span>
            </>
          ) : null}
        </span>
        {overlay ? null : (
          <span className="mt-4 flex items-start justify-between gap-4 border-b border-pai-border pb-4">
            <span className="min-w-0">
              <span className={cn("block font-heading leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4", big ? "text-2xl md:text-3xl" : "text-xl md:text-2xl")}>{t.title}</span>
              {t.text ? <span className="mt-1 block text-sm opacity-65">{t.text}</span> : null}
            </span>
            <span className="flex shrink-0 items-center gap-3 pt-1 text-sm">
              {t.count !== null ? <span className="opacity-60">{piecesLabel(t.count)}</span> : null}
              <span className="grid size-8 place-items-center rounded-full border border-pai-border transition group-hover:border-pai-fg group-hover:bg-pai-fg group-hover:text-pai-bg">
                <Icon name="arrow-right" className="size-4" />
              </span>
            </span>
          </span>
        )}
      </SmartLink>
    );

    const action = btn ? (
      <ButtonLink href={btn.href} variant={btn.variant}>
        {btn.label}
      </ButtonLink>
    ) : null;

    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Shop by room"}>
        <NestHeading eyebrow={str(s.eyebrow)} heading={str(s.heading)} text={str(s.subheading)} action={action} />
        {layout === "row" ? (
          <ul className="pai-no-scrollbar pai-snap-x -mx-4 flex gap-6 overflow-x-auto px-4 pb-2 md:-mx-8 md:px-8">
            {tiles.map((t) => (
              <li key={t.id}>{card(t)}</li>
            ))}
          </ul>
        ) : layout === "mosaic" && tiles.length >= 3 ? (
          <ul className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {tiles.map((t, i) => (
              <li key={t.id} className={cn(i === 0 && "md:col-span-2 lg:row-span-2")}>
                {card(t, i === 0)}
              </li>
            ))}
          </ul>
        ) : (
          <ul className={cn("grid gap-x-6 gap-y-10 sm:grid-cols-2", columns === 3 && "lg:grid-cols-3", columns === 4 && "lg:grid-cols-4")}>
            {tiles.map((t) => (
              <li key={t.id}>{card(t)}</li>
            ))}
          </ul>
        )}
      </Section>
    );
  },
});
