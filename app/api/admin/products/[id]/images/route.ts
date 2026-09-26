import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { BUCKET, storagePublicUrl } from "@/lib/admin/products";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE = 8 * 1024 * 1024;
const MAX_IMAGES = 12;

// Appends uploaded images (multipart field "files") to the product. Each is
// converted to WebP q85, max 1200px on the long side, no crop.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("id,sku,images")
    .eq("client_id", CLIENT_ID)
    .eq("id", id)
    .maybeSingle();
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => typeof f !== "string");
  if (!files.length) return NextResponse.json({ error: "No files uploaded" }, { status: 400 });

  const images: string[] = [...((product.images as string[]) || [])];
  if (images.length + files.length > MAX_IMAGES) {
    return NextResponse.json({ error: `A product can have at most ${MAX_IMAGES} images` }, { status: 400 });
  }

  // First unused -<n> for this SKU.
  const used = new Set(
    images.map((u) => u.match(new RegExp(`${product.sku}-(\\d+)\\.webp`))?.[1]).filter(Boolean).map(Number)
  );
  let n = 0;
  const nextN = () => {
    do n++;
    while (used.has(n));
    used.add(n);
    return n;
  };

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: `${file.name} is not an image` }, { status: 400 });
    }
    if (file.size > MAX_FILE) {
      return NextResponse.json({ error: `${file.name} is larger than 8 MB` }, { status: 400 });
    }
    let webp: Buffer;
    try {
      webp = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate()
        .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      return NextResponse.json({ error: `${file.name} could not be read as an image` }, { status: 400 });
    }
    const path = `ajsvritti/products/${product.sku}-${nextN()}.webp`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, webp, { contentType: "image/webp", upsert: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    images.push(storagePublicUrl(path));
  }

  const { error } = await supabase
    .from("products")
    .update({ images, updated_at: new Date().toISOString() })
    .eq("client_id", CLIENT_ID)
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ images });
}
