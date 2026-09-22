import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dataFor } from "@/lib/data";
import { renderThemePage } from "@/lib/render";
import { pageMeta, readParams, segment, siteOr404, type PageProps } from "@/lib/pages";

type P = PageProps<{ slug: string }>;

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const site = await siteOr404(params);
  const slug = segment((await params).slug);
  const path = `/blog/${slug}`;
  const post = await dataFor(site, path).getPost(slug);
  if (!post) return { title: "Post not found" };
  return pageMeta(site, path, {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || post.content,
    image: post.seo?.image || post.coverUrl,
    type: "article",
  });
}

export default async function ArticlePage({ params, searchParams }: P) {
  const site = await siteOr404(params);
  const slug = segment((await params).slug);
  const path = `/blog/${slug}`;
  const found = await dataFor(site, path).getPost(slug);
  if (!found) notFound();
  const { seo: _seo, ...post } = found;
  void _seo;
  return renderThemePage(site, "article", { path, searchParams: await readParams(searchParams), resources: { post } });
}
