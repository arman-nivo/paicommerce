import Link from "next/link";
import { Code2 } from "lucide-react";
import { Avatar, Badge, Card, PageHeader } from "@pai/ui";
import { and, asc, count, db, desc, developers, eq, gte, ilike, lte, or, sql, storeMembers, stores, users, type SQL } from "@pai/db";
import { RoleBadge } from "@/components/badges";
import { FilterBar, ParamTabs } from "@/components/filters";
import { DataTable, EmptyRow, Pagination, SortTH, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { fmtDate, fmtNum, timeAgo } from "@/lib/format";
import { dateParam, escapeLike, listParams, oneOf, str, type SearchParams } from "@/lib/params";

export const metadata = { title: "Users" };
const ROLES = ["user", "support", "admin", "superadmin"] as const;

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const params = await searchParams;
  const { page, size, offset, sort, dir } = listParams(params, ["created", "name", "email", "login"] as const, "created");
  const conds: (SQL | undefined)[] = [];
  const q = str(params, "q");
  if (q) {
    const like = `%${escapeLike(q)}%`;
    conds.push(or(ilike(users.email, like), ilike(users.name, like), ilike(users.phone, like)));
  }
  const role = oneOf(params, "role", ROLES);
  if (role) conds.push(eq(users.role, role));
  if (str(params, "role") === "staff") conds.push(sql`${users.role} <> 'user'`);
  const status = str(params, "status");
  if (status === "disabled") conds.push(eq(users.disabled, true));
  if (status === "active") conds.push(eq(users.disabled, false));
  const type = str(params, "type");
  if (type === "merchant") conds.push(sql`exists (select 1 from ${storeMembers} where ${storeMembers.userId} = ${users.id})`);
  if (type === "developer") conds.push(sql`exists (select 1 from ${developers} where ${developers.userId} = ${users.id})`);
  if (type === "none") conds.push(sql`not exists (select 1 from ${storeMembers} where ${storeMembers.userId} = ${users.id})`);
  const from = dateParam(params, "from");
  const to = dateParam(params, "to", true);
  if (from) conds.push(gte(users.createdAt, from));
  if (to) conds.push(lte(users.createdAt, to));
  const where = conds.length ? and(...(conds.filter(Boolean) as SQL[])) : undefined;

  const d = dir === "asc" ? asc : desc;
  const orderBy = { created: d(users.createdAt), name: d(users.name), email: d(users.email), login: dir === "asc" ? sql`${users.lastLoginAt} asc nulls first` : sql`${users.lastLoginAt} desc nulls last` }[sort];

  const storeCount = sql<number>`(select count(*) from ${storeMembers} where ${storeMembers.userId} = ${users.id})`.mapWith(Number);
  const ownedStore = sql<string | null>`(select ${stores.name} from ${stores} where ${stores.ownerId} = ${users.id} order by ${stores.createdAt} limit 1)`;
  const [rows, [{ n }], roleCounts] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        role: users.role,
        disabled: users.disabled,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        emailVerifiedAt: users.emailVerifiedAt,
        storeCount,
        ownedStore,
        developerId: developers.id,
      })
      .from(users)
      .leftJoin(developers, eq(developers.userId, users.id))
      .where(where)
      .orderBy(orderBy)
      .limit(size)
      .offset(offset),
    db.select({ n: count() }).from(users).where(where),
    db.select({ role: users.role, n: count() }).from(users).groupBy(users.role),
  ]);
  const rc = Object.fromEntries(roleCounts.map((r) => [r.role, r.n])) as Record<string, number>;
  const total = Object.values(rc).reduce((a, b) => a + b, 0);
  const sp = { base: "/users", params, sort, dir };

  return (
    <div>
      <PageHeader title="Users" description={`${fmtNum(total)} platform accounts — merchants, staff, developers and the PaiCommerce team`} />
      <Card className="overflow-hidden">
        <ParamTabs
          param="role"
          tabs={[
            { value: "", label: "All", count: total },
            { value: "user", label: "Users", count: rc.user ?? 0 },
            { value: "staff", label: "PaiCommerce team", count: total - (rc.user ?? 0) },
          ]}
        />
        <FilterBar
          search="Search email, name or phone…"
          filters={[
            { key: "status", label: "Status", options: [{ value: "active", label: "Active" }, { value: "disabled", label: "Disabled" }] },
            { key: "type", label: "Type", options: [{ value: "merchant", label: "Has a store" }, { value: "developer", label: "Theme developer" }, { value: "none", label: "No store" }] },
          ]}
          dates={{ from: "from", to: "to", label: "Joined" }}
        />
        <DataTable>
          <THead>
            <SortTH label="User" field="name" {...sp} />
            <SortTH label="Email" field="email" {...sp} />
            <TH>Role</TH>
            <TH>Stores</TH>
            <TH>Status</TH>
            <SortTH label="Last login" field="login" {...sp} />
            <SortTH label="Joined" field="created" {...sp} />
          </THead>
          <tbody>
            {rows.length === 0 && <EmptyRow colSpan={7} title="No users match" />}
            {rows.map((u) => (
              <TR key={u.id}>
                <TD>
                  <Link href={`/users/${u.id}`} className="flex items-center gap-2.5">
                    <Avatar name={u.name} src={u.avatarUrl} size={28} />
                    <span className="max-w-[200px] truncate font-medium hover:underline">{u.name}</span>
                    {u.developerId && (
                      <Badge tone="purple">
                        <Code2 className="size-3" /> Dev
                      </Badge>
                    )}
                  </Link>
                </TD>
                <TD className="text-sm">
                  {u.email}
                  {!u.emailVerifiedAt && <span className="ml-1.5 text-[10px] text-muted-foreground">unverified</span>}
                </TD>
                <TD>
                  <RoleBadge role={u.role} />
                </TD>
                <TD className="text-sm">
                  {u.storeCount > 0 ? (
                    <span>
                      <span className="max-w-[160px] truncate">{u.ownedStore ?? "Staff member"}</span>
                      {u.storeCount > 1 && <span className="text-xs text-muted-foreground"> +{u.storeCount - 1}</span>}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TD>
                <TD>{u.disabled ? <Badge tone="red" dot>Disabled</Badge> : <Badge tone="green" dot>Active</Badge>}</TD>
                <TD className="text-xs">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : <span className="text-muted-foreground">Never</span>}</TD>
                <TD className="text-xs text-muted-foreground">{fmtDate(u.createdAt)}</TD>
              </TR>
            ))}
          </tbody>
        </DataTable>
        <Pagination base="/users" params={params} page={page} size={size} total={n} />
      </Card>
    </div>
  );
}
