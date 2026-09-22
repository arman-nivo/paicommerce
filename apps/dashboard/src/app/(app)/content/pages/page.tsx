import Link from "next/link";
import { ExternalLink, FileText, Plus } from "lucide-react";
import { storeUrl } from "@pai/core";
import { and, count, db, desc, eq, ilike, or, pages } from "@pai/db";
import { Badge, buttonVariants, Card, EmptyState, Table, TBody, TD, TH, THead, TR } from "@pai/ui";
import { Header } from "@/components/page";
import { Pagination } from "@/components/pagination";
import { SearchBox, UrlTabs } from "@/components/url-controls";
import { getCtx } from "@/lib/ctx";
import { formatDate, pageParam, str, type SearchParams } from "@/lib/format";

export const metadata = { title: "Pages" };
const PAGE_SIZE = 25;

export default async function PagesPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("content.manage");
  const sp = await searchParams;
  const q = str(sp.q).trim();
  const tab = str(sp.tab);
  const page = pageParam(sp.page);
  const storeId = ctx.store.id;
  const base = storeUrl(ctx.store);

  const search = q ? or(ilike(pages.title, `%${q}%`), ilike(pages.slug, `%${q}%`)) : undefined;
  const vis = tab === "visible" ? eq(pages.published, true) : tab === "hidden" ? eq(pages.published, false) : undefined;
  const where = and(eq(pages.storeId, storeId), search, vis);

  const [rows, [total], counts] = await Promise.all([
    db.select({ id: pages.id, title: pages.title, slug: pages.slug, published: pages.published, updatedAt: pages.updatedAt }).from(pages).where(where).orderBy(desc(pages.updatedAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(pages).where(where),
    db.select({ published: pages.published, n: count() }).from(pages).where(eq(pages.storeId, storeId)).groupBy(pages.published),
  ]);
  const visible = counts.find((c) => c.published)?.n ?? 0;
  const hidden = counts.find((c) => !c.published)?.n ?? 0;
  const all = visible + hidden;

  const addBtn = (
    <Link href="/content/pages/new" className={buttonVariants()}>
      <Plus /> Add page
    </Link>
  );

  return (
    <>
      <Header title="Pages" description="About us, Contact, policies, FAQ and any other content pages for your store." actions={all > 0 && addBtn} />
      {all === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText />}
            title="Add your first page"
            description="Build trust with an About us page, a Contact page and clear policies. Start from our ready-made templates — it takes 1 minute."
            action={addBtn}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <UrlTabs
            tabs={[
              { value: "", label: "All", count: all },
              { value: "visible", label: "Visible", count: visible },
              { value: "hidden", label: "Hidden", count: hidden },
            ]}
          />
          <div className="border-b border-border p-3">
            <SearchBox placeholder="Search pages by title or handle" className="max-w-md" />
          </div>
          {rows.length === 0 ? (
            <EmptyState icon={<FileText />} title="No pages found" description="Try a different search or filter." />
          ) : (
            <div>
              <Table>
                <THead>
                  <TR>
                    <TH>Title</TH>
                    <TH>Visibility</TH>
                    <TH className="hidden md:table-cell">Last updated</TH>
                    <TH className="w-12" />
                  </TR>
                </THead>
                <TBody>
                  {rows.map((r) => (
                    <TR key={r.id} className="group">
                      <TD>
                        <Link href={`/content/pages/${r.id}`} className="block min-w-0">
                          <span className="block font-medium group-hover:text-primary">{r.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">/pages/{r.slug}</span>
                        </Link>
                      </TD>
                      <TD>{r.published ? <Badge tone="green" dot>Visible</Badge> : <Badge dot>Hidden</Badge>}</TD>
                      <TD className="hidden text-muted-foreground md:table-cell">{formatDate(r.updatedAt)}</TD>
                      <TD>
                        {r.published && (
                          <a href={`${base}/pages/${r.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="View on store" title="View on store">
                            <ExternalLink className="size-4" />
                          </a>
                        )}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
          <Pagination page={page} pageSize={PAGE_SIZE} total={total?.n ?? 0} basePath="/content/pages" params={sp} />
        </Card>
      )}
    </>
  );
}
