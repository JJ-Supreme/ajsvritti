import { NextResponse } from "next/server";
import { getAllProducts, getCategories } from "@/lib/services/products";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    const limit = parseInt(url.searchParams.get("limit") || "8");
    const categories = await getCategories();

    if (!query || query.trim().length === 0) {
      const grouped: Record<string, string[]> = {};
      for (const cat of [...categories].sort((a, b) => a.categoryId - b.categoryId)) {
        if (!grouped[cat.topLevelCategory]) grouped[cat.topLevelCategory] = [];
        if (grouped[cat.topLevelCategory].length < 3) grouped[cat.topLevelCategory].push(cat.name);
      }
      return NextResponse.json({
        categories: Object.entries(grouped).map(([topLevel, cats]) => ({
          topLevel,
          subcategories: cats,
        })),
        products: [],
      });
    }

    const term = query.trim().toLowerCase();

    const matchingCategories = categories
      .filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.topLevelCategory.toLowerCase().includes(term) ||
          c.parentCategory.toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        topLevelCategory: c.topLevelCategory,
        parentCategory: c.parentCategory,
      }));

    const all = (await getAllProducts()).sort((a, b) => b.price - a.price);
    const matches = all.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.topLevelCategory.toLowerCase().includes(term)
    );

    const pick = (p: (typeof all)[number]) => ({
      id: p.id,
      productId: p.productId,
      title: p.title,
      price: p.price,
      image: p.image,
      category: p.category,
      topLevelCategory: p.topLevelCategory,
      rating: p.rating,
      reviewCount: p.reviewCount,
    });

    return NextResponse.json({
      categories: matchingCategories,
      products: matches.slice(0, limit).map(pick),
      total: matches.length,
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Error searching", categories: [], products: [] }, { status: 500 });
  }
}
