import { NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { findUserByEmail } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const found = await findUserByEmail(normalizedEmail);
    if (!found) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const { user } = found;
    if (user.email_confirmed_at) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    const meta = user.user_metadata || {};
    if (meta.verification_otp_expiry && new Date(meta.verification_otp_expiry) < new Date()) {
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    if (!meta.verification_otp || meta.verification_otp !== String(otp).trim()) {
      return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });
    }

    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: {
        ...meta,
        verification_otp: null,
        verification_otp_expiry: null,
        verification_otp_sent_at: null,
      },
    });

    // Sign the freshly verified user in (no password needed here): exchange a
    // one-time admin-generated token for a session cookie.
    const fresh = await findUserByEmail(normalizedEmail);
    if (fresh?.hashedToken) {
      const supabase = createServerSupabaseClient();
      await supabase.auth.verifyOtp({ type: "recovery", token_hash: fresh.hashedToken });
    }

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("[AUTH_VERIFY_EMAIL]", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
