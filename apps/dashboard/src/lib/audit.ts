import { auditLogs, db } from "@pai/db";
import type { Ctx } from "./ctx";

export async function audit(ctx: Pick<Ctx, "user" | "store">, action: string, target?: string, meta?: Record<string, unknown>) {
  try {
    await db.insert(auditLogs).values({ actorId: ctx.user.impersonatorId ?? ctx.user.id, storeId: ctx.store.id, action, target, meta });
  } catch (e) {
    console.error("[audit]", e);
  }
}
