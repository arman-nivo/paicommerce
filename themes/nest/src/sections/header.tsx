/**
 * Nest header group:
 *  - a quiet espresso utility bar (showroom, service messages, phone)
 *  - a spacious header with a room-based mega menu. Menu items with sub-items open a full-width
 *    panel, and a configurable "Shop by room" panel is built from `room` blocks (image, collection,
 *    sub-links, live product counts) so merchants get a room mega menu even with a flat menu.
 */
import { defineSection, type BlockInstance, type SfMenuItem, type StorefrontContext } from "@pai/theme-sdk";
import { Container, Icon, Logo, SmartLink, bool, cn, loadMenu, num, readableOn, resolveHref, schemeClass, schemeField, str } from "@pai/theme-kit";
import { AccountLink, CartButton, HeaderShell, MobileMenu, SearchBox, SearchToggle } from "@pai/theme-kit/client";
import { NestMegaItem } from "../client/mega-menu";
import { IMG } from "../images";
import { parseLinks, piecesLabel } from "./_nest";

/* ─────────────────────────── utility / announcement bar ─────────────────────────── */

export const nestAnnouncement = defineSection({
  schema: {
    type: "announcement-bar",
    name: "Utility bar",
    category: "header",
    icon: "megaphone",
    group: "header",
    limit: 1,
    description: "Slim bar above the header: showroom info, service messages and a phone number.",
    settings: [
      { type: "color", id: "background", label: "Background", default: "#2e2520" },
      { type: "color", id: "text_color", label: "Text colour", info: "Leave empty to pick automatically." },
      { type: "text", id: "left_text", label: "Left text (desktop)", default: "Showroom · Gulshan 1, Dhaka" },
      { type: "url", id: "left_link", label: "Left link", default: "/pages/contact" },
      { type: "checkbox", id: "show_phone", label: "Show store phone (desktop)", default: true },
      { type: "checkbox", id: "show_track", label: "Show “Track order” link (desktop)", default: true },
    ],
    blocks: [
      {
        type: "announcement",
        name: "Message",
        limit: 4,
        settings: [
          { type: "text", id: "text", label: "Text", default: "Free delivery & assembly inside Dhaka" },
          { type: "url", id: "link", label: "Link" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [{ name: "Utility bar", blocks: [{ type: "announcement", settings: { text: "0% EMI up to 12 months on partner bank cards" } }] }],
  },
  component: ({ settings: s, blocks, context }) => {
    const messages = blocks.length
      ? blocks.map((b) => ({ id: b.id, text: str(b.settings.text), href: resolveHref(context, b.settings.link) })).filter((m) => m.text)
      : str(context.theme.announcement_text)
        ? [{ id: "global", text: str(context.theme.announcement_text), href: resolveHref(context, context.theme.announcement_link) }]
        : [];
    const left = str(s.left_text);
    if (!messages.length && !left) return null;
    const bg = str(s.background, "#2e2520");
    const fg = str(s.text_color) || readableOn(bg);
    const leftHref = resolveHref(context, s.left_link);
    const phone = bool(s.show_phone, true) ? context.store.phone : null;
    return (
      <div role="region" aria-label="Store information" className="nest-utility text-[0.74rem] tracking-[0.04em]" style={{ background: bg, color: fg }}>
        <Container className="grid min-h-9 grid-cols-1 items-center gap-4 py-2 lg:grid-cols-[1fr_auto_1fr]">
          <p className="hidden min-w-0 items-center gap-2 whitespace-nowrap opacity-80 lg:flex">
            {left ? (
              <>
                <Icon name="map-pin" className="size-3.5" />
                {leftHref ? (
                  <SmartLink href={leftHref} className="underline-offset-4 hover:underline">
                    {left}
                  </SmartLink>
                ) : (
                  <span>{left}</span>
                )}
              </>
            ) : null}
          </p>
          <ul className="flex items-center justify-center gap-6 text-center">
            {messages.map((m, i) => (
              <li key={m.id} className={cn("items-center gap-6", i === 0 ? "flex" : "hidden xl:flex")}>
                {i > 0 ? <span aria-hidden className="h-3 w-px bg-current opacity-30" /> : null}
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
          <div className="hidden items-center justify-end gap-5 opacity-80 lg:flex">
            {phone ? (
              <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 hover:underline hover:underline-offset-4">
                <Icon name="phone" className="size-3.5" />
                {phone}
              </a>
            ) : null}
            {bool(s.show_track, true) ? (
              <SmartLink href={context.url("/track-order")} className="hover:underline hover:underline-offset-4">
                Track order
              </SmartLink>
            ) : null}
          </div>
        </Container>
      </div>
    );
  },
});

/* ─────────────────────────── rooms (header blocks) ─────────────────────────── */

type Room = { id: string; title: string; image: string; href: string; count: number | null; links: { label: string; href: string }[]; slug: string };

async function loadRooms(context: StorefrontContext, blocks: BlockInstance[], showCounts: boolean): Promise<Room[]> {
  const rooms = blocks.filter((b) => b.type === "room");
  const cols = await Promise.all(rooms.map((b) => (str(b.settings.collection) ? context.data.getCollection(str(b.settings.collection)).catch(() => null) : Promise.resolve(null))));
  return rooms
    .map((b, i) => {
      const c = cols[i];
      const link = resolveHref(context, b.settings.link);
      const href = link || c?.url || context.url("/collections");
      return {
        id: b.id,
        slug: c?.slug ?? str(b.settings.collection),
        title: str(b.settings.title) || c?.title || "",
        image: str(b.settings.image) || c?.image?.url || "",
        href,
        count: showCounts && c ? c.productsCount : null,
        links: parseLinks(b.settings.links).map((l) => ({ label: l.label, href: resolveHref(context, l.href) || href })),
      };
    })
    .filter((r) => r.title);
}

function RoomCard({ room, compact }: { room: Room; compact?: boolean }) {
  return (
    <div className="group/room min-w-0">
      <SmartLink href={room.href} className="block">
        <span className="relative block aspect-[4/3] overflow-hidden rounded-pai bg-pai-muted">
          {room.image ? <img src={room.image} alt="" loading="lazy" decoding="async" className="nest-zoom absolute inset-0 size-full object-cover" /> : null}
        </span>
        <span className="mt-3 flex items-baseline justify-between gap-2">
          <span className="font-heading text-lg leading-tight group-hover/room:underline group-hover/room:underline-offset-4">{room.title}</span>
          {room.count !== null ? <span className="shrink-0 text-xs opacity-55">{piecesLabel(room.count)}</span> : null}
        </span>
      </SmartLink>
      {!compact && room.links.length ? (
        <ul className="mt-3 space-y-1.5 border-t border-pai-border pt-3 text-sm">
          {room.links.map((l, i) => (
            <li key={i}>
              <SmartLink href={l.href} className="nest-link opacity-75 hover:opacity-100">
                {l.label}
              </SmartLink>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function RoomsPanel({ rooms, note, allHref }: { rooms: Room[]; note: string; allHref: string }) {
  const cols = rooms.length >= 6 ? "lg:grid-cols-6" : rooms.length === 5 ? "lg:grid-cols-5" : rooms.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
  return (
    <Container className="py-10">
      <div className={cn("grid grid-cols-3 gap-x-6 gap-y-8", cols)}>
        {rooms.map((r) => (
          <RoomCard key={r.id} room={r} />
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-pai-border pt-5 text-sm">
        {note ? <p className="opacity-65">{note}</p> : <span />}
        <SmartLink href={allHref} className="inline-flex items-center gap-2 font-semibold">
          Browse every collection <Icon name="arrow-right" className="size-4" />
        </SmartLink>
      </div>
    </Container>
  );
}

/** Panel for a menu item with children: link columns plus up to two matching room cards. */
function ItemPanel({ item, rooms }: { item: SfMenuItem; rooms: Room[] }) {
  const children = item.children ?? [];
  const grouped = children.filter((c) => c.children?.length);
  const flat = children.filter((c) => !c.children?.length);
  const columns = [
    ...(flat.length ? [{ id: `${item.id}-flat`, title: item.label, href: item.url, links: flat }] : []),
    ...grouped.map((g) => ({ id: g.id, title: g.label, href: g.url, links: g.children ?? [] })),
  ];
  const matched = rooms.filter((r) => children.some((c) => r.slug && c.url.endsWith(`/collections/${r.slug}`)));
  const features = (matched.length ? matched : rooms).slice(0, 2);
  return (
    <Container className="grid gap-12 py-10 lg:grid-cols-[1fr_minmax(0,1.1fr)]">
      <div className="grid grid-cols-2 gap-x-10 gap-y-8 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.id}>
            <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] opacity-60">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.id}>
                  <SmartLink href={l.url} className="nest-link font-heading text-[1.05rem] opacity-85 hover:opacity-100">
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="col-span-full border-t border-pai-border pt-5">
          <SmartLink href={item.url} className="inline-flex items-center gap-2 text-sm font-semibold">
            Shop all {item.label} <Icon name="arrow-right" className="size-4" />
          </SmartLink>
        </div>
      </div>
      {features.length ? (
        <div className="hidden grid-cols-2 gap-6 lg:grid">
          {features.map((r) => (
            <RoomCard key={r.id} room={r} compact />
          ))}
        </div>
      ) : null}
    </Container>
  );
}

function NestNav({ items, rooms, roomLabel, roomFirst, note, allHref, className }: { items: SfMenuItem[]; rooms: Room[]; roomLabel: string; roomFirst: boolean; note: string; allHref: string; className?: string }) {
  const roomItem =
    rooms.length && roomLabel ? (
      <li key="__rooms">
        <NestMegaItem label={roomLabel}>
          <RoomsPanel rooms={rooms} note={note} allHref={allHref} />
        </NestMegaItem>
      </li>
    ) : null;
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-0 text-[0.86rem] font-medium tracking-[0.03em]">
        {roomFirst ? roomItem : null}
        {items.map((item) => (
          <li key={item.id}>
            {item.children?.length ? (
              <NestMegaItem label={item.label} active={item.active}>
                <ItemPanel item={item} rooms={rooms} />
              </NestMegaItem>
            ) : (
              <SmartLink href={item.url} className={cn("nest-nav-link inline-block py-3", item.active && "is-active")}>
                {item.label}
              </SmartLink>
            )}
          </li>
        ))}
        {roomFirst ? null : roomItem}
      </ul>
    </nav>
  );
}

export const nestHeader = defineSection({
  schema: {
    type: "header",
    name: "Header",
    category: "header",
    icon: "panel-top",
    group: "header",
    limit: 1,
    description: "Spacious header with a room-based mega menu, search and cart. Add “Room” blocks to build the “Shop by room” panel.",
    settings: [
      { type: "image", id: "logo", label: "Logo", info: "Defaults to your store logo, or your store name set in the heading font." },
      { type: "range", id: "logo_width", label: "Logo width", min: 60, max: 260, step: 5, unit: "px", default: 130 },
      { type: "menu", id: "menu", label: "Menu", default: "main" },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "two_row",
        options: [
          { value: "two_row", label: "Centred logo, menu on its own row" },
          { value: "logo_left", label: "Logo left, menu inline" },
        ],
      },
      {
        type: "select",
        id: "search_style",
        label: "Search",
        default: "bar",
        options: [
          { value: "bar", label: "Search bar (desktop)" },
          { value: "icon", label: "Icon" },
        ],
      },
      { type: "text", id: "search_placeholder", label: "Search placeholder", default: "Search sofas, lamps, rugs…" },
      { type: "checkbox", id: "show_account", label: "Show account icon", default: true },
      { type: "checkbox", id: "sticky", label: "Sticky header", default: true },
      { type: "checkbox", id: "transparent_on_home", label: "Transparent over the home page hero", default: false, info: "Use with a full-bleed hero as the first section." },
      schemeField("default"),
      { type: "header", label: "Shop by room mega menu", info: "Built from the Room blocks below. Menu items with sub-items also open a full-width panel." },
      { type: "text", id: "room_label", label: "Menu label", default: "Shop by room", info: "Leave empty to hide the room panel." },
      {
        type: "select",
        id: "room_position",
        label: "Position in the menu",
        default: "first",
        options: [
          { value: "first", label: "First" },
          { value: "last", label: "Last" },
        ],
      },
      { type: "checkbox", id: "show_counts", label: "Show number of pieces per room", default: true },
      { type: "text", id: "panel_note", label: "Panel footnote", default: "Free delivery & white-glove assembly inside Dhaka · 0% EMI up to 12 months" },
      { type: "checkbox", id: "mobile_rooms", label: "Show rooms in the mobile menu", default: true },
    ],
    blocks: [
      {
        type: "room",
        name: "Room",
        limit: 8,
        settings: [
          { type: "text", id: "title", label: "Title", default: "Living Room", info: "Defaults to the collection title." },
          { type: "image", id: "image", label: "Image", info: "Landscape works best. Defaults to the collection image." },
          { type: "collection", id: "collection", label: "Collection" },
          { type: "url", id: "link", label: "Link", info: "Defaults to the collection." },
          { type: "textarea", id: "links", label: "Sub-links", default: "Sofas | /collections/living-room\nArmchairs | /collections/living-room\nRugs | /collections/living-room", info: "One per line: Label | /link" },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Header",
        blocks: [
          { type: "room", settings: { title: "Living Room", image: IMG.livingWarm } },
          { type: "room", settings: { title: "Bedroom", image: IMG.bedRust, links: "Beds | /collections/all\nBedside tables | /collections/all\nBedding | /collections/all" } },
          { type: "room", settings: { title: "Dining", image: IMG.diningBoho, links: "Dining sets | /collections/all\nChairs | /collections/all" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const [items, rooms] = await Promise.all([loadMenu(context, str(s.menu, "main")), loadRooms(context, blocks, bool(s.show_counts, true))]);
    const transparent = bool(s.transparent_on_home) && context.template === "index";
    const layout = str(s.layout, "two_row");
    const search = str(s.search_style, "bar");
    const roomLabel = str(s.room_label);
    const allHref = context.url("/collections");
    const logo = <Logo context={context} image={str(s.logo)} width={num(s.logo_width, num(context.theme.logo_width, 130))} invertOnTransparent={transparent} className="nest-logo" />;
    const mobileFooter =
      bool(s.mobile_rooms, true) && rooms.length ? (
        <div>
          <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] opacity-60">{roomLabel || "Shop by room"}</p>
          <ul className="grid grid-cols-2 gap-3">
            {rooms.map((r) => (
              <li key={r.id}>
                <SmartLink href={r.href} className="block">
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-pai bg-pai-muted">
                    {r.image ? <img src={r.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
                  </span>
                  <span className="mt-1.5 block text-sm font-medium">{r.title}</span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      ) : undefined;
    const mobile = (
      <MobileMenu items={items} storeName={context.store.name} logoUrl={str(s.logo) || context.store.logoUrl} showAccount={bool(s.show_account, true)} className="lg:hidden" footer={mobileFooter} />
    );
    const iconCls = "size-10 rounded-pai transition hover:bg-pai-muted focus-visible:outline-2 focus-visible:outline-pai-accent";
    const icons = (
      <div className="flex items-center justify-end gap-1">
        <SearchToggle className={cn(iconCls, search === "bar" && "lg:hidden")} />
        {bool(s.show_account, true) ? <AccountLink className={cn(iconCls, "hidden justify-center sm:inline-flex")} /> : null}
        <CartButton className={iconCls} />
      </div>
    );
    const nav = (cls: string) => (
      <NestNav items={items} rooms={rooms} roomLabel={roomLabel} roomFirst={s.room_position !== "last"} note={str(s.panel_note)} allHref={allHref} className={cls} />
    );
    const searchBar = search === "bar" ? <SearchBox placeholder={str(s.search_placeholder, "Search…")} className="nest-search hidden w-full max-w-[19rem] lg:block" /> : null;

    return (
      <HeaderShell sticky={bool(s.sticky, true)} transparent={transparent} className={cn("nest-header", !transparent && schemeClass(s.color_scheme))}>
        {layout === "logo_left" ? (
          <Container className="flex min-h-[84px] items-center gap-6 py-3">
            {mobile}
            <div className="flex flex-1 lg:flex-none">{logo}</div>
            {nav("hidden flex-1 lg:block")}
            {searchBar ? <div className="hidden w-56 xl:block">{searchBar}</div> : null}
            {icons}
          </Container>
        ) : (
          <>
            <Container className="grid min-h-[76px] grid-cols-[1fr_auto_1fr] items-center gap-4 py-3 lg:min-h-[92px]">
              <div className="flex items-center gap-2">
                {mobile}
                {searchBar}
              </div>
              {logo}
              {icons}
            </Container>
            <div className="nest-nav-row hidden border-t border-pai-border lg:block">
              <Container>{nav("")}</Container>
            </div>
          </>
        )}
      </HeaderShell>
    );
  },
});
