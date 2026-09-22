import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "bazaar",
  name: "Bazaar",
  version: "1.0.0",
  tagline: "Dense marketplace-style theme for multi-category stores",
  description:
    "A high-conversion marketplace layout: big category search, a category sidebar with a multi-banner hero, flash sales with countdown and sold meters, dense product rails, top brands and an endless “Just for you” feed — familiar to shoppers of large marketplaces.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["general", "electronics", "grocery", "fashion"],
  tags: ["marketplace", "multi-category", "dense", "flash sale", "mega menu"],
  price: 0,
  thumbnail: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80",
  screenshots: [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1600&q=80",
  ],
  features: [
    "Search with category picker",
    "Category sidebar + multi-banner hero",
    "Flash sale countdown with sold meters",
    "Dense 6-column product rails",
    "Top brands",
    "“Just for you” load-more feed",
    "COD & free-delivery card chips",
  ],
  sdk: "1.0.0",
};
