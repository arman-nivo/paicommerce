import { blogPosts, db, eq, sql } from "@pai/db";
import { getCtx } from "@/lib/ctx";
import { PostForm } from "../_components/post-form";

export const metadata = { title: "Write blog post" };

export default async function NewPostPage() {
  const ctx = await getCtx("content.manage");
  const tags = await db.selectDistinct({ tag: sql<string>`unnest(${blogPosts.tags})` }).from(blogPosts).where(eq(blogPosts.storeId, ctx.store.id)).limit(100);
  return (
    <PostForm
      tagSuggestions={tags.map((t) => t.tag)}
      initial={{ title: "", slug: "", excerpt: "", content: "", coverUrl: null, author: ctx.user.name ?? "", tags: [], published: true, publishedAt: "", seoTitle: "", seoDescription: "" }}
    />
  );
}
