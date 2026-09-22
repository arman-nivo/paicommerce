import type { ThemeDefinition, ValidationIssue } from "@pai/theme-sdk";
import { validateTheme } from "@pai/theme-sdk";
import { themeLoaders } from "./registry-loaders.js";

export type ValidationReport = {
  slug: string;
  hasCode: boolean;
  loaded: boolean;
  issues: ValidationIssue[];
  stats?: { sections: number; presets: number; templates: string[]; settingsGroups: number; version: string };
  loadError?: string;
};

/** Load a theme's code (no fallback to the default theme) and run the SDK validator. */
export async function validateRegistryTheme(slug: string): Promise<ValidationReport> {
  const loader = themeLoaders[slug];
  if (!loader) return { slug, hasCode: false, loaded: false, issues: [{ level: "error", path: "registry", message: `No code package registered for "${slug}" in @pai/theme-registry` }] };
  let theme: ThemeDefinition;
  try {
    theme = await loader();
  } catch (e) {
    return { slug, hasCode: true, loaded: false, issues: [{ level: "error", path: "load", message: `Theme failed to load: ${e instanceof Error ? e.message : String(e)}` }], loadError: String(e) };
  }
  const issues = validateTheme(theme);
  if (theme.manifest?.slug && theme.manifest.slug !== slug) issues.unshift({ level: "error", path: "manifest.slug", message: `manifest slug "${theme.manifest.slug}" doesn't match listing slug "${slug}"` });
  return {
    slug,
    hasCode: true,
    loaded: true,
    issues,
    stats: {
      sections: theme.sections.length,
      presets: theme.presets?.length ?? 0,
      templates: Object.keys(theme.defaultConfig?.templates ?? {}),
      settingsGroups: theme.settingsSchema?.length ?? 0,
      version: theme.manifest?.version ?? "?",
    },
  };
}
