/**
 * Lumière footer: ink-black (or ivory) with "The Lumière Letter" newsletter, a gold ornament, an
 * atelier column (address, hours, appointment, WhatsApp), link columns and a centred wordmark
 * between gold hairlines.
 */
import { defineSection } from "@pai/theme-sdk";
import { Container, Link, PaymentIcons, RichText, SmartLink, SocialLinks, bool, cn, loadMenu, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { NewsletterForm } from "@pai/theme-kit/client";
import { Ornament, whatsappHref } from "./_lumiere";

export const lumiereFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Newsletter letter, atelier details, link columns and a centred wordmark between gold rules.",
    settings: [
      { type: "checkbox", id: "show_wordmark", label: "Show centred wordmark", default: true },
      { type: "text", id: "wordmark_note", label: "Line under the wordmark", default: "Maison de haute joaillerie · Dhaka" },
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "bkash, nagad, visa, mastercard, amex, cod", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Use {year} and {store}. Defaults to “© {year} {store}”." },
      schemeField("inverse"),
    ],
    blocks: [
      {
        type: "newsletter",
        name: "The Letter (newsletter)",
        limit: 1,
        settings: [
          { type: "text", id: "eyebrow", label: "Eyebrow", default: "The Lumière Letter" },
          { type: "text", id: "heading", label: "Heading", default: "New collections, private previews" },
          { type: "textarea", id: "text", label: "Text", default: "A few letters a year — first sight of new pieces, invitations to atelier evenings and the stories behind the stones." },
          { type: "text", id: "button_label", label: "Button label", default: "Subscribe" },
        ],
      },
      {
        type: "atelier",
        name: "Visit the atelier",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Visit our atelier" },
          { type: "textarea", id: "address", label: "Address", info: "Defaults to your store address." },
          { type: "textarea", id: "hours", label: "Opening hours", default: "Saturday – Thursday, 11am – 8pm\nFriday by appointment" },
          { type: "text", id: "link_label", label: "Appointment link label", default: "Book a private appointment" },
          { type: "url", id: "link", label: "Appointment link", default: "/pages/contact" },
        ],
      },
      {
        type: "link_list",
        name: "Menu",
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "The Maison" },
          { type: "menu", id: "menu", label: "Menu", default: "footer" },
        ],
      },
      {
        type: "text",
        name: "Text",
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Our promise" },
          { type: "richtext", id: "text", label: "Text", default: "<p>Every piece is hallmarked, certified and delivered fully insured — with lifetime cleaning at our atelier.</p>" },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Footer",
        blocks: [{ type: "newsletter" }, { type: "atelier" }, { type: "link_list", settings: { heading: "Collections", menu: "main" } }, { type: "link_list", settings: { heading: "Client care", menu: "footer" } }, { type: "text" }],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const store = context.store;
    const menus = await Promise.all(blocks.map((b) => (b.type === "link_list" ? loadMenu(context, str(b.settings.menu, "footer"), "footer") : Promise.resolve(null))));
    const year = new Date().getFullYear();
    const copyright = str(s.copyright, "© {year} {store}. All rights reserved.").replace("{year}", String(year)).replace("{store}", store.name);
    const methods = str(s.payment_methods, "bkash, nagad, visa, mastercard, cod")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
    const letter = blocks.find((b) => b.type === "newsletter");
    const columns = blocks.map((b, i) => ({ b, menu: menus[i] })).filter(({ b }) => b.type !== "newsletter");
    const n = columns.length;
    const wa = str(context.theme.social_whatsapp) || store.phone || "";
    const h = (t: string) => <h2 className="mb-5 text-[0.66rem] font-medium uppercase tracking-[0.3em] text-[var(--lumiere-gold)]">{t}</h2>;

    return (
      <footer className={cn("lumiere-footer relative pt-20 text-[0.9rem] md:pt-24", schemeClass(s.color_scheme))}>
        <Container>
          {letter ? (
            <div className="mx-auto max-w-2xl text-center">
              {str(letter.settings.eyebrow) ? <p className="lumiere-eyebrow mb-5 text-[var(--lumiere-gold)]">{str(letter.settings.eyebrow)}</p> : null}
              {str(letter.settings.heading) ? <h2 className="pai-h2 lumiere-display-2">{str(letter.settings.heading)}</h2> : null}
              {str(letter.settings.text) ? <p className="mx-auto mt-4 max-w-lg leading-relaxed opacity-65">{str(letter.settings.text)}</p> : null}
              <NewsletterForm buttonLabel={str(letter.settings.button_label, "Subscribe")} className="lumiere-letter-form mx-auto mt-8 max-w-md" />
              <p className="mt-3 text-[0.7rem] opacity-45">We write rarely, and never share your address.</p>
            </div>
          ) : null}

          <Ornament className={letter ? "my-16 md:my-20" : "mb-16"} />

          <div className={cn("grid gap-12 pb-16 sm:grid-cols-2", n >= 4 ? "lg:grid-cols-[1.4fr_repeat(3,1fr)]" : n === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
            {columns.map(({ b, menu }) => {
              const bs = b.settings;
              if (b.type === "atelier") {
                const address = str(bs.address) || store.address || "";
                const hours = str(bs.hours)
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean);
                const href = resolveHref(context, bs.link, "/pages/contact");
                return (
                  <div key={b.id}>
                    {h(str(bs.heading, "Visit our atelier"))}
                    {address ? <address className="whitespace-pre-line font-heading text-xl not-italic leading-snug">{address}</address> : null}
                    {hours.length ? (
                      <ul className="mt-4 space-y-1 text-[0.85rem] opacity-65">
                        {hours.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    ) : null}
                    <ul className="mt-5 space-y-1.5 text-[0.85rem]">
                      {store.phone ? (
                        <li>
                          <a href={`tel:${store.phone}`} className="lumiere-footer-link opacity-80 hover:opacity-100">{store.phone}</a>
                        </li>
                      ) : null}
                      {wa ? (
                        <li>
                          <a href={whatsappHref(wa)} target="_blank" rel="noopener" className="lumiere-footer-link opacity-80 hover:opacity-100">
                            WhatsApp a jewellery adviser
                          </a>
                        </li>
                      ) : null}
                      {store.email ? (
                        <li>
                          <a href={`mailto:${store.email}`} className="lumiere-footer-link break-all opacity-80 hover:opacity-100">{store.email}</a>
                        </li>
                      ) : null}
                    </ul>
                    {str(bs.link_label) && href ? (
                      <SmartLink href={href} className="mt-6 inline-block border-b border-[var(--lumiere-gold)] pb-1 text-[0.66rem] uppercase tracking-[0.26em] transition hover:text-[var(--lumiere-gold)]">
                        {str(bs.link_label)}
                      </SmartLink>
                    ) : null}
                  </div>
                );
              }
              if (b.type === "link_list") {
                return (
                  <div key={b.id}>
                    {h(str(bs.heading))}
                    <ul className="space-y-3">
                      {(menu ?? []).map((m) => (
                        <li key={m.id}>
                          <SmartLink href={m.url} className="lumiere-footer-link opacity-75 transition hover:opacity-100">
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
                    <RichText html={str(bs.text)} className="leading-relaxed opacity-70" />
                  </div>
                );
              }
              return null;
            })}
          </div>

          {bool(s.show_wordmark, true) ? (
            <div className="flex flex-col items-center gap-4 border-t border-[var(--lumiere-rule)] py-12 text-center">
              <Link href={context.url("/")} className="font-heading text-3xl uppercase tracking-[0.4em] [margin-right:-0.4em] md:text-5xl">
                {store.name}
              </Link>
              {str(s.wordmark_note) ? <p className="text-[0.6rem] uppercase tracking-[0.36em] opacity-50">{str(s.wordmark_note)}</p> : null}
              {bool(s.show_social, true) ? <SocialLinks context={context} className="mt-2 justify-center" iconClassName="lumiere-social" /> : null}
            </div>
          ) : bool(s.show_social, true) ? (
            <SocialLinks context={context} className="justify-center pb-10" iconClassName="lumiere-social" />
          ) : null}

          <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--lumiere-rule)] py-6 text-[0.72rem] md:flex-row">
            <p className="opacity-55">{copyright}</p>
            {store.showBranding ? (
              <a href="https://paicommerce.com?utm_source=storefront&utm_medium=footer" target="_blank" rel="noopener" className="opacity-45 transition hover:opacity-100">
                Powered by PaiCommerce
              </a>
            ) : null}
            {bool(s.show_payment_icons, true) ? <PaymentIcons methods={methods} className="opacity-80" /> : null}
          </div>
        </Container>
      </footer>
    );
  },
});
