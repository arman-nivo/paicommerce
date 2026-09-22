/**
 * Playhouse footer: wavy top edge, a "Join the Playhouse club" newsletter card with blobs,
 * a row of trust badges (safe materials, non-toxic …), colourful link columns, contact details,
 * social links, payment icons and the PaiCommerce branding link. Block types stay compatible with
 * the kit footer (brand, link_list, text, contact, newsletter) plus `badge`.
 */
import { Mail, MapPin, Phone } from "lucide-react";
import { defineSection } from "@pai/theme-sdk";
import { Container, Icon, ICON_OPTIONS, Link, PaymentIcons, RichText, SmartLink, SocialLinks, bool, cn, loadMenu, schemeClass, schemeField, str } from "@pai/theme-kit";
import { NewsletterForm } from "@pai/theme-kit/client";
import { Blob, FOCUS, PlayhouseStyles, Sparkle, Squiggle, Wave, formatAddress, funAt } from "./_playhouse";

export const playhouseFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Wavy footer with the Playhouse club newsletter, trust badges, menus, contact and payment icons.",
    settings: [
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "cod, bkash, nagad, visa, mastercard", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Defaults to “© {year} {store name}”. {year} and {store} are replaced." },
      { type: "checkbox", id: "wavy_top", label: "Wavy top edge", default: true },
      schemeField("inverse"),
    ],
    blocks: [
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
          { type: "text", id: "heading", label: "Heading", default: "About us" },
          { type: "richtext", id: "text", label: "Text", default: "<p>Share your brand story with customers.</p>" },
        ],
      },
      { type: "contact", name: "Contact info", limit: 1, settings: [{ type: "text", id: "heading", label: "Heading", default: "Say hello" }] },
      {
        type: "newsletter",
        name: "Club newsletter",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Join the Playhouse club" },
          { type: "textarea", id: "text", label: "Text", default: "Birthday surprises, early access to new toys and 10% off your first order." },
          { type: "text", id: "button_label", label: "Button label", default: "Join the club" },
        ],
      },
      {
        type: "badge",
        name: "Trust badge",
        limit: 6,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "shield-check", options: ICON_OPTIONS },
          { type: "text", id: "title", label: "Title", default: "Safety tested" },
          { type: "text", id: "text", label: "Text", default: "Every toy checked by our team" },
        ],
      },
    ],
    presets: [
      {
        name: "Footer",
        blocks: [
          { type: "newsletter" },
          { type: "badge", settings: { icon: "shield-check", title: "Safety tested", text: "Every toy checked by our team" } },
          { type: "badge", settings: { icon: "leaf", title: "Non-toxic materials", text: "Water-based paints, BPA-free" } },
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
    const copyright = str(s.copyright, `© ${year} ${store.name}. Made with love for little ones.`).replace("{year}", String(year)).replace("{store}", store.name);
    const methods = str(s.payment_methods, "cod, bkash, nagad, visa, mastercard")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
    const club = blocks.find((b) => b.type === "newsletter");
    const badges = blocks.filter((b) => b.type === "badge");
    const columns = blocks.map((b, i) => ({ b, i })).filter(({ b }) => !["newsletter", "badge"].includes(b.type));
    const address = formatAddress(store.address);
    const wavy = bool(s.wavy_top, true) && context.theme.wavy_edges !== false;
    const scheme = schemeClass(s.color_scheme);
    let colourIndex = 0;

    const heading = (text: string) => {
      const c = funAt(colourIndex++);
      return (
        <h2 className="mb-4 inline-flex flex-col font-heading text-lg font-semibold">
          {text}
          <Squiggle className="mt-0.5 h-2 w-16" color={c} />
        </h2>
      );
    };

    return (
      <footer className="ph-footer relative mt-10">
        <PlayhouseStyles />
        {wavy ? (
          <div className={cn("-mb-px", scheme)} style={{ background: "transparent" }} aria-hidden>
            <Wave className="text-[var(--pai-bg)] h-8! md:h-14!" />
          </div>
        ) : null}
        <div className={cn("relative overflow-hidden pb-6 pt-12 text-[0.92rem] md:pt-14", scheme)}>
          <Blob variant={0} color="var(--ph-c4)" className="absolute -left-24 top-40 size-72 opacity-15" />
          <Blob variant={2} color="var(--ph-c1)" className="absolute -right-20 bottom-24 size-64 opacity-15" />
          <Container className="relative">
            {club ? (
              <div
                className="relative isolate mb-12 grid items-center gap-6 overflow-hidden rounded-[32px] px-6 py-8 md:grid-cols-[1.1fr_1fr] md:px-10 md:py-10"
                style={{
                  background: "var(--ph-c1)",
                  ["--pai-fg" as string]: "var(--pai-scheme-inverse-bg)",
                  ["--pai-bg" as string]: "#ffffff",
                  ["--pai-border" as string]: "rgba(0,0,0,.12)",
                  ["--pai-primary" as string]: "var(--pai-scheme-inverse-bg)",
                  ["--pai-primary-fg" as string]: "#ffffff",
                  color: "var(--pai-scheme-inverse-bg)",
                }}
              >
                <Blob variant={1} color="var(--ph-c2)" className="absolute -right-10 -top-16 -z-10 size-52 opacity-70" />
                <Blob variant={2} color="white" className="absolute -bottom-20 left-1/3 -z-10 size-44 opacity-40" />
                <Sparkle className="ph-float absolute right-8 top-6 size-6" color="white" />
                <div>
                  <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em]">
                    <span aria-hidden>🎈</span> Members get more
                  </p>
                  <h2 className="font-heading text-3xl font-bold leading-tight md:text-4xl">{str(club.settings.heading, "Join the Playhouse club")}</h2>
                  {str(club.settings.text) ? <p className="mt-2 max-w-md font-semibold opacity-80">{str(club.settings.text)}</p> : null}
                </div>
                <NewsletterForm buttonLabel={str(club.settings.button_label, "Join the club")} placeholder="Your email address" className="ph-club-form" successMessage="Welcome to the club! Check your inbox 🎉" />
              </div>
            ) : null}

            {badges.length ? (
              <ul className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-4">
                {badges.map((b, i) => (
                  <li key={b.id} className="flex items-center gap-3 rounded-[22px] bg-[color-mix(in_srgb,var(--pai-fg)_7%,transparent)] p-3.5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full text-[#1f1f1f]" style={{ background: funAt(i + 2) }}>
                      <Icon name={str(b.settings.icon, "shield-check")} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-heading font-semibold leading-tight">{str(b.settings.title)}</span>
                      {str(b.settings.text) ? <span className="block text-xs opacity-70">{str(b.settings.text)}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className={cn("grid gap-10 pb-10 sm:grid-cols-2", columns.length >= 4 ? "lg:grid-cols-[1.4fr_repeat(3,1fr)]" : columns.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
              {columns.map(({ b, i }) => {
                const bs = b.settings;
                if (b.type === "brand") {
                  return (
                    <div key={b.id} className="space-y-4">
                      {str(bs.logo) ? (
                        <img src={str(bs.logo)} alt={store.name} className="h-12 w-auto object-contain" loading="lazy" />
                      ) : (
                        <p className="font-heading text-3xl font-bold">
                          {[...store.name.split(/\s+/)[0]!].map((ch, k) => (
                            <span key={k} style={{ color: funAt(k + 3) }}>
                              {ch}
                            </span>
                          ))}
                        </p>
                      )}
                      <p className="max-w-sm opacity-80">{str(bs.text) || store.description || "Toys, books and treats that spark joy — delivered with love across Bangladesh."}</p>
                      {bool(s.show_social, true) ? <SocialLinks context={context} className="gap-2" iconClassName="size-10 rounded-full border-0 bg-[color-mix(in_srgb,var(--pai-fg)_10%,transparent)] hover:bg-[var(--ph-c2)] hover:text-[#1f1f1f]" /> : null}
                    </div>
                  );
                }
                if (b.type === "link_list") {
                  return (
                    <div key={b.id}>
                      {heading(str(bs.heading, "Shop"))}
                      <ul className="space-y-2.5">
                        {(menus[i] ?? []).map((m) => (
                          <li key={m.id}>
                            <SmartLink href={m.url} className={cn("rounded-sm opacity-80 transition hover:opacity-100 hover:underline hover:decoration-2 hover:underline-offset-4", FOCUS)}>
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
                      {heading(str(bs.heading, "About us"))}
                      <RichText html={str(bs.text)} className="opacity-80" />
                    </div>
                  );
                }
                if (b.type === "contact") {
                  return (
                    <div key={b.id}>
                      {heading(str(bs.heading, "Say hello"))}
                      <ul className="space-y-3 opacity-90">
                        {store.phone ? (
                          <li className="flex gap-2.5">
                            <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
                            <a href={`tel:${store.phone}`} className="hover:underline">
                              {store.phone}
                            </a>
                          </li>
                        ) : null}
                        {store.email ? (
                          <li className="flex gap-2.5">
                            <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                            <a href={`mailto:${store.email}`} className="break-all hover:underline">
                              {store.email}
                            </a>
                          </li>
                        ) : null}
                        {address ? (
                          <li className="flex gap-2.5">
                            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                            <span>{address}</span>
                          </li>
                        ) : null}
                        <li>
                          <Link href={context.url("/track-order")} className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--pai-fg)_10%,transparent)] px-4 py-2 text-sm font-bold hover:bg-[var(--ph-c5)] hover:text-[#1f1f1f]">
                            Track your order
                          </Link>
                        </li>
                      </ul>
                    </div>
                  );
                }
                return null;
              })}
              {!columns.length && !club ? (
                <div className="space-y-3">
                  <p className="font-heading text-2xl font-bold">{store.name}</p>
                  {bool(s.show_social, true) ? <SocialLinks context={context} /> : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-pai-border pt-6 text-xs md:flex-row">
              <p className="opacity-75">{copyright}</p>
              {store.showBranding ? (
                <a href="https://paicommerce.com?utm_source=storefront&utm_medium=footer" target="_blank" rel="noopener" className="opacity-70 transition hover:opacity-100">
                  Powered by <span className="font-semibold">PaiCommerce</span>
                </a>
              ) : null}
              {bool(s.show_payment_icons, true) ? <PaymentIcons methods={methods} /> : null}
            </div>
          </Container>
        </div>
      </footer>
    );
  },
});
