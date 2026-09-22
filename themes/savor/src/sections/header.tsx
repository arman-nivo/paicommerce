/**
 * Savor header: a thin "service strip" (live open/closed status, today's hours, phone, WhatsApp,
 * delivery areas) above a warm, menu-card style main bar — logo, category nav set in the heading
 * serif with dot separators, search / account / cart and a prominent "Order now" button.
 * The mobile drawer repeats hours, phone and the order button.
 */
import { defineSection, type SfMenuItem } from "@pai/theme-sdk";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container, Logo, SmartLink, bool, cn, loadMenu, num, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MenuDropdown, MobileMenu, SearchToggle } from "@pai/theme-kit/client";
import { OpenStatus } from "../client/open-status";
import { restaurantInfo } from "../lib/info";

function MenuNav({ items, className }: { items: SfMenuItem[]; className?: string }) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className="savor-nav flex flex-wrap items-center justify-center gap-y-1 font-heading text-[1.02rem]">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-center">
            {i > 0 ? (
              <span aria-hidden className="mx-3 text-pai-accent xl:mx-4">
                ·
              </span>
            ) : null}
            {item.children?.length ? (
              <MenuDropdown item={item} className="savor-nav-item" />
            ) : (
              <SmartLink
                href={item.url}
                className={cn(
                  "savor-nav-item relative inline-block rounded-sm py-2 transition hover:text-pai-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2",
                  item.active && "text-pai-primary",
                )}
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

export const savorHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Logo, menu-style navigation, live opening hours, phone/WhatsApp and an “Order now” button.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 140 },
      { type: "menu", id: "menu", label: "Menu", default: "main" },
      { type: "range", id: "max_items", label: "Menu items shown on desktop", min: 3, max: 10, step: 1, default: 6 },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "checkbox", id: "show_search", label: "Show search", default: true },
      { type: "checkbox", id: "show_account", label: "Show account icon", default: true },
      schemeField("default"),
      { type: "header", label: "Service strip", info: "A slim bar above the header. Hours come from Theme settings › Restaurant." },
      { type: "checkbox", id: "show_strip", label: "Show service strip", default: true },
      { type: "checkbox", id: "show_hours", label: "Show open/closed status & today's hours", default: true },
      { type: "checkbox", id: "show_phone", label: "Show phone", default: true },
      { type: "checkbox", id: "show_whatsapp", label: "Show WhatsApp link", default: true },
      { type: "text", id: "strip_text", label: "Strip message", default: "Free delivery over ৳1,500 in Banani & Gulshan" },
      {
        type: "select",
        id: "strip_scheme",
        label: "Strip colour scheme",
        default: "inverse",
        options: [
          { value: "inverse", label: "Dark" },
          { value: "primary", label: "Primary" },
          { value: "muted", label: "Muted" },
          { value: "default", label: "Default" },
        ],
      },
      { type: "header", label: "Order button" },
      { type: "checkbox", id: "show_cta", label: "Show “Order now” button", default: true },
      { type: "text", id: "cta_label", label: "Button label", info: "Defaults to Theme settings › Restaurant › “Order now” label." },
      { type: "url", id: "cta_link", label: "Button link", info: "Defaults to Theme settings › Restaurant › “Order now” link." },
    ],
    presets: [{ name: "Header" }],
  },
  component: async ({ settings: s, context }) => {
    const info = restaurantInfo(context);
    const all = await loadMenu(context, str(s.menu, "main"));
    const items = all.slice(0, num(s.max_items, 6));
    const logoWidth = num(s.logo_width, num(context.theme.logo_width, 140));
    const ctaLabel = str(s.cta_label) || info.cta.label;
    const ctaHref = str(s.cta_link) ? resolveHref(context, s.cta_link) : info.cta.href;
    const showCta = bool(s.show_cta, true) && !!ctaLabel;
    const hours = bool(s.show_hours, true) && info.week.length > 0;
    const phone = bool(s.show_phone, true) && info.phone;
    const wa = bool(s.show_whatsapp, true) && info.whatsapp;
    const stripText = str(s.strip_text);

    const drawerFooter = (
      <div className="space-y-3 border-t border-pai-border pt-4 text-sm">
        {hours ? (
          <p className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
            <span>
              <OpenStatus week={info.week} timeZone={info.timeZone} fallback={`Today ${info.todayRange}`} />
              <span className="block text-xs opacity-70">Every day {info.todayRange}</span>
            </span>
          </p>
        ) : null}
        {info.phone ? (
          <a href={info.phoneHref} className="flex items-center gap-2 font-medium">
            <Phone className="size-4 opacity-70" aria-hidden /> {info.phone}
          </a>
        ) : null}
        {info.whatsapp ? (
          <a href={info.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-medium">
            <MessageCircle className="size-4 opacity-70" aria-hidden /> Order on WhatsApp
          </a>
        ) : null}
        {showCta ? (
          <SmartLink href={ctaHref} className="pai-btn pai-btn-primary pai-btn-block mt-2">
            {ctaLabel}
          </SmartLink>
        ) : null}
      </div>
    );

    return (
      <>
        {bool(s.show_strip, true) && (hours || phone || wa || stripText) ? (
          <div className={cn("savor-strip text-[0.78rem]", schemeClass(str(s.strip_scheme, "inverse")))} role="region" aria-label="Opening hours and contact">
            <Container className="flex min-h-9 items-center justify-between gap-4 py-1.5">
              {hours ? (
                <OpenStatus week={info.week} timeZone={info.timeZone} fallback={`Open today · ${info.todayRange}`} showDetail className="min-w-0 truncate" />
              ) : (
                <span />
              )}
              {stripText ? (
                <p className="hidden items-center gap-1.5 opacity-90 lg:flex">
                  <MapPin className="size-3.5" aria-hidden /> {stripText}
                </p>
              ) : null}
              <div className="flex shrink-0 items-center gap-4">
                {phone ? (
                  <a href={info.phoneHref} className="inline-flex items-center gap-1.5 font-medium hover:underline hover:underline-offset-4">
                    <Phone className="size-3.5" aria-hidden />
                    <span className="hidden sm:inline">{info.phone}</span>
                    <span className="sm:hidden">Call</span>
                  </a>
                ) : null}
                {wa ? (
                  <a href={info.whatsapp} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 font-medium hover:underline hover:underline-offset-4 sm:inline-flex">
                    <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
                  </a>
                ) : null}
              </div>
            </Container>
          </div>
        ) : null}
        <HeaderShell sticky={bool(s.sticky, true)} className={cn("savor-header", schemeClass(s.color_scheme))}>
          <Container className="flex min-h-16 items-center gap-3 py-2.5 md:min-h-[76px] lg:gap-6">
            <MobileMenu
              items={all}
              storeName={context.store.name}
              logoUrl={str(s.logo) || context.store.logoUrl}
              showAccount={bool(s.show_account, true)}
              className="lg:hidden"
              footer={drawerFooter}
            />
            <div className="flex flex-1 items-center lg:flex-none">
              <Logo context={context} image={str(s.logo)} width={logoWidth} className="savor-logo" />
            </div>
            <MenuNav items={items} className="hidden flex-1 justify-center lg:flex" />
            <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
              {bool(s.show_search, true) ? <SearchToggle className="size-10" /> : null}
              {bool(s.show_account, true) ? <AccountLink className="hidden size-10 justify-center sm:inline-flex" /> : null}
              <CartButton className="size-10" />
              {showCta ? (
                <SmartLink href={ctaHref} className="pai-btn pai-btn-primary savor-cta ml-1 hidden min-h-10 px-5 text-sm sm:inline-flex">
                  {ctaLabel}
                  <span aria-hidden>→</span>
                </SmartLink>
              ) : null}
            </div>
          </Container>
          {showCta ? (
            <div className="border-t border-pai-border sm:hidden">
              <SmartLink href={ctaHref} className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-pai-primary">
                {ctaLabel} <span aria-hidden>→</span>
              </SmartLink>
            </div>
          ) : null}
        </HeaderShell>
      </>
    );
  },
});
