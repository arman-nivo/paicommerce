import Link from "next/link";
import { ExternalLink, ImageIcon, Newspaper, Plus } from "lucide-react";
import { storeUrl } from "@pai/core";
import { and, blogPosts, count, db, desc, eq, gt, ilike, lte, or, sql } from "@pai/db";
import { Badge, buttonVariants, Card, EmptyState, Table, TBody, TD, TH, THead, TR } from "@pai/ui";
import { Header } from "@/components/page";
import { Pagination } from "@/components/pagination";
import { SearchBox, UrlTabs } from "@/components/url-controls";
import { getCtx } from "@/lib/ctx";
import { formatDateTime, pageParam, str, type SearchParams } from "@/lib/format";
import { PostStatusBadge, postStatus } from "./_components/status";

export const metadata = { title: "Blog posts" };
const PAGE_SIZE = 25;

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("content.manage");
  const sp = await searchParams;
  const q = str(sp.q).trim();
  const tab = str(sp.tab);
  const page = pageParam(sp.page);
  const storeId = ctx.store.id;
  const base = storeUrl(ctx.store);
  const now = new Date();

  const search = q ? or(ilike(blogPosts.title, `%${q}%`), ilike(blogPosts.author, `%${q}%`), sql`${q} = any(${blogPosts.tags})`) : undefined;
  const statusFilter =
    tab === "published"
      ? and(eq(blogPosts.published, true), or(lte(blogPosts.publishedAt, now), sql`${blogPosts.publishedAt} is null`))
      : tab === "scheduled"
        ? and(eq(blogPosts.published, true), gt(blogPosts.publishedAt, now))
        : tab === "draft"
          ? eq(blogPosts.published, false)
          : undefined;
  const where = and(eq(blogPosts.storeId, storeId), search, statusFilter);

  const [rows, [total], [stats]] = await Promise.all([
    db
      .select({ id: blogPosts.id, title: blogPosts.title, slug: blogPosts.slug, coverUrl: blogPosts.coverUrl, author: blogPosts.author, tags: blogPosts.tags, published: blogPosts.published, publishedAt: blogPosts.publishedAt })
      .from(blogPosts)
      .where(where)
      .orderBy(desc(sql`coalesce(${blogPosts.publishedAt}, ${blogPosts.createdAt})`))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(blogPosts).where(where),
    db
      .select({
        all: count(),
        draft: sql<number>`count(*) filter (where not ${blogPosts.published})::int`,
        scheduled: sql<number>`count(*) filter (where ${blogPosts.published} and ${blogPosts.publishedAt} > now())::int`,
      })
      .from(blogPosts)
      .where(eq(blogPosts.storeId, storeId)),
  ]);
  const all = stats?.all ?? 0;
  const draft = stats?.draft ?? 0;
  const scheduled = stats?.scheduled ?? 0;

  const addBtn = (
    <Link href="/content/blog/new" className={buttonVariants()}>
      <Plus /> Write post
    </Link>
  );

  return (
    <>
      <Header title="Blog posts" description="News, style guides and stories that bring shoppers to your store from Google and Facebook." actions={all > 0 && addBtn} />
      {all === 0 ? (
        <Card>
          <EmptyState
            icon={<Newspaper />}
            title="Start your blog"
            description="Write about new arrivals, gift ideas for Eid, how-to guides or behind-the-scenes stories. Blog posts help customers find you on Google."
            action={addBtn}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <UrlTabs
            tabs={[
              { value: "", label: "All", count: all },
              { value: "published", label: "Published", count: all - draft - scheduled },
              { value: "scheduled", label: "Scheduled", count: scheduled },
              { value: "draft", label: "Drafts", count: draft },
            ]}
          />
          <div className="border-b border-border p-3">
            <SearchBox placeholder="Search by title, author or exact tag" className="max-w-md" />
          </div>
          {rows.length === 0 ? (
            <EmptyState icon={<Newspaper />} title="No posts found" description="Try a different search or filter." />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Post</TH>
                  <TH>Status</TH>
                  <TH className="hidden lg:table-cell">Author</TH>
                  <TH className="hidden xl:table-cell">Tags</TH>
                  <TH className="hidden md:table-cell">Publish date</TH>
                  <TH className="w-12" />
                </TR>
              </THead>
              <TBody>
                {rows.map((r) => {
                  const st = postStatus(r.published, r.publishedAt);
                  return (
                    <TR key={r.id} className="group">
                      <TD>
                        <Link href={`/content/blog/${r.id}`} className="flex min-w-60 items-center gap-3">
                          <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
                            {r.coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={r.coverUrl} alt="" className="size-full object-cover" loading="lazy" />
                            ) : (
                              <ImageIcon className="size-4" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="line-clamp-1 font-medium group-hover:text-primary">{r.title}</span>
                            <span className="block truncate text-xs text-muted-foreground">/blog/{r.slug}</span>
                          </span>
                        </Link>
                      </TD>
                      <TD>
                        <PostStatusBadge status={st} />
                      </TD>
                      <TD className="hidden text-muted-foreground lg:table-cell">{r.author || "—"}</TD>
                      <TD className="hidden xl:table-cell">
                        <div className="flex max-w-56 flex-wrap gap-1">
                          {r.tags.slice(0, 3).map((t) => (
                            <Badge key={t}>{t}</Badge>
                          ))}
                          {r.tags.length > 3 && <span className="text-xs text-muted-foreground">+{r.tags.length - 3}</span>}
                        </div>
                      </TD>
                      <TD className="hidden whitespace-nowrap text-muted-foreground md:table-cell">{r.published ? formatDateTime(r.publishedAt) : "—"}</TD>
                      <TD>
                        {st === "published" && (
                          <a href={`${base}/blog/${r.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="View on store" title="View on store">
                            <ExternalLink className="size-4" />
                          </a>
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
          <Pagination page={page} pageSize={PAGE_SIZE} total={total?.n ?? 0} basePath="/content/blog" params={sp} />
        </Card>
      )}
    </>
  );
}
