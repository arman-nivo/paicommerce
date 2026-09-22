/** Theme resolution: store_themes row → theme package → resolved config & settings. */
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, db, desc, eq, storeThemes } from "@pai/db";
import { DEFAULT_THEME, loadTheme } from "@pai/theme-registry";
import {
  defaultCssVariables,
  googleFontsUrl,
  resolveThemeConfig,
  resolveThemeSettings,
  type SettingValues,
  type ThemeConfig,
  type ThemeDefinition,
} from "@pai/theme-sdk";
import { STORE_TAG, resolveSite, type Site } from "./site";

type ThemeRow = { id: string; themeSlug: string; presetId: string | null; config: Record<string, unknown> | null };

async function liveThemeRow(storeId: string): Promise<ThemeRow | null> {
  return unstable_cache(
    async () => {
      const [row] = await db
        .select({ id: storeThemes.id, themeSlug: storeThemes.themeSlug, presetId: storeThemes.presetId, config: storeThemes.config })
        .from(storeThemes)
        .where(and(eq(storeThemes.storeId, storeId), eq(storeThemes.role, "live")))
        .orderBy(desc(storeThemes.publishedAt))
        .limit(1);
      return row ?? null;
    },
    ["sf-live-theme", storeId],
    { revalidate: 10, tags: [STORE_TAG(storeId), `theme:${storeId}`] },
  )();
}

async function previewThemeRow(storeId: string, storeThemeId: string): Promise<ThemeRow | null> {
  const [row] = await db
    .select({ id: storeThemes.id, themeSlug: storeThemes.themeSlug, presetId: storeThemes.presetId, config: storeThemes.config, draft: storeThemes.draftConfig })
    .from(storeThemes)
    .where(and(eq(storeThemes.storeId, storeId), eq(storeThemes.id, storeThemeId)))
    .limit(1);
  if (!row) return null;
  return { id: row.id, themeSlug: row.themeSlug, presetId: row.presetId, config: row.draft ?? row.config };
}

export type SiteTheme = {
  theme: ThemeDefinition;
  config: ThemeConfig;
  settings: SettingValues;
  cssVars: Record<string, string>;
  fontsUrl: string | null;
  storeThemeId: string | null;
};

/** Resolve the theme to render for a site (memoised per request by site key). */
export const getSiteTheme = cache(async (siteKey: string): Promise<SiteTheme> => {
  const site = (await resolveSite(siteKey)) as Site;
  const row = site.preview ? await previewThemeRow(site.store.id, site.preview.storeThemeId) : await liveThemeRow(site.store.id);
  const theme = await loadTheme(row?.themeSlug ?? DEFAULT_THEME);
  // Presets are picked by id; fall back to the store category preset for brand-new stores.
  const presetId = row?.presetId ?? (theme.presets?.some((p) => p.id === site.store.category) ? site.store.category : null);
  const config = resolveThemeConfig(theme, (row?.config as Partial<ThemeConfig> | null) ?? null, presetId);
  const settings = resolveThemeSettings(theme, config.settings);
  const cssVars = (theme.cssVariables ?? defaultCssVariables)(settings);
  const fontIds = theme.fontSettings ?? ["font_heading", "font_body"];
  const fontsUrl = googleFontsUrl(fontIds.map((id) => (typeof settings[id] === "string" ? (settings[id] as string) : "")).filter(Boolean));
  return { theme, config, settings, cssVars, fontsUrl, storeThemeId: row?.id ?? null };
});
