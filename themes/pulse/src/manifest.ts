import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "pulse",
  name: "Pulse",
  version: "1.0.0",
  tagline: "Trustworthy theme for pharmacy, health & wellness",
  description:
    "Clean medical aesthetics for pharmacies, supplement and wellness brands: a licence strip and prescription-upload button in the header, medicine search, health-need category icons, WhatsApp prescription orders, consult-a-pharmacist banner, seal-style trust badges, one-tap quick reorder and Rx notices on product pages.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["health", "beauty", "grocery"],
  tags: ["pharmacy", "medicine", "health", "wellness", "prescription", "whatsapp"],
  price: 0,
  thumbnail: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80",
  screenshots: [
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1612531386530-97286d97c2d2?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1600&q=80",
  ],
  features: [
    "Prescription upload CTA (WhatsApp or contact page)",
    "Medicine search with popular searches",
    "Health-need category icons",
    "Consult-a-pharmacist banner",
    "Trust badges & licence strip",
    "Quick reorder list",
    "Rx notice on product pages",
    "Medical disclaimer footer",
  ],
  sdk: "1.0.0",
};
