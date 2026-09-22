import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "nest",
  name: "Nest",
  version: "1.0.0",
  tagline: "Warm, spacious theme for home & furniture",
  description:
    "A calm, premium furniture-retailer look: linen and walnut palettes, generous whitespace, big landscape imagery and thin rules. Shop whole rooms from a hotspot photo, browse a room-based mega menu, tell your material and craftsmanship story, show dimension tables and 0% EMI instalments on every product, and promise white-glove delivery and assembly.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["home", "handicraft", "general"],
  tags: ["furniture", "home decor", "interiors", "mega menu", "shop the room", "EMI", "handicraft", "spacious"],
  price: 350000,
  thumbnail: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80",
  screenshots: [
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1616627561839-074385245ff6?auto=format&fit=crop&w=1600&q=80",
  ],
  features: [
    "Shop the room",
    "Room-based mega menu",
    "Shop by room tiles with product counts",
    "Material swatches & care notes",
    "Large landscape imagery",
    "Dimension tables",
    "Financing banner & 0% EMI product block",
    "Delivery & assembly promise",
  ],
  sdk: "1.0.0",
};
