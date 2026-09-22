/**
 * Password-reset tokens (stateless). The token embeds a fingerprint of the current password hash,
 * so it becomes invalid as soon as the password changes (single-use in practice).
 */
import { createHash } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET must be set (>=16 chars)");
  return new TextEncoder().encode(s);
}

const fingerprint = (hash: string | null | undefined) => createHash("sha256").update(hash ?? "none").digest("hex").slice(0, 16);

export async function signResetToken(user: { id: string; passwordHash: string | null }, ttlMinutes = 60): Promise<string> {
  return new SignJWT({ kind: "reset", fp: fingerprint(user.passwordHash) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${ttlMinutes}m`)
    .sign(secret());
}

/** Returns the user id when the token is valid for the given current password hash. */
export async function verifyResetToken(token: string, currentHash: (userId: string) => Promise<string | null | undefined>): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== "reset" || !payload.sub) return null;
    const h = await currentHash(payload.sub);
    if (h === undefined) return null;
    return payload.fp === fingerprint(h) ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Decode the subject without verifying the fingerprint (to look the user up first). */
export async function peekResetToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.kind === "reset" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}
