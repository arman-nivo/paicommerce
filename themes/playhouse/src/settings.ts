/**
 * Playhouse global settings: one palette per preset (kids / pets / gifts) plus a "Playhouse"
 * settings group — five playful accent colours, card background, motion and badge options.
 * The accent colours are exposed as CSS variables `--ph-c1` … `--ph-c5` (see `playhouseCssVariables`).
 */
import type { SettingValues, SettingsGroup } from "@pai/theme-sdk";
import { extendSettingsSchema, kitCssVariables } from "@pai/theme-kit";

/* ─────────────────────────── palettes ─────────────────────────── */

const shared: SettingValues = {
  heading_scale: 105,
  heading_case: "normal",
  container_width: 1320,
  section_spacing: 72,
  radius: 22,
  button_radius: 999,
  header_style: "logo_left",
  logo_width: 140,
  card_image_ratio: "square",
  card_style: "card",
  card_text_align: "left",
  card_show_vendor: false,
  card_show_rating: true,
  card_quick_add: true,
  card_hover_swap: true,
  card_show_sale_badge: true,
  card_show_wishlist: true,
  cart_type: "drawer",
  cart_show_free_shipping: true,
  color_card: "#ffffff",
  playful_motion: true,
  wavy_edges: true,
  card_backdrop: "rainbow",
  badge_age: true,
  bestseller_tag: "bestseller",
  new_badge_days: 30,
};

/** Kids (default): sunshine, bubblegum, sky, grape and mint on a warm off-white. */
export const KIDS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fff9f0",
  color_foreground: "#2b2350",
  color_primary: "#6c4bff",
  color_primary_foreground: "#ffffff",
  color_accent: "#ff6f61",
  color_muted: "#fff1dc",
  color_border: "#f0e2cf",
  color_sale: "#e8385a",
  color_fun_1: "#ffc83d",
  color_fun_2: "#ff7aa8",
  color_fun_3: "#4fc3f7",
  color_fun_4: "#9b7bff",
  color_fun_5: "#3dd6a5",
  font_heading: "Fredoka",
  font_body: "Nunito",
  announcement_text: "Free delivery in Dhaka on orders over ৳2,500 · Cash on delivery nationwide",
};

/** Pets: warm tangerine + teal on cream, Baloo 2 headings. */
export const PETS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fffaf3",
  color_foreground: "#1f2f36",
  color_primary: "#f26b1d",
  color_primary_foreground: "#ffffff",
  color_accent: "#12a594",
  color_muted: "#ffefdc",
  color_border: "#f1dfc8",
  color_sale: "#d9344f",
  color_fun_1: "#ffb547",
  color_fun_2: "#ff8a5b",
  color_fun_3: "#2ec4b6",
  color_fun_4: "#7c9cff",
  color_fun_5: "#8bd17c",
  font_heading: "Baloo 2",
  font_body: "Nunito",
  heading_scale: 110,
  announcement_text: "Free delivery in Dhaka on orders over ৳2,500 · Vet-approved brands only",
};

/** Gifts: raspberry, gold and candy pastels on blush, Fredoka + Quicksand. */
export const GIFTS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fff8fa",
  color_foreground: "#3a1f35",
  color_primary: "#df3f78",
  color_primary_foreground: "#ffffff",
  color_accent: "#f2a900",
  color_muted: "#fdedf3",
  color_border: "#f3dbe5",
  color_sale: "#c81e4a",
  color_fun_1: "#ffd166",
  color_fun_2: "#ff8fb1",
  color_fun_3: "#8fd3f4",
  color_fun_4: "#c3a6ff",
  color_fun_5: "#8ee3c4",
  font_heading: "Fredoka",
  font_body: "Quicksand",
  announcement_text: "Free gift wrapping & a handwritten card on every order · Cash on delivery",
};

/* ─────────────────────────── schema ─────────────────────────── */

export function playhouseSettingsSchema(base: SettingsGroup[]): SettingsGroup[] {
  return extendSettingsSchema(base, [
    {
      name: "Playhouse",
      settings: [
        { type: "header", label: "Playful colours", info: "Used for tiles, bubbles, badges, card backdrops and decorative shapes." },
        { type: "color", id: "color_fun_1", label: "Sunshine", default: KIDS_SETTINGS.color_fun_1 as string },
        { type: "color", id: "color_fun_2", label: "Bubblegum", default: KIDS_SETTINGS.color_fun_2 as string },
        { type: "color", id: "color_fun_3", label: "Sky", default: KIDS_SETTINGS.color_fun_3 as string },
        { type: "color", id: "color_fun_4", label: "Grape", default: KIDS_SETTINGS.color_fun_4 as string },
        { type: "color", id: "color_fun_5", label: "Mint", default: KIDS_SETTINGS.color_fun_5 as string },
        { type: "color", id: "color_card", label: "Card background", default: "#ffffff" },
        { type: "header", label: "Personality" },
        { type: "checkbox", id: "playful_motion", label: "Playful motion (wiggles & floating shapes)", default: true, info: "Always switched off for visitors who prefer reduced motion." },
        { type: "checkbox", id: "wavy_edges", label: "Wavy section edges", default: true },
        {
          type: "select",
          id: "card_backdrop",
          label: "Product image backdrop",
          default: "rainbow",
          options: [
            { value: "rainbow", label: "Rotating playful colours" },
            { value: "muted", label: "Soft muted" },
            { value: "none", label: "None (full-bleed image)" },
          ],
        },
        { type: "checkbox", id: "badge_age", label: "Show age badges on product cards", default: true, info: "Read from tags like “age-3+”, “3-5y”, “0-12m”, from the title (“3+ yrs”) or from Age/Size options." },
        { type: "text", id: "bestseller_tag", label: "Bestseller tag", default: "bestseller", info: "Products with this tag get a “Bestseller” badge." },
        { type: "range", id: "new_badge_days", label: "“New!” badge for products added in the last", min: 7, max: 90, step: 1, unit: " days", default: 30 },
      ],
    },
  ]);
}

/* ─────────────────────────── css variables ─────────────────────────── */

const color = (v: unknown, fb: string) => (typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v) ? v : fb);

export function playhouseCssVariables(s: SettingValues): Record<string, string> {
  const vars = kitCssVariables(s);
  const motion = s.playful_motion !== false;
  vars["--ph-c1"] = color(s.color_fun_1, "#ffc83d");
  vars["--ph-c2"] = color(s.color_fun_2, "#ff7aa8");
  vars["--ph-c3"] = color(s.color_fun_3, "#4fc3f7");
  vars["--ph-c4"] = color(s.color_fun_4, "#9b7bff");
  vars["--ph-c5"] = color(s.color_fun_5, "#3dd6a5");
  vars["--ph-wiggle"] = motion ? "ph-wiggle" : "none";
  vars["--ph-float"] = motion ? "ph-float" : "none";
  vars["--ph-spin"] = motion ? "ph-spin" : "none";
  vars["--ph-lift"] = motion ? "-4px" : "0px";
  return vars;
}
