/**
 * Bloom footer: a floating pastel "club" card with the newsletter, soft link columns and an
 * oversized italic wordmark of the store name.
 */
import { defineSection } from "@pai/theme-sdk";
import { Container, Icon, PaymentIcons, RichText, SmartLink, SocialLinks, bool, cn, loadMenu, schemeClass, schemeField, str } from "@pai/theme-kit";
import { NewsletterForm } from "@pai/theme-kit/client";
import { Accent } from "./_bloom";

export const bloomFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Newsletter club card, link columns and an oversized wordmark.",
    settings: [
      { type: "checkbox", id: "show_wordmark", label: "Show oversized store name", default: true },
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "cod, bkash, nagad, visa, mastercard", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Use {year} and {store}. Defaults to “© {year} {store}”." },
      schemeField("muted"),
    ],
    blocks: [
      {
        type: "newsletter",
        name: "Newsletter club",
        limit: 1,
        settings: [
          { type: "text", id: "eyebrow", label: "Eyebrow", default: "The Bloom Club" },
          { type: "text", id: "heading", label: "Heading", default: "Glow notes, *first*", info: "Wrap a word in *asterisks* for the italic accent." },
          { type: "textarea", id: "text", label: "Text", default: "Routines from our skin experts, early access to launches and 10% off your first order." },
          { type: "text", id: "button_label", label: "Button label", default: "Join the club" },
          { type: "image", id: "image", label: "Image", info: "Optional — shown on the right of the card." },
        ],
      },
      {
        type: "brand",
        name: "Brand & about",
        limit: 1,
        settings: [
          { type: "image", id: "logo", label: "Logo", info: "Defaults to the store name." },
          { type: "textarea", id: "text", label: "Text", default: "" },
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
          { type: "text", id: "heading", label: "Heading", default: "Our promise" },
          { type: "richtext", id: "text", label: "Text", default: "<p>Every product is 100% authentic, sourced directly from brands and stored away from heat.</p>" },
        ],
      },
      {
        type: "contact",
        name: "Contact info",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Talk to us" },
          { type: "text", id: "hours", label: "Hours", default: "Every day, 10am – 9pm" },
        ],
      },
    ],
    presets: [
      {
        name: "Footer",
        blocks: [{ type: "newsletter" }, { type: "brand" }, { type: "link_list", settings: { heading: "Shop", menu: "main" } }, { type: "link_list", settings: { heading: "Help", menu: "footer" } }, { type: "contact" }],
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
    const club = blocks.find((b) => b.type === "newsletter");
    const columns = blocks.map((b, i) => ({ b, menu: menus[i] })).filter(({ b }) => b.type !== "newsletter");
    const colCount = columns.length;

    return (
      <footer className={cn("bloom-footer relative isolate overflow-hidden pt-16 text-[0.92rem]", schemeClass(s.color_scheme))}>
        <Container>
          {club ? (
            <div className="relative mb-16 grid overflow-hidden rounded-[calc(var(--pai-radius)*1.6)] bg-pai-card shadow-[0_30px_60px_-40px_rgb(var(--pai-fg-rgb)/0.45)] md:grid-cols-[1.2fr_1fr]">
              <div className="p-8 md:p-12">
                {str(club.settings.eyebrow) ? <p className="pai-eyebrow mb-3 text-pai-accent">{str(club.settings.eyebrow)}</p> : null}
                <h2 className="pai-h2">
                  <Accent text={str(club.settings.heading)} />
                </h2>
                {str(club.settings.text) ? <p className="mt-3 max-w-md opacity-75">{str(club.settings.text)}</p> : null}
                <NewsletterForm buttonLabel={str(club.settings.button_label, "Join")} className="mt-6 max-w-md" />
                <p className="mt-3 text-xs opacity-55">No spam, ever. Unsubscribe in one click.</p>
              </div>
              {str(club.settings.image) ? (
                <div className="relative hidden min-h-64 md:block">
                  <img src={str(club.settings.image)} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                </div>
              ) : (
                <div aria-hidden className="relative hidden items-center justify-center overflow-hidden bg-pai-accent/15 md:flex">
                  <span className="absolute size-72 rounded-full bg-pai-accent/25 blur-2xl" />
                  <Icon name="sparkles" className="relative size-16 text-pai-accent" strokeWidth={1.2} />
                </div>
              )}
            </div>
          ) : null}

          <div className={cn("grid gap-10 pb-12 sm:grid-cols-2", colCount >= 4 ? "lg:grid-cols-[1.5fr_repeat(3,1fr)]" : colCount === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
            {columns.map(({ b, menu }) => {
              const bs = b.settings;
              const h = (t: string) => <h2 className="mb-4 font-heading text-lg">{t}</h2>;
              if (b.type === "brand") {
                return (
                  <div key={b.id} className="space-y-4">
                    {str(bs.logo) ? <img src={str(bs.logo)} alt={store.name} className="h-10 w-auto object-contain" loading="lazy" /> : <p className="font-heading text-2xl italic">{store.name}</p>}
                    <p className="max-w-sm opacity-75">{str(bs.text) || store.description || "Skincare and beauty you can trust — authentic, gentle and delivered with care."}</p>
                    {bool(s.show_social, true) ? <SocialLinks context={context} iconClassName="bg-pai-bg border-0 shadow-sm" /> : null}
                  </div>
                );
              }
              if (b.type === "link_list") {
                return (
                  <div key={b.id}>
                    {h(str(bs.heading))}
                    <ul className="space-y-2.5">
                      {(menu ?? []).map((m) => (
                        <li key={m.id}>
                          <SmartLink href={m.url} className="bloom-footer-link opacity-75 transition hover:opacity-100">
                            {m.label}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              if (b.type === "text") {
                return (
                  <div key={b.id}>
                    {h(str(bs.heading))}
                    <RichText html={str(bs.text)} className="opacity-75" />
                  </div>
                );
              }
              if (b.type === "contact") {
                return (
                  <div key={b.id}>
                    {h(str(bs.heading, "Talk to us"))}
                    <ul className="space-y-3 opacity-80">
                      {store.phone ? (
                        <li className="flex gap-2.5">
                          <Icon name="phone" className="mt-0.5 size-4 shrink-0" />
                          <a href={`tel:${store.phone}`} className="hover:underline">{store.phone}</a>
                        </li>
                      ) : null}
                      {store.email ? (
                        <li className="flex gap-2.5">
                          <Icon name="mail" className="mt-0.5 size-4 shrink-0" />
                          <a href={`mailto:${store.email}`} className="break-all hover:underline">{store.email}</a>
                        </li>
                      ) : null}
                      {str(bs.hours) ? (
                        <li className="flex gap-2.5">
                          <Icon name="clock" className="mt-0.5 size-4 shrink-0" />
                          <span>{str(bs.hours)}</span>
                        </li>
                      ) : null}
                      <li>
                        <SmartLink href={context.url("/track-order")} className="font-medium underline underline-offset-4">
                          Track your order
                        </SmartLink>
                      </li>
                    </ul>
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
        {bool(s.show_wordmark, true) ? (
          <p
            aria-hidden
            className="bloom-wordmark pointer-events-none select-none overflow-hidden whitespace-nowrap text-center font-heading italic leading-[0.8] text-pai-accent/20"
            style={{ fontSize: `min(15rem, ${Math.max(6, Math.round(150 / Math.max(4, store.name.length)))}vw)` }}
          >
            {store.name}
          </p>
        ) : null}
      </footer>
    );
  },
});
