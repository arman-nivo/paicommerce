import Link from "next/link";
import { BadgeCheck, Code2, Send, Wallet } from "lucide-react";
import { Avatar, Card, PageHeader, StatCard } from "@pai/ui";
import { and, asc, count, db, desc, developerPayouts, developers, eq, ilike, or, sql, themePurchases, themes, users, type SQL } from "@pai/db";
import { StatusBadge, label } from "@/components/badges";
import { FilterBar } from "@/components/filters";
import { LinkTabs } from "@/components/link-tabs";
import { DataTable, EmptyRow, Pagination, SortTH, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { bdt, fmtDate, fmtDateTime, fmtNum } from "@/lib/format";
import { escapeLike, listParams, oneOf, str, type SearchParams } from "@/lib/params";
import { can } from "@/lib/roles";
import { PayoutActions } from "./developer-client";

export const metadata = { title: "Developers" };

export default async function DevelopersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const admin = await requireAdminPage();
  const params = await searchParams;
  const tab = oneOf(params, "tab", ["developers", "payouts"] as const) ?? "developers";
  const [[totals], [pending]] = await Promise.all([
    db
      .select({ n: count(), balance: sql<number>`coalesce(sum(${developers.balance}),0)`.mapWith(Number), lifetime: sql<number>`coalesce(sum(${developers.lifetimeEarnings}),0)`.mapWith(Number), verified: sql<number>`count(*) filter (where ${developers.verified})`.mapWith(Number) })
      .from(developers),
    db
      .select({ n: count(), amount: sql<number>`coalesce(sum(${developerPayouts.amount}),0)`.mapWith(Number) })
      .from(developerPayouts)
      .where(sql`${developerPayouts.status} in ('pending','processing')`),
  ]);
  return (
    <div>
      <PageHeader title="Developers" description="Theme partners, their earnings and payouts" />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Theme partners" value={fmtNum(totals?.n)} icon={<Code2 />} hint={`${fmtNum(totals?.verified)} verified`} />
        <StatCard label="Unpaid balances" value={bdt(totals?.balance)} icon={<Wallet />} hint="owed to developers" />
        <StatCard label="Payouts in flight" value={bdt(pending?.amount)} icon={<Send />} hint={`${fmtNum(pending?.n)} pending / processing`} />
        <StatCard label="Lifetime earnings" value={bdt(totals?.lifetime)} icon={<BadgeCheck />} hint="paid + unpaid developer share" />
      </div>
      <Card className="overflow-hidden">
        <LinkTabs
          base="/developers"
          params={params}
          current={tab}
          tabs={[
            { value: "developers", label: "Developers" },
            { value: "payouts", label: "Payouts", count: pending?.n },
          ]}
        />
        {tab === "developers" ? <DevelopersTab params={params} /> : <PayoutsTab params={params} canManage={can(admin.role, "developers.manage")} />}
      </Card>
    </div>
  );
}

async function DevelopersTab({ params }: { params: SearchParams }) {
  const { page, size, offset, sort, dir } = listParams(params, ["created", "name", "balance", "earnings", "themes"] as const, "earnings");
  const conds: SQL[] = [];
  const q = str(params, "q");
  if (q) conds.push(or(ilike(developers.displayName, `%${escapeLike(q)}%`), ilike(developers.slug, `%${escapeLike(q)}%`), ilike(users.email, `%${escapeLike(q)}%`))!);
  const v = str(params, "verified");
  if (v === "yes") conds.push(eq(developers.verified, true));
  if (v === "no") conds.push(eq(developers.verified, false));
  const where = conds.length ? and(...conds) : undefined;
  const themeCount = sql<number>`(select count(*) from ${themes} where ${themes.developerId} = ${developers.id})`.mapWith(Number);
  const liveCount = sql<number>`(select count(*) from ${themes} where ${themes.developerId} = ${developers.id} and ${themes.status} = 'approved')`.mapWith(Number);
  const sales = sql<number>`(select coalesce(sum(${themePurchases.amount}),0) from ${themePurchases} inner join ${themes} on ${themes.id} = ${themePurchases.themeId} where ${themes.developerId} = ${developers.id})`.mapWith(Number);
  const d = dir === "asc" ? asc : desc;
  const orderBy = { created: d(developers.createdAt), name: d(developers.displayName), balance: d(developers.balance), earnings: d(developers.lifetimeEarnings), themes: sql`${themeCount} ${sql.raw(dir)}` }[sort];
  const [rows, [{ n }]] = await Promise.all([
    db
      .select({ d: developers, email: users.email, themeCount, liveCount, sales })
      .from(developers)
      .innerJoin(users, eq(users.id, developers.userId))
      .where(where)
      .orderBy(orderBy)
      .limit(size)
      .offset(offset),
    db.select({ n: count() }).from(developers).innerJoin(users, eq(users.id, developers.userId)).where(where),
  ]);
  const sp = { base: "/developers", params, sort, dir };
  return (
    <>
      <FilterBar search="Search name, slug or email…" filters={[{ key: "verified", label: "Verified", options: [{ value: "yes", label: "Verified" }, { value: "no", label: "Not verified" }] }]} />
      <DataTable>
        <THead>
          <SortTH label="Developer" field="name" {...sp} />
          <TH>Account</TH>
          <SortTH label="Themes" field="themes" align="right" {...sp} />
          <TH align="right">Gross sales</TH>
          <SortTH label="Lifetime earnings" field="earnings" align="right" {...sp} />
          <SortTH label="Balance" field="balance" align="right" {...sp} />
          <TH align="right">Share</TH>
          <SortTH label="Joined" field="created" {...sp} />
        </THead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={8} title="No developers" />}
          {rows.map(({ d: dev, email, themeCount: tc, liveCount: lc, sales: s }) => (
            <TR key={dev.id}>
              <TD>
                <Link href={`/developers/${dev.id}`} className="flex items-center gap-2.5">
                  <Avatar name={dev.displayName} src={dev.avatarUrl} size={28} />
                  <span>
                    <span className="flex items-center gap-1 font-medium hover:underline">
                      {dev.displayName}
                      {dev.verified && <BadgeCheck className="size-4 text-primary" />}
                    </span>
                    <span className="block text-xs text-muted-foreground">{dev.slug}</span>
                  </span>
                </Link>
              </TD>
              <TD className="text-sm">
                <Link href={`/users/${dev.userId}`} className="hover:underline">
                  {email}
                </Link>
              </TD>
              <TD align="right">
                {tc}
                <span className="block text-[11px] text-muted-foreground">{lc} live</span>
              </TD>
              <TD align="right">{bdt(s)}</TD>
              <TD align="right">{bdt(dev.lifetimeEarnings)}</TD>
              <TD align="right" className="font-medium">
                {bdt(dev.balance)}
              </TD>
              <TD align="right">{dev.revenueSharePct}%</TD>
              <TD className="text-xs text-muted-foreground">{fmtDate(dev.createdAt)}</TD>
            </TR>
          ))}
        </tbody>
      </DataTable>
      <Pagination base="/developers" params={params} page={page} size={size} total={n} />
    </>
  );
}

async function PayoutsTab({ params, canManage }: { params: SearchParams; canManage: boolean }) {
  const { page, size, offset } = listParams(params, ["created"] as const, "created");
  const status = oneOf(params, "status", ["pending", "processing", "paid", "failed"] as const);
  const where = status ? eq(developerPayouts.status, status) : undefined;
  const [rows, [{ n }]] = await Promise.all([
    db
      .select({ p: developerPayouts, name: developers.displayName, devId: developers.id })
      .from(developerPayouts)
      .innerJoin(developers, eq(developers.id, developerPayouts.developerId))
      .where(where)
      .orderBy(desc(developerPayouts.createdAt))
      .limit(size)
      .offset(offset),
    db.select({ n: count() }).from(developerPayouts).where(where),
  ]);
  return (
    <>
      <FilterBar filters={[{ key: "status", label: "Status", options: ["pending", "processing", "paid", "failed"].map((s) => ({ value: s, label: label(s) })) }]} />
      <DataTable>
        <THead>
          <TH>Developer</TH>
          <TH align="right">Amount</TH>
          <TH>Status</TH>
          <TH>Method</TH>
          <TH>Reference</TH>
          <TH>Created</TH>
          <TH>Paid</TH>
          {canManage && <TH className="w-10" />}
        </THead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={8} title="No payouts" description="Create payouts from a developer's page." />}
          {rows.map(({ p, name, devId }) => (
            <TR key={p.id}>
              <TD>
                <Link href={`/developers/${devId}`} className="font-medium hover:underline">
                  {name}
                </Link>
              </TD>
              <TD align="right" className="font-medium">
                {bdt(p.amount)}
              </TD>
              <TD>
                <StatusBadge status={p.status} />
              </TD>
              <TD className="text-sm">{p.method ?? "—"}</TD>
              <TD className="font-mono text-xs">{p.reference ?? "—"}</TD>
              <TD className="text-xs text-muted-foreground">{fmtDateTime(p.createdAt)}</TD>
              <TD className="text-xs">{fmtDate(p.paidAt)}</TD>
              {canManage && (
                <TD>
                  <PayoutActions id={p.id} status={p.status} />
                </TD>
              )}
            </TR>
          ))}
        </tbody>
      </DataTable>
      <Pagination base="/developers" params={params} page={page} size={size} total={n} />
    </>
  );
}
