import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@pai/ui";
import { Container } from "@/components/site/ui";
import { LEGAL } from "@/lib/legal";

export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL.map((d) => ({ doc: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  const d = LEGAL.find((x) => x.slug === doc);
  return d ? { title: d.title, description: d.summary, alternates: { canonical: `/legal/${d.slug}` } } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = LEGAL.find((x) => x.slug === doc);
  if (!d) notFound();
  return (
    <div className="border-t border-slate-100">
      <Container className="grid gap-12 py-14 lg:grid-cols-[220px_1fr_200px]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Legal</p>
          <ul className="mt-3 flex gap-1 lg:flex-col">
            {LEGAL.map((x) => (
              <li key={x.slug}>
                <Link
                  href={`/legal/${x.slug}`}
                  className={cn("block rounded-lg px-3 py-2 text-sm", x.slug === d.slug ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600 hover:bg-slate-50")}
                >
                  {x.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <article className="min-w-0 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight">{d.title}</h1>
          <p className="mt-3 text-lg text-slate-600">{d.summary}</p>
          <p className="mt-2 text-sm text-slate-400">
            Last updated {new Date(d.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="prose-pai mt-10">
            {d.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2>{s.title}</h2>
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </section>
            ))}
          </div>
        </article>
        <nav aria-label="On this page" className="hidden text-sm lg:sticky lg:top-24 lg:block lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">On this page</p>
          <ul className="mt-3 space-y-2 border-l border-slate-200">
            {d.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-3 text-slate-500 hover:border-slate-400 hover:text-slate-900">
                  {s.title.replace(/^\d+\.\s*/, "")}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </div>
  );
}
