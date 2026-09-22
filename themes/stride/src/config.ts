/**
 * Stride defaults: palettes per preset, header/footer groups and every template.
 * Section ids are deterministic (see `sectionList`) so the customizer and storefront agree.
 */
import type { SectionList, SettingValues, ThemeConfig } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG } from "./images";

/* ─────────────────────────── palettes ─────────────────────────── */

const shared: SettingValues = {
  font_heading: "Bebas Neue",
  font_body: "Archivo",
  heading_weight: "400",
  heading_scale: 110,
  heading_case: "uppercase",
  container_width: 1440,
  section_spacing: 72,
  radius: 0,
  button_radius: 999,
  logo_width: 120,
  header_style: "logo_left",
  card_image_ratio: "portrait",
  card_style: "standard",
  card_text_align: "left",
  card_show_vendor: false,
  card_show_rating: true,
  card_quick_add: true,
  card_hover_swap: true,
  card_show_sale_badge: true,
  card_show_wishlist: true,
  cart_type: "drawer",
  cart_show_free_shipping: true,
};

/** Default: "Sports" — white and near-black with a blaze-orange accent. */
export const SPORTS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#ffffff",
  color_foreground: "#0a0a0a",
  color_primary: "#0a0a0a",
  color_primary_foreground: "#ffffff",
  color_accent: "#ff4d00",
  color_muted: "#f2f2f0",
  color_border: "#e2e2de",
  color_sale: "#e0311b",
  color_card: "#f2f2f0",
  announcement_text: "Free delivery over ৳3,000 · Cash on delivery in all 64 districts",
};

/** Fashion: "Activewear" — warm bone background, ink black and acid lime. */
export const ACTIVEWEAR_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#f5f2ec",
  color_foreground: "#151515",
  color_primary: "#151515",
  color_primary_foreground: "#f5f2ec",
  color_accent: "#c6f432",
  color_muted: "#ebe6dc",
  color_border: "#ddd6c8",
  color_sale: "#d9381e",
  color_card: "#ebe6dc",
  font_heading: "Oswald",
  font_body: "Inter",
  heading_weight: "600",
  heading_scale: 100,
  button_radius: 0,
  announcement_text: "New activewear drop · Free size exchange within 7 days",
};

/** Health: "Fitness & nutrition" — clean white, deep navy and electric blue. */
export const FITNESS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#ffffff",
  color_foreground: "#0b1626",
  color_primary: "#0b1626",
  color_primary_foreground: "#ffffff",
  color_accent: "#2563ff",
  color_muted: "#eef2f8",
  color_border: "#dde3ee",
  color_sale: "#e11d48",
  color_card: "#eef2f8",
  font_body: "Inter",
  button_radius: 6,
  announcement_text: "Genuine equipment & supplements · Cash on delivery nationwide",
};

/* ─────────────────────────── groups ─────────────────────────── */

export function headerGroup(messages: string[], promo: { image: string; eyebrow: string; heading: string; link: string }): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      settings: { style: "marquee", show_phone: false, show_social: false, color_scheme: "accent" },
      blocks: messages.map((text) => ({ type: "announcement", settings: { text } })),
    },
    {
      type: "header",
      settings: {
        sticky: true,
        transparent_on_home: true,
        nav_align: "center",
        mega_tiles: true,
        show_promo: true,
        promo_image: promo.image,
        promo_eyebrow: promo.eyebrow,
        promo_heading: promo.heading,
        promo_link: promo.link,
        highlight_label: "Sale",
        highlight_link: "/collections/all",
      },
    },
  ]);
}

export function footerGroup(about: string, perks: [string, string][], wordmarkStyle = "solid"): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { about, show_newsletter: true, show_wordmark: true, wordmark_style: wordmarkStyle },
      blocks: [
        ...perks.map(([icon, text]) => ({ type: "perk", settings: { icon, text } })),
        { type: "link_list", settings: { heading: "Shop", menu: "main" } },
        { type: "link_list", settings: { heading: "Help", menu: "footer" } },
        { type: "contact", settings: { heading: "Get in touch" } },
      ],
    },
  ]);
}

/* ─────────────────────────── shared specs ─────────────────────────── */

const trustStrip = (items: [string, string, string][]): SectionSpec => ({
  type: "multicolumn",
  settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: "muted", heading: "" },
  blocks: items.map(([icon, title, text]) => ({ type: "column", settings: { icon, title, text } })),
});

const SPORT_TRUST: [string, string, string][] = [
  ["truck", "64-district delivery", "Dhaka in 24–48 hours"],
  ["banknote", "Cash on delivery", "Pay when it arrives"],
  ["rotate-ccw", "7-day returns", "Free size exchange"],
  ["badge-check", "100% genuine", "Straight from the brands"],
];

const testimonials = (quotes: [string, string, string, string][], heading: string): SectionSpec => ({
  type: "testimonials",
  settings: { eyebrow: "Reviews", heading, heading_align: "left", layout: "grid", columns: 3, color_scheme: "default" },
  blocks: quotes.map(([quote, author, location, avatar]) => ({ type: "testimonial", settings: { quote, author, location, avatar, rating: 5 } })),
});

const marquee = (items: string, settings: SettingValues = {}): SectionSpec => ({
  type: "stride-marquee",
  settings: { items, style: "alternate", separator: "✕", size: "medium", speed: 40, direction: "left", color_scheme: "accent", ...settings },
});

const sportTiles = (
  sports: [string, string, string, string, string][],
  settings: SettingValues = {},
): SectionSpec => ({
  type: "stride-sport-tiles",
  settings: { eyebrow: "Choose your game", heading: "Shop by sport", link_label: "All sports", link: "/collections", columns: "3", ratio: "portrait", feature_first: true, show_numbers: true, show_count: true, ...settings },
  blocks: sports.map(([collection, title, caption, image, image_alt]) => ({ type: "sport", settings: { collection, title, caption, image, image_alt } })),
});

const tabs = (list: [string, string, string?][], settings: SettingValues = {}): SectionSpec => ({
  type: "stride-product-tabs",
  settings: { eyebrow: "Fresh drops", heading: "Gear up by sport", limit: 8, layout: "carousel", ratio: "portrait", ...settings },
  blocks: list.map(([label, collection, source = "best-selling"]) => ({ type: "tab", settings: { label, collection, source } })),
});

const stats = (items: [string, string][]) => items.map(([value, label]) => ({ type: "stat", settings: { value, label } }));
const lines = (items: [string, string][]) => items.map(([text, style]) => ({ type: "line", settings: { text, style } }));

const HERO_STATS: [string, string][] = [
  ["64", "Districts delivered"],
  ["COD", "Pay on delivery"],
  ["7-day", "Easy returns"],
  ["100%", "Genuine gear"],
  ["24h", "Dhaka express"],
  ["12k+", "Athletes kitted out"],
];

/* ─────────────────────────── index templates ─────────────────────────── */

export function sportsIndex(): SectionList {
  return sectionList([
    {
      type: "stride-hero",
      settings: {
        image: IMG.heroRunners,
        image_alt: "Three runners silhouetted against a blue evening sky",
        video: "",
        overlay: 40,
        eyebrow: "New season · Built to move",
        subheading: "Performance footwear, training gear and match-day kit — delivered across all 64 districts with cash on delivery.",
        headline_size: "large",
        align: "left",
        height: "full",
        button_label: "Shop new season",
        button_link: "/collections/all",
        button_style: "accent",
        button2_label: "Find your sport",
        button2_link: "#section-stride-sport-tiles",
        button2_style: "secondary",
        show_ticker: true,
        ticker_speed: 35,
      },
      blocks: [...lines([["Built for", "solid"], ["the ones", "outline"], ["who move", "accent"]]), ...stats(HERO_STATS)],
    },
    marquee("Running, Gym & training, Football, Cricket, Yoga, Cycling, Activewear"),
    sportTiles([
      ["running", "Running", "Road, track & trail", IMG.sprint, "Sprinter in starting blocks on a red track"],
      ["gym-training", "Gym & training", "Strength & conditioning", IMG.deadlift, "Athlete lifting a loaded barbell"],
      ["football-cricket", "Football & cricket", "Match-day ready", IMG.batsman, "Cricket batsman playing a drive"],
      ["yoga", "Yoga & recovery", "Mats, blocks & mobility", IMG.yogaSunset, "Yoga pose silhouetted at sunset"],
      ["cycling", "Cycling", "Road & city bikes", IMG.roadBikeBlack, "Black carbon road bike in a studio"],
      ["activewear", "Activewear", "Train in style", IMG.womanBarbell, "Woman pressing a barbell overhead"],
    ]),
    tabs([
      ["Running", "running"],
      ["Gym & training", "gym-training"],
      ["Football & cricket", "football-cricket"],
      ["Cycling", "cycling"],
    ]),
    {
      type: "stride-feature-callouts",
      settings: {
        eyebrow: "Engineered for speed",
        heading: "Every gram earns its place",
        text: "The Velocity Knit is our lightest daily trainer — built for humid mornings, broken roads and personal bests.",
        product: "velocity-knit-running-shoe",
        image: IMG.shoeFlying,
        image_alt: "Lightweight grey running shoe floating mid-air",
        blend: false,
        backdrop_word: "Velocity",
        button_label: "Shop Velocity Knit",
        button_link: "",
        color_scheme: "default",
        padding: "large",
      },
      blocks: [
        { type: "feature", settings: { icon: "wind", title: "Breathable knit", text: "Engineered mesh keeps air moving through Dhaka humidity." } },
        { type: "feature", settings: { icon: "zap", title: "Responsive foam", text: "Springs back on every stride for more energy return." } },
        { type: "feature", settings: { icon: "footprints", title: "Grippy outsole", text: "Rubber pods bite on wet roads and dusty tracks." } },
        { type: "feature", settings: { icon: "feather", title: "Featherweight", text: "Just 240 g in a men's size 9 — you'll forget it's there." } },
      ],
    },
    {
      type: "stride-athlete",
      settings: {
        image: IMG.pullup,
        image_alt: "Athlete doing pull-ups in a dark gym",
        image_position: "left",
        eyebrow: "Athlete story",
        quote: "Nobody sees the 5 a.m. sessions. They only see the result — so I make every rep count.",
        name: "Rafiq Hasan",
        discipline: "Calisthenics · Dhaka",
        text: "Rafiq trains six days a week on Mirpur rooftops and in our partner gyms. His kit has to survive monsoon humidity, concrete and a lot of chalk.",
        button_label: "Train like Rafiq",
        button_link: "/collections/gym-training",
        button_style: "light",
        kit_heading: "Shop his kit",
        kit_products: ["adjustable-dumbbell-pair", "heavy-battle-rope-12-m", "performance-jogger-pants"],
        kit_limit: 3,
        color_scheme: "inverse",
        padding: "none",
      },
      blocks: stats([
        ["32", "Pull-ups unbroken"],
        ["6", "Days a week"],
        ["4 yrs", "Training"],
      ]),
    },
    tabs([["Best sellers", "", "best-selling"], ["New arrivals", "", "newest"], ["Top rated", "", "rating"]], { eyebrow: "Most wanted", heading: "What Bangladesh is training in", numbered: true }),
    {
      type: "stride-drop",
      settings: {
        product: "cloud-trainer-white",
        image: IMG.sneakerLime,
        image_alt: "Neon volt trainer on a lime background",
        image_position: "right",
        sticker: "Limited pairs",
        eyebrow: "Next drop",
        heading: "Cloud Trainer: Volt",
        text: "A tighter knit, lighter foam and a colourway you can see from the other end of the pitch. Limited pairs — once they're gone, they're gone.",
        ends_at: "",
        weekday: "5",
        hour: 20,
        button_label: "Shop the drop",
        button_link: "",
        button_style: "accent",
        button2_label: "Get drop alerts",
        button2_link: "#join-the-club",
        button2_style: "secondary",
        color_scheme: "inverse",
        padding: "none",
      },
    },
    trustStrip(SPORT_TRUST),
    testimonials(
      [
        ["Ran my first half marathon in the Velocity Knits. Delivered to Uttara in a day and they fit exactly like the size chart said.", "Nusrat J.", "Dhaka · Runner", IMG.avatar1],
        ["Ordered a full home-gym set with cash on delivery. Dumbbells arrived well packed and the support team helped me pick weights.", "Tanvir A.", "Chattogram · Lifter", IMG.avatar2],
        ["Genuine English willow bat at a fair price — our whole club orders from here now.", "Sadia K.", "Sylhet · Cricket", IMG.avatar3],
      ],
      "Tested on Bangladeshi roads",
    ),
    marquee("Dhaka, Chattogram, Sylhet, Khulna, Rajshahi, Barishal, Rangpur, Mymensingh", { style: "outline", separator: "●", size: "small", speed: 55, direction: "right", color_scheme: "inverse" }),
    { type: "blog-posts", settings: { eyebrow: "Training journal", heading: "Guides from our coaches", limit: 3, columns: 3 } },
  ]);
}

export function activewearIndex(): SectionList {
  return sectionList([
    {
      type: "stride-hero",
      settings: {
        image: IMG.yellowTracksuit,
        image_alt: "Woman in a yellow tracksuit on an outdoor basketball court",
        overlay: 35,
        eyebrow: "The Studio collection",
        subheading: "Sweat-wicking sets, joggers and trainers that go from the gym floor to the street.",
        headline_size: "large",
        align: "left",
        height: "full",
        button_label: "Shop activewear",
        button_link: "/collections/activewear",
        button_style: "accent",
        button2_label: "New arrivals",
        button2_link: "/collections/all",
        button2_style: "secondary",
        show_ticker: true,
      },
      blocks: [
        ...lines([["Made to", "solid"], ["move", "outline"], ["in style", "accent"]]),
        ...stats([
          ["4-way", "Stretch fabric"],
          ["7-day", "Free size exchange"],
          ["COD", "All 64 districts"],
          ["XS–3XL", "Inclusive sizing"],
        ]),
      ],
    },
    marquee("Sets, Joggers, Tees, Sports bras, Trainers, Accessories"),
    sportTiles(
      [
        ["activewear", "Activewear", "Sets, tees & joggers", IMG.womanBarbell, "Woman training in black activewear"],
        ["running", "Run", "Trainers & shorts", IMG.runnerWhite, "White running trainer on asphalt"],
        ["yoga", "Studio", "Yoga & pilates", IMG.yogaPose, "Woman holding a yoga pose indoors"],
      ],
      { eyebrow: "Shop the edit", heading: "Find your fit", feature_first: false },
    ),
    tabs(
      [
        ["Activewear", "activewear"],
        ["Running", "running"],
        ["Yoga", "yoga"],
      ],
      { eyebrow: "New in", heading: "The latest drop" },
    ),
    {
      type: "stride-feature-callouts",
      settings: {
        eyebrow: "Performance fabric",
        heading: "Looks relaxed. Works hard.",
        product: "performance-jogger-pants",
        image: IMG.greyJoggers,
        image_alt: "Close-up of relaxed-fit grey joggers",
        blend: false,
        backdrop_word: "Flex",
        button_label: "Shop joggers",
        color_scheme: "default",
      },
      blocks: [
        { type: "feature", settings: { icon: "droplets", title: "Sweat-wicking", text: "Pulls moisture away so you stay dry through humid sessions." } },
        { type: "feature", settings: { icon: "move", title: "4-way stretch", text: "Moves with you through squats, lunges and long commutes." } },
        { type: "feature", settings: { icon: "wind", title: "Breathable", text: "Lightweight weave built for Bangladeshi summers." } },
        { type: "feature", settings: { icon: "shirt", title: "Holds its shape", text: "No bagging at the knees, wash after wash." } },
      ],
    },
    {
      type: "stride-athlete",
      settings: {
        image: IMG.fitnessClass,
        image_alt: "Women doing a group workout on yoga mats",
        image_position: "right",
        eyebrow: "Community",
        quote: "We train together every Saturday. The kit has to look good at brunch too.",
        name: "Studio Crew",
        discipline: "Run club & HIIT · Gulshan",
        text: "Our Saturday crew tests every piece before it hits the shop — sweat, stretch and a lot of laundry.",
        button_label: "Shop the crew's picks",
        button_link: "/collections/activewear",
        button_style: "light",
        kit_heading: "Their essentials",
        kit_collection: "activewear",
        kit_limit: 3,
        color_scheme: "inverse",
        padding: "none",
      },
      blocks: stats([
        ["40+", "Members"],
        ["Every", "Saturday"],
        ["5 km", "Warm-up run"],
      ]),
    },
    trustStrip([
      ["rotate-ccw", "Free size exchange", "Within 7 days"],
      ["banknote", "Cash on delivery", "All 64 districts"],
      ["truck", "Fast delivery", "Dhaka in 24–48 hours"],
      ["leaf", "Better fabrics", "Recycled blends"],
    ]),
    testimonials(
      [
        ["The joggers are the comfiest thing I own. Wore them to the gym and straight to class.", "Mehjabin R.", "Dhaka", IMG.avatar1],
        ["Size exchange was painless — courier picked up the old pair the same day.", "Arif H.", "Khulna", IMG.avatar2],
        ["Finally activewear that handles the humidity. Ordering the set in black next.", "Tasnim F.", "Chattogram", IMG.avatar3],
      ],
      "Worn, washed, loved",
    ),
    { type: "blog-posts", settings: { eyebrow: "Journal", heading: "Style & training notes", limit: 3, columns: 3 } },
  ]);
}

export function fitnessIndex(): SectionList {
  return sectionList([
    {
      type: "stride-hero",
      settings: {
        image: IMG.liftDark,
        image_alt: "Athlete gripping a barbell in a dark gym",
        overlay: 30,
        eyebrow: "Home gym season",
        subheading: "Dumbbells, kettlebells, mats and recovery gear — genuine equipment delivered to your door with cash on delivery.",
        headline_size: "large",
        align: "left",
        height: "large",
        button_label: "Build your home gym",
        button_link: "/collections/gym-training",
        button_style: "accent",
        button2_label: "Recovery & yoga",
        button2_link: "/collections/yoga",
        button2_style: "secondary",
        show_ticker: true,
      },
      blocks: [
        ...lines([["Stronger", "solid"], ["every", "outline"], ["day", "accent"]]),
        ...stats([
          ["64", "Districts delivered"],
          ["COD", "Pay on delivery"],
          ["1-yr", "Equipment warranty"],
          ["Free", "Setup advice"],
        ]),
      ],
    },
    trustStrip([
      ["badge-check", "Genuine equipment", "Warranty on every piece"],
      ["banknote", "Cash on delivery", "Pay when it arrives"],
      ["truck", "Heavy-item delivery", "To your door, nationwide"],
      ["headset", "Coach support", "Free programming advice"],
    ]),
    sportTiles(
      [
        ["gym-training", "Strength", "Dumbbells, bars & plates", IMG.dumbbellHand, "Hand gripping a dumbbell on a rack"],
        ["yoga", "Recovery", "Mats, bands & mobility", IMG.yogaMat, "Rolled yoga mats in soft light"],
        ["running", "Cardio", "Run & ride", IMG.runStairs, "Runner climbing concrete stairs"],
      ],
      { eyebrow: "Train at home", heading: "Build your routine", feature_first: false },
    ),
    tabs(
      [
        ["Strength", "gym-training"],
        ["Recovery", "yoga"],
        ["Cardio", "running"],
      ],
      { eyebrow: "Coach-approved", heading: "Equipment that lasts" },
    ),
    {
      type: "stride-feature-callouts",
      settings: {
        eyebrow: "Space-saving strength",
        heading: "A full rack in one pair",
        product: "adjustable-dumbbell-pair",
        image: IMG.bandsDumbbells,
        image_alt: "Dumbbells and a resistance band on a wooden floor",
        blend: false,
        backdrop_word: "Power",
        button_label: "Shop dumbbells",
        color_scheme: "muted",
      },
      blocks: [
        { type: "feature", settings: { icon: "dumbbell", title: "2–24 kg each", text: "Dial the weight in seconds — replaces 15 pairs." } },
        { type: "feature", settings: { icon: "shield-check", title: "Steel plates", text: "Coated plates that won't chip your floor." } },
        { type: "feature", settings: { icon: "layers", title: "Compact tray", text: "Fits under a bed or beside the sofa." } },
        { type: "feature", settings: { icon: "award", title: "1-year warranty", text: "Replacement parts shipped nationwide." } },
      ],
    },
    {
      type: "stride-athlete",
      settings: {
        image: IMG.womanBarbell,
        image_alt: "Woman pressing a barbell overhead in a gym",
        image_position: "left",
        eyebrow: "Coach's corner",
        quote: "Consistency beats intensity. Three sessions a week, done well, changes everything.",
        name: "Coach Nabila",
        discipline: "Strength coach · Banani",
        text: "Nabila writes our free home-workout plans. Every plan uses equipment you can buy once and keep for years.",
        button_label: "Get the free plan",
        button_link: "/blog",
        button_style: "light",
        kit_heading: "Her home-gym picks",
        kit_products: ["cast-iron-kettlebell", "resistance-band-and-dumbbell-kit", "non-slip-yoga-mat-6-mm"],
        kit_limit: 3,
        color_scheme: "inverse",
        padding: "none",
      },
      blocks: stats([
        ["3×", "A week"],
        ["45", "Minute sessions"],
        ["12", "Week plan"],
      ]),
    },
    testimonials(
      [
        ["The adjustable dumbbells replaced a whole rack in my flat. Delivery guys carried them up five floors!", "Imran K.", "Dhaka", IMG.avatar2],
        ["Yoga mat is thick, grippy and doesn't smell. Great for my knees.", "Farhana R.", "Rajshahi", IMG.avatar1],
        ["Coach's free plan plus the kettlebell — best money I've spent this year.", "Sadia K.", "Sylhet", IMG.avatar3],
      ],
      "Real results at home",
    ),
    { type: "blog-posts", settings: { eyebrow: "Free plans", heading: "Workouts & nutrition", limit: 3, columns: 3 } },
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "stacked", image_ratio: "portrait", media_width: "medium", zoom: true, sticky_info: true, sticky_atc: true, show_breadcrumbs: true, padding: "small" },
      blocks: [
        { type: "vendor" },
        { type: "title" },
        { type: "rating" },
        { type: "price", settings: { show_tax_note: true, tax_note: "VAT included. Delivery calculated at checkout." } },
        { type: "variant_picker", settings: { style: "buttons" } },
        { type: "stock", settings: { threshold: 5 } },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true, buy_now_style: "secondary" } },
        { type: "fit_feel" },
        { type: "delivery_info" },
        { type: "trust" },
        { type: "description", settings: { collapsed: false } },
        { type: "collapsible_tab", settings: { heading: "Size & fit", icon: "shirt", content: "<p>Our trainers run true to size. Between sizes or wide feet? Go half a size up. Apparel is athletic fit — size up for a relaxed feel.</p>" } },
        { type: "collapsible_tab", settings: { heading: "Delivery & returns", icon: "truck" } },
        { type: "share" },
      ],
    },
    marquee("Free size exchange, Cash on delivery, 64 districts, 100% genuine", { size: "small", speed: 45 }),
    { type: "product-reviews", settings: { heading: "Athlete reviews" } },
    { type: "related-products", settings: { heading: "Complete the kit", layout: "carousel", limit: 8, columns: 4 } },
  ]);
}

const bestSellers = (heading: string, eyebrow = "Popular"): SectionSpec => tabs([["Best sellers", ""]], { eyebrow, heading, limit: 8, padding: "small" });

export function templates(index: SectionList): ThemeConfig["templates"] {
  return {
    index,
    product: productTemplate(),
    collection: sectionList([{ type: "main-collection", settings: { show_banner: true, show_description: true, filters: "sidebar", show_sort: true, per_page: 24, columns: 4 } }]),
    collections: sectionList([
      sportTiles(
        [
          ["running", "Running", "Road, track & trail", IMG.sprint, "Sprinter in starting blocks"],
          ["gym-training", "Gym & training", "Strength & conditioning", IMG.deadlift, "Athlete lifting a barbell"],
          ["football-cricket", "Football & cricket", "Match-day ready", IMG.batsman, "Cricket batsman playing a drive"],
        ],
        { eyebrow: "Shop", heading: "Pick your sport", link_label: "", padding: "small" },
      ),
      { type: "main-collections-list", settings: { heading: "All collections" } },
    ]),
    search: sectionList([{ type: "main-search", settings: { columns: 4 } }, bestSellers("Trending right now", "Trending")]),
    cart: sectionList([{ type: "main-cart", settings: { heading: "Your bag" } }, bestSellers("Complete your kit", "Before you go")]),
    page: sectionList([{ type: "main-page" }, marquee("Run, Lift, Play, Recover", { size: "small" })]),
    blog: sectionList([{ type: "main-blog", settings: { heading: "Training journal", subheading: "Guides, plans and gear reviews from our coaches and athletes." } }]),
    article: sectionList([{ type: "main-article" }, bestSellers("Gear from this story", "Shop the story")]),
    account: sectionList([{ type: "main-account" }]),
    "404": sectionList([
      { type: "main-404", settings: { heading: "Off track", text: "This page doesn't exist or has moved. Search the shop or pick a sport below." } },
      sportTiles(
        [
          ["running", "Running", "", IMG.sprint, "Sprinter on a track"],
          ["gym-training", "Gym", "", IMG.deadlift, "Barbell lift"],
          ["football-cricket", "Football & cricket", "", IMG.batsman, "Cricket batsman"],
        ],
        { eyebrow: "", heading: "Get back in the game", feature_first: false, show_count: false, padding: "small" },
      ),
    ]),
  };
}

/* ─────────────────────────── exports used by index.ts ─────────────────────────── */

const SPORT_PERKS: [string, string][] = [
  ["zap", "Early access to every drop"],
  ["percent", "Members-only prices"],
  ["trophy", "Free training plans"],
];

export const sportsHeader = () =>
  headerGroup(["Free delivery over ৳3,000", "Cash on delivery in all 64 districts", "7-day free size exchange", "100% genuine gear"], {
    image: IMG.womanBarbell,
    eyebrow: "New season",
    heading: "Train harder in lighter kit",
    link: "/collections/activewear",
  });
export const sportsFooter = () => footerGroup("Performance gear for every sport — delivered across all 64 districts with cash on delivery.", SPORT_PERKS);

export const activewearHeader = () =>
  headerGroup(["New activewear drop", "Free size exchange within 7 days", "Cash on delivery nationwide"], {
    image: IMG.yellowTracksuit,
    eyebrow: "Just dropped",
    heading: "The Studio collection",
    link: "/collections/activewear",
  });
export const activewearFooter = () =>
  footerGroup("Activewear made for Bangladeshi weather — sweat-wicking, breathable and built to last.", [
    ["zap", "First look at new drops"],
    ["percent", "Members-only prices"],
    ["rotate-ccw", "Free size exchange"],
  ], "outline");

export const fitnessHeader = () =>
  headerGroup(["Genuine equipment with warranty", "Heavy items delivered to your door", "Cash on delivery nationwide"], {
    image: IMG.kettlebellSwing,
    eyebrow: "Home gym",
    heading: "Everything for a home workout",
    link: "/collections/gym-training",
  });
export const fitnessFooter = () =>
  footerGroup("Genuine fitness equipment, recovery gear and free coach-written plans — delivered nationwide.", [
    ["trophy", "Free workout plans"],
    ["percent", "Members-only prices"],
    ["headset", "Coach support"],
  ]);
