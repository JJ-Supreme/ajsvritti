import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      if (error && /not confirmed/i.test(error.message)) {
        return NextResponse.json(
          {
            error:
              "Please verify your email before signing in. Check your inbox for the verification link.",
            requiresVerification: true,
            email: normalizedEmail,
          },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || normalizedEmail.split("@")[0],
        role: "user",
      },
      message: "Signed in successfully",
    });
  } catch (error) {
    console.error("[AUTH_LOGIN]", error);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}
