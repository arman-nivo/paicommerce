import { defineSection, type SfCollection, type SfMenuItem, type StorefrontContext } from "@pai/theme-sdk";
import { Container, Logo, SmartLink, bool, cn, loadMenu, num, resolveHref, str } from "@pai/theme-kit";
import { HeaderShell, MobileMenu } from "@pai/theme-kit/client";
import { Download, Headset, LayoutGrid, Languages, Phone, Store, Truck, Zap } from "lucide-react";
import { MegaMenu } from "../client/mega-menu";
import { MarketSearch } from "../client/search-bar";
import { AccountEntry, CartEntry } from "../client/header-actions";
import { IMG } from "../images";

/* ─────────────────────────── helpers ─────────────────────────── */

/** Top-level links + one level of children, de-duplicated — the category bar's quick links. */
function flattenMenu(items: SfMenuItem[], home: string): SfMenuItem[] {
  const out: SfMenuItem[] = [];
  const seen = new Set<string>();
  const push = (i: SfMenuItem) => {
    if (seen.has(i.url) || i.url === home) return;
    seen.add(i.url);
    out.push(i);
  };
  for (const item of items) {
    if (item.children?.length) item.children.forEach(push);
    else push(item);
  }
  return out;
}

type Promo = { image: string; eyebrow: string; heading: string; href: string } | null;

function CategoriesPanel({ collections, promo, context }: { collections: SfCollection[]; promo: Promo; context: StorefrontContext }) {
  return (
    <div className="grid gap-5 p-5 lg:grid-cols-[1fr_240px]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Shop by category</p>
          <SmartLink href={context.url("/collections")} className="text-xs font-semibold text-pai-primary hover:underline">
            View all categories →
          </SmartLink>
        </div>
        <ul className="grid grid-cols-2 gap-2 xl:grid-cols-3">
          {collections.map((c) => (
            <li key={c.id}>
              <SmartLink href={c.url} className="group flex items-center gap-3 rounded-pai p-2 transition hover:bg-pai-muted">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-pai-muted ring-1 ring-pai-border">
                  {c.image ? <img src={c.image.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold group-hover:text-pai-primary">{c.title}</span>
                  <span className="block text-xs opacity-55">{c.productsCount} items</span>
                </span>
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
      {promo ? (
        <SmartLink href={promo.href} className="group relative hidden min-h-56 overflow-hidden rounded-pai lg:block">
          <img src={promo.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 p-4 text-white">
            {promo.eyebrow ? <span className="bz-pill mb-2 bg-pai-accent text-[#1a1a1a]">{promo.eyebrow}</span> : null}
            <span className="block font-heading text-lg font-bold leading-tight">{promo.heading}</span>
            <span className="mt-1 inline-block text-xs font-semibold opacity-90">Shop now →</span>
          </span>
        </SmartLink>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── section ─────────────────────────── */

export const bazaarHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Marketplace header: top bar links, big search with category picker, account & cart, and a category bar with an “All categories” menu.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 132 },
      {
        type: "select",
        id: "style",
        label: "Header colours",
        default: "classic",
        options: [
          { value: "classic", label: "Classic — white header, primary category bar" },
          { value: "bold", label: "Bold — primary header, dark category bar" },
        ],
      },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "header", label: "Top bar" },
      { type: "checkbox", id: "show_topbar", label: "Show top bar", default: true },
      { type: "text", id: "topbar_text", label: "Promo text", default: "Cash on delivery in all 64 districts" },
      { type: "text", id: "sell_label", label: "Seller link label", default: "Sell with us" },
      { type: "url", id: "sell_link", label: "Seller link", default: "/pages/contact" },
      { type: "text", id: "help_label", label: "Help link label", default: "Help & support" },
      { type: "url", id: "help_link", label: "Help link", default: "/pages/contact" },
      { type: "text", id: "track_label", label: "Track order label", default: "Track order" },
      { type: "text", id: "hotline_label", label: "Hotline label", default: "Hotline", info: "Shows your store phone number." },
      { type: "text", id: "app_label", label: "App link label", default: "Save more on app" },
      { type: "url", id: "app_link", label: "App link" },
      { type: "text", id: "language_label", label: "Language link label", default: "বাংলা" },
      { type: "url", id: "language_link", label: "Language link" },
      { type: "header", label: "Search" },
      { type: "text", id: "search_placeholder", label: "Placeholder", default: "Search in Bazaar — phones, rice, sarees, headphones…" },
      { type: "text", id: "search_button", label: "Button label", default: "Search" },
      { type: "checkbox", id: "show_search_categories", label: "Show category picker", default: true },
      { type: "text", id: "trending", label: "Popular searches", default: "Earbuds, Smartwatch, Miniket rice, Serum, Denim", info: "Comma separated. Shown under the search bar on desktop." },
      { type: "header", label: "Account & cart" },
      { type: "text", id: "account_greeting", label: "Greeting", default: "Hello, sign in" },
      { type: "text", id: "account_sub", label: "Account label", default: "Account & orders" },
      { type: "text", id: "cart_label", label: "Cart label", default: "My cart" },
      { type: "header", label: "Category bar" },
      { type: "checkbox", id: "show_category_bar", label: "Show category bar", default: true },
      { type: "text", id: "categories_label", label: "“All categories” label", default: "All categories" },
      { type: "range", id: "categories_limit", label: "Categories in the menu", min: 4, max: 24, step: 1, default: 12 },
      { type: "menu", id: "menu", label: "Quick links menu", default: "main", info: "Top-level links and their children are shown in the bar and the mobile menu." },
      { type: "text", id: "deals_label", label: "Highlighted link label", default: "Flash sale" },
      { type: "url", id: "deals_link", label: "Highlighted link", default: "/collections/flash-sale" },
      { type: "text", id: "bar_note", label: "Right-hand note", default: "Free delivery over ৳999" },
      { type: "header", label: "Menu promo" },
      { type: "checkbox", id: "show_promo", label: "Show promo card in the category menu", default: true },
      { type: "image", id: "promo_image", label: "Image", default: IMG.shoppingBags },
      { type: "text", id: "promo_eyebrow", label: "Badge", default: "Mega sale" },
      { type: "text", id: "promo_heading", label: "Heading", default: "Up to 60% off across 10,000+ products" },
      { type: "url", id: "promo_link", label: "Link", default: "/collections/flash-sale" },
    ],
    presets: [{ name: "Header" }],
  },
  component: async ({ settings: s, context }) => {
    const showBar = bool(s.show_category_bar, true);
    const [items, collections] = await Promise.all([
      loadMenu(context, str(s.menu, "main")),
      context.data.getCollections({ limit: num(s.categories_limit, 12) }).catch(() => [] as SfCollection[]),
    ]);
    const home = context.url("/");
        const logoWidth = num(s.logo_width, num(context.theme.logo_width, 132));
    const bold = str(s.style, "classic") === "bold";
    const promo: Promo =
      bool(s.show_promo, true) && str(s.promo_image)
        ? { image: str(s.promo_image), eyebrow: str(s.promo_eyebrow), heading: str(s.promo_heading), href: resolveHref(context, s.promo_link, "/collections/all") }
        : null;
    const trending = str(s.trending)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 6);
    const dealsHref = resolveHref(context, s.deals_link);
    const quick = flattenMenu(items, home)
      .filter((i) => !(str(s.deals_label) && dealsHref && i.url === dealsHref))
      .slice(0, 10);
    const phone = context.store.phone;
    const searchCats = collections.map((c) => ({ label: c.title, href: c.url }));
    const topLinks = [
      { label: str(s.sell_label), href: resolveHref(context, s.sell_link), icon: Store },
      { label: str(s.help_label), href: resolveHref(context, s.help_link), icon: Headset },
      { label: str(s.track_label), href: context.url("/track-order"), icon: Truck },
      { label: str(s.app_label), href: resolveHref(context, s.app_link), icon: Download },
      { label: str(s.language_label), href: resolveHref(context, s.language_link), icon: Languages },
    ].filter((l) => l.label && l.href);

    return (
      <HeaderShell sticky={bool(s.sticky, true)} className={cn("bazaar-header !border-b-0", bold ? "bz-header-bold" : "bz-header-classic")}>
        {bool(s.show_topbar, true) ? (
          <div className="bz-topbar hidden text-[11px] md:block">
            <Container className="flex h-8 items-center justify-between gap-6">
              <p className="truncate font-medium">{str(s.topbar_text)}</p>
              <nav aria-label="Store links">
                <ul className="flex items-center gap-4 whitespace-nowrap">
                  {topLinks.map(({ label, href, icon: I }) => (
                    <li key={label}>
                      <SmartLink href={href} className="bz-toplink inline-flex items-center gap-1 transition hover:text-pai-primary">
                        <I className="size-3.5" aria-hidden /> {label}
                      </SmartLink>
                    </li>
                  ))}
                  {phone ? (
                    <li>
                      <a href={`tel:${phone}`} className="bz-toplink inline-flex items-center gap-1 font-semibold transition hover:text-pai-primary">
                        <Phone className="size-3.5" aria-hidden /> {str(s.hotline_label, "Hotline")}: <span className="tabular-nums">{phone}</span>
                      </a>
                    </li>
                  ) : null}
                </ul>
              </nav>
            </Container>
          </div>
        ) : null}

        <div className="bz-mainrow">
          <Container className="flex items-center gap-2 py-2.5 md:gap-5 md:py-3.5">
            <MobileMenu items={items} storeName={context.store.name} logoUrl={str(s.logo) || context.store.logoUrl} className="-ml-2 lg:hidden" showSearch={false} />
            <Logo context={context} image={str(s.logo)} width={logoWidth} className="bz-logo" />
            <div className="hidden min-w-0 flex-1 md:block">
              <MarketSearch
                categories={searchCats}
                placeholder={str(s.search_placeholder, "Search products…")}
                buttonLabel={str(s.search_button, "Search")}
                allLabel={str(s.categories_label, "All categories")}
                showSelect={bool(s.show_search_categories, true)}
              />
              {trending.length ? (
                <p className="bz-trending mt-1.5 hidden flex-wrap items-center gap-x-3 gap-y-1 text-[11px] lg:flex">
                  <span className="font-semibold">Popular:</span>
                  {trending.map((t) => (
                    <SmartLink key={t} href={context.url(`/search?q=${encodeURIComponent(t)}`)} className="hover:text-pai-primary hover:underline">
                      {t}
                    </SmartLink>
                  ))}
                </p>
              ) : null}
            </div>
            <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-4">
              <AccountEntry greeting={str(s.account_greeting, "Hello, sign in")} sub={str(s.account_sub, "Account & orders")} className="rounded-pai p-2" />
              <CartEntry label={str(s.cart_label, "My cart")} className="rounded-pai p-2" />
            </div>
          </Container>
          <Container className="pb-2.5 md:hidden">
            <MarketSearch categories={[]} showSelect={false} placeholder={str(s.search_placeholder, "Search products…")} buttonLabel={str(s.search_button, "Search")} />
          </Container>
        </div>

        {showBar ? (
          <div className="bz-catbar relative hidden lg:block">
            <Container className="flex h-11 items-center gap-1">
              {collections.length ? (
                <MegaMenu
                  label={str(s.categories_label, "All categories")}
                  icon={<LayoutGrid className="size-4" aria-hidden />}
                  wrapperClassName="relative h-full"
                  className="bz-allcats inline-flex h-full items-center gap-2 px-4 text-[0.85rem] font-semibold transition"
                  panelClassName="animate-pai-fade absolute left-0 top-full z-50 w-[min(60rem,calc(100vw-2rem))] overflow-hidden rounded-b-pai border border-pai-border bg-pai-card text-pai-fg shadow-[0_24px_48px_-20px_rgba(0,0,0,0.35)]"
                >
                  <CategoriesPanel collections={collections} promo={promo} context={context} />
                </MegaMenu>
              ) : null}
              <nav aria-label="Quick links" className="min-w-0 flex-1 overflow-hidden">
                <ul className="flex items-center">
                  {quick.map((item) => (
                    <li key={item.id} className="shrink-0">
                      <SmartLink href={item.url} className={cn("bz-quick inline-flex h-11 items-center px-3 text-[0.82rem] font-medium transition", item.active && "bz-quick-active")}>
                        {item.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </nav>
              {str(s.bar_note) ? <p className="bz-barnote hidden whitespace-nowrap px-3 text-xs xl:block">{str(s.bar_note)}</p> : null}
              {str(s.deals_label) && dealsHref ? (
                <SmartLink href={dealsHref} className="bz-deals inline-flex shrink-0 items-center gap-1.5 rounded-pai-btn px-3.5 py-1.5 text-[0.82rem] font-bold">
                  <Zap className="size-4 fill-current" aria-hidden /> {str(s.deals_label)}
                </SmartLink>
              ) : null}
            </Container>
          </div>
        ) : null}
      </HeaderShell>
    );
  },
});
