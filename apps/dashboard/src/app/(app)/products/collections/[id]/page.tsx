import { notFound } from "next/navigation";
import { storeUrl } from "@pai/core";
import { and, asc, collections, db, eq, productCollections, products } from "@pai/db";
import { getCtx } from "@/lib/ctx";
import { CollectionForm, type CollectionFormValue, type PickedProduct } from "../_components/collection-form";
import { UUID_RE } from "../../_lib/server";
import type { CollectionSortOrder } from "../../_lib/shared";

export const metadata = { title: "Edit collection" };

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCtx("products.view");
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const col = await db.query.collections.findFirst({ where: and(eq(collections.id, id), eq(collections.storeId, ctx.store.id)) });
  if (!col) notFound();
  const items = await db
    .select({ id: products.id, title: products.title, images: products.images, status: products.status, price: products.price })
    .from(productCollections)
    .innerJoin(products, eq(products.id, productCollections.productId))
    .where(and(eq(productCollections.collectionId, id), eq(products.storeId, ctx.store.id)))
    .orderBy(asc(productCollections.position), asc(products.title))
    .limit(5000);
  const picked: PickedProduct[] = items.map((p) => ({ id: p.id, title: p.title, image: p.images[0]?.url ?? null, status: p.status, price: p.price }));
  const initial: CollectionFormValue = {
    title: col.title,
    description: col.description ?? "",
    imageUrl: col.imageUrl,
    slug: col.slug,
    published: col.published,
    sortOrder: (["manual", "newest", "price-asc", "price-desc", "best-selling"].includes(col.sortOrder) ? col.sortOrder : "manual") as CollectionSortOrder,
    seoTitle: col.seo?.title ?? "",
    seoDescription: col.seo?.description ?? "",
    products: picked,
  };
  return <CollectionForm key={col.updatedAt.toISOString()} id={col.id} initial={initial} storeUrl={storeUrl(ctx.store)} />;
}
