import type { Metadata } from "next";
import { ArrowRight, Heart, Lightbulb, Rocket, ShieldCheck, Users, Zap } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { Reveal } from "@/components/site/reveal";
import { ButtonLink, Container, Eyebrow, SectionHeading } from "@/components/site/ui";
import { HEADLINE_STATS } from "@/lib/content";

export const metadata: Metadata = {
  title: "About us",
  description: "PaiCommerce is on a mission to give every Bangladeshi entrepreneur world-class commerce tools. Meet the team building it in Dhaka.",
  alternates: { canonical: "/about" },
};

const TEAM = [
  { name: "Arafat Rahman", role: "Co-founder & CEO", bio: "Ex-marketplace product lead. Has shipped to all 64 districts." },
  { name: "Tahmina Chowdhury", role: "Co-founder & CTO", bio: "Built payment infrastructure for two of Bangladesh's largest fintechs." },
  { name: "Imran Hossain", role: "Head of Engineering", bio: "Distributed systems, Postgres and making things fast." },
  { name: "Nabila Karim", role: "Head of Design", bio: "Designs themes that feel premium on a ৳12,000 phone." },
  { name: "Rashed Mahmud", role: "Head of Merchant Success", bio: "Onboarded 3,000+ Facebook sellers into real brands." },
  { name: "Shreya Das", role: "Developer Relations", bio: "Runs the theme partner program and the SDK docs." },
  { name: "Kamrul Islam", role: "Logistics Partnerships", bio: "Our bridge to Steadfast, Pathao, RedX and Paperfly." },
  { name: "Farzana Yasmin", role: "Lead, Trust & Safety", bio: "Keeps fraud down and merchants' money safe." },
];

const VALUES = [
  { icon: Heart, t: "Merchants first", d: "Every decision starts with the seller packing parcels at midnight. If it doesn't make their day easier, we don't ship it." },
  { icon: Zap, t: "Fast is a feature", d: "Pages load on 3G, dashboards respond instantly, and support answers in minutes." },
  { icon: ShieldCheck, t: "Earn trust daily", d: "Merchant money, customer data and uptime are sacred. We're transparent when things go wrong." },
  { icon: Lightbulb, t: "Local depth, global quality", d: "We sweat Bangladeshi details — COD, couriers, Bangla — with the craft of the world's best software." },
  { icon: Users, t: "Grow the ecosystem", d: "Developers, agencies and couriers win when merchants win. 70% of every theme sale goes to its creator." },
  { icon: Rocket, t: "Ship, learn, repeat", d: "Small teams, weekly releases, and a public changelog. We'd rather improve than debate." },
];

function hue(s: string) {
  return [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
}

/** Deterministic, generated avatar — gradient + initials + subtle pattern. */
function GeneratedAvatar({ name }: { name: string }) {
  const h = hue(name);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <svg viewBox="0 0 120 120" className="size-full" role="img" aria-label={name}>
      <defs>
        <linearGradient id={`av-${h}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${h} 75% 60%)`} />
          <stop offset="1" stopColor={`hsl(${(h + 50) % 360} 70% 45%)`} />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill={`url(#av-${h})`} />
      <circle cx={20 + (h % 60)} cy="18" r="34" fill="white" opacity=".12" />
      <circle cx="104" cy={90 - (h % 30)} r="26" fill="white" opacity=".1" />
      <text x="60" y="72" textAnchor="middle" fontSize="40" fontWeight="800" fill="white" fontFamily="Plus Jakarta Sans, Inter, sans-serif">
        {initials}
      </text>
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-50" aria-hidden />
        <Container className="relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <Eyebrow>About PaiCommerce</Eyebrow>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
              Commerce infrastructure for the <span className="text-gradient">next 10 million</span> Bangladeshi entrepreneurs
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              Over a million businesses in Bangladesh sell online — most of them through Facebook pages, inboxes and spreadsheets. We&apos;re building the
              platform that turns them into real brands, with the same quality of tools a Shopify merchant in London or New York takes for granted.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-200/60 via-violet-200/50 to-pink-200/60 blur-2xl" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
              alt="The PaiCommerce team collaborating around a table"
              className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl"
            />
          </div>
        </Container>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/70 py-14">
        <Container>
          <dl className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {HEADLINE_STATS.map((s) => (
              <div key={s.label}>
                <dt className="text-sm font-medium text-slate-500">{s.label}</dt>
                <dd className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Eyebrow>Our story</Eyebrow>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Born in a Dhanmondi co-working space, built with sellers</h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-slate-600">
            <p>
              In 2023 our founders were helping friends run online clothing stores. Every evening looked the same: copy orders from Messenger into a
              spreadsheet, check bKash statements by hand, type addresses into three different courier portals, and hope the customer actually picks up
              the parcel.
            </p>
            <p>
              Global platforms were beautiful but didn&apos;t speak COD, bKash or Pathao. Local builders spoke the language but felt a decade old. So we
              built the platform we wished existed — a modern, Shopify-grade product with Bangladesh baked in from day one.
            </p>
            <p>
              Today thousands of merchants — from home bakers in Sylhet to electronics importers in Chattogram — run on PaiCommerce, and an ecosystem of
              theme developers and agencies builds on top of it.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-[#070a18] py-20 text-white sm:py-28">
        <Container>
          <SectionHeading dark eyebrow="Our values" title="What we believe" />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map(({ icon: Icon, t, d }, i) => (
              <Reveal key={t} delay={(i % 3) * 80} className="rounded-3xl bg-white/[0.04] p-7 ring-1 ring-white/10">
                <Icon className="size-6 text-brand-300" />
                <h3 className="mt-5 text-lg font-bold">{t}</h3>
                <p className="mt-2 text-slate-400">{d}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Team" title="The people behind PaiCommerce" description="A team of 40+ engineers, designers and merchant-success experts across Dhaka and Chattogram." />
          <ul className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {TEAM.map((m, i) => (
              <Reveal as="li" key={m.name} delay={(i % 4) * 70}>
                <div className="aspect-square overflow-hidden rounded-3xl">
                  <GeneratedAvatar name={m.name} />
                </div>
                <p className="mt-4 font-bold">{m.name}</p>
                <p className="text-sm font-medium text-brand-600">{m.role}</p>
                <p className="mt-1 text-sm text-slate-500">{m.bio}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section id="careers" className="scroll-mt-24 pb-8">
        <Container>
          <div className="grid items-center gap-8 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-pink-50 p-8 sm:p-12 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <Eyebrow>Careers</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Build the future of commerce in Bangladesh</h2>
              <p className="mt-3 text-lg text-slate-600">
                We&apos;re hiring engineers (Next.js, Postgres, Go), product designers, and merchant success managers. Competitive salary, equity, hybrid
                work and a lot of ownership.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <ButtonLink href="/contact?topic=partnership" size="lg">
                See open roles <ArrowRight />
              </ButtonLink>
              <p className="text-sm text-slate-500">or email careers@paicommerce.com</p>
            </div>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
