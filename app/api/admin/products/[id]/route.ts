import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { BUCKET, buildRow, jsonToSpecs, productInputSchema, storagePathFromUrl } from "@/lib/admin/products";

export const dynamic = "force-dynamic";

function parseId(raw: string) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("client_id", CLIENT_ID)
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product: { ...data, specs: jsonToSpecs(data.set_contents) } });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

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

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("products")
    .select("images")
    .eq("client_id", CLIENT_ID)
    .eq("id", id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const update: Record<string, unknown> = { ...buildRow(parsed.data), updated_at: new Date().toISOString() };
  if (parsed.data.images) update.images = parsed.data.images;

  const { data, error } = await supabase
    .from("products")
    .update(update)
    .eq("client_id", CLIENT_ID)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Remove storage files for images the admin dropped from the product.
  if (parsed.data.images) {
    const kept = new Set(parsed.data.images);
    const removed = ((existing.images as string[]) || [])
      .filter((u) => !kept.has(u))
      .map(storagePathFromUrl)
      .filter((p): p is string => !!p && p.startsWith("ajsvritti/"));
    if (removed.length) await supabase.storage.from(BUCKET).remove(removed);
  }
  return NextResponse.json({ product: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("client_id", CLIENT_ID)
    .eq("id", id)
    .select("images")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const paths = ((data.images as string[]) || [])
    .map(storagePathFromUrl)
    .filter((p): p is string => !!p && p.startsWith("ajsvritti/"));
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  return NextResponse.json({ ok: true });
}
