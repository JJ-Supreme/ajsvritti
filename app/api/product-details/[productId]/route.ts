import { NextResponse } from "next/server";
import { getProductDetailsBySku } from "@/lib/services/products";

export async function GET(_req: Request, { params }: { params: { productId: string } }) {
  try {
    const details = await getProductDetailsBySku(params.productId);
    if (!details) {
      return NextResponse.json({ error: "Product details not found" }, { status: 404 });
    }
    return NextResponse.json(details);
  } catch (error) {
    console.error("Error getting product details:", error);
    return NextResponse.json(
      { error: "Error getting product details", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
