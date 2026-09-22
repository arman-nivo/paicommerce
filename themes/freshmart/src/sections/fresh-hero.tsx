/**
 * Grocery hero: a large campaign banner (with an optional copyable coupon and quick trust tags)
 * beside up to two stacked promo tiles.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Container, Icon, SmartLink, cn, num, readButton, resolveHref, str, buttonFields } from "@pai/theme-kit";
import { ArrowRight } from "lucide-react";
import { CopyCode } from "../client/copy-code";
import { IMG } from "../images";
import { TINT_OPTIONS, tintAt } from "./_tints";

const HEIGHT: Record<string, string> = { small: "md:min-h-[340px]", medium: "md:min-h-[420px]", large: "md:min-h-[520px]" };

export const freshHero = defineSection({
  schema: {
    type: "fresh-hero",
    name: "Grocery hero",
    category: "hero",
    icon: "image",
    description: "Campaign banner with coupon and trust tags, plus side promo tiles.",
    settings: [
      { type: "image", id: "image", label: "Banner image", default: IMG.heroProduce },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Fresh fruit and vegetables on market shelves" },
      { type: "range", id: "overlay", label: "Overlay strength", min: 0, max: 90, step: 5, unit: "%", default: 55 },
      {
        type: "select",
        id: "height",
        label: "Height",
        default: "medium",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Farm to door in 60 minutes" },
      { type: "text", id: "heading", label: "Heading", default: "Fresh groceries, delivered before the kettle boils" },
      { type: "textarea", id: "text", label: "Text", default: "Seasonal fruit, deshi vegetables, halal meat and daily essentials — picked this morning, at honest market prices." },
      ...buttonFields("button", { label: "Start shopping", link: "/collections/all", style: "primary" }),
      ...buttonFields("button2", { label: "Today's deals", link: "/collections/all", style: "light" }, "Second button"),
      { type: "header", label: "Coupon" },
      { type: "text", id: "code", label: "Coupon code", default: "FRESH50" },
      { type: "text", id: "code_label", label: "Coupon text", default: "৳50 off your first order" },
      { type: "header", label: "Trust tags" },
      { type: "text", id: "tags", label: "Tags", default: "Cash on delivery, Free delivery over ৳999, 100% fresh or refund", info: "Comma separated, shown under the buttons." },
    ],
    blocks: [
      {
        type: "tile",
        name: "Promo tile",
        limit: 2,
        settings: [
          { type: "image", id: "image", label: "Image" },
          { type: "text", id: "eyebrow", label: "Eyebrow", default: "Up to 25% off" },
          { type: "text", id: "heading", label: "Heading", default: "Seasonal fruit" },
          { type: "text", id: "link_label", label: "Link label", default: "Shop now" },
          { type: "url", id: "link", label: "Link", default: "/collections/all" },
          { type: "select", id: "tint", label: "Background", default: "auto", options: TINT_OPTIONS },
        ],
      },
    ],
    maxBlocks: 2,
    presets: [
      {
        name: "Grocery hero",
        blocks: [
          { type: "tile", settings: { image: IMG.mangoes, eyebrow: "Season special", heading: "Rajshahi mangoes", tint: "yellow" } },
          { type: "tile", settings: { image: IMG.vegMarket, eyebrow: "Picked at dawn", heading: "Deshi vegetables", tint: "green" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const b1 = readButton(context, s, "button");
    const b2 = readButton(context, s, "button2");
    const tiles = blocks.filter((b) => b.type === "tile");
    const overlay = num(s.overlay, 55) / 100;
    const tags = str(s.tags)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const image = str(s.image);
    return (
      <section aria-label={str(s.heading) || "Featured"} className="fm-hero pt-4 md:pt-6">
        <Container className={cn("grid gap-3 md:gap-4", tiles.length && "lg:grid-cols-[2.1fr_1fr]")}>
          <div className={cn("relative isolate flex min-h-[380px] overflow-hidden rounded-[calc(var(--pai-radius)+6px)] bg-pai-fg text-white", HEIGHT[str(s.height, "medium")])}>
            {image ? <img src={image} alt={str(s.image_alt)} fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover" /> : null}
            <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(90deg, rgba(8,24,12,${overlay + 0.2}) 0%, rgba(8,24,12,${overlay}) 45%, rgba(8,24,12,${overlay / 4}) 100%)` }} />
            <div className="flex max-w-xl flex-col justify-center gap-4 p-6 sm:p-10 md:p-12">
              {str(s.eyebrow) ? (
                <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
                  <Icon name="zap" className="size-3.5 fill-amber-300 text-amber-300" /> {str(s.eyebrow)}
                </p>
              ) : null}
              {str(s.heading) ? <h2 className="pai-h1 text-[calc(clamp(2rem,4.4vw,3.4rem)*var(--pai-heading-scale))]">{str(s.heading)}</h2> : null}
              {str(s.text) ? <p className="max-w-md text-base opacity-90 md:text-lg">{str(s.text)}</p> : null}
              {b1 || b2 ? (
                <div className="mt-1 flex flex-wrap gap-3">
                  {b1 ? (
                    <ButtonLink href={b1.href} variant={b1.variant} size="lg">
                      {b1.label}
                    </ButtonLink>
                  ) : null}
                  {b2 ? (
                    <ButtonLink href={b2.href} variant={b2.variant} size="lg">
                      {b2.label}
                    </ButtonLink>
                  ) : null}
                </div>
              ) : null}
              {str(s.code) ? (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <CopyCode code={str(s.code)} className="bg-white/10 text-amber-200" />
                  <span className="opacity-90">{str(s.code_label)}</span>
                </div>
              ) : null}
              {tags.length ? (
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold opacity-85">
                  {tags.map((t) => (
                    <li key={t} className="inline-flex items-center gap-1">
                      <Icon name="circle-check" className="size-3.5 text-emerald-300" strokeWidth={2.5} /> {t}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          {tiles.length ? (
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-1">
              {tiles.map((b, i) => {
                const bs = b.settings;
                const img = str(bs.image) || (i === 0 ? IMG.mangoes : IMG.vegMarket);
                return (
                  <SmartLink
                    key={b.id}
                    href={resolveHref(context, bs.link, "/collections/all")}
                    className="group relative isolate flex min-h-[170px] overflow-hidden rounded-[calc(var(--pai-radius)+6px)] p-4 text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2 sm:p-6"
                    style={{ background: tintAt(bs.tint, i + 1) }}
                  >
                    <img src={img} alt="" loading="eager" className="absolute -right-6 bottom-0 top-0 -z-10 h-full w-[52%] sm:w-[62%] rounded-l-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="flex max-w-[55%] flex-col justify-between gap-3">
                      <span>
                        {str(bs.eyebrow) ? <span className="block text-[11px] font-bold uppercase tracking-wider text-pai-sale">{str(bs.eyebrow)}</span> : null}
                        <span className="mt-1 block font-heading text-lg font-extrabold leading-tight sm:text-2xl">{str(bs.heading)}</span>
                      </span>
                      {str(bs.link_label) ? (
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white">
                          {str(bs.link_label)} <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                        </span>
                      ) : null}
                    </span>
                  </SmartLink>
                );
              })}
            </div>
          ) : null}
        </Container>
      </section>
    );
  },
});
