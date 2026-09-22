/**
 * Bloom defaults: header/footer groups and every template. Section ids are deterministic
 * (see `sectionList`) so the customizer and storefront agree on ids for theme defaults.
 *
 * Collections and products referenced below match the seeded beauty catalogue; every Bloom
 * section falls back (collection → tag → best sellers) when a slug doesn't exist in a store.
 */
import type { SectionList } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { GALLERY, IMG } from "./images";

/* ─────────────────────────── groups ─────────────────────────── */

export function headerGroup(messages: string[], background = "#f6dde3", side = "Dermatologist-approved · Cruelty-free"): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      settings: { background, style: "rotate", speed: 5, show_social: true, side_text: side },
      blocks: messages.map((text) => ({ type: "announcement", settings: { text } })),
    },
    { type: "header", settings: { layout: "centered", uppercase_menu: true, search_pill: true, sticky: true, frosted: true, show_account: true } },
  ]);
}

export function footerGroup(club: { eyebrow: string; heading: string; text: string; image?: string }, about: string): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { color_scheme: "muted", show_wordmark: true },
      blocks: [
        { type: "newsletter", settings: { ...club, button_label: "Join the club", image: club.image ?? "" } },
        { type: "brand", settings: { text: about } },
        { type: "link_list", settings: { heading: "Shop", menu: "main" } },
        { type: "link_list", settings: { heading: "Help", menu: "footer" } },
        { type: "contact", settings: { heading: "Talk to us", hours: "Every day, 10am – 9pm" } },
      ],
    },
  ]);
}

export const BEAUTY_ABOUT = "Authentic skincare, makeup and fragrance chosen for South Asian skin and humid days — sourced directly from brands, delivered with care.";

/* ─────────────────────────── shared specs ─────────────────────────── */

const trust = (items: [string, string, string][]): SectionSpec => ({
  type: "multicolumn",
  settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: "default" },
  blocks: items.map(([icon, title, text]) => ({ type: "column", settings: { icon, title, text } })),
});

const CAPTIONS = ["Morning glow ✨", "Two drops is all it takes", "Sunday bath ritual", "Velvet lip, always", "Shelfie goals", "Dewy, not greasy", "Swatch party", "Towel-off, glow-on", "Friday mask night"];

const gallery = (heading: string, handle: string, eyebrow: string): SectionSpec => ({
  type: "social-gallery",
  settings: { eyebrow, heading, handle, layout: "mosaic", button_label: "Follow us" },
  blocks: GALLERY.map((image, i) => ({
    type: "post",
    settings: { image, caption: CAPTIONS[i] ?? "" },
  })),
});

/* ─────────────────────────── home pages ─────────────────────────── */

export function beautyIndex(): SectionList {
  return sectionList([
    {
      type: "bloom-hero",
      settings: {
        layout: "arch",
        image: IMG.heroPortrait,
        image_alt: "Model with glowing, dewy skin on a blush backdrop",
        image_2: IMG.serumBottle,
        eyebrow: "New · The Glow Ritual",
        heading: "Skin that feels like *spring*",
        text: "Gentle, effective skincare made for humid days and South Asian skin — dermatologist-approved and delivered in 48 hours.",
        button_label: "Shop bestsellers",
        button_link: "/collections/all",
        button_style: "primary",
        button2_label: "Build your routine",
        button2_link: "#section-routine-builder",
        button2_style: "link",
        badge_rating: 4.9,
        badge_text: "from 12,000+ happy customers",
        color_scheme: "muted",
      },
    },
    trust([
      ["badge-check", "100% authentic", "Sourced directly from brands"],
      ["banknote", "Cash on delivery", "Pay when it arrives"],
      ["truck", "48-hour delivery", "Inside Dhaka, nationwide in 3–5 days"],
      ["sparkles", "Free samples", "With every order over ৳2,500"],
    ]),
    { type: "collection-list", settings: { eyebrow: "Explore", heading: "Shop by category", heading_align: "center", limit: 6, card_style: "circle", columns: 6 } },
    { type: "featured-collection", settings: { eyebrow: "Most loved", heading: "Bestsellers", heading_align: "left", source: "best-selling", limit: 8, columns: 4, layout: "carousel" } },
    {
      id: "routine-builder",
      type: "routine-builder",
      settings: { eyebrow: "Routine builder", heading: "Your skin, your *ritual*", subheading: "Choose what you'd like to work on — we'll build a simple routine that fits.", steps: "Cleanse, Tone, Treat, Moisturise, Protect", limit: 4, color_scheme: "default" },
      blocks: [
        {
          type: "concern",
          settings: {
            title: "Dullness",
            hint: "Glow & radiance",
            image: IMG.orange,
            text: "Vitamin C by day to brighten, SPF to protect your glow.",
            products: ["gentle-foaming-cleanser-150-ml", "rose-water-balancing-toner-200-ml", "vitamin-c-brightening-serum-30-ml", "daily-moisturiser-spf-30-50-ml"],
            collection: "skincare",
          },
        },
        {
          type: "concern",
          settings: {
            title: "Dryness",
            hint: "Deep hydration",
            image: IMG.dropperHand,
            text: "Layer water-based hydration, then seal it in with ceramides.",
            products: ["gentle-foaming-cleanser-150-ml", "rose-water-balancing-toner-200-ml", "hyaluronic-acid-hydrating-serum-30-ml", "ceramide-barrier-repair-cream-50-g"],
            collection: "skincare",
          },
        },
        {
          type: "concern",
          settings: {
            title: "Oil & pores",
            hint: "Balance & clarity",
            image: IMG.avocadoMask,
            text: "A weekly clay mask and a light, non-greasy SPF keep shine in check.",
            products: ["gentle-foaming-cleanser-150-ml", "charcoal-detox-clay-mask", "rose-water-balancing-toner-200-ml", "daily-moisturiser-spf-30-50-ml"],
            collection: "skincare",
          },
        },
        {
          type: "concern",
          settings: {
            title: "Sensitivity",
            hint: "Calm & repair",
            image: IMG.aloe,
            text: "Fewer steps, gentler formulas — rebuild the barrier first.",
            products: ["gentle-foaming-cleanser-150-ml", "hyaluronic-acid-hydrating-serum-30-ml", "ceramide-barrier-repair-cream-50-g", "daily-moisturiser-spf-30-50-ml"],
            collection: "skincare",
          },
        },
      ],
    },
    {
      type: "ingredient-highlights",
      settings: { eyebrow: "What's inside", heading: "Clean actives, *real* results", heading_align: "center", image: IMG.serumDropper, image_alt: "Serum bottle with a glass dropper on wood", layout: "orbit", button_label: "", color_scheme: "default" },
      blocks: [
        { type: "ingredient", settings: { name: "Vitamin C", amount: "15%", image: IMG.orange, text: "Brightens dullness and fades dark spots." } },
        { type: "ingredient", settings: { name: "Aloe vera", amount: "Organic", image: IMG.aloe, text: "Calms redness and soothes after sun." } },
        { type: "ingredient", settings: { name: "Hyaluronic acid", amount: "2%", image: IMG.dropperHand, text: "Draws in moisture for plump, bouncy skin." } },
        { type: "ingredient", settings: { name: "Raw honey", amount: "Sundarbans", image: IMG.honey, text: "Nourishes and protects the skin barrier." } },
      ],
    },
    {
      type: "before-after",
      settings: {
        eyebrow: "Real results",
        heading: "Four weeks to *brighter* skin",
        text: "Our Vitamin C Brightening Serum, used morning and night with SPF. Results from customers in our 28-day glow challenge.",
        before_image: IMG.heroPortrait,
        after_image: IMG.heroPortrait,
        before_filter: "dull",
        before_label: "Day 1",
        after_label: "Day 28",
        product: "vitamin-c-brightening-serum-30-ml",
        button_label: "Shop the serum",
        button_link: "/collections/all",
        color_scheme: "muted",
      },
      blocks: [
        { type: "stat", settings: { value: "92%", label: "saw brighter, more even skin" } },
        { type: "stat", settings: { value: "87%", label: "noticed faded dark spots" } },
        { type: "stat", settings: { value: "4.8★", label: "from 2,300 reviews" } },
      ],
    },
    {
      type: "shop-the-look",
      settings: { eyebrow: "Get the look", heading: "The *soft glam* edit", text: "Dewy base, rosy cheeks and a velvet lip — four products, ten minutes.", image: IMG.makeupPortrait, image_alt: "Model wearing soft glam makeup", image_position: "left" },
      blocks: [
        { type: "spot", settings: { product: "radiant-glow-blush-and-highlighter-duo", x: 62, y: 44, note: "Swept high on the cheekbones" } },
        { type: "spot", settings: { product: "matte-velvet-lipstick", x: 52, y: 70, note: "Pressed on with a fingertip" } },
        { type: "spot", settings: { product: "35-shade-eyeshadow-palette", x: 40, y: 34, note: "Blended softly on the lids" } },
        { type: "spot", settings: { product: "pro-makeup-brush-set-12-pcs", x: 24, y: 80, note: "For a seamless finish" } },
      ],
    },
    { type: "featured-collection", settings: { eyebrow: "Just landed", heading: "New arrivals", heading_align: "center", source: "newest", limit: 4, columns: 4, layout: "grid", color_scheme: "default" } },
    {
      type: "reviews-wall",
      settings: { eyebrow: "Loved by you", heading: "12,000+ *glowing* reviews", average: 4.8, summary: "Verified reviews across our store", product: "vitamin-c-brightening-serum-30-ml", live_limit: 2, columns: 3, button_label: "", color_scheme: "muted" },
      blocks: [
        { type: "review", settings: { name: "Nusrat J.", location: "Dhaka", title: "My holy-grail serum", text: "Three weeks in and my dark spots have faded so much. It layers beautifully under sunscreen and doesn't pill.", skin: "Combination", photo: IMG.avatar1, product: "vitamin-c-brightening-serum-30-ml" } },
        { type: "review", settings: { name: "Farhana R.", location: "Sylhet", text: "Gentle enough for my sensitive skin — no stinging at all, and my cheeks are finally calm.", skin: "Sensitive", product: "ceramide-barrier-repair-cream-50-g" } },
        { type: "review", settings: { name: "Mim A.", location: "Chattogram", title: "Felt like a gift", text: "Arrived in two days with a handwritten note and samples. The lipstick shade is exactly like the photos.", photo: IMG.avatar2, product: "matte-velvet-lipstick" } },
        { type: "review", settings: { name: "Sadia K.", location: "Rajshahi", text: "The clay mask is my Friday ritual now. Pores look smaller and my T-zone stays matte till evening.", skin: "Oily", photo: IMG.avatar4 } },
        { type: "review", settings: { name: "Tahmina H.", location: "Khulna", title: "Worth every taka", text: "Authentic products, sealed boxes and cash on delivery — I don't shop for skincare anywhere else.", photo: IMG.avatar3 } },
      ],
    },
    gallery("Glowing on *your* feed", "@bloombeauty.bd", "#BloomRitual"),
    { type: "blog-posts", settings: { eyebrow: "The Glow Journal", heading: "Skin notes & how-tos", heading_align: "center", limit: 3, columns: 3 } },
  ]);
}

export function wellnessIndex(): SectionList {
  return sectionList([
    {
      type: "bloom-hero",
      settings: {
        layout: "arch_left",
        image: IMG.spaTowels,
        image_alt: "Soft towels, a wooden brush and natural soap",
        image_2: IMG.capsules,
        eyebrow: "Everyday wellness",
        heading: "Feel good, *inside* and out",
        text: "Vitamins, body care and calming rituals — genuine, pharmacist-checked and delivered to your door.",
        button_label: "Shop wellness",
        button_link: "/collections/all",
        button2_label: "Find your routine",
        button2_link: "#section-routine-builder",
        badge_rating: 4.8,
        badge_text: "trusted by 8,000+ families",
        color_scheme: "muted",
      },
    },
    trust([
      ["shield-check", "Genuine & sealed", "Pharmacist-checked stock"],
      ["banknote", "Cash on delivery", "All 64 districts"],
      ["truck", "Fast delivery", "Inside Dhaka in 24–48 h"],
      ["headset", "Ask an expert", "Free advice on WhatsApp"],
    ]),
    { type: "collection-list", settings: { heading: "Shop by need", heading_align: "center", limit: 6, card_style: "circle", columns: 6 } },
    {
      id: "routine-builder",
      type: "routine-builder",
      settings: { eyebrow: "Daily rituals", heading: "Build a *gentle* routine", subheading: "Pick a goal and we'll suggest a few essentials to start with.", steps: "Morning, Midday, Evening, Weekly", limit: 4 },
      blocks: [
        { type: "concern", settings: { title: "Better sleep", hint: "Wind down", image: IMG.flowerBath, text: "A warm soak, a calming oil and a screen-free hour.", tag: "night" } },
        { type: "concern", settings: { title: "Skin from within", hint: "Glow", image: IMG.orange, text: "Hydration, vitamin C and daily sun protection.", tag: "vitamin-c" } },
        { type: "concern", settings: { title: "Body care", hint: "Soft & nourished", image: IMG.coconut, text: "Cold-pressed oils and rich butters after every shower.", tag: "body" } },
      ],
    },
    {
      type: "ingredient-highlights",
      settings: { eyebrow: "Botanicals we trust", heading: "Nature, *measured*", heading_align: "center", image: IMG.oilHands, image_alt: "Hands holding a bottle of botanical oil", layout: "grid" },
      blocks: [
        { type: "ingredient", settings: { name: "Aloe vera", amount: "Organic", image: IMG.aloe, text: "Cools and soothes skin after long, hot days." } },
        { type: "ingredient", settings: { name: "Virgin coconut", amount: "Cold-pressed", image: IMG.coconut, text: "Deeply conditions skin and hair." } },
        { type: "ingredient", settings: { name: "Raw honey", amount: "Sundarbans", image: IMG.honey, text: "Naturally antibacterial and nourishing." } },
        { type: "ingredient", settings: { name: "Lemon", amount: "Cold-pressed", image: IMG.lemons, text: "A fresh, uplifting scent rich in vitamin C." } },
      ],
    },
    { type: "featured-collection", settings: { eyebrow: "Most loved", heading: "Bestsellers", source: "best-selling", limit: 8, columns: 4, layout: "carousel" } },
    {
      type: "reviews-wall",
      settings: { eyebrow: "Kind words", heading: "Wellness, *reviewed*", average: 4.8, summary: "From verified buyers", columns: 3, live_limit: 0, color_scheme: "muted" },
      blocks: [
        { type: "review", settings: { name: "Rafiq H.", location: "Dhaka", text: "Sealed, genuine and delivered the same day. The pharmacist even called to explain dosage.", photo: IMG.avatar4 } },
        { type: "review", settings: { name: "Meher T.", location: "Rajshahi", title: "My evening ritual", text: "The coconut body oil smells like home. My skin has never been softer.", photo: IMG.avatar1 } },
        { type: "review", settings: { name: "Anika S.", location: "Cumilla", text: "Great prices and cash on delivery. Reordering every month now." } },
      ],
    },
    {
      type: "faq",
      settings: { heading: "Good to know", heading_align: "center" },
      blocks: [
        { type: "question", settings: { question: "Are your products genuine?", answer: "<p>Yes — everything is sourced directly from brands or authorised distributors and checked by our pharmacist before dispatch.</p>" } },
        { type: "question", settings: { question: "How fast is delivery?", answer: "<p>Inside Dhaka within 24–48 hours, everywhere else in 3–5 working days. Cash on delivery is available nationwide.</p>" } },
        { type: "question", settings: { question: "Can I return an item?", answer: "<p>Unopened items can be returned within 7 days. For hygiene reasons opened products can only be exchanged if faulty.</p>" } },
      ],
    },
    gallery("Rituals from *our* community", "@bloomwellness.bd", "#SlowRitual"),
  ]);
}

export function giftsIndex(): SectionList {
  return sectionList([
    {
      type: "bloom-hero",
      settings: {
        layout: "full",
        image: IMG.heroFlatlay,
        image_alt: "Makeup and flowers arranged on a white table",
        eyebrow: "Gifts she'll love",
        heading: "Wrapped in *something* lovely",
        text: "Curated beauty gift sets with complimentary wrapping and a handwritten note — delivered anywhere in Bangladesh.",
        button_label: "Shop gift sets",
        button_link: "/collections/all",
        button_style: "primary",
        button2_label: "",
        badge_rating: 4.9,
        badge_text: "5,000+ gifts delivered",
        overlay: 25,
        height: "large",
      },
    },
    trust([
      ["gift", "Free gift wrap", "On every single order"],
      ["mail", "Handwritten note", "Tell us what to write"],
      ["truck", "Send anywhere", "All 64 districts"],
      ["banknote", "Pay on delivery", "Or bKash / Nagad"],
    ]),
    { type: "featured-collection", settings: { eyebrow: "Ready to give", heading: "Gift sets", heading_align: "center", source: "featured", limit: 8, columns: 4, layout: "grid" } },
    { type: "collection-list", settings: { heading: "Gifts by category", heading_align: "center", limit: 4, card_style: "overlay", image_ratio: "square", columns: 4 } },
    {
      type: "shop-the-look",
      settings: { eyebrow: "Build a box", heading: "The *pamper* box", text: "Everything for a slow Sunday — we'll wrap it together with a ribbon.", image: IMG.creamHand, image_alt: "Hand holding an open jar of face cream", image_position: "right" },
      blocks: [
        { type: "spot", settings: { x: 50, y: 40 } },
        { type: "spot", settings: { x: 30, y: 70 } },
        { type: "spot", settings: { x: 70, y: 72 } },
      ],
    },
    {
      type: "rich-text",
      settings: {
        eyebrow: "The finishing touch",
        heading: "Every gift, beautifully wrapped",
        text: "<p>Add a message at checkout and we'll hand-write it on a card, tie it with a silk ribbon and leave out the price tag.</p>",
        align: "center",
        size: "large",
        color_scheme: "muted",
        padding: "large",
      },
    },
    { type: "featured-collection", settings: { eyebrow: "Under ৳1,500", heading: "Little luxuries", source: "newest", limit: 4, columns: 4, layout: "grid" } },
    {
      type: "reviews-wall",
      settings: { eyebrow: "Happy gifting", heading: "Gifts that *landed*", average: 4.9, summary: "From verified buyers", columns: 3, live_limit: 0 },
      blocks: [
        { type: "review", settings: { name: "Tanvir A.", location: "Dhaka", title: "Anniversary saved", text: "Ordered at midnight, delivered the next evening, beautifully wrapped. She loved it.", photo: IMG.avatar5 } },
        { type: "review", settings: { name: "Nabila K.", location: "Sylhet", text: "The handwritten card made my mum cry happy tears. Thank you!", photo: IMG.avatar2 } },
        { type: "review", settings: { name: "Shuvo R.", location: "Barishal", text: "Easy to order for my sister in another city. Cash on delivery worked perfectly." } },
      ],
    },
    gallery("Unboxed with *love*", "@bloomgifts.bd", "#BloomGifts"),
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "thumbnails-left", image_ratio: "portrait", media_width: "medium", zoom: true, sticky_info: true, sticky_atc: true, show_breadcrumbs: true, color_scheme: "default" },
      blocks: [
        { type: "vendor" },
        { type: "title" },
        { type: "rating" },
        { type: "price", settings: { show_tax_note: false } },
        { type: "variant_picker", settings: { style: "swatch" } },
        { type: "skin_profile" },
        { type: "stock" },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true, buy_now_style: "secondary" } },
        { type: "trust", settings: { icon_1: "badge-check", text_1: "100% authentic", icon_2: "banknote", text_2: "Cash on delivery", icon_3: "sparkles", text_3: "Free samples over ৳2,500" } },
        { type: "description", settings: { collapsed: false } },
        { type: "how_to_use" },
        { type: "collapsible_tab", settings: { heading: "Delivery & returns", icon: "truck" } },
        { type: "share" },
      ],
    },
    {
      type: "ingredient-highlights",
      settings: { eyebrow: "The science", heading: "Why it *works*", heading_align: "center", layout: "grid", show_images: true, button_label: "", color_scheme: "muted", padding: "medium" },
      blocks: [
        { type: "ingredient", settings: { name: "Actives that matter", amount: "Clinically dosed", image: IMG.serumBottle, text: "Effective strengths of proven ingredients — never fairy-dusted." } },
        { type: "ingredient", settings: { name: "Gentle by design", amount: "Derm tested", image: IMG.aloe, text: "Fragrance-light formulas tested on sensitive skin." } },
        { type: "ingredient", settings: { name: "Made for our climate", amount: "Humidity-proof", image: IMG.dropperHand, text: "Light textures that sink in fast, even in monsoon." } },
      ],
    },
    { type: "product-reviews", settings: { heading: "What customers say" } },
    { type: "related-products", settings: { heading: "Complete your routine", limit: 4 } },
  ]);
}

export function templates(): Record<string, SectionList> {
  return {
    product: productTemplate(),
    collection: sectionList([
      { type: "main-collection", settings: { show_banner: true, show_description: true, filters: "sidebar", show_sort: true, per_page: 24, columns: 4, mobile_columns: "2" } },
      { type: "multicolumn", settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: "muted" }, blocks: [
        { type: "column", settings: { icon: "badge-check", title: "100% authentic", text: "Direct from brands" } },
        { type: "column", settings: { icon: "banknote", title: "Cash on delivery", text: "Nationwide" } },
        { type: "column", settings: { icon: "rotate-ccw", title: "Easy returns", text: "Unopened, within 7 days" } },
        { type: "column", settings: { icon: "sparkles", title: "Free samples", text: "On orders over ৳2,500" } },
      ] },
    ]),
    collections: sectionList([
      { type: "main-collections-list", settings: { heading: "Shop by category", card_style: "below", columns: 3 } },
      { type: "featured-collection", settings: { heading: "Bestsellers", heading_align: "center", source: "best-selling", limit: 4, columns: 4 } },
    ]),
    search: sectionList([
      { type: "main-search", settings: { columns: 4 } },
      { type: "featured-collection", settings: { heading: "Trending now", heading_align: "center", source: "best-selling", limit: 4, columns: 4, color_scheme: "muted" } },
    ]),
    cart: sectionList([
      { type: "main-cart", settings: { heading: "Your bag" } },
      { type: "featured-collection", settings: { eyebrow: "Little extras", heading: "You might also love", heading_align: "center", source: "best-selling", limit: 4, columns: 4 } },
    ]),
    page: sectionList([{ type: "main-page" }]),
    blog: sectionList([
      { type: "main-blog", settings: { heading: "The Glow Journal", subheading: "Skin notes, routines and honest how-tos from our team.", feature_first: true } },
      { type: "featured-collection", settings: { heading: "Shop the journal", heading_align: "center", source: "featured", limit: 4, columns: 4, color_scheme: "muted" } },
    ]),
    article: sectionList([
      { type: "main-article", settings: { show_cover: true, show_share: true } },
      { type: "featured-collection", settings: { heading: "Products in this story", heading_align: "center", source: "featured", limit: 4, columns: 4 } },
    ]),
    account: sectionList([{ type: "main-account", settings: { login_heading: "Welcome back, gorgeous", register_heading: "Join the Bloom Club", register_text: "Track orders, save your routine and get 10% off your first order." } }]),
    "404": sectionList([
      { type: "main-404", settings: { heading: "This page has wilted", text: "The page you're looking for doesn't exist or has moved. Let's find you something lovely instead.", show_products: true } },
    ]),
  };
}
