import "server-only";

import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: string;
  imageUrl: string | null;
  createdAt: string;
};

function mapUser(user: any): AuthUser {
  return {
    id: user.id,
    email: user.email || "",
    username: user.user_metadata?.username || (user.email || "").split("@")[0],
    role: "user",
    imageUrl: user.user_metadata?.avatar_url || null,
    createdAt: user.created_at,
  };
}

// Reads the signed-in user from the Supabase session cookies (refreshing the
// access token if it has expired).
export async function getServerAuth(): Promise<AuthUser | null> {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? mapUser(user) : null;
}

export async function getRequestAuth(_req?: Request) {
  return getServerAuth();
}

// Supabase has no lookup-by-email in the admin API; a recovery link returns the
// user record for an existing email without sending anything. (Not "magiclink":
// that type silently creates a passwordless user for unknown emails.)
export async function findUserByEmail(email: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (error || !data?.user) return null;
  return { user: data.user, hashedToken: data.properties?.hashed_token as string | undefined };
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
