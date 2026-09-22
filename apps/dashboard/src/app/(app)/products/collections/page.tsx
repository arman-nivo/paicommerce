import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { and, asc, collections, count, db, eq, ilike, productCollections } from "@pai/db";
import { buttonVariants, Card, EmptyState } from "@pai/ui";
import { Header } from "@/components/page";
import { ClearFilters, SearchBox } from "@/components/url-controls";
import { can, getCtx } from "@/lib/ctx";
import { str, type SearchParams } from "@/lib/format";
import { CollectionList } from "./_components/collection-list";

export const metadata = { title: "Collections" };

export default async function CollectionsPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("products.view");
  const sp = await searchParams;
  const q = str(sp.q).trim();
  const storeId = ctx.store.id;
  const canManage = can(ctx, "products.manage");

  const [rows, [all]] = await Promise.all([
    db
      .select({
        id: collections.id,
        title: collections.title,
        slug: collections.slug,
        imageUrl: collections.imageUrl,
        published: collections.published,
        sortOrder: collections.sortOrder,
        products: count(productCollections.productId),
      })
      .from(collections)
      .leftJoin(productCollections, eq(productCollections.collectionId, collections.id))
      .where(and(eq(collections.storeId, storeId), q ? ilike(collections.title, `%${q.replace(/[\\%_]/g, "\\$&")}%`) : undefined))
      .groupBy(collections.id)
      .orderBy(asc(collections.position), asc(collections.title))
      .limit(1000),
    db.select({ n: count() }).from(collections).where(eq(collections.storeId, storeId)),
  ]);

  const addBtn = canManage ? (
    <Link href="/products/collections/new" className={buttonVariants()}>
      <Plus /> Create collection
    </Link>
  ) : undefined;

  return (
    <>
      <Header
        title="Collections"
        description="Group products so customers can browse them easily — e.g. “Eid Collection”, “Men”, “Under ৳500”."
        back={{ href: "/products", label: "Products" }}
        actions={all?.n ? addBtn : undefined}
      />
      <Card className="overflow-hidden">
        {!all?.n ? (
          <EmptyState
            icon={<FolderOpen />}
            title="Create your first collection"
            description="Collections appear in your store's menu and homepage, making it easy for customers to find what they want."
            action={addBtn}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
              <SearchBox placeholder="Search collections" />
              <ClearFilters />
            </div>
            {rows.length ? (
              <CollectionList rows={rows.map((r) => ({ ...r, products: Number(r.products) }))} canManage={canManage} reorderable={!q && canManage} />
            ) : (
              <EmptyState icon={<FolderOpen />} title="No collections match" description="Try a different search." />
            )}
          </>
        )}
      </Card>
    </>
  );
}
