/**
 * Digital download callout: explains instant delivery, formats and devices for eBooks and
 * courses, with a row of digital products (e.g. the "courses" collection).
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Icon, ICON_OPTIONS, PreviewNotice, Section, cn, loadSectionProducts, num, paddingField, productSourceFields, readButton, buttonFields, schemeField, str } from "@pai/theme-kit";
import { IMG } from "../images";
import { FolioCard } from "./card";

/** Kit icons plus a few for digital goods. */
export const FOLIO_ICONS = [
  ...ICON_OPTIONS,
  { value: "download", label: "Download" },
  { value: "smartphone", label: "Phone" },
  { value: "tablet", label: "Tablet" },
  { value: "book-open", label: "Open book" },
  { value: "file-text", label: "Document (PDF)" },
  { value: "graduation-cap", label: "Graduation cap" },
  { value: "infinity", label: "Lifetime access" },
  { value: "headphones", label: "Audio" },
];

export const digitalCallout = defineSection({
  schema: {
    type: "digital-callout",
    name: "Digital downloads",
    category: "marketing",
    icon: "download",
    description: "Instant delivery, formats and devices for eBooks and courses — with a row of digital products.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "The digital shelf" },
      { type: "text", id: "heading", label: "Heading", default: "Read tonight. Learn this weekend." },
      { type: "textarea", id: "text", label: "Text", default: "eBooks and online courses are delivered the moment you pay — no courier, no waiting." },
      { type: "text", id: "formats", label: "Formats line", default: "PDF · EPUB · Streamed video lessons" },
      { type: "image", id: "image", label: "Image", default: IMG.ebookLaptop },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "An eBook open on a laptop" },
      ...buttonFields("button", { label: "Browse eBooks & courses", link: "/collections/all", style: "light" }),
      { type: "header", label: "Products" },
      ...productSourceFields({ source: "collection", limit: 3 }),
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "products",
        options: [
          { value: "products", label: "Features + product row" },
          { value: "image", label: "Features + image" },
        ],
      },
      schemeField("inverse"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "feature",
        name: "Feature",
        limit: 6,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "zap", options: FOLIO_ICONS },
          { type: "text", id: "title", label: "Title", default: "Instant delivery" },
          { type: "textarea", id: "text", label: "Text", default: "Download links arrive by email and in your account right after payment." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Digital downloads",
        blocks: [
          { type: "feature", settings: { icon: "zap", title: "Instant delivery", text: "Download links arrive by email and in your account right after payment." } },
          { type: "feature", settings: { icon: "smartphone", title: "Any device", text: "Read on your phone, tablet, laptop or Kindle." } },
          { type: "feature", settings: { icon: "shield-check", title: "Yours to keep", text: "Lifetime access — re-download whenever you need." } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const layout = str(s.layout, "products");
    const { products, sample, collectionUrl } = layout === "products" ? await loadSectionProducts(context, s, 3) : { products: [], sample: false, collectionUrl: null };
    const btn = readButton(context, s, "button");
    const href = btn ? (str(s.button_link) && str(s.button_link) !== "/collections/all" ? btn.href : collectionUrl ?? btn.href) : null;
    const image = str(s.image);
    const heading = str(s.heading);
    const showProducts = layout === "products" && products.length > 0;
    const limit = num(s.limit, 3);

    return (
      <Section settings={s} ariaLabel={heading || "Digital downloads"} className="folio-digital">
        {sample && str(s.source) === "collection" ? <PreviewNotice context={context}>Select a collection of digital products. Showing sample products.</PreviewNotice> : null}
        <div className={cn("grid gap-12 lg:gap-16", showProducts || image ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : "")}>
          <div className="flex flex-col">
            {str(s.eyebrow) ? <p className="pai-eyebrow mb-3">{str(s.eyebrow)}</p> : null}
            {heading ? <h2 className="pai-h2 [text-wrap:balance]">{heading}</h2> : null}
            {str(s.text) ? <p className="mt-4 max-w-md text-lg opacity-80">{str(s.text)}</p> : null}
            {blocks.length ? (
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1">
                {blocks.map((b) => (
                  <li key={b.id} className="flex gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-pai-border">
                      <Icon name={str(b.settings.icon, "zap")} className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block font-semibold">{str(b.settings.title)}</span>
                      {str(b.settings.text) ? <span className="mt-0.5 block text-sm opacity-75">{str(b.settings.text)}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {str(s.formats) ? <p className="mt-8 border-t border-pai-border pt-5 text-[11px] font-medium uppercase tracking-[0.22em] opacity-70">{str(s.formats)}</p> : null}
            {btn && href ? (
              <ButtonLink href={href} variant={btn.variant} className="mt-7 w-fit">
                {btn.label}
              </ButtonLink>
            ) : null}
          </div>
          {showProducts ? (
            <div className={cn("pai-no-scrollbar -mx-4 flex snap-x gap-4 self-center overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:gap-x-6 sm:gap-y-8 sm:overflow-visible sm:px-0 sm:pb-0", limit >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
              {products.map((p) => (
                <div key={p.id} className="folio-digital-card w-[64%] shrink-0 snap-start rounded-pai bg-pai-muted p-3 sm:w-auto sm:p-4">
                  <FolioCard product={p} context={context} size="sm" />
                </div>
              ))}
            </div>
          ) : image ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-pai bg-pai-muted">
              <img src={image} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
            </div>
          ) : null}
        </div>
      </Section>
    );
  },
});
