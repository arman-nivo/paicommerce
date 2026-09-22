import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { and, count, db, desc, eq, ilike, or, productReviews, products, type SQL } from "@pai/db";
import { buttonVariants, Card, EmptyState } from "@pai/ui";
import { Header } from "@/components/page";
import { Pagination } from "@/components/pagination";
import { ClearFilters, FilterSelect, SearchBox, UrlTabs } from "@/components/url-controls";
import { can, getCtx } from "@/lib/ctx";
import { pageParam, str, type SearchParams } from "@/lib/format";
import { UUID_RE } from "../_lib/server";
import { ReviewsTable, type ReviewRow } from "./_components/reviews-table";

export const metadata = { title: "Reviews" };

const PAGE_SIZE = 25;

export default async function ReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("products.view");
  const sp = await searchParams;
  const storeId = ctx.store.id;
  const page = pageParam(sp.page);
  const tab = str(sp.tab) || "pending";
  const q = str(sp.q).trim();
  const product = str(sp.product);
  const rating = str(sp.rating);

  const conds: (SQL | undefined)[] = [eq(productReviews.storeId, storeId)];
  if (product && UUID_RE.test(product)) conds.push(eq(productReviews.productId, product));
  if (/^[1-5]$/.test(rating)) conds.push(eq(productReviews.rating, Number(rating)));
  if (q) {
    const pat = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    conds.push(or(ilike(productReviews.customerName, pat), ilike(productReviews.title, pat), ilike(productReviews.body, pat), ilike(products.title, pat)));
  }
  const base = and(...conds);
  const where = tab === "pending" ? and(base, eq(productReviews.approved, false)) : tab === "published" ? and(base, eq(productReviews.approved, true)) : base;

  const [list, [total], counts, productInfo] = await Promise.all([
    db
      .select({
        id: productReviews.id,
        rating: productReviews.rating,
        title: productReviews.title,
        body: productReviews.body,
        customerName: productReviews.customerName,
        approved: productReviews.approved,
        createdAt: productReviews.createdAt,
        productId: products.id,
        productTitle: products.title,
        images: products.images,
      })
      .from(productReviews)
      .innerJoin(products, and(eq(products.id, productReviews.productId), eq(products.storeId, storeId)))
      .where(where)
      .orderBy(desc(productReviews.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ n: count() })
      .from(productReviews)
      .innerJoin(products, and(eq(products.id, productReviews.productId), eq(products.storeId, storeId)))
      .where(where),
    db
      .select({ approved: productReviews.approved, n: count() })
      .from(productReviews)
      .innerJoin(products, and(eq(products.id, productReviews.productId), eq(products.storeId, storeId)))
      .where(base)
      .groupBy(productReviews.approved),
    product && UUID_RE.test(product) ? db.query.products.findFirst({ where: and(eq(products.id, product), eq(products.storeId, storeId)), columns: { id: true, title: true } }) : undefined,
  ]);
  const pending = counts.find((c) => c.approved === false)?.n ?? 0;
  const published = counts.find((c) => c.approved === true)?.n ?? 0;

  const rows: ReviewRow[] = list.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    customerName: r.customerName,
    approved: r.approved,
    createdAt: r.createdAt.toISOString(),
    productId: r.productId,
    productTitle: r.productTitle,
    image: r.images[0]?.url ?? null,
  }));
  const filtered = !!(q || product || rating);

  return (
    <>
      <Header
        title="Reviews"
        description={productInfo ? <>Reviews for <Link href={`/products/${productInfo.id}`} className="font-medium text-foreground hover:underline">{productInfo.title}</Link></> : "Approve reviews before they appear on your store. Published reviews update each product's star rating."}
        back={{ href: productInfo ? `/products/${productInfo.id}` : "/products", label: productInfo ? productInfo.title : "Products" }}
      />
      <Card className="overflow-hidden">
        <UrlTabs
          param="tab"
          tabs={[
            { value: "pending", label: "Pending", count: pending },
            { value: "published", label: "Published", count: published },
            { value: "all", label: "All", count: pending + published },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <SearchBox placeholder="Search by customer, product or text" />
          <FilterSelect
            param="rating"
            placeholder="Any rating"
            options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${"★".repeat(n)} ${n} star${n > 1 ? "s" : ""}` }))}
          />
          <ClearFilters keep={["tab"]} />
        </div>
        {rows.length ? (
          <ReviewsTable rows={rows} canManage={can(ctx, "products.manage")} />
        ) : (
          <EmptyState
            icon={<MessageSquare />}
            title={filtered ? "No reviews match" : tab === "pending" ? "You're all caught up" : "No reviews yet"}
            description={
              filtered
                ? "Try a different search or filter."
                : tab === "pending"
                  ? "New reviews from customers will appear here for approval."
                  : "Reviews customers leave on your products will show up here."
            }
            action={
              filtered ? (
                <Link href={`/products/reviews${tab !== "pending" ? `?tab=${tab}` : ""}`} className={buttonVariants({ variant: "outline" })}>
                  Clear filters
                </Link>
              ) : undefined
            }
          />
        )}
        {(total?.n ?? 0) > PAGE_SIZE && <Pagination page={page} pageSize={PAGE_SIZE} total={total?.n ?? 0} basePath="/products/reviews" params={sp} />}
      </Card>
    </>
  );
}
