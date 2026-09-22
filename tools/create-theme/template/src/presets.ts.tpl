import type { ThemePreset } from "@pai/theme-sdk";
import { manifest } from "./manifest";

/**
 * Presets = one-click starting points shown when a merchant installs the theme.
 * Each preset overrides global settings (and may also override templates / groups).
 * Use real images from images.unsplash.com only and verify them with
 * `node tools/verify-images.mjs themes/__SLUG__`.
 */
export const presets: ThemePreset[] = [
  {
    id: "__SLUG__-default",
    name: manifest.name,
    category: "__PRIMARY_CATEGORY__",
    description: `The signature ${manifest.name} look.`,
    thumbnail: "__THUMBNAIL__",
    settings: {},
  },
  {
    id: "__SLUG__-midnight",
    name: `${manifest.name} Midnight`,
    category: "__PRIMARY_CATEGORY__",
    description: "A dark, high-contrast variant.",
    thumbnail: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
    settings: {
      color_background: "#0b0b0f",
      color_foreground: "#f4f4f5",
      color_primary: "#fafafa",
      color_primary_foreground: "#0b0b0f",
      color_accent: "#f59e0b",
      color_muted: "#17171c",
      color_border: "#27272a",
    },
  },
  {
    id: "__SLUG__-soft",
    name: `${manifest.name} Soft`,
    category: "__PRIMARY_CATEGORY__",
    description: "Warm neutrals, rounded corners and a serif heading font.",
    thumbnail: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    settings: {
      color_background: "#fbf8f4",
      color_foreground: "#2b2622",
      color_primary: "#9a3412",
      color_primary_foreground: "#ffffff",
      color_accent: "#ca8a04",
      color_muted: "#f3ede4",
      color_border: "#e6ddd0",
      font_heading: "Fraunces",
      radius: 16,
    },
  },
];
