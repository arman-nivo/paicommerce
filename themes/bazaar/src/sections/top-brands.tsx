import { defineSection } from "@pai/theme-sdk";
import { SmartLink, cn, resolveHref, str } from "@pai/theme-kit";
import { BadgeCheck } from "lucide-react";
import { IMG } from "../images";
import { BzHead, BzSection, spacingField } from "../components/shared";

/** Top brands: brand tiles with a lifestyle image, logo (or monogram), name and an offer line. */
export const bazaarTopBrands = defineSection({
  schema: {
    type: "bazaar-top-brands",
    name: "Top brands",
    category: "collections",
    icon: "badge-check",
    description: "Brand tiles with image, logo or monogram, name and an “up to X% off” line.",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Top brands" },
      { type: "text", id: "subheading", label: "Tagline", default: "Official stores · 100% authentic" },
      { type: "text", id: "link_label", label: "Link label", default: "All brands" },
      { type: "url", id: "link", label: "Link", default: "/collections" },
      {
        type: "select",
        id: "columns",
        label: "Tiles per row (desktop)",
        default: "6",
        options: [
          { value: "4", label: "4" },
          { value: "6", label: "6" },
          { value: "8", label: "8" },
        ],
      },
      spacingField("small"),
    ],
    blocks: [
      {
        type: "brand",
        name: "Brand",
        limit: 16,
        settings: [
          { type: "text", id: "name", label: "Brand name", default: "Brand" },
          { type: "image", id: "image", label: "Image", default: IMG.phoneFloat },
          { type: "image", id: "logo", label: "Logo", info: "Optional. Square or round logos work best; leave empty for a monogram." },
          { type: "text", id: "offer", label: "Offer", default: "Up to 30% off" },
          { type: "url", id: "link", label: "Link", info: "Defaults to a search for the brand name." },
        ],
      },
    ],
    maxBlocks: 16,
    presets: [
      {
        name: "Top brands",
        blocks: [
          { type: "brand", settings: { name: "Xiaomi", image: IMG.phoneFloat, offer: "Up to 25% off" } },
          { type: "brand", settings: { name: "JBL", image: IMG.speakerFlip, offer: "Up to 30% off" } },
          { type: "brand", settings: { name: "QCY", image: IMG.earbudsWhite, offer: "From ৳1,490" } },
          { type: "brand", settings: { name: "Bloom Beauty", image: IMG.skincareSet, offer: "Buy 2 get 1" } },
          { type: "brand", settings: { name: "Nest Living", image: IMG.yellowArmchair, offer: "Up to 40% off" } },
          { type: "brand", settings: { name: "Aurora Studio", image: IMG.rack, offer: "New season" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const brands = blocks.filter((b) => b.type === "brand" && str(b.settings.name));
    if (!brands.length) return null;
    const heading = str(s.heading, "Top brands");
    const cols = { "4": "lg:grid-cols-4", "6": "lg:grid-cols-6", "8": "lg:grid-cols-8" }[str(s.columns, "6")] ?? "lg:grid-cols-6";
    return (
      <BzSection label={heading} padding={s.padding} className="bz-brands">
        <div className="rounded-pai bg-pai-card">
          <BzHead title={heading} href={resolveHref(context, s.link)} linkLabel={str(s.link_label)} icon={<BadgeCheck className="size-5 text-pai-primary" aria-hidden />} className="bz-head-bar px-3 py-2.5 sm:px-4">
            {str(s.subheading) ? <p className="hidden text-[0.8rem] opacity-60 sm:block">{str(s.subheading)}</p> : null}
          </BzHead>
          <ul className={cn("grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 sm:p-3 md:grid-cols-4", cols)}>
            {brands.map((b) => {
              const bs = b.settings;
              const name = str(bs.name);
              const href = resolveHref(context, bs.link) || context.url(`/search?q=${encodeURIComponent(name)}`);
              return (
                <li key={b.id}>
                  <SmartLink href={href} className="bz-brand group flex h-full flex-col overflow-hidden rounded-pai border border-pai-border bg-pai-card transition" ariaLabel={`${name}${str(bs.offer) ? ` — ${str(bs.offer)}` : ""}`}>
                    <span className="relative block aspect-[4/3] overflow-hidden bg-pai-muted">
                      {str(bs.image) ? <img src={str(bs.image)} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105" /> : null}
                    </span>
                    <span className="relative flex flex-1 flex-col items-center px-2 pb-3 pt-7 text-center">
                      <span className="absolute -top-6 left-1/2 grid size-12 -translate-x-1/2 place-items-center overflow-hidden rounded-full border-2 border-pai-card bg-pai-card shadow-md">
                        {str(bs.logo) ? (
                          <img src={str(bs.logo)} alt="" loading="lazy" className="size-full object-contain" />
                        ) : (
                          <span className="bz-monogram grid size-full place-items-center font-heading text-base font-extrabold">{name.slice(0, 1)}</span>
                        )}
                      </span>
                      <span className="block truncate text-[0.85rem] font-semibold group-hover:text-pai-primary">{name}</span>
                      {str(bs.offer) ? <span className="mt-0.5 block text-xs font-bold text-pai-sale">{str(bs.offer)}</span> : null}
                    </span>
                  </SmartLink>
                </li>
              );
            })}
          </ul>
        </div>
      </BzSection>
    );
  },
});
