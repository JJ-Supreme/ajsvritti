import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getRequestAuth } from "@/lib/auth-server";
import { getAllProducts } from "@/lib/services/products";
import { CLIENT_ID } from "@/config/client";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ error: "Please sign in to use your wishlist." }, { status: 401 });

async function productExists(productId: number) {
  const all = await getAllProducts();
  return all.some((p) => p.id === String(productId));
}

// GET -> { ids: string[] }; GET ?full=1 -> { ids, products } (products in storefront shape)
export async function GET(req: Request) {
  const user = await getRequestAuth();
  if (!user) return unauthorized();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("wishlist")
    .select("product_id, created_at")
    .eq("client_id", CLIENT_ID)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[WISHLIST] read failed:", error.message);
    return NextResponse.json({ error: "Could not load your wishlist." }, { status: 500 });
  }

  const ids = (data || []).map((r) => String(r.product_id));
  if (new URL(req.url).searchParams.get("full") !== "1") {
    return NextResponse.json({ ids });
  }

  const all = await getAllProducts();
  const byId = new Map(all.map((p) => [p.id, p]));
  const products = ids.map((id) => byId.get(id)).filter(Boolean);
  return NextResponse.json({ ids, products });
}

export async function POST(req: Request) {
  const user = await getRequestAuth();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const productId = Number(body?.productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }
  if (!(await productExists(productId))) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("wishlist")
    .select("id")
    .eq("client_id", CLIENT_ID)
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();
  if (existing) return NextResponse.json({ success: true });

  const { error } = await supabase
    .from("wishlist")
    .insert({ client_id: CLIENT_ID, user_id: user.id, product_id: productId });
  if (error) {
    console.error("[WISHLIST] insert failed:", error.message);
    return NextResponse.json({ error: "Could not save to your wishlist." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const user = await getRequestAuth();
  if (!user) return unauthorized();

  const productId = Number(new URL(req.url).searchParams.get("productId"));
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("client_id", CLIENT_ID)
    .eq("user_id", user.id)
    .eq("product_id", productId);
  if (error) {
    console.error("[WISHLIST] delete failed:", error.message);
    return NextResponse.json({ error: "Could not update your wishlist." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
