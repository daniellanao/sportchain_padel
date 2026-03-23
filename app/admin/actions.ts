"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAdminPassword } from "@/lib/admin/password";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  getAdminSessionCookieOptions,
  isAdminConfigured,
  verifySessionToken,
} from "@/lib/admin/session";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export async function adminLoginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!adminPassword || !secret || !verifyAdminPassword(password, adminPassword)) {
    redirect("/admin/login?error=1");
  }

  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);
  const token = createSessionToken(expiresAt, secret);
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, "", getAdminSessionCookieOptions({ maxAge: 0 }));
  redirect("/admin/login");
}

export async function isAdminSessionValid(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const store = await cookies();
  const raw = store.get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(raw);
}
