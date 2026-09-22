/**
 * Shop by age: big colourful tiles (or round stickers) — one block per age group with a label,
 * caption, emoji or image, colour and a link/collection.
 */
import { defineSection } from "@pai/theme-sdk";
import { Section, SectionHeading, SmartLink, cn, headingFields, paddingField, resolveHref, str } from "@pai/theme-kit";
import { ArrowRight } from "lucide-react";
import { Blob, FOCUS, backgroundField, backgroundStyle, funColor, funColorField, tint } from "./_playhouse";
import { DEFAULT_AGES } from "./header";
import { IMG } from "../images";

const AGE_IMAGES = [IMG.babyFeet, IMG.stackingRings, IMG.crayons, IMG.woodenTrain, IMG.lego];

export const shopByAge = defineSection({
  schema: {
    type: "shop-by-age",
    name: "Shop by age",
    category: "collections",
    icon: "baby",
    description: "Colourful age-group tiles linking to collections or searches.",
    settings: [
      ...headingFields({ eyebrow: "Shop by age", heading: "Just right for every stage", subheading: "Hand-picked toys that grow with your little one — from first rattles to big-kid builds.", align: "center" }),
      {
        type: "select",
        id: "style",
        label: "Style",
        default: "tiles",
        options: [
          { value: "tiles", label: "Tiles with emoji" },
          { value: "photos", label: "Tiles with photos" },
          { value: "stickers", label: "Round stickers" },
        ],
      },
      { type: "text", id: "tile_tag", label: "Small label on tiles", default: "Ages", info: "E.g. “Ages”, “Shop for”. Leave empty to hide." },
      backgroundField("none"),
      paddingField(),
    ],
    blocks: [
      {
        type: "age",
        name: "Age group",
        limit: 8,
        settings: [
          { type: "text", id: "label", label: "Age label", default: "3–5y" },
          { type: "text", id: "caption", label: "Caption", default: "Little learners" },
          { type: "text", id: "emoji", label: "Emoji / icon", default: "🎨", info: "One emoji, e.g. 🍼 🧸 🎨 🚂 🧩" },
          { type: "image", id: "image", label: "Image", info: "Used by the photo and sticker styles." },
          funColorField("color", "Colour", "sky"),
          { type: "collection", id: "collection", label: "Collection", info: "Optional — overrides the link." },
          { type: "url", id: "link", label: "Link", default: "/collections/all" },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Shop by age",
        blocks: DEFAULT_AGES.map(({ label, caption, emoji, color, link }, i) => ({ type: "age", settings: { label, caption, emoji, color, link, image: AGE_IMAGES[i] } })),
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const ages = blocks
      .filter((b) => b.type === "age" && str(b.settings.label))
      .map((b, i) => ({
        id: b.id,
        label: str(b.settings.label),
        caption: str(b.settings.caption),
        emoji: str(b.settings.emoji),
        image: str(b.settings.image),
        color: funColor(b.settings.color, i),
        href: str(b.settings.collection) ? context.url(`/collections/${str(b.settings.collection)}`) : resolveHref(context, b.settings.link, "/collections/all"),
      }));
    if (!ages.length) {
      if (!context.isPreview) return null;
      return (
        <Section settings={s}>
          <p className="rounded-pai border-2 border-dashed border-pai-border p-8 text-center text-sm opacity-70">Add “Age group” blocks to build your Shop by age tiles.</p>
        </Section>
      );
    }
    const style = str(s.style, "tiles");
    const cols = ages.length <= 4 ? "lg:grid-cols-4" : ages.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-6";
    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Shop by age"} style={backgroundStyle(s.background)}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        {style === "stickers" ? (
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-7 md:gap-x-8">
            {ages.map((a, i) => (
              <li key={a.id}>
                <SmartLink href={a.href} className={cn("ph-hover-wiggle group flex w-28 flex-col items-center gap-3 rounded-3xl text-center md:w-36", FOCUS)}>
                  <span className={cn("ph-wiggle relative grid size-28 place-items-center overflow-hidden rounded-full border-[6px] border-white shadow-[0_10px_24px_-14px_rgba(0,0,0,.5)] md:size-36", i % 2 ? "rotate-3" : "-rotate-3")} style={{ background: a.color }}>
                    {a.image ? <img src={a.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : <span aria-hidden className="text-5xl">{a.emoji || "★"}</span>}
                  </span>
                  <span>
                    <span className="block font-heading text-xl font-bold">{a.label}</span>
                    {a.caption ? <span className="block text-sm font-semibold opacity-70">{a.caption}</span> : null}
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        ) : (
          <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5", cols)}>
            {ages.map((a, i) => (
              <li key={a.id} className={cn(ages.length % 2 === 1 && i === ages.length - 1 && "col-span-2 sm:col-span-1")}>
                <SmartLink
                  href={a.href}
                  className={cn("ph-hover-wiggle ph-lift group relative isolate flex h-full min-h-44 flex-col justify-between overflow-hidden rounded-[28px] p-5 transition-[transform,box-shadow] duration-300 hover:shadow-[0_18px_30px_-18px_rgba(0,0,0,.45)] md:min-h-56 md:p-6", FOCUS)}
                  style={{ background: tint(a.color, 55) }}
                >
                  <Blob variant={i} color="white" className="absolute -bottom-16 -right-14 -z-10 size-48 opacity-60 transition-transform duration-500 group-hover:scale-110" />
                  {style === "photos" && a.image ? (
                    <span className="ph-wiggle absolute bottom-4 right-4 -z-10 size-24 overflow-hidden rounded-full border-4 border-white shadow-md md:size-28">
                      <img src={a.image} alt="" loading="lazy" className="size-full object-cover" />
                    </span>
                  ) : (
                    <span aria-hidden className="ph-wiggle absolute bottom-4 right-5 text-5xl drop-shadow-sm md:text-6xl">
                      {a.emoji || "★"}
                    </span>
                  )}
                  {str(s.tile_tag) ? <span className="self-start rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em]">{str(s.tile_tag)}</span> : <span />}
                  <span className="mt-6">
                    <span className="block font-heading text-4xl font-bold leading-none md:text-5xl">{a.label}</span>
                    {a.caption ? <span className="mt-1.5 block max-w-[60%] text-sm font-bold opacity-75">{a.caption}</span> : null}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold">
                      Shop <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        )}
      </Section>
    );
  },
});
