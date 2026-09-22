import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BadgeCheck, Check, ChevronRight, Download, Gauge, Globe, LayoutTemplate, MonitorSmartphone, Palette, Star } from "lucide-react";
import { formatCompact, formatMoney, TRIAL_DAYS } from "@pai/core";
import { manifests } from "@pai/theme-registry/manifests";
import { ThemeCard, PriceTag } from "@/components/marketing/theme-card";
import { ThemePreview } from "@/components/marketing/theme-preview";
import { JsonLd } from "@/components/site/json-ld";
import { ButtonLink, Container } from "@/components/site/ui";
import { categoryLabel, getTheme, getThemeReviews, getThemes } from "@/lib/data";
import { absoluteUrl, signupUrl } from "@/lib/site";

export const revalidate = 300;

export function generateStaticParams() {
  return manifests.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const theme = await getTheme(slug);
  if (!theme) return { title: "Theme not found" };
  return {
    title: `${theme.name} theme — ${theme.tagline}`,
    description: theme.description,
    alternates: { canonical: `/themes/${slug}` },
    openGraph: { title: `${theme.name} · PaiCommerce Theme Store`, description: theme.tagline },
  };
}

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${size} ${i < Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
      ))}
    </span>
  );
}

const INCLUDED = [
  { icon: MonitorSmartphone, t: "Mobile-first & responsive", d: "Designed for the 85% of shoppers who buy on phones." },
  { icon: LayoutTemplate, t: "Sections & blocks", d: "Add, reorder and configure every section in the customizer." },
  { icon: Palette, t: "Global styles", d: "Colours, fonts, radius and layout width from one panel." },
  { icon: Gauge, t: "Fast by default", d: "Server-rendered, optimised images, minimal JavaScript." },
  { icon: Globe, t: "Bangla-ready typography", d: "Hind Siliguri and Bangla-friendly font pairings." },
  { icon: Check, t: "Checkout built in", d: "COD, bKash, Nagad & SSLCommerz checkout included." },
];

export default async function ThemeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = await getTheme(slug);
  if (!theme) notFound();
  const [reviews, all] = await Promise.all([getThemeReviews(slug), getThemes()]);
  const related = all.filter((t) => t.slug !== slug && t.categories.some((c) => theme.categories.includes(c))).slice(0, 3);
  const startHref = signupUrl({ theme: theme.slug });
  const gallery = theme.screenshots;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${theme.name} — PaiCommerce theme`,
          description: theme.description,
          image: theme.thumbnail,
          brand: { "@type": "Brand", name: theme.developer.name },
          offers: { "@type": "Offer", price: (theme.price / 100).toFixed(2), priceCurrency: "BDT", availability: "https://schema.org/InStock", url: absoluteUrl(`/themes/${slug}`) },
          ...(theme.ratingCount ? { aggregateRating: { "@type": "AggregateRating", ratingValue: theme.rating.toFixed(1), reviewCount: theme.ratingCount } } : {}),
        }}
      />

      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-50" aria-hidden />
        <Container className="relative pb-16 pt-8 sm:pb-20">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate-500">
            <Link href="/themes" className="hover:text-slate-900">
              Theme Store
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-slate-900">{theme.name}</span>
          </nav>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1fr_1.35fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <PriceTag price={theme.price} className="text-sm" />
                {theme.featured && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-semibold text-amber-700 ring-1 ring-amber-600/15">★ Featured</span>}
                <span className="text-sm text-slate-500">v{theme.version}</span>
              </div>
              <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-6xl">{theme.name}</h1>
              <p className="mt-3 text-xl text-slate-600">{theme.tagline}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                {theme.ratingCount ? (
                  <span className="inline-flex items-center gap-2">
                    <Stars value={theme.rating} /> <b className="text-slate-900">{theme.rating.toFixed(1)}</b> ({theme.ratingCount} reviews)
                  </span>
                ) : (
                  <span className="font-medium text-brand-600">New release</span>
                )}
                {theme.installs > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Download className="size-4" /> {formatCompact(theme.installs)} stores
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  by <b className="text-slate-900">{theme.developer.name}</b>
                  {theme.developer.verified && <BadgeCheck className="size-4 text-brand-600" aria-label="Verified developer" />}
                </span>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={startHref} size="xl">
                  Start with {theme.name}
                </ButtonLink>
                <ButtonLink href={theme.demoUrl} size="xl" variant="outline" target="_blank" rel="noreferrer">
                  Try live demo <ArrowUpRight />
                </ButtonLink>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                {theme.price === 0
                  ? `Free on every plan. ${TRIAL_DAYS}-day trial of paid features included.`
                  : `One-time ${formatMoney(theme.price, "BDT")} per store · free updates · try it free in the customizer before you buy.`}
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-200/50 via-violet-200/40 to-pink-200/50 blur-2xl" aria-hidden />
              <ThemePreview slug={theme.slug} name={theme.name} tagline={theme.tagline} thumbnail={theme.thumbnail} className="shadow-2xl" eager />
              <ThemePreview
                slug={theme.slug}
                name={theme.name}
                tagline={theme.tagline}
                thumbnail={theme.thumbnail}
                variant="mobile"
                className="absolute -bottom-10 -right-2 hidden h-[360px] w-[180px] sm:block lg:-right-8"
              />
            </div>
          </div>
        </Container>
      </section>

      {gallery.length > 0 && (
        <section className="py-16">
          <Container>
            <h2 className="text-2xl font-bold">Gallery</h2>
            <div className="no-scrollbar mt-6 flex snap-x gap-5 overflow-x-auto pb-4">
              {gallery.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt={`${theme.name} screenshot ${i + 1}`} loading="lazy" className="h-72 w-auto shrink-0 snap-start rounded-2xl border border-slate-200 object-cover shadow-sm sm:h-96" />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold">About {theme.name}</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{theme.description}</p>

            {theme.features.length > 0 && (
              <>
                <h3 className="mt-12 text-lg font-bold">Theme highlights</h3>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {theme.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-medium text-slate-800">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <Check className="size-4" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="mt-12 text-lg font-bold">Included in every PaiCommerce theme</h3>
            <ul className="mt-5 grid gap-5 sm:grid-cols-2">
              {INCLUDED.map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex gap-3">
                  <Icon className="mt-0.5 size-5 shrink-0 text-slate-400" />
                  <span>
                    <span className="block font-semibold">{t}</span>
                    <span className="block text-sm text-slate-500">{d}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-14" id="reviews">
              <div className="flex items-end justify-between">
                <h3 className="text-lg font-bold">Merchant reviews</h3>
                {theme.ratingCount > 0 && (
                  <span className="text-sm text-slate-500">
                    {theme.rating.toFixed(1)} average · {theme.ratingCount} reviews
                  </span>
                )}
              </div>
              {reviews.length ? (
                <ul className="mt-5 space-y-4">
                  {reviews.map((r) => (
                    <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{r.storeName}</span>
                        <Stars value={r.rating} size="size-3.5" />
                      </div>
                      {r.body && <p className="mt-2 text-slate-600">{r.body}</p>}
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
                  <p className="font-semibold">No reviews yet</p>
                  <p className="mt-1 text-sm text-slate-500">Merchants using {theme.name} can review it from their dashboard.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Price</p>
              <p className="mt-1 font-display text-3xl font-extrabold">{theme.price === 0 ? "Free" : formatMoney(theme.price, "BDT")}</p>
              <ButtonLink href={startHref} className="mt-5 w-full" size="lg">
                Start with this theme
              </ButtonLink>
              <ButtonLink href={theme.demoUrl} className="mt-2 w-full" size="lg" variant="outline" target="_blank" rel="noreferrer">
                View demo store <ArrowUpRight />
              </ButtonLink>
              <dl className="mt-6 divide-y divide-slate-100 text-sm">
                {[
                  ["Version", theme.version],
                  ["Last updated", theme.updatedAt ? new Date(theme.updatedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "2026"],
                  ["Compatible with", "Theme SDK 1.x"],
                  ["Support", "Included"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Best for</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {theme.categories.map((c) => (
                  <Link key={c} href={`/themes?category=${c}`} className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200">
                    {categoryLabel(c)}
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Developer</p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="flex size-11 items-center justify-center rounded-xl font-bold text-white"
                  style={{ background: `hsl(${[...theme.developer.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360} 60% 45%)` }}
                >
                  {theme.developer.name[0]}
                </span>
                <div>
                  <p className="flex items-center gap-1 font-semibold">
                    {theme.developer.name} {theme.developer.verified && <BadgeCheck className="size-4 text-brand-600" />}
                  </p>
                  <p className="text-xs text-slate-500">{theme.developer.verified ? "Verified theme partner" : "Theme partner"}</p>
                </div>
              </div>
              {theme.developer.bio && <p className="mt-3 text-sm text-slate-600">{theme.developer.bio}</p>}
              {theme.developer.url && (
                <a href={theme.developer.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
                  Developer website <ArrowUpRight className="size-3.5" />
                </a>
              )}
            </div>
          </aside>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50 py-16 sm:py-24">
          <Container>
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold">Similar themes</h2>
              <Link href="/themes" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                View all →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <ThemeCard key={t.slug} theme={t} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
