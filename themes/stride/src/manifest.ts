import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "stride",
  name: "Stride",
  version: "1.0.0",
  tagline: "Bold, energetic theme for sports & fitness",
  description:
    "Oversized condensed type, a full-bleed video hero, shop-by-sport tiles, performance feature callouts and athlete stories — built for sportswear, gym equipment, activewear and outdoor gear.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["sports", "fashion", "health"],
  tags: ["bold", "video", "uppercase", "sportswear", "fitness"],
  price: 290000,
  thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80",
  screenshots: [
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1600&q=80",
  ],
  features: [
    "Video hero with giant stacked type",
    "Shop-by-sport tiles",
    "Performance feature callouts",
    "Athlete stories with shop-the-kit",
    "Countdown product drops",
    "Sport mega menu",
    "Fit & feel product block",
  ],
  sdk: "1.0.0",
};
