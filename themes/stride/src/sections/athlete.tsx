import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { ButtonLink, Link, Section, buttonFields, cn, formatMoney, list, moneyOf, num, paddingField, readButton, schemeField, str } from "@pai/theme-kit";
import { IMG } from "../images";

/**
 * Athlete story: a big portrait with the athlete's name running down the side, a pull-quote,
 * name + discipline, stat blocks, a CTA and a "shop the kit" row of products.
 */
export const strideAthlete = defineSection({
  schema: {
    type: "stride-athlete",
    name: "Athlete story",
    category: "content",
    icon: "medal",
    description: "Portrait, pull-quote, athlete stats and a shop-the-kit product row.",
    settings: [
      { type: "image", id: "image", label: "Portrait", default: IMG.pullup },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Athlete doing pull-ups in a dark gym" },
      {
        type: "select",
        id: "image_position",
        label: "Portrait position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Athlete story" },
      { type: "textarea", id: "quote", label: "Pull-quote", default: "Nobody sees the 5 a.m. sessions. They only see the result — so I make every rep count." },
      { type: "text", id: "name", label: "Athlete name", default: "Rafiq Hasan" },
      { type: "text", id: "discipline", label: "Discipline", default: "Calisthenics · Dhaka" },
      { type: "textarea", id: "text", label: "Story", default: "Rafiq trains six days a week on Mirpur rooftops and in our partner gyms. His kit has to survive monsoon humidity, concrete and a lot of chalk." },
      ...buttonFields("button", { label: "Train like Rafiq", link: "/collections/gym-training", style: "primary" }),
      { type: "header", label: "Shop the kit" },
      { type: "text", id: "kit_heading", label: "Heading", default: "Shop his kit" },
      { type: "product_list", id: "kit_products", label: "Products", limit: 4 },
      { type: "collection", id: "kit_collection", label: "Or a collection", info: "Used when no products are picked." },
      { type: "range", id: "kit_limit", label: "Products shown", min: 2, max: 4, step: 1, default: 3 },
      schemeField("inverse"),
      paddingField("none"),
    ],
    blocks: [
      {
        type: "stat",
        name: "Stat",
        limit: 4,
        settings: [
          { type: "text", id: "value", label: "Value", default: "32" },
          { type: "text", id: "label", label: "Label", default: "Pull-ups unbroken" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Athlete story",
        blocks: [
          { type: "stat", settings: { value: "32", label: "Pull-ups unbroken" } },
          { type: "stat", settings: { value: "6", label: "Days a week" } },
          { type: "stat", settings: { value: "4 yrs", label: "Training" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const money = moneyOf(context);
    const limit = num(s.kit_limit, 3);
    const slugs = list(s.kit_products);
    let kit: SfProduct[] = [];
    try {
      if (slugs.length) {
        const r = await context.data.getProducts({ slugs, limit: slugs.length });
        const order = new Map(slugs.map((x, i) => [x, i]));
        kit = r.items.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
      } else if (str(s.kit_collection)) {
        kit = (await context.data.getProducts({ collection: str(s.kit_collection), limit })).items;
      }
      if (!kit.length) kit = (await context.data.getProducts({ sort: "best-selling", limit })).items;
    } catch {
      kit = [];
    }
    kit = kit.slice(0, limit);
    const stats = blocks.filter((b) => b.type === "stat");
    const button = readButton(context, s, "button");
    const right = s.image_position === "right";
    const name = str(s.name);

    return (
      <Section settings={s} ariaLabel={name ? `Athlete story: ${name}` : "Athlete story"} container={false} className="stride-athlete overflow-hidden">
        <div className={cn("grid lg:grid-cols-2", right && "lg:[&>*:first-child]:order-2")}>
          <div className="relative min-h-[520px] overflow-hidden lg:min-h-[760px]">
            {str(s.image) ? <img src={str(s.image)} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover grayscale-[35%]" /> : null}
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            {name ? (
              <span
                aria-hidden
                className={cn(
                  "stride-vertical absolute bottom-6 font-heading text-[clamp(3.5rem,7vw,7rem)] uppercase leading-[0.8] text-white",
                  right ? "right-4 md:right-6" : "left-4 md:left-6",
                )}
              >
                {name}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col justify-center gap-8 px-5 py-14 sm:px-10 lg:px-16 lg:py-20 xl:px-20">
            {str(s.eyebrow) ? (
              <h2 className="stride-kicker">
                {str(s.eyebrow)}
                {name ? <span className="sr-only">: {name}</span> : null}
              </h2>
            ) : (
              <h2 className="sr-only">{name || "Athlete story"}</h2>
            )}
            {str(s.quote) ? (
              <figure>
                <blockquote className="stride-quote font-heading text-[clamp(2.25rem,4.2vw,4rem)] uppercase leading-[0.95]">
                  <span aria-hidden className="mr-1 text-pai-accent">“</span>
                  {str(s.quote)}
                  <span aria-hidden className="text-pai-accent">”</span>
                </blockquote>
                {name || str(s.discipline) ? (
                  <figcaption className="mt-6 flex items-center gap-4">
                    <span aria-hidden className="h-0.5 w-10 bg-pai-accent" />
                    <span>
                      {name ? <span className="block font-heading text-2xl uppercase leading-none">{name}</span> : null}
                      {str(s.discipline) ? <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.18em] opacity-60">{str(s.discipline)}</span> : null}
                    </span>
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
            {str(s.text) ? <p className="max-w-xl leading-relaxed opacity-75">{str(s.text)}</p> : null}
            {stats.length ? (
              <dl className={cn("grid border-y border-pai-border", stats.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
                {stats.map((b, i) => (
                  <div key={b.id} className={cn("flex flex-col py-5", i > 0 && "border-l border-pai-border pl-4 md:pl-6")}>
                    <dt className="order-2 mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-60">{str(b.settings.label)}</dt>
                    <dd className="order-1 font-heading text-4xl leading-none text-pai-accent md:text-5xl">{str(b.settings.value)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {button ? (
              <div>
                <ButtonLink href={button.href} variant={button.variant} size="lg" className="stride-btn-arrow">
                  {button.label}
                </ButtonLink>
              </div>
            ) : null}
            {kit.length ? (
              <div>
                <h3 className="mb-4 font-body text-xs font-bold uppercase tracking-[0.2em] opacity-70">{str(s.kit_heading, "Shop the kit")}</h3>
                <ul className="grid gap-3 sm:grid-cols-3">
                  {kit.map((p) => (
                    <li key={p.id}>
                      <Link href={p.url} className="group flex items-center gap-3 border border-pai-border p-2 transition hover:border-pai-accent sm:flex-col sm:items-stretch">
                        <span className="relative block size-16 shrink-0 overflow-hidden bg-pai-muted sm:aspect-square sm:size-auto">
                          {p.featuredImage ? <img src={p.featuredImage.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105" /> : null}
                        </span>
                        <span className="min-w-0 sm:px-1 sm:pb-1">
                          <span className="block truncate text-sm font-semibold uppercase">{p.title}</span>
                          <span className="font-heading text-lg text-pai-accent">{formatMoney(p.price, money.currency, money.display)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </Section>
    );
  },
});
