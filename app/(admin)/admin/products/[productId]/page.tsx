import TitleHeader from "../../../_components/title-header";
import ProductForm from "../../../_components/product-form";

const EditProductPage = ({ params }: { params: { productId: string } }) => {
  return (
    <div className="p-3 sm:p-4 mt-2 max-w-3xl">
      <TitleHeader title="Edit product" description="Update product details, specs and images" />
      <ProductForm productId={params.productId} />
    </div>
  );
};

export default EditProductPage;
