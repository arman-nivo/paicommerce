import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  MessageSquare,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { cn } from "@pai/ui";

function Panel({ children, className, tint = "from-brand-100 via-violet-50 to-pink-100" }: { children: React.ReactNode; className?: string; tint?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-5 sm:p-8", tint, className)}>
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-radial" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl bg-white p-4 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5", className)}>{children}</div>;
}

const bar = (w: string, c = "bg-slate-200") => <span className={cn("block h-2 rounded-full", c)} style={{ width: w }} />;

function StoreBuilder() {
  return (
    <Panel>
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Add product</p>
          <span className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Save</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_140px]">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-medium text-slate-500">Title</p>
              <div className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm">Handloom Cotton Saree — Jamdani</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[11px] font-medium text-slate-500">Price</p>
                <div className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm">৳3,450</div>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Compare at</p>
                <div className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400 line-through">৳4,200</div>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Variants</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {["Red / Free size", "Blue / Free size", "Green / Free size"].map((v) => (
                  <span key={v} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{v}</span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-2 py-1 text-[11px] text-slate-500">
                  <Plus className="size-3" /> Add
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-200 to-orange-200" />
            <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-xs text-slate-400">Drop images</div>
          </div>
        </div>
      </Card>
    </Panel>
  );
}

function Themes() {
  const sections = [
    { n: "Announcement bar", on: true },
    { n: "Hero slideshow", on: true, active: true },
    { n: "Featured collection", on: true },
    { n: "Image with text", on: false },
    { n: "Testimonials", on: true },
  ];
  return (
    <Panel tint="from-violet-100 via-fuchsia-50 to-pink-100">
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <Card className="p-3">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Home page</p>
          <ul className="mt-2 space-y-1">
            {sections.map((s) => (
              <li key={s.n} className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs", s.active ? "bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-200" : "text-slate-600")}>
                <GripVertical className="size-3 text-slate-300" />
                <span className="flex-1 truncate">{s.n}</span>
                {s.on ? <Eye className="size-3 text-slate-400" /> : <EyeOff className="size-3 text-slate-300" />}
              </li>
            ))}
          </ul>
          <p className="mt-2 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-brand-600">
            <Plus className="size-3" /> Add section
          </p>
        </Card>
        <Card className="overflow-hidden p-0">
          <div className="h-5 bg-slate-900 text-center text-[9px] leading-5 text-white">Free delivery inside Dhaka over ৳1,500</div>
          <div className="relative m-2 h-28 overflow-hidden rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 ring-2 ring-brand-500 ring-offset-2">
            <span className="absolute left-2 top-2 rounded bg-brand-600 px-1.5 py-0.5 text-[9px] font-semibold text-white">Hero slideshow</span>
            <p className="absolute bottom-3 left-3 font-display text-lg font-bold text-white">Eid Collection 2026</p>
          </div>
          <div className="grid grid-cols-3 gap-2 p-2">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className="aspect-square rounded-md bg-slate-100" />
                <div className="mt-1.5 space-y-1">{bar("80%")}{bar("40%", "bg-violet-300")}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Panel>
  );
}

function Payments() {
  return (
    <Panel tint="from-pink-100 via-rose-50 to-orange-100">
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { n: "bKash", c: "#e2136e", s: "Connected", ok: true },
          { n: "Nagad", c: "#f6921e", s: "Connected", ok: true },
          { n: "SSLCommerz", c: "#1d4ed8", s: "Connected", ok: true },
          { n: "Cash on delivery", c: "#16a34a", s: "Advance ৳60", ok: true },
          { n: "Stripe", c: "#635bff", s: "Set up", ok: false },
          { n: "Send Money (TrxID)", c: "#f97316", s: "Enabled", ok: true },
        ].map((p) => (
          <Card key={p.n} className="flex items-center gap-3 p-3.5">
            <span className="flex size-9 items-center justify-center rounded-xl text-sm font-extrabold text-white" style={{ background: p.c }}>
              {p.n[0]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{p.n}</span>
              <span className={cn("block text-xs", p.ok ? "text-emerald-600" : "text-slate-400")}>{p.s}</span>
            </span>
            <span className={cn("relative h-5 w-9 rounded-full", p.ok ? "bg-emerald-500" : "bg-slate-200")}>
              <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition", p.ok ? "left-[18px]" : "left-0.5")} />
            </span>
          </Card>
        ))}
      </div>
    </Panel>
  );
}

function Couriers() {
  return (
    <Panel tint="from-teal-100 via-emerald-50 to-cyan-100">
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Book 24 parcels</p>
          <span className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1 text-xs font-semibold text-white">
            <Truck className="size-3.5" /> Book all
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { n: "Steadfast", c: "#0f766e", active: true },
            { n: "Pathao", c: "#e11d48" },
            { n: "RedX", c: "#dc2626" },
          ].map((c) => (
            <div key={c.n} className={cn("rounded-xl border p-2.5 text-center text-sm font-bold", c.active ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500/20" : "border-slate-200")} style={{ color: c.c }}>
              {c.n}
            </div>
          ))}
        </div>
        <ul className="mt-4 space-y-2">
          {[
            { o: "#1048", s: "Delivered", t: "text-emerald-600 bg-emerald-50", id: "SF-839210" },
            { o: "#1047", s: "In transit", t: "text-sky-600 bg-sky-50", id: "SF-839211" },
            { o: "#1046", s: "Picked up", t: "text-violet-600 bg-violet-50", id: "SF-839212" },
            { o: "#1045", s: "Booked", t: "text-slate-600 bg-slate-100", id: "SF-839213" },
          ].map((r) => (
            <li key={r.o} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs">
              <span className="font-mono font-semibold">{r.o}</span>
              <span className="font-mono text-slate-400">{r.id}</span>
              <span className={cn("ml-auto rounded-full px-2 py-0.5 font-semibold", r.t)}>{r.s}</span>
            </li>
          ))}
        </ul>
      </Card>
    </Panel>
  );
}

function Orders() {
  return (
    <Panel tint="from-amber-100 via-orange-50 to-rose-100">
      <div className="space-y-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck className="size-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">01712-345678 · Rafiq Ahmed</p>
              <p className="text-xs text-slate-500">48 parcels across 3 couriers</p>
            </div>
            <span className="font-display text-2xl font-extrabold text-emerald-600">96%</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { c: "Steadfast", r: "22/23" },
              { c: "Pathao", r: "18/19" },
              { c: "RedX", r: "6/6" },
            ].map((x) => (
              <div key={x.c} className="rounded-lg bg-slate-50 py-2">
                <p className="font-semibold">{x.r}</p>
                <p className="text-slate-500">{x.c}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="border-l-4 border-rose-500">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertTriangle className="size-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">01899-000111 · High risk</p>
              <p className="text-xs text-slate-500">7 of 11 parcels returned · below your 60% rule</p>
            </div>
            <span className="font-display text-2xl font-extrabold text-rose-600">36%</span>
          </div>
          <div className="mt-3 flex gap-2 text-xs font-semibold">
            <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-white">Ask for advance</span>
            <span className="rounded-lg border border-slate-200 px-3 py-1.5">Call customer</span>
            <span className="rounded-lg px-3 py-1.5 text-rose-600">Block</span>
          </div>
        </Card>
      </div>
    </Panel>
  );
}

function Incomplete() {
  return (
    <Panel tint="from-sky-100 via-cyan-50 to-blue-100">
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Incomplete orders</p>
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">৳48,200 recoverable</span>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {[
            { n: "Sabbir H.", p: "01711-2xxxxx", a: "৳1,850", t: "12 min ago", s: "Recovered", ok: true },
            { n: "Mitu A.", p: "01822-4xxxxx", a: "৳3,400", t: "38 min ago", s: "Call", ok: false },
            { n: "Rakib K.", p: "01933-9xxxxx", a: "৳990", t: "1 h ago", s: "SMS sent", ok: false },
          ].map((r) => (
            <li key={r.n} className="flex items-center gap-3 py-2.5 text-xs">
              <span className="flex size-8 items-center justify-center rounded-full bg-slate-100">
                <Phone className="size-3.5 text-slate-500" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-slate-800">{r.n} · {r.a}</span>
                <span className="block text-slate-400">{r.p} · {r.t}</span>
              </span>
              <span className={cn("rounded-lg px-2.5 py-1 font-semibold", r.ok ? "bg-emerald-50 text-emerald-700" : "bg-slate-900 text-white")}>{r.s}</span>
            </li>
          ))}
        </ul>
      </Card>
    </Panel>
  );
}

function Analytics() {
  const pts = [20, 34, 28, 46, 40, 58, 52, 70, 64, 82, 76, 94];
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * 300},${100 - p}`).join(" ");
  return (
    <Panel tint="from-indigo-100 via-blue-50 to-violet-100">
      <Card>
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "Revenue", v: "৳18.4L", d: "+24%" },
            { l: "AOV", v: "৳1,640", d: "+6%" },
            { l: "Conversion", v: "3.9%", d: "+0.7pt" },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-[11px] text-slate-500">{s.l}</p>
              <p className="font-display text-lg font-bold">{s.v}</p>
              <p className="text-[11px] font-semibold text-emerald-600">▲ {s.d}</p>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 300 100" className="mt-4 h-32 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="fv-a" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#6366f1" stopOpacity=".3" />
              <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L300,100 L0,100 Z`} fill="url(#fv-a)" />
          <path d={path} fill="none" stroke="#6366f1" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="mt-3 space-y-2 text-xs">
          {[
            { n: "Facebook ads", w: "72%" },
            { n: "Instagram", w: "48%" },
            { n: "Google", w: "30%" },
          ].map((r) => (
            <div key={r.n} className="flex items-center gap-3">
              <span className="w-24 text-slate-500">{r.n}</span>
              <span className="h-2 flex-1 rounded-full bg-slate-100">
                <span className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: r.w }} />
              </span>
            </div>
          ))}
        </div>
      </Card>
    </Panel>
  );
}

function Marketing() {
  return (
    <Panel tint="from-blue-100 via-indigo-50 to-violet-100">
      <Card>
        <p className="text-sm font-bold">Event stream</p>
        <ul className="mt-3 space-y-2 font-mono text-[11px]">
          {[
            { e: "Purchase", v: "৳2,450", s: ["Pixel", "CAPI", "GA4"] },
            { e: "InitiateCheckout", v: "৳2,450", s: ["Pixel", "CAPI", "GTM"] },
            { e: "AddToCart", v: "৳1,225", s: ["Pixel", "GA4", "TikTok"] },
            { e: "ViewContent", v: "৳1,225", s: ["Pixel", "GA4"] },
          ].map((r) => (
            <li key={r.e} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span className="font-semibold text-slate-800">{r.e}</span>
              <span className="text-slate-400">{r.v}</span>
              <span className="ml-auto flex gap-1">
                {r.s.map((s) => (
                  <span key={s} className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200">{s}</span>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">Deduplicated with event_id · Match quality: <span className="font-semibold text-emerald-600">Great (8.4)</span></p>
      </Card>
    </Panel>
  );
}

function Ai() {
  return (
    <Panel tint="from-fuchsia-100 via-pink-50 to-violet-100">
      <Card>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white">
            <Sparkles className="size-4" />
          </span>
          <p className="text-sm font-bold">AI product writer</p>
          <span className="ml-auto flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-semibold">
            <span className="rounded-md bg-white px-2 py-0.5 shadow-sm">বাংলা</span>
            <span className="px-2 py-0.5 text-slate-500">English</span>
          </span>
        </div>
        <div className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500">Keywords: হাতে বোনা, সুতি, আরামদায়ক, ঈদ</div>
        <div className="mt-3 rounded-xl bg-gradient-to-br from-fuchsia-50 to-violet-50 p-3 text-sm leading-relaxed text-slate-700">
          <p className="font-semibold">হাতে বোনা জামদানি সুতি শাড়ি</p>
          <p className="mt-1 text-[13px]">
            দক্ষ তাঁতিদের হাতে বোনা এই শাড়িটি নরম সুতির তৈরি — সারাদিন পরলেও থাকবে আরামদায়ক। ঈদ কিংবা যেকোনো উৎসবে আপনাকে দেবে অনন্য
            ঐতিহ্যবাহী লুক।
          </p>
          <span className="mt-2 inline-block h-4 w-1.5 animate-pulse-soft bg-violet-500 align-middle" />
        </div>
      </Card>
    </Panel>
  );
}

function Staff() {
  const perms = ["Orders", "Products", "Customers", "Discounts", "Analytics", "Themes", "Settings", "Billing"];
  const roles = [
    { n: "Ayesha (Owner)", v: perms.map(() => true) },
    { n: "Rahim · Orders", v: [true, true, true, false, false, false, false, false] },
    { n: "Mim · Marketing", v: [false, false, true, true, true, false, false, false] },
  ];
  return (
    <Panel tint="from-emerald-100 via-teal-50 to-cyan-100">
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-xs">
          <thead>
            <tr>
              <th className="pb-2 text-left font-semibold text-slate-500">Member</th>
              {perms.map((p) => (
                <th key={p} className="pb-2 font-medium text-slate-400">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.n} className="border-t border-slate-100">
                <td className="py-2.5 font-semibold text-slate-800">{r.n}</td>
                {r.v.map((on, i) => (
                  <td key={i} className="text-center">
                    {on ? <CheckCircle2 className="mx-auto size-4 text-emerald-500" /> : <span className="mx-auto block size-4 rounded-full border border-slate-200" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Panel>
  );
}

function Domains() {
  return (
    <Panel tint="from-cyan-100 via-sky-50 to-blue-100">
      <Card>
        <p className="text-sm font-bold">Domains</p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm">
            <Lock className="size-4 text-emerald-600" />
            <span className="font-semibold">www.deshithreads.com</span>
            <span className="ml-auto rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">Primary · SSL</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-500">
            <Lock className="size-4" /> deshi-threads.paicommerce.com
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
          <p className="text-slate-500"># DNS record</p>
          <p>
            <span className="text-sky-300">CNAME</span> www → <span className="text-emerald-300">stores.paicommerce.com</span>
          </p>
          <p className="mt-1 text-emerald-400">✓ Verified · certificate issued</p>
        </div>
      </Card>
    </Panel>
  );
}

function Api() {
  return (
    <Panel tint="from-slate-200 via-slate-100 to-indigo-100">
      <div className="overflow-hidden rounded-2xl bg-[#0d1224] shadow-2xl ring-1 ring-white/10">
        <div className="border-b border-white/10 px-4 py-2 font-mono text-[11px] text-slate-400">Terminal</div>
        <pre className="overflow-x-auto p-4 font-mono text-[11.5px] leading-6 text-slate-300">
          <span className="text-emerald-400">$</span> curl https://deshi-threads.paicommerce.com/api/v1/orders?limit=1 \{"\n"}
          {"    "}-H <span className="text-emerald-300">&quot;Authorization: Bearer pai_sk_••••&quot;</span>
          {"\n\n"}
          {"{\n"}
          {"  "}<span className="text-sky-300">&quot;data&quot;</span>: [{"{\n"}
          {"    "}<span className="text-sky-300">&quot;orderNumber&quot;</span>: <span className="text-amber-300">1048</span>,{"\n"}
          {"    "}<span className="text-sky-300">&quot;total&quot;</span>: <span className="text-amber-300">245000</span>,{"\n"}
          {"    "}<span className="text-sky-300">&quot;paymentMethod&quot;</span>: <span className="text-emerald-300">&quot;bkash&quot;</span>,{"\n"}
          {"    "}<span className="text-sky-300">&quot;fulfillmentStatus&quot;</span>: <span className="text-emerald-300">&quot;shipped&quot;</span>{"\n"}
          {"  "}{"}]\n"}
          {"}"}
        </pre>
      </div>
      <Card className="mt-3 flex items-center gap-3 p-3">
        <MessageSquare className="size-4 text-brand-600" />
        <span className="font-mono text-xs">POST order.created → https://erp.example.com/hooks</span>
        <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">200 · signed</span>
      </Card>
    </Panel>
  );
}

const MAP: Record<string, () => React.JSX.Element> = {
  "store-builder": StoreBuilder,
  themes: Themes,
  payments: Payments,
  couriers: Couriers,
  orders: Orders,
  "incomplete-orders": Incomplete,
  analytics: Analytics,
  marketing: Marketing,
  ai: Ai,
  staff: Staff,
  domains: Domains,
  api: Api,
};

export function FeatureVisual({ id }: { id: string }) {
  const C = MAP[id];
  return C ? <C /> : null;
}
