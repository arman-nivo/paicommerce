import type { ThemeManifest } from "@pai/theme-sdk";

export const manifest: ThemeManifest = {
  slug: "folio",
  name: "Folio",
  version: "1.0.0",
  tagline: "An editorial, search-first theme for bookshops, stationers & digital goods",
  description: "Paper-and-ink editorial design with 2:3 book-cover cards, a masthead header built around search and genres, a numbered bestseller list, author spotlights, book of the month, reading samples and instant-download messaging for eBooks and courses.",
  author: { name: "PaiCommerce Studio", url: "https://paicommerce.com" },
  categories: ["books", "digital", "general"],
  price: 0,
  thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1600",
  screenshots: [
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1504691342899-4d92b50853e1?auto=format&fit=crop&q=80&w=1600",
  ],
  features: ["Search-first masthead header", "2:3 book-cover cards with author & format", "Numbered bestseller list", "Author spotlights", "Book of the month", "Reading samples", "Genre tiles & shelf spines", "Digital downloads & courses", "Reading list (saved books)"],
  sdk: "1.0.0",
};
