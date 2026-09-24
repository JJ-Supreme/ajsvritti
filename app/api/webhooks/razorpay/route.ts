import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { CLIENT_ID } from '@/config/client';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Razorpay calls this directly (server-to-server) so an order gets recorded
// even if the customer's browser dies right after paying. Register this URL
// in the Razorpay dashboard (Settings > Webhooks) for both Test and Live
// mode separately — each mode has its own secret even for the same URL.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Razorpay webhook secret not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    console.warn('Razorpay webhook: signature mismatch');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Acknowledge everything else — we only act on capture, but a non-2xx
  // makes Razorpay retry the event repeatedly.
  if (body.event !== 'payment.captured') {
    return NextResponse.json({ received: true });
  }

  const payment = body.payload?.payment?.entity;
  if (!payment) {
    return NextResponse.json({ received: true });
  }

  const razorpayOrderId: string | undefined = payment.order_id;
  const paymentId: string = payment.id;
  const notes = payment.notes || {};
  const orderNumber: string | undefined = notes.order_number;

  try {
    const supabase = getAdminClient();

    // Case 1: the client-side checkout flow already wrote this order —
    // just confirm it and fill in the payment id if missing.
    let existing = null;
    if (razorpayOrderId) {
      const { data } = await supabase
        .from('orders')
        .select('id, status, payment_id')
        .eq('client_id', CLIENT_ID)
        .eq('razorpay_order_id', razorpayOrderId)
        .maybeSingle();
      existing = data;
    }

    if (existing) {
      if (!existing.payment_id || existing.status !== 'confirmed') {
        await supabase
          .from('orders')
          .update({ payment_id: paymentId, status: 'confirmed' })
          .eq('id', existing.id);
      }
      return NextResponse.json({ received: true });
    }

    // Case 2: the browser never made it back to save the order (closed tab,
    // crashed, lost connection) — Razorpay has the money, we have no row.
    // Write a minimal reconciliation record rather than silently losing it.
    // It won't have line items (those only ever existed in the browser's
    // cart state), so flag it clearly for manual follow-up.
    await supabase.from('orders').insert({
      client_id: CLIENT_ID,
      order_number: orderNumber || `AJS${paymentId.slice(-6).toUpperCase()}`,
      guest_email: notes.email || payment.email || null,
      guest_phone: notes.phone || payment.contact || null,
      status: 'confirmed',
      notes: 'Recorded by webhook only — checkout flow did not complete, needs manual item reconciliation',
      subtotal: payment.amount ? payment.amount / 100 : 0,
      total: payment.amount ? payment.amount / 100 : 0,
      payment_method: 'razorpay',
      payment_id: paymentId,
      razorpay_order_id: razorpayOrderId || null,
      shipping_address: {},
      contact: { email: notes.email || payment.email, phone: notes.phone || payment.contact },
    });

    console.warn(`Razorpay webhook: reconciled order ${orderNumber || paymentId} with no matching checkout row`);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Razorpay webhook processing error:', err?.message);
    // Still 200 — we logged it, and returning an error just causes Razorpay
    // to retry the same event without changing the outcome.
    return NextResponse.json({ received: true });
  }
}
