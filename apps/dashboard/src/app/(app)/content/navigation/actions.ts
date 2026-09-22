"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { slugify } from "@pai/core";
import { and, asc, blogPosts, collections, db, desc, eq, ilike, menus, pages, products, type MenuItem } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { uuid } from "@/lib/zod";

const RESERVED = ["main", "footer"];

const urlStr = z
  .string()
  .trim()
  .min(1, "Choose where this link goes")
  .max(2000)
  .refine((u) => /^(\/|#|https?:\/\/|mailto:|tel:)/i.test(u), "Links must start with /, https://, mailto: or tel:")
  .refine((u) => !/^\s*javascript:/i.test(u), "Invalid link");
const leaf = z.object({ id: z.string().min(1).max(64), label: z.string().trim().min(1, "Every menu item needs a label").max(80), url: urlStr });
const level2 = leaf.extend({ children: z.array(leaf).max(50).optional() });
const level1 = leaf.extend({ children: z.array(level2).max(50).optional() });

export const createMenu = action(
  z.object({ title: z.string().trim().min(1, "Give the menu a name").max(80), handle: z.string().trim().max(60).optional().default("") }),
  { permission: "content.manage" },
  async (input, ctx) => {
    const handle = slugify(input.handle || input.title);
    const exists = await db.query.menus.findFirst({ where: and(eq(menus.storeId, ctx.store.id), eq(menus.handle, handle)), columns: { id: true } });
    if (exists) throw new ActionError(`A menu with the handle “${handle}” already exists.`);
    const [row] = await db.insert(menus).values({ storeId: ctx.store.id, title: input.title, handle, items: [] }).returning({ id: menus.id });
    await audit(ctx, "menu.created", row!.id, { handle });
    revalidatePath("/content/navigation");
    return { id: row!.id };
  },
);

export const saveMenu = action(z.object({ id: uuid, title: z.string().trim().min(1, "Give the menu a name").max(80), items: z.array(level1).max(100) }), { permission: "content.manage" }, async (input, ctx) => {
  const clean = (list: MenuItem[]): MenuItem[] => list.map((i) => ({ id: i.id, label: i.label, url: i.url, ...(i.children?.length ? { children: clean(i.children) } : {}) }));
  const [row] = await db
    .update(menus)
    .set({ title: input.title, items: clean(input.items as MenuItem[]) })
    .where(and(eq(menus.id, input.id), eq(menus.storeId, ctx.store.id)))
    .returning({ id: menus.id, handle: menus.handle });
  if (!row) throw new ActionError("This menu no longer exists.");
  await audit(ctx, "menu.updated", row.id, { handle: row.handle });
  revalidatePath("/content/navigation");
  revalidatePath(`/content/navigation/${row.id}`);
  return { id: row.id };
});

export const deleteMenu = action(z.object({ id: uuid }), { permission: "content.manage" }, async ({ id }, ctx) => {
  const menu = await db.query.menus.findFirst({ where: and(eq(menus.id, id), eq(menus.storeId, ctx.store.id)) });
  if (!menu) throw new ActionError("This menu no longer exists.");
  if (RESERVED.includes(menu.handle)) throw new ActionError("The main and footer menus are used by your theme and can't be deleted.");
  await db.delete(menus).where(and(eq(menus.id, id), eq(menus.storeId, ctx.store.id)));
  await audit(ctx, "menu.deleted", id, { handle: menu.handle });
  revalidatePath("/content/navigation");
  return { id };
});

/** Creates the "main" and "footer" menus (if missing) pre-filled from the store's collections and pages. */
export const createDefaultMenus = action(z.object({}), { permission: "content.manage" }, async (_input, ctx) => {
  const storeId = ctx.store.id;
  const [existing, cols, pgs, [post]] = await Promise.all([
    db.select({ handle: menus.handle }).from(menus).where(eq(menus.storeId, storeId)),
    db.select({ title: collections.title, slug: collections.slug }).from(collections).where(and(eq(collections.storeId, storeId), eq(collections.published, true))).orderBy(asc(collections.position), asc(collections.title)).limit(5),
    db.select({ title: pages.title, slug: pages.slug }).from(pages).where(and(eq(pages.storeId, storeId), eq(pages.published, true))).orderBy(asc(pages.createdAt)).limit(10),
    db.select({ id: blogPosts.id }).from(blogPosts).where(and(eq(blogPosts.storeId, storeId), eq(blogPosts.published, true))).limit(1),
  ]);
  const have = new Set(existing.map((e) => e.handle));
  const item = (label: string, url: string, children?: MenuItem[]): MenuItem => ({ id: crypto.randomUUID(), label, url, ...(children?.length ? { children } : {}) });
  const created: string[] = [];

  if (!have.has("main")) {
    const items: MenuItem[] = [item("Home", "/"), item("Shop all", "/collections/all")];
    if (cols.length) items.push(item("Categories", "/collections/all", cols.map((c) => item(c.title, `/collections/${c.slug}`))));
    const about = pgs.find((p) => /about/i.test(p.slug));
    if (post) items.push(item("Blog", "/blog"));
    if (about) items.push(item(about.title, `/pages/${about.slug}`));
    const contact = pgs.find((p) => /contact/i.test(p.slug));
    if (contact) items.push(item(contact.title, `/pages/${contact.slug}`));
    await db.insert(menus).values({ storeId, handle: "main", title: "Main menu", items }).onConflictDoNothing();
    created.push("main");
  }
  if (!have.has("footer")) {
    const items: MenuItem[] = pgs.length ? pgs.map((p) => item(p.title, `/pages/${p.slug}`)) : [item("Search", "/search"), item("Shop all", "/collections/all")];
    await db.insert(menus).values({ storeId, handle: "footer", title: "Footer menu", items }).onConflictDoNothing();
    created.push("footer");
  }
  if (created.length) await audit(ctx, "menu.defaults_created", undefined, { created });
  revalidatePath("/content/navigation");
  return { created };
});

export type LinkTarget = { id: string; title: string; url: string; image?: string | null; hint?: string };

/** Search this store's resources for the link picker. */
export const searchLinkTargets = action(
  z.object({ type: z.enum(["collection", "product", "page", "post"]), q: z.string().trim().max(100).optional().default("") }),
  { permission: "content.manage" },
  async ({ type, q }, ctx): Promise<LinkTarget[]> => {
    const storeId = ctx.store.id;
    const like = q ? `%${q.replace(/[%_]/g, "\\$&")}%` : undefined;
    if (type === "collection") {
      const rows = await db
        .select({ id: collections.id, title: collections.title, slug: collections.slug, image: collections.imageUrl, published: collections.published })
        .from(collections)
        .where(and(eq(collections.storeId, storeId), like ? ilike(collections.title, like) : undefined))
        .orderBy(asc(collections.position), asc(collections.title))
        .limit(20);
      return rows.map((r) => ({ id: r.id, title: r.title, url: `/collections/${r.slug}`, image: r.image, hint: r.published ? undefined : "Hidden" }));
    }
    if (type === "product") {
      const rows = await db
        .select({ id: products.id, title: products.title, slug: products.slug, images: products.images, status: products.status })
        .from(products)
        .where(and(eq(products.storeId, storeId), like ? ilike(products.title, like) : undefined))
        .orderBy(desc(products.updatedAt))
        .limit(20);
      return rows.map((r) => ({ id: r.id, title: r.title, url: `/products/${r.slug}`, image: r.images?.[0]?.url ?? null, hint: r.status === "active" ? undefined : r.status === "draft" ? "Draft" : "Archived" }));
    }
    if (type === "page") {
      const rows = await db
        .select({ id: pages.id, title: pages.title, slug: pages.slug, published: pages.published })
        .from(pages)
        .where(and(eq(pages.storeId, storeId), like ? ilike(pages.title, like) : undefined))
        .orderBy(asc(pages.title))
        .limit(20);
      return rows.map((r) => ({ id: r.id, title: r.title, url: `/pages/${r.slug}`, hint: r.published ? undefined : "Hidden" }));
    }
    const rows = await db
      .select({ id: blogPosts.id, title: blogPosts.title, slug: blogPosts.slug, image: blogPosts.coverUrl, published: blogPosts.published })
      .from(blogPosts)
      .where(and(eq(blogPosts.storeId, storeId), like ? ilike(blogPosts.title, like) : undefined))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(20);
    return rows.map((r) => ({ id: r.id, title: r.title, url: `/blog/${r.slug}`, image: r.image, hint: r.published ? undefined : "Draft" }));
  },
);
