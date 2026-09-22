import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { and, asc, db, eq, productCollections, products, productVariants } from "@pai/db";
import { Card, CardBody, CardHeader } from "@pai/ui";
import { getCtx } from "@/lib/ctx";
import { ProductForm } from "../_components/editor/product-form";
import type { ProductFormValue } from "../_components/editor/types";
import { getEditorMeta } from "../_lib/editor-data";
import { productUsage, UUID_RE } from "../_lib/server";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: UUID_RE.test(id) ? "Edit product" : "Product" };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCtx("products.view");
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const storeId = ctx.store.id;
  const product = await db.query.products.findFirst({ where: and(eq(products.id, id), eq(products.storeId, storeId)) });
  if (!product) notFound();
  const [variants, pcs, meta, usage] = await Promise.all([
    db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.productId, id), eq(productVariants.storeId, storeId)))
      .orderBy(asc(productVariants.position)),
    db.select({ collectionId: productCollections.collectionId }).from(productCollections).where(eq(productCollections.productId, id)),
    getEditorMeta(ctx.store),
    productUsage(ctx.store),
  ]);

  // Fall back to a single synthetic option when variants exist without option metadata.
  const options = product.options?.length ? product.options : variants.length ? [{ name: "Option", values: [...new Set(variants.map((v) => v.title))] }] : [];
  const initial: ProductFormValue = {
    title: product.title,
    description: product.description ?? "",
    status: product.status,
    vendor: product.vendor ?? "",
    productType: product.productType ?? "",
    tags: product.tags,
    images: product.images ?? [],
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    costPrice: product.costPrice,
    sku: product.sku ?? "",
    barcode: product.barcode ?? "",
    trackInventory: product.trackInventory,
    inventory: product.inventory,
    allowBackorder: product.allowBackorder,
    weightGrams: product.weightGrams,
    options: variants.length ? options.map((o) => ({ name: o.name, values: o.values })) : [],
    variants: variants.map((v) => ({
      id: v.id,
      values: product.options?.length ? options.map((o) => v.options?.[o.name] ?? "") : [v.title],
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      sku: v.sku ?? "",
      inventory: v.inventory,
      imageUrl: v.imageUrl,
    })),
    seoTitle: product.seo?.title ?? "",
    seoDescription: product.seo?.description ?? "",
    slug: product.slug,
    featured: product.featured,
    collectionIds: pcs.map((p) => p.collectionId),
  };

  const performance = (
    <Card>
      <CardHeader title="Performance" />
      <CardBody className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Units sold</div>
          <div className="mt-1 font-display text-xl font-bold tabular-nums">{product.salesCount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Rating</div>
          {product.ratingCount > 0 ? (
            <div className="mt-1 flex items-center gap-1 font-display text-xl font-bold tabular-nums">
              <Star className="size-4 fill-amber-400 text-amber-400" /> {product.ratingAvg.toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground">({product.ratingCount})</span>
            </div>
          ) : (
            <div className="mt-1 text-sm text-muted-foreground">No reviews yet</div>
          )}
        </div>
        <Link href={`/products/reviews?product=${product.id}&tab=all`} className="col-span-2 text-sm font-medium text-primary hover:underline">
          View reviews →
        </Link>
      </CardBody>
    </Card>
  );

  return <ProductForm key={product.updatedAt.toISOString()} productId={product.id} initial={initial} meta={meta} asideExtra={performance} canCreateMore={usage.limit == null || usage.used < usage.limit} />;
}
