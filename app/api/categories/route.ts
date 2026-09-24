import { NextResponse } from "next/server";
import { getCategories } from "@/lib/services/products";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const topLevelCategory = new URL(req.url).searchParams.get("topLevelCategory");
    let categories = await getCategories();
    if (topLevelCategory) {
      categories = categories.filter((c) => c.topLevelCategory === topLevelCategory);
    }
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    return NextResponse.json({ error: "Error getting categories" }, { status: 500 });
  }
}
