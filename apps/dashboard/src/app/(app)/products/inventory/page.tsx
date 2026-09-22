import Link from "next/link";
import { Boxes } from "lucide-react";
import { db, sql } from "@pai/db";
import { buttonVariants, Card, EmptyState } from "@pai/ui";
import { Header } from "@/components/page";
import { Pagination } from "@/components/pagination";
import { ClearFilters, SearchBox, UrlTabs } from "@/components/url-controls";
import { can, getCtx } from "@/lib/ctx";
import { pageParam, str, type SearchParams } from "@/lib/format";
import { lowStockThreshold } from "../_lib/server";
import { InventoryTable, type StockRow } from "./_components/inventory-table";

export const metadata = { title: "Inventory" };

const PAGE_SIZE = 50;

type RawRow = {
  kind: "product" | "variant";
  id: string;
  product_id: string;
  product_title: string;
  variant_title: string | null;
  sku: string | null;
  inventory: number;
  track_inventory: boolean;
  image: string | null;
  status: string;
};

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("products.view");
  const sp = await searchParams;
  const storeId = ctx.store.id;
  const page = pageParam(sp.page);
  const q = str(sp.q).trim();
  const tab = str(sp.stock);
  const threshold = lowStockThreshold(ctx.store);

  const base = sql`(
    select 'variant' as kind, v.id, p.id as product_id, p.title as product_title, v.title as variant_title, v.sku, v.inventory,
           p.track_inventory, coalesce(v.image_url, p.images->0->>'url') as image, p.status::text as status, p.created_at, v.position
    from product_variants v join products p on p.id = v.product_id
    where v.store_id = ${storeId} and p.store_id = ${storeId}
    union all
    select 'product' as kind, p.id, p.id as product_id, p.title as product_title, null as variant_title, p.sku, p.inventory,
           p.track_inventory, p.images->0->>'url' as image, p.status::text as status, p.created_at, 0 as position
    from products p
    where p.store_id = ${storeId} and not exists (select 1 from product_variants v2 where v2.product_id = p.id and v2.store_id = ${storeId})
  ) x`;
  const pat = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const search = q ? sql`and (x.product_title ilike ${pat} or x.variant_title ilike ${pat} or x.sku ilike ${pat})` : sql``;
  const stockCond =
    tab === "low"
      ? sql`and x.track_inventory and x.inventory > 0 and x.inventory <= ${threshold}`
      : tab === "out"
        ? sql`and x.track_inventory and x.inventory <= 0`
        : sql``;
  const order = tab ? sql`order by x.inventory asc, x.product_title asc, x.position asc` : sql`order by lower(x.product_title) asc, x.product_id, x.position asc`;

  const [rowsRes, countsRes] = await Promise.all([
    db.execute<RawRow>(sql`select x.kind, x.id, x.product_id, x.product_title, x.variant_title, x.sku, x.inventory, x.track_inventory, x.image, x.status
      from ${base} where true ${search} ${stockCond} ${order} limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}`),
    db.execute<{ total: number; low: number; out: number; filtered: number }>(sql`select
        count(*)::int as total,
        count(*) filter (where x.track_inventory and x.inventory > 0 and x.inventory <= ${threshold})::int as low,
        count(*) filter (where x.track_inventory and x.inventory <= 0)::int as out,
        count(*) filter (where true ${stockCond})::int as filtered
      from ${base} where true ${search}`),
  ]);
  const raw = Array.from(rowsRes as unknown as RawRow[]);
  const counts = Array.from(countsRes as unknown as { total: number; low: number; out: number; filtered: number }[])[0] ?? { total: 0, low: 0, out: 0, filtered: 0 };

  const rows: StockRow[] = raw.map((r) => ({
    kind: r.kind,
    id: r.id,
    productId: r.product_id,
    productTitle: r.product_title,
    variantTitle: r.variant_title,
    sku: r.sku,
    inventory: Number(r.inventory),
    track: r.track_inventory,
    image: r.image,
    status: r.status,
  }));

  return (
    <>
      <Header
        title="Inventory"
        description={`Update stock quickly across all products and variants. Items at ${threshold} or fewer are flagged as low stock.`}
        back={{ href: "/products", label: "Products" }}
      />
      <Card className="overflow-hidden">
        <UrlTabs
          param="stock"
          tabs={[
            { value: "", label: "All", count: q ? undefined : counts.total },
            { value: "low", label: "Low stock", count: counts.low },
            { value: "out", label: "Out of stock", count: counts.out },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <SearchBox placeholder="Search product, variant or SKU" />
          <ClearFilters />
        </div>
        {rows.length ? (
          <InventoryTable rows={rows} threshold={threshold} canManage={can(ctx, "products.manage")} />
        ) : (
          <EmptyState
            icon={<Boxes />}
            title={q || tab ? "Nothing matches" : "No products yet"}
            description={tab === "out" && !q ? "Great news — nothing is out of stock." : tab === "low" && !q ? "No items are running low." : q ? "Try a different search." : "Add products to start tracking stock."}
            action={
              !q && !tab ? (
                <Link href="/products/new" className={buttonVariants()}>
                  Add product
                </Link>
              ) : undefined
            }
          />
        )}
        {counts.filtered > PAGE_SIZE && <Pagination page={page} pageSize={PAGE_SIZE} total={counts.filtered} basePath="/products/inventory" params={sp} />}
      </Card>
    </>
  );
}
