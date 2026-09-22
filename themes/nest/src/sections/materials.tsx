/**
 * Material & craftsmanship: a workshop photograph and a short story next to a list of materials —
 * each with a round swatch, origin, what it's like to live with and care notes in a disclosure.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Section, buttonFields, cn, paddingField, readButton, schemeField, str } from "@pai/theme-kit";
import { Eyebrow } from "./_nest";
import { IMG } from "../images";

export const materials = defineSection({
  schema: {
    type: "materials",
    name: "Materials & craftsmanship",
    category: "content",
    icon: "trees",
    description: "Workshop image and story beside material swatches with origin and care notes.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Materials & craft" },
      { type: "text", id: "heading", label: "Heading", default: "Honest materials, made by hand" },
      { type: "textarea", id: "text", label: "Text", default: "Our timber is kiln-dried for our humid monsoons, our jute comes from Faridpur and every brass handle is cast in Old Dhaka. Here's what your furniture is made of — and how to look after it." },
      { type: "image", id: "image", label: "Workshop image", default: IMG.woodTurning },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Craftsman shaping a wooden leg on a lathe" },
      { type: "text", id: "caption", label: "Image caption", default: "Turning a sheesham leg · Mirpur workshop" },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "image_left",
        options: [
          { value: "image_left", label: "Image left, materials right" },
          { value: "grid", label: "Swatch cards grid (no large image)" },
        ],
      },
      ...buttonFields("button", { label: "Read our care guide", link: "/pages/about", style: "secondary" }),
      schemeField("muted"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "material",
        name: "Material",
        limit: 8,
        settings: [
          { type: "image", id: "image", label: "Swatch image", info: "A close-up texture works best." },
          { type: "text", id: "name", label: "Name", default: "Solid sheesham" },
          { type: "text", id: "origin", label: "Origin / finish", default: "Kiln-dried · hand-oiled" },
          { type: "textarea", id: "text", label: "Description", default: "Dense rosewood with a rich, swirling grain that deepens beautifully with age." },
          { type: "textarea", id: "care", label: "Care notes", default: "Dust with a dry cotton cloth. Re-oil twice a year. Keep out of direct afternoon sun." },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Materials & craftsmanship",
        blocks: [
          { type: "material", settings: { name: "Solid sheesham", origin: "Kiln-dried · hand-oiled", image: IMG.walnutTable } },
          { type: "material", settings: { name: "Hand-woven jute", origin: "Faridpur, Bangladesh", image: IMG.juteSwatch, text: "Golden fibre, hand-braided into rugs and poufs that feel good underfoot.", care: "Vacuum without the beater bar. Blot spills — never rub. Rotate every few months." } },
          { type: "material", settings: { name: "Cast brass", origin: "Old Dhaka foundries", image: IMG.copperLamp, text: "Solid brass hardware and lamp bases that develop a soft, warm patina.", care: "Wipe with a soft cloth. Polish with a little lemon and salt if you prefer a bright shine." } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const items = blocks.filter((b) => b.type === "material");
    if (!items.length && !context.isPreview) return null;
    const heading = str(s.heading);
    const btn = readButton(context, s, "button");
    const image = str(s.image);

    const swatch = (b: (typeof items)[number], size = "size-20") =>
      str(b.settings.image) ? (
        <span className={cn("relative shrink-0 overflow-hidden rounded-full bg-pai-muted ring-1 ring-pai-border ring-offset-4 ring-offset-[var(--pai-bg)]", size)}>
          <img src={str(b.settings.image)} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full scale-150 object-cover" />
        </span>
      ) : (
        <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full bg-pai-accent/15 font-heading text-2xl text-pai-accent", size)}>
          {str(b.settings.name).charAt(0)}
        </span>
      );

    const care = (b: (typeof items)[number]) =>
      str(b.settings.care) ? (
        <details className="nest-care group mt-3">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-pai-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pai-accent [&::-webkit-details-marker]:hidden">
            <span aria-hidden className="relative size-3">
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
              <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition group-open:scale-y-0" />
            </span>
            Care notes
          </summary>
          <p className="mt-2 text-sm leading-relaxed opacity-75">{str(b.settings.care)}</p>
        </details>
      ) : null;

    const head = (
      <div className="mb-10">
        {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
        {heading ? <h2 className="pai-h2 nest-title">{heading}</h2> : null}
        {str(s.text) ? <p className="mt-4 max-w-xl leading-relaxed opacity-75">{str(s.text)}</p> : null}
      </div>
    );
    const button = btn ? (
      <div className="mt-10">
        <ButtonLink href={btn.href} variant={btn.variant}>
          {btn.label}
        </ButtonLink>
      </div>
    ) : null;

    if (s.layout === "grid" || !image) {
      return (
        <Section settings={s} ariaLabel={heading || "Materials"}>
          {head}
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((b) => (
              <li key={b.id} className="rounded-pai border border-pai-border bg-pai-card p-6">
                {swatch(b, "size-16")}
                <h3 className="mt-5 font-heading text-xl">{str(b.settings.name)}</h3>
                {str(b.settings.origin) ? <p className="mt-1 text-xs uppercase tracking-[0.14em] opacity-60">{str(b.settings.origin)}</p> : null}
                {str(b.settings.text) ? <p className="mt-3 text-sm leading-relaxed opacity-75">{str(b.settings.text)}</p> : null}
                {care(b)}
              </li>
            ))}
          </ul>
          {button}
        </Section>
      );
    }

    return (
      <Section settings={s} ariaLabel={heading || "Materials"}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <figure className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-pai bg-pai-muted">
              <img src={image} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
            </div>
            {str(s.caption) ? <figcaption className="mt-3 text-xs uppercase tracking-[0.16em] opacity-60">{str(s.caption)}</figcaption> : null}
          </figure>
          <div className="lg:py-6">
            {head}
            <ul className="divide-y divide-pai-border border-y border-pai-border">
              {items.map((b) => (
                <li key={b.id} className="flex gap-6 py-7">
                  {swatch(b)}
                  <div className="min-w-0">
                    <h3 className="font-heading text-xl leading-tight md:text-2xl">{str(b.settings.name)}</h3>
                    {str(b.settings.origin) ? <p className="mt-1 text-xs uppercase tracking-[0.14em] opacity-60">{str(b.settings.origin)}</p> : null}
                    {str(b.settings.text) ? <p className="mt-3 text-[0.95rem] leading-relaxed opacity-80">{str(b.settings.text)}</p> : null}
                    {care(b)}
                  </div>
                </li>
              ))}
            </ul>
            {button}
          </div>
        </div>
      </Section>
    );
  },
});
