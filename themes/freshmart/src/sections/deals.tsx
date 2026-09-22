/** Deals of the day: countdown header, optional promo panel and a rail of discounted products. */
import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { PreviewNotice, SAMPLE_PRODUCTS, Section, SmartLink, cn, loadSectionProducts, num, paddingField, productSourceFields, resolveHref, str } from "@pai/theme-kit";
import { Carousel } from "@pai/theme-kit/client";
import { ChevronRight, Flame } from "lucide-react";
import { DealTimer } from "../client/deal-timer";
import { IMG } from "../images";
import { FreshCard, discountOf } from "./card";

export const dealsOfTheDay = defineSection({
  schema: {
    type: "deals-of-the-day",
    name: "Deals of the day",
    category: "products",
    icon: "timer",
    description: "Countdown to midnight (or a fixed end time) with a rail of deal products.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Deals of the day" },
      { type: "text", id: "heading", label: "Heading", default: "Today's lowest prices" },
      {
        type: "select",
        id: "timer",
        label: "Countdown",
        default: "daily",
        options: [
          { value: "daily", label: "Resets every midnight (Dhaka time)" },
          { value: "fixed", label: "Ends at a fixed date & time" },
          { value: "none", label: "No countdown" },
        ],
      },
      { type: "datetime", id: "ends_at", label: "Ends at", info: "Used when Countdown = fixed." },
      { type: "text", id: "timer_label", label: "Countdown label", default: "Ends in" },
      ...productSourceFields({ source: "on-sale", limit: 10 }),
      { type: "checkbox", id: "discounted_first", label: "Show biggest discounts first", default: true },
      { type: "text", id: "view_all_label", label: "“View all” label", default: "See all deals" },
      { type: "url", id: "view_all_link", label: "“View all” link", default: "/collections/all" },
      { type: "header", label: "Promo panel" },
      { type: "checkbox", id: "show_panel", label: "Show promo panel (desktop)", default: true },
      { type: "image", id: "panel_image", label: "Panel image", default: IMG.fruitBasket },
      { type: "text", id: "panel_heading", label: "Panel heading", default: "Up to 40% off" },
      { type: "text", id: "panel_text", label: "Panel text", default: "Fresh picks at market prices — only until midnight." },
      {
        type: "select",
        id: "color_scheme",
        label: "Colours",
        default: "muted",
        options: [
          { value: "default", label: "Default" },
          { value: "muted", label: "Muted" },
          { value: "inverse", label: "Inverse (dark)" },
          { value: "primary", label: "Primary" },
        ],
      },
      paddingField("medium"),
    ],
    presets: [{ name: "Deals of the day" }],
  },
  component: async ({ settings: s, context }) => {
    let { products, sample } = await loadSectionProducts(context, s, 10);
    // No discounted products yet: show best sellers so the section never looks empty.
    if (!products.length && !context.isPreview) products = (await context.data.getProducts({ sort: "best-selling", limit: num(s.limit, 10) }).catch(() => null))?.items ?? [];
    if (!products.length && context.isPreview) {
      products = SAMPLE_PRODUCTS.slice(0, num(s.limit, 10));
      sample = true;
    }
    if (!products.length) return null;
    if (s.discounted_first !== false) products = [...products].sort((a: SfProduct, b: SfProduct) => discountOf(b) - discountOf(a));
    const timer = str(s.timer, "daily");
    const panel = s.show_panel !== false && str(s.panel_image);
    const viewAll = str(s.view_all_label) ? resolveHref(context, s.view_all_link, "/collections/all") : "";
    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Deals of the day"}>
          {sample ? <PreviewNotice context={context}>Showing sample products — mark some products with a compare-at price to feature real deals.</PreviewNotice> : null}
          <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
            <div>
              {str(s.eyebrow) ? (
                <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-pai-sale">
                  <Flame className="size-4 fill-current" aria-hidden /> {str(s.eyebrow)}
                </p>
              ) : null}
              <h2 className="pai-h2">{str(s.heading)}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {timer !== "none" ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold opacity-75">{str(s.timer_label, "Ends in")}</span>
                  <DealTimer to={timer === "fixed" ? str(s.ends_at) || undefined : undefined} />
                </div>
              ) : null}
              {viewAll ? (
                <SmartLink href={viewAll} className="inline-flex items-center gap-0.5 text-sm font-bold text-pai-primary hover:underline">
                  {str(s.view_all_label)} <ChevronRight className="size-4" aria-hidden />
                </SmartLink>
              ) : null}
            </div>
          </div>
          <div className={cn("grid gap-4", panel && "lg:grid-cols-[260px_minmax(0,1fr)]")}>
            {panel ? (
              <SmartLink href={viewAll || context.url("/collections/all")} className="group relative isolate hidden overflow-hidden rounded-pai p-6 text-white lg:flex lg:flex-col lg:justify-end">
                <img src={str(s.panel_image)} alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover transition duration-700 group-hover:scale-105" />
                <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <span className="font-heading text-3xl font-extrabold leading-tight">{str(s.panel_heading)}</span>
                <span className="mt-2 text-sm opacity-90">{str(s.panel_text)}</span>
              </SmartLink>
            ) : null}
            <div className="min-w-0">
              <Carousel perView={{ base: 2.15, md: 3.2, lg: panel ? 4 : 5 }} gap={12} ariaLabel="Deal products">
                {products.map((p) => (
                  <FreshCard key={p.id} product={p} context={context} />
                ))}
              </Carousel>
            </div>
          </div>
      </Section>
    );
  },
});
