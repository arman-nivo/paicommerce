/**
 * FreshMart footer: a promise strip (fresh guarantee, fast delivery, COD…), then store info with a
 * big hotline card, menus, the app download block and newsletter, then payments and copyright.
 */
import { defineSection } from "@pai/theme-sdk";
import { Container, Icon, Link, PaymentIcons, SmartLink, SocialLinks, bool, cn, loadMenu, resolveHref, schemeClass, str } from "@pai/theme-kit";
import { NewsletterForm } from "@pai/theme-kit/client";
import { Clock, Mail, MapPin, PhoneCall } from "lucide-react";
import { AppBadges } from "./app-badges";

/** `store.address` may be a JSON string ({ line1, area, city … }) or plain text. */
export function formatAddress(raw: string | null | undefined): string {
  if (!raw) return "";
  try {
    const a = JSON.parse(raw) as Record<string, string | undefined>;
    if (a && typeof a === "object") return [a.line1, a.line2, a.area, a.city, a.postalCode].filter(Boolean).join(", ");
  } catch {}
  return raw;
}

export const freshFooter = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    description: "Promise strip, hotline, menus, app download and newsletter.",
    settings: [
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "cod, bkash, nagad, visa, mastercard", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "hours", label: "Service hours", default: "Every day, 7:00 AM – 11:00 PM" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Use {year} and {store}. Defaults to “© {year} {store}”." },
      schemeField(),
      {
        type: "select",
        id: "strip_scheme",
        label: "Promise strip colours",
        default: "muted",
        options: [
          { value: "muted", label: "Muted" },
          { value: "default", label: "Default" },
          { value: "primary", label: "Primary" },
        ],
      },
    ],
    blocks: [
      {
        type: "feature",
        name: "Promise",
        limit: 6,
        settings: [
          { type: "text", id: "icon", label: "Icon", default: "leaf", info: "lucide icon name, e.g. leaf, zap, banknote, rotate-ccw, shield-check, truck" },
          { type: "text", id: "title", label: "Title", default: "100% fresh" },
          { type: "text", id: "text", label: "Text", default: "Or your money back" },
        ],
      },
      {
        type: "brand",
        name: "Brand & hotline",
        limit: 1,
        settings: [
          { type: "image", id: "logo", label: "Logo", info: "Defaults to the store name." },
          { type: "textarea", id: "text", label: "About", default: "" },
        ],
      },
      {
        type: "link_list",
        name: "Menu",
        limit: 4,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Help" },
          { type: "menu", id: "menu", label: "Menu", default: "footer" },
        ],
      },
      {
        type: "app",
        name: "App download",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Shop faster on the app" },
          { type: "textarea", id: "text", label: "Text", default: "Reorder your weekly basket in two taps and track your rider live." },
          { type: "url", id: "ios", label: "App Store link", default: "https://apps.apple.com" },
          { type: "url", id: "android", label: "Google Play link", default: "https://play.google.com" },
        ],
      },
      {
        type: "newsletter",
        name: "Newsletter",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Weekly deals in your inbox" },
          { type: "textarea", id: "text", label: "Text", default: "Fresh offers every Thursday. No spam." },
        ],
      },
    ],
    presets: [
      {
        name: "Footer",
        blocks: [{ type: "feature" }, { type: "brand" }, { type: "link_list", settings: { heading: "Shop", menu: "main" } }, { type: "link_list" }, { type: "app" }],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const store = context.store;
    const features = blocks.filter((b) => b.type === "feature");
    const cols = blocks.filter((b) => b.type !== "feature");
    const menus = await Promise.all(cols.map((b) => (b.type === "link_list" ? loadMenu(context, str(b.settings.menu, "footer"), "footer") : Promise.resolve(null))));
    const year = new Date().getFullYear();
    const copyright = str(s.copyright, `© {year} {store}. All rights reserved.`).replace("{year}", String(year)).replace("{store}", store.name);
    const methods = str(s.payment_methods, "cod, bkash, nagad, visa, mastercard")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
    const address = formatAddress(store.address);
    return (
      <footer className="fm-footer">
        {features.length ? (
          <div className={cn("border-y border-pai-border", schemeClass(str(s.strip_scheme, "muted")))}>
            <Container>
              <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-5 py-6 md:py-7", features.length >= 4 ? "lg:grid-cols-4" : "md:grid-cols-3")}>
                {features.map((b) => (
                  <li key={b.id} className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--pai-primary)_14%,transparent)] text-pai-primary">
                      <Icon name={str(b.settings.icon, "leaf")} className="size-5" strokeWidth={2} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold leading-tight">{str(b.settings.title)}</span>
                      <span className="block text-xs opacity-65">{str(b.settings.text)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Container>
          </div>
        ) : null}
        <div className={cn("pt-12 text-[0.9rem] md:pt-14", schemeClass(str(s.color_scheme, "inverse")))}>
          <Container>
            <div className="grid gap-10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
              {cols.map((b, i) => {
                const bs = b.settings;
                if (b.type === "brand") {
                  return (
                    <div key={b.id} className="space-y-5">
                      {str(bs.logo) ? <img src={str(bs.logo)} alt={store.name} className="h-10 w-auto object-contain" loading="lazy" /> : <p className="font-heading text-2xl font-extrabold">{store.name}</p>}
                      <p className="max-w-sm opacity-75">{str(bs.text) || store.description || "Fresh groceries and daily essentials delivered to your door — with cash on delivery."}</p>
                      {store.phone ? (
                        <a href={`tel:${store.phone}`} className="flex max-w-sm items-center gap-3 rounded-pai bg-pai-muted p-3.5 transition hover:brightness-110">
                          <span className="grid size-11 place-items-center rounded-full bg-pai-accent text-white">
                            <PhoneCall className="size-5" aria-hidden />
                          </span>
                          <span>
                            <span className="block text-xs opacity-70">Order by phone</span>
                            <span className="block text-lg font-extrabold tracking-wide">{store.phone}</span>
                          </span>
                        </a>
                      ) : null}
                      <ul className="space-y-2 text-sm opacity-80">
                        {str(s.hours) ? (
                          <li className="flex gap-2">
                            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden /> {str(s.hours)}
                          </li>
                        ) : null}
                        {address ? (
                          <li className="flex gap-2">
                            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {address}
                          </li>
                        ) : null}
                        {store.email ? (
                          <li className="flex gap-2">
                            <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                            <a href={`mailto:${store.email}`} className="break-all hover:underline">
                              {store.email}
                            </a>
                          </li>
                        ) : null}
                      </ul>
                      {bool(s.show_social, true) ? <SocialLinks context={context} /> : null}
                    </div>
                  );
                }
                if (b.type === "link_list") {
                  return (
                    <div key={b.id}>
                      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">{str(bs.heading)}</h2>
                      <ul className="space-y-2.5">
                        {(menus[i] ?? []).map((m) => (
                          <li key={m.id}>
                            <SmartLink href={m.url} className="opacity-75 transition hover:opacity-100 hover:underline">
                              {m.label}
                            </SmartLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                if (b.type === "app") {
                  return (
                    <div key={b.id} className="space-y-4">
                      <h2 className="text-sm font-bold uppercase tracking-wider">{str(bs.heading)}</h2>
                      <p className="opacity-75">{str(bs.text)}</p>
                      <AppBadges ios={resolveHref(context, bs.ios)} android={resolveHref(context, bs.android)} tone="light" />
                    </div>
                  );
                }
                if (b.type === "newsletter") {
                  return (
                    <div key={b.id} className="space-y-3">
                      <h2 className="text-sm font-bold uppercase tracking-wider">{str(bs.heading)}</h2>
                      <p className="opacity-75">{str(bs.text)}</p>
                      <NewsletterForm buttonLabel="Subscribe" />
                    </div>
                  );
                }
                return null;
              })}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-pai-border py-6 pb-24 text-xs md:flex-row md:pb-6">
              <p className="opacity-70">{copyright}</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href={context.url("/track-order")} className="font-semibold underline underline-offset-4 opacity-80 hover:opacity-100">
                  Track your order
                </Link>
                {store.showBranding ? (
                  <a href="https://paicommerce.com?utm_source=storefront&utm_medium=footer" target="_blank" rel="noopener" className="opacity-60 transition hover:opacity-100">
                    Powered by <span className="font-semibold">PaiCommerce</span>
                  </a>
                ) : null}
              </div>
              {bool(s.show_payment_icons, true) ? <PaymentIcons methods={methods} /> : null}
            </div>
          </Container>
        </div>
      </footer>
    );
  },
});

function schemeField() {
  return {
    type: "select" as const,
    id: "color_scheme",
    label: "Colours",
    default: "inverse",
    options: [
      { value: "inverse", label: "Inverse (dark)" },
      { value: "primary", label: "Primary" },
      { value: "muted", label: "Muted" },
      { value: "default", label: "Default" },
    ],
  };
}
