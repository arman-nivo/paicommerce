import { defineSection } from "@pai/theme-sdk";
import { PreviewNotice, SmartLink, list, num, resolveHref, str } from "@pai/theme-kit";
import { Carousel, Countdown } from "@pai/theme-kit/client";
import { Zap } from "lucide-react";
import { BazaarCard } from "../components/card";
import { BzSection, fallbackSortField, loadProducts, spacingField } from "../components/shared";

/** Next midnight in Bangladesh time (UTC+6) as an ISO string — the timer for "daily" deals. */
export function nextDhakaMidnight(now = Date.now()): string {
  const offset = 6 * 3600_000;
  const local = new Date(now + offset);
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + 1) - offset;
  return new Date(midnight).toISOString();
}

export const bazaarFlashSale = defineSection({
  schema: {
    type: "bazaar-flash-sale",
    name: "Flash sale",
    category: "products",
    icon: "zap",
    description: "“Flash Sale · On sale now · Ending in 00:00:00” bar with a rail of deal cards and sold meters.",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Flash Sale" },
      { type: "text", id: "subheading", label: "Status text", default: "On sale now" },
      {
        type: "select",
        id: "timer_mode",
        label: "Timer",
        default: "daily",
        options: [
          { value: "daily", label: "Resets every midnight (Dhaka time)" },
          { value: "date", label: "Ends at a date" },
          { value: "none", label: "No timer" },
        ],
      },
      { type: "text", id: "timer_label", label: "Timer label", default: "Ending in" },
      { type: "datetime", id: "ends_at", label: "Ends at", info: "Used when Timer = Ends at a date." },
      { type: "text", id: "ended_text", label: "Text after the sale ends", default: "This sale has ended — new deals drop at midnight." },
      { type: "header", label: "Products" },
      { type: "collection", id: "collection", label: "Collection", default: "flash-sale", info: "Falls back to the option below when empty or missing." },
      fallbackSortField("on-sale"),
      { type: "product_list", id: "products", label: "Hand-picked products (optional)", limit: 24 },
      { type: "range", id: "limit", label: "Maximum products", min: 4, max: 24, step: 1, default: 12 },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "carousel",
        options: [
          { value: "carousel", label: "Carousel" },
          { value: "grid", label: "Grid (6 columns)" },
        ],
      },
      { type: "text", id: "link_label", label: "Link label", default: "Shop all deals" },
      { type: "url", id: "link", label: "Link", info: "Defaults to the collection." },
      spacingField("small"),
    ],
    presets: [{ name: "Flash sale" }],
  },
  component: async ({ settings: s, context }) => {
    const { items, url, sample } = await loadProducts(context, {
      collection: str(s.collection),
      sort: str(s.sort, "on-sale"),
      limit: num(s.limit, 12),
      manual: list(s.products),
    });
    if (!items.length) return null;
    const mode = str(s.timer_mode, "daily");
    const endsAt = mode === "date" && str(s.ends_at) ? str(s.ends_at) : mode === "daily" ? nextDhakaMidnight() : "";
    const link = resolveHref(context, s.link) || url || context.url("/collections/all");
    const heading = str(s.heading, "Flash Sale");

    return (
      <BzSection label={heading} padding={s.padding} className="bz-flash">
        {sample ? <PreviewNotice context={context}>No products matched — showing sample products.</PreviewNotice> : null}
        <div className="rounded-pai bg-pai-card">
          <div className="bz-flash-bar flex rounded-t-pai flex-wrap items-center gap-x-5 gap-y-2 px-3 py-2.5 sm:px-4">
            <h2 className="flex items-center gap-1.5 font-heading text-lg font-extrabold uppercase italic tracking-tight text-pai-sale sm:text-xl">
              <Zap className="size-5 fill-current" aria-hidden />
              {heading}
            </h2>
            {str(s.subheading) ? (
              <p className="flex items-center gap-1.5 text-[0.8rem] font-semibold">
                <span className="relative flex size-2" aria-hidden>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-pai-sale opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-pai-sale" />
                </span>
                {str(s.subheading)}
              </p>
            ) : null}
            {endsAt ? (
              <div className="flex items-center gap-2">
                <span className="text-[0.8rem] opacity-70">{str(s.timer_label, "Ending in")}</span>
                <Countdown
                  to={endsAt}
                  labels={false}
                  expiredLabel={str(s.ended_text)}
                  className="bz-timer !gap-1 text-sm"
                  boxClassName="!min-w-0 !rounded-[5px] !bg-pai-sale !px-1.5 !py-0.5 !text-white [&>span:first-child]:!text-sm [&>span:first-child]:!leading-5"
                />
              </div>
            ) : null}
            {str(s.link_label) ? (
              <SmartLink href={link} className="bz-outline-link ml-auto rounded-pai-btn px-3 py-1.5 text-[0.75rem] font-bold uppercase tracking-wide">
                {str(s.link_label)}
              </SmartLink>
            ) : null}
          </div>
          <div className="p-2 sm:p-3">
            {s.layout === "grid" ? (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {items.map((p) => (
                  <li key={p.id}>
                    <BazaarCard product={p} context={context} variant="deal" className="bz-card-flat" />
                  </li>
                ))}
              </ul>
            ) : (
              <Carousel perView={{ base: 2.3, md: 4, lg: 6 }} gap={8} ariaLabel={heading}>
                {items.map((p) => (
                  <BazaarCard key={p.id} product={p} context={context} variant="deal" className="bz-card-flat" />
                ))}
              </Carousel>
            )}
          </div>
        </div>
      </BzSection>
    );
  },
});
