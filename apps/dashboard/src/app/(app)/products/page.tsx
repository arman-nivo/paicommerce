import Link from "next/link";
import { Download, Package, Plus } from "lucide-react";
import { and, asc, collections, count, db, desc, eq, gt, ilike, inArray, isNotNull, lte, or, productCollections, products, productVariants, sql, type SQL } from "@pai/db";
import { buttonVariants, Card, EmptyState } from "@pai/ui";
import { Header } from "@/components/page";
import { Pagination } from "@/components/pagination";
import { ClearFilters, FilterSelect, SearchBox, UrlTabs } from "@/components/url-controls";
import { can, getCtx } from "@/lib/ctx";
import { pageParam, str, type SearchParams } from "@/lib/format";
import { lowStockThreshold, productUsage, UUID_RE } from "./_lib/server";
import { PRODUCT_SORTS } from "./_lib/shared";
import { ImportButton } from "./_components/import-dialog";
import { PlanUsage } from "./_components/plan-usage";
import { ProductsTable, type ProductRow } from "./_components/products-table";

export const metadata = { title: "Products" };

const PAGE_SIZE = 25;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("products.view");
  const sp = await searchParams;
  const storeId = ctx.store.id;
  const page = pageParam(sp.page);
  const q = str(sp.q).trim();
  const status = str(sp.status);
  const collection = str(sp.collection);
  const type = str(sp.type);
  const vendor = str(sp.vendor);
  const stock = str(sp.stock);
  const sort = str(sp.sort) || "newest";
  const threshold = lowStockThreshold(ctx.store);
  const canManage = can(ctx, "products.manage");

  const conds: (SQL | undefined)[] = [eq(products.storeId, storeId)];
  if (q) {
    const pat = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    conds.push(
      or(
        ilike(products.title, pat),
        ilike(products.sku, pat),
        ilike(products.vendor, pat),
        sql`exists (select 1 from unnest(${products.tags}) as t(tag) where t.tag ilike ${pat})`,
        sql`exists (select 1 from product_variants v where v.product_id = ${products.id} and v.store_id = ${storeId} and v.sku ilike ${pat})`,
      ),
    );
  }
  if (collection && UUID_RE.test(collection))
    conds.push(sql`exists (select 1 from product_collections pc where pc.product_id = ${products.id} and pc.collection_id = ${collection})`);
  if (type) conds.push(eq(products.productType, type));
  if (vendor) conds.push(eq(products.vendor, vendor));
  if (stock === "in") conds.push(or(eq(products.trackInventory, false), gt(products.inventory, threshold)));
  if (stock === "low") conds.push(and(eq(products.trackInventory, true), gt(products.inventory, 0), lte(products.inventory, threshold)));
  if (stock === "out") conds.push(and(eq(products.trackInventory, true), lte(products.inventory, 0)));
  const baseWhere = and(...conds);
  const where = status === "active" || status === "draft" || status === "archived" ? and(baseWhere, eq(products.status, status)) : baseWhere;

  const orderBy = {
    newest: [desc(products.createdAt)],
    oldest: [asc(products.createdAt)],
    title: [asc(sql`lower(${products.title})`)],
    "title-desc": [desc(sql`lower(${products.title})`)],
    "price-asc": [asc(products.price), desc(products.createdAt)],
    "price-desc": [desc(products.price), desc(products.createdAt)],
    "inventory-asc": [asc(products.inventory), desc(products.createdAt)],
    "inventory-desc": [desc(products.inventory), desc(products.createdAt)],
    "best-selling": [desc(products.salesCount), desc(products.createdAt)],
  }[sort] ?? [desc(products.createdAt)];

  const [list, [totalRow], statusCounts, cols, types, vendors, usage] = await Promise.all([
    db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        vendor: products.vendor,
        productType: products.productType,
        status: products.status,
        images: products.images,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        trackInventory: products.trackInventory,
        inventory: products.inventory,
        salesCount: products.salesCount,
      })
      .from(products)
      .where(where)
      .orderBy(...orderBy)
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(products).where(where),
    db.select({ status: products.status, n: count() }).from(products).where(baseWhere).groupBy(products.status),
    db.select({ id: collections.id, title: collections.title }).from(collections).where(eq(collections.storeId, storeId)).orderBy(asc(collections.position), asc(collections.title)),
    db
      .selectDistinct({ v: products.productType })
      .from(products)
      .where(and(eq(products.storeId, storeId), isNotNull(products.productType)))
      .orderBy(products.productType)
      .limit(200),
    db
      .selectDistinct({ v: products.vendor })
      .from(products)
      .where(and(eq(products.storeId, storeId), isNotNull(products.vendor)))
      .orderBy(products.vendor)
      .limit(200),
    productUsage(ctx.store),
  ]);
  const total = totalRow?.n ?? 0;

  const ids = list.map((p) => p.id);
  const [variantAgg, colCounts] = ids.length
    ? await Promise.all([
        db
          .select({
            productId: productVariants.productId,
            n: count(),
            min: sql<number>`min(${productVariants.price})`,
            max: sql<number>`max(${productVariants.price})`,
            stock: sql<number>`coalesce(sum(${productVariants.inventory}), 0)`,
          })
          .from(productVariants)
          .where(and(eq(productVariants.storeId, storeId), inArray(productVariants.productId, ids)))
          .groupBy(productVariants.productId),
        db
          .select({ productId: productCollections.productId, n: count() })
          .from(productCollections)
          .where(inArray(productCollections.productId, ids))
          .groupBy(productCollections.productId),
      ])
    : [[], []];
  const aggMap = new Map(variantAgg.map((a) => [a.productId, a]));
  const colMap = new Map(colCounts.map((c) => [c.productId, c.n]));

  const rows: ProductRow[] = list.map((p) => {
    const a = aggMap.get(p.id);
    return {
      id: p.id,
      title: p.title,
      vendor: p.vendor,
      productType: p.productType,
      status: p.status,
      image: p.images[0]?.url ?? null,
      priceMin: a ? Number(a.min) : p.price,
      priceMax: a ? Number(a.max) : p.price,
      compareAtPrice: p.compareAtPrice,
      trackInventory: p.trackInventory,
      inventory: a ? Number(a.stock) : p.inventory,
      variantCount: a?.n ?? 0,
      salesCount: p.salesCount,
      collectionCount: colMap.get(p.id) ?? 0,
    };
  });

  const counts = Object.fromEntries(statusCounts.map((s) => [s.status, s.n])) as Record<string, number>;
  const allCount = (counts.active ?? 0) + (counts.draft ?? 0) + (counts.archived ?? 0);
  const atLimit = usage.limit != null && usage.used >= usage.limit;
  const hasFilters = !!(q || status || collection || type || vendor || stock);
  const exportParams = new URLSearchParams();
  if (status) exportParams.set("status", status);

  const actions = (
    <>
      <a href={`/api/products/export${exportParams.size ? `?${exportParams}` : ""}`} className={buttonVariants({ variant: "outline" })} download>
        <Download /> Export
      </a>
      {canManage && <ImportButton remaining={usage.limit == null ? null : Math.max(0, usage.limit - usage.used)} />}
      {canManage &&
        (atLimit ? (
          <Link href="/settings/billing" className={buttonVariants({ variant: "default" })}>
            Upgrade to add more
          </Link>
        ) : (
          <Link href="/products/new" className={buttonVariants({ variant: "default" })}>
            <Plus /> Add product
          </Link>
        ))}
    </>
  );

  if (usage.used === 0) {
    return (
      <>
        <Header title="Products" description="Everything you sell, in one place." />
        <Card>
          <EmptyState
            icon={<Package />}
            title="Add your first product"
            description="Add photos, a price and stock — your product goes live on your store instantly. Already have a list? Import it from a spreadsheet."
            action={
              canManage ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <Link href="/products/new" className={buttonVariants({ variant: "default" })}>
                    <Plus /> Add product
                  </Link>
                  <ImportButton remaining={usage.limit} label="Import from CSV" />
                </div>
              ) : undefined
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <Header title="Products" description={<PlanUsage used={usage.used} limit={usage.limit} planName={usage.planName} />} actions={actions} />
      <Card className="overflow-hidden">
        <UrlTabs
          param="status"
          tabs={[
            { value: "", label: "All", count: allCount },
            { value: "active", label: "Active", count: counts.active ?? 0 },
            { value: "draft", label: "Draft", count: counts.draft ?? 0 },
            { value: "archived", label: "Archived", count: counts.archived ?? 0 },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <SearchBox placeholder="Search by title, SKU, vendor or tag" className="min-w-52" />
          {cols.length > 0 && <FilterSelect param="collection" placeholder="All collections" options={cols.map((c) => ({ value: c.id, label: c.title }))} />}
          {types.length > 0 && <FilterSelect param="type" placeholder="All types" options={types.map((t) => ({ value: t.v!, label: t.v! }))} />}
          {vendors.length > 0 && <FilterSelect param="vendor" placeholder="All vendors" options={vendors.map((t) => ({ value: t.v!, label: t.v! }))} />}
          <FilterSelect
            param="stock"
            placeholder="Any stock"
            options={[
              { value: "in", label: "In stock" },
              { value: "low", label: `Low stock (≤ ${threshold})` },
              { value: "out", label: "Out of stock" },
            ]}
          />
          <FilterSelect param="sort" placeholder="Sort: Newest" options={PRODUCT_SORTS.filter((s) => s.value !== "newest").map((s) => ({ value: s.value, label: `Sort: ${s.label}` }))} />
          <ClearFilters />
        </div>
        {rows.length ? (
          <ProductsTable rows={rows} collections={cols} canManage={canManage} threshold={threshold} />
        ) : (
          <EmptyState
            icon={<Package />}
            title={hasFilters ? "No products match your filters" : "No products here yet"}
            description={hasFilters ? "Try a different search or clear the filters." : undefined}
            action={
              hasFilters ? (
                <Link href="/products" className={buttonVariants({ variant: "outline" })}>
                  Clear filters
                </Link>
              ) : undefined
            }
          />
        )}
        {total > PAGE_SIZE && <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/products" params={sp} />}
      </Card>
    </>
  );
}
