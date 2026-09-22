"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, db, eq, inArray, pages } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { uuid, uuids } from "@/lib/zod";
import { uniqueSlug } from "../_lib/slug";

const pageInput = z.object({
  id: uuid.optional().nullable(),
  title: z.string().trim().min(1, "Give your page a title").max(200),
  slug: z.string().trim().max(80).optional().default(""),
  content: z.string().max(500_000).optional().default(""),
  published: z.boolean(),
  seo: z.object({ title: z.string().trim().max(120).optional().default(""), description: z.string().trim().max(320).optional().default("") }).optional(),
});

export const savePage = action(pageInput, { permission: "content.manage" }, async (input, ctx) => {
  const slug = await uniqueSlug("page", ctx.store.id, input.slug || input.title, input.id);
  const seo = input.seo && (input.seo.title || input.seo.description) ? { title: input.seo.title || undefined, description: input.seo.description || undefined } : null;
  const values = { title: input.title, slug, content: input.content || null, published: input.published, seo };
  let id = input.id;
  if (id) {
    const [row] = await db.update(pages).set(values).where(and(eq(pages.id, id), eq(pages.storeId, ctx.store.id))).returning({ id: pages.id });
    if (!row) throw new ActionError("This page no longer exists.");
    await audit(ctx, "page.updated", id, { title: input.title });
  } else {
    const [row] = await db.insert(pages).values({ ...values, storeId: ctx.store.id }).returning({ id: pages.id });
    id = row!.id;
    await audit(ctx, "page.created", id, { title: input.title });
  }
  revalidatePath("/content/pages");
  revalidatePath(`/content/pages/${id}`);
  return { id, slug };
});

export const deletePages = action(z.object({ ids: uuids }), { permission: "content.manage" }, async ({ ids }, ctx) => {
  const rows = await db.delete(pages).where(and(eq(pages.storeId, ctx.store.id), inArray(pages.id, ids))).returning({ id: pages.id, title: pages.title });
  for (const r of rows) await audit(ctx, "page.deleted", r.id, { title: r.title });
  revalidatePath("/content/pages");
  return { count: rows.length };
});

export const setPagesPublished = action(z.object({ ids: uuids, published: z.boolean() }), { permission: "content.manage" }, async ({ ids, published }, ctx) => {
  const rows = await db.update(pages).set({ published }).where(and(eq(pages.storeId, ctx.store.id), inArray(pages.id, ids))).returning({ id: pages.id });
  revalidatePath("/content/pages");
  return { count: rows.length };
});
