"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, blogPosts, db, eq, inArray } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { uuid, uuids } from "@/lib/zod";
import { uniqueSlug } from "../_lib/slug";

const postInput = z.object({
  id: uuid.optional().nullable(),
  title: z.string().trim().min(1, "Give your post a title").max(200),
  slug: z.string().trim().max(80).optional().default(""),
  excerpt: z.string().trim().max(1000).optional().default(""),
  content: z.string().max(500_000).optional().default(""),
  coverUrl: z.string().trim().max(2000).optional().nullable(),
  author: z.string().trim().max(120).optional().default(""),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  published: z.boolean(),
  /** ISO string; null → now. */
  publishedAt: z.string().max(40).optional().nullable(),
  seo: z.object({ title: z.string().trim().max(120).optional().default(""), description: z.string().trim().max(320).optional().default("") }).optional(),
});

export const savePost = action(postInput, { permission: "content.manage" }, async (input, ctx) => {
  const slug = await uniqueSlug("post", ctx.store.id, input.slug || input.title, input.id);
  let publishedAt = new Date();
  if (input.publishedAt) {
    const d = new Date(input.publishedAt);
    if (Number.isNaN(d.getTime())) throw new ActionError("Enter a valid publish date.");
    publishedAt = d;
  }
  if (input.coverUrl && !/^(https?:\/\/|\/)/i.test(input.coverUrl)) throw new ActionError("Cover image URL is invalid.");
  const seo = input.seo && (input.seo.title || input.seo.description) ? { title: input.seo.title || undefined, description: input.seo.description || undefined } : null;
  const tags = [...new Map(input.tags.map((t) => [t.toLowerCase(), t])).values()];
  const values = {
    title: input.title,
    slug,
    excerpt: input.excerpt || null,
    content: input.content || null,
    coverUrl: input.coverUrl || null,
    author: input.author || null,
    tags,
    published: input.published,
    publishedAt,
    seo,
  };
  let id = input.id;
  if (id) {
    const [row] = await db.update(blogPosts).set(values).where(and(eq(blogPosts.id, id), eq(blogPosts.storeId, ctx.store.id))).returning({ id: blogPosts.id });
    if (!row) throw new ActionError("This post no longer exists.");
    await audit(ctx, "blog_post.updated", id, { title: input.title });
  } else {
    const [row] = await db.insert(blogPosts).values({ ...values, storeId: ctx.store.id }).returning({ id: blogPosts.id });
    id = row!.id;
    await audit(ctx, "blog_post.created", id, { title: input.title });
  }
  revalidatePath("/content/blog");
  revalidatePath(`/content/blog/${id}`);
  return { id, slug };
});

export const deletePosts = action(z.object({ ids: uuids }), { permission: "content.manage" }, async ({ ids }, ctx) => {
  const rows = await db.delete(blogPosts).where(and(eq(blogPosts.storeId, ctx.store.id), inArray(blogPosts.id, ids))).returning({ id: blogPosts.id, title: blogPosts.title });
  for (const r of rows) await audit(ctx, "blog_post.deleted", r.id, { title: r.title });
  revalidatePath("/content/blog");
  return { count: rows.length };
});
