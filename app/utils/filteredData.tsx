import { Product } from "@/types";

const normalize = (value?: string | string[]) =>
  (Array.isArray(value) ? value[0] || "" : value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const filteredData = (params: any, data: Product[]) => {
  let filtered = [...data];

  // Filter by category
  if (params.category) {
    const normalizedCategory = normalize(params.category);
    filtered = filtered.filter((product: Product) => {
      const values = [
        normalize(product.category),
        normalize(product.parentCategory),
        normalize(product.topLevelCategory),
      ];

      return values.some((value) => value === normalizedCategory);
    });
  }

  // Filter by top-level category
  if (params.topLevelCategory) {
    const normalizedTopLevel = normalize(params.topLevelCategory);
    filtered = filtered.filter((product: Product) =>
      normalize(product.topLevelCategory) === normalizedTopLevel
    );
  }

  // Filter by parent category
  if (params.parentCategory) {
    const normalizedParent = normalize(params.parentCategory);
    filtered = filtered.filter((product: Product) =>
      normalize(product.parentCategory) === normalizedParent
    );
  }

  // Flag filters
  if (params.featured === "true") {
    filtered = filtered.filter((product: Product) => product.hasDetails);
  }

  // Filter by price (max price)
  if (params.price) {
    filtered = filtered.filter((product: Product) =>
      product.price <= +params.price
    );
  }

  // Filter by min price
  if (params.minPrice) {
    filtered = filtered.filter((product: Product) =>
      product.price >= +params.minPrice
    );
  }

  // Search query (search in title and category)
  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter((product: Product) =>
      product.title.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  }

  // New arrivals: truncate AFTER all filters are applied
  if (params.new === "true") {
    const withTimestamp = filtered.map((p) => ({
      product: p,
      time: new Date(p.scrapedAt || 0).getTime(),
    }));
    withTimestamp.sort((a, b) => b.time - a.time);
    filtered = withTimestamp
      .slice(0, Math.max(24, Math.floor(filtered.length * 0.2)))
      .map((item) => item.product);
  }

  // Deals: truncate AFTER all filters are applied
  if (params.deals === "true") {
    const withScore = filtered.map((p) => ({
      product: p,
      score: (parseFloat(p.rating) || 0) * 20 + (p.reviewCount || 0),
    }));
    withScore.sort((a, b) => b.score - a.score);
    filtered = withScore
      .slice(0, Math.max(24, Math.floor(filtered.length * 0.2)))
      .map((item) => item.product);
  }

  // Sort
  if (params.sort === "price-low-to-high") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (params.sort === "price-high-to-low") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (params.sort === "rating-high-to-low") {
    filtered.sort((a, b) => {
      const ratingA = parseFloat(a.rating) || 0;
      const ratingB = parseFloat(b.rating) || 0;
      return ratingB - ratingA;
    });
  } else if (params.sort === "most-reviewed") {
    filtered.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (params.sort === "newest" || params.sort === "latest-arrivals") {
    filtered.sort((a, b) => {
      const dateA = a.scrapedAt ? new Date(a.scrapedAt).getTime() : 0;
      const dateB = b.scrapedAt ? new Date(b.scrapedAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  return filtered;
};

export default filteredData;
