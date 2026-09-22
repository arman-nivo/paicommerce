/**
 * Artisan footer: a stitched "Made by hand in Bangladesh" divider, a postcard-style newsletter
 * ("Letters from the workshop") with a stamp and postmark, the brand story with a fair-trade
 * impact note, link columns, workshop contact and a hand-signed sign-off.
 */
import { defineSection } from "@pai/theme-sdk";
import { Container, Icon, PaymentIcons, RichText, SmartLink, SocialLinks, bool, cn, loadMenu, schemeClass, schemeField, str } from "@pai/theme-kit";
import { NewsletterForm } from "@pai/theme-kit/client";
import { Accent, StitchDivider } from "./_artisan";

export const artisanFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Earthy footer with a stitched story line, postcard newsletter, impact note and link columns.",
    settings: [
      { type: "text", id: "story_line", label: "Stitched story line", default: "Made by hand in Bangladesh", info: "Handwritten, between two running stitches at the top. Leave empty to hide." },
      { type: "text", id: "signoff", label: "Hand-signed sign-off", default: "with love from the workshop", info: "Handwritten line at the bottom." },
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "cod, bkash, nagad, visa, mastercard", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Use {year} and {store}. Defaults to “© {year} {store}”." },
      schemeField("primary"),
    ],
    blocks: [
      {
        type: "newsletter",
        name: "Postcard newsletter",
        limit: 1,
        settings: [
          { type: "text", id: "eyebrow", label: "Eyebrow", default: "Letters from the workshop" },
          { type: "text", id: "heading", label: "Heading", default: "News from the *loom & kiln*", info: "Wrap words in *asterisks* for the handwritten accent." },
          { type: "textarea", id: "text", label: "Text", default: "A slow monthly letter: new pieces before they're listed, maker stories and the occasional workshop invitation." },
          { type: "text", id: "button_label", label: "Button label", default: "Send me letters" },
          { type: "image", id: "stamp_image", label: "Stamp image", info: "Optional — a small square photo shown as the postage stamp." },
          { type: "text", id: "postmark", label: "Postmark text", default: "Dhaka · GPO" },
        ],
      },
      {
        type: "brand",
        name: "Brand & impact",
        limit: 1,
        settings: [
          { type: "image", id: "logo", label: "Logo", info: "Defaults to the store name." },
          { type: "textarea", id: "text", label: "Story", default: "" },
          { type: "text", id: "impact", label: "Impact note", default: "62% of every sale is paid directly to the maker", info: "Shown with a fair-trade seal. Leave empty to hide." },
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
          { type: "richtext", id: "text", label: "Text", default: "<p>Fair, transparent pay for every maker, natural materials wherever we can, and packaging you can compost.</p>" },
        ],
      },
      {
        type: "contact",
        name: "Visit / contact",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Visit the workshop" },
          { type: "textarea", id: "address", label: "Address", default: "House 12, Road 4, Dhanmondi, Dhaka" },
          { type: "text", id: "hours", label: "Hours", default: "Sat – Thu, 10am – 7pm" },
        ],
      },
    ],
    maxBlocks: 7,
    presets: [
      {
        name: "Footer",
        blocks: [
          { type: "newsletter" },
          { type: "brand" },
          { type: "link_list", settings: { heading: "Shop", menu: "main" } },
          { type: "link_list", settings: { heading: "Help", menu: "footer" } },
          { type: "contact" },
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
    const letter = blocks.find((b) => b.type === "newsletter");
    const columns = blocks.map((b, i) => ({ b, menu: menus[i] })).filter(({ b }) => b.type !== "newsletter");
    const colCount = columns.length;

    return (
      <footer className={cn("artisan-footer artisan-paper relative isolate overflow-hidden pt-14 text-[0.92rem]", schemeClass(s.color_scheme))}>
        <Container>
          {str(s.story_line) ? <StitchDivider label={str(s.story_line)} className="mb-12 [&_.artisan-hand]:text-3xl" /> : null}

          {letter ? (
            <div className="artisan-postcard relative mb-16 grid gap-8 p-6 sm:p-10 md:grid-cols-[1.4fr_auto_1fr] md:gap-10">
              <div>
                {str(letter.settings.eyebrow) ? <p className="pai-eyebrow mb-3 text-pai-accent">{str(letter.settings.eyebrow)}</p> : null}
                <h2 className="pai-h2">
                  <Accent text={str(letter.settings.heading)} />
                </h2>
                {str(letter.settings.text) ? <p className="mt-3 max-w-md opacity-80">{str(letter.settings.text)}</p> : null}
              </div>
              <span aria-hidden className="artisan-postcard-rule hidden md:block" />
              <div className="relative flex flex-col justify-end">
                <div aria-hidden className="absolute right-0 top-0 hidden items-start gap-3 sm:flex">
                  <span className="artisan-postmark grid size-20 place-items-center rounded-full text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.14em]">
                    {str(letter.settings.postmark, "Dhaka · GPO")}
                    <br />
                    {year}
                  </span>
                  <span className="artisan-stamp block size-[4.6rem] overflow-hidden">
                    {str(letter.settings.stamp_image) ? (
                      <img src={str(letter.settings.stamp_image)} alt="" loading="lazy" className="size-full object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center bg-pai-accent/80 text-pai-bg">
                        <Icon name="scissors" className="size-7" strokeWidth={1.4} />
                      </span>
                    )}
                  </span>
                </div>
                <div className="sm:pt-24">
                  <NewsletterForm buttonLabel={str(letter.settings.button_label, "Subscribe")} placeholder="Your email address" className="artisan-letter-form" />
                  <p className="mt-3 text-xs opacity-60">One letter a month. Unsubscribe any time.</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className={cn("grid gap-10 pb-12 sm:grid-cols-2", colCount >= 4 ? "lg:grid-cols-[1.6fr_repeat(3,1fr)]" : colCount === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
            {columns.map(({ b, menu }) => {
              const bs = b.settings;
              const h = (t: string) => <h2 className="mb-4 font-heading text-lg tracking-wide">{t}</h2>;
              if (b.type === "brand") {
                return (
                  <div key={b.id} className="space-y-5">
                    {str(bs.logo) ? <img src={str(bs.logo)} alt={store.name} className="h-10 w-auto object-contain" loading="lazy" /> : <p className="font-heading text-3xl">{store.name}</p>}
                    <p className="max-w-sm leading-relaxed opacity-80">{str(bs.text) || store.description || "Handmade homeware, textiles and art from Bangladesh's craft villages — made slowly, paid fairly."}</p>
                    {str(bs.impact) ? (
                      <p className="artisan-impact flex max-w-sm items-center gap-3 p-3 text-sm">
                        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full border border-dashed border-current">
                          <Icon name="heart" className="size-4" />
                        </span>
                        <span>{str(bs.impact)}</span>
                      </p>
                    ) : null}
                    {bool(s.show_social, true) ? <SocialLinks context={context} iconClassName="border-current/30" /> : null}
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
                          <SmartLink href={m.url} className="artisan-footer-link opacity-80 transition hover:opacity-100">
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
                    <RichText html={str(bs.text)} className="opacity-80" />
                  </div>
                );
              }
              if (b.type === "contact") {
                return (
                  <div key={b.id}>
                    {h(str(bs.heading, "Visit the workshop"))}
                    <ul className="space-y-3 opacity-85">
                      {str(bs.address) ? (
                        <li className="flex gap-2.5">
                          <Icon name="map-pin" className="mt-0.5 size-4 shrink-0" />
                          <span className="whitespace-pre-line">{str(bs.address)}</span>
                        </li>
                      ) : null}
                      {str(bs.hours) ? (
                        <li className="flex gap-2.5">
                          <Icon name="clock" className="mt-0.5 size-4 shrink-0" />
                          <span>{str(bs.hours)}</span>
                        </li>
                      ) : null}
                      {store.phone ? (
                        <li className="flex gap-2.5">
                          <Icon name="phone" className="mt-0.5 size-4 shrink-0" />
                          <a href={`tel:${store.phone}`} className="hover:underline">
                            {store.phone}
                          </a>
                        </li>
                      ) : null}
                      {store.email ? (
                        <li className="flex gap-2.5">
                          <Icon name="mail" className="mt-0.5 size-4 shrink-0" />
                          <a href={`mailto:${store.email}`} className="break-all hover:underline">
                            {store.email}
                          </a>
                        </li>
                      ) : null}
                      <li>
                        <SmartLink href={context.url("/track-order")} className="font-medium underline decoration-dashed underline-offset-4">
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

          {str(s.signoff) ? <p className="artisan-hand pb-4 text-center text-2xl text-pai-accent">{str(s.signoff)}</p> : null}
          <div className="artisan-footer-base flex flex-col items-center justify-between gap-4 py-6 text-xs md:flex-row">
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
