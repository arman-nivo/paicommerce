/**
 * Gallery grid: a masonry wall of work and workshop photos, each with a handwritten caption or a
 * museum label, optionally linked to a product ("title · region · price") or any URL.
 */
import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { ButtonLink, Price, Section, SmartLink, buttonFields, cn, moneyOf, num, paddingField, readButton, resolveHref, schemeField, str } from "@pai/theme-kit";
import { Accent, Eyebrow, plain, regionOf } from "./_artisan";
import { WORKSHOP_GALLERY } from "../images";

const SHAPES: Record<string, string> = { auto: "", tall: "aspect-[3/4]", square: "aspect-square", wide: "aspect-[4/3]" };

export const galleryGrid = defineSection({
  schema: {
    type: "gallery-grid",
    name: "Gallery grid",
    category: "media",
    icon: "layout-grid",
    description: "Masonry of work & workshop photos with handwritten captions and optional product links.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "From the workshop floor" },
      { type: "text", id: "heading", label: "Heading", default: "Where every piece *begins*" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "Clay drying in the sun, copper under the hammer, thread on the needle — a look inside the workshops we work with." },
      { type: "range", id: "columns", label: "Columns (desktop)", min: 2, max: 4, step: 1, default: 4 },
      {
        type: "select",
        id: "caption_style",
        label: "Caption style",
        default: "hand",
        options: [
          { value: "hand", label: "Handwritten, under the photo" },
          { value: "label", label: "Museum label, on hover" },
          { value: "none", label: "Hidden" },
        ],
      },
      { type: "checkbox", id: "matted", label: "Paper mat around photos", default: true },
      ...buttonFields("button", { label: "Read our maker stories", link: "/blog", style: "secondary" }),
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "image",
        name: "Photo",
        limit: 16,
        settings: [
          { type: "image", id: "image", label: "Image" },
          { type: "text", id: "alt", label: "Image description (alt text)", default: "" },
          { type: "text", id: "caption", label: "Caption", default: "" },
          {
            type: "select",
            id: "shape",
            label: "Shape",
            default: "auto",
            options: [
              { value: "auto", label: "Original" },
              { value: "tall", label: "Tall" },
              { value: "square", label: "Square" },
              { value: "wide", label: "Wide" },
            ],
          },
          { type: "product", id: "product", label: "Linked product", info: "Optional — shows the piece's name, region and price." },
          { type: "url", id: "link", label: "Link", info: "Used when no product is linked." },
        ],
      },
    ],
    maxBlocks: 16,
    presets: [
      {
        name: "Gallery grid",
        blocks: WORKSHOP_GALLERY.slice(0, 6).map((g) => ({ type: "image", settings: { image: g.image, alt: g.alt, caption: g.caption } })),
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const items = blocks.filter((b) => b.type === "image" && str(b.settings.image));
    if (!items.length) return null;
    const products = await Promise.all(items.map((b) => (str(b.settings.product) ? context.data.getProduct(str(b.settings.product)).catch(() => null) : Promise.resolve(null))));
    const money = moneyOf(context);
    const heading = str(s.heading);
    const cols = num(s.columns, 4);
    const style = str(s.caption_style, "hand");
    const matted = s.matted !== false;
    const btn = readButton(context, s, "button");

    const tile = (b: (typeof items)[number], p: SfProduct | null) => {
      const bs = b.settings;
      const caption = str(bs.caption);
      const href = p?.url ?? resolveHref(context, bs.link);
      const shape = SHAPES[str(bs.shape, "auto")] ?? "";
      const media = (
        <span className={cn("relative block overflow-hidden bg-pai-muted", shape)}>
          <img
            src={str(bs.image)}
            alt={str(bs.alt) || caption}
            loading="lazy"
            decoding="async"
            className={cn("block w-full transition duration-700 group-hover:scale-[1.03]", shape ? "absolute inset-0 size-full object-cover" : "h-auto")}
          />
          {style === "label" && (caption || p) ? (
            <span className="artisan-label absolute inset-x-3 bottom-3 translate-y-2 px-3 py-2 text-xs opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              <span className="block font-heading text-sm">{p?.title ?? caption}</span>
              {p ? (
                <span className="flex items-center gap-1.5 opacity-75">
                  {regionOf(p)} · <Price price={p.price} compareAt={p.compareAtPrice} size="sm" {...money} />
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
      );
      const under =
        style === "hand" && (caption || p) ? (
          <span className="mt-3 flex items-baseline justify-between gap-3 px-1">
            <span className="artisan-hand text-[1.45rem] leading-none">{caption || p?.title}</span>
            {p ? <Price price={p.price} size="sm" className="shrink-0 opacity-80" {...money} /> : null}
          </span>
        ) : null;
      const inner = (
        <>
          <span className={cn("block", matted && "artisan-mat")}>{media}</span>
          {under}
        </>
      );
      return href ? (
        <SmartLink href={href} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pai-accent" ariaLabel={p ? `${p.title} — ${caption || "view piece"}` : caption || undefined}>
          {inner}
        </SmartLink>
      ) : (
        <figure className="group">{inner}</figure>
      );
    };

    return (
      <Section settings={s} ariaLabel={plain(heading) || "Gallery"}>
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
            {heading ? (
              <h2 className="pai-h2">
                <Accent text={heading} />
              </h2>
            ) : null}
            {str(s.subheading) ? <p className="mt-4 max-w-xl opacity-75">{str(s.subheading)}</p> : null}
          </div>
          {btn ? (
            <ButtonLink href={btn.href} variant={btn.variant} className="shrink-0">
              {btn.label}
            </ButtonLink>
          ) : null}
        </div>
        <ul className={cn("columns-2 gap-4 md:gap-6", cols >= 4 ? "lg:columns-4" : cols === 3 ? "md:columns-3" : "")}>
          {items.map((b, i) => (
            <li key={b.id} className="mb-4 break-inside-avoid md:mb-6">
              {tile(b, products[i] ?? null)}
            </li>
          ))}
        </ul>
      </Section>
    );
  },
});
