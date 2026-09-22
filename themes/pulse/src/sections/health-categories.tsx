import { defineSection } from "@pai/theme-sdk";
import { Container, Icon, SmartLink, cn, num, resolveHref, str } from "@pai/theme-kit";
import { HEALTH_ICONS, padOf } from "../components/utils";

const TINTS: Record<string, string> = {
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
};

export const pulseHealthCategories = defineSection({
  schema: {
    type: "health-categories",
    name: "Health categories",
    category: "collections",
    icon: "layout-grid",
    description: "Icon tiles for categories and health concerns — each links to a collection, a search or any page.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "" },
      { type: "text", id: "heading", label: "Heading", default: "Shop by health need" },
      { type: "text", id: "link_label", label: "Link label", default: "All categories" },
      { type: "url", id: "link", label: "Link", default: "/collections" },
      {
        type: "select",
        id: "style",
        label: "Style",
        default: "tiles",
        options: [
          { value: "tiles", label: "Tiles (icon + label)" },
          { value: "circles", label: "Circles" },
        ],
      },
      { type: "range", id: "columns", label: "Columns (desktop)", min: 4, max: 8, step: 1, default: 6 },
      { type: "checkbox", id: "show_count", label: "Show product count (collections)", default: true },
      {
        type: "select",
        id: "padding",
        label: "Vertical spacing",
        default: "medium",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
    ],
    blocks: [
      {
        type: "category",
        name: "Category",
        limit: 16,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "pill", options: HEALTH_ICONS },
          { type: "text", id: "title", label: "Title", default: "Medicines" },
          {
            type: "select",
            id: "tint",
            label: "Colour",
            default: "teal",
            options: Object.keys(TINTS).map((k) => ({ value: k, label: k[0]!.toUpperCase() + k.slice(1) })),
          },
          { type: "collection", id: "collection", label: "Collection" },
          { type: "url", id: "link", label: "Or link", info: "Overrides the collection. E.g. /search?q=diabetes" },
        ],
      },
    ],
    maxBlocks: 16,
    presets: [
      {
        name: "Health categories",
        blocks: [
          { type: "category", settings: { icon: "pill", title: "Medicines", tint: "teal", collection: "medicines" } },
          { type: "category", settings: { icon: "shield-plus", title: "Vitamins", tint: "amber", collection: "vitamins-supplements" } },
          { type: "category", settings: { icon: "hand", title: "Personal care", tint: "rose", collection: "personal-care" } },
          { type: "category", settings: { icon: "stethoscope", title: "Devices", tint: "sky", collection: "medical-devices" } },
          { type: "category", settings: { icon: "heart-pulse", title: "Heart care", tint: "violet", link: "/search?q=cardiac" } },
          { type: "category", settings: { icon: "baby", title: "Mother & baby", tint: "green", link: "/search?q=baby" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const items = blocks.filter((b) => b.type === "category" && str(b.settings.title));
    if (!items.length) return null;
    const slugs = items.map((b) => str(b.settings.collection)).filter(Boolean);
    const cols = slugs.length ? await context.data.getCollections({ slugs, limit: slugs.length }).catch(() => []) : [];
    const bySlug = new Map(cols.map((c) => [c.slug, c]));
    const columns = num(s.columns, 6);
    const grid = { 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6", 7: "lg:grid-cols-7", 8: "lg:grid-cols-8" }[columns] ?? "lg:grid-cols-6";
    const circles = s.style === "circles";
    const link = resolveHref(context, s.link);

    return (
      <section aria-label={str(s.heading) || "Categories"} className="pai-section" style={{ ["--pai-section-pad" as string]: padOf(s.padding) }}>
        <Container>
          {str(s.heading) ? (
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                {str(s.eyebrow) ? <p className="pai-eyebrow mb-1 text-pai-primary">{str(s.eyebrow)}</p> : null}
                <h2 className="pai-h3">{str(s.heading)}</h2>
              </div>
              {str(s.link_label) && link ? (
                <SmartLink href={link} className="shrink-0 text-sm font-semibold text-pai-primary hover:underline">
                  {str(s.link_label)} →
                </SmartLink>
              ) : null}
            </div>
          ) : null}
          <ul className={cn("grid grid-cols-3 gap-3 sm:grid-cols-4 md:gap-4", grid)}>
            {items.map((b) => {
              const bs = b.settings;
              const col = bySlug.get(str(bs.collection));
              const href = resolveHref(context, bs.link) || col?.url || context.url(`/search?q=${encodeURIComponent(str(bs.title))}`);
              const tint = TINTS[str(bs.tint, "teal")] ?? TINTS.teal;
              const count = s.show_count !== false && col && col.productsCount > 0 ?`${col.productsCount} items` : "";
              return (
                <li key={b.id}>
                  <SmartLink
                    href={href}
                    className={cn(
                      "group flex h-full flex-col items-center gap-3 text-center transition",
                      circles ? "p-1" : "rounded-pai border border-pai-border bg-pai-card px-2 py-4 hover:-translate-y-0.5 hover:border-pai-primary/40 hover:shadow-[0_12px_30px_-18px_rgba(10,60,70,0.4)] md:py-5",
                    )}
                  >
                    <span className={cn("grid place-items-center rounded-full ring-8 transition group-hover:scale-105", tint, circles ? "size-20 md:size-24" : "size-14 md:size-16")}>
                      <Icon name={str(bs.icon, "pill")} className={circles ? "size-9" : "size-7"} strokeWidth={1.6} />
                    </span>
                    <span>
                      <span className="block text-[0.8rem] font-semibold leading-tight md:text-sm">{str(bs.title)}</span>
                      {count ? <span className="mt-0.5 block text-[11px] opacity-55">{count}</span> : null}
                    </span>
                  </SmartLink>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>
    );
  },
});
