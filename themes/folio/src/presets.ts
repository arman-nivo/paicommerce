/** Folio presets — one per manifest category (preset.id must equal the category id). */
import type { SectionList, ThemePreset } from "@pai/theme-sdk";
import { categoryPreset } from "@pai/theme-kit";
import { IMG } from "./images";
import { booksIndex, digitalIndex, footerGroup, generalIndex, headerGroup } from "./config";
import { BOOKS_SETTINGS, DIGITAL_SETTINGS, GENERAL_SETTINGS } from "./settings";

export const TAGORE = "The butterfly counts not months but moments, and has time enough.";

export function booksGroups(): { header: SectionList; footer: SectionList } {
  return {
    header: headerGroup({
      messages: ["Free delivery inside Dhaka on orders over ৳1,500", "Cash on delivery nationwide · bKash & Nagad accepted", "Free gift wrapping with a handwritten note"],
    }),
    footer: footerGroup({
      about: "An independent bookshop in Banani for curious readers — Bangla classics, new fiction, ideas worth arguing about and beautiful things to write with.",
      quote: TAGORE,
      quoteAuthor: "Rabindranath Tagore, Fireflies",
    }),
  };
}

function digitalGroups(): { header: SectionList; footer: SectionList } {
  return {
    header: headerGroup({
      messages: ["Instant download after payment", "Pay with bKash, Nagad or card", "Lifetime access to every course"],
      tagline: "eBooks · Courses · Downloads",
      placeholder: "Search courses, eBooks and topics…",
      note: "Delivered instantly — no courier needed",
      genres: [
        { label: "All courses", collection: "courses", highlight: true },
        { label: "eBooks", link: "/search?q=ebook" },
        { label: "Self-help & Business", collection: "non-fiction" },
        { label: "Bestsellers", collection: "bestsellers" },
        { label: "Guides", link: "/blog" },
      ],
    }),
    footer: footerGroup({
      about: "Instant-download eBooks and self-paced courses from teachers you can trust — made for learners across Bangladesh.",
      quote: "Let me not pray to be sheltered from dangers but to be fearless in facing them.",
      quoteAuthor: "Rabindranath Tagore, Fruit-Gathering",
      letter: "New courses, free study guides and early-bird prices — once a month.",
      colophon: "Set in Sora & Inter. Delivered at the speed of light.",
    }),
  };
}

function generalGroups(): { header: SectionList; footer: SectionList } {
  return {
    header: headerGroup({
      messages: ["Free delivery on orders over ৳2,000", "Cash on delivery all over Bangladesh", "Gift wrapping available"],
      tagline: "Books · Stationery · Gifts",
      placeholder: "Search the shop…",
      note: "Cash on delivery in all 64 districts",
      genres: [
        { label: "New in", link: "/collections/all", highlight: true },
        { label: "Books", collection: "bestsellers" },
        { label: "Stationery", collection: "stationery" },
        { label: "Courses", collection: "courses" },
        { label: "All collections", link: "/collections" },
      ],
    }),
    footer: footerGroup({
      about: "A carefully chosen shop of books, stationery and small gifts — packed with care and delivered across Bangladesh.",
      quote: "Stray birds of summer come to my window to sing and fly away.",
      quoteAuthor: "Rabindranath Tagore, Stray Birds",
      letter: "New arrivals, gift ideas and members-only offers — once a month, never more.",
      colophon: "Set in Fraunces & DM Sans. Packed with care in Dhaka.",
    }),
  };
}

export const presets: ThemePreset[] = [
  categoryPreset("books", {
    name: "Bookshop",
    description: "Paper-white and ink with an oxblood accent, Libre Baskerville headings, a bestseller chart, author spotlight, reading sample and book of the month.",
    thumbnail: IMG.library,
    settings: BOOKS_SETTINGS,
    templates: { index: booksIndex() },
    groups: booksGroups(),
  }),
  categoryPreset("digital", {
    name: "Digital products & courses",
    description: "Clean white and indigo with Sora headings — instant-download messaging, course listings, top downloads and an access FAQ.",
    thumbnail: IMG.ebookLaptop,
    settings: DIGITAL_SETTINGS,
    templates: { index: digitalIndex() },
    groups: digitalGroups(),
  }),
  categoryPreset("general", {
    name: "General store",
    description: "Warm ivory and bottle green with Fraunces headings — a calm, editorial shop for books, stationery and gifts.",
    thumbnail: IMG.bookCoffee,
    settings: GENERAL_SETTINGS,
    templates: { index: generalIndex() },
    groups: generalGroups(),
  }),
];
