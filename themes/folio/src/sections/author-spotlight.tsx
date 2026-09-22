/**
 * Author spotlight: portrait in an arched frame, name, dates, bio and a signature quote, followed
 * by the author's books — found by searching the author's name, from a collection, or hand-picked.
 */
import { defineSection, type SfProduct, type StorefrontContext } from "@pai/theme-sdk";
import { ButtonLink, PreviewNotice, RichText, SAMPLE_PRODUCTS, Section, cn, list, num, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { IMG } from "../images";
import { FolioCard } from "./card";

async function loadBooks(context: StorefrontContext, s: Record<string, unknown>, author: string, limit: number): Promise<SfProduct[]> {
  const source = str(s.source, "search");
  try {
    if (source === "manual") {
      const slugs = list(s.products);
      if (!slugs.length) return [];
      const r = await context.data.getProducts({ slugs, limit: Math.max(limit, slugs.length) });
      const order = new Map(slugs.map((x, i) => [x, i]));
      return r.items.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0)).slice(0, limit);
    }
    if (source === "collection" && str(s.collection)) return (await context.data.getProducts({ collection: str(s.collection), limit })).items;
    if (author) return (await context.data.getProducts({ query: author, sort: "best-selling", limit })).items;
  } catch {
    /* ignore */
  }
  return [];
}

export const authorSpotlight = defineSection({
  schema: {
    type: "author-spotlight",
    name: "Author spotlight",
    category: "content",
    icon: "feather",
    description: "Portrait, biography and a quote, with the author's books alongside.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Author in focus" },
      { type: "text", id: "author", label: "Author name", default: "Humayun Ahmed" },
      { type: "text", id: "dates", label: "Dates / tagline", default: "1948 – 2012 · Novelist, dramatist, filmmaker" },
      { type: "image", id: "portrait", label: "Portrait", default: IMG.readerSilhouette, info: "Use a photo you have the rights to publish." },
      { type: "text", id: "portrait_alt", label: "Portrait description (alt text)", default: "" },
      { type: "richtext", id: "bio", label: "Biography", default: "<p>Tell readers who this author is, why their books matter and where to start.</p>" },
      { type: "textarea", id: "quote", label: "Quote", default: "" },
      { type: "header", label: "Books" },
      {
        type: "select",
        id: "source",
        label: "Books to show",
        default: "search",
        options: [
          { value: "search", label: "Search the catalogue for the author's name" },
          { value: "collection", label: "From a collection" },
          { value: "manual", label: "Hand-picked" },
        ],
      },
      { type: "collection", id: "collection", label: "Collection" },
      { type: "product_list", id: "products", label: "Hand-picked books", limit: 8 },
      { type: "range", id: "limit", label: "Maximum books", min: 1, max: 8, step: 1, default: 4 },
      { type: "text", id: "button_label", label: "Button label", default: "All books by this author", info: "Links to a search for the author unless you set a link." },
      { type: "url", id: "button_link", label: "Button link" },
      {
        type: "select",
        id: "portrait_position",
        label: "Portrait position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      schemeField("muted"),
      paddingField("large"),
    ],
    presets: [{ name: "Author spotlight" }],
  },
  component: async ({ settings: s, context }) => {
    const author = str(s.author);
    const limit = Math.max(1, Math.min(8, num(s.limit, 4)));
    let books = await loadBooks(context, s, author, limit);
    const sample = !books.length && context.isPreview;
    if (sample) books = SAMPLE_PRODUCTS.slice(0, limit);
    if (!author && !books.length) return null;
    const portrait = str(s.portrait);
    const right = s.portrait_position === "right";
    const btnLabel = str(s.button_label);
    const btnHref = btnLabel ? (str(s.button_link) ? resolveHref(context, s.button_link) : context.url(`/search?q=${encodeURIComponent(author)}`)) : "";
    const quote = str(s.quote);

    return (
      <Section settings={s} ariaLabel={author ? `Author spotlight: ${author}` : "Author spotlight"} className="folio-author-spotlight">
        <div className={cn("grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16", right && "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]")}>
          <div className={cn("flex flex-col gap-8 sm:flex-row sm:items-end lg:flex-col lg:items-start lg:self-start", right && "lg:order-2")}>
            <div className="sm:order-2 lg:order-1">
              {str(s.eyebrow) ? <p className="pai-eyebrow mb-3">{str(s.eyebrow)}</p> : null}
              {author ? <h2 className="pai-h2">{author}</h2> : null}
              {str(s.dates) ? <p className="mt-2 font-heading text-sm italic opacity-70">{str(s.dates)}</p> : null}
            </div>
            {portrait ? (
              <div className="folio-arch relative aspect-[4/5] w-full max-w-[340px] shrink-0 overflow-hidden bg-pai-bg sm:order-1 sm:w-1/2 lg:order-2 lg:w-full">
                <img src={portrait} alt={str(s.portrait_alt) || (author ? `Portrait of ${author}` : "")} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover grayscale-[35%]" />
              </div>
            ) : null}
          </div>
          <div className={cn("flex min-w-0 flex-col", right && "lg:order-1")}>
            {quote ? (
              <blockquote className="relative font-heading text-[calc(clamp(1.35rem,2.4vw,1.9rem)*var(--pai-heading-scale))] italic leading-snug [text-wrap:balance]">
                <span aria-hidden className="absolute -left-1 -top-6 font-heading text-6xl not-italic leading-none text-pai-primary opacity-40">
                  “
                </span>
                {quote}
              </blockquote>
            ) : null}
            <RichText html={str(s.bio)} className={cn("max-w-2xl leading-relaxed opacity-85", quote && "mt-6")} />
            {btnLabel && btnHref ? (
              <ButtonLink href={btnHref} variant="secondary" className="mt-6 w-fit">
                {btnLabel}
              </ButtonLink>
            ) : null}
            {books.length ? (
              <div className="mt-10 border-t border-pai-border pt-8">
                {sample ? <PreviewNotice context={context}>No books matched “{author}” — showing sample products.</PreviewNotice> : null}
                <p className="pai-eyebrow mb-5">{author ? `Books by ${author}` : "Books"}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5">
                  {books.map((p) => (
                    <FolioCard key={p.id} product={p} context={context} size="sm" />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Section>
    );
  },
});
