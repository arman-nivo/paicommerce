import { defineSection } from "@pai/theme-sdk";
import { Container, Icon, ICON_OPTIONS, PaymentIcons, SmartLink, SocialLinks, bool, cn, loadMenu, str } from "@pai/theme-kit";
import { NewsletterForm } from "@pai/theme-kit/client";
import { Mail, MapPin, Phone } from "lucide-react";

export const voltFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Newsletter band with glow, service promises, link columns, contact and payment methods.",
    settings: [
      { type: "header", label: "Newsletter band" },
      { type: "checkbox", id: "show_newsletter", label: "Show newsletter band", default: true },
      { type: "text", id: "newsletter_heading", label: "Heading", default: "Get drops before they sell out" },
      { type: "textarea", id: "newsletter_text", label: "Text", default: "Launch alerts, restocks and members-only flash deals. No spam — unsubscribe anytime." },
      { type: "header", label: "Bottom bar" },
      { type: "textarea", id: "about", label: "About text", default: "Genuine gadgets with official warranty, fast delivery across Bangladesh and cash on delivery." },
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "cod, bkash, nagad, visa, mastercard, amex", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Defaults to “© {year} {store}”." },
    ],
    blocks: [
      {
        type: "promise",
        name: "Service promise",
        limit: 5,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "shield-check", options: ICON_OPTIONS },
          { type: "text", id: "title", label: "Title", default: "Official warranty" },
          { type: "text", id: "text", label: "Text", default: "Brand-backed on every device" },
        ],
      },
      {
        type: "link_list",
        name: "Menu",
        limit: 4,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Shop" },
          { type: "menu", id: "menu", label: "Menu", default: "footer" },
        ],
      },
      { type: "contact", name: "Contact info", limit: 1, settings: [{ type: "text", id: "heading", label: "Heading", default: "Support" }] },
    ],
    presets: [
      {
        name: "Footer",
        blocks: [
          { type: "promise" },
          { type: "promise", settings: { icon: "truck", title: "Express delivery", text: "Same day inside Dhaka" } },
          { type: "link_list", settings: { heading: "Shop", menu: "main" } },
          { type: "link_list", settings: { heading: "Help", menu: "footer" } },
          { type: "contact" },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const store = context.store;
    const promises = blocks.filter((b) => b.type === "promise");
    const columns = blocks.filter((b) => b.type !== "promise");
    const menus = await Promise.all(columns.map((b) => (b.type === "link_list" ? loadMenu(context, str(b.settings.menu, "footer"), "footer") : Promise.resolve(null))));
    const year = new Date().getFullYear();
    const copyright = str(s.copyright, `© ${year} ${store.name}. All rights reserved.`).replace("{year}", String(year)).replace("{store}", store.name);
    const methods = str(s.payment_methods, "cod, bkash, nagad, visa, mastercard")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);

    return (
      <footer className="volt-footer relative mt-10 overflow-hidden border-t border-pai-border bg-[color-mix(in_srgb,var(--pai-bg)_70%,black)] text-[0.9rem]">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-pai-primary/10 blur-3xl" />
        {bool(s.show_newsletter, true) ? (
          <Container className="relative pt-14">
            <div className="grid items-center gap-6 rounded-[calc(var(--pai-radius)*1.5)] border border-pai-border bg-pai-muted/70 p-6 md:grid-cols-[1.2fr_1fr] md:p-10">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-pai-primary">Volt insider</p>
                <h2 className="pai-h3 mt-2">{str(s.newsletter_heading)}</h2>
                {str(s.newsletter_text) ? <p className="mt-2 max-w-md opacity-70">{str(s.newsletter_text)}</p> : null}
              </div>
              <NewsletterForm buttonLabel="Notify me" className="volt-newsletter" />
            </div>
          </Container>
        ) : null}

        {promises.length ? (
          <Container className="relative pt-10">
            <ul className={cn("grid gap-4 sm:grid-cols-2", promises.length >= 4 ? "lg:grid-cols-4" : promises.length === 3 ? "lg:grid-cols-3" : "")}>
              {promises.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-pai-border text-pai-primary">
                    <Icon name={str(b.settings.icon, "shield-check")} className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold">{str(b.settings.title)}</span>
                    <span className="block text-xs opacity-60">{str(b.settings.text)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        ) : null}

        <Container className="relative">
          <div className="grid gap-10 border-b border-pai-border py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
            <div className="space-y-4">
              {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="h-9 w-auto object-contain" loading="lazy" /> : <p className="font-heading text-2xl font-bold">{store.name}</p>}
              <p className="max-w-sm opacity-65">{str(s.about) || store.description}</p>
              {bool(s.show_social, true) ? <SocialLinks context={context} /> : null}
            </div>
            {columns.map((b, i) => {
              const bs = b.settings;
              if (b.type === "link_list") {
                return (
                  <div key={b.id}>
                    <h2 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] opacity-60">{str(bs.heading)}</h2>
                    <ul className="space-y-2.5">
                      {(menus[i] ?? []).map((m) => (
                        <li key={m.id}>
                          <SmartLink href={m.url} className="opacity-80 transition hover:text-pai-primary hover:opacity-100">
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
                    <h2 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] opacity-60">{str(bs.heading, "Support")}</h2>
                    <ul className="space-y-3 opacity-85">
                      {store.phone ? (
                        <li className="flex gap-2.5">
                          <Phone className="mt-0.5 size-4 shrink-0 text-pai-primary" aria-hidden />
                          <a href={`tel:${store.phone}`} className="font-mono hover:underline">{store.phone}</a>
                        </li>
                      ) : null}
                      {store.email ? (
                        <li className="flex gap-2.5">
                          <Mail className="mt-0.5 size-4 shrink-0 text-pai-primary" aria-hidden />
                          <a href={`mailto:${store.email}`} className="break-all hover:underline">{store.email}</a>
                        </li>
                      ) : null}
                      {store.address ? (
                        <li className="flex gap-2.5">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-pai-primary" aria-hidden />
                          <span>{store.address}</span>
                        </li>
                      ) : null}
                      <li>
                        <SmartLink href={context.url("/track-order")} className="font-semibold text-pai-primary underline-offset-4 hover:underline">
                          Track your order →
                        </SmartLink>
                      </li>
                    </ul>
                  </div>
                );
              }
              return null;
            })}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 py-6 text-xs md:flex-row">
            <p className="opacity-60">{copyright}</p>
            {store.showBranding ? (
              <a href="https://paicommerce.com?utm_source=storefront&utm_medium=footer" target="_blank" rel="noopener" className="opacity-50 transition hover:opacity-100">
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
