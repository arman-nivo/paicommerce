import { defineSection, type SfMenuItem, type StorefrontContext } from "@pai/theme-sdk";
import { Container, Logo, SmartLink, bool, cn, loadMenu, num, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MobileMenu, SearchBox, SearchToggle } from "@pai/theme-kit/client";
import { MegaMenuItem } from "../client/mega-menu";
import { IMG } from "../images";

/* ─────────────────────────── mega menu panel (server-rendered) ─────────────────────────── */

type Promo = { image: string; heading: string; text: string; href: string; label: string } | null;

function MegaPanel({ item, promo }: { item: SfMenuItem; promo: Promo }) {
  const children = item.children ?? [];
  // Children that have their own children become titled columns; the rest are grouped in one list.
  const grouped = children.filter((c) => c.children?.length);
  const flat = children.filter((c) => !c.children?.length);
  const columns: { id: string; title: string; href?: string; links: SfMenuItem[] }[] = [
    ...(flat.length ? [{ id: `${item.id}-flat`, title: item.label, href: item.url, links: flat }] : []),
    ...grouped.map((g) => ({ id: g.id, title: g.label, href: g.url, links: g.children ?? [] })),
  ];
  return (
    <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_minmax(260px,340px)]">
      <div className="grid grid-cols-2 gap-x-10 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
        {columns.map((col) => (
          <div key={col.id}>
            <p className="pai-eyebrow mb-4">
              {col.href ? (
                <SmartLink href={col.href} className="hover:underline hover:underline-offset-4">
                  {col.title}
                </SmartLink>
              ) : (
                col.title
              )}
            </p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.id}>
                  <SmartLink href={l.url} className="aurora-underline text-[0.95rem] opacity-80 transition hover:opacity-100">
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="col-span-full border-t border-pai-border pt-5">
          <SmartLink href={item.url} className="text-sm font-semibold underline underline-offset-4">
            Shop all {item.label}
          </SmartLink>
        </div>
      </div>
      {promo ? (
        <SmartLink href={promo.href} className="group relative hidden aspect-[4/5] overflow-hidden rounded-pai bg-pai-muted lg:block">
          <img src={promo.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.03]" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 p-6 text-white">
            {promo.heading ? <span className="block font-heading text-2xl leading-tight">{promo.heading}</span> : null}
            {promo.text ? <span className="mt-1 block text-sm opacity-85">{promo.text}</span> : null}
            {promo.label ? <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.18em] underline underline-offset-4">{promo.label}</span> : null}
          </span>
        </SmartLink>
      ) : null}
    </Container>
  );
}

function AuroraNav({ items, mega, promo, className }: { items: SfMenuItem[]; mega: boolean; promo: Promo; className?: string }) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex flex-wrap items-center gap-x-8 gap-y-1 text-[0.8rem] font-medium uppercase tracking-[0.14em]">
        {items.map((item) => (
          <li key={item.id}>
            {item.children?.length && mega ? (
              <MegaMenuItem label={item.label} active={item.active}>
                <MegaPanel item={item} promo={promo} />
              </MegaMenuItem>
            ) : item.children?.length ? (
              <MegaMenuItem label={item.label} active={item.active}>
                <Container className="py-8">
                  <ul className="flex flex-wrap gap-x-10 gap-y-3 text-[0.95rem] normal-case tracking-normal">
                    <li>
                      <SmartLink href={item.url} className="font-semibold underline underline-offset-4">
                        All {item.label}
                      </SmartLink>
                    </li>
                    {item.children.map((c) => (
                      <li key={c.id}>
                        <SmartLink href={c.url} className="opacity-80 hover:opacity-100">
                          {c.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </Container>
              </MegaMenuItem>
            ) : (
              <SmartLink
                href={item.url}
                className={cn("aurora-nav-link relative inline-block py-2 opacity-90 transition hover:opacity-100", item.active && "underline decoration-1 underline-offset-8")}
              >
                {item.label}
              </SmartLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function readPromo(context: StorefrontContext, s: Record<string, unknown>): Promo {
  if (!bool(s.show_promo, true)) return null;
  const image = str(s.promo_image);
  if (!image) return null;
  return {
    image,
    heading: str(s.promo_heading),
    text: str(s.promo_text),
    label: str(s.promo_label),
    href: resolveHref(context, s.promo_link, "/collections/all"),
  };
}

/* ─────────────────────────── section ─────────────────────────── */

export const auroraHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Logo, navigation with mega menu, search, account and cart.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 130 },
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
      { type: "checkbox", id: "transparent_on_home", label: "Transparent over the home page hero", default: false, info: "Use with a full-bleed hero as the first section." },
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
      { type: "header", label: "Mega menu", info: "Menu items with sub-items open a full-width panel. Sub-items that have their own links become columns." },
      { type: "checkbox", id: "mega_menu", label: "Enable mega menu", default: true },
      { type: "checkbox", id: "show_promo", label: "Show featured image in mega menu", default: true },
      { type: "image", id: "promo_image", label: "Featured image", default: IMG.editorialWoman },
      { type: "text", id: "promo_heading", label: "Featured heading", default: "The new season edit" },
      { type: "text", id: "promo_text", label: "Featured text", default: "Considered pieces for every day." },
      { type: "text", id: "promo_label", label: "Featured link label", default: "Shop now" },
      { type: "url", id: "promo_link", label: "Featured link", default: "/collections/all" },
    ],
    presets: [{ name: "Header" }],
  },
  component: async ({ settings: s, context }) => {
    const items = await loadMenu(context, str(s.menu, "main"));
    const layout = s.layout === "inherit" || !s.layout ? str(context.theme.header_style, "logo_center") : String(s.layout);
    const transparent = bool(s.transparent_on_home) && context.template === "index";
    const logoWidth = num(s.logo_width, num(context.theme.logo_width, 130));
    const search = str(s.search_style, "icon");
    const mega = bool(s.mega_menu, true);
    const promo = readPromo(context, s);

    const icons = (
      <div className="flex items-center justify-end gap-0.5 sm:gap-2">
        {search === "icon" ? <SearchToggle className="size-10" /> : null}
        {search === "bar" ? <SearchToggle className="size-10 lg:hidden" /> : null}
        {bool(s.show_account, true) ? <AccountLink className="hidden size-10 justify-center sm:inline-flex" /> : null}
        <CartButton className="size-10" />
      </div>
    );
    const mobile = (
      <MobileMenu
        items={items}
        storeName={context.store.name}
        logoUrl={str(s.logo) || context.store.logoUrl}
        showAccount={bool(s.show_account, true)}
        className={layout === "minimal" ? "" : "md:hidden"}
      />
    );
    const logo = <Logo context={context} image={str(s.logo)} width={logoWidth} invertOnTransparent={transparent} className="aurora-logo" />;
    const nav = (cls: string) => <AuroraNav items={items} mega={mega} promo={promo} className={cls} />;

    return (
      <HeaderShell sticky={bool(s.sticky, true)} transparent={transparent} className={cn("aurora-header", !transparent && schemeClass(s.color_scheme))}>
        {layout === "logo_center" ? (
          <Container className="pt-4 md:pt-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex items-center gap-2">
                {mobile}
                {search === "bar" ? <SearchBox className="hidden w-full max-w-xs lg:block" /> : null}
              </div>
              {logo}
              {icons}
            </div>
            {nav("mt-2 hidden justify-center pb-1 md:flex")}
            <div className="h-3 md:hidden" />
          </Container>
        ) : layout === "minimal" ? (
          <Container className="grid min-h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 py-3">
            <div>{mobile}</div>
            {logo}
            {icons}
          </Container>
        ) : (
          <Container className="flex min-h-16 items-center gap-4 py-3 md:min-h-[76px]">
            {mobile}
            <div className="flex flex-1 items-center md:flex-none">{logo}</div>
            {nav("hidden flex-1 justify-center md:flex")}
            {search === "bar" ? <SearchBox className="hidden w-64 lg:block" /> : null}
            {icons}
          </Container>
        )}
      </HeaderShell>
    );
  },
});
