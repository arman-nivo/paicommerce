import { and, count, db, desc, eq, ilike, like, media, or, sql } from "@pai/db";
import { Pagination } from "@/components/pagination";
import { getCtx } from "@/lib/ctx";
import { pageParam, str, type SearchParams } from "@/lib/format";
import { MediaLibrary } from "./_components/media-library";

export const metadata = { title: "Media library" };
const PAGE_SIZE = 48;

export default async function MediaPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("content.manage");
  const sp = await searchParams;
  const q = str(sp.q).trim();
  const type = str(sp.type);
  const page = pageParam(sp.page);
  const storeId = ctx.store.id;

  const typeFilter =
    type === "image"
      ? or(like(media.mime, "image/%"), sql`${media.mime} is null`)
      : type === "video"
        ? like(media.mime, "video/%")
        : type === "pdf"
          ? eq(media.mime, "application/pdf")
          : undefined;
  const where = and(eq(media.storeId, storeId), q ? or(ilike(media.alt, `%${q}%`), ilike(media.url, `%${q}%`)) : undefined, typeFilter);

  const [rows, [total], [all]] = await Promise.all([
    db.select().from(media).where(where).orderBy(desc(media.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(media).where(where),
    db.select({ n: count(), bytes: sql<number>`coalesce(sum(${media.size}), 0)::bigint` }).from(media).where(eq(media.storeId, storeId)),
  ]);

  return (
    <MediaLibrary
      items={rows.map((m) => ({ id: m.id, url: m.url, alt: m.alt, mime: m.mime, size: m.size, width: m.width, height: m.height, createdAt: m.createdAt.toISOString() }))}
      total={total?.n ?? 0}
      pagination={(total?.n ?? 0) > PAGE_SIZE ? <Pagination page={page} pageSize={PAGE_SIZE} total={total?.n ?? 0} basePath="/content/media" params={sp} /> : null}
      libraryCount={all?.n ?? 0}
      libraryBytes={Number(all?.bytes ?? 0)}
      filtered={!!(q || type)}
    />
  );
}
