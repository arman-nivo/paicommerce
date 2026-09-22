/**
 * Savor "Delivery areas": where you deliver, how long it takes and what it costs — area blocks
 * with time + fee, highlights (minimum order, free-delivery threshold, payment) and a CTA.
 */
import { defineSection } from "@pai/theme-sdk";
import { Bike, Timer } from "lucide-react";
import { Section, SmartLink, cn, headingFields, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { restaurantInfo } from "../lib/info";
import { IMG } from "../images";

export const savorDelivery = defineSection({
  schema: {
    type: "savor-delivery",
    name: "Delivery areas",
    category: "content",
    icon: "bike",
    description: "Delivery zones with time and fee, minimum order and a call to action.",
    settings: [
      ...headingFields({ eyebrow: "Delivery", heading: "Hot at your door in 30–60 minutes", subheading: "Our own riders cover Banani and the neighbourhoods around it. Everything leaves the kitchen in sealed, insulated bags.", align: "left" }),
      { type: "image", id: "image", label: "Image", default: IMG.delivery },
      { type: "text", id: "min_order", label: "Minimum order", default: "৳400" },
      { type: "text", id: "free_over", label: "Free delivery over", default: "৳1,500" },
      { type: "text", id: "payment", label: "Payment note", default: "Cash, bKash or Nagad on delivery" },
      { type: "text", id: "button_label", label: "Button label", info: "Defaults to Theme settings › “Order now” label." },
      { type: "url", id: "button_link", label: "Button link" },
      { type: "text", id: "footnote", label: "Footnote", default: "Outside these areas? Find us on Foodpanda and Pathao Food." },
      schemeField("inverse"),
      paddingField(),
    ],
    blocks: [
      {
        type: "area",
        name: "Delivery area",
        settings: [
          { type: "text", id: "name", label: "Area", default: "Banani" },
          { type: "text", id: "time", label: "Delivery time", default: "25–35 min" },
          { type: "text", id: "fee", label: "Fee", default: "৳40" },
          { type: "text", id: "note", label: "Note", default: "" },
        ],
      },
    ],
    maxBlocks: 12,
    presets: [
      {
        name: "Delivery areas",
        blocks: [
          { type: "area", settings: { name: "Banani & Banani DOHS", time: "25–35 min", fee: "৳40" } },
          { type: "area", settings: { name: "Gulshan 1 & 2", time: "30–45 min", fee: "৳60" } },
          { type: "area", settings: { name: "Mohakhali & Niketan", time: "35–50 min", fee: "৳70" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const info = restaurantInfo(context);
    const areas = blocks.filter((b) => str(b.settings.name));
    const facts = [
      { label: "Minimum order", value: str(s.min_order) },
      { label: "Free delivery over", value: str(s.free_over) },
      { label: "Pay", value: str(s.payment) },
    ].filter((f) => f.value);
    if (!areas.length && !facts.length && !str(s.heading)) return null;
    const cta = { label: str(s.button_label) || info.cta.label, href: str(s.button_link) ? resolveHref(context, s.button_link) : info.cta.href };
    const image = str(s.image);
    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Delivery areas"} className="savor-delivery">
        <div className={cn("grid gap-10 lg:gap-14", image ? "lg:grid-cols-[0.9fr_1.1fr]" : "")}>
          <div className="flex flex-col">
            {str(s.eyebrow) ? <p className="savor-eyebrow mb-3 text-pai-accent">{str(s.eyebrow)}</p> : null}
            {str(s.heading) ? <h2 className="pai-h2 [text-wrap:balance]">{str(s.heading)}</h2> : null}
            {str(s.subheading) ? <p className="mt-4 max-w-lg opacity-75 md:text-lg">{str(s.subheading)}</p> : null}
            {facts.length ? (
              <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                {facts.map((f) => (
                  <div key={f.label} className="rounded-pai border border-pai-border p-4">
                    <dt className="text-xs uppercase tracking-[0.14em] opacity-60">{f.label}</dt>
                    <dd className="mt-1.5 font-heading text-lg font-semibold leading-snug">{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {image ? (
              <div className="relative mt-8 hidden aspect-[16/9] overflow-hidden rounded-pai bg-pai-muted lg:block">
                <img src={image} alt="Delivery rider on the way" loading="lazy" className="absolute inset-0 size-full object-cover" />
              </div>
            ) : null}
          </div>
          <div className="flex flex-col">
            {areas.length ? (
              <ul className="divide-y divide-dashed divide-pai-border rounded-pai border border-pai-border">
                {areas.map((b) => (
                  <li key={b.id} className="flex items-center gap-4 p-4 md:px-6 md:py-5">
                    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-pai-muted">
                      <Bike className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-lg font-semibold">{str(b.settings.name)}</span>
                      <span className="flex flex-wrap items-center gap-x-3 text-sm opacity-70">
                        {str(b.settings.time) ? (
                          <span className="inline-flex items-center gap-1">
                            <Timer className="size-3.5" aria-hidden /> {str(b.settings.time)}
                          </span>
                        ) : null}
                        {str(b.settings.note) ? <span>{str(b.settings.note)}</span> : null}
                      </span>
                    </span>
                    {str(b.settings.fee) ? (
                      <span className="shrink-0 text-right">
                        <span className="block text-[10px] uppercase tracking-[0.14em] opacity-60">Delivery</span>
                        <span className="font-semibold tabular-nums">{str(b.settings.fee)}</span>
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {cta.label ? (
                <SmartLink href={cta.href} className="pai-btn pai-btn-lg savor-btn-accent">
                  {cta.label} <span aria-hidden>→</span>
                </SmartLink>
              ) : null}
              {str(s.footnote) ? <p className="max-w-sm text-sm opacity-70">{str(s.footnote)}</p> : null}
            </div>
          </div>
        </div>
      </Section>
    );
  },
});
