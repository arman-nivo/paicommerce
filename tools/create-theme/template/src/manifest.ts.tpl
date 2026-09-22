import type { ThemeManifest } from "@pai/theme-sdk";

/**
 * Theme Store listing. Pure data — safe to import from Node scripts, seeds and the marketing site
 * (keep React/components out of this file).
 */
export const manifest: ThemeManifest = {
  slug: "__SLUG__", // must match the folder name, package name and DB `themes.slug`
  name: __NAME_JSON__,
  version: "0.1.0",
  tagline: __TAGLINE_JSON__,
  description: __DESCRIPTION_JSON__,
  author: { name: __AUTHOR_JSON__ },
  categories: __CATEGORIES_JSON__, // first category = primary (drives the default look)
  tags: ["responsive", "sections-everywhere"],
  /** Price in BDT minor units (paisa): 0 = free, 390000 = ৳3,900. */
  price: __PRICE__,
  // 1600px-wide cover shown in the Theme Store. Replace with a real screenshot before submitting.
  thumbnail: "__THUMBNAIL__",
  screenshots: [],
  features: ["Promo banner section", "Category presets", "Mobile-first layout", "Customizable colors & fonts"],
  sdk: "1.0.0",
};
