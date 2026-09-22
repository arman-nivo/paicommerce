import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "freshmart",
  name: "FreshMart",
  version: "1.0.0",
  tagline: "Fast, practical grocery & supermarket theme",
  description:
    "Built for daily-needs shopping the way people really do it on their phones: a delivery-area bar and 60-minute promise, a big predictive search, category icon rows, cards with weight/pack chips and one-tap Add → quantity steppers, deals of the day with a midnight countdown and an app-style bottom navigation.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["grocery", "health", "general"],
  tags: ["grocery", "supermarket", "pharmacy", "quick commerce", "mobile-first"],
  price: 0,
  thumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
  screenshots: [
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1600&q=80",
  ],
  features: [
    "Delivery-area picker & delivery promise bar",
    "Weight/pack chips with Add → quantity stepper on every card",
    "Deals of the day with midnight countdown",
    "Category icon grid & product rails by category",
    "Mobile bottom navigation with live basket total",
    "App download / offer banner with copyable code",
  ],
  sdk: "1.0.0",
};
