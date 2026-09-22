import Link from "next/link";
import { ArrowRight, BookOpen, LayoutGrid, LifeBuoy } from "lucide-react";
import { ButtonLink, Container } from "@/components/site/ui";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-60" aria-hidden />
      <Container className="relative flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-8xl font-extrabold tracking-tighter text-gradient sm:text-9xl">404</p>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">This page went out for delivery</h1>
        <p className="mt-4 max-w-md text-lg text-slate-600">…and the courier couldn&apos;t find the address. Let&apos;s get you somewhere useful.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg">
            Back to home <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/contact" size="lg" variant="outline">
            Contact support
          </ButtonLink>
        </div>
        <div className="mt-14 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          {[
            { href: "/themes", icon: LayoutGrid, t: "Theme Store" },
            { href: "/docs", icon: BookOpen, t: "Documentation" },
            { href: "/pricing", icon: LifeBuoy, t: "Pricing" },
          ].map(({ href, icon: Icon, t }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left font-semibold transition hover:border-brand-300 hover:shadow-sm">
              <Icon className="size-5 text-brand-600" /> {t}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
