import { notFound } from "next/navigation";
import { and, blogPosts, db, eq, sql } from "@pai/db";
import { getCtx } from "@/lib/ctx";
import { toDhakaInput } from "../../_lib/dhaka";
import { UUID_RE } from "../../_lib/slug";
import { PostForm } from "../_components/post-form";

export const metadata = { title: "Edit blog post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCtx("content.manage");
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const [post, tags] = await Promise.all([
    db.query.blogPosts.findFirst({ where: and(eq(blogPosts.id, id), eq(blogPosts.storeId, ctx.store.id)) }),
    db.selectDistinct({ tag: sql<string>`unnest(${blogPosts.tags})` }).from(blogPosts).where(eq(blogPosts.storeId, ctx.store.id)).limit(100),
  ]);
  if (!post) notFound();
  return (
    <PostForm
      key={post.updatedAt.toISOString()}
      id={post.id}
      tagSuggestions={tags.map((t) => t.tag)}
      initial={{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        coverUrl: post.coverUrl,
        author: post.author ?? "",
        tags: post.tags ?? [],
        published: post.published,
        publishedAt: toDhakaInput(post.publishedAt),
        seoTitle: post.seo?.title ?? "",
        seoDescription: post.seo?.description ?? "",
      }}
    />
  );
}
