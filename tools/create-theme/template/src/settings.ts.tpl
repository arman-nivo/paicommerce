import type { SettingsGroup, SettingValues } from "@pai/theme-sdk";
import { extendSettingsSchema } from "@pai/theme-kit";

/**
 * Global theme settings (Customizer → Theme settings).
 *
 * The kit already ships a complete schema (`baseSettingsSchema`: colors, typography, layout, logo,
 * header, product cards, cart, currency, social, announcement). This file:
 *   1. sets this theme's brand defaults for the standard setting ids, and
 *   2. adds theme-specific settings on top.
 *
 * Standard ids become CSS variables automatically — use them in sections as `var(--pai-…)`:
 *   color_background → --pai-bg          color_foreground → --pai-fg
 *   color_primary → --pai-primary        color_primary_foreground → --pai-primary-fg
 *   color_accent → --pai-accent          color_muted → --pai-muted     color_border → --pai-border
 *   font_heading → --pai-font-heading    font_body → --pai-font-body
 *   radius → --pai-radius                button_radius → --pai-button-radius
 *   container_width → --pai-container    section_spacing → --pai-section-spacing
 */

/** Brand defaults (applied on top of the kit's palette for the primary category). */
export const settingsDefaults: SettingValues = {
  color_background: "#ffffff",
  color_foreground: "#171717",
  color_primary: "#171717",
  color_primary_foreground: "#ffffff",
  color_accent: "#e11d48",
  color_muted: "#f5f5f4",
  color_border: "#e7e5e4",
  font_heading: "Plus Jakarta Sans",
  font_body: "Inter",
  radius: 10,
  button_radius: 999,
  container_width: 1280,
  section_spacing: 64,
};

/**
 * Theme-specific settings. Groups with an existing name (e.g. "Colors") are merged into it;
 * a setting with an existing id replaces the kit's version.
 */
export const extraSettings: SettingsGroup[] = [
  {
    name: "Colors",
    settings: [{ type: "color", id: "color_accent", label: "Accent", default: settingsDefaults.color_accent as string, info: "Badges, highlights and the promo banner." }],
  },
  {
    name: "Promotions",
    settings: [
      { type: "header", label: "Promo banner" },
      { type: "checkbox", id: "show_promo_badge", label: "Show badge on promo banners", default: true },
    ],
  },
];

/**
 * Final schema = kit base (with the defaults above) + extra settings.
 * To take full control instead, export a plain `SettingsGroup[]` and pass it to createBaseTheme.
 */
export const settingsSchema = (base: SettingsGroup[]): SettingsGroup[] => extendSettingsSchema(base, extraSettings);
