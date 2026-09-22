/**
 * Colourful category bubbles: round collection images with thick coloured rings and a dashed orbit
 * that spins on hover. Blocks pick collections (with optional title/image/colour overrides); with
 * no blocks the section falls back to the store's collections.
 */
import type { CSSProperties } from "react";
import { defineSection, type SfCollection } from "@pai/theme-sdk";
import { Placeholder, SAMPLE_COLLECTIONS, Section, SectionHeading, SmartLink, bool, cn, headingFields, num, paddingField, str } from "@pai/theme-kit";
import { FOCUS, backgroundField, backgroundStyle, funColor, funColorField } from "./_playhouse";

type Bubble = { id: string; title: string; href: string; image: string | null; color: string; count: number | null };

export const categoryBubbles = defineSection({
  schema: {
    type: "category-bubbles",
    name: "Category bubbles",
    category: "collections",
    icon: "circle-dot",
    description: "Round collection bubbles with colourful rings.",
    settings: [
      ...headingFields({ heading: "Pop into a category", align: "center" }),
      { type: "range", id: "limit", label: "Collections when no blocks are added", min: 3, max: 12, step: 1, default: 6 },
      { type: "checkbox", id: "show_count", label: "Show product count", default: false },
      {
        type: "select",
        id: "size",
        label: "Bubble size",
        default: "large",
        options: [
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
      backgroundField("none"),
      paddingField(),
    ],
    blocks: [
      {
        type: "bubble",
        name: "Collection bubble",
        limit: 12,
        settings: [
          { type: "collection", id: "collection", label: "Collection" },
          { type: "text", id: "title", label: "Title", info: "Defaults to the collection title." },
          { type: "image", id: "image", label: "Image", info: "Defaults to the collection image." },
          funColorField("color", "Ring colour", "sunshine"),
        ],
      },
    ],
    maxBlocks: 12,
    presets: [{ name: "Category bubbles" }],
  },
  component: async ({ settings: s, blocks, context }) => {
    const picked = blocks.filter((b) => b.type === "bubble");
    let bubbles: Bubble[] = [];
    if (picked.length) {
      const slugs = picked.map((b) => str(b.settings.collection)).filter(Boolean);
      const cols = slugs.length ? await context.data.getCollections({ slugs, limit: slugs.length }).catch(() => [] as SfCollection[]) : [];
      const bySlug = new Map(cols.map((c) => [c.slug, c]));
      bubbles = picked
        .map((b, i): Bubble | null => {
          const c = bySlug.get(str(b.settings.collection));
          const title = str(b.settings.title) || c?.title || "";
          if (!title) return null;
          return {
            id: b.id,
            title,
            href: c?.url ?? context.url("/collections/all"),
            image: str(b.settings.image) || c?.image?.url || null,
            color: funColor(b.settings.color, i),
            count: c?.productsCount ?? null,
          };
        })
        .filter((b): b is Bubble => !!b);
    }
    if (!bubbles.length) {
      let cols = await context.data.getCollections({ limit: num(s.limit, 6) }).catch(() => [] as SfCollection[]);
      if (!cols.length && context.isPreview) cols = SAMPLE_COLLECTIONS.slice(0, num(s.limit, 6));
      bubbles = cols.map((c, i) => ({ id: c.id, title: c.title, href: c.url, image: c.image?.url ?? null, color: funColor(undefined, i), count: c.productsCount }));
    }
    if (!bubbles.length) return null;
    const large = str(s.size, "large") === "large";
    const showCount = bool(s.show_count);

    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Categories"} style={backgroundStyle(s.background)}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        <ul className={cn("pai-no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 pt-2 md:mx-0 md:flex-wrap md:justify-center md:gap-8 md:overflow-visible md:px-0", large ? "lg:gap-10" : "")}>
          {bubbles.map((b, i) => (
            <li key={b.id} className="shrink-0">
              <SmartLink href={b.href} className={cn("group flex flex-col items-center gap-3 rounded-3xl text-center", FOCUS, large ? "w-28 md:w-40" : "w-24 md:w-32")} style={{ "--ph-ring": b.color } as CSSProperties}>
                <span className="relative block aspect-square w-full">
                  <span aria-hidden className="ph-orbit absolute -inset-1.5 rounded-full border-[3px] border-dashed opacity-70 md:-inset-2" style={{ borderColor: b.color }} />
                  <span className={cn("absolute inset-0 overflow-hidden rounded-full border-[6px] bg-pai-muted shadow-[0_10px_24px_-16px_rgba(0,0,0,.6)] transition-transform duration-300 group-hover:scale-[1.04] md:border-8", i % 2 ? "group-hover:rotate-3" : "group-hover:-rotate-3")} style={{ borderColor: b.color }}>
                    {b.image ? <img src={b.image} alt="" loading="lazy" className="size-full object-cover" /> : <Placeholder kind="collection" className="size-full" />}
                  </span>
                </span>
                <span>
                  <span className="block font-heading text-base font-semibold leading-tight md:text-lg">{b.title}</span>
                  {showCount && b.count !== null ? <span className="text-xs font-semibold opacity-60">{b.count} products</span> : null}
                </span>
              </SmartLink>
            </li>
          ))}
        </ul>
      </Section>
    );
  },
});
