import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight, Code2 } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@pai/theme-sdk";
import { ThemeStore } from "@/components/marketing/theme-store";
import { ButtonLink, Container, Eyebrow } from "@/components/site/ui";
import { getThemes } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Theme Store",
  description: "Beautiful, conversion-tuned themes for every business category — fashion, electronics, grocery, beauty, food, home and more. Try any live demo store.",
  alternates: { canonical: "/themes" },
};

export default async function ThemesPage() {
  const themes = await getThemes();
  const free = themes.filter((t) => t.price === 0).length;
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-50" aria-hidden />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-violet-300/30 blur-3xl" aria-hidden />
        <Container className="relative py-16 sm:py-20">
          <div className="grid items-end gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <Eyebrow>Theme Store</Eyebrow>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
                Find the perfect look <span className="text-gradient">for your store</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-600">
                {themes.length} themes for {BUSINESS_CATEGORIES.length} business categories — {free} of them free. Every theme is mobile-first, fast, fully
                customizable with sections & blocks, and has a live demo store you can click through.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Code2 className="size-5" />
              </span>
              <div className="text-sm">
                <p className="font-semibold">Are you a designer or developer?</p>
                <p className="text-slate-500">Sell your themes and keep 70% of every sale.</p>
              </div>
              <ButtonLink href="/developers" size="sm" variant="outline" className="ml-auto shrink-0">
                Learn <ArrowRight />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
      <section className="py-12 sm:py-16">
        <Container>
          <Suspense fallback={<div className="h-96" />}>
            <ThemeStore themes={themes} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
