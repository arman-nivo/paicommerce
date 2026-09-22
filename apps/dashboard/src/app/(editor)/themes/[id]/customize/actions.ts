"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, db, eq, ne, storeThemes } from "@pai/db";
import { loadTheme } from "@pai/theme-registry";
import { resolveThemeConfig, TEMPLATE_TYPES, type ThemeConfig } from "@pai/theme-sdk";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import type { Ctx } from "@/lib/ctx";
import { ActionError } from "@/lib/errors";
import { uuid } from "@/lib/zod";

const MAX_CONFIG_BYTES = 512 * 1024;
const TEMPLATE_IDS = new Set<string>(TEMPLATE_TYPES.map((t) => t.id));

const settingsRecord = z.record(z.string().max(100), z.unknown());
const blockInstance = z.object({
  id: z.string().min(1).max(64),
  type: z.string().min(1).max(100),
  settings: settingsRecord.default({}),
  disabled: z.boolean().optional(),
});
const sectionInstance = z.object({
  type: z.string().min(1).max(100),
  settings: settingsRecord.default({}),
  blocks: z.array(blockInstance).max(200).optional(),
  disabled: z.boolean().optional(),
});
const sectionList = z
  .object({
    sections: z.record(z.string().min(1).max(64), sectionInstance),
    order: z.array(z.string().min(1).max(64)).max(200),
  })
  // Drop dangling / duplicate ids from the order list.
  .transform((l) => ({ ...l, order: [...new Set(l.order)].filter((id) => !!l.sections[id]) }));

const themeConfig = z
  .object({
    settings: settingsRecord,
    groups: z.object({ header: sectionList, footer: sectionList }),
    templates: z.record(z.string(), sectionList).refine((t) => Object.keys(t).every((k) => TEMPLATE_IDS.has(k)), "Unknown template"),
  })
  .refine((c) => new TextEncoder().encode(JSON.stringify(c)).length <= MAX_CONFIG_BYTES, "Theme settings are too large (max 512 KB). Remove some sections or long texts.");

async function getRow(ctx: Ctx, id: string) {
  const row = await db.query.storeThemes.findFirst({ where: and(eq(storeThemes.id, id), eq(storeThemes.storeId, ctx.store.id)) });
  if (!row) throw new ActionError("This theme no longer exists in your store.");
  return row;
}

/** Autosave: store the working copy as a draft (never touches the live config). */
export const saveDraft = action(z.object({ storeThemeId: uuid, config: themeConfig }), { permission: "themes.manage" }, async (input, ctx) => {
  await getRow(ctx, input.storeThemeId);
  const [row] = await db
    .update(storeThemes)
    .set({ draftConfig: input.config as unknown as Record<string, unknown>, updatedAt: new Date() })
    .where(and(eq(storeThemes.id, input.storeThemeId), eq(storeThemes.storeId, ctx.store.id)))
    .returning({ updatedAt: storeThemes.updatedAt });
  return { updatedAt: (row?.updatedAt ?? new Date()).toISOString() };
});

/** Publish: the passed config becomes the live config and this theme becomes the store's live theme. */
export const publishTheme = action(z.object({ storeThemeId: uuid, config: themeConfig }), { permission: "themes.manage" }, async (input, ctx) => {
  const row = await getRow(ctx, input.storeThemeId);
  const now = new Date();
  const wasLive = row.role === "live";
  await db.transaction(async (tx) => {
    await tx
      .update(storeThemes)
      .set({ role: "unpublished", updatedAt: now })
      .where(and(eq(storeThemes.storeId, ctx.store.id), eq(storeThemes.role, "live"), ne(storeThemes.id, row.id)));
    await tx
      .update(storeThemes)
      .set({ config: input.config as unknown as Record<string, unknown>, draftConfig: null, role: "live", publishedAt: now, updatedAt: now })
      .where(and(eq(storeThemes.id, row.id), eq(storeThemes.storeId, ctx.store.id)));
  });
  await audit(ctx, wasLive ? "theme.updated" : "theme.published", `store_theme:${row.id}`, { name: row.name, themeSlug: row.themeSlug });
  revalidatePath("/themes");
  return { publishedAt: now.toISOString(), wasLive };
});

/**
 * Reset the working copy.
 *  - "published": throw away draft changes (back to the live/published config)
 *  - "defaults": back to the theme's default content (+ selected preset)
 */
export const resetTheme = action(z.object({ storeThemeId: uuid, mode: z.enum(["defaults", "published"]) }), { permission: "themes.manage" }, async (input, ctx) => {
  const row = await getRow(ctx, input.storeThemeId);
  const theme = await loadTheme(row.themeSlug);
  let config: ThemeConfig;
  let draft: Record<string, unknown> | null;
  if (input.mode === "published") {
    config = resolveThemeConfig(theme, row.config as Partial<ThemeConfig> | null, row.presetId);
    draft = null;
  } else {
    config = resolveThemeConfig(theme, null, row.presetId);
    // A published theme keeps its live config until the merchant publishes the reset.
    draft = row.config ? (config as unknown as Record<string, unknown>) : null;
  }
  await db
    .update(storeThemes)
    .set({ draftConfig: draft, updatedAt: new Date() })
    .where(and(eq(storeThemes.id, row.id), eq(storeThemes.storeId, ctx.store.id)));
  await audit(ctx, "theme.reset", `store_theme:${row.id}`, { mode: input.mode });
  return { config };
});

/** Switch the theme preset: replaces the working copy with the preset's configuration. */
export const applyThemePreset = action(z.object({ storeThemeId: uuid, presetId: z.string().min(1).max(100) }), { permission: "themes.manage" }, async (input, ctx) => {
  const row = await getRow(ctx, input.storeThemeId);
  const theme = await loadTheme(row.themeSlug);
  const preset = theme.presets?.find((p) => p.id === input.presetId);
  if (!preset) throw new ActionError("That style preset is not available for this theme.");
  const config = resolveThemeConfig(theme, null, preset.id);
  await db
    .update(storeThemes)
    .set({ presetId: preset.id, draftConfig: config as unknown as Record<string, unknown>, updatedAt: new Date() })
    .where(and(eq(storeThemes.id, row.id), eq(storeThemes.storeId, ctx.store.id)));
  await audit(ctx, "theme.preset_applied", `store_theme:${row.id}`, { presetId: preset.id });
  revalidatePath("/themes");
  return { config, presetId: preset.id };
});
