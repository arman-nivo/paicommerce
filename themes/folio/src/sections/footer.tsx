/**
 * Folio footer — a literary quote, "The Folio Letter" newsletter, genre & store menus, contact
 * details, and a colophon line with payment icons, social links and copyright.
 */
import { defineSection } from "@pai/theme-sdk";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container, Link, PaymentIcons, RichText, SmartLink, SocialLinks, bool, cn, loadMenu, schemeClass, schemeField, str } from "@pai/theme-kit";
import { NewsletterForm } from "@pai/theme-kit/client";
import { formatAddress } from "../lib/book";

const linkCls = "opacity-75 transition hover:opacity-100 hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current";

export const folioFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Literary quote, newsletter, menus, contact details and a colophon.",
    settings: [
      { type: "header", label: "Quote" },
      { type: "checkbox", id: "show_quote", label: "Show quote", default: true },
      { type: "textarea", id: "quote", label: "Quote", default: "The butterfly counts not months but moments, and has time enough." },
      { type: "text", id: "quote_author", label: "Attribution", default: "Rabindranath Tagore, Fireflies" },
      { type: "header", label: "Bottom bar" },
      { type: "text", id: "colophon", label: "Colophon", default: "Set in Libre Baskerville & Work Sans. Packed by hand in Banani, Dhaka." },
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "cod, bkash, nagad, visa, mastercard", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Defaults to “© {year} {store}”." },
      schemeField("inverse"),
    ],
    blocks: [
      {
        type: "brand",
        name: "About the shop",
        limit: 1,
        settings: [
          { type: "image", id: "logo", label: "Logo", info: "Defaults to the store name." },
          { type: "textarea", id: "text", label: "Text", default: "An independent bookshop for curious readers — Bangla classics, new fiction, ideas worth arguing about and beautiful things to write with." },
        ],
      },
      {
        type: "link_list",
        name: "Menu",
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "The shop" },
          { type: "menu", id: "menu", label: "Menu", default: "footer" },
        ],
      },
      {
        type: "genres",
        name: "Genre links",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Browse" },
          { type: "range", id: "limit", label: "Collections to show", min: 3, max: 12, step: 1, default: 6 },
        ],
      },
      {
        type: "contact",
        name: "Contact",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Visit & contact" },
          { type: "textarea", id: "hours", label: "Opening hours", default: "Open daily, 10am – 9pm" },
        ],
      },
      {
        type: "text",
        name: "Text",
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "About us" },
          { type: "richtext", id: "text", label: "Text", default: "<p>Share your story with readers.</p>" },
        ],
      },
      {
        type: "newsletter",
        name: "Newsletter",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "The Folio Letter" },
          { type: "textarea", id: "text", label: "Text", default: "One unhurried email a month: new arrivals, staff picks and the occasional reading-group invitation." },
          { type: "text", id: "button_label", label: "Button label", default: "Subscribe" },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Footer",
        blocks: [{ type: "brand" }, { type: "genres" }, { type: "link_list" }, { type: "contact" }, { type: "newsletter" }],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const store = context.store;
    const data = await Promise.all(
      blocks.map(async (b) => {
        if (b.type === "link_list") return (await loadMenu(context, str(b.settings.menu, "footer"), "footer")).map((m) => ({ id: m.id, label: m.label, url: m.url }));
        if (b.type === "genres") {
          const cols = await context.data.getCollections({ limit: Math.max(3, Math.min(12, Number(b.settings.limit) || 6)) }).catch(() => []);
          return cols.map((c) => ({ id: c.id, label: c.title, url: c.url }));
        }
        return null;
      }),
    );
    const year = new Date().getFullYear();
    const copyright = str(s.copyright, `© ${year} ${store.name}`).replace("{year}", String(year)).replace("{store}", store.name);
    const methods = str(s.payment_methods, "cod, bkash, nagad, visa, mastercard")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
    const address = formatAddress(store.address);
    const newsletter = blocks.find((b) => b.type === "newsletter");
    const columns = blocks.filter((b) => b.type !== "newsletter");
    const quote = bool(s.show_quote, true) ? str(s.quote) : "";

    return (
      <footer className={cn("folio-footer text-[0.92rem]", schemeClass(s.color_scheme))}>
        {quote ? (
          <Container className="py-14 text-center md:py-20">
            <figure className="mx-auto max-w-3xl">
              <p aria-hidden className="font-heading text-3xl leading-none opacity-40">
                ❦
              </p>
              <blockquote className="mt-5 font-heading text-[calc(clamp(1.4rem,2.6vw,2.1rem)*var(--pai-heading-scale))] italic leading-snug [text-wrap:balance]">“{quote}”</blockquote>
              {str(s.quote_author) ? <figcaption className="mt-5 text-[11px] font-medium uppercase tracking-[0.26em] opacity-65">— {str(s.quote_author)}</figcaption> : null}
            </figure>
          </Container>
        ) : null}

        {newsletter ? (
          <div className="border-y border-pai-border">
            <Container className="grid items-center gap-6 py-10 md:grid-cols-[1fr_1.1fr] md:gap-12">
              <div>
                <h2 className="font-heading text-2xl md:text-[1.75rem]">{str(newsletter.settings.heading, "The Folio Letter")}</h2>
                {str(newsletter.settings.text) ? <p className="mt-2 max-w-lg opacity-75">{str(newsletter.settings.text)}</p> : null}
              </div>
              <NewsletterForm buttonLabel={str(newsletter.settings.button_label, "Subscribe")} placeholder="Your email address" successMessage="Thank you — the next letter is on its way." className="folio-newsletter" />
            </Container>
          </div>
        ) : null}

        <Container className="py-12 md:py-14">
          <div className={cn("grid gap-10 sm:grid-cols-2", columns.length >= 4 ? "lg:grid-cols-[1.5fr_repeat(3,1fr)]" : columns.length === 3 ? "lg:grid-cols-[1.5fr_1fr_1fr]" : "lg:grid-cols-2")}>
            {columns.map((b) => {
              const bs = b.settings;
              const i = blocks.indexOf(b);
              if (b.type === "brand") {
                return (
                  <div key={b.id} className="space-y-4">
                    {str(bs.logo) ? (
                      <img src={str(bs.logo)} alt={store.name} className="h-10 w-auto object-contain" loading="lazy" />
                    ) : (
                      <p className="font-heading text-[1.7rem] leading-none">{store.name}</p>
                    )}
                    <p className="max-w-sm leading-relaxed opacity-75">{str(bs.text) || store.description || ""}</p>
                    {bool(s.show_social, true) ? <SocialLinks context={context} /> : null}
                  </div>
                );
              }
              if (b.type === "link_list" || b.type === "genres") {
                const links = (data[i] ?? []) as { id: string; label: string; url: string }[];
                return (
                  <div key={b.id}>
                    <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70">{str(bs.heading)}</h2>
                    <ul className="space-y-2.5">
                      {links.map((m) => (
                        <li key={m.id}>
                          <SmartLink href={m.url} className={linkCls}>
                            {m.label}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              if (b.type === "contact") {
                return (
                  <div key={b.id}>
                    <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70">{str(bs.heading, "Contact")}</h2>
                    <ul className="space-y-3 opacity-85">
                      {address ? (
                        <li className="flex gap-2.5">
                          <MapPin className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
                          <span>{address}</span>
                        </li>
                      ) : null}
                      {store.phone ? (
                        <li className="flex gap-2.5">
                          <Phone className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
                          <a href={`tel:${store.phone}`} className={linkCls}>
                            {store.phone}
                          </a>
                        </li>
                      ) : null}
                      {store.email ? (
                        <li className="flex gap-2.5">
                          <Mail className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
                          <a href={`mailto:${store.email}`} className={cn(linkCls, "[overflow-wrap:anywhere]")}>
                            {store.email}
                          </a>
                        </li>
                      ) : null}
                      {str(bs.hours) ? <li className="font-heading italic opacity-80">{str(bs.hours)}</li> : null}
                      <li>
                        <Link href={context.url("/track-order")} className="font-medium underline underline-offset-4">
                          Track your order
                        </Link>
                      </li>
                    </ul>
                  </div>
                );
              }
              if (b.type === "text") {
                return (
                  <div key={b.id}>
                    <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70">{str(bs.heading)}</h2>
                    <RichText html={str(bs.text)} className="opacity-75" />
                  </div>
                );
              }
              return null;
            })}
            {!blocks.length ? <p className="font-heading text-2xl">{store.name}</p> : null}
          </div>
        </Container>

        <div className="border-t border-pai-border">
          <Container className="flex flex-col items-center gap-4 py-6 text-xs md:flex-row md:justify-between">
            <div className="flex flex-col items-center gap-1 text-center md:items-start md:text-left">
              <p className="opacity-75">{copyright}</p>
              {str(s.colophon) ? <p className="font-heading italic opacity-55">{str(s.colophon)}</p> : null}
            </div>
            {store.showBranding ? (
              <a href="https://paicommerce.com?utm_source=storefront&utm_medium=footer" target="_blank" rel="noopener" className="opacity-60 transition hover:opacity-100">
                Powered by <span className="font-semibold">PaiCommerce</span>
              </a>
            ) : null}
            {bool(s.show_payment_icons, true) ? <PaymentIcons methods={methods} /> : null}
          </Container>
        </div>
      </footer>
    );
  },
});
