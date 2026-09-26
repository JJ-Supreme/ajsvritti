import { NextResponse } from "next/server";
import * as z from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
  subject: z.string().trim().min(3, "Please enter a subject").max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_submissions").insert({
    client_id: CLIENT_ID,
    ...parsed.data,
    resolved: false,
  });

  if (error) {
    console.error("[CONTACT] insert failed:", error.message);
    return NextResponse.json(
      { error: "We couldn't send your message right now. Please try again or email us directly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
