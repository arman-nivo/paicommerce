/**
 * Artisan global settings: palettes per preset, the extra "Artisan style" group (paper texture,
 * kantha stitches, handwritten accent font, gallery card frame) and the CSS variable mapper that
 * turns them into tokens used by the theme CSS.
 */
import type { SettingValues, SettingsGroup } from "@pai/theme-sdk";
import { extendSettingsSchema, kitCssVariables } from "@pai/theme-kit";

/** Handwritten / accent families offered for `font_accent` (any Google family loads). */
export const ACCENT_FONTS = ["Caveat", "Kalam", "Reenie Beanie", "Nanum Pen Script", "Patrick Hand", "Homemade Apple", "Fraunces", "Cormorant Garamond", "Lora"];
/** Accent fonts that are not handwritten — rendered in italic instead. */
const SERIF_ACCENTS = new Set(["Fraunces", "Cormorant Garamond", "Lora", "Playfair Display", "Libre Baskerville"]);

const shared: SettingValues = {
  heading_scale: 100,
  heading_case: "normal",
  container_width: 1320,
  section_spacing: 92,
  header_style: "logo_center",
  logo_width: 150,
  radius: 4,
  button_radius: 2,
  card_image_ratio: "portrait",
  card_style: "standard",
  card_text_align: "left",
  card_show_vendor: true,
  card_show_rating: false,
  card_quick_add: true,
  card_hover_swap: true,
  card_show_sale_badge: true,
  card_show_wishlist: true,
  cart_type: "drawer",
  cart_show_free_shipping: true,
  cart_show_note: true,
  artisan_paper: true,
  artisan_paper_strength: 45,
  artisan_stitch: true,
  artisan_card_frame: "mat",
};

/** Default look — unbleached paper, bark, terracotta and indigo; Marcellus + Work Sans + Caveat. */
export const HANDICRAFT_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#f6f0e6",
  color_foreground: "#3a2a20",
  color_primary: "#3a2a20",
  color_primary_foreground: "#f6f0e6",
  color_accent: "#b5552f",
  color_muted: "#ede3d2",
  color_border: "#dccdb6",
  color_sale: "#a4412a",
  color_card: "#fbf7ef",
  color_indigo: "#2f4a6d",
  font_heading: "Marcellus",
  font_body: "Work Sans",
  font_accent: "Caveat",
  announcement_text: "Every piece is made by hand in Bangladesh · Cash on delivery in all 64 districts",
};

/** Home & decor — clay, leaf green and linen; Fraunces + Lato + Kalam. */
export const HOME_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#f3eee5",
  color_foreground: "#2f2a22",
  color_primary: "#3f4f36",
  color_primary_foreground: "#f5f1e8",
  color_accent: "#a8623a",
  color_muted: "#e7e0d1",
  color_border: "#d6ccb8",
  color_sale: "#a4412a",
  color_card: "#faf7f0",
  color_indigo: "#3f4f36",
  font_heading: "Fraunces",
  font_body: "Lato",
  font_accent: "Kalam",
  card_image_ratio: "square",
  artisan_card_frame: "frame",
  announcement_text: "Free delivery on home pieces over ৳5,000 · Made to order in 3–4 weeks",
};

/** Gifts — madder red, turmeric and kraft paper; Cormorant Garamond + Work Sans + Caveat. */
export const GIFTS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#f8f1e8",
  color_foreground: "#3b2327",
  color_primary: "#7a2f2b",
  color_primary_foreground: "#fbf4ea",
  color_accent: "#c7832f",
  color_muted: "#f0e3d3",
  color_border: "#e2d1bd",
  color_sale: "#a4412a",
  color_card: "#fdf9f2",
  color_indigo: "#7a2f2b",
  font_heading: "Cormorant Garamond",
  font_body: "Work Sans",
  font_accent: "Caveat",
  heading_scale: 110,
  artisan_card_frame: "mat",
  announcement_text: "Wrapped in kraft paper with a handwritten card — free on every gift",
};

/** Extra global settings only Artisan has. */
export const artisanSettingsGroups: SettingsGroup[] = [
  {
    name: "Artisan style",
    settings: [
      {
        type: "font",
        id: "font_accent",
        label: "Handwritten accent font",
        default: "Caveat",
        options: ACCENT_FONTS,
        info: "Used for notes, pull-quotes, signatures and *starred* words in headings. Serif choices render in italic.",
      },
      { type: "color", id: "color_card", label: "Paper / mat colour", default: "#fbf7ef", info: "Product-card mats, labels and panels." },
      { type: "color", id: "color_indigo", label: "Stitch & pin colour", default: "#2f4a6d", info: "Kantha stitches, map pins and small accents." },
      { type: "checkbox", id: "artisan_paper", label: "Paper texture", default: true, info: "A subtle, fibrous paper grain across the page, header and footer." },
      { type: "range", id: "artisan_paper_strength", label: "Paper texture strength", min: 10, max: 100, step: 5, unit: "%", default: 45 },
      { type: "checkbox", id: "artisan_stitch", label: "Kantha stitch details", default: true, info: "Running-stitch borders on the header, dividers, cards and panels." },
      {
        type: "select",
        id: "artisan_card_frame",
        label: "Product card frame",
        default: "mat",
        options: [
          { value: "mat", label: "Paper mat (passe-partout)" },
          { value: "frame", label: "Wooden frame + mat" },
          { value: "none", label: "Unframed" },
        ],
      },
    ],
  },
];

export function artisanSettingsSchema(base: SettingsGroup[]): SettingsGroup[] {
  return extendSettingsSchema(base, artisanSettingsGroups);
}

/** SVG fractal noise tinted warm brown; alpha scales with the strength setting. */
function paperNoise(alpha: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .32 0 0 0 0 .22 0 0 0 0 .12 0 0 0 ${alpha.toFixed(3)} 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
  return `url("data:image/svg+xml,${svg.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23").replace(/"/g, "'")}")`;
}

const hex = (v: unknown, fb: string) => (typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v) ? v : fb);

export function artisanCssVariables(s: SettingValues): Record<string, string> {
  const vars = kitCssVariables(s);
  const accentFont = typeof s.font_accent === "string" && s.font_accent ? s.font_accent : "Caveat";
  const serif = SERIF_ACCENTS.has(accentFont);
  vars["--artisan-font-hand"] = `"${accentFont}", ${serif ? "Georgia, serif" : "'Segoe Script', 'Bradley Hand', cursive"}`;
  vars["--artisan-hand-style"] = serif ? "italic" : "normal";
  vars["--artisan-hand-scale"] = serif ? "1" : accentFont === "Homemade Apple" ? "0.9" : "1.28";
  vars["--artisan-indigo"] = hex(s.color_indigo, "#2f4a6d");
  const strength = typeof s.artisan_paper_strength === "number" ? Math.max(0, Math.min(100, s.artisan_paper_strength)) : 45;
  const on = s.artisan_paper !== false;
  vars["--artisan-paper"] = on ? paperNoise(0.05 + (strength / 100) * 0.22) : "none";
  vars["--artisan-fibres"] = on
    ? "radial-gradient(120% 80% at 10% 0%, rgb(255 255 255 / .35), transparent 60%), radial-gradient(90% 70% at 100% 100%, rgb(120 84 50 / .07), transparent 70%)"
    : "none";
  const stitch = s.artisan_stitch !== false;
  vars["--artisan-stitch"] = stitch ? "block" : "none";
  vars["--artisan-stitch-w"] = stitch ? "1.5px" : "0px";
  const frame = typeof s.artisan_card_frame === "string" ? s.artisan_card_frame : "mat";
  vars["--artisan-mat-pad"] = frame === "none" ? "0px" : "clamp(10px, 1.4vw, 16px)";
  vars["--artisan-frame-w"] = frame === "frame" ? "5px" : "0px";
  vars["--artisan-card-bg"] = frame === "none" ? "transparent" : "var(--pai-card)";
  vars["--artisan-card-line"] = frame === "none" ? "transparent" : "rgb(var(--pai-fg-rgb) / .12)";
  return vars;
}
