/**
 * Reading sample: an excerpt typeset like a printed page (or a two-page spread) with a drop cap,
 * running head and folio number, plus the book it comes from and a "Read a sample" link.
 */
import { defineSection } from "@pai/theme-sdk";
import { ArrowRight } from "lucide-react";
import { ButtonLink, Link, Section, SmartLink, bool, cn, num, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { bookMeta } from "../lib/book";
import { BookCover, spineFor } from "./card";

/** Split plain text (blank-line separated) or simple HTML paragraphs into paragraph strings. */
function paragraphs(raw: string): string[] {
  const text = raw
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function Page({ paras, dropCap, head, folio, side }: { paras: string[]; dropCap: boolean; head: string; folio: number; side: "left" | "right" | "single" }) {
  return (
    <div className={cn("folio-page relative flex flex-col px-7 pb-8 pt-7 sm:px-12 sm:pb-10 sm:pt-9", side === "left" && "folio-page--left", side === "right" && "folio-page--right")}>
      <p className={cn("mb-6 text-[10px] font-medium uppercase tracking-[0.3em] opacity-50", side === "left" ? "text-left" : side === "right" ? "text-right" : "text-center")}>{head}</p>
      <div className={cn("folio-page-text flex-1 space-y-4 font-heading text-[1.02rem] leading-[1.85] sm:text-[1.08rem]", dropCap && "folio-dropcap")}>
        {paras.map((p, i) => (
          <p key={i} className={cn(i > 0 && "indent-6")}>
            {p}
          </p>
        ))}
      </div>
      <p className={cn("mt-6 font-heading text-xs opacity-50", side === "left" ? "text-left" : side === "right" ? "text-right" : "text-center")}>{folio}</p>
    </div>
  );
}

export const readingSample = defineSection({
  schema: {
    type: "reading-sample",
    name: "Reading sample",
    category: "content",
    icon: "book-open-text",
    description: "An excerpt set like a printed page, with attribution and a link to the book.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Read a sample" },
      { type: "text", id: "heading", label: "Heading", default: "Open at the first page" },
      { type: "textarea", id: "intro", label: "Intro", default: "" },
      { type: "text", id: "chapter", label: "Running head", default: "Chapter one" },
      { type: "textarea", id: "excerpt", label: "Excerpt", default: "Paste a short excerpt here. Separate paragraphs with a blank line.\n\nKeep it to a page or two — enough for readers to hear the book's voice.", info: "Separate paragraphs with a blank line. Only publish text you have the rights to." },
      { type: "text", id: "attribution", label: "Attribution", default: "", info: "E.g. “From Gitanjali (1912), translated by the author”." },
      { type: "product", id: "product", label: "Book", info: "Shows the cover and links the button to it." },
      {
        type: "select",
        id: "style",
        label: "Page style",
        default: "page",
        options: [
          { value: "page", label: "Single page" },
          { value: "spread", label: "Open book (two pages)" },
        ],
      },
      { type: "checkbox", id: "drop_cap", label: "Drop cap", default: true },
      { type: "range", id: "start_page", label: "Page number", min: 1, max: 999, step: 1, default: 1 },
      { type: "text", id: "button_label", label: "Link label", default: "Read a sample" },
      { type: "url", id: "button_link", label: "Link", info: "Defaults to the book's page." },
      schemeField("muted"),
      paddingField("large"),
    ],
    presets: [{ name: "Reading sample" }, { name: "Reading sample — open book", settings: { style: "spread" } }],
  },
  component: async ({ id, settings: s, context }) => {
    const paras = paragraphs(str(s.excerpt));
    if (!paras.length) return null;
    const product = str(s.product) ? await context.data.getProduct(str(s.product)).catch(() => null) : null;
    const meta = product ? bookMeta(product, context) : null;
    const spread = s.style === "spread" && paras.length > 1;
    const half = Math.ceil(paras.length / 2);
    const start = num(s.start_page, 1);
    const head = str(s.chapter);
    const btnLabel = str(s.button_label);
    const btnHref = btnLabel ? resolveHref(context, s.button_link) || product?.url || "" : "";
    const dropCap = bool(s.drop_cap, true);
    const heading = str(s.heading);

    return (
      <Section settings={s} ariaLabel={heading || "Reading sample"} className="folio-sample">
        <div id={`folio-${id}`} className="scroll-mt-40" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-center lg:gap-16">
          <div>
            {str(s.eyebrow) ? <p className="pai-eyebrow mb-3">{str(s.eyebrow)}</p> : null}
            {heading ? <h2 className="pai-h2">{heading}</h2> : null}
            {str(s.intro) ? <p className="mt-4 max-w-md opacity-80">{str(s.intro)}</p> : null}
            {product && meta ? (
              <div className="mt-8 flex items-center gap-5">
                <div className="w-24 shrink-0">
                  <BookCover product={product} spine={spineFor(meta, context) || meta.bookish} sizes="96px" />
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-lg leading-snug">
                    <Link href={product.url} className="hover:underline hover:underline-offset-4">
                      {meta.title}
                    </Link>
                  </p>
                  {meta.author ? <p className="text-sm italic opacity-75">{meta.author}</p> : null}
                  <p className="mt-1 text-sm font-semibold">{context.formatMoney(product.price)}</p>
                </div>
              </div>
            ) : null}
            {btnLabel && btnHref ? (
              <ButtonLink href={btnHref} variant="primary" className="mt-8">
                {btnLabel} <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            ) : null}
          </div>
          <figure>
            <div className={cn("folio-book mx-auto", spread ? "folio-book--spread grid max-w-4xl md:grid-cols-2" : "max-w-2xl")}>
              {spread ? (
                <>
                  <Page paras={paras.slice(0, half)} dropCap={dropCap} head={meta?.title ?? head} folio={start} side="left" />
                  <Page paras={paras.slice(half)} dropCap={false} head={head} folio={start + 1} side="right" />
                </>
              ) : (
                <Page paras={paras} dropCap={dropCap} head={head} folio={start} side="single" />
              )}
            </div>
            {str(s.attribution) ? (
              <figcaption className="mt-5 text-center text-sm italic opacity-70">
                {product ? (
                  <SmartLink href={product.url} className="hover:underline">
                    {str(s.attribution)}
                  </SmartLink>
                ) : (
                  str(s.attribution)
                )}
              </figcaption>
            ) : null}
          </figure>
        </div>
      </Section>
    );
  },
});
