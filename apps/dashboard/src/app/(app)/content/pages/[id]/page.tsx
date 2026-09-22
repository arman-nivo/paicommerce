import { notFound } from "next/navigation";
import { and, db, eq, pages } from "@pai/db";
import { getCtx } from "@/lib/ctx";
import { UUID_RE } from "../../_lib/slug";
import { PageForm } from "../_components/page-form";

export const metadata = { title: "Edit page" };

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCtx("content.manage");
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const page = await db.query.pages.findFirst({ where: and(eq(pages.id, id), eq(pages.storeId, ctx.store.id)) });
  if (!page) notFound();
  return (
    <PageForm
      key={page.updatedAt.toISOString()}
      id={page.id}
      updatedAt={page.updatedAt.toISOString()}
      initial={{ title: page.title, slug: page.slug, content: page.content ?? "", published: page.published, seoTitle: page.seo?.title ?? "", seoDescription: page.seo?.description ?? "" }}
    />
  );
}
