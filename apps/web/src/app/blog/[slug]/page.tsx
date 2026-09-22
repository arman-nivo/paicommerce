import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { JsonLd } from "@/components/site/json-ld";
import { Container } from "@/components/site/ui";
import { POSTS, getPost } from "@/lib/blog";
import { SITE, absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, images: [post.cover], publishedTime: post.date, authors: [post.author.name] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const more = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.cover,
          datePublished: post.date,
          author: { "@type": "Person", name: post.author.name },
          publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
        }}
      />
      <article className="py-12 sm:py-16">
        <Container className="max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="size-4" /> All articles
          </Link>
          <p className="mt-8 text-sm font-semibold text-brand-600">{post.category}</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{post.title}</h1>
          <p className="mt-5 text-xl text-slate-600">{post.excerpt}</p>
          <div className="mt-8 flex items-center gap-3 border-b border-slate-200 pb-8 text-sm">
            <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 font-semibold text-white">
              {post.author.name.split(" ").map((w) => w[0]).join("")}
            </span>
            <span>
              <span className="block font-semibold">{post.author.name}</span>
              <span className="block text-slate-500">
                {post.author.role} · {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {post.readMinutes} min read
              </span>
            </span>
          </div>
        </Container>
        <Container className="mt-10 max-w-5xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt="" className="aspect-[2/1] w-full rounded-[2rem] object-cover" />
        </Container>
        <Container className="max-w-3xl">
          <div className="prose-pai mt-12 text-[1.07rem]">
            {post.body.map((b, i) =>
              "h2" in b ? (
                <h2 key={i}>{b.h2}</h2>
              ) : "p" in b ? (
                <p key={i}>{b.p}</p>
              ) : "ul" in b ? (
                <ul key={i}>
                  {b.ul.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : (
                <blockquote key={i}>{b.quote}</blockquote>
              ),
            )}
          </div>
          <div className="mt-16 border-t border-slate-200 pt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Keep reading</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {more.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="rounded-2xl border border-slate-200 p-5 transition hover:border-brand-300 hover:shadow-sm">
                  <p className="text-xs font-semibold text-brand-600">{p.category}</p>
                  <p className="mt-2 font-bold leading-snug">{p.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </article>
      <CtaBanner />
    </>
  );
}
