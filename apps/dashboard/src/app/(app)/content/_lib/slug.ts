import { slugify } from "@pai/core";
import { and, blogPosts, db, eq, ilike, ne, or, pages } from "@pai/db";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns a handle that is unique for this store in the given table:
 * "about-us" → "about-us-2" → "about-us-3"… (excluding the row being edited).
 */
export async function uniqueSlug(kind: "page" | "post", storeId: string, desired: string, excludeId?: string | null): Promise<string> {
  const t = kind === "page" ? pages : blogPosts;
  const base = slugify(desired).slice(0, 70) || (kind === "page" ? "page" : "post");
  const rows = await db
    .select({ slug: t.slug })
    .from(t)
    .where(and(eq(t.storeId, storeId), or(eq(t.slug, base), ilike(t.slug, `${base.replace(/[%_]/g, "\\$&")}-%`)), excludeId ? ne(t.id, excludeId) : undefined));
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 10_000; n++) {
    const s = `${base}-${n}`;
    if (!taken.has(s)) return s;
  }
  return `${base}-${Date.now().toString(36)}`;
}
