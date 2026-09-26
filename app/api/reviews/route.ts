import { NextResponse } from "next/server";
import * as z from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { getRequestAuth } from "@/lib/auth-server";
import { getAllProducts } from "@/lib/services/products";
import { CLIENT_ID } from "@/config/client";

export const dynamic = "force-dynamic";

const schema = z.object({
  productId: z.coerce.number().int().positive(),
  authorName: z.string().trim().min(2, "Please enter a display name").max(50),
  rating: z.coerce.number().int().min(1, "Please choose a rating").max(5),
  title: z.string().trim().max(100).optional(),
  body: z.string().trim().min(10, "Review must be at least 10 characters").max(2000),
});

// GET /api/reviews?productId=<id> -> { reviews, count, average, breakdown, mine }
export async function GET(req: Request) {
  const productId = Number(new URL(req.url).searchParams.get("productId"));
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, author_name, rating, title, body, verified, created_at")
    .eq("client_id", CLIENT_ID)
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[REVIEWS] read failed:", error.message);
    return NextResponse.json({ error: "Could not load reviews." }, { status: 500 });
  }

  const user = await getRequestAuth();
  const rows = data || [];
  const breakdown: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  rows.forEach((r) => {
    breakdown[String(r.rating)] = (breakdown[String(r.rating)] || 0) + 1;
  });
  const count = rows.length;
  const average = count ? rows.reduce((s, r) => s + r.rating, 0) / count : 0;

  return NextResponse.json({
    reviews: rows.slice(0, 50).map(({ user_id, ...r }) => r),
    count,
    average: Math.round(average * 10) / 10,
    breakdown,
    mine: !!user && rows.some((r) => r.user_id === user.id),
  });
}

export async function POST(req: Request) {
  const user = await getRequestAuth();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to write a review." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  const { productId, authorName, rating, title, body } = parsed.data;

  const all = await getAllProducts();
  if (!all.some((p) => p.id === String(productId))) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("client_id", CLIENT_ID)
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this product." }, { status: 409 });
  }

  // verified purchase = the user has a paid/confirmed order containing this product
  let verified = false;
  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .eq("client_id", CLIENT_ID)
    .or(`user_id.eq.${user.id},guest_email.eq.${user.email}`)
    .neq("status", "pending_payment")
    .neq("status", "cancelled");
  const orderIds = (orders || []).map((o) => o.id);
  if (orderIds.length) {
    const { data: items } = await supabase
      .from("order_items")
      .select("id")
      .eq("client_id", CLIENT_ID)
      .eq("product_id", productId)
      .in("order_id", orderIds)
      .limit(1);
    verified = !!items?.length;
  }

  const { error } = await supabase.from("reviews").insert({
    client_id: CLIENT_ID,
    product_id: productId,
    user_id: user.id,
    author_name: authorName,
    rating,
    title: title || null,
    body,
    verified,
  });
  if (error) {
    console.error("[REVIEWS] insert failed:", error.message);
    return NextResponse.json({ error: "Could not save your review." }, { status: 500 });
  }

  return NextResponse.json({ success: true, verified });
}
