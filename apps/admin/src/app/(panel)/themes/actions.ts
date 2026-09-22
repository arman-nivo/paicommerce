"use server";

import { z } from "zod";
import { and, db, desc, developers, eq, ilike, themes, themeVersions } from "@pai/db";
import { adminAction, fail } from "@/lib/action";
import { audit } from "@/lib/audit";
import { registryManifests } from "@/lib/registry";

const id = z.string().uuid();

export const reviewTheme = adminAction(
  "themes.manage",
  z.object({ id, decision: z.enum(["approve", "reject"]), notes: z.string().trim().max(4000).optional() }),
  async ({ id, decision, notes }, admin) => {
    const theme = await db.query.themes.findFirst({ where: eq(themes.id, id) });
    if (!theme) fail("Theme not found");
    if (decision === "reject" && (!notes || notes.length < 5)) fail("Please explain what needs fixing (at least 5 characters).");
    const status = decision === "approve" ? "approved" : "rejected";
    const now = new Date();
    await db.transaction(async (tx) => {
      await tx
        .update(themes)
        .set({ status, reviewNotes: notes || null, ...(decision === "approve" ? { approvedAt: now } : {}) })
        .where(eq(themes.id, id));
      const [pending] = await tx
        .select()
        .from(themeVersions)
        .where(and(eq(themeVersions.themeId, id), eq(themeVersions.status, "in_review")))
        .orderBy(desc(themeVersions.submittedAt))
        .limit(1);
      if (pending) {
        await tx.update(themeVersions).set({ status, reviewNotes: notes || null, reviewedAt: now, reviewerId: admin.id }).where(eq(themeVersions.id, pending.id));
      } else {
        await tx.insert(themeVersions).values({ themeId: id, version: theme.version, status, reviewNotes: notes || null, reviewedAt: now, reviewerId: admin.id, changelog: "Reviewed from admin" });
      }
    });
    await audit({ actorId: admin.id, action: decision === "approve" ? "theme.approved" : "theme.rejected", target: theme.slug, meta: { themeId: id, version: theme.version, notes } });
    return { message: `${theme.name} ${decision === "approve" ? "approved and live in the Theme Store" : "rejected — developer notified via review notes"}` };
  },
);

export const setThemeFeatured = adminAction("themes.manage", z.object({ id, featured: z.boolean() }), async ({ id, featured }, admin) => {
  const theme = await db.query.themes.findFirst({ where: eq(themes.id, id) });
  if (!theme) fail("Theme not found");
  if (featured && theme.status !== "approved") fail("Only approved themes can be featured.");
  await db.update(themes).set({ featured }).where(eq(themes.id, id));
  await audit({ actorId: admin.id, action: featured ? "theme.featured" : "theme.unfeatured", target: theme.slug, meta: { themeId: id } });
  return { message: `${theme.name} ${featured ? "featured" : "unfeatured"}` };
});

export const setThemeListed = adminAction("themes.manage", z.object({ id, listed: z.boolean() }), async ({ id, listed }, admin) => {
  const theme = await db.query.themes.findFirst({ where: eq(themes.id, id) });
  if (!theme) fail("Theme not found");
  if (listed && theme.status !== "unlisted") fail("Theme isn't unlisted.");
  await db
    .update(themes)
    .set(listed ? { status: theme.approvedAt ? "approved" : "in_review" } : { status: "unlisted", featured: false })
    .where(eq(themes.id, id));
  await audit({ actorId: admin.id, action: listed ? "theme.relisted" : "theme.unlisted", target: theme.slug, meta: { themeId: id } });
  return { message: listed ? `${theme.name} relisted` : `${theme.name} unlisted — existing installs keep working` };
});

const url = z.string().trim().url().max(1000);
export const updateThemeListing = adminAction(
  "themes.manage",
  z.object({
    id,
    name: z.string().trim().min(2).max(60),
    tagline: z.string().trim().max(160),
    description: z.string().trim().max(5000),
    categories: z.array(z.string().trim().min(1).max(40)).max(10),
    tags: z.array(z.string().trim().min(1).max(40)).max(20),
    features: z.array(z.string().trim().min(1).max(120)).max(30),
    price: z.number().int().min(0).max(100_000_000),
    thumbnailUrl: z.union([url, z.literal("")]),
    screenshots: z.array(url).max(12),
    demoStoreSlug: z.union([z.string().trim().regex(/^[a-z0-9-]{2,64}$/, "Invalid store slug"), z.literal("")]),
    repoUrl: z.union([url, z.literal("")]),
  }),
  async ({ id, ...v }, admin) => {
    const theme = await db.query.themes.findFirst({ where: eq(themes.id, id) });
    if (!theme) fail("Theme not found");
    await db
      .update(themes)
      .set({ ...v, tagline: v.tagline || null, description: v.description || null, thumbnailUrl: v.thumbnailUrl || null, demoStoreSlug: v.demoStoreSlug || null, repoUrl: v.repoUrl || null })
      .where(eq(themes.id, id));
    await audit({ actorId: admin.id, action: "theme.updated", target: theme.slug, meta: { themeId: id, changes: Object.keys(v).filter((k) => JSON.stringify((theme as Record<string, unknown>)[k] ?? "") !== JSON.stringify((v as Record<string, unknown>)[k] ?? "")) } });
    return { message: "Listing saved" };
  },
);

/** Upsert Theme Store listings from the code registry manifests. */
export const syncRegistry = adminAction(
  "themes.manage",
  z.object({ newStatus: z.enum(["in_review", "approved", "draft"]).default("in_review"), overwrite: z.boolean().default(false), slugs: z.array(z.string()).optional() }),
  async ({ newStatus, overwrite, slugs }, admin) => {
    const all = registryManifests().filter((m) => !slugs || slugs.includes(m.slug));
    const existing = await db.select().from(themes);
    const bySlug = new Map(existing.map((t) => [t.slug, t]));
    let created = 0;
    let bumped = 0;
    let updated = 0;
    for (const m of all) {
      const row = bySlug.get(m.slug);
      const listing = {
        name: m.name,
        tagline: m.tagline,
        description: m.description,
        categories: [...m.categories],
        tags: m.tags ?? [],
        price: m.price,
        thumbnailUrl: m.thumbnail,
        screenshots: m.screenshots ?? [],
        features: m.features ?? [],
      };
      if (!row) {
        const dev = m.author?.name ? await db.query.developers.findFirst({ where: ilike(developers.displayName, m.author.name) }) : undefined;
        const now = new Date();
        const [t] = await db
          .insert(themes)
          .values({
            slug: m.slug,
            version: m.version,
            developerId: dev?.id ?? null,
            status: newStatus,
            submittedAt: now,
            approvedAt: newStatus === "approved" ? now : null,
            repoUrl: m.author?.url ?? null,
            ...listing,
          })
          .returning({ id: themes.id });
        await db.insert(themeVersions).values({
          themeId: t!.id,
          version: m.version,
          changelog: "Initial listing synced from code registry",
          status: newStatus === "draft" ? "draft" : newStatus,
          ...(newStatus === "approved" ? { reviewedAt: now, reviewerId: admin.id } : {}),
        });
        created++;
        continue;
      }
      const patch: Partial<typeof themes.$inferInsert> = {};
      if (row.version !== m.version) {
        patch.version = m.version;
        await db.insert(themeVersions).values({ themeId: row.id, version: m.version, changelog: `Synced from code registry (was ${row.version})`, status: row.status === "approved" ? "approved" : "in_review", ...(row.status === "approved" ? { reviewedAt: new Date(), reviewerId: admin.id } : {}) });
        bumped++;
      }
      if (overwrite) Object.assign(patch, listing);
      if (Object.keys(patch).length) {
        await db.update(themes).set(patch).where(eq(themes.id, row.id));
        if (overwrite) updated++;
      }
    }
    await audit({ actorId: admin.id, action: "theme.registry_sync", meta: { created, versionBumps: bumped, updated, newStatus, overwrite } });
    return { message: `Sync complete — ${created} created, ${bumped} version updates${overwrite ? `, ${updated} listings refreshed` : ""}` };
  },
);
