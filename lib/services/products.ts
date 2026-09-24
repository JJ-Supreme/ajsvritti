import { createAdminClient } from "@/lib/supabase/server";
import { CLIENT_ID } from "@/config/client";
import { Product, ProductDetails, Category } from "@/types";

// Product rows live in the shared Supabase `products` table, scoped by client_id.
// Column mapping (storefront Product shape <- row):
//   productId <- sku, title <- name, category <- category_label (leaf),
//   parentCategory <- sub_category, topLevelCategory <- group_name,
//   image <- images[0], rating/reviewCount <- rating/review_count,
//   specs (JSON string) <- set_contents, original price <- regular_price
type Row = {
  id: number;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  regular_price: number | null;
  images: string[] | null;
  rating: number | null;
  review_count: number | null;
  group_name: string | null;
  sub_category: string | null;
  category_label: string | null;
  set_contents: string | null;
  in_stock: boolean | null;
  created_at: string;
};

const COLUMNS =
  "id,name,sku,description,price,regular_price,images,rating,review_count,group_name,sub_category,category_label,set_contents,in_stock,created_at";

async function fetchRows(): Promise<Row[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("client_id", CLIENT_ID)
    .order("id", { ascending: true })
    .range(0, 4999);
  if (error) {
    console.error("[products] fetch error:", error.message);
    return [];
  }
  return (data || []) as Row[];
}


function toProduct(row: Row, categoryIds: Map<string, number>): Product {
  const category = row.category_label || "";
  return {
    id: String(row.id),
    productId: row.sku || String(row.id),
    title: row.name,
    category,
    categoryId: categoryIds.get(category) ?? 0,
    image: row.images?.[0] || "",
    link: `/product/${row.id}`,
    parentCategory: row.sub_category || "",
    price: row.price,
    rating: String(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    scrapedAt: row.created_at,
    topLevelCategory: row.group_name || "",
  };
}

function buildCategoryIds(rows: Row[]) {
  const ids = new Map<string, number>();
  for (const r of rows) {
    const c = r.category_label || "";
    if (c && !ids.has(c)) ids.set(c, 1001 + ids.size);
  }
  return ids;
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await fetchRows();
  const ids = buildCategoryIds(rows);
  return rows.map((r) => toProduct(r, ids));
}

export async function getProductById(id: string): Promise<Product | null> {
  const n = Number(id);
  if (!Number.isFinite(n)) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("client_id", CLIENT_ID)
    .eq("id", n)
    .maybeSingle();
  if (!data) return null;
  const all = await getAllProducts();
  return all.find((p) => p.id === String(n)) || null;
}

export async function getProductDetailsBySku(productId: string): Promise<ProductDetails | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("client_id", CLIENT_ID)
    .or(`sku.eq.${productId},id.eq.${Number(productId) || 0}`)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const row = data as Row;
  const all = await getAllProducts();
  const product = all.find((p) => p.id === String(row.id))!;

  let specs: Record<string, string> = {};
  try {
    specs = row.set_contents ? JSON.parse(row.set_contents) : {};
  } catch {
    specs = {};
  }
  const attributes = Object.entries(specs).map(([k, v]) => ({
    field_name: k.toLowerCase().replace(/ /g, "_"),
    display_name: k,
    value: String(v),
  }));
  const original = row.regular_price || Math.round(row.price * 1.2);

  return {
    id: String(row.id),
    productId: product.productId,
    category: product.category,
    categoryId: product.categoryId,
    image: product.image,
    link: product.link,
    parentCategory: product.parentCategory,
    price: row.price,
    rating: product.rating,
    reviewCount: product.reviewCount,
    scrapedAt: product.scrapedAt,
    title: row.name,
    topLevelCategory: product.topLevelCategory,
    data: {
      name: row.name,
      description: row.description || undefined,
      images: row.images || [],
      in_stock: row.in_stock ?? true,
      product_details: attributes.length
        ? { product_highlights: { title: "Specifications", attributes } }
        : undefined,
      shipping: {
        charges: 0,
        show_free_delivery: true,
        estimated_delivery: { title: "Estimated Delivery", date: "5-7 business days" },
      },
      supplier_name: "AJS Vritti Vision Marketing PVT LTD",
      suppliers: [
        {
          name: "AJS Vritti Vision Marketing PVT LTD",
          average_rating: 4.5,
          rating_count: 250,
          cod_available: true,
          price: row.price,
          original_price: original,
          discount: 20,
        },
      ],
    },
  };
}

export async function getCategories(): Promise<Category[]> {
  const all = await getAllProducts();
  const seen = new Map<string, Category>();
  for (const p of all) {
    if (!p.category || seen.has(p.category)) continue;
    seen.set(p.category, {
      id: String(p.categoryId),
      categoryId: p.categoryId,
      name: p.category,
      parentCategory: p.parentCategory,
      serialNumber: String(p.categoryId),
      topLevelCategory: p.topLevelCategory,
      url: `/shop?category=${encodeURIComponent(p.category)}`,
    });
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProductCount() {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("client_id", CLIENT_ID);
  return count || 0;
}
