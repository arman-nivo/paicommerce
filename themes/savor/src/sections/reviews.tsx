/**
 * Savor "Guest reviews": restaurant-style review cards — stars, quote, the dish they ordered and
 * where the review came from (Google, Foodpanda, Facebook…) — with an overall rating summary.
 */
import { defineSection } from "@pai/theme-sdk";
import { Star, UtensilsCrossed } from "lucide-react";
import { Section, cn, headingFields, num, paddingField, schemeField, str } from "@pai/theme-kit";
import { IMG } from "../images";

const SOURCES = [
  { value: "google", label: "Google" },
  { value: "foodpanda", label: "Foodpanda" },
  { value: "facebook", label: "Facebook" },
  { value: "pathao", label: "Pathao Food" },
  { value: "tripadvisor", label: "Tripadvisor" },
  { value: "website", label: "Verified order" },
];

function Stars({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className={cn("inline-flex gap-0.5 text-pai-accent", className)} role="img" aria-label={`${v} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} aria-hidden className={cn("size-4", i < v ? "fill-current" : "opacity-30")} />
      ))}
    </span>
  );
}

export const savorReviews = defineSection({
  schema: {
    type: "savor-reviews",
    name: "Guest reviews",
    category: "social-proof",
    icon: "message-square-quote",
    description: "Review cards with rating, dish ordered and review source.",
    settings: [
      ...headingFields({ eyebrow: "Guest book", heading: "What Dhaka is saying", subheading: "", align: "center" }),
      { type: "text", id: "rating", label: "Overall rating", default: "4.8", info: "Leave empty to hide the summary." },
      { type: "text", id: "rating_text", label: "Summary text", default: "from 2,300+ reviews on Google & Foodpanda" },
      { type: "range", id: "columns", label: "Columns (desktop)", min: 2, max: 4, step: 1, default: 3 },
      schemeField("muted"),
      paddingField(),
    ],
    blocks: [
      {
        type: "review",
        name: "Review",
        settings: [
          { type: "textarea", id: "text", label: "Review", default: "The kacchi was exactly like the ones from Old Dhaka weddings — fragrant, the mutton falling off the bone. Arrived still steaming." },
          { type: "text", id: "author", label: "Name", default: "Nusrat Jahan" },
          { type: "text", id: "location", label: "Area", default: "Gulshan 2" },
          { type: "image", id: "avatar", label: "Photo" },
          { type: "range", id: "rating", label: "Rating", min: 1, max: 5, step: 1, default: 5 },
          { type: "text", id: "dish", label: "Dish ordered", default: "Mutton Kacchi Biryani" },
          { type: "select", id: "source", label: "Source", default: "google", options: SOURCES },
          { type: "text", id: "date", label: "Date", default: "2 weeks ago" },
        ],
      },
    ],
    maxBlocks: 9,
    presets: [
      {
        name: "Guest reviews",
        blocks: [
          { type: "review", settings: { avatar: IMG.avatar1 } },
          { type: "review", settings: { author: "Tanvir Ahmed", location: "Banani", avatar: IMG.avatar2, dish: "Smash Double Beef Burger", source: "foodpanda", text: "Proper smash burger — crispy edges, soft potato bun. Came with the fries still crunchy." } },
          { type: "review", settings: { author: "Farhana Rahman", location: "Mohakhali", avatar: IMG.avatar3, dish: "Family Feast Combo", source: "facebook", text: "Ordered for my father's birthday, fed six of us with leftovers. Rider called ahead and was super polite." } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks }) => {
    const reviews = blocks.filter((b) => str(b.settings.text));
    if (!reviews.length) return null;
    const center = s.heading_align !== "left";
    const cols = num(s.columns, 3);
    const rating = str(s.rating);
    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Reviews"} className="savor-reviews">
        <div className={cn("mb-10 flex flex-col gap-5", center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between")}>
          <div className={cn("max-w-2xl", center && "mx-auto")}>
            {str(s.eyebrow) ? <p className="savor-eyebrow mb-3 text-pai-primary">{str(s.eyebrow)}</p> : null}
            {str(s.heading) ? <h2 className="pai-h2">{str(s.heading)}</h2> : null}
            {str(s.subheading) ? <p className="mt-3 opacity-75">{str(s.subheading)}</p> : null}
          </div>
          {rating ? (
            <p className="inline-flex items-center gap-3 rounded-full bg-pai-card px-5 py-2.5 text-sm shadow-sm ring-1 ring-pai-border">
              <span className="font-heading text-2xl font-semibold leading-none">{rating}</span>
              <Stars value={Number(rating) || 5} />
              {str(s.rating_text) ? <span className="hidden opacity-70 sm:inline">{str(s.rating_text)}</span> : null}
            </p>
          ) : null}
        </div>
        <div className={cn("grid gap-5", cols >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : cols === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2")}>
          {reviews.map((b) => {
            const bs = b.settings;
            const src = SOURCES.find((x) => x.value === bs.source)?.label ?? "";
            const author = str(bs.author, "Guest");
            return (
              <figure key={b.id} className="savor-review flex flex-col rounded-pai border border-pai-border bg-pai-card p-6 text-pai-fg shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between gap-3">
                  <Stars value={num(bs.rating, 5)} />
                  {src ? <span className={cn("savor-source rounded-full px-2.5 py-1 text-[11px] font-bold", `savor-source-${str(bs.source)}`)}>{src}</span> : null}
                </div>
                <blockquote className="mt-4 flex-1 font-heading text-[1.08rem] leading-relaxed">“{str(bs.text)}”</blockquote>
                {str(bs.dish) ? (
                  <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-pai-muted px-3 py-1 text-xs font-medium">
                    <UtensilsCrossed className="size-3.5 text-pai-primary" aria-hidden /> Ordered: {str(bs.dish)}
                  </p>
                ) : null}
                <figcaption className="mt-5 flex items-center gap-3 border-t border-dashed border-pai-border pt-4">
                  {str(bs.avatar) ? (
                    <img src={str(bs.avatar)} alt="" loading="lazy" className="size-10 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden className="grid size-10 place-items-center rounded-full bg-pai-primary font-heading text-pai-primary-fg">
                      {author.charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0 text-sm">
                    <span className="block font-semibold">{author}</span>
                    <span className="block opacity-60">{[str(bs.location), str(bs.date)].filter(Boolean).join(" · ")}</span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Section>
    );
  },
});
