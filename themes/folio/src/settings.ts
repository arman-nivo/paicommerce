/**
 * Folio palettes (one per preset) and the theme's extra global settings ("Folio" group).
 */
import type { SettingValues, SettingsGroup } from "@pai/theme-sdk";
import { extendSettingsSchema } from "@pai/theme-kit";

const shared: SettingValues = {
  heading_case: "normal",
  container_width: 1320,
  section_spacing: 88,
  header_style: "logo_left",
  logo_width: 150,
  card_image_ratio: "tall",
  card_style: "standard",
  card_text_align: "left",
  card_show_vendor: false,
  card_show_rating: true,
  card_quick_add: true,
  card_hover_swap: false,
  card_show_sale_badge: true,
  card_show_wishlist: true,
  cart_type: "drawer",
  cart_show_free_shipping: true,
  card_show_author: true,
  card_show_format: true,
  card_book_effect: "auto",
  digital_badge_label: "Digital",
  digital_product_types: "eBook, Online Course, Course, Audiobook, Digital",
  digital_tag: "digital",
};

/** Books (default): paper & ink, oxblood primary, gilt accent — Libre Baskerville + Work Sans. */
export const BOOKS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#f8f4eb",
  color_foreground: "#211c18",
  color_primary: "#6e1f2b",
  color_primary_foreground: "#fbf7ef",
  color_accent: "#a8792f",
  color_muted: "#efe8d9",
  color_border: "#ddd2bf",
  color_sale: "#a3261f",
  font_heading: "Libre Baskerville",
  font_body: "Work Sans",
  heading_scale: 95,
  radius: 2,
  button_radius: 2,
  announcement_text: "Free delivery inside Dhaka on orders over ৳1,500 · Cash on delivery nationwide",
};

/** Digital: clean white, ink navy and indigo — Sora + Inter. */
export const DIGITAL_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#ffffff",
  color_foreground: "#0f172a",
  color_primary: "#4338ca",
  color_primary_foreground: "#ffffff",
  color_accent: "#0891b2",
  color_muted: "#f4f5fb",
  color_border: "#e3e6f0",
  color_sale: "#e11d48",
  font_heading: "Sora",
  font_body: "Inter",
  heading_scale: 95,
  radius: 12,
  button_radius: 10,
  section_spacing: 80,
  card_book_effect: "flat",
  announcement_text: "Instant download after payment · Pay with bKash, Nagad or card",
};

/** General: warm ivory, bottle green and brass — Fraunces + DM Sans. */
export const GENERAL_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fbfaf6",
  color_foreground: "#1d1f1c",
  color_primary: "#1f4d3a",
  color_primary_foreground: "#f7f5ee",
  color_accent: "#b7813a",
  color_muted: "#f0eee6",
  color_border: "#e1ddd1",
  color_sale: "#b42318",
  font_heading: "Fraunces",
  font_body: "DM Sans",
  heading_scale: 100,
  radius: 4,
  button_radius: 4,
  announcement_text: "Free delivery on orders over ৳2,000 · Cash on delivery all over Bangladesh",
};

/** Adds the "Folio" group (book cards & digital products) to the kit's global settings. */
export function folioSettingsSchema(base: SettingsGroup[]): SettingsGroup[] {
  return extendSettingsSchema(base, [
    {
      name: "Folio — books & digital",
      settings: [
        { type: "header", label: "Book cards", info: "Folio shows book covers at 2:3 with a subtle spine and shadow." },
        { type: "checkbox", id: "card_show_author", label: "Show author line", default: true, info: "Uses the vendor, or the part of the title after “ — ” (e.g. “Atomic Habits — James Clear”)." },
        { type: "checkbox", id: "card_show_format", label: "Show format hint (e.g. Paperback · Hardcover)", default: true },
        {
          type: "select",
          id: "card_book_effect",
          label: "Cover effect",
          default: "auto",
          options: [
            { value: "auto", label: "Spine & shadow on books only" },
            { value: "spine", label: "Spine & shadow on every product" },
            { value: "flat", label: "Flat (no spine)" },
          ],
        },
        { type: "header", label: "Digital products" },
        { type: "text", id: "digital_badge_label", label: "Digital badge label", default: "Digital" },
        { type: "text", id: "digital_product_types", label: "Digital product types", default: "eBook, Online Course, Course, Audiobook, Digital", info: "Comma separated. Products of these types get the digital badge and instant-download copy." },
        { type: "text", id: "digital_tag", label: "Digital tag", default: "digital", info: "Products with this tag are also treated as digital." },
      ],
    },
  ]);
}
