/**
 * Savor footer: an "order" band (big serif line + Order now / Call / WhatsApp), then block-driven
 * columns — brand & address, opening hours table, delivery areas, menus, newsletter — and a bottom
 * bar with copyright, "Powered by PaiCommerce" and payment icons. Warm dark by default.
 */
import { defineSection } from "@pai/theme-sdk";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container, Link, PaymentIcons, RichText, SmartLink, SocialLinks, bool, cn, loadMenu, schemeClass, schemeField, str } from "@pai/theme-kit";
import { NewsletterForm } from "@pai/theme-kit/client";
import { DAYS, closedDaySet, hoursRange } from "../lib/hours";
import { restaurantInfo } from "../lib/info";
import { HoursTable } from "../client/open-status";

const H = "mb-4 font-heading text-lg font-semibold";

export const savorFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Order band, address, opening hours, delivery areas, menus, newsletter and payment icons.",
    settings: [
      { type: "header", label: "Order band" },
      { type: "checkbox", id: "show_band", label: "Show order band", default: true },
      { type: "text", id: "band_heading", label: "Heading", default: "Hungry? We'll bring it hot." },
      { type: "text", id: "band_text", label: "Text", default: "Order online, call us, or send a WhatsApp — delivered in about 45 minutes." },
      { type: "header", label: "Bottom bar" },
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "cod, bkash, nagad, visa, mastercard", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Defaults to “© {year} {store}”." },
      schemeField("inverse"),
    ],
    blocks: [
      {
        type: "brand",
        name: "Brand & address",
        limit: 1,
        settings: [
          { type: "image", id: "logo", label: "Logo", info: "Defaults to the store name." },
          { type: "textarea", id: "text", label: "Text", default: "" },
          { type: "checkbox", id: "show_contact", label: "Show address, phone & email", default: true },
        ],
      },
      {
        type: "hours",
        name: "Opening hours",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Opening hours" },
          { type: "textarea", id: "custom", label: "Custom hours", info: "Optional. One line per row, e.g. “Sat – Thu | 11 AM – 11 PM”. Leave empty to use Theme settings › Restaurant." },
          { type: "text", id: "note", label: "Note", default: "" },
        ],
      },
      {
        type: "areas",
        name: "Delivery areas",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "We deliver to" },
          { type: "textarea", id: "areas", label: "Areas", default: "Banani, Gulshan 1 & 2, Baridhara, Mohakhali, Niketan, Banani DOHS", info: "Comma or line separated." },
          { type: "text", id: "note", label: "Note", default: "Other areas via Foodpanda & Pathao Food." },
        ],
      },
      {
        type: "link_list",
        name: "Menu",
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Explore" },
          { type: "menu", id: "menu", label: "Menu", default: "footer" },
        ],
      },
      {
        type: "text",
        name: "Text",
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "About us" },
          { type: "richtext", id: "text", label: "Text", default: "<p>Share your kitchen's story.</p>" },
        ],
      },
      {
        type: "newsletter",
        name: "Newsletter",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Get the weekly specials" },
          { type: "textarea", id: "text", label: "Text", default: "New dishes, festival menus and members-only deals." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Footer",
        blocks: [{ type: "brand" }, { type: "hours" }, { type: "areas" }, { type: "link_list" }],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const store = context.store;
    const info = restaurantInfo(context);
    const menus = await Promise.all(blocks.map((b) => (b.type === "link_list" ? loadMenu(context, str(b.settings.menu, "footer"), "footer") : Promise.resolve(null))));
    const year = new Date().getFullYear();
    const copyright = str(s.copyright, `© ${year} ${store.name}. Cooked with love in Dhaka.`).replace("{year}", String(year)).replace("{store}", store.name);
    const methods = str(s.payment_methods, "cod, bkash, nagad, visa, mastercard")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
    const closed = closedDaySet(context.theme.closed_days);
    const range = info.todayRange;
    const list = blocks.length ? blocks : [{ id: "fallback-brand", type: "brand", settings: { show_contact: true } }];

    return (
      <footer className={cn("savor-footer text-[0.92rem]", schemeClass(s.color_scheme))}>
        {bool(s.show_band, true) && str(s.band_heading) ? (
          <div className="border-b border-pai-border">
            <Container className="flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-14">
              <div className="max-w-2xl">
                <p className="savor-band-title font-heading text-3xl leading-tight md:text-[2.6rem]">{str(s.band_heading)}</p>
                {str(s.band_text) ? <p className="mt-3 opacity-75">{str(s.band_text)}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <SmartLink href={info.cta.href} className="pai-btn savor-btn-accent">
                  {info.cta.label} <span aria-hidden>→</span>
                </SmartLink>
                {info.phone ? (
                  <a href={info.phoneHref} className="pai-btn pai-btn-secondary">
                    <Phone className="size-4" aria-hidden /> Call {info.phone}
                  </a>
                ) : null}
                {info.whatsapp ? (
                  <a href={info.whatsapp} target="_blank" rel="noopener noreferrer" className="pai-btn pai-btn-secondary" aria-label="Order on WhatsApp">
                    <MessageCircle className="size-4" aria-hidden /> WhatsApp
                  </a>
                ) : null}
              </div>
            </Container>
          </div>
        ) : null}

        <Container>
          <div className={cn("grid gap-10 py-14 sm:grid-cols-2", list.length >= 4 ? "lg:grid-cols-[1.3fr_1fr_1fr_0.8fr]" : list.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2", list.length > 4 && "xl:grid-cols-[1.3fr_repeat(4,1fr)]")}>
            {list.map((b, i) => {
              const bs = b.settings;
              if (b.type === "brand") {
                return (
                  <div key={b.id} className="space-y-4">
                    {str(bs.logo) ? <img src={str(bs.logo)} alt={store.name} className="h-12 w-auto object-contain" loading="lazy" /> : <p className="font-heading text-3xl font-semibold">{store.name}</p>}
                    <p className="max-w-sm opacity-75">{str(bs.text) || store.description || "Fresh, honest food cooked to order and delivered hot."}</p>
                    {bool(bs.show_contact, true) ? (
                      <ul className="space-y-2.5 opacity-85">
                        {info.address ? (
                          <li className="flex gap-2.5">
                            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                            {info.mapsHref ? (
                              <a href={info.mapsHref} target="_blank" rel="noopener noreferrer" className="hover:underline hover:underline-offset-4">
                                {info.address}
                              </a>
                            ) : (
                              <span>{info.address}</span>
                            )}
                          </li>
                        ) : null}
                        {info.phone ? (
                          <li className="flex gap-2.5">
                            <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
                            <a href={info.phoneHref} className="hover:underline hover:underline-offset-4">
                              {info.phone}
                            </a>
                          </li>
                        ) : null}
                        {store.email ? (
                          <li className="flex gap-2.5">
                            <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                            <a href={`mailto:${store.email}`} className="break-all hover:underline hover:underline-offset-4">
                              {store.email}
                            </a>
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                    {bool(s.show_social, true) ? <SocialLinks context={context} /> : null}
                  </div>
                );
              }
              if (b.type === "hours") {
                const custom = str(bs.custom)
                  .split("\n")
                  .map((l) => l.split("|").map((x) => x.trim()))
                  .filter((p) => p[0]);
                const rows = custom.length
                  ? custom.map(([label, hours]) => ({ day: null, label: label!, hours: hours ?? "", closed: /closed/i.test(hours ?? "") }))
                  : info.week.length
                    ? DAYS.map((d, day) => ({ day, label: d, hours: range, closed: closed.has(day) }))
                    : [];
                if (!rows.length) return null;
                return (
                  <div key={b.id}>
                    <h2 className={H}>{str(bs.heading, "Opening hours")}</h2>
                    <HoursTable rows={rows} timeZone={info.timeZone} className="text-sm" />
                    {str(bs.note) || info.hoursNote ? <p className="mt-3 text-xs opacity-65">{str(bs.note) || info.hoursNote}</p> : null}
                  </div>
                );
              }
              if (b.type === "areas") {
                const areas = str(bs.areas)
                  .split(/[,\n]/)
                  .map((a) => a.trim())
                  .filter(Boolean);
                return (
                  <div key={b.id}>
                    <h2 className={H}>{str(bs.heading, "We deliver to")}</h2>
                    <ul className="flex flex-wrap gap-2">
                      {areas.map((a) => (
                        <li key={a} className="rounded-full border border-pai-border px-3 py-1 text-[0.8rem]">
                          {a}
                        </li>
                      ))}
                    </ul>
                    {str(bs.note) ? <p className="mt-4 text-xs opacity-65">{str(bs.note)}</p> : null}
                  </div>
                );
              }
              if (b.type === "link_list") {
                return (
                  <div key={b.id}>
                    <h2 className={H}>{str(bs.heading)}</h2>
                    <ul className="space-y-2.5">
                      {(menus[i] ?? []).map((m) => (
                        <li key={m.id}>
                          <SmartLink href={m.url} className="opacity-75 transition hover:opacity-100 hover:underline hover:underline-offset-4">
                            {m.label}
                          </SmartLink>
                        </li>
                      ))}
                      {!(menus[i] ?? []).some((m) => m.url.includes("track-order")) ? (
                        <li>
                          <Link href={context.url("/track-order")} className="font-medium underline underline-offset-4">
                            Track your order
                          </Link>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                );
              }
              if (b.type === "text") {
                return (
                  <div key={b.id}>
                    <h2 className={H}>{str(bs.heading)}</h2>
                    <RichText html={str(bs.text)} className="opacity-75" />
                  </div>
                );
              }
              if (b.type === "newsletter") {
                return (
                  <div key={b.id} className="sm:col-span-2 lg:col-span-1">
                    <h2 className={H}>{str(bs.heading)}</h2>
                    <p className="mb-4 opacity-75">{str(bs.text)}</p>
                    <NewsletterForm buttonLabel="Join" />
                  </div>
                );
              }
              return null;
            })}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-pai-border py-6 text-xs md:flex-row">
            <p className="opacity-70">{copyright}</p>
            {store.showBranding ? (
              <a href="https://paicommerce.com?utm_source=storefront&utm_medium=footer" target="_blank" rel="noopener" className="opacity-60 transition hover:opacity-100">
                Powered by <span className="font-semibold">PaiCommerce</span>
              </a>
            ) : null}
            {bool(s.show_payment_icons, true) ? <PaymentIcons methods={methods} /> : null}
          </div>
        </Container>
      </footer>
    );
  },
});
