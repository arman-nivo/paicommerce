import type { Metadata } from "next";
import { Building2, Check, Minus, ShieldCheck } from "lucide-react";
import { formatMoney } from "@pai/core";
import { cn } from "@pai/ui";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { Faq } from "@/components/marketing/faq";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { ButtonLink, Container, SectionHeading } from "@/components/site/ui";
import { PRICING_FAQ } from "@/lib/content";
import { getPlans, type MarketingPlan } from "@/lib/data";
import { toPricingPlans } from "@/lib/pricing";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple BDT pricing. Start free forever, or unlock custom domains, premium themes, courier automation, fraud checks and the developer API. 14-day free trial.",
  alternates: { canonical: "/pricing" },
};

type Val = string | boolean;
const TIERS = ["free", "growth", "pro", "enterprise"];

function tierOf(p: MarketingPlan, all: MarketingPlan[]) {
  const i = TIERS.indexOf(p.code);
  if (i >= 0) return i;
  const sorted = [...all].sort((a, b) => a.priceMonthly - b.priceMonthly);
  return Math.min(3, sorted.findIndex((x) => x.code === p.code));
}

const num = (n: number | null, unit = "") => (n == null ? "Unlimited" : `${n.toLocaleString("en-US")}${unit}`);
const storage = (mb: number) => (mb >= 1000 ? `${(mb / 1000).toLocaleString("en-US")} GB` : `${mb} MB`);

function buildMatrix(plans: MarketingPlan[]) {
  const limitRows: { group: string; label: string; get: (p: MarketingPlan) => Val }[] = [
    { group: "Plan limits", label: "Products", get: (p) => num(p.limits.products) },
    { group: "Plan limits", label: "Orders per month", get: (p) => num(p.limits.ordersPerMonth) },
    { group: "Plan limits", label: "Staff accounts", get: (p) => num(p.limits.staff) },
    { group: "Plan limits", label: "Media storage", get: (p) => storage(p.limits.storage) },
    { group: "Plan limits", label: "Platform transaction fee", get: (p) => `${p.limits.transactionFeePct}%` },
    { group: "Store & brand", label: "Free paicommerce.com subdomain", get: () => true },
    { group: "Store & brand", label: "Custom domain + free SSL", get: (p) => p.limits.customDomain },
    { group: "Store & brand", label: "Premium themes", get: (p) => p.limits.premiumThemes },
    { group: "Store & brand", label: "Remove PaiCommerce branding", get: (p) => p.limits.removeBranding },
    { group: "Developers", label: "REST API & webhooks", get: (p) => p.limits.apiAccess },
  ];
  const tierRows: { group: string; label: string; min: number }[] = [
    { group: "Store & brand", label: "Theme customizer & free themes", min: 0 },
    { group: "Payments & delivery", label: "Cash on delivery + bKash", min: 0 },
    { group: "Payments & delivery", label: "Nagad, SSLCommerz, aamarPay, Stripe, PayPal", min: 1 },
    { group: "Payments & delivery", label: "Steadfast / Pathao / RedX auto-booking", min: 1 },
    { group: "Payments & delivery", label: "Courier fraud check & success ratio", min: 2 },
    { group: "Growth", label: "Discount codes & delivery zones", min: 0 },
    { group: "Growth", label: "Meta Pixel, GA4 & GTM", min: 0 },
    { group: "Growth", label: "Meta Conversions API (server-side)", min: 1 },
    { group: "Growth", label: "Incomplete-order recovery", min: 1 },
    { group: "Growth", label: "AI product writer (Bangla & English)", min: 1 },
    { group: "Growth", label: "Advanced analytics & reports", min: 2 },
    { group: "Support", label: "Email & live chat support", min: 0 },
    { group: "Support", label: "Free migration assistance", min: 1 },
    { group: "Support", label: "Priority phone & WhatsApp support", min: 2 },
    { group: "Support", label: "Dedicated success manager & 99.99% SLA", min: 3 },
    { group: "Support", label: "SSO, audit logs & multi-store", min: 3 },
  ];
  const rows = [
    ...limitRows.map((r) => ({ group: r.group, label: r.label, values: plans.map(r.get) })),
    ...tierRows.map((r) => ({ group: r.group, label: r.label, values: plans.map((p) => tierOf(p, plans) >= r.min) as Val[] })),
  ];
  const groups = [...new Set(rows.map((r) => r.group))];
  return groups.map((g) => ({ group: g, rows: rows.filter((r) => r.group === g) }));
}

function Cell({ v }: { v: Val }) {
  if (v === true) return <Check className="mx-auto size-5 text-brand-600" strokeWidth={2.5} aria-label="Included" />;
  if (v === false) return <Minus className="mx-auto size-4 text-slate-300" aria-label="Not included" />;
  return <span className="text-sm font-medium text-slate-800">{v}</span>;
}

export default async function PricingPage() {
  const plans = await getPlans();
  const matrix = buildMatrix(plans);
  const enterprise = plans.find((p) => p.code === "enterprise");

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60" aria-hidden />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.16),transparent)]" aria-hidden />
        <Container className="relative pb-20 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
              Pricing that grows <span className="text-gradient">with your business</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              Start free, upgrade when you&apos;re ready. All prices in Bangladeshi taka, VAT inclusive. Pay with bKash, Nagad or card.
            </p>
          </div>
          <div className="mt-12">
            <PricingCards plans={toPricingPlans(plans)} />
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            {["14-day free trial on paid plans", "No setup fees", "Cancel anytime", "Free migration on Growth & Pro"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-20 sm:py-28" id="compare">
        <Container>
          <SectionHeading eyebrow="Compare plans" title="Every feature, side by side" />
          <div className="mt-12 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[760px] text-left">
              <caption className="sr-only">Plan comparison</caption>
              <thead className="sticky top-0">
                <tr className="border-b border-slate-200 bg-white">
                  <th scope="col" className="w-[34%] px-6 py-5 text-sm font-semibold text-slate-500">Features</th>
                  {plans.map((p) => (
                    <th key={p.code} scope="col" className={cn("px-4 py-5 text-center", p.highlighted && "bg-brand-50/60")}>
                      <span className="block font-display text-base font-bold text-slate-900">{p.name}</span>
                      <span className="block text-xs font-medium text-slate-500">
                        {p.priceMonthly === 0 ? "Free" : `${formatMoney(p.priceMonthly, p.currency)}/mo`}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              {matrix.map((g) => (
                <tbody key={g.group}>
                  <tr>
                    <th colSpan={plans.length + 1} scope="colgroup" className="bg-slate-50 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {g.group}
                    </th>
                  </tr>
                  {g.rows.map((r) => (
                    <tr key={r.label} className="border-b border-slate-100 last:border-0">
                      <th scope="row" className="px-6 py-3.5 text-sm font-medium text-slate-700">{r.label}</th>
                      {r.values.map((v, i) => (
                        <td key={i} className={cn("px-4 py-3.5 text-center", plans[i]?.highlighted && "bg-brand-50/60")}>
                          <Cell v={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28" id="enterprise">
        <Container>
          <div className="grid items-center gap-10 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-brand-50 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Building2 className="size-6" />
              </span>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight">{enterprise?.name ?? "Enterprise"} — built around your business</h2>
              <p className="mt-3 text-lg text-slate-600">
                For national brands, marketplaces and conglomerates: multi-store management, custom integrations with your ERP and warehouse, a 99.99%
                uptime SLA, custom theme development and a dedicated success manager.
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                {(enterprise?.features ?? ["Unlimited staff", "Multi-store management", "99.99% uptime SLA", "Dedicated success manager"]).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 size-4 text-brand-600" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-slate-950 p-7 text-white">
              <p className="text-sm text-slate-400">Starting at</p>
              <p className="mt-1 font-display text-4xl font-extrabold">
                {enterprise ? formatMoney(enterprise.priceMonthly, enterprise.currency) : "Custom"}
                <span className="text-base font-medium text-slate-400">/mo</span>
              </p>
              <p className="mt-2 text-sm text-slate-400">Volume pricing and annual contracts available.</p>
              <ButtonLink href="/contact?topic=enterprise" variant="white" size="lg" className="mt-6 w-full">
                Contact sales
              </ButtonLink>
              <ButtonLink href="/contact?topic=demo" variant="glass" size="lg" className="mt-3 w-full">
                Book a demo
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-8">
        <Container className="max-w-4xl">
          <SectionHeading eyebrow="FAQ" title="Pricing questions" />
          <Faq items={PRICING_FAQ} className="mt-10" />
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
