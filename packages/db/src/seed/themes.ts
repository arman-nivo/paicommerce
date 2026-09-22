/** Theme Store listings (one per installed theme) + third-party submissions for the review queue. */
import { themes, themeVersions } from "../schema";
import { manifests } from "../../../theme-registry/src/manifests";
import { CATALOGS, type Catalog } from "./catalog";
import { IMG, type ImgKey } from "./lib/images";
import { Rng, uuid } from "./lib/rng";
import { daysAgo, insertMany } from "./lib/util";

export type DemoStoreDef = { theme: string; name: string; category: string; catalog: Catalog; description: string; screenshots: ImgKey[] };

/** One live demo store per theme, shown from the Theme Store. */
export const DEMO_STORES: DemoStoreDef[] = [
  { theme: "aurora", name: "Aurora Fashion House", category: "fashion", catalog: CATALOGS.fashion!, description: "Modern fashion for the modern Bangladeshi. Dresses, denim and handloom jamdani, delivered nationwide.", screenshots: ["shopping", "floralWrapDress", "saree"] },
  { theme: "volt", name: "Volt Gadgets", category: "electronics", catalog: CATALOGS.electronics!, description: "Authentic smartphones, laptops and audio with official warranty. Fast delivery across Bangladesh.", screenshots: ["deskTech", "iphonePro", "headphonesAnc"] },
  { theme: "freshmart", name: "FreshMart Grocery", category: "grocery", catalog: CATALOGS.grocery!, description: "Fresh fruits, vegetables, fish and daily essentials delivered in Dhaka within hours.", screenshots: ["produceAisle", "fruitsMix", "vegMarket"] },
  { theme: "bloom", name: "Bloom Beauty", category: "beauty", catalog: CATALOGS.beauty!, description: "Authentic skincare, makeup and fragrance curated for South Asian skin.", screenshots: ["makeupFlatlay", "serumDropper", "perfumeRose"] },
  { theme: "nest", name: "Nest Living", category: "home", catalog: CATALOGS.home!, description: "Handcrafted furniture and decor for Bangladeshi homes, with free assembly in Dhaka.", screenshots: ["livingWarm", "greenSofa", "luxBedroom"] },
  { theme: "savor", name: "Savor Kitchen", category: "food", catalog: CATALOGS.food!, description: "Old Dhaka kacchi, charcoal grills and smash burgers — delivered hot across Dhaka.", screenshots: ["biryaniPot", "doubleBurger", "chocolateCake"] },
  { theme: "lumiere", name: "Lumière Jewels", category: "jewelry", catalog: CATALOGS.jewelry!, description: "Fine diamond and 22K gold jewellery, hallmarked and certified. Crafted in Dhaka since 1998.", screenshots: ["pearls", "diamondRing", "templeNecklace"] },
  { theme: "playhouse", name: "Playhouse Kids & Pets", category: "kids", catalog: CATALOGS.kids!, description: "Safe, fun toys, baby essentials and pet supplies — gift-wrapped and delivered nationwide.", screenshots: ["marioToys", "babyBearSuit", "corgi"] },
  { theme: "stride", name: "Stride Sports", category: "sports", catalog: CATALOGS.sports!, description: "Performance running, gym, cricket and football gear for every athlete in Bangladesh.", screenshots: ["deadlift", "meshShoes", "batsman"] },
  { theme: "folio", name: "Folio Books", category: "books", catalog: CATALOGS.books!, description: "Bangla literature, English bestsellers, stationery and online courses — delivered to every district.", screenshots: ["library", "financeBook", "notesPen"] },
  { theme: "bazaar", name: "Bazaar Mart", category: "general", catalog: CATALOGS.general!, description: "Everything you need in one place — electronics, fashion, groceries and more with daily flash sales.", screenshots: ["supermarket", "techFlatlay", "boutique"] },
  { theme: "artisan", name: "Artisan Craft Co.", category: "handicraft", catalog: CATALOGS.handicraft!, description: "Handmade pottery, kantha, leather and art by Bangladeshi artisans. Fair-trade, made to last.", screenshots: ["potteryWheel", "greyVases", "floralPainting"] },
  { theme: "pulse", name: "Pulse Pharmacy", category: "health", catalog: CATALOGS.health!, description: "Licensed online pharmacy — genuine medicines, vitamins and health devices with fast delivery.", screenshots: ["pharmacyStore", "pillsColor", "stethoscope"] },
];

const THEME_STATS: Record<string, { installs: number; featured?: boolean }> = {
  aurora: { installs: 2840, featured: true },
  volt: { installs: 1215, featured: true },
  freshmart: { installs: 1980, featured: true },
  bloom: { installs: 760 },
  nest: { installs: 412 },
  savor: { installs: 1350, featured: true },
  lumiere: { installs: 298 },
  playhouse: { installs: 645 },
  stride: { installs: 387 },
  folio: { installs: 540 },
  bazaar: { installs: 2210, featured: true },
  artisan: { installs: 176 },
  pulse: { installs: 690 },
};

export type ThemeRef = { id: string; slug: string; name: string; price: number; developerId: string };

export async function seedThemes(dev: { studio: string; nova: string }, reviewerId: string) {
  const rng = new Rng("themes");
  const rows: (typeof themes.$inferInsert & { id: string })[] = [];
  const versions: (typeof themeVersions.$inferInsert)[] = [];

  manifests.forEach((m, i) => {
    const id = uuid();
    const demo = DEMO_STORES.find((d) => d.theme === m.slug)!;
    const approvedAt = daysAgo(360 - i * 12);
    const stats = THEME_STATS[m.slug] ?? { installs: 100 };
    rows.push({
      id,
      slug: m.slug,
      name: m.name,
      developerId: dev.studio,
      tagline: m.tagline,
      description: m.description,
      categories: m.categories,
      tags: [...m.categories, m.price ? "premium" : "free", "mobile-first", "fast"],
      price: m.price,
      version: m.version,
      thumbnailUrl: m.thumbnail,
      screenshots: [m.thumbnail, ...demo.screenshots.map((k) => IMG[k])],
      demoStoreSlug: `${m.slug}-demo`,
      features: m.features,
      status: "approved",
      featured: !!stats.featured,
      ratingAvg: 0,
      ratingCount: 0,
      installs: stats.installs,
      repoUrl: `https://github.com/paicommerce/themes/tree/main/themes/${m.slug}`,
      reviewNotes: null,
      submittedAt: daysAgo(365 - i * 12),
      approvedAt,
      createdAt: daysAgo(370 - i * 12),
      updatedAt: approvedAt,
    });
    versions.push({ themeId: id, version: "0.9.0", changelog: "Initial beta release.", status: "approved", reviewNotes: "Looks great. Approved for beta.", submittedAt: daysAgo(365 - i * 12), reviewedAt: daysAgo(362 - i * 12), reviewerId });
    versions.push({ themeId: id, version: m.version, changelog: "Stable release: performance improvements, new sections and full customizer support.", status: "approved", reviewNotes: "Passed accessibility and performance checks.", submittedAt: approvedAt, reviewedAt: approvedAt, reviewerId });
  });

  // Third-party submissions (admin review queue)
  const horizon = uuid();
  const mosaic = uuid();
  rows.push({
    id: horizon,
    slug: "horizon",
    name: "Horizon",
    developerId: dev.nova,
    tagline: "Immersive, full-bleed theme for lifestyle and home brands",
    description: "Horizon pairs cinematic full-screen imagery with a lightning-fast product grid, sticky mini-cart and shoppable lookbooks. Built for brands that sell a lifestyle.",
    categories: ["home", "fashion", "general"],
    tags: ["premium", "lifestyle", "lookbook"],
    price: 450000,
    version: "1.0.0",
    thumbnailUrl: IMG.livingBright,
    screenshots: [IMG.livingBright, IMG.bohoLiving, IMG.pampasSofa],
    demoStoreSlug: null,
    features: ["Full-bleed hero video", "Shoppable lookbook", "Sticky mini-cart", "Mega menu", "Quick add"],
    status: "in_review",
    featured: false,
    installs: 0,
    repoUrl: "https://github.com/novathemes/horizon",
    submittedAt: daysAgo(2),
    createdAt: daysAgo(40),
    updatedAt: daysAgo(2),
  });
  versions.push({ themeId: horizon, version: "1.0.0", changelog: "First public submission. Includes 24 sections, 3 presets (Coastal, Urban, Minimal) and full RTL support.", status: "in_review", submittedAt: daysAgo(2) });
  rows.push({
    id: mosaic,
    slug: "mosaic",
    name: "Mosaic",
    developerId: dev.nova,
    tagline: "Colourful grid-based theme for gift and craft shops",
    description: "Mosaic uses a playful masonry grid and bold colour blocks to showcase gifts, crafts and small-batch goods.",
    categories: ["gifts", "handicraft"],
    tags: ["colourful", "grid"],
    price: 190000,
    version: "1.1.0",
    thumbnailUrl: IMG.abstractArt,
    screenshots: [IMG.abstractArt, IMG.watercolor],
    demoStoreSlug: null,
    features: ["Masonry grid", "Colour blocks", "Gift finder"],
    status: "rejected",
    featured: false,
    installs: 0,
    repoUrl: "https://github.com/novathemes/mosaic",
    reviewNotes: "Rejected: (1) product images are not lazy-loaded — LCP is 4.8s on a mid-range Android over 4G; (2) the cart drawer is not keyboard accessible (focus is not trapped, Esc does not close it); (3) hard-coded 'Add to cart' strings bypass translations. Please fix and resubmit.",
    submittedAt: daysAgo(21),
    createdAt: daysAgo(75),
    updatedAt: daysAgo(18),
  });
  versions.push({ themeId: mosaic, version: "1.0.0", changelog: "Initial submission.", status: "rejected", reviewNotes: "Missing required templates (search, 404). Please add and resubmit.", submittedAt: daysAgo(45), reviewedAt: daysAgo(42), reviewerId });
  versions.push({ themeId: mosaic, version: "1.1.0", changelog: "Added search and 404 templates, new colour presets.", status: "rejected", reviewNotes: rows[rows.length - 1]!.reviewNotes ?? null, submittedAt: daysAgo(21), reviewedAt: daysAgo(18), reviewerId });

  await insertMany(themes, rows);
  await insertMany(themeVersions, versions);
  void rng;
  return rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, price: r.price ?? 0, developerId: r.developerId! })) as ThemeRef[];
}
