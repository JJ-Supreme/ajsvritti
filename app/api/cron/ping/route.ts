import { NextResponse } from "next/server";
import { getProductCount } from "@/lib/services/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await getProductCount();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      productCount: count,
      message: "Keep-alive ping successful.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
