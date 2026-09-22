/**
 * Bazaar defaults: palettes per preset, header/footer groups and every template.
 * Section ids are deterministic (see `sectionList`) so the customizer and storefront agree.
 */
import type { SectionList, SettingValues, ThemeConfig } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG } from "./images";

/* ─────────────────────────── palettes ─────────────────────────── */

const shared: SettingValues = {
  font_heading: "Rubik",
  font_body: "Inter",
  heading_scale: 95,
  heading_case: "normal",
  container_width: 1320,
  section_spacing: 28,
  radius: 8,
  button_radius: 6,
  logo_width: 132,
  header_style: "logo_left",
  card_image_ratio: "square",
  card_style: "card",
  card_text_align: "left",
  card_show_vendor: false,
  card_show_rating: true,
  card_quick_add: true,
  card_hover_swap: false,
  card_show_sale_badge: true,
  card_show_wishlist: true,
  card_free_delivery_over: 999,
  card_show_cod: true,
  card_free_label: "Free delivery",
  card_cod_label: "COD",
  cart_type: "drawer",
  cart_show_free_shipping: true,
  currency_display: "symbol",
};

/** Default: "Marketplace" — light grey page, white cards, marketplace orange + sunshine yellow. */
export const GENERAL_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#f4f5f7",
  color_foreground: "#1b1f24",
  color_primary: "#f5600a",
  color_primary_foreground: "#ffffff",
  color_accent: "#ffc61a",
  color_muted: "#eceef2",
  color_border: "#e1e4ea",
  color_sale: "#e5202e",
  color_card: "#ffffff",
  announcement_text: "Cash on delivery in all 64 districts · Free delivery over ৳999",
};

/** Grocery: "Fresh market" — fresh green primary, yellow accent, Plus Jakarta Sans. */
export const GROCERY_SETTINGS: SettingValues = {
  ...shared,
  font_heading: "Plus Jakarta Sans",
  font_body: "Plus Jakarta Sans",
  heading_scale: 95,
  color_background: "#f2f5f1",
  color_foreground: "#17231a",
  color_primary: "#10913f",
  color_primary_foreground: "#ffffff",
  color_accent: "#ffcb1f",
  color_muted: "#e7eee5",
  color_border: "#dde6da",
  color_sale: "#e5202e",
  color_card: "#ffffff",
  radius: 10,
  button_radius: 8,
  card_free_delivery_over: 499,
  announcement_text: "Fresh groceries in 60 minutes inside Dhaka · Cash on delivery",
};

/** Electronics: "Tech mall" — electric blue with a bold header, yellow accent. */
export const ELECTRONICS_SETTINGS: SettingValues = {
  ...shared,
  font_heading: "Plus Jakarta Sans",
  font_body: "Inter",
  color_background: "#f1f3f8",
  color_foreground: "#0f172a",
  color_primary: "#1d5bf0",
  color_primary_foreground: "#ffffff",
  color_accent: "#ffc61a",
  color_muted: "#e7ebf3",
  color_border: "#dce1eb",
  color_sale: "#ef233c",
  color_card: "#ffffff",
  radius: 8,
  button_radius: 6,
  card_free_delivery_over: 1999,
  announcement_text: "Official warranty on every device · 0% EMI on select cards",
};

/* ─────────────────────────── groups ─────────────────────────── */

export function headerGroup(extra: SettingValues = {}): SectionList {
  return sectionList([
    {
      type: "header",
      settings: {
        style: "classic",
        sticky: true,
        show_topbar: true,
        show_category_bar: true,
        categories_limit: 12,
        menu: "main",
        deals_label: "Flash sale",
        deals_link: "/collections/flash-sale",
        promo_image: IMG.shoppingBags,
        promo_eyebrow: "Mega sale",
        promo_heading: "Up to 60% off across every category",
        promo_link: "/collections/flash-sale",
        ...extra,
      },
    },
  ]);
}

type Promise3 = [string, string, string];

export function footerGroup(about: string, promises: Promise3[], moneyLinks = "Sell on Bazaar | /pages/contact\nBecome an affiliate | /pages/contact\nDelivery partner program | /pages/contact\nAdvertise with us | /pages/contact"): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { about, show_social: true },
      blocks: [
        ...promises.map(([icon, title, text]) => ({ type: "promise", settings: { icon, title, text } })),
        { type: "link_list", settings: { heading: "Customer care", menu: "footer" } },
        { type: "link_list", settings: { heading: "Shop", menu: "main" } },
        { type: "links", settings: { heading: "Make money with us", links: moneyLinks } },
        { type: "contact", settings: { heading: "Contact us" } },
        { type: "app", settings: { heading: "Shop on the go", text: "App-only coupons & live order tracking." } },
        { type: "payments", settings: { heading: "Pay with", methods: "cod, bkash, nagad, rocket, visa, mastercard, amex" } },
      ],
    },
  ]);
}

const MARKET_PROMISES: Promise3[] = [
  ["truck", "Nationwide delivery", "All 64 districts"],
  ["banknote", "Cash on delivery", "Pay when it arrives"],
  ["rotate-ccw", "7-day easy returns", "No questions asked"],
  ["shield-check", "100% genuine", "Or your money back"],
  ["headset", "Help centre", "9am – 11pm, every day"],
];

/* ─────────────────────────── building blocks ─────────────────────────── */

type Slide = { image: string; alt: string; eyebrow: string; heading: string; text: string; link: string; button?: string; align?: "left" | "right" };
type Promo = { image: string; alt: string; eyebrow: string; heading: string; link: string; label?: string };

const hero = (slides: Slide[], promos: Promo[], extra: SettingValues = {}): SectionSpec => ({
  type: "bazaar-hero",
  settings: { show_sidebar: true, sidebar_heading: "Categories", sidebar_source: "collections", sidebar_limit: 9, autoplay: 5, height: "standard", show_promos: true, ...extra },
  blocks: [
    ...slides.map((s) => ({
      type: "slide",
      settings: { image: s.image, image_alt: s.alt, eyebrow: s.eyebrow, heading: s.heading, text: s.text, button_label: s.button ?? "Shop now", link: s.link, align: s.align ?? "left", overlay: true },
    })),
    ...promos.map((p) => ({ type: "promo", settings: { image: p.image, image_alt: p.alt, eyebrow: p.eyebrow, heading: p.heading, link_label: p.label ?? "Shop now", link: p.link } })),
  ],
});

const trustBar = (items: Promise3[]): SectionSpec => ({
  type: "bazaar-trust-bar",
  settings: { padding: "small" },
  blocks: items.map(([icon, title, text]) => ({ type: "item", settings: { icon, title, text } })),
});

const flash = (extra: SettingValues = {}): SectionSpec => ({
  type: "bazaar-flash-sale",
  settings: { heading: "Flash Sale", subheading: "On sale now", timer_mode: "daily", timer_label: "Ending in", collection: "flash-sale", sort: "on-sale", limit: 12, layout: "carousel", link_label: "Shop all deals", padding: "small", ...extra },
});

const categories = (heading: string, items: [string, string, string][], columns = "8"): SectionSpec => ({
  type: "bazaar-category-icons",
  settings: { heading, link_label: "All categories", link: "/collections", columns, shape: "circle", padding: "small" },
  blocks: items.map(([label, image, link]) => ({ type: "category", settings: { label, image, link } })),
});

const rail = (heading: string, collection: string, extra: SettingValues = {}): SectionSpec => ({
  type: "bazaar-product-rail",
  settings: { heading, collection, sort: "best-selling", limit: 12, layout: "carousel", columns: "6", link_label: "See more", show_banner: false, padding: "small", ...extra },
});

const banners = (items: Promo[], height = "medium"): SectionSpec => ({
  type: "bazaar-promo-banners",
  settings: { height, padding: "small" },
  blocks: items.map((b) => ({ type: "banner", settings: { image: b.image, image_alt: b.alt, eyebrow: b.eyebrow, heading: b.heading, button_label: b.label ?? "Shop now", link: b.link } })),
});

const brands = (heading: string, items: [string, string, string][], link = "/collections"): SectionSpec => ({
  type: "bazaar-top-brands",
  settings: { heading, subheading: "Official stores · 100% authentic", link_label: "All brands", link, columns: "6", padding: "small" },
  blocks: items.map(([name, image, offer]) => ({ type: "brand", settings: { name, image, offer } })),
});

const justForYou = (extra: SettingValues = {}): SectionSpec => ({
  type: "bazaar-just-for-you",
  settings: { heading: "Just for you", sort: "newest", total: 36, initial: 12, step: 12, auto: false, columns: "6", more_link: "/collections/all", padding: "small", ...extra },
});

/* ─────────────────────────── index templates ─────────────────────────── */

export function generalIndex(): SectionList {
  return sectionList([
    hero(
      [
        { image: IMG.shoppingBags, alt: "Smiling shopper holding colourful shopping bags", eyebrow: "Mega sale · Live now", heading: "Up to 60% off everything", text: "10,000+ deals across fashion, gadgets, home and groceries — with cash on delivery.", link: "/collections/flash-sale" },
        { image: IMG.laptopRainbow, alt: "Open laptop with a glowing rainbow keyboard", eyebrow: "Tech fest", heading: "Gadgets from ৳990", text: "Official warranty, 0% EMI on select cards and next-day Dhaka delivery.", link: "/collections/electronics" },
        { image: IMG.fruitsMix, alt: "Fresh tropical fruits arranged on a table", eyebrow: "Fresh daily", heading: "Groceries in 60 minutes", text: "Rice, oil, eggs and fresh produce delivered to your door inside Dhaka.", link: "/collections/groceries" },
        { image: IMG.sneakerRed, alt: "Red running sneaker on a red background", eyebrow: "New season", heading: "Fashion under ৳999", text: "Tees, denim, dresses and sneakers — easy 7-day returns.", link: "/collections/fashion" },
      ],
      [
        { image: IMG.headphonesYellow, alt: "Black headphones on a yellow background", eyebrow: "Up to 40% off", heading: "Audio week", link: "/collections/electronics" },
        { image: IMG.makeupFlatlay, alt: "Makeup brushes, lipstick and compact on a beige background", eyebrow: "Buy 2 get 1", heading: "Beauty essentials", link: "/collections/beauty-health" },
      ],
    ),
    trustBar([
      ["truck", "Delivery in 64 districts", "Free over ৳999"],
      ["banknote", "Cash on delivery", "Or bKash, Nagad & cards"],
      ["rotate-ccw", "7-day easy returns", "Hassle-free refunds"],
      ["badge-check", "100% genuine", "Verified sellers only"],
    ]),
    flash(),
    categories("Shop by category", [
      ["Mobiles", IMG.iphoneX, "/collections/electronics"],
      ["Laptops", IMG.laptopDesk, "/collections/electronics"],
      ["Audio", IMG.headphonesGrey, "/collections/electronics"],
      ["Smartwatches", IMG.smartwatchBlack, "/collections/electronics"],
      ["Men's fashion", IMG.blueShirtMan, "/collections/fashion"],
      ["Women's fashion", IMG.floralWrapDress, "/collections/fashion"],
      ["Shoes", IMG.sneakerWhite, "/collections/fashion"],
      ["Bags", IMG.redHandbag, "/collections/fashion"],
      ["Makeup", IMG.lipstick, "/collections/beauty-health"],
      ["Skincare", IMG.serumDropper, "/collections/beauty-health"],
      ["Home decor", IMG.candleGlow, "/collections/home-living"],
      ["Furniture", IMG.whiteArmchair, "/collections/home-living"],
      ["Groceries", IMG.vegMarket, "/collections/groceries"],
      ["Fresh fruits", IMG.apples, "/collections/groceries"],
      ["Rice & oil", IMG.rice, "/collections/groceries"],
      ["Health", IMG.capsules, "/collections/beauty-health"],
    ]),
    rail("Electronics & gadgets", "electronics", {
      subheading: "Official warranty · 0% EMI",
      show_banner: true,
      banner_image: IMG.gamingSetup,
      banner_alt: "Gaming desk setup with monitor and RGB keyboard",
      banner_eyebrow: "Up to 35% off",
      banner_heading: "Upgrade your setup",
      banner_text: "Phones, audio, wearables & more.",
    }),
    banners([
      { image: IMG.livingBright, alt: "Bright living room with sofa and plants", eyebrow: "Up to 50% off", heading: "Home makeover sale", link: "/collections/home-living" },
      { image: IMG.produceAisle, alt: "Supermarket shelves stacked with fresh vegetables", eyebrow: "Save ৳200", heading: "Weekly grocery haul", link: "/collections/groceries" },
      { image: IMG.colorRack, alt: "Rack of colourful clothes", eyebrow: "New arrivals", heading: "Fashion from ৳499", link: "/collections/fashion" },
    ]),
    rail("Fashion for everyone", "fashion", { subheading: "Trending styles · easy returns" }),
    brands("Top brands", [
      ["Xiaomi", IMG.phoneFloat, "Up to 25% off"],
      ["JBL", IMG.speakerFlip, "Up to 30% off"],
      ["QCY", IMG.earbudsWhite, "From ৳1,490"],
      ["Bloom Beauty", IMG.skincareSet, "Buy 2 get 1"],
      ["Nest Living", IMG.yellowArmchair, "Up to 40% off"],
      ["Aurora Studio", IMG.rack, "New season"],
    ]),
    rail("Groceries & essentials", "groceries", {
      subheading: "Delivered in 60 minutes inside Dhaka",
      show_banner: true,
      banner_image: IMG.supermarket,
      banner_alt: "Well-stocked supermarket aisle",
      banner_eyebrow: "Daily savings",
      banner_heading: "Stock up for less",
      banner_text: "Rice, oil, eggs, honey & more.",
    }),
    rail("Beauty & health", "beauty-health", { subheading: "Authentic skincare & wellness" }),
    rail("Home & living", "home-living", { subheading: "Decor, furniture & plants" }),
    justForYou(),
  ]);
}

export function groceryIndex(): SectionList {
  return sectionList([
    hero(
      [
        { image: IMG.fruitBasket, alt: "Basket overflowing with fresh fruit", eyebrow: "Fresh every morning", heading: "Farm-fresh fruit, 20% off", text: "Hand-picked produce delivered in 60 minutes inside Dhaka.", link: "/collections/groceries" },
        { image: IMG.supermarket, alt: "Supermarket aisle with stocked shelves", eyebrow: "Monthly bazaar", heading: "Your whole list, one order", text: "Rice, dal, oil and spices at wholesale prices — cash on delivery.", link: "/collections/groceries" },
        { image: IMG.spices, alt: "Whole spices and herbs laid out on a white table", eyebrow: "Deshi spices", heading: "Masala from ৳45", text: "Freshly ground turmeric, chilli, cumin and garam masala.", link: "/collections/groceries" },
      ],
      [
        { image: IMG.eggsTray, alt: "Tray of brown eggs", eyebrow: "Save ৳30", heading: "Farm eggs, per dozen", link: "/collections/groceries" },
        { image: IMG.honey, alt: "Honey dripping into a glass jar", eyebrow: "Pure & raw", heading: "Sundarbans honey", link: "/collections/groceries" },
      ],
    ),
    trustBar([
      ["clock", "60-minute delivery", "Inside Dhaka, 8am – 11pm"],
      ["leaf", "Fresh or free", "Quality checked every order"],
      ["banknote", "Cash on delivery", "bKash & Nagad too"],
      ["rotate-ccw", "Instant refunds", "For anything damaged"],
    ]),
    categories(
      "Shop by aisle",
      [
        ["Fruits", IMG.apples, "/collections/groceries"],
        ["Vegetables", IMG.tomatoes, "/collections/groceries"],
        ["Rice & grains", IMG.rice, "/collections/groceries"],
        ["Oil & ghee", IMG.oil, "/collections/groceries"],
        ["Fish", IMG.fish, "/collections/groceries"],
        ["Meat & poultry", IMG.rawChicken, "/collections/groceries"],
        ["Dairy & eggs", IMG.milkCarton, "/collections/groceries"],
        ["Snacks", IMG.chips, "/collections/groceries"],
        ["Tea & drinks", IMG.tea, "/collections/groceries"],
        ["Personal care", IMG.cleanser, "/collections/beauty-health"],
        ["Health", IMG.capsules, "/collections/beauty-health"],
        ["Household", IMG.candleGlow, "/collections/home-living"],
      ],
      "6",
    ),
    flash({ heading: "Fresh Deals", subheading: "Today only", link_label: "All offers" }),
    rail("Daily essentials", "groceries", {
      subheading: "Most re-ordered this week",
      show_banner: true,
      banner_image: IMG.vegMarket,
      banner_alt: "Colourful vegetables piled at a market",
      banner_eyebrow: "Fresh produce",
      banner_heading: "Veggies from ৳20",
      banner_text: "Sourced from local farms.",
    }),
    banners([
      { image: IMG.milkPour, alt: "Milk being poured into a glass", eyebrow: "Morning combo", heading: "Milk, bread & eggs", link: "/collections/groceries" },
      { image: IMG.breadLoaves, alt: "Freshly baked bread loaves", eyebrow: "Baked today", heading: "Bakery fresh", link: "/collections/groceries" },
    ]),
    rail("Personal care & health", "beauty-health", { subheading: "Genuine brands, pharmacy-fresh" }),
    brands("Trusted brands", [
      ["FreshMart", IMG.vegMarket, "Up to 20% off"],
      ["Bloom Beauty", IMG.skincareSet, "Buy 2 get 1"],
      ["Pulse Pharmacy", IMG.proteinPowder, "Save 15%"],
      ["Nest Living", IMG.yellowArmchair, "Home care deals"],
    ]),
    rail("Home & household", "home-living", { subheading: "Cleaning, kitchen & decor" }),
    justForYou({ heading: "Picked for your basket", sort: "best-selling" }),
  ]);
}

export function electronicsIndex(): SectionList {
  return sectionList([
    hero(
      [
        { image: IMG.gamingSetup, alt: "Gaming desk setup with a monitor and RGB keyboard", eyebrow: "Gaming week", heading: "Level up your setup", text: "Monitors, keyboards, controllers and GPUs with official warranty.", link: "/collections/electronics" },
        { image: IMG.laptopGlow, alt: "Laptop keyboard glowing in neon colours", eyebrow: "0% EMI", heading: "Laptops from ৳39,990", text: "Pay in 3–12 months on select cards, same-day Dhaka delivery.", link: "/collections/electronics" },
        { image: IMG.smartTv, alt: "Smart TV showing streaming apps in a dark room", eyebrow: "Big screen days", heading: "Smart TVs up to 30% off", text: "Free wall-mount installation inside Dhaka.", link: "/collections/electronics" },
      ],
      [
        { image: IMG.phoneDark, alt: "Smartphone with a dark wallpaper", eyebrow: "New launch", heading: "Flagship phones", link: "/collections/electronics" },
        { image: IMG.headphonesDark, alt: "Black over-ear headphones", eyebrow: "Up to 40% off", heading: "Audio deals", link: "/collections/electronics" },
      ],
    ),
    trustBar([
      ["shield-check", "Official warranty", "Brand-backed, every device"],
      ["credit-card", "0% EMI", "On 20+ bank cards"],
      ["truck", "Same-day delivery", "Inside Dhaka"],
      ["rotate-ccw", "7-day replacement", "For manufacturing defects"],
    ]),
    flash({ heading: "Lightning Deals", subheading: "Limited stock" }),
    categories("Shop by category", [
      ["Phones", IMG.iphoneX, "/collections/electronics"],
      ["Laptops", IMG.laptopDesk, "/collections/electronics"],
      ["Tablets", IMG.tablet, "/collections/electronics"],
      ["Headphones", IMG.headphonesGrey, "/collections/electronics"],
      ["Smartwatches", IMG.smartwatchBlack, "/collections/electronics"],
      ["Cameras", IMG.camera, "/collections/electronics"],
      ["Keyboards", IMG.mechKeyboard, "/collections/electronics"],
      ["Mice", IMG.mouse, "/collections/electronics"],
      ["Power banks", IMG.powerbank, "/collections/electronics"],
      ["Printers", IMG.printer, "/collections/electronics"],
      ["Smart home", IMG.smartHome, "/collections/electronics"],
      ["Gaming", IMG.ps5, "/collections/electronics"],
    ], "6"),
    rail("Top picks in electronics", "electronics", {
      subheading: "Best sellers this week",
      show_banner: true,
      banner_image: IMG.droneFold,
      banner_alt: "Drone flying over a river",
      banner_eyebrow: "New drops",
      banner_heading: "Drones & cameras",
      banner_text: "Capture every angle.",
    }),
    banners([
      { image: IMG.ps5, alt: "Game controller resting on a console", eyebrow: "Bundle deals", heading: "Console & controllers", link: "/collections/electronics" },
      { image: IMG.gpu, alt: "Graphics card close-up", eyebrow: "In stock", heading: "Graphics cards", link: "/collections/electronics" },
      { image: IMG.techFlatlay, alt: "Laptop, camera and phone laid flat on a desk", eyebrow: "Work from home", heading: "Office essentials", link: "/collections/electronics" },
    ]),
    brands("Official brand stores", [
      ["Xiaomi", IMG.phoneFloat, "Up to 25% off"],
      ["JBL", IMG.speakerFlip, "Up to 30% off"],
      ["QCY", IMG.earbudsWhite, "From ৳1,490"],
      ["Sony", IMG.headphonesDark, "Extra 10% off"],
      ["DJI", IMG.droneFold, "0% EMI"],
      ["Logitech", IMG.mouse, "Up to 20% off"],
    ]),
    rail("New arrivals", "", { sort: "newest", subheading: "Just landed in stock" }),
    rail("Top rated", "", { sort: "rating", subheading: "Loved by thousands of buyers" }),
    justForYou({ heading: "Recommended for you", sort: "best-selling" }),
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "thumbnails-left", image_ratio: "square", media_width: "medium", zoom: true, sticky_info: true, sticky_atc: true, show_breadcrumbs: true, padding: "small" },
      blocks: [
        { type: "title" },
        { type: "rating" },
        { type: "price", settings: { show_tax_note: true, tax_note: "VAT included. Delivery charge calculated at checkout." } },
        { type: "voucher" },
        { type: "variant_picker", settings: { style: "buttons" } },
        { type: "stock", settings: { threshold: 5 } },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true, buy_now_label: "Buy now" } },
        { type: "delivery_info" },
        { type: "trust" },
        { type: "seller" },
        { type: "description", settings: { collapsed: false } },
        { type: "collapsible_tab", settings: { heading: "Delivery & returns", icon: "truck" } },
        { type: "share" },
      ],
    },
    { type: "product-reviews", settings: { heading: "Ratings & reviews" } },
    { type: "related-products", settings: { heading: "People also viewed", limit: 12, layout: "carousel", columns: 6, padding: "small" } },
    rail("More from the store", "", { sort: "best-selling" }),
    justForYou({ total: 18, initial: 12, step: 6 }),
  ]);
}

const bestSellers = (heading = "Best sellers"): SectionSpec => rail(heading, "", { sort: "best-selling" });

export function templates(index: SectionList): ThemeConfig["templates"] {
  return {
    index,
    product: productTemplate(),
    collection: sectionList([
      { type: "main-collection", settings: { show_banner: true, show_description: true, filters: "sidebar", show_sort: true, per_page: 30, columns: 5, padding: "small" } },
      bestSellers("Top sellers across the store"),
    ]),
    collections: sectionList([{ type: "main-collections-list", settings: { heading: "All categories" } }, brands("Top brands", [["Xiaomi", IMG.phoneFloat, "Up to 25% off"], ["JBL", IMG.speakerFlip, "Up to 30% off"], ["QCY", IMG.earbudsWhite, "From ৳1,490"], ["Bloom Beauty", IMG.skincareSet, "Buy 2 get 1"], ["Nest Living", IMG.yellowArmchair, "Up to 40% off"], ["Aurora Studio", IMG.rack, "New season"]])]),
    search: sectionList([{ type: "main-search", settings: { columns: 5, per_page: 30, padding: "small" } }, bestSellers("Popular right now")]),
    cart: sectionList([{ type: "main-cart", settings: { heading: "Shopping cart" } }, flash({ heading: "Add-on deals", subheading: "Before you check out" }), justForYou({ total: 12, initial: 6, step: 6, heading: "You may also like" })]),
    page: sectionList([{ type: "main-page" }]),
    blog: sectionList([{ type: "main-blog", settings: { heading: "Buying guides & news", subheading: "Tips, comparisons and deal alerts from our team." } }]),
    article: sectionList([{ type: "main-article" }, bestSellers("Shop the story")]),
    account: sectionList([{ type: "main-account" }, justForYou({ total: 12, initial: 6, step: 6, heading: "Recommended for you" })]),
    "404": sectionList([{ type: "main-404" }, bestSellers("Popular right now")]),
  };
}

/* ─────────────────────────── exports used by index.ts ─────────────────────────── */

export const generalHeader = () => headerGroup();
export const generalFooter = () => footerGroup("Bangladesh's everyday marketplace — genuine products, cash on delivery and doorstep delivery in all 64 districts.", MARKET_PROMISES);

export const groceryHeader = () =>
  headerGroup({
    topbar_text: "Fresh groceries in 60 minutes inside Dhaka",
    search_placeholder: "Search rice, oil, eggs, fish, vegetables…",
    trending: "Miniket rice, Soybean oil, Eggs, Honey, Potatoes",
    deals_label: "Fresh deals",
    bar_note: "Free delivery over ৳499",
    promo_image: IMG.fruitBasket,
    promo_eyebrow: "Fresh daily",
    promo_heading: "Fruit & veg, 20% off today",
    promo_link: "/collections/groceries",
    account_sub: "Orders & lists",
    cart_label: "My basket",
  });
export const groceryFooter = () =>
  footerGroup("Your neighbourhood supermarket, online — fresh groceries in 60 minutes inside Dhaka and nationwide delivery on pantry staples.", [
    ["clock", "60-minute delivery", "Inside Dhaka"],
    ["leaf", "Fresh or free", "Quality guaranteed"],
    ["banknote", "Cash on delivery", "bKash & Nagad too"],
    ["rotate-ccw", "Instant refunds", "For damaged items"],
  ], "Supply to us | /pages/contact\nBecome a rider | /pages/contact\nCorporate orders | /pages/contact");

export const electronicsHeader = () =>
  headerGroup({
    style: "bold",
    topbar_text: "Official warranty on every device · 0% EMI on 20+ bank cards",
    search_placeholder: "Search phones, laptops, headphones, brands…",
    trending: "Redmi Note 13, Earbuds, Power bank, Smartwatch, JBL",
    deals_label: "Lightning deals",
    bar_note: "Same-day delivery in Dhaka",
    promo_image: IMG.gamingSetup,
    promo_eyebrow: "Gaming week",
    promo_heading: "Consoles, GPUs & gear up to 35% off",
    promo_link: "/collections/electronics",
  });
export const electronicsFooter = () =>
  footerGroup("Genuine gadgets with official warranty, easy EMI, same-day delivery in Dhaka and cash on delivery nationwide.", [
    ["shield-check", "Official warranty", "On every device"],
    ["credit-card", "0% EMI", "On select cards"],
    ["truck", "Same-day delivery", "Inside Dhaka"],
    ["rotate-ccw", "7-day replacement", "Manufacturing defects"],
    ["headset", "Tech support", "10am – 10pm daily"],
  ]);
