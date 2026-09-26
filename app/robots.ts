import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/cart", "/my-orders", "/account", "/order-confirmation", "/verify-email"],
      },
    ],
    sitemap: "https://ajsvision.shop/sitemap.xml",
    host: "https://ajsvision.shop",
  };
}
