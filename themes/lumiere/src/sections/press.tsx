/**
 * "As seen in" press: a featured quote over a row of publication names — set as serif wordmarks
 * (roman, italic or spaced capitals) when no logo image is uploaded — separated by gold lozenges.
 */
import { defineSection } from "@pai/theme-sdk";
import { Section, SmartLink, bool, cn, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { Eyebrow } from "./_lumiere";

export const pressLogos = defineSection({
  schema: {
    type: "press-logos",
    name: "As seen in",
    category: "social-proof",
    icon: "newspaper",
    description: "Press mentions as serif wordmarks or logos, with a featured quote.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "As seen in" },
      { type: "checkbox", id: "show_quote", label: "Show featured quote", default: true },
      { type: "range", id: "featured", label: "Featured quote (publication number)", min: 1, max: 8, step: 1, default: 1, info: "Falls back to the first publication with a quote." },
      { type: "checkbox", id: "grayscale", label: "Muted logos (full colour on hover)", default: true },
      schemeField("default"),
      paddingField("medium"),
    ],
    blocks: [
      {
        type: "publication",
        name: "Publication",
        limit: 8,
        settings: [
          { type: "text", id: "name", label: "Name", default: "The Daily Star" },
          { type: "image", id: "logo", label: "Logo (optional)", info: "Transparent PNG/SVG. Without a logo the name is set in the heading serif." },
          {
            type: "select",
            id: "style",
            label: "Wordmark style",
            default: "serif",
            options: [
              { value: "serif", label: "Serif" },
              { value: "italic", label: "Serif italic" },
              { value: "caps", label: "Spaced capitals" },
            ],
          },
          { type: "textarea", id: "quote", label: "Quote", default: "" },
          { type: "url", id: "link", label: "Article link" },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "As seen in",
        blocks: [
          { type: "publication", settings: { name: "The Daily Star", style: "serif", quote: "Dhaka's quietest luxury — jewellery made to be inherited." } },
          { type: "publication", settings: { name: "Vogue India", style: "caps" } },
          { type: "publication", settings: { name: "Prothom Alo", style: "italic" } },
          { type: "publication", settings: { name: "Canvas", style: "caps" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const pubs = blocks.filter((b) => b.type === "publication" && (str(b.settings.name) || str(b.settings.logo)));
    if (!pubs.length) return null;
    const idx = Math.max(0, Math.round(Number(s.featured) || 1) - 1);
    const featured = bool(s.show_quote, true) ? (str(pubs[idx]?.settings.quote) ? pubs[idx] : pubs.find((b) => str(b.settings.quote))) : undefined;
    const muted = bool(s.grayscale, true);
    return (
      <Section settings={s} ariaLabel={str(s.eyebrow) || "Press"} className="lumiere-press">
        <Eyebrow>{str(s.eyebrow)}</Eyebrow>
        {featured ? (
          <figure className="mx-auto mb-14 mt-8 max-w-3xl text-center">
            <blockquote className="font-heading text-[1.7rem] italic leading-snug md:text-[2.3rem]">
              <span aria-hidden className="lumiere-gold">“</span>
              {str(featured.settings.quote)}
              <span aria-hidden className="lumiere-gold">”</span>
            </blockquote>
            <figcaption className="mt-5 text-[0.62rem] uppercase tracking-[0.3em] opacity-60">— {str(featured.settings.name)}</figcaption>
          </figure>
        ) : (
          <div className="h-6" />
        )}
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-6 md:gap-x-10">
          {pubs.map((b, i) => {
            const bs = b.settings;
            const style = str(bs.style, "serif");
            const href = resolveHref(context, bs.link);
            const mark = str(bs.logo) ? (
              <img src={str(bs.logo)} alt={str(bs.name) || "Publication logo"} loading="lazy" className={cn("h-7 w-auto object-contain md:h-8", muted && "opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0")} />
            ) : (
              <span
                className={cn(
                  "font-heading leading-none transition",
                  style === "caps" ? "text-[1.05rem] uppercase tracking-[0.34em] md:text-xl" : "text-2xl md:text-[1.9rem]",
                  style === "italic" && "italic",
                  muted && "opacity-55 hover:opacity-100",
                  featured?.id === b.id && "opacity-100",
                )}
              >
                {str(bs.name)}
              </span>
            );
            return (
              <li key={b.id} className="flex items-center gap-6 md:gap-10">
                {i > 0 ? <span aria-hidden className="size-1.5 rotate-45 border border-[var(--lumiere-gold)]" /> : null}
                {href ? (
                  <SmartLink href={href} ariaLabel={str(bs.name) ? `${str(bs.name)} — read the article` : undefined}>
                    {mark}
                  </SmartLink>
                ) : (
                  mark
                )}
              </li>
            );
          })}
        </ul>
      </Section>
    );
  },
});
