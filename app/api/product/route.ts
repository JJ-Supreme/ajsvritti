import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/services/products";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const topLevelCategory = url.searchParams.get("topLevelCategory");

    let products = await getAllProducts();
    if (category) products = products.filter((p) => p.category === category);
    else if (topLevelCategory)
      products = products.filter((p) => p.topLevelCategory === topLevelCategory);

    return NextResponse.json([...products].sort((a, b) => b.price - a.price));
  } catch (error) {
    console.error("Error getting products:", error);
    return NextResponse.json({ error: "Error getting products" }, { status: 500 });
  }
}
