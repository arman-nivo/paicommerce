/** Two or three colourful offer cards (e.g. "Up to 30% off fruit") linking to collections. */
import { defineSection, type SfCollection } from "@pai/theme-sdk";
import { Section, SmartLink, cn, paddingField, resolveHref, str } from "@pai/theme-kit";
import { ArrowRight } from "lucide-react";
import { IMG } from "../images";
import { TINT_OPTIONS, tintAt } from "./_tints";

export const offerBanners = defineSection({
  schema: {
    type: "offer-banners",
    name: "Offer banners",
    category: "marketing",
    icon: "badge-percent",
    description: "Colourful promo cards with an image, offer text and a link.",
    settings: [paddingField("small")],
    blocks: [
      {
        type: "offer",
        name: "Offer",
        limit: 3,
        settings: [
          { type: "collection", id: "collection", label: "Collection", info: "Sets the link (and image when empty)." },
          { type: "image", id: "image", label: "Image" },
          { type: "text", id: "eyebrow", label: "Eyebrow", default: "Weekend offer" },
          { type: "text", id: "heading", label: "Heading", default: "Up to 30% off" },
          { type: "text", id: "text", label: "Text", default: "" },
          { type: "text", id: "link_label", label: "Link label", default: "Shop now" },
          { type: "url", id: "link", label: "Link", info: "Overrides the collection link." },
          { type: "select", id: "tint", label: "Background", default: "auto", options: TINT_OPTIONS },
        ],
      },
    ],
    maxBlocks: 3,
    presets: [
      {
        name: "Offer banners",
        blocks: [
          { type: "offer", settings: { image: IMG.fruitsMix, eyebrow: "Weekend offer", heading: "Up to 30% off fruit", tint: "orange" } },
          { type: "offer", settings: { image: IMG.meatBoard, eyebrow: "Cut to order", heading: "Halal meat & fish", tint: "red" } },
          { type: "offer", settings: { image: IMG.rice, eyebrow: "Stock up", heading: "Rice & oil, bulk prices", tint: "yellow" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const offers = blocks.filter((b) => b.type === "offer");
    if (!offers.length) return null;
    const cols = await Promise.all(offers.map((b) => (str(b.settings.collection) ? context.data.getCollection(str(b.settings.collection)).catch(() => null) : Promise.resolve(null as SfCollection | null))));
    return (
      <Section settings={s} ariaLabel="Offers">
        <div className={cn("grid gap-3 md:gap-4", offers.length === 3 ? "md:grid-cols-3" : offers.length === 2 ? "md:grid-cols-2" : "")}>
          {offers.map((b, i) => {
            const bs = b.settings;
            const c = cols[i];
            const img = str(bs.image) || c?.image?.url || "";
            const href = str(bs.link) ? resolveHref(context, bs.link) : c?.url ?? context.url("/collections/all");
            return (
              <SmartLink key={b.id} href={href} className="group relative isolate flex min-h-[190px] overflow-hidden rounded-[calc(var(--pai-radius)+6px)] p-5 text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2 sm:p-6" style={{ background: tintAt(bs.tint, i + 1) }}>
                {img ? <img src={img} alt="" loading="lazy" className="absolute -right-8 top-1/2 -z-10 size-48 -translate-y-1/2 rounded-full object-cover shadow-xl ring-8 ring-white/60 transition duration-500 group-hover:scale-105 md:size-52" /> : null}
                <span className="flex max-w-[58%] flex-col justify-between gap-3">
                  <span>
                    {str(bs.eyebrow) ? <span className="block text-[11px] font-extrabold uppercase tracking-wider text-pai-sale">{str(bs.eyebrow)}</span> : null}
                    <span className="mt-1 block font-heading text-xl font-extrabold leading-tight md:text-2xl">{str(bs.heading) || c?.title}</span>
                    {str(bs.text) ? <span className="mt-1 block text-sm text-neutral-700">{str(bs.text)}</span> : null}
                  </span>
                  {str(bs.link_label) ? (
                    <span className="inline-flex w-fit items-center gap-1 text-sm font-bold underline-offset-4 group-hover:underline">
                      {str(bs.link_label)} <ArrowRight className="size-4" aria-hidden />
                    </span>
                  ) : null}
                </span>
              </SmartLink>
            );
          })}
        </div>
      </Section>
    );
  },
});
