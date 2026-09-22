import { defineSection } from "@pai/theme-sdk";
import { ICON_OPTIONS, Icon, SmartLink, cn, resolveHref, str } from "@pai/theme-kit";
import { IMG } from "../images";
import { BzSection, spacingField } from "../components/shared";

/** A row of 2–4 image banners with badge, heading and a CTA pill. */
export const bazaarPromoBanners = defineSection({
  schema: {
    type: "bazaar-promo-banners",
    name: "Promo banners",
    category: "marketing",
    icon: "gallery-horizontal",
    description: "Row of 2–4 image banners (campaigns, categories, bank offers).",
    settings: [
      {
        type: "select",
        id: "height",
        label: "Banner height",
        default: "medium",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
      spacingField("small"),
    ],
    blocks: [
      {
        type: "banner",
        name: "Banner",
        limit: 4,
        settings: [
          { type: "image", id: "image", label: "Image", default: IMG.livingBright },
          { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
          { type: "text", id: "eyebrow", label: "Badge", default: "Up to 50% off" },
          { type: "text", id: "heading", label: "Heading", default: "Home makeover" },
          { type: "text", id: "text", label: "Text", default: "" },
          { type: "text", id: "button_label", label: "Button label", default: "Shop now" },
          { type: "url", id: "link", label: "Link", default: "/collections/all" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Promo banners",
        blocks: [
          { type: "banner" },
          { type: "banner", settings: { image: IMG.produceAisle, eyebrow: "Save ৳200", heading: "Fresh groceries", link: "/collections/groceries" } },
          { type: "banner", settings: { image: IMG.colorRack, eyebrow: "New season", heading: "Fashion under ৳999", link: "/collections/fashion" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const banners = blocks.filter((b) => b.type === "banner" && str(b.settings.image));
    if (!banners.length) return null;
    const h = { small: "min-h-[100px] sm:min-h-[140px]", medium: "min-h-[120px] sm:min-h-[190px]", large: "min-h-[160px] sm:min-h-[260px]" }[str(s.height, "medium")] ?? "min-h-[150px]";
    const cols = banners.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : banners.length === 3 ? "sm:grid-cols-3" : banners.length === 2 ? "sm:grid-cols-2" : "";
    return (
      <BzSection label="Promotions" padding={s.padding} className="bz-banners">
        <ul className={cn("grid grid-cols-1 gap-2 sm:gap-3", cols)}>
          {banners.map((b) => {
            const bs = b.settings;
            return (
              <li key={b.id}>
                <SmartLink href={resolveHref(context, bs.link, "/collections/all")} className={cn("bz-banner group relative isolate flex h-full flex-col justify-center overflow-hidden rounded-pai p-4 text-white sm:p-5", h)}>
                  <img src={str(bs.image)} alt={str(bs.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 -z-20 size-full object-cover transition duration-700 group-hover:scale-105" />
                  <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                  {str(bs.eyebrow) ? <span className="bz-pill mb-1.5 bg-pai-sale text-white">{str(bs.eyebrow)}</span> : null}
                  <span className="max-w-[16rem] font-heading text-xl font-bold leading-tight sm:text-2xl">{str(bs.heading)}</span>
                  {str(bs.text) ? <span className="mt-1 max-w-[16rem] text-xs opacity-85 sm:text-sm">{str(bs.text)}</span> : null}
                  {str(bs.button_label) ? <span className="bz-slide-btn mt-3 inline-flex w-fit rounded-pai-btn px-3.5 py-1.5 text-xs font-bold">{str(bs.button_label)}</span> : null}
                </SmartLink>
              </li>
            );
          })}
        </ul>
      </BzSection>
    );
  },
});

/** Compact promise bar: icon + title + text items in a single white strip. */
export const bazaarTrustBar = defineSection({
  schema: {
    type: "bazaar-trust-bar",
    name: "Trust bar",
    category: "content",
    icon: "shield-check",
    description: "A compact strip of service promises (COD, delivery, returns, genuine products).",
    settings: [spacingField("small")],
    blocks: [
      {
        type: "item",
        name: "Promise",
        limit: 6,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "truck", options: ICON_OPTIONS },
          { type: "text", id: "title", label: "Title", default: "Nationwide delivery" },
          { type: "text", id: "text", label: "Text", default: "All 64 districts" },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Trust bar",
        blocks: [
          { type: "item" },
          { type: "item", settings: { icon: "banknote", title: "Cash on delivery", text: "Pay at your door" } },
          { type: "item", settings: { icon: "rotate-ccw", title: "7-day returns", text: "Hassle-free" } },
          { type: "item", settings: { icon: "shield-check", title: "100% genuine", text: "Verified sellers" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks }) => {
    const items = blocks.filter((b) => b.type === "item" && str(b.settings.title));
    if (!items.length) return null;
    return (
      <BzSection label="Our promises" padding={s.padding} className="bz-trust">
        <ul className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-pai bg-pai-border", items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3", items.length >= 5 && "xl:grid-cols-5")}>
          {items.map((b) => (
            <li key={b.id} className="flex items-center gap-2.5 bg-pai-card px-3 py-2.5 sm:px-4">
              <Icon name={str(b.settings.icon, "truck")} className="size-6 shrink-0 text-pai-primary" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[0.8rem] font-semibold">{str(b.settings.title)}</span>
                <span className="block truncate text-[0.7rem] opacity-60">{str(b.settings.text)}</span>
              </span>
            </li>
          ))}
        </ul>
      </BzSection>
    );
  },
});
