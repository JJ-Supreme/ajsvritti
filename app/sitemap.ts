import type { MetadataRoute } from "next";
import { getAllProducts, getCategories } from "@/lib/services/products";

export const dynamic = "force-dynamic";

const BASE = "https://ajsvision.shop";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/shop",
    "/featured",
    "/about-us",
    "/contact-us",
    "/careers",
    "/register",
    "/privacy-policy",
    "/terms-conditions",
    "/shipping-policy",
    "/return-policy",
    "/refund-policy",
    "/cancellation-policy",
  ];

  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const now = new Date();

  return [
    ...staticPaths.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.6,
    })),
    ...categories.map((c) => ({
      url: `${BASE}/shop/${encodeURIComponent(c.name)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${BASE}/product/${p.id}`,
      lastModified: p.scrapedAt ? new Date(p.scrapedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
