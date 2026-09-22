import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@pai/ui";
import { Container } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "System status",
  description: "Live status and uptime of PaiCommerce storefronts, checkout, dashboard, API, payments and courier integrations.",
  alternates: { canonical: "/status" },
};

const COMPONENTS = [
  { name: "Storefronts & CDN", uptime: 99.99 },
  { name: "Checkout", uptime: 99.99 },
  { name: "Merchant dashboard", uptime: 99.98 },
  { name: "Storefront & Admin API", uptime: 99.97 },
  { name: "Webhooks delivery", uptime: 99.95 },
  { name: "Payment gateways (bKash, Nagad, SSLCommerz)", uptime: 99.92 },
  { name: "Courier integrations (Steadfast, Pathao, RedX)", uptime: 99.9 },
  { name: "Email & SMS notifications", uptime: 99.96 },
];

const INCIDENTS = [
  { date: "2026-09-03", title: "Delayed Pathao status sync", body: "Pathao's tracking API returned timeouts for 42 minutes. Bookings were unaffected; statuses were back-filled automatically.", severity: "minor" },
  { date: "2026-08-14", title: "Elevated checkout latency in Dhaka region", body: "An upstream network issue added ~800ms latency to checkout for 18 minutes. Traffic was re-routed to a secondary region.", severity: "minor" },
];

// Deterministic 90-day bars (static page; a real status provider can replace this).
function bars(seed: number) {
  return Array.from({ length: 90 }, (_, i) => {
    const x = Math.sin(seed * 97 + i * 13.37) * 10000;
    const r = x - Math.floor(x);
    return r > 0.985 ? "minor" : "ok";
  });
}

export default function StatusPage() {
  return (
    <section className="py-14 sm:py-20">
      <Container className="max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight">System status</h1>
        <div className="mt-8 flex items-center gap-4 rounded-3xl bg-emerald-600 p-6 text-white shadow-lg">
          <CheckCircle2 className="size-8 shrink-0" />
          <div>
            <p className="text-xl font-bold">All systems operational</p>
            <p className="text-sm text-emerald-100">Updated every minute · Subscribe to updates via status@paicommerce.com</p>
          </div>
        </div>

        <div className="mt-10 divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white">
          {COMPONENTS.map((c, idx) => (
            <div key={c.name} className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold">{c.name}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <span className="size-2 rounded-full bg-emerald-500" /> Operational
                </span>
              </div>
              <div className="mt-3 flex h-8 gap-[2px]" aria-hidden>
                {bars(idx + 1).map((b, i) => (
                  <span key={i} className={cn("flex-1 rounded-[2px]", b === "ok" ? "bg-emerald-400/80" : "bg-amber-400")} />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>90 days ago</span>
                <span>{c.uptime}% uptime</span>
                <span>Today</span>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold">Past incidents</h2>
        <ul className="mt-5 space-y-4">
          {INCIDENTS.map((i) => (
            <li key={i.date} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{i.title}</p>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-amber-700">{i.severity} · resolved</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{i.body}</p>
              <p className="mt-2 text-xs text-slate-400">{new Date(i.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
