import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Avatar, Card, PageHeader } from "@pai/ui";
import { and, asc, count, db, desc, eq, ilike, isNull, or, sql, stores, supportTickets, users, type SQL } from "@pai/db";
import { StatusBadge, label } from "@/components/badges";
import { FilterBar, ParamTabs } from "@/components/filters";
import { RowCheck, SelectAll, SelectionProvider } from "@/components/selection";
import { DataTable, EmptyRow, Pagination, SortTH, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { escapeLike, listParams, oneOf, str, type SearchParams } from "@/lib/params";
import { TicketBulk } from "./ticket-client";

export const metadata = { title: "Support" };
const PRIORITY_RANK = sql`case ${supportTickets.priority} when 'urgent' then 0 when 'high' then 1 when 'normal' then 2 else 3 end`;

export default async function TicketsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const admin = await requireAdminPage();
  const params = await searchParams;
  const { page, size, offset, sort, dir } = listParams(params, ["updated", "created", "priority"] as const, "updated");
  const conds: SQL[] = [];
  const statusParam = str(params, "status") ?? "active";
  if (statusParam === "active") conds.push(sql`${supportTickets.status} in ('open','pending')`);
  else {
    const s = oneOf(params, "status", ["open", "pending", "resolved", "closed"] as const);
    if (s) conds.push(eq(supportTickets.status, s));
  }
  const priority = oneOf(params, "priority", ["low", "normal", "high", "urgent"] as const);
  if (priority) conds.push(eq(supportTickets.priority, priority));
  const assignee = str(params, "assignee");
  if (assignee === "me") conds.push(eq(supportTickets.assigneeId, admin.id));
  if (assignee === "none") conds.push(isNull(supportTickets.assigneeId));
  const q = str(params, "q");
  const requesterEmail = sql<string | null>`(select ${users.email} from ${users} where ${users.id} = ${supportTickets.userId})`;
  const requesterName = sql<string | null>`(select ${users.name} from ${users} where ${users.id} = ${supportTickets.userId})`;
  const assigneeName = sql<string | null>`(select ${users.name} from ${users} where ${users.id} = ${supportTickets.assigneeId})`;
  if (q) {
    const like = `%${escapeLike(q)}%`;
    conds.push(or(ilike(supportTickets.subject, like), ilike(stores.name, like), sql`${requesterEmail} ilike ${like}`, sql`${supportTickets.messages}::text ilike ${like}`)!);
  }
  const where = conds.length ? and(...conds) : undefined;
  const orderBy =
    sort === "priority"
      ? [sql`${PRIORITY_RANK} ${sql.raw(dir === "asc" ? "desc" : "asc")}`, desc(supportTickets.updatedAt)]
      : [sort === "created" ? (dir === "asc" ? asc(supportTickets.createdAt) : desc(supportTickets.createdAt)) : dir === "asc" ? asc(supportTickets.updatedAt) : desc(supportTickets.updatedAt)];

  const [rows, [{ n }], counts] = await Promise.all([
    db
      .select({ t: supportTickets, storeName: stores.name, requesterName, requesterEmail, assigneeName })
      .from(supportTickets)
      .leftJoin(stores, eq(stores.id, supportTickets.storeId))
      .where(where)
      .orderBy(...orderBy)
      .limit(size)
      .offset(offset),
    db
      .select({ n: count() })
      .from(supportTickets)
      .leftJoin(stores, eq(stores.id, supportTickets.storeId))
      .where(where),
    db.select({ status: supportTickets.status, n: count() }).from(supportTickets).groupBy(supportTickets.status),
  ]);
  const sc = Object.fromEntries(counts.map((c) => [c.status, c.n])) as Record<string, number>;
  const sp = { base: "/tickets", params, sort, dir };

  return (
    <div>
      <PageHeader title="Support inbox" description="Merchant tickets — reply, triage and resolve" />
      <Card className="overflow-hidden">
        <ParamTabs
          param="status"
          tabs={[
            { value: "", label: "Active", count: (sc.open ?? 0) + (sc.pending ?? 0) },
            { value: "open", label: "Open", count: sc.open ?? 0 },
            { value: "pending", label: "Pending", count: sc.pending ?? 0 },
            { value: "resolved", label: "Resolved", count: sc.resolved ?? 0 },
            { value: "closed", label: "Closed", count: sc.closed ?? 0 },
            { value: "all", label: "All" },
          ]}
        />
        <FilterBar
          search="Search subject, store, requester or message…"
          filters={[
            { key: "priority", label: "Priority", options: ["urgent", "high", "normal", "low"].map((p) => ({ value: p, label: label(p) })) },
            { key: "assignee", label: "Assignee", options: [{ value: "me", label: "Me" }, { value: "none", label: "Unassigned" }] },
          ]}
        />
        <SelectionProvider ids={rows.map((r) => r.t.id)}>
          <DataTable>
            <THead>
              <TH className="w-8">
                <SelectAll />
              </TH>
              <TH>Subject</TH>
              <TH>Requester</TH>
              <SortTH label="Priority" field="priority" {...sp} />
              <TH>Status</TH>
              <TH>Assignee</TH>
              <SortTH label="Updated" field="updated" {...sp} />
              <SortTH label="Created" field="created" {...sp} />
            </THead>
            <tbody>
              {rows.length === 0 && <EmptyRow colSpan={8} title="No tickets here" description="Nice — nothing needs attention." />}
              {rows.map(({ t, storeName, requesterName, requesterEmail, assigneeName }) => {
                const last = t.messages?.[t.messages.length - 1];
                const awaiting = last?.from === "merchant" && (t.status === "open" || t.status === "pending");
                return (
                  <TR key={t.id} className={awaiting ? "bg-accent/30" : undefined}>
                    <TD>
                      <RowCheck id={t.id} />
                    </TD>
                    <TD>
                      <Link href={`/tickets/${t.id}`} className="block max-w-[420px]">
                        <span className="flex items-center gap-2 font-medium hover:underline">
                          {awaiting && <span className="size-2 shrink-0 rounded-full bg-primary" title="Awaiting our reply" />}
                          <span className="truncate">{t.subject}</span>
                        </span>
                        <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <MessageSquare className="size-3" /> {t.messages?.length ?? 0} · {last ? `${last.authorName}: ${last.body.slice(0, 80)}` : "No messages"}
                        </span>
                      </Link>
                    </TD>
                    <TD>
                      <span className="block max-w-[180px] truncate text-sm">{storeName ?? requesterName ?? "—"}</span>
                      <span className="block max-w-[180px] truncate text-xs text-muted-foreground">{requesterEmail}</span>
                    </TD>
                    <TD>
                      <StatusBadge status={t.priority} />
                    </TD>
                    <TD>
                      <StatusBadge status={t.status} />
                    </TD>
                    <TD className="text-sm">
                      {assigneeName ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Avatar name={assigneeName} size={20} /> {assigneeName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TD>
                    <TD className="text-xs">{timeAgo(t.updatedAt)}</TD>
                    <TD className="text-xs text-muted-foreground">{timeAgo(t.createdAt)}</TD>
                  </TR>
                );
              })}
            </tbody>
          </DataTable>
          <Pagination base="/tickets" params={params} page={page} size={size} total={n} />
          <TicketBulk meId={admin.id} />
        </SelectionProvider>
      </Card>
    </div>
  );
}
