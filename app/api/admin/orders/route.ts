import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { ORDER_STATUSES, visibleUntilNow } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().replace(/[%,()]/g, " ");
  const status = url.searchParams.get("status") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const pageSize = 20;

  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select(
      "id,order_number,status,total,payment_method,guest_email,guest_phone,shipping_address,created_at,order_items(quantity)",
      { count: "exact" }
    )
    .eq("client_id", CLIENT_ID)
    .lte("created_at", visibleUntilNow())
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  if (q) query = query.or(`order_number.ilike.%${q}%,guest_email.ilike.%${q}%,guest_phone.ilike.%${q}%`);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    orders: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)),
  });
}
