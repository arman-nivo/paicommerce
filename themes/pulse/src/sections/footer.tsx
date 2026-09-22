import { defineSection } from "@pai/theme-sdk";
import { Container, PaymentIcons, SmartLink, SocialLinks, bool, cn, loadMenu, schemeClass, schemeField, str } from "@pai/theme-kit";
import { NewsletterForm } from "@pai/theme-kit/client";
import { BadgeCheck, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { whatsappHref } from "../components/utils";

export const pulseFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Pharmacist help band, link columns, licence details, health-tips signup and a medical disclaimer.",
    settings: [
      { type: "header", label: "Help band" },
      { type: "checkbox", id: "show_help", label: "Show pharmacist help band", default: true },
      { type: "text", id: "help_heading", label: "Heading", default: "Not sure what you need? Ask a pharmacist." },
      { type: "text", id: "help_text", label: "Text", default: "Free advice 9am – 11pm, every day." },
      { type: "text", id: "whatsapp", label: "WhatsApp number", info: "Defaults to the theme WhatsApp setting, then your store phone." },
      { type: "header", label: "Licence & compliance" },
      { type: "textarea", id: "about", label: "About text", default: "Your neighbourhood pharmacy, online. Genuine medicines from licensed distributors, stored and dispensed to standard." },
      { type: "text", id: "licence", label: "Licence details", default: "", info: "E.g. “Drug licence no. … · Registered pharmacist on duty”. Shown under the about text." },
      { type: "textarea", id: "disclaimer", label: "Medical disclaimer", default: "Information on this website is for general guidance only and is not a substitute for professional medical advice. Prescription-only medicines are dispensed against a valid prescription from a registered physician. Always read the label and consult your doctor before starting any medication." },
      { type: "header", label: "Bottom bar" },
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "cod, bkash, nagad, visa, mastercard", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Defaults to “© {year} {store}”." },
      schemeField("inverse"),
    ],
    blocks: [
      {
        type: "link_list",
        name: "Menu",
        limit: 4,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Shop" },
          { type: "menu", id: "menu", label: "Menu", default: "footer" },
        ],
      },
      { type: "contact", name: "Contact info", limit: 1, settings: [{ type: "text", id: "heading", label: "Heading", default: "Contact" }] },
      {
        type: "newsletter",
        name: "Health tips signup",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Health tips & refill reminders" },
          { type: "textarea", id: "text", label: "Text", default: "Seasonal health advice and exclusive offers, twice a month." },
        ],
      },
    ],
    presets: [
      {
        name: "Footer",
        blocks: [{ type: "link_list", settings: { heading: "Shop", menu: "main" } }, { type: "link_list", settings: { heading: "Help", menu: "footer" } }, { type: "contact" }, { type: "newsletter" }],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const store = context.store;
    const menus = await Promise.all(blocks.map((b) => (b.type === "link_list" ? loadMenu(context, str(b.settings.menu, "footer"), "footer") : Promise.resolve(null))));
    const year = new Date().getFullYear();
    const copyright = str(s.copyright, `© ${year} ${store.name}. All rights reserved.`).replace("{year}", String(year)).replace("{store}", store.name);
    const methods = str(s.payment_methods, "cod, bkash, nagad, visa, mastercard")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
    const wa = whatsappHref(context, s.whatsapp, "Hello {store}, I'd like to ask a pharmacist.");
    const h2 = "mb-4 text-sm font-semibold";

    return (
      <footer className={cn("pulse-footer mt-12 text-[0.9rem]", schemeClass(s.color_scheme))}>
        {bool(s.show_help, true) ? (
          <div className="border-b border-pai-border">
            <Container className="flex flex-col items-start justify-between gap-4 py-8 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-pai-accent text-white">
                  <ShieldCheck className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="font-heading text-lg font-bold">{str(s.help_heading)}</p>
                  {str(s.help_text) ? <p className="text-sm opacity-70">{str(s.help_text)}</p> : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {store.phone ? (
                  <a href={`tel:${store.phone}`} className="pai-btn pai-btn-outline !border-current/30">
                    <Phone className="size-4" aria-hidden /> Call {store.phone}
                  </a>
                ) : null}
                {wa ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="pai-btn pai-btn-accent">
                    <MessageCircle className="size-4" aria-hidden /> Chat on WhatsApp
                  </a>
                ) : null}
              </div>
            </Container>
          </div>
        ) : null}
        <Container>
          <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" loading="lazy" /> : <p className="font-heading text-2xl font-bold">{store.name}</p>}
              <p className="max-w-sm opacity-75">{str(s.about) || store.description}</p>
              {str(s.licence) ? (
                <p className="flex items-start gap-2 text-xs opacity-80">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-pai-accent" aria-hidden />
                  {str(s.licence)}
                </p>
              ) : null}
              {bool(s.show_social, true) ? <SocialLinks context={context} /> : null}
            </div>
            {blocks.map((b, i) => {
              const bs = b.settings;
              if (b.type === "link_list") {
                return (
                  <div key={b.id}>
                    <h2 className={h2}>{str(bs.heading)}</h2>
                    <ul className="space-y-2.5">
                      {(menus[i] ?? []).map((m) => (
                        <li key={m.id}>
                          <SmartLink href={m.url} className="opacity-75 transition hover:opacity-100 hover:underline hover:underline-offset-4">
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
                    <h2 className={h2}>{str(bs.heading, "Contact")}</h2>
                    <ul className="space-y-3 opacity-80">
                      {store.phone ? (
                        <li className="flex gap-2.5">
                          <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
                          <a href={`tel:${store.phone}`} className="hover:underline">{store.phone}</a>
                        </li>
                      ) : null}
                      {store.email ? (
                        <li className="flex gap-2.5">
                          <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                          <a href={`mailto:${store.email}`} className="break-all hover:underline">{store.email}</a>
                        </li>
                      ) : null}
                      {store.address ? (
                        <li className="flex gap-2.5">
                          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                          <span>{store.address}</span>
                        </li>
                      ) : null}
                      <li>
                        <SmartLink href={context.url("/track-order")} className="font-semibold underline underline-offset-4">
                          Track your order
                        </SmartLink>
                      </li>
                    </ul>
                  </div>
                );
              }
              if (b.type === "newsletter") {
                return (
                  <div key={b.id} className="sm:col-span-2 lg:col-span-1">
                    <h2 className={h2}>{str(bs.heading)}</h2>
                    {str(bs.text) ? <p className="mb-4 opacity-75">{str(bs.text)}</p> : null}
                    <NewsletterForm buttonLabel="Subscribe" />
                  </div>
                );
              }
              return null;
            })}
          </div>
          {str(s.disclaimer) ? <p className="border-t border-pai-border py-6 text-xs leading-relaxed opacity-60">{str(s.disclaimer)}</p> : null}
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
