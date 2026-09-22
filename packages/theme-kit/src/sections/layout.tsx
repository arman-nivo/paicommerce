import type { SfMenuItem, StorefrontContext } from "@pai/theme-sdk";
import { defineSection } from "@pai/theme-sdk";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { bool, cn, num, str } from "../lib/utils";
import { schemeClass } from "../lib/css";
import { Container, RichText, SmartLink, resolveHref } from "../components/primitives";
import { PaymentIcons, SocialLinks } from "../components/icons";
import { AccountLink, HeaderShell, MenuDropdown, MobileMenu } from "../client/navigation";
import { SearchBox, SearchToggle } from "../client/search";
import { CartButton } from "../client/cart-ui";
import { NewsletterForm } from "../client/widgets";
import { schemeField } from "./_shared";

/* ─────────────────────────── helpers ─────────────────────────── */

/** Menu for a handle, with a sensible fallback built from collections when the menu is empty. */
export async function loadMenu(context: StorefrontContext, handle: string, fallback: "main" | "footer" = "main"): Promise<SfMenuItem[]> {
  let items: SfMenuItem[] = [];
  try {
    items = handle ? await context.data.getMenu(handle) : [];
  } catch {
    items = [];
  }
  if (items.length) return items;
  if (fallback === "footer") {
    return [
      { id: "f-all", label: "Shop all", url: context.url("/collections/all") },
      { id: "f-track", label: "Track order", url: context.url("/track-order") },
      { id: "f-account", label: "My account", url: context.url("/account") },
      { id: "f-blog", label: "Blog", url: context.url("/blog") },
    ];
  }
  const cols = await context.data.getCollections({ limit: 4 }).catch(() => []);
  return [
    { id: "m-home", label: "Home", url: context.url("/"), active: context.path === "/" },
    { id: "m-all", label: "Shop", url: context.url("/collections/all"), active: context.path === "/collections/all" },
    ...cols.map((c) => ({ id: `m-${c.id}`, label: c.title, url: c.url, active: context.path === `/collections/${c.slug}` })),
  ];
}

/** Store logo (image or wordmark) linking home. */
export function Logo({ context, image, width, className, invertOnTransparent = false }: { context: StorefrontContext; image?: string; width?: number; className?: string; invertOnTransparent?: boolean }) {
  const src = str(image) || context.store.logoUrl;
  const w = width ?? num(context.theme.logo_width, 120);
  return (
    <Link href={context.url("/")} className={cn("inline-flex shrink-0 items-center", className)} aria-label={`${context.store.name} home`}>
      {src ? (
        <img
          src={src}
          alt={context.store.name}
          style={{ width: w, maxWidth: "min(46vw, 100%)" }}
          className={cn("h-auto max-h-16 object-contain", invertOnTransparent && "in-data-[transparent=true]:brightness-0 in-data-[transparent=true]:invert")}
        />
      ) : (
        <span className="font-heading text-xl font-bold tracking-tight md:text-2xl">{context.store.name}</span>
      )}
    </Link>
  );
}

function DesktopNav({ items, className, itemClassName }: { items: SfMenuItem[]; className?: string; itemClassName?: string }) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex flex-wrap items-center gap-x-7 gap-y-1 text-[0.9rem] font-medium">
        {items.map((item) => (
          <li key={item.id}>
            {item.children?.length ? (
              <MenuDropdown item={item} className={itemClassName} />
            ) : (
              <Link href={item.url} className={cn("relative inline-block py-2 opacity-90 transition hover:opacity-100", item.active && "underline decoration-2 underline-offset-8", itemClassName)}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ─────────────────────────── announcement bar ─────────────────────────── */

export const announcementBar = defineSection({
  schema: {
    type: "announcement-bar",
    name: "Announcement bar",
    category: "header",
    icon: "megaphone",
    group: "header",
    limit: 1,
    description: "Short messages above the header — delivery, COD, offers.",
    settings: [
      {
        type: "select",
        id: "style",
        label: "Display",
        default: "static",
        options: [
          { value: "static", label: "Static (messages side by side)" },
          { value: "marquee", label: "Scrolling marquee" },
        ],
      },
      { type: "checkbox", id: "show_social", label: "Show social icons (desktop)", default: false },
      { type: "checkbox", id: "show_phone", label: "Show store phone (desktop)", default: true },
      schemeField("inverse"),
    ],
    blocks: [
      {
        type: "announcement",
        name: "Announcement",
        limit: 6,
        settings: [
          { type: "text", id: "text", label: "Text", default: "Free delivery on orders over ৳2,000" },
          { type: "url", id: "link", label: "Link" },
        ],
      },
    ],
    presets: [{ name: "Announcement bar", blocks: [{ type: "announcement", settings: { text: "Cash on delivery all over Bangladesh" } }] }],
  },
  component: ({ settings: s, blocks, context }) => {
    const messages = blocks.length
      ? blocks.map((b) => ({ id: b.id, text: str(b.settings.text), href: resolveHref(context, b.settings.link) })).filter((m) => m.text)
      : str(context.theme.announcement_text)
        ? [{ id: "global", text: str(context.theme.announcement_text), href: resolveHref(context, context.theme.announcement_link) }]
        : [];
    if (!messages.length) return null;
    const marquee = s.style === "marquee";
    const Msg = ({ m }: { m: (typeof messages)[number] }) => (m.href ? <SmartLink href={m.href} className="hover:underline hover:underline-offset-4">{m.text}</SmartLink> : <span>{m.text}</span>);
    return (
      <div className={cn("text-[0.8rem] font-medium", schemeClass(s.color_scheme))} role="region" aria-label="Announcements">
        <Container className="flex min-h-10 items-center justify-between gap-4 py-2">
          {bool(s.show_phone, true) && context.store.phone ? (
            <a href={`tel:${context.store.phone}`} className="hidden shrink-0 items-center gap-1.5 opacity-85 hover:opacity-100 lg:inline-flex">
              <Phone className="size-3.5" /> {context.store.phone}
            </a>
          ) : (
            <span className="hidden lg:block lg:w-8" />
          )}
          {marquee ? (
            <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
              <div className="animate-pai-marquee flex w-max gap-12 whitespace-nowrap hover:[animation-play-state:paused]">
                {[...messages, ...messages, ...messages, ...messages].map((m, i) => (
                  <span key={i} className="inline-flex items-center gap-12">
                    <Msg m={m} />
                    <span aria-hidden className="opacity-40">✦</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-wrap items-center justify-center gap-x-8 gap-y-1 text-center">
              {messages.map((m, i) => (
                <span key={m.id} className={cn(i > 0 && "hidden md:inline")}>
                  <Msg m={m} />
                </span>
              ))}
            </div>
          )}
          {bool(s.show_social) ? <SocialLinks context={context} className="hidden shrink-0 lg:flex" iconClassName="size-7 border-0" /> : <span className="hidden lg:block lg:w-8" />}
        </Container>
      </div>
    );
  },
});

/* ─────────────────────────── header ─────────────────────────── */

export const header = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 120 },
      { type: "menu", id: "menu", label: "Menu", default: "main" },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "inherit",
        options: [
          { value: "inherit", label: "Use theme setting" },
          { value: "logo_left", label: "Logo left, menu center" },
          { value: "logo_center", label: "Logo center, menu below" },
          { value: "minimal", label: "Minimal (menu in drawer)" },
        ],
      },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "checkbox", id: "transparent_on_home", label: "Transparent over the home page hero", default: false },
      {
        type: "select",
        id: "search_style",
        label: "Search",
        default: "icon",
        options: [
          { value: "icon", label: "Icon (opens overlay)" },
          { value: "bar", label: "Search bar" },
          { value: "none", label: "Hidden" },
        ],
      },
      { type: "checkbox", id: "show_account", label: "Show account icon", default: true },
      schemeField("default"),
    ],
    presets: [{ name: "Header" }],
  },
  component: async ({ settings: s, context }) => {
    const items = await loadMenu(context, str(s.menu, "main"));
    const layout = s.layout === "inherit" || !s.layout ? str(context.theme.header_style, "logo_left") : String(s.layout);
    const transparent = bool(s.transparent_on_home) && context.template === "index";
    const logoWidth = num(s.logo_width, num(context.theme.logo_width, 120));
    const search = str(s.search_style, "icon");
    const icons = (
      <div className="flex items-center justify-end gap-1 sm:gap-3">
        {search === "icon" ? <SearchToggle className="size-10" /> : null}
        {search === "bar" ? <SearchToggle className="size-10 md:hidden" /> : null}
        {bool(s.show_account, true) ? <AccountLink className="hidden size-10 justify-center sm:inline-flex" /> : null}
        <CartButton className="size-10" />
      </div>
    );
    const mobile = <MobileMenu items={items} storeName={context.store.name} logoUrl={str(s.logo) || context.store.logoUrl} showAccount={bool(s.show_account, true)} className={layout === "minimal" ? "" : "md:hidden"} />;
    const logo = <Logo context={context} image={str(s.logo)} width={logoWidth} invertOnTransparent={transparent} />;

    return (
      <HeaderShell sticky={bool(s.sticky, true)} transparent={transparent} className={cn(!transparent && schemeClass(s.color_scheme))}>
        {layout === "logo_center" ? (
          <Container className="py-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex items-center gap-2">
                {mobile}
                {search === "bar" ? <SearchBox className="hidden w-full max-w-xs md:block" /> : null}
              </div>
              {logo}
              {icons}
            </div>
            <DesktopNav items={items} className="mt-2 hidden justify-center md:flex" />
          </Container>
        ) : layout === "minimal" ? (
          <Container className="grid min-h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 py-3">
            <div>{mobile}</div>
            {logo}
            {icons}
          </Container>
        ) : (
          <Container className="flex min-h-16 items-center gap-4 py-3 md:min-h-[72px]">
            {mobile}
            <div className="flex flex-1 items-center md:flex-none">{logo}</div>
            <DesktopNav items={items} className="hidden flex-1 justify-center md:flex" />
            {search === "bar" ? <SearchBox className="hidden w-64 lg:block" /> : null}
            {icons}
          </Container>
        )}
      </HeaderShell>
    );
  },
});

/* ─────────────────────────── footer ─────────────────────────── */

export const footer = defineSection({
  schema: {
    type: "footer",
    name: "Footer",
    category: "footer",
    icon: "panel-bottom",
    group: "footer",
    limit: 1,
    settings: [
      { type: "checkbox", id: "show_social", label: "Show social icons", default: true },
      { type: "checkbox", id: "show_payment_icons", label: "Show payment icons", default: true },
      { type: "text", id: "payment_methods", label: "Payment icons", default: "cod, bkash, nagad, visa, mastercard", info: "Comma separated: cod, bkash, nagad, rocket, upay, visa, mastercard, amex" },
      { type: "text", id: "copyright", label: "Copyright text", info: "Defaults to “© {year} {store name}”." },
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
      {
        type: "contact",
        name: "Contact info",
        limit: 1,
        settings: [{ type: "text", id: "heading", label: "Heading", default: "Contact" }],
      },
      {
        type: "newsletter",
        name: "Newsletter",
        limit: 1,
        settings: [
          { type: "text", id: "heading", label: "Heading", default: "Join our newsletter" },
          { type: "textarea", id: "text", label: "Text", default: "Get new arrivals and exclusive offers first." },
        ],
      },
    ],
    presets: [
      {
        name: "Footer",
        blocks: [{ type: "brand" }, { type: "link_list", settings: { heading: "Shop", menu: "footer" } }, { type: "contact" }, { type: "newsletter" }],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const store = context.store;
    const menus = await Promise.all(
      blocks.map((b) => (b.type === "link_list" ? loadMenu(context, str(b.settings.menu, "footer"), "footer") : Promise.resolve(null))),
    );
    const year = new Date().getFullYear();
    const copyright = str(s.copyright, `© ${year} ${store.name}. All rights reserved.`).replace("{year}", String(year)).replace("{store}", store.name);
    const methods = str(s.payment_methods, "cod, bkash, nagad, visa, mastercard")
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);
    const cols = blocks.length || 1;
    return (
      <footer className={cn("pt-16 text-[0.9rem]", schemeClass(s.color_scheme))}>
        <Container>
          <div className={cn("grid gap-10 pb-12 sm:grid-cols-2", cols >= 4 ? "lg:grid-cols-[1.4fr_repeat(3,1fr)]" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
            {blocks.map((b, i) => {
              const bs = b.settings;
              if (b.type === "brand") {
                return (
                  <div key={b.id} className="space-y-4">
                    {str(bs.logo) ? <img src={str(bs.logo)} alt={store.name} className="h-10 w-auto object-contain" loading="lazy" /> : <p className="font-heading text-2xl font-bold">{store.name}</p>}
                    <p className="max-w-sm opacity-75">{str(bs.text) || store.description || "Quality products, honest prices and fast delivery across Bangladesh."}</p>
                    {bool(s.show_social, true) ? <SocialLinks context={context} /> : null}
                  </div>
                );
              }
              if (b.type === "link_list") {
                return (
                  <div key={b.id}>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">{str(bs.heading)}</h2>
                    <ul className="space-y-2.5">
                      {(menus[i] ?? []).map((m) => (
                        <li key={m.id}>
                          <SmartLink href={m.url} className="opacity-75 transition hover:opacity-100">
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
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">{str(bs.heading)}</h2>
                    <RichText html={str(bs.text)} className="opacity-75" />
                  </div>
                );
              }
              if (b.type === "contact") {
                return (
                  <div key={b.id}>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">{str(bs.heading, "Contact")}</h2>
                    <ul className="space-y-3 opacity-80">
                      {store.phone ? (
                        <li className="flex gap-2.5">
                          <Phone className="mt-0.5 size-4 shrink-0" />
                          <a href={`tel:${store.phone}`} className="hover:underline">{store.phone}</a>
                        </li>
                      ) : null}
                      {store.email ? (
                        <li className="flex gap-2.5">
                          <Mail className="mt-0.5 size-4 shrink-0" />
                          <a href={`mailto:${store.email}`} className="break-all hover:underline">{store.email}</a>
                        </li>
                      ) : null}
                      {store.address ? (
                        <li className="flex gap-2.5">
                          <MapPin className="mt-0.5 size-4 shrink-0" />
                          <span>{store.address}</span>
                        </li>
                      ) : null}
                      <li>
                        <Link href={context.url("/track-order")} className="font-medium underline underline-offset-4">
                          Track your order
                        </Link>
                      </li>
                    </ul>
                  </div>
                );
              }
              if (b.type === "newsletter") {
                return (
                  <div key={b.id} className="sm:col-span-2 lg:col-span-1">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider">{str(bs.heading)}</h2>
                    <p className="mb-4 opacity-75">{str(bs.text)}</p>
                    <NewsletterForm buttonLabel="Join" />
                  </div>
                );
              }
              return null;
            })}
            {!blocks.length ? (
              <div className="space-y-3">
                <p className="font-heading text-2xl font-bold">{store.name}</p>
                {bool(s.show_social, true) ? <SocialLinks context={context} /> : null}
              </div>
            ) : null}
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
      </footer>
    );
  },
});
