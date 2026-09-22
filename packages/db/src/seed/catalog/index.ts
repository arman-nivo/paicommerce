import { beauty } from "./beauty";
import { books } from "./books";
import { electronics } from "./electronics";
import { fashion } from "./fashion";
import { food } from "./food";
import { grocery } from "./grocery";
import { handicraft } from "./handicraft";
import { health } from "./health";
import { home } from "./home";
import { jewelry } from "./jewelry";
import { kids } from "./kids";
import { sports } from "./sports";
import type { Catalog, ProductDef } from "./types";

export type { Catalog, ProductDef } from "./types";

function take(c: Catalog, titles: string[], col: string): ProductDef[] {
  return titles.map((t) => {
    const p = c.products.find((x) => x.t === t);
    if (!p) throw new Error(`bazaar: product not found: ${t}`);
    return { ...p, col: [col, ...(p.cmp ? ["flash-sale"] : [])], ext: false, vendor: p.vendor ?? c.vendor };
  });
}

/** General marketplace: a curated mix from the other catalogues. */
export const general: Catalog = {
  key: "general",
  vendor: "Bazaar",
  freeShippingOver: 2000,
  collections: [
    { slug: "flash-sale", title: "Flash Sale", description: "Today's biggest discounts — while stocks last.", img: "supermarket", sortOrder: "price-asc" },
    { slug: "electronics", title: "Electronics", description: "Phones, audio and gadgets.", img: "techFlatlay" },
    { slug: "fashion", title: "Fashion", description: "Clothing, shoes and bags for everyone.", img: "boutique" },
    { slug: "home-living", title: "Home & Living", description: "Furniture, decor and kitchen.", img: "livingBright" },
    { slug: "groceries", title: "Groceries", description: "Daily essentials delivered fast.", img: "produceAisle" },
    { slug: "beauty-health", title: "Beauty & Health", description: "Skincare, makeup and wellness.", img: "makeupMarble" },
  ],
  products: [
    ...take(electronics, ["Xiaomi Redmi Note 13 Pro", "QCY T13 ANC Wireless Earbuds", "JBL Flip 6 Portable Speaker", "Minimal AMOLED Smartwatch", "Xiaomi 20000mAh Power Bank 3"], "electronics"),
    ...take(fashion, ["Classic Crew Neck Cotton Tee", "Stretch Denim Jeans — Indigo", "Floral Midi Wrap Dress", "Premium Formal Shirt — Sky Blue"], "fashion"),
    ...take(home, ["Mustard Accent Armchair", "Scented Soy Candle — Sandalwood", "Silent Sweep Wall Clock", "Potted Succulent in Ceramic Pot"], "home-living"),
    ...take(grocery, ["Miniket Rice", "Farm Fresh Brown Eggs", "Sundarbans Natural Honey (500 g)"], "groceries"),
    ...take(beauty, ["Vitamin C Brightening Serum (30 ml)", "Matte Velvet Lipstick", "Complete Glow Skincare Set"], "beauty-health"),
    ...take(health, ["Whey Protein Isolate (2 lb)"], "beauty-health"),
  ],
  blog: [
    { title: "11.11 Mega Sale: What to Grab First", excerpt: "Our buying guide for the biggest shopping day of the year.", cover: "supermarket", tags: ["sale", "guide"],
      points: [["Electronics", "Phones and earbuds see the steepest discounts."], ["Stock up", "Rice, oil and eggs at bulk prices."], ["Set reminders", "Flash deals drop every two hours."]] },
    { title: "How We Verify Every Seller", excerpt: "Authenticity checks that keep fakes off Bazaar.", cover: "techFlatlay", tags: ["trust"],
      points: [["Trade licence", "Every seller submits a valid trade licence."], ["Sample checks", "We test-buy from new sellers."], ["Ratings", "Low-rated sellers are removed."]] },
    { title: "Gift Ideas Under ৳2,000", excerpt: "Thoughtful gifts for birthdays, Eid and everything in between.", cover: "candleGlow", tags: ["gifts"],
      points: [["For her", "A matte lipstick and a soy candle."], ["For him", "Budget earbuds or a cotton tee."], ["For home", "A succulent in a ceramic pot."]] },
  ],
  about: [
    "{store} is your one-stop marketplace for everything from smartphones to groceries, trusted by shoppers across Bangladesh.",
    "We partner with verified sellers and brands so you can shop with confidence — with cash on delivery on every order.",
    "Flash sales every day, free delivery on orders over ৳2,000.",
  ],
  perks: ["Verified sellers only", "Cash on delivery everywhere"],
  reviews: ["Great price during flash sale.", "Original product, fast delivery.", "Good quality for the price.", "Packaging was good.", "Will buy again from Bazaar.", "Customer service was helpful."],
};

export const CATALOGS: Record<string, Catalog> = { fashion, electronics, grocery, beauty, home, food, jewelry, kids, sports, books, general, handicraft, health };
