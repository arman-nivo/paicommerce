import { defineSection } from "@pai/theme-sdk";
import { Container, Icon, PaymentIcons, SmartLink, SocialLinks, bool, cn, loadMenu, schemeClass, schemeField, str } from "@pai/theme-kit";
import { NewsletterForm } from "@pai/theme-kit/client";
import { Mail, MapPin, Phone } from "lucide-react";
import { STRIDE_ICONS } from "../lib/icons";

/**
 * Stride footer: a "join the club" newsletter band with member perks, bold link columns and
 * contact, then a giant brand wordmark and the legal / payment bar.
 */
export const strideFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Join-the-club newsletter, bold link columns, giant brand wordmark, socials and payment icons.",
    settings: [
      { type: "header", label: "Join the club" },
      { type: "checkbox", id: "show_newsletter", label: "Show newsletter band", default: true },
      { type: "text", id: "newsletter_eyebrow", label: "Eyebrow", default: "Members get more" },
      { type: "text", id: "newsletter_heading", label: "Heading", default: "Join the club" },
      { type: "textarea", id: "newsletter_text", label: "Text", default: "Early access to drops, members-only prices and training plans from our coaches. No spam — ever." },
      { type: "text", id: "newsletter_button", label: "Button label", default: "Join now" },
      { type: "header", label: "Wordmark" },
      { type: "checkbox", id: "show_wordmark", label: "Show giant wordmark", default: true },
      { type: "text", id: "wordmark", label: "Wordmark text", info: "Defaults to your store name." },
      {
        type: "select",
        id: "wordmark_style",
        label: "Wordmark style",
        default: "solid",
        options: [
          { value: "solid", label: "Solid" },
          { value: "outline", label: "Outline" },
          { value: "accent", label: "Accent colour" },
        ],
      },
      { type: "header", label: "Bottom bar" },
      { type: "textarea", id: "about", label: "About text", default: "Performance gear for every sport — delivered across all 64 districts with cash on delivery." },
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "cod, bkash, nagad, visa, mastercard", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Defaults to “© {year} {store}”." },
      schemeField("inverse"),
    ],
    blocks: [
      {
        type: "perk",
        name: "Member perk",
        limit: 4,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "zap", options: STRIDE_ICONS },
          { type: "text", id: "text", label: "Text", default: "Early access to every drop" },
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
      { type: "contact", name: "Contact info", limit: 1, settings: [{ type: "text", id: "heading", label: "Heading", default: "Get in touch" }] },
    ],
    presets: [
      {
        name: "Footer",
        blocks: [
          { type: "perk", settings: { icon: "zap", text: "Early access to every drop" } },
          { type: "perk", settings: { icon: "percent", text: "Members-only prices" } },
          { type: "perk", settings: { icon: "trophy", text: "Free training plans" } },
          { type: "link_list", settings: { heading: "Shop", menu: "main" } },
          { type: "link_list", settings: { heading: "Help", menu: "footer" } },
          { type: "contact" },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const store = context.store;
    const perks = blocks.filter((b) => b.type === "perk" && str(b.settings.text));
    const columns = blocks.filter((b) => b.type === "link_list" || b.type === "contact");
    const menus = await Promise.all(columns.map((b) => (b.type === "link_list" ? loadMenu(context, str(b.settings.menu, "footer"), "footer") : Promise.resolve(null))));
    const year = new Date().getFullYear();
    const copyright = str(s.copyright, `© ${year} ${store.name}. All rights reserved.`).replace("{year}", String(year)).replace("{store}", store.name);
    const methods = str(s.payment_methods, "cod, bkash, nagad, visa, mastercard")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
    const wordmark = str(s.wordmark) || store.name;
    const wmStyle = str(s.wordmark_style, "solid");
    const h = "mb-5 font-body text-[11px] font-bold uppercase tracking-[0.22em] opacity-50";

    return (
      <footer className={cn("stride-footer overflow-hidden text-[0.92rem]", schemeClass(s.color_scheme))}>
        {bool(s.show_newsletter, true) ? (
          <div id="join-the-club" className="scroll-mt-24 border-b border-pai-border">
            <Container width="wide" className="grid gap-10 py-14 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-end">
              <div>
                {str(s.newsletter_eyebrow) ? (
                  <p className="stride-kicker mb-4">
                    <span aria-hidden className="stride-kicker-dot" />
                    {str(s.newsletter_eyebrow)}
                  </p>
                ) : null}
                <h2 className="stride-display text-[clamp(3.25rem,8vw,7rem)]">{str(s.newsletter_heading, "Join the club")}</h2>
                {perks.length ? (
                  <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                    {perks.map((b) => (
                      <li key={b.id} className="flex items-center gap-2 text-sm font-semibold">
                        <Icon name={str(b.settings.icon, "zap")} className="size-4 text-pai-accent" />
                        {str(b.settings.text)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div>
                {str(s.newsletter_text) ? <p className="mb-5 max-w-md opacity-70">{str(s.newsletter_text)}</p> : null}
                <NewsletterForm buttonLabel={str(s.newsletter_button, "Join now")} placeholder="Your email address" className="stride-newsletter" successMessage="You're in. Watch your inbox for the next drop." />
              </div>
            </Container>
          </div>
        ) : null}

        <Container width="wide">
          <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div className="space-y-5">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-9 w-auto object-contain" loading="lazy" />
              ) : (
                <p className="font-heading text-3xl uppercase">{store.name}</p>
              )}
              <p className="max-w-sm opacity-65">{str(s.about) || store.description}</p>
              {bool(s.show_social, true) ? <SocialLinks context={context} className="stride-social" /> : null}
            </div>
            {columns.map((b, i) => {
              const bs = b.settings;
              if (b.type === "link_list") {
                return (
                  <div key={b.id}>
                    <h2 className={h}>{str(bs.heading)}</h2>
                    <ul className="space-y-2.5">
                      {(menus[i] ?? []).map((m) => (
                        <li key={m.id}>
                          <SmartLink href={m.url} className="stride-footer-link font-heading text-xl uppercase leading-tight tracking-wide transition hover:text-pai-accent">
                            {m.label}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              return (
                <div key={b.id}>
                  <h2 className={h}>{str(bs.heading, "Get in touch")}</h2>
                  <ul className="space-y-3 opacity-85">
                    {store.phone ? (
                      <li className="flex gap-2.5">
                        <Phone className="mt-0.5 size-4 shrink-0 text-pai-accent" aria-hidden />
                        <a href={`tel:${store.phone}`} className="hover:underline">{store.phone}</a>
                      </li>
                    ) : null}
                    {store.email ? (
                      <li className="flex gap-2.5">
                        <Mail className="mt-0.5 size-4 shrink-0 text-pai-accent" aria-hidden />
                        <a href={`mailto:${store.email}`} className="break-all hover:underline">{store.email}</a>
                      </li>
                    ) : null}
                    {store.address ? (
                      <li className="flex gap-2.5">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-pai-accent" aria-hidden />
                        <span>{store.address}</span>
                      </li>
                    ) : null}
                    <li>
                      <SmartLink href={context.url("/track-order")} className="stride-link text-sm">
                        Track your order
                      </SmartLink>
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </Container>

        {bool(s.show_wordmark, true) && wordmark ? (
          <div aria-hidden className="select-none overflow-hidden px-2 pt-6">
            <p
              className={cn(
                "stride-wordmark text-center font-heading uppercase leading-[0.78] tracking-[-0.01em]",
                wmStyle === "outline" && "stride-outline",
                wmStyle === "accent" && "text-pai-accent",
              )}
              style={{ fontSize: `min(calc((100vw - 1rem) / ${Math.max(4, wordmark.length) * 0.4}), 24rem)` }}
            >
              {wordmark}
            </p>
          </div>
        ) : null}

        <Container width="wide">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-pai-border py-6 text-xs md:flex-row">
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
