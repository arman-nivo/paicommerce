"use server";

import { z } from "zod";
import { db, inArray, leads } from "@pai/db";
import { adminAction } from "@/lib/action";
import { audit } from "@/lib/audit";

export const deleteLeads = adminAction("content.manage", z.object({ ids: z.array(z.string().uuid()).min(1).max(500) }), async ({ ids }, admin) => {
  const rows = await db.delete(leads).where(inArray(leads.id, ids)).returning({ email: leads.email });
  await audit({ actorId: admin.id, action: "lead.deleted", meta: { count: rows.length, emails: rows.map((r) => r.email).slice(0, 50) } });
  return { message: `${rows.length} lead${rows.length === 1 ? "" : "s"} deleted` };
});
