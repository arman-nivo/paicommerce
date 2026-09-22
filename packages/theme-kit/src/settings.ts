/**
 * The standard global settings schema shared by every theme built on the kit.
 * Setting ids follow the SDK conventions so they map to CSS variables automatically
 * (see `defaultCssVariables` in @pai/theme-sdk and `kitCssVariables`).
 */
import { FONT_CHOICES, type SettingField, type SettingValues, type SettingsGroup, type BusinessCategory } from "@pai/theme-sdk";

const fonts = FONT_CHOICES;

/** Standard global settings. Extend with `extendSettingsSchema`, change defaults with `withSettingDefaults`. */
export const baseSettingsSchema: SettingsGroup[] = [
  {
    name: "Colors",
    settings: [
      { type: "color", id: "color_background", label: "Background", default: "#ffffff" },
      { type: "color", id: "color_foreground", label: "Text", default: "#111111" },
      { type: "color", id: "color_primary", label: "Primary / buttons", default: "#111111" },
      { type: "color", id: "color_primary_foreground", label: "Button text", default: "#ffffff" },
      { type: "color", id: "color_accent", label: "Accent", default: "#e11d48", info: "Badges, highlights and accent buttons." },
      { type: "color", id: "color_muted", label: "Muted background", default: "#f5f5f4", info: "Used by muted sections, cards and inputs." },
      { type: "color", id: "color_border", label: "Borders", default: "#e7e5e4" },
      { type: "color", id: "color_sale", label: "Sale price", default: "#dc2626" },
    ],
  },
  {
    name: "Typography",
    settings: [
      { type: "font", id: "font_heading", label: "Heading font", default: "Inter", options: fonts },
      { type: "font", id: "font_body", label: "Body font", default: "Inter", options: fonts },
      { type: "range", id: "heading_scale", label: "Heading size", min: 80, max: 130, step: 5, unit: "%", default: 100 },
      {
        type: "select",
        id: "heading_case",
        label: "Heading style",
        default: "normal",
        options: [
          { value: "normal", label: "Normal" },
          { value: "uppercase", label: "Uppercase" },
        ],
      },
    ],
  },
  {
    name: "Layout",
    settings: [
      { type: "range", id: "container_width", label: "Page width", min: 1000, max: 1600, step: 20, unit: "px", default: 1280 },
      { type: "range", id: "section_spacing", label: "Section spacing", min: 24, max: 120, step: 4, unit: "px", default: 64 },
      { type: "range", id: "radius", label: "Corner radius", min: 0, max: 24, step: 1, unit: "px", default: 8 },
      { type: "range", id: "button_radius", label: "Button radius", min: 0, max: 40, step: 1, unit: "px", default: 8 },
    ],
  },
  {
    name: "Logo & favicon",
    settings: [
      { type: "range", id: "logo_width", label: "Logo width (desktop)", min: 60, max: 260, step: 5, unit: "px", default: 120 },
      { type: "image", id: "favicon", label: "Favicon", info: "Square image, at least 32×32px. Defaults to the store favicon." },
    ],
  },
  {
    name: "Header",
    settings: [
      {
        type: "select",
        id: "header_style",
        label: "Header layout",
        default: "logo_left",
        options: [
          { value: "logo_left", label: "Logo left, menu center" },
          { value: "logo_center", label: "Logo center, menu below" },
          { value: "minimal", label: "Minimal (menu in drawer)" },
        ],
      },
    ],
  },
  {
    name: "Product cards",
    settings: [
      {
        type: "select",
        id: "card_image_ratio",
        label: "Image ratio",
        default: "portrait",
        options: [
          { value: "square", label: "Square (1:1)" },
          { value: "portrait", label: "Portrait (4:5)" },
          { value: "tall", label: "Tall (2:3)" },
          { value: "landscape", label: "Landscape (4:3)" },
        ],
      },
      {
        type: "select",
        id: "card_style",
        label: "Card style",
        default: "standard",
        options: [
          { value: "standard", label: "Standard" },
          { value: "card", label: "Card with border" },
          { value: "minimal", label: "Minimal" },
          { value: "overlay", label: "Info overlay" },
        ],
      },
      {
        type: "select",
        id: "card_text_align",
        label: "Text alignment",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
        ],
      },
      { type: "checkbox", id: "card_show_vendor", label: "Show vendor", default: false },
      { type: "checkbox", id: "card_show_rating", label: "Show rating", default: true },
      { type: "checkbox", id: "card_quick_add", label: "Enable quick add", default: true },
      { type: "checkbox", id: "card_hover_swap", label: "Show second image on hover", default: true },
      { type: "checkbox", id: "card_show_sale_badge", label: "Show sale badge", default: true },
      { type: "checkbox", id: "card_show_wishlist", label: "Show wishlist button", default: true },
    ],
  },
  {
    name: "Cart",
    settings: [
      {
        type: "select",
        id: "cart_type",
        label: "Cart type",
        default: "drawer",
        options: [
          { value: "drawer", label: "Slide-out drawer" },
          { value: "page", label: "Cart page" },
        ],
      },
      { type: "checkbox", id: "cart_show_free_shipping", label: "Show free-shipping progress", default: true },
      { type: "checkbox", id: "cart_show_note", label: "Show order note on cart page", default: false },
      { type: "checkbox", id: "buy_now_direct_checkout", label: "Buy now goes straight to checkout", default: true },
    ],
  },
  {
    name: "Currency",
    settings: [
      {
        type: "select",
        id: "currency_display",
        label: "Currency format",
        default: "symbol",
        options: [
          { value: "symbol", label: "Symbol (৳1,250)" },
          { value: "code", label: "Code (BDT 1,250)" },
          { value: "symbol_code", label: "Symbol + code (৳1,250 BDT)" },
        ],
      },
    ],
  },
  {
    name: "Social media",
    settings: [
      { type: "url", id: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
      { type: "url", id: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/yourbrand" },
      { type: "url", id: "social_youtube", label: "YouTube" },
      { type: "url", id: "social_tiktok", label: "TikTok" },
      { type: "url", id: "social_x", label: "X (Twitter)" },
      { type: "text", id: "social_whatsapp", label: "WhatsApp number", placeholder: "01XXXXXXXXX" },
      { type: "header", label: "Leave empty to use the social links from your store settings." },
    ],
  },
  {
    name: "Announcement",
    settings: [
      { type: "text", id: "announcement_text", label: "Default announcement", default: "Free delivery on orders over ৳2,000 · Cash on delivery available" },
      { type: "url", id: "announcement_link", label: "Announcement link" },
    ],
  },
];

/** Every base setting id (handy for validation / docs). */
export const BASE_SETTING_IDS = baseSettingsSchema.flatMap((g) => g.settings).flatMap((s) => (s.type === "header" ? [] : [s.id]));

/**
 * Return a copy of `groups` with new default values (e.g. brand colours / fonts for a theme).
 * @example withSettingDefaults(baseSettingsSchema, { color_primary: "#0f766e", font_heading: "Fraunces" })
 */
export function withSettingDefaults(groups: SettingsGroup[], defaults: SettingValues): SettingsGroup[] {
  return groups.map((g) => ({
    ...g,
    settings: g.settings.map((s) => (s.type !== "header" && s.id in defaults ? ({ ...s, default: defaults[s.id] } as SettingField) : s)),
  }));
}

/**
 * Merge extra groups into a settings schema. Groups with an existing name are appended to;
 * new groups are added at the end (or at `position`). Settings with an existing id replace it.
 */
export function extendSettingsSchema(base: SettingsGroup[], extra: SettingsGroup[]): SettingsGroup[] {
  const out = base.map((g) => ({ ...g, settings: [...g.settings] }));
  for (const eg of extra) {
    const target = out.find((g) => g.name === eg.name);
    if (!target) {
      out.push({ ...eg, settings: [...eg.settings] });
      continue;
    }
    for (const s of eg.settings) {
      const idx = s.type === "header" ? -1 : target.settings.findIndex((x) => x.type !== "header" && x.id === s.id);
      if (idx >= 0) target.settings[idx] = s;
      else target.settings.push(s);
    }
  }
  // An id may only live in one group: drop duplicates from earlier groups.
  const seen = new Set<string>();
  for (let i = out.length - 1; i >= 0; i--) {
    out[i]!.settings = out[i]!.settings
      .slice()
      .reverse()
      .filter((s) => {
        if (s.type === "header") return true;
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      })
      .reverse();
  }
  return out;
}

/* ─────────────────────────── category palettes ─────────────────────────── */

/**
 * Sensible colour/typography defaults by business category. `createBaseTheme` uses the first
 * category of the manifest as the default look and exposes one preset per manifest category,
 * so even a bare `createBaseTheme({ manifest })` theme looks tailored to its niche.
 */
export const CATEGORY_STYLES: Record<BusinessCategory, SettingValues> = {
  fashion: { color_background: "#ffffff", color_foreground: "#141414", color_primary: "#141414", color_primary_foreground: "#ffffff", color_accent: "#b45309", color_muted: "#f6f4f1", color_border: "#e8e4de", font_heading: "Playfair Display", font_body: "Inter", radius: 0, button_radius: 0, card_image_ratio: "portrait" },
  electronics: { color_background: "#0b0f19", color_foreground: "#e8edf7", color_primary: "#3b82f6", color_primary_foreground: "#ffffff", color_accent: "#22d3ee", color_muted: "#131a2a", color_border: "#1f2940", color_sale: "#f43f5e", font_heading: "Space Grotesk", font_body: "Inter", radius: 12, button_radius: 10, card_image_ratio: "square", card_style: "card" },
  grocery: { color_background: "#ffffff", color_foreground: "#1f2a1f", color_primary: "#16a34a", color_primary_foreground: "#ffffff", color_accent: "#f59e0b", color_muted: "#f2f7f1", color_border: "#e2eadf", font_heading: "Poppins", font_body: "Poppins", radius: 12, button_radius: 999, card_image_ratio: "square", card_style: "card" },
  beauty: { color_background: "#fffafa", color_foreground: "#3a2530", color_primary: "#c0587e", color_primary_foreground: "#ffffff", color_accent: "#e9a6b9", color_muted: "#fbeff2", color_border: "#f1dde3", font_heading: "Cormorant Garamond", font_body: "DM Sans", radius: 16, button_radius: 999, card_image_ratio: "portrait" },
  home: { color_background: "#faf8f5", color_foreground: "#2b2622", color_primary: "#2b2622", color_primary_foreground: "#faf8f5", color_accent: "#a16207", color_muted: "#f1ece4", color_border: "#e4dcd0", font_heading: "Fraunces", font_body: "Manrope", radius: 6, button_radius: 4, card_image_ratio: "landscape" },
  food: { color_background: "#fffbf5", color_foreground: "#2a1a10", color_primary: "#c2410c", color_primary_foreground: "#ffffff", color_accent: "#eab308", color_muted: "#fdf1e3", color_border: "#f1e0cc", font_heading: "DM Serif Display", font_body: "DM Sans", radius: 14, button_radius: 999, card_image_ratio: "square" },
  jewelry: { color_background: "#fcfbf8", color_foreground: "#1c1a17", color_primary: "#1c1a17", color_primary_foreground: "#f7f1e3", color_accent: "#b8912f", color_muted: "#f4f0e7", color_border: "#e7e0d0", font_heading: "Cormorant Garamond", font_body: "Manrope", radius: 0, button_radius: 0, card_image_ratio: "square" },
  health: { color_background: "#ffffff", color_foreground: "#0f2a3a", color_primary: "#0e7490", color_primary_foreground: "#ffffff", color_accent: "#10b981", color_muted: "#eef7fa", color_border: "#d9e9ef", font_heading: "Plus Jakarta Sans", font_body: "Plus Jakarta Sans", radius: 12, button_radius: 10, card_image_ratio: "square", card_style: "card" },
  kids: { color_background: "#fffdf7", color_foreground: "#2d2250", color_primary: "#7c3aed", color_primary_foreground: "#ffffff", color_accent: "#f97316", color_muted: "#f6f0ff", color_border: "#e9e0fb", font_heading: "Fredoka", font_body: "Nunito", radius: 20, button_radius: 999, card_image_ratio: "square", card_style: "card" },
  sports: { color_background: "#ffffff", color_foreground: "#0a0a0a", color_primary: "#0a0a0a", color_primary_foreground: "#d9f99d", color_accent: "#84cc16", color_muted: "#f4f4f5", color_border: "#e4e4e7", font_heading: "Oswald", font_body: "Inter", radius: 4, button_radius: 4, heading_case: "uppercase", card_image_ratio: "square" },
  books: { color_background: "#fbf9f4", color_foreground: "#23201b", color_primary: "#7c2d12", color_primary_foreground: "#ffffff", color_accent: "#0f766e", color_muted: "#f2eee4", color_border: "#e3ddd0", font_heading: "Libre Baskerville", font_body: "Lora", radius: 4, button_radius: 4, card_image_ratio: "tall" },
  digital: { color_background: "#ffffff", color_foreground: "#111827", color_primary: "#4f46e5", color_primary_foreground: "#ffffff", color_accent: "#ec4899", color_muted: "#f5f5ff", color_border: "#e5e7f5", font_heading: "Sora", font_body: "Inter", radius: 14, button_radius: 10, card_image_ratio: "landscape", card_style: "card" },
  handicraft: { color_background: "#fbf7f0", color_foreground: "#3b2a1e", color_primary: "#9a3412", color_primary_foreground: "#fff7ed", color_accent: "#15803d", color_muted: "#f3eadc", color_border: "#e6d8c3", font_heading: "Marcellus", font_body: "Work Sans", radius: 6, button_radius: 6, card_image_ratio: "portrait" },
  automotive: { color_background: "#111111", color_foreground: "#f5f5f5", color_primary: "#dc2626", color_primary_foreground: "#ffffff", color_accent: "#facc15", color_muted: "#1c1c1c", color_border: "#2c2c2c", font_heading: "Archivo", font_body: "Inter", radius: 4, button_radius: 4, heading_case: "uppercase", card_image_ratio: "landscape", card_style: "card" },
  pets: { color_background: "#fffdf8", color_foreground: "#2b2b2b", color_primary: "#ea580c", color_primary_foreground: "#ffffff", color_accent: "#0ea5e9", color_muted: "#fff4e8", color_border: "#f3e3d0", font_heading: "Baloo 2", font_body: "Nunito", radius: 16, button_radius: 999, card_image_ratio: "square", card_style: "card" },
  gifts: { color_background: "#fffafb", color_foreground: "#2e1f28", color_primary: "#be185d", color_primary_foreground: "#ffffff", color_accent: "#f59e0b", color_muted: "#fdf0f4", color_border: "#f3dde6", font_heading: "DM Serif Display", font_body: "DM Sans", radius: 12, button_radius: 999, card_image_ratio: "square" },
  general: { color_background: "#ffffff", color_foreground: "#111827", color_primary: "#111827", color_primary_foreground: "#ffffff", color_accent: "#f97316", color_muted: "#f5f5f5", color_border: "#e5e7eb", font_heading: "Manrope", font_body: "Inter", radius: 10, button_radius: 8, card_image_ratio: "square" },
};
