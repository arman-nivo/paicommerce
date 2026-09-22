/**
 * Collection storytelling: a sequence of "chapters", each an editorial image beside a Roman
 * numeral, a short story and a few pieces from the linked collection. Chapters alternate sides.
 */
import { defineSection, type SfCollection, type SfProduct } from "@pai/theme-sdk";
import { Link, PreviewNotice, SAMPLE_PRODUCTS, Section, SmartLink, bool, cn, headingFields, moneyOf, formatMoney, num, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { Heading, RATIO, loadProducts, roman } from "./_lumiere";
import { IMG } from "../images";

export const collectionStory = defineSection({
  schema: {
    type: "collection-story",
    name: "Collection story",
    category: "collections",
    icon: "book-open",
    description: "Chapters of image + story + a few pieces from a linked collection, alternating sides.",
    settings: [
      ...headingFields({ eyebrow: "The collections", heading: "Stories told in gold", subheading: "", align: "center" }),
      {
        type: "select",
        id: "image_ratio",
        label: "Image shape",
        default: "portrait",
        options: [
          { value: "portrait", label: "Portrait" },
          { value: "tall", label: "Tall" },
          { value: "square", label: "Square" },
        ],
      },
      { type: "checkbox", id: "start_right", label: "First image on the right", default: false },
      { type: "checkbox", id: "show_numerals", label: "Show chapter numerals", default: true },
      { type: "range", id: "products", label: "Pieces shown per chapter", min: 0, max: 4, step: 1, default: 3 },
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "chapter",
        name: "Chapter",
        limit: 6,
        settings: [
          { type: "image", id: "image", label: "Image", default: IMG.bride },
          { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
          { type: "text", id: "eyebrow", label: "Eyebrow", default: "Chapter" },
          { type: "text", id: "title", label: "Title", default: "The Bridal Trousseau" },
          { type: "textarea", id: "text", label: "Story", default: "Temple motifs our karigars have carved for three generations, set in 22K gold for the day you'll remember longest." },
          { type: "collection", id: "collection", label: "Collection" },
          { type: "text", id: "tag", label: "Or products tagged", info: "Used when no collection is picked." },
          { type: "text", id: "link_label", label: "Link label", default: "Discover the collection" },
          { type: "url", id: "link", label: "Link (optional)", info: "Defaults to the collection." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Collection story",
        blocks: [
          { type: "chapter", settings: { image: IMG.bride, title: "The Bridal Trousseau" } },
          { type: "chapter", settings: { image: IMG.ringsHands, title: "Diamonds, Everyday", text: "Solitaires, halos and slim bands made to be worn daily, not locked away." } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const chapters = blocks.filter((b) => b.type === "chapter");
    if (!chapters.length) return null;
    const perChapter = Math.max(0, Math.min(4, num(s.products, 3)));
    const ratio = RATIO[str(s.image_ratio, "portrait")] ?? RATIO.portrait;
    const money = moneyOf(context);
    let sample = false;
    const resolved = await Promise.all(
      chapters.map(async (b) => {
        const slug = str(b.settings.collection);
        const [col, loaded] = await Promise.all([
          slug ? context.data.getCollection(slug).catch(() => null) : Promise.resolve(null as SfCollection | null),
          perChapter ? loadProducts(context, { collection: slug, tag: b.settings.tag }, perChapter, false) : Promise.resolve({ products: [] as SfProduct[], via: "none" as const }),
        ]);
        let products = loaded.products;
        if (!products.length && context.isPreview && perChapter) {
          products = SAMPLE_PRODUCTS.slice(0, perChapter);
          sample = true;
        }
        return { b, col, products };
      }),
    );
    const startRight = bool(s.start_right);

    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Collection stories"} className="lumiere-story">
        {sample ? <PreviewNotice context={context}>Link each chapter to a collection. Showing sample products.</PreviewNotice> : null}
        <Heading eyebrow={str(s.eyebrow)} heading={str(s.heading)} text={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        <div className="space-y-24 md:space-y-36">
          {resolved.map(({ b, col, products }, i) => {
            const bs = b.settings;
            const right = (i % 2 === 1) !== startRight;
            const href = resolveHref(context, bs.link) || col?.url || null;
            const image = str(bs.image) || col?.image?.url || "";
            return (
              <article key={b.id} className="grid items-center gap-10 md:grid-cols-12 md:gap-0">
                <div className={cn("md:col-span-7", right ? "md:order-2 md:col-start-6" : "")}>
                  <div className={cn("lumiere-frame relative overflow-hidden bg-pai-card", ratio)}>
                    {image ? <img src={image} alt={str(bs.image_alt)} loading="lazy" decoding="async" className="lumiere-slowzoom absolute inset-0 size-full object-cover" /> : null}
                  </div>
                </div>
                <div className={cn("md:col-span-5", right ? "md:order-1 md:col-start-1 md:pr-16 lg:pr-24" : "md:pl-16 lg:pl-24")}>
                  {bool(s.show_numerals, true) ? (
                    <p aria-hidden className="lumiere-numeral font-heading text-7xl leading-none md:text-8xl">
                      {roman(i + 1)}
                    </p>
                  ) : null}
                  {str(bs.eyebrow) ? (
                    <p className="lumiere-eyebrow mt-6">
                      {str(bs.eyebrow)} {bool(s.show_numerals, true) ? roman(i + 1) : ""}
                    </p>
                  ) : null}
                  <h3 className="pai-h2 lumiere-display-2 mt-3">{str(bs.title) || col?.title}</h3>
                  <span aria-hidden className="lumiere-rule-short mt-6 block" />
                  {str(bs.text) ? <p className="mt-6 max-w-md text-[0.98rem] leading-[1.85] opacity-75">{str(bs.text)}</p> : null}
                  {products.length ? (
                    <ul className="mt-9 grid grid-cols-3 gap-4">
                      {products.slice(0, perChapter).map((p) => {
                        const img = p.featuredImage ?? p.images[0] ?? null;
                        return (
                          <li key={p.id}>
                            <Link href={p.url} className="group block">
                              <span className="relative block aspect-square overflow-hidden bg-pai-card">
                                {img ? <img src={img.url} alt={img.alt ?? p.title} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-[1200ms] group-hover:scale-[var(--lumiere-zoom)]" /> : null}
                              </span>
                              <span className="mt-3 block font-heading text-[0.95rem] leading-snug pai-line-clamp-2">{p.title}</span>
                              <span className="lumiere-price mt-1 block text-[0.72rem]">{formatMoney(p.price, money.currency, money.display)}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                  {href && str(bs.link_label) ? (
                    <SmartLink href={href} className="lumiere-textlink mt-9 inline-flex">
                      {str(bs.link_label)}
                    </SmartLink>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    );
  },
});
