/**
 * Savor "Our menu": collections presented as menu categories with sticky scroll-spy tabs, each
 * category a heading, a short description and its dishes as menu rows with quick add.
 * Blocks = categories (each picks a collection). No blocks → the store's first collections.
 * Nothing at all → best sellers.
 */
import { defineSection, type SfCollection, type SfProduct } from "@pai/theme-sdk";
import { PreviewNotice, SAMPLE_PRODUCTS, Section, SmartLink, bool, cn, headingFields, num, paddingField, schemeField, str } from "@pai/theme-kit";
import { MenuTabs } from "../client/menu-tabs";
import { MenuGrid } from "./card";

type Category = { key: string; title: string; description: string; image: string; products: SfProduct[]; href: string };

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "category";

export const savorMenu = defineSection({
  schema: {
    type: "savor-menu",
    name: "Menu",
    category: "products",
    icon: "book-open",
    description: "Your collections as a restaurant menu — category tabs, dishes with prices and quick add.",
    settings: [
      ...headingFields({ eyebrow: "À la carte", heading: "Our menu", subheading: "", align: "center" }),
      { type: "text", id: "anchor", label: "Anchor id", default: "menu", info: "Buttons can link to #menu to jump here." },
      { type: "range", id: "limit", label: "Dishes per category", min: 2, max: 24, step: 1, default: 6 },
      { type: "range", id: "columns", label: "Columns (desktop)", min: 1, max: 2, step: 1, default: 2 },
      { type: "checkbox", id: "show_tabs", label: "Show category tabs", default: true },
      { type: "checkbox", id: "sticky_tabs", label: "Keep tabs visible while scrolling", default: true },
      { type: "checkbox", id: "show_images", label: "Show category banner images", default: true },
      { type: "checkbox", id: "show_view_all", label: "Show “See all” link per category", default: true },
      { type: "range", id: "fallback_count", label: "Categories when no blocks are added", min: 1, max: 8, step: 1, default: 4 },
      schemeField(),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "category",
        name: "Menu category",
        settings: [
          { type: "collection", id: "collection", label: "Collection" },
          { type: "text", id: "heading", label: "Heading", info: "Defaults to the collection title." },
          { type: "textarea", id: "description", label: "Description", info: "Defaults to the collection description." },
          { type: "image", id: "image", label: "Banner image", info: "Defaults to the collection image." },
          { type: "text", id: "note", label: "Small note", default: "", placeholder: "Served with salad & borhani" },
        ],
      },
    ],
    maxBlocks: 10,
    presets: [
      {
        name: "Menu",
        blocks: [{ type: "category" }, { type: "category" }, { type: "category" }],
      },
    ],
  },
  component: async ({ id, settings: s, blocks, context }) => {
    const limit = num(s.limit, 6);
    const anchor = slugify(str(s.anchor, "menu"));
    let cats: (Category & { note?: string })[] = [];

    if (blocks.length) {
      const loaded = await Promise.all(
        blocks.map(async (b) => {
          const slug = str(b.settings.collection);
          if (!slug) return null;
          const [c, r] = await Promise.all([context.data.getCollection(slug).catch(() => null), context.data.getProducts({ collection: slug, limit }).catch(() => null)]);
          if (!c || !r?.items.length) return null;
          return {
            key: `${anchor}-${slugify(c.slug)}`,
            title: str(b.settings.heading) || c.title,
            description: str(b.settings.description) || c.description || "",
            image: str(b.settings.image) || c.image?.url || "",
            products: r.items,
            href: c.url,
            note: str(b.settings.note),
          };
        }),
      );
      cats = loaded.filter((x): x is NonNullable<typeof x> => !!x);
    } else {
      const cols: SfCollection[] = await context.data.getCollections({ limit: num(s.fallback_count, 4) }).catch(() => []);
      const loaded = await Promise.all(
        cols.map(async (c) => {
          const r = await context.data.getProducts({ collection: c.slug, limit }).catch(() => null);
          return r?.items.length ? { key: `${anchor}-${slugify(c.slug)}`, title: c.title, description: c.description ?? "", image: c.image?.url ?? "", products: r.items, href: c.url } : null;
        }),
      );
      cats = loaded.filter((x): x is NonNullable<typeof x> => !!x);
    }

    let sample = false;
    if (!cats.length) {
      const best = (await context.data.getProducts({ sort: "best-selling", limit }).catch(() => null))?.items ?? [];
      if (best.length) cats = [{ key: `${anchor}-favourites`, title: "Favourites", description: "", image: "", products: best, href: context.url("/collections/all") }];
      else if (context.isPreview) {
        sample = true;
        cats = [{ key: `${anchor}-favourites`, title: "Favourites", description: "Pick collections for each menu category.", image: "", products: SAMPLE_PRODUCTS.slice(0, limit), href: context.url("/collections/all") }];
      }
    }
    if (!cats.length) return null;

    const center = s.heading_align !== "left";
    const columns = num(s.columns, 2);
    const showTabs = bool(s.show_tabs, true) && cats.length > 1;

    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Menu"} className="savor-menu">
        <span id={anchor} className="relative -top-24 block" aria-hidden />
        {sample ? <PreviewNotice context={context}>Add “Menu category” blocks and pick a collection for each. Showing sample dishes.</PreviewNotice> : null}
        {str(s.heading) || str(s.eyebrow) ? (
          <div className={cn("mb-6 md:mb-8", center ? "mx-auto max-w-2xl text-center" : "max-w-2xl")}>
            {str(s.eyebrow) ? <p className="savor-eyebrow mb-3 text-pai-primary">{str(s.eyebrow)}</p> : null}
            {str(s.heading) ? <h2 className="pai-h2">{str(s.heading)}</h2> : null}
            {center ? <span aria-hidden className="savor-flourish mx-auto mt-4 block" /> : null}
            {str(s.subheading) ? <p className="mt-4 text-base opacity-75 md:text-lg">{str(s.subheading)}</p> : null}
          </div>
        ) : null}
        {showTabs ? <MenuTabs key={id} tabs={cats.map((c) => ({ id: c.key, label: c.title, count: c.products.length }))} sticky={bool(s.sticky_tabs, true)} /> : null}
        <div className="mt-6 space-y-14 md:mt-10 md:space-y-20">
          {cats.map((c, i) => (
            <section key={c.key} id={c.key} aria-labelledby={`${c.key}-title`} className="scroll-mt-40">
              <div className={cn("mb-2 grid items-end gap-5", bool(s.show_images, true) && c.image ? "md:grid-cols-2 md:gap-10" : "")}>
                {bool(s.show_images, true) && c.image ? (
                  <div className={cn("relative aspect-[16/7] overflow-hidden rounded-pai bg-pai-muted md:aspect-[2.4/1]", i % 2 === 1 && "md:order-2")}>
                    <img src={c.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                    <span className="absolute left-3 top-3 grid size-10 place-items-center rounded-full bg-pai-bg font-heading text-sm font-semibold text-pai-fg shadow">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                ) : null}
                <div className={cn("pb-1", i % 2 === 1 && "md:order-1")}>
                  <h3 id={`${c.key}-title`} className="font-heading text-2xl font-semibold md:text-[2rem]">
                    {c.title}
                  </h3>
                  {c.description ? <p className="mt-2 max-w-xl opacity-70">{c.description}</p> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    {"note" in c && c.note ? <span className="savor-note italic opacity-75">{c.note}</span> : null}
                    {bool(s.show_view_all, true) && c.href ? (
                      <SmartLink href={c.href} className="font-semibold text-pai-primary underline-offset-4 hover:underline">
                        See all {c.title.toLowerCase()} →
                      </SmartLink>
                    ) : null}
                  </div>
                </div>
              </div>
              <MenuGrid products={c.products} context={context} columns={columns} priority={i === 0 ? 2 : 0} />
            </section>
          ))}
        </div>
      </Section>
    );
  },
});
