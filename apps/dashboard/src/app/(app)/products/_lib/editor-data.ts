import { storeUrl } from "@pai/core";
import { and, asc, collections, db, eq, isNotNull, products, sql, type Store } from "@pai/db";
import type { EditorMeta } from "../_components/editor/types";

/** Suggestions + collections shown in the product editor. */
export async function getEditorMeta(store: Store): Promise<EditorMeta> {
  const [cols, vendors, types, tags] = await Promise.all([
    db.select({ id: collections.id, title: collections.title }).from(collections).where(eq(collections.storeId, store.id)).orderBy(asc(collections.position), asc(collections.title)),
    db
      .selectDistinct({ v: products.vendor })
      .from(products)
      .where(and(eq(products.storeId, store.id), isNotNull(products.vendor)))
      .limit(200),
    db
      .selectDistinct({ v: products.productType })
      .from(products)
      .where(and(eq(products.storeId, store.id), isNotNull(products.productType)))
      .limit(200),
    db.execute<{ tag: string }>(sql`select distinct unnest(tags) as tag from products where store_id = ${store.id} limit 300`),
  ]);
  const tagList = (Array.isArray(tags) ? tags : ((tags as { rows?: { tag: string }[] }).rows ?? [])) as { tag: string }[];
  return {
    collections: cols,
    vendors: vendors.map((v) => v.v!).filter(Boolean).sort(),
    types: types.map((v) => v.v!).filter(Boolean).sort(),
    tags: tagList.map((t) => t.tag).filter(Boolean).sort(),
    storeUrl: storeUrl(store),
  };
}
