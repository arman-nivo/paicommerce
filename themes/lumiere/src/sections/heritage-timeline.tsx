/**
 * Craftsmanship / heritage timeline: milestones (year, title, text, optional image) hung on a
 * vertical gold rule — alternating sides on desktop, a single left rule on phones.
 */
import { defineSection } from "@pai/theme-sdk";
import { Section, SmartLink, bool, cn, headingFields, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { Heading } from "./_lumiere";
import { IMG } from "../images";

export const heritageTimeline = defineSection({
  schema: {
    type: "heritage-timeline",
    name: "Heritage timeline",
    category: "content",
    icon: "milestone",
    description: "Milestones of your house on a vertical gold rule — year, title, story and image.",
    settings: [
      ...headingFields({ eyebrow: "Our heritage", heading: "Three generations at the bench", subheading: "From a single workbench in Tanti Bazar to a Dhanmondi atelier — the same hands, the same standards.", align: "center" }),
      { type: "checkbox", id: "alternate", label: "Alternate sides on desktop", default: true },
      { type: "checkbox", id: "show_images", label: "Show milestone images", default: true },
      { type: "text", id: "button_label", label: "Button label", default: "" },
      { type: "url", id: "button_link", label: "Button link", default: "/pages/about" },
      schemeField("muted"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "milestone",
        name: "Milestone",
        limit: 10,
        settings: [
          { type: "text", id: "year", label: "Year", default: "1998" },
          { type: "text", id: "title", label: "Title", default: "The first workbench" },
          { type: "textarea", id: "text", label: "Text", default: "Our founder opens a two-seat workshop in Old Dhaka, making 22K wedding sets to order." },
          { type: "image", id: "image", label: "Image" },
          { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
        ],
      },
    ],
    maxBlocks: 10,
    presets: [
      {
        name: "Heritage timeline",
        blocks: [
          { type: "milestone", settings: { year: "1998", title: "The first workbench", image: IMG.metalsmith } },
          { type: "milestone", settings: { year: "2010", title: "Hallmarked, always", text: "Every piece independently assayed and hallmarked for purity — a promise we have never broken." } },
          { type: "milestone", settings: { year: "2024", title: "The Dhanmondi atelier", text: "A quiet salon for private viewings, bespoke commissions and bridal fittings." } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const items = blocks.filter((b) => b.type === "milestone");
    if (!items.length) return null;
    const alt = bool(s.alternate, true);
    const imgs = bool(s.show_images, true);
    const btnHref = resolveHref(context, s.button_link, "/pages/about");
    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Our heritage"} className="lumiere-timeline">
        <Heading eyebrow={str(s.eyebrow)} heading={str(s.heading)} text={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        <ol className={cn("relative mx-auto max-w-5xl", alt ? "lumiere-tl-alt" : "lumiere-tl-left")}>
          <span aria-hidden className={cn("lumiere-tl-rule absolute bottom-2 top-2 w-px", alt ? "left-[7px] md:left-1/2" : "left-[7px]")} />
          {items.map((b, i) => {
            const bs = b.settings;
            const right = alt && i % 2 === 1;
            const image = imgs ? str(bs.image) : "";
            return (
              <li key={b.id} className={cn("relative pb-16 pl-12 last:pb-0", alt && "md:grid md:grid-cols-2 md:gap-20 md:pl-0")}>
                <span aria-hidden className={cn("lumiere-tl-dot absolute top-3 size-[15px] rotate-45", alt ? "left-0 md:left-1/2 md:-translate-x-1/2" : "left-0")} />
                <div className={cn(alt && (right ? "md:col-start-2" : "md:text-right"))}>
                  <p className="lumiere-year font-heading text-5xl italic leading-none md:text-6xl">{str(bs.year)}</p>
                  {str(bs.title) ? <h3 className="mt-4 font-heading text-2xl leading-tight">{str(bs.title)}</h3> : null}
                  {str(bs.text) ? <p className={cn("mt-3 max-w-md text-[0.95rem] leading-[1.8] opacity-70", alt && !right && "md:ml-auto")}>{str(bs.text)}</p> : null}
                </div>
                {image ? (
                  <div className={cn("mt-6 md:mt-0", alt && (right ? "md:col-start-1 md:row-start-1" : ""))}>
                    <div className={cn("lumiere-frame relative aspect-[4/3] max-w-md overflow-hidden bg-pai-card", alt && right && "md:ml-auto")}>
                      <img src={image} alt={str(bs.image_alt)} loading="lazy" decoding="async" className="lumiere-slowzoom absolute inset-0 size-full object-cover" />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
        {str(s.button_label) && btnHref ? (
          <div className="mt-16 text-center">
            <SmartLink href={btnHref} className="pai-btn pai-btn-secondary">
              {str(s.button_label)}
            </SmartLink>
          </div>
        ) : null}
      </Section>
    );
  },
});
