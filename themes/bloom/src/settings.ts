/**
 * Bloom global settings: palettes per preset, the theme's extra "Bloom style" settings and the
 * CSS variable mapper that turns them into tokens used by the theme CSS.
 */
import type { SettingValues, SettingsGroup } from "@pai/theme-sdk";
import { extendSettingsSchema, kitCssVariables } from "@pai/theme-kit";

const shared: SettingValues = {
  heading_scale: 105,
  heading_case: "normal",
  container_width: 1320,
  section_spacing: 88,
  header_style: "logo_center",
  logo_width: 140,
  card_image_ratio: "portrait",
  card_style: "standard",
  card_text_align: "center",
  card_show_vendor: false,
  card_show_rating: true,
  card_quick_add: true,
  card_hover_swap: true,
  card_show_sale_badge: true,
  card_show_wishlist: true,
  cart_type: "drawer",
  cart_show_free_shipping: true,
  color_card: "#ffffff",
  bloom_card_shadow: "soft",
  bloom_italic_accent: true,
  bloom_blobs: true,
};

/** Default look — blush, rose and cocoa with Fraunces + DM Sans. */
export const BEAUTY_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fffaf8",
  color_foreground: "#3b2a2f",
  color_primary: "#3b2a2f",
  color_primary_foreground: "#fff7f4",
  color_accent: "#d9788f",
  color_muted: "#fbeef0",
  color_border: "#f0dde1",
  color_sale: "#c2415d",
  font_heading: "Fraunces",
  font_body: "DM Sans",
  radius: 18,
  button_radius: 999,
  announcement_text: "Free delivery on orders over ৳2,500 · 100% authentic, dermatologist-approved",
};

/** Wellness — sage, cream and eucalyptus; calm and clinical-clean. */
export const WELLNESS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fbfaf6",
  color_foreground: "#26332d",
  color_primary: "#2f4a3f",
  color_primary_foreground: "#f6f8f3",
  color_accent: "#7fa38f",
  color_muted: "#eef3ec",
  color_border: "#dfe7dc",
  color_sale: "#b4533a",
  font_heading: "Fraunces",
  font_body: "Manrope",
  radius: 16,
  button_radius: 999,
  card_image_ratio: "square",
  announcement_text: "Free delivery over ৳2,000 · Pharmacist-checked, sealed & genuine",
};

/** Gifts — lilac, peony and champagne for gift boxes and hampers. */
export const GIFTS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fdfaff",
  color_foreground: "#33263f",
  color_primary: "#5b3b73",
  color_primary_foreground: "#fdf8ff",
  color_accent: "#c58fb8",
  color_muted: "#f5eefa",
  color_border: "#e9def0",
  color_sale: "#b83268",
  font_heading: "DM Serif Display",
  font_body: "DM Sans",
  radius: 20,
  button_radius: 999,
  card_image_ratio: "square",
  announcement_text: "Complimentary gift wrap & handwritten note on every order",
};

/** Extra global settings only Bloom has. */
export const bloomSettingsGroups: SettingsGroup[] = [
  {
    name: "Bloom style",
    settings: [
      { type: "color", id: "color_card", label: "Card background", default: "#ffffff", info: "Product cards, review cards and panels." },
      {
        type: "select",
        id: "bloom_card_shadow",
        label: "Product card shadow",
        default: "soft",
        options: [
          { value: "soft", label: "Soft glow" },
          { value: "float", label: "Floating (lifts on hover)" },
          { value: "none", label: "None" },
        ],
      },
      { type: "checkbox", id: "bloom_italic_accent", label: "Italic accent words in headings", default: true, info: "Wrap a word in *asterisks* in Bloom section headings to set it in italic accent colour." },
      { type: "checkbox", id: "bloom_blobs", label: "Soft decorative shapes", default: true, info: "Blurred pastel shapes behind hero and feature sections." },
    ],
  },
];

export function bloomSettingsSchema(base: SettingsGroup[]): SettingsGroup[] {
  return extendSettingsSchema(base, bloomSettingsGroups);
}

const SHADOWS: Record<string, [string, string]> = {
  soft: ["0 1px 2px rgb(var(--pai-fg-rgb) / 0.04), 0 16px 36px -20px rgb(var(--pai-fg-rgb) / 0.22)", "0 1px 2px rgb(var(--pai-fg-rgb) / 0.05), 0 22px 44px -22px rgb(var(--pai-fg-rgb) / 0.3)"],
  float: ["0 1px 2px rgb(var(--pai-fg-rgb) / 0.04), 0 18px 40px -22px rgb(var(--pai-fg-rgb) / 0.26)", "0 2px 4px rgb(var(--pai-fg-rgb) / 0.05), 0 34px 60px -28px rgb(var(--pai-fg-rgb) / 0.42)"],
  none: ["none", "none"],
};

export function bloomCssVariables(s: SettingValues): Record<string, string> {
  const vars = kitCssVariables(s);
  const shadow = typeof s.bloom_card_shadow === "string" ? s.bloom_card_shadow : "soft";
  const [rest, hover] = SHADOWS[shadow] ?? SHADOWS.soft!;
  vars["--bloom-card-shadow"] = rest;
  vars["--bloom-card-shadow-hover"] = hover;
  vars["--bloom-card-lift"] = shadow === "float" ? "-6px" : "0px";
  vars["--bloom-em-style"] = s.bloom_italic_accent === false ? "normal" : "italic";
  vars["--bloom-em-color"] = s.bloom_italic_accent === false ? "inherit" : "var(--pai-accent)";
  vars["--bloom-blobs"] = s.bloom_blobs === false ? "none" : "block";
  return vars;
}
