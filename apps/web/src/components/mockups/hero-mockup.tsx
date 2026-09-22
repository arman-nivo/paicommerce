import {
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  Home,
  Megaphone,
  Package,
  Palette,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@pai/ui";
import { ThemePreview } from "@/components/marketing/theme-preview";

const ORDERS = [
  { no: "#1048", name: "Rafiq Ahmed", city: "Dhaka", amount: "৳2,450", pay: "bKash", payTone: "bg-pink-50 text-pink-700", status: "Paid", courier: "Steadfast", ratio: 96 },
  { no: "#1047", name: "Nusrat Jahan", city: "Chattogram", amount: "৳1,180", pay: "COD", payTone: "bg-emerald-50 text-emerald-700", status: "Confirmed", courier: "Pathao", ratio: 91 },
  { no: "#1046", name: "Tanvir Hasan", city: "Sylhet", amount: "৳4,990", pay: "Nagad", payTone: "bg-orange-50 text-orange-700", status: "Paid", courier: "RedX", ratio: 88 },
  { no: "#1045", name: "Sadia Islam", city: "Khulna", amount: "৳860", pay: "COD", payTone: "bg-emerald-50 text-emerald-700", status: "Review", courier: "—", ratio: 34 },
];

const BARS = [38, 52, 44, 61, 57, 72, 66, 80, 74, 88, 83, 96];

function Stat({ label, value, delta, icon: Icon }: { label: string; value: string; delta: string; icon: typeof Wallet }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3">
      <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
        {label}
        <Icon className="size-3 text-slate-400" />
      </div>
      <div className="mt-1 font-display text-[15px] font-bold tracking-tight text-slate-900">{value}</div>
      <div className="text-[9px] font-semibold text-emerald-600">▲ {delta}</div>
    </div>
  );
}

export function DashboardMockup({ className }: { className?: string }) {
  const nav = [
    { icon: Home, label: "Home", active: true },
    { icon: ShoppingBag, label: "Orders", badge: "12" },
    { icon: RotateCcw, label: "Incomplete" },
    { icon: Package, label: "Products" },
    { icon: Users, label: "Customers" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Megaphone, label: "Marketing" },
    { icon: Palette, label: "Themes" },
    { icon: Boxes, label: "Apps" },
  ];
  return (
    <div className={cn("overflow-hidden rounded-2xl bg-white shadow-[0_40px_100px_-30px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/10", className)}>
      {/* window bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 bg-slate-50/90 px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto hidden rounded-md bg-white px-3 py-0.5 font-mono text-[10px] text-slate-400 ring-1 ring-slate-200 sm:block">
          dashboard.paicommerce.com
        </span>
      </div>
      <div className="flex">
        {/* sidebar */}
        <aside className="hidden w-36 shrink-0 border-r border-slate-100 bg-slate-50/60 p-2.5 sm:block">
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-white p-1.5 ring-1 ring-slate-200/80">
            <span className="flex size-5 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-rose-500 text-[9px] font-bold text-white">D</span>
            <span className="truncate text-[10px] font-semibold text-slate-800">Deshi Threads</span>
          </div>
          {nav.map(({ icon: Icon, label, active, badge }) => (
            <div key={label} className={cn("mb-0.5 flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-medium", active ? "bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/80" : "text-slate-500")}>
              <Icon className="size-3" />
              {label}
              {badge && <span className="ml-auto rounded-full bg-brand-600 px-1.5 text-[8px] font-bold text-white">{badge}</span>}
            </div>
          ))}
        </aside>
        {/* main */}
        <div className="min-w-0 flex-1 bg-[#f7f8fa] p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-[9px] font-medium text-slate-400">Tuesday, 22 September</p>
              <p className="font-display text-sm font-bold text-slate-900">Good evening, Nusrat 👋</p>
            </div>
            <div className="ml-auto hidden items-center gap-1.5 rounded-lg bg-white px-2 py-1 text-[9px] text-slate-400 ring-1 ring-slate-200 md:flex">
              <Search className="size-3" /> Search orders, products…
            </div>
            <span className="relative flex size-6 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
              <Bell className="size-3 text-slate-500" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label="Today's sales" value="৳84,250" delta="18.2%" icon={Wallet} />
            <Stat label="Orders" value="142" delta="9.4%" icon={ShoppingBag} />
            <Stat label="Conversion" value="3.8%" delta="0.6pt" icon={BarChart3} />
            <Stat label="Recovered" value="৳12,400" delta="31 carts" icon={RotateCcw} />
          </div>
          <div className="mt-2 grid gap-2 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-slate-800">Revenue · last 12 days</p>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-medium text-slate-500">BDT</span>
              </div>
              <div className="relative mt-2 h-24">
                <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
                  <defs>
                    <linearGradient id="hm-area" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#3b63f6" stopOpacity=".28" />
                      <stop offset="1" stopColor="#3b63f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,78 C25,70 40,74 60,62 S100,58 120,48 S160,52 185,38 S230,30 250,22 S285,14 300,10 L300,100 L0,100 Z" fill="url(#hm-area)" />
                  <path d="M0,78 C25,70 40,74 60,62 S100,58 120,48 S160,52 185,38 S230,30 250,22 S285,14 300,10" fill="none" stroke="#3b63f6" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
                  <path d="M0,86 C30,84 55,80 80,78 S130,74 160,70 S220,64 300,56" fill="none" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-3">
              <p className="text-[10px] font-semibold text-slate-800">Orders by channel</p>
              <div className="mt-2 flex h-24 items-end gap-1">
                {BARS.map((h, i) => (
                  <div key={i} className="flex-1 origin-bottom animate-grow rounded-t bg-gradient-to-t from-violet-500 to-brand-400" style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }} />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <p className="text-[10px] font-semibold text-slate-800">Recent orders</p>
              <span className="text-[9px] font-medium text-brand-600">View all →</span>
            </div>
            {ORDERS.map((o) => (
              <div key={o.no} className="flex items-center gap-2 border-b border-slate-50 px-3 py-1.5 text-[10px] last:border-0">
                <span className="w-9 font-mono font-semibold text-slate-800">{o.no}</span>
                <span className="min-w-0 flex-1 truncate text-slate-600">
                  {o.name} <span className="hidden text-slate-400 md:inline">· {o.city}</span>
                </span>
                <span className={cn("rounded px-1.5 py-0.5 text-[8px] font-semibold", o.payTone)}>{o.pay}</span>
                <span className="hidden w-16 items-center gap-1 md:flex">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span className={cn("block h-full rounded-full", o.ratio > 80 ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${o.ratio}%` }} />
                  </span>
                  <span className={cn("text-[8px] font-bold", o.ratio > 80 ? "text-emerald-600" : "text-rose-600")}>{o.ratio}%</span>
                </span>
                <span className="w-12 text-right font-semibold text-slate-900">{o.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ icon: Icon, tone, title, body, delay, className }: { icon: typeof Wallet; tone: string; title: string; body: string; delay: string; className?: string }) {
  return (
    <div className={cn("absolute z-20 flex w-64 animate-toast items-start gap-2.5 rounded-xl bg-white/95 p-3 opacity-0 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 backdrop-blur", className)} style={{ animationDelay: delay }}>
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tone)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-900">{title}</p>
        <p className="truncate text-[11px] text-slate-500">{body}</p>
      </div>
    </div>
  );
}

/** Hero composite: merchant dashboard + mobile storefront + live notifications. */
export function HeroMockup({ storefrontThumb }: { storefrontThumb: string }) {
  return (
    <div className="relative mx-auto max-w-6xl">
      <div className="absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[3rem] bg-gradient-to-tr from-brand-500/25 via-violet-500/20 to-pink-500/25 blur-3xl" aria-hidden />
      <DashboardMockup className="mr-0 md:mr-24 lg:mr-40" />

      <div className="absolute -bottom-10 right-0 hidden w-[230px] animate-float-slow md:block lg:w-[260px]">
        <ThemePreview slug="aurora" name="Deshi Threads" tagline="Eid collection is here" thumbnail={storefrontThumb} variant="mobile" className="h-[470px] lg:h-[520px]" eager />
        <div className="absolute -left-16 bottom-24 flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-xl ring-1 ring-slate-900/5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <p className="text-[10px] font-medium text-slate-500">Courier success ratio</p>
            <p className="text-sm font-bold text-slate-900">96% · Safe to ship</p>
          </div>
        </div>
      </div>

      <Toast icon={Wallet} tone="bg-pink-50 text-pink-600" title="New order #1049 · ৳3,200" body="Paid with bKash · Dhanmondi, Dhaka" delay="0s" className="-left-4 top-24 hidden sm:flex lg:-left-12" />
      <Toast icon={Truck} tone="bg-teal-50 text-teal-600" title="Parcel booked with Steadfast" body="Consignment SF-839214 · COD ৳1,180" delay="3s" className="-left-4 top-24 hidden sm:flex lg:-left-12" />
      <Toast icon={CheckCircle2} tone="bg-brand-50 text-brand-600" title="Incomplete order recovered" body="Sabbir came back via SMS · ৳1,850" delay="6s" className="-left-4 top-24 hidden sm:flex lg:-left-12" />
    </div>
  );
}
