import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { findUserByEmail, generateOtp } from "@/lib/auth-server";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const found = await findUserByEmail(normalizedEmail);

    // Always return success to prevent email enumeration
    if (!found || found.user.email_confirmed_at) {
      return NextResponse.json({ message: "If your email is registered, a new link has been sent." });
    }

    const meta = found.user.user_metadata || {};
    const sentAt = meta.verification_otp_sent_at ? new Date(meta.verification_otp_sent_at).getTime() : 0;
    if (Date.now() - sentAt < 60 * 1000) {
      return NextResponse.json(
        { error: "Please wait a moment before requesting another link." },
        { status: 429 }
      );
    }

    const otp = generateOtp();
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(found.user.id, {
      user_metadata: {
        ...meta,
        verification_otp: otp,
        verification_otp_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        verification_otp_sent_at: new Date().toISOString(),
      },
    });

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
    await sendVerificationEmail(normalizedEmail, otp, origin);

    return NextResponse.json({ message: "Verification email sent." });
  } catch (error) {
    console.error("[AUTH_RESEND_VERIFICATION]", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
