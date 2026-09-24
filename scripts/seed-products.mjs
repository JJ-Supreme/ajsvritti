// Seeds the AJS Vritti catalog (294 IT-hardware products, from the original
// codebase's seed script) into the shared Supabase project. Idempotent: rows
// whose SKU already exists for this client are skipped.
// Usage: node --env-file=.env.local scripts/seed-products.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const SLUG = process.env.NEXT_PUBLIC_CLIENT_SLUG;
const BUCKET = "product-images";
const data = JSON.parse(readFileSync(new URL("./products-data.json", import.meta.url)));

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// deterministic pseudo-random so re-runs are stable
let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

async function uploadTile(name) {
  const path = `${SLUG}/products/${slugify(name)}.png`;
  const res = await fetch(
    `https://placehold.co/600x600/f0f4f8/1a1a2e.png?text=${encodeURIComponent(name.replace(/ /g, "+"))}`
  );
  if (!res.ok) throw new Error(`tile fetch failed for ${name}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw error;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

const { data: existing } = await supabase.from("products").select("sku").eq("client_id", CLIENT_ID).range(0, 4999);
const have = new Set((existing || []).map((r) => r.sku));

const { data: maxRow } = await supabase.from("products").select("id").order("id", { ascending: false }).limit(1);
let nextId = (maxRow?.[0]?.id || 0) + 1;

const rows = [];
let counter = 0;
for (const { cat, products } of data) {
  const tile = await uploadTile(cat.name);
  for (const p of products) {
    const sku = `VM-${String(++counter).padStart(4, "0")}`;
    if (have.has(sku)) continue;
    const id = nextId++;
    rows.push({
      id,
      name: p.title,
      slug: `ajs-${slugify(p.title)}-${counter}`,
      sku,
      description: p.desc,
      price: p.price,
      regular_price: Math.round(p.price * 1.2),
      is_on_sale: true,
      images: [tile],
      rating: Number((3.5 + rnd() * 1.5).toFixed(1)),
      review_count: Math.floor(10 + rnd() * 490),
      group_name: cat.topLevel,
      sub_category: cat.parent,
      category_label: cat.name,
      category: slugify(cat.topLevel),
      subcategory: slugify(cat.name),
      set_contents: p.specs ? JSON.stringify(p.specs) : null,
      material: "",
      origin: "India",
      care_instructions: "",
      in_stock: true,
      is_featured: false,
      client_id: CLIENT_ID,
    });
  }
}

for (let i = 0; i < rows.length; i += 100) {
  const { error } = await supabase.from("products").insert(rows.slice(i, i + 100));
  if (error) throw error;
  console.log(`inserted ${Math.min(i + 100, rows.length)} / ${rows.length}`);
}
console.log(`done: ${rows.length} new products (${have.size} already existed)`);
