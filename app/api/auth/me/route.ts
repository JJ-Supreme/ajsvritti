import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth-server";
import { isAdminEmail } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getServerAuth();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user, isAdmin: isAdminEmail(user.email) });
}
