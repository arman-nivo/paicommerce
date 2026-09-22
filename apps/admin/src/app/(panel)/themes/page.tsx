import Link from "next/link";
import { ClipboardCheck, Download, Palette, RefreshCw, Star, Wallet } from "lucide-react";
import { Badge, buttonVariants, Card, PageHeader, StatCard } from "@pai/ui";
import { BUSINESS_CATEGORIES } from "@pai/theme-sdk";
import { and, asc, count, db, desc, developers, eq, gt, ilike, or, sql, storeThemes, themePurchases, themes, type SQL } from "@pai/db";
import { StatusBadge, label } from "@/components/badges";
import { FilterBar, ParamTabs } from "@/components/filters";
import { DataTable, EmptyRow, Pagination, SortTH, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { bdt, fmtNum, timeAgo } from "@/lib/format";
import { escapeLike, listParams, oneOf, str, type SearchParams } from "@/lib/params";
import { hasCode } from "@/lib/registry";
import { can } from "@/lib/roles";
import { ThemeRowActions } from "./theme-client";

export const metadata = { title: "Theme Store" };
const STATUSES = ["draft", "in_review", "approved", "rejected", "unlisted"] as const;

export default async function ThemesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const admin = await requireAdminPage();
  const params = await searchParams;
  const { page, size, offset, sort, dir } = listParams(params, ["updated", "name", "installs", "revenue", "rating", "price"] as const, "installs");
  const conds: (SQL | undefined)[] = [];
  const status = oneOf(params, "status", STATUSES);
  if (status) conds.push(eq(themes.status, status));
  const cat = str(params, "category");
  if (cat) conds.push(sql`${cat} = any(${themes.categories})`);
  const pricing = str(params, "pricing");
  if (pricing === "free") conds.push(eq(themes.price, 0));
  if (pricing === "premium") conds.push(gt(themes.price, 0));
  if (str(params, "featured") === "yes") conds.push(eq(themes.featured, true));
  const q = str(params, "q");
  if (q) conds.push(or(ilike(themes.name, `%${escapeLike(q)}%`), ilike(themes.slug, `%${escapeLike(q)}%`), ilike(developers.displayName, `%${escapeLike(q)}%`)));
  const where = conds.length ? and(...(conds as SQL[])) : undefined;

  const purchases = db
    .select({ themeId: themePurchases.themeId, n: sql<number>`count(*)`.mapWith(Number).as("n"), revenue: sql<number>`sum(${themePurchases.amount})`.mapWith(Number).as("revenue") })
    .from(themePurchases)
    .groupBy(themePurchases.themeId)
    .as("p");
  const live = db
    .select({ slug: storeThemes.themeSlug, live: sql<number>`count(*) filter (where ${storeThemes.role} = 'live')`.mapWith(Number).as("live"), lib: sql<number>`count(*)`.mapWith(Number).as("lib") })
    .from(storeThemes)
    .groupBy(storeThemes.themeSlug)
    .as("l");
  const revenueExpr = sql`coalesce(${purchases.revenue}, 0)`;
  const d = dir === "asc" ? "asc" : "desc";
  const orderBy = {
    updated: dir === "asc" ? asc(themes.updatedAt) : desc(themes.updatedAt),
    name: dir === "asc" ? asc(themes.name) : desc(themes.name),
    installs: sql.raw(`coalesce("l"."lib", 0) ${d}, "themes"."installs" ${d}`),
    revenue: sql`${revenueExpr} ${sql.raw(d)}`,
    rating: dir === "asc" ? asc(themes.ratingAvg) : desc(themes.ratingAvg),
    price: dir === "asc" ? asc(themes.price) : desc(themes.price),
  }[sort];

  const [rows, [{ n }], statusCounts, [totals]] = await Promise.all([
    db
      .select({
        t: themes,
        developer: developers.displayName,
        developerId: developers.id,
        purchases: sql<number>`coalesce(${purchases.n}, 0)`.mapWith(Number),
        revenue: sql<number>`coalesce(${purchases.revenue}, 0)`.mapWith(Number),
        live: sql<number>`coalesce(${live.live}, 0)`.mapWith(Number),
        lib: sql<number>`coalesce(${live.lib}, 0)`.mapWith(Number),
      })
      .from(themes)
      .leftJoin(developers, eq(developers.id, themes.developerId))
      .leftJoin(purchases, eq(purchases.themeId, themes.id))
      .leftJoin(live, eq(live.slug, themes.slug))
      .where(where)
      .orderBy(orderBy)
      .limit(size)
      .offset(offset),
    db.select({ n: count() }).from(themes).leftJoin(developers, eq(developers.id, themes.developerId)).where(where),
    db.select({ status: themes.status, n: count() }).from(themes).groupBy(themes.status),
    db
      .select({ revenue: sql<number>`coalesce(sum(${themePurchases.amount}),0)`.mapWith(Number), platform: sql<number>`coalesce(sum(${themePurchases.platformShare}),0)`.mapWith(Number), n: count() })
      .from(themePurchases),
  ]);
  const [[installs]] = await Promise.all([db.select({ n: count() }).from(storeThemes)]);
  const sc = Object.fromEntries(statusCounts.map((r) => [r.status, r.n])) as Record<string, number>;
  const all = Object.values(sc).reduce((a, b) => a + b, 0);
  const sp = { base: "/themes", params, sort, dir };
  const canManage = can(admin.role, "themes.manage");

  return (
    <div>
      <PageHeader
        title="Theme Store"
        description="Listings, review queue and marketplace performance"
        actions={
          <>
            <Link href="/themes/registry" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <RefreshCw /> Code registry
            </Link>
            <Link href="/themes/review" className={buttonVariants({ size: "sm" })}>
              <ClipboardCheck /> Review queue{sc.in_review ? ` (${sc.in_review})` : ""}
            </Link>
          </>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Live listings" value={fmtNum(sc.approved ?? 0)} icon={<Palette />} hint={`${fmtNum(all)} total themes`} />
        <StatCard label="Awaiting review" value={fmtNum(sc.in_review ?? 0)} icon={<ClipboardCheck />} hint="in the review queue" />
        <StatCard label="Installs" value={fmtNum(installs?.n)} icon={<Download />} hint="theme copies in store libraries" />
        <StatCard label="Theme sales" value={bdt(totals?.revenue)} icon={<Wallet />} hint={`${fmtNum(totals?.n)} purchases · ${bdt(totals?.platform)} platform share`} />
      </div>
      <Card className="overflow-hidden">
        <ParamTabs param="status" tabs={[{ value: "", label: "All", count: all }, ...STATUSES.map((s) => ({ value: s, label: label(s), count: sc[s] ?? 0 }))]} />
        <FilterBar
          search="Search theme, slug or developer…"
          filters={[
            { key: "category", label: "Category", options: BUSINESS_CATEGORIES.map((c) => ({ value: c.id, label: c.label })) },
            { key: "pricing", label: "Pricing", options: [{ value: "free", label: "Free" }, { value: "premium", label: "Premium" }] },
            { key: "featured", label: "Featured", options: [{ value: "yes", label: "Featured only" }] },
          ]}
        />
        <DataTable>
          <THead>
            <SortTH label="Theme" field="name" {...sp} />
            <TH>Developer</TH>
            <TH>Status</TH>
            <SortTH label="Price" field="price" align="right" {...sp} />
            <SortTH label="Installs" field="installs" align="right" {...sp} />
            <SortTH label="Revenue" field="revenue" align="right" {...sp} />
            <SortTH label="Rating" field="rating" {...sp} />
            <TH>Code</TH>
            <SortTH label="Updated" field="updated" {...sp} />
            <TH className="w-10" />
          </THead>
          <tbody>
            {rows.length === 0 && <EmptyRow colSpan={10} title="No themes" description="Try other filters, or sync listings from the code registry." />}
            {rows.map(({ t, developer, developerId, purchases: np, revenue, live: nl, lib }) => (
              <TR key={t.id}>
                <TD>
                  <Link href={`/themes/${t.id}`} className="flex items-center gap-3">
                    {t.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.thumbnailUrl} alt="" className="h-10 w-16 rounded-md border border-border object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-10 w-16 items-center justify-center rounded-md bg-muted">
                        <Palette className="size-4 text-muted-foreground" />
                      </span>
                    )}
                    <span>
                      <span className="flex items-center gap-1.5 font-medium hover:underline">
                        {t.name}
                        {t.featured && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t.slug} · v{t.version} · {t.categories.slice(0, 2).map(label).join(", ")}
                      </span>
                    </span>
                  </Link>
                </TD>
                <TD className="text-sm">{developerId ? <Link href={`/developers/${developerId}`} className="hover:underline">{developer}</Link> : <span className="text-muted-foreground">PaiCommerce</span>}</TD>
                <TD>
                  <StatusBadge status={t.status} />
                </TD>
                <TD align="right">{t.price ? bdt(t.price) : <Badge tone="green">Free</Badge>}</TD>
                <TD align="right">
                  {fmtNum(Math.max(lib, t.installs))}
                  <span className="block text-[11px] text-muted-foreground">{fmtNum(nl)} live</span>
                </TD>
                <TD align="right">
                  {revenue ? bdt(revenue) : "—"}
                  {np > 0 && <span className="block text-[11px] text-muted-foreground">{np} sales</span>}
                </TD>
                <TD className="text-sm">
                  {t.ratingCount ? (
                    <span>
                      ★ {t.ratingAvg.toFixed(1)} <span className="text-xs text-muted-foreground">({t.ratingCount})</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TD>
                <TD>{hasCode(t.slug) ? <Badge tone="green">in registry</Badge> : <Badge tone="yellow">no code</Badge>}</TD>
                <TD className="text-xs text-muted-foreground">{timeAgo(t.updatedAt)}</TD>
                <TD>
                  <ThemeRowActions id={t.id} status={t.status} featured={t.featured} canManage={canManage} />
                </TD>
              </TR>
            ))}
          </tbody>
        </DataTable>
        <Pagination base="/themes" params={params} page={page} size={size} total={n} />
      </Card>
    </div>
  );
}
