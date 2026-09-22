"use server";

import { z } from "zod";
import { announcements, db, eq } from "@pai/db";
import { adminAction, fail } from "@/lib/action";
import { audit } from "@/lib/audit";

const schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(3).max(2000),
  level: z.enum(["info", "success", "warning", "critical"]),
  audience: z.enum(["merchants", "developers", "all"]),
  active: z.boolean(),
});

export const saveAnnouncement = adminAction("content.manage", schema, async ({ id, ...v }, admin) => {
  if (id) {
    const a = await db.query.announcements.findFirst({ where: eq(announcements.id, id) });
    if (!a) fail("Announcement not found");
    await db.update(announcements).set(v).where(eq(announcements.id, id));
    await audit({ actorId: admin.id, action: "announcement.updated", target: v.title, meta: { id, ...v } });
    return { message: "Announcement updated" };
  }
  const [row] = await db.insert(announcements).values(v).returning({ id: announcements.id });
  await audit({ actorId: admin.id, action: "announcement.created", target: v.title, meta: { id: row!.id, level: v.level, audience: v.audience, active: v.active } });
  return { message: v.active ? "Announcement published" : "Announcement saved as inactive" };
});

export const toggleAnnouncement = adminAction("content.manage", z.object({ id: z.string().uuid(), active: z.boolean() }), async ({ id, active }, admin) => {
  const a = await db.query.announcements.findFirst({ where: eq(announcements.id, id) });
  if (!a) fail("Announcement not found");
  await db.update(announcements).set({ active }).where(eq(announcements.id, id));
  await audit({ actorId: admin.id, action: "announcement.updated", target: a.title, meta: { id, active } });
  return { message: active ? "Announcement is live" : "Announcement hidden" };
});

export const deleteAnnouncement = adminAction("content.manage", z.object({ id: z.string().uuid() }), async ({ id }, admin) => {
  const a = await db.query.announcements.findFirst({ where: eq(announcements.id, id) });
  if (!a) fail("Announcement not found");
  await db.delete(announcements).where(eq(announcements.id, id));
  await audit({ actorId: admin.id, action: "announcement.deleted", target: a.title, meta: { id } });
  return { message: "Announcement deleted" };
});
