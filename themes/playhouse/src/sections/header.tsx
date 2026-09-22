/**
 * Playhouse header: a floating, rounded header bar with a rainbow wordmark, colourful menu pills,
 * a "Shop by age" dropdown (and/or chip row) built from blocks, search, wishlist, account and cart.
 * On phones: compact bar + a swipeable age-chip row, and the drawer gets the age chips too.
 * Also replaces the kit announcement bar with a playful strip (same schema).
 */
import type { CSSProperties } from "react";
import { Phone } from "lucide-react";
import { defineSection, type BlockInstance, type SectionDefinition, type SfMenuItem, type StorefrontContext } from "@pai/theme-sdk";
import { Container, Link, SmartLink, SocialLinks, bool, cn, loadMenu, num, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MenuDropdown, MobileMenu, SearchBox, SearchToggle } from "@pai/theme-kit/client";
import { PopoverMenu } from "../client/popover";
import { WishlistPanel, type WishItem } from "../client/wishlist-panel";
import { FOCUS, PlayhouseStyles, Sparkle, funAt, funColor, funColorField, tint } from "./_playhouse";

/* ─────────────────────────── ages ─────────────────────────── */

type Age = { id: string; label: string; caption: string; emoji: string; color: string; href: string };

export const DEFAULT_AGES = [
  { label: "0–12m", caption: "Tiny explorers", emoji: "🍼", color: "bubblegum", link: "/collections/baby" },
  { label: "1–3y", caption: "Busy toddlers", emoji: "🧸", color: "sunshine", link: "/search?q=montessori" },
  { label: "3–5y", caption: "Little learners", emoji: "🎨", color: "sky", link: "/collections/learning" },
  { label: "5–8y", caption: "Big imaginations", emoji: "🚂", color: "mint", link: "/collections/toys-games" },
  { label: "8+", caption: "Makers & builders", emoji: "🧩", color: "grape", link: "/search?q=stem" },
];

function readAges(blocks: BlockInstance[], context: StorefrontContext): Age[] {
  return blocks
    .filter((b) => b.type === "age")
    .map((b, i) => ({
      id: b.id,
      label: str(b.settings.label),
      caption: str(b.settings.caption),
      emoji: str(b.settings.emoji),
      color: funColor(b.settings.color, i),
      href: str(b.settings.collection) ? context.url(`/collections/${str(b.settings.collection)}`) : resolveHref(context, b.settings.link, "/collections/all"),
    }))
    .filter((a) => a.label);
}

function AgeChip({ age, className }: { age: Age; className?: string }) {
  return (
    <SmartLink
      href={age.href}
      className={cn("ph-hover-wiggle inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold text-pai-fg ring-1 ring-black/5 transition hover:brightness-95", FOCUS, className)}
      style={{ background: tint(age.color, 45) }}
    >
      {age.emoji ? (
        <span aria-hidden className="ph-wiggle inline-block">
          {age.emoji}
        </span>
      ) : null}
      {age.label}
    </SmartLink>
  );
}

function AgePanel({ ages, heading, context }: { ages: Age[]; heading: string; context: StorefrontContext }) {
  return (
    <div className="w-[min(92vw,560px)] rounded-[28px] bg-pai-bg p-5 text-pai-fg shadow-[0_24px_60px_-24px_rgba(0,0,0,.35)] ring-1 ring-pai-border">
      {heading ? <p className="mb-4 px-1 font-heading text-lg font-semibold">{heading}</p> : null}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ages.map((a) => (
          <li key={a.id}>
            <SmartLink href={a.href} className={cn("ph-hover-wiggle group/age flex h-full flex-col items-start gap-1 rounded-[20px] p-4 transition hover:-translate-y-0.5", FOCUS)} style={{ background: tint(a.color, 32) }}>
              <span aria-hidden className="ph-wiggle grid size-11 place-items-center rounded-full bg-white text-2xl shadow-sm">
                {a.emoji || "★"}
              </span>
              <span className="mt-1 font-heading text-xl font-bold leading-none">{a.label}</span>
              {a.caption ? <span className="text-xs font-semibold opacity-75">{a.caption}</span> : null}
            </SmartLink>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end px-1">
        <Link href={context.url("/collections/all")} className={cn("rounded-full text-sm font-bold underline decoration-2 underline-offset-4", FOCUS)}>
          Shop all ages
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────── wordmark & nav ─────────────────────────── */

function Wordmark({ context, image, width, rainbow }: { context: StorefrontContext; image: string; width: number; rainbow: boolean }) {
  const src = image || context.store.logoUrl;
  const name = context.store.name;
  const [first, ...rest] = name.split(/\s+/);
  return (
    <Link href={context.url("/")} aria-label={`${name} home`} className={cn("inline-flex shrink-0 items-center rounded-2xl", FOCUS)}>
      {src ? (
        <img src={src} alt={name} style={{ width, maxWidth: "min(42vw, 100%)" }} className="h-auto max-h-14 object-contain" />
      ) : (
        <span className="flex flex-col leading-none" aria-hidden>
          <span className="font-heading text-[1.55rem] font-bold tracking-tight md:text-[1.8rem]">
            {rainbow
              ? [...(first ?? name)].map((ch, i) => (
                  <span key={i} className="inline-block" style={{ color: `color-mix(in srgb, ${funAt(i + 3)} 78%, var(--pai-fg))`, transform: `rotate(${i % 2 ? 4 : -4}deg)` }}>
                    {ch}
                  </span>
                ))
              : first}
          </span>
          {rest.length ? <span className="mt-0.5 text-[0.62rem] font-extrabold uppercase tracking-[0.22em] opacity-70">{rest.join(" ")}</span> : null}
        </span>
      )}
    </Link>
  );
}

function NavPills({ items }: { items: SfMenuItem[] }) {
  return (
    <nav aria-label="Main">
      <ul className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const style = { "--ph-pill": funAt(i) } as CSSProperties;
          const pill = "whitespace-nowrap rounded-full px-3.5 font-heading text-[0.98rem] font-semibold transition hover:bg-[color-mix(in_srgb,var(--ph-pill)_32%,transparent)] lg:px-4";
          return (
            <li key={item.id} style={style}>
              {item.children?.length ? (
                <MenuDropdown item={item} className={cn(pill, item.active && "bg-[color-mix(in_srgb,var(--ph-pill)_32%,transparent)]")} />
              ) : (
                <SmartLink href={item.url} className={cn(pill, "inline-block py-2", FOCUS, item.active && "bg-[color-mix(in_srgb,var(--ph-pill)_32%,transparent)]")}>
                  {item.label}
                </SmartLink>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ─────────────────────────── header section ─────────────────────────── */

export const playhouseHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Floating rounded header with colourful menu pills, Shop by age, search, wishlist and cart.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo, or a playful wordmark of your store name." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 140 },
      { type: "checkbox", id: "rainbow_wordmark", label: "Rainbow letters in the text logo", default: true },
      { type: "menu", id: "menu", label: "Menu", default: "main" },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      {
        type: "select",
        id: "bar_style",
        label: "Bar style",
        default: "floating",
        options: [
          { value: "floating", label: "Floating rounded bar" },
          { value: "full", label: "Full width" },
        ],
      },
      {
        type: "select",
        id: "search_style",
        label: "Search",
        default: "bar",
        options: [
          { value: "bar", label: "Search bar (large screens)" },
          { value: "icon", label: "Icon (opens overlay)" },
          { value: "none", label: "Hidden" },
        ],
      },
      { type: "checkbox", id: "show_wishlist", label: "Show wishlist", default: true },
      { type: "checkbox", id: "show_account", label: "Show account icon", default: true },
      schemeField("default"),
      { type: "header", label: "Shop by age", info: "Add an “Age” block for each age group." },
      {
        type: "select",
        id: "age_display",
        label: "Show age groups as",
        default: "both",
        options: [
          { value: "dropdown", label: "“Shop by age” dropdown" },
          { value: "row", label: "Chip row under the header" },
          { value: "both", label: "Dropdown + chip row on phones" },
          { value: "none", label: "Hidden" },
        ],
      },
      { type: "text", id: "age_label", label: "Dropdown label", default: "Shop by age" },
      { type: "text", id: "age_heading", label: "Dropdown heading", default: "Find the perfect toy for every stage" },
      funColorField("age_color", "Dropdown button colour", "sunshine"),
    ],
    blocks: [
      {
        type: "age",
        name: "Age group",
        limit: 8,
        settings: [
          { type: "text", id: "label", label: "Label", default: "3–5y" },
          { type: "text", id: "caption", label: "Caption", default: "Little learners" },
          { type: "text", id: "emoji", label: "Emoji", default: "🎨", info: "One emoji, e.g. 🍼 🧸 🎨 🚂 🧩" },
          funColorField("color", "Colour", "sky"),
          { type: "collection", id: "collection", label: "Collection", info: "Optional — overrides the link." },
          { type: "url", id: "link", label: "Link", default: "/collections/all" },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [{ name: "Header", blocks: DEFAULT_AGES.map(({ label, caption, emoji, color, link }) => ({ type: "age", settings: { label, caption, emoji, color, link } })) }],
  },
  component: async ({ settings: s, blocks, context }) => {
    const showWishlist = bool(s.show_wishlist, true);
    const [items, wishCatalogue] = await Promise.all([
      loadMenu(context, str(s.menu, "main")),
      showWishlist ? context.data.getProducts({ sort: "best-selling", limit: 48 }).catch(() => null) : Promise.resolve(null),
    ]);
    const wishItems: WishItem[] = (wishCatalogue?.items ?? []).map((p) => ({ id: p.id, title: p.title, url: p.url, image: p.featuredImage?.url ?? null, price: context.formatMoney(p.price) }));
    const ages = readAges(blocks, context);
    const ageDisplay = str(s.age_display, "both");
    const showDropdown = ages.length > 0 && (ageDisplay === "dropdown" || ageDisplay === "both");
    const showRow = ages.length > 0 && ageDisplay === "row";
    const showMobileRow = ages.length > 0 && ageDisplay !== "none";
    const search = str(s.search_style, "bar");
    const floating = str(s.bar_style, "floating") === "floating";
    const logoUrl = str(s.logo) || context.store.logoUrl;

    const ageChips = (cls?: string) => (
      <ul className={cn("flex gap-2", cls)}>
        {ages.map((a) => (
          <li key={a.id}>
            <AgeChip age={a} />
          </li>
        ))}
      </ul>
    );

    const drawerFooter = showMobileRow ? (
      <div className="border-b border-pai-border pb-4">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] opacity-70">{str(s.age_label, "Shop by age")}</p>
        {ageChips("flex-wrap")}
      </div>
    ) : null;

    return (
      <HeaderShell sticky={bool(s.sticky, true)} className={cn("ph-header border-0! bg-transparent! shadow-none!", !floating && "bg-pai-bg!")}>
        <PlayhouseStyles />
        <div className={cn(floating ? "pai-container pt-2 md:pt-3" : "", "pb-2")}>
          <div
            className={cn(
              "ph-header-bar bg-pai-bg px-2.5 py-2 md:px-4 lg:py-2.5",
              schemeClass(s.color_scheme),
              floating ? "rounded-[26px] shadow-[0_10px_30px_-18px_color-mix(in_srgb,var(--pai-fg)_60%,transparent)] ring-1 ring-pai-border" : "pai-container rounded-b-[26px]",
            )}
          >
            <div className="flex min-h-12 items-center gap-2 sm:gap-3 lg:min-h-14">
              <MobileMenu items={items} storeName={context.store.name} logoUrl={logoUrl} showAccount={bool(s.show_account, true)} className="rounded-full hover:bg-pai-muted lg:hidden" footer={drawerFooter} />
              <div className="flex min-w-0 flex-1 items-center lg:flex-none">
                <Wordmark context={context} image={str(s.logo)} width={num(s.logo_width, 140)} rainbow={bool(s.rainbow_wordmark, true)} />
              </div>
              {search === "bar" ? (
                <div className="hidden flex-1 justify-center px-4 lg:flex">
                  <SearchBox className="ph-search w-full max-w-xl" placeholder="Search toys, gifts, treats…" />
                </div>
              ) : (
                <div className="hidden flex-1 lg:block" />
              )}
              <div className="flex items-center gap-0.5 sm:gap-1">
                {search === "icon" ? <SearchToggle className="size-10 rounded-full hover:bg-pai-muted" /> : null}
                {search === "bar" ? <SearchToggle className="size-10 rounded-full hover:bg-pai-muted lg:hidden" /> : null}
                {showWishlist ? <WishlistPanel items={wishItems} shopUrl={context.url("/collections/all")} className="size-10 rounded-full hover:bg-pai-muted" /> : null}
                {bool(s.show_account, true) ? <AccountLink className="hidden size-10 justify-center rounded-full hover:bg-pai-muted sm:inline-flex" /> : null}
                <CartButton className="ml-0.5 size-11 rounded-full bg-pai-primary text-pai-primary-fg shadow-[0_3px_0_color-mix(in_srgb,var(--pai-primary)_55%,black)] transition hover:-translate-y-0.5 [&_span]:ring-2 [&_span]:ring-pai-bg" />
              </div>
            </div>
            <div className="mt-2 hidden items-center gap-2 border-t-2 border-dashed border-pai-border pt-2 lg:flex">
              {showDropdown ? (
                <PopoverMenu
                  label={str(s.age_label, "Shop by age")}
                  align="left"
                  className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 font-heading text-[0.98rem] font-semibold text-pai-fg shadow-[0_3px_0_rgba(0,0,0,.12)] transition hover:-translate-y-0.5", FOCUS)}
                  icon={<Sparkle className="size-4" color="currentColor" />}
                  style={{ background: funColor(s.age_color, 0) }}
                >
                  <AgePanel ages={ages} heading={str(s.age_heading)} context={context} />
                </PopoverMenu>
              ) : null}
              <NavPills items={items} />
            </div>
          </div>
          {showRow ? (
            <div className={cn("mt-2 hidden items-center justify-center gap-3 lg:flex", !floating && "pai-container")}>
              <span className="text-sm font-extrabold opacity-70">{str(s.age_label, "Shop by age")}:</span>
              {ageChips()}
            </div>
          ) : null}
          {showMobileRow ? (
            <nav aria-label={str(s.age_label, "Shop by age")} className={cn("pai-no-scrollbar -mx-4 mt-2 overflow-x-auto px-4 lg:hidden", !floating && "pai-container mx-0")}>
              {ageChips("w-max pb-0.5")}
            </nav>
          ) : null}
        </div>
      </HeaderShell>
    );
  },
});

/* ─────────────────────────── announcement strip ─────────────────────────── */

/** Kit announcement bar schema, Playhouse look: sparkles between messages, rounded bottom. */
export function playhouseAnnouncement(base: SectionDefinition<any>): SectionDefinition<any> {
  return {
    ...base,
    component: ({ settings: s, blocks, context }) => {
      const messages = blocks.length
        ? blocks.map((b) => ({ id: b.id, text: str(b.settings.text), href: resolveHref(context, b.settings.link) })).filter((m) => m.text)
        : str(context.theme.announcement_text)
          ? [{ id: "global", text: str(context.theme.announcement_text), href: resolveHref(context, context.theme.announcement_link) }]
          : [];
      if (!messages.length) return null;
      const marquee = s.style === "marquee";
      const Msg = ({ m }: { m: (typeof messages)[number] }) =>
        m.href ? (
          <SmartLink href={m.href} className="underline-offset-4 hover:underline">
            {m.text}
          </SmartLink>
        ) : (
          <span>{m.text}</span>
        );
      return (
        <div className={cn("ph-announcement relative text-[0.82rem] font-bold", schemeClass(s.color_scheme || "primary"))} role="region" aria-label="Announcements">
          <Container className="flex min-h-10 items-center justify-between gap-4 py-2">
            {bool(s.show_phone, true) && context.store.phone ? (
              <a href={`tel:${context.store.phone}`} className="hidden shrink-0 items-center gap-1.5 opacity-90 hover:opacity-100 lg:inline-flex">
                <Phone className="size-3.5" aria-hidden /> {context.store.phone}
              </a>
            ) : (
              <span className="hidden lg:block lg:w-8" />
            )}
            {marquee ? (
              <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
                <div className="animate-pai-marquee flex w-max items-center gap-10 whitespace-nowrap hover:[animation-play-state:paused] motion-reduce:animate-none">
                  {[...messages, ...messages, ...messages, ...messages].map((m, i) => (
                    <span key={i} className="inline-flex items-center gap-10" aria-hidden={i >= messages.length || undefined}>
                      <Msg m={m} />
                      <Sparkle className="size-3.5" color={funAt(i)} />
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center">
                {messages.map((m, i) => (
                  <span key={m.id} className={cn("inline-flex items-center gap-6", i > 0 && "hidden md:inline-flex")}>
                    {i > 0 ? <Sparkle className="size-3.5" color={funAt(i)} /> : null}
                    <Msg m={m} />
                  </span>
                ))}
              </div>
            )}
            {bool(s.show_social) ? <SocialLinks context={context} className="hidden shrink-0 lg:flex" iconClassName="size-7 border-0" /> : <span className="hidden lg:block lg:w-8" />}
          </Container>
        </div>
      );
    },
  };
}
