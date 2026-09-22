import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "savor",
  name: "Savor",
  version: "1.0.0",
  tagline: "An appetising, menu-first theme for restaurants, cloud kitchens & bakeries",
  description: "Warm serif typography on cream paper, menu-row product cards with portion hints and dietary tags, category tabs, combo deals, live open/closed hours, delivery zones and a chef's story. Perfect for restaurants, cloud kitchens, bakeries, cafés and homemade food sellers.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["food", "gifts"],
  price: 0,
  thumbnail: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=1600",
  screenshots: [
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1600",
  ],
  features: ["Menu-row product cards", "Category tabs menu", "Combo deals", "Live opening hours", "Delivery zones & fees", "Chef's story", "Restaurant reviews", "WhatsApp ordering", "Bakery & gifting preset"],
  sdk: "1.0.0",
};
