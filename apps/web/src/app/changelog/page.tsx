import type { Metadata } from "next";
import { Container, PageHero } from "@/components/site/ui";
import { cn } from "@pai/ui";

export const metadata: Metadata = {
  title: "Changelog",
  description: "New features, improvements and fixes shipped to PaiCommerce every week.",
  alternates: { canonical: "/changelog" },
};

type Tag = "New" | "Improved" | "Fixed" | "Developers";
const TAG_STYLE: Record<Tag, string> = {
  New: "bg-brand-50 text-brand-700 ring-brand-600/15",
  Improved: "bg-violet-50 text-violet-700 ring-violet-600/15",
  Fixed: "bg-amber-50 text-amber-800 ring-amber-600/20",
  Developers: "bg-slate-900 text-white ring-slate-900",
};

const ENTRIES: { version: string; date: string; title: string; summary: string; items: { tag: Tag; text: string }[] }[] = [
  {
    version: "2026.09",
    date: "2026-09-18",
    title: "AI writer in Bangla, Theme Store 2.0",
    summary: "Generate product copy in Bangla, a redesigned Theme Store with live demos, and faster storefronts.",
    items: [
      { tag: "New", text: "AI product writer now generates descriptions and SEO meta in Bangla." },
      { tag: "New", text: "Theme Store with category filters, ratings, installs and live demo stores for every theme." },
      { tag: "Improved", text: "Storefront pages are up to 35% faster thanks to streamed server rendering." },
      { tag: "Developers", text: "`pnpm theme:new` CLI scaffolds, registers and validates a theme in one command." },
    ],
  },
  {
    version: "2026.08",
    date: "2026-08-21",
    title: "Courier fraud check & incomplete orders",
    summary: "See courier success ratios before shipping and recover abandoned checkouts.",
    items: [
      { tag: "New", text: "Courier success ratio on every order, with minimum-rate rules and phone blocklist." },
      { tag: "New", text: "Incomplete orders captured at phone-number entry, with one-click convert." },
      { tag: "Improved", text: "Bulk booking for Steadfast, Pathao and RedX with label printing." },
      { tag: "Fixed", text: "Pathao zone mapping for some Chattogram thanas." },
    ],
  },
  {
    version: "2026.07",
    date: "2026-07-24",
    title: "Meta Conversions API, staff permissions",
    summary: "Server-side tracking and granular roles for growing teams.",
    items: [
      { tag: "New", text: "Meta Pixel + Conversions API with event deduplication." },
      { tag: "New", text: "Staff accounts with 14 granular permissions and role presets." },
      { tag: "Developers", text: "Webhooks for order.created, order.updated, product.updated and customer.created with HMAC signatures." },
      { tag: "Improved", text: "GA4 e-commerce events now include item categories and variants." },
    ],
  },
  {
    version: "2026.06",
    date: "2026-06-12",
    title: "Section-based theme customizer",
    summary: "Drag-and-drop sections and blocks with live preview, drafts and publishing.",
    items: [
      { tag: "New", text: "Theme customizer with sections, blocks, global styles and mobile preview." },
      { tag: "New", text: "13 themes across 17 business categories, each with category presets." },
      { tag: "Developers", text: "Theme SDK 1.0: ThemeDefinition, section schemas, StorefrontDataAPI and preview protocol." },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <PageHero eyebrow="Changelog" title="What's new in PaiCommerce" description="We ship improvements every week. Here are the highlights." />
      <section className="py-16 sm:py-20">
        <Container className="max-w-4xl">
          <ol className="relative space-y-14 border-l border-slate-200 pl-8 sm:pl-12">
            {ENTRIES.map((e) => (
              <li key={e.version} className="relative">
                <span className="absolute -left-[41px] top-1.5 flex size-4 items-center justify-center rounded-full bg-white ring-4 ring-white sm:-left-[57px]">
                  <span className="size-3 rounded-full bg-gradient-to-br from-brand-500 to-violet-500" />
                </span>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <time dateTime={e.date}>{new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs">{e.version}</span>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight">{e.title}</h2>
                <p className="mt-2 text-slate-600">{e.summary}</p>
                <ul className="mt-5 space-y-3">
                  {e.items.map((it) => (
                    <li key={it.text} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <span className={cn("mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", TAG_STYLE[it.tag])}>{it.tag}</span>
                      <span className="text-[0.95rem] text-slate-700">{it.text.split("`").map((part, i) => (i % 2 ? <code key={i} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em]">{part}</code> : part))}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
