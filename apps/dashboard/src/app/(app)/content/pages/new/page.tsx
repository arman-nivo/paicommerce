import { db, eq, pages } from "@pai/db";
import { getCtx } from "@/lib/ctx";
import { PageForm } from "../_components/page-form";
import { pageTemplates } from "../_components/templates";

export const metadata = { title: "Add page" };

export default async function NewPagePage() {
  const ctx = await getCtx("content.manage");
  const { store } = ctx;
  const existing = await db.select({ slug: pages.slug }).from(pages).where(eq(pages.storeId, store.id));
  const a = store.address;
  const address = a ? [a.line1, a.area, a.city ?? a.district].filter(Boolean).join(", ") : null;
  const templates = pageTemplates({ name: store.name, email: store.email, phone: store.phone, address });
  return (
    <PageForm
      initial={{ title: "", slug: "", content: "", published: true, seoTitle: "", seoDescription: "" }}
      templates={templates}
      existingSlugs={existing.map((e) => e.slug)}
    />
  );
}
