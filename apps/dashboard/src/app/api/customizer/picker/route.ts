import { NextResponse } from "next/server";
import { and, asc, blogPosts, collections, db, desc, eq, ilike, inArray, menus, or, pages, products } from "@pai/db";
import { getActionCtx } from "@/lib/ctx";

/**
 * Picker data for the theme customizer (tenant-scoped).
 *   GET ?kind=products|collections|menus|pages|posts&q=&slugs=a,b
 * `slugs` returns exactly those items (used to render already-selected values).
 */
export async function GET(req: Request) {
  let ctx;
  try {
    ctx = await getActionCtx("themes.manage");
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
  const sp = new URL(req.url).searchParams;
  const kind = sp.get("kind");
  const q = sp.get("q")?.trim().slice(0, 100) || "";
  const slugs = (sp.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
  const like = `%${q.replace(/[%_]/g, "\\$&")}%`;
  const sid = ctx.store.id;

  switch (kind) {
    case "products": {
      const rows = await db
        .select({ slug: products.slug, title: products.title, images: products.images, status: products.status })
        .from(products)
        .where(and(eq(products.storeId, sid), slugs.length ? inArray(products.slug, slugs) : q ? or(ilike(products.title, like), ilike(products.slug, like), ilike(products.sku, like)) : undefined))
        .orderBy(desc(products.updatedAt))
        .limit(slugs.length ? 50 : 30);
      return NextResponse.json({ items: rows.map((r) => ({ slug: r.slug, title: r.title, image: r.images?.[0]?.url ?? null, status: r.status })) });
    }
    case "collections": {
      const rows = await db
        .select({ slug: collections.slug, title: collections.title, image: collections.imageUrl })
        .from(collections)
        .where(and(eq(collections.storeId, sid), slugs.length ? inArray(collections.slug, slugs) : q ? ilike(collections.title, like) : undefined))
        .orderBy(asc(collections.position), asc(collections.title))
        .limit(50);
      return NextResponse.json({ items: rows });
    }
    case "menus": {
      const rows = await db.select({ handle: menus.handle, title: menus.title, items: menus.items }).from(menus).where(eq(menus.storeId, sid)).orderBy(asc(menus.title));
      return NextResponse.json({ items: rows.map((m) => ({ handle: m.handle, title: m.title, count: m.items?.length ?? 0 })) });
    }
    case "pages": {
      const rows = await db
        .select({ slug: pages.slug, title: pages.title })
        .from(pages)
        .where(and(eq(pages.storeId, sid), q ? ilike(pages.title, like) : undefined))
        .orderBy(asc(pages.title))
        .limit(50);
      return NextResponse.json({ items: rows });
    }
    case "posts": {
      const rows = await db
        .select({ slug: blogPosts.slug, title: blogPosts.title })
        .from(blogPosts)
        .where(and(eq(blogPosts.storeId, sid), q ? ilike(blogPosts.title, like) : undefined))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(50);
      return NextResponse.json({ items: rows });
    }
    default:
      return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
  }
}
