import { defineSection, type SfCollection } from "@pai/theme-sdk";
import { SmartLink, cn, num, resolveHref, str } from "@pai/theme-kit";
import { IMG } from "../images";
import { BzHead, BzSection, spacingField } from "../components/shared";

type Tile = { id: string; label: string; href: string; image: string | null };

/**
 * Category icon grid: 8–16 round category tiles. Uses its blocks, or — with no blocks — the
 * store's collections, so it is never empty.
 */
export const bazaarCategoryIcons = defineSection({
  schema: {
    type: "bazaar-category-icons",
    name: "Category icons",
    category: "collections",
    icon: "layout-grid",
    description: "A dense grid of round category icons (from blocks, or your collections when there are none).",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Shop by category" },
      { type: "text", id: "link_label", label: "Link label", default: "All categories" },
      { type: "url", id: "link", label: "Link", default: "/collections" },
      { type: "range", id: "limit", label: "Collections shown (when no blocks)", min: 4, max: 16, step: 1, default: 12 },
      {
        type: "select",
        id: "columns",
        label: "Icons per row (desktop)",
        default: "8",
        options: [
          { value: "6", label: "6" },
          { value: "8", label: "8" },
        ],
      },
      {
        type: "select",
        id: "shape",
        label: "Icon shape",
        default: "circle",
        options: [
          { value: "circle", label: "Circle" },
          { value: "square", label: "Rounded square" },
        ],
      },
      spacingField("small"),
    ],
    blocks: [
      {
        type: "category",
        name: "Category",
        limit: 16,
        settings: [
          { type: "text", id: "label", label: "Label", default: "Category" },
          { type: "image", id: "image", label: "Image", default: IMG.iphoneX },
          { type: "url", id: "link", label: "Link", default: "/collections/all" },
        ],
      },
    ],
    maxBlocks: 16,
    presets: [
      { name: "Category icons (collections)" },
      {
        name: "Category icons (custom)",
        blocks: [
          { type: "category", settings: { label: "Mobiles", image: IMG.iphoneX, link: "/collections/electronics" } },
          { type: "category", settings: { label: "Audio", image: IMG.headphonesGrey, link: "/collections/electronics" } },
          { type: "category", settings: { label: "Men's fashion", image: IMG.blueShirtMan, link: "/collections/fashion" } },
          { type: "category", settings: { label: "Women's fashion", image: IMG.floralWrapDress, link: "/collections/fashion" } },
          { type: "category", settings: { label: "Beauty", image: IMG.lipstick, link: "/collections/beauty-health" } },
          { type: "category", settings: { label: "Home decor", image: IMG.candleGlow, link: "/collections/home-living" } },
          { type: "category", settings: { label: "Groceries", image: IMG.vegMarket, link: "/collections/groceries" } },
          { type: "category", settings: { label: "Health", image: IMG.capsules, link: "/collections/beauty-health" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    let tiles: Tile[] = blocks
      .filter((b) => b.type === "category" && str(b.settings.label))
      .map((b) => ({ id: b.id, label: str(b.settings.label), href: resolveHref(context, b.settings.link, "/collections/all"), image: str(b.settings.image) || null }));
    if (!tiles.length) {
      const cols = await context.data.getCollections({ limit: num(s.limit, 12) }).catch(() => [] as SfCollection[]);
      tiles = cols.map((c) => ({ id: c.id, label: c.title, href: c.url, image: c.image?.url ?? null }));
    }
    if (!tiles.length) return null;
    const heading = str(s.heading, "Shop by category");
    const square = s.shape === "square";
    return (
      <BzSection label={heading} padding={s.padding} className="bz-cats">
        <div className="rounded-pai bg-pai-card">
          <BzHead title={heading} href={resolveHref(context, s.link)} linkLabel={str(s.link_label)} className="bz-head-bar px-3 py-2.5 sm:px-4" />
          <ul className={cn("grid grid-cols-4 gap-x-2 gap-y-4 p-3 sm:grid-cols-6 sm:p-4", str(s.columns, "8") === "6" ? "lg:grid-cols-6" : "lg:grid-cols-8")}>
            {tiles.map((t) => (
              <li key={t.id}>
                <SmartLink href={t.href} className="bz-cat group flex flex-col items-center gap-2 text-center">
                  <span className={cn("bz-cat-icon relative block aspect-square w-full max-w-[5.5rem] overflow-hidden bg-pai-muted transition", square ? "rounded-pai" : "rounded-full")}>
                    {t.image ? (
                      <img src={t.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-110" />
                    ) : (
                      <span className="grid size-full place-items-center font-heading text-xl font-bold text-pai-primary">{t.label.slice(0, 1)}</span>
                    )}
                  </span>
                  <span className="pai-line-clamp-2 text-[0.72rem] font-medium leading-tight group-hover:text-pai-primary sm:text-[0.78rem]">{t.label}</span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </BzSection>
    );
  },
});
