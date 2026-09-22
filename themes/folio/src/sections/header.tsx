/**
 * Folio header — editorial and search-first.
 *
 * Desktop: masthead (logo + small-caps tagline) · a large predictive search field as the main
 * navigation element · account / reading list / cart. Below it, a "genres" row built from genre
 * blocks or a menu (items with children open a dropdown).
 * Mobile: menu · logo · cart, then an always-visible search field and a swipeable genre strip.
 */
import { defineSection, type SfMenuItem, type StorefrontContext } from "@pai/theme-sdk";
import { Container, Link, SmartLink, bool, cn, loadMenu, num, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MenuDropdown, MobileMenu, SearchBox } from "@pai/theme-kit/client";
import { ReadingListMenu } from "../client/wishlist";

function Masthead({ context, logo, width, tagline }: { context: StorefrontContext; logo: string; width: number; tagline: string }) {
  const src = logo || context.store.logoUrl;
  return (
    <Link
      href={context.url("/")}
      aria-label={`${context.store.name} — home`}
      className="folio-masthead inline-flex shrink-0 flex-col justify-center rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-4"
    >
      {src ? (
        <img src={src} alt={context.store.name} style={{ width, maxWidth: "min(44vw, 100%)" }} className="h-auto max-h-14 object-contain" />
      ) : (
        <span className="font-heading text-[1.45rem] leading-none tracking-[-0.01em] md:text-[1.9rem]">{context.store.name}</span>
      )}
      {tagline ? <span className="mt-1.5 hidden text-[10px] font-medium uppercase tracking-[0.28em] opacity-60 md:block">{tagline}</span> : null}
    </Link>
  );
}

type Genre = { id: string; label: string; url: string; children?: SfMenuItem[]; active?: boolean; highlight?: boolean };

function genreLinkClass(active?: boolean, highlight?: boolean) {
  return cn(
    "folio-genre-link relative inline-flex items-center whitespace-nowrap py-3 text-[0.74rem] font-medium uppercase tracking-[0.12em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2",
    highlight ? "text-pai-primary" : "opacity-80 hover:opacity-100",
    active && "opacity-100 [&]:underline [&]:decoration-1 [&]:underline-offset-[10px]",
  );
}

function GenreRow({ genres, trailing }: { genres: Genre[]; trailing?: string }) {
  if (!genres.length) return null;
  return (
    <div className="hidden border-t border-pai-border md:block">
      <Container className="flex items-center gap-6">
        <nav aria-label="Genres" className="min-w-0 flex-1">
          <ul className="flex flex-wrap items-center gap-x-6 xl:gap-x-8">
            {genres.map((g) =>
              g.children?.length ? (
                <li key={g.id} className="text-[0.74rem] font-medium uppercase tracking-[0.12em]">
                  <MenuDropdown item={{ id: g.id, label: g.label, url: g.url, children: g.children }} className="py-0.5 opacity-80 hover:opacity-100" />
                </li>
              ) : (
                <li key={g.id}>
                  <SmartLink href={g.url} className={genreLinkClass(g.active, g.highlight)}>
                    {g.label}
                  </SmartLink>
                </li>
              ),
            )}
          </ul>
        </nav>
        {trailing ? <p className="hidden shrink-0 font-heading text-[0.8rem] italic opacity-70 xl:block">{trailing}</p> : null}
      </Container>
    </div>
  );
}

function MobileGenres({ genres }: { genres: Genre[] }) {
  if (!genres.length) return null;
  return (
    <nav aria-label="Genres" className="md:hidden">
      <ul className="pai-no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-3">
        {genres.map((g) => (
          <li key={g.id} className="shrink-0">
            <SmartLink
              href={g.url}
              className={cn(
                "inline-flex rounded-full border px-3.5 py-1.5 text-[0.78rem] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary",
                g.active || g.highlight ? "border-pai-primary bg-pai-primary text-pai-primary-fg" : "border-pai-border bg-pai-bg",
              )}
            >
              {g.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export const folioHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Masthead, a large predictive search, a genres row, and account / reading list / cart.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo, or your store name set in the heading font." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 150 },
      { type: "text", id: "tagline", label: "Masthead tagline", default: "Booksellers since 2012", info: "Small caps under the logo (desktop)." },
      { type: "text", id: "search_placeholder", label: "Search placeholder", default: "Search by title, author or ISBN…" },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "checkbox", id: "show_account", label: "Show account icon", default: true },
      { type: "checkbox", id: "show_reading_list", label: "Show reading list (saved books)", default: true },
      { type: "header", label: "Genres row", info: "Add Genre blocks, or leave them out to use a menu." },
      { type: "menu", id: "menu", label: "Genres menu", default: "main", info: "Used when there are no Genre blocks. Also shown in the mobile drawer." },
      { type: "text", id: "genre_note", label: "Right-hand note (desktop)", default: "Free delivery inside Dhaka over ৳1,500" },
      schemeField("default"),
    ],
    blocks: [
      {
        type: "genre",
        name: "Genre",
        limit: 12,
        settings: [
          { type: "text", id: "label", label: "Label", default: "Fiction" },
          { type: "collection", id: "collection", label: "Collection" },
          { type: "url", id: "link", label: "Link", info: "Overrides the collection link." },
          { type: "checkbox", id: "highlight", label: "Highlight (e.g. Sale, New)", default: false },
        ],
      },
    ],
    maxBlocks: 12,
    presets: [
      {
        name: "Header",
        blocks: [
          { type: "genre", settings: { label: "Bestsellers", collection: "bestsellers" } },
          { type: "genre", settings: { label: "Fiction", collection: "" } },
          { type: "genre", settings: { label: "Non-fiction", collection: "" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const items = await loadMenu(context, str(s.menu, "main"));
    const logoWidth = num(s.logo_width, num(context.theme.logo_width, 150));
    const path = context.path;
    const genres: Genre[] = blocks.length
      ? blocks
          .map((b) => {
            const bs = b.settings;
            const col = str(bs.collection);
            const url = str(bs.link) ? resolveHref(context, bs.link) : col ? context.url(`/collections/${col}`) : context.url("/collections/all");
            return { id: b.id, label: str(bs.label), url, active: !!col && path === `/collections/${col}`, highlight: bool(bs.highlight) };
          })
          .filter((g) => g.label)
      : items.map((m) => ({ id: m.id, label: m.label, url: m.url, children: m.children, active: m.active }));
    const placeholder = str(s.search_placeholder, "Search by title, author or ISBN…");
    const iconBtn =
      "relative inline-grid size-10 place-items-center rounded-full transition hover:bg-pai-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary";

    return (
      <HeaderShell sticky={bool(s.sticky, true)} className={cn("folio-header", schemeClass(s.color_scheme))}>
        <Container className="flex items-center gap-3 pb-2 pt-3 md:gap-8 md:py-5">
          <MobileMenu items={items} storeName={context.store.name} logoUrl={str(s.logo) || context.store.logoUrl} showSearch={false} showAccount={bool(s.show_account, true)} className="-ml-2 md:hidden" />
          <div className="flex flex-1 justify-center md:flex-none md:justify-start">
            <Masthead context={context} logo={str(s.logo)} width={logoWidth} tagline={str(s.tagline)} />
          </div>
          <SearchBox placeholder={placeholder} className="folio-search hidden flex-1 md:block md:max-w-2xl lg:mx-auto" />
          <div className="flex items-center justify-end gap-0.5 md:gap-1">
            {bool(s.show_account, true) ? <AccountLink className={cn(iconBtn, "hidden sm:inline-grid")} /> : null}
            {bool(s.show_reading_list, true) ? <ReadingListMenu className={iconBtn} /> : null}
            <CartButton className={cn(iconBtn, "-mr-2 md:mr-0")} />
          </div>
        </Container>
        <Container className="md:hidden">
          <SearchBox placeholder={placeholder} className="folio-search mb-3" />
          <MobileGenres genres={genres} />
        </Container>
        <GenreRow genres={genres} trailing={str(s.genre_note)} />
      </HeaderShell>
    );
  },
});
