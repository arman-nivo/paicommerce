import { defineSection, type SfCollection, type SfMenuItem, type StorefrontContext } from "@pai/theme-sdk";
import { Container, Icon, Logo, SmartLink, bool, cn, loadMenu, num, resolveHref, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MobileMenu, SearchBox } from "@pai/theme-kit/client";
import { BadgeCheck, FileUp, LayoutGrid, MessageCircle, Phone } from "lucide-react";
import { MegaMenu } from "../client/mega-menu";
import { HEALTH_ICONS, whatsappHref } from "../components/utils";

function CategoryPanel({ collections, context }: { collections: SfCollection[]; context: StorefrontContext }) {
  return (
    <Container className="py-7">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold">Shop by category</p>
        <SmartLink href={context.url("/collections")} className="text-sm font-semibold text-pai-primary hover:underline">
          All categories →
        </SmartLink>
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {collections.map((c) => (
          <li key={c.id}>
            <SmartLink href={c.url} className="group flex items-center gap-3 rounded-pai border border-pai-border p-2.5 transition hover:border-pai-primary hover:bg-pai-muted">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-pai-muted ring-1 ring-pai-border">
                {c.image ? <img src={c.image.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold group-hover:text-pai-primary">{c.title}</span>
                {c.productsCount > 0 ? <span className="block text-xs opacity-60">{c.productsCount} items</span> : null}
              </span>
            </SmartLink>
          </li>
        ))}
      </ul>
    </Container>
  );
}

function SubPanel({ item }: { item: SfMenuItem }) {
  return (
    <Container className="py-6">
      <ul className="flex flex-wrap gap-2">
        <li>
          <SmartLink href={item.url} className="inline-flex rounded-full bg-pai-primary px-4 py-2 text-sm font-semibold text-pai-primary-fg">
            All {item.label}
          </SmartLink>
        </li>
        {(item.children ?? []).map((c) => (
          <li key={c.id}>
            <SmartLink href={c.url} className="inline-flex rounded-full border border-pai-border px-4 py-2 text-sm font-medium transition hover:border-pai-primary hover:text-pai-primary">
              {c.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </Container>
  );
}

export const pulseHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Clean medical header: licence strip, big medicine search, prescription upload button, category menu and a trust strip.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 140 },
      { type: "menu", id: "menu", label: "Menu", default: "main" },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "header", label: "Top strip" },
      { type: "checkbox", id: "show_topbar", label: "Show top strip", default: true },
      { type: "text", id: "licence_text", label: "Licence text", default: "DGDA licensed pharmacy", info: "E.g. your drug licence number." },
      { type: "text", id: "whatsapp", label: "WhatsApp number", info: "Defaults to the theme WhatsApp setting, then your store phone." },
      { type: "text", id: "whatsapp_label", label: "WhatsApp label", default: "Order on WhatsApp" },
      { type: "header", label: "Search & prescription" },
      { type: "text", id: "search_placeholder", label: "Search placeholder", default: "Search medicines, brands or health concerns…" },
      { type: "checkbox", id: "show_rx", label: "Show “Upload prescription” button", default: true },
      { type: "text", id: "rx_label", label: "Button label", default: "Upload prescription" },
      { type: "url", id: "rx_link", label: "Button link", default: "/#prescription", info: "Defaults to the home page's prescription section. Use your contact page, or leave empty to open WhatsApp." },
      { type: "header", label: "Category menu" },
      { type: "checkbox", id: "show_categories", label: "Show “Categories” menu", default: true },
      { type: "range", id: "categories_limit", label: "Categories shown", min: 4, max: 15, step: 1, default: 10 },
      { type: "header", label: "Trust strip" },
      { type: "checkbox", id: "show_trust", label: "Show trust strip", default: true },
      { type: "select", id: "trust_icon_1", label: "Icon 1", default: "shield-check", options: HEALTH_ICONS },
      { type: "text", id: "trust_1", label: "Text 1", default: "100% genuine medicines" },
      { type: "select", id: "trust_icon_2", label: "Icon 2", default: "badge-check", options: HEALTH_ICONS },
      { type: "text", id: "trust_2", label: "Text 2", default: "Dispensed by licensed pharmacists" },
      { type: "select", id: "trust_icon_3", label: "Icon 3", default: "snowflake", options: HEALTH_ICONS },
      { type: "text", id: "trust_3", label: "Text 3", default: "Cold-chain storage" },
      { type: "select", id: "trust_icon_4", label: "Icon 4", default: "truck", options: HEALTH_ICONS },
      { type: "text", id: "trust_4", label: "Text 4", default: "Delivery within 24 hours in Dhaka" },
    ],
    presets: [{ name: "Header" }],
  },
  component: async ({ settings: s, context }) => {
    const [items, collections] = await Promise.all([
      loadMenu(context, str(s.menu, "main")),
      bool(s.show_categories, true) ? context.data.getCollections({ limit: num(s.categories_limit, 10) }).catch(() => []) : Promise.resolve([] as SfCollection[]),
    ]);
    const wa = whatsappHref(context, s.whatsapp, "Hello {store}, I'd like to order medicines.");
    const rxWa = whatsappHref(context, s.whatsapp, "Hello {store}, I'd like to send my prescription.");
    const rxHref = resolveHref(context, s.rx_link) || rxWa || context.url("/pages/contact");
    const phone = context.store.phone;
    const trust = [1, 2, 3, 4].map((n) => ({ icon: str(s[`trust_icon_${n}`], "shield-check"), text: str(s[`trust_${n}`]) })).filter((t) => t.text);
    const logoWidth = num(s.logo_width, num(context.theme.logo_width, 140));
    const rxButton = (cls: string, compact = false) =>
      bool(s.show_rx, true) ? (
        <SmartLink href={rxHref} ariaLabel={compact ? str(s.rx_label, "Upload prescription") : undefined} className={cls}>
          <FileUp className="size-[18px] shrink-0" aria-hidden />
          {compact ? null : <span>{str(s.rx_label, "Upload prescription")}</span>}
        </SmartLink>
      ) : null;

    return (
      <HeaderShell sticky={bool(s.sticky, true)} className="pulse-header">
        {bool(s.show_topbar, true) ? (
          <div className="bg-pai-primary text-[0.78rem] text-pai-primary-fg">
            <Container className="flex h-9 items-center justify-between gap-4">
              <p className="flex min-w-0 items-center gap-1.5 truncate font-medium">
                <BadgeCheck className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{str(s.licence_text)}</span>
              </p>
              <div className="flex shrink-0 items-center gap-4">
                {phone ? (
                  <a href={`tel:${phone}`} className="hidden items-center gap-1.5 opacity-90 hover:opacity-100 sm:inline-flex">
                    <Phone className="size-3.5" aria-hidden /> {phone}
                  </a>
                ) : null}
                {wa ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold hover:underline">
                    <MessageCircle className="size-3.5" aria-hidden /> {str(s.whatsapp_label, "Order on WhatsApp")}
                  </a>
                ) : null}
                <SmartLink href={context.url("/track-order")} className="hidden opacity-90 hover:opacity-100 md:inline">
                  Track order
                </SmartLink>
              </div>
            </Container>
          </div>
        ) : null}

        <Container className="flex items-center gap-3 py-3 md:gap-6 md:py-4">
          <MobileMenu items={items} storeName={context.store.name} logoUrl={str(s.logo) || context.store.logoUrl} className="lg:hidden" />
          <Logo context={context} image={str(s.logo)} width={logoWidth} className="pulse-logo" />
          <SearchBox placeholder={str(s.search_placeholder, "Search medicines…")} className="pulse-search hidden flex-1 md:block" />
          <div className="ml-auto flex items-center gap-1.5 md:ml-0 md:gap-2">
            {rxButton("pai-btn pai-btn-accent hidden !min-h-11 lg:inline-flex")}
            {rxButton("grid size-11 place-items-center rounded-full bg-pai-accent/12 text-pai-accent lg:hidden", true)}
            <AccountLink className="hidden size-11 justify-center rounded-full transition hover:bg-pai-muted sm:inline-flex" />
            <CartButton className="size-11 rounded-full bg-pai-muted text-pai-primary transition hover:bg-pai-primary hover:text-pai-primary-fg" />
          </div>
        </Container>
        <Container className="pb-3 md:hidden">
          <SearchBox placeholder={str(s.search_placeholder, "Search medicines…")} className="pulse-search" />
        </Container>

        <div className="hidden border-t border-pai-border lg:block">
          <Container className="flex items-center gap-6">
            {bool(s.show_categories, true) && collections.length ? (
              <MegaMenu
                label="Categories"
                icon={<LayoutGrid className="size-4" aria-hidden />}
                className="inline-flex items-center gap-2 py-3 text-sm font-semibold text-pai-primary"
                panelClassName="animate-pai-fade absolute inset-x-0 top-full z-50 border-y border-pai-border bg-pai-bg text-pai-fg shadow-[0_24px_48px_-24px_rgba(15,40,50,0.25)]"
              >
                <CategoryPanel collections={collections} context={context} />
              </MegaMenu>
            ) : null}
            <nav aria-label="Main" className="flex-1">
              <ul className="flex items-center gap-6 text-sm font-medium">
                {items.map((item) => (
                  <li key={item.id}>
                    {item.children?.length ? (
                      <MegaMenu
                        label={item.label}
                        active={item.active}
                        className="inline-flex items-center gap-1 py-3 opacity-85 transition hover:text-pai-primary hover:opacity-100 data-[open=true]:text-pai-primary"
                        panelClassName="animate-pai-fade absolute inset-x-0 top-full z-50 border-y border-pai-border bg-pai-bg text-pai-fg shadow-[0_24px_48px_-24px_rgba(15,40,50,0.25)]"
                      >
                        <SubPanel item={item} />
                      </MegaMenu>
                    ) : (
                      <SmartLink href={item.url} className={cn("inline-block py-3 opacity-85 transition hover:text-pai-primary hover:opacity-100", item.active && "text-pai-primary opacity-100")}>
                        {item.label}
                      </SmartLink>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </Container>
        </div>

        {bool(s.show_trust, true) && trust.length ? (
          <div className="border-t border-pai-border bg-pai-muted/70 text-[0.78rem]">
            <Container>
              <ul className="pai-no-scrollbar flex items-center gap-6 overflow-x-auto py-2 md:justify-between" aria-label="Our promises">
                {trust.map((t, i) => (
                  <li key={i} className="flex shrink-0 items-center gap-1.5 font-medium">
                    <Icon name={t.icon} className="size-4 text-pai-accent" />
                    {t.text}
                  </li>
                ))}
              </ul>
            </Container>
          </div>
        ) : null}
      </HeaderShell>
    );
  },
});
