import { type Metadata } from "next";
import ProductItem from "./_components/product-item";
import { getProductFromDB } from "@/lib/serverDataAccess";
import Footer from "@/components/footer";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: { productId: string };
}): Promise<Metadata> {
  console.log('[ProductPage] Fetching metadata for product:', params.productId);
  const getProducts = await getProductFromDB(params.productId);

  if (!getProducts)
    return {
      title: "AJS Vritti Vision Marketing",
      description: "Your trusted destination for high-quality IT hardware and computer accessories.",
    };

  return {
    title: `${getProducts.title} | ${siteConfig.name}`,
    description: `${getProducts.title} - ${getProducts.category}`,
  };
}

const ProductPage = ({ params }: { params: { productId: string } }) => {
  return (
    <div>
      <ProductItem />
      <Footer />
    </div>
  );
};

export default ProductPage;
