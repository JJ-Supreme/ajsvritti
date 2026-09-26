import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { findUserByEmail, generateOtp } from "@/lib/auth-server";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address (e.g. name@example.com)" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const admin = createAdminClient();
    const otp = generateOtp();
    const otpMeta = {
      username: normalizedEmail.split("@")[0],
      verification_otp: otp,
      verification_otp_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      verification_otp_sent_at: new Date().toISOString(),
    };
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      if (existing.user.email_confirmed_at) {
        return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
      }
      // Unverified account — refresh OTP and resend so the user can recover.
      // The password is replaced too: otherwise someone could pre-register a
      // victim's email with their own password and keep it after the real
      // owner verifies the address with the emailed code.
      await admin.auth.admin.updateUserById(existing.user.id, {
        password,
        user_metadata: { ...existing.user.user_metadata, ...otpMeta },
      });
      await sendVerificationEmail(normalizedEmail, otp, origin);
      return NextResponse.json({
        message: "A new verification code has been sent to your email.",
        requiresVerification: true,
      });
    }

    const { error } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: otpMeta,
    });
    if (error) {
      console.error("[AUTH_REGISTER]", error.message);
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }

    await sendVerificationEmail(normalizedEmail, otp, origin);

    return NextResponse.json({
      message: "Account created. Please check your email to verify your address.",
      requiresVerification: true,
    });
  } catch (error) {
    console.error("[AUTH_REGISTER]", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
