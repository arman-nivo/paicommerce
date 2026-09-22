"use server";

import { headers } from "next/headers";
import { z } from "zod";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string>; values?: Record<string, string> } | null;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s()-]*$/, "Phone can only contain digits, spaces and + - ( )")
    .optional()
    .or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  topic: z.enum(["sales", "support", "partnership", "enterprise", "demo"]).default("sales"),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(5000),
  // Honeypot — real users never fill it.
  website: z.string().max(0).optional().or(z.literal("")),
});

// Very small in-memory rate limit per IP (per server instance).
const hits = new Map<string, number[]>();
async function rateLimited(limit = 5, windowMs = 10 * 60_000): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > limit;
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries([...formData.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$"))) as Record<string, string>;
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error), values: raw };
  if (parsed.data.website) return { ok: true, message: "Thanks! We'll be in touch shortly." };
  if (await rateLimited()) return { ok: false, message: "Too many messages from your network. Please try again in a few minutes.", values: raw };

  const { name, email, phone, company, topic, message } = parsed.data;
  try {
    const { db, leads } = await import("@pai/db");
    await db.insert(leads).values({
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      company: company || null,
      message: `[${topic}] ${message}`,
      source: topic === "enterprise" ? "enterprise" : topic === "demo" ? "demo" : "contact",
    });
  } catch (e) {
    console.error("[web] contact lead insert failed", e);
    return { ok: false, message: "Something went wrong on our side. Please email hello@paicommerce.com instead.", values: raw };
  }
  return { ok: true, message: `Thanks ${name.split(" ")[0]}! Our ${topic} team will reply within one business day.` };
}

const newsletterSchema = z.object({ email: z.email("Enter a valid email").max(200) });

export async function subscribeNewsletter(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a valid email" };
  if (await rateLimited(10)) return { ok: false, message: "Too many requests. Try again later." };
  try {
    const { db, leads, and, eq } = await import("@pai/db");
    const email = parsed.data.email.toLowerCase();
    const existing = await db.select({ id: leads.id }).from(leads).where(and(eq(leads.email, email), eq(leads.source, "newsletter"))).limit(1);
    if (!existing.length) await db.insert(leads).values({ name: email.split("@")[0]!, email, source: "newsletter" });
  } catch (e) {
    console.error("[web] newsletter insert failed", e);
    return { ok: false, message: "Could not subscribe right now. Please try again." };
  }
  return { ok: true, message: "You're in! Watch your inbox for seller playbooks." };
}
