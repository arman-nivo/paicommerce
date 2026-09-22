/**
 * Volt defaults: palettes per preset, header/footer groups and every template.
 * Section ids are deterministic (see `sectionList`) so the customizer and storefront agree.
 */
import type { SectionList, SettingValues, ThemeConfig } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG } from "./images";
import { GALAXY, IPHONE, REDMI } from "./sections/spec-compare";

/* ─────────────────────────── palettes ─────────────────────────── */

const shared: SettingValues = {
  font_heading: "Space Grotesk",
  font_body: "Inter",
  heading_scale: 100,
  heading_case: "normal",
  container_width: 1400,
  section_spacing: 56,
  radius: 14,
  button_radius: 10,
  logo_width: 130,
  header_style: "logo_left",
  card_image_ratio: "square",
  card_style: "card",
  card_text_align: "left",
  card_show_vendor: true,
  card_show_rating: true,
  card_quick_add: true,
  card_hover_swap: true,
  card_show_sale_badge: true,
  card_show_wishlist: true,
  cart_type: "drawer",
  cart_show_free_shipping: true,
};

/** Default: "Midnight" — near-black, volt-lime primary, cyan accent. */
export const ELECTRONICS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#07090d",
  color_foreground: "#e7ecf3",
  color_primary: "#c6ff3d",
  color_primary_foreground: "#0a0d05",
  color_accent: "#38bdf8",
  color_muted: "#11151d",
  color_border: "#1f2632",
  color_sale: "#ff4d6d",
  color_card: "#0c1016",
  announcement_text: "Official warranty on every device · Same-day delivery in Dhaka",
};

/** Automotive: "Garage" — graphite, racing red and amber. */
export const AUTOMOTIVE_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#0b0b0c",
  color_foreground: "#f1f1f1",
  color_primary: "#ff3b30",
  color_primary_foreground: "#ffffff",
  color_accent: "#fbbf24",
  color_muted: "#161618",
  color_border: "#2a2a2e",
  color_sale: "#fbbf24",
  color_card: "#111113",
  font_heading: "Archivo",
  heading_case: "uppercase",
  radius: 6,
  button_radius: 4,
  card_image_ratio: "landscape",
  announcement_text: "Genuine parts with fitment guarantee · Nationwide delivery",
};

/** General: "Daylight" — a light tech store with an electric-blue primary. */
export const DAYLIGHT_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#f6f7fb",
  color_foreground: "#0b1020",
  color_primary: "#2f5bff",
  color_primary_foreground: "#ffffff",
  color_accent: "#0891b2",
  color_muted: "#eceef6",
  color_border: "#dfe3ee",
  color_sale: "#e11d48",
  color_card: "#ffffff",
  announcement_text: "Free delivery on orders over ৳5,000 · Cash on delivery nationwide",
};

/* ─────────────────────────── groups ─────────────────────────── */

export function headerGroup(messages: string[], promo: { image: string; heading: string; eyebrow: string }, extra: SettingValues = {}): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      settings: { style: "marquee", show_phone: false, color_scheme: "primary" },
      blocks: messages.map((text) => ({ type: "announcement", settings: { text } })),
    },
    {
      type: "header",
      settings: {
        sticky: true,
        show_utility: true,
        show_categories: true,
        show_promo: true,
        promo_image: promo.image,
        promo_heading: promo.heading,
        promo_eyebrow: promo.eyebrow,
        promo_link: "/collections/all",
        ...extra,
      },
    },
  ]);
}

export function footerGroup(about: string, promises: [string, string, string][]): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { about, show_newsletter: true },
      blocks: [
        ...promises.map(([icon, title, text]) => ({ type: "promise", settings: { icon, title, text } })),
        { type: "link_list", settings: { heading: "Shop", menu: "main" } },
        { type: "link_list", settings: { heading: "Customer care", menu: "footer" } },
        { type: "contact", settings: { heading: "Support" } },
      ],
    },
  ]);
}

const TECH_PROMISES: [string, string, string][] = [
  ["shield-check", "Official warranty", "Brand-backed on every device"],
  ["truck", "Express delivery", "Same day inside Dhaka"],
  ["banknote", "Cash on delivery", "Pay when it arrives"],
  ["headset", "Tech support", "10am – 10pm, every day"],
];

/* ─────────────────────────── shared specs ─────────────────────────── */

const trustStrip = (items: [string, string, string][]): SectionSpec => ({
  type: "multicolumn",
  settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: "default", heading: "" },
  blocks: items.map(([icon, title, text]) => ({ type: "column", settings: { icon, title, text } })),
});

const testimonials = (quotes: [string, string, string, string][], heading = "Loved by people who know their specs"): SectionSpec => ({
  type: "testimonials",
  settings: { eyebrow: "Reviews", heading, heading_align: "left", layout: "grid", columns: 3, color_scheme: "muted" },
  blocks: quotes.map(([quote, author, location, avatar]) => ({ type: "testimonial", settings: { quote, author, location, avatar, rating: 5 } })),
});

const brands = (names: string[], heading = "Shop by brand"): SectionSpec => ({
  type: "brand-carousel",
  settings: { eyebrow: "Authorised reseller", heading, layout: "marquee", speed: 40, grayscale: true, padding: "small" },
  blocks: names.map((name) => ({ type: "brand", settings: { name } })),
});

/* ─────────────────────────── index templates ─────────────────────────── */

export function electronicsIndex(): SectionList {
  return sectionList([
    {
      type: "volt-hero",
      settings: {
        product: "apple-iphone-15-pro",
        image: IMG.phoneDark,
        image_alt: "Flagship smartphone glowing on a black background",
        eyebrow: "Just landed",
        heading: "Pro power. Pocket size.",
        text: "The newest flagships with official warranty, easy EMI and same-day delivery in Dhaka.",
        specs: "A17 Pro chip, 48MP camera, Titanium, USB-C",
        price_label: "Starting at",
        button_label: "Buy now",
        button_link: "",
        button_style: "primary",
        button2_label: "Compare phones",
        button2_link: "#section-spec-compare",
        button2_style: "secondary",
        height: "large",
      },
      blocks: [
        { type: "promo", settings: { image: IMG.headphonesDark, image_alt: "Black over-ear headphones", eyebrow: "Up to 20% off", heading: "Noise-cancelling audio", link_label: "Shop audio", link: "/collections/audio" } },
        { type: "promo", settings: { image: IMG.gamingPc, image_alt: "Gaming PC with blue RGB fans", eyebrow: "New", heading: "Gaming gear & GPUs", link_label: "Shop gaming", link: "/collections/gaming" } },
      ],
    },
    trustStrip([
      ["shield-check", "Official warranty", "On every device"],
      ["truck", "Same-day delivery", "Inside Dhaka"],
      ["credit-card", "Easy EMI", "On select cards"],
      ["rotate-ccw", "7-day replacement", "Hassle-free"],
    ]),
    {
      type: "flash-deals",
      settings: { eyebrow: "Flash deals", heading: "Today's lightning deals", timer_mode: "daily", source: "on-sale", limit: 8, layout: "carousel", stock_bar: true, link_label: "View all deals", link: "/collections/all" },
    },
    {
      type: "collection-list",
      settings: { eyebrow: "", heading: "Shop by category", heading_align: "left", limit: 6, columns: 6, card_style: "below", image_ratio: "square", layout: "grid", show_count: false, padding: "small" },
    },
    {
      type: "product-tabs",
      settings: { eyebrow: "Trending now", heading: "Most wanted this week", limit: 8, columns: "4" },
      blocks: [
        { type: "tab", settings: { label: "Smartphones", collection: "smartphones", source: "best-selling" } },
        { type: "tab", settings: { label: "Laptops & tablets", collection: "laptops-tablets", source: "best-selling" } },
        { type: "tab", settings: { label: "Audio", collection: "audio", source: "best-selling" } },
        { type: "tab", settings: { label: "Gaming", collection: "gaming", source: "best-selling" } },
      ],
    },
    {
      type: "spec-highlight",
      settings: {
        product: "sony-wh-1000xm5-noise-cancelling-headphones",
        image: IMG.headphonesDark,
        image_alt: "Over-ear noise-cancelling headphones",
        eyebrow: "Spotlight",
        heading: "Silence, engineered.",
        text: "Industry-leading noise cancellation, eight microphones and a 30-hour battery — tuned for long flights and longer workdays.",
        button_label: "Buy now",
        button_link: "",
        button_style: "primary",
        image_position: "left",
      },
      blocks: [
        { type: "spec", settings: { icon: "headphones", value: "8 mics", label: "Adaptive noise cancelling" } },
        { type: "spec", settings: { icon: "battery-charging", value: "30h", label: "Battery life" } },
        { type: "spec", settings: { icon: "zap", value: "3 min", label: "Quick charge = 3h play" } },
        { type: "spec", settings: { icon: "bluetooth", value: "2×", label: "Multipoint pairing" } },
      ],
    },
    {
      type: "bento-grid",
      settings: { eyebrow: "Why shop with us", heading: "Built for people who read spec sheets" },
      blocks: [
        { type: "tile", settings: { size: "large", style: "image", image: IMG.gamingPc, image_alt: "Custom gaming PC", eyebrow: "Gaming", heading: "Frames per second, not seconds per frame", text: "GPUs, controllers and mechanical keyboards for every setup.", link_label: "Shop gaming", link: "/collections/gaming" } },
        { type: "tile", settings: { size: "small", style: "stat", stat: "100%", heading: "Genuine products", text: "Sourced from official distributors only." } },
        { type: "tile", settings: { size: "small", style: "feature", icon: "truck", heading: "Same-day Dhaka delivery", text: "Order before 2 pm, unbox tonight." } },
        { type: "tile", settings: { size: "wide", style: "image", image: IMG.laptopGlow, image_alt: "Laptop keyboard lit in neon colours", eyebrow: "Laptops", heading: "Thin, light, ridiculously fast", link_label: "Shop laptops", link: "/collections/laptops-tablets" } },
        { type: "tile", settings: { size: "small", style: "image", image: IMG.smartwatchBlack, image_alt: "Black smartwatch", eyebrow: "Wearables", heading: "Smartwatches", link_label: "Shop", link: "/collections/wearables" } },
        { type: "tile", settings: { size: "small", style: "feature", icon: "headset", heading: "Real tech support", text: "Setup help and advice from our in-house experts." } },
      ],
    },
    {
      id: "spec-compare",
      type: "spec-compare",
      settings: { eyebrow: "Compare", heading: "Find your flagship", subheading: "Three of our best-selling phones, spec for spec. All with official warranty.", show_rating: true, button_label: "View details" },
      blocks: [
        { type: "product", settings: { product: "apple-iphone-15-pro", title: "iPhone 15 Pro", specs: IPHONE } },
        { type: "product", settings: { product: "samsung-galaxy-s24-ultra", title: "Galaxy S24 Ultra", badge: "Editor's pick", highlight: true, specs: GALAXY } },
        { type: "product", settings: { product: "xiaomi-redmi-note-13-pro", title: "Redmi Note 13 Pro", badge: "Best value", specs: REDMI } },
      ],
    },
    brands(["Apple", "Samsung", "Sony", "Xiaomi", "ASUS", "Dell", "JBL", "DJI", "Canon", "NVIDIA", "Keychron"]),
    testimonials([
      ["Ordered a MacBook Air at 11 am and it was on my desk in Gulshan by evening. Sealed box, official warranty card — exactly as promised.", "Rafid H.", "Dhaka", IMG.avatar2],
      ["The comparison table helped me pick between two phones in five minutes. Support answered my EMI question on WhatsApp instantly.", "Nusrat J.", "Chattogram", IMG.avatar1],
      ["Genuine Sony headphones at a better price than the mall. Cash on delivery made it risk-free.", "Sadia K.", "Sylhet", IMG.avatar3],
    ]),
    { type: "blog-posts", settings: { eyebrow: "Guides", heading: "Buying guides & reviews", limit: 3, columns: 3 } },
  ]);
}

export function automotiveIndex(): SectionList {
  return sectionList([
    {
      type: "volt-hero",
      settings: {
        product: "",
        image: IMG.autoGarage,
        image_alt: "Sports car parked in a dark garage",
        eyebrow: "Performance season",
        heading: "Parts that perform.",
        text: "Genuine spares, lubricants and car-care kits with a fitment guarantee — delivered to your garage.",
        specs: "OEM-grade, Fitment guarantee, Nationwide delivery",
        button_label: "Shop parts",
        button_link: "/collections/all",
        button_style: "primary",
        button2_label: "Find by vehicle",
        button2_link: "/pages/contact",
        button2_style: "secondary",
        height: "large",
      },
      blocks: [
        { type: "promo", settings: { image: IMG.autoOil, image_alt: "Engine oil being poured into a car engine", eyebrow: "Save 15%", heading: "Oil & fluids", link_label: "Shop fluids", link: "/collections/all" } },
        { type: "promo", settings: { image: IMG.autoMechanic, image_alt: "Mechanic's hands with a wrench", eyebrow: "Pro tools", heading: "Workshop essentials", link_label: "Shop tools", link: "/collections/all" } },
      ],
    },
    trustStrip([
      ["badge-check", "Genuine parts", "Sourced from OEM suppliers"],
      ["package-check", "Fitment guarantee", "Or free exchange"],
      ["truck", "Nationwide delivery", "All 64 districts"],
      ["headset", "Expert advice", "Talk to a technician"],
    ]),
    { type: "flash-deals", settings: { eyebrow: "Garage deals", heading: "This week's deals", timer_mode: "daily", source: "on-sale", limit: 8, layout: "carousel", stock_bar: true, link_label: "All deals", link: "/collections/all" } },
    {
      type: "product-tabs",
      settings: { eyebrow: "Top picks", heading: "Most ordered parts", limit: 8, columns: "4" },
      blocks: [
        { type: "tab", settings: { label: "Best sellers", source: "best-selling" } },
        { type: "tab", settings: { label: "New arrivals", source: "newest" } },
        { type: "tab", settings: { label: "Top rated", source: "rating" } },
      ],
    },
    {
      type: "bento-grid",
      settings: { eyebrow: "Garage-grade", heading: "Everything your car needs, in one place" },
      blocks: [
        { type: "tile", settings: { size: "large", style: "image", image: IMG.autoEngine, image_alt: "Close-up of an engine bay", eyebrow: "Engine", heading: "Filters, belts & ignition", link_label: "Shop engine parts", link: "/collections/all" } },
        { type: "tile", settings: { size: "small", style: "stat", stat: "12k+", heading: "Parts in stock", text: "For 300+ popular models." } },
        { type: "tile", settings: { size: "small", style: "feature", icon: "package-check", heading: "Fitment guarantee", text: "Wrong part? We exchange it free." } },
        { type: "tile", settings: { size: "wide", style: "image", image: IMG.autoRoad, image_alt: "Black sports sedan on a highway", eyebrow: "Car care", heading: "Detailing & protection", link_label: "Shop car care", link: "/collections/all" } },
      ],
    },
    brands(["Bosch", "Castrol", "Mobil 1", "Michelin", "Philips", "3M", "Denso", "NGK"], "Trusted brands"),
    testimonials(
      [
        ["Brake pads fit perfectly on my Axio. Delivered to Mirpur in a day with the invoice for warranty.", "Tanvir A.", "Dhaka", IMG.avatar2],
        ["They double-checked my chassis number before shipping. Rare level of care.", "Imran K.", "Khulna", IMG.avatar3],
        ["Genuine Castrol oil at a fair price, plus cash on delivery. My go-to now.", "Farhana R.", "Rajshahi", IMG.avatar1],
      ],
      "Trusted by drivers across Bangladesh",
    ),
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "thumbnails-left", image_ratio: "square", media_width: "medium", zoom: true, sticky_info: true, sticky_atc: true, show_breadcrumbs: true },
      blocks: [
        { type: "vendor" },
        { type: "title" },
        { type: "rating" },
        { type: "price", settings: { show_tax_note: true, tax_note: "VAT included. Delivery calculated at checkout." } },
        { type: "sku" },
        { type: "variant_picker", settings: { style: "buttons" } },
        { type: "stock", settings: { threshold: 5 } },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true, buy_now_style: "secondary" } },
        { type: "assurance" },
        { type: "delivery_info" },
        { type: "description", settings: { collapsed: false } },
        { type: "collapsible_tab", settings: { heading: "Warranty & service", icon: "shield-check", content: "<p>Covered by the brand's official warranty. Keep your invoice — it's your warranty card. Service is available at authorised centres across Bangladesh.</p>" } },
        { type: "collapsible_tab", settings: { heading: "Delivery & replacement", icon: "truck" } },
        { type: "share" },
      ],
    },
    { type: "product-reviews" },
    { type: "related-products", settings: { heading: "Frequently bought together", layout: "carousel", limit: 8, columns: 4 } },
    brands(["Apple", "Samsung", "Sony", "Xiaomi", "ASUS", "Dell", "JBL", "DJI", "Canon"]),
  ]);
}

const bestSellersTabs: SectionSpec = {
  type: "product-tabs",
  settings: { eyebrow: "Popular", heading: "Customers are buying", limit: 4, columns: "4", padding: "small" },
  blocks: [{ type: "tab", settings: { label: "Best sellers", source: "best-selling" } }],
};

export function templates(index: SectionList): ThemeConfig["templates"] {
  return {
    index,
    product: productTemplate(),
    collection: sectionList([{ type: "main-collection", settings: { show_banner: true, show_description: true, filters: "sidebar", show_sort: true, per_page: 24, columns: 4 } }]),
    collections: sectionList([{ type: "main-collections-list", settings: { heading: "All categories" } }, brands(["Apple", "Samsung", "Sony", "Xiaomi", "ASUS", "JBL", "DJI"])]),
    search: sectionList([{ type: "main-search", settings: { columns: 4 } }, bestSellersTabs]),
    cart: sectionList([
      { type: "main-cart", settings: { heading: "Your cart" } },
      { type: "flash-deals", settings: { eyebrow: "Before you go", heading: "Deals you might like", timer_mode: "daily", source: "on-sale", limit: 8, layout: "carousel", stock_bar: false, padding: "small" } },
    ]),
    page: sectionList([{ type: "main-page" }]),
    blog: sectionList([{ type: "main-blog", settings: { heading: "Guides & reviews", subheading: "Buying guides, comparisons and how-tos from our tech team." } }]),
    article: sectionList([{ type: "main-article" }, { ...bestSellersTabs, settings: { ...bestSellersTabs.settings, heading: "Gear from this story" } }]),
    account: sectionList([{ type: "main-account" }]),
    "404": sectionList([{ type: "main-404" }, bestSellersTabs]),
  };
}

/* ─────────────────────────── exports used by index.ts ─────────────────────────── */

export const electronicsHeader = () =>
  headerGroup(["Official warranty on every device", "Same-day delivery inside Dhaka", "Cash on delivery nationwide"], { image: IMG.gamingPc, heading: "Build your dream rig", eyebrow: "New drop" });

export const electronicsFooter = () => footerGroup("Genuine gadgets with official warranty, same-day delivery in Dhaka and cash on delivery nationwide.", TECH_PROMISES);

export const automotiveHeader = () =>
  headerGroup(
    ["Genuine parts with fitment guarantee", "Free delivery on orders over ৳5,000", "Cash on delivery nationwide"],
    { image: IMG.autoEngine, heading: "Service kits for every model", eyebrow: "Garage deals" },
    { search_placeholder: "Search parts, oils, brands or your car model…", trending: "Engine oil, Brake pads, Air filter, Wiper blades", utility_text: "Genuine parts · Fitment guaranteed", deals_label: "Garage deals" },
  );

export const automotiveFooter = () =>
  footerGroup("Genuine spares, lubricants and car-care kits with a fitment guarantee — delivered nationwide.", [
    ["badge-check", "Genuine parts", "From OEM suppliers"],
    ["package-check", "Fitment guarantee", "Or free exchange"],
    ["banknote", "Cash on delivery", "Pay when it arrives"],
    ["headset", "Technician support", "Call before you buy"],
  ]);
