/**
 * Reviews wall: a masonry of customer reviews with a rating summary. Reviews come from blocks
 * (curated quotes, optional photo and linked product) and/or live reviews of a chosen product.
 */
import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { ButtonLink, Icon, Rating, Section, bool, buttonFields, cn, num, paddingField, readButton, schemeField, str } from "@pai/theme-kit";
import { Accent, Eyebrow } from "./_bloom";
import { IMG } from "../images";

type Review = { id: string; name: string; location: string; rating: number; title: string; text: string; photo: string; skin: string; verified: boolean; product: SfProduct | null };

export const reviewsWall = defineSection({
  schema: {
    type: "reviews-wall",
    name: "Reviews wall",
    category: "social-proof",
    icon: "messages-square",
    description: "Masonry wall of reviews with an average-rating summary.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Loved by you" },
      { type: "text", id: "heading", label: "Heading", default: "12,000+ *glowing* reviews" },
      { type: "range", id: "average", label: "Average rating shown", min: 3, max: 5, step: 0.1, default: 4.8 },
      { type: "text", id: "summary", label: "Summary text", default: "Based on verified reviews across our store" },
      { type: "product", id: "product", label: "Also show live reviews of", info: "Optional — adds real reviews from this product." },
      { type: "range", id: "live_limit", label: "Live reviews to show", min: 0, max: 12, step: 1, default: 3 },
      { type: "range", id: "columns", label: "Columns (desktop)", min: 2, max: 4, step: 1, default: 3 },
      { type: "checkbox", id: "show_products", label: "Show reviewed product", default: true },
      ...buttonFields("button", { label: "Read all reviews", link: "/collections/all", style: "secondary" }),
      schemeField("muted"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "review",
        name: "Review",
        limit: 16,
        settings: [
          { type: "text", id: "name", label: "Name", default: "Customer" },
          { type: "text", id: "location", label: "Location", default: "Dhaka" },
          { type: "range", id: "rating", label: "Rating", min: 1, max: 5, step: 1, default: 5 },
          { type: "text", id: "title", label: "Title", default: "" },
          { type: "textarea", id: "text", label: "Review", default: "Absolutely love it — my skin has never felt this soft." },
          { type: "text", id: "skin", label: "Skin type", default: "", info: "E.g. Oily · Combination · Sensitive" },
          { type: "image", id: "photo", label: "Photo", info: "Customer photo or avatar." },
          { type: "product", id: "product", label: "Reviewed product" },
          { type: "checkbox", id: "verified", label: "Verified buyer", default: true },
        ],
      },
    ],
    maxBlocks: 16,
    presets: [
      {
        name: "Reviews wall",
        blocks: [
          { type: "review", settings: { name: "Nusrat J.", location: "Dhaka", title: "My holy-grail serum", text: "Three weeks in and my dark spots have faded so much. It layers beautifully under sunscreen.", skin: "Combination", photo: IMG.avatar1 } },
          { type: "review", settings: { name: "Farhana R.", location: "Sylhet", text: "Gentle enough for my sensitive skin. No stinging at all.", skin: "Sensitive" } },
          { type: "review", settings: { name: "Mim A.", location: "Chattogram", title: "Packaging was so pretty", text: "Arrived in two days with a handwritten note. Felt like a gift to myself.", photo: IMG.avatar2 } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const reviewBlocks = blocks.filter((b) => b.type === "review");
    const showProducts = bool(s.show_products, true);
    const products = await Promise.all(
      reviewBlocks.map((b) => (showProducts && str(b.settings.product) ? context.data.getProduct(str(b.settings.product)).catch(() => null) : Promise.resolve(null))),
    );
    const reviews: Review[] = reviewBlocks.map((b, i) => ({
      id: b.id,
      name: str(b.settings.name, "Customer"),
      location: str(b.settings.location),
      rating: num(b.settings.rating, 5),
      title: str(b.settings.title),
      text: str(b.settings.text),
      photo: str(b.settings.photo),
      skin: str(b.settings.skin),
      verified: bool(b.settings.verified, true),
      product: products[i] ?? null,
    }));

    // Live reviews from a product (real data).
    const liveSlug = str(s.product);
    const liveLimit = num(s.live_limit, 3);
    if (liveSlug && liveLimit > 0) {
      const p = await context.data.getProduct(liveSlug).catch(() => null);
      if (p) {
        const live = await context.data.getReviews(p.id, liveLimit).catch(() => []);
        for (const r of live) {
          if (!r.body) continue;
          reviews.push({ id: r.id, name: r.customerName, location: "", rating: r.rating, title: r.title ?? "", text: r.body, photo: "", skin: "", verified: true, product: showProducts ? p : null });
        }
      }
    }
    if (!reviews.length) return null;

    const heading = str(s.heading);
    const avg = num(s.average, 4.8);
    const cols = num(s.columns, 3);
    const btn = readButton(context, s, "button");
    return (
      <Section settings={s} ariaLabel={heading.replace(/\*/g, "") || "Reviews"}>
        <div className="mb-12 flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div className="max-w-xl">
            {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
            {heading ? (
              <h2 className="pai-h2">
                <Accent text={heading} />
              </h2>
            ) : null}
          </div>
          <div className="flex items-center gap-4 rounded-full bg-pai-bg px-5 py-3 shadow-[var(--bloom-card-shadow)]">
            <span className="font-heading text-4xl leading-none">{avg.toFixed(1)}</span>
            <span className="flex flex-col items-start gap-1">
              <Rating value={avg} size={15} />
              <span className="text-xs opacity-65">{str(s.summary)}</span>
            </span>
          </div>
        </div>
        <ul className={cn("gap-5 [column-fill:_balance] sm:columns-2", cols >= 4 ? "lg:columns-4" : cols === 3 ? "lg:columns-3" : "")}>
          {reviews.map((r) => (
            <li key={r.id} className="mb-5 break-inside-avoid">
              <figure className="rounded-pai bg-pai-card p-6 shadow-[var(--bloom-card-shadow)]">
                <div className="flex items-center justify-between gap-3">
                  <Rating value={r.rating} size={14} />
                  {r.verified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium opacity-65">
                      <Icon name="badge-check" className="size-3.5 text-pai-accent" /> Verified buyer
                    </span>
                  ) : null}
                </div>
                {r.title ? <p className="mt-4 font-heading text-lg leading-snug">{r.title}</p> : null}
                <blockquote className={cn("text-[0.95rem] leading-relaxed opacity-85", r.title ? "mt-2" : "mt-4")}>“{r.text}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {r.photo ? (
                    <img src={r.photo} alt="" loading="lazy" className="size-10 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden className="grid size-10 place-items-center rounded-full bg-pai-accent/15 font-heading text-pai-accent">
                      {r.name.charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0 text-sm leading-tight">
                    <span className="block font-semibold">{r.name}</span>
                    <span className="block text-xs opacity-60">{[r.location, r.skin ? `${r.skin} skin` : ""].filter(Boolean).join(" · ")}</span>
                  </span>
                </figcaption>
                {r.product ? (
                  <a href={r.product.url} className="mt-5 flex items-center gap-3 rounded-[calc(var(--pai-radius)*0.7)] bg-pai-muted p-2 pr-3 text-xs transition hover:bg-pai-border/60">
                    {r.product.featuredImage ? <img src={r.product.featuredImage.url} alt="" loading="lazy" className="size-10 rounded-[calc(var(--pai-radius)*0.5)] object-cover" /> : null}
                    <span className="pai-line-clamp-2 font-medium">{r.product.title}</span>
                  </a>
                ) : null}
              </figure>
            </li>
          ))}
        </ul>
        {btn ? (
          <div className="mt-8 text-center">
            <ButtonLink href={btn.href} variant={btn.variant}>
              {btn.label}
            </ButtonLink>
          </div>
        ) : null}
      </Section>
    );
  },
});
