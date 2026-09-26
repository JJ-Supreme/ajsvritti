import { type Metadata } from "next";
import { notFound } from "next/navigation";
import ProductItem from "./_components/product-item";
import { getProductFromDB } from "@/lib/serverDataAccess";
import Footer from "@/components/footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { productId: string };
}): Promise<Metadata> {
  const product = await getProductFromDB(params.productId);

  if (!product) return { title: "Product not found" };

  return {
    title: product.title,
    description: `${product.title} - ${product.category}`,
  };
}

const ProductPage = async ({ params }: { params: { productId: string } }) => {
  const product = await getProductFromDB(params.productId);
  if (!product) notFound();

  return (
    <div>
      <ProductItem />
      <Footer />
    </div>
  );
};

export default ProductPage;
