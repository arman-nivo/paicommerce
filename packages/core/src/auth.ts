import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "pai_session";
export const ACTIVE_STORE_COOKIE = "pai_store";
export const SESSION_TTL_DAYS = 30;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET must be set (>=16 chars)");
  return new TextEncoder().encode(s);
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(pw, hash);
}

export type SessionPayload = {
  sub: string; // user id (or customer id for customer tokens)
  role?: string;
  /** For admin impersonation: id of the admin acting as this user. */
  imp?: string;
  /** "user" for platform users, "customer" for storefront customers. */
  kind: "user" | "customer";
  /** Store scope for customer tokens. */
  sid?: string;
};

export async function signToken(payload: SessionPayload, ttlDays = SESSION_TTL_DAYS): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlDays}d`)
    .sign(secret());
}

export async function verifyToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function cookieOptions(maxAgeDays = SESSION_TTL_DAYS) {
  const domain = process.env.AUTH_COOKIE_DOMAIN || undefined;
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeDays * 86400,
    ...(domain ? { domain } : {}),
  };
}

/* ─── Theme customizer preview tokens ─── */

export type PreviewPayload = { sid: string; stid: string };

/** Short-lived token that lets the storefront render a store theme's draft config. */
export async function signPreviewToken(p: PreviewPayload, ttlHours = 12): Promise<string> {
  return new SignJWT({ ...p, kind: "preview" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlHours}h`)
    .sign(secret());
}

export async function verifyPreviewToken(token: string | undefined | null): Promise<PreviewPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== "preview") return null;
    return { sid: String(payload.sid), stid: String(payload.stid) };
  } catch {
    return null;
  }
}
