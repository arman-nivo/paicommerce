/**
 * Genre tiles: typographic, colour-blocked tiles (or book-spine strips) linking to collections,
 * each with an optional short description and a live title count.
 */
import { defineSection } from "@pai/theme-sdk";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading, Section, SmartLink, bool, cn, headingFields, num, paddingField, readableOn, resolveHref, schemeField, str } from "@pai/theme-kit";

const PALETTE = ["#6e1f2b", "#23395b", "#1f4d3a", "#a8792f", "#4338ca", "#2b2622"];

const COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
  6: "sm:grid-cols-3 lg:grid-cols-6",
};

export const genreTiles = defineSection({
  schema: {
    type: "genre-tiles",
    name: "Genre tiles",
    category: "collections",
    icon: "library",
    description: "Typographic colour tiles (or book spines) that link to your genres and show how many titles each holds.",
    settings: [
      ...headingFields({ eyebrow: "Find your next read", heading: "Browse by genre", align: "left" }),
      {
        type: "select",
        id: "style",
        label: "Style",
        default: "tiles",
        options: [
          { value: "tiles", label: "Typographic tiles" },
          { value: "spines", label: "Book spines on a shelf" },
        ],
      },
      { type: "range", id: "columns", label: "Columns (desktop, tiles)", min: 2, max: 6, step: 1, default: 3 },
      { type: "checkbox", id: "show_count", label: "Show number of titles", default: true },
      schemeField("default"),
      paddingField("medium"),
    ],
    blocks: [
      {
        type: "genre",
        name: "Genre",
        limit: 12,
        settings: [
          { type: "text", id: "name", label: "Genre name", default: "Fiction" },
          { type: "text", id: "description", label: "Short description", default: "" },
          { type: "collection", id: "collection", label: "Collection" },
          { type: "url", id: "link", label: "Link", info: "Overrides the collection link." },
          { type: "color", id: "color", label: "Tile colour", default: "#6e1f2b" },
          { type: "text", id: "count_label", label: "Count label", default: "titles", info: "E.g. “titles”, “courses”, “items”." },
        ],
      },
    ],
    maxBlocks: 12,
    presets: [
      {
        name: "Genre tiles",
        blocks: [
          { type: "genre", settings: { name: "Fiction", color: PALETTE[0] } },
          { type: "genre", settings: { name: "Non-fiction", color: PALETTE[1] } },
          { type: "genre", settings: { name: "Poetry", color: PALETTE[2] } },
          { type: "genre", settings: { name: "Stationery", color: PALETTE[3] } },
        ],
      },
      {
        name: "Genre spines",
        settings: { style: "spines", heading: "On the shelves" },
        blocks: PALETTE.map((color, i) => ({ type: "genre", settings: { name: ["Fiction", "History", "Poetry", "Business", "Courses", "Classics"][i], color } })),
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const genres = await Promise.all(
      blocks.map(async (b, i) => {
        const bs = b.settings;
        const slug = str(bs.collection);
        const col = slug ? await context.data.getCollection(slug).catch(() => null) : null;
        // `productsCount` can come back as 0 from the data layer; confirm with a 1-item query.
        let count = col ? col.productsCount : null;
        if (col && !count) count = (await context.data.getProducts({ collection: slug, limit: 1 }).catch(() => null))?.total ?? count;
        const href = str(bs.link) ? resolveHref(context, bs.link) : col ? col.url : context.url(slug ? `/collections/${slug}` : "/collections/all");
        const color = /^#[0-9a-f]{6}$/i.test(str(bs.color)) ? str(bs.color) : PALETTE[i % PALETTE.length]!;
        return {
          id: b.id,
          name: str(bs.name) || col?.title || "",
          description: str(bs.description),
          href,
          color,
          fg: readableOn(color),
          count,
          countLabel: str(bs.count_label, "titles"),
        };
      }),
    );
    let items = genres.filter((g) => g.name);
    if (!items.length && context.isPreview) {
      // Customizer placeholder: show what the section looks like before genres are added.
      items = ["Fiction", "Non-fiction", "Poetry"].map((name, i) => ({ id: `sample-${i}`, name, description: "Add a Genre block and pick a collection.", href: "#", color: PALETTE[i]!, fg: readableOn(PALETTE[i]!), count: null, countLabel: "titles" }));
    }
    if (!items.length) return null;
    const showCount = bool(s.show_count, true);
    const spines = s.style === "spines";
    const heading = str(s.heading);

    return (
      <Section settings={s} ariaLabel={heading || "Genres"}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={heading} subtitle={str(s.subheading)} align={s.heading_align === "center" ? "center" : "left"} action={{ label: "All collections", href: context.url("/collections") }} />
        {spines ? (
          <div className="folio-shelf relative">
            <ul className="pai-no-scrollbar flex items-end gap-1.5 overflow-x-auto pb-3 sm:gap-2">
              {items.map((g, i) => (
                <li key={g.id} className="shrink-0">
                  <SmartLink
                    href={g.href}
                    ariaLabel={`${g.name}${showCount && g.count !== null ? `, ${g.count} ${g.countLabel}` : ""}`}
                    className="folio-spine-tile group relative flex w-[4.4rem] flex-col items-center justify-between rounded-t-[3px] px-2 py-4 transition duration-300 hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2 sm:w-[5.2rem]"
                    style={{ backgroundColor: g.color, color: g.fg, height: `${[17, 19, 16, 18.5, 17.5, 20][i % 6]}rem` }}
                  >
                    <span aria-hidden className="h-px w-8 bg-current opacity-50" />
                    <span className="font-heading text-lg leading-none tracking-wide [writing-mode:vertical-rl] rotate-180 whitespace-nowrap sm:text-xl">{g.name}</span>
                    <span className="flex flex-col items-center gap-2">
                      {showCount && g.count !== null ? <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">{g.count}</span> : null}
                      <span aria-hidden className="h-px w-8 bg-current opacity-50" />
                    </span>
                  </SmartLink>
                </li>
              ))}
            </ul>
            <div aria-hidden className="folio-shelf-board h-3 rounded-[2px]" />
          </div>
        ) : (
          <ul className={cn("grid grid-cols-2 gap-3 md:gap-4", COLS[Math.max(2, Math.min(6, num(s.columns, 3)))])}>
            {items.map((g, i) => (
              <li key={g.id}>
                <SmartLink
                  href={g.href}
                  className="folio-genre-tile group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-pai p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2 sm:aspect-[5/4] md:p-6"
                  style={{ backgroundColor: g.color, color: g.fg }}
                >
                  <span className="flex items-start justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] opacity-75">
                    <span>№ {String(i + 1).padStart(2, "0")}</span>
                    <ArrowUpRight className="size-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  <span aria-hidden className="folio-genre-initial pointer-events-none absolute -bottom-6 -right-2 font-heading leading-none opacity-[0.13]">
                    {g.name.charAt(0)}
                  </span>
                  <span className="relative">
                    <span className="block font-heading text-[1.35rem] leading-tight [text-wrap:balance] md:text-[1.75rem]">{g.name}</span>
                    {g.description ? <span className="mt-1.5 hidden text-sm opacity-80 sm:block">{g.description}</span> : null}
                    {showCount && g.count !== null ? (
                      <span className="mt-3 inline-block border-t border-current pt-2 text-[11px] font-medium uppercase tracking-[0.18em] opacity-80">
                        {g.count} {g.countLabel}
                      </span>
                    ) : null}
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        )}
      </Section>
    );
  },
});
