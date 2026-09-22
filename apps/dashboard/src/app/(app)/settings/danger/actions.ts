"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ACTIVE_STORE_COOKIE } from "@pai/core/auth";
import { getUserStores, setActiveStore } from "@pai/core/session";
import { and, db, eq, inArray, stores, subscriptions } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";

export const closeStore = action(z.object({ confirmSlug: z.string().trim().max(100) }), {}, async (input, ctx) => {
  if (ctx.member.role !== "owner") throw new ActionError("Only the store owner can close the store.");
  if (ctx.user.impersonatorId) throw new ActionError("Stores can't be closed while impersonating.");
  if (input.confirmSlug.toLowerCase() !== ctx.store.slug.toLowerCase()) throw new ActionError(`Type "${ctx.store.slug}" to confirm.`);

  await db.transaction(async (tx) => {
    await tx.update(stores).set({ status: "closed" }).where(eq(stores.id, ctx.store.id));
    await tx
      .update(subscriptions)
      .set({ status: "cancelled", cancelAtPeriodEnd: false })
      .where(and(eq(subscriptions.storeId, ctx.store.id), inArray(subscriptions.status, ["active", "trialing", "past_due"])));
  });
  await audit(ctx, "store.close", ctx.store.id, { slug: ctx.store.slug });

  const others = (await getUserStores(ctx.user.id)).filter((m) => m.store.id !== ctx.store.id);
  const next = others.find((m) => m.store.status !== "closed") ?? null;
  if (next) await setActiveStore(next.store.id);
  else (await cookies()).delete(ACTIVE_STORE_COOKIE);

  revalidatePath("/", "layout");
  redirect("/");
});
