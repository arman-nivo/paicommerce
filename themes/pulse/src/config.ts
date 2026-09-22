/**
 * Pulse defaults: palettes per preset, header/footer groups and every template.
 * Section ids are deterministic (see `sectionList`) so the customizer and storefront agree.
 */
import type { SectionList, SettingValues, ThemeConfig } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG } from "./images";

/* ─────────────────────────── palettes ─────────────────────────── */

const shared: SettingValues = {
  font_heading: "Plus Jakarta Sans",
  font_body: "Inter",
  heading_scale: 95,
  heading_case: "normal",
  container_width: 1320,
  section_spacing: 56,
  radius: 14,
  button_radius: 10,
  logo_width: 140,
  header_style: "logo_left",
  card_image_ratio: "square",
  card_style: "card",
  card_text_align: "left",
  card_show_vendor: true,
  card_show_rating: true,
  card_quick_add: true,
  card_hover_swap: false,
  card_show_sale_badge: true,
  card_show_wishlist: false,
  cart_type: "drawer",
  cart_show_free_shipping: true,
  cart_show_note: true,
};

/** Default: "Clinic" — clean white, deep teal and a fresh green accent. */
export const HEALTH_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#ffffff",
  color_foreground: "#0d2b36",
  color_primary: "#0a7c78",
  color_primary_foreground: "#ffffff",
  color_accent: "#16a34a",
  color_muted: "#eff6f6",
  color_border: "#d9e8e8",
  color_sale: "#dc3545",
  color_card: "#ffffff",
  announcement_text: "Free delivery on medicine orders over ৳1,000 · Cash on delivery nationwide",
};

/** Beauty & personal care: "Derma" — soft blush, plum and rose. */
export const BEAUTY_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fffbfa",
  color_foreground: "#2d1a26",
  color_primary: "#8a3a63",
  color_primary_foreground: "#ffffff",
  color_accent: "#d9577c",
  color_muted: "#fbf0f2",
  color_border: "#f0dde2",
  color_sale: "#c2185b",
  color_card: "#ffffff",
  font_heading: "Fraunces",
  font_body: "DM Sans",
  heading_scale: 100,
  radius: 18,
  button_radius: 999,
  announcement_text: "Dermatologist-recommended brands · 100% authentic · Free delivery over ৳1,500",
};

/** Grocery: "Organic" — leafy green and warm honey. */
export const GROCERY_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fcfdf9",
  color_foreground: "#1d2a1c",
  color_primary: "#2f7d32",
  color_primary_foreground: "#ffffff",
  color_accent: "#e0a100",
  color_muted: "#f1f6ea",
  color_border: "#dfe8d4",
  color_sale: "#d9480f",
  color_card: "#ffffff",
  font_heading: "Outfit",
  font_body: "Inter",
  radius: 16,
  button_radius: 999,
  announcement_text: "Fresh, organic and wellness groceries · Same-day delivery in Dhaka",
};

/* ─────────────────────────── groups ─────────────────────────── */

export function headerGroup(messages: string[], extra: SettingValues = {}): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      settings: { style: "static", show_phone: false, color_scheme: "muted" },
      blocks: messages.map((text) => ({ type: "announcement", settings: { text } })),
    },
    { type: "header", settings: { sticky: true, show_topbar: true, show_rx: true, show_categories: true, show_trust: true, ...extra } },
  ]);
}

export function footerGroup(settings: SettingValues = {}): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { color_scheme: "inverse", show_help: true, ...settings },
      blocks: [
        { type: "link_list", settings: { heading: "Shop", menu: "main" } },
        { type: "link_list", settings: { heading: "Customer care", menu: "footer" } },
        { type: "contact", settings: { heading: "Contact" } },
        { type: "newsletter", settings: { heading: "Health tips & refill reminders", text: "Seasonal health advice and exclusive offers, twice a month." } },
      ],
    },
  ]);
}

/* ─────────────────────────── shared specs ─────────────────────────── */

const rail = (heading: string, source: string, collection = "", extra: SettingValues = {}): SectionSpec => ({
  type: "pulse-products",
  settings: { heading, source, collection, limit: 10, layout: "carousel", columns: 5, link_label: "View all", ...extra },
});

const testimonials = (quotes: [string, string, string, string][], heading: string): SectionSpec => ({
  type: "testimonials",
  settings: { eyebrow: "Reviews", heading, heading_align: "center", layout: "grid", columns: 3, color_scheme: "default" },
  blocks: quotes.map(([quote, author, location, avatar]) => ({ type: "testimonial", settings: { quote, author, location, avatar, rating: 5 } })),
});

const faq = (items: [string, string][], heading = "Questions, answered"): SectionSpec => ({
  type: "faq",
  settings: { eyebrow: "Help", heading, heading_align: "left", layout: "split", open_first: true, color_scheme: "default" },
  blocks: items.map(([question, answer]) => ({ type: "question", settings: { question, answer } })),
});

const PHARMACY_FAQ: [string, string][] = [
  ["How do I order prescription medicines?", "<p>Add the medicines to your cart and upload a photo of your prescription (or send it on WhatsApp). A registered pharmacist verifies it before we dispatch.</p>"],
  ["Are your medicines genuine?", "<p>Yes. We buy only from licensed manufacturers and authorised distributors, check batch numbers and expiry dates, and store medicines to the recommended temperature.</p>"],
  ["How fast is delivery?", "<p>Inside Dhaka within 24 hours, outside Dhaka in 2–4 days. Cash on delivery is available nationwide.</p>"],
  ["Can I return medicines?", "<p>Unopened, non-refrigerated items can be returned within 7 days if they were damaged, wrong or near expiry. For safety, opened medicines can't be returned.</p>"],
];

const pharmacyTrust: SectionSpec = {
  type: "pulse-trust",
  settings: { eyebrow: "Why customers trust us", heading: "Pharmacy standards, online", layout: "cards" },
  blocks: [
    { type: "badge", settings: { icon: "shield-check", title: "100% genuine medicines", text: "Sourced only from licensed manufacturers and distributors." } },
    { type: "badge", settings: { icon: "badge-check", title: "Licensed pharmacy", text: "Every order reviewed and dispensed by a registered pharmacist." } },
    { type: "badge", settings: { icon: "snowflake", title: "Cold-chain storage", text: "Insulin and temperature-sensitive items kept at 2–8 °C." } },
    { type: "badge", settings: { icon: "lock", title: "Private & secure", text: "Discreet packaging. Your prescriptions are never shared." } },
  ],
};

const rxUpload = (image = IMG.doctorPhone): SectionSpec => ({
  id: "prescription",
  type: "rx-upload",
  settings: {
    eyebrow: "Prescription orders",
    heading: "Have a prescription? We'll do the rest.",
    text: "Send a clear photo of your prescription. Our pharmacist checks it, confirms availability and price by phone, and we deliver — cash on delivery.",
    whatsapp_label: "Send on WhatsApp",
    button_label: "Upload via contact form",
    button_link: "/pages/contact",
    image,
    image_alt: "Doctor holding a smartphone",
    style: "primary",
  },
  blocks: [
    { type: "step", settings: { icon: "file-up", title: "Upload", text: "Snap a photo of your prescription" } },
    { type: "step", settings: { icon: "badge-check", title: "Pharmacist verifies", text: "We confirm medicines & price" } },
    { type: "step", settings: { icon: "truck", title: "Delivered", text: "To your door, pay on delivery" } },
  ],
});

/* ─────────────────────────── index templates ─────────────────────────── */

export function healthIndex(): SectionList {
  return sectionList([
    {
      type: "pulse-hero",
      settings: {
        eyebrow: "Licensed online pharmacy",
        heading: "Genuine medicines, delivered to your door",
        text: "Order prescription and over-the-counter medicines, vitamins and health essentials. Every order is checked by a registered pharmacist.",
        search_placeholder: "Search for Napa, Seclo, vitamin D…",
        popular: "Paracetamol, Omeprazole, Vitamin D3, ORS, Face masks",
        button_label: "Shop medicines",
        button_link: "/collections/medicines",
        button2_label: "Upload prescription",
        button2_link: "#prescription",
        image: IMG.pharmacyStore,
        image_alt: "Bright, well-stocked pharmacy aisle",
      },
    },
    {
      type: "health-categories",
      settings: { heading: "Shop by health need", link_label: "All categories", link: "/collections", style: "tiles", columns: 8 },
      blocks: [
        { type: "category", settings: { icon: "pill", title: "Medicines", tint: "teal", collection: "medicines" } },
        { type: "category", settings: { icon: "shield-plus", title: "Vitamins", tint: "amber", collection: "vitamins-supplements" } },
        { type: "category", settings: { icon: "hand", title: "Personal care", tint: "rose", collection: "personal-care" } },
        { type: "category", settings: { icon: "thermometer", title: "Devices", tint: "sky", collection: "medical-devices" } },
        { type: "category", settings: { icon: "stethoscope", title: "Doctor consult", tint: "indigo", collection: "consultation" } },
        { type: "category", settings: { icon: "heart-pulse", title: "Heart care", tint: "violet", link: "/search?q=cardiac" } },
        { type: "category", settings: { icon: "activity", title: "Pain relief", tint: "orange", link: "/search?q=pain" } },
        { type: "category", settings: { icon: "droplet", title: "Rehydration", tint: "green", link: "/search?q=ORS" } },
      ],
    },
    rail("Bestsellers this week", "best-selling", "", { eyebrow: "Most ordered", subheading: "Trusted everyday medicines and health essentials." }),
    rxUpload(),
    {
      type: "quick-reorder",
      settings: {
        eyebrow: "Quick reorder",
        heading: "Your everyday essentials",
        text: "Our most re-ordered medicines — add them to your cart in one tap. Signed-in customers can see their full order history.",
        source: "collection",
        collection: "medicines",
        limit: 6,
        link_label: "View order history",
        link: "/account",
      },
    },
    rail("Vitamins & supplements", "collection", "vitamins-supplements", { eyebrow: "Immunity & energy", background: "muted" }),
    {
      type: "consult-banner",
      settings: {
        product: "online-doctor-consultation-15-min",
        image: IMG.doctor,
        image_alt: "Smiling doctor with a stethoscope",
        status: "Pharmacists online · 9am – 11pm",
        heading: "Talk to a pharmacist, free",
        text: "Questions about dosage, side effects or alternatives? Our registered pharmacists answer by phone or WhatsApp — no appointment needed. Need a doctor? Book a 15-minute video consultation.",
        whatsapp_label: "Chat on WhatsApp",
        book_label: "Book a doctor",
      },
    },
    rail("Hygiene & personal care", "collection", "personal-care", { layout: "grid", columns: 4, limit: 4 }),
    pharmacyTrust,
    testimonials(
      [
        ["Uploaded my father's prescription on WhatsApp at night and the medicines arrived before noon. The pharmacist even called to confirm the dosage.", "Farhana R.", "Dhanmondi, Dhaka", IMG.avatar1],
        ["Finally a pharmacy that shows the manufacturer and batch details clearly. Genuine Square and Beximco products every time.", "Tanvir A.", "Chattogram", IMG.avatar2],
        ["Monthly vitamins, reordered in two taps. Cash on delivery and polite riders.", "Sadia K.", "Sylhet", IMG.avatar3],
      ],
      "Caring for families across Bangladesh",
    ),
    faq(PHARMACY_FAQ),
    { type: "blog-posts", settings: { eyebrow: "Health tips", heading: "From our pharmacists", limit: 3, columns: 3 } },
  ]);
}

export function beautyIndex(): SectionList {
  return sectionList([
    {
      type: "pulse-hero",
      settings: {
        eyebrow: "Dermatologist-recommended",
        heading: "Skin, hair & personal care that works",
        text: "Clinically proven skincare, sun care and hygiene essentials — 100% authentic and delivered across Bangladesh.",
        search_placeholder: "Search sunscreen, serum, moisturiser…",
        popular: "Sunscreen, Vitamin C serum, Moisturiser, Acne care",
        button_label: "Shop skincare",
        button_link: "/collections/personal-care",
        button2_label: "Ask an expert",
        button2_link: "/pages/contact",
        image: IMG.skincareSet,
        image_alt: "Skincare products arranged on a towel",
        card_icon_1: "sparkles",
        card_title_1: "100% authentic",
        card_text_1: "Direct from brands",
        card_icon_2: "truck",
        card_title_2: "Free delivery",
        card_text_2: "On orders over ৳1,500",
      },
    },
    {
      type: "health-categories",
      settings: { heading: "Shop by concern", style: "circles", columns: 6, link_label: "", link: "" },
      blocks: [
        { type: "category", settings: { icon: "sparkles", title: "Acne & oil control", tint: "rose", link: "/search?q=acne" } },
        { type: "category", settings: { icon: "droplet", title: "Dry skin", tint: "sky", link: "/search?q=moisturising" } },
        { type: "category", settings: { icon: "shield-plus", title: "Sun care", tint: "amber", link: "/search?q=sunscreen" } },
        { type: "category", settings: { icon: "hand", title: "Hygiene", tint: "teal", collection: "personal-care" } },
        { type: "category", settings: { icon: "leaf", title: "Natural care", tint: "green", link: "/search?q=natural" } },
        { type: "category", settings: { icon: "baby", title: "Baby care", tint: "violet", link: "/search?q=baby" } },
      ],
    },
    rail("Bestsellers", "best-selling", "", { eyebrow: "Loved by our customers" }),
    {
      type: "consult-banner",
      settings: {
        image: IMG.facial,
        image_alt: "Woman receiving a facial treatment",
        status: "Skin experts online",
        heading: "Not sure what suits your skin?",
        text: "Chat with our skincare advisors for a free routine recommendation — tell us your skin type and concerns.",
        show_call: false,
        whatsapp_label: "Get my routine",
        book_label: "",
        image_position: "right",
      },
    },
    rail("New arrivals", "newest", "", { layout: "grid", columns: 4, limit: 8, background: "muted" }),
    {
      type: "pulse-trust",
      settings: { eyebrow: "", heading: "Beauty you can trust", layout: "cards" },
      blocks: [
        { type: "badge", settings: { icon: "shield-check", title: "100% authentic", text: "Sourced directly from brands and authorised importers." } },
        { type: "badge", settings: { icon: "badge-check", title: "Expert-curated", text: "Every product reviewed by our skincare team." } },
        { type: "badge", settings: { icon: "rotate-ccw", title: "Easy returns", text: "Unopened products within 7 days." } },
        { type: "badge", settings: { icon: "banknote", title: "Cash on delivery", text: "Pay when your order arrives." } },
      ],
    },
    testimonials(
      [
        ["My dermatologist's recommended sunscreen, genuine and cheaper than the pharmacy near me.", "Nusrat J.", "Dhaka", IMG.avatar1],
        ["The routine advice on WhatsApp was spot on for my oily skin.", "Meher T.", "Rajshahi", IMG.avatar3],
        ["Fast delivery and everything was sealed and in date.", "Rafid H.", "Khulna", IMG.avatar2],
      ],
      "Real results, real reviews",
    ),
    { type: "newsletter", settings: { heading: "Get 10% off your first order", subheading: "Skincare tips, new launches and member-only offers.", button_label: "Subscribe", color_scheme: "primary" } },
  ]);
}

export function groceryIndex(): SectionList {
  return sectionList([
    {
      type: "pulse-hero",
      settings: {
        eyebrow: "Organic & wellness grocery",
        heading: "Eat well. Live well.",
        text: "Organic produce, honey, nuts, superfoods and supplements — sourced from trusted farms and delivered fresh.",
        search_placeholder: "Search honey, oats, almonds, protein…",
        popular: "Honey, Almonds, Oats, Green tea, Protein",
        button_label: "Shop wellness",
        button_link: "/collections/all",
        button2_label: "Order on WhatsApp",
        button2_link: "",
        image: IMG.fruitsMix,
        image_alt: "Colourful fresh fruit",
        card_icon_1: "leaf",
        card_title_1: "Certified organic",
        card_text_1: "Farm-traceable produce",
        card_icon_2: "truck",
        card_title_2: "Same-day delivery",
        card_text_2: "Inside Dhaka",
      },
    },
    {
      type: "health-categories",
      settings: { heading: "Shop by aisle", style: "tiles", columns: 6, link_label: "All products", link: "/collections/all" },
      blocks: [
        { type: "category", settings: { icon: "apple", title: "Fresh produce", tint: "green", link: "/search?q=fresh" } },
        { type: "category", settings: { icon: "leaf", title: "Organic staples", tint: "teal", link: "/search?q=organic" } },
        { type: "category", settings: { icon: "droplet", title: "Honey & oils", tint: "amber", link: "/search?q=honey" } },
        { type: "category", settings: { icon: "dumbbell", title: "Protein & fitness", tint: "indigo", link: "/search?q=protein" } },
        { type: "category", settings: { icon: "shield-plus", title: "Vitamins", tint: "orange", collection: "vitamins-supplements" } },
        { type: "category", settings: { icon: "baby", title: "Baby food", tint: "rose", link: "/search?q=baby" } },
      ],
    },
    rail("Bestsellers", "best-selling", "", { eyebrow: "Customer favourites" }),
    {
      type: "quick-reorder",
      settings: { eyebrow: "Weekly basket", heading: "Your weekly essentials", text: "Restock the things you buy every week in one tap.", source: "newest", limit: 6, link_label: "My orders", link: "/account" },
    },
    rail("Supplements & superfoods", "collection", "vitamins-supplements", { background: "muted" }),
    {
      type: "pulse-trust",
      settings: { eyebrow: "", heading: "Good food, honestly sourced", layout: "cards" },
      blocks: [
        { type: "badge", settings: { icon: "leaf", title: "Certified organic", text: "Traceable to trusted farms and producers." } },
        { type: "badge", settings: { icon: "snowflake", title: "Cold-chain fresh", text: "Chilled from our store to your door." } },
        { type: "badge", settings: { icon: "shield-check", title: "Quality checked", text: "Every batch inspected before dispatch." } },
        { type: "badge", settings: { icon: "banknote", title: "Cash on delivery", text: "Pay when your groceries arrive." } },
      ],
    },
    testimonials(
      [
        ["The Sundarbans honey is the real thing. Delivered the same afternoon.", "Imran K.", "Dhaka", IMG.avatar2],
        ["Organic vegetables that actually taste like vegetables. My weekly order now.", "Farhana R.", "Gazipur", IMG.avatar1],
        ["Great prices on almonds and oats, always fresh.", "Sadia K.", "Narayanganj", IMG.avatar3],
      ],
      "Loved by healthy homes",
    ),
    { type: "newsletter", settings: { heading: "Weekly recipes & offers", subheading: "Healthy recipes and member-only prices, every Friday.", button_label: "Subscribe", color_scheme: "primary" } },
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "thumbnails-bottom", image_ratio: "square", media_width: "medium", zoom: true, sticky_info: true, sticky_atc: true, show_breadcrumbs: true },
      blocks: [
        { type: "title" },
        { type: "rating" },
        { type: "price", settings: { show_tax_note: true, tax_note: "MRP inclusive of VAT. Delivery calculated at checkout." } },
        { type: "pharmacy_info" },
        { type: "variant_picker", settings: { style: "buttons" } },
        { type: "stock", settings: { threshold: 10 } },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true, buy_now_style: "secondary" } },
        { type: "trust", settings: { icon_1: "shield-check", text_1: "100% genuine", icon_2: "banknote", text_2: "Cash on delivery", icon_3: "truck", text_3: "24h delivery in Dhaka" } },
        { type: "description", settings: { collapsed: false } },
        { type: "collapsible_tab", settings: { heading: "Safety information", icon: "shield-check", content: "<p>Read the label before use. Keep out of reach of children. Store below 30 °C in a dry place, away from direct sunlight. Do not exceed the recommended dose; consult your doctor if symptoms persist.</p>" } },
        { type: "collapsible_tab", settings: { heading: "Delivery & returns", icon: "truck", content: "<p>Inside Dhaka: within 24 hours. Outside Dhaka: 2–4 days. Unopened, non-refrigerated items can be returned within 7 days if damaged, incorrect or near expiry.</p>" } },
      ],
    },
    { type: "product-reviews" },
    { type: "related-products", settings: { heading: "Frequently bought together", layout: "carousel", limit: 8, columns: 5 } },
    { ...pharmacyTrust, settings: { ...pharmacyTrust.settings, layout: "strip", padding: "small" } },
  ]);
}

export function templates(index: SectionList): ThemeConfig["templates"] {
  return {
    index,
    product: productTemplate(),
    collection: sectionList([{ type: "main-collection", settings: { show_banner: false, show_description: true, filters: "sidebar", show_sort: true, per_page: 24, columns: 4 } }]),
    collections: sectionList([{ type: "main-collections-list", settings: { heading: "All categories" } }, rxUpload()]),
    search: sectionList([{ type: "main-search", settings: { columns: 4 } }, rail("Popular right now", "best-selling", "", { padding: "small" })]),
    cart: sectionList([{ type: "main-cart", settings: { heading: "Your cart" } }, rail("Don't forget", "best-selling", "", { padding: "small", limit: 8 })]),
    page: sectionList([{ type: "main-page" }]),
    blog: sectionList([{ type: "main-blog", settings: { heading: "Health tips", subheading: "Practical advice from our pharmacists on medicines, nutrition and everyday wellbeing." } }]),
    article: sectionList([{ type: "main-article" }, rail("Recommended by our pharmacists", "best-selling", "", { padding: "small" })]),
    account: sectionList([{ type: "main-account" }]),
    "404": sectionList([{ type: "main-404" }, rail("Popular right now", "best-selling", "", { padding: "small" })]),
  };
}

/* ─────────────────────────── exports used by index.ts ─────────────────────────── */

export const healthHeader = () => headerGroup(["Free delivery on medicine orders over ৳1,000", "Cash on delivery nationwide", "Pharmacist on call 9am – 11pm"]);
export const healthFooter = () => footerGroup();

export const beautyHeader = () =>
  headerGroup(["Dermatologist-recommended brands", "100% authentic · Free delivery over ৳1,500"], {
    licence_text: "Authentic skincare · Expert-curated",
    search_placeholder: "Search sunscreen, serum, moisturiser…",
    show_rx: false,
    trust_icon_1: "shield-check",
    trust_1: "100% authentic brands",
    trust_icon_2: "sparkles",
    trust_2: "Expert-curated routines",
    trust_icon_3: "rotate-ccw",
    trust_3: "Easy 7-day returns",
    trust_icon_4: "truck",
    trust_4: "Free delivery over ৳1,500",
  });
export const beautyFooter = () => footerGroup({ help_heading: "Need a routine? Ask our skin experts.", about: "Authentic skincare, hair care and personal care — curated by experts and delivered across Bangladesh.", disclaimer: "" });

export const groceryHeader = () =>
  headerGroup(["Same-day delivery inside Dhaka", "Certified organic · Cash on delivery"], {
    licence_text: "Organic & wellness grocery",
    search_placeholder: "Search honey, oats, almonds, protein…",
    rx_label: "Order on WhatsApp",
    rx_link: "",
    trust_icon_1: "leaf",
    trust_1: "Certified organic",
    trust_icon_2: "snowflake",
    trust_2: "Cold-chain fresh",
    trust_icon_3: "shield-check",
    trust_3: "Quality checked",
    trust_icon_4: "truck",
    trust_4: "Same-day delivery in Dhaka",
  });
export const groceryFooter = () =>
  footerGroup({ help_heading: "Questions about an order? We're here.", about: "Organic produce, superfoods and wellness essentials from trusted farms — delivered fresh.", disclaimer: "" });
