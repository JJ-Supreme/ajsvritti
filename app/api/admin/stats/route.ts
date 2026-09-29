import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { REVENUE_STATUSES, visibleUntilNow } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;

  const supabase = createAdminClient();
  const [{ count: productCount }, { data: orders, error }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("client_id", CLIENT_ID),
    supabase
      .from("orders")
      .select("id,order_number,status,total,user_id,guest_email,guest_phone,shipping_address,created_at")
      .eq("client_id", CLIENT_ID)
      .lte("created_at", visibleUntilNow())
      .order("created_at", { ascending: false })
      .limit(20000),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const all = orders || [];
  const placed = all.filter((o) => o.status !== "pending_payment");
  const sales = all.filter((o) => (REVENUE_STATUSES as string[]).includes(o.status as string));
  const revenue = sales.reduce((s, o) => s + (o.total || 0), 0);

  const customers = new Set(
    placed.map((o) => (o.user_id as string) || (o.guest_email || "").toLowerCase() || `phone:${o.guest_phone}`)
  );

  // Last 30 days, one bucket per day (revenue orders only).
  const days: { date: string; revenue: number; orders: number }[] = [];
  const index = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    index.set(key, days.length);
    days.push({ date: key, revenue: 0, orders: 0 });
  }
  for (const o of sales) {
    const i = index.get(String(o.created_at).slice(0, 10));
    if (i !== undefined) {
      days[i].revenue += o.total || 0;
      days[i].orders += 1;
    }
  }

  return NextResponse.json({
    revenue,
    salesCount: sales.length,
    orderCount: placed.length,
    pendingPaymentCount: all.length - placed.length,
    productCount: productCount || 0,
    customerCount: customers.size,
    chart: days,
    recentOrders: all.slice(0, 8).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      total: o.total,
      customer: (o.shipping_address as any)?.name || o.guest_email || "Guest",
      created_at: o.created_at,
    })),
  });
}
