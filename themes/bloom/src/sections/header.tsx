/**
 * Bloom header group: a pastel rotating announcement bar and an airy, centred-logo header with
 * a pill search, soft icon buttons and a spaced navigation row.
 */
import { defineSection, type SfMenuItem } from "@pai/theme-sdk";
import { Container, Logo, SmartLink, SocialLinks, bool, cn, loadMenu, num, readableOn, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MenuDropdown, MobileMenu, SearchBox, SearchToggle } from "@pai/theme-kit/client";
import { Rotator } from "../client/rotator";

/* ─────────────────────────── announcement ─────────────────────────── */

export const bloomAnnouncement = defineSection({
  schema: {
    type: "announcement-bar",
    name: "Announcement bar",
    category: "header",
    icon: "megaphone",
    group: "header",
    limit: 1,
    description: "Pastel bar above the header. Messages rotate one at a time.",
    settings: [
      { type: "color", id: "background", label: "Background", default: "#f6dde3" },
      { type: "color", id: "text_color", label: "Text colour", info: "Leave empty to pick automatically." },
      {
        type: "select",
        id: "style",
        label: "Display",
        default: "rotate",
        options: [
          { value: "rotate", label: "One message at a time" },
          { value: "static", label: "All messages side by side" },
        ],
      },
      { type: "range", id: "speed", label: "Change message every", min: 3, max: 10, step: 1, unit: "s", default: 5 },
      { type: "checkbox", id: "show_social", label: "Show social icons (desktop)", default: true },
      { type: "text", id: "side_text", label: "Left text (desktop)", default: "Dermatologist-approved · Cruelty-free" },
    ],
    blocks: [
      {
        type: "announcement",
        name: "Announcement",
        limit: 6,
        settings: [
          { type: "text", id: "text", label: "Text", default: "Free delivery on orders over ৳2,500" },
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
    const bg = str(s.background, "#f6dde3");
    const fg = str(s.text_color) || readableOn(bg);
    const nodes = messages.map((m) =>
      m.href ? (
        <SmartLink key={m.id} href={m.href} className="underline-offset-4 hover:underline">
          {m.text}
        </SmartLink>
      ) : (
        <span key={m.id}>{m.text}</span>
      ),
    );
    return (
      <div role="region" aria-label="Announcements" className="text-[0.78rem] font-medium tracking-[0.02em]" style={{ background: bg, color: fg }}>
        <Container className="grid min-h-9 grid-cols-1 items-center gap-4 py-1.5 lg:grid-cols-[1fr_auto_1fr]">
          <p className="hidden truncate opacity-75 lg:block">{str(s.side_text)}</p>
          {s.style === "static" ? (
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center">
              {nodes.map((n, i) => (
                <span key={i} className={cn("inline-flex items-center gap-6", i > 0 && "hidden md:inline-flex")}>
                  {i > 0 ? <span aria-hidden className="opacity-40">✿</span> : null}
                  {n}
                </span>
              ))}
            </div>
          ) : (
            <Rotator interval={num(s.speed, 5) * 1000}>{nodes}</Rotator>
          )}
          <div className="hidden justify-end lg:flex">{bool(s.show_social, true) ? <SocialLinks context={context} iconClassName="size-7 border-0" /> : null}</div>
        </Container>
      </div>
    );
  },
});

/* ─────────────────────────── header ─────────────────────────── */

function Nav({ items, className, caps }: { items: SfMenuItem[]; className?: string; caps: boolean }) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className={cn("flex flex-wrap items-center justify-center gap-x-9 gap-y-1", caps ? "text-[0.76rem] font-medium uppercase tracking-[0.2em]" : "text-[0.95rem]")}>
        {items.map((item) => (
          <li key={item.id}>
            {item.children?.length ? (
              <MenuDropdown item={item} className="bloom-nav-dd" />
            ) : (
              <SmartLink href={item.url} className={cn("bloom-nav-link relative inline-block py-2.5 transition", item.active && "is-active")}>
                {item.label}
              </SmartLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export const bloomHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Airy header with a centred logo, pill search and spaced navigation.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo, or your store name set in the heading font." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 140 },
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
      { type: "checkbox", id: "uppercase_menu", label: "Small caps menu", default: true },
      { type: "checkbox", id: "search_pill", label: "Show search pill (desktop)", default: true },
      { type: "text", id: "search_placeholder", label: "Search placeholder", default: "Search serums, lipsticks, gifts…" },
      { type: "checkbox", id: "show_account", label: "Show account icon", default: true },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "checkbox", id: "frosted", label: "Frosted glass background", default: true, info: "The header turns translucent with a soft blur as you scroll." },
      { type: "checkbox", id: "transparent_on_home", label: "Transparent over the home page hero", default: false },
      schemeField("default"),
    ],
    presets: [{ name: "Header" }],
  },
  component: async ({ settings: s, context }) => {
    const items = await loadMenu(context, str(s.menu, "main"));
    const transparent = bool(s.transparent_on_home) && context.template === "index";
    const layout = str(s.layout, "centered");
    const caps = bool(s.uppercase_menu, true);
    const logo = (
      <Logo context={context} image={str(s.logo)} width={num(s.logo_width, num(context.theme.logo_width, 140))} invertOnTransparent={transparent} className="bloom-logo" />
    );
    const mobile = <MobileMenu items={items} storeName={context.store.name} logoUrl={str(s.logo) || context.store.logoUrl} showAccount={bool(s.show_account, true)} className="md:hidden" />;
    const iconCls = "size-10 rounded-full transition hover:bg-pai-muted focus-visible:outline-2 focus-visible:outline-pai-accent";
    const icons = (
      <div className="flex items-center justify-end gap-1">
        <SearchToggle className={cn(iconCls, bool(s.search_pill, true) && layout === "centered" && "lg:hidden")} />
        {bool(s.show_account, true) ? <AccountLink className={cn(iconCls, "hidden justify-center sm:inline-flex")} /> : null}
        <CartButton className={iconCls} label="Bag" />
      </div>
    );
    return (
      <HeaderShell
        sticky={bool(s.sticky, true)}
        transparent={transparent}
        className={cn("bloom-header", bool(s.frosted, true) && "bloom-frosted", !transparent && schemeClass(s.color_scheme))}
      >
        {layout === "inline" ? (
          <Container className="flex min-h-[76px] items-center gap-6 py-3">
            {mobile}
            <div className="flex flex-1 md:flex-none">{logo}</div>
            <Nav items={items} caps={caps} className="hidden flex-1 md:block" />
            {icons}
          </Container>
        ) : (
          <Container className="pt-4 md:pt-6">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex items-center gap-2">
                {mobile}
                {bool(s.search_pill, true) ? (
                  <SearchBox placeholder={str(s.search_placeholder, "Search…")} className="bloom-search-pill hidden w-full max-w-[17rem] lg:block" />
                ) : null}
              </div>
              {logo}
              {icons}
            </div>
            <Nav items={items} caps={caps} className="mt-3 hidden pb-2 md:block" />
            <div className="h-3 md:hidden" />
          </Container>
        )}
      </HeaderShell>
    );
  },
});
