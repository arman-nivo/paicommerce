"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, count, db, eq, inArray, sql, supportTickets, type TicketMessage } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { type Ctx } from "@/lib/ctx";
import { ActionError } from "@/lib/errors";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "./meta";

const body = z.string().trim().min(2, "Write a message").max(5000, "Keep it under 5,000 characters");

async function getTicket(ctx: Ctx, id: string) {
  const t = await db.query.supportTickets.findFirst({ where: and(eq(supportTickets.id, id), eq(supportTickets.storeId, ctx.store.id)) });
  if (!t) throw new ActionError("Ticket not found.");
  return t;
}

export const createTicket = action(
  z.object({
    subject: z.string().trim().min(3, "Add a short subject").max(150),
    priority: z.enum(TICKET_PRIORITIES.map((p) => p.value) as ["low", "normal", "high", "urgent"]),
    category: z.enum(TICKET_CATEGORIES),
    message: body,
  }),
  {},
  async (input, ctx) => {
    const [{ n } = { n: 0 }] = await db
      .select({ n: count() })
      .from(supportTickets)
      .where(and(eq(supportTickets.storeId, ctx.store.id), inArray(supportTickets.status, ["open", "pending"])));
    if (n >= 20) throw new ActionError("You have 20 open tickets. Please wait for a reply or close some before opening new ones.");
    const messages: TicketMessage[] = [{ from: "merchant", authorName: ctx.user.name, body: input.message, at: new Date().toISOString() }];
    const [row] = await db
      .insert(supportTickets)
      .values({ storeId: ctx.store.id, userId: ctx.user.id, subject: `[${input.category}] ${input.subject}`, priority: input.priority, status: "open", messages })
      .returning({ id: supportTickets.id });
    await audit(ctx, "support.ticket_create", row!.id, { priority: input.priority, category: input.category });
    revalidatePath("/support");
    return { id: row!.id };
  },
);

export const replyTicket = action(z.object({ id: z.uuid(), message: body }), {}, async (input, ctx) => {
  const t = await getTicket(ctx, input.id);
  const msg: TicketMessage = { from: "merchant", authorName: ctx.user.name, body: input.message, at: new Date().toISOString() };
  await db
    .update(supportTickets)
    .set({ messages: sql`${supportTickets.messages} || ${JSON.stringify([msg])}::jsonb`, status: "open" })
    .where(and(eq(supportTickets.id, t.id), eq(supportTickets.storeId, ctx.store.id)));
  revalidatePath("/support");
  revalidatePath(`/support/${t.id}`);
  return { ok: true };
});

export const closeTicket = action(z.object({ id: z.uuid() }), {}, async (input, ctx) => {
  const t = await getTicket(ctx, input.id);
  if (t.status === "closed") return { ok: true };
  await db.update(supportTickets).set({ status: "closed" }).where(and(eq(supportTickets.id, t.id), eq(supportTickets.storeId, ctx.store.id)));
  await audit(ctx, "support.ticket_close", t.id);
  revalidatePath("/support");
  revalidatePath(`/support/${t.id}`);
  return { ok: true };
});
