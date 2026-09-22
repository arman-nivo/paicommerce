/**
 * Lumière header group: a thin black announcement bar with gold lettering, and a maison-style
 * header — centred serif wordmark, gold hairline rules above and below a spaced small-caps
 * navigation, thin-stroke icons and an optional transparent mode over the cinematic hero.
 */
import { defineSection, type SfMenuItem } from "@pai/theme-sdk";
import { Container, Icon, Link, SmartLink, bool, cn, loadMenu, num, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MenuDropdown, MobileMenu, SearchToggle } from "@pai/theme-kit/client";
import { Whisper } from "../client/whisper";
import { HeaderMeasure } from "../client/header-measure";
import { whatsappHref } from "./_lumiere";
import { LumiereKeyframes } from "./_keyframes";

/* ─────────────────────────── announcement ─────────────────────────── */

export const lumiereAnnouncement = defineSection({
  schema: {
    type: "announcement-bar",
    name: "Announcement bar",
    category: "header",
    icon: "megaphone",
    group: "header",
    limit: 1,
    description: "Thin black bar with gold lettering. Messages cross-fade slowly.",
    settings: [
      { type: "color", id: "background", label: "Background", default: "#0d0d0d" },
      { type: "color", id: "text_color", label: "Text colour", default: "#cdb07c", info: "Gold on black is the Lumière signature." },
      { type: "range", id: "speed", label: "Change message every", min: 4, max: 12, step: 1, unit: "s", default: 6 },
      { type: "text", id: "left_text", label: "Left text (desktop)", default: "Dhanmondi atelier · By appointment" },
      { type: "url", id: "left_link", label: "Left text link", default: "/pages/contact" },
      { type: "checkbox", id: "show_phone", label: "Show phone / WhatsApp on the right (desktop)", default: true },
      { type: "text", id: "right_text", label: "Right text", info: "Replaces the phone number when set." },
    ],
    blocks: [
      {
        type: "announcement",
        name: "Announcement",
        limit: 5,
        settings: [
          { type: "text", id: "text", label: "Text", default: "Complimentary insured delivery" },
          { type: "url", id: "link", label: "Link" },
        ],
      },
    ],
    maxBlocks: 5,
    presets: [{ name: "Announcement bar", blocks: [{ type: "announcement", settings: { text: "Complimentary insured delivery · Certified hallmarked gold" } }] }],
  },
  component: ({ settings: s, blocks, context }) => {
    const messages = blocks.length
      ? blocks.map((b) => ({ id: b.id, text: str(b.settings.text), href: resolveHref(context, b.settings.link) })).filter((m) => m.text)
      : str(context.theme.announcement_text)
        ? [{ id: "global", text: str(context.theme.announcement_text), href: resolveHref(context, context.theme.announcement_link) }]
        : [];
    if (!messages.length) return null;
    const bg = str(s.background, "#0d0d0d");
    const fg = str(s.text_color, "#cdb07c");
    const phone = context.store.phone;
    const wa = str(context.theme.social_whatsapp) || phone || "";
    const leftHref = resolveHref(context, s.left_link);
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
      <div role="region" aria-label="Announcements" className="lumiere-announce text-[0.66rem] uppercase tracking-[0.28em]" style={{ background: bg, color: fg }}>
        <Container className="grid min-h-9 grid-cols-1 items-center gap-4 py-2 lg:grid-cols-[1fr_auto_1fr]">
          <p className="hidden truncate opacity-80 lg:block">
            {str(s.left_text) ? leftHref ? <SmartLink href={leftHref} className="hover:underline hover:underline-offset-4">{str(s.left_text)}</SmartLink> : str(s.left_text) : null}
          </p>
          <Whisper interval={num(s.speed, 6) * 1000} className="min-w-0 text-center lg:min-w-[26rem]">
            {nodes}
          </Whisper>
          <p className="hidden justify-end gap-5 opacity-80 lg:flex">
            {str(s.right_text) ? (
              <span>{str(s.right_text)}</span>
            ) : bool(s.show_phone, true) && phone ? (
              <>
                <a href={`tel:${phone}`} className="hover:underline hover:underline-offset-4">{phone}</a>
                {wa ? (
                  <a href={whatsappHref(wa)} target="_blank" rel="noopener" className="hover:underline hover:underline-offset-4">
                    WhatsApp
                  </a>
                ) : null}
              </>
            ) : null}
          </p>
        </Container>
      </div>
    );
  },
});

/* ─────────────────────────── header ─────────────────────────── */

function Nav({ items, className }: { items: SfMenuItem[]; className?: string }) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-1 text-[0.7rem] font-medium uppercase tracking-[0.26em]">
        {items.map((item) => (
          <li key={item.id}>
            {item.children?.length ? (
              <MenuDropdown item={item} className="lumiere-nav-dd" />
            ) : (
              <SmartLink href={item.url} className={cn("lumiere-nav-link relative inline-block py-3.5", item.active && "is-active")}>
                {item.label}
              </SmartLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export const lumiereHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Centred serif wordmark, gold hairline rules around a small-caps menu and thin-stroke icons.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store name set as a serif wordmark." },
      { type: "range", id: "logo_width", label: "Logo width", min: 80, max: 300, step: 5, unit: "px", default: 170 },
      { type: "text", id: "tagline", label: "Line under the wordmark", default: "Fine jewellery · Dhaka · Est. 1998", info: "Tiny small-caps line. Leave empty to hide." },
      { type: "menu", id: "menu", label: "Menu", default: "main" },
      {
        type: "select",
        id: "wordmark_case",
        label: "Wordmark style",
        default: "caps",
        options: [
          { value: "caps", label: "Spaced capitals" },
          { value: "normal", label: "As typed" },
          { value: "italic", label: "Italic" },
        ],
      },
      { type: "checkbox", id: "hairlines", label: "Gold rules above and below the menu", default: true },
      { type: "checkbox", id: "icon_labels", label: "Show text labels next to icons (desktop)", default: false },
      { type: "text", id: "appointment_label", label: "Appointment link label", default: "Book a private viewing", info: "Shown on the left on desktop. Leave empty to hide." },
      { type: "url", id: "appointment_link", label: "Appointment link", default: "/pages/contact" },
      { type: "checkbox", id: "show_account", label: "Show account icon", default: true },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "checkbox", id: "transparent_on_home", label: "Transparent over the home page hero", default: false, info: "Pairs with the Cinematic hero as the first home page section." },
      schemeField("default"),
    ],
    presets: [{ name: "Header" }],
  },
  component: async ({ settings: s, context }) => {
    const items = await loadMenu(context, str(s.menu, "main"));
    const transparent = bool(s.transparent_on_home) && context.template === "index";
    const labels = bool(s.icon_labels);
    const logoSrc = str(s.logo) || context.store.logoUrl;
    const wcase = str(s.wordmark_case, "caps");
    const tagline = str(s.tagline);
    const appt = str(s.appointment_label);
    const apptHref = resolveHref(context, s.appointment_link, "/pages/contact");
    const logo = (
      <Link href={context.url("/")} aria-label={`${context.store.name} home`} className="lumiere-logo flex flex-col items-center text-center">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={context.store.name}
            style={{ width: num(s.logo_width, 170), maxWidth: "min(52vw, 100%)" }}
            className="h-auto max-h-16 object-contain in-data-[transparent=true]:brightness-0 in-data-[transparent=true]:invert"
          />
        ) : (
          <span
            className={cn(
              "lumiere-wordmark font-heading leading-none",
              wcase === "caps" && "uppercase tracking-[0.32em] [margin-right:-0.32em]",
              wcase === "italic" && "italic",
            )}
          >
            {context.store.name}
          </span>
        )}
        {tagline ? <span className="mt-2 hidden text-[0.58rem] uppercase tracking-[0.34em] opacity-60 md:block">{tagline}</span> : null}
      </Link>
    );
    const iconCls = "lumiere-icon relative inline-flex h-10 min-w-10 items-center justify-center gap-2 transition hover:text-[var(--lumiere-gold)] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current";
    const lab = (t: string) => (labels ? <span className="hidden text-[0.64rem] uppercase tracking-[0.24em] xl:inline">{t}</span> : null);
    return (
      <HeaderShell sticky={bool(s.sticky, true)} transparent={transparent} className={cn("lumiere-header", !transparent && schemeClass(s.color_scheme))}>
        <LumiereKeyframes />
        {transparent ? <HeaderMeasure /> : null}
        <Container>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-4 md:py-6">
            <div className="flex items-center gap-1 md:gap-5">
              <MobileMenu items={items} storeName={context.store.name} logoUrl={logoSrc} showAccount={bool(s.show_account, true)} className="lumiere-icon md:hidden" />
              <span className="flex items-center">
                <SearchToggle className={iconCls} label="Search" />
                {lab("Search")}
              </span>
              {appt ? (
                <SmartLink href={apptHref} className="lumiere-appt hidden items-center gap-2 text-[0.64rem] uppercase tracking-[0.24em] transition hover:text-[var(--lumiere-gold)] lg:inline-flex">
                  <Icon name="calendar" className="size-[15px]" strokeWidth={1.1} />
                  {appt}
                </SmartLink>
              ) : null}
            </div>
            {logo}
            <div className="flex items-center justify-end gap-1 md:gap-3">
              {bool(s.show_account, true) ? (
                <span className="hidden items-center sm:flex">
                  <AccountLink className={iconCls} />
                  {lab("Account")}
                </span>
              ) : null}
              <span className="flex items-center">
                <CartButton className={iconCls} label="Shopping bag" icon={<Icon name="shopping-bag" className="size-5" strokeWidth={1.1} />} />
                {lab("Bag")}
              </span>
            </div>
          </div>
        </Container>
        {items.length ? (
          <div className={cn("lumiere-navbar hidden md:block", bool(s.hairlines, true) && "lumiere-navbar-ruled")}>
            <Container>
              <Nav items={items} />
            </Container>
          </div>
        ) : null}
      </HeaderShell>
    );
  },
});
