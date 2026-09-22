/**
 * Savor defaults: header/footer groups and every template, built with `sectionList` so section ids
 * are deterministic (the customizer and the storefront must agree on them).
 */
import type { SectionList } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG } from "./images";

/* ─────────────────────────── groups ─────────────────────────── */

export function headerGroup(messages: string[], stripText: string): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      settings: { style: "marquee", show_phone: false, show_social: false, color_scheme: "primary" },
      blocks: messages.map((text) => ({ type: "announcement", settings: { text } })),
    },
    {
      type: "header",
      settings: { sticky: true, show_strip: true, show_hours: true, show_phone: true, show_whatsapp: true, strip_text: stripText, strip_scheme: "inverse", show_cta: true, max_items: 6 },
    },
  ]);
}

export function footerGroup(o: { band: string; bandText: string; about: string; areas: string; areasNote: string; hoursNote?: string }): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { color_scheme: "inverse", show_band: true, band_heading: o.band, band_text: o.bandText },
      blocks: [
        { type: "brand", settings: { text: o.about, show_contact: true } },
        { type: "hours", settings: { heading: "Opening hours", note: o.hoursNote ?? "" } },
        { type: "areas", settings: { heading: "We deliver to", areas: o.areas, note: o.areasNote } },
        { type: "link_list", settings: { heading: "Explore", menu: "footer" } },
      ],
    },
  ]);
}

export const FOOD_HEADER = headerGroup(
  ["Hot delivery in ~45 minutes across Banani & Gulshan", "Cash on delivery · bKash · Nagad", "Friday special: Mutton Kacchi Family deg — pre-order by Thursday 8 PM"],
  "Free delivery over ৳1,500 in Banani & Gulshan",
);

export const FOOD_FOOTER = footerGroup({
  band: "Hungry? We'll bring it hot.",
  bandText: "Order online, call the kitchen or send us a WhatsApp — most orders arrive in about 45 minutes.",
  about: "Old Dhaka kacchi, charcoal grills and smash burgers — cooked to order in Banani since 2016.",
  areas: "Banani, Banani DOHS, Gulshan 1, Gulshan 2, Baridhara, Mohakhali, Niketan",
  areasNote: "Elsewhere in Dhaka? Find us on Foodpanda & Pathao Food.",
});

export const GIFTS_HEADER = headerGroup(
  ["Same-day cake delivery across Dhaka — order by 4 PM", "Free handwritten gift note with every box", "Custom celebration cakes with 24 hours' notice"],
  "Same-day delivery across Dhaka city",
);

export const GIFTS_FOOTER = footerGroup({
  band: "Make someone's day a little sweeter.",
  bandText: "Cakes, cupcakes and gift boxes baked this morning and delivered with a handwritten note.",
  about: "A small Banani bakery making celebration cakes, cupcakes and gift boxes from scratch every morning.",
  areas: "Banani, Gulshan, Baridhara, Dhanmondi, Uttara, Bashundhara, Mirpur",
  areasNote: "Same-day for orders placed before 4 PM.",
  hoursNote: "Custom cakes need 24 hours' notice.",
});

/* ─────────────────────────── shared specs ─────────────────────────── */

const trustStrip = (cols: [string, string, string][]): SectionSpec => ({
  type: "multicolumn",
  settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: "default", heading: "" },
  blocks: cols.map(([icon, title, text]) => ({ type: "column", settings: { icon, title, text } })),
});

const faq = (qs: [string, string][], heading = "Good to know"): SectionSpec => ({
  type: "faq",
  settings: { heading, heading_align: "center", eyebrow: "Questions", color_scheme: "default" },
  blocks: qs.map(([question, answer]) => ({ type: "question", settings: { question, answer: `<p>${answer}</p>` } })),
});

/* ─────────────────────────── food (default) home ─────────────────────────── */

export function foodIndex(): SectionList {
  return sectionList([
    {
      type: "savor-hero",
      settings: {
        layout: "split",
        image: IMG.heroBiryani,
        image_2: IMG.kebabs,
        height: "large",
        eyebrow: "Banani · Since 2016",
        heading: "Slow-cooked kacchi, fired-up grills.",
        heading_accent: "Delivered hot.",
        subheading: "Old Dhaka recipes sealed in a copper deg, charcoal kebabs and smash burgers — cooked to order and at your door in about 45 minutes.",
        button_2_label: "View menu",
        button_2_link: "#menu",
        rating: "4.8",
        rating_text: "2,300+ reviews on Google & Foodpanda",
        product: "mutton-kacchi-biryani",
        product_label: "Chef's signature",
      },
    },
    trustStrip([
      ["flame", "Cooked to order", "Nothing sits under a heat lamp"],
      ["bike", "Hot in ~45 min", "Our own riders, insulated bags"],
      ["banknote", "Cash on delivery", "Or pay with bKash & Nagad"],
      ["badge-check", "100% halal", "Fresh meat, never frozen"],
    ]),
    {
      type: "savor-menu",
      settings: { eyebrow: "À la carte", heading: "Today's menu", subheading: "Tap a category to jump in — portions for one, two or the whole family.", heading_align: "center", limit: 6, columns: 2, anchor: "menu" },
      blocks: [
        { type: "category", settings: { collection: "biryani-rice", heading: "Biryani & Rice", description: "Chinigura and basmati biryanis sealed and slow-cooked in the deg, the Old Dhaka way.", note: "Served with salad, egg & borhani" } },
        { type: "category", settings: { collection: "curries-grills", heading: "Curries & Charcoal Grills", description: "Tikka, kala bhuna and butter chicken — marinated overnight, fired on coals to order." } },
        { type: "category", settings: { collection: "burgers-pizza", heading: "Burgers & Wood-fired Pizza", description: "Double smash patties on potato buns and hand-stretched 48-hour dough." } },
        { type: "category", settings: { collection: "desserts-bakery", heading: "Desserts & Bakery", description: "Belgian chocolate cake, cupcakes and donuts baked in-house every morning." } },
        { type: "category", settings: { collection: "beverages", heading: "Drinks", description: "Masala chai, iced caramel lattes and fresh-pressed juice." } },
      ],
    },
    {
      type: "savor-combos",
      settings: { eyebrow: "Set menus", heading: "Combo deals", subheading: "More food, better value — made for office lunches, match nights and family dinners.", layout: "feature", color_scheme: "muted" },
      blocks: [
        { type: "combo", settings: { image: IMG.biryaniFeast, badge: "Save 15%", title: "Family Feast", serves: "Serves 4", product: "family-feast-combo-4-pax", items: "Mutton kacchi (family deg)\nChicken tikka (6 pcs)\nBeef kala bhuna\nBorhani × 4 & firni × 4", was_price: "" } },
        { type: "combo", settings: { image: IMG.doubleBurger, badge: "Best value", title: "Burger Night for Two", serves: "Serves 2", items: "2 smash double beef burgers\nLoaded cheese fries\n2 iced drinks", price: "৳1,190", was_price: "৳1,380", link: "/collections/burgers-pizza" } },
        { type: "combo", settings: { image: IMG.chickenBiryani, badge: "Weekdays 12–4", title: "Office Lunch Box", serves: "Serves 1", items: "Chicken biryani (half)\nChicken roast\nBorhani", price: "৳420", was_price: "৳490", link: "/collections/biryani-rice" } },
      ],
    },
    {
      type: "savor-story",
      settings: {
        image: IMG.chefPortrait,
        image_2: IMG.spices,
        image_position: "left",
        eyebrow: "From our kitchen",
        heading: "Three generations of Old Dhaka recipes",
        quote: "We still seal every kacchi deg with dough and let it rest on the coals. You can't rush a good biryani — so we don't.",
        name: "Chef Rafiqul Islam",
        role: "Head chef & founder",
      },
      blocks: [
        { type: "stat", settings: { value: "2016", label: "Serving Banani since" } },
        { type: "stat", settings: { value: "18", label: "Spices roasted in-house" } },
        { type: "stat", settings: { value: "45 min", label: "Average delivery" } },
      ],
    },
    {
      type: "featured-collection",
      settings: { eyebrow: "Most ordered this week", heading: "Chef's picks", source: "best-selling", limit: 6, columns: 2, mobile_columns: "1", layout: "grid", show_view_all: true, color_scheme: "default" },
    },
    {
      type: "savor-reviews",
      settings: { eyebrow: "Guest book", heading: "What Dhaka is saying", rating: "4.8", rating_text: "from 2,300+ reviews on Google & Foodpanda", columns: 3, color_scheme: "muted" },
      blocks: [
        { type: "review", settings: { author: "Nusrat Jahan", location: "Gulshan 2", avatar: IMG.avatar1, rating: 5, dish: "Mutton Kacchi Biryani", source: "google", date: "2 weeks ago", text: "The kacchi was exactly like the ones from Old Dhaka weddings — fragrant, the mutton falling off the bone. Arrived still steaming." } },
        { type: "review", settings: { author: "Tanvir Ahmed", location: "Banani", avatar: IMG.avatar2, rating: 5, dish: "Smash Double Beef Burger", source: "foodpanda", date: "Last week", text: "Proper smash burger — crispy lacy edges, soft potato bun, and the fries were still crunchy when they got to my office." } },
        { type: "review", settings: { author: "Farhana Rahman", location: "Mohakhali", avatar: IMG.avatar3, rating: 5, dish: "Family Feast Combo", source: "facebook", date: "1 month ago", text: "Ordered for my father's birthday and it fed six of us with leftovers. The rider called ahead and was super polite." } },
      ],
    },
    {
      type: "savor-delivery",
      settings: { eyebrow: "Delivery", heading: "Hot at your door in 30–60 minutes", min_order: "৳400", free_over: "৳1,500", payment: "Cash, bKash or Nagad", color_scheme: "inverse", image: IMG.delivery },
      blocks: [
        { type: "area", settings: { name: "Banani & Banani DOHS", time: "25–35 min", fee: "৳40" } },
        { type: "area", settings: { name: "Gulshan 1 & 2", time: "30–45 min", fee: "৳60" } },
        { type: "area", settings: { name: "Baridhara & Niketan", time: "35–50 min", fee: "৳70" } },
        { type: "area", settings: { name: "Mohakhali", time: "35–50 min", fee: "৳70", note: "Incl. Mohakhali DOHS" } },
      ],
    },
    {
      type: "savor-hours",
      settings: { eyebrow: "Visit or order", heading: "Find us in Banani", subheading: "Dine in by the window, pick up on your way home, or let our riders bring it to you.", image: IMG.interiorWarm, image_position: "right" },
    },
    faq([
      ["How long does delivery take?", "Most orders in Banani and Gulshan arrive in 30–45 minutes. At peak times (Friday lunch, iftar) allow up to an hour — we'll call if there's a delay."],
      ["Can I pre-order for a party or office lunch?", "Yes. Family degs and office boxes can be booked up to 7 days ahead. Order online and add your delivery time in the order note, or WhatsApp us."],
      ["Do you use halal meat?", "Always. Our chicken, beef and mutton come from trusted halal suppliers and are delivered fresh every morning."],
      ["How can I pay?", "Cash on delivery, bKash or Nagad. Card payments are available at checkout for online orders."],
    ]),
    {
      type: "newsletter",
      settings: { heading: "৳100 off your first order", subheading: "Join the Savor list for weekly specials, festival menus and first dibs on the Friday family deg.", button_label: "Get my code", color_scheme: "primary" },
    },
  ]);
}

/* ─────────────────────────── gifts (bakery & gifting) home ─────────────────────────── */

export function giftsIndex(): SectionList {
  return sectionList([
    {
      type: "savor-hero",
      settings: {
        layout: "split",
        image: IMG.chocolateCake,
        image_2: IMG.macaronStack,
        height: "large",
        eyebrow: "Baked this morning in Banani",
        heading: "Cakes & sweet boxes for every little celebration.",
        heading_accent: "Delivered today.",
        subheading: "Belgian chocolate cakes, cupcakes and gift boxes — wrapped with a handwritten note and delivered across Dhaka the same day.",
        button_label: "Send a treat",
        button_link: "/collections/desserts-bakery",
        button_2_label: "Browse the bakery",
        button_2_link: "#menu",
        rating: "4.9",
        rating_text: "1,100+ happy birthdays delivered",
        product: "belgian-chocolate-cake",
        product_label: "Most gifted",
      },
    },
    trustStrip([
      ["cake", "Baked fresh daily", "No preservatives, ever"],
      ["truck", "Same-day delivery", "Order by 4 PM"],
      ["gift", "Gift-ready boxes", "Ribbon & handwritten note"],
      ["banknote", "Cash on delivery", "bKash & Nagad too"],
    ]),
    {
      type: "savor-combos",
      settings: { eyebrow: "Gift boxes", heading: "Ready to gift", subheading: "Our most-loved sweet boxes, wrapped and ready to surprise someone.", layout: "feature", button_label: "Send this box", color_scheme: "muted" },
      blocks: [
        { type: "combo", settings: { image: IMG.giftPink, badge: "Most loved", title: "Birthday Surprise Box", serves: "For 4–6", items: "Belgian chocolate cake (1 lb)\nStrawberry cupcakes × 6\nCandles & a handwritten card", price: "৳1,650", was_price: "৳1,900", link: "/collections/desserts-bakery" } },
        { type: "combo", settings: { image: IMG.macarons, badge: "New", title: "Macaron & Tea Box", serves: "For 2", items: "12 French macarons\nMasala chai for two", price: "৳1,150", was_price: "", link: "/collections/desserts-bakery" } },
        { type: "combo", settings: { image: IMG.cupcakes, badge: "Office favourite", title: "Cupcake Party Dozen", serves: "For 12", items: "12 mixed cupcakes\nCustom message topper", price: "৳1,480", was_price: "৳1,680", link: "/collections/desserts-bakery" } },
      ],
    },
    {
      type: "savor-menu",
      settings: { eyebrow: "The bakery counter", heading: "Sweet menu", subheading: "Cakes by the pound, boxes by the dozen and drinks to go with them.", heading_align: "center", limit: 6, columns: 2, anchor: "menu" },
      blocks: [
        { type: "category", settings: { collection: "desserts-bakery", heading: "Cakes, Cupcakes & Donuts", description: "Baked every morning — order a 1 lb for two or a 2 lb for the whole party.", image: IMG.pastries, note: "Custom message free on every cake" } },
        { type: "category", settings: { collection: "beverages", heading: "Coffee, Chai & Juice", description: "Pair your box with an iced caramel latte or a pot of masala chai.", image: IMG.latte } },
      ],
    },
    {
      type: "savor-story",
      settings: {
        image: IMG.bakeryDisplay,
        image_2: IMG.berrySlice,
        image_position: "right",
        eyebrow: "Our bakery",
        heading: "Butter, Belgian chocolate and a lot of patience",
        quote: "Every cake is baked the morning it leaves us and finished by hand — I'd rather sell out than sell yesterday's sponge.",
        name: "Sadia Karim",
        role: "Head baker",
        button_label: "Meet the bakers",
        color_scheme: "default",
      },
      blocks: [
        { type: "stat", settings: { value: "6 AM", label: "Ovens on, every day" } },
        { type: "stat", settings: { value: "0", label: "Preservatives" } },
        { type: "stat", settings: { value: "4 PM", label: "Same-day cut-off" } },
      ],
    },
    {
      type: "featured-collection",
      settings: { eyebrow: "Just out of the oven", heading: "Bakery favourites", source: "collection", collection: "desserts-bakery", limit: 6, columns: 2, mobile_columns: "1", layout: "grid", show_view_all: true },
    },
    {
      type: "savor-reviews",
      settings: { eyebrow: "Sweet words", heading: "Loved on birthdays across Dhaka", rating: "4.9", rating_text: "from 1,100+ Google & Facebook reviews", columns: 3, color_scheme: "muted" },
      blocks: [
        { type: "review", settings: { author: "Meher Tasnim", location: "Dhanmondi", avatar: IMG.avatar5, rating: 5, dish: "Belgian Chocolate Cake (2 lb)", source: "google", date: "3 days ago", text: "Ordered at 2 PM for my sister's surprise and it arrived by 6 — beautifully boxed, with the note in actual handwriting." } },
        { type: "review", settings: { author: "Rafiq Hasan", location: "Uttara", avatar: IMG.avatar4, rating: 5, dish: "Strawberry Cupcakes", source: "facebook", date: "Last week", text: "The cupcakes were light and not too sweet. The whole office asked where they were from." } },
        { type: "review", settings: { author: "Nabila Chowdhury", location: "Gulshan 1", avatar: IMG.avatar1, rating: 5, dish: "Glazed Donut Box", source: "google", date: "2 weeks ago", text: "Soft, fresh donuts — we ordered a second box before the first one was finished." } },
      ],
    },
    {
      type: "savor-delivery",
      settings: {
        eyebrow: "Same-day delivery",
        heading: "Order by 4 PM, delivered by evening",
        subheading: "Cakes travel upright in chilled boxes with our own riders, so they arrive exactly as they left the bakery.",
        min_order: "৳600",
        free_over: "৳2,500",
        payment: "Cash, bKash or Nagad",
        button_label: "Send a treat",
        button_link: "/collections/desserts-bakery",
        footnote: "Need it at a specific time? Add it in the order note — we'll confirm by phone.",
        image: IMG.giftKraft,
        color_scheme: "inverse",
      },
      blocks: [
        { type: "area", settings: { name: "Banani, Gulshan & Baridhara", time: "Within 2 hours", fee: "৳60" } },
        { type: "area", settings: { name: "Dhanmondi & Mohammadpur", time: "Same day", fee: "৳100" } },
        { type: "area", settings: { name: "Uttara, Bashundhara & Mirpur", time: "Same day", fee: "৳120" } },
      ],
    },
    {
      type: "savor-hours",
      settings: { eyebrow: "Visit the bakery", heading: "Come by for a slice", subheading: "Pick up a cake on your way to the party, or stay for coffee and a warm brownie.", image: IMG.pastries, image_position: "left", note: "Custom cakes need 24 hours' notice." },
    },
    faq(
      [
        ["Can I add a message on the cake?", "Yes — add it in the product's order note at checkout. Messages up to 30 characters are free."],
        ["When is the same-day cut-off?", "Orders placed by 4 PM are delivered the same evening across Dhaka city. After that, choose a delivery time for tomorrow."],
        ["Do you make custom celebration cakes?", "We do! Send us a reference photo on WhatsApp at least 24 hours before your event and we'll confirm the design and price."],
        ["How should I store my cake?", "Keep it in the fridge and take it out 30 minutes before serving. Best enjoyed within 2 days."],
      ],
      "Before you order",
    ),
    {
      type: "newsletter",
      settings: { heading: "Never miss a birthday", subheading: "Get birthday reminders, seasonal bakes and 10% off your first box.", button_label: "Sign me up", color_scheme: "primary" },
    },
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
        { type: "price", settings: { show_tax_note: true, tax_note: "Prices include VAT. Delivery fee calculated at checkout." } },
        { type: "dish_facts", settings: { prep: "25–35 min" } },
        { type: "variant_picker", settings: { style: "buttons" } },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true, buy_now_label: "Order now" } },
        { type: "order_hours" },
        { type: "description", settings: { collapsed: false } },
        { type: "collapsible_tab", settings: { heading: "Ingredients & allergens", icon: "leaf", content: "<p>Cooked in a kitchen that handles nuts, dairy, gluten and eggs. Ask us on WhatsApp if you have an allergy — we're happy to help.</p>" } },
        { type: "collapsible_tab", settings: { heading: "Delivery & freshness", icon: "truck", content: "<p>Cooked when you order and sealed in insulated bags. Banani & Gulshan in 30–45 minutes; cash on delivery, bKash and Nagad accepted.</p>" } },
      ],
    },
    { type: "product-reviews", settings: { heading: "What guests say", hide_when_empty: true } },
    { type: "related-products", settings: { heading: "Goes well with", limit: 4, columns: 2 } },
  ]);
}

export function cartTemplate(): SectionList {
  return sectionList([
    { type: "main-cart" },
    { type: "featured-collection", settings: { heading: "Add a drink or dessert?", source: "collection", collection: "beverages", limit: 4, columns: 2, mobile_columns: "1", show_view_all: false } },
  ]);
}
