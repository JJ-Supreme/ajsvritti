import "server-only";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID, CLIENT_SLUG } from "@/config/client";

export const BUCKET = "product-images";

export const slugify = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const productInputSchema = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters").max(300),
    description: z.string().trim().max(20000).default(""),
    price: z.coerce.number().int("Price must be a whole number").min(1, "Price must be at least 1"),
    regular_price: z.coerce.number().int("MRP must be a whole number").min(1, "MRP must be at least 1"),
    group_name: z.string().trim().min(1, "Top-level category is required").max(120),
    sub_category: z.string().trim().min(1, "Parent category is required").max(120),
    category_label: z.string().trim().min(1, "Category is required").max(120),
    specs: z
      .array(z.object({ key: z.string().trim(), value: z.string().trim() }))
      .default([]),
    in_stock: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    images: z.array(z.string().url()).max(12).optional(),
  })
  .refine((v) => v.price <= v.regular_price, {
    message: "Price cannot be higher than MRP",
    path: ["price"],
  });

export type ProductInput = z.infer<typeof productInputSchema>;

export function specsToJson(specs: { key: string; value: string }[]): string | null {
  const obj: Record<string, string> = {};
  for (const s of specs) if (s.key && s.value) obj[s.key] = s.value;
  return Object.keys(obj).length ? JSON.stringify(obj) : null;
}

export function jsonToSpecs(raw: string | null | undefined): { key: string; value: string }[] {
  if (!raw) return [];
  try {
    const o = JSON.parse(raw);
    return Object.entries(o).map(([key, value]) => ({ key, value: String(value) }));
  } catch {
    return [];
  }
}

export async function nextProductId(): Promise<number> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);
  return ((data?.[0]?.id as number) || 0) + 1;
}

export async function nextSkuNumber(): Promise<number> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("sku")
    .eq("client_id", CLIENT_ID)
    .like("sku", "VM-%")
    .limit(5000);
  let max = 0;
  for (const r of data || []) {
    const n = parseInt(String(r.sku).replace(/^VM-/, ""), 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return max + 1;
}

export const formatSku = (n: number) => `VM-${String(n).padStart(4, "0")}`;

export function buildRow(input: ProductInput) {
  return {
    name: input.name,
    description: input.description,
    price: input.price,
    regular_price: input.regular_price,
    is_on_sale: input.regular_price > input.price,
    group_name: input.group_name,
    sub_category: input.sub_category,
    category_label: input.category_label,
    category: slugify(input.group_name),
    subcategory: slugify(input.category_label),
    set_contents: specsToJson(input.specs),
    in_stock: input.in_stock,
    is_featured: input.is_featured,
  };
}

export async function createProduct(input: ProductInput, skuOverride?: string) {
  const supabase = createAdminClient();
  const id = await nextProductId();
  const skuNum = await nextSkuNumber();
  const sku = skuOverride || formatSku(skuNum);
  const row = {
    id,
    ...buildRow(input),
    slug: `ajs-${slugify(input.name).slice(0, 70)}-${id}`,
    sku,
    images: input.images || [],
    material: "",
    origin: "India",
    care_instructions: "",
    client_id: CLIENT_ID,
  };
  const { data, error } = await supabase.from("products").insert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export const storagePublicUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

export const storagePathFromUrl = (url: string): string | null => {
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
};

export const STORAGE_PREFIX = `${CLIENT_SLUG}/products/`;
