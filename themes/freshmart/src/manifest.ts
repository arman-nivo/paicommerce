import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "freshmart",
  name: "FreshMart",
  version: "1.0.0",
  tagline: "Fast, practical grocery & supermarket theme",
  description: "Designed for daily-needs shopping: category-first navigation, quick add buttons, weight/unit variants, delivery slot banners and mobile-first speed.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["grocery", "health", "general"],
  price: 0,
  thumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
  features: ["Quick add to cart", "Category rails", "Delivery banners", "Unit variants", "Mobile bottom nav"],
  sdk: "1.0.0",
};
