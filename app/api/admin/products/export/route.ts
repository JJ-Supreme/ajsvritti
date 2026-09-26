import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { toCsv } from "@/lib/admin/csv";

export const dynamic = "force-dynamic";

const CSV_HEADERS = [
  "sku",
  "name",
  "description",
  "price",
  "regular_price",
  "group_name",
  "sub_category",
  "category_label",
  "in_stock",
  "is_featured",
  "specs_json",
  "image_urls",
];

export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("sku,name,description,price,regular_price,group_name,sub_category,category_label,in_stock,is_featured,set_contents,images")
    .eq("client_id", CLIENT_ID)
    .order("id", { ascending: true })
    .limit(10000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = [
    CSV_HEADERS,
    ...(data || []).map((p) => [
      p.sku,
      p.name,
      p.description,
      p.price,
      p.regular_price,
      p.group_name,
      p.sub_category,
      p.category_label,
      p.in_stock,
      p.is_featured,
      p.set_contents,
      (p.images || []).join("|"),
    ]),
  ];
  return new NextResponse("﻿" + toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ajsvritti-products-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
