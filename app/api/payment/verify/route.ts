import { NextResponse } from "next/server";
import { taxForStoredOrder } from "@/lib/gst";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("client_id", CLIENT_ID)
      .eq("id", orderId)
      .maybeSingle();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Status lookup only (used by the order-confirmation page)
    if (!razorpaySignature) {
      const paid = order.status === "confirmed" || order.payment_method === "cod";
      return NextResponse.json({ paymentStatus: paid ? "success" : "pending" });
    }

    if (!order.razorpay_order_id || order.razorpay_order_id !== razorpayOrderId) {
      return NextResponse.json({ success: false, error: "Order mismatch" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    if (expected !== razorpaySignature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    await supabase
      .from("orders")
      .update({ status: "confirmed", payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature })
      .eq("id", orderId);

    if (order.guest_email && order.status !== "confirmed") {
      const s = order.shipping_address || {};
      sendOrderConfirmationEmail({
        to: order.guest_email,
        orderNumber: order.order_number,
        items: order.order_items || [],
        total: order.total,
        paymentMethod: "razorpay",
        address: [s.street, s.post_office, s.city, s.state, s.pincode].filter(Boolean).join(", "),
        tax: taxForStoredOrder(order.tax_breakdown, order.total, order.shipping_address?.state),
      }).catch((err) => console.error("Order confirmation email failed:", err));
    }

    return NextResponse.json({ success: true, paymentStatus: "success" });
  } catch (error: any) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Server error" }, { status: 500 });
  }
}
