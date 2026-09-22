import Link from "next/link";
import { ChevronRight, LifeBuoy, MessageSquare } from "lucide-react";
import { and, count, db, desc, eq, supportTickets } from "@pai/db";
import { Badge, Card, EmptyState } from "@pai/ui";
import { Header } from "@/components/page";
import { Pagination } from "@/components/pagination";
import { RelativeTime } from "@/components/time";
import { UrlTabs } from "@/components/url-controls";
import { getCtx } from "@/lib/ctx";
import { pageParam, str, type SearchParams } from "@/lib/format";
import { HelpPanel } from "./_components/help-panel";
import { NewTicketButton } from "./_components/new-ticket";
import { PRIORITY_TONE, STATUS_META, splitSubject } from "./meta";

export const metadata = { title: "Help & support" };

const PAGE_SIZE = 25;
const STATUSES = ["open", "pending", "resolved", "closed"] as const;
type Status = (typeof STATUSES)[number];

export default async function SupportPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx();
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const statusParam = str(sp.status);
  const status = (STATUSES as readonly string[]).includes(statusParam) ? (statusParam as Status) : null;

  const base = eq(supportTickets.storeId, ctx.store.id);
  const where = status ? and(base, eq(supportTickets.status, status)) : base;
  const [rows, [total], counts] = await Promise.all([
    db
      .select()
      .from(supportTickets)
      .where(where)
      .orderBy(desc(supportTickets.updatedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(supportTickets).where(where),
    db.select({ status: supportTickets.status, n: count() }).from(supportTickets).where(base).groupBy(supportTickets.status),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;
  const all = counts.reduce((a, c) => a + c.n, 0);

  return (
    <div>
      <Header title="Help & support" description="We're here to help you sell more. Browse guides or talk to our team." actions={<NewTicketButton />} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <UrlTabs
              param="status"
              tabs={[
                { value: "all", label: "All", count: all },
                { value: "open", label: "Open", count: countOf("open") },
                { value: "pending", label: "Awaiting reply", count: countOf("pending") },
                { value: "resolved", label: "Resolved", count: countOf("resolved") },
                { value: "closed", label: "Closed", count: countOf("closed") },
              ]}
            />
            {rows.length === 0 ? (
              <EmptyState
                icon={all ? <MessageSquare /> : <LifeBuoy />}
                title={all ? "No tickets here" : "No support tickets yet"}
                description={all ? "Try another tab." : "Stuck on something? Open a ticket and our Dhaka-based team usually replies within a few hours."}
                action={!all && <NewTicketButton />}
              />
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((t) => {
                  const { category, title } = splitSubject(t.subject);
                  const last = t.messages?.[t.messages.length - 1];
                  const st = STATUS_META[t.status] ?? STATUS_META.open!;
                  return (
                    <li key={t.id}>
                      <Link href={`/support/${t.id}`} className="group flex items-start gap-3 px-5 py-4 transition hover:bg-muted/40">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-medium">{title}</span>
                            <Badge tone={st.tone} dot>
                              {st.label}
                            </Badge>
                            {t.priority !== "normal" && (
                              <Badge tone={PRIORITY_TONE[t.priority] ?? "gray"}>
                                <span className="capitalize">{t.priority}</span>
                              </Badge>
                            )}
                          </div>
                          {last && (
                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground/70">{last.from === "support" ? "Support" : "You"}:</span> {last.body}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {category && <>{category} · </>}
                            {t.messages?.length ?? 0} message{t.messages?.length === 1 ? "" : "s"} · updated <RelativeTime date={t.updatedAt} />
                          </p>
                        </div>
                        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {(total?.n ?? 0) > PAGE_SIZE && (
              <div className="border-t border-border px-5 py-3">
                <Pagination page={page} pageSize={PAGE_SIZE} total={total?.n ?? 0} basePath="/support" params={sp} />
              </div>
            )}
          </Card>
        </div>
        <HelpPanel />
      </div>
    </div>
  );
}
