import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "bloom",
  name: "Bloom",
  version: "1.0.0",
  tagline: "Soft, elegant theme for beauty & cosmetics",
  description:
    "Blush palettes, airy serif typography and soft-shadow cards for skincare, makeup and wellness brands. Tell your ingredient story, prove results with a before/after slider, guide shoppers to a routine by skin concern and let a wall of reviews do the selling.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["beauty", "health", "gifts"],
  tags: ["skincare", "cosmetics", "pastel", "serif", "routine builder", "before after", "reviews"],
  price: 290000,
  thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1600&q=80",
  screenshots: [
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1571875257727-256c39da42af?auto=format&fit=crop&w=1600&q=80",
  ],
  features: [
    "Ingredient highlights",
    "Before / after slider",
    "Routine builder by skin concern",
    "Reviews wall",
    "Shop the look",
    "Instagram-style gallery",
    "Skin profile & how-to-use product blocks",
  ],
  sdk: "1.0.0",
};
