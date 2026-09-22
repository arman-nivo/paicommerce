import { defineSection, type SfCollection, type SfMenuItem, type StorefrontContext } from "@pai/theme-sdk";
import { Container, Logo, SmartLink, bool, cn, loadMenu, num, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MobileMenu, SearchToggle } from "@pai/theme-kit/client";
import { ArrowUpRight } from "lucide-react";
import { MegaMenu } from "../client/mega-menu";
import { IMG } from "../images";

/* ─────────────────────────── mega panel ─────────────────────────── */

type Promo = { image: string; eyebrow: string; heading: string; href: string } | null;

const slugOf = (url: string) => url.match(/\/collections\/([^/?#]+)/)?.[1] ?? "";

/**
 * Sport panel: the menu item's links in a bold column, then image tiles for the collections those
 * links point to (falling back to the store's collections), then a promo card.
 */
function SportPanel({ item, collections, promo, context }: { item: SfMenuItem; collections: SfCollection[]; promo: Promo; context: StorefrontContext }) {
  const links = item.children ?? [];
  const bySlug = new Map(collections.map((c) => [c.slug, c]));
  const linked = links.map((l) => bySlug.get(slugOf(l.url))).filter((c): c is SfCollection => Boolean(c));
  const tiles = (linked.length >= 2 ? linked : collections).slice(0, 6);
  return (
    <Container width="wide" className="grid gap-8 py-8 lg:grid-cols-[220px_1fr_280px]">
      <div>
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] opacity-50">{item.label}</p>
        <ul className="space-y-1">
          {links.map((l) => (
            <li key={l.id}>
              <SmartLink href={l.url} className="stride-panel-link block py-1 font-heading text-2xl uppercase leading-tight transition hover:translate-x-1 hover:text-pai-accent">
                {l.label}
              </SmartLink>
              {l.children?.length ? (
                <ul className="mb-2 mt-1 space-y-1 border-l border-pai-border pl-3">
                  {l.children.map((c) => (
                    <li key={c.id}>
                      <SmartLink href={c.url} className="text-sm opacity-70 hover:text-pai-accent hover:opacity-100">
                        {c.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
          <li className="pt-3">
            <SmartLink href={item.url || context.url("/collections")} className="stride-link text-sm">
              Shop all
            </SmartLink>
          </li>
        </ul>
      </div>
      {tiles.length ? (
        <ul className="grid grid-cols-3 gap-3">
          {tiles.map((c, i) => (
            <li key={c.id}>
              <SmartLink href={c.url} className="stride-tile group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden bg-pai-fg p-3 text-white">
                {c.image ? <img src={c.image.url} alt="" loading="lazy" decoding="async" className="stride-tile-img absolute inset-0 -z-20 size-full object-cover" /> : null}
                <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span aria-hidden className="absolute left-3 top-2 font-heading text-lg text-white/80">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-heading text-xl uppercase leading-none">{c.title}</span>
              </SmartLink>
            </li>
          ))}
        </ul>
      ) : (
        <div />
      )}
      {promo ? (
        <SmartLink href={promo.href} className="stride-tile group relative isolate hidden min-h-72 flex-col justify-end overflow-hidden bg-pai-fg p-5 text-white lg:flex">
          <img src={promo.image} alt="" loading="lazy" decoding="async" className="stride-tile-img absolute inset-0 -z-20 size-full object-cover" />
          <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          {promo.eyebrow ? <span className="stride-tag stride-tag-accent mb-3 w-fit">{promo.eyebrow}</span> : null}
          <span className="font-heading text-3xl uppercase leading-[0.95]">{promo.heading}</span>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em]">
            Shop now <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </SmartLink>
      ) : null}
    </Container>
  );
}

/* ─────────────────────────── section ─────────────────────────── */

export const strideHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Bold uppercase header with a sport mega menu (image tiles per collection), transparent over the home hero.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 120 },
      { type: "menu", id: "menu", label: "Menu", default: "main" },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "checkbox", id: "transparent_on_home", label: "Transparent over the home page hero", default: true, info: "Use with the Video hero as the first home page section." },
      {
        type: "select",
        id: "nav_align",
        label: "Menu position",
        default: "center",
        options: [
          { value: "left", label: "Next to the logo" },
          { value: "center", label: "Centered" },
        ],
      },
      { type: "checkbox", id: "show_account", label: "Show account icon", default: true },
      { type: "header", label: "Mega menu" },
      { type: "checkbox", id: "mega_tiles", label: "Show collection image tiles in dropdowns", default: true },
      { type: "range", id: "mega_limit", label: "Collections loaded", min: 3, max: 12, step: 1, default: 8 },
      { type: "checkbox", id: "show_promo", label: "Show promo card", default: true },
      { type: "image", id: "promo_image", label: "Promo image", default: IMG.womanBarbell },
      { type: "text", id: "promo_eyebrow", label: "Promo badge", default: "New season" },
      { type: "text", id: "promo_heading", label: "Promo heading", default: "Train harder in lighter kit" },
      { type: "url", id: "promo_link", label: "Promo link", default: "/collections/activewear" },
      { type: "header", label: "Highlight link" },
      { type: "text", id: "highlight_label", label: "Label", default: "Sale", info: "Shown in the accent colour at the end of the menu. Leave empty to hide." },
      { type: "url", id: "highlight_link", label: "Link", default: "/collections/all" },
      schemeField("default"),
    ],
    presets: [{ name: "Header" }],
  },
  component: async ({ settings: s, context }) => {
    const [items, collections] = await Promise.all([
      loadMenu(context, str(s.menu, "main")),
      bool(s.mega_tiles, true) ? context.data.getCollections({ limit: num(s.mega_limit, 8) }).catch(() => [] as SfCollection[]) : Promise.resolve([] as SfCollection[]),
    ]);
    const transparent = bool(s.transparent_on_home, true) && context.template === "index";
    const logoWidth = num(s.logo_width, num(context.theme.logo_width, 120));
    const promo: Promo =
      bool(s.show_promo, true) && str(s.promo_image)
        ? { image: str(s.promo_image), eyebrow: str(s.promo_eyebrow), heading: str(s.promo_heading), href: resolveHref(context, s.promo_link, "/collections/all") }
        : null;
    const highlightHref = resolveHref(context, s.highlight_link);
    const center = s.nav_align !== "left";
    const navLink =
      "stride-nav-link relative inline-flex items-center gap-1 py-2 text-[0.8rem] font-bold uppercase tracking-[0.12em] transition data-[open=true]:text-pai-accent";

    return (
      <HeaderShell
        sticky={bool(s.sticky, true)}
        transparent={transparent}
        className={cn("stride-header [--pai-header-h:72px]", !transparent && schemeClass(s.color_scheme))}
      >
        <Container width="wide" className="flex h-[72px] items-center gap-4 lg:gap-8">
          <MobileMenu items={items} storeName={context.store.name} logoUrl={str(s.logo) || context.store.logoUrl} showAccount={bool(s.show_account, true)} className="-ml-2 lg:hidden" />
          <div className={cn("flex items-center", center ? "flex-1 lg:flex-none" : "flex-1 lg:flex-none")}>
            <Logo context={context} image={str(s.logo)} width={logoWidth} invertOnTransparent={transparent} className="stride-logo" />
          </div>
          <nav aria-label="Main" className={cn("hidden lg:flex", center ? "flex-1 justify-center" : "flex-1")}>
            <ul className="flex items-center gap-7 xl:gap-9">
              {items.map((item) => (
                <li key={item.id}>
                  {item.children?.length ? (
                    <MegaMenu label={item.label} active={item.active} className={navLink}>
                      <SportPanel item={item} collections={collections} promo={promo} context={context} />
                    </MegaMenu>
                  ) : (
                    <SmartLink href={item.url} className={cn(navLink, item.active && "stride-nav-active")}>
                      {item.label}
                    </SmartLink>
                  )}
                </li>
              ))}
              {str(s.highlight_label) && highlightHref ? (
                <li>
                  <SmartLink href={highlightHref} className={cn(navLink, "text-pai-accent")}>
                    {str(s.highlight_label)}
                  </SmartLink>
                </li>
              ) : null}
            </ul>
          </nav>
          <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
            <SearchToggle className="stride-icon-btn size-11" />
            {bool(s.show_account, true) ? <AccountLink className="stride-icon-btn hidden size-11 justify-center sm:inline-flex" /> : null}
            <CartButton className="stride-icon-btn stride-cart size-11" />
          </div>
        </Container>
      </HeaderShell>
    );
  },
});
