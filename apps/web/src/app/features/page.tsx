import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@pai/ui";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FeatureVisual } from "@/components/mockups/feature-visuals";
import { Reveal } from "@/components/site/reveal";
import { ButtonLink, Container, PageHero } from "@/components/site/ui";
import { FEATURES } from "@/lib/features";
import { signupUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Store builder, themes & customizer, bKash/Nagad/SSLCommerz/COD payments, Steadfast/Pathao/RedX courier automation, fraud check, incomplete-order recovery, analytics, pixels, AI writer, staff, domains and API.",
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title={
          <>
            Every tool to run a <span className="text-gradient">serious online business</span>
          </>
        }
        description="From the first product you list to the thousandth parcel you ship — PaiCommerce handles storefront, checkout, delivery, marketing and growth."
      >
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={signupUrl()} size="lg">
            Start free trial <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/pricing" size="lg" variant="outline">
            See pricing
          </ButtonLink>
        </div>
      </PageHero>

      {/* sticky feature index */}
      <nav aria-label="Feature sections" className="sticky top-16 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <Container>
          <ul className="no-scrollbar -mx-2 flex gap-1 overflow-x-auto py-2.5">
            {FEATURES.map((f) => (
              <li key={f.id} className="shrink-0">
                <a href={`#${f.id}`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                  <f.icon className="size-3.5" /> {f.title}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      <div className="py-8">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          const flip = i % 2 === 1;
          return (
            <section key={f.id} id={f.id} className="scroll-mt-32 py-16 sm:py-24">
              <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <Reveal className={cn("min-w-0", flip && "lg:order-2")}>
                  <div className="flex items-center gap-3">
                    <span className={cn("flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", f.color)}>
                      <Icon className="size-5" />
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{f.title}</span>
                    {f.plan && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">{f.plan} plan & up</span>}
                  </div>
                  <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{f.headline}</h2>
                  <p className="mt-4 text-lg text-slate-600">{f.body}</p>
                  <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex gap-2.5 text-[0.95rem] text-slate-700">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  {f.id === "themes" && (
                    <Link href="/themes" className="mt-7 inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700">
                      Browse the Theme Store <ArrowRight className="size-4" />
                    </Link>
                  )}
                  {f.id === "api" && (
                    <Link href="/docs/api" className="mt-7 inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700">
                      Read the API reference <ArrowRight className="size-4" />
                    </Link>
                  )}
                </Reveal>
                <Reveal delay={120} className={cn("min-w-0", flip && "lg:order-1")}>
                  <FeatureVisual id={f.id} />
                </Reveal>
              </Container>
            </section>
          );
        })}
      </div>

      <CtaBanner title="Ready to see it on your own products?" />
    </>
  );
}
