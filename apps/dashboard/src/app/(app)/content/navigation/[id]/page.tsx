import { notFound } from "next/navigation";
import { and, db, eq, menus } from "@pai/db";
import { getCtx } from "@/lib/ctx";
import { UUID_RE } from "../../_lib/slug";
import { MenuEditor } from "../_components/menu-editor";

export const metadata = { title: "Edit menu" };

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCtx("content.manage");
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const menu = await db.query.menus.findFirst({ where: and(eq(menus.id, id), eq(menus.storeId, ctx.store.id)) });
  if (!menu) notFound();
  return <MenuEditor key={menu.updatedAt.toISOString()} id={menu.id} handle={menu.handle} initialTitle={menu.title} initialItems={menu.items ?? []} />;
}
