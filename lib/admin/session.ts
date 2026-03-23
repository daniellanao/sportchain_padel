import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";

function getSessionSecret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET?.trim();
  return s || null;
}

function signExpiry(expSeconds: number, secret: string): string {
  const payload = String(expSeconds);
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/** Build cookie value: `{unixExpiry}.{hexSig}` */
export function createSessionToken(expiresAt: Date, secret: string): string {
  const expSeconds = Math.floor(expiresAt.getTime() / 1000);
  const sig = signExpiry(expSeconds, secret);
  return `${expSeconds}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const secret = getSessionSecret();
  if (!secret) return false;

  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expSeconds = Number(expStr);
  if (!Number.isFinite(expSeconds)) return false;
  if (expSeconds * 1000 <= Date.now()) return false;

  const expected = signExpiry(expSeconds, secret);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD?.trim() && getSessionSecret(),
  );
}

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export function getAdminSessionCookieOptions(overrides?: { maxAge?: number }) {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/admin",
    maxAge: overrides?.maxAge ?? SESSION_MAX_AGE_SEC,
  };
}
