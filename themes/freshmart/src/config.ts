/**
 * FreshMart defaults: header/footer groups and every template, per preset.
 * Section ids are deterministic (see `sectionList`) so the customizer and storefront agree.
 * Collection handles match the seeded `freshmart-demo` store; sections fall back gracefully
 * (collections list / best sellers) when a store doesn't have them.
 */
import type { SectionList, ThemeConfig } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG } from "./images";

/* ─────────────────────────── header & footer ─────────────────────────── */

type HeaderOpts = { promise: string; areas?: string; placeholder: string; categories?: { collection?: string; label?: string; icon?: string; link?: string; highlight?: boolean }[] };

export function headerGroup(o: HeaderOpts): SectionList {
  return sectionList([
    {
      type: "header",
      settings: {
        promise: o.promise,
        search_placeholder: o.placeholder,
        ...(o.areas ? { areas: o.areas } : {}),
        show_location: true,
        show_categories: true,
        show_bottom_nav: true,
        bar_scheme: "primary",
      },
      blocks: (o.categories ?? []).map((c) => ({ type: "category", settings: c })),
    },
  ]);
}

type FooterOpts = { about: string; features: [string, string, string][]; appHeading: string; appText: string };

export function footerGroup(o: FooterOpts): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { color_scheme: "inverse", strip_scheme: "muted" },
      blocks: [
        ...o.features.map(([icon, title, text]) => ({ type: "feature", settings: { icon, title, text } })),
        { type: "brand", settings: { text: o.about } },
        { type: "link_list", settings: { heading: "Shop", menu: "main" } },
        { type: "link_list", settings: { heading: "Help & info", menu: "footer" } },
        { type: "app", settings: { heading: o.appHeading, text: o.appText } },
      ],
    },
  ]);
}

const GROCERY_FEATURES: [string, string, string][] = [
  ["leaf", "100% fresh guarantee", "Not happy? Full refund at your door"],
  ["zap", "Delivery in 60 minutes", "Across Dhaka, 7 AM – 11 PM"],
  ["banknote", "Cash on delivery", "Or pay with bKash, Nagad & cards"],
  ["badge-percent", "Market-fair prices", "Checked daily against Kawran Bazar"],
];

export const GROCERY_HEADER = headerGroup({
  promise: "Delivery in 60 minutes",
  placeholder: "Search for mangoes, rice, eggs…",
  categories: [
    { collection: "fresh-fruits", icon: "apple" },
    { collection: "vegetables", icon: "carrot" },
    { collection: "meat-fish", icon: "beef" },
    { collection: "dairy-eggs-bakery", icon: "milk" },
    { collection: "rice-oil-staples", icon: "wheat" },
    { collection: "snacks-beverages", icon: "cookie" },
    { label: "Today's deals", icon: "badge-percent", link: "/collections/all?sort=best-selling", highlight: true },
  ],
});

export const GROCERY_FOOTER = footerGroup({
  about: "Your neighbourhood supermarket, online. Fresh produce every morning, halal meat cut to order and everyday essentials — delivered in 60 minutes.",
  features: GROCERY_FEATURES,
  appHeading: "Shop faster on the app",
  appText: "Reorder your weekly basket in two taps and track your rider live.",
});

export const HEALTH_HEADER = headerGroup({
  promise: "Medicines delivered in 2 hours",
  placeholder: "Search medicines, vitamins, baby care…",
});

export const HEALTH_FOOTER = footerGroup({
  about: "Licensed online pharmacy and wellness store. 100% genuine medicines sourced directly from manufacturers, checked by registered pharmacists.",
  features: [
    ["shield-check", "100% genuine", "Sourced from licensed distributors"],
    ["zap", "Delivery in 2 hours", "Inside Dhaka, every day"],
    ["file-text", "Upload prescription", "Our pharmacists do the rest"],
    ["banknote", "Cash on delivery", "bKash, Nagad & cards too"],
  ],
  appHeading: "Refill reminders on the app",
  appText: "Save prescriptions, set refill reminders and reorder monthly medicines in one tap.",
});

export const GENERAL_HEADER = headerGroup({ promise: "Same-day delivery in Dhaka", placeholder: "Search the whole store…" });

export const GENERAL_FOOTER = footerGroup({
  about: "Everything for everyday life — groceries, home care, personal care and more at fair prices, with cash on delivery nationwide.",
  features: [
    ["truck", "Same-day delivery", "Inside Dhaka"],
    ["banknote", "Cash on delivery", "All 64 districts"],
    ["rotate-ccw", "Easy returns", "7-day return policy"],
    ["headset", "Real support", "Call us 8 AM – 11 PM"],
  ],
  appHeading: "Get the app",
  appText: "App-only deals every Friday and one-tap reordering.",
});

/* ─────────────────────────── home pages ─────────────────────────── */

const testimonials = (heading: string, quotes: [string, string, string, string][]): SectionSpec => ({
  type: "testimonials",
  settings: { eyebrow: "Happy kitchens", heading, heading_align: "center", layout: "grid", columns: 3, color_scheme: "muted" },
  blocks: quotes.map(([quote, author, location, avatar]) => ({ type: "testimonial", settings: { quote, author, location, avatar, rating: 5 } })),
});

export function groceryIndex(): SectionList {
  return sectionList([
    {
      type: "fresh-hero",
      settings: {
        image: IMG.heroProduce,
        eyebrow: "Farm to door in 60 minutes",
        heading: "Fresh groceries, delivered before the kettle boils",
        text: "Seasonal fruit, deshi vegetables, halal meat and daily essentials — picked this morning, at honest market prices.",
        button_label: "Start shopping",
        button_link: "/collections/all",
        button2_label: "Today's deals",
        button2_link: "#section-deals-of-the-day",
        code: "FRESH50",
        code_label: "৳50 off your first order over ৳500",
        tags: "Cash on delivery, Free delivery over ৳999, 100% fresh or refund",
      },
      blocks: [
        { type: "tile", settings: { image: IMG.mangoes, eyebrow: "Season special", heading: "Rajshahi Himsagar mangoes", link_label: "Shop fruit", link: "/collections/fresh-fruits", tint: "yellow" } },
        { type: "tile", settings: { image: IMG.vegMarket, eyebrow: "Picked at dawn", heading: "Deshi vegetables", link_label: "Shop veg", link: "/collections/vegetables", tint: "green" } },
      ],
    },
    { type: "category-icon-grid", settings: { heading: "Shop by category", style: "photo", columns: 6, limit: 12, show_count: true, view_all_label: "All categories" } },
    {
      type: "deals-of-the-day",
      settings: { eyebrow: "Deals of the day", heading: "Today's lowest prices", timer: "daily", source: "on-sale", limit: 10, view_all_label: "See all deals", view_all_link: "/collections/all", panel_image: IMG.fruitBasket, panel_heading: "Up to 40% off", panel_text: "Fresh picks at market prices — only until midnight.", color_scheme: "muted" },
    },
    {
      type: "offer-banners",
      blocks: [
        { type: "offer", settings: { collection: "fresh-fruits", image: IMG.fruitsMix, eyebrow: "Weekend offer", heading: "Up to 30% off seasonal fruit", tint: "orange" } },
        { type: "offer", settings: { collection: "meat-fish", image: IMG.meatBoard, eyebrow: "Cut to order", heading: "Halal meat & river fish", tint: "red" } },
        { type: "offer", settings: { collection: "rice-oil-staples", image: IMG.rice, eyebrow: "Stock up & save", heading: "Rice, oil & staples", tint: "yellow" } },
      ],
    },
    {
      type: "category-rails",
      settings: { heading: "", limit: 10, per_view: 5 },
      blocks: [
        { type: "rail", settings: { collection: "fresh-fruits", subheading: "Hand-picked every morning" } },
        { type: "rail", settings: { collection: "vegetables", subheading: "Straight from Kawran Bazar" } },
        { type: "rail", settings: { collection: "meat-fish", subheading: "Halal, cleaned and cut to order" } },
      ],
    },
    {
      type: "delivery-promise",
      settings: {
        badge: "Express delivery",
        big: "60",
        big_unit: "min",
        heading: "Delivery in 60 minutes, anywhere in Dhaka city",
        text: "Order by 10 PM and our riders bring it to your door, chilled and packed with care. Free delivery on baskets over ৳999.",
        slots: "Express · 60 min, Morning · 8–11 AM, Evening · 5–9 PM",
        image: IMG.veggieBowl,
        button_label: "Fill your basket",
        button_link: "/collections/all",
        button_style: "light",
        color_scheme: "primary",
      },
      blocks: [
        { type: "step", settings: { icon: "shopping-basket", title: "Fill your basket", text: "Fresh picks at market prices" } },
        { type: "step", settings: { icon: "package-check", title: "We pack it fresh", text: "Cold chain for meat, fish & dairy" } },
        { type: "step", settings: { icon: "bike", title: "Rider on the way", text: "Pay cash, bKash or card at the door" } },
      ],
    },
    { type: "featured-collection", settings: { eyebrow: "Most reordered", heading: "Customer favourites", source: "best-selling", limit: 10, columns: 5, layout: "grid", show_view_all: true } },
    {
      type: "category-rails",
      settings: { heading: "Pantry & breakfast", limit: 10, per_view: 5 },
      blocks: [
        { type: "rail", settings: { collection: "dairy-eggs-bakery", subheading: "Milk, eggs and bread for tomorrow's breakfast" } },
        { type: "rail", settings: { collection: "rice-oil-staples", subheading: "Monthly bazar, bulk prices" } },
        { type: "rail", settings: { collection: "snacks-beverages", subheading: "Tea-time treats and cold drinks" } },
      ],
    },
    {
      type: "app-banner",
      settings: {
        eyebrow: "Get the FreshMart app",
        heading: "Groceries in 3 taps. ৳100 off your first app order.",
        text: "Save your weekly basket, reorder in seconds and follow your rider live on the map.",
        code: "APP100",
        image: IMG.phoneHand,
        color_scheme: "accent",
      },
    },
    testimonials("Dhaka shops with us every morning", [
      ["Vegetables arrive fresher than my local bazar and the rider came in 40 minutes. I've stopped going to Kawran Bazar on Fridays.", "Nusrat Jahan", "Dhanmondi", IMG.avatar1],
      ["The Rajshahi mangoes were perfectly ripe. Weight was exact and the fish was cleaned just like I asked.", "Tanvir Ahmed", "Mirpur", IMG.avatar2],
      ["Monthly rice, oil and dal in one order with cash on delivery. Prices are honest and they never substitute without calling.", "Farhana Rahman", "Uttara", IMG.avatar3],
    ]),
    { type: "blog-posts", settings: { eyebrow: "From our kitchen", heading: "Recipes & smart shopping tips", limit: 3, columns: 3 } },
  ]);
}

export function healthIndex(): SectionList {
  return sectionList([
    {
      type: "fresh-hero",
      settings: {
        image: IMG.pharmacyStore,
        eyebrow: "Licensed online pharmacy",
        heading: "Genuine medicines & wellness, at your door in 2 hours",
        text: "Upload your prescription or shop OTC medicines, vitamins and personal care — checked by registered pharmacists.",
        button_label: "Shop now",
        button_link: "/collections/all",
        button2_label: "Upload prescription",
        button2_link: "/pages/contact",
        code: "CARE10",
        code_label: "10% off your first order",
        tags: "100% genuine, Cash on delivery, Pharmacist support",
      },
      blocks: [
        { type: "tile", settings: { image: IMG.capsulesOrange, eyebrow: "Up to 15% off", heading: "Vitamins & supplements", link_label: "Shop now", link: "/collections/all", tint: "orange" } },
        { type: "tile", settings: { image: IMG.sanitizers, eyebrow: "Everyday care", heading: "Hygiene essentials", link_label: "Shop now", link: "/collections/all", tint: "teal" } },
      ],
    },
    { type: "category-icon-grid", settings: { heading: "Shop by health need", style: "icon", columns: 6 } },
    { type: "deals-of-the-day", settings: { eyebrow: "Today only", heading: "Health deals of the day", source: "on-sale", limit: 10, show_panel: true, panel_image: IMG.pillsColor, panel_heading: "Save up to 20%", panel_text: "On vitamins, supplements and wellness." } },
    {
      type: "delivery-promise",
      settings: {
        badge: "Pharmacy express",
        big: "2",
        big_unit: "hrs",
        heading: "Medicines delivered in 2 hours across Dhaka",
        text: "Order before 10 PM. Temperature-sensitive medicines travel in insulated bags.",
        slots: "Express · 2 hrs, Scheduled · pick a time, Monthly refill",
        image: IMG.pharmacist,
        color_scheme: "primary",
        button_label: "Order medicines",
        button_style: "light",
      },
      blocks: [
        { type: "step", settings: { icon: "file-text", title: "Upload prescription", text: "Photo or PDF is fine" } },
        { type: "step", settings: { icon: "stethoscope", title: "Pharmacist checks", text: "We call if anything's unclear" } },
        { type: "step", settings: { icon: "bike", title: "Delivered sealed", text: "Pay cash or bKash at the door" } },
      ],
    },
    { type: "featured-collection", settings: { heading: "Most ordered", source: "best-selling", limit: 10, columns: 5 } },
    { type: "category-rails", settings: { heading: "Explore", limit: 10 }, blocks: [{ type: "rail", settings: { heading: "New arrivals", link_label: "See all" } }] },
    {
      type: "offer-banners",
      blocks: [
        { type: "offer", settings: { image: IMG.proteinPowder, eyebrow: "Fitness", heading: "Protein & sports nutrition", tint: "blue" } },
        { type: "offer", settings: { image: IMG.faceMasks, eyebrow: "Protect", heading: "Masks & first aid", tint: "teal" } },
      ],
    },
    { type: "app-banner", settings: { eyebrow: "Never run out", heading: "Monthly refills, remembered for you", text: "Save your prescriptions, get refill reminders and reorder in one tap.", points: "Refill reminders\nPrescription vault\nPharmacist chat", code: "APPCARE", image: IMG.doctorPhone, color_scheme: "primary" } },
    {
      type: "faq",
      settings: { heading: "Pharmacy questions", heading_align: "center" },
      blocks: [
        { type: "question", settings: { question: "Are your medicines genuine?", answer: "<p>Yes. We buy only from licensed distributors and manufacturers, and every order is checked by a registered pharmacist.</p>" } },
        { type: "question", settings: { question: "Do I need a prescription?", answer: "<p>Prescription medicines need a valid prescription. Upload a clear photo at checkout or send it to our hotline on WhatsApp.</p>" } },
        { type: "question", settings: { question: "How fast is delivery?", answer: "<p>Within 2 hours inside Dhaka city, 1–3 days nationwide. Cash on delivery is available everywhere.</p>" } },
      ],
    },
    testimonials("Trusted by families across Dhaka", [
      ["Insulin arrived cold and sealed within 90 minutes. The pharmacist called to confirm the dose — very reassuring.", "Rafiq Hasan", "Gulshan", IMG.avatar2],
      ["Monthly medicines for my parents in one order, with reminders. It's taken a real worry off my plate.", "Sadia Karim", "Mohammadpur", IMG.avatar1],
      ["Genuine products and fair prices. Paying with bKash at the door is so easy.", "Meher Tasnim", "Bashundhara", IMG.avatar3],
    ]),
  ]);
}

export function generalIndex(): SectionList {
  return sectionList([
    {
      type: "fresh-hero",
      settings: {
        image: IMG.supermarket,
        eyebrow: "Your everyday superstore",
        heading: "Everything for home, delivered today",
        text: "Groceries, home care, personal care and more — thousands of products at fair prices with cash on delivery.",
        button_label: "Shop all",
        button_link: "/collections/all",
        button2_label: "Weekly offers",
        button2_link: "#section-deals-of-the-day",
        code: "WELCOME",
        code_label: "৳100 off orders over ৳1,500",
        tags: "Cash on delivery, Same-day in Dhaka, 7-day returns",
      },
      blocks: [
        { type: "tile", settings: { image: IMG.shopping, eyebrow: "New this week", heading: "Fresh arrivals", link_label: "Discover", link: "/collections/all?sort=newest", tint: "blue" } },
        { type: "tile", settings: { image: IMG.rice, eyebrow: "Bulk & save", heading: "Monthly bazar", link_label: "Shop now", link: "/collections/all", tint: "yellow" } },
      ],
    },
    { type: "category-icon-grid", settings: { heading: "Browse departments", style: "photo", columns: 6 } },
    { type: "deals-of-the-day", settings: { heading: "This week's best prices", source: "on-sale", limit: 10, panel_image: IMG.heroGeneral } },
    { type: "featured-collection", settings: { heading: "New arrivals", source: "newest", limit: 10, columns: 5 } },
    {
      type: "offer-banners",
      blocks: [
        { type: "offer", settings: { image: IMG.fruitsMix, eyebrow: "Fresh", heading: "Fruit & veg daily", tint: "green" } },
        { type: "offer", settings: { image: IMG.oil, eyebrow: "Pantry", heading: "Staples at bulk prices", tint: "yellow" } },
        { type: "offer", settings: { image: IMG.milkTea, eyebrow: "Break time", heading: "Snacks & drinks", tint: "pink" } },
      ],
    },
    { type: "category-rails", settings: { limit: 10 }, blocks: [{ type: "rail", settings: { heading: "Best sellers", link_label: "See all" } }] },
    { type: "delivery-promise", settings: { badge: "Same-day", big: "24", big_unit: "hrs", heading: "Order before 2 PM, get it today in Dhaka", slots: "Same-day · Dhaka, 1–3 days · nationwide", image: IMG.supermarket } },
    { type: "app-banner", settings: { color_scheme: "inverse" } },
    testimonials("What our shoppers say", [
      ["Everything for the month in one order and the rider helped carry it upstairs. Great service.", "Nusrat J.", "Dhaka", IMG.avatar1],
      ["Prices are the same as the shop down the road, but I don't have to leave home.", "Tanvir A.", "Chattogram", IMG.avatar2],
      ["Cash on delivery and quick returns — exactly what I want from an online store.", "Farhana R.", "Sylhet", IMG.avatar3],
    ]),
    { type: "newsletter", settings: { heading: "Get weekly offers first", subheading: "One email every Thursday with the best deals.", button_label: "Subscribe", color_scheme: "muted" } },
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "thumbnails-left", image_ratio: "square", media_width: "medium", zoom: true, sticky_info: true, sticky_atc: true, show_breadcrumbs: true },
      blocks: [
        { type: "title" },
        { type: "rating" },
        { type: "price" },
        { type: "variant_picker", settings: { style: "buttons" } },
        { type: "stock" },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true } },
        { type: "fm_delivery" },
        { type: "description", settings: { collapsed: false } },
        { type: "collapsible_tab", settings: { heading: "Storage & freshness", icon: "leaf", content: "<p>Keep fruit and vegetables in a cool, dry place or the crisper drawer. Refrigerate meat, fish and dairy at 0–4°C and use within 2 days, or freeze on arrival.</p>" } },
        { type: "collapsible_tab", settings: { heading: "Delivery & refunds", icon: "truck", content: "<p>60-minute express delivery inside Dhaka city, 1–3 days nationwide. Not happy with the freshness? Return it to the rider for an instant refund.</p>" } },
        { type: "share" },
      ],
    },
    { type: "related-products", settings: { heading: "Frequently bought together", limit: 5, columns: 5, layout: "carousel" } },
    { type: "product-reviews" },
    { type: "category-rails", settings: { heading: "", limit: 10 }, blocks: [{ type: "rail", settings: { heading: "Customer favourites", subheading: "What Dhaka is ordering today", link_label: "See all" } }] },
  ]);
}

export function templates(index: SectionList): ThemeConfig["templates"] {
  return {
    index,
    product: productTemplate(),
    collection: sectionList([
      { type: "main-collection", settings: { show_banner: true, show_description: true, filters: "sidebar", show_sort: true, per_page: 24, columns: 5, mobile_columns: 2, padding: "small" } },
      { type: "delivery-promise", settings: { padding: "small" } },
    ]),
    collections: sectionList([
      { type: "category-icon-grid", settings: { heading: "All categories", page_title: true, style: "photo", columns: 6, limit: 24, view_all_label: "", padding: "medium" } },
      { type: "deals-of-the-day", settings: { heading: "Today's lowest prices", limit: 10 } },
    ]),
    search: sectionList([
      { type: "main-search", settings: { columns: 5, mobile_columns: 2, per_page: 24 } },
      { type: "category-icon-grid", settings: { heading: "Browse categories", style: "icon", columns: 8, view_all_label: "", color_scheme: "muted" } },
    ]),
    cart: sectionList([
      { type: "main-cart", settings: { heading: "Your basket" } },
      { type: "category-rails", settings: { limit: 10 }, blocks: [{ type: "rail", settings: { heading: "Forgot something?", subheading: "Popular add-ons for your basket", link_label: "See all" } }] },
    ]),
    page: sectionList([{ type: "main-page" }, { type: "delivery-promise", settings: { padding: "small" } }]),
    blog: sectionList([{ type: "main-blog" }, { type: "app-banner", settings: { padding: "small" } }]),
    article: sectionList([{ type: "main-article" }, { type: "featured-collection", settings: { heading: "Shop the ingredients", source: "best-selling", limit: 5, columns: 5 } }]),
    account: sectionList([{ type: "main-account" }, { type: "app-banner", settings: { padding: "small" } }]),
    "404": sectionList([{ type: "main-404", settings: { heading: "This aisle is empty", text: "We couldn't find that page. Search for what you need or head back to the shop." } }, { type: "category-icon-grid", settings: { heading: "Popular categories", style: "icon", columns: 6, view_all_label: "" } }]),
  };
}
