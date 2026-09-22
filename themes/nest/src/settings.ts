/**
 * Nest global settings: palettes per preset, the extra "Nest style" settings group and the CSS
 * variable mapper that turns them into tokens used by the theme CSS.
 */
import type { SettingValues, SettingsGroup } from "@pai/theme-sdk";
import { extendSettingsSchema, kitCssVariables } from "@pai/theme-kit";

const shared: SettingValues = {
  heading_scale: 100,
  heading_case: "normal",
  container_width: 1440,
  section_spacing: 88,
  header_style: "logo_left",
  logo_width: 130,
  radius: 4,
  button_radius: 2,
  card_image_ratio: "landscape",
  card_style: "standard",
  card_text_align: "left",
  card_show_vendor: false,
  card_show_rating: true,
  card_quick_add: true,
  card_hover_swap: true,
  card_show_sale_badge: true,
  card_show_wishlist: true,
  cart_type: "drawer",
  cart_show_free_shipping: true,
  cart_show_note: true,
  nest_card_frame: "plain",
  nest_card_note: "Free delivery & assembly in Dhaka",
  nest_image_zoom: true,
  emi_months: 12,
  emi_min_price: 10000,
};

/** Default look — linen, oat and walnut with a terracotta accent; Lora + Manrope. */
export const HOME_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#f6f1ea",
  color_foreground: "#2e2520",
  color_primary: "#3a2c24",
  color_primary_foreground: "#f6f1ea",
  color_accent: "#b4613d",
  color_muted: "#ece4d8",
  color_border: "#ddd1c1",
  color_sale: "#a3402a",
  color_card: "#fbf8f3",
  font_heading: "Lora",
  font_body: "Manrope",
  announcement_text: "Free delivery & white-glove assembly inside Dhaka · 0% EMI up to 12 months",
};

/** Handicraft — clay, jute and deep olive for artisan-made decor; Marcellus + Work Sans. */
export const HANDICRAFT_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#f4efe4",
  color_foreground: "#2d2a20",
  color_primary: "#4a4a2c",
  color_primary_foreground: "#f6f2e7",
  color_accent: "#a8552d",
  color_muted: "#e9e1cf",
  color_border: "#d8cdb6",
  color_sale: "#9c3b22",
  color_card: "#faf6ec",
  font_heading: "Marcellus",
  font_body: "Work Sans",
  card_image_ratio: "square",
  nest_card_note: "Handmade in Bangladesh",
  emi_min_price: 20000,
  announcement_text: "Handmade by artisans across Bangladesh · Cash on delivery in all 64 districts",
};

/** General — chalk, charcoal and olive for multi-category home & lifestyle stores; Playfair + Manrope. */
export const GENERAL_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#f8f6f2",
  color_foreground: "#23221f",
  color_primary: "#23221f",
  color_primary_foreground: "#f8f6f2",
  color_accent: "#6b7349",
  color_muted: "#eeebe4",
  color_border: "#dedad0",
  color_sale: "#b0442b",
  color_card: "#ffffff",
  font_heading: "Playfair Display",
  font_body: "Manrope",
  radius: 6,
  nest_card_frame: "framed",
  nest_card_note: "Cash on delivery nationwide",
  announcement_text: "Cash on delivery in all 64 districts · Easy 7-day returns",
};

/** Extra global settings only Nest has. */
export const nestSettingsGroups: SettingsGroup[] = [
  {
    name: "Nest style",
    settings: [
      { type: "color", id: "color_card", label: "Card & panel background", default: "#fbf8f3", info: "Framed product cards, mega menu cards and panels." },
      {
        type: "select",
        id: "nest_card_frame",
        label: "Product card style",
        default: "plain",
        options: [
          { value: "plain", label: "Plain — image on the page, thin rule under the details" },
          { value: "framed", label: "Framed — soft card with a thin border" },
        ],
      },
      { type: "text", id: "nest_card_note", label: "Product card note", default: "Free delivery & assembly in Dhaka", info: "A small line under the price on every product card, e.g. “Free assembly” or “Handmade”. Leave empty to hide." },
      { type: "checkbox", id: "nest_image_zoom", label: "Slow zoom on image hover", default: true },
      { type: "header", label: "EMI / instalments", info: "Used by the EMI product block and the financing banner." },
      { type: "range", id: "emi_months", label: "Default EMI tenure", min: 3, max: 36, step: 3, unit: " mo", default: 12 },
      { type: "number", id: "emi_min_price", label: "Minimum price for EMI (৳)", min: 0, default: 10000, info: "Most Bangladeshi banks offer 0% EMI on card purchases from ৳5,000–৳10,000." },
    ],
  },
];

export function nestSettingsSchema(base: SettingsGroup[]): SettingsGroup[] {
  return extendSettingsSchema(base, nestSettingsGroups);
}

/** CSS `content` string, escaped. */
const cssString = (v: string) => `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]+/g, " ")}"`;

export function nestCssVariables(s: SettingValues): Record<string, string> {
  const vars = kitCssVariables(s);
  const note = typeof s.nest_card_note === "string" ? s.nest_card_note.trim() : "";
  const framed = s.nest_card_frame === "framed";
  vars["--nest-card-note"] = note ? cssString(note) : '""';
  vars["--nest-card-note-display"] = note ? "flex" : "none";
  vars["--nest-card-pad"] = framed ? "0.75rem" : "0px";
  vars["--nest-card-border"] = framed ? "1px solid var(--pai-border)" : "0 solid transparent";
  vars["--nest-card-surface"] = framed ? "var(--pai-card)" : "transparent";
  vars["--nest-zoom"] = s.nest_image_zoom === false ? "1" : "1.045";
  return vars;
}
