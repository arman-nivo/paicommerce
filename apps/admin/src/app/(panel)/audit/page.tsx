import Link from "next/link";
import { Card, PageHeader } from "@pai/ui";
import { and, auditLogs, count, db, desc, asc, eq, gte, ilike, like, lte, or, sql, stores, users, type SQL } from "@pai/db";
import { RoleBadge } from "@/components/badges";
import { FilterBar } from "@/components/filters";
import { DataTable, EmptyRow, Pagination, SortTH, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { AUDIT_ACTION_PREFIXES, describeAction } from "@/lib/audit-labels";
import { fmtDateTime, fmtNum, timeAgo } from "@/lib/format";
import { dateParam, escapeLike, listParams, str, type SearchParams } from "@/lib/params";
import { MetaCell } from "./meta-cell";

export const metadata = { title: "Audit log" };

export default async function AuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const params = await searchParams;
  const { page, size, offset, dir } = listParams(params, ["created"] as const, "created");
  const conds: SQL[] = [];
  const q = str(params, "q");
  if (q) {
    const l = `%${escapeLike(q)}%`;
    conds.push(or(ilike(auditLogs.action, l), ilike(auditLogs.target, l), ilike(users.email, l), ilike(users.name, l), ilike(stores.name, l), sql`${auditLogs.meta}::text ilike ${l}`, ilike(auditLogs.ip, l))!);
  }
  const area = str(params, "area");
  if (area) conds.push(like(auditLogs.action, `${escapeLike(area)}.%`));
  const actor = str(params, "actor");
  if (actor === "staff") conds.push(sql`${users.role} <> 'user'`);
  if (actor === "merchants") conds.push(eq(users.role, "user"));
  if (actor === "system") conds.push(sql`${auditLogs.actorId} is null`);
  const store = str(params, "store");
  if (store && /^[0-9a-f-]{36}$/i.test(store)) conds.push(eq(auditLogs.storeId, store));
  const from = dateParam(params, "from");
  const to = dateParam(params, "to", true);
  if (from) conds.push(gte(auditLogs.createdAt, from));
  if (to) conds.push(lte(auditLogs.createdAt, to));
  const where = conds.length ? and(...conds) : undefined;

  const [rows, [{ n }]] = await Promise.all([
    db
      .select({ a: auditLogs, actorName: users.name, actorEmail: users.email, actorRole: users.role, storeName: stores.name })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.actorId))
      .leftJoin(stores, eq(stores.id, auditLogs.storeId))
      .where(where)
      .orderBy(dir === "asc" ? asc(auditLogs.createdAt) : desc(auditLogs.createdAt))
      .limit(size)
      .offset(offset),
    db.select({ n: count() }).from(auditLogs).leftJoin(users, eq(users.id, auditLogs.actorId)).leftJoin(stores, eq(stores.id, auditLogs.storeId)).where(where),
  ]);

  return (
    <div>
      <PageHeader title="Audit log" description={`${fmtNum(n)} events · every admin mutation is recorded with actor, target and IP`} />
      <Card className="overflow-hidden">
        <FilterBar
          search="Search action, actor, store, target, IP or details…"
          filters={[
            { key: "area", label: "Area", options: AUDIT_ACTION_PREFIXES.map((p) => ({ value: p, label: p })) },
            { key: "actor", label: "Actor", options: [{ value: "staff", label: "PaiCommerce team" }, { value: "merchants", label: "Merchants" }, { value: "system", label: "System" }] },
          ]}
          dates={{ from: "from", to: "to", label: "Date" }}
        />
        <DataTable>
          <THead>
            <SortTH label="When" field="created" base="/audit" params={params} sort="created" dir={dir} />
            <TH>Actor</TH>
            <TH>Action</TH>
            <TH>Store / target</TH>
            <TH>Details</TH>
            <TH>IP</TH>
          </THead>
          <tbody>
            {rows.length === 0 && <EmptyRow colSpan={6} title="No events" />}
            {rows.map(({ a, actorName, actorEmail, actorRole, storeName }) => (
              <TR key={a.id}>
                <TD className="text-xs">
                  <div>{fmtDateTime(a.createdAt)}</div>
                  <div className="text-muted-foreground">{timeAgo(a.createdAt)}</div>
                </TD>
                <TD>
                  {a.actorId ? (
                    <Link href={`/users/${a.actorId}`} className="hover:underline">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        {actorName} {actorRole && actorRole !== "user" && <RoleBadge role={actorRole} />}
                      </span>
                      <span className="block text-xs text-muted-foreground">{actorEmail}</span>
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">System</span>
                  )}
                </TD>
                <TD>
                  <div className="text-sm font-medium">{describeAction(a.action)}</div>
                  <code className="text-[11px] text-muted-foreground">{a.action}</code>
                </TD>
                <TD className="text-sm">
                  {a.storeId ? (
                    <Link href={`/stores/${a.storeId}?tab=activity`} className="hover:underline">
                      {storeName ?? "Deleted store"}
                    </Link>
                  ) : null}
                  {a.target && <div className="max-w-[220px] truncate text-xs text-muted-foreground">{a.target}</div>}
                </TD>
                <TD className="max-w-[360px] whitespace-normal">
                  <MetaCell meta={a.meta} />
                </TD>
                <TD className="font-mono text-[11px] text-muted-foreground">{a.ip ?? "—"}</TD>
              </TR>
            ))}
          </tbody>
        </DataTable>
        <Pagination base="/audit" params={params} page={page} size={size} total={n} />
      </Card>
    </div>
  );
}
