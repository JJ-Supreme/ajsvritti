import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { ORDER_STATUSES, visibleUntilNow } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;
  if (!UUID.test(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("client_id", CLIENT_ID)
    .eq("id", params.id)
    .lte("created_at", visibleUntilNow())
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order: data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;
  if (!UUID.test(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const parsed = z.object({ status: z.enum(ORDER_STATUSES) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: `Status must be one of: ${ORDER_STATUSES.join(", ")}` }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("client_id", CLIENT_ID)
    .eq("id", params.id)
    .lte("created_at", visibleUntilNow()) // scheduled (future) orders are not visible yet
    .select("id,status")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order: data });
}
