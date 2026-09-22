import { defineSection, type SfCollection, type SfMenuItem, type StorefrontContext } from "@pai/theme-sdk";
import { Container, Logo, SmartLink, bool, cn, loadMenu, num, resolveHref, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MobileMenu, SearchBox } from "@pai/theme-kit/client";
import { LayoutGrid, Phone, ShieldCheck, Truck, Zap } from "lucide-react";
import { MegaMenu } from "../client/mega-menu";
import { IMG } from "../images";

/* ─────────────────────────── panels ─────────────────────────── */

type Promo = { image: string; eyebrow: string; heading: string; href: string } | null;

function PromoTile({ promo }: { promo: NonNullable<Promo> }) {
  return (
    <SmartLink href={promo.href} className="group relative hidden min-h-64 overflow-hidden rounded-pai border border-pai-border lg:block">
      <img src={promo.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover opacity-80 transition duration-700 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-5 text-white">
        {promo.eyebrow ? <span className="volt-chip mb-2 bg-pai-primary text-pai-primary-fg">{promo.eyebrow}</span> : null}
        <span className="block font-heading text-xl font-bold leading-tight">{promo.heading}</span>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-pai-primary">Shop now →</span>
      </span>
    </SmartLink>
  );
}

/** "All categories" panel: collection tiles with counts + a promo card. */
function CategoriesPanel({ collections, promo, context }: { collections: SfCollection[]; promo: Promo; context: StorefrontContext }) {
  return (
    <Container className="grid gap-8 py-8 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-60">Browse categories</p>
          <SmartLink href={context.url("/collections")} className="text-sm font-semibold text-pai-primary hover:underline">
            View all →
          </SmartLink>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {collections.map((c) => (
            <li key={c.id}>
              <SmartLink href={c.url} className="group flex items-center gap-3 rounded-pai border border-pai-border bg-pai-muted/60 p-2.5 transition hover:border-pai-primary/60 hover:bg-pai-muted">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-[calc(var(--pai-radius)*0.7)] bg-pai-bg">
                  {c.image ? <img src={c.image.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold group-hover:text-pai-primary">{c.title}</span>
                  <span className="block text-xs opacity-60">{c.productsCount} products</span>
                </span>
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
      {promo ? <PromoTile promo={promo} /> : null}
    </Container>
  );
}

function MenuPanel({ item, promo }: { item: SfMenuItem; promo: Promo }) {
  const children = item.children ?? [];
  const grouped = children.filter((c) => c.children?.length);
  const flat = children.filter((c) => !c.children?.length);
  const columns = [
    ...(flat.length ? [{ id: `${item.id}-flat`, title: item.label, href: item.url, links: flat }] : []),
    ...grouped.map((g) => ({ id: g.id, title: g.label, href: g.url, links: g.children ?? [] })),
  ];
  return (
    <Container className="grid gap-8 py-8 lg:grid-cols-[1fr_300px]">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:grid-cols-4">
        {columns.map((col) => (
          <div key={col.id}>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] opacity-60">
              <SmartLink href={col.href} className="hover:text-pai-primary">
                {col.title}
              </SmartLink>
            </p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.id}>
                  <SmartLink href={l.url} className="text-[0.95rem] opacity-80 transition hover:text-pai-primary hover:opacity-100">
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {promo ? <PromoTile promo={promo} /> : null}
    </Container>
  );
}

/* ─────────────────────────── section ─────────────────────────── */

export const voltHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Search-first dark header: utility bar, large predictive search, category mega menu and deals link.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo. Use a light logo on the dark header." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 130 },
      { type: "menu", id: "menu", label: "Menu", default: "main" },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "header", label: "Utility bar" },
      { type: "checkbox", id: "show_utility", label: "Show utility bar", default: true },
      { type: "text", id: "utility_text", label: "Promise text", default: "Official warranty on every product" },
      { type: "text", id: "hotline_label", label: "Hotline label", default: "Hotline", info: "Uses your store phone number." },
      { type: "header", label: "Search" },
      { type: "text", id: "search_placeholder", label: "Search placeholder", default: "Search phones, laptops, audio, brands…" },
      { type: "text", id: "trending", label: "Trending searches", default: "iPhone 15, Galaxy S24, AirPods, RTX 4070", info: "Comma separated. Shown under the search bar on desktop." },
      { type: "header", label: "Category bar" },
      { type: "checkbox", id: "show_categories", label: "Show “All categories” mega menu", default: true },
      { type: "text", id: "categories_label", label: "Categories label", default: "All categories" },
      { type: "range", id: "categories_limit", label: "Categories shown", min: 4, max: 16, step: 1, default: 8 },
      { type: "text", id: "deals_label", label: "Highlight link label", default: "Flash deals" },
      { type: "url", id: "deals_link", label: "Highlight link", default: "/collections/all" },
      { type: "header", label: "Mega menu promo" },
      { type: "checkbox", id: "show_promo", label: "Show promo card", default: true },
      { type: "image", id: "promo_image", label: "Image", default: IMG.gamingPc },
      { type: "text", id: "promo_eyebrow", label: "Badge", default: "New drop" },
      { type: "text", id: "promo_heading", label: "Heading", default: "Build your dream rig" },
      { type: "url", id: "promo_link", label: "Link", default: "/collections/all" },
    ],
    presets: [{ name: "Header" }],
  },
  component: async ({ settings: s, context }) => {
    const [items, collections] = await Promise.all([
      loadMenu(context, str(s.menu, "main")),
      bool(s.show_categories, true) ? context.data.getCollections({ limit: num(s.categories_limit, 8) }).catch(() => []) : Promise.resolve([] as SfCollection[]),
    ]);
    const logoWidth = num(s.logo_width, num(context.theme.logo_width, 130));
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
    const phone = context.store.phone;
    const navLink = "volt-nav-link inline-flex items-center gap-1.5 py-3 text-[0.85rem] font-medium opacity-80 transition hover:opacity-100 data-[open=true]:opacity-100 data-[open=true]:text-pai-primary";

    return (
      <HeaderShell sticky={bool(s.sticky, true)} className="volt-header">
        {bool(s.show_utility, true) ? (
          <div className="hidden border-b border-pai-border bg-black/30 text-xs md:block">
            <Container className="flex h-9 items-center justify-between gap-6">
              <p className="flex items-center gap-2 opacity-75">
                <ShieldCheck className="size-3.5 text-pai-primary" aria-hidden />
                {str(s.utility_text)}
              </p>
              <div className="flex items-center gap-5 opacity-80">
                <SmartLink href={context.url("/track-order")} className="inline-flex items-center gap-1.5 hover:text-pai-primary">
                  <Truck className="size-3.5" aria-hidden /> Track order
                </SmartLink>
                {phone ? (
                  <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 hover:text-pai-primary">
                    <Phone className="size-3.5" aria-hidden /> {str(s.hotline_label, "Hotline")}: <span className="font-mono">{phone}</span>
                  </a>
                ) : null}
              </div>
            </Container>
          </div>
        ) : null}

        <Container className="flex items-center gap-3 py-3 md:gap-6 md:py-4">
          <MobileMenu items={items} storeName={context.store.name} logoUrl={str(s.logo) || context.store.logoUrl} className="lg:hidden" />
          <Logo context={context} image={str(s.logo)} width={logoWidth} className="volt-logo" />
          <div className="hidden flex-1 md:block">
            <SearchBox placeholder={str(s.search_placeholder, "Search products…")} className="volt-search mx-auto max-w-2xl" />
            {trending.length ? (
              <p className="mx-auto mt-1.5 flex max-w-2xl flex-wrap items-center gap-x-3 gap-y-1 text-[11px] opacity-60">
                <span className="font-mono uppercase tracking-[0.16em]">Trending</span>
                {trending.map((t) => (
                  <SmartLink key={t} href={context.url(`/search?q=${encodeURIComponent(t)}`)} className="hover:text-pai-primary hover:opacity-100">
                    {t}
                  </SmartLink>
                ))}
              </p>
            ) : null}
          </div>
          <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-2">
            <AccountLink className="hidden size-11 justify-center rounded-full transition hover:bg-pai-muted sm:inline-flex" />
            <CartButton className="volt-cart size-11 rounded-full bg-pai-muted transition hover:bg-pai-primary hover:text-pai-primary-fg" />
          </div>
        </Container>
        <Container className="pb-3 md:hidden">
          <SearchBox placeholder={str(s.search_placeholder, "Search products…")} className="volt-search" />
        </Container>

        <div className="hidden border-t border-pai-border lg:block">
          <Container className="flex items-center gap-7">
            {bool(s.show_categories, true) && collections.length ? (
              <MegaMenu
                label={str(s.categories_label, "All categories")}
                icon={<LayoutGrid className="size-4" aria-hidden />}
                className="inline-flex items-center gap-2 bg-pai-primary px-4 py-3 text-[0.85rem] font-semibold text-pai-primary-fg transition hover:brightness-110"
              >
                <CategoriesPanel collections={collections} promo={promo} context={context} />
              </MegaMenu>
            ) : null}
            <nav aria-label="Main" className="flex-1">
              <ul className="flex items-center gap-7">
                {items.map((item) => (
                  <li key={item.id}>
                    {item.children?.length ? (
                      <MegaMenu label={item.label} active={item.active} className={navLink}>
                        <MenuPanel item={item} promo={promo} />
                      </MegaMenu>
                    ) : (
                      <SmartLink href={item.url} className={cn(navLink, item.active && "text-pai-primary opacity-100")}>
                        {item.label}
                      </SmartLink>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            {str(s.deals_label) && dealsHref ? (
              <SmartLink href={dealsHref} className="volt-deals-link inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-pai-primary">
                <Zap className="size-4 fill-current" aria-hidden /> {str(s.deals_label)}
              </SmartLink>
            ) : null}
          </Container>
        </div>
      </HeaderShell>
    );
  },
});
