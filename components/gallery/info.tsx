"use client";
import { ShoppingCart, Share2, FileText, Info as InfoIcon, ChevronRight } from "lucide-react";
import { BULK_TIERS, getBulkUnitPrice } from "@/lib/utils/pricing";

import { Product, ProductDetails, ProductAttribute, ProductReview } from "@/types";
import { Button } from "../ui/button";
import useCart from "@/hooks/use-cart";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import WishlistButton from "@/components/wishlist-button";

interface InfoProps {
  data: Product;
  productDetails?: ProductDetails | null;
}

const Info: React.FC<InfoProps> = ({ data, productDetails }) => {
  const cart = useCart();
  const [qty, setQty] = useState(1);

  const sizes = data.productSizes || [];
  const [selectedSize, setSelectedSize] = useState<string>(
    sizes.length > 0 ? sizes[0].name : ""
  );
  const [sizeError, setSizeError] = useState(false);

  const onAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    const productWithSelections = {
      ...data,
      size: selectedSize || undefined,
    };
    for (let i = 0; i < qty; i++) {
      cart.addItem(productWithSelections);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const detailedData = productDetails?.data;
  const productName = detailedData?.name || data.title;
  const description = detailedData?.description;
  const inStock = detailedData?.in_stock ?? true;
  const supplier = detailedData?.suppliers?.[0];
  const productHighlights = detailedData?.product_details?.product_highlights;
  const additionalDetails = detailedData?.product_details?.additional_details;

  const [showFullDesc, setShowFullDesc] = useState(false);

  const partNumber = data.id.substring(0, 12).toUpperCase();
  const sourceUrl = detailedData?.breadcrumb?.[0]?.url || data.link;

  const onOpenDatasheet = () => {
    if (sourceUrl) {
      window.open(sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  const onShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : sourceUrl;
    const shareData = {
      title: productName,
      text: `Check out this product: ${productName}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // Intentionally ignore user-cancelled share flows.
    }
  };

  return (
    <div className="flex flex-col gap-6 text-sm text-foreground">
      {/* Header Section */}
      <div className="border-b border-border pb-4">
        <h1 className="text-lg sm:text-xl font-semibold text-foreground leading-snug mb-2">{productName}</h1>
        <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs">
           <div className="flex items-center gap-1">
             <span className="text-muted-foreground">Mfr. Part #:</span>
             <span className="font-mono font-semibold text-foreground break-all">{partNumber}</span>
           </div>
           <div className="flex items-center gap-1">
             <span className="text-muted-foreground">Customer Ref:</span>
             <span className="text-muted-foreground/60">Add reference</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Description & Specs */}
        <div className="lg:col-span-7 space-y-6">
           <div>
             <h3 className="font-semibold text-foreground mb-2 text-xs uppercase tracking-wider text-muted-foreground">Description</h3>
             <p className="text-muted-foreground leading-relaxed text-sm">
               {description
                 ? (showFullDesc ? description : description.substring(0, 300) + (description.length > 300 ? "..." : ""))
                 : data.title}
               {description && description.length > 300 && (
                 <button onClick={() => setShowFullDesc(v => !v)} className="text-primary hover:underline ml-1">
                   {showFullDesc ? "Show less" : "More details"}
                 </button>
               )}
             </p>
           </div>

           <div>
             <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Product Attributes</h3>
             <table className="w-full text-xs">
               <tbody>
                  <tr className="border-b border-border/50">
                     <td className="py-2 text-muted-foreground w-1/3">Category</td>
                     <td className="py-2 font-medium">{data.category}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                     <td className="py-2 text-muted-foreground">Availability</td>
                     <td className="py-2 font-medium text-success">Active</td>
                  </tr>
                  {productHighlights?.attributes?.slice(0, 4).map((attr: ProductAttribute, idx: number) => (
                    <tr key={idx} className="border-b border-border/50">
                      <td className="py-2 text-muted-foreground">{attr.display_name}</td>
                      <td className="py-2 font-medium">{attr.value}</td>
                    </tr>
                  ))}
               </tbody>
             </table>
             <div className="mt-3 flex gap-2">
               <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={onOpenDatasheet}>
                 <FileText size={12} /> Datasheet
               </Button>
               <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={onShare}>
                 <Share2 size={12} /> Share
               </Button>
               <WishlistButton
                 productId={data.id}
                 size={12}
                 label
                 className="h-8 px-3 border border-input rounded-md bg-background hover:bg-accent"
               />
             </div>
           </div>
        </div>

        {/* Pricing & Buy Box */}
        <div className="lg:col-span-5">
           <div className="bg-surface-1 border border-border rounded-lg p-4 sm:p-5">

              {/* Price */}
              <div className="flex justify-between items-baseline mb-4">
                 <span className="text-2xl font-bold text-foreground tabular-nums">{formatPrice(data.price)}</span>
                 <span className="text-xs text-muted-foreground">Unit Price</span>
              </div>
              <p className="-mt-3 mb-4 text-[11px] text-muted-foreground">All prices are inclusive of GST.</p>

              {/* Bulk Pricing */}
              <div className="mb-4 bg-white border border-border rounded-lg overflow-hidden">
                 <div className="grid grid-cols-2 bg-surface-2 text-xs font-medium text-muted-foreground py-2 px-3 border-b border-border">
                    <div>Qty</div>
                    <div className="text-right">Unit Price</div>
                 </div>
                 {[...BULK_TIERS].reverse().map((tier, i) => (
                   <div key={i} className="grid grid-cols-2 text-xs py-2 px-3 border-b border-border/50 last:border-0 hover:bg-accent transition-colors tabular-nums">
                      <div className="flex items-center gap-1.5">
                        {tier.minQty}+
                        {tier.discount > 0 && (
                          <span className="text-emerald-600 font-medium">{tier.discount * 100}% off</span>
                        )}
                      </div>
                      <div className="text-right font-medium">{formatPrice(getBulkUnitPrice(data.price, tier.minQty))}</div>
                   </div>
                 ))}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                 <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-success ring-4 ring-success/15' : 'bg-destructive ring-4 ring-destructive/15'}`}></div>
                    <span className="font-semibold text-foreground text-sm">{inStock ? "In Stock" : "Out of Stock"}</span>
                 </div>
                 {inStock && <p className="text-xs text-muted-foreground pl-[18px]">Usually ships within 24 hours from New Delhi warehouse.</p>}
              </div>

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedSize(s.name);
                          setSizeError(false);
                        }}
                        className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-all duration-200 ${
                          selectedSize === s.name
                            ? "border-primary bg-accent text-primary"
                            : "border-border bg-white text-foreground hover:border-primary/30"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                  {sizeError && (
                    <p className="text-destructive text-xs mt-1">Please select a size</p>
                  )}
                </div>
              )}

              {/* Add to Cart */}
              <div className="space-y-3">
                 <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 border border-border rounded-lg px-2 text-center font-semibold bg-white text-foreground tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all"
                      aria-label="Quantity"
                    />
                    <Button onClick={onAddToCart} className="flex-1 font-semibold rounded-lg h-10">
                       <ShoppingCart size={16} className="mr-2" /> Add to Cart
                    </Button>
                 </div>
                 <p className="text-[10px] text-muted-foreground text-center">
                    Min Qty: 1 | Multiples of: 1
                 </p>
              </div>

           </div>

           <div className="mt-4 p-3 border border-accent bg-accent/50 rounded-lg">
             <div className="flex items-start gap-2">
                <InfoIcon size={14} className="text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">
                   <strong className="text-foreground">Business Customer?</strong> Register for GST invoice and credit terms.
                   <Link href="/contact-us" className="text-primary hover:underline ml-1">Learn more</Link>
                </p>
             </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Info;
