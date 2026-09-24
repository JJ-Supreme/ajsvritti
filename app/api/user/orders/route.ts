import { NextResponse } from "next/server";
import { getRequestAuth } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, "PENDING" | "DELIVERED" | "CANCELLED" | "ON-HOLD"> = {
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  canceled: "CANCELLED",
  "on-hold": "ON-HOLD",
};

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
      .select("*, order_items(*)")
      .eq("client_id", CLIENT_ID)
      .or(`user_id.eq.${authUser.id},guest_email.eq.${authUser.email}`)
      .neq("status", "pending_payment")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const orders = (data || []).map((o: any) => {
      const s = o.shipping_address || {};
      const isPaid = o.payment_method !== "cod" && o.status === "confirmed";
      return {
        id: o.id,
        isPaid,
        paymentMethod: o.payment_method,
        paymentStatus: isPaid ? "PAID" : "PENDING",
        customerName: s.name || "",
        totalAmount: o.total,
        phone: o.guest_phone || s.phone || "",
        address: [s.street, s.post_office, s.city, s.state, s.pincode].filter(Boolean).join(", "),
        orderStatus: STATUS_MAP[String(o.status).toLowerCase()] || "PENDING",
        orderItems: (o.order_items || []).map((it: any) => ({
          id: it.id,
          orderId: it.order_id,
          productName: it.product_name,
          productId: String(it.product_id ?? ""),
          price: it.unit_price,
          quantity: it.quantity,
          size: it.size,
          color: it.color,
          product: {
            id: String(it.product_id ?? ""),
            name: it.product_name,
            imageIds: it.product_image ? [it.product_image] : [],
          },
        })),
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      };
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error getting orders:", error);
    return NextResponse.json({ error: "Error getting orders." }, { status: 500 });
  }
}
