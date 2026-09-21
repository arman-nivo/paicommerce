/**
 * Theme loaders — lazily imported so a storefront only loads the code of the theme it renders.
 * Keep this list in sync with manifests.ts (the `pnpm theme:new` CLI edits both).
 */
import type { ThemeDefinition } from "@pai/theme-sdk";

export const themeLoaders: Record<string, () => Promise<ThemeDefinition>> = {
  aurora: () => import("@pai-theme/aurora").then((m) => m.default),
  volt: () => import("@pai-theme/volt").then((m) => m.default),
  freshmart: () => import("@pai-theme/freshmart").then((m) => m.default),
  bloom: () => import("@pai-theme/bloom").then((m) => m.default),
  nest: () => import("@pai-theme/nest").then((m) => m.default),
  savor: () => import("@pai-theme/savor").then((m) => m.default),
  lumiere: () => import("@pai-theme/lumiere").then((m) => m.default),
  playhouse: () => import("@pai-theme/playhouse").then((m) => m.default),
  stride: () => import("@pai-theme/stride").then((m) => m.default),
  folio: () => import("@pai-theme/folio").then((m) => m.default),
  bazaar: () => import("@pai-theme/bazaar").then((m) => m.default),
  artisan: () => import("@pai-theme/artisan").then((m) => m.default),
  pulse: () => import("@pai-theme/pulse").then((m) => m.default),
};

export const DEFAULT_THEME = "aurora";
export const THEME_SLUGS = Object.keys(themeLoaders);

const cache = new Map<string, Promise<ThemeDefinition>>();

/** Load a theme by slug; unknown slugs fall back to the default theme. */
export function loadTheme(slug: string | null | undefined): Promise<ThemeDefinition> {
  const key = slug && themeLoaders[slug] ? slug : DEFAULT_THEME;
  if (!cache.has(key)) cache.set(key, themeLoaders[key]!());
  return cache.get(key)!;
}

export { manifests, getManifest } from "./manifests";
