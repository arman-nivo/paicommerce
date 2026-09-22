/**
 * Savor "Combo deals": set-menu cards with a photo, ribbon, what's included, a price / was-price
 * and a button. A combo can be linked to a real product — then price, link and quick add come from
 * the product (multi-variant products open the options pop-up).
 */
import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { Check, Users } from "lucide-react";
import { SmartLink, Section, cn, formatMoney, headingFields, moneyOf, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { QuickAddButton } from "@pai/theme-kit/client";
import { IMG } from "../images";
import { slim } from "./card";

export const savorCombos = defineSection({
  schema: {
    type: "savor-combos",
    name: "Combo deals",
    category: "marketing",
    icon: "badge-percent",
    description: "Set menus and family combos with what's included, price and was-price.",
    settings: [
      ...headingFields({ eyebrow: "Set menus", heading: "Combo deals", subheading: "More food, better value — perfect for office lunches and family nights.", align: "left" }),
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "feature",
        options: [
          { value: "feature", label: "First combo featured" },
          { value: "grid", label: "Equal cards" },
        ],
      },
      { type: "text", id: "button_label", label: "Button label", default: "Order combo" },
      schemeField("muted"),
      paddingField(),
    ],
    blocks: [
      {
        type: "combo",
        name: "Combo",
        settings: [
          { type: "image", id: "image", label: "Image", default: IMG.foodSpread },
          { type: "text", id: "badge", label: "Ribbon", default: "Save 15%" },
          { type: "text", id: "title", label: "Title", default: "Family Feast" },
          { type: "text", id: "serves", label: "Serves", default: "Serves 4" },
          { type: "textarea", id: "items", label: "What's included", default: "Mutton kacchi (family)\nChicken tikka (6 pcs)\nBorhani × 4\nFirni × 4", info: "One item per line." },
          { type: "product", id: "product", label: "Linked product", info: "Optional. Uses the product's price, link and quick add." },
          { type: "text", id: "price", label: "Price", default: "৳2,650", info: "Used when no product is linked." },
          { type: "text", id: "was_price", label: "Was price", default: "৳3,120" },
          { type: "url", id: "link", label: "Link", default: "/collections/combos", info: "Used when no product is linked." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Combo deals",
        blocks: [
          { type: "combo" },
          { type: "combo", settings: { title: "Burger Night for Two", image: IMG.doubleBurger, serves: "Serves 2", items: "2 smash burgers\nLoaded fries\n2 cold drinks", price: "৳1,190", was_price: "৳1,380", badge: "Best value" } },
          { type: "combo", settings: { title: "Office Lunch Box", image: IMG.biryaniPlate, serves: "Serves 1", items: "Chicken biryani (half)\nChicken roast\nBorhani", price: "৳420", was_price: "৳490", badge: "Weekdays" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const money = moneyOf(context);
    const fmt = (n: number) => formatMoney(n, money.currency, money.display);
    const slugs = blocks.map((b) => str(b.settings.product)).filter(Boolean);
    const products = slugs.length ? ((await context.data.getProducts({ slugs, limit: slugs.length }).catch(() => null))?.items ?? []) : [];
    const bySlug = new Map<string, SfProduct>(products.map((p) => [p.slug, p]));

    const combos = blocks
      .map((b) => {
        const bs = b.settings;
        const p = bySlug.get(str(bs.product)) ?? null;
        const title = str(bs.title) || p?.title || "";
        if (!title) return null;
        const onSale = p?.compareAtPrice && p.compareAtPrice > p.price;
        return {
          id: b.id,
          title,
          badge: str(bs.badge),
          serves: str(bs.serves),
          image: str(bs.image) || p?.featuredImage?.url || "",
          items: str(bs.items)
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean),
          price: p ? `${p.priceMax > p.priceMin ? "from " : ""}${fmt(p.priceMin || p.price)}` : str(bs.price),
          was: p ? (onSale ? fmt(p.compareAtPrice!) : str(bs.was_price)) : str(bs.was_price),
          href: p ? p.url : resolveHref(context, bs.link, "/collections/all"),
          product: p && p.available ? slim(p) : null,
        };
      })
      .filter((c): c is NonNullable<typeof c> => !!c);
    if (!combos.length) return null;

    const feature = str(s.layout, "feature") === "feature" && combos.length >= 3;
    const center = s.heading_align === "center";
    const label = str(s.button_label, "Order combo");

    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Combo deals"} className="savor-combos">
        <div className={cn("mb-8 md:mb-10", center ? "mx-auto max-w-2xl text-center" : "max-w-2xl")}>
          {str(s.eyebrow) ? <p className="savor-eyebrow mb-3 text-pai-primary">{str(s.eyebrow)}</p> : null}
          {str(s.heading) ? <h2 className="pai-h2">{str(s.heading)}</h2> : null}
          {str(s.subheading) ? <p className="mt-3 opacity-75 md:text-lg">{str(s.subheading)}</p> : null}
        </div>
        <div className={cn("grid gap-5 md:gap-6", feature ? "md:grid-cols-2 lg:grid-cols-[1.2fr_1fr]" : combos.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3")}>
          {combos.map((c, i) => {
            const big = feature && i === 0;
            return (
              <article key={c.id} className={cn("savor-combo group relative flex flex-col overflow-hidden rounded-pai border border-pai-border bg-pai-card", big && "md:col-span-2 lg:col-span-1 lg:row-span-2", feature && !big && "sm:flex-row")}>
                <div className={cn("relative overflow-hidden bg-pai-muted", big ? "aspect-[4/3]" : feature ? "aspect-[16/10] sm:aspect-auto sm:min-h-56 sm:w-2/5 sm:shrink-0" : "aspect-[16/10]")}>
                  {c.image ? <img src={c.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" /> : null}
                  {c.badge ? <span className="savor-ribbon absolute left-0 top-4 bg-pai-primary px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-pai-primary-fg">{c.badge}</span> : null}
                  {c.serves ? (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-pai-bg/95 px-3 py-1 text-xs font-semibold text-pai-fg shadow">
                      <Users className="size-3.5" aria-hidden /> {c.serves}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <h3 className={cn("font-heading font-semibold leading-tight", big ? "text-2xl md:text-3xl" : "text-xl")}>
                    <SmartLink href={c.href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2">
                      {c.title}
                    </SmartLink>
                  </h3>
                  {c.items.length ? (
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {c.items.map((it) => (
                        <li key={it} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-pai-primary" aria-hidden />
                          <span className="opacity-85">{it}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div aria-hidden className="min-h-5 flex-1" />
                  <div className="flex items-end justify-between gap-3 border-t border-dashed border-pai-border pt-4">
                    <p className="leading-none">
                      <span className="font-heading text-2xl font-semibold text-pai-primary md:text-[1.75rem]">{c.price}</span>
                      {c.was ? <s className="ml-2 text-sm opacity-50">{c.was}</s> : null}
                    </p>
                    {c.product ? (
                      <div className="relative z-10">
                        <QuickAddButton product={c.product} mode="icon" className="size-11" />
                      </div>
                    ) : (
                      <span className="pai-btn pai-btn-primary pai-btn-sm pointer-events-none" aria-hidden>
                        {label}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    );
  },
});
