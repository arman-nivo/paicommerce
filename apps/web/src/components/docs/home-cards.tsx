import Link from "next/link";
import { ArrowRight, Blocks, Code2, Palette, Rocket, Server, Webhook } from "lucide-react";

const CARDS = [
  { href: "/docs/quickstart", title: "Quickstart", body: "Run the whole platform locally in five minutes — web, dashboard, admin and storefront.", Icon: Rocket, tone: "from-brand-500 to-violet-500" },
  { href: "/docs/themes", title: "Build a theme", body: "Sections, blocks, settings and presets — the Online Store 2.0 model, in React.", Icon: Palette, tone: "from-pink-500 to-rose-500" },
  { href: "/docs/themes/theme-kit", title: "Theme Kit", body: "Start from createBaseTheme and ship a polished theme with a fraction of the code.", Icon: Blocks, tone: "from-amber-500 to-orange-500" },
  { href: "/docs/api", title: "REST API", body: "Read products and collections, create and update orders with scoped API keys.", Icon: Code2, tone: "from-emerald-500 to-teal-500" },
  { href: "/docs/webhooks", title: "Webhooks", body: "Subscribe to order and catalog events, signed with HMAC-SHA256.", Icon: Webhook, tone: "from-sky-500 to-cyan-500" },
  { href: "/docs/deployment", title: "Deployment", body: "Vercel or Docker, Postgres + PgBouncer, wildcard DNS and custom domains with SSL.", Icon: Server, tone: "from-slate-600 to-slate-900" },
];

export function DocsHomeCards() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {CARDS.map(({ href, title, body, Icon, tone }) => (
        <Link
          key={href}
          href={href}
          className="group relative overflow-hidden rounded-2xl border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_16px_40px_-20px_rgba(37,69,235,0.45)]"
        >
          <span className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${tone}`}>
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="mt-4 flex items-center gap-1.5 font-display text-base font-bold text-foreground">
            {title}
            <ArrowRight className="size-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
          </span>
          <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">{body}</span>
        </Link>
      ))}
    </div>
  );
}
