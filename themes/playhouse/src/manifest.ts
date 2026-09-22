import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "playhouse",
  name: "Playhouse",
  version: "1.0.0",
  tagline: "Playful, colourful theme for kids, toys & pets",
  tags: ["playful", "colourful", "kids", "toys", "pets", "gifts"],
  description:
    "Rounded shapes, bright colours and wavy edges that make shopping fun for parents and pet lovers alike — with shop-by-age tiles, a gift finder, bundle deals, parent reviews and a pet corner.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["kids", "pets", "gifts"],
  price: 0,
  thumbnail: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=1600",
  screenshots: [
    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=1600",
  ],
  features: ["Shop by age", "Playful badges", "Gift finder", "Colourful categories", "Bundle deals", "Parent testimonials", "Pet corner", "Wishlist panel"],
  sdk: "1.0.0",
};
