/**
 * Artisan profiles: "maker cards" — a matted portrait with a stitched edge, name, craft, region,
 * years of practice, a handwritten quote and a link to the collection of their work.
 */
import { defineSection } from "@pai/theme-sdk";
import { Icon, Section, SmartLink, cn, num, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { Accent, Eyebrow, plain } from "./_artisan";
import { IMG } from "../images";

export const artisanProfiles = defineSection({
  schema: {
    type: "artisan-profiles",
    name: "Artisan profiles",
    category: "content",
    icon: "users",
    description: "Cards for the people behind the pieces: portrait, craft, region, years of practice, a quote and a link to their work.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "The hands behind it" },
      { type: "text", id: "heading", label: "Heading", default: "Meet our *makers*" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "Around 180 artisans in 23 villages make everything we sell. These are a few of them." },
      { type: "range", id: "columns", label: "Columns (desktop)", min: 2, max: 4, step: 1, default: 4 },
      { type: "text", id: "link_label", label: "Link label", default: "See their work" },
      { type: "text", id: "photo_note", label: "Photo note", default: "", info: "Optional small print under the cards, e.g. “Workshop photos are illustrative.”" },
      schemeField("muted"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "artisan",
        name: "Artisan",
        limit: 8,
        settings: [
          { type: "image", id: "portrait", label: "Portrait", default: IMG.potteryWheel },
          { type: "text", id: "portrait_alt", label: "Portrait description (alt text)", default: "Hands shaping clay on a wheel" },
          { type: "text", id: "name", label: "Name", default: "Rahima Begum" },
          { type: "text", id: "craft", label: "Craft", default: "Potter" },
          { type: "text", id: "region", label: "Region / village", default: "Bijoypur, Netrokona" },
          { type: "range", id: "years", label: "Years of practice", min: 0, max: 60, step: 1, default: 31 },
          { type: "textarea", id: "quote", label: "Quote", default: "The clay tells me when it is ready." },
          { type: "collection", id: "collection", label: "Their collection", info: "“See their work” links here. Falls back to all products." },
          { type: "url", id: "link", label: "Custom link", info: "Overrides the collection link, e.g. a story page." },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Artisan profiles",
        blocks: [
          { type: "artisan", settings: { name: "Rahima Begum", craft: "Potter", region: "Bijoypur, Netrokona", years: 31, portrait: IMG.potteryWheel, quote: "The clay tells me when it is ready." } },
          { type: "artisan", settings: { name: "Abdul Karim", craft: "Copper & brass smith", region: "Dhamrai, Dhaka", years: 26, portrait: IMG.metalsmith, portrait_alt: "A smith hammering a copper vessel", quote: "A jug takes ten thousand small blows." } },
          { type: "artisan", settings: { name: "Shefali Rani", craft: "Nakshi kantha embroiderer", region: "Jamalpur", years: 19, portrait: IMG.needleHands, portrait_alt: "Hands working a needle through cloth", quote: "Every quilt carries a story from our village." } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const people = blocks.filter((b) => b.type === "artisan" && str(b.settings.name));
    if (!people.length) return null;
    const collections = await Promise.all(people.map((b) => (str(b.settings.collection) ? context.data.getCollection(str(b.settings.collection)).catch(() => null) : Promise.resolve(null))));
    const heading = str(s.heading);
    const cols = num(s.columns, 4);
    const label = str(s.link_label, "See their work");
    return (
      <Section settings={s} ariaLabel={plain(heading) || "Our makers"} className="artisan-paper">
        <div className="mb-12 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
            {heading ? (
              <h2 className="pai-h2">
                <Accent text={heading} />
              </h2>
            ) : null}
            {str(s.subheading) ? <p className="mt-4 max-w-xl text-[1.02rem] opacity-75">{str(s.subheading)}</p> : null}
          </div>
        </div>
        <ul className={cn("grid gap-x-6 gap-y-10 sm:grid-cols-2", cols >= 4 ? "lg:grid-cols-4" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
          {people.map((b, i) => {
            const bs = b.settings;
            const col = collections[i];
            const href = resolveHref(context, bs.link) || col?.url || context.url("/collections/all");
            const years = num(bs.years, 0);
            return (
              <li key={b.id} className="artisan-maker group flex flex-col">
                <div className="artisan-maker-photo relative">
                  <div className="relative aspect-[4/5] overflow-hidden bg-pai-muted">
                    {str(bs.portrait) ? (
                      <img src={str(bs.portrait)} alt={str(bs.portrait_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                    ) : null}
                  </div>
                  {years > 0 ? (
                    <span className="artisan-years absolute -bottom-5 right-4 grid size-[4.5rem] place-items-center rounded-full text-center leading-none">
                      <span>
                        <span className="block font-heading text-2xl">{years}</span>
                        <span className="block text-[9px] uppercase tracking-[0.16em]">years</span>
                      </span>
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col pt-6">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-pai-accent">{str(bs.craft)}</p>
                  <h3 className="mt-1 font-heading text-2xl leading-tight">{str(bs.name)}</h3>
                  {str(bs.region) ? (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm opacity-70">
                      <Icon name="map-pin" className="size-3.5" /> {str(bs.region)}
                    </p>
                  ) : null}
                  {str(bs.quote) ? <p className="artisan-hand mt-4 text-[1.55rem] leading-[1.15] opacity-90">“{str(bs.quote)}”</p> : null}
                  <SmartLink href={href} className="artisan-arrow-link mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium" ariaLabel={`${label}: ${str(bs.name)}`}>
                    {label}
                    <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-1" />
                  </SmartLink>
                </div>
              </li>
            );
          })}
        </ul>
        {str(s.photo_note) ? <p className="mt-10 text-xs italic opacity-55">{str(s.photo_note)}</p> : null}
      </Section>
    );
  },
});
