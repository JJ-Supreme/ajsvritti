import { NextResponse } from "next/server";
import { getRequestAuth } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { ORDER_SELECT, serializeOrder } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

// Returns one order, only to the signed-in user who owns it.
export async function GET(_req: Request, { params }: { params: { orderNumber: string } }) {
  const authUser = await getRequestAuth();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to view this order" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("client_id", CLIENT_ID)
      .eq("order_number", params.orderNumber.trim().toUpperCase())
      .maybeSingle();
    if (error) throw error;

    const owns =
      data &&
      (data.user_id === authUser.id ||
        (data.guest_email && data.guest_email.toLowerCase() === authUser.email.toLowerCase()));
    if (!data || !owns) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(serializeOrder(data));
  } catch (error) {
    console.error("Error getting order:", error);
    return NextResponse.json({ error: "Error getting order" }, { status: 500 });
  }
}
