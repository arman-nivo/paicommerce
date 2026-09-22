import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, MessageCircleQuestion, SquarePen } from "lucide-react";
import { DOCS_NAV, docHref, getAllDocSlugs, getDoc, getPrevNext } from "@/lib/docs";
import { SITE } from "@/lib/site";
import { Markdown } from "@/components/docs/markdown";
import { DocsToc } from "@/components/docs/toc";
import { DocsHomeCards } from "@/components/docs/home-cards";

export const dynamicParams = false;

type Props = { params: Promise<{ slug?: string[] }> };

export function generateStaticParams(): { slug: string[] }[] {
  return getAllDocSlugs().map((s) => ({ slug: s ? s.split("/") : [] }));
}

function slugFrom(params: { slug?: string[] }): string {
  return (params.slug ?? []).map(decodeURIComponent).join("/");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = slugFrom(await params);
  const doc = getDoc(slug);
  if (!doc) return {};
  const url = docHref(slug);
  const title = slug ? doc.title : { absolute: "Developer documentation · PaiCommerce" };
  return {
    title,
    description: doc.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${doc.title} · PaiCommerce Docs`,
      description: doc.description,
      url,
      siteName: SITE.name,
    },
    twitter: { card: "summary_large_image", title: `${doc.title} · PaiCommerce Docs`, description: doc.description },
  };
}

export default async function DocPage({ params }: Props) {
  const slug = slugFrom(await params);
  const doc = getDoc(slug);
  if (!doc) notFound();

  const { prev, next } = getPrevNext(slug);
  const toc = doc.headings.filter((h) => h.depth <= 3).map((h) => ({ id: h.id, text: h.text, depth: h.depth }));
  const groupFirst = DOCS_NAV.find((g) => g.title === doc.group)?.items[0];

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_13.5rem] xl:gap-12">
      <article className="min-w-0 max-w-3xl pb-16 pt-8 lg:pt-10">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1 text-[13px] text-muted-foreground">
            <li>
              <Link href="/docs" className="transition hover:text-foreground">
                Docs
              </Link>
            </li>
            {slug && (
              <>
                <li aria-hidden>
                  <ChevronRight className="size-3.5" />
                </li>
                <li>
                  {groupFirst ? (
                    <Link href={docHref(groupFirst.slug)} className="transition hover:text-foreground">
                      {doc.group}
                    </Link>
                  ) : (
                    doc.group
                  )}
                </li>
                <li aria-hidden>
                  <ChevronRight className="size-3.5" />
                </li>
                <li aria-current="page" className="font-medium text-foreground">
                  {doc.title}
                </li>
              </>
            )}
          </ol>
        </nav>

        <header className="border-b border-border pb-8">
          <p className="text-[13px] font-semibold text-brand-600">{doc.group}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-balance text-foreground sm:text-[2.5rem] sm:leading-[1.12]">{doc.title}</h1>
          {doc.description && <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">{doc.description}</p>}
        </header>

        {slug === "" && <DocsHomeCards />}

        {/* Mobile / tablet TOC */}
        {toc.length > 2 && (
          <details className="group mt-6 rounded-xl border border-border bg-muted/40 px-4 py-3 xl:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-foreground">
              On this page
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
            </summary>
            <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
              {toc.map((t) => (
                <li key={t.id} className={t.depth === 3 ? "pl-4" : ""}>
                  <a href={`#${t.id}`} className="text-muted-foreground hover:text-foreground">
                    {t.text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        <Markdown source={doc.body} className="mt-8" />

        {/* Footer: edit + help */}
        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <a href={doc.editUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium text-muted-foreground transition hover:text-foreground">
            <SquarePen className="size-4" aria-hidden />
            Edit this page on GitHub
          </a>
          <a href={`mailto:${SITE.partnersEmail}?subject=${encodeURIComponent(`Docs: ${doc.title}`)}`} className="inline-flex items-center gap-2 font-medium text-muted-foreground transition hover:text-foreground">
            <MessageCircleQuestion className="size-4" aria-hidden />
            Questions? Contact developer support
          </a>
        </div>

        {(prev || next) && (
          <nav aria-label="Pagination" className="mt-8 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link href={docHref(prev.slug)} className="group rounded-xl border border-border p-4 transition hover:border-brand-300 hover:shadow-[0_8px_24px_-12px_rgba(37,69,235,0.35)]">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ArrowLeft className="size-3.5 transition group-hover:-translate-x-0.5" aria-hidden /> Previous
                </span>
                <span className="mt-1 block font-semibold text-foreground group-hover:text-brand-700">{prev.title}</span>
                <span className="block text-xs text-muted-foreground">{prev.group}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <Link href={docHref(next.slug)} className="group rounded-xl border border-border p-4 text-right transition hover:border-brand-300 hover:shadow-[0_8px_24px_-12px_rgba(37,69,235,0.35)]">
                <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-muted-foreground">
                  Next <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
                <span className="mt-1 block font-semibold text-foreground group-hover:text-brand-700">{next.title}</span>
                <span className="block text-xs text-muted-foreground">{next.group}</span>
              </Link>
            )}
          </nav>
        )}
      </article>

      <aside className="hidden xl:block" aria-label="Table of contents">
        <div className="no-scrollbar sticky top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto pb-8 pt-10">
          <DocsToc items={toc} />
        </div>
      </aside>
    </div>
  );
}
