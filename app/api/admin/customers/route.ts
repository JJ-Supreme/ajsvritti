import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { REVENUE_STATUSES, visibleUntilNow } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";

// Customers are derived only from THIS site's orders. The Supabase auth user
// pool is shared with other sites, so it is never listed here.
export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("user_id,guest_email,guest_phone,shipping_address,status,total,created_at")
    .eq("client_id", CLIENT_ID)
    .neq("status", "pending_payment")
    .lte("created_at", visibleUntilNow())
    .order("created_at", { ascending: false })
    .limit(20000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map = new Map<
    string,
    { name: string; email: string; phone: string; orders: number; spent: number; lastOrder: string }
  >();
  for (const o of data || []) {
    const key = (o.user_id as string) || (o.guest_email || "").toLowerCase() || `phone:${o.guest_phone}`;
    const c =
      map.get(key) ||
      {
        name: (o.shipping_address as any)?.name || "",
        email: o.guest_email || "",
        phone: o.guest_phone || (o.shipping_address as any)?.phone || "",
        orders: 0,
        spent: 0,
        lastOrder: o.created_at as string,
      };
    c.orders += 1;
    if ((REVENUE_STATUSES as string[]).includes(o.status as string)) c.spent += o.total || 0;
    if (!c.lastOrder || o.created_at > c.lastOrder) c.lastOrder = o.created_at as string;
    map.set(key, c);
  }
  const customers = Array.from(map.values()).sort((a, b) => b.spent - a.spent);
  return NextResponse.json({ customers, total: customers.length });
}
