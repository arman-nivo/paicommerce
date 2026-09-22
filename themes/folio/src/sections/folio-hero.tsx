/**
 * Editorial hero: text blocks on one side, a fanned stack of book covers (from a collection or
 * hand-picked) or a photograph on the other. Optional search block for search-first stores.
 */
import { defineSection, type BlockInstance, type SfProduct, type StorefrontContext } from "@pai/theme-sdk";
import { ButtonLink, Container, Link, SAMPLE_PRODUCTS, cn, list, resolveHref, schemeClass, schemeField, str, type ButtonVariant } from "@pai/theme-kit";
import { SearchBox } from "@pai/theme-kit/client";
import { IMG } from "../images";
import { bookMeta } from "../lib/book";
import { BookCover, spineFor } from "./card";

const HEIGHTS: Record<string, string> = { auto: "", medium: "md:min-h-[560px]", large: "md:min-h-[680px]" };

async function loadCovers(context: StorefrontContext, s: Record<string, unknown>): Promise<SfProduct[]> {
  const slugs = list(s.products);
  const collection = str(s.collection);
  try {
    if (slugs.length) {
      const r = await context.data.getProducts({ slugs, limit: slugs.length });
      const order = new Map(slugs.map((x, i) => [x, i]));
      return r.items.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0)).slice(0, 3);
    }
    if (collection) {
      const r = await context.data.getProducts({ collection, limit: 3 });
      if (r.items.length) return r.items;
    }
    return (await context.data.getProducts({ sort: "best-selling", limit: 3 })).items;
  } catch {
    return [];
  }
}

function Blocks({ blocks, context }: { blocks: BlockInstance[]; context: StorefrontContext }) {
  return (
    <div className="flex flex-col items-start gap-5">
      {blocks.map((b) => {
        const s = b.settings;
        switch (b.type) {
          case "eyebrow":
            return str(s.text) ? (
              <p key={b.id} className="folio-rule-eyebrow text-[11px] font-semibold uppercase tracking-[0.3em] text-pai-primary">
                {str(s.text)}
              </p>
            ) : null;
          case "heading": {
            const H = s.tag === "h2" ? "h2" : "h1";
            return str(s.text) ? (
              <H
                key={b.id}
                className={cn(
                  "font-heading leading-[1.06] tracking-[-0.015em] [text-wrap:balance]",
                  str(s.size, "large") === "large" ? "text-[calc(clamp(2.4rem,5.2vw,4.4rem)*var(--pai-heading-scale))]" : "text-[calc(clamp(2rem,3.8vw,3.2rem)*var(--pai-heading-scale))]",
                )}
              >
                {str(s.text)}
                {str(s.emphasis) ? (
                  <>
                    {" "}
                    <em className="text-pai-primary">{str(s.emphasis)}</em>
                  </>
                ) : null}
              </H>
            ) : null;
          }
          case "text":
            return str(s.text) ? (
              <p key={b.id} className="max-w-xl text-base leading-relaxed opacity-80 md:text-lg [text-wrap:pretty]">
                {str(s.text)}
              </p>
            ) : null;
          case "search":
            return (
              <div key={b.id} className={cn("w-full max-w-lg", s.hide_mobile !== false && "hidden md:block")}>
                <SearchBox placeholder={str(s.placeholder, "Search by title, author or ISBN…")} className="folio-search folio-search--hero" />
                {str(s.hint) ? <p className="mt-2 text-xs opacity-60">{str(s.hint)}</p> : null}
              </div>
            );
          case "buttons": {
            const buttons = [1, 2]
              .map((n) => ({ label: str(s[`label_${n}`]), href: resolveHref(context, s[`link_${n}`], "/collections/all"), style: str(s[`style_${n}`], n === 1 ? "primary" : "link") }))
              .filter((x) => x.label);
            if (!buttons.length) return null;
            return (
              <div key={b.id} className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-3">
                {buttons.map((btn, i) => (
                  <ButtonLink key={i} href={btn.href} variant={(["primary", "secondary", "link"].includes(btn.style) ? btn.style : "primary") as ButtonVariant} size="lg" className={cn(btn.style === "link" && "!px-0 underline-offset-8")}>
                    {btn.label}
                  </ButtonLink>
                ))}
              </div>
            );
          }
          case "note":
            return str(s.text) ? (
              <p key={b.id} className="border-l-2 border-pai-accent pl-3 font-heading text-sm italic opacity-75">
                {str(s.text)}
              </p>
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
}

function CoverStack({ products, context, caption }: { products: SfProduct[]; context: StorefrontContext; caption: string }) {
  const [a, b, c] = products;
  const cls = ["folio-stack-1 z-20 w-[46%]", "folio-stack-2 z-10 w-[38%]", "folio-stack-3 z-0 w-[38%]"];
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div aria-hidden className="folio-hero-plate absolute inset-x-[6%] bottom-[4%] top-[10%] rounded-pai" />
      <div className="relative flex aspect-[5/4] items-center justify-center">
        {[b, a, c].map((p, i) => {
          if (!p) return null;
          const idx = p === a ? 0 : p === b ? 1 : 2;
          return (
            <div key={p.id} className={cn("folio-stack absolute", cls[idx])}>
              <BookCover product={p} spine={spineFor(bookMeta(p, context), context)} priority={i === 1} sizes="(min-width: 768px) 22vw, 45vw" />
            </div>
          );
        })}
      </div>
      {a && caption ? (
        <p className="relative mt-4 text-center font-heading text-sm italic opacity-70">
          {caption} <Link href={a.url} className="not-italic underline underline-offset-4">{bookMeta(a, context).title}</Link>
        </p>
      ) : null}
    </div>
  );
}

export const folioHero = defineSection({
  schema: {
    type: "folio-hero",
    name: "Editorial hero",
    category: "hero",
    icon: "book-open",
    description: "Headline and search beside a fanned stack of book covers or a photograph.",
    settings: [
      {
        type: "select",
        id: "media",
        label: "Media",
        default: "covers",
        options: [
          { value: "covers", label: "Stack of book covers" },
          { value: "image", label: "Photograph" },
        ],
      },
      { type: "collection", id: "collection", label: "Covers from collection", info: "Falls back to your best sellers." },
      { type: "product_list", id: "products", label: "Or hand-pick 3 books", limit: 3 },
      { type: "text", id: "caption", label: "Caption under the covers", default: "On the counter this week:" },
      { type: "image", id: "image", label: "Photograph", default: IMG.readingLap },
      { type: "text", id: "image_alt", label: "Photograph description (alt text)", default: "A reader with an open book" },
      {
        type: "select",
        id: "media_position",
        label: "Media position",
        default: "right",
        options: [
          { value: "right", label: "Right" },
          { value: "left", label: "Left" },
        ],
      },
      {
        type: "select",
        id: "height",
        label: "Minimum height",
        default: "medium",
        options: [
          { value: "auto", label: "Fit content" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
      schemeField("default"),
    ],
    blocks: [
      { type: "eyebrow", name: "Eyebrow", limit: 1, settings: [{ type: "text", id: "text", label: "Text", default: "The reading room" }] },
      {
        type: "heading",
        name: "Heading",
        limit: 1,
        settings: [
          { type: "text", id: "text", label: "Heading", default: "Stories worth staying up for" },
          { type: "text", id: "emphasis", label: "Italic ending (optional)", default: "" },
          {
            type: "select",
            id: "size",
            label: "Size",
            default: "large",
            options: [
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ],
          },
          {
            type: "select",
            id: "tag",
            label: "Heading level",
            default: "h1",
            options: [
              { value: "h1", label: "H1 (first section on the page)" },
              { value: "h2", label: "H2" },
            ],
          },
        ],
      },
      { type: "text", name: "Text", limit: 1, settings: [{ type: "textarea", id: "text", label: "Text", default: "Hand-picked Bangla classics, new fiction and ideas worth arguing about — delivered to your door." }] },
      {
        type: "search",
        name: "Search field",
        limit: 1,
        settings: [
          { type: "text", id: "placeholder", label: "Placeholder", default: "Search by title, author or ISBN…" },
          { type: "text", id: "hint", label: "Hint", default: "Try “Humayun Ahmed”, “poetry” or “IELTS”" },
          { type: "checkbox", id: "hide_mobile", label: "Hide on phones", default: true, info: "The Folio header already shows a search field on phones." },
        ],
      },
      {
        type: "buttons",
        name: "Buttons",
        limit: 1,
        settings: [
          { type: "text", id: "label_1", label: "Button 1 label", default: "Browse bestsellers" },
          { type: "url", id: "link_1", label: "Button 1 link", default: "/collections/all" },
          { type: "select", id: "style_1", label: "Button 1 style", default: "primary", options: [{ value: "primary", label: "Solid" }, { value: "secondary", label: "Outline" }, { value: "link", label: "Text link" }] },
          { type: "text", id: "label_2", label: "Button 2 label", default: "" },
          { type: "url", id: "link_2", label: "Button 2 link", default: "" },
          { type: "select", id: "style_2", label: "Button 2 style", default: "link", options: [{ value: "primary", label: "Solid" }, { value: "secondary", label: "Outline" }, { value: "link", label: "Text link" }] },
        ],
      },
      { type: "note", name: "Note", limit: 2, settings: [{ type: "text", id: "text", label: "Text", default: "Cash on delivery · bKash & Nagad accepted" }] },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Editorial hero",
        blocks: [{ type: "eyebrow" }, { type: "heading" }, { type: "text" }, { type: "search" }, { type: "buttons" }],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const media = str(s.media, "covers");
    let covers = media === "covers" ? await loadCovers(context, s) : [];
    if (!covers.length && media === "covers" && context.isPreview) covers = SAMPLE_PRODUCTS.slice(0, 3);
    const image = str(s.image) || IMG.readingLap;
    const left = s.media_position === "left";
    const hasBlocks = blocks.length > 0;
    const showCovers = media === "covers" && covers.length > 0;
    return (
      <section className={cn("folio-hero relative overflow-hidden", schemeClass(s.color_scheme))} aria-label="Introduction">
        <Container className={cn("grid items-center gap-10 py-12 md:grid-cols-[1.05fr_1fr] md:gap-14 md:py-16 lg:gap-20", HEIGHTS[str(s.height, "medium")] ?? "")}>
          <div className={cn(left && "md:order-2")}>
            {hasBlocks ? <Blocks blocks={blocks} context={context} /> : <h1 className="pai-h1">{context.store.name}</h1>}
          </div>
          <div className={cn("relative", left && "md:order-1")}>
            {showCovers ? (
              <CoverStack products={covers} context={context} caption={str(s.caption)} />
            ) : (
              <div className="relative aspect-[4/5] overflow-hidden rounded-pai bg-pai-muted md:aspect-[5/6]">
                <img src={image} alt={str(s.image_alt)} fetchPriority="high" decoding="async" className="absolute inset-0 size-full object-cover" />
              </div>
            )}
          </div>
        </Container>
      </section>
    );
  },
});
