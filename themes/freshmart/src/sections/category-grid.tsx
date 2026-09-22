/** "Shop by category": collection tiles on soft tinted backgrounds with item counts. */
import { defineSection, type SfCollection } from "@pai/theme-sdk";
import { Icon, SAMPLE_COLLECTIONS, Section, SectionHeading, SmartLink, cn, headingFields, num, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { iconFor } from "./header";
import { TINT_OPTIONS, tintAt } from "./_tints";

const COLS: Record<number, string> = {
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
};

export const categoryGrid = defineSection({
  schema: {
    type: "category-icon-grid",
    name: "Category icon grid",
    category: "collections",
    icon: "layout-grid",
    description: "Colourful category tiles with photos or icons and item counts.",
    settings: [
      ...headingFields({ heading: "Shop by category", subheading: "" }),
      {
        type: "select",
        id: "style",
        label: "Tile style",
        default: "photo",
        options: [
          { value: "photo", label: "Photo in a round tile" },
          { value: "icon", label: "Icon only" },
        ],
      },
      { type: "range", id: "columns", label: "Columns (desktop)", min: 4, max: 8, step: 1, default: 6 },
      { type: "range", id: "limit", label: "Categories when no blocks are added", min: 3, max: 16, step: 1, default: 12 },
      { type: "checkbox", id: "show_count", label: "Show item counts", default: true },
      { type: "checkbox", id: "page_title", label: "Use heading as the page title (h1)", default: false, info: "Turn on when this is the main section of a page, e.g. the collections list." },
      { type: "text", id: "view_all_label", label: "“View all” label", default: "All categories" },
      schemeField(),
      paddingField("medium"),
    ],
    blocks: [
      {
        type: "category",
        name: "Category",
        settings: [
          { type: "collection", id: "collection", label: "Collection" },
          { type: "text", id: "label", label: "Label", info: "Defaults to the collection title." },
          { type: "image", id: "image", label: "Image", info: "Defaults to the collection image." },
          { type: "text", id: "icon", label: "Icon (icon style)", info: "lucide icon name; picked automatically when empty." },
          { type: "select", id: "tint", label: "Background", default: "auto", options: TINT_OPTIONS },
          { type: "url", id: "link", label: "Link", info: "Overrides the collection link." },
        ],
      },
    ],
    maxBlocks: 16,
    presets: [{ name: "Category icon grid" }, { name: "Category icons (compact)", settings: { style: "icon", columns: 8 } }],
  },
  component: async ({ settings: s, blocks, context }) => {
    const cats = blocks.filter((b) => b.type === "category");
    type Tile = { id: string; label: string; image: string; icon: string; tint: unknown; href: string; count: number | null };
    let tiles: Tile[] = [];
    if (cats.length) {
      const cols = await Promise.all(cats.map((b) => (str(b.settings.collection) ? context.data.getCollection(str(b.settings.collection)).catch(() => null) : Promise.resolve(null as SfCollection | null))));
      tiles = cats.map((b, i) => {
        const c = cols[i];
        const label = str(b.settings.label) || c?.title || "";
        return {
          id: b.id,
          label,
          image: str(b.settings.image) || c?.image?.url || "",
          icon: str(b.settings.icon) || iconFor(label),
          tint: b.settings.tint,
          href: str(b.settings.link) ? resolveHref(context, b.settings.link) : c?.url ?? context.url("/collections/all"),
          count: c?.productsCount ?? null,
        };
      });
    } else {
      let cols = await context.data.getCollections({ limit: num(s.limit, 12) }).catch(() => [] as SfCollection[]);
      if (!cols.length && context.isPreview) cols = SAMPLE_COLLECTIONS;
      tiles = cols.map((c) => ({ id: c.id, label: c.title, image: c.image?.url ?? "", icon: iconFor(c.title), tint: "auto", href: c.url, count: c.productsCount }));
    }
    tiles = tiles.filter((t) => t.label);
    if (!tiles.length) return null;
    const photo = str(s.style, "photo") === "photo";
    const columns = Math.min(8, Math.max(4, num(s.columns, 6)));
    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Categories"}>
        <SectionHeading
          eyebrow={str(s.eyebrow)}
          title={str(s.heading)}
          subtitle={str(s.subheading)}
          align={s.heading_align === "center" ? "center" : "left"}
          size={s.page_title === true ? "h1" : "h2"}
          action={str(s.view_all_label) && s.heading_align !== "center" ? { label: str(s.view_all_label), href: context.url("/collections") } : null}
        />
        <ul className={cn("grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:gap-4", COLS[columns])}>
          {tiles.map((t, i) => (
            <li key={t.id}>
              <SmartLink href={t.href} className="group flex h-full flex-col items-center gap-2 rounded-pai p-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary md:p-3" style={{ background: tintAt(t.tint, i) }}>
                <span className={cn("relative grid w-full place-items-center overflow-hidden", photo ? "aspect-square rounded-[calc(var(--pai-radius)-2px)]" : "aspect-[4/3]")}>
                  {photo && t.image ? (
                    <img src={t.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-110" />
                  ) : (
                    <span className="grid size-14 place-items-center rounded-full bg-white/80 text-emerald-800 shadow-sm transition group-hover:-translate-y-0.5 md:size-16">
                      <Icon name={t.icon} className="size-7 md:size-8" strokeWidth={1.6} />
                    </span>
                  )}
                </span>
                <span className="text-[0.8rem] font-bold leading-tight text-neutral-900 md:text-sm">{t.label}</span>
                {s.show_count !== false && t.count ? <span className="-mt-1.5 text-[11px] text-neutral-600">{t.count} items</span> : null}
              </SmartLink>
            </li>
          ))}
        </ul>
      </Section>
    );
  },
});
