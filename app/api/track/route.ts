import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { ORDER_SELECT, serializeOrder } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

const NOT_FOUND = { error: "We couldn't find an order matching those details." };

// Best-effort per-instance throttle so the endpoint can't be used to enumerate order numbers.
const hits = new Map<string, { n: number; reset: number }>();
function throttled(key: string) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + 10 * 60 * 1000 });
    return false;
  }
  h.n += 1;
  return h.n > 20;
}

const last10 = (v: unknown) => String(v || "").replace(/\D/g, "").slice(-10);

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (throttled(ip)) {
      return NextResponse.json({ error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });
    }

    const { orderNumber, phone } = await req.json();
    const number = String(orderNumber || "").trim().toUpperCase();
    const digits = last10(phone);
    if (!number || digits.length !== 10) {
      return NextResponse.json(
        { error: "Enter your order number and the 10-digit phone number used for the order." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("client_id", CLIENT_ID)
      .eq("order_number", number)
      .maybeSingle();

    const orderPhone = data && (last10(data.guest_phone) || last10(data.shipping_address?.phone));
    if (!data || !orderPhone || orderPhone !== digits) {
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    const o = serializeOrder(data);
    // Public lookup: no name, phone, street or tax detail — just what tracking needs.
    return NextResponse.json({
      orderNumber: o.orderNumber,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      shipTo: [o.shippingAddress.city, o.shippingAddress.state, o.shippingAddress.pincode].filter(Boolean).join(", "),
      orderItems: o.orderItems.map((i: any) => ({
        id: i.id,
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
        image: i.image,
      })),
    });
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
