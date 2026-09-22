import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "lumiere",
  name: "Lumière",
  version: "1.0.0",
  tagline: "Luxury serif theme for jewelry & premium goods",
  description:
    "Ivory, black and a whisper of gold. Lumière sets fine jewellery the way a maison would — a cinematic full-screen hero with a slow Ken Burns drift, collection stories told in chapters, a heritage timeline drawn on a gold rule, a gift guide by recipient and budget, and an elegant invitation to a private viewing at your atelier. Hairline rules, Cormorant serif and plenty of negative space do the rest.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["jewelry", "fashion", "gifts"],
  tags: ["jewellery", "luxury", "serif", "gold", "bridal", "watches", "editorial", "minimal"],
  price: 490000,
  thumbnail: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80",
  screenshots: [
    "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1618403088890-3d9ff6f4c8b1?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1590166223826-12dee1677420?auto=format&fit=crop&w=1600&q=80",
  ],
  features: [
    "Luxury typography",
    "Cinematic full-screen hero (image or video)",
    "Collection storytelling",
    "Heritage timeline",
    "Gift guide by recipient & budget",
    "Appointment booking CTA",
    "As-seen-in press",
    "Gift messaging",
    "Certification & hallmark product block",
    "Zoom gallery",
  ],
  sdk: "1.0.0",
};
