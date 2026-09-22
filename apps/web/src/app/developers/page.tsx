import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Banknote, Blocks, Code2, FileCheck2, GitBranch, Rocket, Search, Terminal, Wallet } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { EarningsCalculator } from "@/components/marketing/earnings-calculator";
import { Faq } from "@/components/marketing/faq";
import { Reveal } from "@/components/site/reveal";
import { ButtonLink, Container, Eyebrow, SectionHeading } from "@/components/site/ui";
import { getThemes } from "@/lib/data";
import { signupUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Theme partners & developers",
  description: "Build PaiCommerce themes with React and TypeScript, sell them on the Theme Store and keep 70% of every sale. Monthly payouts via bank, bKash, PayPal or Wise.",
  alternates: { canonical: "/developers" },
};

const STEPS = [
  { icon: Terminal, t: "Scaffold", d: "Run `pnpm theme:new` to generate a theme package with manifest, settings, presets and an example section — registered and ready to preview." },
  { icon: Blocks, t: "Build", d: "Compose sections and blocks from @pai/theme-kit or write your own React server components. The customizer understands your settings schema automatically." },
  { icon: FileCheck2, t: "Validate", d: "`validate.mjs` checks your manifest, section schemas and templates. Run the performance & accessibility checklist before you submit." },
  { icon: Search, t: "Review", d: "Submit from the developer dashboard. Our team reviews design quality, performance, accessibility and code within 5 business days." },
  { icon: Rocket, t: "Publish", d: "Approved themes go live on the Theme Store with a live demo store. Ship updates with semantic versions — each is reviewed too." },
  { icon: Wallet, t: "Get paid", d: "Earn 70% of every purchase. Payouts are sent monthly via bank transfer, bKash, PayPal or Wise once you pass ৳5,000." },
];

const FAQ = [
  { q: "Who can become a theme partner?", a: "Any designer, developer or agency. You need a PaiCommerce account, a developer profile with payout details, and a theme that passes review." },
  { q: "How is revenue shared?", a: "You receive 70% of the theme price for every store that purchases it; PaiCommerce keeps 30% to cover payment processing, hosting of demo stores, review and marketing. Verified partners with top-rated themes can qualify for 80%." },
  { q: "How do I set my price?", a: "Themes are free or a one-time price in BDT (we recommend ৳1,900–৳6,900). Prices are stored in poisha (minor units) in your manifest and can be changed with an update." },
  { q: "What does the review check?", a: "Visual quality and originality, mobile layout, Lighthouse performance (aim for 90+), accessibility (WCAG 2.1 AA basics), correct use of context.url() for links, no external tracking scripts, and that every template renders with empty data." },
  { q: "How do updates work?", a: "Bump the semver version in your manifest and submit. Each version is reviewed; merchants get non-breaking updates automatically and keep their customizations because configs are stored as JSON." },
  { q: "When are payouts made?", a: "Monthly, in the first week, for the previous month's balance above ৳5,000. You can track sales, balance and payout history in the developer dashboard." },
];

export default async function DevelopersPage() {
  const themes = await getThemes();
  const premium = themes.filter((t) => t.price > 0).length;
  const partnerHref = signupUrl({ intent: "developer" });
  return (
    <>
      <section className="relative overflow-hidden bg-[#070a18] text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark mask-fade-b" aria-hidden />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.35),transparent)]" aria-hidden />
        <Container className="relative grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Eyebrow dark>
              <Code2 className="size-3.5" /> Theme partner program
            </Eyebrow>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
              Design themes. Sell to thousands of stores. <span className="text-gradient-light">Keep 70%.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              PaiCommerce themes are TypeScript + React packages built on an open Theme SDK — sections, blocks and a settings schema, just like Shopify
              Online Store 2.0. Build once, earn every time a merchant picks your design.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={partnerHref} variant="white" size="xl">
                Become a theme partner <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/docs/themes" variant="glass" size="xl">
                Read the theme docs
              </ButtonLink>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {[
                { v: "70%", l: "Revenue share" },
                { v: `${themes.length}`, l: "Themes live" },
                { v: `${premium}`, l: "Premium themes" },
              ].map((s) => (
                <div key={s.l}>
                  <dd className="font-display text-3xl font-extrabold">{s.v}</dd>
                  <dt className="text-sm text-slate-400">{s.l}</dt>
                </div>
              ))}
            </dl>
          </div>
          <EarningsCalculator />
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="How it works" title="From idea to income in six steps" description="A clear, fast review process and predictable monthly payouts." />
          <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(({ icon: Icon, t, d }, i) => (
              <Reveal as="li" key={t} delay={(i % 3) * 80} className="relative rounded-3xl border border-slate-200 bg-white p-7">
                <span className="absolute right-6 top-6 font-display text-5xl font-extrabold text-slate-100">{String(i + 1).padStart(2, "0")}</span>
                <span className="relative flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Icon className="size-5" />
                </span>
                <h3 className="relative mt-5 text-lg font-bold">{t}</h3>
                <p className="relative mt-2 text-slate-600">{d}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-slate-50 py-20 sm:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Developer experience</Eyebrow>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">A modern stack you already know</h2>
            <ul className="mt-8 space-y-5">
              {[
                { icon: Code2, t: "React Server Components + TypeScript", d: "Sections can be async and fetch data through a typed StorefrontDataAPI — no database access, no surprises." },
                { icon: Blocks, t: "Theme Kit included", d: "Production-ready header, footer, product, collection and cart sections plus client hooks for cart and variant pickers." },
                { icon: GitBranch, t: "Git-friendly, JSON configs", d: "Merchant customizations live in a ThemeConfig JSON document, so your updates never overwrite their work." },
                { icon: BadgeCheck, t: "Built-in validation", d: "Catch schema mistakes locally with validateTheme before our reviewers do." },
              ].map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold">{t}</span>
                    <span className="block text-slate-600">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl bg-[#0d1224] shadow-2xl ring-1 ring-slate-900/10">
            <div className="border-b border-white/10 px-4 py-2.5 font-mono text-xs text-slate-400">zsh — paicommerce</div>
            <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-7 text-slate-300">
              <span className="text-emerald-400">$</span> pnpm theme:new monsoon --name &quot;Monsoon&quot; --categories fashion,beauty{"\n"}
              <span className="text-slate-500">✔ Created themes/monsoon</span>{"\n"}
              <span className="text-slate-500">✔ Registered @pai-theme/monsoon in theme-registry</span>{"\n\n"}
              <span className="text-emerald-400">$</span> pnpm install && node tools/create-theme/validate.mjs monsoon{"\n"}
              <span className="text-sky-300">Monsoon</span> v1.0.0 · 18 sections · 11 templates · 2 presets{"\n"}
              <span className="text-emerald-400">✓ 0 errors, 0 warnings</span>{"\n\n"}
              <span className="text-emerald-400">$</span> pnpm dev{"\n"}
              <span className="text-slate-500">storefront → http://monsoon-demo.localhost:3003</span>
            </pre>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionHeading align="left" eyebrow="Payouts" title="Transparent earnings, paid monthly" />
            <div className="mt-8 space-y-3 text-sm">
              {[
                ["Revenue share", "70% to you · 30% platform"],
                ["Payout schedule", "Monthly, first week"],
                ["Minimum payout", "৳5,000"],
                ["Methods", "Bank transfer, bKash, PayPal, Wise"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <ButtonLink href={partnerHref} className="mt-8" size="lg">
              <Banknote /> Start earning
            </ButtonLink>
          </div>
          <Faq items={FAQ} />
        </Container>
      </section>

      <CtaBanner
        title="Your next theme could power a thousand stores."
        description="Join the partner program, get access to the developer dashboard and start building today."
        secondary={{ label: "Read the docs", href: "/docs/themes" }}
      />
    </>
  );
}
