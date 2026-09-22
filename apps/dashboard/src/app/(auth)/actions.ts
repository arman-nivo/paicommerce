"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { DASHBOARD_URL, isValidBdPhone, normalizePhone } from "@pai/core";
import { hashPassword, verifyPassword } from "@pai/core/auth";
import { peekResetToken, signResetToken, verifyResetToken } from "@pai/core/reset";
import { createSession, getUserStores } from "@pai/core/session";
import { db, eq, sql, users } from "@pai/db";

export type AuthState = { error?: string; fieldErrors?: Record<string, string>; ok?: boolean; message?: string; values?: Record<string, string> } | undefined;

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);

function safeNext(next: FormDataEntryValue | null): string | null {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : null;
}

function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "_");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}

// Naive in-memory rate limit (per process) to slow down credential stuffing.
const attempts = new Map<string, { n: number; at: number }>();
function limited(key: string, max = 8, windowMs = 10 * 60_000) {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || now - a.at > windowMs) {
    attempts.set(key, { n: 1, at: now });
    return false;
  }
  a.n++;
  return a.n > max;
}

export async function loginAction(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password").max(200) }).safeParse({ email: form.get("email"), password: form.get("password") });
  const values = { email: String(form.get("email") ?? "") };
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(`login:${ip}:${parsed.data.email}`)) return { error: "Too many attempts. Please wait a few minutes and try again.", values };

  const user = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${parsed.data.email}` });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) return { error: "Incorrect email or password.", values };
  if (user.disabled) return { error: "This account has been disabled. Please contact support.", values };
  await createSession(user);
  const next = safeNext(form.get("next"));
  const stores = await getUserStores(user.id);
  redirect(next ?? (stores.length ? "/" : "/onboarding"));
}

export async function signupAction(_: AuthState, form: FormData): Promise<AuthState> {
  const raw = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), phone: String(form.get("phone") ?? ""), password: String(form.get("password") ?? "") };
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Enter your full name").max(80),
      email: emailSchema,
      phone: z
        .string()
        .trim()
        .max(20)
        .refine((p) => !p || isValidBdPhone(p) || /^\+?\d{7,15}$/.test(p.replace(/[\s-]/g, "")), "Enter a valid mobile number"),
      password: z.string().min(8, "Use at least 8 characters").max(200),
    })
    .safeParse(raw);
  const values = { name: raw.name, email: raw.email, phone: raw.phone };
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  const { name, email, phone, password } = parsed.data;
  const exists = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${email}`, columns: { id: true } });
  if (exists) return { fieldErrors: { email: "An account with this email already exists. Try logging in." }, values };
  const [user] = await db
    .insert(users)
    .values({ name, email, phone: phone ? normalizePhone(phone) : null, passwordHash: await hashPassword(password) })
    .returning();
  await createSession(user!);
  redirect("/onboarding");
}

export async function forgotPasswordAction(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = emailSchema.safeParse(form.get("email"));
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0]!.message } };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(`forgot:${ip}`, 5)) return { error: "Too many requests. Please try again later." };
  const user = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${parsed.data}` });
  if (user && !user.disabled) {
    const token = await signResetToken(user);
    const link = `${DASHBOARD_URL}/reset-password?token=${encodeURIComponent(token)}`;
    // Email delivery stub — wire to your email provider (SES/Resend/SMTP) in production.
    console.log(`\n[email] To: ${user.email}\n[email] Subject: Reset your PaiCommerce password\n[email] Hi ${user.name}, reset your password within 60 minutes:\n[email] ${link}\n`);
  }
  // Always respond the same way so emails can't be enumerated.
  return { ok: true, message: `If an account exists for ${parsed.data}, we've sent a reset link. It expires in 60 minutes.` };
}

export async function resetPasswordAction(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = z
    .object({ token: z.string().min(10), password: z.string().min(8, "Use at least 8 characters").max(200), confirm: z.string() })
    .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] })
    .safeParse({ token: form.get("token"), password: form.get("password"), confirm: form.get("confirm") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const uid = await verifyResetToken(parsed.data.token, async (id) => (await db.query.users.findFirst({ where: eq(users.id, id), columns: { passwordHash: true } }))?.passwordHash);
  if (!uid) return { error: "This reset link is invalid or has expired. Request a new one." };
  await db.update(users).set({ passwordHash: await hashPassword(parsed.data.password) }).where(eq(users.id, uid));
  const user = await db.query.users.findFirst({ where: eq(users.id, uid) });
  if (user) await createSession(user);
  redirect("/");
}

export async function isResetTokenValid(token: string): Promise<boolean> {
  const uid = await peekResetToken(token);
  if (!uid) return false;
  const ok = await verifyResetToken(token, async (id) => (await db.query.users.findFirst({ where: eq(users.id, id), columns: { passwordHash: true } }))?.passwordHash);
  return !!ok;
}
