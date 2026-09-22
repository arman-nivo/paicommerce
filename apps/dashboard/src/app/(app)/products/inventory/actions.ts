"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, db, eq, products, productVariants, sql } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { uuid } from "@/lib/zod";

const qty = z.number().int("Use whole numbers").min(-1_000_000).max(10_000_000);

/** Set or add to the stock of a product (without variants) or a variant. */
export const adjustStock = action(
  z.object({ kind: z.enum(["product", "variant"]), id: uuid, mode: z.enum(["set", "add"]), value: qty }),
  { permission: "products.manage" },
  async ({ kind, id, mode, value }, ctx) => {
    const storeId = ctx.store.id;
    const next = (col: typeof products.inventory | typeof productVariants.inventory) => (mode === "set" ? sql`${value}` : sql`${col} + ${value}`);
    const res = await db.transaction(async (tx) => {
      if (kind === "variant") {
        const [v] = await tx
          .update(productVariants)
          .set({ inventory: next(productVariants.inventory) })
          .where(and(eq(productVariants.id, id), eq(productVariants.storeId, storeId)))
          .returning({ inventory: productVariants.inventory, productId: productVariants.productId });
        if (!v) throw new ActionError("This variant no longer exists.");
        const [p] = await tx
          .update(products)
          .set({
            inventory: sql`(select coalesce(sum(pv.inventory), 0) from product_variants pv where pv.product_id = ${v.productId} and pv.store_id = ${storeId})`,
          })
          .where(and(eq(products.id, v.productId), eq(products.storeId, storeId)))
          .returning({ inventory: products.inventory });
        return { inventory: v.inventory, productInventory: p?.inventory ?? v.inventory, productId: v.productId };
      }
      const [hasVariant] = await tx
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(and(eq(productVariants.productId, id), eq(productVariants.storeId, storeId)))
        .limit(1);
      if (hasVariant) throw new ActionError("This product has variants — update stock on each variant.");
      const [p] = await tx
        .update(products)
        .set({ inventory: next(products.inventory) })
        .where(and(eq(products.id, id), eq(products.storeId, storeId)))
        .returning({ inventory: products.inventory });
      if (!p) throw new ActionError("This product no longer exists.");
      return { inventory: p.inventory, productInventory: p.inventory, productId: id };
    });
    await audit(ctx, "inventory.adjust", id, { kind, mode, value, inventory: res.inventory });
    revalidatePath("/products");
    revalidatePath("/products/inventory");
    return res;
  },
);

export const setTrackInventory = action(z.object({ productId: uuid, track: z.boolean() }), { permission: "products.manage" }, async ({ productId, track }, ctx) => {
  const [p] = await db
    .update(products)
    .set({ trackInventory: track })
    .where(and(eq(products.id, productId), eq(products.storeId, ctx.store.id)))
    .returning({ id: products.id });
  if (!p) throw new ActionError("This product no longer exists.");
  revalidatePath("/products");
  revalidatePath("/products/inventory");
  return { track };
});
