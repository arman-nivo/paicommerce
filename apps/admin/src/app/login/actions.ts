"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyPassword, verifyToken, SESSION_COOKIE } from "@pai/core/auth";
import { createSession, destroySession } from "@pai/core/session";
import { db, eq, sql, users } from "@pai/db";
import { cookies } from "next/headers";
import { audit } from "@/lib/audit";
import { isAdminRole } from "@/lib/roles";

export type LoginState = { error?: string; email?: string } | undefined;

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password").max(200),
  next: z.string().optional(),
});

// Naive in-memory throttle (per email) — the edge/WAF does the heavy lifting in production.
const attempts = new Map<string, { n: number; until: number }>();

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: form.get("email"), password: form.get("password"), next: form.get("next") ?? undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input", email: String(form.get("email") ?? "") };
  const { email, password, next } = parsed.data;

  const a = attempts.get(email);
  if (a && a.until > Date.now() && a.n >= 5) return { error: "Too many attempts. Try again in a few minutes.", email };

  const user = await db.query.users.findFirst({ where: eq(sql`lower(${users.email})`, email) });
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    const cur = a && a.until > Date.now() ? a : { n: 0, until: Date.now() + 10 * 60_000 };
    attempts.set(email, { n: cur.n + 1, until: cur.until });
    return { error: "Incorrect email or password.", email };
  }
  attempts.delete(email);
  if (user.disabled) return { error: "This account has been disabled.", email };
  if (!isAdminRole(user.role)) {
    await audit({ actorId: user.id, action: "admin.login_denied", target: user.email });
    return { error: "You're not authorized to access the PaiCommerce admin panel.", email };
  }
  await createSession(user);
  await audit({ actorId: user.id, action: "admin.login", target: user.email });
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  redirect(dest);
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

/** Ends an impersonation session and restores the original admin's session. */
export async function exitImpersonation() {
  const jar = await cookies();
  const payload = await verifyToken(jar.get(SESSION_COOKIE)?.value);
  if (payload?.kind === "user" && payload.imp) {
    const admin = await db.query.users.findFirst({ where: eq(users.id, payload.imp) });
    if (admin && !admin.disabled && isAdminRole(admin.role)) {
      await createSession(admin);
      await audit({ actorId: admin.id, action: "store.impersonation_ended", target: payload.sub, meta: { userId: payload.sub } });
      redirect("/");
    }
  }
  await destroySession();
  redirect("/login");
}
