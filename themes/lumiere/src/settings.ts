/**
 * Lumière global settings: palettes per preset, the extra "Lumière style" settings group and the
 * CSS variable mapper that turns them into tokens used by the theme CSS.
 */
import type { SettingValues, SettingsGroup } from "@pai/theme-sdk";
import { extendSettingsSchema, kitCssVariables } from "@pai/theme-kit";

const shared: SettingValues = {
  heading_scale: 112,
  heading_case: "normal",
  container_width: 1360,
  section_spacing: 104,
  header_style: "logo_center",
  logo_width: 170,
  radius: 0,
  button_radius: 0,
  card_image_ratio: "square",
  card_style: "minimal",
  card_text_align: "center",
  card_show_vendor: false,
  card_show_rating: false,
  card_quick_add: false,
  card_hover_swap: true,
  card_show_sale_badge: true,
  card_show_wishlist: false,
  cart_type: "drawer",
  cart_show_free_shipping: false,
  cart_show_note: true,
  lumiere_hairlines: true,
  lumiere_heading_tracking: 2,
  lumiere_motion: true,
  lumiere_caps_buttons: true,
};

/** Default look — ivory, ink black and antique gold with Cormorant Garamond + Manrope. */
export const JEWELRY_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fbf8f2",
  color_foreground: "#111111",
  color_primary: "#111111",
  color_primary_foreground: "#fbf8f2",
  color_accent: "#b08d57",
  color_muted: "#f3ede2",
  color_border: "#e4dac8",
  color_sale: "#8c2f2f",
  color_card: "#f6f1e8",
  lumiere_gold: "#b08d57",
  font_heading: "Cormorant Garamond",
  font_body: "Manrope",
  announcement_text: "Complimentary insured delivery · Certified hallmarked gold",
};

/** Fashion — bone, espresso and champagne with Marcellus capitals for accessories & couture. */
export const FASHION_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#f7f4ef",
  color_foreground: "#1d1915",
  color_primary: "#1d1915",
  color_primary_foreground: "#f7f4ef",
  color_accent: "#a6834f",
  color_muted: "#eee8de",
  color_border: "#ddd3c3",
  color_sale: "#8c2f2f",
  color_card: "#efe9df",
  lumiere_gold: "#a6834f",
  font_heading: "Marcellus",
  font_body: "Lato",
  heading_scale: 100,
  lumiere_heading_tracking: 4,
  card_image_ratio: "portrait",
  announcement_text: "Complimentary delivery across Bangladesh · Alterations at our Gulshan studio",
};

/** Gifts — deep ink, porcelain and warm gold with Bodoni Moda for gifting boutiques. */
export const GIFTS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fcfaf6",
  color_foreground: "#15161b",
  color_primary: "#15161b",
  color_primary_foreground: "#fcfaf6",
  color_accent: "#b38b4d",
  color_muted: "#f2eee6",
  color_border: "#e3ddd0",
  color_sale: "#8c2f2f",
  color_card: "#f4efe6",
  lumiere_gold: "#b38b4d",
  font_heading: "Bodoni Moda",
  font_body: "Manrope",
  heading_scale: 100,
  lumiere_heading_tracking: 0,
  announcement_text: "Every piece gift-wrapped by hand · Handwritten card on request",
};

/** Extra global settings only Lumière has. */
export const lumiereSettingsGroups: SettingsGroup[] = [
  {
    name: "Lumière style",
    settings: [
      { type: "color", id: "lumiere_gold", label: "Gold tone", default: "#b08d57", info: "Hairline rules, prices, numerals and ornaments. Keep it close to your accent colour." },
      { type: "color", id: "color_card", label: "Product image background", default: "#f6f1e8", info: "The ivory tile behind product photos and panels." },
      { type: "checkbox", id: "lumiere_hairlines", label: "Gold hairline rules", default: true, info: "Thin gold rules around the navigation, section eyebrows and dividers." },
      { type: "range", id: "lumiere_heading_tracking", label: "Heading letter spacing", min: -2, max: 12, step: 1, unit: "%", default: 2 },
      { type: "checkbox", id: "lumiere_caps_buttons", label: "Uppercase, letter-spaced buttons", default: true },
      { type: "checkbox", id: "lumiere_motion", label: "Slow cinematic motion", default: true, info: "Ken Burns drift on heroes and gentle image zoom on hover. Always off for visitors who prefer reduced motion." },
    ],
  },
];

export function lumiereSettingsSchema(base: SettingsGroup[]): SettingsGroup[] {
  return extendSettingsSchema(base, lumiereSettingsGroups);
}

const hex = (v: unknown, fb: string) => (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : fb);

export function lumiereCssVariables(s: SettingValues): Record<string, string> {
  const vars = kitCssVariables(s);
  const gold = hex(s.lumiere_gold, hex(s.color_accent, "#b08d57"));
  const tracking = typeof s.lumiere_heading_tracking === "number" ? s.lumiere_heading_tracking : Number(s.lumiere_heading_tracking ?? 2) || 0;
  vars["--lumiere-gold"] = gold;
  vars["--lumiere-rule"] = s.lumiere_hairlines === false ? "transparent" : `color-mix(in srgb, ${gold} 55%, transparent)`;
  vars["--lumiere-rule-strong"] = s.lumiere_hairlines === false ? "var(--pai-border)" : gold;
  vars["--lumiere-rule-display"] = s.lumiere_hairlines === false ? "none" : "block";
  vars["--lumiere-tracking"] = `${tracking / 100}em`;
  vars["--lumiere-btn-transform"] = s.lumiere_caps_buttons === false ? "none" : "uppercase";
  vars["--lumiere-btn-tracking"] = s.lumiere_caps_buttons === false ? "0.02em" : "0.22em";
  vars["--lumiere-btn-size"] = s.lumiere_caps_buttons === false ? "0.95rem" : "0.72rem";
  vars["--lumiere-kb"] = s.lumiere_motion === false ? "none" : "lumiere-kenburns";
  vars["--lumiere-zoom"] = s.lumiere_motion === false ? "1" : "1.035";
  return vars;
}
