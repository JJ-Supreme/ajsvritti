import TitleHeader from "../../../_components/title-header";
import ProductForm from "../../../_components/product-form";

const NewProductPage = () => {
  return (
    <div className="p-3 sm:p-4 mt-2 max-w-3xl">
      <TitleHeader title="New product" description="Add a product to your store" />
      <ProductForm />
    </div>
  );
};

export default NewProductPage;
