/**
 * Artisan defaults: header/footer groups and every template. Section ids are deterministic
 * (see `sectionList`) so the customizer and storefront agree on ids for theme defaults.
 *
 * Collections and products referenced below match the seeded handicraft catalogue (`artisan-demo`);
 * every Artisan section falls back gracefully (missing product → hidden card, missing collection →
 * /collections/all) when a slug doesn't exist in a store.
 */
import type { SectionList } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG, WORKSHOP_GALLERY } from "./images";

/* ─────────────────────────── groups ─────────────────────────── */

export function headerGroup(messages: string[], opts: { background?: string; note?: string; tagline?: string } = {}): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      settings: { background: opts.background ?? "#3a2a20", note: opts.note ?? "made slowly, by hand", link_label: "Visit the workshop", link: "/pages/about", show_social: false },
      blocks: messages.map((text) => ({ type: "announcement", settings: { text } })),
    },
    { type: "header", settings: { layout: "centered", tagline: opts.tagline ?? "handmade in Bangladesh", show_search: true, show_account: true, cart_label: "Basket", sticky: true, show_hem: true } },
  ]);
}

export function footerGroup(letter: { eyebrow: string; heading: string; text: string; stamp?: string }, about: string, impact = "62% of every sale is paid directly to the maker"): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { color_scheme: "primary", story_line: "Made by hand in Bangladesh", signoff: "with love from the workshop" },
      blocks: [
        { type: "newsletter", settings: { ...letter, button_label: "Send me letters", stamp_image: letter.stamp ?? "", postmark: "Dhaka · GPO" } },
        { type: "brand", settings: { text: about, impact } },
        { type: "link_list", settings: { heading: "Shop", menu: "main" } },
        { type: "link_list", settings: { heading: "Help", menu: "footer" } },
        { type: "contact", settings: { heading: "Visit the workshop", address: "House 12, Road 4, Dhanmondi, Dhaka 1205", hours: "Sat – Thu, 10am – 7pm" } },
      ],
    },
  ]);
}

export const HANDICRAFT_ABOUT =
  "Handmade pottery, kantha, brass, jute and art from the craft villages of Bangladesh. We work directly with around 180 artisans and pay them fairly, up-front.";

/* ─────────────────────────── shared specs ─────────────────────────── */

const trust = (items: [string, string, string][], scheme = "default"): SectionSpec => ({
  type: "multicolumn",
  settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: scheme },
  blocks: items.map(([icon, title, text]) => ({ type: "column", settings: { icon, title, text } })),
});

const REGIONS = [
  { craft: "Nakshi kantha", region: "Jamalpur", x: 44, y: 23, text: "Old saris layered and quilted with running stitch into storytelling motifs — flowers, fish, the village pond.", image: IMG.rustBedspread, image_alt: "Rust-coloured quilt on a low bed", collection: "home-decor" },
  { craft: "Jamdani weaving", region: "Rupganj, Narayanganj", x: 57, y: 44, text: "Featherlight cotton with motifs woven in by hand on pit looms — a UNESCO-recognised tradition.", image: IMG.yarn, image_alt: "Hand-dyed yarn in many colours", collection: "" },
  { craft: "Brass & bell-metal", region: "Dhamrai", x: 46, y: 41, text: "Lost-wax casting and hand-hammered kansa, passed down through families of smiths.", image: IMG.metalsmith, image_alt: "A smith hammering a copper vessel", collection: "home-decor" },
  { craft: "Terracotta", region: "Rajshahi & Dhamrai", x: 20, y: 34, text: "River clay shaped into planters, tiles and water pots, fired in open kilns.", image: IMG.terracotta, image_alt: "Small terracotta vessels", collection: "pottery-ceramics" },
  { craft: "Shataranji", region: "Rangpur", x: 33, y: 17, text: "Flat-woven cotton rugs made on the floor without a loom, one weft at a time.", image: IMG.kilim, image_alt: "Striped hand-woven rug", collection: "home-decor" },
  { craft: "Shital pati", region: "Sylhet", x: 80, y: 24, text: "Cool-to-the-touch mats split and woven from murta cane — made for hot, humid nights.", image: "", image_alt: "", collection: "" },
  { craft: "Jute", region: "Mymensingh", x: 58, y: 27, text: "Golden fibre spun, braided and stitched into totes, baskets and rugs.", image: IMG.kraftTote, image_alt: "Kraft and jute tote bag", collection: "leather-bags" },
];

const regions = (heading: string, only?: number[], scheme = "muted"): SectionSpec => ({
  type: "craft-regions",
  settings: { eyebrow: "Where it's made", heading, subheading: "Every district has a craft it's known for. These are the villages and towns our pieces come from.", map_position: "left", color_scheme: scheme },
  blocks: (only ? only.map((i) => REGIONS[i]!) : REGIONS).map((r) => ({ type: "region", settings: r })),
});

const MAKERS = {
  rahima: { name: "Rahima Begum", craft: "Potter", region: "Bijoypur, Netrokona", years: 31, portrait: IMG.tinyPot, portrait_alt: "Fingertips reaching for small glazed pots on a cane tray", quote: "The clay tells me when it is ready.", collection: "pottery-ceramics" },
  karim: { name: "Abdul Karim", craft: "Copper & brass smith", region: "Dhamrai, Dhaka", years: 26, portrait: IMG.metalsmith, portrait_alt: "A smith hammering a copper vessel at his bench", quote: "A water jug takes ten thousand small blows.", collection: "home-decor" },
  shefali: { name: "Shefali Rani", craft: "Nakshi kantha embroiderer", region: "Jamalpur", years: 19, portrait: IMG.needleHands, portrait_alt: "Hands pulling a needle and thread through cloth", quote: "Every quilt carries a story from our village.", collection: "home-decor" },
  monir: { name: "Monir Hossain", craft: "Leather worker", region: "Hazaribagh, Dhaka", years: 14, portrait: IMG.leatherCraft, portrait_alt: "Hands tooling a piece of leather on a workbench", quote: "Good leather gets better every year you carry it.", collection: "leather-bags" },
  nasrin: { name: "Nasrin Akter", craft: "Painter", region: "Chattogram", years: 12, portrait: IMG.paintPalette, portrait_alt: "A painter's palette with a loaded brush", quote: "I paint the river the way my grandmother described it.", collection: "wall-art" },
};

const profiles = (keys: (keyof typeof MAKERS)[], heading = "Meet our *makers*", scheme = "muted"): SectionSpec => ({
  id: "artisan-profiles",
  type: "artisan-profiles",
  settings: {
    eyebrow: "The hands behind it",
    heading,
    subheading: "Around 180 artisans in 23 villages make everything we sell. These are a few of them — and the collections they make.",
    columns: keys.length >= 4 ? 4 : 3,
    link_label: "See their work",
    photo_note: "Workshop photos are illustrative.",
    color_scheme: scheme,
  },
  blocks: keys.map((k) => ({ type: "artisan", settings: MAKERS[k] })),
});

const impact = (heading = "What your order *makes possible*"): SectionSpec => ({
  type: "impact-numbers",
  settings: {
    eyebrow: "Fair by design",
    heading,
    text: "We publish what we pay. Makers set their own prices and are paid half up-front, the day an order is placed.",
    footnote: "numbers from our 2025 maker report",
    link_label: "How we work with makers",
    link: "/pages/about",
    color_scheme: "primary",
  },
  blocks: [
    { type: "stat", settings: { value: 180, suffix: "+", label: "artisans supported", note: "68% of them women" } },
    { type: "stat", settings: { value: 62, suffix: "%", label: "of every sale paid to makers", note: "the rest covers materials, delivery & us" } },
    { type: "stat", settings: { value: 23, suffix: "", label: "villages across 9 districts", note: "from Rangpur to Rupganj" } },
    { type: "stat", settings: { value: 11, suffix: "", label: "years of working together", note: "since 2014" } },
  ],
});

const process = (o: { heading: string; text: string; lead: string; note: string; steps: [string, string, string, string][]; button?: string }): SectionSpec => ({
  type: "made-to-order",
  settings: {
    eyebrow: "Made to order",
    heading: o.heading,
    text: o.text,
    lead_time: o.lead,
    lead_note: o.note,
    style: "icons",
    button_label: o.button ?? "Start a custom order",
    button_link: "/pages/contact",
    button_style: "primary",
    color_scheme: "default",
  },
  blocks: o.steps.map(([icon, title, text, duration]) => ({ type: "step", settings: { icon, title, text, duration } })),
});

const gallery = (heading: string, items: { image: string; caption: string; alt: string; product?: string; shape?: string }[], sub?: string): SectionSpec => ({
  type: "gallery-grid",
  settings: {
    eyebrow: "From the workshop floor",
    heading,
    subheading: sub ?? "Clay drying in the sun, copper under the hammer, thread on the needle — a look inside the workshops we work with.",
    columns: 4,
    caption_style: "hand",
    matted: true,
    button_label: "Read our maker stories",
    button_link: "/blog",
    button_style: "secondary",
  },
  blocks: items.map((g) => ({ type: "image", settings: { image: g.image, alt: g.alt, caption: g.caption, product: g.product ?? "", shape: g.shape ?? "auto" } })),
});

/* ─────────────────────────── home pages ─────────────────────────── */

export function handicraftIndex(): SectionList {
  return sectionList([
    {
      type: "artisan-hero",
      settings: {
        layout: "framed",
        image: IMG.potteryWheel,
        image_alt: "A potter's clay-covered hands shaping a pot on the wheel",
        image_2: IMG.handmadeCups,
        image_2_alt: "Hand-pinched cups stacked to dry",
        polaroid_caption: "drying day, Bijoypur",
        eyebrow: "New from the workshops · Spring",
        heading: "Made slowly, *by hand*, in Bangladesh",
        text: "Pottery, nakshi kantha, hammered copper and jute from the craft villages of Bangladesh — every piece signed by the maker who made it, and paid for fairly.",
        note: "each piece is one of a kind",
        button_label: "Shop the collection",
        button_link: "/collections/all",
        button_style: "primary",
        button2_label: "Meet the makers",
        button2_link: "#section-artisan-profiles",
        button2_style: "link",
        tag_title: "Stoneware vase, no. 14",
        tag_text: "Bijoypur clay · wood-fired · 3 days",
      },
    },
    trust(
      [
        ["scissors", "Handmade, one at a time", "By 180+ artisans in 23 villages"],
        ["heart", "62% paid to makers", "Half of it up-front"],
        ["banknote", "Cash on delivery", "Or bKash & Nagad"],
        ["truck", "All 64 districts", "Dhaka in 2 days, elsewhere 3–5"],
      ],
      "muted",
    ),
    { type: "collection-list", settings: { eyebrow: "Browse by craft", heading: "Five crafts, one workshop", heading_align: "left", limit: 5, card_style: "below", image_ratio: "portrait", columns: 5 } },
    { type: "featured-collection", settings: { eyebrow: "Just out of the kiln", heading: "New from the workshop", heading_align: "left", source: "newest", limit: 8, columns: 4, layout: "carousel" } },
    {
      type: "maker-story",
      settings: {
        image: IMG.potteryStudio,
        image_alt: "Rahima's clay-crusted trimming tools and sponge beside her kick-wheel",
        image_caption: "Bijoypur, Netrokona — her tools, beside the kick-wheel she inherited from her mother",
        image_ratio: "tall",
        image_position: "left",
        eyebrow: "Meet the maker",
        heading: "Thirty-one years at the *same wheel*",
        story:
          "<p>Rahima Begum learned to centre clay before she learned to write her name. Her mother threw water pots for the Bijoypur market; Rahima now throws the speckled vases and cups you see here — on the same kick-wheel, from the same white clay dug a few fields from her home.</p><p>Each pot is thrown, left to firm up overnight, trimmed by hand and wood-fired alongside her neighbours' work. No two come out of the kiln alike: the ash and the flame decide the glaze. When you order one of her pieces, half the price reaches her the same week.</p>",
        quote: "The clay tells me when it is ready. I only have to listen.",
        signature: "Rahima Begum",
        role: "Potter · Bijoypur, Netrokona",
        product: "hand-thrown-stoneware-vase-set",
        button_label: "Shop Rahima's pottery",
        button_link: "/collections/pottery-ceramics",
        button_style: "secondary",
      },
      blocks: [
        { type: "fact", settings: { label: "Craft", value: "Wood-fired stoneware" } },
        { type: "fact", settings: { label: "Years at the wheel", value: "31" } },
        { type: "fact", settings: { label: "Pieces a week", value: "About 40" } },
      ],
    },
    regions("A map of *living crafts*"),
    process({
      heading: "From our makers' hands *to yours*",
      text: "Most pieces are made after you order — that's how we keep waste low and pay makers for every hour they work.",
      lead: "Ready in 3–4 weeks",
      note: "from the day you order · we'll send photos while it's being made",
      steps: [
        ["messages-square", "You choose", "Pick a piece, size and colour — or message us an idea on WhatsApp.", "Day 1"],
        ["pencil-ruler", "We brief the maker", "Your order goes straight to the artisan's village with half the price.", "Days 2–3"],
        ["hand", "Made by hand", "Thrown, stitched or hammered by one maker, start to finish.", "2–3 weeks"],
        ["package", "Wrapped & sent", "Packed in jute and kraft paper, delivered to your door. Pay on delivery.", "2–4 days"],
      ],
    }),
    profiles(["rahima", "karim", "shefali", "monir"]),
    { type: "featured-collection", settings: { eyebrow: "Originals & prints", heading: "For the walls", heading_align: "left", source: "collection", collection: "wall-art", limit: 4, columns: 4, layout: "grid" } },
    impact(),
    gallery("Where every piece *begins*", [
      { ...WORKSHOP_GALLERY[0]!, product: "hand-thrown-stoneware-vase-set" },
      { ...WORKSHOP_GALLERY[1]!, product: "speckled-ceramic-cup-set-4" },
      { ...WORKSHOP_GALLERY[2]!, product: "hammered-copper-water-jug" },
      WORKSHOP_GALLERY[3]!,
      { ...WORKSHOP_GALLERY[4]!, product: "terracotta-planter-with-cactus" },
      WORKSHOP_GALLERY[5]!,
      WORKSHOP_GALLERY[6]!,
      WORKSHOP_GALLERY[7]!,
    ]),
    { type: "blog-posts", settings: { eyebrow: "Letters & stories", heading: "From the maker journal", heading_align: "left", limit: 3, columns: 3 } },
  ]);
}

export function homeIndex(): SectionList {
  return sectionList([
    {
      type: "artisan-hero",
      settings: {
        layout: "full",
        image: IMG.macrameRoom,
        image_alt: "A warm living room with a macramé wall hanging above the sofa",
        eyebrow: "Home, made by hand",
        heading: "Rooms that *tell a story*",
        text: "Kantha throws, shataranji rugs, copper and clay — handmade homeware from Bangladesh's craft villages, made to order for your space.",
        note: "made to order in 3–4 weeks",
        button_label: "Shop home decor",
        button_link: "/collections/home-decor",
        button_style: "primary",
        button2_label: "How it's made",
        button2_link: "#section-made-to-order",
        button2_style: "link",
        overlay: 10,
        height: "large",
        color_scheme: "default",
      },
    },
    trust([
      ["ruler", "Made to your size", "Custom lengths & colours"],
      ["scissors", "Handmade in Bangladesh", "By named makers"],
      ["truck", "Free delivery over ৳5,000", "All 64 districts"],
      ["banknote", "Pay on delivery", "Or bKash & Nagad"],
    ], "muted"),
    { type: "featured-collection", settings: { eyebrow: "The home edit", heading: "Textiles, clay & copper", heading_align: "left", source: "collection", collection: "home-decor", limit: 8, columns: 4, layout: "carousel" } },
    gallery(
      "Handmade, *at home*",
      [
        { image: IMG.bohoRoom, caption: "Low lights, woven textures", alt: "Living room with woven textiles and plants" },
        { image: IMG.rustBedspread, caption: "Kantha on the bed", alt: "Rust quilt on a low wooden bed", product: "nakshi-kantha-bedspread" },
        { image: IMG.galleryWall, caption: "A wall of prints", alt: "Framed prints on picture shelves" },
        { image: IMG.kilim, caption: "Shataranji underfoot", alt: "Striped hand-woven rug" },
        { image: IMG.macrameRoom, caption: "Knotted by hand", alt: "Macramé wall hanging above a sofa", product: "macrame-wall-hanging" },
        { image: IMG.ceramicsTable, caption: "Set for supper", alt: "Handmade plates and bowls on a table", product: "glazed-dinner-plates-set-of-4" },
        { image: IMG.bedroomBoho, caption: "Soft mornings", alt: "Bright bedroom with plants and textiles" },
        { image: IMG.whiteVase, caption: "One stem is enough", alt: "White vase on a marble plinth", product: "minimal-bud-vase" },
      ],
      "Real rooms, real pieces — how our customers live with handmade.",
    ),
    {
      type: "maker-story",
      settings: {
        image: IMG.needleHands,
        image_alt: "Hands pulling a needle through cloth",
        image_caption: "Jamalpur — kantha is stitched in the afternoons, after the housework",
        image_ratio: "portrait",
        image_position: "right",
        eyebrow: "Meet the maker",
        heading: "A quilt is *a family diary*",
        story:
          "<p>Shefali Rani stitches with eleven women from her para in Jamalpur. A single nakshi kantha bedspread takes the group around six weeks: layers of soft cotton are tacked together, the motifs are drawn freehand, then filled with thousands of tiny running stitches.</p><p>The patterns are never repeated exactly. Shefali's are full of the things she sees each day — lotus leaves, fish, the boats on the Brahmaputra.</p>",
        quote: "Every quilt carries a story from our village.",
        signature: "Shefali Rani",
        role: "Nakshi kantha · Jamalpur",
        product: "nakshi-kantha-bedspread",
        button_label: "Shop kantha & textiles",
        button_link: "/collections/home-decor",
        button_style: "secondary",
      },
      blocks: [
        { type: "fact", settings: { label: "Stitchers", value: "12 women" } },
        { type: "fact", settings: { label: "One bedspread", value: "~6 weeks" } },
        { type: "fact", settings: { label: "Stitches", value: "≈ 90,000" } },
      ],
    },
    {
      ...process({
        heading: "Made for *your* room",
        text: "Tell us your size and colours and the maker will make it for you — no minimums, no mark-up for custom work.",
        lead: "Ready in 3–4 weeks",
        note: "from your approved sketch · we'll send progress photos",
        steps: [
          ["ruler", "Measure your space", "Send us the size and a photo of the room.", "Day 1"],
          ["pencil-ruler", "Approve a sketch", "The maker suggests motifs and colours.", "Days 2–4"],
          ["hand", "Made by hand", "Stitched, woven or thrown for you alone.", "2–3 weeks"],
          ["truck", "Delivered & styled", "Free delivery over ৳5,000, anywhere in Bangladesh.", "2–4 days"],
        ],
        button: "Request a custom size",
      }),
      id: "made-to-order",
    },
    { type: "featured-collection", settings: { eyebrow: "Originals & prints", heading: "For the walls", heading_align: "left", source: "collection", collection: "wall-art", limit: 4, columns: 4, layout: "grid", color_scheme: "muted" } },
    regions("Where your *home* is made", [0, 4, 2, 3, 6]),
    impact("Every room, *a livelihood*"),
    { type: "blog-posts", settings: { eyebrow: "Letters & stories", heading: "Living with handmade", heading_align: "left", limit: 3, columns: 3 } },
  ]);
}

export function giftsIndex(): SectionList {
  return sectionList([
    {
      type: "artisan-hero",
      settings: {
        layout: "framed_left",
        image: IMG.giftHands,
        image_alt: "Hands holding out a gift wrapped in kraft paper and twine",
        image_2: IMG.candles,
        image_2_alt: "Two amber glass soy candles",
        polaroid_caption: "wrapped by hand",
        eyebrow: "Gifts with a maker's name",
        heading: "Gifts with *a story* inside",
        text: "Candles, soaps, mugs and keepsakes made by hand in Bangladesh — wrapped in kraft paper with a handwritten card, free.",
        note: "we'll write your card by hand",
        button_label: "Shop gifts",
        button_link: "/collections/candles-soaps",
        button_style: "primary",
        button2_label: "Personalise a gift",
        button2_link: "#section-made-to-order",
        button2_style: "link",
        tag_title: "Gift no. 208",
        tag_text: "Soy candles · kraft wrap · note inside",
      },
    },
    trust([
      ["gift", "Free kraft gift wrap", "On every order"],
      ["mail", "Handwritten card", "Tell us what to write"],
      ["truck", "Send anywhere", "All 64 districts"],
      ["banknote", "Pay on delivery", "Or bKash & Nagad"],
    ], "muted"),
    { type: "featured-collection", settings: { eyebrow: "Little luxuries", heading: "Candles, soaps & small joys", heading_align: "left", source: "collection", collection: "candles-soaps", limit: 4, columns: 4, layout: "grid" } },
    { type: "collection-list", settings: { eyebrow: "Gifts by craft", heading: "Find the right gift", heading_align: "left", limit: 5, card_style: "below", image_ratio: "portrait", columns: 5 } },
    {
      ...process({
        heading: "Personalised, *by hand*",
        text: "Initials stamped into leather, a name painted on a mug, a date stitched into a kantha — tell us and the maker does the rest.",
        lead: "Ready in 10–14 days",
        note: "plan ahead for Eid, weddings and birthdays",
        steps: [
          ["gift", "Pick a gift", "Choose any piece marked “can be personalised”.", "Day 1"],
          ["pencil-ruler", "Tell us the words", "A name, a date or a line of poetry — in Bangla or English.", "Day 1"],
          ["hand", "The maker adds it", "Stamped, painted or stitched by hand.", "7–10 days"],
          ["mail", "Wrapped with a card", "Kraft paper, twine and your note, written by hand.", "2–4 days"],
        ],
        button: "Personalise a gift",
      }),
      id: "made-to-order",
    },
    { type: "featured-collection", settings: { eyebrow: "Most gifted", heading: "Loved, then given again", heading_align: "left", source: "best-selling", limit: 8, columns: 4, layout: "carousel", color_scheme: "muted" } },
    profiles(["rahima", "monir", "nasrin"], "The makers behind *your gift*", "default"),
    impact("Every gift, *twice given*"),
    gallery("Wrapped with *care*", [
      { image: IMG.giftHands, caption: "Kraft & twine", alt: "Gift wrapped in kraft paper" },
      { image: IMG.candles, caption: "Poured in small batches", alt: "Amber glass candles", product: "amber-glass-soy-candles-set-of-2" },
      { image: IMG.soaps, caption: "Cut by hand", alt: "Stack of handmade soaps", product: "organic-handmade-soap-trio" },
      { image: IMG.speckledCups, caption: "Cups for two", alt: "Speckled ceramic cups", product: "speckled-ceramic-cup-set-4" },
      { image: IMG.leatherCraft, caption: "Initials, stamped", alt: "Hands tooling leather" },
      { image: IMG.birdPrint, caption: "A print for her wall", alt: "Illustrated print of birds on a branch" },
    ], "Every order leaves the workshop wrapped by hand."),
    {
      type: "faq",
      settings: { heading: "Gifting, answered", heading_align: "left" },
      blocks: [
        { type: "question", settings: { question: "Is gift wrapping really free?", answer: "<p>Yes — every order is wrapped in kraft paper and jute twine with a handwritten card at no extra cost. Add your message in the order note at checkout.</p>" } },
        { type: "question", settings: { question: "Can I send a gift to someone in another city?", answer: "<p>Of course. We deliver to all 64 districts. Choose cash on delivery only if the recipient knows to expect it — otherwise pay with bKash, Nagad or card.</p>" } },
        { type: "question", settings: { question: "Will the price be on the parcel?", answer: "<p>Never. Gift orders ship without an invoice inside; we email it to you instead.</p>" } },
      ],
    },
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "thumbnails-left", image_ratio: "portrait", media_width: "medium", zoom: true, sticky_info: true, sticky_atc: true, show_breadcrumbs: true, color_scheme: "default" },
      blocks: [
        { type: "title" },
        { type: "price", settings: { show_tax_note: false } },
        { type: "maker", settings: { label: "made by", time_taken: "Made start to finish by one maker", link_label: "Meet the makers", link: "/pages/about" } },
        { type: "variant_picker", settings: { style: "buttons" } },
        { type: "stock" },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true, buy_now_style: "secondary" } },
        { type: "made_to_order" },
        { type: "trust", settings: { icon_1: "banknote", text_1: "Cash on delivery", icon_2: "heart", text_2: "62% paid to the maker", icon_3: "truck", text_3: "All 64 districts" } },
        { type: "description", settings: { collapsed: false } },
        { type: "collapsible_tab", settings: { heading: "Delivery & returns", icon: "truck" } },
        { type: "share" },
      ],
    },
    {
      type: "maker-story",
      settings: {
        image: IMG.ceramicsTable,
        image_alt: "Handmade plates, cups and wooden boards on a workshop table",
        image_caption: "Glaze-test day at one of the 23 workshops we buy from",
        image_ratio: "portrait",
        image_position: "left",
        eyebrow: "Why it costs what it does",
        heading: "Slow work, *fair pay*",
        story:
          "<p>Everything we sell is made by hand by a named maker — never in a factory. Makers set their own prices; we add only what it costs to photograph, pack and deliver their work, and publish the split every year.</p><p>That's why no two pieces are identical, and why most are made after you order.</p>",
        quote: "Handmade takes longer. That's the point.",
        signature: "The workshop team",
        role: "Dhanmondi, Dhaka",
        product: "",
        button_label: "How we work with makers",
        button_link: "/pages/about",
        button_style: "secondary",
        color_scheme: "muted",
        padding: "medium",
      },
      blocks: [
        { type: "fact", settings: { label: "Paid to makers", value: "62%" } },
        { type: "fact", settings: { label: "Paid up-front", value: "50%" } },
        { type: "fact", settings: { label: "Villages", value: "23" } },
      ],
    },
    { type: "product-reviews", settings: { heading: "Notes from customers" } },
    { type: "related-products", settings: { heading: "More from the workshop", limit: 4 } },
  ]);
}

export function templates(): Record<string, SectionList> {
  return {
    product: productTemplate(),
    collection: sectionList([
      { type: "main-collection", settings: { show_banner: true, show_description: true, filters: "sidebar", show_sort: true, per_page: 24, columns: 3, mobile_columns: "2" } },
      trust(
        [
          ["scissors", "Handmade", "One maker, start to finish"],
          ["heart", "Fair pay", "62% goes to the maker"],
          ["banknote", "Cash on delivery", "Or bKash & Nagad"],
          ["rotate-ccw", "7-day returns", "On ready-made pieces"],
        ],
        "muted",
      ),
    ]),
    collections: sectionList([
      { type: "main-collections-list", settings: { heading: "Browse by craft", card_style: "below", columns: 3 } },
      regions("A map of *living crafts*", [0, 2, 3, 4, 6]),
    ]),
    search: sectionList([
      { type: "main-search", settings: { columns: 4 } },
      { type: "featured-collection", settings: { heading: "Loved this month", heading_align: "left", source: "best-selling", limit: 4, columns: 4, color_scheme: "muted" } },
    ]),
    cart: sectionList([
      { type: "main-cart", settings: { heading: "Your basket" } },
      { type: "featured-collection", settings: { eyebrow: "Small & handmade", heading: "Something to add?", heading_align: "left", source: "collection", collection: "candles-soaps", limit: 4, columns: 4 } },
    ]),
    page: sectionList([{ type: "main-page" }]),
    blog: sectionList([
      { type: "main-blog", settings: { heading: "The maker journal", subheading: "Stories from the villages, care guides and notes from the workshop floor.", feature_first: true } },
      profiles(["rahima", "karim", "shefali", "monir"], "The people in *these stories*", "muted"),
    ]),
    article: sectionList([
      { type: "main-article", settings: { show_cover: true, show_share: true } },
      { type: "featured-collection", settings: { heading: "Pieces from this story", heading_align: "left", source: "newest", limit: 4, columns: 4, color_scheme: "muted" } },
    ]),
    account: sectionList([
      { type: "main-account", settings: { login_heading: "Welcome back to the workshop", register_heading: "Join the workshop", register_text: "Track orders, follow your custom pieces as they're made and get letters from our makers." } },
    ]),
    "404": sectionList([
      { type: "main-404", settings: { heading: "This thread came loose", text: "The page you're looking for has moved or never existed. Let's find you something handmade instead.", show_products: true } },
    ]),
  };
}
