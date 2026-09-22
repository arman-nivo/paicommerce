import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "artisan",
  name: "Artisan",
  version: "1.0.0",
  tagline: "Earthy, story-driven theme for handicrafts & art",
  description:
    "Unbleached-paper textures, kantha running-stitch details and handwritten notes for handmade and art businesses. Tell each maker's story, map the craft villages your pieces come from, explain made-to-order timelines and frame every product like a gallery piece with a museum label.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["handicraft", "home", "gifts"],
  tags: ["handmade", "craft", "art", "textured", "handwritten", "storytelling", "fair trade", "made to order"],
  price: 250000,
  thumbnail: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1600&q=80",
  screenshots: [
    "https://images.unsplash.com/photo-1590422749897-47036da0b0ff?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1600&q=80",
  ],
  features: [
    "Maker stories with handwritten pull-quotes",
    "Artisan profiles",
    "Craft regions map",
    "Made-to-order process & lead times",
    "Masonry workshop gallery",
    "Impact counters",
    "Framed gallery product cards",
    "Paper texture & kantha-stitch details",
    "Maker & made-to-order product blocks",
  ],
  sdk: "1.0.0",
};
