import { headers } from "next/headers";
import { auditLogs, db } from "@pai/db";

export async function audit(entry: {
  actorId: string | null;
  action: string;
  target?: string | null;
  storeId?: string | null;
  meta?: Record<string, unknown> | null;
}) {
  let ip: string | null = null;
  try {
    const h = await headers();
    ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  } catch {
    ip = null;
  }
  await db.insert(auditLogs).values({
    actorId: entry.actorId,
    action: entry.action,
    target: entry.target ?? null,
    storeId: entry.storeId ?? null,
    meta: entry.meta ?? null,
    ip,
  });
}
