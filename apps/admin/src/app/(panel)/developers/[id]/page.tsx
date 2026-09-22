import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ExternalLink } from "lucide-react";
import { Avatar, Badge, Card, CardBody, CardHeader, StatCard } from "@pai/ui";
import { count, db, desc, developerPayouts, developers, eq, sql, stores, themePurchases, themes, users } from "@pai/db";
import { ActionButton } from "@/components/action-client";
import { StatusBadge } from "@/components/badges";
import { BackLink, DL } from "@/components/link-tabs";
import { DataTable, EmptyRow, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { bdt, fmtDate, fmtDateTime, fmtNum } from "@/lib/format";
import { can } from "@/lib/roles";
import { setDeveloperVerified } from "../actions";
import { CreatePayoutButton, DeveloperSettingsForm, PayoutActions } from "../developer-client";

export const metadata = { title: "Developer" };

export default async function DeveloperPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPage();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const dev = await db.query.developers.findFirst({ where: eq(developers.id, id) });
  if (!dev) notFound();
  const canManage = can(admin.role, "developers.manage");
  const [user, themeRows, sales, [salesTotals], payouts] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, dev.userId) }),
    db
      .select({
        t: themes,
        purchases: sql<number>`(select count(*) from ${themePurchases} where ${themePurchases.themeId} = ${themes.id})`.mapWith(Number),
        revenue: sql<number>`(select coalesce(sum(${themePurchases.developerShare}),0) from ${themePurchases} where ${themePurchases.themeId} = ${themes.id})`.mapWith(Number),
      })
      .from(themes)
      .where(eq(themes.developerId, id))
      .orderBy(desc(themes.updatedAt)),
    db
      .select({ p: themePurchases, theme: themes.name, store: stores.name })
      .from(themePurchases)
      .innerJoin(themes, eq(themes.id, themePurchases.themeId))
      .innerJoin(stores, eq(stores.id, themePurchases.storeId))
      .where(eq(themes.developerId, id))
      .orderBy(desc(themePurchases.createdAt))
      .limit(25),
    db
      .select({
        n: count(),
        gross: sql<number>`coalesce(sum(${themePurchases.amount}),0)`.mapWith(Number),
        dev: sql<number>`coalesce(sum(${themePurchases.developerShare}),0)`.mapWith(Number),
        d30: sql<number>`coalesce(sum(${themePurchases.developerShare}) filter (where ${themePurchases.createdAt} > now() - interval '30 days'),0)`.mapWith(Number),
      })
      .from(themePurchases)
      .innerJoin(themes, eq(themes.id, themePurchases.themeId))
      .where(eq(themes.developerId, id)),
    db.select().from(developerPayouts).where(eq(developerPayouts.developerId, id)).orderBy(desc(developerPayouts.createdAt)),
  ]);
  const paidOut = payouts.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0);
  const inFlight = payouts.filter((p) => p.status === "pending" || p.status === "processing").reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <BackLink href="/developers">Developers</BackLink>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={dev.displayName} src={dev.avatarUrl} size={48} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight">{dev.displayName}</h1>
                {dev.verified ? (
                  <Badge tone="brand">
                    <BadgeCheck className="size-3" /> Verified
                  </Badge>
                ) : (
                  <Badge>Unverified</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {dev.slug} · {user ? <Link href={`/users/${user.id}`} className="hover:underline">{user.email}</Link> : "—"} · partner since {fmtDate(dev.createdAt)}
              </p>
            </div>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <ActionButton size="sm" variant="outline" action={setDeveloperVerified.bind(null, { id, verified: !dev.verified })}>
                <BadgeCheck /> {dev.verified ? "Remove verification" : "Verify developer"}
              </ActionButton>
              <CreatePayoutButton developerId={id} balance={dev.balance} defaultMethod={dev.payoutMethod ?? "bank"} />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available balance" value={bdt(dev.balance)} hint={inFlight ? `${bdt(inFlight)} in flight` : "ready for payout"} />
        <StatCard label="Lifetime earnings" value={bdt(dev.lifetimeEarnings)} hint={`${bdt(paidOut)} paid out`} />
        <StatCard label="Gross theme sales" value={bdt(salesTotals?.gross)} hint={`${fmtNum(salesTotals?.n)} purchases`} />
        <StatCard label="Earnings · 30 days" value={bdt(salesTotals?.d30)} hint={`${dev.revenueSharePct}% revenue share`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Partner settings" />
          <CardBody>
            {canManage ? (
              <DeveloperSettingsForm dev={dev} />
            ) : (
              <DL items={[["Revenue share", `${dev.revenueSharePct}%`], ["Payout method", dev.payoutMethod ?? "—"], ["Payout email", dev.payoutEmail ?? "—"]]} />
            )}
            <div className="mt-4 border-t border-border pt-3">
              <DL
                items={[
                  ["Website", dev.website ? <a key="w" href={dev.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{dev.website.replace(/^https?:\/\//, "")} <ExternalLink className="size-3" /></a> : "—"],
                  ["Bio", <span key="b" className="font-normal text-muted-foreground">{dev.bio ?? "—"}</span>],
                ]}
              />
            </div>
          </CardBody>
        </Card>
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader title="Themes" />
          <DataTable maxHeight="none">
            <THead>
              <TH>Theme</TH>
              <TH>Status</TH>
              <TH align="right">Price</TH>
              <TH align="right">Installs</TH>
              <TH align="right">Sales</TH>
              <TH align="right">Dev earnings</TH>
            </THead>
            <tbody>
              {themeRows.length === 0 && <EmptyRow colSpan={6} title="No themes" description="This developer hasn't submitted a theme yet." />}
              {themeRows.map(({ t, purchases, revenue }) => (
                <TR key={t.id}>
                  <TD>
                    <Link href={`/themes/${t.id}`} className="font-medium hover:underline">
                      {t.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">v{t.version}</span>
                  </TD>
                  <TD>
                    <StatusBadge status={t.status} />
                  </TD>
                  <TD align="right">{t.price ? bdt(t.price) : "Free"}</TD>
                  <TD align="right">{fmtNum(t.installs)}</TD>
                  <TD align="right">{fmtNum(purchases)}</TD>
                  <TD align="right">{bdt(revenue)}</TD>
                </TR>
              ))}
            </tbody>
          </DataTable>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader title="Payout history" />
          <DataTable maxHeight="420px">
            <THead>
              <TH align="right">Amount</TH>
              <TH>Status</TH>
              <TH>Method</TH>
              <TH>Reference</TH>
              <TH>Created</TH>
              {canManage && <TH className="w-10" />}
            </THead>
            <tbody>
              {payouts.length === 0 && <EmptyRow colSpan={6} title="No payouts yet" description="Create one from the available balance." />}
              {payouts.map((p) => (
                <TR key={p.id}>
                  <TD align="right" className="font-medium">
                    {bdt(p.amount)}
                  </TD>
                  <TD>
                    <StatusBadge status={p.status} />
                    {p.paidAt && <div className="text-[11px] text-muted-foreground">{fmtDate(p.paidAt)}</div>}
                  </TD>
                  <TD className="text-sm">{p.method ?? "—"}</TD>
                  <TD className="font-mono text-xs">{p.reference ?? "—"}</TD>
                  <TD className="text-xs text-muted-foreground">{fmtDateTime(p.createdAt)}</TD>
                  {canManage && (
                    <TD>
                      <PayoutActions id={p.id} status={p.status} />
                    </TD>
                  )}
                </TR>
              ))}
            </tbody>
          </DataTable>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader title="Recent sales" />
          <DataTable maxHeight="420px">
            <THead>
              <TH>Theme</TH>
              <TH>Store</TH>
              <TH align="right">Price</TH>
              <TH align="right">Dev share</TH>
              <TH>Date</TH>
            </THead>
            <tbody>
              {sales.length === 0 && <EmptyRow colSpan={5} title="No sales yet" />}
              {sales.map(({ p, theme, store }) => (
                <TR key={p.id}>
                  <TD className="font-medium">{theme}</TD>
                  <TD>
                    <Link href={`/stores/${p.storeId}`} className="hover:underline">
                      {store}
                    </Link>
                  </TD>
                  <TD align="right">{bdt(p.amount)}</TD>
                  <TD align="right">{bdt(p.developerShare)}</TD>
                  <TD className="text-xs text-muted-foreground">{fmtDate(p.createdAt)}</TD>
                </TR>
              ))}
            </tbody>
          </DataTable>
        </Card>
      </div>
    </div>
  );
}
