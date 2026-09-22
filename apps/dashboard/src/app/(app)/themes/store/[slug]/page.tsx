import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Check, Download, MessageSquare, Tag } from "lucide-react";
import { and, db, desc, eq, stores, themeReviews } from "@pai/db";
import { Avatar, Badge, Card, CardBody, CardHeader } from "@pai/ui";
import { Header } from "@/components/page";
import { getCtx, getStorePlan } from "@/lib/ctx";
import { formatDate, formatNumber } from "@/lib/format";
import { CATEGORY_LABELS, demoUrl, getStoreThemeState, getThemeBySlug } from "../../_lib/catalog";
import { Gallery } from "../../_components/gallery";
import { InstallPanel } from "../../_components/install-panel";
import { ReviewForm } from "../../_components/review-form";
import { Stars } from "../../_components/store-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${slug.charAt(0).toUpperCase()}${slug.slice(1)} · Theme Store` };
}

export default async function ThemeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const ctx = await getCtx("themes.manage");
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) notFound();

  const theme = await getThemeBySlug(slug);
  if (!theme) notFound();
  const [state, plan, reviews] = await Promise.all([
    getStoreThemeState(ctx.store.id),
    getStorePlan(ctx.store),
    db
      .select({ id: themeReviews.id, storeId: themeReviews.storeId, rating: themeReviews.rating, body: themeReviews.body, createdAt: themeReviews.createdAt, storeName: stores.name })
      .from(themeReviews)
      .innerJoin(stores, eq(stores.id, themeReviews.storeId))
      .where(eq(themeReviews.themeId, theme.id))
      .orderBy(desc(themeReviews.createdAt))
      .limit(30),
  ]);

  const installedCount = state.installed.get(theme.slug) ?? 0;
  const purchased = state.purchased.has(theme.id);
  // Unlisted/draft themes are only visible to stores that already own them.
  if (theme.status !== "approved" && !installedCount && !purchased) notFound();

  const myReview = reviews.find((r) => r.storeId === ctx.store.id) ??
    (await db.query.themeReviews.findFirst({ where: and(eq(themeReviews.themeId, theme.id), eq(themeReviews.storeId, ctx.store.id)) })) ??
    null;
  const canReview = installedCount > 0 || purchased;
  const images = [theme.thumbnailUrl, ...theme.screenshots].filter((x): x is string => !!x);
  const recommended = theme.categories.includes(ctx.store.category);

  // Rating distribution for the summary.
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => r.rating === s).length }));

  return (
    <div className="space-y-6">
      <Header
        back={{ href: "/themes/store", label: "Theme Store" }}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {theme.name}
            {state.liveSlug === theme.slug ? (
              <Badge tone="green" dot>
                Live
              </Badge>
            ) : installedCount ? (
              <Badge tone="blue">Installed</Badge>
            ) : null}
            {purchased && <Badge tone="purple">Purchased</Badge>}
            {theme.featured && <Badge tone="brand">Featured</Badge>}
          </span>
        }
        description={theme.tagline}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Gallery images={images} name={theme.name} />

          <Card>
            <CardHeader title="About this theme" />
            <CardBody className="space-y-5">
              {theme.description && <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{theme.description}</p>}
              {theme.features.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Features</h4>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {theme.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {theme.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag className="size-3.5 text-muted-foreground" />
                  {theme.tags.map((t) => (
                    <Link key={t} href={`/themes/store?q=${encodeURIComponent(t)}`} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground">
                      {t}
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Reviews"
              description={theme.ratingCount ? `${theme.ratingAvg.toFixed(1)} out of 5 · ${formatNumber(theme.ratingCount)} ${theme.ratingCount === 1 ? "review" : "reviews"}` : "No reviews yet"}
            />
            <CardBody className="space-y-5">
              {reviews.length > 0 && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="text-center sm:w-32">
                    <p className="text-4xl font-semibold">{theme.ratingAvg.toFixed(1)}</p>
                    <Stars value={theme.ratingAvg} className="size-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    {dist.map(({ s, n }) => (
                      <div key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-3">{s}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${reviews.length ? (n / reviews.length) * 100 : 0}%` }} />
                        </div>
                        <span className="w-6 text-right tabular-nums">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canReview ? (
                <ReviewForm themeId={theme.id} initial={myReview ? { rating: myReview.rating, body: myReview.body } : null} />
              ) : (
                <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">Add this theme to your library to leave a review.</p>
              )}

              {reviews.length ? (
                <ul className="divide-y divide-border">
                  {reviews.map((r) => (
                    <li key={r.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                      <Avatar name={r.storeName} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-medium">{r.storeName}</span>
                          {r.storeId === ctx.store.id && <Badge>You</Badge>}
                          <Stars value={r.rating} />
                          <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                        </div>
                        {r.body && <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{r.body}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center py-6 text-center text-sm text-muted-foreground">
                  <MessageSquare className="mb-2 size-6" />
                  Be the first to review {theme.name}.
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <InstallPanel
            theme={{ id: theme.id, name: theme.name, price: theme.price }}
            installedCount={installedCount}
            firstInstallId={state.firstInstallId(theme.slug)}
            isLive={state.liveSlug === theme.slug}
            purchased={purchased}
            canBuyPremium={plan.limits.premiumThemes}
            planName={plan.name}
            demoUrl={demoUrl(theme.demoStoreSlug)}
          />

          <Card>
            <CardBody className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Avatar name={theme.author} size={36} />
                <div className="min-w-0">
                  <p className="flex items-center gap-1 font-medium">
                    {theme.author}
                    {theme.authorVerified && <BadgeCheck className="size-4 text-primary" aria-label="Verified developer" />}
                  </p>
                  {theme.authorUrl ? (
                    <a href={theme.authorUrl} target="_blank" rel="noreferrer" className="truncate text-xs text-muted-foreground hover:text-foreground hover:underline">
                      {theme.authorUrl.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <p className="text-xs text-muted-foreground">Theme developer</p>
                  )}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Rating</dt>
                  <dd className="mt-0.5 flex items-center gap-1 font-medium">
                    {theme.ratingCount ? (
                      <>
                        <Stars value={theme.ratingAvg} className="size-3" /> {theme.ratingAvg.toFixed(1)}
                      </>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Installs</dt>
                  <dd className="mt-0.5 flex items-center gap-1 font-medium">
                    <Download className="size-3.5 text-muted-foreground" /> {formatNumber(theme.installs)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Version</dt>
                  <dd className="mt-0.5 font-medium">{theme.version}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Released</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(theme.releasedAt)}</dd>
                </div>
              </dl>
              {theme.categories.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-xs text-muted-foreground">Best for</p>
                  <div className="flex flex-wrap gap-1.5">
                    {theme.categories.map((c) => (
                      <Link key={c} href={`/themes/store?category=${c}`}>
                        <Badge tone={c === ctx.store.category ? "brand" : "gray"}>{CATEGORY_LABELS[c] ?? c}</Badge>
                      </Link>
                    ))}
                  </div>
                  {recommended && <p className="mt-2 text-xs text-primary">Recommended for your store</p>}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
