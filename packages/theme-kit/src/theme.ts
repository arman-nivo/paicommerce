import type { ComponentType } from "react";
import {
  BUSINESS_CATEGORIES,
  type BusinessCategory,
  type SectionDefinition,
  type SectionList,
  type SettingValues,
  type SettingsGroup,
  type ThemeConfig,
  type ThemeDefinition,
  type ThemeLayoutProps,
  type ThemeManifest,
  type ThemePreset,
} from "@pai/theme-sdk";
import { baseSections } from "./sections";
import { baseSettingsSchema, CATEGORY_STYLES, withSettingDefaults } from "./settings";
import { CATEGORY_HERO } from "./lib/samples";
import { kitCssVariables } from "./lib/css";

/* ─────────────────────────── config builders ─────────────────────────── */

export type SectionSpec = {
  /** Stable id. Defaults to the section type (suffixed -2, -3 … for repeats). */
  id?: string;
  type: string;
  settings?: SettingValues;
  blocks?: { id?: string; type: string; settings?: SettingValues; disabled?: boolean }[];
  disabled?: boolean;
};

/**
 * Build a `SectionList` with deterministic ids from a readable array. Ids must be stable so the
 * customizer (a different process) and the storefront agree on section ids for theme defaults.
 *
 * @example sectionList([{ type: "hero-banner", settings: { heading: "Hi" } }, { type: "featured-collection" }])
 */
export function sectionList(specs: SectionSpec[]): SectionList {
  const out: SectionList = { sections: {}, order: [] };
  const seen = new Map<string, number>();
  for (const spec of specs) {
    let id = spec.id;
    if (!id) {
      const n = (seen.get(spec.type) ?? 0) + 1;
      seen.set(spec.type, n);
      id = n === 1 ? spec.type : `${spec.type}-${n}`;
    }
    const blockSeen = new Map<string, number>();
    out.sections[id] = {
      type: spec.type,
      settings: { ...(spec.settings ?? {}) },
      disabled: spec.disabled,
      blocks: (spec.blocks ?? []).map((b) => {
        const n = (blockSeen.get(b.type) ?? 0) + 1;
        blockSeen.set(b.type, n);
        return { id: b.id ?? `${id}--${b.type}-${n}`, type: b.type, settings: { ...(b.settings ?? {}) }, disabled: b.disabled };
      }),
    };
    out.order.push(id);
  }
  return out;
}

/** Default header group: announcement bar + header. */
export function baseHeaderGroup(): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      blocks: [
        { type: "announcement", settings: { text: "Cash on delivery all over Bangladesh" } },
        { type: "announcement", settings: { text: "Free delivery on orders over ৳2,000" } },
      ],
    },
    { type: "header" },
  ]);
}

/** Default footer group. */
export function baseFooterGroup(): SectionList {
  return sectionList([
    {
      type: "footer",
      blocks: [
        { type: "brand" },
        { type: "link_list", settings: { heading: "Shop", menu: "main" } },
        { type: "link_list", settings: { heading: "Help", menu: "footer" } },
        { type: "contact" },
        { type: "newsletter" },
      ],
    },
  ]);
}

/** Default home page for a business category. */
export function baseIndexTemplate(category: BusinessCategory | string = "general"): SectionList {
  const hero = CATEGORY_HERO[category] ?? CATEGORY_HERO.general!;
  return sectionList([
    {
      type: "hero-banner",
      settings: { image: hero.image, eyebrow: "", heading: hero.heading, subheading: hero.subheading, button_label: "Shop now", button_link: "/collections/all", overlay: 35 },
    },
    {
      type: "multicolumn",
      settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: "default" },
      blocks: [
        { type: "column", settings: { icon: "truck", title: "Nationwide delivery", text: "All 64 districts" } },
        { type: "column", settings: { icon: "banknote", title: "Cash on delivery", text: "Pay when you receive" } },
        { type: "column", settings: { icon: "rotate-ccw", title: "Easy returns", text: "7-day return policy" } },
        { type: "column", settings: { icon: "headset", title: "Support", text: "10am – 10pm, every day" } },
      ],
    },
    { type: "collection-list", settings: { heading: "Shop by category", limit: 4, columns: 4 } },
    { type: "featured-collection", settings: { heading: "New arrivals", source: "newest", limit: 8, columns: 4 } },
    { type: "image-with-text" },
    { type: "product-grid", settings: { heading: "Best sellers", source: "best-selling", limit: 8, color_scheme: "default" } },
    {
      type: "testimonials",
      blocks: [
        { type: "testimonial", settings: { quote: "Quality is excellent and delivery was super fast. Cash on delivery made it so easy!", author: "Nusrat J.", location: "Dhaka" } },
        { type: "testimonial", settings: { quote: "Exactly as pictured. Packaging was lovely and support answered all my questions.", author: "Tanvir A.", location: "Chattogram" } },
        { type: "testimonial", settings: { quote: "My third order from this shop — always genuine products and honest prices.", author: "Farhana R.", location: "Sylhet" } },
      ],
    },
    { type: "blog-posts" },
  ]);
}

/** Default product page template. */
export function baseProductTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      blocks: [
        { type: "vendor" },
        { type: "title" },
        { type: "rating" },
        { type: "price" },
        { type: "variant_picker" },
        { type: "stock" },
        { type: "buy_buttons" },
        { type: "trust" },
        { type: "description" },
        { type: "collapsible_tab", settings: { heading: "Delivery & returns", icon: "truck" } },
        { type: "share" },
      ],
    },
    { type: "product-reviews" },
    { type: "related-products" },
  ]);
}

/** The complete default config of a base theme. */
export function baseDefaultConfig(category: BusinessCategory | string = "general", settings: SettingValues = {}): ThemeConfig {
  return {
    settings,
    groups: { header: baseHeaderGroup(), footer: baseFooterGroup() },
    templates: {
      index: baseIndexTemplate(category),
      product: baseProductTemplate(),
      collection: sectionList([{ type: "main-collection" }]),
      collections: sectionList([{ type: "main-collections-list" }]),
      search: sectionList([{ type: "main-search" }]),
      cart: sectionList([{ type: "main-cart" }, { type: "featured-collection", settings: { heading: "You might also like", source: "best-selling", limit: 4 } }]),
      page: sectionList([{ type: "main-page" }]),
      blog: sectionList([{ type: "main-blog" }]),
      article: sectionList([{ type: "main-article" }, { type: "featured-collection", settings: { heading: "Shop the story", source: "featured", limit: 4 } }]),
      account: sectionList([{ type: "main-account" }]),
      "404": sectionList([{ type: "main-404" }]),
    },
  };
}

/** One preset per category: palette + typography + category hero. */
export function categoryPreset(category: BusinessCategory, overrides: Partial<ThemePreset> = {}): ThemePreset {
  const label = BUSINESS_CATEGORIES.find((c) => c.id === category)?.label ?? category;
  return {
    id: category,
    name: label,
    category,
    description: `Colours, fonts and home page tuned for ${label.toLowerCase()} stores.`,
    thumbnail: CATEGORY_HERO[category]?.image,
    settings: { ...CATEGORY_STYLES[category] },
    templates: { index: baseIndexTemplate(category) },
    ...overrides,
  };
}

/* ─────────────────────────── createBaseTheme ─────────────────────────── */

export type CreateBaseThemeOptions = {
  manifest: ThemeManifest;
  /** Extra sections. A section whose `schema.type` matches a base section replaces it. */
  sections?: SectionDefinition<any>[];
  /**
   * Replace/patch base sections by type. Pass a full definition, or a function that receives the
   * base definition (e.g. to swap only the component and keep the schema).
   */
  overrideSections?: Record<string, SectionDefinition<any> | ((base: SectionDefinition<any>) => SectionDefinition<any>)>;
  /** Base section types to drop entirely. */
  excludeSections?: string[];
  /** Global settings schema, or a function extending `baseSettingsSchema`. */
  settingsSchema?: SettingsGroup[] | ((base: SettingsGroup[]) => SettingsGroup[]);
  /** New default values for global settings (colours, fonts …). Applied on top of the category palette. */
  settingsDefaults?: SettingValues;
  /** Default config, or a function transforming the kit's default config. Partial objects are merged. */
  defaultConfig?: Partial<ThemeConfig> | ((base: ThemeConfig) => ThemeConfig);
  /** Presets, or a function transforming the kit's category presets. */
  presets?: ThemePreset[] | ((base: ThemePreset[]) => ThemePreset[]);
  /** Theme CSS (scoped under `.pai-theme-<slug>` by the storefront). */
  css?: string;
  Layout?: ComponentType<ThemeLayoutProps>;
  cssVariables?: ThemeDefinition["cssVariables"];
  fontSettings?: string[];
};

/**
 * Build a complete, working theme from the kit's base sections.
 *
 * - With only a manifest you get a polished store styled for the manifest's first category,
 *   with one preset per manifest category.
 * - Add or replace sections, extend settings, change defaults, ship your own presets, CSS and layout.
 *
 * @example
 * export default createBaseTheme({
 *   manifest,
 *   sections: [editorialHero, lookbook],
 *   settingsDefaults: { font_heading: "Cormorant Garamond" },
 *   defaultConfig: (base) => ({ ...base, templates: { ...base.templates, index: sectionList([...]) } }),
 * });
 */
export function createBaseTheme(opts: CreateBaseThemeOptions): ThemeDefinition {
  const { manifest } = opts;
  const primary = (manifest.categories?.[0] ?? "general") as BusinessCategory;

  // Sections: base → overrides → excludes → additions (additions replace same type).
  const byType = new Map<string, SectionDefinition<any>>();
  for (const s of baseSections) byType.set(s.schema.type, s);
  for (const [type, o] of Object.entries(opts.overrideSections ?? {})) {
    const base = byType.get(type);
    const next = typeof o === "function" ? (base ? o(base) : undefined) : o;
    if (next) byType.set(type, next);
  }
  for (const type of opts.excludeSections ?? []) byType.delete(type);
  for (const s of opts.sections ?? []) byType.set(s.schema.type, s);
  const sections = [...byType.values()];

  // Settings.
  const defaults: SettingValues = { ...(CATEGORY_STYLES[primary] ?? {}), ...(opts.settingsDefaults ?? {}) };
  const baseSchema = withSettingDefaults(baseSettingsSchema, defaults);
  const settingsSchema = typeof opts.settingsSchema === "function" ? opts.settingsSchema(baseSchema) : opts.settingsSchema ?? baseSchema;

  // Config.
  const kitDefault = baseDefaultConfig(primary, defaults);
  let defaultConfig: ThemeConfig;
  if (typeof opts.defaultConfig === "function") defaultConfig = opts.defaultConfig(kitDefault);
  else if (opts.defaultConfig) {
    defaultConfig = {
      settings: { ...kitDefault.settings, ...(opts.defaultConfig.settings ?? {}) },
      groups: { ...kitDefault.groups, ...(opts.defaultConfig.groups ?? {}) },
      templates: { ...kitDefault.templates, ...(opts.defaultConfig.templates ?? {}) },
    };
  } else defaultConfig = kitDefault;

  // Presets: one per manifest category by default.
  const basePresets = [...new Set(manifest.categories ?? [primary])].map((c) =>
    categoryPreset(c, c === primary ? { settings: { ...CATEGORY_STYLES[c], ...(opts.settingsDefaults ?? {}) }, templates: { index: defaultConfig.templates.index! } } : {}),
  );
  const presets = typeof opts.presets === "function" ? opts.presets(basePresets) : opts.presets ?? basePresets;

  return {
    manifest,
    settingsSchema,
    sections,
    defaultConfig,
    presets,
    Layout: opts.Layout,
    css: opts.css,
    cssVariables: opts.cssVariables ?? kitCssVariables,
    fontSettings: opts.fontSettings ?? ["font_heading", "font_body"],
  };
}
