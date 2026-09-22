/**
 * Playhouse defaults: header/footer groups and every template, per preset (kids / pets / gifts).
 * Section ids are deterministic (see `sectionList`) so the customizer and storefront agree.
 * Collection slugs match the seeded `playhouse-demo` store (toys-games, learning, baby,
 * kids-fashion, pet-supplies) — sections fall back gracefully when a collection is missing.
 */
import type { SectionList, ThemeConfig } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG } from "./images";
import { DEFAULT_AGES } from "./sections/header";

/* ─────────────────────────── header & footer ─────────────────────────── */

type AgeSpec = { label: string; caption: string; emoji: string; color: string; link: string };

const PET_TYPES: AgeSpec[] = [
  { label: "Dogs", caption: "Walks, chews & cuddles", emoji: "🐶", color: "sunshine", link: "/search?q=dog" },
  { label: "Cats", caption: "Scratch, pounce, nap", emoji: "🐱", color: "sky", link: "/search?q=cat" },
  { label: "Treats & food", caption: "Vet-approved bowls", emoji: "🦴", color: "bubblegum", link: "/search?q=food" },
  { label: "Cosy wear", caption: "Hoodies & jumpers", emoji: "🧣", color: "mint", link: "/search?q=hoodie" },
  { label: "All pets", caption: "The whole pet corner", emoji: "🐾", color: "grape", link: "/collections/pet-supplies" },
];

export function headerGroup(messages: string[], opts: { ageLabel?: string; ageHeading?: string; ages?: AgeSpec[] } = {}): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      settings: { style: "marquee", show_phone: true, show_social: false, color_scheme: "primary" },
      blocks: messages.map((text) => ({ type: "announcement", settings: { text } })),
    },
    {
      type: "header",
      settings: {
        sticky: true,
        bar_style: "floating",
        search_style: "bar",
        show_wishlist: true,
        show_account: true,
        rainbow_wordmark: true,
        age_display: "both",
        age_label: opts.ageLabel ?? "Shop by age",
        age_heading: opts.ageHeading ?? "Find the perfect toy for every stage",
        age_color: "sunshine",
      },
      blocks: (opts.ages ?? DEFAULT_AGES).map((a) => ({ type: "age", settings: { ...a } })),
    },
  ]);
}

export function footerGroup(about: string, badges: { icon: string; title: string; text: string }[], club?: { heading: string; text: string }): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: { color_scheme: "inverse", wavy_top: true, show_social: true, show_payment_icons: true, payment_methods: "cod, bkash, nagad, visa, mastercard" },
      blocks: [
        { type: "newsletter", settings: { heading: club?.heading ?? "Join the Playhouse club", text: club?.text ?? "Birthday surprises, early access to new toys and 10% off your first order.", button_label: "Join the club" } },
        ...badges.map((b) => ({ type: "badge", settings: b })),
        { type: "brand", settings: { text: about } },
        { type: "link_list", settings: { heading: "Shop", menu: "main" } },
        { type: "link_list", settings: { heading: "Help", menu: "footer" } },
        { type: "contact", settings: { heading: "Say hello" } },
      ],
    },
  ]);
}

const KIDS_BADGES = [
  { icon: "shield-check", title: "Safety tested", text: "Every toy checked by our team" },
  { icon: "leaf", title: "Non-toxic materials", text: "Water-based paints, BPA-free" },
  { icon: "banknote", title: "Cash on delivery", text: "bKash & Nagad too" },
  { icon: "truck", title: "Next-day in Dhaka", text: "3–5 days nationwide" },
];

const PET_BADGES = [
  { icon: "badge-check", title: "Vet-approved", text: "Brands our vets trust" },
  { icon: "leaf", title: "Pet-safe materials", text: "Non-toxic, chew-tested" },
  { icon: "banknote", title: "Cash on delivery", text: "bKash & Nagad too" },
  { icon: "truck", title: "Same-day in Dhaka", text: "Order before 2pm" },
];

const GIFT_BADGES = [
  { icon: "gift", title: "Free gift wrap", text: "With a handwritten card" },
  { icon: "map-pin", title: "Send to anyone", text: "Deliver to a different address" },
  { icon: "banknote", title: "Cash on delivery", text: "bKash & Nagad too" },
  { icon: "rotate-ccw", title: "Easy exchanges", text: "7 days, no fuss" },
];

export const KIDS_HEADER = () =>
  headerGroup(["Free delivery in Dhaka on orders over ৳2,500", "Cash on delivery nationwide · bKash & Nagad accepted", "Free gift wrapping on every birthday order 🎁"]);
export const KIDS_FOOTER = () => footerGroup("Playful, safety-checked toys, baby essentials and pet treats from our little shop in Uttara — delivered with love across Bangladesh.", KIDS_BADGES);

export const PETS_HEADER = () =>
  headerGroup(["Same-day delivery in Dhaka for orders before 2pm", "Vet-approved food & treats · Cash on delivery", "Free squeaky toy on orders over ৳3,000 🐾"], {
    ageLabel: "Shop by pet",
    ageHeading: "Everything for your furry family",
    ages: PET_TYPES,
  });
export const PETS_FOOTER = () =>
  footerGroup("Food, toys and cosy things for Dhaka's happiest dogs and cats — picked by pet parents, approved by vets.", PET_BADGES, {
    heading: "Join the Pack club",
    text: "Birthday treats for your pet, restock reminders and 10% off your first order.",
  });

export const GIFTS_HEADER = () =>
  headerGroup(["Free gift wrapping & a handwritten card on every order", "Send it straight to the birthday party — anywhere in Bangladesh", "Cash on delivery · bKash & Nagad accepted"], {
    ageLabel: "Gifts by age",
    ageHeading: "Gifts they'll squeal over, by age",
  });
export const GIFTS_FOOTER = () =>
  footerGroup("Birthday, Eid and newborn gifts, wrapped by hand in Uttara and delivered with a smile across Bangladesh.", GIFT_BADGES, {
    heading: "Join the gift club",
    text: "Birthday reminders, early access to gift boxes and 10% off your first order.",
  });

/* ─────────────────────────── shared specs ─────────────────────────── */

function trustStrip(items: [string, string, string][]): SectionSpec {
  return {
    type: "multicolumn",
    settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: "default" },
    blocks: items.map(([icon, title, text]) => ({ type: "column", settings: { icon, title, text } })),
  };
}

const BUBBLES: SectionSpec = {
  type: "category-bubbles",
  settings: { heading: "Pop into a category", subheading: "", heading_align: "center", size: "large", show_count: false },
  blocks: [
    { type: "bubble", settings: { collection: "toys-games", color: "sunshine" } },
    { type: "bubble", settings: { collection: "learning", color: "sky" } },
    { type: "bubble", settings: { collection: "baby", color: "bubblegum" } },
    { type: "bubble", settings: { collection: "kids-fashion", color: "mint" } },
    { type: "bubble", settings: { collection: "pet-supplies", color: "grape" } },
  ],
};

const AGE_IMAGES = [IMG.babyFeet, IMG.stackingRings, IMG.crayons, IMG.woodenTrain, IMG.lego];

function ageTiles(style: "tiles" | "photos" | "stickers", heading: string, subheading: string, extra: Record<string, unknown> = {}): SectionSpec {
  return {
    type: "shop-by-age",
    settings: { eyebrow: "Shop by age", heading, subheading, heading_align: "center", style, ...extra },
    blocks: DEFAULT_AGES.map((a, i) => ({ type: "age", settings: { ...a, image: AGE_IMAGES[i] } })),
  };
}

function faq(heading: string, qa: [string, string][]): SectionSpec {
  return {
    type: "faq",
    settings: { heading, subheading: "", heading_align: "center", layout: "split", open_first: true, color_scheme: "default" },
    blocks: qa.map(([question, answer]) => ({ type: "question", settings: { question, answer: `<p>${answer}</p>` } })),
  };
}

/* ─────────────────────────── home pages ─────────────────────────── */

export function kidsIndex(): SectionList {
  return sectionList([
    {
      type: "playhouse-hero",
      settings: {
        eyebrow: "New toys just landed",
        heading: "Toys that spark big imaginations",
        highlight: "big imaginations",
        subheading: "Wooden classics, learning kits and cuddly friends — safety-checked, gift-ready and delivered across Bangladesh.",
        button_label: "Shop all toys",
        button_link: "/collections/toys-games",
        button_style: "primary",
        button2_label: "Learning & creativity",
        button2_link: "/collections/learning",
        button2_style: "secondary",
        image: IMG.heroKids,
        image_alt: "A laughing girl with colourful paint on her face",
        image_2: IMG.woodenTrain,
        image_2_alt: "A wooden toy train on its track",
        background: "sunshine",
        highlight_color: "bubblegum",
        sticker: "Up to 30% off",
      },
      blocks: [
        { type: "chip", settings: { icon: "shield-check", text: "Safety-checked toys" } },
        { type: "chip", settings: { icon: "banknote", text: "Cash on delivery" } },
        { type: "chip", settings: { icon: "gift", text: "Free gift wrap" } },
      ],
    },
    trustStrip([
      ["shield-check", "Safety-checked", "Every single toy"],
      ["leaf", "Non-toxic", "Water-based paints"],
      ["banknote", "Cash on delivery", "bKash & Nagad too"],
      ["truck", "Next-day in Dhaka", "Free over ৳2,500"],
    ]),
    ageTiles("tiles", "Just right for every stage", "Hand-picked toys that grow with your little one — from first rattles to big-kid builds."),
    BUBBLES,
    {
      type: "featured-collection",
      settings: { eyebrow: "Just unboxed", heading: "Fresh in the toy box", subheading: "", source: "newest", limit: 8, layout: "carousel", columns: 4, show_view_all: true },
    },
    {
      type: "bundle-deals",
      settings: { eyebrow: "Better together", heading: "Bundle up & save", subheading: "Our favourite combos, bundled at a sweeter price — perfect for birthdays.", heading_align: "center", background: "none" },
      blocks: [
        { type: "bundle", settings: { title: "Little builder's box", image: IMG.colorBlocks, items: "Wooden ABC blocks (26 pcs)\nRainbow stacking rings\nJumbo crayons & markers art kit", price: 2250, compare_price: 2650, badge: "Best value", link: "/collections/learning", color: "sunshine" } },
        { type: "bundle", settings: { title: "Newborn welcome box", image: IMG.babyTeeSet, items: "Newborn cotton essentials set\nBaby bear hooded romper\nCuddly teddy bear (16 inch)", price: 4150, compare_price: 4650, badge: "Gift ready", link: "/collections/baby", color: "bubblegum" } },
        { type: "bundle", settings: { title: "Happy pup kit", image: IMG.frenchieHoodie, items: "Premium adult dog food (3 kg)\nSqueaky plush dog toy\nCosy dog hoodie", price: 3750, compare_price: 4150, badge: "Pet favourite", link: "/collections/pet-supplies", color: "mint" } },
      ],
    },
    {
      type: "product-grid",
      settings: { eyebrow: "Parents' favourites", heading: "Most-loved toys this month", subheading: "", heading_align: "center", source: "best-selling", limit: 8, columns: 4, button_label: "Shop all toys", button_link: "/collections/all" },
    },
    {
      type: "gift-finder",
      settings: {
        eyebrow: "Gift finder",
        heading: "Find the perfect present in 10 seconds",
        subheading: "Tell us who it's for and we'll pick out gifts they'll love — wrapped for free.",
        default_who: "kid",
        kid_collection: "toys-games",
        baby_collection: "baby",
        pet_collection: "pet-supplies",
        budgets: "500, 1500, 3000",
        background: "sky",
      },
    },
    {
      type: "pet-corner",
      settings: {
        eyebrow: "Pet corner",
        heading: "Treats, toys & cosy things for furry friends",
        text: "Vet-approved food, chew-proof toys and snuggly hoodies for Dhaka's happiest dogs and cats.",
        button_label: "Visit the pet corner",
        button_link: "/collections/pet-supplies",
        image: IMG.corgiOrange,
        image_alt: "A corgi puppy sitting on an orange background",
        color: "sunshine",
        collection: "pet-supplies",
        limit: 4,
      },
      blocks: [
        { type: "perk", settings: { icon: "badge-check", text: "Vet-approved brands" } },
        { type: "perk", settings: { icon: "truck", text: "Same-day delivery in Dhaka" } },
        { type: "perk", settings: { icon: "heart", text: "Chew-tested by our shop dogs" } },
      ],
    },
    {
      type: "parent-testimonials",
      settings: { eyebrow: "Parents love us", heading: "Happy kids, happy parents", summary: "4.9/5 from 2,300+ parents across Bangladesh", layout: "grid", background: "muted" },
      blocks: [
        { type: "review", settings: { quote: "The wooden train set is pure magic — my son builds a new track every morning before school. Sturdy, smooth and not a single splinter.", name: "Farhana R.", location: "Uttara, Dhaka", child: "Mum of Ayaan, 4", product: "wooden-train-set-40-pcs", avatar: IMG.avatarMum1, rating: 5 } },
        { type: "review", settings: { quote: "Soft, safe and beautifully stitched. The teddy arrived gift-wrapped with a little card — my daughter hasn't let go of it since.", name: "Tanvir A.", location: "Chattogram", child: "Dad of Inaya, 2", product: "cuddly-teddy-bear-16-inch", avatar: IMG.avatarDad1, rating: 5 } },
        { type: "review", settings: { quote: "Ordered on Monday, paid cash on delivery on Tuesday. Bruno has destroyed every other toy — not this one!", name: "Sadia K.", location: "Gulshan, Dhaka", child: "Pet parent to Bruno", product: "squeaky-plush-dog-toy", avatar: IMG.avatarMum2, rating: 5 } },
      ],
    },
    faq("Questions from parents", [
      ["Are your toys safe for little ones?", "Yes. Every toy is checked by our team for loose parts, sharp edges and paint quality. We list the recommended age on each product and only stock non-toxic, water-based finishes."],
      ["How fast is delivery?", "Inside Dhaka we deliver next day (same day in Uttara for orders before 2pm). Outside Dhaka takes 3–5 working days. Delivery is free on orders over ৳2,500 inside Dhaka."],
      ["Can I pay cash on delivery?", "Of course — pay in cash when your parcel arrives, or use bKash, Nagad or card at checkout."],
      ["Do you gift wrap?", "Every order can be gift-wrapped for free. Add a message at checkout and we'll write it on a handmade card."],
      ["What if it's the wrong size or age?", "Exchange unused items within 7 days — just message us on WhatsApp and we'll arrange a pickup."],
    ]),
  ]);
}

export function petsIndex(): SectionList {
  return sectionList([
    {
      type: "playhouse-hero",
      settings: {
        eyebrow: "The pet corner is open",
        heading: "Happy tails start here",
        highlight: "Happy tails",
        subheading: "Vet-approved food, chew-proof toys and cosy hoodies for dogs and cats — delivered same day in Dhaka.",
        button_label: "Shop pet supplies",
        button_link: "/collections/pet-supplies",
        button_style: "primary",
        button2_label: "Dog essentials",
        button2_link: "/search?q=dog",
        button2_style: "secondary",
        image: IMG.corgiOrange,
        image_alt: "A corgi puppy sitting on an orange background",
        image_2: IMG.kitten,
        image_2_alt: "A tabby kitten reaching up playfully",
        background: "sunshine",
        highlight_color: "sky",
        sticker: "Free toy over ৳3,000",
      },
      blocks: [
        { type: "chip", settings: { icon: "badge-check", text: "Vet-approved" } },
        { type: "chip", settings: { icon: "banknote", text: "Cash on delivery" } },
        { type: "chip", settings: { icon: "truck", text: "Same-day in Dhaka" } },
      ],
    },
    {
      type: "shop-by-age",
      settings: { eyebrow: "Shop by pet", heading: "Who are we spoiling today?", subheading: "Pick your furry friend and we'll show you the good stuff.", heading_align: "center", style: "tiles", tile_tag: "Shop for" },
      blocks: PET_TYPES.map((p) => ({ type: "age", settings: { ...p } })),
    },
    {
      type: "pet-corner",
      settings: {
        eyebrow: "Dog of the month",
        heading: "Everything for walks, chews & cuddles",
        text: "From premium kibble to squeaky plush toys that survive the zoomies — curated by our shop dogs, Mishti and Bhola.",
        button_label: "Shop for dogs",
        button_link: "/search?q=dog",
        image: IMG.beagle,
        image_alt: "A happy beagle looking up at the camera",
        color: "sky",
        collection: "pet-supplies",
        limit: 4,
      },
      blocks: [
        { type: "perk", settings: { icon: "badge-check", text: "Vet-approved brands" } },
        { type: "perk", settings: { icon: "truck", text: "Same-day delivery in Dhaka" } },
        { type: "perk", settings: { icon: "heart", text: "Chew-tested by our shop dogs" } },
        { type: "perk", settings: { icon: "rotate-ccw", text: "Easy 7-day exchanges" } },
      ],
    },
    {
      type: "featured-collection",
      settings: { eyebrow: "Pet parents' picks", heading: "Bestsellers in the pet corner", subheading: "", source: "collection", collection: "pet-supplies", limit: 8, layout: "grid", columns: 4, show_view_all: true },
    },
    {
      type: "bundle-deals",
      settings: { eyebrow: "Better together", heading: "Starter kits for new family members", subheading: "Everything a new puppy or kitten needs, bundled at a friendlier price.", heading_align: "center" },
      blocks: [
        { type: "bundle", settings: { title: "Happy pup kit", image: IMG.frenchieHoodie, items: "Premium adult dog food (3 kg)\nSqueaky plush dog toy\nCosy dog hoodie", price: 3750, compare_price: 4150, badge: "Pet favourite", link: "/collections/pet-supplies", color: "sunshine" } },
        { type: "bundle", settings: { title: "Curious kitty kit", image: IMG.catScratcher, items: "Sisal cat scratching post\nFeather teaser wand\nCrunchy salmon treats", price: 2150, compare_price: 2450, badge: "New!", link: "/search?q=cat", color: "sky" } },
      ],
    },
    {
      type: "gift-finder",
      settings: {
        eyebrow: "Treat finder",
        heading: "Find the perfect treat in 10 seconds",
        subheading: "Dog or cat, big budget or small — we'll fetch the best picks.",
        default_who: "pet",
        kid_collection: "toys-games",
        baby_collection: "baby",
        pet_collection: "pet-supplies",
        budgets: "500, 1500, 3000",
        background: "mint",
      },
    },
    {
      type: "parent-testimonials",
      settings: { eyebrow: "Pet parents love us", heading: "Tails are wagging all over Dhaka", summary: "4.9/5 from 1,200+ pet parents", layout: "grid", background: "muted" },
      blocks: [
        { type: "review", settings: { quote: "Bruno has destroyed every toy we've bought — except this one. Three months and still squeaking!", name: "Sadia K.", location: "Gulshan, Dhaka", child: "Pet parent to Bruno, 3", product: "squeaky-plush-dog-toy", avatar: IMG.avatarMum2, rating: 5 } },
        { type: "review", settings: { quote: "The hoodie fits our frenchie perfectly and kept her warm all winter. Delivered the same afternoon.", name: "Rafiq H.", location: "Banani, Dhaka", child: "Pet parent to Muffin, 2", product: "cosy-dog-hoodie", avatar: IMG.avatarDad2, rating: 5 } },
        { type: "review", settings: { quote: "Our cats ignored the sofa the day the scratching post arrived. Solid, tall and it doesn't wobble.", name: "Nabila S.", location: "Mirpur, Dhaka", child: "Pet parent to Tiger & Mishti", product: "sisal-cat-scratching-post", avatar: IMG.avatarMum3, rating: 5 } },
      ],
    },
    { ...BUBBLES, settings: { ...BUBBLES.settings, heading: "Shopping for the kids too?" } },
    faq("Pet parent questions", [
      ["Are your foods and treats vet-approved?", "Yes — we only stock brands recommended by our partner vets in Dhaka, and we check every batch's expiry date before it ships."],
      ["How fast is delivery?", "Same day inside Dhaka for orders placed before 2pm, next day otherwise. Outside Dhaka takes 3–5 working days."],
      ["Which size hoodie should I pick?", "Measure your pet's back from collar to tail: S fits up to 30 cm, M up to 40 cm and L up to 50 cm. Unsure? Message us a photo — we'll help."],
      ["Can I pay cash on delivery?", "Absolutely. Pay cash when it arrives, or use bKash, Nagad or card at checkout."],
    ]),
  ]);
}

export function giftsIndex(): SectionList {
  return sectionList([
    {
      type: "playhouse-hero",
      settings: {
        eyebrow: "Birthday season is here",
        heading: "Gifts that make them squeal with joy",
        highlight: "squeal",
        subheading: "Toys, baby boxes and pet treats — hand-wrapped with a personal card and delivered anywhere in Bangladesh.",
        button_label: "Find a gift",
        button_link: "/collections/toys-games",
        button_style: "primary",
        button2_label: "Newborn gifts",
        button2_link: "/collections/baby",
        button2_style: "secondary",
        image: IMG.giftPink,
        image_alt: "A pink gift box tied with a gold ribbon",
        image_2: IMG.teddyBasket,
        image_2_alt: "A teddy bear with a knitted blanket in a basket",
        background: "bubblegum",
        highlight_color: "sunshine",
        sticker: "Free gift wrap",
      },
      blocks: [
        { type: "chip", settings: { icon: "gift", text: "Wrapped by hand" } },
        { type: "chip", settings: { icon: "map-pin", text: "Send to any address" } },
        { type: "chip", settings: { icon: "banknote", text: "Cash on delivery" } },
      ],
    },
    {
      type: "gift-finder",
      settings: {
        eyebrow: "Gift finder",
        heading: "Who are we celebrating?",
        subheading: "Answer three quick questions and we'll pick gifts they'll actually love.",
        default_who: "kid",
        kid_collection: "toys-games",
        baby_collection: "baby",
        pet_collection: "pet-supplies",
        budgets: "1000, 2000, 3000",
        background: "sunshine",
      },
    },
    ageTiles("stickers", "Gifts by age", "The right gift for every birthday — from first rattles to big-kid builds.", { eyebrow: "Gifts by age" }),
    {
      type: "bundle-deals",
      settings: { eyebrow: "Ready-to-gift boxes", heading: "Gift boxes, wrapped & ready", subheading: "Thoughtfully curated sets that arrive gift-wrapped with a handwritten card.", heading_align: "center" },
      blocks: [
        { type: "bundle", settings: { title: "Newborn welcome box", image: IMG.babyTeeSet, items: "Newborn cotton essentials set\nBaby bear hooded romper\nCuddly teddy bear (16 inch)", price: 4150, compare_price: 4650, badge: "Most gifted", link: "/collections/baby", color: "bubblegum" } },
        { type: "bundle", settings: { title: "Little artist's box", image: IMG.crayons, items: "Jumbo crayons & markers art kit\nWooden ABC blocks (26 pcs)\nRainbow stacking rings", price: 2250, compare_price: 2650, badge: "Under ৳2,500", link: "/collections/learning", color: "sunshine" } },
        { type: "bundle", settings: { title: "Choo-choo birthday box", image: IMG.trainSet, items: "Wooden train set (40 pcs)\nWooden sailboat toy set\nDie-cast vintage convertible", price: 5150, compare_price: 5650, badge: "Big smiles", link: "/collections/toys-games", color: "sky" } },
      ],
    },
    {
      type: "featured-collection",
      settings: { eyebrow: "Birthday bestsellers", heading: "The gifts everyone's giving", subheading: "", source: "best-selling", limit: 8, layout: "carousel", columns: 4, show_view_all: true },
    },
    trustStrip([
      ["gift", "Free gift wrap", "With a handwritten card"],
      ["map-pin", "Send to anyone", "Any address in Bangladesh"],
      ["banknote", "Cash on delivery", "bKash & Nagad too"],
      ["rotate-ccw", "Easy exchanges", "Within 7 days"],
    ]),
    { ...BUBBLES, settings: { ...BUBBLES.settings, heading: "Browse gifts by category" } },
    {
      type: "parent-testimonials",
      settings: { eyebrow: "Gift givers love us", heading: "Wrapped with love, received with squeals", summary: "4.9/5 from 2,300+ happy gift givers", layout: "grid", background: "muted" },
      blocks: [
        { type: "review", settings: { quote: "I ordered from London for my niece's birthday in Sylhet — it arrived wrapped beautifully with my message on a card. She loved it!", name: "Maliha C.", location: "London → Sylhet", child: "Aunt of Zara, 5", product: "wooden-train-set-40-pcs", avatar: IMG.avatarMum3, rating: 5 } },
        { type: "review", settings: { quote: "The newborn set was the sweetest gift at the aqiqah. Soft cotton, lovely box and delivered right on time.", name: "Imran H.", location: "Dhanmondi, Dhaka", child: "Uncle of baby Ayesha", product: "newborn-cotton-essentials-set", avatar: IMG.avatarDad2, rating: 5 } },
        { type: "review", settings: { quote: "Last-minute birthday gift sorted in five minutes with the gift finder. Next-day delivery saved the party!", name: "Nusrat J.", location: "Uttara, Dhaka", child: "Mum of Rayan, 6", product: "classic-building-bricks-1000-pcs", avatar: IMG.avatarMum1, rating: 5 } },
      ],
    },
    faq("Gifting questions", [
      ["Is gift wrapping really free?", "Yes — every order can be wrapped in our playful paper with a handwritten card, at no extra cost. Just add your message at checkout."],
      ["Can I send a gift to a different address?", "Of course. Enter the recipient's address at checkout — we never include prices or invoices in gift parcels."],
      ["Can you deliver on a specific date?", "Inside Dhaka we can deliver on your chosen day. Add the date in the order note and we'll confirm by phone."],
      ["What if they already have it?", "Unused gifts can be exchanged within 7 days — the recipient can simply message us on WhatsApp."],
    ]),
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "thumbnails-bottom", image_ratio: "square", sticky_atc: true },
      blocks: [
        { type: "title" },
        { type: "rating" },
        { type: "price", settings: { show_tax_note: false } },
        { type: "age_safety" },
        { type: "variant_picker", settings: { style: "buttons" } },
        { type: "stock", settings: { threshold: 5 } },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true, buy_now_label: "Buy it now" } },
        { type: "gift_note" },
        { type: "delivery_info", settings: { inside_title: "Inside Dhaka", inside_text: "Next day · ৳60 (free over ৳2,500)", outside_title: "Outside Dhaka", outside_text: "3–5 days · ৳120", note: "Cash on delivery, bKash & Nagad accepted." } },
        { type: "description" },
        { type: "collapsible_tab", settings: { heading: "Safety & care", icon: "shield-check", content: "<p>Checked by our team for loose parts and sharp edges. Wipe clean with a damp cloth. Always follow the recommended age on the pack and supervise young children during play.</p>" } },
        { type: "collapsible_tab", settings: { heading: "Delivery & exchanges", icon: "truck", content: "<p>Next-day delivery inside Dhaka, 3–5 working days nationwide. Unused items can be exchanged within 7 days of delivery.</p>" } },
        { type: "share" },
      ],
    },
    { type: "product-reviews" },
    { type: "related-products", settings: { heading: "More playtime picks", limit: 4, columns: 4 } },
  ]);
}

export function templates(index: SectionList): ThemeConfig["templates"] {
  return {
    index,
    product: productTemplate(),
    collection: sectionList([{ type: "main-collection", settings: { filters: "sidebar", columns: 4, show_banner: true } }]),
    collections: sectionList([
      { type: "main-collections-list" },
      { ...ageTiles("stickers", "Or shop by age", "", { eyebrow: "" }) },
    ]),
    search: sectionList([{ type: "main-search" }]),
    cart: sectionList([
      { type: "main-cart" },
      { type: "featured-collection", settings: { heading: "Little extras they'll love", source: "best-selling", limit: 4, columns: 4, show_view_all: false } },
    ]),
    page: sectionList([{ type: "main-page" }]),
    blog: sectionList([{ type: "main-blog" }]),
    article: sectionList([{ type: "main-article" }, { type: "featured-collection", settings: { heading: "Shop the story", source: "best-selling", limit: 4, columns: 4 } }]),
    account: sectionList([{ type: "main-account" }]),
    "404": sectionList([{ type: "main-404", settings: { heading: "Oops! This page ran off to play", text: "We couldn't find that page — but there are plenty of toys to discover. Try a search or pop back to the shop.", show_products: true } }]),
  };
}
