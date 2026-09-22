"use server";

import { z } from "zod";
import { db, eq, inArray, supportTickets, users, type TicketMessage } from "@pai/db";
import { adminAction, fail } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ADMIN_ROLES } from "@/lib/roles";

const statuses = z.enum(["open", "pending", "resolved", "closed"]);
const priorities = z.enum(["low", "normal", "high", "urgent"]);

export const replyTicket = adminAction(
  "tickets",
  z.object({ id: z.string().uuid(), body: z.string().trim().min(1, "Write a reply first").max(10_000), status: statuses.optional() }),
  async ({ id, body, status }, admin) => {
    const t = await db.query.supportTickets.findFirst({ where: eq(supportTickets.id, id) });
    if (!t) fail("Ticket not found");
    const msg: TicketMessage = { from: "support", authorName: admin.name, body, at: new Date().toISOString() };
    const next = status ?? "pending";
    await db
      .update(supportTickets)
      .set({ messages: [...(t.messages ?? []), msg], status: next, assigneeId: t.assigneeId ?? admin.id })
      .where(eq(supportTickets.id, id));
    await audit({ actorId: admin.id, storeId: t.storeId, action: "ticket.replied", target: t.subject, meta: { ticketId: id, status: next } });
    return { message: next === "resolved" ? "Reply sent and ticket resolved" : "Reply sent" };
  },
);

export const updateTickets = adminAction(
  "tickets",
  z.object({ ids: z.array(z.string().uuid()).min(1).max(200), status: statuses.optional(), priority: priorities.optional(), assigneeId: z.union([z.string().uuid(), z.null()]).optional() }),
  async ({ ids, status, priority, assigneeId }, admin) => {
    if (assigneeId) {
      const a = await db.query.users.findFirst({ where: eq(users.id, assigneeId) });
      if (!a || !(ADMIN_ROLES as string[]).includes(a.role)) fail("Assignee must be a PaiCommerce team member");
    }
    const patch: Partial<typeof supportTickets.$inferInsert> = {};
    if (status) patch.status = status;
    if (priority) patch.priority = priority;
    if (assigneeId !== undefined) patch.assigneeId = assigneeId;
    if (!Object.keys(patch).length) fail("Nothing to update");
    const rows = await db.select({ id: supportTickets.id, storeId: supportTickets.storeId, subject: supportTickets.subject }).from(supportTickets).where(inArray(supportTickets.id, ids));
    await db.update(supportTickets).set(patch).where(inArray(supportTickets.id, ids));
    for (const r of rows) await audit({ actorId: admin.id, storeId: r.storeId, action: "ticket.updated", target: r.subject, meta: { ticketId: r.id, ...patch } });
    return { message: `${rows.length} ticket${rows.length === 1 ? "" : "s"} updated` };
  },
);
