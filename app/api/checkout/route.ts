import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getRequestAuth } from "@/lib/auth-server";
import { calculateOrderGst } from "@/lib/gst";
import { getBulkUnitPrice } from "@/lib/utils/pricing";
import { getAllProducts } from "@/lib/services/products";
import { createOrder, generateOrderNumber } from "@/lib/services/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const authUser = await getRequestAuth();
    const body = await req.json();
    const {
      items,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      address,
      pincode,
      postOffice,
      notes,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart items are required" }, { status: 400 });
    }
    if (paymentMethod !== "cod" && paymentMethod !== "razorpay") {
      return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
    }
    if (!customerName || !customerPhone || !address) {
      return NextResponse.json({ error: "Customer details are required" }, { status: 400 });
    }

    // Prices come from the database, never from the client's cart payload.
    const catalog = new Map((await getAllProducts()).map((p) => [p.id, p]));
    const lines: {
      product: NonNullable<ReturnType<typeof catalog.get>>;
      quantity: number;
      size?: string;
      color?: string;
    }[] = [];
    for (const item of items) {
      const product = catalog.get(String(item.id));
      if (!product) {
        return NextResponse.json({ error: "A product in your cart is no longer available" }, { status: 400 });
      }
      lines.push({
        product,
        quantity: Math.max(1, Math.floor(item.quantity || 1)),
        size: item.size || undefined,
        color: item.selectedColor || undefined,
      });
    }

    const { total: totalAmount, subtotal } = calculateOrderGst(
      lines.map((l) => ({
        price: getBulkUnitPrice(l.product.price, l.quantity),
        quantity: l.quantity,
        topLevelCategory: l.product.topLevelCategory,
      }))
    );

    const orderItems = lines.map((l) => ({
      product_id: Number(l.product.id),
      product_name: l.product.title,
      product_image: l.product.image,
      quantity: l.quantity,
      unit_price: getBulkUnitPrice(l.product.price, l.quantity),
      size: l.size,
      color: l.color,
    }));

    const shippingAddress = {
      name: customerName,
      phone: customerPhone,
      street: address,
      pincode: pincode || postOffice?.pincode || "",
      city: postOffice?.district || "",
      state: postOffice?.state || "",
      post_office: postOffice?.name || "",
    };
    const addressText = [address, shippingAddress.post_office, shippingAddress.city, shippingAddress.state, shippingAddress.pincode]
      .filter(Boolean)
      .join(", ");

    const orderNumber = generateOrderNumber();
    const base = {
      order_number: orderNumber,
      user_id: authUser?.id || null,
      guest_email: customerEmail || authUser?.email || null,
      guest_phone: customerPhone,
      subtotal,
      total: totalAmount,
      shipping_address: shippingAddress,
      notes: notes || null,
    };

    if (paymentMethod === "cod") {
      const result = await createOrder({ ...base, status: "confirmed", payment_method: "cod" }, orderItems);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      if (base.guest_email) {
        sendOrderConfirmationEmail({
          to: base.guest_email,
          orderNumber,
          items: orderItems,
          total: totalAmount,
          paymentMethod: "cod",
          address: addressText,
        }).catch((err) => console.error("Order confirmation email failed:", err));
      }
      return NextResponse.json({
        success: true,
        orderId: result.order.id,
        message: "Order placed successfully",
        metadata: { amount: totalAmount },
      });
    }

    // Razorpay online payment
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${orderNumber}`,
      notes: { order_number: orderNumber, email: base.guest_email || "", phone: customerPhone },
    });

    // pending_payment until the signature check (or webhook) confirms it.
    const result = await createOrder(
      { ...base, status: "pending_payment", payment_method: "razorpay", razorpay_order_id: rzpOrder.id },
      orderItems
    );
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      metadata: {
        amount: totalAmount,
        razorpayOrderId: rzpOrder.id,
        razorpayAmount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        orderNumber,
      },
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 });
  }
}
