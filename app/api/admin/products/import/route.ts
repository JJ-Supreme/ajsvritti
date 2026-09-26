import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { parseCsv } from "@/lib/admin/csv";
import { buildRow, createProduct, jsonToSpecs, productInputSchema } from "@/lib/admin/products";

export const dynamic = "force-dynamic";

const MAX_ROWS = 2000;
const truthy = (v: string | undefined, dflt: boolean) => {
  if (v === undefined || v.trim() === "") return dflt;
  return /^(true|1|yes|y)$/i.test(v.trim());
};

// Body: { csv: "<file text>" }. Rows are created/updated by SKU. Rows that fail
// validation (incl. price > MRP) are skipped and reported; valid rows still apply.
export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;

  let csv: string;
  try {
    csv = String((await req.json()).csv || "");
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const table = parseCsv(csv);
  if (table.length < 2) return NextResponse.json({ error: "CSV has no data rows" }, { status: 400 });
  if (table.length - 1 > MAX_ROWS) {
    return NextResponse.json({ error: `Too many rows (max ${MAX_ROWS})` }, { status: 400 });
  }

  const header = table[0].map((h) => h.trim().toLowerCase());
  for (const required of ["name", "price", "regular_price", "group_name", "sub_category", "category_label"]) {
    if (!header.includes(required)) {
      return NextResponse.json({ error: `Missing required column: ${required}` }, { status: 400 });
    }
  }
  const col = (row: string[], name: string) => {
    const i = header.indexOf(name);
    return i === -1 ? undefined : row[i];
  };

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("products")
    .select("id,sku")
    .eq("client_id", CLIENT_ID)
    .limit(10000);
  const bySku = new Map((existing || []).map((r) => [String(r.sku), r.id as number]));

  let created = 0;
  let updated = 0;
  const errors: { row: number; sku: string; error: string }[] = [];

  for (let r = 1; r < table.length; r++) {
    const row = table[r];
    const sku = (col(row, "sku") || "").trim();
    const specsRaw = (col(row, "specs_json") || "").trim();
    const imagesRaw = (col(row, "image_urls") || "").trim();
    const input = {
      name: col(row, "name") || "",
      description: col(row, "description") || "",
      price: col(row, "price"),
      regular_price: col(row, "regular_price"),
      group_name: col(row, "group_name") || "",
      sub_category: col(row, "sub_category") || "",
      category_label: col(row, "category_label") || "",
      specs: jsonToSpecs(specsRaw || null),
      in_stock: truthy(col(row, "in_stock"), true),
      is_featured: truthy(col(row, "is_featured"), false),
      images: imagesRaw ? imagesRaw.split("|").map((s) => s.trim()).filter(Boolean) : undefined,
    };
    const parsed = productInputSchema.safeParse(input);
    if (!parsed.success) {
      errors.push({ row: r + 1, sku, error: parsed.error.issues.map((i) => i.message).join("; ") });
      continue;
    }
    try {
      const id = sku ? bySku.get(sku) : undefined;
      if (id) {
        const update: Record<string, unknown> = { ...buildRow(parsed.data), updated_at: new Date().toISOString() };
        if (parsed.data.images) update.images = parsed.data.images;
        const { error } = await supabase.from("products").update(update).eq("client_id", CLIENT_ID).eq("id", id);
        if (error) throw new Error(error.message);
        updated++;
      } else {
        const p = await createProduct(parsed.data, sku || undefined);
        if (p?.sku) bySku.set(String(p.sku), p.id);
        created++;
      }
    } catch (e: any) {
      errors.push({ row: r + 1, sku, error: e?.message || "Failed" });
    }
  }
  return NextResponse.json({ created, updated, failed: errors.length, errors: errors.slice(0, 50) });
}
