import { NextResponse } from "next/server";
import { getRequestAuth } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { ORDER_SELECT, serializeOrder } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  const authUser = await getRequestAuth();
  if (!authUser) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to view your orders." },
      { status: 401 }
    );
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("client_id", CLIENT_ID)
      .or(`user_id.eq.${authUser.id},guest_email.eq.${authUser.email}`)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json((data || []).map(serializeOrder));
  } catch (error) {
    console.error("Error getting orders:", error);
    return NextResponse.json({ error: "Error getting orders." }, { status: 500 });
  }
}
