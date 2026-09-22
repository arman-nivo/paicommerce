import { defineSection, type StorefrontContext } from "@pai/theme-sdk";
import { Container, Icon, ICON_OPTIONS, PaymentIcons, SmartLink, SocialLinks, bool, cn, loadMenu, resolveHref, str } from "@pai/theme-kit";
import { Mail, MapPin, Phone, Smartphone } from "lucide-react";

/** Parse "Label | /url" lines (manual link columns). */
function parseLinks(context: StorefrontContext, raw: unknown): { label: string; href: string }[] {
  return str(raw)
    .split("\n")
    .map((line) => line.split("|").map((x) => x.trim()))
    .filter(([label, href]) => label && href)
    .map(([label, href]) => ({ label: label!, href: resolveHref(context, href) }));
}

const colHeading = "mb-3 text-[0.8rem] font-bold uppercase tracking-wider";

export const bazaarFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Dense marketplace footer: service promises, link columns, app buttons, payment methods, trust badges and social links.",
    settings: [
      { type: "textarea", id: "about", label: "About text", default: "Bangladesh's everyday marketplace — genuine products, cash on delivery and doorstep delivery in all 64 districts." },
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "header", label: "Trust badges" },
      { type: "text", id: "badge_1", label: "Badge 1", default: "100% genuine products" },
      { type: "text", id: "badge_2", label: "Badge 2", default: "Verified sellers" },
      { type: "text", id: "badge_3", label: "Badge 3", default: "Secure payments" },
      { type: "text", id: "badge_4", label: "Badge 4", default: "7-day easy returns" },
      { type: "header", label: "Bottom bar" },
      { type: "text", id: "bottom_note", label: "Note", default: "Delivering to all 64 districts of Bangladesh" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Defaults to “© {year} {store}”. Use {year} and {store}." },
    ],
    blocks: [
      {
        type: "promise",
        name: "Service promise",
        limit: 6,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "truck", options: ICON_OPTIONS },
          { type: "text", id: "title", label: "Title", default: "Nationwide delivery" },
          { type: "text", id: "text", label: "Text", default: "All 64 districts" },
        ],
      },
      {
        type: "link_list",
        name: "Menu column",
        limit: 4,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Customer care" },
          { type: "menu", id: "menu", label: "Menu", default: "footer" },
        ],
      },
      {
        type: "links",
        name: "Custom links column",
        limit: 3,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Make money with us" },
          { type: "textarea", id: "links", label: "Links", default: "Sell on our marketplace | /pages/contact\nBecome an affiliate | /pages/contact\nDelivery partner | /pages/contact", info: "One per line: Label | /url" },
        ],
      },
      { type: "contact", name: "Contact info", limit: 1, settings: [{ type: "text", id: "heading", label: "Heading", default: "Contact us" }] },
      {
        type: "app",
        name: "App download",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Shop on the go" },
          { type: "text", id: "text", label: "Text", default: "App-only coupons & live order tracking." },
          { type: "text", id: "ios_label", label: "Button 1 label", default: "App Store" },
          { type: "url", id: "ios_link", label: "Button 1 link" },
          { type: "text", id: "android_label", label: "Button 2 label", default: "Google Play" },
          { type: "url", id: "android_link", label: "Button 2 link" },
        ],
      },
      {
        type: "payments",
        name: "Payment methods",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Pay with" },
          { type: "text", id: "methods", label: "Methods", default: "cod, bkash, nagad, rocket, visa, mastercard, amex", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
        ],
      },
    ],
    maxBlocks: 16,
    presets: [
      {
        name: "Footer",
        blocks: [
          { type: "promise" },
          { type: "promise", settings: { icon: "banknote", title: "Cash on delivery", text: "Pay when it arrives" } },
          { type: "promise", settings: { icon: "rotate-ccw", title: "Easy returns", text: "7-day return policy" } },
          { type: "promise", settings: { icon: "shield-check", title: "100% genuine", text: "Or your money back" } },
          { type: "link_list", settings: { heading: "Customer care", menu: "footer" } },
          { type: "link_list", settings: { heading: "Shop", menu: "main" } },
          { type: "links" },
          { type: "contact" },
          { type: "app" },
          { type: "payments" },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const store = context.store;
    const promises = blocks.filter((b) => b.type === "promise");
    const columns = blocks.filter((b) => b.type === "link_list" || b.type === "links" || b.type === "contact");
    const app = blocks.find((b) => b.type === "app");
    const payments = blocks.find((b) => b.type === "payments");
    const menus = await Promise.all(columns.map((b) => (b.type === "link_list" ? loadMenu(context, str(b.settings.menu, "footer"), "footer") : Promise.resolve(null))));
    const year = new Date().getFullYear();
    const copyright = str(s.copyright, `© ${year} ${store.name}. All rights reserved.`).replace("{year}", String(year)).replace("{store}", store.name);
    const methods = str(payments?.settings.methods, "cod, bkash, nagad, visa, mastercard")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
    const badges = [s.badge_1, s.badge_2, s.badge_3, s.badge_4].map((b) => str(b)).filter(Boolean);
    const appButtons = app
      ? [
          { label: str(app.settings.ios_label), href: resolveHref(context, app.settings.ios_link) || context.url("/pages/contact"), sub: "Download on the" },
          { label: str(app.settings.android_label), href: resolveHref(context, app.settings.android_link) || context.url("/pages/contact"), sub: "Get it on" },
        ].filter((b) => b.label)
      : [];

    return (
      <footer className="bz-footer mt-8 text-[0.85rem]">
        {promises.length ? (
          <div className="bz-promises border-y border-pai-border bg-pai-card">
            <Container>
              <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-3 py-4 md:py-5", promises.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3", promises.length >= 5 && "xl:grid-cols-5")}>
                {promises.map((b) => (
                  <li key={b.id} className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-pai-primary/10 text-pai-primary">
                      <Icon name={str(b.settings.icon, "truck")} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.85rem] font-semibold leading-tight">{str(b.settings.title)}</span>
                      <span className="block text-xs opacity-60">{str(b.settings.text)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Container>
          </div>
        ) : null}

        <div className="bz-footer-main">
          <Container>
            <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:gap-6">
              <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="h-9 w-auto object-contain" loading="lazy" /> : <p className="font-heading text-2xl font-bold">{store.name}</p>}
                <p className="max-w-xs opacity-70">{str(s.about) || store.description}</p>
                {app && appButtons.length ? (
                  <div>
                    <p className={colHeading}>{str(app.settings.heading, "Shop on the go")}</p>
                    {str(app.settings.text) ? <p className="-mt-1.5 mb-3 text-xs opacity-65">{str(app.settings.text)}</p> : null}
                    <div className="flex flex-wrap gap-2">
                      {appButtons.map((b) => (
                        <SmartLink key={b.label} href={b.href} className="bz-appbtn inline-flex items-center gap-2 rounded-pai px-3 py-1.5" ariaLabel={`${b.sub} ${b.label}`}>
                          <Smartphone className="size-5" aria-hidden />
                          <span className="leading-tight">
                            <span className="block text-[9px] uppercase tracking-wider opacity-70">{b.sub}</span>
                            <span className="block text-[0.8rem] font-semibold">{b.label}</span>
                          </span>
                        </SmartLink>
                      ))}
                    </div>
                  </div>
                ) : null}
                {bool(s.show_social, true) ? <SocialLinks context={context} className="bz-social" /> : null}
              </div>

              {columns.map((b, i) => {
                const bs = b.settings;
                if (b.type === "link_list" || b.type === "links") {
                  const links = b.type === "link_list" ? (menus[i] ?? []).map((m) => ({ label: m.label, href: m.url })) : parseLinks(context, bs.links);
                  return (
                    <div key={b.id}>
                      <h2 className={colHeading}>{str(bs.heading)}</h2>
                      <ul className="space-y-2">
                        {links.map((l) => (
                          <li key={l.label + l.href}>
                            <SmartLink href={l.href} className="opacity-75 transition hover:text-pai-primary hover:opacity-100">
                              {l.label}
                            </SmartLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return (
                  <div key={b.id}>
                    <h2 className={colHeading}>{str(bs.heading, "Contact us")}</h2>
                    <ul className="space-y-2.5 opacity-85">
                      {store.phone ? (
                        <li className="flex gap-2">
                          <Phone className="mt-0.5 size-4 shrink-0 text-pai-primary" aria-hidden />
                          <a href={`tel:${store.phone}`} className="tabular-nums hover:underline">
                            {store.phone}
                          </a>
                        </li>
                      ) : null}
                      {store.email ? (
                        <li className="flex gap-2">
                          <Mail className="mt-0.5 size-4 shrink-0 text-pai-primary" aria-hidden />
                          <a href={`mailto:${store.email}`} className="break-all hover:underline">
                            {store.email}
                          </a>
                        </li>
                      ) : null}
                      {store.address ? (
                        <li className="flex gap-2">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-pai-primary" aria-hidden />
                          <span>{store.address}</span>
                        </li>
                      ) : null}
                      <li>
                        <SmartLink href={context.url("/track-order")} className="font-semibold text-pai-primary hover:underline">
                          Track your order →
                        </SmartLink>
                      </li>
                    </ul>
                  </div>
                );
              })}
            </div>

            {payments || badges.length ? (
              <div className="grid gap-5 border-t border-white/10 py-6 md:grid-cols-2 md:items-center">
                {payments ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[0.8rem] font-bold uppercase tracking-wider">{str(payments.settings.heading, "Pay with")}</p>
                    <PaymentIcons methods={methods} className="bz-payments" />
                  </div>
                ) : (
                  <span />
                )}
                {badges.length ? (
                  <ul className="flex flex-wrap gap-2 md:justify-end">
                    {badges.map((b, i) => (
                      <li key={b} className="bz-badge-trust inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                        <Icon name={["badge-check", "store", "lock", "rotate-ccw"][i] ?? "badge-check"} className="size-3.5 text-pai-accent" />
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </Container>
        </div>

        <div className="bz-footer-bottom text-xs">
          <Container className="flex flex-col items-center justify-between gap-2 py-4 text-center md:flex-row md:text-left">
            <p className="opacity-70">{copyright}</p>
            {str(s.bottom_note) ? <p className="opacity-60">{str(s.bottom_note)}</p> : null}
            {store.showBranding ? (
              <a href="https://paicommerce.com?utm_source=storefront&utm_medium=footer" target="_blank" rel="noopener" className="opacity-60 transition hover:opacity-100">
                Powered by <span className="font-semibold">PaiCommerce</span>
              </a>
            ) : null}
          </Container>
        </div>
      </footer>
    );
  },
});
