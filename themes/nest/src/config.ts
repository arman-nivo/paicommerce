/**
 * Nest defaults: header/footer groups, home pages per preset and every other template. Section ids
 * are deterministic (see `sectionList`) so the customizer and storefront agree on ids.
 *
 * Collections and products below match the seeded furniture catalogue (`nest-demo`); every Nest
 * section falls back (collection → newest / best-selling, or the store's own collections) when a
 * slug doesn't exist in a store, and sub-links use search URLs that work in any store.
 */
import type { SectionList } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG } from "./images";

/* ─────────────────────────── groups ─────────────────────────── */

type RoomSpec = { title: string; collection: string; image: string; links: [string, string][] };

export const HOME_ROOMS: RoomSpec[] = [
  { title: "Living Room", collection: "living-room", image: IMG.livingWarm, links: [["Sofas", "/search?q=sofa"], ["Armchairs", "/search?q=chair"], ["Rugs", "/search?q=rug"]] },
  { title: "Bedroom", collection: "bedroom", image: IMG.bedRust, links: [["Beds", "/search?q=bed"], ["Bedside tables", "/search?q=bedside"], ["Pillows & bedding", "/search?q=pillow"]] },
  { title: "Dining", collection: "dining", image: IMG.diningBoho, links: [["Dining sets", "/search?q=dining"], ["Dining chairs", "/search?q=chair"]] },
  { title: "Lighting", collection: "lighting", image: IMG.livingRattan, links: [["Pendant lights", "/search?q=pendant"], ["Floor lamps", "/search?q=lamp"]] },
  { title: "Decor & Plants", collection: "decor", image: IMG.beigeLiving, links: [["Vases", "/search?q=vase"], ["Candles", "/search?q=candle"], ["Wall clocks", "/search?q=clock"]] },
  { title: "Home Office", collection: "home-office", image: IMG.officeGreen, links: [["Desks", "/search?q=desk"], ["Shelving", "/search?q=shelf"]] },
];

const roomBlocks = (rooms: RoomSpec[]) =>
  rooms.map((r) => ({ type: "room", settings: { title: r.title, collection: r.collection, image: r.image, links: r.links.map(([l, u]) => `${l} | ${u}`).join("\n") } }));

export function headerGroup(opts: { messages: string[]; left: string; background?: string; rooms?: RoomSpec[]; roomLabel?: string; note?: string; placeholder?: string }): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      settings: { background: opts.background ?? "#2e2520", left_text: opts.left, left_link: "/pages/contact", show_phone: true, show_track: true },
      blocks: opts.messages.map((text) => ({ type: "announcement", settings: { text } })),
    },
    {
      type: "header",
      settings: {
        layout: "two_row",
        search_style: "bar",
        search_placeholder: opts.placeholder ?? "Search sofas, lamps, rugs…",
        sticky: true,
        show_account: true,
        room_label: opts.roomLabel ?? "Shop by room",
        room_position: "first",
        show_counts: true,
        panel_note: opts.note ?? "Free delivery & white-glove assembly inside Dhaka · 0% EMI up to 12 months",
        mobile_rooms: true,
      },
      blocks: roomBlocks(opts.rooms ?? HOME_ROOMS),
    },
  ]);
}

export function footerGroup(opts: { promises: [string, string, string][]; showroom: { heading: string; hours: string; image: string; alt: string }; newsletter: { heading: string; text: string } }): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { color_scheme: "inverse", show_social: true, show_payment_icons: true, payment_methods: "cod, bkash, nagad, visa, mastercard, amex" },
      blocks: [
        ...opts.promises.map(([icon, title, text]) => ({ type: "promise", settings: { icon, title, text } })),
        { type: "showroom", settings: { heading: opts.showroom.heading, hours: opts.showroom.hours, image: opts.showroom.image, image_alt: opts.showroom.alt, button_label: "Get directions", button_link: "/pages/contact" } },
        { type: "link_list", settings: { heading: "Shop", menu: "main" } },
        { type: "link_list", settings: { heading: "Help", menu: "footer" } },
        { type: "newsletter", settings: { ...opts.newsletter, button_label: "Subscribe" } },
      ],
    },
  ]);
}

/* ─────────────────────────── shared specs ─────────────────────────── */

const STEPS: [string, string, string][] = [
  ["truck", "Free delivery in Dhaka", "Our own two-person crew in a covered van, on a day and time slot that suits you."],
  ["wrench", "White-glove assembly", "We carry it in, build it in place, level it and take every bit of packaging away."],
  ["rotate-ccw", "7-day returns", "Not right for the room? We'll collect it from your door within 7 days of delivery."],
  ["shield-check", "5-year warranty", "On frames, joints and solid wood — a technician visits if anything ever loosens."],
];

const promise = (steps: [string, string, string][], settings: Record<string, unknown> = {}): SectionSpec => ({
  type: "delivery-promise",
  settings: { eyebrow: "Our promise", heading: "From our workshop to your room — we do the heavy lifting", layout: "steps", ...settings },
  blocks: steps.map(([icon, title, text]) => ({ type: "step", settings: { icon, title, text } })),
});

const BANKS = ["City Bank (Amex)", "BRAC Bank", "Eastern Bank", "Dutch-Bangla Bank", "Standard Chartered", "Prime Bank", "Mutual Trust Bank", "The City Bank Visa"];

const emi = (settings: Record<string, unknown>): SectionSpec => ({
  type: "emi-banner",
  settings: {
    eyebrow: "Pay in instalments",
    heading: "0% EMI for up to 12 months",
    text: "Bring the sofa home now and spread the cost — no interest and no processing fee on partner bank credit cards. Just choose EMI at checkout.",
    months_options: "3, 6, 9, 12",
    default_months: 12,
    banks_heading: "Partner bank cards",
    footnote: "EMI available on orders over ৳10,000. Tenure and eligibility set by the issuing bank.",
    color_scheme: "primary",
    ...settings,
  },
  blocks: BANKS.slice(0, 6).map((name) => ({ type: "bank", settings: { name } })),
});

/* ─────────────────────────── home pages ─────────────────────────── */

export function homeIndex(): SectionList {
  return sectionList([
    {
      type: "nest-hero",
      settings: {
        layout: "card",
        image: IMG.livingWarm,
        image_alt: "Sunlit open-plan living room with a grey sofa, terracotta poufs and floor-to-ceiling windows",
        eyebrow: "The Monsoon Collection",
        heading: "Rooms made for slow evenings",
        text: "Solid-wood furniture, soft linens and warm light — delivered and assembled in your home by our own crew, anywhere in Dhaka.",
        button_label: "Shop the living room",
        button_link: "/collections/living-room",
        button_style: "primary",
        button2_label: "Visit the showroom",
        button2_link: "/pages/contact",
        button2_style: "link",
        product: "tufted-fabric-sofa-grey",
        product_label: "In the picture",
        highlights: "Free delivery & assembly in Dhaka\n0% EMI up to 12 months\n5-year warranty on every frame",
        height: "large",
        overlay: 5,
      },
    },
    {
      type: "room-tiles",
      settings: { eyebrow: "Shop by room", heading: "Start with the room you live in most", layout: "mosaic", show_counts: true, text_style: "below", button_label: "All collections", button_link: "/collections", button_style: "link" },
      blocks: [
        { type: "room", settings: { collection: "living-room", title: "Living Room", text: "Sofas, armchairs, rugs & coffee tables", image: IMG.livingGreen, image_alt: "Sage living room with a rattan sideboard and round mirror" } },
        { type: "room", settings: { collection: "bedroom", title: "Bedroom", text: "Beds, bedside tables & linen", image: IMG.bedRust, image_alt: "Oak bed with rust linen" } },
        { type: "room", settings: { collection: "dining", title: "Dining", text: "Tables for six, chairs in pairs", image: IMG.diningBoho, image_alt: "Sunny dining nook with a wooden table" } },
        { type: "room", settings: { collection: "lighting", title: "Lighting", text: "Pendants & floor lamps", image: IMG.livingRattan, image_alt: "Rattan pendant lights over a living room" } },
        { type: "room", settings: { collection: "decor", title: "Decor & Plants", text: "Ceramics, candles & clocks", image: IMG.beigeLiving, image_alt: "Cream living room with cane mirrors" } },
        { type: "room", settings: { collection: "home-office", title: "Home Office", text: "Desks & shelving that work", image: IMG.officeGreen, image_alt: "Green home office with a wooden desk" } },
      ],
    },
    { type: "featured-collection", settings: { eyebrow: "Just arrived", heading: "New in the showroom", heading_align: "left", source: "newest", limit: 6, columns: 3, layout: "grid" } },
    {
      type: "shop-the-room",
      settings: {
        eyebrow: "Shop the room",
        heading: "A living room in sage & rattan",
        text: "Everything in this photograph is in stock at our Gulshan showroom — tap a dot to see the piece, or take the whole room home.",
        image: IMG.livingRattan,
        image_alt: "Sage living room with rattan pendant lights, a grey sofa and a patterned rug",
        image_ratio: "landscape",
        layout: "side",
        collection: "living-room",
        color_scheme: "default",
      },
      blocks: [
        { type: "spot", settings: { product: "tufted-fabric-sofa-grey", x: 60, y: 62, note: "Deep seats, feather-wrapped cushions" } },
        { type: "spot", settings: { product: "scandi-pendant-light", x: 44, y: 16, note: "Hand-woven shade, warm 2700K bulb" } },
        { type: "spot", settings: { product: "hand-knotted-area-rug-5-8-ft", x: 64, y: 91, note: "Hand-knotted wool & jute, 5 × 8 ft" } },
        { type: "spot", settings: { product: "minimal-ceramic-vase", x: 45, y: 71, note: "Stoneware, glazed inside" } },
      ],
    },
    {
      type: "materials",
      settings: {
        eyebrow: "Materials & craft",
        heading: "Honest materials, made by hand",
        text: "Our timber is kiln-dried for the monsoon, our jute comes from Faridpur and our brass is cast in Old Dhaka. Here's what your furniture is made of — and how to look after it.",
        image: IMG.woodTurning,
        image_alt: "Craftsman shaping a wooden leg on a lathe, wood shavings flying",
        caption: "Turning a sheesham leg · our Mirpur workshop",
        layout: "image_left",
        button_label: "Our workshop story",
        button_link: "/pages/about",
        button_style: "secondary",
        color_scheme: "muted",
      },
      blocks: [
        { type: "material", settings: { name: "Solid sheesham", origin: "Kiln-dried · hand-oiled", image: IMG.walnutTable, text: "Dense Indian rosewood with a swirling grain that deepens to a honeyed brown with age.", care: "Dust with a dry cotton cloth. Re-oil twice a year. Keep out of direct afternoon sun and away from AC vents." } },
        { type: "material", settings: { name: "Mango wood", origin: "Reclaimed · Rajshahi orchards", image: IMG.sideTable, text: "Fast-growing hardwood from orchards past their fruiting years — sustainable and full of character.", care: "Use coasters for hot cups. Wipe spills straight away; a little furniture wax restores the sheen." } },
        { type: "material", settings: { name: "Hand-woven jute", origin: "Faridpur, Bangladesh", image: IMG.juteSwatch, text: "The golden fibre, hand-braided into rugs and poufs that feel good underfoot and breathe in humid weather.", care: "Vacuum without the beater bar. Blot spills — never rub. Rotate every few months so it wears evenly." } },
        { type: "material", settings: { name: "Stone-washed linen", origin: "100% European flax", image: IMG.linenBed, text: "Cool in summer, cosy in winter, and softer with every wash. Our upholstery covers zip off.", care: "Machine wash cold, line dry in the shade. Iron damp if you like it crisp — we don't." } },
      ],
    },
    { type: "featured-collection", settings: { eyebrow: "Most loved", heading: "Living room favourites", heading_align: "left", source: "collection", collection: "living-room", limit: 3, columns: 3, layout: "grid" } },
    emi({ source: "product", product: "velvet-3-seater-sofa-emerald", image: IMG.greenSofa, image_alt: "Emerald velvet three-seater sofa on a light oak floor", button_label: "Shop sofas", button_link: "/collections/living-room", button_style: "light" }),
    {
      type: "editorial-split",
      settings: {
        image: IMG.bedRust,
        image_alt: "Oak bed dressed in rust-coloured linen against a warm plaster wall",
        reverse: false,
        full_bleed: true,
        eyebrow: "The bedroom edit",
        heading: "Sleep in linen the colour of Rajshahi clay",
        text: "<p>Stone-washed linen that gets softer with every wash, on an upholstered frame built to be handed down. We dress every bed in our showroom this way — come and lie down on one before you decide.</p>",
        button_label: "Shop the bedroom",
        button_link: "/collections/bedroom",
        button_style: "primary",
        color_scheme: "default",
      },
      blocks: [
        { type: "fact", settings: { label: "Frame", value: "Kiln-dried hardwood, mortise & tenon joints" } },
        { type: "fact", settings: { label: "Headboard", value: "Removable, dry-cleanable linen cover" } },
        { type: "fact", settings: { label: "Delivery", value: "Assembled in your bedroom in under an hour" } },
      ],
    },
    promise(STEPS),
    { type: "featured-collection", settings: { eyebrow: "Finishing touches", heading: "Decor, plants & the little things", heading_align: "left", source: "collection", collection: "decor", limit: 4, columns: 4, layout: "grid", color_scheme: "muted" } },
    { type: "blog-posts", settings: { eyebrow: "The Nest journal", heading: "Notes on living well at home", heading_align: "left", limit: 3, columns: 3 } },
  ]);
}

export function handicraftIndex(): SectionList {
  return sectionList([
    {
      type: "nest-hero",
      settings: {
        layout: "split",
        image: IMG.potteryWheel,
        image_alt: "Potter's hands shaping clay on a spinning wheel",
        eyebrow: "Handmade in Bangladesh",
        heading: "Made slowly, by hands you can name",
        text: "Jute from Faridpur, terracotta from Bogura, brass from Old Dhaka and nakshi kantha from Jessore — sourced directly from the artisans who make them.",
        button_label: "Shop the collection",
        button_link: "/collections/all",
        button_style: "primary",
        button2_label: "Meet the makers",
        button2_link: "/pages/about",
        button2_style: "link",
        height: "large",
        overlay: 0,
        color_scheme: "muted",
      },
    },
    {
      type: "multicolumn",
      settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: "default" },
      blocks: [
        { type: "column", settings: { icon: "scissors", title: "Handmade", text: "Every piece made by hand" } },
        { type: "column", settings: { icon: "heart", title: "Fair pay", text: "Artisans paid before we sell" } },
        { type: "column", settings: { icon: "banknote", title: "Cash on delivery", text: "All 64 districts" } },
        { type: "column", settings: { icon: "package-check", title: "Packed with care", text: "Double-boxed & insured" } },
      ],
    },
    { type: "room-tiles", settings: { eyebrow: "Browse by craft", heading: "Something for every corner", layout: "grid", columns: 3, show_counts: true, text_style: "overlay", button_label: "All collections", button_link: "/collections", button_style: "link" } },
    { type: "featured-collection", settings: { eyebrow: "Fresh from the workshops", heading: "New this month", heading_align: "left", source: "newest", limit: 8, columns: 4, layout: "grid" } },
    {
      type: "materials",
      settings: { eyebrow: "The materials", heading: "Four crafts we love", text: "Every material has a place, a season and a family behind it.", layout: "grid", button_label: "", color_scheme: "muted" },
      blocks: [
        { type: "material", settings: { name: "Golden jute", origin: "Faridpur", image: IMG.juteSwatch, text: "Braided and woven into rugs, baskets and poufs.", care: "Keep dry, vacuum gently, blot spills." } },
        { type: "material", settings: { name: "Terracotta & clay", origin: "Bogura & Dhamrai", image: IMG.ceramic, text: "Wheel-thrown, sun-dried and wood-fired pottery.", care: "Hand wash only. Season unglazed pots with water before first use." } },
        { type: "material", settings: { name: "Cast brass", origin: "Old Dhaka", image: IMG.copperLamp, text: "Lamps, bowls and hardware cast using lost-wax methods.", care: "Wipe with a soft cloth; lemon and salt brings back the shine." } },
        { type: "material", settings: { name: "Carved wood", origin: "Sylhet & Chattogram", image: IMG.walnutTable, text: "Hand-carved mango and sheesham wood, finished with natural oils.", care: "Dust dry; oil twice a year; avoid direct sun." } },
      ],
    },
    {
      type: "editorial-split",
      settings: {
        image: IMG.woodTurning,
        image_alt: "Craftsman turning wood on a lathe",
        inset_image: IMG.brassWorkshop,
        reverse: true,
        full_bleed: true,
        eyebrow: "Meet the makers",
        heading: "Forty-two workshops, one standard",
        text: "<p>We visit every workshop we buy from, agree prices before the work starts and pay on delivery to us — not when the piece sells. It's slower, and it's the only way we want to do it.</p>",
        button_label: "Our story",
        button_link: "/pages/about",
        button_style: "primary",
      },
      blocks: [
        { type: "fact", settings: { label: "Artisans", value: "310 makers across 11 districts" } },
        { type: "fact", settings: { label: "Paid", value: "On delivery to our studio, always" } },
      ],
    },
    {
      type: "shop-the-room",
      settings: {
        eyebrow: "Styled with craft",
        heading: "A corner of jute & wood",
        text: "Natural textures layered the way we like them at home.",
        image: IMG.juteLiving,
        image_alt: "Living room corner with a jute rug, wooden stools and a knitted pouf",
        image_ratio: "portrait",
        layout: "side_reverse",
      },
      blocks: [
        { type: "spot", settings: { x: 45, y: 88 } },
        { type: "spot", settings: { x: 45, y: 68 } },
        { type: "spot", settings: { x: 70, y: 82 } },
      ],
    },
    promise(
      [
        ["package-check", "Packed by hand", "Double-boxed with jute padding — no plastic peanuts."],
        ["truck", "Delivered nationwide", "All 64 districts in 3–6 days via trusted couriers."],
        ["banknote", "Pay on delivery", "Cash, bKash or Nagad when it reaches your door."],
        ["rotate-ccw", "7-day returns", "Damaged or not as described? We'll replace it."],
      ],
      { heading: "Careful from their hands to yours", layout: "icons" },
    ),
    { type: "blog-posts", settings: { eyebrow: "Stories", heading: "From the workshops", heading_align: "left", limit: 3, columns: 3 } },
  ]);
}

export function generalIndex(): SectionList {
  return sectionList([
    {
      type: "nest-hero",
      settings: {
        layout: "card",
        image: IMG.livingBeige,
        image_alt: "Light, calm living room with a cream sectional sofa",
        eyebrow: "Home, simplified",
        heading: "Everything for the home, in one calm place",
        text: "Furniture, lighting, decor and everyday essentials — cash on delivery in all 64 districts and easy 7-day returns.",
        button_label: "Shop everything",
        button_link: "/collections/all",
        button2_label: "Browse collections",
        button2_link: "/collections",
        button2_style: "link",
        highlights: "Cash on delivery in all 64 districts\nEasy 7-day returns\n0% EMI on orders over ৳10,000",
        height: "medium",
        overlay: 0,
      },
    },
    {
      type: "multicolumn",
      settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: "default" },
      blocks: [
        { type: "column", settings: { icon: "banknote", title: "Cash on delivery", text: "All 64 districts" } },
        { type: "column", settings: { icon: "truck", title: "Fast delivery", text: "Dhaka in 1–3 days" } },
        { type: "column", settings: { icon: "rotate-ccw", title: "7-day returns", text: "No questions asked" } },
        { type: "column", settings: { icon: "credit-card", title: "0% EMI", text: "On orders over ৳10,000" } },
      ],
    },
    { type: "room-tiles", settings: { eyebrow: "Departments", heading: "Shop by department", layout: "row", show_counts: true, button_label: "See all", button_link: "/collections", button_style: "link" } },
    { type: "featured-collection", settings: { eyebrow: "Bestsellers", heading: "What everyone's buying", heading_align: "left", source: "best-selling", limit: 6, columns: 3, layout: "grid" } },
    {
      type: "shop-the-room",
      settings: { eyebrow: "Get the look", heading: "Sunlight, leather & a gallery wall", text: "A bright living room styled with pieces from across the store.", image: IMG.livingBright, image_alt: "Sunlit living room with a cognac sofa and a gallery wall", image_ratio: "wide", layout: "stacked" },
      blocks: [
        { type: "spot", settings: { x: 84, y: 62 } },
        { type: "spot", settings: { x: 22, y: 64 } },
        { type: "spot", settings: { x: 66, y: 68 } },
        { type: "spot", settings: { x: 60, y: 22 } },
      ],
    },
    emi({ source: "amount", amount: 60000, image: IMG.diningGreen, image_alt: "Dining room with green velvet chairs around a wooden table", heading: "Big purchase? Pay over 12 months", button_label: "Shop furniture", button_link: "/collections/all", button_style: "light", color_scheme: "inverse" }),
    { type: "featured-collection", settings: { eyebrow: "Just in", heading: "New arrivals", heading_align: "left", source: "newest", limit: 8, columns: 4, layout: "grid" } },
    {
      type: "editorial-split",
      settings: {
        image: IMG.diningBoho,
        image_alt: "Sunny dining nook set for breakfast",
        reverse: true,
        full_bleed: true,
        eyebrow: "Around the table",
        heading: "Small changes, a whole new room",
        text: "<p>A new pendant, a pair of chairs, fresh linen — our stylists put together simple swaps under ৳25,000 that change how a room feels.</p>",
        button_label: "See the edit",
        button_link: "/collections/all",
        color_scheme: "muted",
      },
    },
    promise(
      [
        ["banknote", "Cash on delivery", "Pay in cash, bKash or Nagad when your order arrives."],
        ["truck", "Delivered nationwide", "Dhaka in 1–3 days, other districts in 3–5."],
        ["rotate-ccw", "7-day returns", "Change your mind? We'll arrange a pick-up."],
        ["headset", "Real people", "Call or WhatsApp us 10am – 9pm, every day."],
      ],
      { eyebrow: "Why shop with us", heading: "Easy from checkout to doorstep", layout: "icons", heading_align: "center" },
    ),
    { type: "blog-posts", settings: { eyebrow: "Journal", heading: "Ideas for every room", heading_align: "left", limit: 3, columns: 3 } },
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "thumbnails-bottom", image_ratio: "landscape", media_width: "large", zoom: true, sticky_info: true, sticky_atc: true, show_breadcrumbs: true, color_scheme: "default" },
      blocks: [
        { type: "vendor" },
        { type: "title" },
        { type: "rating" },
        { type: "price", settings: { show_tax_note: false } },
        { type: "emi" },
        { type: "variant_picker", settings: { style: "swatch" } },
        { type: "stock" },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true, buy_now_style: "secondary" } },
        { type: "delivery_estimate" },
        { type: "dimensions" },
        { type: "description", settings: { collapsed: false } },
        { type: "collapsible_tab", settings: { heading: "Materials & care", icon: "leaf", source: "custom", content: "<p>Solid and engineered hardwoods, kiln-dried for our humid climate. Dust with a dry cloth, wipe spills straight away and keep out of direct afternoon sun. Upholstery covers can be dry-cleaned.</p>" } },
        { type: "collapsible_tab", settings: { heading: "Delivery, assembly & returns", icon: "truck", source: "custom", content: "<p>Free delivery and white-glove assembly inside Dhaka on orders over ৳20,000. Other districts: ৳2,500–৳4,500 by covered van. Returns accepted within 7 days of delivery — we collect from your door.</p>" } },
        { type: "share" },
      ],
    },
    promise(STEPS, { eyebrow: "", heading: "Delivered, assembled, guaranteed", layout: "icons", padding: "medium", color_scheme: "muted", note: "" }),
    { type: "product-reviews", settings: { heading: "What customers say" } },
    { type: "related-products", settings: { heading: "Complete the room", limit: 3 } },
  ]);
}

export function templates(): Record<string, SectionList> {
  return {
    product: productTemplate(),
    collection: sectionList([
      { type: "main-collection", settings: { show_banner: true, show_description: true, filters: "sidebar", show_sort: true, per_page: 24, columns: 3, mobile_columns: "1" } },
      emi({ source: "amount", amount: 60000, image: IMG.greenSofa, image_alt: "Emerald velvet sofa", button_label: "", show_calculator: false, heading: "0% EMI for up to 12 months on furniture" }),
    ]),
    collections: sectionList([
      { type: "main-collections-list", settings: { heading: "Shop by room", card_style: "below", columns: 3 } },
      promise(STEPS, { eyebrow: "", heading: "Every order, delivered with care", layout: "icons", padding: "medium", note: "" }),
    ]),
    search: sectionList([
      { type: "main-search", settings: { columns: 3 } },
      { type: "featured-collection", settings: { heading: "Popular right now", heading_align: "left", source: "best-selling", limit: 3, columns: 3, color_scheme: "muted" } },
    ]),
    cart: sectionList([
      { type: "main-cart", settings: { heading: "Your cart" } },
      { type: "featured-collection", settings: { eyebrow: "Finishing touches", heading: "Add a little something", heading_align: "left", source: "collection", collection: "decor", limit: 4, columns: 4 } },
    ]),
    page: sectionList([{ type: "main-page" }]),
    blog: sectionList([
      { type: "main-blog", settings: { heading: "The Nest journal", subheading: "Room ideas, care guides and stories from our workshop.", feature_first: true } },
      { type: "featured-collection", settings: { heading: "Shop the journal", heading_align: "left", source: "featured", limit: 3, columns: 3, color_scheme: "muted" } },
    ]),
    article: sectionList([
      { type: "main-article", settings: { show_cover: true, show_share: true } },
      { type: "featured-collection", settings: { heading: "Pieces from this story", heading_align: "left", source: "featured", limit: 3, columns: 3 } },
    ]),
    account: sectionList([{ type: "main-account", settings: { login_heading: "Welcome home", register_heading: "Create your Nest account", register_text: "Track deliveries and assembly slots, save rooms to your wishlist and check out faster." } }]),
    "404": sectionList([
      { type: "main-404", settings: { heading: "This room is empty", text: "The page you're looking for has moved or never existed. Let's find you somewhere comfortable to sit instead.", show_products: true } },
    ]),
  };
}
