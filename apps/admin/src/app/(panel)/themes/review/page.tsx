import Link from "next/link";
import { ClipboardCheck, ExternalLink, Palette } from "lucide-react";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@pai/ui";
import { STOREFRONT_ROOT_DOMAIN } from "@pai/core";
import { and, asc, db, desc, developers, eq, inArray, isNotNull, themes, themeVersions, users } from "@pai/db";
import { StatusBadge, label } from "@/components/badges";
import { BackLink } from "@/components/link-tabs";
import { requireAdminPage } from "@/lib/auth";
import { bdt, fmtDateTime, timeAgo } from "@/lib/format";
import { registryManifests } from "@/lib/registry";
import { validateRegistryTheme } from "@/lib/registry-validate";
import { can } from "@/lib/roles";
import { ReviewForm } from "../theme-client";
import { ValidationReportView } from "../validation-report";

export const metadata = { title: "Theme review queue" };

export default async function ReviewQueuePage() {
  const admin = await requireAdminPage();
  const canManage = can(admin.role, "themes.manage");
  const queue = await db
    .select({ t: themes, dev: developers })
    .from(themes)
    .leftJoin(developers, eq(developers.id, themes.developerId))
    .where(eq(themes.status, "in_review"))
    .orderBy(asc(themes.submittedAt));
  const ids = queue.map((q) => q.t.id);
  const [versions, reports, recent] = await Promise.all([
    ids.length ? db.select().from(themeVersions).where(inArray(themeVersions.themeId, ids)).orderBy(desc(themeVersions.submittedAt)) : Promise.resolve([]),
    Promise.all(queue.map((q) => validateRegistryTheme(q.t.slug))),
    db
      .select({ v: themeVersions, name: themes.name, themeId: themes.id, reviewer: users.name })
      .from(themeVersions)
      .innerJoin(themes, eq(themes.id, themeVersions.themeId))
      .leftJoin(users, eq(users.id, themeVersions.reviewerId))
      .where(and(isNotNull(themeVersions.reviewedAt), inArray(themeVersions.status, ["approved", "rejected"])))
      .orderBy(desc(themeVersions.reviewedAt))
      .limit(15),
  ]);
  const manifests = new Map(registryManifests().map((m) => [m.slug, m]));

  return (
    <div className="space-y-5">
      <div>
        <BackLink href="/themes">Theme Store</BackLink>
        <PageHeader className="mb-0" title="Review queue" description={`${queue.length} theme${queue.length === 1 ? "" : "s"} awaiting review · oldest first`} />
      </div>
      {queue.length === 0 && (
        <Card>
          <EmptyState icon={<ClipboardCheck />} title="Inbox zero" description="No themes are waiting for review. New submissions and registry syncs land here." />
        </Card>
      )}
      {queue.map(({ t, dev }, i) => {
        const report = reports[i]!;
        const m = manifests.get(t.slug);
        const vs = versions.filter((v) => v.themeId === t.id);
        const pending = vs.find((v) => v.status === "in_review");
        const diffs = m
          ? ([
              ["Version", t.version, m.version],
              ["Name", t.name, m.name],
              ["Price", bdt(t.price), bdt(m.price)],
            ] as const).filter(([, a, b]) => a !== b)
          : [];
        return (
          <Card key={t.id} id={`t-${t.id}`} className="scroll-mt-20 overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
              <div className="border-b border-border bg-muted/40 p-4 lg:border-b-0 lg:border-r">
                {t.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.thumbnailUrl} alt="" className="aspect-[16/10] w-full rounded-lg border border-border object-cover" />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center rounded-lg bg-muted">
                    <Palette className="size-6 text-muted-foreground" />
                  </div>
                )}
                {t.screenshots.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {t.screenshots.slice(0, 6).map((s, k) => (
                      <a key={k} href={s} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s} alt="" className="aspect-[4/3] w-full rounded border border-border object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                <dl className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Developer</dt>
                    <dd>{dev ? <Link href={`/developers/${dev.id}`} className="hover:underline">{dev.displayName}</Link> : "PaiCommerce"}{dev?.verified && " ✓"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Price</dt>
                    <dd>{t.price ? bdt(t.price) : "Free"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Submitted</dt>
                    <dd>{t.submittedAt ? timeAgo(t.submittedAt) : "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Previous versions</dt>
                    <dd>{vs.filter((v) => v.status === "approved").length} approved</dd>
                  </div>
                </dl>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/themes/${t.id}`} className="font-display text-lg font-bold hover:underline">
                        {t.name}
                      </Link>
                      <Badge tone="purple">v{t.version}</Badge>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{t.tagline}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {t.categories.map((c) => (
                        <Badge key={c}>{label(c)}</Badge>
                      ))}
                    </div>
                  </div>
                  {t.demoStoreSlug && (
                    <a href={`http://${t.demoStoreSlug}.${STOREFRONT_ROOT_DOMAIN}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      Demo store <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
                {pending?.changelog && (
                  <div className="rounded-lg bg-muted/60 p-3 text-sm">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Changelog · v{pending.version}</div>
                    <p className="whitespace-pre-wrap">{pending.changelog}</p>
                  </div>
                )}
                <div>
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Automated checks</div>
                  <ValidationReportView report={report} />
                  {diffs.length > 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      Listing differs from code manifest: {diffs.map(([k, a, b]) => `${k} “${a}” vs “${b}”`).join(" · ")}
                    </p>
                  )}
                </div>
                {t.reviewNotes && (
                  <p className="text-xs text-muted-foreground">
                    Previous review notes: <span className="text-foreground">{t.reviewNotes}</span>
                  </p>
                )}
                {canManage && <ReviewForm id={t.id} hasErrors={report.issues.some((x) => x.level === "error")} />}
              </div>
            </div>
          </Card>
        );
      })}
      <Card className="overflow-hidden">
        <CardHeader title="Recent decisions" />
        {recent.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No reviews yet</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map(({ v, name, themeId, reviewer }) => (
              <li key={v.id} className="flex flex-wrap items-center gap-3 px-5 py-2.5 text-sm">
                <StatusBadge status={v.status} />
                <Link href={`/themes/${themeId}`} className="font-medium hover:underline">
                  {name} v{v.version}
                </Link>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{v.reviewNotes}</span>
                <span className="text-xs text-muted-foreground">
                  {reviewer ?? "—"} · {fmtDateTime(v.reviewedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
