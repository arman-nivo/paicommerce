import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, PageHero } from "@/components/site/ui";
import { POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Playbooks, product updates and growth guides for Bangladeshi online sellers and theme developers.",
  alternates: { canonical: "/blog" },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function BlogPage() {
  const [featured, ...rest] = POSTS;
  return (
    <>
      <PageHero eyebrow="Blog" title="Playbooks for selling online in Bangladesh" description="Operations, marketing, design and engineering — from the PaiCommerce team." />
      <section className="py-16 sm:py-20">
        <Container>
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition hover:shadow-xl lg:grid-cols-2">
              <div className="aspect-[16/10] overflow-hidden lg:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.cover} alt="" className="size-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <p className="text-sm font-semibold text-brand-600">{featured.category} · Featured</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{featured.title}</h2>
                <p className="mt-4 text-slate-600">{featured.excerpt}</p>
                <p className="mt-6 text-sm text-slate-500">
                  {featured.author.name} · {fmt(featured.date)} · {featured.readMinutes} min read
                </p>
                <span className="mt-6 inline-flex items-center gap-1 font-semibold text-brand-600">
                  Read article <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          )}
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {rest.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col">
                <div className="aspect-[16/10] overflow-hidden rounded-3xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.cover} alt="" loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-5 text-sm font-semibold text-brand-600">{p.category}</p>
                <h3 className="mt-2 text-xl font-bold leading-snug group-hover:text-brand-700">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-slate-600">{p.excerpt}</p>
                <p className="mt-4 text-sm text-slate-500">
                  {fmt(p.date)} · {p.readMinutes} min read
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
