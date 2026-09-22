import { NextResponse } from "next/server";
import { and, count, db, desc, eq, ilike, media } from "@pai/db";
import { getActionCtx } from "@/lib/ctx";

/** GET ?q=&page= → paginated media library for the active store. */
export async function GET(req: Request) {
  let ctx;
  try {
    ctx = await getActionCtx();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const q = sp.get("q")?.trim();
  const pageSize = 40;
  const where = and(eq(media.storeId, ctx.store.id), q ? ilike(media.alt, `%${q}%`) : undefined);
  const [items, [total]] = await Promise.all([
    db.select().from(media).where(where).orderBy(desc(media.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ n: count() }).from(media).where(where),
  ]);
  return NextResponse.json({ items: items.map((m) => ({ id: m.id, url: m.url, alt: m.alt, mime: m.mime, size: m.size })), total: total?.n ?? 0, page, pageSize });
}
