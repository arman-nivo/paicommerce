import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "volt",
  name: "Volt",
  version: "1.0.0",
  tagline: "Dark, high-contrast theme for electronics & gadgets",
  description:
    "Built for tech retailers: a search-first header with category mega menu, launch hero, flash deals with live countdown, spec comparison tables, tech-spec spotlights, brand marquee and a glowing bento grid — in a bold dark aesthetic that makes products glow. Includes Midnight, Garage (automotive) and Daylight presets.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["electronics", "automotive", "general"],
  tags: ["dark", "electronics", "gadgets", "comparison", "flash-sale", "mega-menu"],
  price: 390000,
  thumbnail: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80",
  screenshots: [
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1585298723682-7115561c51b7?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80",
  ],
  features: [
    "Search-first header with category mega menu",
    "Spec comparison tables",
    "Flash deals with live countdown",
    "Tech-spec spotlight",
    "Brand marquee",
    "Bento feature grid",
    "Tabbed product rails",
    "Warranty & assurance block",
    "Dark & light presets",
  ],
  sdk: "1.0.0",
};
