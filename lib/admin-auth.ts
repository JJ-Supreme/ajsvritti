import "server-only";

import { NextResponse } from "next/server";
import { getServerAuth, type AuthUser } from "@/lib/auth-server";

// Admins are signed-in Supabase users whose email appears in the
// comma-separated ADMIN_EMAILS env var. Missing/empty env => nobody is admin.
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function getAdminUser(): Promise<AuthUser | null> {
  const user = await getServerAuth();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

type ApiGuard = { ok: true; user: AuthUser } | { ok: false; res: NextResponse };

// Every /api/admin/** handler calls this first.
export async function requireAdminApi(): Promise<ApiGuard> {
  const user = await getServerAuth();
  if (!user) {
    return { ok: false, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isAdminEmail(user.email)) {
    return { ok: false, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, user };
}
