/**
 * Aurora defaults: palettes per preset, header/footer groups and templates.
 * Section ids are deterministic (see `sectionList`) so the customizer and storefront agree.
 */
import type { SectionList, SettingValues } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG } from "./images";

/* ─────────────────────────── palettes ─────────────────────────── */

const shared: SettingValues = {
  heading_scale: 110,
  heading_case: "normal",
  container_width: 1360,
  section_spacing: 80,
  header_style: "logo_center",
  logo_width: 130,
  card_text_align: "left",
  card_style: "standard",
  card_show_vendor: false,
  card_show_rating: false,
  card_quick_add: true,
  card_hover_swap: true,
  card_show_sale_badge: true,
  card_show_wishlist: true,
  cart_type: "drawer",
  cart_show_free_shipping: true,
};

/** Default look: warm ivory, ink and camel — editorial fashion. */
export const FASHION_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#faf8f5",
  color_foreground: "#1c1917",
  color_primary: "#1c1917",
  color_primary_foreground: "#faf8f5",
  color_accent: "#9a6b4f",
  color_muted: "#f1ece5",
  color_border: "#e3dcd2",
  color_sale: "#a8322b",
  font_heading: "Cormorant Garamond",
  font_body: "DM Sans",
  radius: 2,
  button_radius: 0,
  card_image_ratio: "tall",
  announcement_text: "Complimentary delivery on orders over ৳3,000 · Cash on delivery nationwide",
};

/** Jewelry: bright porcelain, deep ink and antique gold. */
export const JEWELRY_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fcfbf8",
  color_foreground: "#1b1a17",
  color_primary: "#1b1a17",
  color_primary_foreground: "#f7f1e3",
  color_accent: "#a8843a",
  color_muted: "#f4f0e7",
  color_border: "#e6dfcf",
  color_sale: "#9f2d2d",
  font_heading: "Cormorant Garamond",
  font_body: "Manrope",
  heading_scale: 115,
  radius: 0,
  button_radius: 0,
  card_image_ratio: "square",
  card_text_align: "center",
  announcement_text: "Insured delivery on every order · Gift wrapping included",
};

/** General: crisp white, charcoal and a muted clay accent. */
export const GENERAL_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#ffffff",
  color_foreground: "#171717",
  color_primary: "#171717",
  color_primary_foreground: "#ffffff",
  color_accent: "#8a5a44",
  color_muted: "#f5f3f0",
  color_border: "#e7e4df",
  color_sale: "#b42318",
  font_heading: "Playfair Display",
  font_body: "Inter",
  heading_scale: 100,
  radius: 4,
  button_radius: 2,
  header_style: "logo_left",
  card_image_ratio: "portrait",
  card_show_rating: true,
  announcement_text: "Free delivery on orders over ৳2,000 · Cash on delivery available",
};

/* ─────────────────────────── groups ─────────────────────────── */

export function headerGroup(messages: string[], promo: { image: string; heading: string; text: string }): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      settings: { style: "static", show_phone: false, color_scheme: "inverse" },
      blocks: messages.map((text) => ({ type: "announcement", settings: { text } })),
    },
    {
      type: "header",
      settings: {
        layout: "inherit",
        sticky: true,
        mega_menu: true,
        show_promo: true,
        promo_image: promo.image,
        promo_heading: promo.heading,
        promo_text: promo.text,
        promo_label: "Discover",
        promo_link: "/collections/all",
      },
    },
  ]);
}

export function footerGroup(about: string): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { color_scheme: "inverse" },
      blocks: [
        { type: "brand", settings: { text: about } },
        { type: "link_list", settings: { heading: "Shop", menu: "main" } },
        { type: "link_list", settings: { heading: "Client care", menu: "footer" } },
        { type: "newsletter", settings: { heading: "Stay in touch", text: "New collections, styling notes and private previews — twice a month." } },
      ],
    },
  ]);
}

/* ─────────────────────────── index templates ─────────────────────────── */

const trustRow: SectionSpec = {
  type: "multicolumn",
  settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: "default" },
  blocks: [
    { type: "column", settings: { icon: "truck", title: "Nationwide delivery", text: "All 64 districts" } },
    { type: "column", settings: { icon: "banknote", title: "Cash on delivery", text: "Pay when it arrives" } },
    { type: "column", settings: { icon: "rotate-ccw", title: "Easy exchanges", text: "Within 7 days" } },
    { type: "column", settings: { icon: "headset", title: "Personal styling", text: "Chat with our team" } },
  ],
};

function hero(image: string, eyebrow: string, heading: string, text: string, primary: string, secondary: string): SectionSpec {
  return {
    type: "aurora-hero",
    settings: { layout: "full", image, height: "full", text_position: "bottom-left", overlay: 30, text_color: "light" },
    blocks: [
      { type: "eyebrow", settings: { text: eyebrow } },
      { type: "heading", settings: { text: heading, size: "large", tag: "h1" } },
      { type: "text", settings: { text } },
      { type: "buttons", settings: { label_1: primary, link_1: "/collections/all", style_1: "primary", label_2: secondary, link_2: "#section-lookbook", style_2: "link" } },
    ],
  };
}

const lookbookSpec = (image: string, heading: string, sub: string): SectionSpec => ({
  id: "lookbook",
  type: "lookbook",
  settings: { eyebrow: "Lookbook", heading, subheading: sub, image, layout: "split", image_ratio: "portrait", color_scheme: "muted", padding: "large" },
  blocks: [
    { type: "hotspot", settings: { x: 48, y: 26 } },
    { type: "hotspot", settings: { x: 60, y: 52 } },
    { type: "hotspot", settings: { x: 42, y: 80 } },
  ],
});

const testimonials = (quotes: [string, string, string, string][]): SectionSpec => ({
  type: "testimonials",
  settings: { eyebrow: "Kind words", heading: "Worn and loved", heading_align: "center", layout: "grid", columns: 3, color_scheme: "default" },
  blocks: quotes.map(([quote, author, location, avatar]) => ({ type: "testimonial", settings: { quote, author, location, avatar, rating: 5 } })),
});

export function fashionIndex(): SectionList {
  return sectionList([
    hero(IMG.heroFashion, "The new season", "Quiet luxury, made to be lived in", "Natural fibres, considered cuts and colours that work together — season after season.", "Shop the collection", "Explore the lookbook"),
    trustRow,
    {
      type: "split-banner",
      settings: { height: "large", text_position: "bottom-left", overlay: 30, full_width: true },
      blocks: [
        { type: "panel", settings: { image: IMG.editorialWoman, eyebrow: "New in", heading: "Women", link_label: "Shop women", link: "/collections/all" } },
        { type: "panel", settings: { image: IMG.editorialMan, eyebrow: "New in", heading: "Men", link_label: "Shop men", link: "/collections/all" } },
      ],
    },
    { type: "featured-collection", settings: { eyebrow: "Just in", heading: "New arrivals", source: "newest", limit: 8, columns: 4, layout: "carousel" } },
    lookbookSpec(IMG.lookbook, "Shop the look", "Soft tailoring and easy layers — tap the markers to discover each piece."),
    {
      type: "rich-text",
      settings: {
        eyebrow: "Our philosophy",
        heading: "Fewer, better things",
        text: "<p>We design in small runs, work with mills we know by name and finish every piece by hand — so what you buy today still feels right years from now.</p>",
        align: "center",
        size: "large",
        button_label: "Our story",
        button_link: "/pages/about",
        button_style: "link",
        padding: "large",
      },
    },
    {
      type: "editorial-collection",
      settings: { image: IMG.lifestyle, eyebrow: "The edit", heading: "Weekend uniform", source: "best-selling", limit: 4, image_position: "left" },
    },
    { type: "collection-list", settings: { heading: "Shop by category", limit: 4, columns: 4, card_style: "below", image_ratio: "portrait" } },
    testimonials([
      ["The linen is beautiful — heavier than I expected and it softens with every wash. Delivery to Sylhet took three days.", "Nusrat J.", "Sylhet", IMG.avatar1],
      ["Finally a local label with real attention to fit. The size guide was spot on.", "Tanvir A.", "Dhaka", IMG.avatar2],
      ["Packaging felt like a gift. I've already ordered the same shirt in a second colour.", "Farhana R.", "Chattogram", IMG.avatar3],
    ]),
    {
      type: "image-gallery",
      settings: { eyebrow: "", heading: "Seen on you", heading_align: "center", columns: 6, gap: false, padding: "medium" },
      blocks: IMG.gallery.map((image) => ({ type: "image", settings: { image } })),
    },
    { type: "newsletter", settings: { heading: "Join our letter", subheading: "Early access to new collections, private sales and styling notes.", button_label: "Subscribe", color_scheme: "muted" } },
  ]);
}

export function jewelryIndex(): SectionList {
  return sectionList([
    {
      type: "aurora-hero",
      settings: { layout: "split_right", image: IMG.heroJewelry, detail_image: IMG.jewelryDetail, height: "large", color_scheme: "muted", split_align: "left" },
      blocks: [
        { type: "eyebrow", settings: { text: "Fine jewellery" } },
        { type: "heading", settings: { text: "Pieces to keep, moments to remember", size: "medium", tag: "h1" } },
        { type: "text", settings: { text: "Hand-finished gold and silver, made in small batches and certified for purity." } },
        { type: "buttons", settings: { label_1: "Shop the collection", link_1: "/collections/all", style_1: "primary", label_2: "Explore the lookbook", link_2: "#section-lookbook", style_2: "link" } },
      ],
    },
    {
      ...trustRow,
      blocks: [
        { type: "column", settings: { icon: "shield-check", title: "Certified purity", text: "Hallmarked gold & silver" } },
        { type: "column", settings: { icon: "truck", title: "Insured delivery", text: "Nationwide, fully tracked" } },
        { type: "column", settings: { icon: "gift", title: "Gift wrapping", text: "Included on every order" } },
        { type: "column", settings: { icon: "rotate-ccw", title: "Easy exchanges", text: "Within 7 days" } },
      ],
    },
    { type: "featured-collection", settings: { eyebrow: "New", heading: "Latest pieces", heading_align: "center", source: "newest", limit: 8, columns: 4, layout: "grid" } },
    lookbookSpec(IMG.jewelryEarrings, "Styled by us", "Layer, stack and mix metals — tap the markers to shop each piece."),
    {
      type: "split-banner",
      settings: { height: "medium", text_position: "bottom-center", overlay: 30, full_width: false, gap: true },
      blocks: [
        { type: "panel", settings: { image: IMG.jewelryAccessories, eyebrow: "Everyday", heading: "Rings & bands", link_label: "Shop rings", link: "/collections/all" } },
        { type: "panel", settings: { image: IMG.jewelryDetail, eyebrow: "Occasion", heading: "Earrings", link_label: "Shop earrings", link: "/collections/all" } },
      ],
    },
    {
      type: "editorial-collection",
      settings: { image: IMG.jewelryEarrings, eyebrow: "Gifting", heading: "Gifts that last", source: "best-selling", limit: 4, image_position: "right", text: "<p>Beautifully boxed, ready to give — with a handwritten note on request.</p>", button_label: "Shop gifts" },
    },
    {
      type: "rich-text",
      settings: {
        eyebrow: "Our promise",
        heading: "Crafted to be handed down",
        text: "<p>Every piece is made by our master craftspeople, tested for purity and finished by hand. Lifetime cleaning and polishing is on us.</p>",
        align: "center",
        size: "large",
        padding: "large",
        color_scheme: "muted",
      },
    },
    testimonials([
      ["The earrings are even more delicate in person. Beautiful box too — perfect for my sister's wedding.", "Sadia K.", "Dhaka", IMG.avatar1],
      ["Clear purity certificate and insured delivery gave me full confidence ordering online.", "Rafiq H.", "Khulna", IMG.avatar2],
      ["I wear my ring every day and it still shines like new.", "Meher T.", "Rajshahi", IMG.avatar3],
    ]),
    { type: "newsletter", settings: { heading: "Be the first to know", subheading: "New collections and private previews, a few times a month.", button_label: "Subscribe", color_scheme: "inverse" } },
  ]);
}

export function generalIndex(): SectionList {
  return sectionList([
    hero(IMG.heroGeneral, "Thoughtfully chosen", "Good things, beautifully made", "A curated edit of everyday essentials — honest prices, cash on delivery and fast nationwide shipping.", "Shop all", "See the lookbook"),
    trustRow,
    { type: "collection-list", settings: { heading: "Shop by category", limit: 4, columns: 4, card_style: "overlay", image_ratio: "portrait" } },
    { type: "featured-collection", settings: { heading: "New arrivals", source: "newest", limit: 8, columns: 4, layout: "grid" } },
    {
      type: "split-banner",
      settings: { height: "medium", text_position: "bottom-left", overlay: 30, full_width: false, gap: true },
      blocks: [
        { type: "panel", settings: { image: IMG.tote, eyebrow: "Bags", heading: "Carry well", link_label: "Shop bags", link: "/collections/all" } },
        { type: "panel", settings: { image: IMG.sneaker, eyebrow: "Footwear", heading: "Step lightly", link_label: "Shop shoes", link: "/collections/all" } },
      ],
    },
    lookbookSpec(IMG.store, "Shop the edit", "Our favourite pieces this month — tap to discover."),
    { type: "product-grid", settings: { heading: "Best sellers", source: "best-selling", limit: 8, color_scheme: "default" } },
    testimonials([
      ["Quality is excellent and delivery was super fast. Cash on delivery made it so easy!", "Nusrat J.", "Dhaka", IMG.avatar1],
      ["Exactly as pictured. Packaging was lovely and support answered all my questions.", "Tanvir A.", "Chattogram", IMG.avatar2],
      ["My third order from this shop — always genuine products and honest prices.", "Farhana R.", "Sylhet", IMG.avatar3],
    ]),
    { type: "newsletter", settings: { heading: "Get 10% off your first order", button_label: "Subscribe", color_scheme: "inverse" } },
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "grid", image_ratio: "portrait", media_width: "large", zoom: true, sticky_info: true, sticky_atc: true, show_breadcrumbs: true },
      blocks: [
        { type: "vendor" },
        { type: "title" },
        { type: "rating" },
        { type: "price" },
        { type: "variant_picker", settings: { style: "swatch" } },
        { type: "size_guide" },
        { type: "stock" },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true, buy_now_style: "secondary" } },
        { type: "delivery_info" },
        { type: "description", settings: { collapsed: false } },
        { type: "collapsible_tab", settings: { heading: "Fabric & care", icon: "sparkles", content: "<p>Wash cold on a gentle cycle, dry flat in the shade and iron on low. Natural fibres soften beautifully over time.</p>" } },
        { type: "collapsible_tab", settings: { heading: "Delivery & exchanges", icon: "truck" } },
        { type: "share" },
      ],
    },
    { type: "product-reviews" },
    { type: "related-products", settings: { heading: "Complete the look" } },
  ]);
}
