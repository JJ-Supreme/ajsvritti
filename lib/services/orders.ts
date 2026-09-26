import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { taxForStoredOrder, type TaxBreakdown } from "@/lib/gst";

export function generateOrderNumber() {
  const t = Date.now().toString().slice(-7);
  const r = Math.floor(100 + Math.random() * 900);
  return `AJS${t}${r}`;
}

export type NewOrderItem = {
  product_id: number | null;
  product_name: string;
  product_image?: string | null;
  quantity: number;
  unit_price: number;
  size?: string | null;
  color?: string | null;
};

export type NewOrder = {
  order_number: string;
  user_id?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  status: string;
  subtotal: number;
  total: number;
  payment_method: string;
  razorpay_order_id?: string | null;
  shipping_address: Record<string, any>;
  notes?: string | null;
  tax_breakdown?: TaxBreakdown | null;
};

export async function createOrder(order: NewOrder, items: NewOrderItem[]) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      client_id: CLIENT_ID,
      order_number: order.order_number,
      user_id: order.user_id || null,
      guest_email: order.guest_email || null,
      guest_phone: order.guest_phone || null,
      status: order.status,
      subtotal: Math.round(order.subtotal),
      discount: 0,
      shipping_fee: 0,
      cod_fee: 0,
      total: Math.round(order.total),
      payment_method: order.payment_method,
      razorpay_order_id: order.razorpay_order_id || null,
      shipping_address: order.shipping_address,
      contact: { email: order.guest_email || "", phone: order.guest_phone || "" },
      notes: order.notes || null,
      tax_breakdown: order.tax_breakdown || null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Failed inserting order:", error);
    return { success: false as const, error: error?.message || "Database error" };
  }

  if (items.length) {
    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((i) => ({
        client_id: CLIENT_ID,
        order_id: data.id,
        product_id: i.product_id,
        product_name: i.product_name,
        product_image: i.product_image || null,
        quantity: i.quantity,
        unit_price: Math.round(i.unit_price),
        size: i.size || null,
        color: i.color || null,
      }))
    );
    if (itemsError) {
      console.error("Failed inserting order_items:", itemsError);
      await supabase.from("orders").delete().eq("id", data.id);
      return { success: false as const, error: itemsError.message };
    }
  }

  return { success: true as const, order: data };
}


export const ORDER_SELECT = "*, order_items(*)";

const PAID_STATUSES = ["confirmed", "processing", "shipped", "delivered"];

export function formatAddress(a: any): string {
  return [a?.street, a?.post_office, a?.city, a?.state, a?.pincode].filter(Boolean).join(", ");
}

/** One shape for every consumer: confirmation page, history, tracking, admin-free APIs. */
export function serializeOrder(o: any) {
  const s = o.shipping_address || {};
  const status = String(o.status || "pending_payment").toLowerCase();
  const isCod = o.payment_method === "cod";
  const isPaid = isCod ? status === "delivered" : PAID_STATUSES.includes(status);
  const items = (o.order_items || []).map((it: any) => ({
    id: it.id,
    productName: it.product_name,
    productId: String(it.product_id ?? ""),
    price: it.unit_price,
    quantity: it.quantity,
    size: it.size,
    color: it.color,
    image: it.product_image || null,
  }));
  const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  return {
    id: o.id,
    orderNumber: o.order_number,
    status,
    paymentMethod: o.payment_method,
    isPaid,
    paymentStatus: isPaid ? "PAID" : status === "cancelled" ? "CANCELLED" : "PENDING",
    customerName: s.name || "",
    phone: o.guest_phone || s.phone || "",
    address: formatAddress(s),
    shippingAddress: {
      name: s.name || "",
      street: s.street || "",
      city: s.city || "",
      state: s.state || "",
      pincode: s.pincode || "",
      postOffice: s.post_office || "",
    },
    totalAmount: o.total,
    subtotal: items.length ? subtotal : o.subtotal,
    // orders with no (or an old-shape) breakdown are recomputed with base == total
    taxBreakdown: taxForStoredOrder(o.tax_breakdown, o.total, s.state),
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    orderItems: items,
  };
}

export type SerializedOrder = ReturnType<typeof serializeOrder>;
