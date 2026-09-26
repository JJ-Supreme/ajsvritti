import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("group_name,sub_category,category_label")
    .eq("client_id", CLIENT_ID)
    .limit(5000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const seen = new Map<string, { group_name: string; sub_category: string; category_label: string }>();
  for (const r of data || []) {
    const key = `${r.group_name}|${r.sub_category}|${r.category_label}`;
    if (!seen.has(key)) seen.set(key, r as any);
  }
  const list = Array.from(seen.values()).sort(
    (a, b) =>
      a.group_name.localeCompare(b.group_name) ||
      a.sub_category.localeCompare(b.sub_category) ||
      a.category_label.localeCompare(b.category_label)
  );
  return NextResponse.json(list);
}
