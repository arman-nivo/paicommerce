"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, db, eq, inArray, productReviews } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { uuids } from "@/lib/zod";
import { recomputeRatings } from "../_lib/server";

function revalidateReviews() {
  revalidatePath("/products/reviews");
  revalidatePath("/products");
}

export const setReviewsApproved = action(z.object({ ids: uuids, approved: z.boolean() }), { permission: "products.manage" }, async ({ ids, approved }, ctx) => {
  const rows = await db
    .update(productReviews)
    .set({ approved })
    .where(and(eq(productReviews.storeId, ctx.store.id), inArray(productReviews.id, ids)))
    .returning({ productId: productReviews.productId });
  await recomputeRatings(ctx.store.id, rows.map((r) => r.productId));
  await audit(ctx, approved ? "review.approve" : "review.unpublish", undefined, { ids });
  revalidateReviews();
  return { count: rows.length };
});

export const deleteReviews = action(z.object({ ids: uuids }), { permission: "products.manage" }, async ({ ids }, ctx) => {
  const rows = await db
    .delete(productReviews)
    .where(and(eq(productReviews.storeId, ctx.store.id), inArray(productReviews.id, ids)))
    .returning({ productId: productReviews.productId });
  await recomputeRatings(ctx.store.id, rows.map((r) => r.productId));
  await audit(ctx, "review.delete", undefined, { ids });
  revalidateReviews();
  return { count: rows.length };
});
