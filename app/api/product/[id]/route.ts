import { NextResponse } from "next/server";
import { getProductById } from "@/lib/services/products";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await getProductById(params.id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ ...product, productSizes: [] });
  } catch (error) {
    console.error("Error getting product:", error);
    return NextResponse.json(
      { error: "Error getting product", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
