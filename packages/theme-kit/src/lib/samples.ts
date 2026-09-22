/**
 * Sample content used by sections in the customizer preview when a merchant hasn't picked
 * a collection / product yet, or the store has no catalogue. Never shown on the live store.
 */
import type { SfCollection, SfPost, SfProduct } from "@pai/theme-sdk";

const u = (id: string, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const SAMPLE_PRODUCTS_RAW: [string, number, number | null, string, string, string][] = [
  ["Linen Relaxed Shirt", 245000, 320000, "photo-1596755094514-f87e34085b2c", "photo-1602810318383-e386cc2a3ccf", "Aurora Studio"],
  ["Classic Leather Tote", 480000, null, "photo-1548036328-c9fa89d128fa", "photo-1584917865442-de89df76afd3", "Maison"],
  ["Everyday White Sneaker", 390000, 450000, "photo-1549298916-b41d501d3772", "photo-1560343090-f0409e92791a", "Stride"],
  ["Minimal Steel Watch", 650000, null, "photo-1523275335684-37898b6baf30", "photo-1523275335684-37898b6baf30", "Tempo"],
  ["Wireless Headphones", 520000, 690000, "photo-1505740420928-5e560c06d30e", "photo-1505740420928-5e560c06d30e", "Sonic"],
  ["Round Sunglasses", 180000, null, "photo-1572635196237-14b3f281503f", "photo-1572635196237-14b3f281503f", "Solis"],
  ["Cotton Crew T-Shirt", 99000, 129000, "photo-1521572163474-6864f9cf17ab", "photo-1576566588028-4147f3842f27", "Basics"],
  ["Gold Hoop Earrings", 275000, null, "photo-1535632066927-ab7c9ab60908", "photo-1599643478518-a784e5dc4c8f", "Lumière"],
];

export const SAMPLE_PRODUCTS: SfProduct[] = SAMPLE_PRODUCTS_RAW.map(([title, price, compare, img, img2, vendor], i) => ({
  id: `sample-${i}`,
  slug: `sample-${i}`,
  url: "#",
  title,
  description: "<p>This is sample content shown in the theme editor. Add products to your store to replace it.</p>",
  vendor,
  productType: null,
  tags: [],
  images: [{ url: u(img), alt: title }, { url: u(img2), alt: title }],
  featuredImage: { url: u(img), alt: title },
  price,
  compareAtPrice: compare,
  priceMin: price,
  priceMax: price,
  onSale: !!compare,
  available: true,
  inventory: 10,
  options: [],
  variants: [],
  rating: { average: 4 + (i % 2) * 0.5, count: 12 + i * 7 },
  createdAt: new Date(0).toISOString(),
}));

const SAMPLE_COLLECTIONS_RAW: [string, string][] = [
  ["New Arrivals", "photo-1483985988355-763728e1935b"],
  ["Women", "photo-1515886657613-9f3515b0c78f"],
  ["Men", "photo-1490114538077-0a7f8cb49891"],
  ["Accessories", "photo-1611591437281-460bfbe1220a"],
  ["Footwear", "photo-1491553895911-0055eca6402d"],
  ["Sale", "photo-1441984904996-e0b6ba687e04"],
];

export const SAMPLE_COLLECTIONS: SfCollection[] = SAMPLE_COLLECTIONS_RAW.map(([title, img], i) => ({
  id: `sample-c-${i}`,
  slug: `sample-${i}`,
  url: "#",
  title,
  description: null,
  image: { url: u(img, 800), alt: title },
  productsCount: 12,
}));

export const SAMPLE_POSTS: SfPost[] = [
  ["How to style linen this summer", "photo-1485968579580-b6d095142e6e"],
  ["The capsule wardrobe checklist", "photo-1523381210434-271e8be1f52b"],
  ["Behind the scenes: our new collection", "photo-1485230895905-ec40ba36b9bc"],
].map(([title, img], i) => ({
  id: `sample-p-${i}`,
  slug: `sample-${i}`,
  url: "#",
  title: title!,
  excerpt: "Sample blog post shown in the theme editor. Publish posts from your dashboard to replace it.",
  content: "",
  coverUrl: u(img!, 900),
  author: "Store team",
  tags: [],
  publishedAt: new Date(0).toISOString(),
}));

/** Stock imagery the base sections use as defaults (all verified Unsplash photos). */
export const STOCK_IMAGES = {
  hero: u("photo-1483985988355-763728e1935b", 2000),
  hero2: u("photo-1469334031218-e382a71b716b", 2000),
  hero3: u("photo-1441984904996-e0b6ba687e04", 2000),
  lifestyle: u("photo-1487222477894-8943e31ef7b2", 1400),
  lifestyle2: u("photo-1529139574466-a303027c1d8b", 1400),
  store: u("photo-1441984904996-e0b6ba687e04", 1400),
  avatar1: u("photo-1494790108377-be9c29b29330", 200),
  avatar2: u("photo-1507003211169-0a1dd7228f2d", 200),
  avatar3: u("photo-1544005313-94ddf0286df2", 200),
  gallery: [
    u("photo-1515372039744-b8f02a3ae446", 900),
    u("photo-1496747611176-843222e1e57c", 900),
    u("photo-1509631179647-0177331693ae", 900),
    u("photo-1539109136881-3be0616acf4b", 900),
    u("photo-1503342217505-b0a15ec3261c", 900),
    u("photo-1581044777550-4cfa60707c03", 900),
  ],
};

/** Hero imagery & copy by business category — used for category presets of base themes. */
export const CATEGORY_HERO: Record<string, { image: string; heading: string; subheading: string }> = {
  fashion: { image: u("photo-1483985988355-763728e1935b", 2000), heading: "New season, new you", subheading: "Discover the latest arrivals — crafted for everyday comfort and style." },
  electronics: { image: u("photo-1498049794561-7780e7231661", 2000), heading: "Tech that keeps up with you", subheading: "Genuine gadgets with official warranty and fast nationwide delivery." },
  grocery: { image: u("photo-1542838132-92c53300491e", 2000), heading: "Fresh groceries, delivered today", subheading: "Farm-fresh produce and daily essentials at your doorstep." },
  beauty: { image: u("photo-1596462502278-27bfdc403348", 2000), heading: "Glow, naturally", subheading: "100% authentic skincare & cosmetics from brands you love." },
  home: { image: u("photo-1555041469-a586c61ea9bc", 2000), heading: "Make home your favourite place", subheading: "Furniture and décor designed for modern living." },
  food: { image: u("photo-1504674900247-0877df9cc836", 2000), heading: "Made fresh, served with love", subheading: "Order your favourites for delivery or pickup." },
  jewelry: { image: u("photo-1515562141207-7a88fb7ce338", 2000), heading: "Timeless pieces, made to shine", subheading: "Handcrafted jewellery for every moment worth celebrating." },
  health: { image: u("photo-1587854692152-cbe660dbde88", 2000), heading: "Your health, our priority", subheading: "Genuine medicines and wellness essentials delivered safely." },
  kids: { image: u("photo-1566576912321-d58ddd7a6088", 2000), heading: "Little things for big smiles", subheading: "Safe, joyful toys and essentials for every age." },
  sports: { image: u("photo-1517836357463-d25dfeac3438", 2000), heading: "Gear up. Go further.", subheading: "Performance gear for training, running and the outdoors." },
  books: { image: u("photo-1512820790803-83ca734da794", 2000), heading: "Stories worth staying up for", subheading: "Bestsellers, classics and stationery — delivered nationwide." },
  digital: { image: u("photo-1498050108023-c5249f4df085", 2000), heading: "Learn anything, anytime", subheading: "Courses, templates and digital downloads — instant access." },
  handicraft: { image: u("photo-1452860606245-08befc0ff44b", 2000), heading: "Handmade with heart", subheading: "Authentic crafts from local artisans." },
  automotive: { image: u("photo-1492144534655-ae79c964c9d7", 2000), heading: "Everything your ride needs", subheading: "Parts, tools and accessories you can trust." },
  pets: { image: u("photo-1601758228041-f3b2795255f1", 2000), heading: "Happy pets, happy homes", subheading: "Food, toys and care for your best friend." },
  gifts: { image: u("photo-1513885535751-8b9238bd345a", 2000), heading: "Gifts they'll never forget", subheading: "Flowers, hampers and thoughtful surprises — same-day delivery in Dhaka." },
  general: { image: u("photo-1472851294608-062f824d29cc", 2000), heading: "Everything you need, in one place", subheading: "Quality products, honest prices and cash on delivery nationwide." },
};
