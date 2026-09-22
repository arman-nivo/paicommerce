import Link from "next/link";
import { Download, Globe, ShieldCheck } from "lucide-react";
import { Avatar, buttonVariants, Card, PageHeader, Tooltip } from "@pai/ui";
import { StatusBadge, label } from "@/components/badges";
import { FilterBar, ParamTabs } from "@/components/filters";
import { RowCheck, SelectAll, SelectionProvider } from "@/components/selection";
import { DataTable, EmptyRow, Pagination, SortTH, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { bdt, fmtDate, fmtNum, timeAgo } from "@/lib/format";
import { hrefWith, type SearchParams } from "@/lib/params";
import { queryStores, storeFilterOptions } from "@/lib/queries/stores";
import { can } from "@/lib/roles";
import { StoreBulkActions } from "./bulk-actions";

export const metadata = { title: "Stores" };

export default async function StoresPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const admin = await requireAdminPage();
  const params = await searchParams;
  const [{ rows, total, page, size, sort, dir }, opts] = await Promise.all([queryStores(params), storeFilterOptions()]);
  const all = Object.values(opts.statusCounts).reduce((a, b) => a + b, 0);
  const sortProps = { base: "/stores", params, sort, dir };
  const now = Date.now();

  return (
    <div>
      <PageHeader
        title="Stores"
        description={`${fmtNum(all)} merchants on the platform`}
        actions={
          <a href={hrefWith("/stores/export", params, { page: undefined, size: undefined })} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Download /> Export CSV
          </a>
        }
      />
      <Card className="overflow-hidden">
        <ParamTabs
          param="status"
          tabs={[
            { value: "", label: "All", count: all },
            ...(["active", "trial", "past_due", "suspended", "closed"] as const).map((s) => ({ value: s, label: label(s), count: opts.statusCounts[s] ?? 0 })),
          ]}
        />
        <FilterBar
          search="Search name, slug, domain or owner email…"
          filters={[
            { key: "plan", label: "Plan", options: [...opts.plans.map((p) => ({ value: p.code, label: p.name })), { value: "none", label: "No plan" }] },
            { key: "category", label: "Category", options: opts.categories.map((c) => ({ value: c, label: label(c) })) },
            {
              key: "domain",
              label: "Domain",
              options: [
                { value: "yes", label: "Has custom domain" },
                { value: "unverified", label: "Unverified domain" },
                { value: "verified", label: "Verified domain" },
                { value: "no", label: "No custom domain" },
              ],
            },
          ]}
          dates={{ from: "from", to: "to", label: "Created" }}
        />
        <SelectionProvider ids={rows.map((r) => r.id)}>
          <DataTable>
            <THead>
              <TH className="w-8">
                <SelectAll />
              </TH>
              <SortTH label="Store" field="name" {...sortProps} />
              <TH>Owner</TH>
              <SortTH label="Plan" field="plan" {...sortProps} />
              <SortTH label="Status" field="status" {...sortProps} />
              <SortTH label="GMV" field="gmv" align="right" {...sortProps} />
              <SortTH label="Orders" field="orders" align="right" {...sortProps} />
              <TH>Domain</TH>
              <SortTH label="Trial ends" field="trial" {...sortProps} />
              <SortTH label="Created" field="created" {...sortProps} />
            </THead>
            <tbody>
              {rows.length === 0 && <EmptyRow colSpan={10} title="No stores match" />}
              {rows.map((s) => {
                const trialLeft = s.trialEndsAt ? Math.ceil((s.trialEndsAt.getTime() - now) / 86400_000) : null;
                return (
                  <TR key={s.id}>
                    <TD>
                      <RowCheck id={s.id} />
                    </TD>
                    <TD>
                      <Link href={`/stores/${s.id}`} className="flex items-center gap-2.5">
                        <Avatar name={s.name} src={s.logoUrl} size={28} className="rounded-lg" />
                        <span className="min-w-0">
                          <span className="block max-w-[220px] truncate font-medium hover:underline">{s.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {s.slug} · {label(s.category)}
                          </span>
                        </span>
                      </Link>
                    </TD>
                    <TD>
                      <Link href={`/users/${s.ownerId}`} className="block max-w-[200px] truncate text-sm hover:underline">
                        {s.ownerName}
                      </Link>
                      <span className="block max-w-[200px] truncate text-xs text-muted-foreground">{s.ownerEmail}</span>
                    </TD>
                    <TD>{s.planName ?? <span className="text-muted-foreground">—</span>}</TD>
                    <TD>
                      <StatusBadge status={s.status} />
                    </TD>
                    <TD align="right" className="font-medium">
                      {bdt(s.gmv)}
                    </TD>
                    <TD align="right">
                      {fmtNum(s.orderCount)}
                      {s.lastOrderAt && <span className="block text-[11px] text-muted-foreground">{timeAgo(s.lastOrderAt)}</span>}
                    </TD>
                    <TD>
                      {s.customDomain ? (
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Globe className="size-3.5 text-muted-foreground" />
                          <span className="max-w-[160px] truncate">{s.customDomain}</span>
                          {s.domainVerified ? (
                            <Tooltip label="Verified">
                              <ShieldCheck className="size-3.5 text-emerald-600" />
                            </Tooltip>
                          ) : (
                            <span className="rounded bg-amber-500/15 px-1 text-[10px] font-medium text-amber-700 dark:text-amber-300">unverified</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TD>
                    <TD className="text-xs">
                      {s.status === "trial" && trialLeft !== null ? (
                        <span className={trialLeft <= 3 ? "font-medium text-amber-600" : ""}>{trialLeft > 0 ? `${trialLeft}d left` : "Expired"}</span>
                      ) : (
                        <span className="text-muted-foreground">{s.trialEndsAt ? fmtDate(s.trialEndsAt) : "—"}</span>
                      )}
                    </TD>
                    <TD className="text-xs text-muted-foreground">{fmtDate(s.createdAt)}</TD>
                  </TR>
                );
              })}
            </tbody>
          </DataTable>
          <Pagination base="/stores" params={params} page={page} size={size} total={total} />
          <StoreBulkActions canManage={can(admin.role, "stores.manage")} />
        </SelectionProvider>
      </Card>
    </div>
  );
}
