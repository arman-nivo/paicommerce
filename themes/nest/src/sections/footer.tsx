/**
 * Nest footer: a delivery-and-assembly promise strip, a showroom "visit us" card with address,
 * opening hours and directions, link columns, a newsletter and a quiet bottom bar.
 */
import { defineSection } from "@pai/theme-sdk";
import { Container, Icon, PaymentIcons, RichText, SmartLink, SocialLinks, bool, cn, loadMenu, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { NewsletterForm } from "@pai/theme-kit/client";
import { IMG } from "../images";
import { NEST_ICON_OPTIONS } from "./_nest";

export const nestFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Promise strip, showroom card with hours, link columns, newsletter and payment icons.",
    settings: [
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "cod, bkash, nagad, visa, mastercard, amex", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Use {year} and {store}. Defaults to “© {year} {store}”." },
      schemeField("inverse"),
    ],
    blocks: [
      {
        type: "promise",
        name: "Promise",
        limit: 4,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "truck", options: NEST_ICON_OPTIONS },
          { type: "text", id: "title", label: "Title", default: "Free delivery in Dhaka" },
          { type: "text", id: "text", label: "Text", default: "On every order over ৳20,000" },
        ],
      },
      {
        type: "showroom",
        name: "Showroom / visit us",
        limit: 1,
        settings: [
          { type: "image", id: "image", label: "Image", default: IMG.livingGreen },
          { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Our showroom living room display" },
          { type: "text", id: "heading", label: "Heading", default: "Visit the showroom" },
          { type: "textarea", id: "address", label: "Address", default: "", info: "Defaults to the store address." },
          { type: "textarea", id: "hours", label: "Opening hours", default: "Sat – Thu · 10am – 9pm\nFriday · 3pm – 9pm" },
          { type: "text", id: "button_label", label: "Button label", default: "Get directions" },
          { type: "url", id: "button_link", label: "Button link", default: "/pages/contact" },
        ],
      },
      {
        type: "link_list",
        name: "Menu",
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Shop" },
          { type: "menu", id: "menu", label: "Menu", default: "footer" },
        ],
      },
      {
        type: "text",
        name: "Text",
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Made to last" },
          { type: "richtext", id: "text", label: "Text", default: "<p>Solid wood frames, kiln-dried timber and a 5-year warranty on every piece of furniture.</p>" },
        ],
      },
      {
        type: "newsletter",
        name: "Newsletter",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Letters from home" },
          { type: "textarea", id: "text", label: "Text", default: "New collections, styling notes and showroom events — once a month." },
          { type: "text", id: "button_label", label: "Button label", default: "Subscribe" },
        ],
      },
    ],
    maxBlocks: 12,
    presets: [
      {
        name: "Footer",
        blocks: [
          { type: "promise", settings: { icon: "truck", title: "Free delivery in Dhaka", text: "On orders over ৳20,000" } },
          { type: "promise", settings: { icon: "wrench", title: "White-glove assembly", text: "Set up in your room, packaging taken away" } },
          { type: "promise", settings: { icon: "credit-card", title: "0% EMI", text: "Up to 12 months on partner bank cards" } },
          { type: "promise", settings: { icon: "shield-check", title: "5-year warranty", text: "On frames and solid wood" } },
          { type: "showroom" },
          { type: "link_list", settings: { heading: "Shop", menu: "main" } },
          { type: "link_list", settings: { heading: "Help", menu: "footer" } },
          { type: "newsletter" },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const store = context.store;
    const menus = await Promise.all(blocks.map((b) => (b.type === "link_list" ? loadMenu(context, str(b.settings.menu, "footer"), "footer") : Promise.resolve(null))));
    const year = new Date().getFullYear();
    const copyright = str(s.copyright, "© {year} {store}. All rights reserved.").replace("{year}", String(year)).replace("{store}", store.name);
    const methods = str(s.payment_methods, "cod, bkash, nagad, visa, mastercard")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
    const promises = blocks.filter((b) => b.type === "promise");
    const showroom = blocks.find((b) => b.type === "showroom");
    const newsletter = blocks.find((b) => b.type === "newsletter");
    const columns = blocks.map((b, i) => ({ b, menu: menus[i] })).filter(({ b }) => b.type === "link_list" || b.type === "text");
    const h = (t: string) => <h2 className="mb-5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] opacity-60">{t}</h2>;

    return (
      <footer className={cn("nest-footer text-[0.92rem]", schemeClass(s.color_scheme))}>
        {promises.length ? (
          <div className="border-b border-current/15">
            <Container>
              <ul className={cn("grid grid-cols-2 divide-current/15 lg:divide-x", promises.length >= 4 ? "lg:grid-cols-4" : promises.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
                {promises.map((b) => (
                  <li key={b.id} className="flex items-start gap-4 py-8 lg:px-8 lg:first:pl-0">
                    <Icon name={str(b.settings.icon, "truck")} className="mt-0.5 size-6 shrink-0 opacity-80" strokeWidth={1.4} />
                    <div>
                      <p className="font-heading text-lg leading-tight">{str(b.settings.title)}</p>
                      {str(b.settings.text) ? <p className="mt-1 text-sm opacity-65">{str(b.settings.text)}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Container>
          </div>
        ) : null}

        <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,2fr)] lg:gap-20 lg:py-20">
          {showroom ? (
            <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              {str(showroom.settings.image) ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-pai bg-current/10 xl:aspect-auto">
                  <img src={str(showroom.settings.image)} alt={str(showroom.settings.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                </div>
              ) : null}
              <div>
                {h("Visit us")}
                <p className="font-heading text-2xl leading-tight">{str(showroom.settings.heading, "Visit the showroom")}</p>
                <address className="mt-4 whitespace-pre-line not-italic opacity-75">{str(showroom.settings.address) || store.address || store.name}</address>
                {str(showroom.settings.hours) ? (
                  <p className="mt-4 flex gap-2.5 opacity-75">
                    <Icon name="clock" className="mt-1 size-4 shrink-0" />
                    <span className="whitespace-pre-line">{str(showroom.settings.hours)}</span>
                  </p>
                ) : null}
                {store.phone ? (
                  <p className="mt-2 flex gap-2.5 opacity-75">
                    <Icon name="phone" className="mt-1 size-4 shrink-0" />
                    <a href={`tel:${store.phone}`} className="hover:underline">
                      {store.phone}
                    </a>
                  </p>
                ) : null}
                {str(showroom.settings.button_label) ? (
                  <SmartLink
                    href={resolveHref(context, showroom.settings.button_link, "/pages/contact")}
                    className="mt-6 inline-flex items-center gap-2 border-b border-current pb-1 text-sm font-semibold"
                  >
                    {str(showroom.settings.button_label)} <Icon name="arrow-up-right" className="size-4" />
                  </SmartLink>
                ) : null}
              </div>
            </div>
          ) : (
            <div>
              <p className="font-heading text-3xl">{store.name}</p>
              {store.description ? <p className="mt-3 max-w-sm opacity-70">{store.description}</p> : null}
            </div>
          )}

          <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-[repeat(2,minmax(0,0.8fr))_minmax(0,1.3fr)]">
            {columns.map(({ b, menu }) =>
              b.type === "link_list" ? (
                <div key={b.id}>
                  {h(str(b.settings.heading))}
                  <ul className="space-y-2.5">
                    {(menu ?? []).map((m) => (
                      <li key={m.id}>
                        <SmartLink href={m.url} className="nest-link opacity-80 transition hover:opacity-100">
                          {m.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div key={b.id}>
                  {h(str(b.settings.heading))}
                  <RichText html={str(b.settings.text)} className="opacity-75" />
                </div>
              ),
            )}
            {newsletter ? (
              <div className="sm:col-span-2 xl:col-span-1">
                {h("Newsletter")}
                <p className="font-heading text-2xl leading-tight">{str(newsletter.settings.heading)}</p>
                {str(newsletter.settings.text) ? <p className="mt-2 opacity-70">{str(newsletter.settings.text)}</p> : null}
                <NewsletterForm buttonLabel={str(newsletter.settings.button_label, "Subscribe")} className="nest-newsletter mt-5" />
                {bool(s.show_social, true) ? <SocialLinks context={context} className="mt-6" iconClassName="border-current/25" /> : null}
              </div>
            ) : bool(s.show_social, true) ? (
              <SocialLinks context={context} iconClassName="border-current/25" />
            ) : null}
          </div>
        </Container>

        <div className="border-t border-current/15">
          <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs md:flex-row">
            <p className="flex items-center gap-3">
              <span className="font-heading text-base">{store.name}</span>
              <span aria-hidden className="h-3 w-px bg-current opacity-30" />
              <span className="opacity-60">{copyright}</span>
            </p>
            {store.showBranding ? (
              <a href="https://paicommerce.com?utm_source=storefront&utm_medium=footer" target="_blank" rel="noopener" className="opacity-55 transition hover:opacity-100">
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
