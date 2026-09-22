/**
 * Lumière defaults: header/footer groups and every template. Section ids are deterministic
 * (see `sectionList`) so the customizer and storefront agree on ids for theme defaults.
 *
 * Collections and products referenced below match the seeded jewellery catalogue (`lumiere-demo`):
 * collections rings, necklaces, earrings, bracelets-bangles, watches, bridal. Every Lumière
 * section falls back (collection → tag → price range → best sellers) when a slug doesn't exist.
 */
import type { SectionList } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG } from "./images";

/* ─────────────────────────── groups ─────────────────────────── */

export function headerGroup(
  messages: string[],
  o: { transparent?: boolean; tagline?: string; left?: string; appointment?: string } = {},
): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      settings: { background: "#0d0d0d", text_color: "#cdb07c", speed: 6, left_text: o.left ?? "Dhanmondi atelier · By appointment", left_link: "/pages/contact", show_phone: true },
      blocks: messages.map((text) => ({ type: "announcement", settings: { text } })),
    },
    {
      type: "header",
      settings: {
        menu: "main",
        tagline: o.tagline ?? "Fine jewellery · Dhaka · Est. 1998",
        wordmark_case: "caps",
        hairlines: true,
        icon_labels: false,
        appointment_label: o.appointment ?? "Book a private viewing",
        appointment_link: "/pages/contact",
        show_account: true,
        sticky: true,
        transparent_on_home: o.transparent ?? true,
      },
    },
  ]);
}

export function footerGroup(letter: { eyebrow: string; heading: string; text: string }, promise: string, note = "Maison de haute joaillerie · Dhaka"): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { color_scheme: "inverse", show_wordmark: true, wordmark_note: note, show_social: true, show_payment_icons: true },
      blocks: [
        { type: "newsletter", settings: { ...letter, button_label: "Subscribe" } },
        { type: "atelier", settings: { heading: "Visit our atelier", hours: "Saturday – Thursday, 11am – 8pm\nFriday by appointment", link_label: "Book a private appointment", link: "/pages/contact" } },
        { type: "link_list", settings: { heading: "Collections", menu: "main" } },
        { type: "link_list", settings: { heading: "Client care", menu: "footer" } },
        { type: "text", settings: { heading: "Our promise", text: `<p>${promise}</p>` } },
      ],
    },
  ]);
}

/* ─────────────────────────── shared specs ─────────────────────────── */

const promises = (items: [string, string, string][], scheme = "default"): SectionSpec => ({
  type: "multicolumn",
  settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: scheme },
  blocks: items.map(([icon, title, text]) => ({ type: "column", settings: { icon, title, text } })),
});

const JEWELRY_PROMISES: [string, string, string][] = [
  ["stamp", "Hallmarked gold", "22K & 18K, BSTI assayed"],
  ["shield-check", "Insured delivery", "Complimentary, all 64 districts"],
  ["repeat", "Lifetime exchange", "At today's gold rate"],
  ["sparkles", "Cleaning for life", "At our Dhanmondi atelier"],
];

const press = (quote: string): SectionSpec => ({
  type: "press-logos",
  settings: { eyebrow: "As seen in", show_quote: true, featured: 1, grayscale: true, padding: "medium" },
  blocks: [
    { type: "publication", settings: { name: "The Daily Star", style: "serif", quote } },
    { type: "publication", settings: { name: "Vogue India", style: "caps" } },
    { type: "publication", settings: { name: "Prothom Alo", style: "italic" } },
    { type: "publication", settings: { name: "Canvas", style: "caps" } },
    { type: "publication", settings: { name: "The Business Standard", style: "serif" } },
  ],
});

const appointment = (o: { eyebrow: string; heading: string; text: string; image: string; alt: string; button: string; scheme?: string; position?: string }): SectionSpec => ({
  type: "appointment-cta",
  settings: {
    eyebrow: o.eyebrow,
    heading: o.heading,
    text: o.text,
    image: o.image,
    image_alt: o.alt,
    image_position: o.position ?? "left",
    hours: "Saturday – Thursday · 11am – 8pm\nFriday · by appointment only",
    action: "whatsapp",
    whatsapp_message: "Hello Lumière, I'd like to book a private viewing at the atelier.",
    button_label: o.button,
    button_link: "/pages/contact",
    secondary_label: "Or write to us",
    color_scheme: o.scheme ?? "default",
    padding: "large",
  },
});

const journal = (heading = "Notes from the atelier"): SectionSpec => ({
  type: "blog-posts",
  settings: { eyebrow: "The Journal", heading, heading_align: "center", limit: 3, columns: 3 },
});

/* ─────────────────────────── home pages ─────────────────────────── */

export function jewelryIndex(): SectionList {
  return sectionList([
    {
      type: "lumiere-hero",
      settings: {
        image: IMG.templeNecklace,
        mobile_image: IMG.diamondBust,
        image_alt: "A 22K gold temple necklace and matching earrings resting on black velvet",
        eyebrow: "The Bridal Collection · 2026",
        heading: "Gold that remembers\nevery vow",
        text: "Hand-finished 22K temple sets, hallmarked and certified — made in our Dhaka atelier for the holud, the wedding and every anniversary after.",
        button_label: "Discover bridal",
        button_link: "/collections/bridal",
        button_style: "light",
        button2_label: "Book a private viewing",
        button2_link: "/pages/contact",
        button2_style: "link",
        height: "full",
        text_position: "center",
        overlay: 45,
        ken_burns: true,
        letterbox: true,
        scroll_cue: true,
        scroll_label: "Discover",
      },
    },
    promises(JEWELRY_PROMISES),
    {
      type: "collection-list",
      settings: {
        eyebrow: "The Maison",
        heading: "Explore the collections",
        heading_align: "center",
        collections: "bridal, rings, necklaces, earrings, bracelets-bangles, watches",
        limit: 6,
        card_style: "below",
        image_ratio: "portrait",
        columns: 6,
      },
    },
    {
      type: "collection-story",
      settings: { eyebrow: "In three chapters", heading: "Stories told in gold", subheading: "", heading_align: "center", image_ratio: "portrait", products: 3, show_numerals: true, padding: "large" },
      blocks: [
        {
          type: "chapter",
          settings: {
            image: IMG.bride,
            image_alt: "A bride in a red silk saree wearing layered 22K gold necklaces",
            eyebrow: "Chapter",
            title: "The Bridal Trousseau",
            text: "Temple motifs our karigars have carved for three generations — the lakshmi coin, the mango leaf, the lotus — set in 22K gold for the holud, the wedding and the bou-bhat.",
            collection: "bridal",
            link_label: "Discover bridal",
          },
        },
        {
          type: "chapter",
          settings: {
            image: IMG.ringsHands,
            image_alt: "Hands wearing slim gold rings and a fine bracelet against a white shirt",
            eyebrow: "Chapter",
            title: "Diamonds, Every Day",
            text: "Solitaires, halos and stacking bands in 18K gold — natural, certified diamonds made to be worn to work on a Tuesday, not locked away for a wedding.",
            collection: "rings",
            link_label: "Discover rings",
          },
        },
        {
          type: "chapter",
          settings: {
            image: IMG.dropNecklace,
            image_alt: "A single pearl pendant on a fine gold chain, worn with a white shirt",
            eyebrow: "Chapter",
            title: "Pearls & Fine Chains",
            text: "Freshwater pearls strung on silk, dainty chains and pavé pendants — the quiet pieces you forget you're wearing until someone asks.",
            collection: "necklaces",
            link_label: "Discover necklaces",
          },
        },
      ],
    },
    {
      type: "featured-collection",
      settings: { eyebrow: "The signature pieces", heading: "Most coveted this season", heading_align: "center", source: "best-selling", limit: 4, columns: 4, layout: "grid", color_scheme: "default" },
    },
    {
      type: "gift-guide",
      settings: { eyebrow: "The gift guide", heading: "Something to be kept forever", subheading: "Chosen by our advisers, wrapped by hand and delivered fully insured.", heading_align: "center", layout: "tabs", limit: 3, color_scheme: "default" },
      blocks: [
        { type: "guide", settings: { label: "For her", hint: "Pearls & pendants", image: IMG.pearlEarring, image_alt: "Close portrait of a pearl drop earring", text: "Pieces she'll wear every day — and hand down one day.", tag: "gift", link_label: "View the edit" } },
        { type: "guide", settings: { label: "Under ৳25,000", hint: "Thoughtful, not extravagant", image: IMG.hoopsShadow, image_alt: "Twisted gold hoops resting on a pale stone", text: "Hoops, studs and fine chains — real gold, beautifully boxed.", max_price: 25000, link_label: "Shop under ৳25,000" } },
        { type: "guide", settings: { label: "Bridal", hint: "Holud · Wedding · Bou-bhat", image: IMG.ringsFlowers, image_alt: "Two wedding rings resting on pink peonies", text: "Temple sets, bangles and the ring — for the three days that matter most.", collection: "bridal", link_label: "The bridal edit" } },
        { type: "guide", settings: { label: "For him", hint: "Watches & keepsakes", image: IMG.watchHand, image_alt: "A hand holding a minimalist wristwatch", text: "Automatic watches and heirlooms with a story.", collection: "watches", link_label: "The watch salon" } },
      ],
    },
    {
      type: "heritage-timeline",
      settings: { eyebrow: "Our heritage", heading: "Three generations at the bench", subheading: "From a two-seat workshop in Tanti Bazar to a salon in Dhanmondi — the same hands, the same standards.", heading_align: "center", alternate: true, show_images: true, button_label: "Our story", button_link: "/pages/about", color_scheme: "muted" },
      blocks: [
        { type: "milestone", settings: { year: "1998", title: "The first workbench", text: "Our founder opens a two-seat workshop in Old Dhaka's Tanti Bazar, making 22K wedding sets to order for neighbouring families.", image: IMG.metalsmith, image_alt: "A craftsman working at a metal bench surrounded by tools" } },
        { type: "milestone", settings: { year: "2006", title: "Hallmarked, always", text: "Every piece is independently assayed and stamped for purity — a promise we have never broken, and never will." } },
        { type: "milestone", settings: { year: "2015", title: "Certified diamonds", text: "We begin setting natural, certified diamonds in 18K gold, each stone sourced with its report and chosen under daylight.", image: IMG.workbench, image_alt: "Hands sketching a design at a craftsman's workbench" } },
        { type: "milestone", settings: { year: "2024", title: "The Dhanmondi atelier", text: "A quiet salon on Road 9 for private viewings, bridal fittings and bespoke commissions — tea is always on." } },
      ],
    },
    press("Dhaka's quietest luxury — jewellery made to be inherited, not merely worn."),
    appointment({
      eyebrow: "Private viewings",
      heading: "An hour, a cup of tea, and the piece that's meant for you",
      text: "Our advisers set aside the salon for you — try bridal sets at your own pace, see stones in daylight, or begin a bespoke commission. There is never any obligation.",
      image: IMG.ringTray,
      alt: "Diamond rings presented in an ivory velvet tray at the atelier",
      button: "Book via WhatsApp",
    }),
    journal(),
  ]);
}

export function fashionIndex(): SectionList {
  return sectionList([
    {
      type: "lumiere-hero",
      settings: {
        image: IMG.saree,
        image_alt: "A woman in a purple and gold silk saree against a deep red wall",
        eyebrow: "Autumn · Winter 2026",
        heading: "Dressed in quiet gold",
        text: "Statement earrings, fine chains and heirloom bangles styled with the season's silks — edited by our Gulshan studio.",
        button_label: "Shop the edit",
        button_link: "/collections/all",
        button_style: "light",
        button2_label: "Book a styling appointment",
        button2_link: "/pages/contact",
        button2_style: "link",
        height: "full",
        text_position: "bottom_left",
        overlay: 40,
        letterbox: false,
        scroll_cue: true,
        scroll_label: "Scroll",
      },
    },
    promises([
      ["truck", "Complimentary delivery", "Across Bangladesh"],
      ["scissors", "Studio alterations", "Free, at our Gulshan studio"],
      ["rotate-ccw", "7-day exchange", "Unworn, with tags"],
      ["banknote", "bKash, Nagad & cards", "Or cash on delivery"],
    ]),
    { type: "featured-collection", settings: { eyebrow: "Just arrived", heading: "New this season", heading_align: "center", source: "newest", limit: 8, columns: 4, layout: "carousel" } },
    {
      type: "collection-story",
      settings: { eyebrow: "The edit", heading: "How we're wearing it", heading_align: "center", image_ratio: "tall", products: 3, start_right: true },
      blocks: [
        { type: "chapter", settings: { image: IMG.earringsHeels, image_alt: "Gold statement earrings beside black heels on white fur", eyebrow: "Look", title: "After Dark", text: "One sculptural earring, black silk and nothing else — the evening needs no more.", collection: "earrings", link_label: "Shop earrings" } },
        { type: "chapter", settings: { image: IMG.layered, image_alt: "Layered fine gold chains worn with an open white shirt", eyebrow: "Look", title: "The Layered Collar", text: "Three fine chains at three lengths, over a crisp shirt from Monday to Friday.", collection: "necklaces", link_label: "Shop necklaces" } },
      ],
    },
    { type: "collection-list", settings: { eyebrow: "Shop by category", heading: "The wardrobe", heading_align: "center", limit: 4, card_style: "overlay", image_ratio: "portrait", columns: 4 } },
    press("A studio that styles gold the way Paris styles black — with restraint."),
    {
      type: "gift-guide",
      settings: { eyebrow: "Gifting", heading: "For every occasion", heading_align: "center", layout: "tiles" },
      blocks: [
        { type: "guide", settings: { label: "Eid", hint: "Festive gold", image: IMG.goldBangles, image_alt: "Stacked 22K gold bangles", tag: "22k" } },
        { type: "guide", settings: { label: "Under ৳25,000", hint: "Little luxuries", image: IMG.hoopsShadow, image_alt: "Gold hoops on a pale stone", max_price: 25000 } },
        { type: "guide", settings: { label: "Wedding season", hint: "For the bride", image: IMG.bride, image_alt: "A bride in red silk and gold jewellery", collection: "bridal" } },
      ],
    },
    appointment({
      eyebrow: "The studio",
      heading: "Book a personal styling hour",
      text: "Bring the outfit; we'll bring the gold. Our stylists pair jewellery to your saree, lehenga or suit — in the studio or over a video call.",
      image: IMG.ringNecklace,
      alt: "A woman in a black top wearing a gold pendant and ring",
      button: "Book via WhatsApp",
      scheme: "inverse",
      position: "right",
    }),
    journal("Style notes"),
  ]);
}

export function giftsIndex(): SectionList {
  return sectionList([
    {
      type: "lumiere-hero",
      settings: {
        image: IMG.goldBows,
        image_alt: "Gold satin ribbons tied into bows on black paper",
        eyebrow: "The gifting house",
        heading: "Wrapped in gold,\nremembered for life",
        text: "Fine jewellery and watches, hand-wrapped in our ivory box with a handwritten card — delivered insured, anywhere in Bangladesh.",
        button_label: "Open the gift guide",
        button_link: "#section-gift-guide",
        button_style: "light",
        button2_label: "Shop all gifts",
        button2_link: "/collections/all",
        button2_style: "link",
        height: "large",
        text_position: "center",
        overlay: 35,
        letterbox: true,
        scroll_cue: true,
      },
    },
    promises([
      ["gift", "Signature gift box", "Ivory box & gold ribbon, always"],
      ["pen-line", "Handwritten card", "Your words, by our calligrapher"],
      ["shield-check", "Insured delivery", "To any of 64 districts"],
      ["receipt", "Gift receipt", "No prices inside the box"],
    ]),
    {
      id: "gift-guide",
      type: "gift-guide",
      settings: { eyebrow: "The gift guide", heading: "Who are you celebrating?", subheading: "Four edits from our advisers — every piece wrapped by hand before it leaves the atelier.", heading_align: "center", layout: "tabs", limit: 3 },
      blocks: [
        { type: "guide", settings: { label: "For her", hint: "Pearls & pendants", image: IMG.pearlEarring, image_alt: "Close portrait of a pearl drop earring", text: "Pieces she'll wear every day — and hand down one day.", tag: "gift" } },
        { type: "guide", settings: { label: "Anniversary", hint: "Diamonds & bands", image: IMG.weddingBands, image_alt: "Two gold wedding bands on blush silk", text: "Ten years, twenty-five — mark it with something that lasts longer still.", collection: "rings" } },
        { type: "guide", settings: { label: "Under ৳25,000", hint: "Thoughtful, not extravagant", image: IMG.hoopsShadow, image_alt: "Twisted gold hoops on a pale stone", text: "Real gold and real pearls, beautifully boxed.", max_price: 25000 } },
        { type: "guide", settings: { label: "For him", hint: "Watches", image: IMG.watchHand, image_alt: "A hand holding a wristwatch", text: "Automatic watches built to be wound for decades.", collection: "watches" } },
      ],
    },
    { type: "featured-collection", settings: { eyebrow: "Most gifted", heading: "Pieces that are given again and again", heading_align: "center", source: "best-selling", limit: 4, columns: 4 } },
    {
      type: "collection-story",
      settings: { eyebrow: "Occasions", heading: "For the moments that matter", heading_align: "center", image_ratio: "portrait", products: 3 },
      blocks: [
        { type: "chapter", settings: { image: IMG.ringBox, image_alt: "A diamond ring in an open grey ring box", eyebrow: "Occasion", title: "The Proposal", text: "Classic solitaires and halos, sized for free after she says yes.", collection: "rings", link_label: "Engagement rings" } },
        { type: "chapter", settings: { image: IMG.pearls, image_alt: "A strand of pearls in a red jewellery box", eyebrow: "Occasion", title: "For Ammu", text: "Pearls, fine chains and pendants for Mother's Day, Eid and every ordinary Friday.", collection: "necklaces", link_label: "Necklaces & pendants" } },
      ],
    },
    {
      type: "rich-text",
      settings: {
        eyebrow: "The finishing touch",
        heading: "Every gift leaves in ivory and gold",
        text: "<p>Write your message in the order note at checkout and our calligrapher will hand-write it on a card. We tie every box with a gold ribbon and never include the price.</p>",
        align: "center",
        size: "large",
        color_scheme: "muted",
        padding: "large",
      },
    },
    press("The gift box alone is worth the trip to Dhanmondi."),
    appointment({
      eyebrow: "Gift consultations",
      heading: "Not sure what to choose? Ask an adviser",
      text: "Tell us who it's for and your budget — we'll send a shortlist on WhatsApp within the hour, or welcome you to the atelier to choose in person.",
      image: IMG.ringTray,
      alt: "Rings presented in a velvet tray",
      button: "Ask on WhatsApp",
    }),
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "thumbnails-left", image_ratio: "square", media_width: "medium", zoom: true, sticky_info: true, sticky_atc: true, show_breadcrumbs: true, color_scheme: "default", padding: "small" },
      blocks: [
        { type: "vendor" },
        { type: "title" },
        { type: "price", settings: { show_tax_note: true, tax_note: "Price includes VAT, making charges and insured delivery." } },
        { type: "variant_picker", settings: { style: "buttons" } },
        { type: "buy_buttons", settings: { show_quantity: false, show_buy_now: true, buy_now_style: "secondary", buy_now_label: "Buy it now" } },
        { type: "certification" },
        { type: "gift_message" },
        { type: "description", settings: { collapsed: false } },
        { type: "collapsible_tab", settings: { heading: "Care & servicing", icon: "sparkles", content: "<p>Store each piece in its pouch, away from perfume and water. Bring it to the atelier once a year for complimentary cleaning, polishing and a stone check.</p>" } },
        { type: "collapsible_tab", settings: { heading: "Delivery, insurance & exchange", icon: "shield-check", content: "<p>Complimentary insured delivery in 1–2 days inside Dhaka and 3–5 days nationwide, with signature on receipt. Lifetime exchange on gold at the day's rate; returns within 7 days on unworn pieces.</p>" } },
        { type: "rating" },
        { type: "share" },
      ],
    },
    appointment({
      eyebrow: "See it in person",
      heading: "Try it on at the atelier",
      text: "Reserve this piece for a private viewing in Dhanmondi — we'll have it polished and waiting, along with a few we think you'll love.",
      image: IMG.ringNecklace,
      alt: "A woman wearing a gold pendant and ring",
      button: "Reserve a viewing",
      position: "right",
    }),
    { type: "product-reviews", settings: { heading: "Client notes", hide_when_empty: true } },
    { type: "related-products", settings: { heading: "You may also admire", limit: 4 } },
  ]);
}

export function templates(): Record<string, SectionList> {
  return {
    product: productTemplate(),
    collection: sectionList([
      { type: "main-collection", settings: { show_banner: true, show_description: true, filters: "sidebar", show_sort: true, per_page: 24, columns: 3, mobile_columns: "2" } },
      promises(JEWELRY_PROMISES, "muted"),
    ]),
    collections: sectionList([
      { type: "main-collections-list", settings: { heading: "The collections", card_style: "below", columns: 3 } },
      appointment({
        eyebrow: "Private viewings",
        heading: "Prefer to see it in person?",
        text: "Book an hour in our Dhanmondi salon — every collection, in daylight, with an adviser at your side.",
        image: IMG.ringTray,
        alt: "Rings presented in a velvet tray",
        button: "Book via WhatsApp",
      }),
    ]),
    search: sectionList([
      { type: "main-search", settings: { columns: 4 } },
      { type: "featured-collection", settings: { eyebrow: "Most coveted", heading: "Perhaps one of these", heading_align: "center", source: "best-selling", limit: 4, columns: 4, color_scheme: "muted" } },
    ]),
    cart: sectionList([
      { type: "main-cart", settings: { heading: "Your selection" } },
      { type: "featured-collection", settings: { eyebrow: "Finishing touches", heading: "To wear alongside", heading_align: "center", source: "best-selling", limit: 4, columns: 4 } },
    ]),
    page: sectionList([{ type: "main-page" }]),
    blog: sectionList([
      { type: "main-blog", settings: { heading: "The Journal", subheading: "Notes on gold, stones, bridal traditions and caring for the pieces you love.", feature_first: true } },
      { type: "featured-collection", settings: { heading: "From the atelier", heading_align: "center", source: "featured", limit: 4, columns: 4, color_scheme: "muted" } },
    ]),
    article: sectionList([
      { type: "main-article", settings: { show_cover: true, show_share: true } },
      { type: "featured-collection", settings: { heading: "Pieces in this story", heading_align: "center", source: "featured", limit: 4, columns: 4 } },
    ]),
    account: sectionList([
      { type: "main-account", settings: { login_heading: "Welcome back", register_heading: "Create your Lumière account", register_text: "Track orders, keep a wishlist of pieces and receive invitations to private previews." } },
    ]),
    "404": sectionList([
      { type: "main-404", settings: { heading: "This page has been misplaced", text: "Like a single earring, it isn't where it should be. Let us show you something else instead.", show_products: true } },
    ]),
  };
}
