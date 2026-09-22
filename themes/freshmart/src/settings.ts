/**
 * FreshMart global setting defaults (palettes per preset) and extra theme settings.
 */
import type { SettingValues, SettingsGroup } from "@pai/theme-sdk";
import { extendSettingsSchema } from "@pai/theme-kit";

const shared: SettingValues = {
  heading_scale: 100,
  heading_case: "normal",
  container_width: 1360,
  section_spacing: 56,
  header_style: "logo_left",
  logo_width: 130,
  card_image_ratio: "square",
  card_style: "card",
  card_text_align: "left",
  card_show_vendor: false,
  card_show_rating: false,
  card_quick_add: true,
  card_hover_swap: false,
  card_show_sale_badge: true,
  card_show_wishlist: true,
  cart_type: "drawer",
  cart_show_free_shipping: true,
  buy_now_direct_checkout: true,
  fm_card_eta: "60 min",
  fm_fresh_badge: "Fresh today",
};

/** Default look: leafy green, citrus orange, crisp white — fast and friendly. */
export const GROCERY_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#ffffff",
  color_foreground: "#15231a",
  color_primary: "#0b8a43",
  color_primary_foreground: "#ffffff",
  color_accent: "#f97316",
  color_muted: "#f2f6f0",
  color_border: "#e1e9df",
  color_sale: "#e11d48",
  font_heading: "Plus Jakarta Sans",
  font_body: "Inter",
  radius: 14,
  button_radius: 12,
  announcement_text: "Free delivery on baskets over ৳999 · Cash on delivery",
};

/** Health & pharmacy: clinical teal, calm blue-grey, trustworthy. */
export const HEALTH_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#ffffff",
  color_foreground: "#0f2531",
  color_primary: "#0e7490",
  color_primary_foreground: "#ffffff",
  color_accent: "#10b981",
  color_muted: "#eef6f8",
  color_border: "#d8e7ec",
  color_sale: "#dc2626",
  font_heading: "Manrope",
  font_body: "Inter",
  radius: 12,
  button_radius: 10,
  fm_card_eta: "2 hrs",
  fm_fresh_badge: "",
  announcement_text: "Genuine medicines · Delivery in 2 hours · Upload your prescription",
};

/** General store: bold supermarket red and navy. */
export const GENERAL_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#ffffff",
  color_foreground: "#141b2d",
  color_primary: "#1d3a8a",
  color_primary_foreground: "#ffffff",
  color_accent: "#e63946",
  color_muted: "#f3f5fa",
  color_border: "#e1e5ef",
  color_sale: "#e63946",
  font_heading: "Outfit",
  font_body: "Inter",
  radius: 12,
  button_radius: 10,
  fm_card_eta: "Same day",
  announcement_text: "Everything for home, delivered today · Cash on delivery",
};

/** Extra global settings shown under "FreshMart" in the customizer. */
export const freshSettingsSchema = (base: SettingsGroup[]): SettingsGroup[] =>
  extendSettingsSchema(base, [
    {
      name: "Product cards",
      settings: [
        { type: "text", id: "fm_card_eta", label: "Delivery time badge on cards", default: "60 min", info: "e.g. 60 min, 2 hrs, Same day. Leave empty to hide." },
        { type: "text", id: "fm_fresh_badge", label: "Fresh-produce badge", default: "Fresh today", info: "Shown on fruit, vegetables, meat, fish, dairy, eggs and bakery (by product type). Leave empty to hide." },
      ],
    },
  ]);
