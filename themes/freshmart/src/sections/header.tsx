/**
 * FreshMart header — grocery-app style:
 *  1. utility bar: "Deliver to" area picker, delivery promise, hotline and order tracking
 *  2. main bar: logo, a big predictive search, account and a basket button
 *  3. category row: icon pills linking to collections (blocks, or your collections as a fallback)
 *  + an app-style bottom navigation on phones.
 */
import { defineSection, type BlockInstance, type SfCollection, type StorefrontContext } from "@pai/theme-sdk";
import { Container, Icon, Link, Logo, SmartLink, bool, cn, loadMenu, num, resolveHref, schemeClass, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MobileMenu, SearchBox } from "@pai/theme-kit/client";
import { Headset, PackageSearch, ShoppingBasket, Zap } from "lucide-react";
import { DeliveryLocation } from "../client/location";
import { BottomNav } from "../client/bottom-nav";

const ICON_BY_WORD: [RegExp, string][] = [
  [/fruit|mango|apple/i, "apple"],
  [/veg/i, "carrot"],
  [/meat|beef|chicken/i, "beef"],
  [/fish|sea/i, "fish"],
  [/dairy|milk/i, "milk"],
  [/egg/i, "egg"],
  [/bak|bread/i, "croissant"],
  [/rice|oil|staple|grain|atta/i, "wheat"],
  [/snack|biscuit|chip/i, "cookie"],
  [/drink|beverage|juice|tea|coffee/i, "cup-soda"],
  [/baby|kid/i, "baby"],
  [/health|pharma|medic|vitamin/i, "pill"],
  [/clean|home|house/i, "spray-can"],
  [/beauty|care|personal/i, "sparkles"],
  [/offer|deal|sale/i, "badge-percent"],
];

/** Pick a sensible lucide icon for a category title. */
export function iconFor(title: string, fallback = "shopping-basket"): string {
  return ICON_BY_WORD.find(([re]) => re.test(title))?.[1] ?? fallback;
}

export function parseAreas(v: unknown): string[] {
  return str(v)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);
}

type Pill = { id: string; label: string; icon: string; href: string; highlight: boolean; active: boolean };

async function categoryPills(context: StorefrontContext, blocks: BlockInstance[], limit: number): Promise<Pill[]> {
  const cats = blocks.filter((b) => b.type === "category");
  if (cats.length) {
    const cols = await Promise.all(
      cats.map((b) => (str(b.settings.collection) ? context.data.getCollection(str(b.settings.collection)).catch(() => null) : Promise.resolve(null as SfCollection | null))),
    );
    return cats
      .map((b, i) => {
        const c = cols[i];
        const label = str(b.settings.label) || c?.title || "";
        const href = str(b.settings.link) ? resolveHref(context, b.settings.link) : c?.url ?? (str(b.settings.collection) ? "" : context.url("/collections/all"));
        return { id: b.id, label, icon: str(b.settings.icon) || iconFor(label), href, highlight: bool(b.settings.highlight), active: !!c && context.path === `/collections/${c.slug}` };
      })
      .filter((p) => p.label && p.href);
  }
  const cols = await context.data.getCollections({ limit }).catch(() => [] as SfCollection[]);
  return cols.map((c) => ({ id: c.id, label: c.title, icon: iconFor(c.title), href: c.url, highlight: false, active: context.path === `/collections/${c.slug}` }));
}

export const freshHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Delivery-area bar, big search, basket and a category icon row — plus an app-style bottom bar on phones.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 130 },
      { type: "menu", id: "menu", label: "Mobile drawer menu", default: "main" },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "header", label: "Delivery bar" },
      { type: "checkbox", id: "show_location", label: "Show delivery-area picker", default: true },
      { type: "text", id: "location_label", label: "Area picker label", default: "Deliver to" },
      {
        type: "textarea",
        id: "areas",
        label: "Delivery areas",
        default: "Dhanmondi, Dhaka\nGulshan, Dhaka\nBanani, Dhaka\nMirpur, Dhaka\nUttara, Dhaka\nMohammadpur, Dhaka\nBashundhara R/A, Dhaka\nOld Dhaka",
        info: "One area per line. Shoppers pick one; it is remembered in their browser.",
      },
      { type: "text", id: "location_note", label: "Area picker note", default: "Outside Dhaka? We deliver nationwide in 1–3 days." },
      { type: "text", id: "promise", label: "Delivery promise", default: "Delivery in 60 minutes" },
      { type: "checkbox", id: "show_phone", label: "Show hotline", default: true },
      { type: "text", id: "phone", label: "Hotline number", info: "Defaults to the store phone." },
      { type: "checkbox", id: "show_track", label: "Show “Track order” link", default: true },
      {
        type: "select",
        id: "bar_scheme",
        label: "Delivery bar colours",
        default: "primary",
        options: [
          { value: "primary", label: "Primary" },
          { value: "inverse", label: "Inverse (dark)" },
          { value: "accent", label: "Accent" },
          { value: "muted", label: "Muted" },
        ],
      },
      { type: "header", label: "Search & basket" },
      { type: "text", id: "search_placeholder", label: "Search placeholder", default: "Search for mangoes, rice, eggs…" },
      { type: "text", id: "cart_label", label: "Basket label", default: "My basket" },
      { type: "checkbox", id: "show_account", label: "Show account link", default: true },
      { type: "header", label: "Category row" },
      { type: "checkbox", id: "show_categories", label: "Show category row", default: true },
      { type: "range", id: "category_limit", label: "Categories when no blocks are added", min: 3, max: 16, step: 1, default: 10 },
      { type: "header", label: "Mobile" },
      { type: "checkbox", id: "show_bottom_nav", label: "Show bottom navigation on phones", default: true },
    ],
    blocks: [
      {
        type: "category",
        name: "Category",
        settings: [
          { type: "collection", id: "collection", label: "Collection" },
          { type: "text", id: "label", label: "Label", info: "Defaults to the collection title." },
          { type: "text", id: "icon", label: "Icon", info: "A lucide icon name, e.g. apple, carrot, beef, fish, milk, egg, croissant, wheat, cookie, cup-soda, baby, pill, badge-percent. Picked automatically when empty." },
          { type: "url", id: "link", label: "Link", info: "Overrides the collection link." },
          { type: "checkbox", id: "highlight", label: "Highlight (e.g. Offers)", default: false },
        ],
      },
    ],
    maxBlocks: 16,
    presets: [{ name: "Header" }],
  },
  component: async ({ settings: s, blocks, context }) => {
    const [items, pills] = await Promise.all([
      loadMenu(context, str(s.menu, "main")),
      bool(s.show_categories, true) ? categoryPills(context, blocks, num(s.category_limit, 10)) : Promise.resolve([] as Pill[]),
    ]);
    const areas = parseAreas(s.areas);
    const phone = str(s.phone) || context.store.phone || "";
    const promise = str(s.promise);
    const logoWidth = num(s.logo_width, num(context.theme.logo_width, 130));
    const search = <SearchBox placeholder={str(s.search_placeholder, "Search products…")} className="fm-search w-full" />;

    const utility =
      (bool(s.show_location, true) && areas.length) || promise || (bool(s.show_phone, true) && phone) || bool(s.show_track, true) ? (
        <div className={cn("fm-utility text-[0.8rem]", schemeClass(str(s.bar_scheme, "primary")))}>
          <Container className="flex min-h-9 items-center justify-between gap-4 py-1.5">
            <div className="flex min-w-0 items-center gap-5">
              {bool(s.show_location, true) && areas.length ? <DeliveryLocation areas={areas} label={str(s.location_label, "Deliver to")} note={str(s.location_note)} /> : null}
              {promise ? (
                <p className="hidden items-center gap-1.5 font-semibold sm:inline-flex">
                  <Zap className="size-4 fill-amber-300 text-amber-300" aria-hidden />
                  {promise}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-5">
              {bool(s.show_phone, true) && phone ? (
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hidden items-center gap-1.5 hover:underline md:inline-flex">
                  <Headset className="size-4" aria-hidden /> Hotline <span className="font-bold">{phone}</span>
                </a>
              ) : null}
              {bool(s.show_track, true) ? (
                <Link href={context.url("/track-order")} className="inline-flex items-center gap-1.5 hover:underline">
                  <PackageSearch className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Track order</span>
                  <span className="sm:hidden">Track</span>
                </Link>
              ) : null}
            </div>
          </Container>
        </div>
      ) : null;

    return (
      <>
        {utility}
        <HeaderShell sticky={bool(s.sticky, true)} className="fm-header">
          <Container className="flex items-center gap-3 py-2.5 md:gap-6 md:py-3.5">
            <MobileMenu items={items} storeName={context.store.name} logoUrl={str(s.logo) || context.store.logoUrl} showAccount={bool(s.show_account, true)} className="md:hidden" />
            <Logo context={context} image={str(s.logo)} width={logoWidth} className="fm-logo" />
            <div className="hidden min-w-0 flex-1 md:block">{search}</div>
            <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-2">
              {bool(s.show_account, true) ? (
                <AccountLink className="hidden size-11 items-center justify-center rounded-full hover:bg-pai-muted sm:inline-flex" />
              ) : null}
              <CartButton
                label={str(s.cart_label, "My basket")}
                className="fm-basket size-11 rounded-full bg-pai-primary text-pai-primary-fg transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2 md:h-11 md:w-auto md:grid-flow-col md:gap-2 md:rounded-pai-btn md:px-4"
                icon={
                  <>
                    <ShoppingBasket className="size-5" aria-hidden />
                    <span className="hidden text-sm font-bold md:inline">{str(s.cart_label, "My basket")}</span>
                  </>
                }
              />
            </div>
          </Container>
          <Container className="pb-2.5 md:hidden">{search}</Container>
          {pills.length ? (
            <nav aria-label="Shop by category" className="fm-cat-row border-t border-pai-border in-data-[scrolled=true]:max-md:hidden">
              <Container>
                <ul className="pai-no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto py-2">
                  {pills.map((p) => (
                    <li key={p.id} className="shrink-0">
                      <SmartLink
                        href={p.href}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.82rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary",
                          p.highlight ? "bg-pai-accent text-white hover:brightness-105" : p.active ? "bg-pai-primary text-pai-primary-fg" : "bg-pai-muted hover:bg-[color-mix(in_srgb,var(--pai-primary)_14%,var(--pai-muted))]",
                        )}
                      >
                        <Icon name={p.icon} className="size-4" strokeWidth={2} />
                        {p.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </Container>
            </nav>
          ) : null}
        </HeaderShell>
        {bool(s.show_bottom_nav, true) ? <BottomNav /> : null}
      </>
    );
  },
});
