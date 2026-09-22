"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomToken } from "@pai/core";
import { and, avg, count, db, developers, eq, ne, platformInvoices, sql, storeThemes, themePurchases, themeReviews, themes } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { getStorePlan } from "@/lib/ctx";
import { ActionError } from "@/lib/errors";
import { uuid } from "@/lib/zod";

const PERM = { permission: "themes.manage" as const };

function refresh(slug?: string) {
  revalidatePath("/themes");
  revalidatePath("/themes/store");
  if (slug) revalidatePath(`/themes/store/${slug}`);
}

async function getOwnedRow(storeId: string, id: string) {
  const row = await db.query.storeThemes.findFirst({ where: and(eq(storeThemes.id, id), eq(storeThemes.storeId, storeId)) });
  if (!row) throw new ActionError("That theme no longer exists in your library.");
  return row;
}

async function getListedTheme(themeId: string) {
  const theme = await db.query.themes.findFirst({ where: eq(themes.id, themeId) });
  if (!theme || theme.status !== "approved") throw new ActionError("This theme isn't available in the Theme Store right now.");
  return theme;
}

/* ─────────────────────────── Library ─────────────────────────── */

export const publishTheme = action(z.object({ id: uuid }), PERM, async ({ id }, ctx) => {
  const row = await getOwnedRow(ctx.store.id, id);
  if (row.role === "live") return { id };
  await db.transaction(async (tx) => {
    await tx
      .update(storeThemes)
      .set({ role: "unpublished" })
      .where(and(eq(storeThemes.storeId, ctx.store.id), eq(storeThemes.role, "live"), ne(storeThemes.id, id)));
    await tx
      .update(storeThemes)
      .set({ role: "live", publishedAt: new Date(), config: row.draftConfig ?? row.config, draftConfig: null })
      .where(and(eq(storeThemes.id, id), eq(storeThemes.storeId, ctx.store.id)));
  });
  await audit(ctx, "theme.publish", id, { themeSlug: row.themeSlug, name: row.name });
  refresh();
  return { id };
});

export const renameTheme = action(z.object({ id: uuid, name: z.string().trim().min(1, "Enter a name").max(80) }), PERM, async ({ id, name }, ctx) => {
  await getOwnedRow(ctx.store.id, id);
  await db.update(storeThemes).set({ name }).where(and(eq(storeThemes.id, id), eq(storeThemes.storeId, ctx.store.id)));
  await audit(ctx, "theme.rename", id, { name });
  refresh();
  return { id };
});

export const duplicateTheme = action(z.object({ id: uuid }), PERM, async ({ id }, ctx) => {
  const row = await getOwnedRow(ctx.store.id, id);
  const [copy] = await db
    .insert(storeThemes)
    .values({
      storeId: ctx.store.id,
      themeSlug: row.themeSlug,
      name: `Copy of ${row.name}`.slice(0, 80),
      role: "unpublished",
      presetId: row.presetId,
      // The copy starts from whatever the merchant currently sees in the editor.
      config: row.draftConfig ?? row.config,
      draftConfig: null,
    })
    .returning({ id: storeThemes.id, name: storeThemes.name });
  await audit(ctx, "theme.duplicate", copy!.id, { from: id });
  refresh();
  return copy!;
});

export const deleteTheme = action(z.object({ id: uuid }), PERM, async ({ id }, ctx) => {
  const row = await getOwnedRow(ctx.store.id, id);
  if (row.role === "live") throw new ActionError("You can't delete your live theme. Publish another theme first.");
  await db.delete(storeThemes).where(and(eq(storeThemes.id, id), eq(storeThemes.storeId, ctx.store.id), eq(storeThemes.role, "unpublished")));
  await audit(ctx, "theme.delete", id, { themeSlug: row.themeSlug, name: row.name });
  refresh();
  return { id };
});

/* ─────────────────────────── Theme Store ─────────────────────────── */

/** Add a free (or already purchased) theme to the store's library. */
export const addThemeToLibrary = action(z.object({ themeId: uuid }), PERM, async ({ themeId }, ctx) => {
  const theme = await getListedTheme(themeId);
  if (theme.price > 0) {
    const owned = await db.query.themePurchases.findFirst({ where: and(eq(themePurchases.storeId, ctx.store.id), eq(themePurchases.themeId, theme.id)) });
    if (!owned) throw new ActionError(`${theme.name} is a premium theme — buy it first to add it to your library.`);
  }
  const storeThemeId = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ n: count() })
      .from(storeThemes)
      .where(and(eq(storeThemes.storeId, ctx.store.id), eq(storeThemes.themeSlug, theme.slug)));
    const [row] = await tx
      .insert(storeThemes)
      .values({ storeId: ctx.store.id, themeSlug: theme.slug, name: existing!.n > 0 ? `${theme.name} (${existing!.n + 1})` : theme.name, role: "unpublished", presetId: null })
      .returning({ id: storeThemes.id });
    // Count an install once per store.
    if (existing!.n === 0) await tx.update(themes).set({ installs: sql`${themes.installs} + 1` }).where(eq(themes.id, theme.id));
    return row!.id;
  });
  await audit(ctx, "theme.install", storeThemeId, { themeSlug: theme.slug });
  refresh(theme.slug);
  return { storeThemeId, name: theme.name };
});

const PAY_METHODS = { bkash: "bKash", sslcommerz: "SSLCommerz", card: "Card" } as const;

/**
 * Buy a premium theme (one-time). In this build the payment gateway step is stubbed and succeeds immediately.
 * Records the purchase + revenue split, credits the developer, issues a paid platform invoice and installs the theme.
 */
export const purchaseTheme = action(z.object({ themeId: uuid, method: z.enum(["bkash", "sslcommerz", "card"]) }), PERM, async ({ themeId, method }, ctx) => {
  const theme = await getListedTheme(themeId);
  if (theme.price <= 0) throw new ActionError("This theme is free — just add it to your library.");
  const { limits, name: planName } = await getStorePlan(ctx.store);
  const already = await db.query.themePurchases.findFirst({ where: and(eq(themePurchases.storeId, ctx.store.id), eq(themePurchases.themeId, theme.id)) });
  if (!already && !limits.premiumThemes) throw new ActionError(`Premium themes aren't included in the ${planName} plan. Upgrade to Growth or above to buy them.`);

  const developer = theme.developerId ? await db.query.developers.findFirst({ where: eq(developers.id, theme.developerId) }) : undefined;
  const sharePct = developer?.revenueSharePct ?? 70;
  const amount = theme.price;
  const developerShare = Math.round((amount * sharePct) / 100);
  const platformShare = amount - developerShare;

  const result = await db.transaction(async (tx) => {
    const [purchase] = await tx
      .insert(themePurchases)
      .values({ storeId: ctx.store.id, themeId: theme.id, amount, developerShare, platformShare })
      .onConflictDoNothing()
      .returning({ id: themePurchases.id });
    let invoiceNumber: string | null = null;
    if (purchase) {
      if (developer) {
        await tx
          .update(developers)
          .set({ balance: sql`${developers.balance} + ${developerShare}`, lifetimeEarnings: sql`${developers.lifetimeEarnings} + ${developerShare}` })
          .where(eq(developers.id, developer.id));
      }
      const now = new Date();
      const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
      invoiceNumber = `TH-${ymd}-${randomToken(4).toUpperCase()}`;
      await tx.insert(platformInvoices).values({
        number: invoiceNumber,
        storeId: ctx.store.id,
        description: `Theme purchase: ${theme.name}`,
        amount,
        currency: "BDT",
        status: "paid",
        paidAt: now,
        paymentMethod: PAY_METHODS[method],
      });
    }
    const [existing] = await tx
      .select({ n: count() })
      .from(storeThemes)
      .where(and(eq(storeThemes.storeId, ctx.store.id), eq(storeThemes.themeSlug, theme.slug)));
    const [row] = await tx
      .insert(storeThemes)
      .values({ storeId: ctx.store.id, themeSlug: theme.slug, name: existing!.n > 0 ? `${theme.name} (${existing!.n + 1})` : theme.name, role: "unpublished", presetId: null })
      .returning({ id: storeThemes.id });
    if (existing!.n === 0) await tx.update(themes).set({ installs: sql`${themes.installs} + 1` }).where(eq(themes.id, theme.id));
    return { storeThemeId: row!.id, purchased: !!purchase, invoiceNumber };
  });

  if (result.purchased) await audit(ctx, "theme.purchase", theme.id, { themeSlug: theme.slug, amount, method, invoice: result.invoiceNumber });
  await audit(ctx, "theme.install", result.storeThemeId, { themeSlug: theme.slug });
  refresh(theme.slug);
  revalidatePath("/settings/billing");
  return { storeThemeId: result.storeThemeId, name: theme.name, invoiceNumber: result.invoiceNumber };
});

/** Leave or update this store's review of a theme it has installed or purchased. */
export const saveThemeReview = action(
  z.object({ themeId: uuid, rating: z.coerce.number().int().min(1, "Pick a rating").max(5), body: z.string().trim().max(2000).optional() }),
  PERM,
  async ({ themeId, rating, body }, ctx) => {
    const theme = await db.query.themes.findFirst({ where: eq(themes.id, themeId) });
    if (!theme) throw new ActionError("Theme not found.");
    const [installed, purchased] = await Promise.all([
      db.query.storeThemes.findFirst({ where: and(eq(storeThemes.storeId, ctx.store.id), eq(storeThemes.themeSlug, theme.slug)) }),
      db.query.themePurchases.findFirst({ where: and(eq(themePurchases.storeId, ctx.store.id), eq(themePurchases.themeId, theme.id)) }),
    ]);
    if (!installed && !purchased) throw new ActionError("Add this theme to your library before reviewing it.");

    await db.transaction(async (tx) => {
      const [mine] = await tx
        .select({ id: themeReviews.id })
        .from(themeReviews)
        .where(and(eq(themeReviews.themeId, theme.id), eq(themeReviews.storeId, ctx.store.id)))
        .limit(1);
      if (mine) await tx.update(themeReviews).set({ rating, body: body || null }).where(eq(themeReviews.id, mine.id));
      else await tx.insert(themeReviews).values({ themeId: theme.id, storeId: ctx.store.id, rating, body: body || null });
      const [agg] = await tx.select({ n: count(), avg: avg(themeReviews.rating) }).from(themeReviews).where(eq(themeReviews.themeId, theme.id));
      await tx
        .update(themes)
        .set({ ratingCount: agg!.n, ratingAvg: Math.round(Number(agg!.avg ?? 0) * 10) / 10 })
        .where(eq(themes.id, theme.id));
    });
    await audit(ctx, "theme.review", theme.id, { rating });
    refresh(theme.slug);
    return { ok: true };
  },
);
