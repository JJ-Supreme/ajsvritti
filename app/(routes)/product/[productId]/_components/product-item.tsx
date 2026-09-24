"use client";

import Gallery from "@/components/gallery/gallery";
import Info from "@/components/gallery/info";
import Container from "@/components/ui/container";
import ProductCard from "@/components/ui/product-card";
import { type Product, type ProductDetails } from "@/types";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import LoadingSkeleton from "./loading-skeleton";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

// Technical Data Tabs Component
const ProductTabs = ({ details, description, activeTab, setActiveTab }: { details: any, description: string, activeTab: string, setActiveTab: (tab: string) => void }) => {

  return (
    <div className="mt-10 bg-white border border-border rounded-lg shadow-soft-sm overflow-hidden" id="details">
       <div className="flex border-b border-border overflow-x-auto">
          <button
             onClick={() => setActiveTab("specs")}
             className={`px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "specs" ? "text-primary border-b-2 border-b-primary -mb-px bg-white" : "text-muted-foreground hover:text-foreground hover:bg-surface-1"}`}
          >
             Specifications
          </button>
          <button
             onClick={() => setActiveTab("desc")}
             className={`px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "desc" ? "text-primary border-b-2 border-b-primary -mb-px bg-white" : "text-muted-foreground hover:text-foreground hover:bg-surface-1"}`}
          >
             Description
          </button>
          <button
             onClick={() => setActiveTab("docs")}
             className={`px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "docs" ? "text-primary border-b-2 border-b-primary -mb-px bg-white" : "text-muted-foreground hover:text-foreground hover:bg-surface-1"}`}
          >
             Documents
          </button>
       </div>

       <div className="p-4 sm:p-8">
          {activeTab === "specs" && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                {details?.attributes?.map((attr: any, i: number) => (
                   <div key={i} className="flex justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground">{attr.display_name}</span>
                      <span className="font-medium text-foreground">{attr.value}</span>
                   </div>
                ))}
                {(!details?.attributes || details.attributes.length === 0) && <p className="text-muted-foreground text-sm">No detailed specifications available.</p>}
             </div>
          )}

          {activeTab === "desc" && (
             <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="whitespace-pre-line leading-relaxed">{description || "No description available."}</p>
             </div>
          )}

          {activeTab === "docs" && (
             <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">No documents or technical files are available for this product yet.</p>
             </div>
          )}
       </div>
    </div>
  );
}

const ProductItem = () => {
  const { productId } = useParams();
  const [activeTab, setActiveTab] = useState("specs");

  const [productQuery, relatedQuery, detailsQuery] = useQueries({
    queries: [
      {
        queryKey: ["single product", productId],
        queryFn: async () =>
          await axios.get(`/api/product/${productId}`).then((res) => res.data),
      },
      {
        queryKey: ["related products"],
        queryFn: async () => {
          const response = await axios.get("/api/product/");
          return response.data;
        },
      },
      {
        queryKey: ["product details", productId],
        queryFn: async () => {
          const product = await axios.get(`/api/product/${productId}`).then((res) => res.data);
          if (product?.productId) {
            try {
              const details = await axios.get(`/api/product-details/${product.productId}`);
              return details.data;
            } catch {
              return null;
            }
          }
          return null;
        },
      },
    ],
  });

  if (productQuery.isLoading || relatedQuery.isLoading) {
    return (
      <Container>
        <LoadingSkeleton />
      </Container>
    );
  }

  if (!productQuery.data || !relatedQuery.data) {
    return <Container>Something went wrong!</Container>;
  }

  const productDetails: ProductDetails | null = detailsQuery.data;

  const filteredData: Product[] = relatedQuery?.data?.filter(
    (item: Product) =>
      item.category === productQuery?.data?.category &&
      productQuery.data.id !== item.id
  ).slice(0, 4) || [];

  const images = productDetails?.data?.images && productDetails.data.images.length > 0
    ? productDetails.data.images
    : productQuery.data?.image
      ? [productQuery.data.image]
      : [];

  return (
    <div className="bg-surface-1 min-h-screen pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <Container>
           <div className="py-3 text-xs sm:text-sm text-muted-foreground flex items-center gap-1 sm:gap-1.5 overflow-hidden">
              <Link href="/shop" className="hover:text-primary transition-colors shrink-0">Products</Link>
              <ChevronRight size={14} className="shrink-0" />
              <span className="shrink-0">{productQuery.data.category}</span>
              <ChevronRight size={14} className="shrink-0" />
              <span className="font-medium text-foreground truncate">{productQuery.data.title}</span>
           </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {/* Main Product Card */}
          <div className="bg-white rounded-lg shadow-soft-sm border border-border overflow-hidden">
            <div className="lg:grid lg:grid-cols-12 lg:gap-0">

              {/* Gallery Column */}
              <div className="lg:col-span-5 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-border">
                <Gallery images={images} />
              </div>

              {/* Info Column */}
              <div className="lg:col-span-7 p-4 sm:p-6 lg:p-8">
                <Info data={productQuery?.data} productDetails={productDetails} />
              </div>
            </div>
          </div>

          {/* Technical Tabs Section */}
          <ProductTabs
             details={productDetails?.data?.product_details?.product_highlights}
             description={productDetails?.data?.description || productQuery.data.title}
             activeTab={activeTab}
             setActiveTab={setActiveTab}
          />

          {/* Related Products */}
          {filteredData.length > 0 && (
            <div className="mt-10">
              <h3 className="font-semibold text-lg text-foreground mb-5">Customers Also Bought</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredData?.map((item: Product) => {
                  return <ProductCard key={item.id} data={item} />;
                })}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ProductItem;
