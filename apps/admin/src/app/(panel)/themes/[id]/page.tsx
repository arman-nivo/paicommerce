import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Eye, EyeOff, Star, StarOff, Wallet } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, StatCard } from "@pai/ui";
import { BUSINESS_CATEGORIES } from "@pai/theme-sdk";
import { count, db, desc, developers, eq, sql, storeThemes, stores, themePurchases, themeReviews, themes, themeVersions, users } from "@pai/db";
import { ActionButton } from "@/components/action-client";
import { StatusBadge } from "@/components/badges";
import { BackLink } from "@/components/link-tabs";
import { DataTable, EmptyRow, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { bdt, fmtDate, fmtDateTime, fmtNum, timeAgo } from "@/lib/format";
import { hasCode } from "@/lib/registry";
import { validateRegistryTheme } from "@/lib/registry-validate";
import { can } from "@/lib/roles";
import { setThemeFeatured, setThemeListed } from "../actions";
import { ListingEditor, ReviewForm } from "../theme-client";
import { ValidationReportView } from "../validation-report";

export const metadata = { title: "Theme" };

export default async function ThemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPage();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const theme = await db.query.themes.findFirst({ where: eq(themes.id, id) });
  if (!theme) notFound();
  const canManage = can(admin.role, "themes.manage");
  const [dev, [lib], [sales], versions, purchases, reviews, report] = await Promise.all([
    theme.developerId ? db.query.developers.findFirst({ where: eq(developers.id, theme.developerId) }) : Promise.resolve(undefined),
    db
      .select({ n: count(), live: sql<number>`count(*) filter (where ${storeThemes.role} = 'live')`.mapWith(Number) })
      .from(storeThemes)
      .where(eq(storeThemes.themeSlug, theme.slug)),
    db
      .select({
        n: count(),
        amount: sql<number>`coalesce(sum(${themePurchases.amount}),0)`.mapWith(Number),
        dev: sql<number>`coalesce(sum(${themePurchases.developerShare}),0)`.mapWith(Number),
        platform: sql<number>`coalesce(sum(${themePurchases.platformShare}),0)`.mapWith(Number),
      })
      .from(themePurchases)
      .where(eq(themePurchases.themeId, id)),
    db
      .select({ v: themeVersions, reviewer: users.name })
      .from(themeVersions)
      .leftJoin(users, eq(users.id, themeVersions.reviewerId))
      .where(eq(themeVersions.themeId, id))
      .orderBy(desc(themeVersions.submittedAt)),
    db
      .select({ p: themePurchases, storeName: stores.name })
      .from(themePurchases)
      .innerJoin(stores, eq(stores.id, themePurchases.storeId))
      .where(eq(themePurchases.themeId, id))
      .orderBy(desc(themePurchases.createdAt))
      .limit(20),
    db
      .select({ r: themeReviews, storeName: stores.name })
      .from(themeReviews)
      .innerJoin(stores, eq(stores.id, themeReviews.storeId))
      .where(eq(themeReviews.themeId, id))
      .orderBy(desc(themeReviews.createdAt))
      .limit(20),
    hasCode(theme.slug) ? validateRegistryTheme(theme.slug) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <BackLink href="/themes">Theme Store</BackLink>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {theme.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={theme.thumbnailUrl} alt="" className="h-14 w-24 rounded-lg border border-border object-cover" />
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight">{theme.name}</h1>
                <StatusBadge status={theme.status} />
                {theme.featured && (
                  <Badge tone="yellow">
                    <Star className="size-3" /> Featured
                  </Badge>
                )}
                <Badge tone="purple">v{theme.version}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {theme.slug} · by {dev ? <Link href={`/developers/${dev.id}`} className="hover:underline">{dev.displayName}</Link> : "PaiCommerce"} · {theme.price ? bdt(theme.price) : "Free"}
                {theme.approvedAt && ` · approved ${fmtDate(theme.approvedAt)}`}
              </p>
            </div>
          </div>
          {canManage && (
            <div className="flex flex-wrap gap-2">
              {theme.status === "approved" && (
                <ActionButton size="sm" variant="outline" action={setThemeFeatured.bind(null, { id, featured: !theme.featured })}>
                  {theme.featured ? <StarOff /> : <Star />} {theme.featured ? "Unfeature" : "Feature"}
                </ActionButton>
              )}
              {theme.status === "unlisted" ? (
                <ActionButton size="sm" variant="outline" action={setThemeListed.bind(null, { id, listed: true })}>
                  <Eye /> Relist
                </ActionButton>
              ) : (
                <ActionButton
                  size="sm"
                  variant="outline"
                  action={setThemeListed.bind(null, { id, listed: false })}
                  confirm={{ title: `Unlist ${theme.name}?`, description: "It disappears from the Theme Store. Stores that already installed it keep working.", confirmLabel: "Unlist", danger: true }}
                >
                  <EyeOff /> Unlist
                </ActionButton>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Installs" value={fmtNum(Math.max(lib?.n ?? 0, theme.installs))} icon={<Download />} hint={`${fmtNum(lib?.live)} stores live`} />
        <StatCard label="Purchases" value={fmtNum(sales?.n)} icon={<Wallet />} hint={`${bdt(sales?.amount)} gross`} />
        <StatCard label="Developer earnings" value={bdt(sales?.dev)} hint={`platform share ${bdt(sales?.platform)}`} />
        <StatCard label="Rating" value={theme.ratingCount ? `★ ${theme.ratingAvg.toFixed(1)}` : "—"} hint={`${fmtNum(theme.ratingCount)} reviews`} />
      </div>

      {theme.status === "in_review" && canManage && (
        <Card className="border-violet-500/40">
          <CardHeader title="Review this submission" description="Approving publishes the listing in the Theme Store." />
          <CardBody className="space-y-3">
            {report && <ValidationReportView report={report} />}
            <ReviewForm id={theme.id} hasErrors={!!report?.issues.some((i) => i.level === "error")} compact />
          </CardBody>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Listing" description="What merchants see in the Theme Store" />
          <CardBody className="pb-0">
            <ListingEditor
              canManage={canManage}
              categories={BUSINESS_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
              initial={{
                id: theme.id,
                name: theme.name,
                tagline: theme.tagline,
                description: theme.description,
                categories: theme.categories,
                tags: theme.tags,
                features: theme.features,
                price: theme.price,
                thumbnailUrl: theme.thumbnailUrl,
                screenshots: theme.screenshots,
                demoStoreSlug: theme.demoStoreSlug,
                repoUrl: theme.repoUrl,
              }}
            />
          </CardBody>
        </Card>
        <div className="space-y-5 xl:col-span-2">
          <Card>
            <CardHeader title="Code package" description="@pai/theme-registry" />
            <CardBody>{report ? <ValidationReportView report={report} /> : <p className="text-sm text-amber-600">No code package is registered for “{theme.slug}”. The listing can&apos;t be installed until the theme is committed to /themes and added to the registry.</p>}</CardBody>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title="Versions" />
            {versions.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">No version history</p>
            ) : (
              <ul className="divide-y divide-border">
                {versions.map(({ v, reviewer }) => (
                  <li key={v.id} className="px-5 py-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">v{v.version}</span>
                      <StatusBadge status={v.status} />
                      <span className="ml-auto text-xs text-muted-foreground">{fmtDateTime(v.submittedAt)}</span>
                    </div>
                    {v.changelog && <p className="mt-1 text-xs text-muted-foreground">{v.changelog}</p>}
                    {v.reviewNotes && (
                      <p className="mt-1 text-xs">
                        <span className="text-muted-foreground">Review{reviewer ? ` by ${reviewer}` : ""}:</span> {v.reviewNotes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title="Merchant reviews" />
            {reviews.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">No reviews yet</p>
            ) : (
              <ul className="divide-y divide-border">
                {reviews.map(({ r, storeName }) => (
                  <li key={r.id} className="px-5 py-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(Math.max(0, 5 - r.rating))}</span>
                      <span className="font-medium">{storeName}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                    </div>
                    {r.body && <p className="mt-1 text-muted-foreground">{r.body}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Recent purchases" />
        <DataTable maxHeight="400px">
          <THead>
            <TH>Store</TH>
            <TH align="right">Amount</TH>
            <TH align="right">Developer</TH>
            <TH align="right">Platform</TH>
            <TH>Date</TH>
          </THead>
          <tbody>
            {purchases.length === 0 && <EmptyRow colSpan={5} title="No purchases" description={theme.price ? "Nobody has bought this theme yet." : "Free themes aren't purchased."} />}
            {purchases.map(({ p, storeName }) => (
              <TR key={p.id}>
                <TD>
                  <Link href={`/stores/${p.storeId}`} className="hover:underline">
                    {storeName}
                  </Link>
                </TD>
                <TD align="right">{bdt(p.amount)}</TD>
                <TD align="right">{bdt(p.developerShare)}</TD>
                <TD align="right">{bdt(p.platformShare)}</TD>
                <TD className="text-xs text-muted-foreground">{fmtDateTime(p.createdAt)}</TD>
              </TR>
            ))}
          </tbody>
        </DataTable>
      </Card>
    </div>
  );
}
