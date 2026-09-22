import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, Languages, PhoneCall, Play, Quote, Sparkles, Star, Terminal, Wallet } from "lucide-react";
import { TRIAL_DAYS } from "@pai/core";
import { cn } from "@pai/ui";
import { Carousel } from "@/components/marketing/carousel";
import { ComparisonTable } from "@/components/marketing/comparison";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { Faq } from "@/components/marketing/faq";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { ThemeCard } from "@/components/marketing/theme-card";
import { COURIER_MARKS, PAYMENT_MARKS, Wordmark } from "@/components/marketing/wordmarks";
import { HeroMockup } from "@/components/mockups/hero-mockup";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { ButtonLink, Container, Eyebrow, SectionHeading } from "@/components/site/ui";
import { HEADLINE_STATS, HOME_FAQ, MERCHANT_BRANDS, STEPS, TESTIMONIALS } from "@/lib/content";
import { getPlans, getThemes } from "@/lib/data";
import { FEATURES } from "@/lib/features";
import { toPricingPlans } from "@/lib/pricing";
import { SITE, absoluteUrl, signupUrl } from "@/lib/site";

export const revalidate = 300;

export default async function HomePage() {
  const [plans, themes] = await Promise.all([getPlans(), getThemes()]);
  const showcase = [...themes].sort((a, b) => Number(b.featured) - Number(a.featured) || b.installs - a.installs);
  const heroThumb = themes.find((t) => t.slug === "aurora")?.thumbnail ?? themes[0]?.thumbnail ?? "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE.name,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: SITE.url,
          description: SITE.description,
          offers: plans.map((p) => ({
            "@type": "Offer",
            name: p.name,
            price: (p.priceMonthly / 100).toFixed(2),
            priceCurrency: p.currency,
            url: absoluteUrl("/pricing"),
            category: "subscription",
          })),
        }}
      />

      {/* ───────────── Hero ───────────── */}
      <section className="relative -mt-16 overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60" aria-hidden />
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,99,246,0.22),transparent)]" aria-hidden />
        <div className="pointer-events-none absolute right-[-10%] top-40 h-96 w-96 rounded-full bg-pink-400/20 blur-3xl" aria-hidden />
        <Container className="relative pb-24 pt-14 sm:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <Link
              href="/features#ai"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 py-1 pl-1 pr-3 text-xs font-medium text-slate-600 shadow-sm backdrop-blur transition hover:border-brand-300"
            >
              <span className="rounded-full bg-gradient-to-r from-brand-600 to-violet-600 px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
              AI product writer now speaks Bangla
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <h1 className="mt-7 text-[2.6rem] font-extrabold leading-[1.04] tracking-tight text-balance text-slate-950 sm:text-6xl lg:text-7xl">
              Sell online in Bangladesh, <span className="text-gradient">beautifully.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-slate-600 sm:text-xl">
              The all-in-one commerce platform with bKash, Nagad & COD checkout, one-click Steadfast & Pathao booking, courier fraud checks and
              stunning themes — so you can launch today and scale to thousands of orders a day.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href={signupUrl()} size="xl" className="group w-full sm:w-auto">
                Start {TRIAL_DAYS}-day free trial <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href="/themes" size="xl" variant="outline" className="w-full sm:w-auto">
                <Play className="fill-current" /> Explore live demo stores
              </ButtonLink>
            </div>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              {["No credit card required", "Free plan forever", "Pay in BDT"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-500" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-16 sm:mt-20">
            <HeroMockup storefrontThumb={heroThumb} />
          </div>
        </Container>
      </section>

      {/* ───────────── Trust strip ───────────── */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-10" aria-label="Brands selling on PaiCommerce">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Trusted by 8,500+ fast-growing Bangladeshi brands</p>
        <div className="mask-fade-x mt-7 overflow-hidden">
          <div className="flex w-max animate-marquee gap-14 pr-14 hover:[animation-play-state:paused]">
            {[...MERCHANT_BRANDS, ...MERCHANT_BRANDS].map((b, i) => (
              <span key={i} className={cn("whitespace-nowrap text-2xl text-slate-400/90", b.style)} aria-hidden={i >= MERCHANT_BRANDS.length}>
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Stats ───────────── */}
      <section className="py-20">
        <Container>
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {HEADLINE_STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80} className="rounded-3xl border border-slate-200 bg-white p-6 text-center sm:p-8">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">{s.value}</span>
                  <span className="mt-2 block text-sm font-semibold text-slate-800">{s.label}</span>
                  <span className="block text-xs text-slate-500">{s.detail}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* ───────────── Features ───────────── */}
      <section className="relative pb-24" id="features">
        <Container>
          <SectionHeading
            eyebrow="Everything in one place"
            title={<>One platform to build, sell, ship and grow</>}
            description="Stop stitching together Facebook pages, spreadsheets, payment links and courier portals. PaiCommerce runs your whole business from one dashboard."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              const big = i === 0 || i === 4;
              return (
                <Reveal key={f.id} delay={(i % 4) * 60} className={cn(big && "sm:col-span-2")}>
                  <Link
                    href={`/features#${f.id}`}
                    className={cn(
                      "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.35)]",
                      big && "bg-gradient-to-br from-white to-slate-50",
                    )}
                  >
                    <span className={cn("flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", f.color)}>
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      {f.title}
                      {f.plan && <span className="ml-2 align-middle rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{f.plan}+</span>}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.short}</p>
                    {big && (
                      <ul className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        {f.bullets.slice(0, 4).map((b) => (
                          <li key={b} className="flex gap-2">
                            <Check className="mt-0.5 size-4 shrink-0 text-brand-600" /> {b}
                          </li>
                        ))}
                      </ul>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-brand-600 opacity-0 transition group-hover:opacity-100">
                      Learn more <ArrowRight className="size-4" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ───────────── Built for Bangladesh ───────────── */}
      <section className="relative overflow-hidden bg-[#070a18] py-24 text-white sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark mask-radial" aria-hidden />
        <div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-pink-600/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-brand-600/30 blur-3xl" aria-hidden />
        <Container className="relative">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <Eyebrow dark>🇧🇩 Built for Bangladesh</Eyebrow>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
                Local payments, local couriers, <span className="text-gradient-light">local know-how.</span>
              </h2>
              <p className="mt-5 text-lg text-slate-300">
                Global platforms treat Bangladesh as an afterthought. We built PaiCommerce around how people here actually buy — cash on delivery, mobile
                wallets, phone-first checkout and courier networks that reach all 64 districts.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Wallet, t: "Priced in BDT", d: "Pay your subscription with bKash, Nagad or card." },
                  { icon: PhoneCall, t: "Phone-first checkout", d: "No forced accounts — just name, phone and address." },
                  { icon: Languages, t: "বাংলা & English", d: "Storefronts, invoices and AI copy in both languages." },
                  { icon: BadgeCheck, t: "Local support", d: "Real humans in Dhaka on chat, phone and WhatsApp." },
                ].map(({ icon: Icon, t, d }) => (
                  <li key={t} className="flex gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                      <Icon className="size-5 text-brand-300" />
                    </span>
                    <span>
                      <span className="block font-semibold">{t}</span>
                      <span className="block text-sm text-slate-400">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Payments</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {PAYMENT_MARKS.map((m) => (
                    <Wordmark key={m.name} {...m} dark />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Couriers</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {COURIER_MARKS.map((m) => (
                    <Wordmark key={m.name} {...m} dark />
                  ))}
                </div>
              </div>
              {/* mini checkout */}
              <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold">Checkout</p>
                  <span className="text-xs text-slate-400">Step 2 of 2</span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    { n: "Cash on delivery", c: "#16a34a", sub: "৳60 advance" },
                    { n: "bKash", c: "#e2136e", sub: "Instant", active: true },
                    { n: "Nagad", c: "#f6921e", sub: "Instant" },
                  ].map((p) => (
                    <div key={p.n} className={cn("rounded-xl border p-3 text-sm", p.active ? "border-pink-500 bg-pink-50/60 ring-2 ring-pink-500/20" : "border-slate-200")}>
                      <span className="font-bold" style={{ color: p.c }}>
                        {p.n}
                      </span>
                      <span className="block text-xs text-slate-500">{p.sub}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-500">Delivery · Inside Dhaka (Steadfast)</span>
                  <span className="font-semibold">৳60</span>
                </div>
                <button type="button" tabIndex={-1} className="mt-4 h-11 w-full rounded-xl bg-[#e2136e] text-sm font-bold text-white">
                  Pay ৳2,510 with bKash
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────────── Theme showcase ───────────── */}
      <section className="overflow-hidden py-24 sm:py-32">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow="Theme Store"
              title="A theme for every kind of business"
              description={`${themes.length} professionally designed, conversion-tuned themes — fashion to groceries, electronics to handicrafts. Click any theme to open its live demo store.`}
            />
            <ButtonLink href="/themes" variant="outline" size="lg" className="shrink-0">
              Browse all themes <ArrowRight />
            </ButtonLink>
          </div>
          <Carousel label="Featured themes" className="mt-12" itemClassName="w-[85%] sm:w-[420px]">
            {showcase.map((t) => (
              <ThemeCard key={t.slug} theme={t} className="h-full" />
            ))}
          </Carousel>
        </Container>
      </section>

      {/* ───────────── How it works ───────────── */}
      <section className="bg-slate-50 py-24 sm:py-32">
        <Container>
          <SectionHeading eyebrow="How it works" title="From idea to first order in under an hour" description="No developers, no servers, no plugins to update. Just three steps." />
          <ol className="relative mt-16 grid gap-6 lg:grid-cols-3">
            <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent lg:block" aria-hidden />
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 120} className="relative rounded-3xl border border-slate-200 bg-white p-7">
                <span className="relative flex size-12 items-center justify-center rounded-2xl bg-slate-950 font-display text-lg font-extrabold text-white shadow-lg">
                  {i + 1}
                </span>
                <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.body}</p>
                <p className="mt-5 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">⏱ {s.time}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* ───────────── Comparison ───────────── */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Compare"
            title="Why merchants switch to PaiCommerce"
            description="Shopify-level polish with the local payments, couriers and fraud tools that Bangladeshi businesses actually need."
          />
          <div className="mt-14">
            <ComparisonTable />
          </div>
        </Container>
      </section>

      {/* ───────────── Testimonials ───────────── */}
      <section className="bg-gradient-to-b from-white to-slate-50 pb-24 sm:pb-32">
        <Container>
          <SectionHeading eyebrow="Loved by sellers" title="Real businesses, real growth" />
          <div className="mt-14 columns-1 gap-5 space-y-5 md:columns-2 lg:columns-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={(i % 3) * 80} className="break-inside-avoid">
                <figure className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star key={k} className="size-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="size-6 text-slate-200" />
                  </div>
                  <blockquote className="mt-4 text-[0.97rem] leading-relaxed text-slate-700">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span
                      className="flex size-10 items-center justify-center rounded-full font-semibold text-white"
                      style={{ background: `hsl(${[...t.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360} 65% 50%)` }}
                      aria-hidden
                    >
                      {t.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900">{t.name}</span>
                      <span className="block text-xs text-slate-500">{t.role}</span>
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{t.metric}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────────── Pricing teaser ───────────── */}
      <section className="py-24 sm:py-32" id="pricing">
        <Container>
          <SectionHeading eyebrow="Pricing" title="Simple pricing in taka. Start free." description="Every plan includes hosting, SSL, unlimited bandwidth, COD and bKash. Upgrade as you grow." />
          <div className="mt-12">
            <PricingCards plans={toPricingPlans(plans)} compact />
          </div>
          <p className="mt-10 text-center">
            <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Compare all plan features <ArrowRight className="size-4" />
            </Link>
          </p>
        </Container>
      </section>

      {/* ───────────── Developers ───────────── */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#070a18] px-6 py-16 text-white sm:px-12 lg:py-20">
          <div className="pointer-events-none absolute inset-0 bg-grid-dark mask-radial" aria-hidden />
          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Eyebrow dark>
                <Terminal className="size-3.5" /> For developers
              </Eyebrow>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Build themes in React. <span className="text-gradient-light">Keep 70% of every sale.</span>
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Themes are plain TypeScript packages: sections, blocks and a settings schema the customizer understands. Scaffold one in seconds, preview it
                against real stores, and publish to thousands of merchants.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/developers" variant="white" size="lg">
                  Become a theme partner <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/docs/themes" variant="glass" size="lg">
                  Read the docs
                </ButtonLink>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl bg-[#0d1224] shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="ml-2 font-mono text-xs text-slate-400">sections/promo-banner.tsx</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-6 text-slate-300">
                <code>
                  <span className="text-violet-400">import</span> {"{ defineSection }"} <span className="text-violet-400">from</span> <span className="text-emerald-300">&quot;@pai/theme-sdk&quot;</span>;{"\n\n"}
                  <span className="text-violet-400">export default</span> <span className="text-sky-300">defineSection</span>({"{\n"}
                  {"  "}schema: {"{\n"}
                  {"    "}type: <span className="text-emerald-300">&quot;promo-banner&quot;</span>,{"\n"}
                  {"    "}name: <span className="text-emerald-300">&quot;Promo banner&quot;</span>,{"\n"}
                  {"    "}category: <span className="text-emerald-300">&quot;marketing&quot;</span>,{"\n"}
                  {"    "}settings: [{"\n"}
                  {"      "}{"{ "}type: <span className="text-emerald-300">&quot;text&quot;</span>, id: <span className="text-emerald-300">&quot;heading&quot;</span>, label: <span className="text-emerald-300">&quot;Heading&quot;</span>, default: <span className="text-emerald-300">&quot;Eid sale — 30% off&quot;</span> {"}"},{"\n"}
                  {"      "}{"{ "}type: <span className="text-emerald-300">&quot;color&quot;</span>, id: <span className="text-emerald-300">&quot;background&quot;</span>, label: <span className="text-emerald-300">&quot;Background&quot;</span> {"}"},{"\n"}
                  {"    "}],{"\n"}
                  {"    "}presets: [{"{ "}name: <span className="text-emerald-300">&quot;Promo banner&quot;</span> {"}"}],{"\n"}
                  {"  "}{"},\n"}
                  {"  "}component: ({"{ settings, context }"}) =&gt; ({"\n"}
                  {"    "}<span className="text-sky-300">&lt;a</span> <span className="text-amber-300">href</span>={"{"}context.<span className="text-sky-300">url</span>(<span className="text-emerald-300">&quot;/collections/sale&quot;</span>){"}"}<span className="text-sky-300">&gt;</span>
                  {"{"}settings.heading{"}"}<span className="text-sky-300">&lt;/a&gt;</span>{"\n"}
                  {"  "}),{"\n"}
                  {"}"});
                </code>
              </pre>
              <div className="border-t border-white/10 bg-black/20 px-5 py-3 font-mono text-xs text-slate-400">
                <span className="text-emerald-400">$</span> pnpm theme:new my-theme <span className="text-slate-600"># scaffold, register & validate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionHeading align="left" eyebrow="FAQ" title="Questions, answered" description="Can't find what you're looking for? Our team replies in minutes on WhatsApp and live chat." />
            <ButtonLink href="/contact" variant="outline" className="mt-8">
              <Sparkles /> Talk to a human
            </ButtonLink>
          </div>
          <Faq items={HOME_FAQ} />
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
