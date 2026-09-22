/**
 * Savor hero: a big appetising dish, a warm serif headline, "Order now" + "View menu" buttons, a
 * live opening-hours badge and an optional rating badge. Two layouts: "split" (text on paper,
 * dish in a soft arch with a floating featured-dish card) and "full" (full-bleed photo).
 */
import { defineSection } from "@pai/theme-sdk";
import { Clock, Star } from "lucide-react";
import { Link, SmartLink, bool, cn, formatMoney, moneyOf, num, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { OpenStatus } from "../client/open-status";
import { restaurantInfo } from "../lib/info";
import { IMG } from "../images";

export const savorHero = defineSection({
  schema: {
    type: "savor-hero",
    name: "Restaurant hero",
    category: "hero",
    icon: "utensils-crossed",
    description: "Big dish photo, headline, Order now / View menu buttons and a live opening-hours badge.",
    settings: [
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "split",
        options: [
          { value: "split", label: "Split — text + arched photo" },
          { value: "full", label: "Full-bleed photo" },
        ],
      },
      { type: "image", id: "image", label: "Image", default: IMG.heroBiryani },
      { type: "image", id: "image_2", label: "Second image (split layout)", info: "Small round photo overlapping the main one.", default: IMG.kebabs },
      { type: "range", id: "overlay", label: "Overlay (full layout)", min: 0, max: 80, step: 5, unit: "%", default: 45 },
      {
        type: "select",
        id: "height",
        label: "Height",
        default: "large",
        options: [
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
          { value: "full", label: "Full screen" },
        ],
      },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Banani · Since 2016" },
      { type: "textarea", id: "heading", label: "Heading", default: "Slow-cooked kacchi, fired-up grills." },
      { type: "text", id: "heading_accent", label: "Heading accent (italic, new line)", default: "Delivered hot." },
      { type: "textarea", id: "subheading", label: "Text", default: "Old Dhaka recipes sealed in a copper deg, charcoal kebabs and smash burgers — cooked to order and at your door in about 45 minutes." },
      { type: "header", label: "Buttons" },
      { type: "text", id: "button_label", label: "Primary label", info: "Defaults to Theme settings › “Order now” label." },
      { type: "url", id: "button_link", label: "Primary link" },
      { type: "text", id: "button_2_label", label: "Secondary label", default: "View menu" },
      { type: "url", id: "button_2_link", label: "Secondary link", default: "#menu" },
      { type: "header", label: "Badges" },
      { type: "checkbox", id: "show_hours", label: "Show opening-hours badge", default: true },
      { type: "text", id: "rating", label: "Rating", default: "4.8", info: "Leave empty to hide the rating badge." },
      { type: "text", id: "rating_text", label: "Rating text", default: "2,300+ reviews on Google & Foodpanda" },
      { type: "product", id: "product", label: "Featured dish (split layout)", info: "Shows a floating card with the dish and its price." },
      { type: "text", id: "product_label", label: "Featured dish label", default: "Chef's signature" },
      schemeField("default"),
    ],
    presets: [{ name: "Restaurant hero" }, { name: "Restaurant hero — full photo", settings: { layout: "full" } }],
  },
  component: async ({ settings: s, context }) => {
    const info = restaurantInfo(context);
    const full = str(s.layout, "split") === "full";
    const image = str(s.image, IMG.heroBiryani);
    const primary = { label: str(s.button_label) || info.cta.label, href: str(s.button_link) ? resolveHref(context, s.button_link) : info.cta.href };
    const secondary = str(s.button_2_label) ? { label: str(s.button_2_label), href: resolveHref(context, s.button_2_link, "/collections/all") } : null;
    const rating = str(s.rating);
    const product = str(s.product) ? await context.data.getProduct(str(s.product)).catch(() => null) : null;
    const money = moneyOf(context);
    const height = str(s.height, "large");
    const hoursBadge =
      bool(s.show_hours, true) && info.week.length ? (
        <p className={cn("inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.8rem]", full ? "bg-white/15 text-white backdrop-blur" : "bg-pai-muted")}>
          <Clock className="size-3.5 opacity-70" aria-hidden />
          <OpenStatus week={info.week} timeZone={info.timeZone} fallback={`Today ${info.todayRange}`} showDetail={false} />
          <span className="sr-only">Today {info.todayRange}</span>
        </p>
      ) : null;
    const ratingBadge = rating ? (
      <p className={cn("flex items-center gap-2 text-sm", full ? "text-white/90" : "opacity-85")}>
        <span className="inline-flex items-center gap-0.5 text-pai-accent" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="size-4 fill-current" />
          ))}
        </span>
        <span>
          <strong className="font-semibold">{rating}</strong>
          {str(s.rating_text) ? <span className="opacity-80"> · {str(s.rating_text)}</span> : null}
        </span>
      </p>
    ) : null;
    const heading = (
      <h1 className="savor-hero-title font-heading [text-wrap:balance]">
        {str(s.heading)}
        {str(s.heading_accent) ? (
          <>
            {" "}
            <em className={cn("savor-hero-accent block", full ? "text-pai-accent" : "text-pai-primary")}>{str(s.heading_accent)}</em>
          </>
        ) : null}
      </h1>
    );
    const buttons = (
      <div className="flex flex-wrap gap-3">
        {primary.label ? (
          <SmartLink href={primary.href} className="pai-btn pai-btn-primary pai-btn-lg savor-cta">
            {primary.label} <span aria-hidden>→</span>
          </SmartLink>
        ) : null}
        {secondary ? (
          <SmartLink href={secondary.href} className={cn("pai-btn pai-btn-lg", full ? "pai-btn-light" : "pai-btn-secondary")}>
            {secondary.label}
          </SmartLink>
        ) : null}
      </div>
    );

    if (full) {
      return (
        <section
          aria-label="Welcome"
          className={cn(
            "savor-hero relative isolate flex items-end overflow-hidden text-white",
            height === "full" ? "min-h-[calc(100svh-7rem)]" : height === "medium" ? "min-h-[460px] md:min-h-[520px]" : "min-h-[560px] md:min-h-[680px]",
          )}
        >
          <img src={image} alt="" fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover" />
          <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/40 to-black/10" style={{ opacity: Math.min(1, num(s.overlay, 45) / 45) }} />
          <div className="pai-container w-full pb-14 pt-24 md:pb-20">
            <div className="max-w-2xl space-y-6">
              {hoursBadge}
              {str(s.eyebrow) ? <p className="savor-eyebrow text-white/85">{str(s.eyebrow)}</p> : null}
              {heading}
              {str(s.subheading) ? <p className="max-w-xl text-base text-white/85 md:text-lg">{str(s.subheading)}</p> : null}
              {buttons}
              {ratingBadge}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section aria-label="Welcome" className={cn("savor-hero relative overflow-hidden", schemeClass(s.color_scheme))}>
        <div aria-hidden className="savor-hero-glow pointer-events-none absolute -right-40 -top-40 size-[36rem] rounded-full" />
        <div className={cn("pai-container grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14", height === "full" && "lg:min-h-[calc(100svh-8rem)]", height === "large" && "lg:min-h-[640px]")}>
          <div className="order-2 space-y-6 lg:order-1">
            {hoursBadge}
            {str(s.eyebrow) ? <p className="savor-eyebrow text-pai-primary">{str(s.eyebrow)}</p> : null}
            {heading}
            {str(s.subheading) ? <p className="max-w-xl text-base opacity-75 md:text-lg">{str(s.subheading)}</p> : null}
            {buttons}
            {ratingBadge}
          </div>
          <div className="relative order-1 mx-auto w-full max-w-[560px] lg:order-2">
            <div className="savor-arch relative aspect-[5/4] overflow-hidden bg-pai-muted sm:aspect-[5/5.4]">
              <img src={image} alt={str(s.heading) ? `${str(s.heading)} — signature dish` : "Signature dish"} fetchPriority="high" className="absolute inset-0 size-full object-cover" />
            </div>
            {str(s.image_2) ? (
              <div className="absolute -bottom-4 -left-3 size-28 overflow-hidden rounded-full border-[6px] border-pai-bg bg-pai-muted shadow-xl sm:-left-8 sm:size-36">
                <img src={str(s.image_2)} alt="" loading="lazy" className="size-full object-cover" />
              </div>
            ) : null}
            <span aria-hidden className="savor-stamp absolute -right-2 top-6 grid size-24 place-items-center rounded-full bg-pai-accent text-center font-heading text-[0.8rem] font-semibold leading-tight text-[color:var(--pai-fg)] shadow-lg sm:right-4 sm:size-28">
              Cooked
              <br />
              to order
            </span>
            {product ? (
              <Link
                href={product.url}
                className="absolute bottom-6 right-2 flex max-w-[16rem] items-center gap-3 rounded-pai bg-pai-bg/95 p-2.5 pr-4 text-pai-fg shadow-xl backdrop-blur transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary sm:right-6"
              >
                {product.featuredImage ? <img src={product.featuredImage.url} alt="" className="size-14 shrink-0 rounded-[calc(var(--pai-radius)*0.7)] object-cover" loading="lazy" /> : null}
                <span className="min-w-0">
                  {str(s.product_label) ? <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-pai-primary">{str(s.product_label)}</span> : null}
                  <span className="block truncate font-heading text-[0.98rem] font-semibold">{product.title}</span>
                  <span className="block text-sm opacity-75">
                    {product.priceMax > product.priceMin ? "from " : ""}
                    {formatMoney(product.priceMin || product.price, money.currency, money.display)}
                  </span>
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    );
  },
});
