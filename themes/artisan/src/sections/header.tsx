/**
 * Artisan header group: a bark-coloured announcement strip with a handwritten side note and
 * cross-stitch separators, and a paper-textured header — centred wordmark with a handwritten
 * tagline, underlined "notebook" search, stitched navigation rule and a kantha running-stitch hem.
 */
import { defineSection, type SfMenuItem } from "@pai/theme-sdk";
import { Container, Logo, SmartLink, SocialLinks, bool, cn, loadMenu, num, readableOn, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MenuDropdown, MobileMenu, SearchBox, SearchToggle } from "@pai/theme-kit/client";
import { CrossKnot } from "./_artisan";

/* ─────────────────────────── announcement ─────────────────────────── */

export const artisanAnnouncement = defineSection({
  schema: {
    type: "announcement-bar",
    name: "Announcement bar",
    category: "header",
    icon: "megaphone",
    group: "header",
    limit: 1,
    description: "Earthy strip above the header: a handwritten note, messages joined by cross-stitches and an optional link.",
    settings: [
      { type: "color", id: "background", label: "Background", default: "#3a2a20" },
      { type: "color", id: "text_color", label: "Text colour", info: "Leave empty to pick automatically." },
      { type: "text", id: "note", label: "Handwritten note (desktop)", default: "made slowly, by hand" },
      { type: "text", id: "link_label", label: "Right link label (desktop)", default: "Visit the workshop" },
      { type: "url", id: "link", label: "Right link", default: "/pages/about" },
      { type: "checkbox", id: "show_social", label: "Show social icons (desktop)", default: false },
    ],
    blocks: [
      {
        type: "announcement",
        name: "Announcement",
        limit: 4,
        settings: [
          { type: "text", id: "text", label: "Text", default: "Cash on delivery in all 64 districts" },
          { type: "url", id: "link", label: "Link" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Announcement bar",
        blocks: [
          { type: "announcement", settings: { text: "Every piece is made by hand in Bangladesh" } },
          { type: "announcement", settings: { text: "Cash on delivery · bKash · Nagad" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const messages = blocks.length
      ? blocks.map((b) => ({ id: b.id, text: str(b.settings.text), href: resolveHref(context, b.settings.link) })).filter((m) => m.text)
      : str(context.theme.announcement_text)
        ? [{ id: "global", text: str(context.theme.announcement_text), href: resolveHref(context, context.theme.announcement_link) }]
        : [];
    if (!messages.length) return null;
    const bg = str(s.background, "#3a2a20");
    const fg = str(s.text_color) || readableOn(bg);
    const link = resolveHref(context, s.link);
    return (
      <div role="region" aria-label="Announcements" className="artisan-announce relative text-[0.76rem] tracking-[0.04em]" style={{ background: bg, color: fg }}>
        <Container className="grid min-h-10 grid-cols-1 items-center gap-4 py-2 lg:grid-cols-[1fr_auto_1fr]">
          <p className="artisan-hand hidden truncate text-lg leading-none opacity-85 lg:block">{str(s.note)}</p>
          <ul className="flex items-center justify-center gap-x-4 text-center">
            {messages.map((m, i) => (
              <li key={m.id} className={cn("items-center gap-4", i === 0 ? "flex" : "hidden md:flex")}>
                {i > 0 ? <CrossKnot className="size-2.5 text-current opacity-50" /> : null}
                {m.href ? (
                  <SmartLink href={m.href} className="underline-offset-4 hover:underline">
                    {m.text}
                  </SmartLink>
                ) : (
                  <span>{m.text}</span>
                )}
              </li>
            ))}
          </ul>
          <div className="hidden items-center justify-end gap-4 lg:flex">
            {str(s.link_label) && link ? (
              <SmartLink href={link} className="uppercase tracking-[0.18em] underline decoration-dashed decoration-1 underline-offset-[6px] opacity-85 hover:opacity-100">
                {str(s.link_label)}
              </SmartLink>
            ) : null}
            {bool(s.show_social) ? <SocialLinks context={context} iconClassName="size-7 border-0" /> : null}
          </div>
        </Container>
      </div>
    );
  },
});

/* ─────────────────────────── header ─────────────────────────── */

function Nav({ items, className }: { items: SfMenuItem[]; className?: string }) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.8rem] font-medium uppercase tracking-[0.16em]">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-center gap-3">
            {i > 0 ? <span aria-hidden className="artisan-nav-dot" /> : null}
            {item.children?.length ? (
              <MenuDropdown item={item} className="artisan-nav-dd" />
            ) : (
              <SmartLink href={item.url} className={cn("artisan-nav-link relative inline-block px-1 py-3", item.active && "is-active")}>
                {item.label}
              </SmartLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export const artisanHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Paper-textured header with a centred wordmark, handwritten tagline, notebook search and stitched hem.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo, or your store name set in the heading font." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 280, step: 5, unit: "px", default: 150 },
      { type: "text", id: "tagline", label: "Handwritten tagline", default: "handmade in Bangladesh", info: "Shown under the logo in the accent font. Leave empty to hide." },
      { type: "menu", id: "menu", label: "Menu", default: "main" },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "centered",
        options: [
          { value: "centered", label: "Centred logo, menu below" },
          { value: "inline", label: "Logo left, menu inline" },
        ],
      },
      { type: "checkbox", id: "show_search", label: "Show notebook search (desktop)", default: true },
      { type: "text", id: "search_placeholder", label: "Search placeholder", default: "Search kantha, pottery, brass…" },
      { type: "checkbox", id: "show_account", label: "Show account icon", default: true },
      { type: "text", id: "cart_label", label: "Cart label", default: "Basket" },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "checkbox", id: "show_hem", label: "Stitched hem under the header", default: true, info: "Uses the stitch colour; hidden when kantha stitches are turned off in theme settings." },
      schemeField("default"),
    ],
    presets: [{ name: "Header" }],
  },
  component: async ({ settings: s, context }) => {
    const items = await loadMenu(context, str(s.menu, "main"));
    const layout = str(s.layout, "centered");
    const tagline = str(s.tagline);
    const cartLabel = str(s.cart_label, "Basket");
    const logo = (
      <div className="flex flex-col items-center text-center">
        <Logo context={context} image={str(s.logo)} width={num(s.logo_width, num(context.theme.logo_width, 150))} className="artisan-logo" />
        {tagline ? <span className="artisan-hand -mt-0.5 hidden text-lg leading-none text-pai-accent sm:block">{tagline}</span> : null}
      </div>
    );
    const mobile = <MobileMenu items={items} storeName={context.store.name} logoUrl={str(s.logo) || context.store.logoUrl} showAccount={bool(s.show_account, true)} className="md:hidden" />;
    const iconCls = "size-10 rounded-pai transition hover:bg-pai-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pai-accent";
    const icons = (
      <div className="flex items-center justify-end gap-1">
        <SearchToggle className={cn(iconCls, bool(s.show_search, true) && layout === "centered" && "lg:hidden")} />
        {bool(s.show_account, true) ? <AccountLink className={cn(iconCls, "hidden justify-center sm:inline-flex")} /> : null}
        <span className="flex items-center gap-2">
          <CartButton className={iconCls} label={cartLabel} />
          <span aria-hidden className="hidden text-[0.78rem] font-medium uppercase tracking-[0.16em] xl:inline">
            {cartLabel}
          </span>
        </span>
      </div>
    );
    return (
      <HeaderShell sticky={bool(s.sticky, true)} className={cn("artisan-header", bool(s.show_hem, true) && "artisan-hem", schemeClass(s.color_scheme))}>
        {layout === "inline" ? (
          <Container className="flex min-h-[84px] items-center gap-6 py-3">
            {mobile}
            <div className="flex flex-1 md:flex-none">{logo}</div>
            <Nav items={items} className="hidden flex-1 md:block" />
            {icons}
          </Container>
        ) : (
          <Container className="pt-4 md:pt-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex items-center gap-2">
                {mobile}
                {bool(s.show_search, true) ? (
                  <SearchBox placeholder={str(s.search_placeholder, "Search…")} className="artisan-search hidden w-full max-w-[18rem] lg:block" />
                ) : null}
              </div>
              {logo}
              {icons}
            </div>
            <div className="artisan-nav-rule mt-3 hidden md:block">
              <Nav items={items} />
            </div>
            <div className="h-3 md:hidden" />
          </Container>
        )}
      </HeaderShell>
    );
  },
});
