import type {
  BlockInstance,
  SectionDefinition,
  SectionInstance,
  SectionList,
  SectionSchema,
  SettingField,
  SettingValues,
  SettingsGroup,
  ThemeConfig,
  ThemeDefinition,
  ThemePreset,
} from "./types";

/* ─────────────────────────── define helpers ─────────────────────────── */

export function defineTheme(theme: ThemeDefinition): ThemeDefinition {
  return theme;
}

export function defineSection<S extends SettingValues = SettingValues>(def: SectionDefinition<S>): SectionDefinition<S> {
  return def;
}

/* ─────────────────────────── ids ─────────────────────────── */

export function generateId(prefix = "s"): string {
  const rand = Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  return `${prefix}_${rand}`;
}

/* ─────────────────────────── settings defaults ─────────────────────────── */

export function fieldDefault(field: SettingField): unknown {
  if (field.type === "header") return undefined;
  if (field.default !== undefined) return field.default;
  switch (field.type) {
    case "checkbox":
      return false;
    case "range":
      return field.min;
    case "number":
      return field.min ?? 0;
    case "select":
    case "radio":
      return field.options[0]?.value ?? "";
    case "product_list":
      return [];
    default:
      return "";
  }
}

/** Fill missing values with schema defaults; drop nothing (unknown keys are kept for forward-compat). */
export function applyDefaults(fields: SettingField[], values: SettingValues | undefined): SettingValues {
  const out: SettingValues = { ...(values ?? {}) };
  for (const f of fields) {
    if (f.type === "header") continue;
    if (out[f.id] === undefined || out[f.id] === null) out[f.id] = fieldDefault(f);
  }
  return out;
}

export function flattenSettingsSchema(groups: SettingsGroup[]): SettingField[] {
  return groups.flatMap((g) => g.settings);
}

export function resolveThemeSettings(theme: ThemeDefinition, values: SettingValues | undefined): SettingValues {
  return applyDefaults(flattenSettingsSchema(theme.settingsSchema), values);
}

export function resolveSectionSettings(schema: SectionSchema, instance: SectionInstance): { settings: SettingValues; blocks: BlockInstance[] } {
  const settings = applyDefaults(schema.settings, instance.settings);
  const blocks = (instance.blocks ?? [])
    .filter((b) => !b.disabled)
    .map((b) => {
      const bs = schema.blocks?.find((x) => x.type === b.type);
      return { ...b, settings: bs ? applyDefaults(bs.settings, b.settings) : b.settings };
    });
  return { settings, blocks };
}

/* ─────────────────────────── registry lookups ─────────────────────────── */

export function getSection(theme: ThemeDefinition, type: string): SectionDefinition | undefined {
  return theme.sections.find((s) => s.schema.type === type);
}

export function getSectionSchemas(theme: ThemeDefinition): SectionSchema[] {
  return theme.sections.map((s) => s.schema);
}

/* ─────────────────────────── config merge ─────────────────────────── */

function clone<T>(v: T): T {
  return v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T);
}

/** Build a section instance from a schema preset (used by "Add section"). */
export function instantiateSection(schema: SectionSchema, presetIndex = 0): SectionInstance {
  const preset = schema.presets?.[presetIndex];
  return {
    type: schema.type,
    settings: applyDefaults(schema.settings, preset?.settings),
    blocks: (preset?.blocks ?? []).map((b) => {
      const bs = schema.blocks?.find((x) => x.type === b.type);
      return { id: generateId("b"), type: b.type, settings: bs ? applyDefaults(bs.settings, b.settings) : b.settings ?? {} };
    }),
  };
}

export function applyPreset(base: ThemeConfig, preset: ThemePreset | undefined): ThemeConfig {
  const cfg = clone(base);
  if (!preset) return cfg;
  cfg.settings = { ...cfg.settings, ...(preset.settings ?? {}) };
  if (preset.templates) cfg.templates = { ...cfg.templates, ...clone(preset.templates) };
  if (preset.groups) cfg.groups = { ...cfg.groups, ...clone(preset.groups) } as ThemeConfig["groups"];
  return cfg;
}

/**
 * Resolve the config a storefront should render.
 * Priority: stored config (merchant edits) → preset → theme default.
 * Templates missing from the stored config fall back to the default template.
 */
export function resolveThemeConfig(
  theme: ThemeDefinition,
  stored: Partial<ThemeConfig> | null | undefined,
  presetId?: string | null,
): ThemeConfig {
  const preset = theme.presets?.find((p) => p.id === presetId);
  const base = applyPreset(theme.defaultConfig, preset);
  if (!stored) return base;
  return {
    settings: { ...base.settings, ...(stored.settings ?? {}) },
    groups: { ...base.groups, ...(stored.groups ?? {}) } as ThemeConfig["groups"],
    templates: { ...base.templates, ...(stored.templates ?? {}) },
  };
}

export function emptySectionList(): SectionList {
  return { sections: {}, order: [] };
}

/* ─────────────────────────── CSS variables ─────────────────────────── */

const px = (v: unknown, fallback: number) => `${typeof v === "number" ? v : fallback}px`;
const str = (v: unknown, fallback: string) => (typeof v === "string" && v ? v : fallback);

/** Converts "#rrggbb" → "r g b" for use with rgb(var(--x) / alpha). */
export function hexToRgbTriplet(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return "0 0 0";
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/**
 * Standard design tokens every theme gets. Theme settings with these ids map automatically:
 * color_background, color_foreground, color_primary, color_primary_foreground, color_accent,
 * color_muted, color_border, color_sale, font_heading, font_body, radius, button_radius,
 * container_width, heading_scale, section_spacing.
 */
export function defaultCssVariables(s: SettingValues): Record<string, string> {
  const colors: Record<string, [string, string]> = {
    "--pai-bg": ["color_background", "#ffffff"],
    "--pai-fg": ["color_foreground", "#111111"],
    "--pai-primary": ["color_primary", "#111111"],
    "--pai-primary-fg": ["color_primary_foreground", "#ffffff"],
    "--pai-accent": ["color_accent", "#e11d48"],
    "--pai-muted": ["color_muted", "#f5f5f4"],
    "--pai-border": ["color_border", "#e7e5e4"],
    "--pai-sale": ["color_sale", "#dc2626"],
  };
  const vars: Record<string, string> = {};
  for (const [name, [key, fb]] of Object.entries(colors)) {
    const v = str(s[key], fb);
    vars[name] = v;
    vars[`${name}-rgb`] = hexToRgbTriplet(v);
  }
  vars["--pai-font-heading"] = `"${str(s.font_heading, "Inter")}", ui-sans-serif, system-ui, sans-serif`;
  vars["--pai-font-body"] = `"${str(s.font_body, "Inter")}", ui-sans-serif, system-ui, sans-serif`;
  vars["--pai-radius"] = px(s.radius, 8);
  vars["--pai-button-radius"] = px(s.button_radius, typeof s.radius === "number" ? s.radius : 8);
  vars["--pai-container"] = px(s.container_width, 1280);
  vars["--pai-heading-scale"] = String(typeof s.heading_scale === "number" ? s.heading_scale / 100 : 1);
  vars["--pai-section-spacing"] = px(s.section_spacing, 64);
  return vars;
}

export function cssVariablesToString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");
}

/** Google Fonts stylesheet URL for the given families. */
export function googleFontsUrl(families: string[]): string | null {
  const uniq = [...new Set(families.filter(Boolean))].filter((f) => !/^(system-ui|sans-serif|serif|monospace)$/i.test(f));
  if (!uniq.length) return null;
  const q = uniq.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@300;400;500;600;700;800`).join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

export const FONT_CHOICES = [
  "Inter",
  "Poppins",
  "DM Sans",
  "Manrope",
  "Plus Jakarta Sans",
  "Outfit",
  "Space Grotesk",
  "Sora",
  "Urbanist",
  "Work Sans",
  "Nunito",
  "Rubik",
  "Montserrat",
  "Lato",
  "Hind Siliguri",
  "Playfair Display",
  "Cormorant Garamond",
  "Fraunces",
  "Libre Baskerville",
  "Lora",
  "DM Serif Display",
  "Bodoni Moda",
  "Marcellus",
  "Bebas Neue",
  "Oswald",
  "Archivo",
  "Syne",
  "Unbounded",
  "Quicksand",
  "Baloo 2",
  "Fredoka",
  "JetBrains Mono",
];

/* ─────────────────────────── validation (CLI / CI / admin review) ─────────────────────────── */

export type ValidationIssue = { level: "error" | "warning"; path: string; message: string };

export function validateTheme(theme: ThemeDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const err = (path: string, message: string) => issues.push({ level: "error", path, message });
  const warn = (path: string, message: string) => issues.push({ level: "warning", path, message });
  const m = theme.manifest;

  if (!m?.slug || !/^[a-z0-9][a-z0-9-]{1,40}$/.test(m.slug)) err("manifest.slug", "slug must be lowercase kebab-case (2–41 chars)");
  if (!m?.name) err("manifest.name", "name is required");
  if (!/^\d+\.\d+\.\d+/.test(m?.version ?? "")) err("manifest.version", "version must be semver");
  if (!m?.categories?.length) err("manifest.categories", "at least one business category is required");
  if (!m?.thumbnail) warn("manifest.thumbnail", "thumbnail is recommended for the Theme Store");

  const types = new Set<string>();
  theme.sections.forEach((s, i) => {
    const p = `sections[${i}]`;
    if (!s.schema?.type) return err(p, "schema.type missing");
    if (types.has(s.schema.type)) err(p, `duplicate section type "${s.schema.type}"`);
    types.add(s.schema.type);
    if (typeof s.component !== "function") err(p, `section "${s.schema.type}" has no component`);
    const ids = new Set<string>();
    for (const f of s.schema.settings) {
      if (f.type === "header") continue;
      if (ids.has(f.id)) err(`${p}.settings.${f.id}`, "duplicate setting id");
      ids.add(f.id);
    }
  });

  const checkList = (path: string, list: SectionList | undefined) => {
    if (!list) return;
    for (const id of list.order) {
      const inst = list.sections[id];
      if (!inst) err(`${path}.order`, `order references missing section "${id}"`);
      else if (!types.has(inst.type)) err(`${path}.sections.${id}`, `unknown section type "${inst.type}"`);
    }
  };
  checkList("defaultConfig.groups.header", theme.defaultConfig.groups.header);
  checkList("defaultConfig.groups.footer", theme.defaultConfig.groups.footer);
  for (const [t, list] of Object.entries(theme.defaultConfig.templates)) checkList(`defaultConfig.templates.${t}`, list);
  for (const req of ["index", "product", "collection", "cart"] as const) {
    if (!theme.defaultConfig.templates[req]) err(`defaultConfig.templates.${req}`, `template "${req}" is required`);
  }
  theme.presets?.forEach((p) => {
    for (const [t, list] of Object.entries(p.templates ?? {})) checkList(`presets.${p.id}.templates.${t}`, list);
  });
  return issues;
}
