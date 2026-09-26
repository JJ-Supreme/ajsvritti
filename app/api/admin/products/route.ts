import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { createProduct, productInputSchema } from "@/lib/admin/products";

export const dynamic = "force-dynamic";

const COLS =
  "id,sku,name,price,regular_price,images,group_name,sub_category,category_label,in_stock,is_featured,created_at";

export async function GET(req: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().replace(/[%,()]/g, " ");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(5, parseInt(url.searchParams.get("pageSize") || "20", 10) || 20));

  const supabase = createAdminClient();
  let query = supabase
    .from("products")
    .select(COLS, { count: "exact" })
    .eq("client_id", CLIENT_ID)
    .order("id", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,category_label.ilike.%${q}%`);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    products: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)),
  });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }
  try {
    const product = await createProduct(parsed.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Could not create product" }, { status: 500 });
  }
}
