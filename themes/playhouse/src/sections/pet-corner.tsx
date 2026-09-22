/**
 * Pet corner: a feature panel for the pet collection — a big blob-framed pet photo, copy with perks
 * (blocks), a button, scattered paw prints and a row of products from the chosen collection
 * (falling back to pet-tagged best sellers, then best sellers).
 */
import { PawPrint } from "lucide-react";
import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { ButtonLink, Icon, ICON_OPTIONS, SAMPLE_PRODUCTS, Section, bool, buttonFields, cn, num, paddingField, readButton, str } from "@pai/theme-kit";
import { Carousel } from "@pai/theme-kit/client";
import { IMG } from "../images";
import { PlayhouseCard } from "./card";
import { Blob, funAt, funColor, funColorField, tint } from "./_playhouse";

const PAWS = [
  "left-[4%] top-[10%] rotate-[-20deg] size-8",
  "left-[14%] top-[28%] rotate-[10deg] size-5",
  "right-[6%] top-[8%] rotate-[25deg] size-10",
  "right-[18%] bottom-[12%] rotate-[-10deg] size-6",
  "left-[40%] bottom-[6%] rotate-[15deg] size-7",
];

export const petCorner = defineSection({
  schema: {
    type: "pet-corner",
    name: "Pet corner",
    category: "products",
    icon: "paw-print",
    description: "Feature your pet collection: photo, perks, button and a product row.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Pet corner" },
      { type: "text", id: "heading", label: "Heading", default: "Treats, toys & cosy things for furry friends" },
      { type: "textarea", id: "text", label: "Text", default: "Vet-approved food, chew-proof toys and snuggly hoodies for Dhaka's happiest dogs and cats." },
      ...buttonFields("button", { label: "Visit the pet corner", link: "/collections/pet-supplies", style: "primary" }),
      { type: "image", id: "image", label: "Image", default: IMG.corgiOrange },
      { type: "text", id: "image_alt", label: "Image description", default: "A corgi puppy sitting on an orange background" },
      {
        type: "select",
        id: "image_position",
        label: "Image position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      funColorField("color", "Panel colour", "sunshine"),
      { type: "checkbox", id: "paws", label: "Show paw prints", default: true },
      { type: "header", label: "Products" },
      { type: "collection", id: "collection", label: "Collection" },
      { type: "range", id: "limit", label: "Products", min: 0, max: 8, step: 1, default: 4 },
      {
        type: "select",
        id: "layout",
        label: "Product layout",
        default: "grid",
        options: [
          { value: "grid", label: "Grid" },
          { value: "carousel", label: "Carousel" },
        ],
      },
      paddingField(),
    ],
    blocks: [
      {
        type: "perk",
        name: "Perk",
        limit: 4,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "shield-check", options: ICON_OPTIONS },
          { type: "text", id: "text", label: "Text", default: "Vet-approved brands" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Pet corner",
        settings: { collection: "pet-supplies" },
        blocks: [
          { type: "perk", settings: { icon: "shield-check", text: "Vet-approved brands" } },
          { type: "perk", settings: { icon: "truck", text: "Same-day delivery in Dhaka" } },
          { type: "perk", settings: { icon: "heart", text: "Chew-tested by our shop dogs" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const limit = num(s.limit, 4);
    const slug = str(s.collection);
    let products: SfProduct[] = [];
    let collectionUrl: string | null = null;
    if (limit > 0) {
      if (slug) {
        const [r, c] = await Promise.all([context.data.getProducts({ collection: slug, limit, sort: "best-selling" }).catch(() => null), context.data.getCollection(slug).catch(() => null)]);
        products = r?.items ?? [];
        collectionUrl = c?.url ?? null;
      }
      if (!products.length) {
        const r = await context.data.getProducts({ sort: "best-selling", limit: 60 }).catch(() => null);
        const all = r?.items ?? [];
        const pets = all.filter((p) => /\b(dog|cat|puppy|kitten|pet)\b/i.test([...p.tags, p.title, p.productType ?? ""].join(" ")));
        products = (pets.length ? pets : all).slice(0, limit);
      }
      if (!products.length && context.isPreview) products = SAMPLE_PRODUCTS.slice(0, limit);
    }
    const color = funColor(s.color, 0);
    const button = readButton(context, s, "button");
    const href = button?.href ?? collectionUrl ?? context.url("/collections/all");
    const perks = blocks.filter((b) => b.type === "perk" && str(b.settings.text));
    const right = s.image_position === "right";
    const image = str(s.image);
    const heading = str(s.heading);

    return (
      <Section settings={s} ariaLabel={heading || "Pet corner"}>
        <div className="relative isolate overflow-hidden rounded-[36px] px-5 py-8 md:px-10 md:py-12" style={{ background: tint(color, 40) }}>
          {bool(s.paws, true) ? (
            <div aria-hidden className="absolute inset-0 -z-10">
              {PAWS.map((cls, i) => (
                <PawPrint key={i} className={cn("absolute opacity-25", cls)} style={{ color: funAt(i + 1) }} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
          ) : null}
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className={cn("relative mx-auto w-full max-w-md", right && "md:order-2")}>
              <Blob variant={2} color={color} className="absolute -inset-4 -z-10 size-[calc(100%+2rem)] -rotate-6" />
              <div className="relative aspect-square overflow-hidden rounded-[58%_42%_48%_52%/52%_55%_45%_48%] border-[6px] border-white shadow-[0_24px_40px_-24px_rgba(0,0,0,.5)]">
                {image ? <img src={image} alt={str(s.image_alt)} loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
              </div>
              <span aria-hidden className="ph-float absolute -bottom-3 right-4 grid size-16 place-items-center rounded-full border-4 border-white text-pai-fg shadow-md" style={{ background: funAt(2) }}>
                <PawPrint className="size-7" fill="currentColor" strokeWidth={0} />
              </span>
            </div>
            <div className={cn(right && "md:order-1")}>
              {str(s.eyebrow) ? (
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-sm font-extrabold">
                  <PawPrint className="size-4" style={{ color }} fill="currentColor" strokeWidth={0} aria-hidden />
                  {str(s.eyebrow)}
                </p>
              ) : null}
              {heading ? <h2 className="pai-h2 [text-wrap:balance]">{heading}</h2> : null}
              {str(s.text) ? <p className="mt-4 max-w-lg text-lg font-semibold opacity-80">{str(s.text)}</p> : null}
              {perks.length ? (
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {perks.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-2.5 rounded-full bg-white/75 py-1.5 pl-1.5 pr-4 text-sm font-bold">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full text-[#1f1f1f]" style={{ background: funAt(i + 2) }}>
                        <Icon name={str(p.settings.icon, "heart")} className="size-4" />
                      </span>
                      {str(p.settings.text)}
                    </li>
                  ))}
                </ul>
              ) : null}
              {button ? (
                <ButtonLink href={href} variant={button.variant} size="lg" className="ph-btn-pop mt-7">
                  {button.label}
                </ButtonLink>
              ) : null}
            </div>
          </div>
          {products.length ? (
            <div className="mt-10">
              {s.layout === "carousel" ? (
                <Carousel perView={{ base: 1.6, md: 3, lg: 4 }} gap={16} ariaLabel="Pet products">
                  {products.map((p) => (
                    <PlayhouseCard key={p.id} product={p} context={context} />
                  ))}
                </Carousel>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
                  {products.map((p) => (
                    <PlayhouseCard key={p.id} product={p} context={context} />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </Section>
    );
  },
});
