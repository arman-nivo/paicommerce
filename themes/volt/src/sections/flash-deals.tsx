import { defineSection } from "@pai/theme-sdk";
import { Container, PreviewNotice, SmartLink, loadSectionProducts, paddingField, productSourceFields, resolveHref, str } from "@pai/theme-kit";
import { Carousel, Countdown } from "@pai/theme-kit/client";
import { Zap } from "lucide-react";
import { VoltCard } from "../components/card";

/** Next midnight in Bangladesh time (UTC+6) as an ISO string — the timer for "daily" deals. */
export function nextDhakaMidnight(now = Date.now()): string {
  const offset = 6 * 3600_000;
  const local = new Date(now + offset);
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + 1) - offset;
  return new Date(midnight).toISOString();
}

export const voltFlashDeals = defineSection({
  schema: {
    type: "flash-deals",
    name: "Flash deals",
    category: "products",
    icon: "zap",
    description: "Countdown timer with a grid or carousel of deals and “claimed” stock meters.",
    settings: [
      { type: "text", id: "eyebrow", label: "Badge", default: "Flash deals" },
      { type: "text", id: "heading", label: "Heading", default: "Today's lightning deals" },
      {
        type: "select",
        id: "timer_mode",
        label: "Timer",
        default: "daily",
        options: [
          { value: "daily", label: "Resets every midnight" },
          { value: "date", label: "Ends at a date" },
          { value: "none", label: "No timer" },
        ],
      },
      { type: "datetime", id: "ends_at", label: "Ends at", info: "Used when Timer = Ends at a date." },
      { type: "text", id: "ended_text", label: "Text after the deal ends", default: "These deals have ended — new ones drop soon." },
      ...productSourceFields({ source: "on-sale", limit: 8 }),
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "carousel",
        options: [
          { value: "carousel", label: "Carousel" },
          { value: "grid", label: "Grid" },
        ],
      },
      { type: "checkbox", id: "stock_bar", label: "Show “claimed” meter", default: true },
      { type: "text", id: "link_label", label: "Link label", default: "View all deals" },
      { type: "url", id: "link", label: "Link", default: "/collections/all" },
      paddingField("medium"),
    ],
    presets: [{ name: "Flash deals" }],
  },
  component: async ({ settings: s, context }) => {
    const { products, sample } = await loadSectionProducts(context, s, 8);
    if (!products.length) return null;
    const mode = str(s.timer_mode, "daily");
    const endsAt = mode === "date" && str(s.ends_at) ? str(s.ends_at) : mode === "daily" ? nextDhakaMidnight() : "";
    const link = resolveHref(context, s.link);
    const pad = { none: "0", small: "0.5", medium: "1", large: "1.5" }[str(s.padding, "medium")] ?? "1";

    return (
      <section aria-label={str(s.heading) || "Flash deals"} className="volt-flash pai-section" style={{ ["--pai-section-pad" as string]: pad }}>
        <Container>
          {sample ? <PreviewNotice context={context}>No products matched — showing sample products.</PreviewNotice> : null}
          <div className="relative overflow-hidden rounded-[calc(var(--pai-radius)*1.6)] border border-pai-border bg-pai-muted/60 p-4 sm:p-6 lg:p-8">
            <div aria-hidden className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-pai-sale/20 blur-3xl" />
            <div className="relative mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-pai bg-pai-sale text-white shadow-[0_0_32px_-4px_var(--pai-sale)]">
                  <Zap className="size-6 fill-current" aria-hidden />
                </span>
                <div>
                  {str(s.eyebrow) ? <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-pai-sale">{str(s.eyebrow)}</p> : null}
                  {str(s.heading) ? <h2 className="pai-h3">{str(s.heading)}</h2> : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {endsAt ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Ends in</span>
                    <Countdown
                      to={endsAt}
                      expiredLabel={str(s.ended_text)}
                      className="gap-1.5 sm:gap-2"
                      boxClassName="min-w-12 rounded-[min(var(--pai-radius),10px)] border border-pai-border !bg-pai-bg px-2 py-1.5 !text-pai-fg [&>span:first-child]:text-xl [&>span:first-child]:sm:text-2xl"
                    />
                  </div>
                ) : null}
                {str(s.link_label) && link ? (
                  <SmartLink href={link} className="text-sm font-semibold text-pai-primary hover:underline">
                    {str(s.link_label)} →
                  </SmartLink>
                ) : null}
              </div>
            </div>
            {s.layout === "grid" ? (
              <div className="relative grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {products.map((p) => (
                  <VoltCard key={p.id} product={p} context={context} stockBar={s.stock_bar !== false} />
                ))}
              </div>
            ) : (
              <Carousel perView={{ base: 1.7, md: 3, lg: 4 }} gap={14} ariaLabel={str(s.heading) || "Deals"}>
                {products.map((p) => (
                  <VoltCard key={p.id} product={p} context={context} stockBar={s.stock_bar !== false} />
                ))}
              </Carousel>
            )}
          </div>
        </Container>
      </section>
    );
  },
});
