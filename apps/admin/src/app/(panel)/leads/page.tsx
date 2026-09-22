import { Download, Inbox } from "lucide-react";
import { Badge, buttonVariants, Card, PageHeader, StatCard } from "@pai/ui";
import { count, db, gte, leads, sql } from "@pai/db";
import { FilterBar, ParamTabs } from "@/components/filters";
import { RowCheck, SelectAll, SelectionProvider } from "@/components/selection";
import { DataTable, EmptyRow, Pagination, SortTH, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { fmtDateTime, fmtNum, timeAgo } from "@/lib/format";
import { hrefWith, type SearchParams } from "@/lib/params";
import { can } from "@/lib/roles";
import { LeadBulk } from "./lead-client";
import { LEAD_SOURCES, queryLeads } from "./query";

export const metadata = { title: "Leads" };
const TONE = { contact: "blue", demo: "purple", enterprise: "brand", newsletter: "gray" } as const;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const admin = await requireAdminPage();
  const params = await searchParams;
  const [{ rows, total, page, size, sort, dir }, bySource, [week]] = await Promise.all([
    queryLeads(params),
    db.select({ source: leads.source, n: count() }).from(leads).groupBy(leads.source),
    db.select({ n: count() }).from(leads).where(gte(leads.createdAt, sql`now() - interval '7 days'`)),
  ]);
  const sc = Object.fromEntries(bySource.map((r) => [r.source, r.n])) as Record<string, number>;
  const all = Object.values(sc).reduce((a, b) => a + b, 0);
  const sp = { base: "/leads", params, sort, dir };
  return (
    <div>
      <PageHeader
        title="Leads"
        description="Contact, demo and enterprise enquiries from paicommerce.com"
        actions={
          <a href={hrefWith("/leads/export", params, { page: undefined, size: undefined })} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Download /> Export CSV
          </a>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total leads" value={fmtNum(all)} icon={<Inbox />} />
        <StatCard label="Last 7 days" value={fmtNum(week?.n)} />
        <StatCard label="Demo requests" value={fmtNum(sc.demo ?? 0)} />
        <StatCard label="Enterprise" value={fmtNum(sc.enterprise ?? 0)} />
      </div>
      <Card className="overflow-hidden">
        <ParamTabs param="source" tabs={[{ value: "", label: "All", count: all }, ...LEAD_SOURCES.map((s) => ({ value: s, label: s[0]!.toUpperCase() + s.slice(1), count: sc[s] ?? 0 }))]} />
        <FilterBar search="Search name, email, company, phone or message…" dates={{ from: "from", to: "to", label: "Received" }} />
        <SelectionProvider ids={rows.map((r) => r.id)}>
          <DataTable>
            <THead>
              <TH className="w-8">
                <SelectAll />
              </TH>
              <SortTH label="Name" field="name" {...sp} />
              <SortTH label="Company" field="company" {...sp} />
              <TH>Source</TH>
              <TH>Message</TH>
              <SortTH label="Received" field="created" {...sp} />
            </THead>
            <tbody>
              {rows.length === 0 && <EmptyRow colSpan={6} title="No leads" />}
              {rows.map((l) => (
                <TR key={l.id}>
                  <TD>
                    <RowCheck id={l.id} />
                  </TD>
                  <TD>
                    <div className="font-medium">{l.name}</div>
                    <a href={`mailto:${l.email}`} data-lead-email={l.email} data-id={l.id} className="text-xs text-primary hover:underline">
                      {l.email}
                    </a>
                    {l.phone && <span className="text-xs text-muted-foreground"> · {l.phone}</span>}
                  </TD>
                  <TD className="text-sm">{l.company ?? "—"}</TD>
                  <TD>
                    <Badge tone={TONE[l.source as keyof typeof TONE] ?? "gray"}>{l.source}</Badge>
                  </TD>
                  <TD className="max-w-[440px] whitespace-normal text-xs text-muted-foreground">
                    <p className="line-clamp-2" title={l.message ?? ""}>
                      {l.message ?? "—"}
                    </p>
                  </TD>
                  <TD className="text-xs">
                    <span title={fmtDateTime(l.createdAt)}>{timeAgo(l.createdAt)}</span>
                  </TD>
                </TR>
              ))}
            </tbody>
          </DataTable>
          <Pagination base="/leads" params={params} page={page} size={size} total={total} />
          <LeadBulk canManage={can(admin.role, "content.manage")} />
        </SelectionProvider>
      </Card>
    </div>
  );
}
