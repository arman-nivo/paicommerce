/**
 * Book of the month: a large cover on a coloured plate, an editorial blurb, a pull quote with the
 * reviewer, and a format picker + add-to-bag. Falls back to a featured / best-selling product.
 */
import { defineSection, type SfProduct, type StorefrontContext } from "@pai/theme-sdk";
import { BookOpen } from "lucide-react";
import { Link, PreviewNotice, SmartLink, Rating, RichText, SAMPLE_PRODUCTS, Section, bool, cn, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { BuyBox } from "../client/buy-box";
import { SaveBookButton } from "../client/wishlist";
import { bookMeta } from "../lib/book";
import { toBuyBox } from "../lib/slim";
import { AuthorLink, BookCover, DigitalBadge, spineFor } from "./card";

async function pick(context: StorefrontContext, slug: string): Promise<{ product: SfProduct | null; sample: boolean }> {
  try {
    if (slug) {
      const p = await context.data.getProduct(slug);
      if (p) return { product: p, sample: false };
    }
    const featured = (await context.data.getProducts({ featured: true, sort: "best-selling", limit: 1 })).items[0];
    if (featured) return { product: featured, sample: false };
    const best = (await context.data.getProducts({ sort: "best-selling", limit: 1 })).items[0];
    if (best) return { product: best, sample: false };
  } catch {
    /* fall through */
  }
  return context.isPreview ? { product: SAMPLE_PRODUCTS[0] ?? null, sample: true } : { product: null, sample: false };
}

export const bookOfTheMonth = defineSection({
  schema: {
    type: "book-of-the-month",
    name: "Book of the month",
    category: "products",
    icon: "award",
    description: "Spotlight one title with a large cover, blurb, pull quote and buy button.",
    settings: [
      { type: "product", id: "product", label: "Book", info: "Falls back to a featured or best-selling product." },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Book of the month" },
      { type: "text", id: "heading", label: "Heading", info: "Defaults to the book's title." },
      { type: "richtext", id: "blurb", label: "Editorial blurb", default: "<p>Our booksellers' pick for the month — a book we can't stop pressing into readers' hands.</p>" },
      { type: "header", label: "Pull quote" },
      { type: "textarea", id: "quote", label: "Quote", default: "" },
      { type: "text", id: "reviewer", label: "Reviewer", default: "" },
      { type: "text", id: "reviewer_role", label: "Reviewer title", default: "" },
      { type: "image", id: "reviewer_image", label: "Reviewer photo" },
      { type: "header", label: "Buttons" },
      { type: "text", id: "button_label", label: "Buy button label", default: "Add to bag" },
      { type: "checkbox", id: "show_formats", label: "Show format picker", default: true },
      { type: "text", id: "sample_label", label: "Secondary link label", default: "Read a sample" },
      { type: "url", id: "sample_link", label: "Secondary link", info: "E.g. #section-reading-sample. Defaults to the product page." },
      {
        type: "select",
        id: "cover_position",
        label: "Cover position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      { type: "color", id: "plate_color", label: "Plate colour behind the cover", default: "", info: "Leave empty to use the accent colour." },
      schemeField("default"),
      paddingField("large"),
    ],
    presets: [{ name: "Book of the month" }],
  },
  component: async ({ settings: s, context }) => {
    const { product: p, sample } = await pick(context, str(s.product));
    if (!p) return null;
    const meta = bookMeta(p, context);
    const heading = str(s.heading) || meta.title;
    const right = s.cover_position === "right";
    const plate = /^#[0-9a-f]{6}$/i.test(str(s.plate_color)) ? str(s.plate_color) : null;
    const sampleLabel = str(s.sample_label);
    const sampleHref = sampleLabel ? resolveHref(context, s.sample_link) || p.url : "";
    const quote = str(s.quote);

    return (
      <Section settings={s} ariaLabel={str(s.eyebrow, "Book of the month")} className="folio-botm">
        {sample ? <PreviewNotice context={context}>Pick a book in the section settings. Showing a sample product.</PreviewNotice> : null}
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-20">
          <div className={cn("relative", right && "md:order-2")}>
            <div
              aria-hidden
              className="folio-botm-plate absolute inset-x-0 bottom-0 top-[12%] rounded-pai"
              style={plate ? { backgroundColor: plate } : undefined}
            />
            <div className="relative mx-auto w-[62%] max-w-[340px] py-10 md:py-14">
              <BookCover product={p} spine={spineFor(meta, context) || meta.bookish} sizes="(min-width: 768px) 340px, 62vw" className="folio-cover--hero" />
            </div>
          </div>
          <div className={cn(right && "md:order-1")}>
            <p className="folio-rule-eyebrow text-[11px] font-semibold uppercase tracking-[0.3em] text-pai-primary">{str(s.eyebrow, "Book of the month")}</p>
            <h2 className="mt-4 font-heading text-[calc(clamp(2rem,3.6vw,3.1rem)*var(--pai-heading-scale))] leading-[1.08] [text-wrap:balance]">
              <Link href={p.url} className="hover:underline hover:decoration-1 hover:underline-offset-8">
                {heading}
              </Link>
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {meta.author ? <AuthorLink author={meta.author} context={context} prefix="by " className="text-lg" /> : null}
              {p.rating.count > 0 ? <Rating value={p.rating.average} count={p.rating.count} size={14} /> : null}
              {meta.digital ? <DigitalBadge context={context} /> : null}
            </div>
            <RichText html={str(s.blurb)} className="mt-6 max-w-xl text-[1.02rem] leading-relaxed opacity-85" />
            {quote ? (
              <figure className="mt-8 max-w-xl border-l-2 border-pai-primary pl-5">
                <blockquote className="font-heading text-xl italic leading-snug md:text-[1.4rem]">“{quote}”</blockquote>
                {str(s.reviewer) ? (
                  <figcaption className="mt-4 flex items-center gap-3 text-sm">
                    {str(s.reviewer_image) ? <img src={str(s.reviewer_image)} alt="" loading="lazy" className="size-10 rounded-full object-cover" /> : null}
                    <span>
                      <span className="font-semibold">{str(s.reviewer)}</span>
                      {str(s.reviewer_role) ? <span className="block text-xs opacity-65">{str(s.reviewer_role)}</span> : null}
                    </span>
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
            <div className="mt-9 border-t border-pai-border pt-7">
              <BuyBox product={toBuyBox(p)} label={str(s.button_label, "Add to bag")} showFormats={bool(s.show_formats, true)} />
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {sampleLabel && sampleHref ? (
                  <SmartLink href={sampleHref} className="inline-flex items-center gap-2 font-medium underline underline-offset-4 hover:opacity-80">
                    <BookOpen className="size-4" aria-hidden />
                    {sampleLabel}
                  </SmartLink>
                ) : null}
                <SaveBookButton
                  book={{ id: p.id, title: meta.title, author: meta.author, url: p.url, image: p.featuredImage?.url ?? null, price: p.price }}
                  withLabel
                  className="inline-flex items-center gap-2 font-medium opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary aria-pressed:text-pai-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>
    );
  },
});
